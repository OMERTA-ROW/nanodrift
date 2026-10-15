import { assessOilRisk, OIL_RISK_DISCLAIMER } from "@/lib/oil-risk";
import type { Log } from "@/lib/vehicle-health";

const levelLabel = { "insufficient-data": "Not enough data", low: "Low risk", elevated: "Elevated risk", high: "High risk" } as const;
const sourceLabel = { sensor: "Sensor", "service-history": "Service history", "operating-pattern": "Driving pattern", "trouble-code": "Trouble code" } as const;

/** Cautious oil sludge / lubrication restriction RISK estimate. Never claims detection. */
export function OilRiskPanel({ log, sample, compact = false }: { log: Log | null; sample: boolean; compact?: boolean }) {
  const r = assessOilRisk(log);
  const toneCls = r.level === "low" ? "text-primary-glow border-primary/50" : r.level === "insufficient-data" ? "text-muted-foreground border-muted" : "text-gold border-gold";
  return (
    <div className={`rounded-md border border-primary/30 ${compact ? "p-2" : "p-4"} text-xs`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-bold text-foreground">Possible oil sludge / lubrication restriction risk</span>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest ${toneCls}`}>{levelLabel[r.level]}</span>
      </div>
      <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{sample ? "Estimate from sample data · not your vehicle" : "Estimate from your latest stored scan"}</p>
      {r.factors.length > 0 && (
        <ul className="mt-2 space-y-1">
          {r.factors.map((f) => (
            <li key={f.label} className="flex gap-2"><span className="shrink-0 rounded border border-primary/40 px-1 text-[10px] text-primary-glow">{sourceLabel[f.source]}</span><span className="text-muted-foreground">{f.label}</span></li>
          ))}
        </ul>
      )}
      {!compact && r.missing.length > 0 && <p className="mt-2 text-muted-foreground">Not available: {r.missing.join(", ")}.</p>}
      <p className="mt-2 text-muted-foreground">{r.recommendation}</p>
      <p className="mt-2 text-[10px] text-muted-foreground">{OIL_RISK_DISCLAIMER}</p>
    </div>
  );
}
