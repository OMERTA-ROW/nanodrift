import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { AgentBubble, AgentHelmet } from "@/components/brand/Agent";
import { Section, seo } from "@/components/Section";
import { ProductCard } from "@/components/ProductCard";
import { PlanCard } from "@/components/PlanCard";
import { kits, products, plans } from "@/lib/catalog";
import { KitCard } from "@/components/KitCard";
import { EngineMap } from "@/components/EngineMap";
import { LayeredTeardown } from "@/components/LayeredTeardown";

export const Route = createFileRoute("/")({
  head: () => seo("NanoDrift — Turn any vehicle into a self-tuning machine", "AI-powered universal vehicle diagnostics and tuning. Install once — every new chip or mod auto-syncs. No shop, no laptop, no tuner knowledge."),
  component: Home,
});

const highlights = [
  ["Live engine map", "Motor + transmission with live pressures and temps. Failing parts light up."],
  ["3D hologram view", "Rotate your vehicle and click to reveal ECUs and wiring."],
  ["Auto-sync mods", "Install once. Every new chip or mod syncs automatically."],
  ["Safety governor", "Power boost that locks out at even 1 mph."],
  ["Ghost Security", "Encrypted, tamper-resistant, with Vanishing Mode."],
  ["Truck regen", "DEF diagnostics, derate management, safe-time regen."],
];

function Home() {
  return (
    <>
      <section className="holo-grid holo-scan border-b">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-2">
          <div>
            <Logo />
            <div className="eyebrow mt-8">Bridging the unbridgeable.</div>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
              NanoDrift turns any vehicle into a <span className="text-holo">self-tuning machine.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">Install once — every new chip or mod auto-syncs. No shop, no laptop, no tuner knowledge.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/pre-diagnose" className="btn-neon">Free Pre-Diagnose</Link>
              <Link to="/products" className="btn-outline-neon">Shop adapters</Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl" />
            <AgentHelmet className="animate-float relative mx-auto h-72 w-72 md:h-96 md:w-96" />
            <AgentBubble className="relative mx-auto mt-4 max-w-sm">Plug me in. I'll scan every module, map your engine live, and keep your tune in sync.</AgentBubble>
          </div>
        </div>
      </section>

      <Section eyebrow="Get NanoDrift" title="Pick your kit." intro="One-time hardware price. Add the Standard subscription for $99/yr.">
        <div className="grid gap-6 md:grid-cols-3">
          {kits.map((k, i) => <KitCard key={k.id} kit={k} featured={i === 2} />)}
        </div>
      </Section>

      <Section eyebrow="Capabilities" title="One plug. Every system.">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map(([t, d]) => (
              <div key={t} className="holo-panel p-5">
                <h3 className="text-sm font-bold text-primary-glow">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
          <EngineMap />
        </div>
        <div className="mt-10"><Link to="/pre-diagnose" className="btn-neon">Preview your vehicle free</Link></div>
      </Section>

      <Section eyebrow="Signature feature" title={<>Layered <span className="text-holo">Teardown</span></>} intro="Peel your own vehicle apart layer by layer — body, chassis, drivetrain, wiring, fluids — with live internals and an agent that explains every part.">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <LayeredTeardown compact />
          <div>
            <p className="text-muted-foreground">The deep-dive mode of your Garage, alongside the everyday see-through diagnostic map. Rolling out first on launch diesel trucks.</p>
            <Link to="/features" className="btn-outline-neon mt-6 inline-block">Explore Layered Teardown</Link>
          </div>
        </div>
      </Section>

      <Section eyebrow="The lineup" title="Adapters for everything that moves." intro="USB-C to your phone or laptop. EVs supported through software.">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </Section>

      <Section eyebrow="Subscription" title="One simple yearly plan.">
        <div className="max-w-sm">
          {plans.map((p) => <PlanCard key={p.id} plan={p} featured />)}
        </div>
        <div className="mt-10 flex flex-wrap gap-3"><Link to="/pricing" className="btn-outline-neon">See pricing</Link><Link to="/auth" search={{ mode: "signup" }} className="btn-neon">Create your account</Link></div>
      </Section>
    </>
  );
}
