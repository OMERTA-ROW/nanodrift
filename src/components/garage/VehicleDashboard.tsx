import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { EngineMap } from "@/components/EngineMap";
import { AgentBubble } from "@/components/brand/Agent";
import { OilRiskPanel } from "@/components/OilRiskPanel";
import { components, familyFor } from "@/lib/parts-catalog";
import { flagsFor, healthScore, maintenanceFor, readSensors, SAMPLE_LOG, scoreStatus, type Log } from "@/lib/vehicle-health";

type Vehicle = { id: string; make: string; model: string; year: number };

const tone = { good: "text-primary-glow border-primary", watch: "text-gold border-gold", bad: "text-[#ff3355] border-[#ff3355]" } as const;

export function VehicleDashboard({ vehicle, log }: { vehicle: Vehicle; log: Log | null }) {
  const [preview, setPreview] = useState(false);
  const name = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const active = log ?? (preview ? SAMPLE_LOG : null);
  const partsLink = (c: keyof typeof components) => ({ component: c, family: familyFor(vehicle.make, vehicle.model), vehicle: name });

  if (!active) {
    return (
      <div className="holo-panel p-6">
        <div className="eyebrow">{name}</div>
        <p className="mt-3 text-sm text-muted-foreground">No readings yet. Plug in your NanoDrift device and run a scan — your health score, live readings and maintenance heads-up will show up here.</p>
        <button type="button" onClick={() => setPreview(true)} className="btn-outline-neon mt-4 !px-3 !py-1.5 text-xs">Show a sample dashboard</button>
      </div>
    );
  }

  const score = healthScore(active);
  const st = scoreStatus(score);
  const readings = readSensors(active.sensor_readings);
  const flags = flagsFor(active);
  const maint = maintenanceFor(active);
  const isSample = !log;

  return (
    <div className="holo-panel space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="eyebrow">{name}</div>
          <p className="mt-1 text-xs text-muted-foreground">{isSample ? "Sample data — not from your vehicle" : `Last reading ${new Date(active.recorded_at).toLocaleString()}`}</p>
        </div>
        <div className={`flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 ${tone[st.tone]} shadow-[var(--glow-sm)]`}>
          <span className="text-3xl font-black">{score}</span>
          <span className="text-[10px] uppercase tracking-widest">{st.label}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="eyebrow">Live readings</h3>
          {readings.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No sensor readings in the latest scan.</p> : (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {readings.map((r) => (
                <li key={r.key} className={`rounded-md border p-3 text-sm ${r.status === "ok" ? "border-primary/30" : "border-gold"}`}>
                  <div className="text-xs text-muted-foreground">{r.label}</div>
                  <div className={`text-lg font-bold ${r.status === "ok" ? "text-primary-glow" : "text-gold"}`}>{r.value} {r.unit}</div>
                  <div className="text-[10px] text-muted-foreground">{r.status === "ok" ? "In range" : `Out of range · ${r.min}–${r.max}`}</div>
                  {r.status !== "ok" && r.component && <Link to="/parts" search={partsLink(r.component)} className="mt-1 inline-block text-xs text-gold hover:underline">Find this part →</Link>}
                </li>
              ))}
            </ul>
          )}
        </div>
        <EngineMap sample={isSample} highlight={flags[0]?.area ?? "ignition"} />
      </div>

      <OilRiskPanel log={active} sample={isSample} />

      <div>
        <h3 className="eyebrow">Maintenance heads-up</h3>
        {flags.length === 0 && maint.length === 0 ? (
          <AgentBubble>Everything looks good on the latest scan. Nothing due right now.</AgentBubble>
        ) : (
          <ul className="mt-3 space-y-2">
            {[...flags.map((f) => ({ key: f.title, title: f.title, detail: f.detail, badge: f.severity === "fault" ? "Flagged" : "Watch", component: f.component })),
              ...maint.map((m) => ({ key: m.title, title: m.title, detail: m.detail, badge: m.due === "overdue" ? "Overdue" : "Coming up", component: m.component }))].map((i) => (
              <li key={i.key} className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-primary/30 p-3 text-sm">
                <div>
                  <span className="mr-2 rounded-full border border-gold px-2 py-0.5 text-[10px] uppercase tracking-widest text-gold">{i.badge}</span>
                  <span className="font-bold">{i.title}</span>
                  <p className="mt-1 text-xs text-muted-foreground">{i.detail}</p>
                </div>
                {i.component && <Link to="/parts" search={partsLink(i.component)} className="btn-outline-neon !px-3 !py-1.5 text-xs">Find this part</Link>}
              </li>
            ))}
          </ul>
        )}
      </div>
      {isSample && <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Sample preview · real readings arrive when your device ships</p>}
    </div>
  );
}
