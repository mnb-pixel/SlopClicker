import * as THREE from 'three';
import { ISLAND_SIZE } from '../../data/zonesData';

// Die schwebende Insel: Grasplatte, zwei Erdschichten, darunter eine nach unten
// spitz zulaufende Felsspitze. Dazu drei Low-Poly-Wolken, die langsam driften.
//
// Alles Flat Shading ohne Texturen. Materialien werden in einem Objekt gesammelt,
// damit applyPalette() beim Theme-Wechsel nur Farben tauscht statt Geometrie neu zu bauen.
export function buildIsland(palette) {
  const group = new THREE.Group();
  const mats = {};
  const S = ISLAND_SIZE;

  const lambert = (key) => {
    const m = new THREE.MeshLambertMaterial({ color: palette[key], flatShading: true });
    mats[key] = mats[key] || [];
    mats[key].push(m);
    return m;
  };

  // Grasplatte: Oberkante bei y = 0.
  const grass = new THREE.Mesh(new THREE.BoxGeometry(S, 1.2, S), lambert('grass'));
  grass.position.y = -0.6;
  grass.receiveShadow = true;
  group.add(grass);

  // Schmaler dunklerer Grasrand, damit die Kante lesbar bleibt.
  const edge = new THREE.Mesh(new THREE.BoxGeometry(S + 0.3, 0.35, S + 0.3), lambert('grassEdge'));
  edge.position.y = -1.0;
  group.add(edge);

  // Erdschichten, jede etwas kleiner als die vorige.
  const soil = new THREE.Mesh(new THREE.BoxGeometry(S - 0.6, 2.4, S - 0.6), lambert('soil'));
  soil.position.y = -2.4;
  group.add(soil);

  const deep = new THREE.Mesh(new THREE.BoxGeometry(S - 2.0, 1.6, S - 2.0), lambert('soilDeep'));
  deep.position.y = -4.4;
  group.add(deep);

  // Felsspitze: Zylinder mit 4 Segmenten = umgedrehte Pyramide, um 45 Grad gedreht,
  // damit die Kanten mit der Inselplatte fluchten.
  const spikeGeo = new THREE.CylinderGeometry(0, (S - 2.0) * 0.72, 5.5, 4, 1);
  const spike = new THREE.Mesh(spikeGeo, lambert('soilDeep'));
  spike.rotation.y = Math.PI / 4;
  spike.position.y = -7.9;
  group.add(spike);

  // Wolken: drei Klumpen aus je drei bis vier Ikosaedern.
  const clouds = new THREE.Group();
  const cloudMat = lambert('cloud');
  // Alle Wolken hinter bzw. seitlich der Insel, keine vor dem Schlot.
  const cloudSpecs = [
    { x: -18, y: 12, z: -8, s: 1.0, speed: 0.12 },
    { x: 16, y: 14, z: -15, s: 1.4, speed: 0.08 },
    { x: -5, y: 16, z: -20, s: 0.9, speed: 0.15 },
  ];
  cloudSpecs.forEach((spec) => {
    const c = new THREE.Group();
    const parts = [
      [0, 0, 0, 1.6],
      [1.5, 0.3, 0.2, 1.2],
      [-1.4, 0.2, 0.3, 1.1],
      [0.4, 0.9, -0.2, 1.0],
    ];
    parts.forEach(([px, py, pz, r]) => {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r * spec.s, 0), cloudMat);
      m.position.set(px * spec.s, py * spec.s, pz * spec.s);
      c.add(m);
    });
    c.position.set(spec.x, spec.y, spec.z);
    c.userData.baseX = spec.x;
    c.userData.speed = spec.speed;
    clouds.add(c);
  });
  group.add(clouds);

  return {
    group,
    update(dt, t, reduced) {
      if (reduced) return;
      clouds.children.forEach((c, i) => {
        c.position.x = c.userData.baseX + Math.sin(t * c.userData.speed + i) * 1.5;
      });
    },
    applyPalette(p) {
      Object.entries(mats).forEach(([key, list]) => {
        list.forEach((m) => m.color.setHex(p[key]));
      });
    },
  };
}
