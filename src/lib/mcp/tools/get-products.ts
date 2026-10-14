import { defineTool } from "@lovable.dev/mcp-js";
import { products } from "@/lib/catalog";

export default defineTool({
  name: "get_products",
  title: "Get adapters",
  description: "List the NanoDrift adapter lineup (OBD-II, J1939 heavy-duty, Marine, Aviation coming soon).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const list = products.map((p) => ({ id: p.id, name: p.name, for: p.audience, available: p.forSale, status: p.status ?? "Available for pre-order via waitlist", highlights: [...p.bullets] }));
    const text = list.map((p) => `• ${p.name} — ${p.for}. ${p.status}. ${p.highlights.join("; ")}.`).join("\n");
    return { content: [{ type: "text", text: `${text}\nAll adapters connect by USB-C to a phone or laptop. EVs are supported through software.` }], structuredContent: { products: list } };
  },
});
