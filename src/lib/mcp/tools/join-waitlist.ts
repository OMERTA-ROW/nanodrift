import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "join_waitlist",
  title: "Join waitlist",
  description: "Add a person to the NanoDrift launch waitlist with their name, email and vehicle.",
  inputSchema: {
    name: z.string().trim().min(1).max(100).describe("Full name"),
    email: z.string().trim().email().max(255).describe("Email address"),
    vehicle: z.string().trim().max(120).optional().describe("Vehicle, e.g. 2019 Ford F-150"),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ name, email, vehicle }) => {
    const { error } = await supabaseAnon().from("waitlist").insert({ name, email, vehicle: vehicle || null, source: "mcp" });
    if (error) {
      console.error("waitlist insert failed", error.message);
      throw new ToolError("Couldn't save the waitlist entry right now. Please try again.");
    }
    return { content: [{ type: "text", text: `${name} is on the NanoDrift waitlist. We'll email ${email} when it's ready to ship.` }], structuredContent: { joined: true } };
  },
});
