import { amazonUrl } from "@/lib/affiliate-products";
import type { EngineArea } from "@/lib/nanodrift-data";

/** Engine families the catalog is keyed by. Launch diesels first, then everyday gas. */
export type EngineFamily = "powerstroke" | "cummins" | "duramax" | "gas";

export const familyLabel: Record<EngineFamily, string> = {
  powerstroke: "Ford 6.7L Power Stroke (F-250/F-350 Super Duty)",
  cummins: "RAM 6.7L Cummins (2500/3500)",
  duramax: "Chevy/GMC 6.6L Duramax (2500HD/3500HD)",
  gas: "Everyday gas cars & light trucks",
};

export type ComponentId =
  | "head-gasket" | "injector" | "hpfp" | "fuel-filter" | "water-pump" | "thermostat" | "coolant-temp-sensor"
  | "turbo" | "glow-plug" | "oil-filter" | "nox-sensor" | "alternator" | "starter" | "belt" | "fuse" | "spark-plug" | "ignition-coil";

export const components: Record<ComponentId, { name: string; area: EngineArea }> = {
  "head-gasket": { name: "Head gasket", area: "cooling" },
  injector: { name: "Fuel injector", area: "fuel" },
  hpfp: { name: "High-pressure fuel pump", area: "fuel" },
  "fuel-filter": { name: "Fuel filter", area: "fuel" },
  "water-pump": { name: "Water pump", area: "cooling" },
  thermostat: { name: "Thermostat", area: "cooling" },
  "coolant-temp-sensor": { name: "Coolant temp sensor", area: "cooling" },
  turbo: { name: "Turbocharger", area: "air" },
  "glow-plug": { name: "Glow plugs", area: "ignition" },
  "oil-filter": { name: "Oil filter", area: "oil" },
  "nox-sensor": { name: "NOx / exhaust sensor", area: "exhaust" },
  alternator: { name: "Alternator", area: "electrical" },
  starter: { name: "Starter motor", area: "electrical" },
  belt: { name: "Serpentine belt", area: "electrical" },
  fuse: { name: "Fuses & relays", area: "electrical" },
  "spark-plug": { name: "Spark plugs", area: "ignition" },
  "ignition-coil": { name: "Ignition coil", area: "ignition" },
};

export type Part = { id: string; component: ComponentId; family: EngineFamily; brand: string; name: string; description: string; url: string };

type Row = [brand: string, name: string, description: string];
// Representative example parts. Each Amazon link is a search scoped to the part + engine, always tagged.
const seed: Partial<Record<ComponentId, Partial<Record<EngineFamily, Row[]>>>> = {
  "head-gasket": {
    powerstroke: [["Fel-Pro", "Head gasket set 6.7L Power Stroke", "Multi-layer steel set for both heads."]],
    cummins: [["Fel-Pro", "Head gasket 6.7L Cummins", "MLS gasket sized for the 6.7 Cummins inline-six."]],
    duramax: [["Fel-Pro", "Head gasket set 6.6L Duramax", "OE-style MLS gaskets for LML/L5P heads."]],
    gas: [["Fel-Pro", "Head gasket set", "Pick your engine size on the listing."]],
  },
  injector: {
    powerstroke: [["Bosch", "Fuel injector 6.7L Power Stroke", "Piezo common-rail injector, OE supplier."], ["Motorcraft", "Fuel injector 6.7L Power Stroke", "Ford OEM replacement injector."]],
    cummins: [["Bosch", "Fuel injector 6.7L Cummins", "Common-rail injector from the OE supplier."]],
    duramax: [["Bosch", "Fuel injector 6.6L Duramax", "Common-rail injector for LML/L5P."], ["ACDelco", "Fuel injector 6.6L Duramax", "GM OE replacement."]],
    gas: [["Bosch", "Fuel injector", "Direct-fit gas injector — match your engine."]],
  },
  hpfp: {
    powerstroke: [["Bosch", "CP4.2 high-pressure fuel pump 6.7L Power Stroke", "OE-supplier pump for the common rail."]],
    cummins: [["Bosch", "CP3 high-pressure fuel pump 6.7L Cummins", "Remanufactured CP3 pump."]],
    duramax: [["Bosch", "CP4 high-pressure fuel pump 6.6L Duramax", "OE-supplier pump for LML."]],
  },
  "fuel-filter": {
    powerstroke: [["Motorcraft", "FD4615 fuel filter kit 6.7L Power Stroke", "Upper and lower filters together."]],
    cummins: [["Mopar", "Fuel filter 6.7L Cummins", "OEM water-separating filter."]],
    duramax: [["ACDelco", "TP3018 fuel filter 6.6L Duramax", "OEM water-separating filter."]],
    gas: [["Wix", "Fuel filter", "Inline filter — check fitment on the listing."]],
  },
  "water-pump": {
    powerstroke: [["Motorcraft", "Water pump 6.7L Power Stroke", "Primary pump, OEM replacement."]],
    cummins: [["Gates", "Water pump 6.7L Cummins", "Engineered OE-equivalent pump."]],
    duramax: [["ACDelco", "Water pump 6.6L Duramax", "GM OE pump with gasket."]],
    gas: [["Gates", "Water pump", "OE-equivalent pump for gas engines."]],
  },
  thermostat: {
    powerstroke: [["Motorcraft", "Thermostat 6.7L Power Stroke", "OEM opening temperature."]],
    cummins: [["Stant", "Thermostat 6.7L Cummins", "OE-temperature thermostat and seal."]],
    duramax: [["ACDelco", "Thermostat kit 6.6L Duramax", "Dual thermostats with seals."]],
    gas: [["Stant", "Thermostat", "OE-temperature thermostat."]],
  },
  "coolant-temp-sensor": {
    powerstroke: [["Motorcraft", "Coolant temperature sensor 6.7L Power Stroke", "OEM sensor."]],
    cummins: [["Dorman", "Coolant temperature sensor 6.7L Cummins", "Direct-fit sensor."]],
    duramax: [["ACDelco", "Coolant temperature sensor 6.6L Duramax", "GM OE sensor."]],
    gas: [["Dorman", "Coolant temperature sensor", "Direct-fit sensor."]],
  },
  turbo: {
    powerstroke: [["Garrett", "Turbocharger 6.7L Power Stroke", "Stock-spec replacement turbo."]],
    cummins: [["Holset", "HE351VE turbocharger 6.7L Cummins", "OE variable-geometry turbo."]],
    duramax: [["Garrett", "Turbocharger 6.6L Duramax", "Stock-spec replacement turbo."]],
  },
  "glow-plug": {
    powerstroke: [["Motorcraft", "Glow plugs 6.7L Power Stroke (set of 8)", "OEM ceramic glow plugs."]],
    cummins: [["Mopar", "Grid heater 6.7L Cummins", "Cummins uses an intake grid heater instead of glow plugs."]],
    duramax: [["ACDelco", "Glow plugs 6.6L Duramax (set of 8)", "GM OE glow plugs."]],
  },
  "oil-filter": {
    powerstroke: [["Motorcraft", "FL2051S oil filter 6.7L Power Stroke", "OEM filter."]],
    cummins: [["Mopar", "Oil filter 6.7L Cummins", "OEM spin-on filter."]],
    duramax: [["ACDelco", "PF2232 oil filter 6.6L Duramax", "OEM filter."]],
    gas: [["Mobil 1", "Extended performance oil filter", "Choose your vehicle on the listing."]],
  },
  "nox-sensor": {
    powerstroke: [["Motorcraft", "NOx sensor 6.7L Power Stroke", "OEM emissions sensor — keeps the system compliant."]],
    cummins: [["Mopar", "NOx sensor 6.7L Cummins", "OEM emissions sensor — keeps the system compliant."]],
    duramax: [["ACDelco", "NOx sensor 6.6L Duramax", "OEM emissions sensor — keeps the system compliant."]],
    gas: [["Denso", "Oxygen sensor", "Direct-fit upstream/downstream O2 sensor."]],
  },
  alternator: {
    powerstroke: [["Motorcraft", "Alternator 6.7L Power Stroke", "OEM-output alternator."]],
    cummins: [["Denso", "Alternator 6.7L Cummins", "High-output OE-supplier alternator."]],
    duramax: [["ACDelco", "Alternator 6.6L Duramax", "GM OE alternator."]],
    gas: [["Denso", "Alternator", "OE-quality remanufactured alternator."]],
  },
  starter: {
    powerstroke: [["Motorcraft", "Starter 6.7L Power Stroke", "OEM starter."]],
    cummins: [["Denso", "Starter 6.7L Cummins", "OE-supplier starter."]],
    duramax: [["ACDelco", "Starter 6.6L Duramax", "GM OE starter."]],
    gas: [["Denso", "Starter", "OE-quality starter."]],
  },
  belt: {
    powerstroke: [["Gates", "Serpentine belt 6.7L Power Stroke", "EPDM belt, OE length."]],
    cummins: [["Gates", "Serpentine belt 6.7L Cummins", "EPDM belt, OE length."]],
    duramax: [["Gates", "Serpentine belt 6.6L Duramax", "EPDM belt, OE length."]],
    gas: [["Gates", "Serpentine belt", "Match the length to your engine."]],
  },
  fuse: {
    powerstroke: [["Bussmann", "Blade fuse assortment kit", "Mini, ATO and maxi fuses for the Super Duty panels."]],
    cummins: [["Bussmann", "Blade fuse assortment kit", "Covers RAM cab and TIPM fuses."]],
    duramax: [["Bussmann", "Blade fuse assortment kit", "Covers GM underhood and cab fuses."]],
    gas: [["Bussmann", "Blade fuse assortment kit", "Mini, ATO and maxi blade fuses."]],
  },
  "spark-plug": { gas: [["NGK", "Iridium spark plugs", "Long-life plugs — match your engine."], ["Denso", "Iridium TT spark plugs", "OE-quality iridium plugs."]] },
  "ignition-coil": { gas: [["Denso", "Ignition coil", "Direct-fit coil-on-plug."]] },
};

export const parts: Part[] = Object.entries(seed).flatMap(([component, byFam]) =>
  Object.entries(byFam!).flatMap(([family, rows]) =>
    rows!.map(([brand, name, description], i) => ({
      id: `${component}-${family}-${i}`,
      component: component as ComponentId,
      family: family as EngineFamily,
      brand, name, description,
      url: amazonUrl(`${brand} ${name}`),
    })),
  ),
);

/** Picks the engine family for a garage vehicle. */
export function familyFor(make: string, model: string): EngineFamily {
  const mk = make.toLowerCase(), md = model.toLowerCase();
  const hd = /(2500|3500|4500|f-?250|f-?350|f-?450|super ?duty|hd)/.test(md);
  if (mk.includes("ford") && hd) return "powerstroke";
  if ((mk.includes("ram") || mk.includes("dodge")) && hd) return "cummins";
  if ((mk.includes("chev") || mk.includes("gm")) && hd) return "duramax";
  return "gas";
}

export function findParts(opts: { component?: ComponentId | undefined; family?: EngineFamily | undefined }): Part[] {
  return parts.filter((p) => (!opts.component || p.component === opts.component) && (!opts.family || p.family === opts.family));
}

export function componentsForArea(area: EngineArea): ComponentId[] {
  return (Object.keys(components) as ComponentId[]).filter((c) => components[c].area === area);
}

/** Tappable parts in the 3D model that map to a buyable component. */
export const modelPartToComponent: Record<string, ComponentId> = {
  headgasket: "head-gasket", injectors: "injector", hpfp: "hpfp", waterpump: "water-pump", thermostat: "thermostat",
  cts: "coolant-temp-sensor", turbo: "turbo", glowplugs: "glow-plug", oilfilter: "oil-filter", sensors: "nox-sensor",
  o2sensor: "nox-sensor", sparkplugs: "spark-plug", alternator: "alternator", starter: "starter", belts: "belt", fusecab: "fuse", fusepdm: "fuse", fusechassis: "fuse",
};
