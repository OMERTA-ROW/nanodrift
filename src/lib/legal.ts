export const legalDocs = [
  {
    slug: "terms",
    title: "Terms of Service",
    body: [
      "By using NanoDrift hardware or software you agree to operate it lawfully and only on vehicles you own or are authorized to modify.",
      "Each unlock (Max Power, Premium / Fleet, AI Force Regen / Derate Fix) is your own personal license, tied to a signed agreement, and is non-transferable.",
      "Subscriptions are billed yearly. Features may evolve as the platform is updated.",
    ],
  },
  {
    slug: "liability-waiver",
    title: "Liability Waiver",
    body: [
      "Modifying engine and transmission behavior carries inherent risk. You accept responsibility for how you use performance unlocks.",
      "NanoDrift safety gates (motion lockout, voltage checks, rollback) reduce but do not eliminate risk.",
      "A signed waiver is required before any performance or regen unlock is activated.",
    ],
  },
  {
    slug: "warranty-disclaimer",
    title: "Warranty Disclaimer",
    body: [
      "Performance tuning may affect your vehicle manufacturer's warranty. Check with your manufacturer before enabling unlocks.",
      "NanoDrift hardware is warranted against defects in materials and workmanship; software is provided as-is beyond what the law requires.",
    ],
  },
  {
    slug: "emissions-compliance",
    title: "Emissions Compliance",
    body: [
      "NanoDrift does not support removing or defeating emissions systems; all tunes are emissions-compliant.",
      "DEF, regen and derate tools exist to keep emissions systems healthy and working — never to bypass them.",
      "Any attempt to use NanoDrift for emissions tampering violates these terms and voids your license.",
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    body: [
      "Vehicle data is encrypted end-to-end by Ghost Security and stays under your control.",
      "Vanishing Mode lets you wipe session data from the device and your account at any time.",
      "We never sell your driving or vehicle data.",
    ],
  },
] as const;
