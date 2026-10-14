import { defineMcp } from "@lovable.dev/mcp-js";
import getProducts from "./tools/get-products";
import getPricing from "./tools/get-pricing";
import checkVehicleCoverage from "./tools/check-vehicle-coverage";
import getFeatures from "./tools/get-features";
import getSafetyRules from "./tools/get-safety-rules";
import explainTroubleCode from "./tools/explain-trouble-code";
import joinWaitlist from "./tools/join-waitlist";

export default defineMcp({
  name: "nanodrift-platform",
  title: "NanoDrift Platform",
  version: "0.1.0",
  instructions:
    "NanoDrift is an AI-powered universal vehicle diagnostic and tuning platform — 'Bridging the unbridgeable.' Install the adapter once and every new chip or mod auto-syncs; no shop, laptop or tuner knowledge needed. These tools return NanoDrift's product lineup, pricing, features, safety rules, vehicle coverage, general explanations of OBD-II trouble codes, and let people join the launch waitlist. They do not read live vehicle data: live diagnostics arrive once the NanoDrift device ships. All tunes are emissions-compliant; NanoDrift does not support removing or defeating emissions systems.",
  tools: [getProducts, getPricing, checkVehicleCoverage, getFeatures, getSafetyRules, explainTroubleCode, joinWaitlist],
});
