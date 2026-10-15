import { describe, expect, it } from "vitest";
import { ENGINE_FAMILIES, cylinderLayout, getEngineFamily } from "@/lib/engine-families";

describe("engine families", () => {
  it("offers six representative families", () => {
    expect(ENGINE_FAMILIES).toHaveLength(6);
  });
  it("lays out one cylinder per cylinder count", () => {
    for (const f of ENGINE_FAMILIES) expect(cylinderLayout(f)).toHaveLength(f.cylinders);
  });
  it("puts V engines on two banks and inline on one", () => {
    expect(new Set(cylinderLayout(getEngineFamily("gas-v8")).map((c) => c.z)).size).toBe(2);
    expect(new Set(cylinderLayout(getEngineFamily("gas-i4")).map((c) => c.z)).size).toBe(1);
  });
});
