import { defineTool } from "@lovable.dev/mcp-js";
import { EMISSIONS_NOTE, safetyRules } from "@/lib/nanodrift-data";

export default defineTool({
  name: "get_safety_rules",
  title: "Get safety rules",
  description: "List the safety interlocks NanoDrift enforces before any change reaches the vehicle.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: `${safetyRules.map(([t, d], i) => `${i + 1}. ${t}: ${d}`).join("\n")}\n${EMISSIONS_NOTE}` }],
    structuredContent: { rules: safetyRules.map(([name, description]) => ({ name, description })), emissions: EMISSIONS_NOTE },
  }),
});
