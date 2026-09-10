import * as THREE from 'three';

// Datenleitung von einer Zone zum Ofen: transparente Glasröhre mit dunklem Kern,
// Verteilerkasten am Anfang, Anschlusskasten am Ende, Stützen unter dem hohen Teil,
// und Tokens, die hindurchrasen. Wird vom Büro und vom Serverkeller genutzt.
//
// `worldPoints` sind Kurvenpunkte in Weltkoordinaten; `groupPosition` ist die Position
// der Zonen-Gruppe, in die die Leitung eingehängt wird (alles wird lokal umgerechnet).

const TOKEN_MAX = 40;
const TOKENS_BY_TIER = [0, 6, 10, 16, 24, 32, 40, 40];

function hash01(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function buildDataLine(palette, worldPoints, groupPosition, facingDir) {
  const group = new THREE.Group();
  const mats = {};
  const lambert = (key, extra = {}) => {
    const m = new THREE.MeshLambertMaterial({ color: palette[key], flatShading: true, ...extra });
    (mats[key] = mats[key] || []).push(m);
    return m;
  };
  const basic = (key, extra = {}) => {
    const m = new THREE.MeshBasicMaterial({ color: palette[key], ...extra });
    (mats[key] = mats[key] || []).push(m);
    return m;
  };

  const curve = new THREE.CatmullRomCurve3(worldPoints.map((v) => v.clone().sub(groupPosition)));
  const yaw = Math.atan2(facingDir.x, facingDir.y);

  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 48, 0.26, 8, false),
    basic('tube', { transparent: true, opacity: 0.4, depthWrite: false })
  );
  group.add(tube);
  const core = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.09, 6, false), lambert('junction'));
  group.add(core);

  [0.3, 0.6].forEach((u) => {
    const pt = curve.getPointAt(u);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, Math.max(0.2, pt.y), 5), lambert('deskLeg'));
    pole.position.set(pt.x, pt.y / 2, pt.z);
    group.add(pole);
  });

  const jp = curve.getPointAt(0);
  const junction = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.5), lambert('junction'));
  junction.position.set(jp.x, 0.55, jp.z);
  junction.rotation.y = yaw;
  junction.castShadow = true;
  group.add(junction);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.07, 5, 4), basic('token'));
  led.position.set(jp.x + Math.sin(yaw) * 0.28, 1.0, jp.z + Math.cos(yaw) * 0.28);
  group.add(led);

  const pp = curve.getPointAt(1);
  const port = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.5), lambert('junction'));
  port.position.set(pp.x, 0.4, pp.z);
  port.rotation.y = yaw;
  group.add(port);

  const token = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.19, 0), basic('token'), TOKEN_MAX);
  token.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  token.count = 0;
  token.frustumCulled = false;
  group.add(token);
  const phase = Float32Array.from({ length: TOKEN_MAX }, (_, i) => hash01(i + 40));
  const lane = Float32Array.from({ length: TOKEN_MAX }, (_, i) => hash01(i + 80) * Math.PI * 2);
  const dummy = new THREE.Object3D();

  return {
    group,
    update(tier, dt, t, reduced) {
      const count = TOKENS_BY_TIER[Math.min(7, Math.max(0, tier))];
      token.count = count;
      if (count > 0) {
        const speed = reduced ? 0 : 0.45 + tier * 0.06;
        for (let i = 0; i < count; i += 1) {
          phase[i] = (phase[i] + dt * speed * (0.85 + hash01(i) * 0.3)) % 1;
          const pt = curve.getPointAt(phase[i]);
          dummy.position.set(pt.x + Math.cos(lane[i]) * 0.1, pt.y + Math.sin(lane[i]) * 0.1, pt.z + Math.sin(lane[i] * 0.7) * 0.1);
          dummy.rotation.set(t * 3 + i, t * 2, 0);
          dummy.scale.setScalar(0.8 + hash01(i + 5) * 0.4);
          dummy.updateMatrix();
          token.setMatrixAt(i, dummy.matrix);
        }
        token.instanceMatrix.needsUpdate = true;
      }
      led.visible = reduced ? true : Math.sin(t * 5) > -0.2;
    },
    applyPalette(p) {
      Object.entries(mats).forEach(([key, list]) => list.forEach((m) => m.color.setHex(p[key])));
    },
  };
}

// Standard-Streckenführung: Verteilerkasten hinten in der Zone, hoch über die Zone,
// hinunter zum Anschluss am Ofensockel. `anchor` ist der Zonen-Anker, `furnace` der
// Ofen-Anker (beide {x, z}). Liefert Weltpunkte und die Blickrichtung zum Ofen.
// `portDir` (optional, {x, z}): Richtung vom Ofenmittelpunkt zum Anschluss - damit die
// Leitung einer Zone HINTER dem Ofen an dessen sichtbarer Seite ankommt.
export function defaultLineRoute(anchor, furnace, sideOffset = 1.2, portDir = null) {
  const dir = new THREE.Vector2(furnace.x - anchor.x, furnace.z - anchor.z).normalize();
  const perp = new THREE.Vector2(-dir.y, dir.x);
  const pd = portDir ? new THREE.Vector2(portDir.x, portDir.z).normalize() : dir.clone().negate();
  const port = new THREE.Vector3(furnace.x + pd.x * 3.3, 0.7, furnace.z + pd.y * 3.3);
  const start = new THREE.Vector3(
    anchor.x - dir.x * 2.2 + perp.x * sideOffset,
    1.1,
    anchor.z - dir.y * 2.2 + perp.y * sideOffset
  );
  const points = [
    start,
    new THREE.Vector3(anchor.x - dir.x * 0.5 + perp.x * sideOffset * 0.5, 2.5, anchor.z - dir.y * 0.5 + perp.y * sideOffset * 0.5),
    new THREE.Vector3(anchor.x + dir.x * 3.0, 2.6, anchor.z + dir.y * 3.0),
    new THREE.Vector3(port.x + pd.x * 1.6, 1.8, port.z + pd.y * 1.6),
    port,
  ];
  return { points, dir };
}
