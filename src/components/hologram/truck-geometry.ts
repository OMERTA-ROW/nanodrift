import * as THREE from "three";

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
