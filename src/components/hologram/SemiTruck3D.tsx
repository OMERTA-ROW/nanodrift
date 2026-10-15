import { modelPartToComponent } from "@/lib/parts-catalog";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { AdaptiveDpr, ContactShadows, Environment, Lightformer, MeshReflectorMaterial, OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, N8AO, SMAA, Vignette } from "@react-three/postprocessing";
import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { SAMPLE_LOG, SENSORS, readCodes, readSensors, type SensorKey } from "@/lib/vehicle-health";
import { explainCode } from "@/lib/nanodrift-data";
import { OilRiskPanel } from "@/components/OilRiskPanel";
import { ENGINE_FAMILIES, cylinderLayout, getEngineFamily, type EngineFamilyDef, type EngineFamilyId } from "@/lib/engine-families";

// Brand palette for WebGL (cannot read CSS tokens).
const PURPLE = "#a855f7";
const PURPLE_DEEP = "#6d28d9";
const GOLD = "#d4a72c";
const COOLANT = "#c084fc";

type Status = "ok" | "watch" | "fault";
type PartInfo = { name: string; layer: number; what: string; status: Status; note: string };

export const LAYERS = ["Body shell", "Frame / chassis", "Engine + drivetrain", "Wiring + sensors", "Fluid lines"];

export const PARTS: Record<string, PartInfo> = {
  hood: { name: "Long-nose hood", layer: 0, what: "Tilting fiberglass hood covering the engine bay.", status: "ok", note: "No body faults reported." },
  cab: { name: "Day cab", layer: 0, what: "Driver cab with dash, controls and door panels.", status: "ok", note: "Door switches and cab lighting normal." },
  sleeper: { name: "Sleeper", layer: 0, what: "Rear sleeper compartment behind the cab.", status: "ok", note: "Sleeper HVAC circuit normal." },
  grille: { name: "Grille & bumper", layer: 0, what: "Chrome front grille and steel bumper.", status: "ok", note: "Front airflow unobstructed." },
  stacks: { name: "Exhaust stacks", layer: 0, what: "Twin vertical exhaust outlets behind the cab.", status: "ok", note: "Exhaust back-pressure within range." },
  frame: { name: "Frame rails", layer: 1, what: "Twin steel ladder rails carrying every load on the truck.", status: "ok", note: "No crossmember alerts." },
  fifth: { name: "Fifth wheel", layer: 1, what: "Coupling plate that locks onto the trailer kingpin.", status: "ok", note: "Lock sensor reports engaged." },
  wheels: { name: "Wheels & tires", layer: 1, what: "Steer tires up front, dual tires on both drive axles.", status: "watch", note: "Sample: rear-left outer tire 8 psi below its pair." },
  steer: { name: "Steer axle", layer: 1, what: "Front axle beam with steering knuckles.", status: "ok", note: "Alignment within spec." },
  block: { name: "Cylinder block & cylinders", layer: 2, what: "Main casting of the engine — holds the cylinder bores the pistons ride in.", status: "ok", note: "Compression balance even across all cylinders (sample)." },
  pistons: { name: "Pistons & connecting rods", layer: 2, what: "Pistons take the force of combustion; rods pass it down to the crankshaft.", status: "ok", note: "No blow-by trend detected." },
  crankshaft: { name: "Crankshaft", layer: 2, what: "Turns the pistons' up-and-down motion into rotation.", status: "ok", note: "Crank speed steady, no misfire pattern." },
  camshaft: { name: "Camshaft", layer: 2, what: "Spinning shaft whose lobes open the valves in time with the pistons.", status: "ok", note: "Cam/crank timing in sync." },
  valvetrain: { name: "Valvetrain (valves, lifters, rockers)", layer: 2, what: "Lifters and rocker arms push the intake and exhaust valves open and closed.", status: "watch", note: "Sample: slight valve-lash noise on cylinder 2 — check at next service." },
  head: { name: "Cylinder head", layer: 2, what: "Caps the cylinders and houses the valves, ports and injectors.", status: "ok", note: "Head temperature normal." },
  headgasket: { name: "Head gasket", layer: 2, what: "Seals the head to the block so compression, oil and coolant stay apart.", status: "ok", note: "No coolant loss or combustion gas in coolant." },
  intake: { name: "Intake manifold", layer: 2, what: "Spreads boosted air evenly to each cylinder.", status: "ok", note: "Intake air temp normal." },
  exhaust: { name: "Exhaust manifold", layer: 2, what: "Collects hot exhaust from each cylinder and feeds the turbo.", status: "ok", note: "Exhaust temps even across cylinders." },
  turbo: { name: "Turbocharger", layer: 2, what: "Uses exhaust flow to pack more air into the engine.", status: "ok", note: "Boost pressure normal." },
  intercooler: { name: "Intercooler", layer: 2, what: "Cools the hot boosted air before it enters the engine.", status: "ok", note: "Charge-air temp drop normal." },
  injectors: { name: "Fuel injectors (x6)", layer: 2, what: "Spray precisely timed fuel into each cylinder.", status: "watch", note: "Sample: cylinder 4 balance rate slightly high — keep an eye on it." },
  hpfp: { name: "High-pressure fuel pump", layer: 2, what: "Pressurises diesel for the common-rail injectors.", status: "ok", note: "Rail pressure tracking target." },
  sparkplugs: { name: "Spark plugs", layer: 2, what: "Fire the air-fuel mix in each cylinder of a gas engine.", status: "ok", note: "No misfire pattern (sample)." },
  glowplugs: { name: "Glow plugs (x6)", layer: 2, what: "Heat each cylinder for easy cold starts.", status: "fault", note: "Sample: glow plug 5 open circuit — harder cold starts." },
  oilpan: { name: "Oil pan", layer: 2, what: "Reservoir under the engine holding the oil supply.", status: "ok", note: "Oil level within range." },
  oilpump: { name: "Oil pump", layer: 2, what: "Pushes oil through the engine to every bearing.", status: "ok", note: "Pump output normal." },
  oilfilter: { name: "Oil filter", layer: 2, what: "Catches dirt and metal before oil reaches the bearings.", status: "watch", note: "Sample: filter restriction rising — due at next oil change." },
  waterpump: { name: "Water pump", layer: 2, what: "Belt-driven pump that circulates coolant.", status: "ok", note: "Coolant flow normal." },
  thermostat: { name: "Thermostat", layer: 2, what: "Valve that holds the engine at operating temperature.", status: "ok", note: "Opens at spec temperature." },
  coolantpass: { name: "Coolant passages", layer: 2, what: "Channels cast through the block and head that carry coolant around the cylinders.", status: "ok", note: "No hot spots detected." },
  belts: { name: "Belts & pulleys", layer: 2, what: "Serpentine belt and pulleys that drive the fan, water pump and alternator.", status: "ok", note: "Belt tension normal." },
  alternator: { name: "Alternator", layer: 2, what: "Charges the batteries and powers electronics while running.", status: "ok", note: "Charging at 14.1 V." },
  starter: { name: "Starter motor", layer: 2, what: "Electric motor that cranks the engine to start it.", status: "ok", note: "Cranking speed normal." },
  radiator: { name: "Radiator", layer: 2, what: "Sheds engine heat from the coolant into the air.", status: "ok", note: "Coolant delta-T normal." },
  fan: { name: "Cooling fan", layer: 2, what: "Clutched fan that pulls air through the radiator.", status: "ok", note: "Fan clutch engaging on demand." },
  transmission: { name: "Transmission", layer: 2, what: "18-speed gearbox turning engine power into road speed.", status: "ok", note: "Shift timing and fluid temp normal." },
  driveshaft: { name: "Drive shaft", layer: 2, what: "Spinning shaft carrying torque back to the drive axles.", status: "ok", note: "No vibration detected." },
  drivetrain: { name: "Tandem drive axles", layer: 2, what: "Two differentials and axles that drive the rear wheels.", status: "ok", note: "Inter-axle differential normal." },
  ecm: { name: "Engine ECM", layer: 3, what: "Engine computer that runs fuel, timing and boost.", status: "ok", note: "No active trouble codes." },
  harness: { name: "Main wiring harness", layer: 3, what: "Routes power and data from the cab to every module and light.", status: "ok", note: "No opens or shorts found." },
  sensors: { name: "Chassis sensors", layer: 3, what: "Wheel-speed, pressure and aftertreatment sensors around the chassis.", status: "fault", note: "Sample: NOx sensor reading erratic — check connector." },
  o2sensor: { name: "Exhaust / O2 sensor", layer: 3, what: "Reads oxygen left in the exhaust to fine-tune fueling.", status: "ok", note: "Switching normally." },
  maf: { name: "MAF sensor", layer: 3, what: "Measures how much air enters the engine.", status: "ok", note: "Airflow matches boost." },
  cts: { name: "Coolant temp sensor", layer: 3, what: "Tells the ECM how hot the engine is running.", status: "ok", note: "Reading 192°F (sample)." },
  ops: { name: "Oil pressure sensor", layer: 3, what: "Watches oil pressure so the engine is never starved.", status: "ok", note: "45 psi at idle (sample)." },
  ckp: { name: "Crankshaft position sensor", layer: 3, what: "Tracks crank rotation for injection timing.", status: "ok", note: "Signal clean." },
  cmp: { name: "Camshaft position sensor", layer: 3, what: "Tells the ECM which stroke each cylinder is on.", status: "ok", note: "In sync with crank." },
  fusecab: { name: "Cab fuse panel", layer: 3, what: "Dash-side fuses and relays for lights, radio, HVAC and cab accessories.", status: "fault", note: "Sample: 15A radio/accessory fuse blown — shown in red." },
  fusepdm: { name: "Engine-bay power distribution box", layer: 3, what: "High-current fuses and relays for the ECM, fan clutch, starter and glow plugs.", status: "ok", note: "All circuits powered." },
  fusechassis: { name: "Chassis fuse & relay box", layer: 3, what: "Maxi-fuses next to the batteries feeding trailer, lights and the main harness.", status: "ok", note: "Voltage drop normal." },
  batteries: { name: "Battery box", layer: 3, what: "Four 12V batteries powering starting and electronics.", status: "ok", note: "12.7 V resting — healthy." },
  radio: { name: "Radio head unit", layer: 3, what: "Dash radio and audio amplifier.", status: "ok", note: "Powered, signal normal." },
  speakers: { name: "Speakers", layer: 3, what: "Door and sleeper speakers.", status: "watch", note: "Sample: right sleeper speaker impedance high — possible blown cone." },
  audiowire: { name: "Audio wiring", layer: 3, what: "Speaker and power leads from the radio through the cab.", status: "ok", note: "Continuity good." },
  fueltanks: { name: "Fuel tanks", layer: 4, what: "Twin saddle tanks holding diesel.", status: "ok", note: "Fuel level sender normal." },
  fuelline: { name: "Fuel lines", layer: 4, what: "Supply lines from the tanks to the injectors.", status: "ok", note: "Supply pressure normal." },
  coolant: { name: "Coolant hoses", layer: 4, what: "Upper and lower hoses circulating coolant.", status: "ok", note: "Flow normal." },
  oil: { name: "Oil cooler lines", layer: 4, what: "Carry engine oil to the cooler and back.", status: "ok", note: "Oil temp normal." },
  def: { name: "DEF tank & line", layer: 4, what: "Diesel exhaust fluid for the emissions system.", status: "ok", note: "DEF quality good, level 70%." },
  air: { name: "Air brake lines", layer: 4, what: "Compressed air lines feeding the brakes.", status: "ok", note: "System pressure 120 psi." },
};

/** Which supported sensor readings relate to each tappable part (callout links). */
const PART_SENSORS: Partial<Record<string, SensorKey[]>> = {
  ops: ["oil_pressure_psi"], oilpan: ["oil_pressure_psi", "oil_temp_f"], oilpump: ["oil_pressure_psi"], oilfilter: ["oil_pressure_psi", "oil_temp_f"], oil: ["oil_temp_f", "oil_pressure_psi"],
  block: ["oil_pressure_psi", "coolant_temp_f"], crankshaft: ["oil_pressure_psi"], camshaft: ["oil_pressure_psi"], valvetrain: ["oil_pressure_psi"],
  cts: ["coolant_temp_f"], thermostat: ["coolant_temp_f"], waterpump: ["coolant_pressure_psi", "coolant_temp_f"], coolant: ["coolant_temp_f", "coolant_pressure_psi"], coolantpass: ["coolant_temp_f"], radiator: ["coolant_temp_f"], headgasket: ["coolant_temp_f", "coolant_pressure_psi"],
  turbo: ["boost_psi"], intercooler: ["boost_psi"], intake: ["boost_psi"], hpfp: ["fuel_pressure_psi"], fuelline: ["fuel_pressure_psi"], injectors: ["fuel_pressure_psi"],
  alternator: ["battery_v"], batteries: ["battery_v"], starter: ["battery_v"], transmission: ["trans_temp_f"],
};
const OIL_PARTS = new Set(["ops", "oilpan", "oilpump", "oilfilter", "oil", "crankshaft", "camshaft", "valvetrain"]);

/** Clearly-labelled simulation of restricted oil flow — illustrative only, not measured. */
function OilSim() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (ref.current) ref.current.children.forEach((c, i) => { c.scale.setScalar(0.6 + 0.4 * Math.abs(Math.sin(clock.elapsedTime * 0.6 + i))); }); });
  return (
    <group>
      <Tube id="oilpump" color="#d4a72c" r={0.018} flow={0.35} pts={[[3.6, 1.18, 0.15], [3.6, 1.3, 0.25], [3.1, 1.32, 0.26], [2.6, 1.3, 0.25], [2.6, 1.6, 0.25], [3.1, 1.95, 0.2]]} />
      <group ref={ref}>
        {[[2.8, 1.06, 0.1], [3.2, 1.06, -0.12], [3.45, 1.06, 0.05], [3.0, 1.98, 0.15]].map((p, i) => (
          <mesh key={i} position={p as V3} raycast={() => null}><sphereGeometry args={[0.05, 12, 12]} /><meshStandardMaterial color="#3a2a12" emissive="#d4a72c" emissiveIntensity={0.4} roughness={0.9} /></mesh>
        ))}
      </group>
    </group>
  );
}

type Ctx = { oilSim: boolean; sel: string | null; setSel: (s: string | null) => void; hover: string | null; setHover: (s: string | null) => void; peel: number; explode: number; motor: number };
const SceneCtx = createContext<Ctx>(null!);
const LayerCtx = createContext<{ ghost: boolean }>({ ghost: false });

type V3 = [number, number, number];
type PProps = { id: string; position?: V3; rotation?: V3; color?: string; metal?: number; rough?: number; emissive?: string; glow?: number; children: ReactNode };

let grainTex: THREE.CanvasTexture | null = null;
/** Shared fine surface grain (cast metal / rubber texture) used as a subtle bump + roughness variation. */
function grain() {
  if (grainTex) return grainTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const img = g.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 150 + Math.random() * 105;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  grainTex = new THREE.CanvasTexture(c);
  grainTex.wrapS = grainTex.wrapT = THREE.RepeatWrapping;
  grainTex.repeat.set(4, 4);
  return grainTex;
}

/** Splits parts into paint / chrome / cast metal / rubber / plastic so each reads as a different real surface. */
function surfaceFor(color: string, metal: number, rough: number): Partial<THREE.MeshPhysicalMaterialParameters> {
  if (color === PAINT) return { metalness: 0.35, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.05 };
  if (metal < 0.15 && rough >= 0.8) return { metalness: 0, roughness: 0.92, sheen: 0.4, sheenRoughness: 0.8, sheenColor: new THREE.Color("#3a3340"), bumpMap: grain(), bumpScale: 0.6 };
  if (metal >= 0.9 && rough <= 0.2) return { metalness: 1, roughness: Math.max(rough, 0.08), clearcoat: 0.3, clearcoatRoughness: 0.1 };
  if (metal >= 0.5) return { metalness: metal, roughness: Math.min(1, rough + 0.08), roughnessMap: grain(), bumpMap: grain(), bumpScale: 0.25 };
  return { metalness: Math.min(metal, 0.1), roughness: Math.max(rough, 0.45), clearcoat: 0.15, clearcoatRoughness: 0.4 };
}

/** One clickable piece of a named part. */
function P({ id, position = [0, 0, 0], rotation = [0, 0, 0], color = "#1a1520", metal = 0.6, rough = 0.4, emissive = "#000000", glow = 0, children }: PProps) {
  const { sel, setSel, hover, setHover } = useContext(SceneCtx);
  const { ghost } = useContext(LayerCtx);
  const isSel = sel === id;
  const isHover = hover === id;
  const click = (e: ThreeEvent<MouseEvent>) => { if (ghost || e.delta > 6) return; e.stopPropagation(); setSel(isSel ? null : id); };
  return (
    <mesh
      position={position}
      rotation={rotation}
      castShadow={!ghost}
      onClick={click}
      onPointerOver={(e) => { if (ghost) return; e.stopPropagation(); setHover(id); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHover(null); document.body.style.cursor = ""; }}
      {...(ghost ? { raycast: () => null } : {})}
    >
      {children}
      <meshPhysicalMaterial
        color={color}
        {...surfaceFor(color, metal, rough)}
        emissive={isSel ? GOLD : isHover ? PURPLE : emissive}
        emissiveIntensity={isSel ? 1.4 : isHover ? 0.8 : glow}
        transparent={ghost}
        opacity={ghost ? 0.06 : 1}
        depthWrite={!ghost}
      />

    </mesh>
  );
}

function Layer({ i, children }: { i: number; children: ReactNode }) {
  const { peel, explode } = useContext(SceneCtx);
  const ref = useRef<THREE.Group>(null);
  const ghost = peel > i;
  useFrame((_, d) => {
    if (!ref.current) return;
    const target = explode * (4 - i) * 1.3 + (ghost ? 2.5 : 0);
    ref.current.position.y += (target - ref.current.position.y) * (1 - Math.exp(-6 * Math.min(d, 0.05)));
  });
  return (
    <LayerCtx.Provider value={{ ghost }}>
      <group ref={ref}>{children}</group>
    </LayerCtx.Provider>
  );
}

function flowTexture(color: string) {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 8;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 128, 0);
  grad.addColorStop(0, "rgba(255,255,255,0)");
  grad.addColorStop(0.7, color);
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad; g.fillRect(0, 0, 128, 8);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(8, 1);
  return t;
}

function Tube({ id, pts, color, r = 0.03, flow = 0 }: { id: string; pts: V3[]; color: string; r?: number; flow?: number }) {
  const { ghost } = useContext(LayerCtx);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), [pts]);
  const tex = useMemo(() => (flow ? flowTexture(color) : null), [color, flow]);
  const geo = useMemo(() => new THREE.TubeGeometry(curve, 80, r * 1.25, 8, false), [curve, r]);
  useFrame((_, d) => { if (tex) tex.offset.x -= Math.min(d, 0.05) * flow; });
  return (
    <>
      <P id={id} color="#140f1a" emissive={color} glow={0.5} metal={0.2} rough={0.5}>
        <tubeGeometry args={[curve, 80, r, 8, false]} />
      </P>
      {tex && (
        <mesh geometry={geo} visible={!ghost} raycast={() => null}>
          <meshBasicMaterial map={tex} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
    </>
  );
}

const PAINT = "#0b0910";
const CHROME = "#e6dcc0";
const RUBBER = "#0c0c0d";

function Wheel({ x, z, dual }: { x: number; z: number; dual?: boolean }) {
  const s = Math.sign(z);
  const offs = dual ? [0, -0.32 * s] : [0];
  return (
    <>
      {offs.map((o) => (
        <group key={o} position={[x, 0.52, z + o]} rotation={[Math.PI / 2, 0, 0]}>
          <P id="wheels" color={RUBBER} metal={0} rough={0.9}><cylinderGeometry args={[0.52, 0.52, 0.28, 32]} /></P>
          <P id="wheels" color={RUBBER} metal={0} rough={0.9} position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.45, 0.07, 12, 40]} /></P>
          <P id="wheels" color={RUBBER} metal={0} rough={0.9} position={[0, -0.14, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.45, 0.07, 12, 40]} /></P>
          <P id="wheels" color={CHROME} metal={1} rough={0.15} position={[0, s * 0.02, 0]}><cylinderGeometry args={[0.3, 0.3, 0.29, 32]} /></P>
          <P id="wheels" color={STEEL} metal={0.8} rough={0.4} position={[0, s * 0.155, 0]}><cylinderGeometry args={[0.12, 0.14, 0.04, 20]} /></P>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => (
            <P key={k} id="wheels" color={CHROME} metal={1} rough={0.2} position={[Math.cos((k * Math.PI) / 5) * 0.2, s * 0.155, Math.sin((k * Math.PI) / 5) * 0.2]}><cylinderGeometry args={[0.022, 0.022, 0.05, 6]} /></P>
          ))}
        </group>
      ))}
    </>
  );
}

function Fan() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => { if (ref.current) ref.current.rotation.x += Math.min(d, 0.05) * 12; });
  return (
    <group ref={ref} position={[3.92, 1.6, 0]}>
      <P id="fan" color="#221a2b" metal={0.5}><cylinderGeometry args={[0.07, 0.07, 0.08, 12]} /></P>
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <P key={k} id="fan" color="#2a2033" rotation={[(k * Math.PI) / 3, 0, 0]} position={[0, Math.cos((k * Math.PI) / 3) * 0.2, Math.sin((k * Math.PI) / 3) * 0.2]} emissive={PURPLE} glow={0.2}>
          <boxGeometry args={[0.02, 0.34, 0.1]} />
        </P>
      ))}
    </group>
  );
}

function Driveshaft() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += Math.min(d, 0.05) * 10; });
  return (
    <group position={[-0.425, 0.935, 0]} rotation={[0, 0, -Math.PI / 2 + 0.154]}>
      <group ref={ref}>
        <P id="driveshaft" color="#4a4452" metal={1} rough={0.25}><cylinderGeometry args={[0.055, 0.055, 4.1, 12]} /></P>
        {[-1.6, 0, 1.6].map((y) => (
          <P key={y} id="driveshaft" color={GOLD} metal={1} rough={0.3} position={[0.06, y, 0]}><boxGeometry args={[0.04, 0.12, 0.04]} /></P>
        ))}
      </group>
    </group>
  );
}

/** Moves its children outward when the motor is broken down. */
function Ex({ dir, children }: { dir: V3; children: ReactNode }) {
  const { motor } = useContext(SceneCtx);
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    const g = ref.current; if (!g) return;
    const k = 1 - Math.exp(-6 * Math.min(d, 0.05));
    g.position.x += (dir[0] * motor - g.position.x) * k;
    g.position.y += (dir[1] * motor - g.position.y) * k;
    g.position.z += (dir[2] * motor - g.position.z) * k;
  });
  return <group ref={ref}>{children}</group>;
}

const FamilyCtx = createContext<EngineFamilyDef>(ENGINE_FAMILIES[0]!);
function useCyl() {
  const fam = useContext(FamilyCtx);
  return useMemo(() => cylinderLayout(fam), [fam]);
}
const STEEL = "#3a3540";

function EngineDetail() {
  const fam = useContext(FamilyCtx);
  const cyl = useCyl();
  const r = fam.layout === "v" ? 0.07 : 0.085;
  return (
    <>
      {/* Block + cylinders slide out sideways to expose the rotating assembly */}
      <Ex dir={[0, 0, -1.3]}>
        <P id="block" position={[3.1, 1.45, 0]} color="#141016" metal={0.9} rough={0.35} emissive={PURPLE_DEEP} glow={0.2}><boxGeometry args={[1.3, 0.5, 0.6]} /></P>
        {cyl.map(({ x, z }) => (
          <P key={`${x}${z}`} id="block" position={[x, 1.71, z]} color="#0c0810" emissive={PURPLE} glow={0.5}><cylinderGeometry args={[r, r, 0.03, 20]} /></P>
        ))}
        <Tube id="coolantpass" color={COOLANT} r={0.02} flow={1.5} pts={[[2.45, 1.6, 0.31], [3.1, 1.62, 0.31], [3.75, 1.6, 0.31]]} />
        <Tube id="coolantpass" color={COOLANT} r={0.02} flow={1.5} pts={[[2.45, 1.4, 0.31], [3.1, 1.38, 0.31], [3.75, 1.4, 0.31]]} />
      </Ex>
      <Ex dir={[0, 0.35, 0]}>
        {cyl.map(({ x, z }) => (
          <P key={`${x}${z}`} id="pistons" position={[x, 1.6, z]} color="#8a8090" metal={1} rough={0.2} emissive={GOLD} glow={0.15}><cylinderGeometry args={[r - 0.005, r - 0.005, 0.1, 20]} /></P>
        ))}
        {cyl.map(({ x, z }) => (
          <P key={`${x}${z}`} id="pistons" position={[x, 1.42, z * 0.5]} color={STEEL} metal={1} rough={0.3}><boxGeometry args={[0.03, 0.28, 0.05]} /></P>
        ))}
      </Ex>
      <Ex dir={[0, -0.4, 0]}>
        <P id="crankshaft" position={[3.1, 1.26, 0]} rotation={[0, 0, Math.PI / 2]} color="#5a5260" metal={1} rough={0.2} emissive={GOLD} glow={0.2}><cylinderGeometry args={[0.04, 0.04, 1.4, 12]} /></P>
        {cyl.map(({ x, z }, i) => (
          <P key={`${x}${z}`} id="crankshaft" position={[x, 1.26 + (i % 2 ? 0.05 : -0.05), 0]} color="#5a5260" metal={1}><boxGeometry args={[0.04, 0.16, 0.12]} /></P>
        ))}
      </Ex>
      <Ex dir={[0, -0.95, 0]}>
        <P id="oilpan" position={[3.1, 1.1, 0]} color="#1c1622" metal={0.8} rough={0.4} emissive={PURPLE_DEEP} glow={0.25}><boxGeometry args={[1.2, 0.14, 0.5]} /></P>
      </Ex>
      <Ex dir={[0, -0.65, 0.35]}>
        <P id="oilpump" position={[3.6, 1.18, 0.15]} color="#2a1e10" metal={0.9} emissive={GOLD} glow={0.35}><cylinderGeometry args={[0.07, 0.07, 0.1, 16]} /></P>
      </Ex>
      <Ex dir={[0, -0.2, 0.9]}>
        <P id="oilfilter" position={[2.9, 1.35, 0.38]} rotation={[Math.PI / 2, 0, 0]} color="#e0b84a" metal={0.4} rough={0.5} emissive={GOLD} glow={0.25}><cylinderGeometry args={[0.07, 0.07, 0.2, 20]} /></P>
      </Ex>
      {/* Top end lifts upward in stages */}
      <Ex dir={[0, 0.6, 0]}>
        <P id="headgasket" position={[3.1, 1.715, 0]} color="#8a7a50" metal={0.9} rough={0.3} emissive={GOLD} glow={0.3}><boxGeometry args={[1.3, 0.015, 0.6]} /></P>
      </Ex>
      <Ex dir={[0, 0.9, 0]}>
        <P id="head" position={[3.1, 1.81, 0]} color="#1e1824" metal={0.9} rough={0.3} emissive={PURPLE_DEEP} glow={0.2}><boxGeometry args={[1.28, 0.17, 0.56]} /></P>
      </Ex>
      <Ex dir={[0, 1.15, 0]}>
        {cyl.map(({ x, z }) => (
          <P key={`${x}${z}`} id={fam.fuel === "diesel" ? "glowplugs" : "sparkplugs"} position={[x + 0.05, 1.93, z + (z < 0 ? -0.1 : 0.18)]} color="#3a1a05" emissive={fam.fuel === "diesel" ? "#ff7a1a" : "#c9d4ff"} glow={0.8}><cylinderGeometry args={[0.012, 0.012, 0.09, 8]} /></P>
        ))}
        <Injectors />
      </Ex>
      <Ex dir={[0, 1.35, 0]}>
        <P id="camshaft" position={[3.1, 1.97, -0.12]} rotation={[0, 0, Math.PI / 2]} color="#5a5260" metal={1} rough={0.2} emissive={GOLD} glow={0.25}><cylinderGeometry args={[0.03, 0.03, 1.3, 12]} /></P>
      </Ex>
      <Ex dir={[0, 1.6, 0]}>
        {cyl.map(({ x, z }) => (
          <group key={`${x}${z}`} position={[0, 0, z]}>
            <P id="valvetrain" position={[x - 0.04, 2.05, -0.12]} color={STEEL} metal={1}><boxGeometry args={[0.03, 0.03, fam.layout === "v" ? 0.12 : 0.24]} /></P>
            <P id="valvetrain" position={[x - 0.04, 2.0, -0.03]} color="#8a8090" metal={1}><cylinderGeometry args={[0.012, 0.012, 0.12, 8]} /></P>
            <P id="valvetrain" position={[x - 0.04, 1.99, fam.layout === "v" ? -0.16 : -0.22]} color="#8a8090" metal={1}><cylinderGeometry args={[0.02, 0.02, 0.06, 10]} /></P>
          </group>
        ))}
      </Ex>
      {/* Breathing side (+z) and exhaust side (-z) */}
      <Ex dir={[0, 0.7, 1.0]}>
        <P id="intake" position={[3.1, 1.85, 0.36]} color="#1a1220" metal={0.7} emissive={PURPLE} glow={0.35}><boxGeometry args={[1.2, 0.12, 0.12]} /></P>
        <Tube id="intake" color={PURPLE} r={0.05} pts={[[2.5, 1.85, 0.38], [2.3, 1.95, 0.55], [2.3, 2.0, 0.75]]} />
      </Ex>
      <Ex dir={[0, 0.4, -1.6]}>
        <P id="exhaust" position={[3.1, 1.72, -0.36]} color="#4a2a10" metal={1} rough={0.35} emissive="#ff7a1a" glow={0.35}><boxGeometry args={[1.2, 0.1, 0.1]} /></P>
      </Ex>
      {fam.turbo && (
        <>
      <Ex dir={[0, 0.6, -2.0]}>
        <P id="turbo" position={[2.7, 1.8, -0.55]} color="#3a2d16" metal={1} rough={0.25} emissive={GOLD} glow={0.35}><sphereGeometry args={[0.16, 24, 24]} /></P>
        <P id="turbo" position={[2.7, 1.8, -0.72]} rotation={[Math.PI / 2, 0, 0]} color="#3a2d16" metal={1}><cylinderGeometry args={[0.1, 0.1, 0.1, 20]} /></P>
      </Ex>
      <Ex dir={[0.6, 0, 0]}>
        <P id="intercooler" position={[4.24, 1.55, 0]} color="#0d0812" emissive={PURPLE} glow={0.6}><boxGeometry args={[0.05, 0.55, 1.0]} /></P>
      </Ex>
        </>
      )}
      <Ex dir={[0, 0, 1.3]}>
        {fam.fuel === "diesel" && <P id="hpfp" position={[2.55, 1.42, 0.4]} color="#2a1e10" metal={0.9} emissive={GOLD} glow={0.5}><boxGeometry args={[0.2, 0.16, 0.14]} /></P>}
      </Ex>
      {/* Front of engine: cooling + accessory drive */}
      <Ex dir={[0.75, 0, 0]}>
        <P id="waterpump" position={[3.82, 1.5, 0.1]} rotation={[0, 0, Math.PI / 2]} color="#1a1220" metal={0.8} emissive={COOLANT} glow={0.5}><cylinderGeometry args={[0.09, 0.09, 0.08, 20]} /></P>
      </Ex>
      <Ex dir={[0.8, 0.45, 0]}>
        <P id="thermostat" position={[3.72, 1.86, 0.18]} color="#1a1220" metal={0.8} emissive={COOLANT} glow={0.6}><cylinderGeometry args={[0.05, 0.05, 0.07, 16]} /></P>
      </Ex>
      <Ex dir={[1.25, 0, 0]}>
        {([[1.3, 0, 0.11], [1.5, 0.1, 0.07], [1.72, 0.35, 0.07]] as V3[]).map(([y, z, r]) => (
          <P key={y} id="belts" position={[3.88, y, z]} rotation={[0, 0, Math.PI / 2]} color={STEEL} metal={1} emissive={GOLD} glow={0.2}><cylinderGeometry args={[r, r, 0.04, 20]} /></P>
        ))}
        <Tube id="belts" color={GOLD} r={0.012} pts={[[3.9, 1.19, 0], [3.9, 1.45, 0.17], [3.9, 1.72, 0.42], [3.9, 1.79, 0.33], [3.9, 1.5, 0.03], [3.9, 1.3, -0.11]]} />
      </Ex>
      <Ex dir={[0.6, 0.3, 1.1]}>
        <P id="alternator" position={[3.6, 1.72, 0.42]} rotation={[0, 0, Math.PI / 2]} color="#2a2530" metal={0.9} emissive={GOLD} glow={0.3}><cylinderGeometry args={[0.1, 0.1, 0.18, 20]} /></P>
      </Ex>
      <Ex dir={[0, -0.3, -1.8]}>
        <P id="starter" position={[2.55, 1.28, -0.38]} rotation={[0, 0, Math.PI / 2]} color="#2a2530" metal={0.9} emissive={PURPLE} glow={0.3}><cylinderGeometry args={[0.07, 0.07, 0.26, 16]} /></P>
      </Ex>
    </>
  );
}

/** Key engine sensors — ride along with the parts they mount on. */
function EngineSensors() {
  const s = (id: string, pos: V3, dir: V3, c = PURPLE) => (
    <Ex key={id} dir={dir}>
      <P id={id} position={pos} color="#120b18" emissive={c} glow={1}><sphereGeometry args={[0.035, 14, 14]} /></P>
    </Ex>
  );
  return (
    <>
      {s("o2sensor", [2.5, 1.74, -0.46], [0, 0.4, -1.6], "#ff3355")}
      {s("maf", [2.3, 2.0, 0.72], [0, 0.7, 1.0])}
      {s("cts", [3.72, 1.93, 0.18], [0.8, 0.45, 0], COOLANT)}
      {s("ops", [3.3, 1.35, 0.32], [0, 0, -1.3], GOLD)}
      {s("ckp", [3.78, 1.26, 0.12], [0, -0.4, 0])}
      {s("cmp", [3.72, 1.97, -0.12], [0, 1.35, 0])}
    </>
  );
}

/** Fuse/relay panel with a row of blade fuses. One sample fuse is blown. */
function FuseBox({ id, position, rotation = [0, 0, 0] }: { id: string; position: V3; rotation?: V3 }) {
  return (
    <group position={position} rotation={rotation}>
      <P id={id} color="#120b18" metal={0.4} rough={0.5} emissive={PURPLE} glow={0.45}><boxGeometry args={[0.32, 0.2, 0.08]} /></P>
      {[-0.11, -0.055, 0, 0.055, 0.11].map((x, i) => (
        <P key={x} id={id} position={[x, 0.02, 0.05]} color="#1a1206" emissive={id === "fusecab" && i === 3 ? "#ff3355" : GOLD} glow={0.9}><boxGeometry args={[0.03, 0.07, 0.02]} /></P>
      ))}
    </group>
  );
}

function Injectors() {
  const refs = useRef<THREE.Mesh[]>([]);
  const cyl = useCyl();
  return (
    <>
      {cyl.map(({ x, z }, i) => (
        <group key={`${x}${z}`} position={[x, 2.0, z]}>
          <P id="injectors" color="#2a1a05" emissive={GOLD} glow={0.9} metal={0.8}><cylinderGeometry args={[0.035, 0.03, 0.16, 12]} /></P>
          <Pulse i={i} n={cyl.length} refs={refs} />
        </group>
      ))}
    </>
  );
}

/** Combustion flash under each injector, in firing order. */
function Pulse({ i, n, refs }: { i: number; n: number; refs: React.MutableRefObject<THREE.Mesh[]> }) {
  const { ghost } = useContext(LayerCtx);
  // Illustrative flash sequence only — not a real firing order.
  const order = n === 6 ? [0, 4, 2, 5, 1, 3][i]! : (i * (n === 4 ? 3 : 3)) % n;
  useFrame(({ clock }) => {
    const m = refs.current[i];
    if (!m) return;
    const f = Math.max(0, Math.sin(clock.elapsedTime * 10 - order * ((2 * Math.PI) / n)));
    (m.material as THREE.MeshBasicMaterial).opacity = f * f * 0.9;
  });
  return (
    <mesh ref={(m) => { if (m) refs.current[i] = m; }} position={[0, -0.18, 0]} visible={!ghost} raycast={() => null}>
      <sphereGeometry args={[0.08, 12, 12]} />
      <meshBasicMaterial color={GOLD} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function Sensors() {
  const pts: V3[] = [[3.4, 1.55, 0.38], [2.7, 1.3, -0.38], [2.8, 1.95, 0.55], [0.6, 2.5, 1.25], [3.6, 0.6, 0.8], [-2.6, 0.6, -0.9]];
  const refs = useRef<THREE.Group[]>([]);
  useFrame(({ clock }) => refs.current.forEach((g, i) => g.scale.setScalar(1 + 0.3 * Math.sin(clock.elapsedTime * 3 + i))));
  return (
    <>
      {pts.map((p, i) => (
        <group key={i} position={p} ref={(g) => { if (g) refs.current[i] = g; }}>
          <P id="sensors" color="#1a0f24" emissive={i === 3 ? "#ff3355" : PURPLE} glow={2}><sphereGeometry args={[0.05, 16, 16]} /></P>
        </group>
      ))}
    </>
  );
}

function Semi() {
  const { oilSim } = useContext(SceneCtx);
  return (
    <group position={[-0.2, 0, 0]}>
      {/* 0 — Body shell */}
      <Layer i={0}>
        <P id="hood" position={[3.25, 1.65, 0]} color={PAINT} metal={0.7} rough={0.18}><boxGeometry args={[2.1, 0.9, 1.6]} /></P>
        <P id="hood" position={[3.5, 1.24, 0.95]} color={PAINT} metal={0.7} rough={0.2}><boxGeometry args={[1.3, 0.1, 0.45]} /></P>
        <P id="hood" position={[3.5, 1.24, -0.95]} color={PAINT} metal={0.7} rough={0.2}><boxGeometry args={[1.3, 0.1, 0.45]} /></P>
        <P id="grille" position={[4.32, 1.62, 0]} color={CHROME} metal={1} rough={0.12}><boxGeometry args={[0.06, 0.95, 1.1]} /></P>
        <P id="grille" position={[4.5, 0.88, 0]} color={CHROME} metal={1} rough={0.15}><boxGeometry args={[0.2, 0.3, 2.4]} /></P>
        <P id="grille" position={[4.33, 1.35, 0.68]} color="#fff4dd" emissive="#fff1d6" glow={1.5}><boxGeometry args={[0.04, 0.12, 0.22]} /></P>
        <P id="grille" position={[4.33, 1.35, -0.68]} color="#fff4dd" emissive="#fff1d6" glow={1.5}><boxGeometry args={[0.04, 0.12, 0.22]} /></P>
        <P id="cab" position={[1.45, 2.15, 0]} color={PAINT} metal={0.7} rough={0.18}><boxGeometry args={[1.5, 1.9, 2.3]} /></P>
        <P id="cab" position={[2.22, 2.6, 0]} color="#05040a" metal={0.3} rough={0.03}><boxGeometry args={[0.04, 0.7, 2.0]} /></P>
        <P id="cab" position={[1.5, 2.55, 1.16]} color="#05040a" metal={0.3} rough={0.03}><boxGeometry args={[0.9, 0.6, 0.02]} /></P>
        <P id="cab" position={[1.5, 2.55, -1.16]} color="#05040a" metal={0.3} rough={0.03}><boxGeometry args={[0.9, 0.6, 0.02]} /></P>
        <P id="sleeper" position={[-0.1, 2.25, 0]} color={PAINT} metal={0.7} rough={0.2}><boxGeometry args={[1.6, 2.1, 2.4]} /></P>
        <P id="sleeper" position={[-0.1, 3.35, 0]} color={PAINT} metal={0.7} rough={0.2}><boxGeometry args={[1.5, 0.1, 2.2]} /></P>
        {[1.3, -1.3].map((z) => (
          <P key={z} id="stacks" position={[0.75, 2.6, z]} color={CHROME} metal={1} rough={0.1}><cylinderGeometry args={[0.09, 0.09, 3.2, 20]} /></P>
        ))}
      </Layer>

      {/* 1 — Frame / chassis */}
      <Layer i={1}>
        {[0.45, -0.45].map((z) => (
          <P key={z} id="frame" position={[0.2, 0.95, z]} color="#2a2530" metal={0.8} rough={0.4}><boxGeometry args={[8.6, 0.28, 0.1]} /></P>
        ))}
        {[3.9, 1.5, -1.0, -3.2, -4.0].map((x) => (
          <P key={x} id="frame" position={[x, 0.95, 0]} color="#2a2530" metal={0.8} rough={0.4}><boxGeometry args={[0.1, 0.2, 0.8]} /></P>
        ))}
        <P id="fifth" position={[-3.2, 1.14, 0]} color="#3a3540" metal={0.9} rough={0.3} emissive={GOLD} glow={0.1}><cylinderGeometry args={[0.6, 0.6, 0.08, 32]} /></P>
        <P id="steer" position={[3.6, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]} color="#3a3540" metal={0.9}><cylinderGeometry args={[0.07, 0.07, 1.8, 12]} /></P>
        <Wheel x={3.6} z={1.05} /><Wheel x={3.6} z={-1.05} />
        {[-2.6, -3.8].map((x) => (<group key={x}><Wheel x={x} z={1.08} dual /><Wheel x={x} z={-1.08} dual /></group>))}
      </Layer>

      {/* 2 — Engine + drivetrain */}
      <Layer i={2}>
        <EngineDetail />
        {oilSim && <OilSim />}
        <P id="radiator" position={[4.15, 1.6, 0]} color="#0d0812" emissive={COOLANT} glow={0.7}><boxGeometry args={[0.1, 0.8, 1.1]} /></P>
        <Fan />
        <P id="transmission" position={[2.05, 1.32, 0]} rotation={[0, 0, Math.PI / 2]} color="#120d18" metal={0.9} rough={0.3} emissive={PURPLE_DEEP} glow={0.35}><cylinderGeometry args={[0.24, 0.17, 0.9, 24]} /></P>
        <Driveshaft />
        <P id="drivetrain" position={[-3.2, 0.6, 0]} rotation={[0, 0, Math.PI / 2]} color="#4a4452" metal={1} rough={0.25}><cylinderGeometry args={[0.05, 0.05, 1.2, 12]} /></P>
        {[-2.6, -3.8].map((x) => (
          <group key={x}>
            <P id="drivetrain" position={[x, 0.52, 0]} color="#1c1622" metal={0.9} rough={0.3} emissive={GOLD} glow={0.25}><sphereGeometry args={[0.27, 24, 24]} /></P>
            <P id="drivetrain" position={[x, 0.52, 0]} rotation={[Math.PI / 2, 0, 0]} color="#2c2632" metal={0.9}><cylinderGeometry args={[0.09, 0.09, 1.9, 12]} /></P>
          </group>
        ))}
      </Layer>

      {/* 3 — Wiring + sensors + audio */}
      <Layer i={3}>
        <P id="ecm" position={[2.9, 1.5, -0.42]} color="#1a0f24" emissive={PURPLE} glow={0.9}><boxGeometry args={[0.35, 0.25, 0.05]} /></P>
        <P id="batteries" position={[0.4, 0.9, -1.0]} color="#15101b" emissive={GOLD} glow={0.25}><boxGeometry args={[0.7, 0.4, 0.4]} /></P>
        <Tube id="harness" color={PURPLE} r={0.022} flow={2.6} pts={[[2.9, 1.55, -0.46], [2.4, 1.2, -0.5], [1.6, 1.1, -0.55], [0.6, 1.1, -0.85], [0.4, 1.12, -1.0]]} />
        <Tube id="harness" color={PURPLE} r={0.022} flow={2.6} pts={[[2.0, 1.9, -0.6], [1.6, 1.15, -0.55], [-0.5, 1.1, -0.52], [-2.6, 1.1, -0.52], [-4.0, 1.1, -0.52], [-4.0, 1.1, 0.52]]} />
        <Tube id="harness" color={PURPLE} r={0.015} flow={2.6} pts={[[2.9, 1.5, -0.42], [3.4, 1.4, -0.4], [4.2, 1.35, -0.6], [4.32, 1.35, -0.68]]} />
        <Sensors />
        <FuseBox id="fusecab" position={[2.02, 1.95, -0.62]} rotation={[0, Math.PI / 2, 0]} />
        <FuseBox id="fusepdm" position={[3.75, 1.75, -0.62]} />
        <FuseBox id="fusechassis" position={[0.95, 1.2, -0.95]} />
        <Tube id="harness" color={PURPLE} r={0.016} flow={2.6} pts={[[0.6, 1.1, -0.95], [0.75, 1.15, -0.97], [0.95, 1.2, -0.95]]} />
        <Tube id="harness" color={PURPLE} r={0.016} flow={2.6} pts={[[0.95, 1.2, -0.92], [1.6, 1.5, -0.7], [2.02, 1.95, -0.62]]} />
        <Tube id="harness" color={PURPLE} r={0.016} flow={2.6} pts={[[2.02, 1.95, -0.62], [2.8, 1.85, -0.65], [3.75, 1.75, -0.62]]} />
        <Tube id="harness" color={PURPLE} r={0.012} flow={2.6} pts={[[3.75, 1.75, -0.62], [3.9, 1.55, -0.6], [4.2, 1.35, -0.62]]} />
        <EngineSensors />
        <P id="radio" position={[2.0, 2.25, 0]} color="#120b18" emissive={GOLD} glow={0.9}><boxGeometry args={[0.1, 0.14, 0.42]} /></P>
        {[1.12, -1.12].map((z) => (
          <group key={z}>
            <P id="speakers" position={[1.5, 1.7, z]} rotation={[Math.PI / 2, 0, 0]} color="#1a1220" emissive={PURPLE} glow={0.6}><cylinderGeometry args={[0.13, 0.1, 0.06, 24]} /></P>
            <P id="speakers" position={[-0.3, 2.9, z * 1.03]} rotation={[Math.PI / 2, 0, 0]} color="#1a1220" emissive={z < 0 ? "#ff3355" : PURPLE} glow={0.6}><cylinderGeometry args={[0.11, 0.08, 0.06, 24]} /></P>
          </group>
        ))}
        <Tube id="audiowire" color={GOLD} r={0.012} flow={1.8} pts={[[1.95, 2.25, 0.15], [1.8, 1.8, 0.6], [1.5, 1.7, 1.08]]} />
        <Tube id="audiowire" color={GOLD} r={0.012} flow={1.8} pts={[[1.95, 2.25, -0.15], [1.8, 1.8, -0.6], [1.5, 1.7, -1.08]]} />
        <Tube id="audiowire" color={GOLD} r={0.012} flow={1.8} pts={[[1.95, 2.3, 0], [1.0, 3.0, 0], [0.2, 3.0, 0.6], [-0.3, 2.9, 1.1]]} />
        <Tube id="audiowire" color={GOLD} r={0.012} flow={1.8} pts={[[1.95, 2.3, 0], [1.0, 3.05, 0], [0.2, 3.0, -0.6], [-0.3, 2.9, -1.1]]} />
      </Layer>

      {/* 4 — Fluid lines */}
      <Layer i={4}>
        {[1.05, -1.05].map((z) => (
          <P key={z} id="fueltanks" position={[1.5, 0.95, z]} rotation={[0, 0, Math.PI / 2]} color="#c9bfa3" metal={1} rough={0.15}><cylinderGeometry args={[0.34, 0.34, 1.3, 28]} /></P>
        ))}
        <P id="def" position={[0.1, 0.85, 1.0]} color="#1a1206" emissive={COOLANT} glow={0.5}><boxGeometry args={[0.4, 0.35, 0.35]} /></P>
        <Tube id="def" color={COOLANT} r={0.015} flow={1} pts={[[0.1, 0.85, 0.8], [0.4, 0.75, 0.5], [0.8, 0.8, 0.3]]} />
        <Tube id="fuelline" color={GOLD} r={0.02} flow={1.2} pts={[[1.5, 0.75, 0.75], [2.0, 0.85, 0.55], [2.6, 1.3, 0.42], [3.1, 2.05, 0.25], [3.6, 2.05, 0.1]]} />
        <Tube id="coolant" color={COOLANT} r={0.045} flow={1.5} pts={[[4.1, 1.92, 0.3], [3.9, 2.0, 0.3], [3.7, 1.9, 0.2], [3.65, 1.85, 0]]} />
        <Tube id="coolant" color={COOLANT} r={0.045} flow={1.5} pts={[[4.1, 1.3, -0.3], [3.9, 1.22, -0.35], [3.7, 1.3, -0.38], [3.5, 1.35, -0.36]]} />
        <Tube id="oil" color="#e0b84a" r={0.025} flow={1} pts={[[2.6, 1.3, 0.36], [2.4, 1.15, 0.5], [2.9, 1.1, 0.55], [3.5, 1.2, 0.4]]} />
        <Tube id="air" color={PURPLE} r={0.015} flow={0.8} pts={[[2.5, 0.8, 0.4], [0, 0.8, 0.4], [-2.6, 0.8, 0.4], [-3.8, 0.75, 0.4], [-4.1, 1.1, 0.3]]} />
      </Layer>
    </group>
  );
}

function GlowHalo() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    r.addColorStop(0, "rgba(168,85,247,0.5)");
    r.addColorStop(0.5, "rgba(109,40,217,0.16)");
    r.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = r; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.004, 0]} scale={[1.8, 1, 1]}>
      <planeGeometry args={[8, 8]} />
      <meshBasicMaterial map={tex} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

const statusLabel: Record<Status, string> = { ok: "Healthy", watch: "Watch", fault: "Needs attention" };

export default function SemiTruck3D() {
  const [sel, setSel] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [peel, setPeel] = useState(0);
  const [explode, setExplode] = useState(0);
  const [motor, setMotor] = useState(0);
  const [oilSim, setOilSim] = useState(false);
  const [famId, setFamId] = useState<EngineFamilyId>("bigrig-i6-diesel");
  const fam = getEngineFamily(famId);
  const part = sel ? PARTS[sel] : null;
  const narrow = typeof window !== "undefined" && window.innerWidth < 640;
  const [quality, setQuality] = useState<"auto" | "high" | "low">("auto");
  const [autoLow, setAutoLow] = useState(narrow);
  const hi = quality === "high" || (quality === "auto" && !autoLow);

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        dpr={hi ? [1, 2] : [1, 1.25]}
        camera={{ position: narrow ? [13, 7, 13] : [9.5, 5, 9.5], fov: 38 }}
        gl={{ antialias: !hi, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05, powerPreference: "high-performance" }}
        onPointerMissed={() => setSel(null)}
      >
        <PerformanceMonitor onDecline={() => quality === "auto" && setAutoLow(true)} />
        <AdaptiveDpr pixelated={false} />
        <color attach="background" args={["#050307"]} />
        <fog attach="fog" args={["#050307", 16, 40]} />
        <hemisphereLight args={["#d9d0ff", "#0a0610", 0.35]} />
        {/* Studio key, rim and fill lights */}
        <spotLight position={[8, 12, 6]} angle={0.45} penumbra={0.8} intensity={260} color="#fff4e0" castShadow shadow-mapSize={hi ? [2048, 2048] : [1024, 1024]} shadow-bias={-0.0004} shadow-normalBias={0.02} />
        <spotLight position={[-9, 7, -6]} angle={0.5} penumbra={1} intensity={120} color="#c9b8ff" />
        <pointLight position={[-6, 3, -4]} intensity={50} color={PURPLE} />
        <pointLight position={[5, 2, -5]} intensity={25} color={GOLD} />
        <Environment resolution={hi ? 512 : 128}>
          <Lightformer form="rect" intensity={3} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[14, 5, 1]} />
          <Lightformer intensity={2.5} color={PURPLE} position={[-8, 2, 0]} rotation-y={Math.PI / 2} scale={[16, 1.5, 1]} />
          <Lightformer intensity={1.8} color={GOLD} position={[8, 1.5, -2]} rotation-y={-Math.PI / 2} scale={[14, 0.8, 1]} />
          <Lightformer intensity={1.5} position={[0, 2, 8]} scale={[10, 1, 1]} />
          <Lightformer form="ring" intensity={2} position={[0, 3, -9]} scale={4} />
        </Environment>
        <SceneCtx.Provider value={{ oilSim, sel, setSel, hover, setHover, peel, explode, motor }}>
          <FamilyCtx.Provider value={fam}><Semi /></FamilyCtx.Provider>
        </SceneCtx.Provider>
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.001, 0]}>
          <planeGeometry args={[60, 60]} />
          <MeshReflectorMaterial blur={[300, 80]} resolution={hi ? 1024 : 256} mixBlur={1} mixStrength={14} roughness={0.9} depthScale={1} minDepthThreshold={0.4} maxDepthThreshold={1.4} color="#08060b" metalness={0.6} mirror={0.5} />
        </mesh>
        <gridHelper args={[24, 48, PURPLE_DEEP, "#1d1428"]} position={[0, 0.002, 0]} />
        <GlowHalo />
        <ContactShadows position={[0, 0.003, 0]} opacity={0.7} scale={16} blur={2.4} far={4} resolution={hi ? 1024 : 256} />
        {hi && (
          <EffectComposer multisampling={0}>
            <N8AO aoRadius={0.6} intensity={peel === 0 ? 2.2 : 0} distanceFalloff={0.6} halfRes />
            <SMAA />
            <Vignette offset={0.3} darkness={0.55} />
          </EffectComposer>
        )}
        <OrbitControls makeDefault enablePan enableDamping dampingFactor={0.08} minDistance={4} maxDistance={26} maxPolarAngle={Math.PI / 2.05} autoRotate={!sel} autoRotateSpeed={0.5} target={[0, 1.6, 0]} />
      </Canvas>

      {part && (
        <div className="holo-panel absolute right-3 top-14 z-10 max-h-[55%] w-72 max-w-[85%] overflow-y-auto p-4 text-sm">
          <div className="eyebrow">{LAYERS[part.layer]}</div>
          <div className="mt-1 font-bold text-primary-glow">{part.name.replace("(x6)", `(x${fam.cylinders})`)}</div>
          {part.layer === 2 && <div className="text-[10px] uppercase tracking-widest text-gold">{fam.label} · representative</div>}
          <p className="mt-1 text-xs text-muted-foreground">{part.what}</p>
          <div className="mt-2 text-xs"><span className={part.status === "ok" ? "text-primary-glow" : "text-gold"}>● {statusLabel[part.status]}</span></div>
          <p className="mt-1 text-xs text-muted-foreground">{part.note}</p>
          {sel && <Callout id={sel} oilSim={oilSim} setOilSim={setOilSim} />}
          {sel && modelPartToComponent[sel] && (
            <a href={`/parts?component=${modelPartToComponent[sel]}`} className="mt-3 inline-block rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">Find this part →</a>
          )}
          <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">Sample status · live data needs the device</p>
        </div>
      )}

      {oilSim && <div className="pointer-events-none absolute left-1/2 top-14 z-10 -translate-x-1/2 rounded-full border border-gold bg-background/80 px-3 py-1 text-[10px] uppercase tracking-widest text-gold">Simulation · illustrative oil restriction, not measured</div>}
      <div className="absolute inset-x-3 bottom-3 z-10 flex flex-col gap-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Representative model · {fam.label} ({fam.examples}) · not an exact match for any specific vehicle</p>
        <div className="flex flex-wrap gap-1.5">
          {LAYERS.map((l, i) => (
            <button key={l} type="button" onClick={() => setPeel(i)} aria-pressed={peel === i}
              className={`rounded-full border px-2.5 py-1 text-[11px] transition ${peel === i ? "border-gold text-gold" : "border-primary/50 text-muted-foreground hover:text-primary-glow"}`}>
              {i + 1}. {l}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
            Explode
            <input type="range" min={0} max={1} step={0.01} value={explode} onChange={(e) => setExplode(+e.target.value)} className="w-28 accent-primary" aria-label="Explode layers" />
          </label>
          <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
            Motor breakdown
            <input type="range" min={0} max={1} step={0.01} value={motor} onChange={(e) => { setMotor(+e.target.value); if (peel < 2) setPeel(2); }} className="w-28 accent-gold" aria-label="Break down the motor" />
          </label>
          <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
            Engine
            <select value={famId} onChange={(e) => { setFamId(e.target.value as EngineFamilyId); setSel(null); }} aria-label="Representative engine family"
              className="rounded border border-primary/50 bg-background px-1.5 py-0.5 text-[11px] text-foreground">
              {ENGINE_FAMILIES.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
            Quality
            <select value={quality} onChange={(e) => setQuality(e.target.value as "auto" | "high" | "low")} aria-label="Graphics quality"
              className="rounded border border-primary/50 bg-background px-1.5 py-0.5 text-[11px] text-foreground">
              <option value="auto">Auto{quality === "auto" ? (hi ? " (high)" : " (low)") : ""}</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>
          </label>
          <button type="button" onClick={() => { setPeel(2); setExplode(0); setMotor(motor > 0.5 ? 0 : 1); }}
            className="rounded-full border border-gold/60 px-2.5 py-1 text-[11px] text-gold hover:bg-gold/10">
            {motor > 0.5 ? "Reassemble motor" : "Tear down motor"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Linked readings, related trouble codes and (for oil parts) the cautious risk estimate. */
function Callout({ id, oilSim, setOilSim }: { id: string; oilSim: boolean; setOilSim: (v: boolean) => void }) {
  const keys = PART_SENSORS[id] ?? [];
  const readings = readSensors(SAMPLE_LOG.sensor_readings).filter((r) => keys.includes(r.key));
  const areas = new Set(keys.map((k) => SENSORS[k].area as string));
  const codes = readCodes(SAMPLE_LOG.trouble_codes).map(explainCode).filter((e) => e.info && areas.has(e.info.area));
  if (!readings.length && !codes.length && !OIL_PARTS.has(id)) return <p className="mt-2 text-[10px] text-muted-foreground">No supported sensor reading is linked to this part.</p>;
  return (
    <div className="mt-3 space-y-2 border-t border-primary/30 pt-2">
      {readings.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Linked readings · sample, not live</div>
          <ul className="mt-1 space-y-0.5 text-xs">
            {readings.map((r) => <li key={r.key} className="flex justify-between gap-2"><span className="text-muted-foreground">{r.label}</span><span className={r.status === "ok" ? "text-primary-glow" : "text-gold"}>{r.value} {r.unit}{r.status !== "ok" ? ` (${r.status})` : ""}</span></li>)}
          </ul>
        </div>
      )}
      {codes.map((e) => (
        <div key={e.code} className="text-xs"><span className="text-gold">{e.code}</span> <span className="text-muted-foreground">— {e.info!.title} (sample code · generic meaning)</span></div>
      ))}
      {OIL_PARTS.has(id) && (
        <>
          <OilRiskPanel log={SAMPLE_LOG} sample compact />
          <button type="button" onClick={() => setOilSim(!oilSim)} className="rounded-full border border-gold/60 px-2.5 py-1 text-[11px] text-gold hover:bg-gold/10">
            {oilSim ? "Hide simulation" : "Show simulated restriction"}
          </button>
        </>
      )}
    </div>
  );
}
