import { describe, expect, it } from "vitest";
import { plans, products } from "@/lib/catalog";

const price = (id: string) => plans.find((p) => p.id === id)?.pricePerYear;

describe("pricing", () => {
  it("Core is $60/yr", () => expect(price("core")).toBe(60));
  it("Max Power is $500/yr", () => expect(price("max-power")).toBe(500));
  it("Premium / Fleet is $1,000/yr", () => expect(price("fleet")).toBe(1000));
  it("AI Force Regen is $2,000/yr", () => expect(price("force-regen")).toBe(2000));
  it("every unlock needs a signed agreement", () =>
    expect(plans.filter((p) => p.id !== "core").every((p) => p.agreement)).toBe(true));
});

describe("products", () => {
  it("aviation adapter is not for sale", () => expect(products.find((p) => p.id === "aviation")?.forSale).toBe(false));
});
