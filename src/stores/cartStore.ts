import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  CART_QUERY,
  addLineToShopifyCart,
  createShopifyCart,
  removeLineFromShopifyCart,
  storefrontApiRequest,
  updateShopifyCartLine,
  type CartItem,
} from "@/lib/shopify";

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<boolean>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,

            addItem: async (item) => {
        const { items, cartId, clearCart } = get();
        const existingItem = items.find((i) => i.variantId === item.variantId);
        set({ isLoading: true });
        try {
          if (!cartId) {
            const result = await createShopifyCart({ ...item, lineId: null });
            if (!result) return false;
            set({
              cartId: result.cartId,
              checkoutUrl: result.checkoutUrl,
              items: [{ ...item, lineId: result.lineId }],
            });
            return true;
          }
          if (existingItem) {
            const newQuantity = existingItem.quantity + item.quantity;
            if (!existingItem.lineId) return false;
            const result = await updateShopifyCartLine(cartId, existingItem.lineId, newQuantity);
            if (result.success) {
              const currentItems = get().items;
              set({
                // REMOVE THIS BROKEN LINE:
                // checkoutUrl: result.checkoutUrl ?? get().checkoutUrl, 
                items: currentItems.map((i) =>
                  i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i,
                ),
              });
              return true;
            }

            if (result.cartNotFound) {
              clearCart();
              return get().addItem(item);
            }
            return false;
          }
          const result = await addLineToShopifyCart(cartId, { ...item, lineId: null });
          if (result.success) {
              const currentItems = get().items;
              set({ 
                // REMOVE THIS BROKEN LINE:
                // checkoutUrl: result.checkoutUrl ?? get().checkoutUrl,
                items: [...currentItems, { ...item, lineId: result.lineId ?? null }] 
              });
              return true;
            }

          if (result.cartNotFound) {
            clearCart();
            return get().addItem(item);
          }
          return false;
        } catch (error) {
          console.error("Failed to add item:", error);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },


      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(variantId);
          return;
        }
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true });
        try {
          const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
          if (result.success) {
            const currentItems = get().items;
            set({ items: currentItems.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)) });
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error("Failed to update quantity:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true });
        try {
          const result = await removeLineFromShopifyCart(cartId, item.lineId);
          if (result.success) {
            const newItems = get().items.filter((i) => i.variantId !== variantId);
            if (newItems.length === 0) clearCart();
            else set({ items: newItems });
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error("Failed to remove item:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
      getCheckoutUrl: () => get().checkoutUrl,

             syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;
        
        set({ isSyncing: true });
        try {
          const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
          const cart = data?.data?.cart;
          
          if (!cart) {
            clearCart();
            return;
          }

          if (cart.totalQuantity === 0) {
            clearCart();
          } else {
            set({ checkoutUrl: cart.checkoutUrl });
          }
        } catch (error) {
          // Keep this one to log actual infrastructure errors in production
          console.error("❌ [Zustand Store] Shopify sync runtime exception:", error);
        } finally {
          set({ isSyncing: false });
        }
      },



    }),
    {
      name: "shopify-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, cartId: state.cartId, checkoutUrl: state.checkoutUrl }),
      // Rehydrated after mount (see useCartSync) so SSR and first client render match.
      skipHydration: true,
    },
  ),
);

export function getCartSummary() {
  return useCartStore.getState().items.map((i) => ({
    title: i.product.node.title,
    variant: i.variantTitle,
    quantity: i.quantity,
    price: `${i.price.amount} ${i.price.currencyCode}`,
  }));
}
