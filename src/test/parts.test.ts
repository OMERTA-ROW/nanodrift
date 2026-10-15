import { describe, expect, it } from "vitest";
import { familyFor, findParts, parts } from "@/lib/parts-catalog";

describe("parts marketplace", () => {
  it("every Amazon link carries the candymantech-20 tag", () => {
    for (const p of parts) expect(new URL(p.url).searchParams.get("tag")).toBe("candymantech-20");
  });
  it("maps launch diesel trucks to their engine", () => {
    expect(familyFor("Ford", "F-250 Super Duty")).toBe("powerstroke");
    expect(familyFor("RAM", "2500")).toBe("cummins");
    expect(familyFor("Chevy", "Silverado 2500HD")).toBe("duramax");
  });
  it("a flagged head gasket has a part for each launch diesel", () => {
    for (const f of ["powerstroke", "cummins", "duramax"] as const) expect(findParts({ component: "head-gasket", family: f }).length).toBeGreaterThan(0);
  });
});
