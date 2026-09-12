import * as THREE from 'three';

// Campus-Stufen, campusweit, gekoppelt an die Hype-Stufe (1 bis 10):
//   1 Garage (1-2):        nackte Wiese
//   2 Co-Working (3-5):    Wege von den Zonen zum Schrank, erste Bäume
//   3 Container-Dorf (6-8): mehr Bäume
//   4 Hyperscale (9-10):   volle Bepflanzung, Lichtdrohnen kreisen über dem Campus
// Das Zonen-Wachstum (Bestand) läuft unabhängig davon in den Zonen-Bauern.
//
// Zusätzlich folgt alles hier der Campusgröße: wächst der bebaute Bereich (aus
// deriveIsland - der Name blieb aus der Zeit der schwebenden Insel), rücken Bäume und
// Lichtdrohnen mit nach außen. Der Rasen selbst muss dafür nicht wachsen (siehe
// buildIsland.js): er ist von Anfang an riesig, wie bei Egg Inc.
//
// Seit die Zonen weiter auseinander liegen (siehe zonesData.js) kommt hier die
// Gestaltung des Bodens dazu, die den freien Platz dazwischen erst lesbar macht:
//
//   - Der OFENHOF: eine achteckige Pflasterfläche mit Kantstein um den Ofen. Er sagt
//     "hier ist die Mitte" und gibt dem Schrank einen Standplatz statt ihn auf die
//     nackte Wiese zu stellen.
//   - PFLANZKÜBEL auf den vier Diagonalen am Hofrand: sie schließen den Hof zwischen
//     den Wegen und trennen zugleich die Blickachsen der vier Zonen voneinander.
//   - HECKEN auf denselben vier Diagonalen, vom Hof nach außen: die sichtbare Grenze
//     zwischen zwei benachbarten Zonen. Vorher grenzten die Platten direkt aneinander
//     und verschmolzen in der Isometrie zu einer Fläche.
//   - BAUMREIHEN als Allee entlang der Wege statt verstreuter Einzelbäume.
//   - Die GRUNDSTÜCKSGRENZE: eine Hecke mit Zaunpfosten rings um den bebauten Bereich.
//     Sie beantwortet die Frage, die der riesige Rasen sonst offen lässt - wo hört der
//     Campus auf? - und gibt dem Bild einen Rahmen statt eines Auslaufens ins Grüne.
//     Sie wächst mit dem Campus mit und hat an den vier Achsen eine Lücke (dort, wo
//     die Hecken zwischen den Zonen nach außen zeigen).
//
// Alles davon ist instanziert oder ein einzelnes Mesh - die Zahl der Draw Calls bleibt
// wie vorher.

export function campusStage(hypeTier) {
  if (hypeTier >= 9) return 4;
  if (hypeTier >= 6) return 3;
  if (hypeTier >= 3) return 2;
  return 1;
}

// Radius des Ofenhofs (bis zum Kantstein). Die Wege der Zonen enden hier, nicht am
// Sockel des Schranks.
const PLAZA_R = 4.8;

const TREES_BY_STAGE = [0, 0, 6, 10, 14];

// Hecken und Pflanzkübel liegen auf den ACHSEN (+/-x, +/-z), nicht auf den Diagonalen:
// die vier Zonen stehen in den Diagonalquadranten, die Wege laufen also diagonal vom
// Hof zu ihnen. Eine Hecke auf der Diagonale läge mitten auf dem Weg; die Lücke
// ZWISCHEN zwei Zonen liegt auf der Achse dazwischen.
const HEDGE_LEN = 6.5;
const HEDGE_AXES = [
  { dx: -1, dz: 0 },
  { dx: 1, dz: 0 },
  { dx: 0, dz: 1 },
  { dx: 0, dz: -1 },
];

export function buildCampus(palette, zonesData, furnaceAnchor) {
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
  const dummy = new THREE.Object3D();

  // --- Ofenhof ------------------------------------------------------------------
  // Achteck statt Kreis: dieselbe kantige Sprache wie der Rest der Insel, und in der
  // Isometrie liest sich ein Achteck als Platz, ein Kreis als Fleck.
  const plaza = new THREE.Group();
  plaza.position.set(furnaceAnchor.x, 0, furnaceAnchor.z);
  group.add(plaza);

  const kerb = new THREE.Mesh(new THREE.CylinderGeometry(PLAZA_R, PLAZA_R, 0.22, 8), lambert('stoneDark'));
  kerb.position.y = 0.06;
  kerb.rotation.y = Math.PI / 8;
  kerb.receiveShadow = true;
  plaza.add(kerb);

  const pave = new THREE.Mesh(new THREE.CylinderGeometry(PLAZA_R - 0.35, PLAZA_R - 0.35, 0.24, 8), lambert('path'));
  pave.position.y = 0.09;
  pave.rotation.y = Math.PI / 8;
  pave.receiveShadow = true;
  plaza.add(pave);

  // Fugenkreuz im Pflaster: zwei schmale Streifen in Stein-Dunkel, die den Hof in
  // Viertel teilen - jedes Viertel gehört optisch zu einer Zone.
  const jointMat = lambert('stoneDark');
  [0, Math.PI / 2].forEach((rot) => {
    const joint = new THREE.Mesh(new THREE.BoxGeometry((PLAZA_R - 0.35) * 2, 0.26, 0.16), jointMat);
    joint.position.y = 0.1;
    joint.rotation.y = rot;
    plaza.add(joint);
  });

  // --- Hecken am Kamin (entfernt gemäß Nutzeranforderung) ----------------------------
  // Der Kamin- und Hofbereich bleibt dauerhaft frei von Hecken und Kübeln.
  const hedges = new THREE.Group();
  hedges.visible = false;
  group.add(hedges);

  // --- Wege ------------------------------------------------------------------------
  // Von jeder Zonenplatte zum Hofrand (nicht mehr bis an den Schranksockel: der Hof
  // übernimmt das letzte Stück). Breiter als vorher, damit sie neben den großen
  // Platten nicht als Fäden verschwinden.
  const paths = new THREE.Group();
  group.add(paths);
  zonesData
    .filter((z) => z.id !== 'endgame')
    .forEach((z) => {
      const dx = furnaceAnchor.x - z.anchor3d.x;
      const dz = furnaceAnchor.z - z.anchor3d.z;
      const len = Math.hypot(dx, dz);
      const ux = dx / len;
      const uz = dz / len;
      const startD = Math.min(z.footprint.w, z.footprint.d) * 0.5;
      const endD = len - PLAZA_R + 0.3;
      const pathLen = Math.max(0.5, endD - startD);
      const mid = startD + pathLen / 2;
      const path = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, pathLen), lambert('path'));
      path.position.set(z.anchor3d.x + ux * mid, 0.05, z.anchor3d.z + uz * mid);
      path.rotation.y = Math.atan2(ux, uz);
      path.receiveShadow = true;
      path.userData.zoneId = z.id;
      paths.add(path);
    });

  // --- Baumplätze ------------------------------------------------------------------
  // Aus den tatsächlichen Wegrichtungen abgeleitet statt von Hand gesetzt: je zwei
  // Bäume flankieren einen Weg (eine Allee), dazu eine äußere Reihe hinter den Hecken.
  // Von Hand gesetzte Punkte standen nach jeder Verschiebung der Zonenanker wieder
  // irgendwo - so wandern sie automatisch mit.
  const TREE_SPOTS = [];
  zonesData
    .filter((z) => z.id !== 'endgame')
    .forEach((z) => {
      const len = Math.hypot(z.anchor3d.x - furnaceAnchor.x, z.anchor3d.z - furnaceAnchor.z) || 1;
      const ux = (z.anchor3d.x - furnaceAnchor.x) / len;
      const uz = (z.anchor3d.z - furnaceAnchor.z) / len;
      // Quer zum Weg: links und rechts daneben, knapp außerhalb der Wegbreite.
      const px = -uz;
      const pz = ux;
      [[PLAZA_R + 1.6, 1.9], [PLAZA_R + 1.6, -1.9]].forEach(([d, side]) => {
        TREE_SPOTS.push({
          x: furnaceAnchor.x + ux * d + px * side,
          z: furnaceAnchor.z + uz * d + pz * side,
          outer: false,
        });
      });
    });
  // Äußere Reihe auf den Achsen, hinter den Hecken. Nur diese wandert mit dem Campus
  // nach außen - die Allee gehört zum Hof, und der wächst nicht.
  const OUTER_R = PLAZA_R + HEDGE_LEN + 2.4;
  HEDGE_AXES.filter(({ dz }) => dz !== 1).forEach(({ dx, dz }) => {
    [-1.3, 1.3].forEach((side) => {
      TREE_SPOTS.push({
        x: dx * OUTER_R + -dz * side,
        z: dz * OUTER_R + dx * side,
        outer: true,
      });
    });
  });

  // Bäume: Stamm + zwei Kronen-Kegel, instanziert.
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.16, 0.7, 5), lambert('trunk'), TREE_SPOTS.length);
  const crownA = new THREE.InstancedMesh(new THREE.ConeGeometry(0.75, 1.3, 6), lambert('crown'), TREE_SPOTS.length);
  const crownB = new THREE.InstancedMesh(new THREE.ConeGeometry(0.55, 1.0, 6), lambert('crownDark'), TREE_SPOTS.length);
  [trunk, crownA, crownB].forEach((m) => {
    m.castShadow = true;
    m.frustumCulled = false;
    m.count = 0;
    group.add(m);
  });
  function layoutTrees(campusScale) {
    TREE_SPOTS.forEach((s, i) => {
      const k = 0.85 + ((i * 7) % 5) * 0.08;
      const f = s.outer ? campusScale : 1;
      const x = s.x * f;
      const z = s.z * f;
      dummy.position.set(x, 0.35, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      trunk.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 1.1 * k + 0.3, z);
      dummy.scale.setScalar(k);
      dummy.updateMatrix();
      crownA.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 1.9 * k + 0.3, z);
      dummy.updateMatrix();
      crownB.setMatrixAt(i, dummy.matrix);
    });
    [trunk, crownA, crownB].forEach((m) => {
      m.instanceMatrix.needsUpdate = true;
    });
  }
  layoutTrees(1);

  // Lichtdrohnen (Hyperscale): kleine Leuchtpunkte, die über dem Campus kreisen.
  const lightsMat = basic('rim');
  const lights = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.16, 0), lightsMat, 8);
  lights.frustumCulled = false;
  lights.count = 0;
  group.add(lights);

  // --- Grundstücksgrenze ------------------------------------------------------------
  // Ein Ring aus kurzen Heckenstücken mit Zaunpfosten dazwischen, als Quadrat um den
  // Campus. Instanziert; beim Wachstum wird nur neu platziert, nicht neu gebaut.
  // Ein Stück pro Rasterschritt der Basisgröße: die Kantenlänge des Rings wächst mit
  // dem Campus, die Stücke werden dabei mitgestreckt (siehe layoutFence) - so bleibt es
  // eine durchgehende Hecke statt einer Perlenkette aus Klötzchen.
  const FENCE_PER_SIDE = 15;
  const FENCE_MAX = FENCE_PER_SIDE * 4;
  // Basislänge 1 - die tatsächliche Länge setzt layoutFence über die Skalierung.
  const fenceHedge = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.7, 0.55), lambert('crownDark'), FENCE_MAX);
  const fencePost = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 1.1, 0.22), lambert('fence'), FENCE_MAX);
  [fenceHedge, fencePost].forEach((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
    m.frustumCulled = false;
    m.count = 0;
    group.add(m);
  });

  // Luft zwischen dem äußersten Gebäude und der Grenze.
  const FENCE_MARGIN = 3.4;
  // Kleinste Grenze, auch wenn erst eine Zone steht - sonst klebte der Zaun am
  // Ofenhof.
  const FENCE_MIN_HALF = 13;

  // Der Ring folgt dem TATSÄCHLICH bebauten Rechteck, nicht einem Quadrat um den
  // Ursprung. Die Zonen wachsen unterschiedlich schnell (wer viele Praktikanten kauft,
  // schiebt nur das Büro nach außen); ein mittiges Quadrat wäre dann auf drei Seiten
  // viel zu weit weg und der Campus läge in einer Ecke seines eigenen Grundstücks.
  function layoutFence(rect) {
    const spanX = rect.maxX - rect.minX;
    const spanZ = rect.maxZ - rect.minZ;
    // Stückzahl pro Seite ist fest (Instanzpuffer), die Stücke werden gestreckt.
    const stepX = spanX / FENCE_PER_SIDE;
    const stepZ = spanZ / FENCE_PER_SIDE;
    let n = 0;
    // Vier Seiten. Die mittlere Position jeder Seite bleibt frei: dort liegt die Achse,
    // auf der die Hecken zwischen den Zonen nach außen zeigen - das ist die Einfahrt.
    const gapIndex = (FENCE_PER_SIDE - 1) / 2;
    for (let side = 0; side < 4; side += 1) {
      const alongX = side % 2 === 0;
      const sign = side < 2 ? 1 : -1;
      const step = alongX ? stepX : stepZ;
      for (let i = 0; i < FENCE_PER_SIDE; i += 1) {
        if (i === gapIndex) continue;
        const t = (alongX ? rect.minX : rect.minZ) + step * (i + 0.5);
        // Auf der Südseite (Zufahrts-Allee bei x = 0) Durchfahrt für Straße & LKW freihalten
        if (alongX && sign > 0 && Math.abs(t) < 2.5) continue;
        const x = alongX ? t : (sign > 0 ? rect.maxX : rect.minX);
        const z = alongX ? (sign > 0 ? rect.maxZ : rect.minZ) : t;
        dummy.position.set(x, 0.35, z);
        dummy.rotation.set(0, alongX ? 0 : Math.PI / 2, 0);
        // Fugenbreite 0.22, sonst wirkt die Hecke wie eine einzige lange Kiste.
        dummy.scale.set(Math.max(0.3, step - 0.22), 1, 1);
        dummy.updateMatrix();
        fenceHedge.setMatrixAt(n, dummy.matrix);
        // Pfosten in die Fuge, damit zwischen zwei Heckenstücken einer steht.
        const pt = t + step / 2;
        dummy.position.set(alongX ? pt : x, 0.55, alongX ? z : pt);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        fencePost.setMatrixAt(n, dummy.matrix);
        n += 1;
      }
    }
    fenceHedge.instanceMatrix.needsUpdate = true;
    fencePost.instanceMatrix.needsUpdate = true;
    return n;
  }

  // Umschließendes Rechteck aller sichtbaren Zonen plus Ofenhof, mit Rand.
  function campusRect(zones) {
    let minX = furnaceAnchor.x - FENCE_MIN_HALF;
    let maxX = furnaceAnchor.x + FENCE_MIN_HALF;
    let minZ = furnaceAnchor.z - FENCE_MIN_HALF;
    let maxZ = furnaceAnchor.z + FENCE_MIN_HALF;
    zones.forEach((z) => {
      if (!z.unlocked || !z.rect) return;
      minX = Math.min(minX, z.rect.minX - FENCE_MARGIN);
      maxX = Math.max(maxX, z.rect.maxX + FENCE_MARGIN);
      minZ = Math.min(minZ, z.rect.minZ - FENCE_MARGIN);
      maxZ = Math.max(maxZ, z.rect.maxZ + FENCE_MARGIN);
    });
    return { minX, maxX, minZ, maxZ };
  }

  const FENCE_COUNT = layoutFence(campusRect([]));
  let fenceKey = '';

  let appliedStage = -1;
  let appliedScale = -1;

  return {
    group,
    // zones: abgeleitete Zonen-Zustände, damit Wege nur zu freigeschalteten Zonen führen.
    // campusScale: aktuelle Campusgröße relativ zur Basis (siehe buildIsland).
    update(hypeTier, t, reduced, zones = [], campusScale = 1) {
      if (Math.abs(campusScale - appliedScale) > 0.005) {
        appliedScale = campusScale;
        layoutTrees(campusScale);
      }
      // Grenze folgt dem bebauten Rechteck. Neu gesetzt wird sie nur, wenn sich das
      // Rechteck tatsächlich ändert - ein Kauf pro Minute, nicht 60 Bilder pro Sekunde.
      const rect = campusRect(zones);
      const key = `${rect.minX.toFixed(1)},${rect.maxX.toFixed(1)},${rect.minZ.toFixed(1)},${rect.maxZ.toFixed(1)}`;
      if (key !== fenceKey) {
        fenceKey = key;
        layoutFence(rect);
      }
      const stage = campusStage(hypeTier);
      paths.children.forEach((path) => {
        const z = zones.find((zz) => zz.id === path.userData.zoneId);
        path.visible = stage >= 2 && Boolean(z && z.unlocked);
      });
      if (stage !== appliedStage) {
        appliedStage = stage;
        const trees = TREES_BY_STAGE[stage];
        trunk.count = trees;
        crownA.count = trees;
        crownB.count = trees;
        lights.count = stage >= 4 ? 8 : 0;
        hedges.visible = stage >= 2;
        // Die Grenze kommt eine Stufe später als die Wege: erst wenn der Campus ein
        // Container-Dorf ist, gibt es überhaupt etwas einzuzäunen.
        fenceHedge.count = stage >= 3 ? FENCE_COUNT : 0;
        fencePost.count = fenceHedge.count;
      }
      if (lights.count > 0) {
        for (let i = 0; i < 8; i += 1) {
          const a = (reduced ? 0 : t * 0.3) + (i / 8) * Math.PI * 2;
          const r = 13.5 * appliedScale;
          dummy.position.set(Math.cos(a) * r, 2.5 + Math.sin(t * 1.7 + i) * 0.5, Math.sin(a) * r);
          dummy.rotation.set(t, t * 1.3, 0);
          dummy.scale.setScalar(1);
          dummy.updateMatrix();
          lights.setMatrixAt(i, dummy.matrix);
        }
        lights.instanceMatrix.needsUpdate = true;
      }
    },
    applyPalette(p) {
      Object.entries(mats).forEach(([key, list]) => list.forEach((m) => m.color.setHex(p[key])));
    },
  };
}
