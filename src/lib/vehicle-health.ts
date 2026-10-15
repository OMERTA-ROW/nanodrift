import { explainCode, type EngineArea } from "@/lib/nanodrift-data";
import { componentsForArea, type ComponentId } from "@/lib/parts-catalog";

/** Sensor keys we read from diagnostic_logs.sensor_readings, with normal operating ranges. */
export const SENSORS = {
  oil_pressure_psi: { label: "Oil pressure", unit: "psi", min: 25, max: 80, area: "oil", component: "oil-filter" },
  fuel_pressure_psi: { label: "Fuel pressure", unit: "psi", min: 45, max: 75, area: "fuel", component: "fuel-filter" },
  coolant_temp_f: { label: "Coolant temp", unit: "°F", min: 160, max: 225, area: "cooling", component: "thermostat" },
  oil_temp_f: { label: "Oil temp", unit: "°F", min: 150, max: 250, area: "oil", component: "oil-filter" },
  trans_temp_f: { label: "Transmission temp", unit: "°F", min: 100, max: 220, area: "transmission", component: null },
  coolant_pressure_psi: { label: "Coolant pressure", unit: "psi", min: 8, max: 18, area: "cooling", component: "water-pump" },
  boost_psi: { label: "Boost", unit: "psi", min: 0, max: 35, area: "air", component: "turbo" },
  battery_v: { label: "Battery", unit: "V", min: 12.2, max: 14.8, area: "electrical", component: "alternator" },
} as const satisfies Record<string, { label: string; unit: string; min: number; max: number; area: EngineArea; component: ComponentId | null }>;

export type SensorKey = keyof typeof SENSORS;

export type Reading = { key: SensorKey; label: string; unit: string; value: number; min: number; max: number; status: "ok" | "low" | "high"; area: EngineArea; component: ComponentId | null };

export type Flag = { title: string; detail: string; area: EngineArea; component: ComponentId | null; severity: "watch" | "fault" };

export type Log = { recorded_at: string; health_score: number | null; sensor_readings: unknown; trouble_codes: unknown; notes: string | null };

export function readSensors(raw: unknown): Reading[] {
  if (!raw || typeof raw !== "object") return [];
  const r = raw as Record<string, unknown>;
  return (Object.keys(SENSORS) as SensorKey[]).flatMap((key) => {
    const v = Number(r[key]);
    if (r[key] == null || !Number.isFinite(v)) return [];
    const s = SENSORS[key];
    return [{ key, ...s, value: v, status: v < s.min ? "low" : v > s.max ? "high" : "ok" } as Reading];
  });
}

export function readCodes(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((c) => (typeof c === "string" ? c : c && typeof c === "object" && "code" in c ? String((c as { code: unknown }).code) : "")).filter(Boolean).slice(0, 20);
}

/** Overall 0–100 score. Uses the stored score when present, otherwise derives one. */
export function healthScore(log: Log): number {
  if (typeof log.health_score === "number") return Math.max(0, Math.min(100, Math.round(log.health_score)));
  const out = readSensors(log.sensor_readings).filter((r) => r.status !== "ok").length;
  const codes = readCodes(log.trouble_codes).length;
  return Math.max(0, 100 - out * 10 - codes * 15);
}

export function scoreStatus(score: number): { label: string; tone: "good" | "watch" | "bad" } {
  if (score >= 80) return { label: "Healthy", tone: "good" };
  if (score >= 50) return { label: "Needs a look", tone: "watch" };
  return { label: "Needs attention", tone: "bad" };
}

export function flagsFor(log: Log): Flag[] {
  const flags: Flag[] = readSensors(log.sensor_readings).filter((r) => r.status !== "ok").map((r) => ({
    title: `${r.label} ${r.status === "low" ? "low" : "high"}`,
    detail: `Last reading ${r.value} ${r.unit} — normal is ${r.min}–${r.max} ${r.unit}.`,
    area: r.area, component: r.component, severity: "watch",
  }));
  for (const c of readCodes(log.trouble_codes)) {
    const e = explainCode(c);
    const area = e.info?.area ?? "electrical";
    flags.push({ title: e.info ? `${e.code} — ${e.info.title}` : e.code, detail: e.info ? `${e.info.meaning} Common causes: ${e.info.causes.join(", ")}.` : "A code we don't have a plain-language note for yet.", area, component: componentsForArea(area)[0] ?? null, severity: "fault" });
  }
  return flags;
}

export type MaintItem = { title: string; detail: string; due: "overdue" | "soon"; component: ComponentId | null };

/** Interval reminders from the odometer in the latest reading, plus time since the last scan. */
export function maintenanceFor(log: Log, now = new Date()): MaintItem[] {
  const items: MaintItem[] = [];
  const r = (log.sensor_readings ?? {}) as Record<string, unknown>;
  const odo = Number(r["odometer_mi"]), lastOil = Number(r["last_oil_change_mi"]), lastFuel = Number(r["last_fuel_filter_mi"]);
  if (Number.isFinite(odo) && Number.isFinite(lastOil)) {
    const since = odo - lastOil;
    if (since >= 5000) items.push({ title: "Oil & filter change", detail: `${since.toLocaleString()} miles since the last change (every 5,000–7,500).`, due: since >= 7500 ? "overdue" : "soon", component: "oil-filter" });
  }
  if (Number.isFinite(odo) && Number.isFinite(lastFuel)) {
    const since = odo - lastFuel;
    if (since >= 12000) items.push({ title: "Fuel filter", detail: `${since.toLocaleString()} miles since the last filter (every 15,000).`, due: since >= 15000 ? "overdue" : "soon", component: "fuel-filter" });
  }
  const days = (now.getTime() - new Date(log.recorded_at).getTime()) / 86_400_000;
  if (days > 30) items.push({ title: "Run a fresh scan", detail: `Your last reading is ${Math.floor(days)} days old.`, due: "soon", component: null });
  return items;
}

/** Clearly-labeled example reading used only for the on-screen preview (never saved). */
export const SAMPLE_LOG: Log = {
  recorded_at: new Date().toISOString(),
  health_score: null,
  trouble_codes: ["P0128"],
  notes: null,
  sensor_readings: { oil_pressure_psi: 42, fuel_pressure_psi: 58, coolant_temp_f: 238, oil_temp_f: 212, trans_temp_f: 175, coolant_pressure_psi: 14, boost_psi: 22, battery_v: 13.9, odometer_mi: 48200, last_oil_change_mi: 41000, last_fuel_filter_mi: 36500 },
};
