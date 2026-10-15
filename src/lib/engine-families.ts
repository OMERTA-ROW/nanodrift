/**
 * Representative engine families for the 3D teardown viewer.
 * These are generic layouts (cylinder count, bank arrangement, fuel type) — NOT
 * exact models of any manufacturer's engine. The viewer labels them that way.
 */
export type EngineFamilyId = "bigrig-i6-diesel" | "hd-v8-diesel" | "hd-i6-diesel" | "gas-v8" | "gas-v6" | "gas-i4";

export type EngineFamilyDef = {
  id: EngineFamilyId;
  label: string;
  examples: string;
  cylinders: number;
  layout: "inline" | "v";
  fuel: "diesel" | "gas";
  turbo: boolean;
};

export const ENGINE_FAMILIES: EngineFamilyDef[] = [
  { id: "bigrig-i6-diesel", label: "Big-rig inline-6 diesel", examples: "Class 8 highway tractors", cylinders: 6, layout: "inline", fuel: "diesel", turbo: true },
  { id: "hd-v8-diesel", label: "Heavy-duty V8 diesel", examples: "HD pickups (e.g. 2500/3500 class)", cylinders: 8, layout: "v", fuel: "diesel", turbo: true },
  { id: "hd-i6-diesel", label: "Heavy-duty inline-6 diesel", examples: "HD pickups with straight-six diesels", cylinders: 6, layout: "inline", fuel: "diesel", turbo: true },
  { id: "gas-v8", label: "Gas V8", examples: "Full-size trucks & SUVs", cylinders: 8, layout: "v", fuel: "gas", turbo: false },
  { id: "gas-v6", label: "Gas V6", examples: "Mid-size trucks, SUVs & sedans", cylinders: 6, layout: "v", fuel: "gas", turbo: false },
  { id: "gas-i4", label: "Gas inline-4", examples: "Compact & mid-size cars", cylinders: 4, layout: "inline", fuel: "gas", turbo: false },
];

export function getEngineFamily(id: EngineFamilyId): EngineFamilyDef {
  return ENGINE_FAMILIES.find((f) => f.id === id) ?? ENGINE_FAMILIES[0]!;
}

/** Cylinder centres (x along the crank, z across the banks) for the viewer, centred on the block. */
export function cylinderLayout(f: EngineFamilyDef, centerX = 3.1, span = 1.0): { x: number; z: number }[] {
  const perBank = f.layout === "v" ? f.cylinders / 2 : f.cylinders;
  const step = perBank > 1 ? span / (perBank - 1) : 0;
  const xs = Array.from({ length: perBank }, (_, i) => centerX - span / 2 + i * step);
  if (f.layout === "inline") return xs.map((x) => ({ x, z: 0 }));
  // V: banks staggered slightly along the crank, as on real V engines.
  return xs.flatMap((x) => [{ x, z: -0.14 }, { x: x + step * 0.3, z: 0.14 }]);
}
