import * as THREE from 'three';
import { buildDataLine, defaultLineRoute } from './buildDataLine';
import { tierMix } from './tierVisuals';

// Serverkeller (Zone "basement"): GPU-Racks mit blinkenden LEDs, Token-Burner mit
// glühendem Kern, Rechenzentrums-Silos mit drehendem Lüfter und Grauer-Markt-Silos
// hinter Bauzaun - jede dieser vier Engines auf eigenen, WACHSENDEN Grundstücken
// (siehe utils/campusLayout.js): ist ein Grundstück voll, entsteht das nächste
// nebenan, in einer eigenen Reihe je Engine, damit sich die vier nie ins Gehege
// kommen. Web-Scraper-Drohnen bleiben dagegen frei fliegend über der ganzen Zone,
// wie schon vorher - eine Drohne braucht kein Grundstück. Dazu eine zweite
// Datenleitung zum Ofen.

const RACK_MAX = 100;
const BURNER_MAX = 60;
const SILO_MAX = 40;
const GRAY_MAX = 24;
const DRONE_MAX = 28;

function hash01(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Plätze INNERHALB eines Grundstücks, relativ zu dessen Mitte (lot.lx/lz).
const RACK_SLOTS = [
  { x: -1.2, z: -0.4 }, { x: -0.4, z: -0.4 }, { x: 0.4, z: -0.4 }, { x: 1.2, z: -0.4 },
  { x: -1.2, z: 0.4 }, { x: -0.4, z: 0.4 }, { x: 0.4, z: 0.4 }, { x: 1.2, z: 0.4 },
];
const BURNER_SLOTS = [
  { x: -0.6, z: -0.6 }, { x: 0.6, z: -0.6 },
  { x: -0.6, z: 0.6 }, { x: 0.6, z: 0.6 },
];
const SILO_SLOTS = [{ x: -0.95, z: 0 }, { x: 0.95, z: 0 }];
const GRAY_SLOTS = [{ x: -0.75, z: 0 }, { x: 0.75, z: 0 }];

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

  // Racks + LED-Streifen + Blades + Abluftlüfter + Kabelkanäle
  const rack = inst(new THREE.BoxGeometry(0.55, 1.7, 0.55), lambert('rack'), RACK_MAX);
  const rackBlade = inst(new THREE.BoxGeometry(0.46, 0.08, 0.05), lambert('steel'), RACK_MAX * 4, false);
  const rackExhaust = inst(new THREE.BoxGeometry(0.38, 0.12, 0.38), lambert('steelDark'), RACK_MAX, false);
  const rackCable = inst(new THREE.BoxGeometry(0.06, 1.6, 0.06), basic('token'), RACK_MAX, false);
  const rackLed = inst(new THREE.BoxGeometry(0.12, 0.05, 0.03), basic('neon'), RACK_MAX * 4, false);
  // Burner
  const burner = inst(new THREE.BoxGeometry(0.8, 0.8, 0.8), lambert('burner'), BURNER_MAX);
  const burnerCoreMat = basic('fire');
  const burnerCore = inst(new THREE.BoxGeometry(0.5, 0.5, 0.5), burnerCoreMat, BURNER_MAX, false);
  // Silos: Fassade, Band, Fensterring, Lüfterblätter
  const silo = inst(new THREE.CylinderGeometry(0.85, 0.9, 2.6, 10), lambert('facade'), SILO_MAX);
  const siloBand = inst(new THREE.CylinderGeometry(0.9, 0.9, 0.3, 10), lambert('siloBand'), SILO_MAX, false);
  const siloRingMat = basic('token');
  const siloRing = inst(new THREE.CylinderGeometry(0.87, 0.87, 0.14, 10), siloRingMat, SILO_MAX * 2, false);
  const fanBlade = inst(new THREE.BoxGeometry(0.75, 0.04, 0.16), lambert('steel'), SILO_MAX * 2, false);
  // Grauer Markt
  const graySilo = inst(new THREE.CylinderGeometry(0.42, 0.46, 1.8, 8), lambert('steelDark'), GRAY_MAX);
  const tarpMat = lambert('tarp');
  const tarp = inst(new THREE.BoxGeometry(1.1, 0.06, 1.0), tarpMat, GRAY_MAX);
  const fencePost = inst(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 5), lambert('fence'), GRAY_MAX * 2, false);
  const fenceRail = inst(new THREE.BoxGeometry(0.95, 0.05, 0.05), lambert('fence'), GRAY_MAX * 2, false);
  // Drohnen (unverändert: frei fliegend, kein Grundstück)
  const droneBody = inst(new THREE.BoxGeometry(0.36, 0.12, 0.36), lambert('drone'), DRONE_MAX, false);
  const droneRotor = inst(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 8), lambert('steelDark'), DRONE_MAX * 4, false);
  const droneEye = inst(new THREE.SphereGeometry(0.05, 5, 4), basic('warnRed'), DRONE_MAX, false);

  const route = defaultLineRoute(anchor3d, furnaceAnchor, -1.4, { x: -1, z: 0.35 });
  const line = buildDataLine(palette, route.points, group.position, route.dir);
  group.add(line.group);

  let placedKey = null;
  let siloLots = [];
  let burnerLots = [];
  let lastTiers = '';

  // Racks: `n` Racks über so viele Grundstücke verteilt, wie nötig sind.
  function layoutRacks(lots, n) {
    let idx = 0;
    for (let li = 0; li < lots.length && idx < n; li += 1) {
      const lot = lots[li];
      for (let s = 0; s < RACK_SLOTS.length && idx < n; s += 1, idx += 1) {
        const slot = RACK_SLOTS[s];
        const x = lot.lx + slot.x;
        const z = lot.lz + slot.z;
        dummy.position.set(x, 0.85, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        rack.setMatrixAt(idx, dummy.matrix);

        // Abluftlüfter auf dem Rack-Dach
        dummy.position.set(x, 1.76, z);
        dummy.updateMatrix();
        rackExhaust.setMatrixAt(idx, dummy.matrix);

        // Kabelkanal an der Seite
        dummy.position.set(x - 0.28, 0.85, z);
        dummy.updateMatrix();
        rackCable.setMatrixAt(idx, dummy.matrix);

        for (let l = 0; l < 4; l += 1) {
          // Blade-Server Einschub
          dummy.position.set(x, 0.4 + l * 0.35, z + 0.26);
          dummy.updateMatrix();
          rackBlade.setMatrixAt(idx * 4 + l, dummy.matrix);

          // Status-LED
          dummy.position.set(x + 0.15, 0.4 + l * 0.35, z + 0.29);
          dummy.updateMatrix();
          rackLed.setMatrixAt(idx * 4 + l, dummy.matrix);
        }
      }
    }
    rack.count = n;
    rackExhaust.count = n;
    rackCable.count = n;
    rackBlade.count = n * 4;
    rackLed.count = n * 4;
  }

  function layoutBurners(lots, n) {
    burnerLots = [];
    let idx = 0;
    for (let li = 0; li < lots.length && idx < n; li += 1) {
      const lot = lots[li];
      for (let s = 0; s < BURNER_SLOTS.length && idx < n; s += 1, idx += 1) {
        const slot = BURNER_SLOTS[s];
        const x = lot.lx + slot.x;
        const z = lot.lz + slot.z;
        burnerLots.push({ x, z });
        dummy.position.set(x, 0.4, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        burner.setMatrixAt(idx, dummy.matrix);
      }
    }
    burner.count = n;
    burnerCore.count = n;
  }

  function layoutSilos(lots, n) {
    siloLots = [];
    let idx = 0;
    for (let li = 0; li < lots.length && idx < n; li += 1) {
      const lot = lots[li];
      for (let s = 0; s < SILO_SLOTS.length && idx < n; s += 1, idx += 1) {
        const slot = SILO_SLOTS[s];
        const x = lot.lx + slot.x;
        const z = lot.lz + slot.z;
        siloLots.push({ x, z });
        dummy.position.set(x, 1.3, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        silo.setMatrixAt(idx, dummy.matrix);
        siloBand.setMatrixAt(idx, dummy.matrix);
        dummy.position.set(x, 0.7, z);
        dummy.updateMatrix();
        siloRing.setMatrixAt(idx * 2, dummy.matrix);
        dummy.position.set(x, 2.0, z);
        dummy.updateMatrix();
        siloRing.setMatrixAt(idx * 2 + 1, dummy.matrix);
      }
    }
    silo.count = n;
    siloBand.count = n;
    siloRing.count = n * 2;
    fanBlade.count = n * 2;
  }

  function layoutGray(lots, n) {
    let idx = 0;
    for (let li = 0; li < lots.length && idx < n; li += 1) {
      const lot = lots[li];
      for (let s = 0; s < GRAY_SLOTS.length && idx < n; s += 1, idx += 1) {
        const slot = GRAY_SLOTS[s];
        const x = lot.lx + slot.x;
        const z = lot.lz + slot.z;
        dummy.position.set(x, 0.9, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        graySilo.setMatrixAt(idx, dummy.matrix);
        dummy.position.set(x, 1.85, z);
        dummy.rotation.set(0.12, hash01(idx) * 0.5, -0.1);
        dummy.updateMatrix();
        tarp.setMatrixAt(idx, dummy.matrix);
        dummy.rotation.set(0, 0, 0);
        dummy.position.set(x + 0.6, 0.5, z - 0.45);
        dummy.updateMatrix();
        fencePost.setMatrixAt(idx * 2, dummy.matrix);
        dummy.position.set(x + 0.6, 0.5, z + 0.45);
        dummy.updateMatrix();
        fencePost.setMatrixAt(idx * 2 + 1, dummy.matrix);
        dummy.rotation.set(0, Math.PI / 2, 0);
        dummy.position.set(x + 0.6, 0.35, z);
        dummy.updateMatrix();
        fenceRail.setMatrixAt(idx * 2, dummy.matrix);
        dummy.position.set(x + 0.6, 0.8, z);
        dummy.updateMatrix();
        fenceRail.setMatrixAt(idx * 2 + 1, dummy.matrix);
      }
    }
    graySilo.count = n;
    tarp.count = n;
    fencePost.count = n * 2;
    fenceRail.count = n * 2;
  }

  function layout(zone, counts) {
    const lotsFor = (id) => (zone.lots || []).filter((l) => l.id === id);
    layoutRacks(lotsFor('gpu_rack'), counts.rack);
    layoutBurners(lotsFor('token_burner'), counts.burner);
    layoutSilos(lotsFor('datacenter'), counts.silo);
    layoutGray(lotsFor('gray_market_dc'), counts.gray);
    droneBody.count = counts.drone;
    droneRotor.count = counts.drone * 4;
    droneEye.count = counts.drone;

    [rack, rackBlade, rackExhaust, rackCable, rackLed, burner, silo, siloBand, siloRing, graySilo, tarp, fencePost, fenceRail].forEach((m) => {
      m.instanceMatrix.needsUpdate = true;
    });
  }

  return {
    group,
    update(zone, ctx, p) {
      const { dt, t, reduced } = ctx;
      const find = (id) => zone.buildings.find((x) => x.id === id);
      const c = (id) => {
        const b = find(id);
        return b ? b.props : 0;
      };
      // Sichtstufe (aus gekauften Upgrades) je Engine, siehe tierVisuals.js.
      const tierOf = (id) => {
        const b = find(id);
        return b ? b.tier : 0;
      };
      const counts = {
        rack: Math.min(RACK_MAX, c('gpu_rack')),
        burner: Math.min(BURNER_MAX, c('token_burner')),
        silo: Math.min(SILO_MAX, c('datacenter')),
        gray: Math.min(GRAY_MAX, c('gray_market_dc')),
        drone: Math.min(DRONE_MAX, c('web_scraper')),
      };
      // Lot-Zähler mit in den Schlüssel: rutscht ein Grundstück (Nachbar-Engine wächst),
      // müssen auch unveränderte Stückzahlen neu platziert werden.
      const key = `${counts.rack}|${counts.burner}|${counts.silo}|${counts.gray}|${(zone.lots || []).length}`;
      if (key !== placedKey) {
        layout(zone, counts);
        placedKey = key;
      }

      // Sichtstufen aus gekauften Upgrades (siehe tierVisuals.js): eine Stufe je Engine,
      // färbt LEDs, Glut, Fensterring und Plane wärmer/goldener statt neue Formen zu
      // brauchen - vier Engines auf einmal hätten mit Bastel-Geometrie zu lange gedauert.
      const rackTier = tierOf('gpu_rack');
      const burnerTier = tierOf('token_burner');
      const siloTier = tierOf('datacenter');
      const grayTier = tierOf('gray_market_dc');
      const tierKey = `${rackTier}|${burnerTier}|${siloTier}|${grayTier}`;
      if (tierKey !== lastTiers) {
        lastTiers = tierKey;
        burnerCoreMat.color.setHex(tierMix(p.fire, p.gold, burnerTier, 0.7));
        siloRingMat.color.setHex(tierMix(p.token, p.gold, siloTier, 0.7));
        tarpMat.color.setHex(tierMix(p.tarp, p.gold, grayTier));
      }

      // LEDs blinken: jede LED hat eigenen Takt, die "an"-Farbe wandert mit der Stufe
      // Richtung Gold.
      const ledOnHex = tierMix(p.token, p.gold, rackTier, 0.7);
      for (let i = 0; i < counts.rack * 4; i += 1) {
        const on = reduced ? true : hash01(i + Math.floor(t * 4 + hash01(i) * 10)) > 0.35;
        color.setHex(on ? ledOnHex : p.rack);
        rackLed.setColorAt(i, color);
      }
      if (counts.rack > 0 && rackLed.instanceColor) rackLed.instanceColor.needsUpdate = true;

      // Burner-Kern wabert
      for (let i = 0; i < counts.burner; i += 1) {
        const s = burnerLots[i];
        const k = reduced ? 1 : 1 + Math.sin(t * 7 + i) * 0.12;
        dummy.position.set(s.x, 0.4 + (reduced ? 0 : Math.sin(t * 3 + i) * 0.03), s.z);
        dummy.rotation.set(t * 0.8 + i, t * 1.1, 0);
        dummy.scale.setScalar(k);
        dummy.updateMatrix();
        burnerCore.setMatrixAt(i, dummy.matrix);
      }
      if (counts.burner > 0) burnerCore.instanceMatrix.needsUpdate = true;

      // Lüfter drehen
      for (let i = 0; i < counts.silo; i += 1) {
        const s = siloLots[i];
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

      // Drohnen kreisen über dem Keller, Radius folgt der aktuell belegten Breite -
      // sonst blieben sie über einer kleinen Startzone hängen, während die Racks längst
      // weit hinausgewachsen sind.
      const rect = zone.rect;
      const cx = rect ? rect.cx - anchor3d.x : 0;
      const cz = rect ? rect.cz - anchor3d.z : 0;
      const spanR = rect ? Math.max(2.0, Math.min(rect.w, rect.d) * 0.4) : 2.0;
      for (let i = 0; i < counts.drone; i += 1) {
        const a = (reduced ? 0 : t * 0.35) + (i / DRONE_MAX) * Math.PI * 2;
        const r = spanR + (i % 3) * 0.5;
        const x = cx + Math.cos(a) * r;
        const z = cz + Math.sin(a) * r * 0.6;
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
      placedKey = null;
      lastTiers = '';
    },
  };
}
