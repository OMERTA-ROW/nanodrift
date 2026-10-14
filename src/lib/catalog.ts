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

export const plans: Plan[] = [
  {
    id: "core",
    name: "Core",
    pricePerYear: null,
    blurb: "The foundation every NanoDrift runs on.",
    features: ["Full diagnostics", "Live engine map", "Vehicle health score", "Maintenance alerts", "AI agent"],
    agreement: false,
  },
  {
    id: "max-power",
    name: "Max Power Unlock",
    pricePerYear: 500,
    blurb: "Safety-governed performance gains.",
    features: ["Power boost with safety governor", "Diablo Kit legal tunes", "Auto-sync on new mods", "Signed agreement required"],
    agreement: true,
  },
  {
    id: "fleet",
    name: "Premium / Fleet",
    pricePerYear: 1000,
    blurb: "Fleet-grade heavy-duty suite.",
    features: ["DEF system diagnostics", "Derate management", "Manual regen at a safe time", "Fleet-grade suite"],
    agreement: true,
  },
  {
    id: "force-regen",
    name: "AI Force Regen / Derate Fix",
    pricePerYear: 2000,
    blurb: "The agent handles regen and derate for you.",
    features: ["AI-driven forced regen", "Derate resolution", "Safety-gated execution", "Signed agreement required"],
    agreement: true,
  },
];

export const formatPrice = (p: number | null) => (p === null ? "Subscription" : `$${p.toLocaleString("en-US")}/yr`);
