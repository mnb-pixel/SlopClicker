import * as THREE from 'three';

// Gebäudehüllen auf den Grundstücken einer Zone (siehe utils/campusLayout.js).
//
// Ein Grundstück = ein Haus. Die Hülle ist bewusst halboffen gebaut: Bodenplatte,
// zwei geschlossene Wände auf den KAMERAABGEWANDTEN Seiten (-x, -z), Stützen und eine
// Attika obendrauf. In der Isometrie sieht man dadurch in das Haus hinein - ein
// geschlossenes Dach würde genau die Praktikanten verdecken, für die das Haus gebaut
// wurde. Lagerhallen (`roof: 'closed'`) haben dagegen ein volles Dach, da ist innen
// nichts zu sehen.
//
// Alles ist instanziert: drei bis vier Draw Calls für beliebig viele Häuser. Jede
// Teilesorte benutzt denselben Einheitswürfel und wird pro Instanz skaliert.

const PARTS_PER_LOT = { struct: 4, trim: 8, glass: 2, accent: 2 };

export function buildLotShells(palette, opts = {}) {
  const {
    max = 6,
    size = 3.3,
    height = 2.0,
    wallKey = 'facade',
    trimKey = 'steelDark',
    glassKey = 'screen',
    roof = 'open',
    accentKey = 'neon',
  } = opts;

  const group = new THREE.Group();
  const mats = {};
  const unit = new THREE.BoxGeometry(1, 1, 1);

  const lambert = (key) => {
    const m = new THREE.MeshLambertMaterial({ color: palette[key], flatShading: true });
    (mats[key] = mats[key] || []).push(m);
    return m;
  };
  const basic = (key) => {
    const m = new THREE.MeshBasicMaterial({ color: palette[key] });
    (mats[key] = mats[key] || []).push(m);
    return m;
  };
  const inst = (mat, perLot, shadow) => {
    const m = new THREE.InstancedMesh(unit, mat, Math.max(1, max * perLot));
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.count = 0;
    m.frustumCulled = false;
    m.castShadow = shadow;
    m.receiveShadow = true;
    group.add(m);
    return m;
  };

  const struct = inst(lambert(wallKey), PARTS_PER_LOT.struct, true);
  const trim = inst(lambert(trimKey), PARTS_PER_LOT.trim, true);
  const glass = inst(basic(glassKey), PARTS_PER_LOT.glass, false);
  const accent = inst(basic(accentKey), PARTS_PER_LOT.accent, false);

  const dummy = new THREE.Object3D();
  const half = size / 2;
  const wallT = 0.18;

  // Ein Haus, Teil für Teil. `push` sammelt pro Mesh der Reihe nach, damit die
  // Instanzzähler am Ende einfach count = lots * PARTS_PER_LOT sind.
  function placeLot(lot, idx) {
    const { x, z } = lot;
    let s = idx * PARTS_PER_LOT.struct;
    let tIdx = idx * PARTS_PER_LOT.trim;
    let gIdx = idx * PARTS_PER_LOT.glass;
    let aIdx = idx * PARTS_PER_LOT.accent;

    const put = (mesh, i, px, py, pz, sx, sy, sz) => {
      dummy.position.set(x + px, py, z + pz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(sx, sy, sz);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    };

    // Bodenplatte, zwei Wände, Dach oder Attika-Platzhalter.
    put(struct, s, 0, 0.09, 0, size, 0.18, size);
    put(struct, s + 1, 0, height / 2 + 0.18, -half + wallT / 2, size, height, wallT);
    put(struct, s + 2, -half + wallT / 2, height / 2 + 0.18, 0, wallT, height, size - wallT);
    if (roof === 'closed') {
      put(struct, s + 3, 0, height + 0.3, 0, size + 0.25, 0.2, size + 0.25);
    } else {
      // Halboffen: keine dritte Fläche, aber die Instanz muss gesetzt sein - sonst
      // steht dort die Matrix eines fremden Hauses. Flachgedrückt = unsichtbar.
      put(struct, s + 3, 0, height + 0.3, 0, 0.001, 0.001, 0.001);
    }

    // Stützen an den drei offenen Ecken, Attika auf den beiden offenen Seiten,
    // Mauerkappen auf den Wänden, Lüfterkasten auf dem Dach.
    const post = height + 0.34;
    put(trim, tIdx, half - 0.12, post / 2, -half + 0.12, 0.22, post, 0.22);
    put(trim, tIdx + 1, half - 0.12, post / 2, half - 0.12, 0.22, post, 0.22);
    put(trim, tIdx + 2, -half + 0.12, post / 2, half - 0.12, 0.22, post, 0.22);
    const railY = roof === 'closed' ? height + 0.5 : height + 0.3;
    put(trim, tIdx + 3, 0, railY, half - 0.06, size, 0.22, 0.16);
    put(trim, tIdx + 4, half - 0.06, railY, 0, 0.16, 0.22, size);
    put(trim, tIdx + 5, 0, railY, -half + 0.09, size, 0.22, 0.18);
    put(trim, tIdx + 6, -half + 0.09, railY, 0, 0.18, 0.22, size);
    put(trim, tIdx + 7, -half + 0.75, railY + 0.3, -half + 0.75, 0.7, 0.45, 0.7);

    // Fensterbänder in den beiden Wänden.
    put(glass, gIdx, 0, height * 0.62, -half + 0.06, size * 0.72, 0.46, 0.08);
    put(glass, gIdx + 1, -half + 0.06, height * 0.62, 0, 0.08, 0.46, size * 0.72);

    // Akzent: Schild über dem offenen Eingang plus schmaler Streifen an der Sockelkante.
    put(accent, aIdx, half - 0.02, height * 0.78, half - 0.9, 0.1, 0.34, 1.1);
    put(accent, aIdx + 1, 0, 0.19, half - 0.04, size * 0.8, 0.06, 0.1);
  }

  return {
    group,
    // lots: [{ x, z }] in Zonen-lokalen Koordinaten.
    layout(lots) {
      const n = Math.min(max, lots.length);
      for (let i = 0; i < n; i += 1) placeLot(lots[i], i);
      struct.count = n * PARTS_PER_LOT.struct;
      trim.count = n * PARTS_PER_LOT.trim;
      glass.count = n * PARTS_PER_LOT.glass;
      accent.count = n * PARTS_PER_LOT.accent;
      [struct, trim, glass, accent].forEach((m) => {
        m.instanceMatrix.needsUpdate = true;
      });
      return n;
    },
    applyPalette(p) {
      Object.entries(mats).forEach(([key, list]) => list.forEach((m) => m.color.setHex(p[key])));
    },
  };
}
