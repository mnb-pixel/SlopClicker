import * as THREE from 'three';

// Die Kulisse am Feldrand: mehrere Dorf-Cluster verstreut über das ganze Spielfeld,
// verbunden durch ein Straßennetz (Ortsraster je Cluster, eine durchgehende
// Landstraße, die sie alle verbindet, und Stichstraßen weiter zum Ofenhof), dazu ein
// einzelner großer Fluss, der quer über das ganze Feld zieht. Alles in
// Weltkoordinaten - anders als die erste Fassung (ein Cluster hinter einem einzigen
// Anker) braucht das keinen gemeinsamen Ursprung mehr.
//
// Rein satirisch, wie der Rest der Szene: je weiter der Campus ausgebaut wird, desto
// mehr Häuser weichen grauen Unternehmens-Kuben - campusnahe Cluster zuerst, sortiert
// nach Abstand zum Ofen -, hinter jedem Kubus bleibt ein aufgerissener Schlammfleck
// zurück, und der Fluss wird kleiner und trüber. Straßen bleiben liegen, auch wenn
// die Häuser daneben verschwinden. Spielzahlen und Punktesystem bleiben unberührt -
// gesteuert über einen einzigen `progress`-Wert (0..1) aus der Hype-Stufe (1 bis 10,
// siehe CampusScene.jsx und buildCampus.js: dieselbe Stufe steuert dort schon Wege,
// Bäume und Lichtdrohnen).
//
// Sicherheitsabstand zur Grundstücksgrenze (buildCampus.js: campusRect). NICHT
// geschätzt, sondern nachgerechnet: mit jeder Engine aller 20 Gebäude auf ihrem
// harten `maxProps`-Deckel (zonesData.js) - dem tatsächlich größtmöglichen Campus -
// kommt campusRect() auf { minX: -37.5, maxX: 30.3, minZ: -29.4, maxZ: 23.1 }. Die
// Grenze wächst in x sehr viel weiter als in z (die vier Zonen wachsen fast nur dort),
// deshalb liegen alle vier Cluster auf derselben, deutlich jenseits von maxZ liegenden
// Zeile z = 32 - die beiden mittleren (x nah an 0) wären bei z = 22 (der ersten
// Fassung dieser Datei) noch TEILWEISE innerhalb der Grenze gelegen, die äußeren zwei
// sind ohnehin schon per x weit draußen (x < -37.5 bzw. x > 30.3).
const CLUSTER_Z = 32;
const CLUSTERS = [
  // Hauptdorf: das ursprüngliche Zwölf-Häuser-Raster mit vollem Ring.
  { cx: -15, cz: CLUSTER_Z, cols: [-4.8, -1.6, 1.6, 4.8], rows: [-3.1, 0, 3.1], ring: true },
  // Drei kleinere Weiler links, rechts und ganz außen - weit genug in x, dass selbst
  // maximal ausgebaute Nachbarzonen sie nicht erreichen.
  { cx: -50, cz: CLUSTER_Z, cols: [-3.2, 0, 3.2], rows: [-1.55, 1.55], ring: true },
  { cx: 20, cz: CLUSTER_Z, cols: [-3.2, 0, 3.2], rows: [-1.55, 1.55], ring: true },
  { cx: 52, cz: CLUSTER_Z, cols: [-3.2, 0, 3.2], rows: [-1.55, 1.55], ring: true },
];

function span(arr) {
  return arr[arr.length - 1] - arr[0];
}
function midpoints(arr) {
  const out = [];
  for (let i = 0; i < arr.length - 1; i += 1) out.push((arr[i] + arr[i + 1]) / 2);
  return out;
}
// Rand um die äußerste Haus-Achse, bis zu dem Ring/Straßen reichen - Platz für die
// Straße selbst plus etwas Luft zum Haus (siehe STREET_W unten).
const HALF_MARGIN_X = 1.4;
const HALF_MARGIN_Z = 1.3;
function clusterHalfX(cluster) {
  return span(cluster.cols) / 2 + HALF_MARGIN_X;
}
function clusterHalfZ(cluster) {
  return span(cluster.rows) / 2 + HALF_MARGIN_Z;
}
// Campusseitige Kante des Clusters (kleineres z) - hier docken Zufahrt/Landstraße an.
function clusterNearZ(cluster) {
  return cluster.cz - clusterHalfZ(cluster);
}

// Alle Hausplätze aller Cluster, in Weltkoordinaten. Nach Abstand zum Ofen (Ursprung)
// sortiert: der campusnächste Platz weicht bei wachsendem `progress` zuerst dem
// Unternehmens-Kubus - "der nächste Ort zuerst", ganz gleich in welchem Cluster er liegt.
const HOUSE_SLOTS = [];
CLUSTERS.forEach((cluster, clusterIdx) => {
  cluster.rows.forEach((rowZ, ri) => {
    cluster.cols.forEach((colX, ci) => {
      const jitter = ((ri * 4 + ci + clusterIdx * 11) * 37) % 10;
      HOUSE_SLOTS.push({
        x: cluster.cx + colX,
        z: cluster.cz + rowZ,
        rot: ((jitter - 5) / 5) * 0.2,
        alt: (ri + ci + clusterIdx) % 2 === 1,
      });
    });
  });
});
HOUSE_SLOTS.sort((a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z));
const HOUSE_COUNT = HOUSE_SLOTS.length;

// --- Straßennetz ---------------------------------------------------------------
// Drei Ebenen: das Ortsraster JEDES Clusters (Ring plus Längs-/Querstraßen in den
// Lücken zwischen den Häusern), eine durchgehende Landstraße, die alle Cluster an
// ihrer campusseitigen Kante verbindet, und zwei Stichstraßen, die von der Landstraße
// weiter zum Ofenhof abzweigen.
const STREET_W = 1.1;
function clusterStreetSegments(cluster) {
  const halfX = clusterHalfX(cluster);
  const halfZ = clusterHalfZ(cluster);
  const segs = [];
  if (cluster.ring) {
    segs.push([-halfX, -halfZ, halfX, -halfZ]);
    segs.push([-halfX, halfZ, halfX, halfZ]);
    segs.push([-halfX, -halfZ, -halfX, halfZ]);
    segs.push([halfX, -halfZ, halfX, halfZ]);
  }
  midpoints(cluster.cols).forEach((gx) => segs.push([gx, -halfZ, gx, halfZ]));
  midpoints(cluster.rows).forEach((gz) => segs.push([-halfX, gz, halfX, gz]));
  return segs.map(([ax, az, bx, bz]) => ({
    a: { x: cluster.cx + ax, z: cluster.cz + az },
    b: { x: cluster.cx + bx, z: cluster.cz + bz },
  }));
}

// Landstraße: verbindet die campusseitige Kante jedes Clusters zu einer durchgehenden
// Linie, die über das ganze Feld zieht (kein Cluster bleibt isoliert).
const HIGHWAY_W = 1.6;
const HIGHWAY_POINTS = [
  { x: CLUSTERS[1].cx - 15, z: clusterNearZ(CLUSTERS[1]) },
  { x: CLUSTERS[1].cx, z: clusterNearZ(CLUSTERS[1]) },
  { x: CLUSTERS[0].cx, z: clusterNearZ(CLUSTERS[0]) },
  { x: CLUSTERS[2].cx, z: clusterNearZ(CLUSTERS[2]) },
  { x: CLUSTERS[3].cx, z: clusterNearZ(CLUSTERS[3]) },
  { x: CLUSTERS[3].cx + 13, z: clusterNearZ(CLUSTERS[3]) },
];

// Stichstraßen: von der Landstraße beim Hauptdorf und beim rechten Weiler weiter
// Richtung Ofenhof, mit einem Knick statt einer Beton-geraden Linie. Enden bewusst ein
// Stück VOR der Grundstücksgrenze (siehe docs/fabrik-szene.md: deren Frontkante bleibt
// bei realistischem Ausbau unterhalb von etwa z = 15-16) - so bleiben sie bei jeder
// Campusgröße als eigenes Wegstück auf freiem Rasen sichtbar, statt in der wachsenden
// Hecke zu verschwinden.
const SPUR_W = 1.7;
const SPURS = [
  [
    { x: CLUSTERS[0].cx, z: clusterNearZ(CLUSTERS[0]) },
    { x: CLUSTERS[0].cx + 4, z: clusterNearZ(CLUSTERS[0]) - 2 },
    { x: CLUSTERS[0].cx + 7.5, z: clusterNearZ(CLUSTERS[0]) - 4.2 },
  ],
  [
    { x: CLUSTERS[2].cx, z: clusterNearZ(CLUSTERS[2]) },
    { x: CLUSTERS[2].cx - 4, z: clusterNearZ(CLUSTERS[2]) - 2.6 },
    { x: CLUSTERS[2].cx - 8, z: clusterNearZ(CLUSTERS[2]) - 5.1 },
  ],
];

// --- Fluss: EIN Lauf über das ganze Spielfeld, mit einer Seeausbuchtung beim Hauptdorf
const LAKE_WORLD = { x: CLUSTERS[0].cx + 9.5, z: CLUSTERS[0].cz + 0.5 };
const LAKE_R = 4.2;
const RIVER_WIDTH = 1.7;
// Polylinie von weit links nach weit rechts, mit einer Ausbuchtung, die beim Hauptdorf
// vorbeiführt - dieselbe Kurve wie in der ersten Fassung, nur eingebettet in einen viel
// längeren Lauf statt als kurzer Abfluss.
const RIVER_POINTS = [
  { x: -75, z: 44 },
  { x: -50, z: 39 },
  { x: -15, z: 36 },
  { x: LAKE_WORLD.x + LAKE_R * 0.6, z: LAKE_WORLD.z + LAKE_R * 0.5 },
  { x: LAKE_WORLD.x + 6.5, z: LAKE_WORLD.z + 4.5 },
  { x: LAKE_WORLD.x + 9.5, z: LAKE_WORLD.z + 9.5 },
  { x: 20, z: 38 },
  { x: 52, z: 41 },
  { x: 75, z: 39 },
];

// Wie viele Algenflecken der trübste Zustand zeigt: sechs feste rund um den See, dazu
// einer je Flussabschnitt.
const ALGAE_LAKE = 6;
const ALGAE_MAX = ALGAE_LAKE + (RIVER_POINTS.length - 1);
const ALGAE_SPOTS = [];
for (let i = 0; i < ALGAE_LAKE; i += 1) {
  const a = (i / ALGAE_LAKE) * Math.PI * 2;
  const r = LAKE_R * 0.55;
  ALGAE_SPOTS.push({ x: LAKE_WORLD.x + Math.cos(a) * r, z: LAKE_WORLD.z + Math.sin(a) * r, s: 0.4 + (i % 3) * 0.15 });
}
for (let i = 0; i < RIVER_POINTS.length - 1; i += 1) {
  const a = RIVER_POINTS[i];
  const b = RIVER_POINTS[i + 1];
  ALGAE_SPOTS.push({ x: (a.x + b.x) / 2, z: (a.z + b.z) / 2, s: 0.45 + (i % 3) * 0.12 });
}

export function buildEnvironment(palette) {
  const group = new THREE.Group();
  const mats = {};
  const lambert = (key, extra = {}) => {
    const m = new THREE.MeshLambertMaterial({ color: palette[key], flatShading: true, ...extra });
    (mats[key] = mats[key] || []).push(m);
    return m;
  };
  const dummy = new THREE.Object3D();

  // --- Dörfer: Häuser vs. Unternehmens-Kuben, dazwischen aufgerissener Schlamm -----
  // Alle Instanced-Meshes teilen sich dieselben Hausplätze aus allen Clustern. Pro
  // Update wird nur die COUNT-Grenze verschoben (wie bei den Bäumen in
  // buildCampus.js): die campusnächsten `converted` Plätze bekommen Kubus plus
  // Schlammfleck, der Rest bleibt Haus.
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

  // Schlammfleck: bleibt für immer liegen, sobald ein Platz einmal umgewandelt wurde -
  // "abgerissen" statt "einfach ausgetauscht". Teilt sich die Erdfarbe mit dem
  // Fluss-/Seebett weiter unten (bedMat), damit nicht noch ein Materialset entsteht.
  const bedMat = lambert('soilDeep');
  const mudPatches = new THREE.InstancedMesh(new THREE.CylinderGeometry(1.5, 1.5, 0.05, 8), bedMat, HOUSE_COUNT);
  mudPatches.receiveShadow = true;
  mudPatches.frustumCulled = false;
  mudPatches.count = 0;
  group.add(mudPatches);

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
    dummy.rotation.set(0, 0, 0);
    dummy.position.set(slot.x, 0.025, slot.z);
    dummy.updateMatrix();
    mudPatches.setMatrixAt(i, dummy.matrix);
  }

  // Reine Geometrie einmal aufgebaut - welcher Platz Haus oder Kubus ist, entscheidet
  // nur noch die COUNT-Grenze in update().
  HOUSE_SLOTS.forEach((slot, i) => {
    layoutHouseSlot(slot.alt ? houseWallsAlt : houseWalls, i, slot, false);
    layoutHouseSlot(slot.alt ? houseRoofsAlt : houseRoofs, i, slot, true);
    layoutCorpSlot(slot, i);
  });
  [houseWalls, houseWallsAlt, houseRoofs, houseRoofsAlt, corpBody, corpFrame, corpSign, mudPatches].forEach((m) => {
    m.instanceMatrix.needsUpdate = true;
  });

  let convertedCount = -1;
  function applyConversion(converted) {
    if (converted === convertedCount) return;
    convertedCount = converted;
    const remain = HOUSE_COUNT - converted;
    // Die HINTEREN (weiter vom Ofen entfernten) `remain` Plätze bleiben Haus, die
    // NÄHEREN `converted` Plätze werden zu Kubus plus Schlammfleck. Da alle
    // Instanz-Gruppen dieselbe Reihenfolge benutzen, reicht ein Offset in
    // setMatrixAt statt neu zu bauen.
    let hi = 0;
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
      layoutCorpSlot(slot, i);
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
    mudPatches.count = converted;
    [houseWalls, houseWallsAlt, houseRoofs, houseRoofsAlt, corpBody, corpFrame, corpSign, mudPatches].forEach((m) => {
      m.instanceMatrix.needsUpdate = true;
    });
  }

  // --- Straßennetz: Ortsraster je Cluster, Landstraße, zwei Stichstraßen zum Ofenhof
  const roadMat = lambert('path');
  function addRoad(a, b, width) {
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    const road = new THREE.Mesh(new THREE.BoxGeometry(width, 0.07, len), roadMat);
    road.position.set((a.x + b.x) / 2, 0.045, (a.z + b.z) / 2);
    road.rotation.y = Math.atan2(dx, dz);
    road.receiveShadow = true;
    group.add(road);
    return road;
  }
  CLUSTERS.forEach((cluster) => {
    clusterStreetSegments(cluster).forEach(({ a, b }) => addRoad(a, b, STREET_W));
  });
  for (let i = 0; i < HIGHWAY_POINTS.length - 1; i += 1) {
    addRoad(HIGHWAY_POINTS[i], HIGHWAY_POINTS[i + 1], HIGHWAY_W);
  }
  SPURS.forEach((points) => {
    for (let i = 0; i < points.length - 1; i += 1) addRoad(points[i], points[i + 1], SPUR_W);
  });

  // --- See und Fluss: EIN durchgehender Lauf, Wasser schrumpft und trübt sich -----
  const waterMat = lambert('water', { transparent: true, opacity: 0.92 });

  const lakeBed = new THREE.Mesh(new THREE.CylinderGeometry(LAKE_R + 0.6, LAKE_R + 0.6, 0.12, 10), bedMat);
  lakeBed.position.set(LAKE_WORLD.x, 0.03, LAKE_WORLD.z);
  lakeBed.receiveShadow = true;
  group.add(lakeBed);
  const lakeWater = new THREE.Mesh(new THREE.CylinderGeometry(LAKE_R, LAKE_R, 0.16, 10), waterMat);
  lakeWater.position.set(LAKE_WORLD.x, 0.09, LAKE_WORLD.z);
  group.add(lakeWater);

  // Flussbett und Wasser als Kette von Kästen entlang der Polylinie, dasselbe Prinzip
  // wie die Wege in buildCampus.js - nur mit deutlich mehr Abschnitten, weil der Lauf
  // jetzt über das ganze Feld zieht statt nur ein kurzes Stück abzufließen.
  const riverWater = new THREE.Group();
  group.add(riverWater);
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
    group.add(bed);

    const water = new THREE.Mesh(new THREE.BoxGeometry(RIVER_WIDTH, 0.14, len), waterMat);
    water.position.set(midX, 0.08, midZ);
    water.rotation.y = rot;
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
    // progress: 0 (unberührte Dörfer, klarer Fluss) bis 1 (fast alles abgerissen und
    // vermatscht, Fluss halb ausgetrocknet und trüb). Kommt aus der Hype-Stufe, siehe
    // CampusScene.jsx.
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
