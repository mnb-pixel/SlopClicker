import * as THREE from 'three';
import { tierMix } from './tierVisuals';
import { createVoxelKit } from './voxelModel';

// Kapital-Turm (Zone "tower"): jede VC-Firma ein Stockwerk, Gold-Bänder zwischen den
// Etagen. Ist ein Turm mit FLOOR_MAX Stockwerken voll, entsteht NICHT ein noch höherer
// Turm, sondern der nächste GLASTURM auf dem Grundstück nebenan (siehe
// utils/campusLayout.js) - so trägt auch diese Zone zum Inselwachstum bei, statt nur
// in den Himmel zu wachsen. Pivot-Startups stehen als Container-Reihen auf eigenen
// Grundstücken einer zweiten Reihe. Die AGI-Countdown-Uhr und die Newsticker-Tafel
// gibt es nur EINMAL, auf dem ersten (ältesten) Turm - zwei tickende Uhren nebeneinander
// wären nur verwirrend.
//
// Die beiden Tafeln sind die einzigen Stellen der Szene mit Texturen: Text braucht
// eine Canvas-Textur, alles andere bleibt texturlos.
//
// Sockel, Lobby, Etagen, Dach und Container sind Voxel-Modelle (voxelModel.js, Raster
// 0,1 bzw. 0,05 für die Container): jede Etage ein Glasraster mit Sprossen, Ecksäulen,
// Brüstungsband und Gold-Gesims, zwei Varianten mit unterschiedlich beleuchteten
// Scheiben im Wechsel; die Lobby mit Glastür und Vordach, das Dach mit Helipad und
// Technikaufbauten, die Container mit Wellblech, Eckpfosten und Türriegeln.

const FLOOR_PER_TOWER = 6;
const TOWER_LOTS_MAX = 20;
const FLOOR_MAX = FLOOR_PER_TOWER * TOWER_LOTS_MAX;
const CONTAINER_MAX = 60;
const CONTAINERS_PER_LOT = 3;
const FLOOR_H = 1.1;
const TOWER_W = 2.6;
const U = 0.1; // Voxelraster des Turms
const CU = 0.05; // Voxelraster der Container

const CONTAINER_SLOTS = [
  { x: -1.0, z: -0.6, yaw: 0 },
  { x: 1.0, z: -0.6, yaw: 0 },
  { x: 0, z: 0.7, yaw: Math.PI / 2 },
];

function hash01(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Canvas-Tafel: liefert Textur und eine draw()-Funktion.
function makeBoard(width, height) {
  if (typeof document === 'undefined') {
    return { canvas: null, ctx: null, texture: new THREE.Texture() };
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  return { canvas, ctx, texture };
}

export function buildTower(palette, zoneDef) {
  const group = new THREE.Group();
  const { anchor3d } = zoneDef;
  group.position.set(anchor3d.x, 0.3, anchor3d.z);

  const mats = {};
  const lambert = (key, extra = {}) => {
    const m = new THREE.MeshLambertMaterial({ color: palette[key], flatShading: true, ...extra });
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
  const GLASS_UNLIT = new Set(['glass']);

  // --- Voxel-Modelle -----------------------------------------------------------------
  // Turmraster: 26 Voxel = TOWER_W, 11 Voxel = FLOOR_H. Ursprung unten Mitte.
  const W = Math.round(TOWER_W / U); // 26
  const HALF = W / 2; // 13
  const FH = Math.round(FLOOR_H / U); // 11

  // Sockel: Platte mit dunkler Kante, Vortreppe zur Kamera (+z) und (+x).
  const baseGeo = kit.geo((m) => {
    m.box(-HALF - 3, 0, -HALF - 3, W + 6, 4, W + 6, 'stone', { noise: 0.04, seed: 11 });
    for (let i = 0; i < W + 6; i += 1) {
      m.set(-HALF - 3 + i, 3, HALF + 2, 'stoneDark');
      m.set(HALF + 2, 3, -HALF - 3 + i, 'stoneDark');
    }
    m.box(-4, 0, HALF + 3, 8, 2, 2, 'stone');
    m.box(-4, 0, HALF + 5, 8, 1, 1, 'stone');
  }, { unit: U });

  // Glasfassade eines Stockwerks: Sprossenraster, Ecksäulen, Brüstung unten, Gesims
  // oben. `lit` streut helle Scheiben (Büro mit Licht) - zwei Muster im Wechsel.
  function facadeRing(m, y0, h, variant) {
    for (let i = 0; i < W; i += 1) {
      for (let y = 0; y < h; y += 1) {
        const isMullion = i % 4 === 0 || i === W - 1;
        const lit = ((i >> 2) * 3 + y + variant * 5) % 7 < 2;
        const shade = lit ? 1.22 : 0.92;
        [[-HALF + i, HALF - 1], [-HALF + i, -HALF], [HALF - 1, -HALF + i], [-HALF, -HALF + i]].forEach(([x, z]) => {
          if (isMullion) m.set(x, y0 + y, z, 'steel', 0.85);
          else m.set(x, y0 + y, z, 'glass', shade);
        });
      }
    }
    // Ecksäulen
    [[-HALF, -HALF], [HALF - 1, -HALF], [-HALF, HALF - 1], [HALF - 1, HALF - 1]].forEach(([x, z]) => m.box(x, y0, z, 1, h, 1, 'steelDark'));
  }
  const floorGeo = [0, 1].map((variant) =>
    kit.geo((m) => {
      m.box(-HALF, 0, -HALF, W, FH, W, 'facade', { noise: 0.03, seed: 5 + variant });
      // Brüstung (unten 2 Voxel), Glas darüber, Gesims oben
      m.box(-HALF, 0, -HALF, W, 2, W, 'facade', { noise: 0.03, seed: 7 });
      facadeRing(m, 2, FH - 3, variant);
      // Gesims: Goldring außen, innen bleibt die Deckenplatte hell (sonst wirkte jede
      // Etage von oben wie ein goldener Klotz)
      m.box(-HALF - 1, FH - 1, -HALF - 1, W + 2, 1, W + 2, 'gold');
      m.box(-HALF + 1, FH - 1, -HALF + 1, W - 2, 1, W - 2, 'facade', { noise: 0.03, seed: 8 });
    }, { unit: U, unlit: GLASS_UNLIT, faceShade: 0.1 })
  );

  // Lobby: höhere Glasfront mit Tür und Vordach zur Kamera (+z), Gesims oben.
  const lobbyGeo = kit.geo((m) => {
    m.box(-HALF, 0, -HALF, W, FH, W, 'facade', { noise: 0.03, seed: 9 });
    facadeRing(m, 1, FH - 2, 1);
    // Tür: zwei dunkle Flügel mit Griff, Rahmen aus Stahl
    m.box(-3, 0, HALF - 1, 6, 7, 1, 'steelDark');
    m.box(-2, 0, HALF - 1, 4, 6, 1, 'glass', { noise: 0 });
    m.set(-1, 3, HALF, 'gold');
    m.set(0, 3, HALF, 'gold');
    // Vordach
    m.box(-5, 7, HALF, 10, 1, 3, 'steelDark');
    m.set(-5, 5, HALF + 2, 'steel');
    m.set(4, 5, HALF + 2, 'steel');
    m.set(-5, 6, HALF + 2, 'steel');
    m.set(4, 6, HALF + 2, 'steel');
    m.box(-HALF - 1, FH - 1, -HALF - 1, W + 2, 1, W + 2, 'gold');
    m.box(-HALF + 1, FH - 1, -HALF + 1, W - 2, 1, W - 2, 'facade', { noise: 0.03, seed: 8 });
  }, { unit: U, unlit: GLASS_UNLIT, faceShade: 0.1 });

  // Dachplatte mit Brüstung, Helipad-Kreis und Technik (Klimakasten, Lüfter, Leiter).
  const roofGeo = kit.geo((m) => {
    m.box(-HALF - 1, 0, -HALF - 1, W + 2, 2, W + 2, 'steelDark');
    for (let i = 0; i < W + 2; i += 1) {
      [[-HALF - 1 + i, -HALF - 1], [-HALF - 1 + i, HALF], [-HALF - 1, -HALF - 1 + i], [HALF, -HALF - 1 + i]].forEach(([x, z]) => m.set(x, 2, z, 'steel'));
    }
    // Helipad: Ring + H
    m.cylinder(4, 4, 2, 1, 5.5, 'paper', { hollow: 1 });
    m.box(2, 2, 2, 1, 1, 5, 'paper');
    m.box(5, 2, 2, 1, 1, 5, 'paper');
    m.box(3, 2, 4, 2, 1, 1, 'paper');
    // Technik hinten links
    m.box(-10, 2, -10, 5, 3, 4, 'steel');
    m.box(-9, 5, -9, 3, 1, 2, 'steelDark');
    m.cylinder(-5, -9, 2, 4, 1.5, 'steelDark');
    m.box(-11, 2, 2, 2, 1, 6, 'steel');
  }, { unit: U, faceShade: 0.05 });

  // --- Türme: Sockel + Lobby je Grundstück, Stockwerke instanziert --------------------
  const base = inst(baseGeo, kit.mats, TOWER_LOTS_MAX);
  const lobby = inst(lobbyGeo, kit.mats, TOWER_LOTS_MAX);
  const floor = floorGeo.map((g) => inst(g, kit.mats, FLOOR_MAX));

  // Dach: nur auf dem ERSTEN Turm. Uhr und Laufschrift, Höhe folgt dessen Stockwerkzahl.
  const roof = new THREE.Group();
  group.add(roof);
  const roofSlab = new THREE.Mesh(roofGeo, kit.mats);
  roofSlab.castShadow = true;
  roof.add(roofSlab);

  const tickerBoard = makeBoard(1024, 128);
  const tickerMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 0.45),
    new THREE.MeshBasicMaterial({ map: tickerBoard.texture })
  );
  const tickerFrame = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.6, 0.12), lambert('ledBoard'));
  // Beide Tafeln zeigen diagonal zur Kamera (+x,+z).
  const boardYaw = Math.PI / 4;
  tickerFrame.rotation.y = boardYaw;
  tickerFrame.position.set(0, 0.75, 0);
  tickerMesh.rotation.y = boardYaw;
  tickerMesh.position.set(Math.sin(boardYaw) * 0.07, 0.75, Math.cos(boardYaw) * 0.07);
  roof.add(tickerFrame);
  roof.add(tickerMesh);

  const clockBoard = makeBoard(512, 128);
  const clockMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.55), new THREE.MeshBasicMaterial({ map: clockBoard.texture }));
  const clockFrame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 0.12), lambert('ledBoard'));
  clockFrame.rotation.y = boardYaw;
  clockFrame.position.set(0, 1.55, 0);
  clockMesh.rotation.y = boardYaw;
  clockMesh.position.set(Math.sin(boardYaw) * 0.07, 1.55, Math.cos(boardYaw) * 0.07);
  roof.add(clockFrame);
  roof.add(clockMesh);
  // Tafelstützen: zwei Stahlpfosten je Tafel, statt schwebender Rahmen.
  [-1.5, 1.5].forEach((dx) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.9, 0.08), lambert('steelDark'));
    post.position.set(Math.cos(boardYaw) * dx, 0.95, -Math.sin(boardYaw) * dx);
    roof.add(post);
  });
  const antennaGeo = kit.geo((m) => {
    m.box(-1, 0, -1, 2, 3, 2, 'steelDark');
    m.box(0, 3, 0, 1, 11, 1, 'steelDark');
    m.box(-2, 8, 0, 5, 1, 1, 'steel');
    m.box(0, 11, -2, 1, 1, 5, 'steel');
    m.set(0, 14, 0, 'warnRed');
  }, { unit: U, unlit: new Set(['warnRed']) });
  const antenna = new THREE.Mesh(antennaGeo, kit.mats);
  antenna.position.set(-0.9, 0.2, -0.9);
  roof.add(antenna);

  // --- Container -----------------------------------------------------------------------
  // Wellblech (abwechselnd helle/dunkle Spalten), Eckpfosten, Türende mit zwei Riegeln,
  // Standfüße, Dachlüfter. Die Farbe steckt im Modell ('facade') und wandert je
  // Sichtstufe Richtung Gold (recolor).
  const containerGeo = kit.geo((m) => {
    const L = 21;
    const H = 14;
    const D = 12;
    m.box(-10, 1, -6, L, H - 1, D, 'facade');
    for (let x = -10; x < 11; x += 1) {
      const dark = x % 2 === 0;
      for (let y = 2; y < H - 1; y += 1) {
        m.set(x, y, -6, 'facade', dark ? 0.86 : 1.0);
        m.set(x, y, 5, 'facade', dark ? 0.86 : 1.0);
      }
    }
    [[-10, -6], [10, -6], [-10, 5], [10, 5]].forEach(([x, z]) => m.box(x, 0, z, 1, H, 1, 'steelDark'));
    // Türende (+x): Rahmen, zwei senkrechte Riegel
    m.box(10, 1, -5, 1, H - 1, 10, 'facade', { noise: 0 });
    m.box(11, 2, -3, 1, H - 4, 1, 'steelDark');
    m.box(11, 2, 2, 1, H - 4, 1, 'steelDark');
    m.set(11, 6, -2, 'steel');
    m.set(11, 6, 1, 'steel');
    // Standfüße und Dach
    [[-9, -5], [9, -5], [-9, 4], [9, 4]].forEach(([x, z]) => m.set(x, 0, z, 'steelDark'));
    m.box(-10, H, -6, L, 1, D, 'facade', { noise: 0.05, seed: 21 });
    m.box(-6, H + 1, -1, 3, 1, 2, 'steel');
  }, { unit: CU, faceShade: 0.06 });
  const container = inst(containerGeo, kit.mats, CONTAINER_MAX);
  const logo = inst(new THREE.BoxGeometry(0.44, 0.26, 0.05), new THREE.MeshBasicMaterial({ color: 0xffffff }), CONTAINER_MAX, false);
  const LOGO_KEYS = ['containerA', 'containerB', 'containerC', 'token'];

  let placedKey = null;
  let towerLots = [];
  let lastTiers = '';
  let lastTickerText = '';
  let tickerWidth = 1;
  let lastClockSec = -1;
  let clockBase = 0;

  function drawTicker(text, offset, p) {
    const { ctx, canvas } = tickerBoard;
    if (!ctx || !canvas) return;
    ctx.fillStyle = p.ledBgCss;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 72px ui-monospace, Menlo, monospace';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = p.ledTextCss;
    if (text !== lastTickerText) {
      lastTickerText = text;
      tickerWidth = ctx.measureText(text).width + 300;
    }
    const x = canvas.width - (offset % tickerWidth);
    ctx.fillText(text, x, canvas.height / 2);
    ctx.fillText(text, x - tickerWidth, canvas.height / 2);
    tickerBoard.texture.needsUpdate = true;
  }

  function drawClock(t, p) {
    const { ctx, canvas } = clockBoard;
    if (!ctx || !canvas) return;
    // Countdown, der alle ~25 Sekunden wieder nach oben springt.
    const cycle = 25;
    const phase = t % cycle;
    if (phase < 1 && Math.floor(t / cycle) !== clockBase) {
      clockBase = Math.floor(t / cycle);
    }
    const remaining = Math.max(0, 5400 - Math.floor(phase * 60) + (clockBase % 4) * 3600);
    const sec = remaining;
    if (sec === lastClockSec) return;
    lastClockSec = sec;
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const pad = (n) => String(n).padStart(2, '0');
    ctx.fillStyle = p.ledBgCss;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 40px ui-monospace, Menlo, monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillStyle = p.ledTextCss;
    ctx.fillText('AGI IN', canvas.width / 2, 34);
    ctx.font = 'bold 70px ui-monospace, Menlo, monospace';
    ctx.fillStyle = p.clockTextCss;
    ctx.fillText(`${pad(h)}:${pad(m)}:${pad(s)}`, canvas.width / 2, 88);
    ctx.textAlign = 'left';
    clockBoard.texture.needsUpdate = true;
  }

  // Verteilt `totalFloors` Stockwerke auf so viele Türme, wie nötig sind (je bis zu
  // FLOOR_PER_TOWER); ein Grundstück je Turm, ein Turmkörper (Sockel/Lobby/Tür) auch
  // dann, wenn er noch kein einziges Stockwerk trägt - sonst stünde ein nacktes
  // Grundstück ohne irgendein Gebäude da, sobald die Engine zum ersten Mal gekauft wird.
  function layoutTowers(lots, totalFloors) {
    towerLots = lots;
    const floorIdx = [0, 0];
    lots.forEach((lot, ti) => {
      dummy.position.set(lot.lx, 0, lot.lz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      base.setMatrixAt(ti, dummy.matrix);
      dummy.position.set(lot.lx, 0.4, lot.lz);
      dummy.updateMatrix();
      lobby.setMatrixAt(ti, dummy.matrix);

      const floorsHere = Math.max(0, Math.min(FLOOR_PER_TOWER, totalFloors - ti * FLOOR_PER_TOWER));
      for (let f = 0; f < floorsHere; f += 1) {
        // Zwei Fassadenvarianten im Wechsel, je Turm versetzt - kein Etagen-Stempel.
        const v = (f + ti) % 2;
        dummy.position.set(lot.lx, 0.4 + FLOOR_H + f * FLOOR_H, lot.lz);
        dummy.updateMatrix();
        floor[v].setMatrixAt(floorIdx[v], dummy.matrix);
        floorIdx[v] += 1;
      }
      if (ti === 0) {
        roof.position.set(lot.lx, 0.4 + FLOOR_H * (floorsHere + 1), lot.lz);
      }
    });
    base.count = lots.length;
    lobby.count = lots.length;
    floor[0].count = floorIdx[0];
    floor[1].count = floorIdx[1];
    [base, lobby, floor[0], floor[1]].forEach((m) => {
      m.instanceMatrix.needsUpdate = true;
    });
  }

  function layoutContainers(lots, n) {
    let idx = 0;
    for (let li = 0; li < lots.length && idx < n; li += 1) {
      const lot = lots[li];
      for (let s = 0; s < CONTAINERS_PER_LOT && idx < n; s += 1, idx += 1) {
        const slot = CONTAINER_SLOTS[s];
        const x = lot.lx + slot.x;
        const z = lot.lz + slot.z;
        dummy.position.set(x, 0, z);
        dummy.rotation.set(0, slot.yaw, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        container.setMatrixAt(idx, dummy.matrix);
        dummy.position.set(x + Math.sin(slot.yaw) * 0.33, 0.42, z + Math.cos(slot.yaw) * 0.33);
        dummy.updateMatrix();
        logo.setMatrixAt(idx, dummy.matrix);
      }
    }
    container.count = n;
    logo.count = n;
    container.instanceMatrix.needsUpdate = true;
    logo.instanceMatrix.needsUpdate = true;
  }

  return {
    group,
    update(zone, ctx, p) {
      const { t, reduced, tickerText } = ctx;
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
        floors: Math.min(FLOOR_MAX, c('vc_firm')),
        containers: Math.min(CONTAINER_MAX, c('pivot_startup')),
        clock: Math.min(1, c('agi_clock')),
      };
      const floorTier = tierOf('vc_firm');
      const containerTier = tierOf('pivot_startup');
      const tierKey = `${floorTier}|${containerTier}`;
      if (tierKey !== lastTiers) {
        lastTiers = tierKey;
        // Premium-Glas statt des kühlen Blaus, je mehr Etagen-Upgrades gekauft sind.
        const glassHex = tierMix(p.glass, p.gold, floorTier, 0.5);
        const glassOverride = (k) => (k === 'glass' ? glassHex : undefined);
        floorGeo.forEach((g) => kit.recolor(g, glassOverride));
        kit.recolor(lobbyGeo, glassOverride);
        const containerHex = tierMix(p.facade, p.gold, containerTier, 0.4);
        kit.recolor(containerGeo, (k) => (k === 'facade' ? containerHex : undefined));
      }
      const towerLotsData = (zone.lots || []).filter((l) => l.id === 'vc_firm');
      const key = `${counts.floors}|${counts.containers}|${counts.clock}|${towerLotsData.length}`;
      if (key !== placedKey) {
        layoutTowers(towerLotsData, counts.floors);
        layoutContainers((zone.lots || []).filter((l) => l.id === 'pivot_startup'), counts.containers);
        clockFrame.visible = counts.clock > 0;
        clockMesh.visible = counts.clock > 0;
        roof.visible = towerLotsData.length > 0;
        placedKey = key;
      }

      // Pivot: Logo-Farbe wechselt alle paar Sekunden pro Container.
      for (let i = 0; i < counts.containers; i += 1) {
        const step = Math.floor(t / (4 + hash01(i) * 4) + i);
        color.setHex(p[LOGO_KEYS[step % LOGO_KEYS.length]]);
        logo.setColorAt(i, color);
      }
      if (counts.containers > 0 && logo.instanceColor) logo.instanceColor.needsUpdate = true;

      if (towerLots.length > 0) {
        drawTicker(tickerText || '', reduced ? 0 : t * 140, p);
        if (counts.clock > 0) drawClock(t, p);
      }
    },
    applyPalette(p) {
      Object.entries(mats).forEach(([key, list]) => list.forEach((m) => m.color.setHex(p[key])));
      kit.applyPalette(p);
      lastClockSec = -1;
      placedKey = null;
      lastTiers = '';
    },
  };
}
