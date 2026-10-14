import { defineTool } from "@lovable.dev/mcp-js";
import { formatKitPrice, formatPrice, kits, plans } from "@/lib/catalog";
import { EMISSIONS_NOTE } from "@/lib/nanodrift-data";

export default defineTool({
  name: "get_pricing",
  title: "Get pricing",
  description: "List NanoDrift hardware kits with prices and the Standard yearly subscription.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const kitList = kits.map((k) => ({ id: k.id, name: k.name, price: formatKitPrice(k.price), priceUsd: k.price, summary: k.blurb, includes: [...k.includes] }));
    const list = plans.map((p) => ({ id: p.id, name: p.name, price: formatPrice(p.pricePerYear), pricePerYearUsd: p.pricePerYear, summary: p.blurb, features: [...p.features] }));
    const text = [...kitList.map((k) => `• ${k.name}: ${k.price} — ${k.includes.join(", ")}`), ...list.map((p) => `• ${p.name} subscription: ${p.price} — ${p.features.join(", ")}`)].join("\n");
    return { content: [{ type: "text", text: `${text}\n${EMISSIONS_NOTE}` }], structuredContent: { kits: kitList, plans: list } };
  },
});
