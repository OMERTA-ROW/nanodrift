import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ExternalLink, Wrench } from "lucide-react";
import { PageHero, Section, seo } from "@/components/Section";
import { components, familyFor, familyLabel, findParts, type ComponentId, type EngineFamily } from "@/lib/parts-catalog";

type Search = { component?: ComponentId | undefined; family?: EngineFamily | undefined; vehicle?: string | undefined };

export const Route = createFileRoute("/parts")({
  staticData: { sitemap: true },
  validateSearch: (raw: Record<string, unknown>): Search => {
    const s = raw as { component?: unknown; family?: unknown; make?: unknown; model?: unknown; year?: unknown; vehicle?: unknown };
    const out: Search = {};
    if (typeof s.component === "string" && (s.component as string) in components) out.component = s.component as ComponentId;
    if (typeof s.family === "string" && (s.family as string) in familyLabel) out.family = s.family as EngineFamily;
    if (typeof s.make === "string" && typeof s.model === "string" && !out.family) out.family = familyFor(s.make, s.model);
    if (typeof s.vehicle === "string") out.vehicle = s.vehicle.slice(0, 80);
    else if (typeof s.make === "string" && typeof s.model === "string") out.vehicle = `${s.year ?? ""} ${s.make} ${s.model}`.trim().slice(0, 80);
    return out;
  },
  head: () => seo("Parts Marketplace — NanoDrift", "Diagnosis leads to the exact part: replacement parts matched to your Power Stroke, Cummins, Duramax or everyday vehicle."),
  component: Parts,
});

const field = "rounded-md border border-primary/40 bg-background px-3 py-2 text-sm";

function Parts() {
  const { component, family, vehicle } = Route.useSearch();
  const navigate = useNavigate({ from: "/parts" });
  const list = findParts({ component, family });
  const set = (patch: Partial<Search>) => navigate({ search: (prev) => ({ ...prev, ...patch }) });

  return (
    <>
      <PageHero eyebrow="Parts Marketplace" title="Diagnosis leads to the exact part." intro="When NanoDrift flags a part, find the replacement that fits your vehicle — or browse by engine and part." />
      <Section>
        <p className="rounded-md border border-gold/40 bg-gold/5 px-4 py-3 text-sm text-gold">As an Amazon Associate, NanoDrift earns from qualifying purchases.</p>
        {vehicle && <p className="mt-6 text-sm text-muted-foreground">Showing parts for <span className="font-bold text-primary-glow">{vehicle}</span>{family && <> · {familyLabel[family]}</>}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <select aria-label="Engine" className={field} value={family ?? ""} onChange={(e) => set({ family: (e.target.value || undefined) as EngineFamily | undefined, vehicle: undefined })}>
            <option value="">All engines</option>
            {(Object.keys(familyLabel) as EngineFamily[]).map((f) => <option key={f} value={f}>{familyLabel[f]}</option>)}
          </select>
          <select aria-label="Part" className={field} value={component ?? ""} onChange={(e) => set({ component: (e.target.value || undefined) as ComponentId | undefined })}>
            <option value="">All parts</option>
            {(Object.keys(components) as ComponentId[]).map((c) => <option key={c} value={c}>{components[c].name}</option>)}
          </select>
        </div>
        {list.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">No example parts for that combination yet — try "All engines".</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <article key={p.id} className="holo-panel flex flex-col p-6 transition hover:shadow-[0_0_30px_var(--color-primary)]">
                <div className="holo-grid flex h-24 items-center justify-center rounded-md border border-primary/30"><Wrench className="h-10 w-10 text-primary" /></div>
                <span className="mt-4 text-xs uppercase tracking-widest text-gold">{components[p.component].name} · {p.brand}</span>
                <h3 className="mt-1 font-bold">{p.name}</h3>
                <p className="mt-1 text-xs text-primary-glow">Fits: {familyLabel[p.family]}</p>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.description}</p>
                <a href={p.url} target="_blank" rel="noopener noreferrer sponsored" className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
                  Buy on Amazon <ExternalLink className="h-4 w-4" />
                </a>
              </article>
            ))}
          </div>
        )}
        <p className="mt-10 text-xs text-muted-foreground">Example listings — always confirm fitment on the product page before buying. Replacement emissions parts are OEM-style and keep your vehicle compliant.</p>
      </Section>
    </>
  );
}
