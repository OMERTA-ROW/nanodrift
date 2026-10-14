import { useState } from "react";
import { DriftCar } from "@/components/brand/Logo";

const spots = [
  { id: "ecm", label: "Engine ECM", x: 72, y: 45, info: "Engine control module — fuel, timing, boost maps." },
  { id: "tcm", label: "Transmission TCM", x: 52, y: 62, info: "Shift points, line pressure, torque converter lockup." },
  { id: "bcm", label: "Body BCM", x: 40, y: 35, info: "Lighting, locks, radio, speakers and fuse circuits." },
  { id: "harness", label: "Main harness", x: 25, y: 58, info: "Wiring diagnostics trace opens, shorts and resistance." },
];

export function HoloVehicle() {
  const [rot, setRot] = useState(-20);
  const [active, setActive] = useState(spots[0]);
  return (
    <div className="holo-panel holo-scan holo-grid p-6">
      <div className="relative mx-auto aspect-[2/1] max-w-xl" style={{ perspective: "800px" }}>
        <div className="h-full w-full transition-transform duration-300" style={{ transform: `rotateY(${rot}deg)` }}>
          <DriftCar className="h-full w-full" />
          {spots.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s)}
              aria-label={s.label}
              className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary-glow ${active.id === s.id ? "bg-gold shadow-[var(--glow-lg)]" : "bg-primary/40 animate-pulse-glow"}`}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
            />
          ))}
        </div>
      </div>
      <input type="range" min={-60} max={60} value={rot} onChange={(e) => setRot(+e.target.value)} className="mt-4 w-full accent-primary" aria-label="Rotate vehicle" />
      <div className="mt-3 rounded border p-3">
        <div className="eyebrow">{active.label}</div>
        <p className="mt-1 text-sm text-muted-foreground">{active.info}</p>
      </div>
    </div>
  );
}
