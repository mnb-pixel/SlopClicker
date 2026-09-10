import * as THREE from 'three';

// Kapital-Turm (Zone "tower"): Glasturm, der mit jeder VC-Firma ein Stockwerk wächst,
// Gold-Bänder zwischen den Etagen, Pivot-Startups als Container am Fuß, deren Logo
// alle paar Sekunden die Farbe wechselt (der Pivot), auf dem Dach die AGI-Countdown-
// Uhr, deren Zahl immer wieder zurückspringt, und die LED-Laufschrift mit dem
// Newsticker.
//
// Die beiden Tafeln sind die einzigen Stellen der Szene mit Texturen: Text braucht
// eine Canvas-Textur, alles andere bleibt texturlos.

const FLOOR_MAX = 6;
const CONTAINER_MAX = 8;
const FLOOR_H = 1.1;
const TOWER = { x: -0.9, z: -0.9, w: 2.6 };

const CONTAINER_SLOTS = [
  { x: -3.0, z: 2.3, yaw: 0 },
  { x: -1.6, z: 2.3, yaw: 0 },
  { x: -0.2, z: 2.3, yaw: 0 },
  { x: 1.2, z: 2.3, yaw: 0 },
  { x: 2.6, z: -2.4, yaw: Math.PI / 2 },
  { x: 2.6, z: -1.1, yaw: Math.PI / 2 },
  { x: 2.6, z: 0.2, yaw: Math.PI / 2 },
  { x: 2.6, z: 1.5, yaw: Math.PI / 2 },
];

function hash01(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Canvas-Tafel: liefert Textur und eine draw()-Funktion.
function makeBoard(width, height) {
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

  // --- Turm --------------------------------------------------------------------------
  const base = new THREE.Mesh(new THREE.BoxGeometry(TOWER.w + 0.6, 0.4, TOWER.w + 0.6), lambert('stone'));
  base.position.set(TOWER.x, 0.2, TOWER.z);
  base.receiveShadow = true;
  group.add(base);
  const lobby = new THREE.Mesh(new THREE.BoxGeometry(TOWER.w, FLOOR_H, TOWER.w), lambert('facade'));
  lobby.position.set(TOWER.x, 0.4 + FLOOR_H / 2, TOWER.z);
  lobby.castShadow = true;
  group.add(lobby);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.08), lambert('monitor'));
  door.position.set(TOWER.x, 0.8, TOWER.z + TOWER.w / 2 + 0.02);
  group.add(door);

  // Leichtes Eigenleuchten, sonst färbt das grüne Bodenlicht das Glas oliv.
  const floor = inst(
    new THREE.BoxGeometry(TOWER.w, FLOOR_H, TOWER.w),
    lambert('glass', { transparent: true, opacity: 0.85, emissive: new THREE.Color(0x2b6cb0), emissiveIntensity: 0.35 }),
    FLOOR_MAX
  );
  const band = inst(new THREE.BoxGeometry(TOWER.w + 0.15, 0.12, TOWER.w + 0.15), lambert('gold'), FLOOR_MAX + 1, false);

  // Dach: Uhr und Laufschrift, Höhe folgt der Stockwerkzahl.
  const roof = new THREE.Group();
  group.add(roof);
  const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(TOWER.w + 0.2, 0.2, TOWER.w + 0.2), lambert('steelDark'));
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
  const container = inst(new THREE.BoxGeometry(1.2, 0.8, 0.7), lambert('facade'), CONTAINER_MAX);
  const logo = inst(new THREE.BoxGeometry(0.5, 0.3, 0.05), new THREE.MeshBasicMaterial({ color: 0xffffff }), CONTAINER_MAX, false);
  const LOGO_KEYS = ['containerA', 'containerB', 'containerC', 'token'];

  let placed = null;
  let lastTickerText = '';
  let tickerWidth = 1;
  let lastClockSec = -1;
  let clockBase = 0;

  function drawTicker(text, offset, p) {
    const { ctx, canvas } = tickerBoard;
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
    const { ctx, canvas } = clockBoard;
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

  function layout(counts) {
    for (let i = 0; i < counts.floors; i += 1) {
      dummy.position.set(TOWER.x, 0.4 + FLOOR_H * 1.5 + i * FLOOR_H, TOWER.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      floor.setMatrixAt(i, dummy.matrix);
    }
    floor.count = counts.floors;
    for (let i = 0; i <= counts.floors; i += 1) {
      dummy.position.set(TOWER.x, 0.4 + FLOOR_H + i * FLOOR_H, TOWER.z);
      dummy.updateMatrix();
      band.setMatrixAt(i, dummy.matrix);
    }
    band.count = counts.floors + 1;
    roof.position.set(TOWER.x, 0.4 + FLOOR_H * (counts.floors + 1) + 0.1, TOWER.z);
    clockFrame.visible = counts.clock > 0;
    clockMesh.visible = counts.clock > 0;

    for (let i = 0; i < counts.containers; i += 1) {
      const s = CONTAINER_SLOTS[i];
      dummy.position.set(s.x, 0.4, s.z);
      dummy.rotation.set(0, s.yaw, 0);
      dummy.updateMatrix();
      container.setMatrixAt(i, dummy.matrix);
      dummy.position.set(s.x + Math.sin(s.yaw) * 0.38, 0.55, s.z + Math.cos(s.yaw) * 0.38);
      dummy.updateMatrix();
      logo.setMatrixAt(i, dummy.matrix);
    }
    container.count = counts.containers;
    logo.count = counts.containers;
    [floor, band, container, logo].forEach((m) => {
      m.instanceMatrix.needsUpdate = true;
    });
  }

  return {
    group,
    update(zone, ctx, p) {
      const { t, reduced, tickerText } = ctx;
      const c = (id) => {
        const b = zone.buildings.find((x) => x.id === id);
        return b ? b.props : 0;
      };
      const counts = {
        floors: Math.min(FLOOR_MAX, c('vc_firm')),
        containers: Math.min(CONTAINER_MAX, c('pivot_startup')),
        clock: Math.min(1, c('agi_clock')),
      };
      const key = `${counts.floors}|${counts.containers}|${counts.clock}`;
      if (key !== placed) {
        layout(counts);
        placed = key;
      }

      // Pivot: Logo-Farbe wechselt alle paar Sekunden pro Container.
      for (let i = 0; i < counts.containers; i += 1) {
        const step = Math.floor(t / (4 + hash01(i) * 4) + i);
        color.setHex(p[LOGO_KEYS[step % LOGO_KEYS.length]]);
        logo.setColorAt(i, color);
      }
      if (counts.containers > 0 && logo.instanceColor) logo.instanceColor.needsUpdate = true;

      drawTicker(tickerText || '', reduced ? 0 : t * 140, p);
      if (counts.clock > 0) drawClock(t, p);
    },
    applyPalette(p) {
      Object.entries(mats).forEach(([key, list]) => list.forEach((m) => m.color.setHex(p[key])));
      lastClockSec = -1;
      placed = null;
    },
  };
}
