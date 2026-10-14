import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, seo } from "@/components/Section";
import { EngineMap } from "@/components/EngineMap";
import { HoloVehicle } from "@/components/HoloVehicle";
import { AgentBubble } from "@/components/brand/Agent";

export const Route = createFileRoute("/features")({
  head: () => seo("Features — NanoDrift", "Live engine map, 3D hologram vehicle, wiring diagnostics, safety-governed power boost, Diablo Kit, truck regen, Ghost Security and Vanishing Mode."),
  component: Features,
});

const features = [
  ["Live animated systems", "Watch fuel, air, oil and coolant flow in real time across every system."],
  ["Wiring diagnostics", "Trace opens, shorts and resistance faults down to the connector."],
  ["Sensor monitoring", "Sensor clogging, temperature and liquid pressure — flagged before they fail."],
  ["Radio, speaker & fuse checks", "Find the dead fuse or blown speaker without pulling a panel."],
  ["Power boost + safety governor", "More power, governed by live safety limits at every step."],
  ["Diablo Kit", "A library of legal, emissions-compliant tunes."],
  ["Truck regen", "Manual regen at a safe time, DEF diagnostics and derate management."],
  ["Ghost Security", "End-to-end encrypted and tamper-resistant from chip to cloud."],
  ["Vanishing Mode", "Wipe session data from the device and your account instantly."],
];

function Features() {
  return (
    <>
      <PageHero eyebrow="Features" title="See inside the machine." intro="Every sensor, module and wire — rendered live as a hologram, guided by your AI agent." />
      <Section eyebrow="Live digital engine map" title="Motor + transmission, live." intro="Live pressures and temps. When a part starts failing, it lights up.">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <EngineMap />
          <AgentBubble>Cylinder 4 coil is running hot and misfiring intermittently. I'd replace it before your next long drive.</AgentBubble>
        </div>
      </Section>
      <Section eyebrow="Interactive 3D hologram" title="Rotate. Click. Reveal." intro="Drag the slider to rotate. Tap a point to reveal ECUs and wiring.">
        <HoloVehicle />
      </Section>
      <Section eyebrow="Full suite" title="Everything else under the hood.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(([t, d]) => (
            <div key={t} className="holo-panel holo-scan p-6">
              <h3 className="font-bold text-primary-glow">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
