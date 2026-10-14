import { defineTool } from "@lovable.dev/mcp-js";
import { features } from "@/lib/nanodrift-data";

export default defineTool({
  name: "get_features",
  title: "Get features",
  description: "List NanoDrift platform features.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: features.map(([t, d]) => `• ${t}: ${d}`).join("\n") }],
    structuredContent: { features: features.map(([name, description]) => ({ name, description })) },
  }),
});
