import { legalDocs } from "@/lib/legal";

/**
 * In-app premium unlocks. Never import this into public pages or the MCP connector —
 * these tiers are only shown to signed-in users inside My Garage.
 */
export type TierId = "tier-1" | "tier-2" | "tier-3";

export type PremiumTier = { id: TierId; name: string; pricePerYear: number; capability: string };

export const premiumTiers: PremiumTier[] = [
  { id: "tier-1", name: "Power Tier I", pricePerYear: 500, capability: "Expanded emissions-compliant power tunes with the safety governor active." },
  { id: "tier-2", name: "Power Tier II", pricePerYear: 1000, capability: "Advanced tuning maps and towing/regen profiles, all emissions-compliant, with the safety governor active." },
  { id: "tier-3", name: "Power Tier III", pricePerYear: 2000, capability: "Full performance suite with custom map adjustments inside safe, emissions-compliant limits." },
];

/** Bump when the agreement wording changes; users then sign the new version. */
export const AGREEMENT_VERSION = "2026-10-v1";

const pick = (slug: string) => legalDocs.find((d) => d.slug === slug)!;

export function agreementFor(tier: PremiumTier) {
  return {
    title: `${tier.name} mini-license`,
    sections: [
      { title: "What this unlocks", body: [tier.capability, "This is a personal, non-transferable mini-license tied to your account and this signed agreement."] },
      ...["terms", "liability-waiver", "warranty-disclaimer", "emissions-compliance"].map(pick).filter(Boolean).map((d) => ({ title: d.title, body: d.body })),
    ],
  };
}

export type UnlockState = "locked" | "signed" | "unlocked";

/** An unlock needs BOTH a signed agreement and a matching active subscription. */
export function unlockState(tier: TierId, signedTiers: string[], sub: { plan_id: string; status: string } | null | undefined): UnlockState {
  if (!signedTiers.includes(tier)) return "locked";
  return sub?.plan_id === tier && sub.status === "active" ? "unlocked" : "signed";
}
