import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowRight } from "lucide-react";

import conciergeMark from "@/assets/concierge-mark.png";
import heroDesk from "@/assets/hero-desk.jpg";
import { askConcierge } from "@/components/assistant/assistant-chat";
import { FeaturedIn } from "@/components/store/FeaturedIn";
import { ProductCard } from "@/components/store/ProductCard";
import { Button } from "@/components/ui/button";
import { productsQueryOptions } from "@/lib/shopify";
import { openAssistant } from "@/stores/uiStore";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ordo — Modular organizers, stands & desk accessories" },
      {
        name: "description",
        content:
          "Shop modular wood organizers, aluminum stands and mechanical keyboards. Ask the Ordo Concierge to plan your desk.",
      },
      { property: "og:title", content: "Ordo — Modular organizers, stands & desk accessories" },
      {
        property: "og:description",
        content: "Considered objects for a calmer desk, with a concierge to help you choose.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQueryOptions()),
  component: Index,
});

const PRINCIPLES = [
  { k: "01", t: "Honest materials", d: "Solid wood, anodized aluminum, real brass and pressed wool felt." },
  { k: "02", t: "Modular by design", d: "Pieces that rearrange as your work, and your desk, change." },
  { k: "03", t: "Built for posture", d: "Screens at eye level, wrists relaxed, shoulders down." },
];

function Index() {
  const { data: products } = useSuspenseQuery(productsQueryOptions());

  return (
    <>
      <section className="relative overflow-hidden border-b">
        <img
          src={heroDesk}
          alt="A calm desk with a walnut organizer, aluminum monitor riser, felt mat and mechanical keyboard"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/55 to-transparent" />
        <div className="relative flex min-h-[78vh] flex-col justify-end px-5 pb-14 pt-24 md:px-10 md:pb-20">
          <p className="label-mono animate-rise">Collection 01 · The considered desk</p>
          <h1 className="font-display-tight mt-5 max-w-3xl animate-rise text-6xl [animation-delay:80ms] md:text-8xl">
            Fewer things.
            <br />
            <em className="text-foreground/80">Better placed.</em>
          </h1>
          <p className="mt-6 max-w-md animate-rise text-base text-foreground/75 [animation-delay:160ms]">
            Modular organizers, ergonomic stands and mechanical accessories — made to bring order and ease to
            the place you work.
          </p>
          <div className="mt-8 flex animate-rise flex-wrap gap-3 [animation-delay:240ms]">
            <Button variant="hero" size="xl" asChild>
              <a href="#collection">
                Shop the collection <ArrowDown />
              </a>
            </Button>
            <Button
              variant="quiet"
              size="xl"
              onClick={() => askConcierge("Help me plan a minimal, ergonomic desk setup.")}
            >
              Plan my setup with the concierge
            </Button>
          </div>
        </div>
      </section>

      <FeaturedIn />

      <section aria-labelledby="principles-heading" className="border-b px-5 py-16 md:px-10 md:py-20">
        <h2 id="principles-heading" className="label-mono">
          What we stand for
        </h2>
        <div className="mt-10 grid border-y md:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <div
              key={p.k}
              className={`flex flex-col py-10 md:px-10 md:py-12 ${i > 0 ? "border-t md:border-l md:border-t-0" : ""} ${i === 0 ? "md:pl-0" : ""} ${i === PRINCIPLES.length - 1 ? "md:pr-0" : ""}`}
            >
              <span className="font-display-tight text-5xl text-brass">{p.k}</span>
              <h3 className="font-display-tight mt-8 text-3xl md:text-4xl">{p.t}</h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="concierge-heading" className="bg-primary text-primary-foreground">
        <div className="flex flex-col gap-10 px-5 py-16 md:px-10 md:py-20 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-background">
                <img src={conciergeMark} alt="" width={20} height={20} className="size-5" />
              </span>
              <p className="label-mono text-primary-foreground/60">Ordo Concierge</p>
            </div>
            <h2 id="concierge-heading" className="font-display-tight mt-6 text-5xl md:text-6xl">
              Map out your desk <em className="text-brass">in a few questions.</em>
            </h2>
            <p className="mt-5 max-w-lg text-base text-primary-foreground/70">
              Tell the concierge how you work and what's on your desk today. It will suggest a setup from the
              collection and add the pieces to your cart for you.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Button
              variant="brass"
              size="xl"
              onClick={() =>
                askConcierge("Help me map out my desk workspace. Ask me a few questions about how I work first.")
              }
            >
              Start planning <ArrowRight />
            </Button>
            <Button
              variant="ghost"
              size="xl"
              className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={openAssistant}
            >
              Open the concierge
            </Button>
          </div>
        </div>
      </section>

      <section id="collection" className="scroll-mt-20 px-5 pt-20 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-6">
          <h2 className="font-display-tight text-5xl md:text-6xl">The collection</h2>
          <p className="label-mono">{products.length} objects</p>
        </div>
        {products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display-tight text-3xl">No products found</p>
            <p className="mt-2 text-sm text-muted-foreground">New pieces are on their way.</p>
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-14 pt-10 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((p, i) => (
              <ProductCard key={p.node.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
