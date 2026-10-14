import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { DEVICE_NOTE, explainCode } from "@/lib/nanodrift-data";

export default defineTool({
  name: "explain_trouble_code",
  title: "Explain trouble code",
  description: "Give a plain-language general explanation of an OBD-II trouble code such as P0420.",
  inputSchema: { code: z.string().trim().min(2).max(10).describe("OBD-II code, e.g. P0420") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ code }) => {
    const r = explainCode(code);
    return {
      content: [{ type: "text", text: r.message }],
      structuredContent: { code: r.code, known: r.found, title: r.info?.title ?? null, meaning: r.info?.meaning ?? null, commonCauses: r.info ? [...r.info.causes] : [], note: DEVICE_NOTE },
    };
  },
});
