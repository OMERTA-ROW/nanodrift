import type { AdapterKind } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const connectors: Record<AdapterKind, JSX.Element> = {
  obd: (
    <g>
      <path d="M70 150 L230 150 L218 196 L82 196 Z" strokeWidth="2.5" />
      {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={92 + i * 15} y="160" width="6" height="10" />)}
      {Array.from({ length: 8 }).map((_, i) => <rect key={`b${i}`} x={96 + i * 14} y="178" width="6" height="10" />)}
    </g>
  ),
  j1939: (
    <g>
      <circle cx="150" cy="176" r="34" strokeWidth="2.5" />
      <circle cx="150" cy="176" r="24" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <circle key={i} cx={150 + 14 * Math.cos((i * Math.PI) / 4)} cy={176 + 14 * Math.sin((i * Math.PI) / 4)} r="2.5" />
      ))}
      <circle cx="150" cy="176" r="2.5" />
    </g>
  ),
  marine: (
    <g>
      <rect x="96" y="150" width="108" height="46" rx="20" strokeWidth="2.5" />
      <path d="M110 162 q20 -10 40 0 t40 0 M110 178 q20 -10 40 0 t40 0" />
    </g>
  ),
  aviation: (
    <g>
      <rect x="86" y="150" width="128" height="42" rx="6" strokeWidth="2.5" strokeDasharray="6 5" />
      <path d="M150 158 L150 186 M134 172 L166 172 M140 182 L160 182" />
    </g>
  ),
};

export function AdapterArt({ kind, className }: { kind: AdapterKind; className?: string }) {
  return (
    <svg viewBox="0 0 300 220" className={cn("svg-glow text-primary", className)} fill="none" stroke="currentColor" strokeWidth="1.5" role="img" aria-label={`NanoDrift ${kind} adapter`}>
      {/* USB-C cable */}
      <path d="M150 20 V40" strokeWidth="5" />
      <rect x="138" y="8" width="24" height="10" rx="5" strokeWidth="2" />
      {/* body */}
      <rect x="60" y="40" width="180" height="110" rx="18" fill="var(--color-background)" strokeWidth="2.5" />
      <rect x="70" y="50" width="160" height="22" rx="6" fill="currentColor" fillOpacity=".15" />
      <text x="150" y="66" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="Orbitron, sans-serif" fontWeight="900" fontSize="15" letterSpacing="3">NANODRIFT</text>
      <path d="M78 96 H222 M78 112 H180" opacity=".5" />
      <circle cx="210" cy="124" r="5" fill="currentColor" className="animate-pulse-glow" />
      <path d="M82 128 l10 -10 l10 10 l10 -10" opacity=".7" />
      {connectors[kind]}
    </svg>
  );
}
