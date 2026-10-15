import { describe, expect, it } from "vitest";
import { assessOilRisk } from "@/lib/oil-risk";

const log = (sensor_readings: Record<string, unknown>, trouble_codes: string[] = []) => ({ recorded_at: new Date().toISOString(), health_score: null, notes: null, sensor_readings, trouble_codes });

describe("oil sludge / lubrication risk", () => {
  it("never estimates without data", () => {
    expect(assessOilRisk(null).level).toBe("insufficient-data");
    expect(assessOilRisk(log({ oil_pressure_psi: 10 })).level).toBe("insufficient-data");
  });
  it("is low when pressure, temp and service are normal", () => {
    expect(assessOilRisk(log({ oil_pressure_psi: 45, oil_temp_f: 210, odometer_mi: 10000, last_oil_change_mi: 8000 })).level).toBe("low");
  });
  it("is high with low pressure, overdue oil and P0524", () => {
    expect(assessOilRisk(log({ oil_pressure_psi: 15, oil_temp_f: 210, odometer_mi: 30000, last_oil_change_mi: 18000 }, ["P0524"])).level).toBe("high");
  });
  it("lists missing inputs instead of guessing", () => {
    expect(assessOilRisk(log({ oil_pressure_psi: 45, oil_temp_f: 210 })).missing).toContain("Mileage since last oil change");
  });
});
