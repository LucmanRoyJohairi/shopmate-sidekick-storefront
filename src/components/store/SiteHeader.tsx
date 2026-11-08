import { ClientOnly, Link } from "@tanstack/react-router";

import conciergeMark from "@/assets/concierge-mark.png";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { DESKTOP_QUERY, useUiStore } from "@/stores/uiStore";

import { CartDrawer } from "./CartDrawer";

function ConciergeToggle() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const desktopOpen = useUiStore((s) => s.desktopAssistantOpen);
  const mobileOpen = useUiStore((s) => s.mobileAssistantOpen);
  const setDesktop = useUiStore((s) => s.setDesktopAssistantOpen);
  const setMobile = useUiStore((s) => s.setMobileAssistantOpen);
  const open = isDesktop ? desktopOpen : mobileOpen;

  return (
    <Button
      variant={open ? "secondary" : "ghost"}
      size="sm"
      className="gap-2"
      aria-pressed={open}
      onClick={() => (isDesktop ? setDesktop(!desktopOpen) : setMobile(!mobileOpen))}
    >
      <img src={conciergeMark} alt="" width={16} height={16} className="size-4" />
      <span className="hidden sm:inline">Concierge</span>
    </Button>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b bg-background/85 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-5 md:px-8">
        <Link to="/" className="flex items-baseline gap-3">
          <span className="font-display-tight text-3xl">Ordo</span>
          <span className="label-mono hidden md:inline">Objects for the considered desk</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" hash="collection">
              Shop
            </Link>
          </Button>
          <ClientOnly fallback={<div className="h-8 w-9 sm:w-28" />}>
            <ConciergeToggle />
          </ClientOnly>
          <CartDrawer />
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t">
      <div className="flex flex-col gap-6 px-5 py-10 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <p className="font-display-tight text-4xl">Ordo</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Modular organizers, ergonomic stands and mechanical accessories for a calmer place to work.
          </p>
        </div>
        <p className="label-mono">© {new Date().getFullYear()} Ordo</p>
      </div>
    </footer>
  );
}
