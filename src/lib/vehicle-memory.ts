import { readCodes, readSensors, SENSORS, type Log, type SensorKey } from "@/lib/vehicle-health";

/**
 * "Nano vehicle memory" PROTOTYPE: plain statistics over the user's own stored scans.
 * Not a learning model, not conscious, no hardware link. Nothing is invented: with fewer
 * than 2 readings for a sensor, no trend is reported.
 */
export type Confidence = "none" | "low" | "medium" | "high";
export type Trend = { key: SensorKey; label: string; unit: string; first: number; last: number; change: number; direction: "rising" | "falling" | "steady"; samples: number; confidence: Confidence; note: string };
export type Memory = { scans: number; spanDays: number; trends: Trend[]; recurringCodes: { code: string; count: number }[]; observations: string[] };

export const confidenceFor = (samples: number): Confidence => (samples < 2 ? "none" : samples < 4 ? "low" : samples < 8 ? "medium" : "high");

export function buildMemory(logs: Log[]): Memory {
  const sorted = [...logs].sort((a, b) => +new Date(a.recorded_at) - +new Date(b.recorded_at));
  const spanDays = sorted.length > 1 ? Math.round((+new Date(sorted[sorted.length - 1]!.recorded_at) - +new Date(sorted[0]!.recorded_at)) / 86_400_000) : 0;
  const series = new Map<SensorKey, number[]>();
  for (const l of sorted) for (const r of readSensors(l.sensor_readings)) series.set(r.key, [...(series.get(r.key) ?? []), r.value]);

  const trends: Trend[] = [];
  for (const [key, vals] of series) {
    if (vals.length < 2) continue;
    const s = SENSORS[key];
    const first = vals[0]!, last = vals[vals.length - 1]!, change = +(last - first).toFixed(2);
    const range = s.max - s.min;
    const direction = Math.abs(change) < range * 0.05 ? "steady" : change > 0 ? "rising" : "falling";
    const toward = (direction === "rising" && last > s.max - range * 0.15) || (direction === "falling" && last < s.min + range * 0.15);
    const note = direction === "steady" ? `${s.label} has stayed about the same.` : `${s.label} is ${direction} (${first} → ${last} ${s.unit})${toward ? ", moving toward the edge of its normal range" : ""}.`;
    trends.push({ key, label: s.label, unit: s.unit, first, last, change, direction, samples: vals.length, confidence: confidenceFor(vals.length), note });
  }

  const counts = new Map<string, number>();
  for (const l of sorted) for (const c of new Set(readCodes(l.trouble_codes).map((x) => x.toUpperCase()))) counts.set(c, (counts.get(c) ?? 0) + 1);
  const recurringCodes = [...counts].filter(([, n]) => n >= 2).map(([code, count]) => ({ code, count }));

  const observations: string[] = [];
  if (sorted.length === 0) observations.push("I don't have any stored scans for this vehicle yet, so I have nothing to remember.");
  else if (sorted.length === 1) observations.push("I only have one scan so far. I need at least two to notice any changes over time.");
  else observations.push(`I'm comparing ${sorted.length} stored scans over ${spanDays} days.`);
  for (const t of trends.filter((t) => t.direction !== "steady")) observations.push(t.note);
  for (const c of recurringCodes) observations.push(`Code ${c.code} has shown up in ${c.count} separate scans — it keeps coming back.`);
  if (sorted.length > 1 && trends.every((t) => t.direction === "steady") && recurringCodes.length === 0) observations.push("Nothing has changed much between scans.");
  return { scans: sorted.length, spanDays, trends, recurringCodes, observations };
}

/** Clearly labelled demo history for the sample preview only (never saved). */
export function sampleHistory(latest: Log): Log[] {
  const day = 86_400_000, now = Date.now();
  const r = latest.sensor_readings as Record<string, number>;
  const mk = (daysAgo: number, coolant: number, oilP: number, codes: string[]): Log => ({ ...latest, recorded_at: new Date(now - daysAgo * day).toISOString(), trouble_codes: codes, sensor_readings: { ...r, coolant_temp_f: coolant, oil_pressure_psi: oilP } });
  return [mk(60, 205, 46, []), mk(40, 214, 45, ["P0128"]), mk(20, 226, 44, []), latest];
}
