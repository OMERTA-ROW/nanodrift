import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";

const TruckShowcase3D = lazy(() => import("./TruckShowcase3D"));

const legend = [
  ["Combustion", "bg-accent"],
  ["Coolant flow", "bg-primary-glow"],
  ["Wiring + sensors", "bg-primary"],
] as const;

export function HoloShowcase() {
  const [holo, setHolo] = useState(false);
  const fallback = <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading 3D truck…</div>;
  return (
    <div className="holo-panel relative overflow-hidden p-0">
      <div className="h-[420px] w-full md:h-[560px]">
        <ClientOnly fallback={fallback}>
          <Suspense fallback={fallback}>
            <TruckShowcase3D holo={holo} onToggle={() => setHolo((h) => !h)} />
          </Suspense>
        </ClientOnly>
      </div>
      <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-1">
        <span className="eyebrow">{holo ? "Hologram · live internals (simulated)" : "Heavy-duty diesel · showcase"}</span>
        <span className="text-xs text-muted-foreground">Drag to spin · scroll or pinch to zoom · right-drag to move · tap the truck</span>
      </div>
      {holo && (
        <ul className="pointer-events-none absolute bottom-4 left-4 space-y-1 text-xs">
          {legend.map(([l, c]) => <li key={l} className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${c}`} />{l}</li>)}
        </ul>
      )}
      <button onClick={() => setHolo((h) => !h)} className="btn-neon absolute bottom-4 right-4 !px-4 !py-2 text-xs">
        {holo ? "Show paint" : "See-through hologram"}
      </button>
    </div>
  );
}
