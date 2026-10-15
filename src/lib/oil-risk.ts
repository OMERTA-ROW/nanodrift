import { readCodes, readSensors, type Log } from "@/lib/vehicle-health";

/**
 * "Possible oil sludge / lubrication restriction RISK" — an inference, never a detection.
 * Standard sensors cannot see sludge. This only combines indirect signals that are
 * actually present in a stored log; anything missing is reported as missing, not guessed.
 */
export type OilRiskLevel = "insufficient-data" | "low" | "elevated" | "high";
export type OilRiskFactor = { label: string; source: "sensor" | "service-history" | "operating-pattern" | "trouble-code"; weight: number };
export type OilRisk = { level: OilRiskLevel; score: number; factors: OilRiskFactor[]; missing: string[]; recommendation: string };

// Codes related to oil pressure / oil temperature circuits and readings (generic OBD-II meanings).
const OIL_CODES: Record<string, string> = {
  P0520: "Oil pressure sensor/switch circuit",
  P0521: "Oil pressure sensor range/performance",
  P0522: "Oil pressure sensor low voltage",
  P0523: "Oil pressure sensor high voltage",
  P0524: "Engine oil pressure too low",
  P0196: "Oil temperature sensor range/performance",
  P0197: "Oil temperature sensor low",
  P0198: "Oil temperature sensor high",
};

export const OIL_RISK_DISCLAIMER =
  "This is a risk estimate, not a sludge detection. Standard vehicle sensors cannot see sludge. Confirm with a physical inspection (valve-cover/oil-fill check) or a lab oil analysis.";

const num = (v: unknown) => (v == null || v === "" ? NaN : Number(v));

export function assessOilRisk(log: Log | null): OilRisk {
  const factors: OilRiskFactor[] = [];
  const missing: string[] = [];
  if (!log) return { level: "insufficient-data", score: 0, factors, missing: ["No diagnostic scan stored yet"], recommendation: "Run a scan with the NanoDrift device to gather oil pressure, oil temperature and service data." };

  const readings = readSensors(log.sensor_readings);
  const raw = (log.sensor_readings ?? {}) as Record<string, unknown>;
  let signals = 0;

  const op = readings.find((r) => r.key === "oil_pressure_psi");
  if (op) { signals++; if (op.status === "low") factors.push({ label: `Oil pressure low (${op.value} psi, normal ${op.min}–${op.max})`, source: "sensor", weight: 35 }); }
  else missing.push("Oil pressure reading");

  const ot = readings.find((r) => r.key === "oil_temp_f");
  if (ot) { signals++; if (ot.status === "high") factors.push({ label: `Oil temperature high (${ot.value} °F, normal ${ot.min}–${ot.max})`, source: "sensor", weight: 20 }); }
  else missing.push("Oil temperature reading");

  const odo = num(raw["odometer_mi"]), last = num(raw["last_oil_change_mi"]);
  if (Number.isFinite(odo) && Number.isFinite(last)) {
    signals++;
    const since = odo - last;
    if (since >= 10000) factors.push({ label: `${since.toLocaleString()} miles since last oil change`, source: "service-history", weight: 30 });
    else if (since >= 7500) factors.push({ label: `${since.toLocaleString()} miles since last oil change`, source: "service-history", weight: 15 });
  } else missing.push("Mileage since last oil change");

  const shortTrips = num(raw["short_trip_pct"]), idle = num(raw["idle_pct"]);
  if (Number.isFinite(shortTrips) || Number.isFinite(idle)) {
    signals++;
    if (shortTrips >= 50) factors.push({ label: `${shortTrips}% short trips (engine rarely fully warms up)`, source: "operating-pattern", weight: 10 });
    if (idle >= 40) factors.push({ label: `${idle}% time idling`, source: "operating-pattern", weight: 10 });
  } else missing.push("Driving pattern (short trips / idle time)");

  for (const c of readCodes(log.trouble_codes)) {
    const m = OIL_CODES[c.toUpperCase()];
    if (m) { signals++; factors.push({ label: `${c.toUpperCase()} — ${m}`, source: "trouble-code", weight: c.toUpperCase() === "P0524" ? 35 : 15 }); }
  }

  const score = Math.min(100, factors.reduce((s, f) => s + f.weight, 0));
  if (signals < 2) return { level: "insufficient-data", score, factors, missing, recommendation: "Not enough data to estimate this risk. " + OIL_RISK_DISCLAIMER };
  const level: OilRiskLevel = score >= 50 ? "high" : score >= 20 ? "elevated" : "low";
  const recommendation =
    level === "low" ? "No indirect warning signs in the available data. Keep to your regular oil-change interval."
    : level === "elevated" ? "Some indirect warning signs. Consider an oil change soon and ask for a quick inspection or oil analysis."
    : "Several indirect warning signs. Check the oil level now, avoid hard driving, and get a physical inspection or oil analysis before relying on the engine.";
  return { level, score, factors, missing, recommendation };
}
