<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Products, cart and checkout come only from the Shopify Storefront API via `src/lib/shopify.ts` (API version 2026-10); checkout URLs come from `cartCreate` and open in a new tab — never hand-built store URLs, so checkout keeps working.
- Cart state lives in the persisted Zustand store `src/stores/cartStore.ts` with `skipHydration`, rehydrated in `useCartSync` after mount — avoids SSR hydration mismatches.
- The shopping assistant streams from the server route `src/routes/api/chat.ts` (logic in `src/lib/ai/concierge.server.ts`) through Lovable AI Gateway Responses; it receives the live catalog in its instructions and shows products via the `show_products` tool — keeps the model grounded in real products and keys server-side.
- The assistant uses one shared AI SDK `Chat` instance (`src/components/assistant/assistant-chat.ts`) persisted to browser localStorage, rendered client-only as a desktop sidebar or mobile sheet — one conversation survives layout switches and reloads.
