import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { checkCoverage } from "@/lib/nanodrift-data";

export default defineTool({
  name: "check_vehicle_coverage",
  title: "Check vehicle coverage",
  description: "Check whether a vehicle (make, model, year) is covered at launch or in a later rollout phase.",
  inputSchema: {
    make: z.string().trim().min(1).max(60).describe("Vehicle make, e.g. Ford"),
    model: z.string().trim().min(1).max(60).describe("Vehicle model, e.g. F-150"),
    year: z.number().int().min(1900).max(2100).describe("Model year, e.g. 2018"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ make, model, year }) => {
    const r = checkCoverage(make, model, year);
    return { content: [{ type: "text", text: r.message }], structuredContent: { make, model, year, supportedAtLaunch: r.supported, phase: r.phase, message: r.message } };
  },
});
