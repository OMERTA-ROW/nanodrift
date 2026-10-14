import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, seo } from "@/components/Section";
import { AgentBubble } from "@/components/brand/Agent";

export const Route = createFileRoute("/safety")({
  staticData: { sitemap: true },
  head: () => seo("Safety — NanoDrift", "No flashing while moving, battery voltage checks, engine-state rules, interrupt rollback and confirmation gates."),
  component: Safety,
});

const rules = [
  ["No flashing while moving", "Locks out at even 1 mph. The vehicle must be fully stopped."],
  ["Battery voltage check", "Flashing won't start unless voltage is stable and in range."],
  ["Engine-state rules", "Each operation requires the correct key and engine state."],
  ["Interrupt rollback", "If anything is interrupted, NanoDrift restores the last known-good map."],
  ["Confirmation gates", "Every write requires explicit, step-by-step confirmation."],
];

function Safety() {
  return (
    <>
      <PageHero eyebrow="Safety" title="Governed by design." intro="Power is nothing without control. Every change passes five gates before it touches your ECU." />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <ol className="space-y-4">
            {rules.map(([t, d], i) => (
              <li key={t} className="holo-panel flex gap-5 p-6">
                <span className="font-display text-3xl font-black text-primary text-glow">0{i + 1}</span>
                <div><h3 className="font-bold">{t}</h3><p className="mt-1 text-sm text-muted-foreground">{d}</p></div>
              </li>
            ))}
          </ol>
          <AgentBubble>I detected 1 mph of movement. Flash paused. Bring the vehicle to a full stop and I'll pick up right where we left off.</AgentBubble>
        </div>
      </Section>
    </>
  );
}
