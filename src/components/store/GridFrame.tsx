import { cn } from "@/lib/utils";

/** Shared inset for the architectural frame — keep content padding wider than this. */
export const FRAME_INSET = "left-5 right-5 md:left-10 md:right-10";

/** Vertical hairline rails (and optional column guides) drawn over a `relative` wrapper. */
export function GridRails({ columns = 0, className }: { columns?: number; className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-y-0 z-10 border-x border-line", FRAME_INSET, className)}>
      {columns > 1 && (
        <div
          className="hidden size-full md:grid"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }, (_, i) => (
            <div key={i} className={cn(i < columns - 1 && "border-r border-line")} />
          ))}
        </div>
      )}
    </div>
  );
}

function Mark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute z-20 size-2.5 -translate-x-1/2 -translate-y-1/2",
        "before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:-translate-x-1/2 before:bg-muted-foreground/60",
        "after:absolute after:left-0 after:top-1/2 after:h-px after:w-full after:-translate-y-1/2 after:bg-muted-foreground/60",
        className,
      )}
    />
  );
}

/** Small "+" registration marks where the rails cross a horizontal line. */
export function Crosshairs({ edge = "top" }: { edge?: "top" | "bottom" }) {
  const y = edge === "top" ? "top-0" : "top-full";
  return (
    <>
      <Mark className={cn(y, "left-5 md:left-10")} />
      <Mark className={cn(y, "left-[calc(100%-1.25rem)] md:left-[calc(100%-2.5rem)]")} />
    </>
  );
}
