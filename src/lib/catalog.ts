export type AdapterKind = "obd" | "j1939" | "marine" | "aviation";

export interface Product {
  id: AdapterKind;
  name: string;
  short: string;
  audience: string;
  forSale: boolean;
  status?: string;
  bullets: string[];
}

export const products: Product[] = [
  {
    id: "obd",
    name: "NanoDrift OBD-II Adapter",
    short: "OBD-II",
    audience: "Cars & light trucks (1996+)",
    forSale: true,
    bullets: ["Standard 16-pin OBD-II", "USB-C to phone or laptop", "EVs supported through software"],
  },
  {
    id: "j1939",
    name: "NanoDrift J1939 Heavy-Duty Adapter",
    short: "J1939",
    audience: "Diesel trucks — Powerstroke, Cummins, Duramax",
    forSale: true,
    bullets: ["9-pin Deutsch J1939", "DEF, regen & derate tooling", "Fleet-grade USB-C link"],
  },
  {
    id: "marine",
    name: "NanoDrift Marine Adapter",
    short: "Marine",
    audience: "Boats & marine engines",
    forSale: true,
    bullets: ["Sealed, corrosion-resistant", "NMEA-ready engine data", "USB-C to phone or laptop"],
  },
  {
    id: "aviation",
    name: "NanoDrift Aviation Adapter",
    short: "Aviation",
    audience: "Aircraft",
    forSale: false,
    status: "Coming soon — in development",
    bullets: ["In development", "Not for sale", "Join the waitlist for updates"],
  },
];

export interface Plan {
  id: string;
  name: string;
  pricePerYear: number | null;
  blurb: string;
  features: string[];
  agreement: boolean;
}

export interface Kit {
  id: string;
  name: string;
  price: number;
  blurb: string;
  includes: string[];
}

/** Hardware kits — the main public offer. */
export const kits: Kit[] = [
  { id: "standard-kit", name: "NanoDrift Standard Kit", price: 149, blurb: "Cars & light trucks (1996+).", includes: ["NanoDrift core device", "16-pin OBD-II adapter", "USB-C to phone or laptop"] },
  { id: "heavy-duty-kit", name: "NanoDrift Heavy-Duty Kit", price: 199, blurb: "Heavy-duty & big-rig trucks.", includes: ["NanoDrift core device", "9-pin Deutsch (J1939) adapter", "USB-C to phone or laptop"] },
  { id: "pro-kit", name: "NanoDrift Pro Kit", price: 249, blurb: "Cars, light trucks and heavy-duty — one kit.", includes: ["NanoDrift core device", "16-pin OBD-II adapter", "9-pin Deutsch (J1939) adapter"] },
];

/** The only publicly shown subscription. Id stays "core" to match stored subscriptions. */
export const plans: Plan[] = [
  {
    id: "core",
    name: "Standard",
    pricePerYear: 99,
    blurb: "The foundation every NanoDrift runs on.",
    features: ["Full diagnostics", "Live engine map", "Vehicle health score", "Maintenance alerts", "AI agent"],
    agreement: false,
  },
];

export const formatPrice = (p: number | null) => (p === null ? "Subscription" : `$${p.toLocaleString("en-US")}/yr`);
export const formatKitPrice = (p: number) => `$${p.toLocaleString("en-US")}`;
