import { defineTool } from "@lovable.dev/mcp-js";
import { formatPrice, plans } from "@/lib/catalog";
import { AGREEMENT_NOTE, EMISSIONS_NOTE } from "@/lib/nanodrift-data";

export default defineTool({
  name: "get_pricing",
  title: "Get pricing",
  description: "List NanoDrift subscription plans with yearly prices and which ones require a signed agreement.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const list = plans.map((p) => ({ id: p.id, name: p.name, price: formatPrice(p.pricePerYear), pricePerYearUsd: p.pricePerYear, summary: p.blurb, features: [...p.features], signedAgreementRequired: p.agreement }));
    const text = list.map((p) => `• ${p.name}: ${p.price} — ${p.summary}${p.signedAgreementRequired ? " (signed agreement required)" : ""}`).join("\n");
    return { content: [{ type: "text", text: `${text}\n${AGREEMENT_NOTE}\n${EMISSIONS_NOTE}` }], structuredContent: { plans: list, agreementNote: AGREEMENT_NOTE } };
  },
});
