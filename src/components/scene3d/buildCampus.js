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

export function campusStage(hypeTier) {
  if (hypeTier >= 9) return 4;
  if (hypeTier >= 6) return 3;
  if (hypeTier >= 3) return 2;
  return 1;
}

const TREE_SPOTS = [
  { x: -10.6, z: 10.6 }, { x: -9.4, z: 11.1 }, { x: 10.6, z: 10.6 }, { x: 9.3, z: 11.1 },
  { x: -1.6, z: 11.0 }, { x: 1.7, z: 11.1 }, { x: 11.1, z: 0.4 }, { x: -11.1, z: 0.6 },
  { x: -10.7, z: -10.6 }, { x: 10.7, z: -10.6 }, { x: 11.2, z: -1.6 }, { x: -11.2, z: -1.4 },
  { x: -3.2, z: 11.2 }, { x: 3.4, z: 11.2 },
];
const TREES_BY_STAGE = [0, 0, 6, 10, 14];

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

  // Wege: von jeder Zonenplatte zum Schranksockel.
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
      const endD = len - 3.7;
      const pathLen = Math.max(0.5, endD - startD);
      const mid = startD + pathLen / 2;
      const path = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, pathLen), lambert('path'));
      path.position.set(z.anchor3d.x + ux * mid, 0.05, z.anchor3d.z + uz * mid);
      path.rotation.y = Math.atan2(ux, uz);
      path.receiveShadow = true;
      path.userData.zoneId = z.id;
      paths.add(path);
    });

  // Bäume: Stamm + zwei Kronen-Kegel, instanziert. Die Positionen sind auf die
  // Basis-Campusgröße bezogen und werden mit ihr skaliert (layoutTrees).
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
      const x = s.x * campusScale;
      const z = s.z * campusScale;
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
