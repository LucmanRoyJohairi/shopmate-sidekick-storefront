import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { askConcierge } from "@/components/assistant/assistant-chat";
import { useAddToCart } from "@/components/store/useAddToCart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPrice, productQueryOptions, shopifyImage } from "@/lib/shopify";

export const Route = createFileRoute("/product/$handle")({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(productQueryOptions(params.handle));
    if (!product) throw notFound();
    return {
      title: product.node.title,
      description: product.node.description.slice(0, 160),
      image: product.node.images.edges[0]?.node.url,
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Product unavailable — Ordo" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.title} — Ordo`;
    const meta = [
      { title },
      { name: "description", content: loaderData.description },
      { property: "og:title", content: title },
      { property: "og:description", content: loaderData.description },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (loaderData.image) {
      meta.push({ property: "og:image", content: loaderData.image });
      meta.push({ name: "twitter:image", content: loaderData.image });
    }
    return { meta };
  },
  notFoundComponent: () => (
    <div className="px-5 py-32 text-center md:px-10">
      <p className="font-display-tight text-5xl">Not in the collection</p>
      <p className="mt-3 text-sm text-muted-foreground">This piece may have been moved or retired.</p>
      <Button variant="hero" className="mt-8" asChild>
        <Link to="/">Back to the shop</Link>
      </Button>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { handle } = Route.useParams();
  return <ProductView key={handle} handle={handle} />;
}

function ProductView({ handle }: { handle: string }) {
  const { data: product } = useSuspenseQuery(productQueryOptions(handle));
  const { add, isLoading } = useAddToCart();
  const [activeImage, setActiveImage] = useState(0);

  const p = product?.node;
  const variants = useMemo(() => p?.variants.edges.map((e) => e.node) ?? [], [p]);
  const initial = variants.find((v) => v.availableForSale) ?? variants[0];
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries((initial?.selectedOptions ?? []).map((o) => [o.name, o.value])),
  );

  if (!product || !p) return null;

  const variant =
    variants.find((v) => v.selectedOptions.every((o) => selected[o.name] === o.value)) ?? initial;
  const images = p.images.edges.map((e) => e.node);
  const image = images[activeImage] ?? images[0];
  const visibleOptions = p.options.filter((o) => !(o.values.length === 1 && o.values[0] === "Default Title"));

  return (
    <div className="px-5 pt-8 md:px-10">
      <Link to="/" className="label-mono inline-flex items-center gap-2 hover:text-foreground">
        <ArrowLeft className="size-3.5" /> The collection
      </Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
        <div>
          <div className="aspect-square overflow-hidden rounded-xl bg-sunken">
            {image && (
              <img
                src={shopifyImage(image.url, 1200)}
                alt={image.altText ?? p.title}
                width={1200}
                height={1200}
                className="size-full object-cover"
              />
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {images.map((img, i) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "size-20 overflow-hidden rounded-md border-2 bg-sunken",
                    i === activeImage ? "border-foreground" : "border-transparent",
                  )}
                >
                  <img src={shopifyImage(img.url, 200)} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:pt-6">
          {p.productType && <p className="label-mono">{p.productType}</p>}
          <h1 className="font-display-tight mt-4 text-5xl md:text-6xl">{p.title}</h1>
          <p className="mt-5 text-xl tabular-nums">
            {formatPrice(variant?.price ?? p.priceRange.minVariantPrice)}
          </p>
          <p className="mt-6 max-w-prose text-[0.95rem] leading-relaxed text-foreground/80">{p.description}</p>

          {visibleOptions.map((option) => (
            <div key={option.name} className="mt-8">
              <p className="label-mono">
                {option.name}: <span className="text-foreground">{selected[option.name]}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {option.values.map((value) => (
                  <Button
                    key={value}
                    variant={selected[option.name] === value ? "default" : "quiet"}
                    size="sm"
                    onClick={() => setSelected((s) => ({ ...s, [option.name]: value }))}
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="hero"
              size="xl"
              className="flex-1"
              disabled={isLoading || !variant?.availableForSale}
              onClick={() => add(product, variant)}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : variant?.availableForSale === false ? "Sold out" : "Add to cart"}
            </Button>
            <Button
              variant="quiet"
              size="xl"
              onClick={() =>
                askConcierge(`I'm looking at the ${p.title}. Is it a good fit for my desk, and what pairs well with it?`)
              }
            >
              <MessageCircle /> Ask the concierge
            </Button>
          </div>

          <div className="mt-12 border-t pt-6">
            <p className="label-mono">Reviews</p>
            <p className="mt-2 text-sm text-muted-foreground">No reviews yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
