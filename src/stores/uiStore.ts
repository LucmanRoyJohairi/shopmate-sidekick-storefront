import { create } from "zustand";

interface UiStore {
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  /** Sidebar on large screens — open by default. */
  desktopAssistantOpen: boolean;
  /** Slide-over on small screens — closed by default. */
  mobileAssistantOpen: boolean;
  setDesktopAssistantOpen: (open: boolean) => void;
  setMobileAssistantOpen: (open: boolean) => void;
}

export const useUiStore = create<UiStore>()((set) => ({
  cartOpen: false,
  setCartOpen: (cartOpen) => set({ cartOpen }),
  desktopAssistantOpen: true,
  mobileAssistantOpen: false,
  setDesktopAssistantOpen: (desktopAssistantOpen) => set({ desktopAssistantOpen }),
  setMobileAssistantOpen: (mobileAssistantOpen) => set({ mobileAssistantOpen }),
}));

export const DESKTOP_QUERY = "(min-width: 1024px)";

export function openAssistant() {
  const isDesktop = typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches;
  if (isDesktop) useUiStore.getState().setDesktopAssistantOpen(true);
  else useUiStore.getState().setMobileAssistantOpen(true);
}
