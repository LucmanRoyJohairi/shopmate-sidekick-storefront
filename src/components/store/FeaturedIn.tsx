// Placeholder publication names — replace with real press coverage before launch.
const OUTLETS = ["TechCrunch", "Wired", "Minimalissimo", "Dezeen", "Monocle"];

export function FeaturedIn() {
  const row = [...OUTLETS, ...OUTLETS];
  return (
    <section aria-label="As featured in" className="border-b py-7">
      <div className="flex items-center gap-8 px-5 md:px-10">
        <p className="label-mono shrink-0 opacity-70">As featured in</p>
        <div className="mask-fade-x relative min-w-0 flex-1 overflow-hidden">
          <ul className="flex w-max animate-marquee items-center motion-reduce:animate-none hover:[animation-play-state:paused]">
            {row.map((name, i) => (
              <li
                key={`${name}-${i}`}
                aria-hidden={i >= OUTLETS.length}
                className="font-display-tight whitespace-nowrap px-10 text-2xl text-muted-foreground/45 md:px-14 md:text-3xl"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
