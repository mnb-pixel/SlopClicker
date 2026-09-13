import * as THREE from 'three';
import { createVoxelKit } from './voxelModel';

// Datenleitung von einer Zone zum Ofen: ein Kabelkanal, der AUF DEM BODEN liegt.
//
// Vorher war das ein Bogen, der über die Zone hinweg in gut zweieinhalb Einheiten Höhe
// zum Ofen schwebte, auf zwei dünnen Stützen. In der Isometrie kreuzte dieser Bogen die
// Gebäude dahinter und legte sich quer über die halbe Insel - er verdeckte genau das,
// wofür man kauft. Jetzt liegt die Leitung flach im Gras: eine Betonrinne mit Deckel,
// darin ein Glasstreifen, durch den die Tokens laufen. Das ist auch das ehrlichere Bild -
// Glasfaser liegt im Graben, nicht in der Luft.
//
// `worldPoints` sind Kurvenpunkte in Weltkoordinaten; `groupPosition` ist die Position
// der Zonen-Gruppe, in die die Leitung eingehängt wird (alles wird lokal umgerechnet).

const TOKEN_MAX = 40;
const TOKENS_BY_TIER = [0, 6, 10, 16, 24, 32, 40, 40];

// Höhe der Rinne über dem Rasen. Bewusst winzig: der Deckel soll aufliegen, nicht
// schweben, und trotzdem nicht mit der Grasplatte z-fighten.
const TRENCH_Y = 0.07;
// Wie viele Deckelplatten die Rinne bekommt. Eine pro Kurvenabschnitt, instanziert.
const SLAB_COUNT = 26;

function hash01(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function buildDataLine(palette, worldPoints, groupPosition, facingDir) {
  const group = new THREE.Group();
  const mats = {};
  const basic = (key, extra = {}) => {
    const m = new THREE.MeshBasicMaterial({ color: palette[key], ...extra });
    (mats[key] = mats[key] || []).push(m);
    return m;
  };

  const curve = new THREE.CatmullRomCurve3(worldPoints.map((v) => v.clone().sub(groupPosition)));
  const yaw = Math.atan2(facingDir.x, facingDir.y);

  // Deckelplatten: kurze Betonstücke, die der Kurve folgen und jeweils in ihre
  // Laufrichtung gedreht sind. Instanziert - ein Draw Call für die ganze Strecke.
  // Die Platten überlappen sich leicht (Länge aus der tatsächlichen Kurvenlänge plus
  // Zuschlag), sonst klaffen in den Kurven Lücken zwischen ihnen.
  const slabLen = (curve.getLength() / SLAB_COUNT) * 1.35;
  const kit = createVoxelKit(palette);
  // Deckelplatte als Voxel-Modell (Raster 0,05): Betonplatte mit Kantenfase, Gitterrost
  // beidseits des Glasstreifens und zwei Hebeösen.
  const slabVox = Math.max(4, Math.round(slabLen / 0.05));
  const slabGeo = kit.geo((m) => {
    m.box(-9, 0, 0, 18, 3, slabVox, 'path', { noise: 0.04, seed: 3 });
    for (let z = 0; z < slabVox; z += 1) {
      for (let x = -8; x < 8; x += 1) {
        if (x >= -3 && x < 3) continue;
        if ((x + z) % 2 === 0) m.set(x, 2, z, 'stoneDark', 0.9);
      }
    }
    m.set(-6, 3, 1, 'steel');
    m.set(5, 3, slabVox - 2, 'steel');
  }, { unit: 0.05, origin: [0, 1.5, slabVox / 2] });
  const slab = new THREE.InstancedMesh(slabGeo, kit.mats, SLAB_COUNT);
  slab.receiveShadow = true;
  slab.frustumCulled = false;
  group.add(slab);

  // Glasstreifen in der Mitte der Rinne: das Sichtfenster auf die Tokens. Liegt eine
  // Haaresbreite über dem Deckel, damit er nicht durch ihn hindurchblitzt.
  const glass = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.3, 0.04, slabLen),
    basic('tube', { transparent: true, opacity: 0.5, depthWrite: false }),
    SLAB_COUNT
  );
  glass.frustumCulled = false;
  group.add(glass);

  const dummy = new THREE.Object3D();
  for (let i = 0; i < SLAB_COUNT; i += 1) {
    const u = (i + 0.5) / SLAB_COUNT;
    const pt = curve.getPointAt(u);
    const tan = curve.getTangentAt(u);
    const segYaw = Math.atan2(tan.x, tan.z);
    dummy.position.set(pt.x, TRENCH_Y, pt.z);
    dummy.rotation.set(0, segYaw, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    slab.setMatrixAt(i, dummy.matrix);
    dummy.position.set(pt.x, TRENCH_Y + 0.08, pt.z);
    dummy.updateMatrix();
    glass.setMatrixAt(i, dummy.matrix);
  }
  slab.instanceMatrix.needsUpdate = true;
  glass.instanceMatrix.needsUpdate = true;

  // Verteilerkasten am Zonenende: steht weiterhin aufrecht, er ist ja ein Schrank.
  const jp = curve.getPointAt(0);
  // Verteilerkasten: Schrank mit Lüftungsschlitzen, Tür, Warnschild und Status-LED.
  const junctionGeo = kit.geo((m) => {
    m.box(-8, 0, -5, 16, 22, 10, 'junction', { noise: 0.03, seed: 5 });
    m.box(-8, 0, -5, 16, 1, 10, 'steelDark');
    m.box(-6, 3, 5, 12, 16, 1, 'junction', { noise: 0 });
    for (let y = 5; y < 12; y += 2) for (let x = -5; x < 6; x += 1) m.set(x, y, 5, 'junction', 0.6);
    m.box(-4, 14, 5, 8, 3, 1, 'tapeYellow');
    m.set(-1, 15, 5, 'tapeBlack');
    m.set(0, 15, 5, 'tapeBlack');
    m.set(5, 9, 6, 'steel');
    m.box(-8, 22, -5, 16, 1, 10, 'steelDark');
  }, { unit: 0.05, unlit: new Set(['token', 'tapeYellow']) });
  const junction = new THREE.Mesh(junctionGeo, kit.mats);
  junction.position.set(jp.x, 0, jp.z);
  junction.rotation.y = yaw;
  junction.castShadow = true;
  group.add(junction);
  // Status-LED oben an der Tür, blinkt (siehe update).
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.06), basic('token'));
  led.position.set(jp.x + Math.sin(yaw) * 0.28 - Math.cos(yaw) * 0.25, 1.0, jp.z + Math.cos(yaw) * 0.28 + Math.sin(yaw) * 0.25);
  group.add(led);

  // Anschlusskasten am Ofensockel: flacher als vorher, die Leitung kommt jetzt von
  // unten statt von oben an.
  const pp = curve.getPointAt(1);
  const portGeo = kit.geo((m) => {
    m.box(-7, 0, -5, 14, 9, 10, 'junction', { noise: 0.03, seed: 6 });
    m.box(-7, 9, -5, 14, 1, 10, 'steelDark');
    m.box(-5, 2, 5, 10, 5, 1, 'steelDark');
    for (let x = -4; x < 5; x += 2) m.box(x, 3, 5, 1, 3, 1, 'token');
  }, { unit: 0.05, unlit: new Set(['token']) });
  const port = new THREE.Mesh(portGeo, kit.mats);
  port.position.set(pp.x, 0, pp.z);
  port.rotation.y = yaw;
  group.add(port);

  const token = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.16, 0), basic('token'), TOKEN_MAX);
  token.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  token.count = 0;
  token.frustumCulled = false;
  group.add(token);
  const phase = Float32Array.from({ length: TOKEN_MAX }, (_, i) => hash01(i + 40));
  // Seitlicher Versatz innerhalb der Rinne. Vorher war das ein Kreis um die Röhre; in
  // einer flachen Rinne gibt es nur noch links/rechts, die Höhe ist fest.
  const lane = Float32Array.from({ length: TOKEN_MAX }, (_, i) => (hash01(i + 80) - 0.5) * 0.22);
  const tokenDummy = new THREE.Object3D();
  const tan = new THREE.Vector3();

  return {
    group,
    update(tier, dt, t, reduced) {
      const count = TOKENS_BY_TIER[Math.min(7, Math.max(0, tier))];
      token.count = count;
      if (count > 0) {
        const speed = reduced ? 0 : 0.45 + tier * 0.06;
        for (let i = 0; i < count; i += 1) {
          // ((x % 1) + 1) % 1 statt x % 1: JS behält beim Restoperator das Vorzeichen
          // des Dividenden, ein negatives u wirft in curve.getPointAt(). dt ist zwar seit
          // CampusScene.jsx nie mehr negativ, aber die Kurve ist die einzige Stelle, an
          // der ein Ausrutscher hier nicht nur schlecht aussieht, sondern die ganze
          // Render-Loop abbricht.
          phase[i] = ((phase[i] + dt * speed * (0.85 + hash01(i) * 0.3)) % 1 + 1) % 1;
          const pt = curve.getPointAt(phase[i]);
          curve.getTangentAt(phase[i], tan);
          // Quer zur Laufrichtung ausweichen statt in beliebige Richtung: sonst wandern
          // die Tokens in den Kurven aus der Rinne heraus.
          tokenDummy.position.set(
            pt.x + -tan.z * lane[i],
            TRENCH_Y + 0.1,
            pt.z + tan.x * lane[i]
          );
          tokenDummy.rotation.set(t * 3 + i, t * 2, 0);
          tokenDummy.scale.setScalar(0.8 + hash01(i + 5) * 0.4);
          tokenDummy.updateMatrix();
          token.setMatrixAt(i, tokenDummy.matrix);
        }
        token.instanceMatrix.needsUpdate = true;
      }
      led.visible = reduced ? true : Math.sin(t * 5) > -0.2;
    },
    applyPalette(p) {
      kit.applyPalette(p);
      Object.entries(mats).forEach(([key, list]) => list.forEach((m) => m.color.setHex(p[key])));
    },
  };
}

// Standard-Streckenführung: Verteilerkasten hinten in der Zone, dann flach über den
// Rasen zum Anschluss am Ofensockel. `anchor` ist der Zonen-Anker, `furnace` der
// Ofen-Anker (beide {x, z}). Liefert Weltpunkte und die Blickrichtung zum Ofen.
// `portDir` (optional, {x, z}): Richtung vom Ofenmittelpunkt zum Anschluss - damit die
// Leitung einer Zone HINTER dem Ofen an dessen sichtbarer Seite ankommt.
//
// Alle Punkte liegen auf y = 0: die Leitung ist ein Graben, kein Bogen. Der leichte
// Schwung nach außen (sideOffset) bleibt - er hält die Rinne neben den Gebäuden statt
// mitten durch sie hindurch.
export function defaultLineRoute(anchor, furnace, sideOffset = 1.2, portDir = null) {
  const dir = new THREE.Vector2(furnace.x - anchor.x, furnace.z - anchor.z).normalize();
  const perp = new THREE.Vector2(-dir.y, dir.x);
  const pd = portDir ? new THREE.Vector2(portDir.x, portDir.z).normalize() : dir.clone().negate();
  const port = new THREE.Vector3(furnace.x + pd.x * 3.3, 0, furnace.z + pd.y * 3.3);
  const start = new THREE.Vector3(
    anchor.x - dir.x * 2.2 + perp.x * sideOffset,
    0,
    anchor.z - dir.y * 2.2 + perp.y * sideOffset
  );
  const points = [
    start,
    new THREE.Vector3(anchor.x - dir.x * 0.5 + perp.x * sideOffset, 0, anchor.z - dir.y * 0.5 + perp.y * sideOffset),
    new THREE.Vector3(anchor.x + dir.x * 3.0 + perp.x * sideOffset * 0.6, 0, anchor.z + dir.y * 3.0 + perp.y * sideOffset * 0.6),
    new THREE.Vector3(port.x + pd.x * 1.8, 0, port.z + pd.y * 1.8),
    port,
  ];
  return { points, dir };
}
