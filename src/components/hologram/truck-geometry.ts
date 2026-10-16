import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Curved body panels for the procedural semi. Side profiles are drawn in the truck's
 * x (forward) / y (up) plane and extruded across the width (z) with a rounded bevel,
 * which gives a believable silhouette while keeping every panel a separate clickable mesh.
 */
type Pt = [number, number];

function extrude(shape: THREE.Shape, width: number, bevel = 0.06, curveSegments = 24) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 5, curveSegments });
  g.translate(0, 0, -width / 2);
  g.computeVertexNormals();
  return g;
}

/** Long-nose hood: flat sides, crowned top that rolls down into the grille. */
const hoodShape = new THREE.Shape();
hoodShape.moveTo(2.2, 1.16);
hoodShape.lineTo(4.28, 1.16);
hoodShape.lineTo(4.3, 1.82);
hoodShape.quadraticCurveTo(4.3, 2.04, 4.02, 2.07);
hoodShape.quadraticCurveTo(3.1, 2.15, 2.2, 2.17);
hoodShape.closePath();
export const HOOD = extrude(hoodShape, 1.48, 0.09);

/** Cab with raked windshield and rounded roof. */
const cabShape = new THREE.Shape();
cabShape.moveTo(0.75, 1.16);
cabShape.lineTo(2.22, 1.16);
cabShape.lineTo(2.24, 2.16);
cabShape.lineTo(1.98, 2.96);
cabShape.quadraticCurveTo(1.9, 3.08, 1.7, 3.08);
cabShape.lineTo(0.75, 3.08);
cabShape.closePath();
export const CAB = extrude(cabShape, 2.12, 0.08);
export const WINDSHIELD_ANGLE = Math.atan2(0.26, 0.8);

/** Sleeper with an aero roof fairing that sweeps up from the cab roof. */
const sleeperShape = new THREE.Shape();
sleeperShape.moveTo(-0.92, 1.16);
sleeperShape.lineTo(0.8, 1.16);
sleeperShape.lineTo(0.8, 3.06);
sleeperShape.bezierCurveTo(0.6, 3.3, 0.3, 3.44, -0.1, 3.46);
sleeperShape.lineTo(-0.72, 3.46);
sleeperShape.quadraticCurveTo(-0.92, 3.46, -0.92, 3.26);
sleeperShape.closePath();
export const SLEEPER = extrude(sleeperShape, 2.2, 0.08);

/** Side window outline (flat, sits on the cab door). */
const win = new THREE.Shape();
([[1.12, 2.3], [2.02, 2.3], [1.84, 2.88], [1.12, 2.88]] as Pt[]).forEach(([x, y], i) => (i ? win.lineTo(x, y) : win.moveTo(x, y)));
win.closePath();
export const SIDE_WINDOW = new THREE.ShapeGeometry(win);

/** Swept front fender arching over the steer tire, running back into a step. */
export function fender(cx: number, cy: number) {
  const s = new THREE.Shape();
  s.moveTo(cx + 0.82, cy - 0.02);
  s.absarc(cx, cy, 0.82, 0, Math.PI, false);
  s.lineTo(cx - 0.68, cy - 0.02);
  s.absarc(cx, cy, 0.68, Math.PI, 0, true);
  s.closePath();
  return extrude(s, 0.36, 0.04, 40);
}

/** Rounded-rectangle bumper profile extruded across the truck. */
const bump = new THREE.Shape();
bump.moveTo(4.3, 0.7);
bump.lineTo(4.52, 0.7);
bump.quadraticCurveTo(4.64, 0.7, 4.64, 0.82);
bump.lineTo(4.64, 0.98);
bump.quadraticCurveTo(4.64, 1.08, 4.52, 1.08);
bump.lineTo(4.3, 1.08);
bump.closePath();
export const BUMPER = extrude(bump, 2.36, 0.05);

/** Grille surround: chrome frame with an open centre. */
const gr = new THREE.Shape();
gr.moveTo(-0.55, -0.52); gr.lineTo(0.55, -0.52); gr.lineTo(0.55, 0.52); gr.lineTo(-0.55, 0.52); gr.closePath();
const hole = new THREE.Path();
hole.moveTo(-0.47, -0.44); hole.lineTo(-0.47, 0.44); hole.lineTo(0.47, 0.44); hole.lineTo(0.47, -0.44); hole.closePath();
gr.holes.push(hole);
export const GRILLE_FRAME = new THREE.ExtrudeGeometry(gr, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 });

/** Tyre cross-section revolved around the axle (y axis in the wheel group). */
const tyrePts: Pt[] = [[0.33, -0.14], [0.42, -0.145], [0.49, -0.13], [0.515, -0.1], [0.52, -0.05], [0.52, 0.05], [0.515, 0.1], [0.49, 0.13], [0.42, 0.145], [0.33, 0.14]];
export const TYRE = new THREE.LatheGeometry(tyrePts.map(([r, y]) => new THREE.Vector2(r, y)), 48);

/** Dished steel/alloy rim face with a raised hub. */
const rimPts: Pt[] = [[0.0, 0.12], [0.1, 0.125], [0.14, 0.1], [0.24, 0.085], [0.3, 0.11], [0.335, 0.14], [0.335, -0.14], [0.3, -0.12], [0.0, -0.11]];
export const RIM = new THREE.LatheGeometry(rimPts.map(([r, y]) => new THREE.Vector2(r, y)), 40);

// ---------------------------------------------------------------------------
// Heavy-truck tyres (295/75R22.5-style proportions). All tyre geometry is built once and
// shared by every wheel; tread lugs are merged into one geometry so each tyre stays a few draw calls.
// Wheel-group space: axle = y, outward sidewall = +y (wheels mirror the rim on the far side).

const TREAD_BASE = 0.49;
const TREAD_TOP = 0.525;
const HALF_W = 0.135;

/** Carcass: thick sidewalls that bulge past the tread width, rounded shoulders, bead seat on the rim. */
const carcassPts: Pt[] = [
  [0.335, -0.118], [0.36, -0.13], [0.39, -0.148], [0.42, -0.158], [0.45, -0.158], [0.475, -0.15], [0.488, -0.135], [TREAD_BASE + 0.004, -0.11],
  [TREAD_BASE + 0.004, 0.11], [0.488, 0.135], [0.475, 0.15], [0.45, 0.158], [0.42, 0.158], [0.39, 0.148], [0.36, 0.13], [0.335, 0.118],
];
export const TYRE_CARCASS = new THREE.LatheGeometry(carcassPts.map(([r, y]) => new THREE.Vector2(r, y)), 64);

/** Raised concentric sidewall ribs (rim-protector + mid-wall lines) on both faces. */
function sidewallRibs() {
  const parts: THREE.BufferGeometry[] = [];
  for (const side of [1, -1]) {
    for (const [r, y] of [[0.352, 0.128], [0.402, 0.156], [0.468, 0.154]] as Pt[]) {
      const g = new THREE.TorusGeometry(r, 0.0065, 6, 72);
      g.rotateX(Math.PI / 2);
      g.translate(0, side * (y + 0.004), 0);
      parts.push(g);
    }
  }
  return mergeGeometries(parts)!;
}
export const TYRE_RIBS = sidewallRibs();

/** A lug block wrapped onto the tread: tangential length, axial width, axial centre, skew. */
function lugRing(n: number, len: number, width: number, yc: number, phase: number, skew: number) {
  const out: THREE.BufferGeometry[] = [];
  const h = TREAD_TOP - TREAD_BASE;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + phase;
    const b = new THREE.BoxGeometry(h, width, len);
    b.rotateX(skew);
    b.translate(TREAD_BASE + h / 2, yc, 0);
    b.rotateY(a);
    out.push(b);
  }
  return out;
}

/** Steer tread: four continuous circumferential ribs (deep grooves between) with siped shoulder blocks. */
function steerTread() {
  const parts: THREE.BufferGeometry[] = [];
  const h = TREAD_TOP - TREAD_BASE;
  for (const [y0, y1] of [[-0.075, -0.035], [-0.02, 0.02], [0.035, 0.075]] as Pt[]) {
    const prof = [new THREE.Vector2(TREAD_BASE, y0), new THREE.Vector2(TREAD_BASE + h, y0 + 0.003), new THREE.Vector2(TREAD_BASE + h, y1 - 0.003), new THREE.Vector2(TREAD_BASE, y1)];
    parts.push(new THREE.LatheGeometry(prof, 72).toNonIndexed());
  }
  for (const yc of [-0.108, 0.108]) parts.push(...lugRing(44, 0.06, 0.042, yc, 0, 0).map((g) => g.toNonIndexed()));
  return mergeGeometries(parts)!;
}

/** Drive tread: deep, open-shoulder lateral lugs in two staggered, chevroned rows for traction. */
function driveTread() {
  const parts = [...lugRing(30, 0.075, 0.12, -0.066, 0, 0.32), ...lugRing(30, 0.075, 0.12, 0.066, Math.PI / 30, -0.32)].map((g) => g.toNonIndexed());
  // thin centre rib ties the rows together like real drive casings
  parts.push(new THREE.LatheGeometry([new THREE.Vector2(TREAD_BASE, -0.008), new THREE.Vector2(TREAD_BASE + 0.022, -0.006), new THREE.Vector2(TREAD_BASE + 0.022, 0.006), new THREE.Vector2(TREAD_BASE, 0.008)], 72).toNonIndexed());
  return mergeGeometries(parts)!;
}
export const STEER_TREAD = steerTread();
export const DRIVE_TREAD = driveTread();

/** Ten hex lug nuts + their washers merged into one mesh, on a 0.2 bolt circle, outward face. */
function lugNuts() {
  const parts: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 10; k++) {
    const a = (k * Math.PI) / 5;
    const nut = new THREE.CylinderGeometry(0.019, 0.019, 0.034, 6);
    nut.translate(Math.cos(a) * 0.2, 0.158, Math.sin(a) * 0.2);
    const cap = new THREE.SphereGeometry(0.0145, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    cap.translate(Math.cos(a) * 0.2, 0.175, Math.sin(a) * 0.2);
    const washer = new THREE.CylinderGeometry(0.025, 0.025, 0.006, 16);
    washer.translate(Math.cos(a) * 0.2, 0.14, Math.sin(a) * 0.2);
    parts.push(nut.toNonIndexed(), cap.toNonIndexed(), washer.toNonIndexed());
  }
  return mergeGeometries(parts)!;
}
export const LUG_NUTS = lugNuts();

/** Polished domed hub cap with a flange ring. */
const hubPts: Pt[] = [[0, 0.215], [0.04, 0.212], [0.075, 0.2], [0.1, 0.18], [0.115, 0.16], [0.14, 0.155], [0.145, 0.14], [0.11, 0.135]];
export const HUB_CAP = new THREE.LatheGeometry(hubPts.map(([r, y]) => new THREE.Vector2(r, y)), 40);

/** Valve stem: angled brass stem with a cap, poking out of the rim between two lugs. */
function valve() {
  const stem = new THREE.CylinderGeometry(0.007, 0.009, 0.07, 8);
  stem.rotateZ(-0.9);
  stem.translate(0.285, 0.135, 0);
  const cap = new THREE.CylinderGeometry(0.01, 0.01, 0.018, 8);
  cap.rotateZ(-0.9);
  cap.translate(0.258, 0.158, 0);
  const g = mergeGeometries([stem.toNonIndexed(), cap.toNonIndexed()])!;
  g.rotateY(Math.PI / 10);
  return g;
}
export const VALVE_STEM = valve();

/** Flat annulus on the sidewall with polar UVs (u around, v radial) so a text texture wraps around the tyre. */
function letterBand() {
  const segs = 128, r0 = 0.41, r1 = 0.448, y = 0.1615;
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    for (const [j, r] of [r0, r1].entries()) { pos.push(Math.cos(a) * r, y, -Math.sin(a) * r); uv.push(i / segs, j); }
    if (i < segs) { const b = i * 2; idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
export const LETTER_BAND = letterBand();

// ---------------------------------------------------------------------------
// Fifth-wheel coupling (generic representative design, not an OEM part drawing).

/** Top plate seen from above (x forward, shape-y = -z): round plate with a rear V-throat ramping into the kingpin slot. */
function fifthPlate() {
  const R = 0.62, gap = 0.3, slot = 0.045;
  const s = new THREE.Shape();
  s.absarc(0, 0, R, -Math.PI + gap, Math.PI - gap, false);
  s.lineTo(-0.3, slot);
  s.lineTo(0.0, slot);
  s.absarc(0, 0, slot, Math.PI / 2, -Math.PI / 2, true);
  s.lineTo(-0.3, -slot);
  s.closePath();
  // lube pockets
  for (const [x, y] of [[0.3, 0.3], [0.3, -0.3], [-0.05, 0.45], [-0.05, -0.45]] as Pt[]) {
    const h = new THREE.Path(); h.absellipse(x, y, 0.07, 0.035, 0, Math.PI * 2, false, Math.atan2(y, x) + Math.PI / 2); s.holes.push(h);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 40 });
  g.rotateX(-Math.PI / 2);
  return g;
}
export const FIFTH_PLATE = fifthPlate();

/** Underside ribs + rear approach ramps that drop below the plate either side of the throat. */
function fifthUnder() {
  const parts: THREE.BufferGeometry[] = [];
  for (const z of [-0.3, 0, 0.3]) { if (z === 0) continue; const b = new THREE.BoxGeometry(1.1, 0.09, 0.03); b.translate(0, -0.045, z); parts.push(b); }
  for (const z of [-0.42, 0.42]) { const b = new THREE.BoxGeometry(0.03, 0.09, 0.5); b.translate(0.15, -0.045, z); parts.push(b); }
  for (const s of [1, -1]) { const r = new THREE.BoxGeometry(0.35, 0.03, 0.28); r.rotateZ(0.35); r.translate(-0.7, -0.03, s * 0.28); parts.push(r); }
  return mergeGeometries(parts)!;
}
export const FIFTH_UNDER = fifthUnder();

/** Locking jaw block around the kingpin + secondary lock bar and the pull-release handle on the driver side. */
function fifthJaw() {
  const parts: THREE.BufferGeometry[] = [];
  const j = new THREE.BoxGeometry(0.22, 0.1, 0.24); j.translate(0.04, -0.07, 0); parts.push(j);
  const bar = new THREE.CylinderGeometry(0.015, 0.015, 0.5, 8); bar.rotateX(Math.PI / 2); bar.translate(0.12, -0.1, -0.3); parts.push(bar.toNonIndexed() as THREE.BufferGeometry);
  const handle = new THREE.TorusGeometry(0.045, 0.01, 6, 16); handle.translate(0.12, -0.1, -0.58); parts.push(handle);
  return mergeGeometries(parts.map((p) => (p.index ? p.toNonIndexed() : p)))!;
}
export const FIFTH_JAW = fifthJaw();

/** Rocker brackets bolted to the frame rails with the cross pivot pin (lets the plate articulate fore/aft). */
function fifthMount() {
  const parts: THREE.BufferGeometry[] = [];
  for (const z of [-0.45, 0.45]) {
    const s = new THREE.Shape(); s.moveTo(-0.22, 0); s.lineTo(0.22, 0); s.lineTo(0.1, 0.16); s.lineTo(-0.1, 0.16); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: false }); g.translate(0, 0, z - 0.02); parts.push(g.toNonIndexed());
    const pl = new THREE.BoxGeometry(0.7, 0.025, 0.14); pl.translate(0, 0, z); parts.push(pl.toNonIndexed());
    for (const x of [-0.25, -0.1, 0.1, 0.25]) { const b = new THREE.CylinderGeometry(0.014, 0.014, 0.03, 6); b.translate(x, 0.025, z); parts.push(b.toNonIndexed()); }
  }
  const pin = new THREE.CylinderGeometry(0.035, 0.035, 1.0, 12); pin.rotateX(Math.PI / 2); pin.translate(0, 0.12, 0); parts.push(pin.toNonIndexed());
  return mergeGeometries(parts)!;
}
export const FIFTH_MOUNT = fifthMount();

// ---------------------------------------------------------------------------
// Tractor-to-trailer lines: coiled air hoses + electrical cord hung from a deck-plate stand.

/** Helical coil wrapped around a path from a to b. */
export function coil(a: THREE.Vector3Tuple, b: THREE.Vector3Tuple, turns: number, rad: number, phase = 0, thick = 0.014) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const dir = B.clone().sub(A);
  const ax = dir.clone().normalize();
  const u = new THREE.Vector3(0, 1, 0).cross(ax).normalize();
  if (u.lengthSq() < 1e-4) u.set(1, 0, 0);
  const v = ax.clone().cross(u).normalize();
  const n = turns * 16, pts: THREE.Vector3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, th = t * turns * Math.PI * 2 + phase;
    const sag = Math.sin(t * Math.PI) * -0.12; // coils droop under their own weight
    pts.push(A.clone().addScaledVector(dir, t).addScaledVector(u, Math.cos(th) * rad).addScaledVector(v, Math.sin(th) * rad).add(new THREE.Vector3(0, sag, 0)));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 2, thick, 6, false);
}

/** Gladhand coupler: round body + flat seal face + tab. */
function gladhand() {
  const body = new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16);
  const tab = new THREE.BoxGeometry(0.09, 0.02, 0.03); tab.translate(0.05, 0, 0);
  const neck = new THREE.CylinderGeometry(0.012, 0.012, 0.06, 8); neck.rotateZ(Math.PI / 2); neck.translate(-0.05, 0, 0);
  return mergeGeometries([body.toNonIndexed(), tab.toNonIndexed(), neck.toNonIndexed()])!;
}
export const GLADHAND = gladhand();

/** 7-way electrical plug: cylinder with ribbed grip. */
function sevenWay() {
  const parts = [new THREE.CylinderGeometry(0.04, 0.04, 0.09, 16).toNonIndexed()];
  for (const y of [-0.025, 0, 0.025]) { const r = new THREE.TorusGeometry(0.042, 0.005, 4, 16); r.rotateX(Math.PI / 2); r.translate(0, y, 0); parts.push(r.toNonIndexed()); }
  return mergeGeometries(parts)!;
}
export const SEVEN_WAY = sevenWay();

/** P-clamps along the frame rail for routed lines; merged into one mesh. */
export function clamps(points: THREE.Vector3Tuple[], r = 0.03) {
  return mergeGeometries(points.map(([x, y, z]) => { const t = new THREE.TorusGeometry(r, 0.008, 5, 12); t.rotateY(Math.PI / 2); t.translate(x, y, z); return t.toNonIndexed(); }))!;
}
