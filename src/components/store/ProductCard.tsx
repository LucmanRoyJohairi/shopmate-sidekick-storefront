import { Link } from "@tanstack/react-router";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice, shopifyImage, type ShopifyProduct } from "@/lib/shopify";

import { firstAvailableVariant, useAddToCart } from "./useAddToCart";

export function ProductCard({ product, index }: { product: ShopifyProduct; index: number }) {
  const { add, isLoading } = useAddToCart();
  const p = product.node;
  const image = p.images.edges[0]?.node;
  const variant = firstAvailableVariant(product);
  const hasRange = p.variants.edges.some((v) => v.node.price.amount !== p.priceRange.minVariantPrice.amount);

  return (
    <article
      className="group flex animate-rise flex-col"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <Link
        to="/product/$handle"
        params={{ handle: p.handle }}
        className="relative block aspect-square overflow-hidden rounded-lg bg-sunken"
      >
        {image && (
          <img
            src={shopifyImage(image.url, 800)}
            alt={image.altText ?? p.title}
            width={800}
            height={800}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        )}
        <span className="label-mono absolute left-3 top-3 rounded-sm bg-card/85 px-2 py-1 backdrop-blur">
          {String(index + 1).padStart(2, "0")}
          {p.productType ? ` · ${p.productType}` : ""}
        </span>
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to="/product/$handle" params={{ handle: p.handle }} className="block">
            <h3 className="truncate text-[0.95rem] font-medium">{p.title}</h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
        </div>
        <p className="shrink-0 text-sm tabular-nums">
          {hasRange && <span className="text-muted-foreground">From </span>}
          {formatPrice(p.priceRange.minVariantPrice)}
        </p>
      </div>
      <Button
        variant="quiet"
        size="sm"
        className="mt-4 w-full justify-between"
        disabled={isLoading || !variant?.availableForSale}
        onClick={() => add(product, variant)}
      >
        <span>{variant?.availableForSale === false ? "Sold out" : "Add to cart"}</span>
        {isLoading ? <Loader2 className="animate-spin" /> : <Plus />}
      </Button>
    </article>
  );
}
