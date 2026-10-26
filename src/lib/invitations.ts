// Pure rules for owner/admin/tester access. The database functions in
// supabase/pending/owner_access.sql enforce the same rules server-side;
// this module exists so the rules are tested and the UI can explain them.
// Nothing here grants access by itself — never trust a role from the browser.

export type AppRole = "owner" | "admin" | "tester";

const RANK: Record<AppRole, number> = { tester: 1, admin: 2, owner: 3 };

/** Roles an invitation may grant. Owner is never grantable by invitation. */
export const INVITABLE_ROLES: readonly AppRole[] = ["tester", "admin"];

/** Can `actor` assign `target` role to someone else? Only strictly lower roles, never owner. */
export function canAssignRole(actor: AppRole[], target: AppRole): boolean {
  if (target === "owner") return false;
  const top = Math.max(0, ...actor.map((r) => RANK[r]));
  if (top < RANK.admin) return false;
  return RANK[target] < top || (top === RANK.owner && target === "admin");
}

export type InvitationState = {
  expiresAt: Date;
  revokedAt: Date | null;
  usedAt: Date | null;
};

export type RedeemCheck =
  | { ok: true }
  | { ok: false; reason: "revoked" | "used" | "expired" | "unverified_email" };

/** Single-use, expiring, revocable; redeemer must have a verified email. */
export function checkRedeem(inv: InvitationState, now: Date, emailVerified: boolean): RedeemCheck {
  if (!emailVerified) return { ok: false, reason: "unverified_email" };
  if (inv.revokedAt) return { ok: false, reason: "revoked" };
  if (inv.usedAt) return { ok: false, reason: "used" };
  if (inv.expiresAt.getTime() <= now.getTime()) return { ok: false, reason: "expired" };
  return { ok: true };
}

/** Expiry window an admin may choose: 1 hour to 30 days. No cap on how many invitations exist. */
export function clampExpiryHours(hours: number): number {
  if (!Number.isFinite(hours)) return 72;
  return Math.min(24 * 30, Math.max(1, Math.round(hours)));
}
