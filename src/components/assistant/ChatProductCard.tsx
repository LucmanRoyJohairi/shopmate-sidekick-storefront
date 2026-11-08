import { Link } from "@tanstack/react-router";
import { Loader2, Plus } from "lucide-react";

import { firstAvailableVariant, useAddToCart } from "@/components/store/useAddToCart";
import { Button } from "@/components/ui/button";
import { formatPrice, shopifyImage, type ShopifyProduct } from "@/lib/shopify";

export function ChatProductCard({ product }: { product: ShopifyProduct }) {
  const { add, isLoading } = useAddToCart();
  const p = product.node;
  const image = p.images.edges[0]?.node;
  const variant = firstAvailableVariant(product);

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background p-2 shadow-soft">
      <Link
        to="/product/$handle"
        params={{ handle: p.handle }}
        className="size-16 shrink-0 overflow-hidden rounded-md bg-sunken"
      >
        {image && (
          <img
            src={shopifyImage(image.url, 160)}
            alt={image.altText ?? p.title}
            className="size-full object-cover"
            loading="lazy"
          />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link to="/product/$handle" params={{ handle: p.handle }} className="block truncate text-sm font-medium">
          {p.title}
        </Link>
        <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
          {variant ? formatPrice(variant.price) : formatPrice(p.priceRange.minVariantPrice)}
          {variant && variant.title !== "Default Title" ? ` · ${variant.title}` : ""}
        </p>
      </div>
      <Button
        size="icon-sm"
        variant="brass"
        aria-label={`Add ${p.title} to cart`}
        disabled={isLoading || !variant?.availableForSale}
        onClick={() => add(product, variant)}
      >
        {isLoading ? <Loader2 className="animate-spin" /> : <Plus />}
      </Button>
    </div>
  );
}
