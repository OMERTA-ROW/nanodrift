/** Site content shared by pages, the Pre-Diagnose view and the MCP connector. */

export type EngineArea = "ignition" | "fuel" | "air" | "exhaust" | "cooling" | "oil" | "transmission" | "electrical" | "evap";

export const features: [string, string][] = [
  ["Live animated systems", "Watch fuel, air, oil and coolant flow in real time across every system."],
  ["Live digital engine map", "Motor + transmission with live pressures and temps. Failing parts light up."],
  ["Interactive 3D hologram", "Rotate your vehicle and click to reveal ECUs and wiring."],
  ["Wiring diagnostics", "Trace opens, shorts and resistance faults down to the connector."],
  ["Sensor monitoring", "Sensor clogging, temperature and liquid pressure — flagged before they fail."],
  ["Radio, speaker & fuse checks", "Find the dead fuse or blown speaker without pulling a panel."],
  ["Power boost + safety governor", "More power, governed by live safety limits at every step."],
  ["Diablo Kit", "A library of legal, emissions-compliant tunes."],
  ["Auto-sync mods", "Install once. Every new chip or mod syncs automatically."],
  ["Truck regen", "Manual regen at a safe time, DEF diagnostics and derate management."],
  ["Ghost Security", "End-to-end encrypted and tamper-resistant from chip to cloud."],
  ["Vanishing Mode", "Wipe session data from the device and your account instantly."],
];

export const safetyRules: [string, string][] = [
  ["No flashing while moving", "Locks out at even 1 mph. The vehicle must be fully stopped."],
  ["Battery voltage check", "Flashing won't start unless voltage is stable and in range."],
  ["Engine-state rules", "Each operation requires the correct key and engine state."],
  ["Interrupt rollback", "If anything is interrupted, NanoDrift restores the last known-good map."],
  ["Confirmation gates", "Every write requires explicit, step-by-step confirmation."],
];

export const EMISSIONS_NOTE = "NanoDrift does not support removing or defeating emissions systems; all tunes are emissions-compliant.";
export const AGREEMENT_NOTE = "Max Power Unlock, Premium / Fleet and AI Force Regen / Derate Fix require a signed agreement before activation.";
export const DEVICE_NOTE = "Live readings and full diagnostics require the NanoDrift device, which ships soon.";

export const coveragePhases = [
  { phase: "Phase 1 · Launch", makes: ["Ford", "Chevy / GM", "Dodge / RAM", "Toyota"], live: true },
  { phase: "Phase 2", makes: ["Honda", "Nissan", "Jeep"], live: false },
  { phase: "Phase 3", makes: ["BMW", "Mercedes", "Boats", "EVs"], live: false },
];

const PHASE_MAKES: Record<1 | 2 | 3, string[]> = {
  1: ["ford", "lincoln", "chevy", "chevrolet", "gm", "gmc", "buick", "cadillac", "dodge", "ram", "chrysler", "toyota", "lexus"],
  2: ["honda", "acura", "nissan", "infiniti", "jeep"],
  3: ["bmw", "mini", "mercedes", "mercedes-benz", "tesla", "rivian", "lucid", "polestar", "boat", "marine", "mercury", "yamaha", "evinrude", "suzuki marine", "volvo penta"],
};

export interface CoverageResult {
  supported: boolean;
  phase: 1 | 2 | 3 | null;
  message: string;
}

export function checkCoverage(make: string, model: string, year: number): CoverageResult {
  const label = `${year} ${make} ${model}`.trim();
  if (!Number.isFinite(year) || year < 1996) {
    return { supported: false, phase: null, message: `${label}: model years before 1996 aren't supported. NanoDrift covers 1996 and newer.` };
  }
  const m = make.trim().toLowerCase();
  const isEv = /\b(ev|electric)\b/i.test(model);
  for (const p of [1, 2, 3] as const) {
    if (PHASE_MAKES[p].includes(m)) {
      const when = p === 1 ? "is covered at launch (Phase 1)" : `arrives in Phase ${p}`;
      const ev = isEv ? " EVs are supported through software in Phase 3." : "";
      return { supported: p === 1 && !isEv, phase: isEv ? 3 : p, message: `${label} ${when}.${ev}` };
    }
  }
  if (isEv) return { supported: false, phase: 3, message: `${label}: EVs are supported through software in Phase 3.` };
  return { supported: false, phase: null, message: `${label} isn't on the current roadmap yet. Join the waitlist and we'll tell you when it's added.` };
}

export interface CodeInfo { title: string; meaning: string; causes: string[]; area: EngineArea }

export const troubleCodes: Record<string, CodeInfo> = {
  P0420: { title: "Catalyst efficiency below threshold (Bank 1)", meaning: "The catalytic converter isn't cleaning exhaust as well as it should.", causes: ["Aging catalytic converter", "Faulty downstream O2 sensor", "Exhaust leak", "Engine misfire damaging the converter"], area: "exhaust" },
  P0430: { title: "Catalyst efficiency below threshold (Bank 2)", meaning: "Same as P0420, on the second bank of a V engine.", causes: ["Aging catalytic converter", "Faulty O2 sensor", "Exhaust leak"], area: "exhaust" },
  P0300: { title: "Random / multiple cylinder misfire", meaning: "More than one cylinder is misfiring.", causes: ["Worn spark plugs", "Weak ignition coils", "Vacuum leak", "Low fuel pressure"], area: "ignition" },
  P0301: { title: "Cylinder 1 misfire", meaning: "Cylinder 1 isn't firing properly.", causes: ["Spark plug", "Ignition coil", "Fuel injector"], area: "ignition" },
  P0302: { title: "Cylinder 2 misfire", meaning: "Cylinder 2 isn't firing properly.", causes: ["Spark plug", "Ignition coil", "Fuel injector"], area: "ignition" },
  P0303: { title: "Cylinder 3 misfire", meaning: "Cylinder 3 isn't firing properly.", causes: ["Spark plug", "Ignition coil", "Fuel injector"], area: "ignition" },
  P0304: { title: "Cylinder 4 misfire", meaning: "Cylinder 4 isn't firing properly.", causes: ["Spark plug", "Ignition coil", "Fuel injector"], area: "ignition" },
  P0171: { title: "System too lean (Bank 1)", meaning: "The engine is getting too much air or too little fuel.", causes: ["Vacuum leak", "Dirty mass airflow sensor", "Weak fuel pump", "Clogged fuel filter"], area: "air" },
  P0174: { title: "System too lean (Bank 2)", meaning: "Too much air or too little fuel on bank 2.", causes: ["Vacuum leak", "Dirty mass airflow sensor", "Low fuel pressure"], area: "air" },
  P0101: { title: "Mass airflow sensor range/performance", meaning: "The airflow sensor reading doesn't match what the engine expects.", causes: ["Dirty MAF sensor", "Air leak after the sensor", "Clogged air filter"], area: "air" },
  P0128: { title: "Coolant temperature below thermostat range", meaning: "The engine is taking too long to warm up.", causes: ["Thermostat stuck open", "Faulty coolant temp sensor"], area: "cooling" },
  P0217: { title: "Engine overheat condition", meaning: "The engine is running hotter than safe limits.", causes: ["Low coolant", "Failed water pump", "Stuck thermostat", "Cooling fan fault"], area: "cooling" },
  P0520: { title: "Oil pressure sensor circuit", meaning: "The oil pressure sensor signal is out of range.", causes: ["Faulty oil pressure sensor", "Wiring issue", "Low oil level"], area: "oil" },
  P0442: { title: "EVAP system small leak", meaning: "A small leak was found in the fuel vapor system.", causes: ["Loose or worn gas cap", "Cracked EVAP hose", "Purge valve leak"], area: "evap" },
  P0455: { title: "EVAP system large leak", meaning: "A large leak was found in the fuel vapor system.", causes: ["Missing or loose gas cap", "Disconnected EVAP hose"], area: "evap" },
  P0456: { title: "EVAP system very small leak", meaning: "A very small fuel vapor leak was detected.", causes: ["Gas cap seal", "Tiny hose crack"], area: "evap" },
  P0700: { title: "Transmission control system malfunction", meaning: "The transmission computer has stored its own fault.", causes: ["Transmission solenoid", "Low or old fluid", "Wiring issue"], area: "transmission" },
  P0730: { title: "Incorrect gear ratio", meaning: "The transmission isn't in the gear it was told to be in.", causes: ["Low fluid", "Worn clutches", "Shift solenoid"], area: "transmission" },
  P0562: { title: "System voltage low", meaning: "The electrical system voltage is lower than normal.", causes: ["Weak battery", "Failing alternator", "Corroded terminals"], area: "electrical" },
  P0087: { title: "Fuel rail pressure too low", meaning: "Fuel pressure is below what the engine needs.", causes: ["Weak fuel pump", "Clogged fuel filter", "Pressure regulator"], area: "fuel" },
  P0401: { title: "EGR flow insufficient", meaning: "Not enough exhaust gas is being recirculated.", causes: ["Clogged EGR passages", "Stuck EGR valve"], area: "exhaust" },
};

export function normalizeCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function explainCode(raw: string): { code: string; found: boolean; info?: CodeInfo; message: string } {
  const code = normalizeCode(raw);
  if (!/^[PBCU][0-9A-F]{4}$/.test(code)) {
    return { code, found: false, message: `"${raw}" doesn't look like an OBD-II code. Codes look like P0420: a letter (P, B, C or U) and four characters.` };
  }
  const info = troubleCodes[code];
  if (info) return { code, found: true, info, message: `${code} — ${info.title}. ${info.meaning} Common causes: ${info.causes.join(", ")}. ${DEVICE_NOTE}` };
  const system = { P: "powertrain (engine/transmission)", B: "body", C: "chassis", U: "network/communication" }[code[0] as "P"];
  return { code, found: false, message: `${code} is a ${system} code that isn't in our quick-reference list yet. ${DEVICE_NOTE}` };
}

const SYMPTOMS: { words: RegExp; area: EngineArea; causes: string[] }[] = [
  { words: /misfir|shak|rough|stumbl|jerk/i, area: "ignition", causes: ["Worn spark plugs", "Weak ignition coil", "Vacuum leak"] },
  { words: /overheat|hot|steam|temp/i, area: "cooling", causes: ["Low coolant", "Stuck thermostat", "Water pump or fan fault"] },
  { words: /oil|tick|knock/i, area: "oil", causes: ["Low oil level or pressure", "Worn lifters", "Oil pressure sensor"] },
  { words: /stall|hesitat|power|accelerat|sluggish/i, area: "fuel", causes: ["Clogged fuel filter", "Weak fuel pump", "Dirty throttle body"] },
  { words: /shift|slip|gear|transmission/i, area: "transmission", causes: ["Low or old transmission fluid", "Shift solenoid", "Worn clutch packs"] },
  { words: /battery|start|crank|dim|electr/i, area: "electrical", causes: ["Weak battery", "Failing alternator", "Corroded terminals"] },
  { words: /smell|exhaust|smoke|rattle/i, area: "exhaust", causes: ["Exhaust leak", "Failing catalytic converter", "Oil or coolant burning"] },
  { words: /fuel smell|gas cap|gas smell/i, area: "evap", causes: ["Loose gas cap", "Cracked EVAP hose"] },
  { words: /idle|whistl|hiss|air/i, area: "air", causes: ["Vacuum leak", "Dirty mass airflow sensor", "Clogged air filter"] },
];

export function matchSymptoms(text: string): { area: EngineArea; causes: string[] } | null {
  const hit = SYMPTOMS.find((s) => s.words.test(text));
  return hit ? { area: hit.area, causes: hit.causes } : null;
}

export const areaLabel: Record<EngineArea, string> = {
  ignition: "Ignition / cylinders", fuel: "Fuel system", air: "Air intake", exhaust: "Exhaust & catalyst",
  cooling: "Cooling system", oil: "Oil system", transmission: "Transmission", electrical: "Electrical / charging", evap: "Fuel vapor (EVAP)",
};
