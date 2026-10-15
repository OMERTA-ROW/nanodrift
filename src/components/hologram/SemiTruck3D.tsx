import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial, OrbitControls } from "@react-three/drei";
import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";

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
  engine: { name: "Diesel engine block", layer: 2, what: "Inline-six heavy-duty diesel making the truck's power.", status: "ok", note: "Oil pressure and temps nominal." },
  injectors: { name: "Fuel injectors (x6)", layer: 2, what: "Spray precisely timed fuel into each cylinder.", status: "watch", note: "Sample: cylinder 4 balance rate slightly high — keep an eye on it." },
  turbo: { name: "Turbocharger", layer: 2, what: "Uses exhaust flow to pack more air into the engine.", status: "ok", note: "Boost pressure normal." },
  radiator: { name: "Radiator", layer: 2, what: "Sheds engine heat from the coolant into the air.", status: "ok", note: "Coolant delta-T normal." },
  fan: { name: "Cooling fan", layer: 2, what: "Clutched fan that pulls air through the radiator.", status: "ok", note: "Fan clutch engaging on demand." },
  transmission: { name: "Transmission", layer: 2, what: "18-speed gearbox turning engine power into road speed.", status: "ok", note: "Shift timing and fluid temp normal." },
  driveshaft: { name: "Drive shaft", layer: 2, what: "Spinning shaft carrying torque back to the drive axles.", status: "ok", note: "No vibration detected." },
  drivetrain: { name: "Tandem drive axles", layer: 2, what: "Two differentials and axles that drive the rear wheels.", status: "ok", note: "Inter-axle differential normal." },
  ecm: { name: "Engine ECM", layer: 3, what: "Engine computer that runs fuel, timing and boost.", status: "ok", note: "No active trouble codes." },
  harness: { name: "Main wiring harness", layer: 3, what: "Routes power and data from the cab to every module and light.", status: "ok", note: "No opens or shorts found." },
  sensors: { name: "Engine & chassis sensors", layer: 3, what: "Temperature, pressure, speed and exhaust sensors.", status: "fault", note: "Sample: NOx sensor reading erratic — check connector." },
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

type Ctx = { sel: string | null; setSel: (s: string | null) => void; hover: string | null; setHover: (s: string | null) => void; peel: number; explode: number };
const SceneCtx = createContext<Ctx>(null!);
const LayerCtx = createContext<{ ghost: boolean }>({ ghost: false });

type V3 = [number, number, number];
type PProps = { id: string; position?: V3; rotation?: V3; color?: string; metal?: number; rough?: number; emissive?: string; glow?: number; children: ReactNode };

/** One clickable piece of a named part. */
function P({ id, position, rotation, color = "#1a1520", metal = 0.6, rough = 0.4, emissive = "#000000", glow = 0, children }: PProps) {
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
      raycast={ghost ? () => null : undefined}
    >
      {children}
      <meshPhysicalMaterial
        color={color}
        metalness={metal}
        roughness={rough}
        clearcoat={0.6}
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
          <P id="wheels" color={CHROME} metal={1} rough={0.15} position={[0, s * 0.02, 0]}><cylinderGeometry args={[0.3, 0.3, 0.29, 24]} /></P>
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

function Injectors() {
  const refs = useRef<THREE.Mesh[]>([]);
  return (
    <>
      {[2.6, 2.8, 3.0, 3.2, 3.4, 3.6].map((x, i) => (
        <group key={x} position={[x, 2.0, 0]}>
          <P id="injectors" color="#2a1a05" emissive={GOLD} glow={0.9} metal={0.8}><cylinderGeometry args={[0.035, 0.03, 0.16, 12]} /></P>
          <Pulse i={i} refs={refs} />
        </group>
      ))}
    </>
  );
}

/** Combustion flash under each injector, in firing order. */
function Pulse({ i, refs }: { i: number; refs: React.MutableRefObject<THREE.Mesh[]> }) {
  const { ghost } = useContext(LayerCtx);
  const order = [0, 4, 2, 5, 1, 3][i]!;
  useFrame(({ clock }) => {
    const m = refs.current[i];
    if (!m) return;
    const f = Math.max(0, Math.sin(clock.elapsedTime * 10 - order * (Math.PI / 3)));
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
        <P id="engine" position={[3.1, 1.5, 0]} color="#141016" metal={0.9} rough={0.35} emissive={PURPLE_DEEP} glow={0.15}><boxGeometry args={[1.3, 0.6, 0.7]} /></P>
        <P id="engine" position={[3.1, 1.88, 0]} color="#1e1824" metal={0.9} rough={0.3} emissive={GOLD} glow={0.1}><boxGeometry args={[1.25, 0.14, 0.55]} /></P>
        <Injectors />
        <P id="turbo" position={[2.8, 1.72, 0.52]} color="#3a2d16" metal={1} rough={0.25} emissive={GOLD} glow={0.3}><sphereGeometry args={[0.18, 24, 24]} /></P>
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
  const part = sel ? PARTS[sel] : null;
  const narrow = typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <div className="relative h-full w-full">
      <Canvas shadows dpr={[1, 2]} camera={{ position: narrow ? [13, 7, 13] : [9.5, 5, 9.5], fov: 38 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }} onPointerMissed={() => setSel(null)}>
        <color attach="background" args={["#050307"]} />
        <fog attach="fog" args={["#050307", 16, 40]} />
        <ambientLight intensity={0.3} />
        <spotLight position={[8, 12, 6]} angle={0.45} penumbra={0.8} intensity={260} color="#fff4e0" castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[-6, 3, -4]} intensity={50} color={PURPLE} />
        <pointLight position={[5, 2, -5]} intensity={25} color={GOLD} />
        <Environment resolution={256}>
          <Lightformer intensity={3} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[14, 5, 1]} />
          <Lightformer intensity={2.5} color={PURPLE} position={[-8, 2, 0]} rotation-y={Math.PI / 2} scale={[16, 1.5, 1]} />
          <Lightformer intensity={1.8} color={GOLD} position={[8, 1.5, -2]} rotation-y={-Math.PI / 2} scale={[14, 0.8, 1]} />
          <Lightformer intensity={1.5} position={[0, 2, 8]} scale={[10, 1, 1]} />
        </Environment>
        <SceneCtx.Provider value={{ sel, setSel, hover, setHover, peel, explode }}>
          <Semi />
        </SceneCtx.Provider>
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.001, 0]}>
          <planeGeometry args={[60, 60]} />
          <MeshReflectorMaterial blur={[300, 80]} resolution={512} mixBlur={1} mixStrength={14} roughness={0.9} depthScale={1} minDepthThreshold={0.4} maxDepthThreshold={1.4} color="#08060b" metalness={0.6} mirror={0.5} />
        </mesh>
        <gridHelper args={[24, 48, PURPLE_DEEP, "#1d1428"]} position={[0, 0.002, 0]} />
        <GlowHalo />
        <ContactShadows position={[0, 0.003, 0]} opacity={0.7} scale={16} blur={2.4} far={4} />
        <OrbitControls makeDefault enablePan enableDamping dampingFactor={0.08} minDistance={4} maxDistance={26} maxPolarAngle={Math.PI / 2.05} autoRotate={!sel} autoRotateSpeed={0.5} target={[0, 1.6, 0]} />
      </Canvas>

      {part && (
        <div className="holo-panel absolute right-3 top-14 z-10 w-64 max-w-[80%] p-4 text-sm">
          <div className="eyebrow">{LAYERS[part.layer]}</div>
          <div className="mt-1 font-bold text-primary-glow">{part.name}</div>
          <p className="mt-1 text-xs text-muted-foreground">{part.what}</p>
          <div className="mt-2 text-xs"><span className={part.status === "ok" ? "text-primary-glow" : "text-gold"}>● {statusLabel[part.status]}</span></div>
          <p className="mt-1 text-xs text-muted-foreground">{part.note}</p>
          <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">Sample status · live data needs the device</p>
        </div>
      )}

      <div className="absolute inset-x-3 bottom-3 z-10 flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          {LAYERS.map((l, i) => (
            <button key={l} type="button" onClick={() => setPeel(i)} aria-pressed={peel === i}
              className={`rounded-full border px-2.5 py-1 text-[11px] transition ${peel === i ? "border-gold text-gold" : "border-primary/50 text-muted-foreground hover:text-primary-glow"}`}>
              {i + 1}. {l}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
          Explode
          <input type="range" min={0} max={1} step={0.01} value={explode} onChange={(e) => setExplode(+e.target.value)} className="w-40 accent-primary" aria-label="Explode layers" />
        </label>
      </div>
    </div>
  );
}
