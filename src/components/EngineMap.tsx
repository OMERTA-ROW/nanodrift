import { useEffect, useState } from "react";
import { areaLabel, type EngineArea } from "@/lib/nanodrift-data";

const spots: Record<EngineArea, [number, number]> = {
  ignition: [153, 50], fuel: [60, 160], air: [110, 20], exhaust: [250, 160], cooling: [40, 100],
  oil: [110, 140], transmission: [290, 100], electrical: [360, 40], evap: [200, 180],
};

export function EngineMap({ highlight = "ignition", sample = false }: { highlight?: EngineArea; sample?: boolean }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setT((x) => x + 1), 1200);
    return () => clearInterval(i);
  }, []);
  const oil = 42 + (t % 5);
  const temp = 196 + (t % 3) * 2;
  const [cx, cy] = spots[highlight];
  return (
    <div className="holo-panel holo-scan holo-grid relative p-4">
      {sample && <div className="absolute right-3 top-3 z-10 rounded-full border border-gold/60 px-2 py-0.5 font-display text-[0.55rem] tracking-[0.2em] text-gold">SAMPLE MAP</div>}
      <svg viewBox="0 0 400 200" className="svg-glow h-auto w-full text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" role="img" aria-label={`Engine map highlighting ${areaLabel[highlight]}`}>
        <rect x="30" y="50" width="160" height="100" rx="10" strokeWidth="2.5" />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={45 + i * 36} y="35" width="26" height="30" rx="4" />)}
        <path d="M190 80 L300 70 L340 100 L300 130 L190 120 Z" strokeWidth="2.5" />
        <path d="M340 100 H385" strokeWidth="3" />
        <rect x="345" y="25" width="30" height="22" rx="3" />
        <path d="M60 150 V175 H260 V125" className="animate-flow" />
        <path d="M110 50 V15 H300 V70" className="animate-flow" />
        <circle cx={cx} cy={cy} r="12" className="animate-pulse-glow text-gold" stroke="currentColor" fill="currentColor" fillOpacity=".3" strokeWidth="2" />
      </svg>
      <div className="mt-3 grid grid-cols-3 gap-2 font-display text-[0.65rem] tracking-widest">
        <div className="rounded border p-2">OIL <span className="block text-base text-primary-glow">{oil} PSI</span></div>
        <div className="rounded border p-2">COOLANT <span className="block text-base text-primary-glow">{temp}°F</span></div>
        <div className="rounded border border-gold/60 p-2 text-gold">{areaLabel[highlight].toUpperCase()} <span className="block text-base">CHECK</span></div>
      </div>
    </div>
  );
}
