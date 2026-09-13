import * as THREE from 'three';
import { buildDataLine, defaultLineRoute } from './buildDataLine';
import { tierMix } from './tierVisuals';
import { createVoxelKit } from './voxelModel';

// Serverkeller (Zone "basement"): GPU-Racks mit blinkenden LEDs, Token-Burner mit
// glühendem Kern, Rechenzentrums-Silos mit drehendem Lüfter und Grauer-Markt-Silos
// hinter Bauzaun - jede dieser vier Engines auf eigenen, WACHSENDEN Grundstücken
// (siehe utils/campusLayout.js): ist ein Grundstück voll, entsteht das nächste
// nebenan, in einer eigenen Reihe je Engine, damit sich die vier nie ins Gehege
// kommen. Web-Scraper-Drohnen bleiben dagegen frei fliegend über der ganzen Zone,
// wie schon vorher - eine Drohne braucht kein Grundstück. Dazu eine zweite
// Datenleitung zum Ofen.
//
// Alle Props sind Voxel-Modelle (voxelModel.js): Racks mit Blade-Einschüben, Lüfter-
// gitter, Kabelkanal und Griffen; Burner als offener Käfig, durch dessen Streben der
// glühende Kern sichtbar ist; Silos mit Nietenband, Fensterring, Tür und Leiter; Grau-
// markt-Silos mit Rostflecken unter einer Plane hinter Maschendrahtzaun. Nur was sich
// pro Instanz bewegt oder umfärbt (LEDs, Kern, Lüfterblätter, Rotoren) bleibt ein
// eigenes Mesh.

const RACK_MAX = 120;
const BURNER_MAX = 80;
const SILO_MAX = 50;
const GRAY_MAX = 40;
const DRONE_MAX = 40;

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

  const kit = createVoxelKit(palette);
  const vox = (build, opts) => kit.geo(build, opts);
  const instV = (geo, count, shadow = true) => inst(geo, kit.mats, count, shadow);

  // --- Voxel-Modelle -----------------------------------------------------------------
  // Rack: 11 x 34 x 11 Voxel (0,55 x 1,7 x 0,55). Front (+z) mit vier Blade-Einschüben
  // auf Höhe der LED-Reihen (y 0,4 / 0,75 / 1,1 / 1,45), Lüfterschlitzen dazwischen,
  // Griffen; Kabelkanal an der -x-Seite, Abluftgitter oben.
  const rackGeo = vox((m) => {
    m.shell(-5, 0, -5, 11, 34, 11, 'rack', 1, { noise: 0.04, seed: 2 });
    m.box(-5, 0, -5, 11, 1, 11, 'steelDark');
    [8, 15, 22, 29].forEach((y) => {
      m.box(-4, y - 1, 5, 9, 3, 1, 'steel', { noise: 0.05, seed: y });
      m.set(-3, y, 6, 'steelDark');
      m.set(2, y, 6, 'steelDark');
      // Lüfterschlitze unter dem Einschub
      for (let x = -3; x <= 2; x += 2) m.set(x, y - 3, 5, 'rack', 0.55);
    });
    m.box(-6, 1, -1, 1, 32, 2, 'token');
    m.box(-4, 33, -4, 9, 1, 9, 'steelDark');
    for (let x = -3; x <= 3; x += 2) {
      for (let z = -3; z <= 3; z += 2) m.set(x, 33, z, 'steel');
    }
    m.set(0, 34, 0, 'steelDark');
  }, { unit: 0.05, unlit: new Set(['token']) });

  // Burner: offener Stahlkäfig, damit der glühende Kern (eigenes Mesh) sichtbar ist.
  const burnerGeo = vox((m) => {
    m.box(-8, 0, -8, 16, 2, 16, 'burner');
    m.box(-8, 14, -8, 16, 2, 16, 'burner');
    [[-8, -8], [6, -8], [-8, 6], [6, 6]].forEach(([x, z]) => m.box(x, 2, z, 2, 12, 2, 'steelDark'));
    for (let y = 5; y <= 11; y += 3) {
      m.box(-6, y, -8, 12, 1, 1, 'steelDark');
      m.box(-6, y, 7, 12, 1, 1, 'steelDark');
      m.box(-8, y, -6, 1, 1, 12, 'steelDark');
      m.box(7, y, -6, 1, 1, 12, 'steelDark');
    }
    m.cylinder(0, 0, 16, 3, 2.2, 'steelDark');
    m.set(-6, 15, 8, 'warnRed');
  }, { unit: 0.05, unlit: new Set(['warnRed']) });

  // Silo: Radius 9, Höhe 26 (0,1er-Raster). Nietenband unten, Fensterring (unbeleuchtet,
  // wandert je Sichtstufe Richtung Gold), Tür zur Kamera, Leiter, oberer Kranz.
  const siloGeo = vox((m) => {
    m.cylinder(0, 0, 0, 26, 8.8, 'facade', { noise: 0.03, seed: 4 });
    m.cylinder(0, 0, 0, 3, 9.2, 'siloBand');
    m.cylinder(0, 0, 12, 2, 9.2, 'siloBand');
    m.cylinder(0, 0, 25, 1, 9.2, 'siloBand');
    // Fensterringe: Hülle bei y 7 und 20, nur die Außenschale
    [7, 20].forEach((y) => m.cylinder(0, 0, y, 1, 9.0, 'token', { hollow: 1.2 }));
    // Tür (+z) und Leiter (+x)
    m.box(-2, 1, 8, 4, 6, 1, 'steelDark');
    m.set(1, 4, 9, 'gold');
    for (let y = 2; y < 24; y += 2) m.box(9, y, -1, 1, 1, 3, 'steel');
    m.box(9, 1, -2, 1, 24, 1, 'steel');
    m.box(9, 1, 2, 1, 24, 1, 'steel');
    // Lüftergehäuse oben
    m.cylinder(0, 0, 26, 1, 4.5, 'steelDark', { hollow: 1 });
  }, { unit: 0.1, unlit: new Set(['token']), faceShade: 0.06 });

  // Grauer Markt: dunkles Silo mit Rostflecken, Plane mit Falten, Zaunfeld.
  const grayGeo = vox((m) => {
    m.cylinder(0, 0, 0, 36, 8.6, 'steelDark', { noise: 0.1, seed: 6 });
    m.cylinder(0, 0, 0, 2, 9.2, 'steel');
    m.cylinder(0, 0, 17, 2, 9.2, 'steel');
    [[6, 5, 4], [-7, 12, 2], [3, 24, -8], [-5, 28, 6]].forEach(([x, y, z]) => m.box(x, y, z, 2, 3, 2, 'brickDark'));
    m.box(-2, 2, 8, 4, 7, 1, 'steel', { noise: 0.06, seed: 9 });
  }, { unit: 0.05 });
  const tarpGeo = vox((m) => {
    m.box(-11, 0, -10, 22, 2, 20, 'tarp', { noise: 0.08, seed: 12 });
    for (let x = -11; x < 11; x += 1) {
      for (let z = -10; z < 10; z += 1) {
        if ((x * 3 + z * 5) % 7 === 0) m.set(x, 2, z, 'tarp', 0.9);
        if ((x + z) % 9 === 0) m.remove(x, 1, z);
      }
    }
    // Zurrgurte
    m.box(-11, 2, -3, 22, 1, 1, 'tapeYellow');
    m.box(-11, 2, 4, 22, 1, 1, 'tapeYellow');
  }, { unit: 0.05, origin: [0, 1, 0] });
  const fenceGeo = vox((m) => {
    m.box(-1, 0, -10, 2, 20, 2, 'fence');
    m.box(-1, 0, 8, 2, 20, 2, 'fence');
    m.box(0, 6, -8, 1, 1, 16, 'fence');
    m.box(0, 16, -8, 1, 1, 16, 'fence');
    for (let z = -8; z < 8; z += 1) {
      for (let y = 7; y < 16; y += 1) if ((y + z) % 2 === 0) m.set(0, y, z, 'fence', 0.9);
    }
    m.box(-1, 18, -8, 2, 1, 16, 'tapeYellow');
  }, { unit: 0.05 });
  const droneGeo = vox((m) => {
    m.box(-3, 0, -3, 7, 3, 7, 'drone');
    [[-5, -5], [4, -5], [-5, 4], [4, 4]].forEach(([x, z]) => {
      m.box(x, 1, z, 2, 1, 2, 'steelDark');
      m.set(x + (x < 0 ? 1 : 0), 1, z + (z < 0 ? 1 : 0), 'steelDark');
    });
    m.box(-4, 1, -1, 1, 1, 2, 'steelDark');
    m.box(3, 1, -1, 1, 1, 2, 'steelDark');
    m.box(-1, 1, -4, 2, 1, 1, 'steelDark');
    m.box(-1, 1, 3, 2, 1, 1, 'steelDark');
    m.box(-2, 3, -2, 4, 1, 4, 'steelDark');
    m.set(0, 0, 3, 'warnRed');
  }, { unit: 0.04, origin: [0.5, 1.5, 0.5], unlit: new Set(['warnRed']) });
  const rotorGeo = vox((m) => {
    m.box(-3, 0, 0, 7, 1, 1, 'steelDark', { noise: 0 });
    m.box(0, 0, -3, 1, 1, 7, 'steelDark', { noise: 0 });
    m.set(0, 1, 0, 'steel');
  }, { unit: 0.04, origin: [0.5, 0, 0.5] });

  // Racks + LEDs (die LEDs blinken pro Instanz, deshalb eigenes Mesh)
  const rack = instV(rackGeo, RACK_MAX);
  const rackLed = inst(new THREE.BoxGeometry(0.12, 0.05, 0.03), basic('neon'), RACK_MAX * 4, false);
  // Burner
  const burner = instV(burnerGeo, BURNER_MAX);
  const burnerCoreMat = basic('fire');
  const burnerCore = inst(new THREE.BoxGeometry(0.5, 0.5, 0.5), burnerCoreMat, BURNER_MAX, false);
  // Silos: Modell plus drehende Lüfterblätter
  const silo = instV(siloGeo, SILO_MAX);
  const fanBlade = inst(new THREE.BoxGeometry(0.75, 0.04, 0.16), lambert('steel'), SILO_MAX * 2, false);
  // Grauer Markt
  const graySilo = instV(grayGeo, GRAY_MAX);
  const tarp = instV(tarpGeo, GRAY_MAX);
  const fence = instV(fenceGeo, GRAY_MAX, false);
  // Drohnen (unverändert: frei fliegend, kein Grundstück)
  const droneBody = instV(droneGeo, DRONE_MAX, false);
  const droneRotor = instV(rotorGeo, DRONE_MAX * 4, false);

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
        dummy.position.set(x, 0, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        rack.setMatrixAt(idx, dummy.matrix);

        for (let l = 0; l < 4; l += 1) {
          // Status-LED neben dem Griff des Blade-Einschubs
          dummy.position.set(x + 0.15, 0.4 + l * 0.35, z + 0.29);
          dummy.updateMatrix();
          rackLed.setMatrixAt(idx * 4 + l, dummy.matrix);
        }
      }
    }
    rack.count = n;
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
        dummy.position.set(x, 0, z);
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
        dummy.position.set(x, 0, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        silo.setMatrixAt(idx, dummy.matrix);
      }
    }
    silo.count = n;
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
        dummy.position.set(x, 0, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        graySilo.setMatrixAt(idx, dummy.matrix);
        dummy.position.set(x, 1.85, z);
        dummy.rotation.set(0.12, hash01(idx) * 0.5, -0.1);
        dummy.updateMatrix();
        tarp.setMatrixAt(idx, dummy.matrix);
        dummy.rotation.set(0, 0, 0);
        dummy.position.set(x + 0.6, 0, z);
        dummy.updateMatrix();
        fence.setMatrixAt(idx, dummy.matrix);
      }
    }
    graySilo.count = n;
    tarp.count = n;
    fence.count = n;
  }

  function layout(zone, counts) {
    const lotsFor = (id) => (zone.lots || []).filter((l) => l.id === id);
    layoutRacks(lotsFor('gpu_rack'), counts.rack);
    layoutBurners(lotsFor('token_burner'), counts.burner);
    layoutSilos(lotsFor('datacenter'), counts.silo);
    layoutGray(lotsFor('gray_market_dc'), counts.gray);
    droneBody.count = counts.drone;
    droneRotor.count = counts.drone * 4;

    [rack, rackLed, burner, silo, graySilo, tarp, fence].forEach((m) => {
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
        const ringHex = tierMix(p.token, p.gold, siloTier, 0.7);
        kit.recolor(siloGeo, (k) => (k === 'token' ? ringHex : undefined));
        const tarpHex = tierMix(p.tarp, p.gold, grayTier);
        kit.recolor(tarpGeo, (k) => (k === 'tarp' ? tarpHex : undefined));
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
        droneRotor.instanceMatrix.needsUpdate = true;
      }

      line.update(zone.tier, dt, t, reduced);
    },
    applyPalette(p) {
      Object.entries(mats).forEach(([key, list]) => list.forEach((m) => m.color.setHex(p[key])));
      kit.applyPalette(p);
      line.applyPalette(p);
      placedKey = null;
      lastTiers = '';
    },
  };
}
