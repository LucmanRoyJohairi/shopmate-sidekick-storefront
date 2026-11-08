import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown } from "lucide-react";

import heroDesk from "@/assets/hero-desk.jpg";
import { askConcierge } from "@/components/assistant/assistant-chat";
import { Crosshairs, GridRails } from "@/components/store/GridFrame";
import { ProductCard } from "@/components/store/ProductCard";
import { Button } from "@/components/ui/button";
import { productsQueryOptions } from "@/lib/shopify";

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
    <div className="relative">
      <GridRails />

      <section className="relative overflow-hidden border-b border-line">
        <img
          src={heroDesk}
          alt="A calm desk with a walnut organizer, aluminum monitor riser, felt mat and mechanical keyboard"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/55 to-transparent" />
        <GridRails columns={3} className="border-x-0" />
        <div className="relative z-20 flex min-h-[78vh] flex-col justify-end px-9 pb-14 pt-24 md:px-16 md:pb-20">
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

      <section id="collection" className="relative scroll-mt-16 border-b border-line">
        <Crosshairs />
        <div className="relative flex flex-wrap items-end justify-between gap-4 border-b border-line px-9 pb-6 pt-20 md:px-16">
          <h2 className="font-display-tight text-5xl md:text-6xl">The collection</h2>
          <p className="label-mono">{products.length} objects</p>
          <Crosshairs edge="bottom" />
        </div>
        {products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display-tight text-3xl">No products found</p>
            <p className="mt-2 text-sm text-muted-foreground">New pieces are on their way.</p>
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-14 px-9 pb-20 pt-10 sm:grid-cols-2 md:px-16 xl:grid-cols-3">
            {products.map((p, i) => (
              <ProductCard key={p.node.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      <section className="relative border-b border-line">
        <Crosshairs />
        <div className="hairline-grid mx-5 grid divide-y divide-line md:mx-10 md:grid-cols-3 md:divide-x md:divide-y-0">
          {PRINCIPLES.map((p) => (
            <div key={p.k} className="p-8 md:p-10">
              <p className="label-mono">{p.k}</p>
              <h3 className="font-display-tight mt-6 text-3xl">{p.t}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{p.d}</p>
            </div>
          ))}
        </div>
        <Crosshairs edge="bottom" />
      </section>
    </div>
  );
}
