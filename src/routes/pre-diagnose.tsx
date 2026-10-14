import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero, Section, seo } from "@/components/Section";
import { AgentBubble } from "@/components/brand/Agent";
import { EngineMap } from "@/components/EngineMap";
import { areaLabel, checkCoverage, DEVICE_NOTE, explainCode, matchSymptoms, type EngineArea } from "@/lib/nanodrift-data";

type Search = { make?: string | undefined; model?: string | undefined; year?: number | undefined };

export const Route = createFileRoute("/pre-diagnose")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    make: typeof s["make"] === "string" ? s["make"] : undefined,
    model: typeof s["model"] === "string" ? s["model"] : undefined,
    year: typeof s["year"] === "number" ? s["year"] : undefined,
  }),
  head: () => seo("Pre-Diagnose your vehicle — NanoDrift", "Free preview: check coverage, decode a trouble code or describe symptoms and see the likely problem area on a sample engine map."),
  component: PreDiagnose,
});

const field = "w-full rounded-md border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:shadow-[var(--glow-sm)]";
const makes = ["Ford", "Chevrolet", "GMC", "Dodge", "RAM", "Toyota", "Honda", "Nissan", "Jeep", "BMW", "Mercedes-Benz", "Tesla", "Other"];

interface Result { vehicle: string; coverage: string; covered: boolean; lines: string[]; causes: string[]; area: EngineArea | null }

function PreDiagnose() {
  const s = Route.useSearch();
  const [result, setResult] = useState<Result | null>(null);
  const years = Array.from({ length: new Date().getFullYear() + 2 - 1990 }, (_, i) => new Date().getFullYear() + 1 - i);

  return (
    <>
      <PageHero eyebrow="Pre-Diagnose · Free preview" title="What's your vehicle telling you?" intro="Pick your vehicle, enter a trouble code or describe the symptoms. No login needed." />
      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <form
            className="holo-panel holo-scan space-y-4 p-6 md:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const make = String(f.get("make")).trim(), model = String(f.get("model")).trim(), year = Number(f.get("year"));
              const code = String(f.get("code")).trim(), symptoms = String(f.get("symptoms")).trim();
              const cov = checkCoverage(make, model, year);
              const lines: string[] = []; let causes: string[] = []; let area: EngineArea | null = null;
              if (code) {
                const r = explainCode(code);
                lines.push(r.info ? `${r.code} — ${r.info.title}. ${r.info.meaning}` : r.message.replace(` ${DEVICE_NOTE}`, ""));
                if (r.info) { causes = r.info.causes; area = r.info.area; }
              }
              if (symptoms) {
                const m = matchSymptoms(symptoms);
                if (m) { if (!area) area = m.area; causes = [...new Set([...causes, ...m.causes])]; lines.push(`Your symptoms point toward the ${areaLabel[m.area].toLowerCase()}.`); }
                else lines.push("I couldn't match those symptoms to a common pattern. The live scan will pinpoint it.");
              }
              if (!code && !symptoms) lines.push("Add a trouble code or describe a symptom for a fuller preview.");
              setResult({ vehicle: `${year} ${make} ${model}`, coverage: cov.message, covered: cov.supported, lines, causes, area });
            }}
          >
            <div className="relative z-[2] grid gap-4 sm:grid-cols-3">
              <select name="make" defaultValue={s.make && makes.includes(s.make) ? s.make : "Ford"} className={field} aria-label="Make">{makes.map((m) => <option key={m}>{m}</option>)}</select>
              <input name="model" required defaultValue={s.model} maxLength={60} placeholder="Model" className={field} aria-label="Model" />
              <select name="year" defaultValue={String(s.year ?? 2018)} className={field} aria-label="Year">{years.map((y) => <option key={y}>{y}</option>)}<option value="1995">1995 or older</option></select>
            </div>
            <input name="code" maxLength={10} placeholder="Trouble code (optional), e.g. P0420" className={`${field} relative z-[2] uppercase`} />
            <textarea name="symptoms" maxLength={500} rows={4} placeholder="Symptoms (optional), e.g. shaking at idle, check engine light" className={`${field} relative z-[2]`} />
            <button className="btn-neon relative z-[2] w-full">Run preview</button>
          </form>

          <div className="space-y-6">
            {!result ? (
              <>
                <AgentBubble>Tell me what you're driving and what's going on. I'll show you where I'd look first.</AgentBubble>
                <EngineMap sample />
              </>
            ) : (
              <>
                <div className="holo-panel p-6">
                  <div className="eyebrow">Coverage · {result.vehicle}</div>
                  <p className={`mt-2 font-bold ${result.covered ? "text-primary-glow" : "text-gold"}`}>{result.coverage}</p>
                  <div className="eyebrow mt-5">Preview</div>
                  {result.lines.map((l) => <p key={l} className="mt-2 text-sm text-secondary-foreground">{l}</p>)}
                  {result.causes.length > 0 && (
                    <>
                      <div className="eyebrow mt-5">Likely causes</div>
                      <ul className="mt-2 space-y-1 text-sm">{result.causes.map((c) => <li key={c}>▹ {c}</li>)}</ul>
                    </>
                  )}
                </div>
                <EngineMap sample highlight={result.area ?? "ignition"} />
                <AgentBubble>This is a preview based on common patterns, not a reading from your vehicle. {DEVICE_NOTE}</AgentBubble>
              </>
            )}
            <div className="flex flex-wrap gap-3">
              <Link to="/auth" search={{ mode: "signup" }} className="btn-neon">Sign up</Link>
              <Link to="/waitlist" className="btn-outline-neon">Join the waitlist</Link>
              <Link to="/products" className="btn-outline-neon">See adapters</Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
