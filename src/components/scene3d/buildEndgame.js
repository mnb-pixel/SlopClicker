import * as THREE from 'three';

// Singularitäts-Horizont (Zone "endgame") an der hinteren Inselkante: Kühltürme des
// Atomreaktors mit Dampf, die Hologramm-Geisterstadt aus flimmernden Glasquadern,
// schwebende Excel-Tabellen mit Augen, und die Singularität als schwarze Kugel mit
// Akkretionsringen hoch über dem Ofen.

const REACTOR_MAX = 4;
const CITY_MAX = 6;
const SHEET_MAX = 6;
const STEAM_PER_TOWER = 6;

function hash01(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const REACTOR_SLOTS = [
  { x: -5.6, z: -0.4 },
  { x: -3.4, z: -0.6 },
  { x: 5.6, z: -0.4 },
  { x: 3.4, z: -0.6 },
];
const CITY_SLOTS = [
  { x: 0.2, z: -0.3, h: 2.6 },
  { x: -0.9, z: 0.2, h: 1.8 },
  { x: 1.3, z: 0.3, h: 2.1 },
  { x: 0.5, z: 0.9, h: 1.4 },
  { x: -1.4, z: -0.7, h: 2.9 },
  { x: 1.8, z: -0.8, h: 1.6 },
];
const SHEET_SLOTS = [];
// Hoch genug, um über den Silos des Serverkellers sichtbar zu bleiben.
for (let i = 0; i < SHEET_MAX; i += 1) SHEET_SLOTS.push({ x: -2.2 - (i % 3) * 1.0, z: 0.6 - Math.floor(i / 3) * 1.1, y: 5.0 + (i % 2) * 0.9 });

export function buildEndgame(palette, zoneDef, furnaceAnchor) {
  const group = new THREE.Group();
  const { anchor3d } = zoneDef;
  group.position.set(anchor3d.x, 0.3, anchor3d.z);

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
  const inst = (geo, mat, count, shadow = true) => {
    const m = new THREE.InstancedMesh(geo, mat, count);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.count = 0;
    m.frustumCulled = false;
    m.castShadow = shadow;
    group.add(m);
    return m;
  };
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const WHITE = new THREE.Color(0xffffff);

  // --- Kühltürme -------------------------------------------------------------------
  const towerBody = inst(new THREE.CylinderGeometry(0.85, 1.35, 3.6, 12), lambert('facade'), REACTOR_MAX);
  const towerLip = inst(new THREE.CylinderGeometry(1.05, 0.85, 0.6, 12), lambert('stone'), REACTOR_MAX);
  const towerBase = inst(new THREE.CylinderGeometry(1.45, 1.55, 0.35, 12), lambert('stoneDark'), REACTOR_MAX);
  const steamMat = lambert('cloud', { transparent: true, opacity: 0.85 });
  const steam = inst(new THREE.IcosahedronGeometry(0.4, 0), steamMat, REACTOR_MAX * STEAM_PER_TOWER, false);
  const steamPhase = Float32Array.from({ length: REACTOR_MAX * STEAM_PER_TOWER }, (_, i) => hash01(i + 500));
  const steamSeed = Float32Array.from({ length: REACTOR_MAX * STEAM_PER_TOWER }, (_, i) => hash01(i + 700) * Math.PI * 2);

  // --- Hologramm-Stadt -------------------------------------------------------------
  const projector = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 0.2, 12), lambert('steelDark'));
  projector.position.set(0.3, 0.1, 0);
  group.add(projector);
  const projectorRing = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.25, 0.08, 12), basic('token'));
  projectorRing.position.set(0.3, 0.22, 0);
  group.add(projectorRing);
  const holoMat = basic('token', { transparent: true, opacity: 0.35, depthWrite: false });
  const holo = inst(new THREE.BoxGeometry(0.7, 1, 0.7), holoMat, CITY_MAX, false);
  const holoEdge = inst(new THREE.BoxGeometry(0.74, 0.06, 0.74), basic('token'), CITY_MAX * 2, false);

  // --- Excel-Tabellen -------------------------------------------------------------------
  const sheet = inst(new THREE.BoxGeometry(1.2, 0.9, 0.03), lambert('paper'), SHEET_MAX, false);
  const gridLine = inst(new THREE.BoxGeometry(1.16, 0.02, 0.035), lambert('deskLeg'), SHEET_MAX * 8, false);
  const eyeWhite = inst(new THREE.SphereGeometry(0.11, 7, 6), lambert('paper'), SHEET_MAX * 2, false);
  const pupil = inst(new THREE.SphereGeometry(0.05, 5, 4), basic('camera'), SHEET_MAX * 2, false);

  // --- Singularität -----------------------------------------------------------------
  const singGroup = new THREE.Group();
  // Über dem Ofen (Weltkoordinaten), also relativ zum Zonen-Anker verschoben.
  // Tief genug, um unter dem oberen Overlay zu bleiben, im Rauch des Schlots.
  singGroup.position.set(furnaceAnchor.x - anchor3d.x, 10.6, furnaceAnchor.z - anchor3d.z);
  singGroup.visible = false;
  group.add(singGroup);
  const voidSphere = new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 12), basic('void'));
  singGroup.add(voidSphere);
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.12, 6, 32), basic('containerB'));
  ringA.rotation.x = Math.PI / 2 - 0.35;
  singGroup.add(ringA);
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.07, 6, 32), basic('gold'));
  ringB.rotation.x = Math.PI / 2 + 0.25;
  singGroup.add(ringB);
  const debris = inst(new THREE.TetrahedronGeometry(0.16, 0), basic('token'), 24, false);
  singGroup.add(debris);
  debris.count = 24;

  let placed = null;

  function layout(counts) {
    for (let i = 0; i < counts.reactor; i += 1) {
      const s = REACTOR_SLOTS[i];
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.position.set(s.x, 1.8, s.z);
      dummy.updateMatrix();
      towerBody.setMatrixAt(i, dummy.matrix);
      dummy.position.set(s.x, 3.9, s.z);
      dummy.updateMatrix();
      towerLip.setMatrixAt(i, dummy.matrix);
      dummy.position.set(s.x, 0.17, s.z);
      dummy.updateMatrix();
      towerBase.setMatrixAt(i, dummy.matrix);
    }
    towerBody.count = counts.reactor;
    towerLip.count = counts.reactor;
    towerBase.count = counts.reactor;
    steam.count = counts.reactor * STEAM_PER_TOWER;

    projector.visible = counts.city > 0;
    projectorRing.visible = counts.city > 0;
    for (let i = 0; i < counts.city; i += 1) {
      const s = CITY_SLOTS[i];
      dummy.rotation.set(0, 0, 0);
      dummy.position.set(0.3 + s.x, 0.3 + s.h / 2, s.z);
      dummy.scale.set(1, s.h, 1);
      dummy.updateMatrix();
      holo.setMatrixAt(i, dummy.matrix);
      dummy.scale.setScalar(1);
      dummy.position.set(0.3 + s.x, 0.3 + s.h, s.z);
      dummy.updateMatrix();
      holoEdge.setMatrixAt(i * 2, dummy.matrix);
      dummy.position.set(0.3 + s.x, 0.3 + s.h * 0.5, s.z);
      dummy.updateMatrix();
      holoEdge.setMatrixAt(i * 2 + 1, dummy.matrix);
    }
    holo.count = counts.city;
    holoEdge.count = counts.city * 2;

    sheet.count = counts.sheet;
    gridLine.count = counts.sheet * 8;
    eyeWhite.count = counts.sheet * 2;
    pupil.count = counts.sheet * 2;

    singGroup.visible = counts.singularity > 0;
    [towerBody, towerLip, towerBase, holo, holoEdge].forEach((m) => {
      m.instanceMatrix.needsUpdate = true;
    });
  }

  return {
    group,
    update(zone, ctx) {
      const { dt, t, reduced } = ctx;
      const c = (id) => {
        const b = zone.buildings.find((x) => x.id === id);
        return b ? b.props : 0;
      };
      const counts = {
        reactor: Math.min(REACTOR_MAX, c('nuclear_reactor')),
        city: Math.min(CITY_MAX, c('metaverse_city')),
        sheet: Math.min(SHEET_MAX, c('excel_sheet')),
        singularity: Math.min(1, c('singularity')),
      };
      const key = `${counts.reactor}|${counts.city}|${counts.sheet}|${counts.singularity}`;
      if (key !== placed) {
        layout(counts);
        placed = key;
      }

      // Dampf aus den Kühltürmen
      for (let i = 0; i < counts.reactor * STEAM_PER_TOWER; i += 1) {
        const s = REACTOR_SLOTS[Math.floor(i / STEAM_PER_TOWER)];
        steamPhase[i] = (steamPhase[i] + dt * (reduced ? 0 : 0.18)) % 1;
        const ph = steamPhase[i];
        dummy.position.set(s.x + Math.sin(steamSeed[i] + ph * 4) * (0.3 + ph), 4.2 + ph * 3.5, s.z + Math.cos(steamSeed[i] + ph * 3) * (0.3 + ph));
        dummy.scale.setScalar(0.7 + ph * 2.2);
        dummy.rotation.set(ph * 2, steamSeed[i], 0);
        dummy.updateMatrix();
        steam.setMatrixAt(i, dummy.matrix);
        color.copy(steamMat.color).lerp(WHITE, ph * 0.5);
        steam.setColorAt(i, color);
      }
      if (counts.reactor > 0) {
        steam.instanceMatrix.needsUpdate = true;
        if (steam.instanceColor) steam.instanceColor.needsUpdate = true;
      }

      // Hologramm flimmert
      if (counts.city > 0 && !reduced) {
        const flick = hash01(Math.floor(t * 12)) > 0.9 ? 0.12 : 0.35 + Math.sin(t * 2) * 0.06;
        holoMat.opacity = flick;
      }

      // Tabellen schweben und drehen sich, Augen schauen zum Ofen
      for (let i = 0; i < counts.sheet; i += 1) {
        const s = SHEET_SLOTS[i];
        const bob = reduced ? 0 : Math.sin(t * 1.3 + i) * 0.2;
        const yaw = (reduced ? 0 : t * 0.4 + i) % (Math.PI * 2);
        dummy.position.set(s.x, s.y + bob, s.z);
        dummy.rotation.set(0, yaw, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        sheet.setMatrixAt(i, dummy.matrix);
        const base = dummy.matrix.clone();
        const tmp = new THREE.Object3D();
        for (let l = 0; l < 8; l += 1) {
          if (l < 4) {
            tmp.position.set(0, -0.3 + l * 0.2, 0);
            tmp.rotation.set(0, 0, 0);
            tmp.scale.set(1, 1, 1);
          } else {
            tmp.position.set(-0.36 + (l - 4) * 0.24, 0, 0);
            tmp.rotation.set(0, 0, Math.PI / 2);
            tmp.scale.set(0.75, 1, 1);
          }
          tmp.updateMatrix();
          gridLine.setMatrixAt(i * 8 + l, tmp.matrix.premultiply(base));
        }
        for (let e = 0; e < 2; e += 1) {
          tmp.position.set(-0.22 + e * 0.44, 0.15, 0.06);
          tmp.rotation.set(0, 0, 0);
          tmp.scale.set(1, 1, 1);
          tmp.updateMatrix();
          eyeWhite.setMatrixAt(i * 2 + e, tmp.matrix.premultiply(base));
          tmp.position.set(-0.22 + e * 0.44 + (reduced ? 0 : Math.sin(t * 0.7 + i) * 0.04), 0.15, 0.15);
          tmp.updateMatrix();
          pupil.setMatrixAt(i * 2 + e, tmp.matrix.premultiply(base));
        }
      }
      if (counts.sheet > 0) {
        [sheet, gridLine, eyeWhite, pupil].forEach((m) => {
          m.instanceMatrix.needsUpdate = true;
        });
      }

      // Singularität: Ringe rotieren, Trümmer kreisen hinein
      if (counts.singularity > 0) {
        if (!reduced) {
          ringA.rotation.z += dt * 0.6;
          ringB.rotation.z -= dt * 0.35;
          const pulse = 1 + Math.sin(t * 1.5) * 0.05;
          voidSphere.scale.setScalar(pulse);
        }
        for (let i = 0; i < 24; i += 1) {
          const ph = reduced ? 0.5 : ((t * 0.25 + i / 24) % 1);
          const r = 2.6 - ph * 1.7;
          const a = ph * Math.PI * 4 + i;
          dummy.position.set(Math.cos(a) * r, Math.sin(a * 0.5) * 0.6, Math.sin(a) * r * 0.7);
          dummy.rotation.set(t + i, t * 2, 0);
          dummy.scale.setScalar(0.4 + (1 - ph) * 0.8);
          dummy.updateMatrix();
          debris.setMatrixAt(i, dummy.matrix);
        }
        debris.instanceMatrix.needsUpdate = true;
      }
    },
    applyPalette(p) {
      Object.entries(mats).forEach(([key, list]) => list.forEach((m) => m.color.setHex(p[key])));
      placed = null;
    },
  };
}
