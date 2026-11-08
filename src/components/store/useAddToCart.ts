import { toast } from "sonner";

import type { ShopifyProduct, ShopifyVariant } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useUiStore } from "@/stores/uiStore";

export function useAddToCart() {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const setCartOpen = useUiStore((s) => s.setCartOpen);

  const add = async (product: ShopifyProduct, variant: ShopifyVariant | undefined, quantity = 1) => {
    if (!variant) return;
    const ok = await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity,
      selectedOptions: variant.selectedOptions ?? [],
    });
    if (ok) {
      toast.success(`${product.node.title} added`, {
        description: variant.title !== "Default Title" ? variant.title : undefined,
        action: { label: "View cart", onClick: () => setCartOpen(true) },
      });
    } else {
      toast.error("Couldn't add that to your cart", { description: "Please try again." });
    }
  };

  return { add, isLoading };
}

export function firstAvailableVariant(product: ShopifyProduct): ShopifyVariant | undefined {
  const variants = product.node.variants.edges.map((e) => e.node);
  return variants.find((v) => v.availableForSale) ?? variants[0];
}
