import { AssistantPanel } from "@/components/assistant/AssistantPanel";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { DESKTOP_QUERY, useUiStore } from "@/stores/uiStore";

/** Desktop: a sticky sidebar beside the page. Mobile: a slide-over sheet. Same conversation in both. */
export function AssistantDock() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const desktopOpen = useUiStore((s) => s.desktopAssistantOpen);
  const mobileOpen = useUiStore((s) => s.mobileAssistantOpen);
  const setDesktop = useUiStore((s) => s.setDesktopAssistantOpen);
  const setMobile = useUiStore((s) => s.setMobileAssistantOpen);

  if (isDesktop) {
    if (!desktopOpen) return null;
    return (
      <aside
        aria-label="Shopping assistant"
        className="sticky top-16 h-[calc(100dvh-4rem)] w-[380px] shrink-0 border-l xl:w-[420px]"
      >
        <AssistantPanel onClose={() => setDesktop(false)} />
      </aside>
    );
  }

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobile}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-md [&>button]:hidden">
        <SheetTitle className="sr-only">Ordo Concierge</SheetTitle>
        <SheetDescription className="sr-only">Shopping assistant chat</SheetDescription>
        <AssistantPanel onClose={() => setMobile(false)} />
      </SheetContent>
    </Sheet>
  );
}
