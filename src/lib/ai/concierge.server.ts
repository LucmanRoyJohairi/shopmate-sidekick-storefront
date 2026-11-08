import { createOpenAI } from "@ai-sdk/openai";
import {
  APICallError,
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";

import { fetchProducts, formatPrice, type ShopifyProduct } from "@/lib/shopify";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server";

const GATEWAY_BASE_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

const BodySchema = z.object({
  messages: z.array(z.any()).min(1).max(200),
  cart: z
    .array(
      z.object({
        title: z.string().max(200),
        variant: z.string().max(200),
        quantity: z.number().int().min(0).max(999),
        price: z.string().max(60),
      }),
    )
    .max(50)
    .optional(),
});

type CartSummary = NonNullable<z.infer<typeof BodySchema>["cart"]>;

function describeProduct(p: ShopifyProduct): string {
  const n = p.node;
  const variants = n.variants.edges
    .map((v) => `${v.node.title} ${formatPrice(v.node.price)}${v.node.availableForSale ? "" : " (sold out)"}`)
    .join("; ");
  const desc = n.description.replace(/\s+/g, " ").slice(0, 320);
  return `- handle: ${n.handle} | ${n.title} | type: ${n.productType || "—"} | variants: ${variants}\n  ${desc}`;
}

function buildInstructions(catalog: ShopifyProduct[], cart: CartSummary) {
  const catalogText = catalog.length
    ? catalog.map(describeProduct).join("\n")
    : "(The catalog is currently empty.)";
  const cartText = cart.length
    ? cart.map((c) => `- ${c.quantity} × ${c.title} (${c.variant}) at ${c.price}`).join("\n")
    : "(empty)";

  return `You are the Ordo Concierge, the in-store shopping assistant for Ordo — a minimalist, premium workspace brand making modular organizers, ergonomic stands and mechanical desk accessories.

Voice: calm, precise, warm. Short paragraphs, no fluff, no emoji. Like a knowledgeable shop assistant in a design studio.

What you do:
- Help shoppers plan a desk setup, choose between products and variants, and understand materials, ergonomics and fit.
- Recommend ONLY products from the catalog below. Never invent products, prices, discounts, stock levels, shipping times, warranties or reviews. If something is not in the catalog or you don't know, say so plainly.
- Whenever you recommend or compare specific products, call the show_products tool with their handles (max 4) so the shopper sees product cards they can add to their cart. Then add a brief note on why each one fits.
- Prices are in the store currency shown in the catalog. When suggesting a bundle, you may add up the listed prices.
- You cannot place orders or edit the cart yourself; tell shoppers to use the "Add" buttons on the cards and check out from the cart.
- Politely steer off-topic requests back to the shopper's workspace.

Catalog:
${catalogText}

The shopper's current cart:
${cartText}`;
}

/** Drop tool parts that never finished (e.g. a stopped stream) so history replays cleanly. */
function sanitizeMessages(messages: UIMessage[]): UIMessage[] {
  return messages
    .map((m) => ({
      ...m,
      parts: m.parts.filter((part) => {
        if (part.type.startsWith("tool-") && "state" in part) {
          return part.state === "output-available" || part.state === "output-error";
        }
        return true;
      }),
    }))
    .filter((m) => m.parts.length > 0);
}

function safeErrorMessage(error: unknown): string {
  if (APICallError.isInstance(error)) {
    if (error.statusCode === 402) {
      return "The concierge is out of AI credits for now. Please try again later.";
    }
    if (error.statusCode === 429) {
      return "The concierge is helping a lot of shoppers right now. Please try again in a moment.";
    }
    if (error.statusCode === 403) {
      return "The concierge isn't available right now.";
    }
  }
  if (error instanceof Error && error.name === "AbortError") return "Stopped.";
  console.error("Concierge error:", error);
  return "Something went wrong while answering. Please try again.";
}

export async function handleConciergeChat(request: Request): Promise<Response> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    return Response.json({ error: "The shopping assistant isn't configured yet." }, { status: 500 });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await request.json());
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const messages = sanitizeMessages(body.messages as UIMessage[]);
  if (messages.length === 0) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  let catalog: ShopifyProduct[] = [];
  try {
    catalog = await fetchProducts(50);
  } catch (error) {
    console.error("Concierge: failed to load catalog", error);
  }
  const byHandle = new Map(catalog.map((p) => [p.node.handle, p]));

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_BASE_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const tools = {
    show_products: tool({
      description:
        "Show product cards to the shopper for specific catalog products. Use whenever you recommend or compare products.",
      inputSchema: z
        .object({
          handles: z
            .array(z.string())
            .describe("Catalog product handles to show, most relevant first (max 4)."),
        })
        .strict(),
      execute: async ({ handles }) => {
        const products = handles
          .slice(0, 4)
          .map((h) => byHandle.get(h))
          .filter((p): p is ShopifyProduct => Boolean(p));
        return { products, notFound: handles.filter((h) => !byHandle.has(h)) };
      },
    }),
  };

  const result = streamText({
    model: provider.responses(MODEL),
    instructions: buildInstructions(catalog, body.cart ?? []),
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(6),
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({
      originalMessages: messages,
      sendReasoning: true,
      onError: safeErrorMessage,
    }),
    runIdFetch,
  );
}
