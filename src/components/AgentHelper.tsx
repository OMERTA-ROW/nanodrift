import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { AgentHelmet } from "@/components/brand/Agent";

const tips: [string, string, string, string][] = [
  // [path prefix, tip, link to, link label]
  ["/pre-diagnose", "Enter a code like P0420 or describe what you feel. I'll light up where I'd look first.", "/products", "Find my adapter"],
  ["/products", "Cars and light trucks 1996+ take OBD-II. Powerstroke, Cummins or Duramax? Grab the J1939.", "/pricing", "See plans"],
  ["/pricing", "Core covers diagnostics and me. Power and regen plans need a signed agreement first.", "/auth", "Create account"],
  ["/coverage", "Not sure about your ride? Run a free preview.", "/pre-diagnose", "Pre-Diagnose"],
  ["/connect", "Paste the URL into your AI assistant and ask it about NanoDrift.", "/pre-diagnose", "Try Pre-Diagnose"],
  ["/garage", "Add each vehicle so I can check coverage before your device arrives.", "/pre-diagnose", "Pre-Diagnose"],
  ["/", "Got a warning light? I can preview it for free — no login.", "/pre-diagnose", "Pre-Diagnose"],
];

export function AgentHelper() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const tip = tips.find(([p]) => (p === "/" ? true : pathname.startsWith(p)))!;
  return (
    <div className="fixed bottom-4 right-4 z-40 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2">
      {open && (
        <div className="holo-panel w-72 p-4 text-sm text-secondary-foreground">
          <div className="eyebrow mb-1 text-[0.6rem]">NanoDrift Agent</div>
          <p>{tip[1]}</p>
          <Link to={tip[2]} onClick={() => setOpen(false)} className="btn-neon mt-3 w-full !py-2">{tip[3]}</Link>
        </div>
      )}
      <button onClick={() => setOpen(!open)} aria-label={open ? "Close agent helper" : "Open agent helper"} className="holo-panel grid h-14 w-14 place-items-center overflow-hidden rounded-full p-1 shadow-[var(--glow-lg)] transition hover:scale-105">
        <AgentHelmet className="h-12 w-12" />
      </button>
    </div>
  );
}
