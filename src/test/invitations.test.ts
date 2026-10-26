import { describe, expect, it } from "vitest";
import { canAssignRole, checkRedeem, clampExpiryHours, INVITABLE_ROLES } from "@/lib/invitations";

const now = new Date("2026-10-26T12:00:00Z");
const later = new Date("2026-10-27T12:00:00Z");

describe("role assignment", () => {
  it("nobody can grant owner", () => {
    expect(canAssignRole(["owner"], "owner")).toBe(false);
    expect(INVITABLE_ROLES).not.toContain("owner");
  });
  it("tester cannot escalate anyone", () => {
    expect(canAssignRole(["tester"], "tester")).toBe(false);
    expect(canAssignRole(["tester"], "admin")).toBe(false);
  });
  it("admin can add testers but not admins", () => {
    expect(canAssignRole(["admin"], "tester")).toBe(true);
    expect(canAssignRole(["admin"], "admin")).toBe(false);
  });
  it("owner can add admins and testers", () => {
    expect(canAssignRole(["owner"], "admin")).toBe(true);
    expect(canAssignRole(["owner"], "tester")).toBe(true);
  });
  it("signed-out (no roles) can assign nothing", () => {
    expect(canAssignRole([], "tester")).toBe(false);
  });
});

describe("invitation redemption", () => {
  const fresh = { expiresAt: later, revokedAt: null, usedAt: null };
  it("valid invite redeems once", () => expect(checkRedeem(fresh, now, true)).toEqual({ ok: true }));
  it("used invite is rejected", () => expect(checkRedeem({ ...fresh, usedAt: now }, now, true)).toEqual({ ok: false, reason: "used" }));
  it("revoked invite is rejected", () => expect(checkRedeem({ ...fresh, revokedAt: now }, now, true)).toEqual({ ok: false, reason: "revoked" }));
  it("expired invite is rejected", () => expect(checkRedeem({ ...fresh, expiresAt: now }, now, true)).toEqual({ ok: false, reason: "expired" }));
  it("unverified email is rejected", () => expect(checkRedeem(fresh, now, false)).toEqual({ ok: false, reason: "unverified_email" }));
});

describe("expiry window", () => {
  it("clamps to 1 hour .. 30 days", () => {
    expect(clampExpiryHours(0)).toBe(1);
    expect(clampExpiryHours(10_000)).toBe(720);
    expect(clampExpiryHours(Number.NaN)).toBe(72);
  });
});
