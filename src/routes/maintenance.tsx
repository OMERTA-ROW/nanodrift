import { createFileRoute } from "@tanstack/react-router";
import { Droplet, Fuel, Sparkles, Wrench, ExternalLink } from "lucide-react";
import { PageHero, Section, seo } from "@/components/Section";
import { affiliateCategories, affiliateProducts, amazonUrl, type AffiliateCategory } from "@/lib/affiliate-products";

export const Route = createFileRoute("/maintenance")({
  staticData: { sitemap: true },
  head: () => seo("Recommended Maintenance — NanoDrift", "Oils, diesel treatments, fuel cleaners and additives that pair with NanoDrift diagnostics for diesel trucks and everyday vehicles."),
  component: Maintenance,
});

const icons: Record<AffiliateCategory, typeof Droplet> = {
  "Engine Oil": Droplet,
  "Diesel Treatments": Fuel,
  "Fuel/Engine Cleaners": Sparkles,
  "Lubricants & Additives": Wrench,
};

function Disclosure() {
  return <p className="rounded-md border border-gold/40 bg-gold/5 px-4 py-3 text-sm text-gold">As an Amazon Associate, NanoDrift earns from qualifying purchases.</p>;
}

function Maintenance() {
  return (
    <>
      <PageHero eyebrow="Recommended Maintenance" title="Fuel it right. Read it live." intro="Trusted oils, treatments and additives that pair with what NanoDrift sees — for diesel trucks and everyday drivers." />
      <Section>
        <Disclosure />
        {affiliateCategories.map((cat) => {
          const Icon = icons[cat];
          return (
            <div key={cat} className="mt-14">
              <h2 className="font-display text-2xl font-bold">{cat}</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {affiliateProducts.filter((p) => p.category === cat).map((p) => (
                  <article key={p.id} className="holo-panel flex flex-col p-6 transition hover:shadow-[0_0_30px_var(--color-primary)]">
                    <div className="holo-grid flex h-32 items-center justify-center rounded-md border border-primary/30">
                      <Icon className="h-12 w-12 text-primary" />
                    </div>
                    <span className="mt-4 text-xs uppercase tracking-widest text-gold">{p.fit === "All" ? "Diesel + Gas" : p.fit}</span>
                    <h3 className="mt-1 font-bold">{p.name}</h3>
                    <p className="mt-1 flex-1 text-sm text-muted-foreground">{p.benefit}</p>
                    <a href={amazonUrl(p.query)} target="_blank" rel="noopener noreferrer sponsored" className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
                      Buy on Amazon <ExternalLink className="h-4 w-4" />
                    </a>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
        <div className="mt-14"><Disclosure /></div>
      </Section>
    </>
  );
}
