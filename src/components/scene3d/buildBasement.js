import * as THREE from 'three';
import { buildDataLine, defaultLineRoute } from './buildDataLine';

// Serverkeller (Zone "basement"): GPU-Racks mit blinkenden LEDs, Rechenzentrums-Silos
// mit drehendem Lüfter, Token-Burner mit glühendem Kern, Scraper-Drohnen, die über den
// Silos kreisen, Grauer-Markt-Silos hinter Bauzaun mit Plane. Dazu eine zweite
// Datenleitung zum Ofen.

const RACK_MAX = 14;
const SILO_MAX = 8;
const BURNER_MAX = 8;
const DRONE_MAX = 12;
const GRAY_MAX = 6;

function hash01(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Layout (lokal, Kamera schaut aus +x/+z): Racks vorne rechts, Silos rechts hinten,
// Burner und Grauer Markt links, damit nichts hinter den hohen Silos verschwindet.
const RACK_SLOTS = [];
for (let r = 0; r < 2; r += 1) for (let c = 0; c < 7; c += 1) RACK_SLOTS.push({ x: -0.6 + c * 0.67, z: 2.9 - r * 0.85 });
const SILO_SLOTS = [
  { x: -0.2, z: 0.4 }, { x: 1.6, z: 0.4 }, { x: 3.2, z: 0.4 },
  { x: -0.2, z: -1.4 }, { x: 1.6, z: -1.4 }, { x: 3.2, z: -1.4 },
  { x: 1.6, z: -3.0 }, { x: 3.2, z: -3.0 },
];
const BURNER_SLOTS = [];
for (let c = 0; c < 2; c += 1) for (let r = 0; r < 4; r += 1) BURNER_SLOTS.push({ x: -2.1 + c * 0.95, z: 2.2 - r * 1.05 });
const GRAY_SLOTS = [];
for (let i = 0; i < 6; i += 1) GRAY_SLOTS.push({ x: -3.5, z: 2.6 - i * 0.95 });

export function buildBasement(palette, zoneDef, furnaceAnchor) {
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
    m.receiveShadow = shadow;
    group.add(m);
    return m;
  };
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  // Racks + LED-Streifen
  const rack = inst(new THREE.BoxGeometry(0.55, 1.7, 0.55), lambert('rack'), RACK_MAX);
  const rackLed = inst(new THREE.BoxGeometry(0.3, 0.05, 0.03), basic('token'), RACK_MAX * 4, false);
  // Silos: Fassade, Band, Fensterring, Lüfterblätter
  const silo = inst(new THREE.CylinderGeometry(0.85, 0.9, 2.6, 10), lambert('facade'), SILO_MAX);
  const siloBand = inst(new THREE.CylinderGeometry(0.9, 0.9, 0.3, 10), lambert('siloBand'), SILO_MAX, false);
  const siloRing = inst(new THREE.CylinderGeometry(0.87, 0.87, 0.14, 10), basic('token'), SILO_MAX * 2, false);
  const fanBlade = inst(new THREE.BoxGeometry(0.75, 0.04, 0.16), lambert('steel'), SILO_MAX * 2, false);
  // Burner
  const burner = inst(new THREE.BoxGeometry(0.8, 0.8, 0.8), lambert('burner'), BURNER_MAX);
  const burnerCore = inst(new THREE.BoxGeometry(0.5, 0.5, 0.5), basic('fire'), BURNER_MAX, false);
  // Drohnen
  const droneBody = inst(new THREE.BoxGeometry(0.36, 0.12, 0.36), lambert('drone'), DRONE_MAX, false);
  const droneRotor = inst(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 8), lambert('steelDark'), DRONE_MAX * 4, false);
  const droneEye = inst(new THREE.SphereGeometry(0.05, 5, 4), basic('warnRed'), DRONE_MAX, false);
  // Grauer Markt
  const graySilo = inst(new THREE.CylinderGeometry(0.42, 0.46, 1.8, 8), lambert('steelDark'), GRAY_MAX);
  const tarp = inst(new THREE.BoxGeometry(1.1, 0.06, 1.0), lambert('tarp'), GRAY_MAX);
  const fencePost = inst(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 5), lambert('fence'), GRAY_MAX * 2, false);
  const fenceRail = inst(new THREE.BoxGeometry(0.95, 0.05, 0.05), lambert('fence'), GRAY_MAX * 2, false);

  const route = defaultLineRoute(anchor3d, furnaceAnchor, -1.4, { x: -1, z: 0.35 });
  const line = buildDataLine(palette, route.points, group.position, route.dir);
  group.add(line.group);

  let placed = null;

  function layout(counts) {
    // Racks
    for (let i = 0; i < counts.rack; i += 1) {
      const s = RACK_SLOTS[i];
      dummy.position.set(s.x, 0.85, s.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      rack.setMatrixAt(i, dummy.matrix);
      for (let l = 0; l < 4; l += 1) {
        dummy.position.set(s.x, 0.4 + l * 0.35, s.z + 0.29);
        dummy.updateMatrix();
        rackLed.setMatrixAt(i * 4 + l, dummy.matrix);
      }
    }
    rack.count = counts.rack;
    rackLed.count = counts.rack * 4;
    // Silos
    for (let i = 0; i < counts.silo; i += 1) {
      const s = SILO_SLOTS[i];
      dummy.position.set(s.x, 1.3, s.z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      silo.setMatrixAt(i, dummy.matrix);
      dummy.position.set(s.x, 1.3, s.z);
      dummy.updateMatrix();
      siloBand.setMatrixAt(i, dummy.matrix);
      dummy.position.set(s.x, 0.7, s.z);
      dummy.updateMatrix();
      siloRing.setMatrixAt(i * 2, dummy.matrix);
      dummy.position.set(s.x, 2.0, s.z);
      dummy.updateMatrix();
      siloRing.setMatrixAt(i * 2 + 1, dummy.matrix);
    }
    silo.count = counts.silo;
    siloBand.count = counts.silo;
    siloRing.count = counts.silo * 2;
    fanBlade.count = counts.silo * 2;
    // Burner
    for (let i = 0; i < counts.burner; i += 1) {
      const s = BURNER_SLOTS[i];
      dummy.position.set(s.x, 0.4, s.z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      burner.setMatrixAt(i, dummy.matrix);
    }
    burner.count = counts.burner;
    burnerCore.count = counts.burner;
    // Drohnen
    droneBody.count = counts.drone;
    droneRotor.count = counts.drone * 4;
    droneEye.count = counts.drone;
    // Grauer Markt
    for (let i = 0; i < counts.gray; i += 1) {
      const s = GRAY_SLOTS[i];
      dummy.position.set(s.x, 0.9, s.z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      graySilo.setMatrixAt(i, dummy.matrix);
      dummy.position.set(s.x, 1.85, s.z);
      dummy.rotation.set(0.12, hash01(i) * 0.5, -0.1);
      dummy.updateMatrix();
      tarp.setMatrixAt(i, dummy.matrix);
      dummy.rotation.set(0, 0, 0);
      dummy.position.set(s.x + 0.85, 0.5, s.z - 0.47);
      dummy.updateMatrix();
      fencePost.setMatrixAt(i * 2, dummy.matrix);
      dummy.position.set(s.x + 0.85, 0.5, s.z + 0.47);
      dummy.updateMatrix();
      fencePost.setMatrixAt(i * 2 + 1, dummy.matrix);
      dummy.rotation.set(0, Math.PI / 2, 0);
      dummy.position.set(s.x + 0.85, 0.35, s.z);
      dummy.updateMatrix();
      fenceRail.setMatrixAt(i * 2, dummy.matrix);
      dummy.position.set(s.x + 0.85, 0.8, s.z);
      dummy.updateMatrix();
      fenceRail.setMatrixAt(i * 2 + 1, dummy.matrix);
    }
    graySilo.count = counts.gray;
    tarp.count = counts.gray;
    fencePost.count = counts.gray * 2;
    fenceRail.count = counts.gray * 2;

    [rack, rackLed, silo, siloBand, siloRing, burner, graySilo, tarp, fencePost, fenceRail].forEach((m) => {
      m.instanceMatrix.needsUpdate = true;
    });
  }

  return {
    group,
    update(zone, ctx, p) {
      const { dt, t, reduced } = ctx;
      const c = (id) => {
        const b = zone.buildings.find((x) => x.id === id);
        return b ? b.props : 0;
      };
      const counts = {
        rack: Math.min(RACK_MAX, c('gpu_rack')),
        silo: Math.min(SILO_MAX, c('datacenter')),
        burner: Math.min(BURNER_MAX, c('token_burner')),
        drone: Math.min(DRONE_MAX, c('web_scraper')),
        gray: Math.min(GRAY_MAX, c('gray_market_dc')),
      };
      const key = `${counts.rack}|${counts.silo}|${counts.burner}|${counts.drone}|${counts.gray}`;
      if (key !== placed) {
        layout(counts);
        placed = key;
      }

      // LEDs blinken: jede LED hat eigenen Takt.
      for (let i = 0; i < counts.rack * 4; i += 1) {
        const on = reduced ? true : hash01(i + Math.floor(t * 4 + hash01(i) * 10)) > 0.35;
        color.setHex(on ? p.token : p.rack);
        rackLed.setColorAt(i, color);
      }
      if (counts.rack > 0 && rackLed.instanceColor) rackLed.instanceColor.needsUpdate = true;

      // Lüfter drehen
      for (let i = 0; i < counts.silo; i += 1) {
        const s = SILO_SLOTS[i];
        const a = reduced ? 0 : t * 6 + i;
        for (let b = 0; b < 2; b += 1) {
          dummy.position.set(s.x, 2.66, s.z);
          dummy.rotation.set(0, a + b * Math.PI * 0.5, 0);
          dummy.scale.setScalar(1);
          dummy.updateMatrix();
          fanBlade.setMatrixAt(i * 2 + b, dummy.matrix);
        }
      }
      if (counts.silo > 0) fanBlade.instanceMatrix.needsUpdate = true;

      // Burner-Kern wabert
      for (let i = 0; i < counts.burner; i += 1) {
        const s = BURNER_SLOTS[i];
        const k = reduced ? 1 : 1 + Math.sin(t * 7 + i) * 0.12;
        dummy.position.set(s.x, 0.4 + (reduced ? 0 : Math.sin(t * 3 + i) * 0.03), s.z);
        dummy.rotation.set(t * 0.8 + i, t * 1.1, 0);
        dummy.scale.setScalar(k);
        dummy.updateMatrix();
        burnerCore.setMatrixAt(i, dummy.matrix);
      }
      if (counts.burner > 0) burnerCore.instanceMatrix.needsUpdate = true;

      // Drohnen kreisen über den Silos
      for (let i = 0; i < counts.drone; i += 1) {
        const a = (reduced ? 0 : t * 0.35) + (i / DRONE_MAX) * Math.PI * 2;
        const r = 2.0 + (i % 3) * 0.5;
        const x = 1.4 + Math.cos(a) * r;
        const z = -1.0 + Math.sin(a) * r * 0.6;
        const y = 3.4 + (i % 2) * 0.5 + (reduced ? 0 : Math.sin(t * 2 + i) * 0.15);
        dummy.position.set(x, y, z);
        dummy.rotation.set(0.1, -a, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        droneBody.setMatrixAt(i, dummy.matrix);
        droneEye.setMatrixAt(i, dummy.matrix);
        for (let k = 0; k < 4; k += 1) {
          const ox = (k % 2 ? 0.2 : -0.2);
          const oz = (k < 2 ? 0.2 : -0.2);
          dummy.position.set(x + ox, y + 0.08, z + oz);
          dummy.rotation.set(0, reduced ? 0 : t * 30 + k, 0);
          dummy.updateMatrix();
          droneRotor.setMatrixAt(i * 4 + k, dummy.matrix);
        }
      }
      if (counts.drone > 0) {
        droneBody.instanceMatrix.needsUpdate = true;
        droneEye.instanceMatrix.needsUpdate = true;
        droneRotor.instanceMatrix.needsUpdate = true;
      }

      line.update(zone.tier, dt, t, reduced);
    },
    applyPalette(p) {
      Object.entries(mats).forEach(([key, list]) => list.forEach((m) => m.color.setHex(p[key])));
      line.applyPalette(p);
      placed = null;
    },
  };
}
