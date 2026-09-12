import * as THREE from 'three';
import { tierMix } from './tierVisuals';

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

const FLOOR_PER_TOWER = 6;
const TOWER_LOTS_MAX = 20;
const FLOOR_MAX = FLOOR_PER_TOWER * TOWER_LOTS_MAX;
const CONTAINER_MAX = 60;
const CONTAINERS_PER_LOT = 3;
const FLOOR_H = 1.1;
const TOWER_W = 2.6;

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
    group.add(m);
    return m;
  };
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  // --- Türme: Sockel + Lobby + Eingang je Grundstück, Stockwerke instanziert ------------
  const base = inst(new THREE.BoxGeometry(TOWER_W + 0.6, 0.4, TOWER_W + 0.6), lambert('stone'), TOWER_LOTS_MAX);
  const lobby = inst(new THREE.BoxGeometry(TOWER_W, FLOOR_H, TOWER_W), lambert('facade'), TOWER_LOTS_MAX);
  const door = inst(new THREE.BoxGeometry(0.6, 0.8, 0.08), lambert('monitor'), TOWER_LOTS_MAX, false);

  // Leichtes Eigenleuchten, sonst färbt das grüne Bodenlicht das Glas oliv.
  const floorMat = lambert('glass', { transparent: true, opacity: 0.85, emissive: new THREE.Color(0x2b6cb0), emissiveIntensity: 0.35 });
  const floor = inst(new THREE.BoxGeometry(TOWER_W, FLOOR_H, TOWER_W), floorMat, FLOOR_MAX);
  const band = inst(new THREE.BoxGeometry(TOWER_W + 0.15, 0.12, TOWER_W + 0.15), lambert('gold'), FLOOR_MAX + TOWER_LOTS_MAX, false);

  // Dach: nur auf dem ERSTEN Turm. Uhr und Laufschrift, Höhe folgt dessen Stockwerkzahl.
  const roof = new THREE.Group();
  group.add(roof);
  const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(TOWER_W + 0.2, 0.2, TOWER_W + 0.2), lambert('steelDark'));
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
  tickerFrame.position.set(0, 0.55, 0);
  tickerMesh.rotation.y = boardYaw;
  tickerMesh.position.set(Math.sin(boardYaw) * 0.07, 0.55, Math.cos(boardYaw) * 0.07);
  roof.add(tickerFrame);
  roof.add(tickerMesh);

  const clockBoard = makeBoard(512, 128);
  const clockMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.55), new THREE.MeshBasicMaterial({ map: clockBoard.texture }));
  const clockFrame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 0.12), lambert('ledBoard'));
  clockFrame.rotation.y = boardYaw;
  clockFrame.position.set(0, 1.35, 0);
  clockMesh.rotation.y = boardYaw;
  clockMesh.position.set(Math.sin(boardYaw) * 0.07, 1.35, Math.cos(boardYaw) * 0.07);
  roof.add(clockFrame);
  roof.add(clockMesh);
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 1.2, 4), lambert('steelDark'));
  antenna.position.set(-0.9, 0.7, -0.9);
  roof.add(antenna);

  // --- Container -----------------------------------------------------------------------
  const containerMat = lambert('facade');
  const container = inst(new THREE.BoxGeometry(1.05, 0.7, 0.62), containerMat, CONTAINER_MAX);
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
    let floorIdx = 0;
    let bandIdx = 0;
    lots.forEach((lot, ti) => {
      dummy.position.set(lot.lx, 0.2, lot.lz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      base.setMatrixAt(ti, dummy.matrix);
      dummy.position.set(lot.lx, 0.4 + FLOOR_H / 2, lot.lz);
      dummy.updateMatrix();
      lobby.setMatrixAt(ti, dummy.matrix);
      dummy.position.set(lot.lx, 0.8, lot.lz + TOWER_W / 2 + 0.02);
      dummy.updateMatrix();
      door.setMatrixAt(ti, dummy.matrix);

      const floorsHere = Math.max(0, Math.min(FLOOR_PER_TOWER, totalFloors - ti * FLOOR_PER_TOWER));
      for (let f = 0; f < floorsHere; f += 1, floorIdx += 1) {
        dummy.position.set(lot.lx, 0.4 + FLOOR_H * 1.5 + f * FLOOR_H, lot.lz);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        floor.setMatrixAt(floorIdx, dummy.matrix);
      }
      for (let f = 0; f <= floorsHere; f += 1, bandIdx += 1) {
        dummy.position.set(lot.lx, 0.4 + FLOOR_H + f * FLOOR_H, lot.lz);
        dummy.updateMatrix();
        band.setMatrixAt(bandIdx, dummy.matrix);
      }
      if (ti === 0) {
        roof.position.set(lot.lx, 0.4 + FLOOR_H * (floorsHere + 1) + 0.1, lot.lz);
      }
    });
    base.count = lots.length;
    lobby.count = lots.length;
    door.count = lots.length;
    floor.count = floorIdx;
    band.count = bandIdx;
    [base, lobby, door, floor, band].forEach((m) => {
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
        dummy.position.set(x, 0.35, z);
        dummy.rotation.set(0, slot.yaw, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        container.setMatrixAt(idx, dummy.matrix);
        dummy.position.set(x + Math.sin(slot.yaw) * 0.33, 0.5, z + Math.cos(slot.yaw) * 0.33);
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
        floorMat.emissive.setHex(tierMix(0x2b6cb0, p.gold, floorTier, 0.6));
        containerMat.color.setHex(tierMix(p.facade, p.gold, containerTier, 0.4));
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
      lastClockSec = -1;
      placedKey = null;
      lastTiers = '';
    },
  };
}
