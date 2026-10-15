import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

// Brand palette for the 3D scene (WebGL can't read CSS tokens).
const PURPLE = "#a855f7";
const PURPLE_DEEP = "#6d28d9";
const GOLD = "#d4a72c";
const CYAN_COOLANT = "#c084fc";
const MODEL_URL = "/models/truck.glb";
const TARGET_LENGTH = 4.6;

function flowTexture(color: string) {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 8;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgba(0,0,0,0)"; g.fillRect(0, 0, 128, 8);
  const grad = g.createLinearGradient(0, 0, 128, 0);
  grad.addColorStop(0, "rgba(255,255,255,0)");
  grad.addColorStop(0.7, color);
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad; g.fillRect(0, 0, 128, 8);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 1);
  return t;
}

function FlowTube({ points, color, radius = 0.025, speed = 1.2, holo }: { points: [number, number, number][]; color: string; radius?: number; speed?: number; holo: boolean }) {
  const tex = useMemo(() => flowTexture(color), [color]);
  const geo = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), 64, radius, 8, false), [points, radius]);
  useFrame((_, d) => { tex.offset.x -= Math.min(d, 0.05) * speed; });
  return (
    <group visible={holo}>
      <mesh geometry={geo}><meshBasicMaterial color={color} transparent opacity={0.25} /></mesh>
      <mesh geometry={geo} scale={1.01}><meshBasicMaterial map={tex} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
    </group>
  );
}

function Internals({ holo, box }: { holo: boolean; box: THREE.Box3 }) {
  const cyl = useRef<THREE.Mesh[]>([]);
  const sensors = useRef<THREE.Mesh[]>([]);
  const size = box.getSize(new THREE.Vector3());
  const front = box.max.z - size.z * 0.2; // engine bay sits under the hood
  const y = box.min.y + size.y * 0.42;
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    cyl.current.forEach((m, i) => {
      const fire = Math.max(0, Math.sin(t * 9 - i * (Math.PI / 2)));
      (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4 + fire * fire * 4;
    });
    sensors.current.forEach((m, i) => { m.scale.setScalar(1 + 0.35 * Math.sin(t * 3 + i)); });
  });
  const cyls = [-0.27, -0.09, 0.09, 0.27];
  const sensorPos: [number, number, number][] = [[0.42, y + 0.2, front + 0.3], [-0.42, y + 0.2, front - 0.2], [0, y - 0.25, front - 1.3], [0.5, y - 0.3, box.min.z + 0.6], [-0.5, y - 0.3, front + 0.55]];
  return (
    <group visible={holo}>
      {/* Engine block */}
      <mesh position={[0, y, front]}>
        <boxGeometry args={[0.7, 0.36, 0.8]} />
        <meshStandardMaterial color="#141016" metalness={0.9} roughness={0.35} emissive={GOLD} emissiveIntensity={0.15} />
      </mesh>
      {cyls.map((z, i) => (
        <mesh key={z} ref={(m) => { if (m) cyl.current[i] = m; }} position={[0, y + 0.24, front + z * 1.2]}>
          <cylinderGeometry args={[0.09, 0.09, 0.16, 20]} />
          <meshStandardMaterial color="#2a1a05" emissive={GOLD} emissiveIntensity={1} metalness={0.6} roughness={0.3} toneMapped={false} />
        </mesh>
      ))}
      {/* Transmission */}
      <mesh position={[0, y - 0.05, front - 0.75]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.11, 0.6, 24]} />
        <meshStandardMaterial color="#120d18" metalness={0.9} roughness={0.3} emissive={PURPLE_DEEP} emissiveIntensity={0.3} />
      </mesh>
      {/* Radiator */}
      <mesh position={[0, y + 0.05, box.max.z - 0.12]}>
        <boxGeometry args={[0.8, 0.4, 0.05]} />
        <meshStandardMaterial color="#0d0812" emissive={PURPLE} emissiveIntensity={0.6} wireframe />
      </mesh>
      {/* Driveshaft */}
      <mesh position={[0, y - 0.15, (front - 1.05 + box.min.z + 0.6) / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, Math.abs(front - 1.05 - box.min.z - 0.6), 8]} />
        <meshStandardMaterial color="#333" metalness={1} roughness={0.2} />
      </mesh>
      {/* Coolant loop */}
      <FlowTube holo={holo} color={CYAN_COOLANT} radius={0.03} speed={1.4} points={[[0.25, y + 0.15, box.max.z - 0.15], [0.4, y + 0.25, front + 0.3], [0.38, y + 0.1, front - 0.2], [-0.38, y + 0.1, front - 0.2], [-0.4, y + 0.25, front + 0.3], [-0.25, y + 0.15, box.max.z - 0.15]]} />
      {/* Fuel line front-to-tank */}
      <FlowTube holo={holo} color={GOLD} radius={0.02} speed={0.9} points={[[0.5, y - 0.3, box.min.z + 0.7], [0.48, y - 0.32, 0], [0.4, y - 0.2, front - 0.4], [0.22, y + 0.1, front]]} />
      {/* Wiring harness to cab/bed */}
      <FlowTube holo={holo} color={PURPLE} radius={0.012} speed={2.6} points={[[-0.3, y + 0.2, front + 0.2], [-0.45, y + 0.35, front - 0.5], [-0.5, y + 0.5, 0], [-0.5, y + 0.3, box.min.z + 0.6], [0.5, y + 0.3, box.min.z + 0.6]]} />
      {/* Fuel tank */}
      <mesh position={[0.5, y - 0.3, box.min.z + 0.6]}>
        <boxGeometry args={[0.25, 0.2, 0.5]} />
        <meshStandardMaterial color="#1a1206" emissive={GOLD} emissiveIntensity={0.4} transparent opacity={0.8} />
      </mesh>
      {sensorPos.map((p, i) => (
        <mesh key={i} ref={(m) => { if (m) sensors.current[i] = m; }} position={p}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color={i === 2 ? GOLD : PURPLE} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Truck({ holo = false, onToggle }: { holo?: boolean; onToggle?: () => void }) {
  const { scene } = useGLTF(MODEL_URL);
  const group = useRef<THREE.Group>(null);
  const { model, box, solid, ghost, edges } = useMemo(() => {
    const model = scene.clone(true);
    const b0 = new THREE.Box3().setFromObject(model);
    const s0 = b0.getSize(new THREE.Vector3());
    const k = TARGET_LENGTH / Math.max(s0.x, s0.z);
    model.scale.setScalar(k);
    const b1 = new THREE.Box3().setFromObject(model);
    const c = b1.getCenter(new THREE.Vector3());
    model.position.set(-c.x, -b1.min.y, -c.z);
    if (s0.x > s0.z) model.rotation.y = Math.PI / 2;
    const box = new THREE.Box3().setFromObject(model);
    const solid: THREE.Material[] = [];
    const ghost = new THREE.MeshPhysicalMaterial({ color: PURPLE_DEEP, transparent: true, opacity: 0.08, roughness: 0.1, metalness: 0.2, depthWrite: false, side: THREE.DoubleSide });
    const edges = new THREE.Group();
    const mats: Record<string, THREE.Material> = {
      paint: new THREE.MeshPhysicalMaterial({ color: "#0a080e", metalness: 0.7, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 2, sheen: 0.5, sheenColor: new THREE.Color(PURPLE_DEEP) }),
      trim: new THREE.MeshPhysicalMaterial({ color: "#121014", metalness: 0.3, roughness: 0.55 }),
      chrome: new THREE.MeshPhysicalMaterial({ color: "#d9cfa8", metalness: 1, roughness: 0.12, envMapIntensity: 2.2 }),
      steel: new THREE.MeshPhysicalMaterial({ color: "#3a3540", metalness: 0.95, roughness: 0.3 }),
      rubber: new THREE.MeshPhysicalMaterial({ color: "#0c0c0d", metalness: 0, roughness: 0.85 }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#05040a", metalness: 0.2, roughness: 0.02, clearcoat: 1, envMapIntensity: 2.5, transparent: true, opacity: 0.85 }),
      lamp: new THREE.MeshPhysicalMaterial({ color: "#fff6e6", emissive: "#fff1d6", emissiveIntensity: 1.6, roughness: 0.1, toneMapped: false }),
      tail: new THREE.MeshPhysicalMaterial({ color: "#3a0612", emissive: "#a01535", emissiveIntensity: 1.2, roughness: 0.15 }),
    };
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      // Hide plates and anything badge-like so no real marks show.
      if (/registration|badge|emblem|logo/i.test(m.name + (m.parent?.name ?? ""))) { m.visible = false; return; }
      const srcName = ((m.material as THREE.Material).name || "").toLowerCase();
      const key = srcName === "black" ? "trim" : srcName === "white" || srcName === "red" ? "paint" : srcName in mats ? srcName : "paint";
      const paint = mats[key]!;
      m.userData["paint"] = paint;
      solid.push(paint);
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 25), new THREE.LineBasicMaterial({ color: PURPLE, transparent: true, opacity: 0.9, toneMapped: false }));
      e.visible = false;
      m.add(e);
      m.userData["edge"] = e;
    });
    return { model, box, solid, ghost, edges };
  }, [scene]);

  useEffect(() => {
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || !m.userData["paint"]) return;
      m.material = holo ? ghost : (m.userData["paint"] as THREE.Material);
      (m.userData["edge"] as THREE.Object3D).visible = holo;
    });
  }, [holo, model, ghost]);
  void solid; void edges;

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.position.y = Math.sin(clock.elapsedTime * 1.2) * 0.02;
    ghost.opacity = 0.07 + Math.sin(clock.elapsedTime * 2) * 0.03;
  });

  const click = (e: ThreeEvent<MouseEvent>) => { if (e.delta > 6) return; e.stopPropagation(); onToggle?.(); };

  return (
    <group ref={group}>
      <primitive object={model} onClick={click} onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "")} />
      <Internals holo={holo} box={box} />
      <ScanPlane holo={holo} box={box} />
    </group>
  );
}

function GlowHalo() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    r.addColorStop(0, "rgba(168,85,247,0.55)");
    r.addColorStop(0.5, "rgba(109,40,217,0.18)");
    r.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = r; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.004, 0]}>
      <planeGeometry args={[7.5, 7.5]} />
      <meshBasicMaterial map={tex} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function ScanPlane({ holo, box }: { holo: boolean; box: THREE.Box3 }) {
  const ref = useRef<THREE.Mesh>(null);
  const size = box.getSize(new THREE.Vector3());
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.z = box.min.z + ((clock.elapsedTime * 0.5) % 1) * size.z;
  });
  return (
    <mesh ref={ref} visible={holo} position={[0, size.y / 2, 0]}>
      <planeGeometry args={[size.x * 1.1, size.y * 1.1]} />
      <meshBasicMaterial color={PURPLE} transparent opacity={0.12} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

export default function TruckShowcase3D() {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: window.innerWidth < 640 ? [8.5, 4, 8.5] : [5.2, 2.6, 5.2], fov: 38 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
      <color attach="background" args={["#050307"]} />
      <fog attach="fog" args={["#050307", 9, 22]} />
      <ambientLight intensity={0.25} />
      <spotLight position={[5, 8, 4]} angle={0.4} penumbra={0.8} intensity={120} color="#fff4e0" castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-4, 2, -3]} intensity={30} color={PURPLE} />
      <pointLight position={[3, 1, -4]} intensity={14} color={GOLD} />
      <Suspense fallback={null}>
        <Truck />
        <Environment resolution={256}>
          <Lightformer intensity={3} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
          <Lightformer intensity={2.5} color={PURPLE} position={[-6, 1.5, 0]} rotation-y={Math.PI / 2} scale={[12, 1.2, 1]} />
          <Lightformer intensity={1.8} color={GOLD} position={[6, 1, -2]} rotation-y={-Math.PI / 2} scale={[10, 0.6, 1]} />
          <Lightformer intensity={1.5} position={[0, 2, 6]} scale={[8, 1, 1]} />
        </Environment>
      </Suspense>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.001, 0]}>
        <planeGeometry args={[40, 40]} />
        <MeshReflectorMaterial blur={[300, 80]} resolution={512} mixBlur={1} mixStrength={18} roughness={0.9} depthScale={1} minDepthThreshold={0.4} maxDepthThreshold={1.4} color="#08060b" metalness={0.6} mirror={0.6} />
      </mesh>
      <gridHelper args={[16, 32, PURPLE_DEEP, "#1d1428"]} position={[0, 0.002, 0]} />
      <GlowHalo />
      <pointLight position={[0, 0.4, 0]} intensity={6} distance={5} color={PURPLE} />
      <ContactShadows position={[0, 0.003, 0]} opacity={0.7} scale={10} blur={2.4} far={3} />
      <OrbitControls makeDefault enablePan enableDamping dampingFactor={0.08} minDistance={3.5} maxDistance={13} maxPolarAngle={Math.PI / 2.05} autoRotate autoRotateSpeed={0.6} target={[0, 0.7, 0]} />
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
