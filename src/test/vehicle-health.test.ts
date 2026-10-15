import { describe, expect, it } from "vitest";
import { flagsFor, healthScore, maintenanceFor, scoreStatus, type Log } from "@/lib/vehicle-health";

const log = (sensor_readings: unknown, extra: Partial<Log> = {}): Log => ({ recorded_at: new Date().toISOString(), health_score: null, trouble_codes: [], notes: null, sensor_readings, ...extra });

describe("vehicle health", () => {
  it("uses the stored score when present", () => expect(healthScore(log({}, { health_score: 72 }))).toBe(72));
  it("all-in-range readings score 100", () => expect(healthScore(log({ oil_pressure_psi: 40, coolant_temp_f: 195 }))).toBe(100));
  it("each out-of-range reading costs 10 and each code 15", () => expect(healthScore(log({ coolant_temp_f: 240 }, { trouble_codes: ["P0128"] }))).toBe(75));
  it("80+ is healthy, under 50 needs attention", () => {
    expect(scoreStatus(80).label).toBe("Healthy");
    expect(scoreStatus(49).label).toBe("Needs attention");
  });
  it("high coolant temp is flagged and links to the thermostat", () => expect(flagsFor(log({ coolant_temp_f: 240 }))[0]?.component).toBe("thermostat"));
  it("oil change overdue past 7,500 miles", () => expect(maintenanceFor(log({ odometer_mi: 50000, last_oil_change_mi: 42000 }))[0]?.due).toBe("overdue"));
});
