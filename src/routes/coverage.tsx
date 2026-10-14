import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, seo } from "@/components/Section";

export const Route = createFileRoute("/coverage")({
  head: () => seo("Vehicle coverage — NanoDrift", "Launching with Ford, Chevy/GM, Dodge/RAM and Toyota, then Honda, Nissan, Jeep, then BMW, Mercedes, boats and EVs. Model years 1996+."),
  component: Coverage,
});

const phases = [
  { phase: "Phase 1 · Launch", makes: ["Ford", "Chevy / GM", "Dodge / RAM", "Toyota"], live: true },
  { phase: "Phase 2", makes: ["Honda", "Nissan", "Jeep"], live: false },
  { phase: "Phase 3", makes: ["BMW", "Mercedes", "Boats", "EVs"], live: false },
];

function Coverage() {
  return (
    <>
      <PageHero eyebrow="Vehicle coverage" title="Model years 1996+." intro="Rolling out make by make, with every update syncing straight to your adapter." />
      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          {phases.map((p) => (
            <div key={p.phase} className="holo-panel holo-scan p-6">
              <div className="flex items-center justify-between">
                <div className="eyebrow">{p.phase}</div>
                {p.live && <span className="font-display text-[0.6rem] tracking-[0.2em] text-gold">AT LAUNCH</span>}
              </div>
              <ul className="mt-5 space-y-3">
                {p.makes.map((m) => <li key={m} className="font-display text-xl font-bold">{m}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
