import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Product wrapper styled like the agent's helmet: visor band, grid, ear-pod corners. */
export function HoloFrame({ children, className, dim = false }: { children: ReactNode; className?: string; dim?: boolean }) {
  return (
    <div className={cn("relative mx-4", className)}>
      {/* ear pods */}
      <span className="absolute -left-4 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border-2 border-primary bg-background shadow-[var(--glow-sm)]">
        <span className="h-2.5 w-2.5 rounded-full border border-primary-glow" />
      </span>
      <span className="absolute -right-4 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border-2 border-primary bg-background shadow-[var(--glow-sm)]">
        <span className="h-2.5 w-2.5 rounded-full border border-primary-glow" />
      </span>
      <div className={cn("holo-grid holo-scan relative overflow-hidden rounded-t-[45%] rounded-b-[2rem] border-2 border-primary/70 bg-background px-6 pb-6 pt-10 shadow-[var(--glow-lg)]", dim && "opacity-70")}>
        {/* panel lines */}
        <span className="pointer-events-none absolute left-1/2 top-0 h-10 w-px bg-primary/50" />
        <span className="pointer-events-none absolute inset-x-10 top-4 h-6 rounded-t-full border-t border-primary/40" />
        {/* visor band */}
        <span className="pointer-events-none absolute inset-x-4 top-[44%] h-10 rounded-full border border-primary/60 bg-primary/10 shadow-[var(--glow-sm)]" />
        <span className="pointer-events-none absolute inset-x-10 top-[calc(44%+1.2rem)] h-px bg-primary-glow animate-pulse-glow" />
        <div className="relative z-[2]">{children}</div>
      </div>
    </div>
  );
}
