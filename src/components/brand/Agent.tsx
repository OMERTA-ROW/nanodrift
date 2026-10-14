import { AGENT_IMAGE_SRC } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { useId, type ReactNode } from "react";

export function AgentHelmet({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  if (AGENT_IMAGE_SRC) {
    return <img src={AGENT_IMAGE_SRC} alt="NanoDrift AI agent" className={cn("object-contain", className)} />;
  }
  return (
    <svg viewBox="0 0 200 200" className={cn("svg-glow text-primary", className)} fill="none" stroke="currentColor" strokeLinecap="round" role="img" aria-label="NanoDrift AI agent">
      <defs>
        <pattern id={`g${id}`} width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M8 0H0V8" strokeWidth=".4" opacity=".45" />
        </pattern>
        <clipPath id={`c${id}`}>
          <path d="M40 120 Q36 46 100 30 Q164 46 160 120 Q158 160 100 172 Q42 160 40 120Z" />
        </clipPath>
      </defs>
      <rect x="0" y="0" width="200" height="200" fill={`url(#g${id})`} clipPath={`url(#c${id})`} stroke="none" />
      {/* dome */}
      <path d="M40 120 Q36 46 100 30 Q164 46 160 120 Q158 160 100 172 Q42 160 40 120Z" strokeWidth="2.5" />
      {/* panel lines */}
      <path d="M100 30 V82 M68 40 Q72 62 62 84 M132 40 Q128 62 138 84 M52 64 Q100 54 148 64" strokeWidth="1.3" opacity=".8" />
      <path d="M62 140 Q100 152 138 140 M100 128 V172 M74 160 L80 136 M126 160 L120 136" strokeWidth="1.3" opacity=".7" />
      {/* visor band */}
      <path d="M44 92 Q100 78 156 92 L154 120 Q100 108 46 120Z" strokeWidth="2.5" fill="currentColor" fillOpacity=".18" />
      <path d="M54 102 Q100 92 146 102" strokeWidth="3" className="animate-pulse-glow" />
      {/* ear pods */}
      <circle cx="34" cy="108" r="12" strokeWidth="2.5" />
      <circle cx="34" cy="108" r="5" strokeWidth="1.5" />
      <circle cx="166" cy="108" r="12" strokeWidth="2.5" />
      <circle cx="166" cy="108" r="5" strokeWidth="1.5" />
    </svg>
  );
}

export function AgentBubble({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="holo-panel grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full p-1">
        <AgentHelmet className="h-10 w-10" />
      </div>
      <div className="holo-panel relative rounded-tl-none px-4 py-3 text-sm text-secondary-foreground">
        <div className="eyebrow mb-1 text-[0.6rem]">NanoDrift Agent</div>
        {children}
      </div>
    </div>
  );
}
