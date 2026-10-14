import { describe, expect, it } from "vitest";
import { kits, plans, products } from "@/lib/catalog";

const kit = (id: string) => kits.find((k) => k.id === id)?.price;

describe("pricing", () => {
  it("Standard Kit is $149", () => expect(kit("standard-kit")).toBe(149));
  it("Heavy-Duty Kit is $199", () => expect(kit("heavy-duty-kit")).toBe(199));
  it("Pro Kit is $249", () => expect(kit("pro-kit")).toBe(249));
  it("Standard subscription is $99/yr", () => expect(plans.find((p) => p.id === "core")?.pricePerYear).toBe(99));
  it("no premium tiers are public", () => expect(plans.map((p) => p.pricePerYear)).toEqual([99]));
});

describe("products", () => {
  it("aviation adapter is not for sale", () => expect(products.find((p) => p.id === "aviation")?.forSale).toBe(false));
});
