const layers = [
  { name: "Body shell", note: "Realistic exterior panels" },
  { name: "Frame / chassis", note: "Rails, crossmembers, mounts" },
  { name: "Engine + drivetrain", note: "Combustion firing live" },
  { name: "Wiring + sensors", note: "Every harness and module" },
  { name: "Fluid lines", note: "Coolant, oil, fuel, DEF pumping" },
];

/** Showcase-only exploded layer stack in the hologram style (not a working 3D viewer). */
export function LayeredTeardown({ compact = false }: { compact?: boolean }) {
  return (
    <div className="holo-panel holo-scan relative overflow-hidden p-6 md:p-10" aria-label="Exploded layer preview">
      <div className="holo-grid absolute inset-0 opacity-40" />
      <div className="relative mx-auto flex max-w-md flex-col items-center" style={{ perspective: "900px" }}>
        {layers.map((l, i) => (
          <div
            key={l.name}
            className="relative w-full rounded-2xl border border-primary/60 bg-primary/10 px-5 py-3 shadow-[0_0_24px_var(--color-primary)] transition-transform duration-500 hover:-translate-y-1 animate-float"
            style={{ transform: `rotateX(58deg) rotateZ(-8deg)`, marginTop: i === 0 ? 0 : compact ? -6 : 4, animationDelay: `${i * 0.35}s`, opacity: 1 - i * 0.08 }}
          >
            <svg viewBox="0 0 200 40" className="h-8 w-full text-primary-glow" fill="none" stroke="currentColor" strokeWidth="1.2">
              {i === 0 && <path d="M10 30 L40 14 L120 10 L170 18 L190 30 Z" />}
              {i === 1 && <><path d="M15 20 H185 M15 28 H185" /><path d="M40 14 V34 M100 14 V34 M160 14 V34" /></>}
              {i === 2 && <><rect x="60" y="10" width="50" height="22" rx="3" /><path d="M110 21 H180" /><circle cx="75" cy="21" r="4" className="animate-pulse" /><circle cx="95" cy="21" r="4" className="animate-pulse" /></>}
              {i === 3 && <path d="M10 20 Q40 5 70 20 T130 20 T190 20 M30 30 Q80 15 170 30" strokeDasharray="3 3" />}
              {i === 4 && <path d="M10 25 C50 5 80 35 120 15 S180 25 190 18" strokeDasharray="6 4" className="animate-pulse" />}
            </svg>
          </div>
        ))}
      </div>
      {!compact && (
        <ol className="relative mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {layers.map((l, i) => (
            <li key={l.name} className="rounded-lg border border-primary/30 p-3 text-xs">
              <span className="font-bold text-primary-glow">{i + 1}. {l.name}</span>
              <div className="text-muted-foreground">{l.note}</div>
            </li>
          ))}
        </ol>
      )}
      <div className="relative mt-6 text-center text-xs uppercase tracking-widest text-gold">Rolling out first on launch diesel trucks</div>
    </div>
  );
}
