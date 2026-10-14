import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, seo } from "@/components/Section";
import { PlanCard } from "@/components/PlanCard";
import { plans } from "@/lib/catalog";

export const Route = createFileRoute("/pricing")({
  head: () => seo("Pricing — NanoDrift", "Core subscription plus yearly unlocks: Max Power $500, Premium / Fleet $1,000, AI Force Regen / Derate Fix $2,000."),
  component: Pricing,
});

function Pricing() {
  return (
    <>
      <PageHero eyebrow="Pricing" title="Yearly plans." intro="Start with Core. Add unlocks as you need them. Each unlock is your own license with a signed agreement." />
      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((p, i) => <PlanCard key={p.id} plan={p} featured={i === 2} />)}
        </div>
        <p className="mt-10 max-w-2xl text-sm text-muted-foreground">All unlocks are safety-governed and emissions-compliant. No real checkout yet — join the waitlist to reserve your spot.</p>
      </Section>
    </>
  );
}
