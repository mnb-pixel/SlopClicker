import * as THREE from 'three';

// Die Kulisse am Feldrand: eine kleine Stadt an einem See mit Fluss, weit vorne
// jenseits von Büro und Bühne (siehe zonesData.js - die vier Zonen wachsen nur in x,
// nie in z, der Streifen davor bleibt also für immer frei). Rein satirisch: je mehr
// Campus gebaut wird, desto mehr Häuser weichen grauen Unternehmens-Kuben, und der See
// wird kleiner und trüber. Spielzahlen und Punktesystem bleiben davon unberührt - genau
// wie beim Rest der Szene ist das reine Anzeige, gesteuert über einen einzigen
// `progress`-Wert (0..1), abgeleitet aus der Hype-Stufe (1 bis 10, siehe CampusScene.jsx
// und buildCampus.js: dieselbe Stufe steuert dort schon Wege, Bäume und Lichtdrohnen).
//
// Anker der ganzen Kulisse, in Weltkoordinaten. Weit genug vorne (großes z), dass auch
// die maximal ausgebaute Grundstücksgrenze (buildCampus.js: campusRect) nie hineinreicht -
// die wächst nur in x, ihre Frontkante in z bleibt fest bei rund 15 Einheiten.
const ENV_ANCHOR = { x: -15, z: 22 };

// Zwölf Hausplätze, vier Spalten mal drei Reihen, mit etwas Streuung. Reihe für Reihe
// aufsteigend nach z sortiert (unten in der Liste): die Reihe, die dem Campus am
// nächsten liegt (kleinstes z, siehe ENV_ANCHOR-Richtung), weicht bei wachsendem
// `progress` zuerst den Unternehmens-Kuben - "die Innenstadt zuerst".
const HOUSE_ROWS = [-3.1, 0, 3.1];
const HOUSE_COLS = [-4.8, -1.6, 1.6, 4.8];
const HOUSE_SLOTS = [];
HOUSE_ROWS.forEach((rowZ, ri) => {
  HOUSE_COLS.forEach((colX, ci) => {
    const jitter = ((ri * 4 + ci) * 37) % 10;
    HOUSE_SLOTS.push({
      x: colX + (jitter - 5) * 0.08,
      z: rowZ + (jitter - 5) * 0.05,
      rot: ((jitter - 5) / 5) * 0.25,
      alt: (ri + ci) % 2 === 1,
    });
  });
});
// Bereits nach z sortiert (HOUSE_ROWS ist aufsteigend), die Sortierung steht hier nur,
// falls die Reihenfolge oben einmal anders gewählt wird.
HOUSE_SLOTS.sort((a, b) => a.z - b.z);

const HOUSE_COUNT = HOUSE_SLOTS.length;

// See und Fluss liegen rechts neben der Stadt (positives lokales x), der Fluss zieht
// von dort weiter nach außen ab.
const LAKE_LOCAL = { x: 9.5, z: 0.5 };
const LAKE_R = 4.2;
// Flusslauf als Polylinie, zwei Segmente für einen leichten Knick statt einer
// Beton-geraden Linie.
const RIVER_POINTS = [
  { x: LAKE_LOCAL.x + LAKE_R * 0.6, z: LAKE_LOCAL.z + LAKE_R * 0.5 },
  { x: LAKE_LOCAL.x + 6.5, z: LAKE_LOCAL.z + 4.5 },
  { x: LAKE_LOCAL.x + 9.5, z: LAKE_LOCAL.z + 9.5 },
];
const RIVER_WIDTH = 1.7;

// Wie viele Algenflecken auf dem trübsten See treiben.
const ALGAE_MAX = 6;
const ALGAE_SPOTS = Array.from({ length: ALGAE_MAX }, (_, i) => {
  const a = (i / ALGAE_MAX) * Math.PI * 2;
  const r = LAKE_R * 0.55;
  return { x: LAKE_LOCAL.x + Math.cos(a) * r, z: LAKE_LOCAL.z + Math.sin(a) * r, s: 0.4 + (i % 3) * 0.15 };
});

export function buildEnvironment(palette) {
  const group = new THREE.Group();
  group.position.set(ENV_ANCHOR.x, 0, ENV_ANCHOR.z);
  const mats = {};
  const lambert = (key, extra = {}) => {
    const m = new THREE.MeshLambertMaterial({ color: palette[key], flatShading: true, ...extra });
    (mats[key] = mats[key] || []).push(m);
    return m;
  };
  const dummy = new THREE.Object3D();

  // --- Stadt: Häuser vs. Unternehmens-Kuben ---------------------------------------
  // Beide InstancedMeshes teilen sich dieselben zwölf Plätze. Pro Update wird nur die
  // COUNT-Grenze verschoben (wie bei den Bäumen in buildCampus.js): die vorderen
  // `converted` Plätze bekommen den Kubus, der Rest bleibt Haus.
  const wallMat = lambert('townWall');
  const wallAltMat = lambert('townWallAlt');
  const roofMat = lambert('townRoof');
  const roofAltMat = lambert('townRoofAlt');
  const houseWalls = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, 1.1, 1.3), wallMat, HOUSE_COUNT);
  const houseWallsAlt = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, 1.1, 1.3), wallAltMat, HOUSE_COUNT);
  const houseRoofs = new THREE.InstancedMesh(new THREE.ConeGeometry(1.15, 0.8, 4), roofMat, HOUSE_COUNT);
  const houseRoofsAlt = new THREE.InstancedMesh(new THREE.ConeGeometry(1.15, 0.8, 4), roofAltMat, HOUSE_COUNT);
  [houseWalls, houseWallsAlt, houseRoofs, houseRoofsAlt].forEach((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
    m.frustumCulled = false;
    m.count = 0;
    group.add(m);
  });

  const corpGlassMat = lambert('facade');
  const corpFrameMat = lambert('steelDark');
  const corpSignMat = lambert('corpSign');
  const corpBody = new THREE.InstancedMesh(new THREE.BoxGeometry(1.7, 2.6, 1.7), corpGlassMat, HOUSE_COUNT);
  const corpFrame = new THREE.InstancedMesh(new THREE.BoxGeometry(1.8, 0.14, 1.8), corpFrameMat, HOUSE_COUNT);
  const corpSign = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.55, 0.22), corpSignMat, HOUSE_COUNT);
  [corpBody, corpFrame, corpSign].forEach((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
    m.frustumCulled = false;
    m.count = 0;
    group.add(m);
  });

  function layoutHouseSlot(mesh, i, slot, roofMode) {
    dummy.position.set(slot.x, roofMode ? 1.1 + 0.4 : 0.55, slot.z);
    dummy.rotation.set(0, slot.rot + (roofMode ? Math.PI / 4 : 0), 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }

  function layoutCorpSlot(slot, i) {
    dummy.rotation.set(0, slot.rot * 0.4, 0);
    dummy.scale.setScalar(1);
    dummy.position.set(slot.x, 1.3, slot.z);
    dummy.updateMatrix();
    corpBody.setMatrixAt(i, dummy.matrix);
    dummy.position.set(slot.x, 2.67, slot.z);
    dummy.updateMatrix();
    corpFrame.setMatrixAt(i, dummy.matrix);
    dummy.position.set(slot.x, 3.02, slot.z);
    dummy.updateMatrix();
    corpSign.setMatrixAt(i, dummy.matrix);
  }

  // Reine Geometrie einmal aufgebaut - welcher Platz Haus oder Kubus ist, entscheidet
  // nur noch die COUNT-Grenze in update().
  HOUSE_SLOTS.forEach((slot, i) => {
    layoutHouseSlot(slot.alt ? houseWallsAlt : houseWalls, i, slot, false);
    layoutHouseSlot(slot.alt ? houseRoofsAlt : houseRoofs, i, slot, true);
    layoutCorpSlot(slot, i);
  });
  [houseWalls, houseWallsAlt, houseRoofs, houseRoofsAlt, corpBody, corpFrame, corpSign].forEach((m) => {
    m.instanceMatrix.needsUpdate = true;
  });

  let convertedCount = -1;
  function applyConversion(converted) {
    if (converted === convertedCount) return;
    convertedCount = converted;
    const remain = HOUSE_COUNT - converted;
    // Die HINTEREN (weiter im z) `remain` Plätze bleiben Haus, die vorderen -
    // campusnäheren - `converted` Plätze werden zum Kubus. Da beide Instanz-Paare
    // dieselbe Reihenfolge benutzen, reicht ein Offset in setMatrixAt statt neu zu bauen.
    let hi = 0;
    let ai = 0;
    let hai = 0;
    HOUSE_SLOTS.forEach((slot, i) => {
      if (i < converted) return;
      if (slot.alt) {
        layoutHouseSlot(houseWallsAlt, hai, slot, false);
        layoutHouseSlot(houseRoofsAlt, hai, slot, true);
        hai += 1;
      } else {
        layoutHouseSlot(houseWalls, hi, slot, false);
        layoutHouseSlot(houseRoofs, hi, slot, true);
        hi += 1;
      }
    });
    HOUSE_SLOTS.forEach((slot, i) => {
      if (i >= converted) return;
      layoutCorpSlot(slot, ai);
      ai += 1;
    });
    // Zählt getrennt nach den zwei Wandfarben, damit keine Instanz doppelt auftaucht.
    const altRemain = HOUSE_SLOTS.filter((s, i) => i >= converted && s.alt).length;
    const plainRemain = remain - altRemain;
    houseWalls.count = plainRemain;
    houseRoofs.count = plainRemain;
    houseWallsAlt.count = altRemain;
    houseRoofsAlt.count = altRemain;
    corpBody.count = converted;
    corpFrame.count = converted;
    corpSign.count = converted;
    [houseWalls, houseWallsAlt, houseRoofs, houseRoofsAlt, corpBody, corpFrame, corpSign].forEach((m) => {
      m.instanceMatrix.needsUpdate = true;
    });
  }

  // --- See und Fluss: Wasser schrumpft und trübt sich -----------------------------
  const bedMat = lambert('soilDeep');
  const waterMat = lambert('water', { transparent: true, opacity: 0.92 });

  const lakeBed = new THREE.Mesh(new THREE.CylinderGeometry(LAKE_R + 0.6, LAKE_R + 0.6, 0.12, 10), bedMat);
  lakeBed.position.set(LAKE_LOCAL.x, 0.03, LAKE_LOCAL.z);
  lakeBed.receiveShadow = true;
  group.add(lakeBed);
  const lakeWater = new THREE.Mesh(new THREE.CylinderGeometry(LAKE_R, LAKE_R, 0.16, 10), waterMat);
  lakeWater.position.set(LAKE_LOCAL.x, 0.09, LAKE_LOCAL.z);
  group.add(lakeWater);

  // Flussbett und Wasser als Kette von Kästen entlang der Polylinie, dasselbe Prinzip
  // wie die Wege in buildCampus.js.
  const riverBed = new THREE.Group();
  const riverWater = new THREE.Group();
  group.add(riverBed, riverWater);
  for (let i = 0; i < RIVER_POINTS.length - 1; i += 1) {
    const a = RIVER_POINTS[i];
    const b = RIVER_POINTS[i + 1];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    const rot = Math.atan2(dx, dz);
    const midX = (a.x + b.x) / 2;
    const midZ = (a.z + b.z) / 2;

    const bed = new THREE.Mesh(new THREE.BoxGeometry(RIVER_WIDTH + 0.7, 0.1, len + 0.7), bedMat);
    bed.position.set(midX, 0.03, midZ);
    bed.rotation.y = rot;
    bed.receiveShadow = true;
    riverBed.add(bed);

    const water = new THREE.Mesh(new THREE.BoxGeometry(RIVER_WIDTH, 0.14, len), waterMat);
    water.position.set(midX, 0.08, midZ);
    water.rotation.y = rot;
    water.userData.baseWidth = RIVER_WIDTH;
    riverWater.add(water);
  }

  // Algenflecken: dunkle, flachgedrückte Ikosaeder, die erst mit steigender
  // Verschmutzung auftauchen (COUNT-Trick wie bei den Häusern).
  const algaeMat = lambert('algae');
  const algae = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.5, 0), algaeMat, ALGAE_MAX);
  algae.frustumCulled = false;
  algae.count = 0;
  group.add(algae);
  ALGAE_SPOTS.forEach((spot, i) => {
    dummy.position.set(spot.x, 0.15, spot.z);
    dummy.rotation.set(0, i, 0);
    dummy.scale.set(spot.s, spot.s * 0.35, spot.s);
    dummy.updateMatrix();
    algae.setMatrixAt(i, dummy.matrix);
  });
  algae.instanceMatrix.needsUpdate = true;

  let appliedProgress = -1;

  return {
    group,
    // progress: 0 (unberührte Kleinstadt, klarer See) bis 1 (Innenstadt fast verdrängt,
    // See halb ausgetrocknet und trüb). Kommt aus der Campusgröße, siehe CampusScene.jsx.
    update(progress) {
      const p = Math.min(1, Math.max(0, progress));
      if (Math.abs(p - appliedProgress) < 0.004) return;
      appliedProgress = p;

      applyConversion(Math.round(p * HOUSE_COUNT));

      // Wasser schrumpft um bis zu 45% und trübt sich Richtung Moosgrün.
      const shrink = 1 - p * 0.45;
      lakeWater.scale.set(shrink, 1, shrink);
      const waterColor = new THREE.Color(palette.water).lerp(new THREE.Color(palette.waterDirty), p);
      waterMat.color.copy(waterColor);
      riverWater.children.forEach((w) => {
        w.scale.x = shrink;
      });

      algae.count = Math.round(p * ALGAE_MAX);
    },
    applyPalette(pal) {
      Object.entries(mats).forEach(([key, list]) => {
        if (key === 'water') return; // folgt dem Verschmutzungsgrad, nicht direkt der Palette
        list.forEach((m) => m.color.setHex(pal[key]));
      });
      // Beim Themenwechsel den Wasserton neu aus der aktuellen Verschmutzung mischen,
      // sonst bliebe er auf der Farbe des vorigen Themes stehen.
      const p = Math.max(0, appliedProgress);
      waterMat.color.copy(new THREE.Color(pal.water).lerp(new THREE.Color(pal.waterDirty), p));
    },
  };
}
