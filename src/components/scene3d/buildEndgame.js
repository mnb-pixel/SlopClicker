import * as THREE from 'three';
import { tierMix } from './tierVisuals';
import { createVoxelKit } from './voxelModel';

// Singularitäts-Horizont (Zone "endgame") an der hinteren Inselkante: Kühltürme des
// Atomreaktors mit Dampf und die Hologramm-Geisterstadt aus flimmernden Glasquadern -
// beide auf eigenen, wachsenden Grundstücken (siehe utils/campusLayout.js): ein
// Reaktor-Grundstück trägt ein Turm-Zwillingspaar, ein Stadt-Grundstück einen eigenen
// Mini-Projektor mit zwei Hologrammen. Schwebende Excel-Tabellen mit Augen bleiben
// frei über der ganzen (gewachsenen) Zone, wie zuvor. Die Singularität - eine schwarze
// Kugel mit Akkretionsringen hoch über dem Ofen - bleibt der einmalige Endgegner ohne
// Grundstück.
//
// Kühltürme (Hyperboloid mit Betonfugen und Kranz), Projektoren, Hologramm-Gebäude
// (mit Fensterraster, halbtransparent) und Excel-Tabellen (Gitter und Augen eingebaut)
// sind Voxel-Modelle (voxelModel.js); die Singularität bleibt rund - ein Schwarzes
// Loch aus Würfeln wäre das Falsche.

const REACTOR_LOTS_MAX = 16;
const REACTOR_PER_LOT = 2;
const REACTOR_MAX = REACTOR_LOTS_MAX * REACTOR_PER_LOT;
const CITY_LOTS_MAX = 20;
const CITY_PER_LOT = 3;
const CITY_MAX = CITY_LOTS_MAX * CITY_PER_LOT;
const SHEET_MAX = 48;
const STEAM_PER_TOWER = 5;

function hash01(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Zwei Kühltürme je Grundstück, verkleinert (Original-Radius 0.85/1.35/1.55 -> etwa
// 65%), damit ein Paar zusammen in LOT_SIZE 3.6 passt.
const REACTOR_OFFSETS = [{ x: -0.85, z: 0 }, { x: 0.85, z: 0 }];
// Drei Hologramm-Gebäude je Stadt-Grundstück, um dessen eigenen kleinen Projektor.
const CITY_OFFSETS = [
  { x: -0.6, z: 0.2, h: 2.2 },
  { x: 0.6, z: -0.3, h: 1.6 },
  { x: 0.0, z: 0.5, h: 1.9 },
];
const SHEET_SLOTS = [];
// Hoch genug, um über den Silos des Serverkellers sichtbar zu bleiben.
for (let i = 0; i < SHEET_MAX; i += 1) SHEET_SLOTS.push({ x: -2.2 - (i % 6) * 1.0, z: 0.6 - Math.floor(i / 6) * 1.1, y: 5.0 + (i % 3) * 0.8 });

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

  const kit = createVoxelKit(palette);

  // --- Kühltürme (verkleinert, zwei je Grundstück) ----------------------------------
  // Hyperboloid: Radius 8,8 unten, 5,5 oben (0,1er-Raster), Betonfugen alle 6 Lagen,
  // Kranz mit Öffnung, Sockelplatte.
  const towerGeo = kit.geo((m) => {
    m.cylinder(0, 0, 0, 2, 10, 'stoneDark');
    for (let y = 0; y < 24; y += 1) {
      const t = y / 23;
      const r = 5.5 + 3.3 * Math.pow(1 - t, 1.5);
      m.cylinder(0, 0, y + 2, 1, r, 'facade', { noise: 0.03, seed: y });
      if (y % 6 === 5) m.cylinder(0, 0, y + 2, 1, r + 0.01, 'stone');
    }
    m.cylinder(0, 0, 26, 3, 6.4, 'stone', { hollow: 1.6 });
    m.set(0, 26, 6, 'warnRed');
  }, { unit: 0.1, faceShade: 0.05, unlit: new Set(['warnRed']) });
  const towerBody = inst(towerGeo, kit.mats, REACTOR_MAX);
  const steamMat = lambert('cloud', { transparent: true, opacity: 0.85 });
  const steam = inst(new THREE.IcosahedronGeometry(0.3, 0), steamMat, REACTOR_MAX * STEAM_PER_TOWER, false);
  const steamPhase = Float32Array.from({ length: REACTOR_MAX * STEAM_PER_TOWER }, (_, i) => hash01(i + 500));
  const steamSeed = Float32Array.from({ length: REACTOR_MAX * STEAM_PER_TOWER }, (_, i) => hash01(i + 700) * Math.PI * 2);

  // --- Hologramm-Städte (ein kleiner Projektor je Grundstück) -----------------------
  const projectorGeo = kit.geo((m) => {
    m.cylinder(0, 0, 0, 2, 14, 'steelDark');
    m.cylinder(0, 0, 2, 1, 13.4, 'token', { hollow: 1.2 });
    m.cylinder(0, 0, 2, 1, 3, 'token');
    for (let a = 0; a < 8; a += 1) {
      const x = Math.round(Math.cos((a / 8) * Math.PI * 2) * 9);
      const z = Math.round(Math.sin((a / 8) * Math.PI * 2) * 9);
      m.set(x, 2, z, 'steel');
    }
  }, { unit: 0.1, unlit: new Set(['token']) });
  const projector = inst(projectorGeo, kit.mats, CITY_LOTS_MAX);
  // Hologramme: Voxel-Hochhäuser mit Fensterraster, ein Modell je Bauplatz (Höhe
  // aus CITY_OFFSETS), halbtransparent und flimmernd über ein eigenes Material.
  const holoMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.58, depthWrite: false });
  const holoGeos = CITY_OFFSETS.map((o, s) =>
    kit.geo((m) => {
      const h = Math.round(o.h * 10);
      const w = 5 + (s % 2);
      m.box(-w + 1, 0, -w + 1, w * 2 - 1, h, w * 2 - 1, 'token', { noise: 0 });
      for (let y = 1; y < h - 1; y += 1) {
        for (let i = -w + 1; i < w; i += 1) {
          const lit = (i * 3 + y * 5 + s) % 4 === 0;
          const shade = lit ? 1.6 : y % 3 === 0 ? 0.55 : 0.85;
          m.set(i, y, w - 1, 'token', shade);
          m.set(i, y, -w + 1, 'token', shade);
          m.set(w - 1, y, i, 'token', shade);
          m.set(-w + 1, y, i, 'token', shade);
        }
      }
      m.box(-w + 2, h, -w + 2, w * 2 - 3, 1, w * 2 - 3, 'token', { noise: 0 });
      m.box(-1, h + 1, -1, 2, 3, 2, 'token', { noise: 0 });
    }, { unit: 0.1, unlit: () => true })
  );
  const holos = holoGeos.map((g) => inst(g, [kit.lambert, holoMat], CITY_LOTS_MAX, false));

  // --- Excel-Tabellen: frei über der ganzen Zone, kein Grundstück -------------------
  // Blatt mit eingebautem Gitter, Kopfzeile und Augenweiß; nur die Pupillen bewegen sich.
  const sheetGeo = kit.geo((m) => {
    m.box(-12, -9, 0, 24, 18, 1, 'paper');
    for (let y = -9; y < 9; y += 4) for (let x = -12; x < 12; x += 1) m.set(x, y, 0, 'deskLeg', 0.9);
    for (let x = -12; x < 12; x += 5) for (let y = -9; y < 9; y += 1) m.set(x, y, 0, 'deskLeg', 0.9);
    m.box(-12, 7, 0, 24, 2, 1, 'screen');
    [[-5, 3], [4, 3]].forEach(([x, y]) => {
      m.box(x - 1, y - 1, 1, 4, 4, 1, 'paper');
      m.set(x - 1, y - 1, 1, 'deskLeg', 0.9);
      m.set(x + 2, y - 1, 1, 'deskLeg', 0.9);
      m.set(x - 1, y + 2, 1, 'deskLeg', 0.9);
      m.set(x + 2, y + 2, 1, 'deskLeg', 0.9);
    });
  }, { unit: 0.05, origin: [0, 0, 0.5], unlit: new Set(['screen']) });
  const sheet = inst(sheetGeo, kit.mats, SHEET_MAX, false);
  const pupil = inst(new THREE.BoxGeometry(0.1, 0.1, 0.05), basic('camera'), SHEET_MAX * 2, false);

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

  let placedKey = null;
  let lastTiers = '';
  let reactorLots = []; // Weltnahe (zonenlokale) x/z je Turm, ein Eintrag je Turm (nicht je Grundstück)
  let cityLots = []; // { x, z } je Grundstück (Projektor-Mitte)

  function layoutReactors(lots, n) {
    reactorLots = [];
    let idx = 0;
    for (let li = 0; li < lots.length && idx < n; li += 1) {
      const lot = lots[li];
      for (let s = 0; s < REACTOR_OFFSETS.length && idx < n; s += 1, idx += 1) {
        const o = REACTOR_OFFSETS[s];
        const x = lot.lx + o.x;
        const z = lot.lz + o.z;
        reactorLots.push({ x, z });
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1);
        dummy.position.set(x, 0, z);
        dummy.updateMatrix();
        towerBody.setMatrixAt(idx, dummy.matrix);
      }
    }
    towerBody.count = n;
    steam.count = n * STEAM_PER_TOWER;
    towerBody.instanceMatrix.needsUpdate = true;
  }

  function layoutCities(lots, n) {
    cityLots = [];
    const lotCount = Math.min(lots.length, CITY_LOTS_MAX);
    for (let li = 0; li < lotCount; li += 1) {
      const lot = lots[li];
      cityLots.push({ x: lot.lx, z: lot.lz });
      dummy.position.set(lot.lx, 0, lot.lz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      projector.setMatrixAt(li, dummy.matrix);
    }
    projector.count = lotCount;

    const counts = CITY_OFFSETS.map(() => 0);
    let idx = 0;
    for (let li = 0; li < lotCount && idx < n; li += 1) {
      const lot = lots[li];
      for (let s = 0; s < CITY_OFFSETS.length && idx < n; s += 1, idx += 1) {
        const o = CITY_OFFSETS[s];
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1);
        dummy.position.set(lot.lx + o.x, 0.3, lot.lz + o.z);
        dummy.updateMatrix();
        holos[s].setMatrixAt(counts[s], dummy.matrix);
        counts[s] += 1;
      }
    }
    holos.forEach((m, s) => {
      m.count = counts[s];
      m.instanceMatrix.needsUpdate = true;
    });
    projector.instanceMatrix.needsUpdate = true;
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
        reactor: Math.min(REACTOR_MAX, c('nuclear_reactor')),
        city: Math.min(CITY_MAX, c('metaverse_city')),
        sheet: Math.min(SHEET_MAX, c('excel_sheet')),
        singularity: Math.min(1, c('singularity')),
      };
      const reactorTier = tierOf('nuclear_reactor');
      const cityTier = tierOf('metaverse_city');
      const tierKey = `${reactorTier}|${cityTier}`;
      if (tierKey !== lastTiers) {
        lastTiers = tierKey;
        // Reaktor mit mehr Upgrades dampft heißer/heller statt schlicht weiß; Hologramme
        // wirken "premium" (Gold statt reinem Türkis) mit mehr Metaverse-Upgrades.
        steamMat.color.setHex(tierMix(p.cloud, p.gold, reactorTier, 0.5));
        const holoHex = tierMix(p.token, p.gold, cityTier, 0.6);
        holoGeos.forEach((g) => kit.recolor(g, (k) => (k === 'token' ? holoHex : undefined)));
      }
      const lots = zone.lots || [];
      const key = `${counts.reactor}|${counts.city}|${counts.sheet}|${counts.singularity}|${lots.length}`;
      if (key !== placedKey) {
        layoutReactors(lots.filter((l) => l.id === 'nuclear_reactor'), counts.reactor);
        layoutCities(lots.filter((l) => l.id === 'metaverse_city'), counts.city);
        singGroup.visible = counts.singularity > 0;
        placedKey = key;
      }

      // Dampf aus den Kühltürmen
      for (let i = 0; i < counts.reactor * STEAM_PER_TOWER; i += 1) {
        const s = reactorLots[Math.floor(i / STEAM_PER_TOWER)];
        steamPhase[i] = (steamPhase[i] + dt * (reduced ? 0 : 0.18)) % 1;
        const ph = steamPhase[i];
        dummy.position.set(s.x + Math.sin(steamSeed[i] + ph * 4) * (0.2 + ph * 0.7), 2.9 + ph * 2.6, s.z + Math.cos(steamSeed[i] + ph * 3) * (0.2 + ph * 0.7));
        dummy.scale.setScalar(0.5 + ph * 1.6);
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

      // Hologramme flimmern, jede Stadt für sich leicht phasenversetzt.
      if (counts.city > 0 && !reduced) {
        const flick = hash01(Math.floor(t * 12)) > 0.9 ? 0.2 : 0.58 + Math.sin(t * 2) * 0.08;
        holoMat.opacity = flick;
      }

      // Tabellen schweben und drehen sich, Augen schauen nach vorn.
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
        for (let e = 0; e < 2; e += 1) {
          tmp.position.set(-0.22 + e * 0.44 + (reduced ? 0 : Math.sin(t * 0.7 + i) * 0.04), 0.15, 0.1);
          tmp.rotation.set(0, 0, 0);
          tmp.scale.set(1, 1, 1);
          tmp.updateMatrix();
          pupil.setMatrixAt(i * 2 + e, tmp.matrix.premultiply(base));
        }
      }
      if (counts.sheet > 0) {
        [sheet, pupil].forEach((m) => {
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
      kit.applyPalette(p);
      placedKey = null;
      lastTiers = '';
    },
  };
}
