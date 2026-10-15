import { describe, expect, it } from "vitest";
import { buildMemory, confidenceFor } from "@/lib/vehicle-memory";

const log = (daysAgo: number, s: Record<string, unknown>, codes: string[] = []) => ({ recorded_at: new Date(Date.now() - daysAgo * 864e5).toISOString(), health_score: null, notes: null, sensor_readings: s, trouble_codes: codes });

describe("nano vehicle memory", () => {
  it("reports no trend from a single scan", () => expect(buildMemory([log(0, { coolant_temp_f: 200 })]).trends).toHaveLength(0));
  it("detects rising coolant across scans", () => expect(buildMemory([log(10, { coolant_temp_f: 195 }), log(0, { coolant_temp_f: 222 })]).trends[0]?.direction).toBe("rising"));
  it("flags codes seen in 2+ scans as recurring", () => expect(buildMemory([log(5, {}, ["P0128"]), log(0, {}, ["P0128"])]).recurringCodes[0]?.code).toBe("P0128"));
  it("confidence grows with readings", () => { expect(confidenceFor(1)).toBe("none"); expect(confidenceFor(3)).toBe("low"); expect(confidenceFor(8)).toBe("high"); });
});
