import { useEffect } from "react";
import { ExternalLink, Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatPrice, shopifyImage } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useUiStore } from "@/stores/uiStore";

export function CartDrawer() {
  const isOpen = useUiStore((s) => s.cartOpen);
  const setIsOpen = useUiStore((s) => s.setCartOpen);
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + parseFloat(item.price.amount) * item.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "PHP";

  useEffect(() => {
    if (isOpen) void syncCart();
  }, [isOpen, syncCart]);

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank");
      setIsOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Open cart">
          <ShoppingBag className="size-5" />
          {totalItems > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-brass font-mono text-[10px] text-brass-foreground">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full w-full flex-col bg-background sm:max-w-md">
        <SheetHeader className="shrink-0 text-left">
          <SheetTitle className="font-display-tight text-3xl">Your cart</SheetTitle>
          <SheetDescription>
            {totalItems === 0 ? "Nothing here yet." : `${totalItems} item${totalItems !== 1 ? "s" : ""}`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col pt-4">
          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <ShoppingBag className="size-10 text-muted-foreground" strokeWidth={1.25} />
              <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            </div>
          ) : (
            <>
              <ul className="min-h-0 flex-1 divide-y overflow-y-auto pr-1">
                {items.map((item) => {
                  const img = item.product.node.images.edges[0]?.node;
                  return (
                    <li key={item.variantId} className="flex gap-4 py-4">
                      <div className="size-18 shrink-0 overflow-hidden rounded-md bg-sunken">
                        {img && (
                          <img
                            src={shopifyImage(img.url, 200)}
                            alt={item.product.node.title}
                            className="size-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.product.node.title}</p>
                        {item.variantTitle !== "Default Title" && (
                          <p className="label-mono mt-1">{item.selectedOptions.map((o) => o.value).join(" · ")}</p>
                        )}
                        <p className="mt-2 text-sm tabular-nums">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end justify-between">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Remove"
                          onClick={() => removeItem(item.variantId)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                        <div className="flex items-center rounded-md border">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="w-7 text-center font-mono text-xs">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="shrink-0 space-y-4 border-t pt-5">
                <div className="flex items-baseline justify-between">
                  <span className="label-mono">Subtotal</span>
                  <span className="text-lg font-medium tabular-nums">
                    {formatPrice({ amount: totalPrice, currencyCode: currency })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Shipping and taxes are calculated at checkout.</p>
                <Button
                  onClick={handleCheckout}
                  variant="hero"
                  size="xl"
                  className="w-full"
                  disabled={items.length === 0 || isLoading || isSyncing}
                >
                  {isLoading || isSyncing ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      Checkout <ExternalLink />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
