import { LOGO_IMAGE_SRC } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function DriftCar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 90" className={cn("svg-glow text-primary", className)} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {/* motion lines */}
      <path d="M4 40h34M10 52h30M2 64h40" opacity=".7" />
      {/* tire smoke */}
      <circle cx="52" cy="70" r="9" opacity=".35" />
      <circle cx="42" cy="62" r="6" opacity=".25" />
      <circle cx="60" cy="58" r="5" opacity=".2" />
      {/* car body, angled sideways */}
      <g transform="rotate(-8 130 55)">
        <path d="M58 64 L70 50 Q92 44 110 34 Q130 26 156 30 L186 40 Q202 44 206 54 L206 62 Q204 66 196 66 L58 66 Z" />
        <path d="M112 36 L124 46 L176 46 L160 32" />
        <path d="M142 32 L144 46" />
        <circle cx="88" cy="66" r="10" />
        <circle cx="88" cy="66" r="4" />
        <circle cx="180" cy="66" r="10" />
        <circle cx="180" cy="66" r="4" />
        <path d="M196 52h8M62 58h14" />
      </g>
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  if (LOGO_IMAGE_SRC) {
    return <img src={LOGO_IMAGE_SRC} alt="NanoDrift" className={cn("h-full w-auto object-contain", className)} />;
  }
  return (
    <div className={cn("flex items-center gap-2", className)} aria-label="NanoDrift">
      <DriftCar className={compact ? "h-8 w-auto" : "h-20 w-auto"} />
      <div className="font-display font-black leading-[0.85] text-glow">
        <div className={compact ? "text-sm tracking-[0.3em]" : "text-3xl tracking-[0.3em]"}>NANO</div>
        <div className={cn("text-primary", compact ? "text-sm tracking-[0.25em]" : "text-3xl tracking-[0.25em]")}>DRIFT</div>
      </div>
    </div>
  );
}
