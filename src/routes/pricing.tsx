import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, seo } from "@/components/Section";
import { PlanCard } from "@/components/PlanCard";
import { kits, plans } from "@/lib/catalog";
import { KitCard } from "@/components/KitCard";

export const Route = createFileRoute("/pricing")({
  staticData: { sitemap: true },
  head: () => seo("Pricing — NanoDrift", "NanoDrift kits from $149 — Standard $149, Heavy-Duty $199, Pro $249 — plus the Standard subscription at $99/year."),
  component: Pricing,
});

function Pricing() {
  return (
    <>
      <PageHero eyebrow="Pricing" title="Kits & subscription." intro="Buy the kit once. Add the Standard subscription for $99/yr." />
      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          {kits.map((k, i) => <KitCard key={k.id} kit={k} featured={i === 2} />)}
        </div>
        <h2 className="mt-16 font-display text-2xl font-black">Subscription</h2>
        <div className="mt-6 max-w-sm">
          {plans.map((p) => <PlanCard key={p.id} plan={p} featured />)}
        </div>
        <p className="mt-10 max-w-2xl text-sm text-muted-foreground">Everything is safety-governed and emissions-compliant. No real checkout yet — join the waitlist to reserve your spot.</p>
        <div className="mt-6 flex flex-wrap gap-3"><Link to="/auth" search={{ mode: "signup" }} className="btn-neon">Sign up</Link><Link to="/waitlist" className="btn-outline-neon">Join the waitlist</Link></div>
      </Section>
    </>
  );
}
