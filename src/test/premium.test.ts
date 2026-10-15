import { describe, expect, it } from "vitest";
import { premiumTiers, unlockState } from "@/lib/premium-tiers";

describe("premium unlocks", () => {
  it("tiers are $500, $1,000 and $2,000 a year", () => expect(premiumTiers.map((t) => t.pricePerYear)).toEqual([500, 1000, 2000]));
  it("stays locked without a signature even with active payment", () => expect(unlockState("tier-1", [], { plan_id: "tier-1", status: "active" })).toBe("locked"));
  it("signed but unpaid does not unlock", () => expect(unlockState("tier-1", ["tier-1"], { plan_id: "core", status: "active" })).toBe("signed"));
  it("signed and inactive subscription does not unlock", () => expect(unlockState("tier-2", ["tier-2"], { plan_id: "tier-2", status: "pending" })).toBe("signed"));
  it("signed and active matching subscription unlocks", () => expect(unlockState("tier-3", ["tier-3"], { plan_id: "tier-3", status: "active" })).toBe("unlocked"));
});
