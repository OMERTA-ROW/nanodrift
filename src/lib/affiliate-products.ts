/** Amazon Associates tag — every affiliate link is built with this. */
export const AMAZON_TAG = "candymantech-20";

export function amazonUrl(query: string): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query).replace(/%20/g, "+")}&tag=${AMAZON_TAG}`;
}

export type AffiliateCategory = "Engine Oil" | "Diesel Treatments" | "Fuel/Engine Cleaners" | "Lubricants & Additives";

export const affiliateCategories: AffiliateCategory[] = ["Engine Oil", "Diesel Treatments", "Fuel/Engine Cleaners", "Lubricants & Additives"];

export type AffiliateProduct = { id: string; name: string; category: AffiliateCategory; benefit: string; query: string; fit: "Diesel" | "Gas" | "All" };

export const affiliateProducts: AffiliateProduct[] = [
  { id: "rotella-t6", name: "Shell Rotella T6 5W-40", category: "Engine Oil", fit: "Diesel", benefit: "Full synthetic heavy-duty oil built for diesel wear protection.", query: "Shell Rotella T6 5W-40" },
  { id: "mobil-1", name: "Mobil 1 Full Synthetic", category: "Engine Oil", fit: "Gas", benefit: "Everyday full synthetic protection for cars and light trucks.", query: "Mobil 1 Full Synthetic Motor Oil" },
  { id: "valvoline-syn", name: "Valvoline Full Synthetic", category: "Engine Oil", fit: "Gas", benefit: "Synthetic oil with strong deposit and wear resistance.", query: "Valvoline Full Synthetic Motor Oil" },
  { id: "howes", name: "Howes Diesel Treat", category: "Diesel Treatments", fit: "Diesel", benefit: "Anti-gel and conditioner for cold-weather diesel starts.", query: "Howes Diesel Treat" },
  { id: "hot-shots", name: "Hot Shot's Secret Diesel Extreme", category: "Diesel Treatments", fit: "Diesel", benefit: "Cleans injectors and boosts cetane in one bottle.", query: "Hot Shot's Secret Diesel Extreme" },
  { id: "power-service", name: "Power Service Diesel Kleen", category: "Diesel Treatments", fit: "Diesel", benefit: "Cetane boost and injector cleaning for smoother running.", query: "Power Service Diesel Kleen" },
  { id: "sea-foam", name: "Sea Foam Motor Treatment", category: "Fuel/Engine Cleaners", fit: "All", benefit: "Cleans fuel systems and stabilizes stored fuel.", query: "Sea Foam Motor Treatment" },
  { id: "techron", name: "Chevron Techron", category: "Fuel/Engine Cleaners", fit: "Gas", benefit: "Removes injector and intake valve deposits.", query: "Chevron Techron Complete Fuel System Cleaner" },
  { id: "lucas-fuel", name: "Lucas Fuel Treatment", category: "Fuel/Engine Cleaners", fit: "All", benefit: "Lubricates the upper cylinder and cleans fuel injectors.", query: "Lucas Fuel Treatment" },
  { id: "lucas-stabilizer", name: "Lucas Oil Stabilizer", category: "Lubricants & Additives", fit: "All", benefit: "Thickens oil film to quiet worn engines and cut oil burning.", query: "Lucas Oil Stabilizer" },
  { id: "stp", name: "STP Oil Treatment", category: "Lubricants & Additives", fit: "All", benefit: "Adds viscosity to reduce friction and engine wear.", query: "STP Oil Treatment" },
  { id: "wd40-specialist", name: "WD-40 Specialist", category: "Lubricants & Additives", fit: "All", benefit: "Purpose-built lubricants, degreasers, and penetrants.", query: "WD-40 Specialist" },
];
