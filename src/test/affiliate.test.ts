import { describe, it, expect } from "vitest";
import { affiliateProducts, amazonUrl } from "@/lib/affiliate-products";

describe("affiliate links", () => {
  it("every product link carries the candymantech-20 tag", () => {
    for (const p of affiliateProducts) expect(amazonUrl(p.query)).toContain("&tag=candymantech-20");
  });
  it("builds Amazon search URLs", () => {
    expect(amazonUrl("Shell Rotella T6 5W-40")).toBe("https://www.amazon.com/s?k=Shell+Rotella+T6+5W-40&tag=candymantech-20");
  });
});
