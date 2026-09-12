import * as THREE from 'three';
import { HEAT_FIRE_COLORS, HEAT_LIGHT_INTENSITY } from './palette';

// Der Server-Schrank in der Inselmitte: das Klickziel und der Hitze-Anzeiger des
// Spiels (im Code weiterhin "furnace" - der Spielzustand heißt so, siehe
// utils/sceneState.js).
//
// Er ersetzt den früheren Ziegel-Schmelzofen mit Kamin. Der Ablauf ist bewusst anders
// herum als dort: der Schrank BRENNT NICHT von Anfang an. Er läuft kalt, wird warm,
// dampft, qualmt - und erst ganz oben auf der Skala schlagen Flammen heraus:
//
//   cold      LEDs türkis, Lüfter drehen gemächlich, kein Dampf
//   warm      LEDs gold, Lüfter schneller, erster Wasserdampf aus dem Dach
//   hot       LEDs orange, dichter Dampf, Glut zwischen den Blades, erste Funken
//   critical  LEDs rot, dunkler Qualm, Flammen aus Dachschlitz und Türspalt
//   meltdown  Schrank verrußt, volle Flammen, Absperrband, Warnlicht, Kühlnebel
//
// Der Abluftkamin oben ist der Auslass für die VPS-Rauchfahne (smokeTier): bei kaltem
// Schrank steigt sie weiß als Dampf auf, mit der Hitze wird sie grau und dann schwarz.
//
// Alle Massen sind ein paar Draw Calls: Blades, LEDs, Lamellen, Funken, Dampf, Rauch,
// Nebel und Band sind je EIN InstancedMesh. Zustandsänderungen (Hitzestufe, Stimmung)
// werden nur bei Wechsel angewendet, der Rest der update() ist reine Bewegung.

const SMOKE_MAX = 32;
const SMOKE_PER_TIER = 4;
const STEAM_MAX = 20;
const EMBER_MAX = 28;
const MIST_MAX = 18;
const TAPE_SEGMENTS = 30;

const PAD_TOP_Y = 0.9;
const CAB_W = 2.9;
const CAB_D = 2.3;
const CAB_TOP_Y = 5.3;
const SIDE_CAB_W = 1.5;
const SIDE_CAB_TOP_Y = 4.0;
const SIDE_CAB_X = 2.4;
const DUCT_TOP_Y = 7.9;
const DUCT_X = -0.55;
const DUCT_Z = -0.55;
const SMOKE_START_Y = 8.4;
const FRONT_Z = CAB_D / 2; // Vorderseite (Tür) zeigt zur Kamera, +z
const BLADE_ROWS = 9;

const WHITE = new THREE.Color(0xffffff);

// LED-Farbe je Hitzestufe. Türkis wie die Datenleitung, solange alles gut geht.
const LED_COLORS = {
  cold: 'neon',
  warm: 'gold',
  hot: 'fire',
  critical: 'warnRed',
  meltdown: 'warnRed',
};

// Wie viele Dampfwölkchen je Hitzestufe aus dem Dach steigen.
const STEAM_BY_STAGE = { cold: 0, warm: 7, hot: 14, critical: 20, meltdown: 20 };

// Deterministischer Pseudozufall, damit Blade- und Funkenmuster bei jedem Neuaufbau
// (Theme-Wechsel, Kontextverlust) identisch bleiben.
function hash01(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function buildServerRack(palette) {
  const group = new THREE.Group();
  const hitMeshes = [];
  const mats = {};
  const dummy = new THREE.Object3D();

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
  const addHit = (mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    hitMeshes.push(mesh);
    group.add(mesh);
    return mesh;
  };

  // --- Sockel: Doppelboden mit Kabelkanal und Vortreppe -------------------------------
  const pad = addHit(new THREE.Mesh(new THREE.BoxGeometry(7.2, PAD_TOP_Y, 6.4), lambert('stone')));
  pad.position.y = PAD_TOP_Y / 2;
  const padRim = addHit(new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.18, 6.7), lambert('stoneDark')));
  padRim.position.y = PAD_TOP_Y;
  // Bodenplatten-Fugen: zwei helle Streifen, damit der Sockel nicht als Klotz liest.
  [-1.6, 1.6].forEach((x) => {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 6.4), lambert('stoneDark'));
    seam.position.set(x, PAD_TOP_Y + 0.09, 0);
    group.add(seam);
  });
  [
    [3.4, 0.3, 0.9, 3.7],
    [2.8, 0.3, 0.8, 4.3],
  ].forEach(([w, h, d, z], i) => {
    const step = addHit(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lambert(i % 2 ? 'stoneDark' : 'stone')));
    step.position.set(0, PAD_TOP_Y - 0.15 - i * 0.3, z);
  });

  // --- Hauptschrank -------------------------------------------------------------------
  // Kein voller Quader, sondern eine vorne offene Schale aus fünf Platten: nur so sieht
  // man durch die Glastür die Blades und ihre LEDs. Ein geschlossener Block war in der
  // ersten Fassung genau das - ein Block.
  const caseMat = lambert('steelDark');
  const CAB_H = CAB_TOP_Y - PAD_TOP_Y;
  const CAB_MID_Y = (CAB_TOP_Y + PAD_TOP_Y) / 2;
  [
    [CAB_W, CAB_H, 0.2, 0, CAB_MID_Y, -CAB_D / 2 + 0.1],
    [0.2, CAB_H, CAB_D, -CAB_W / 2 + 0.1, CAB_MID_Y, 0],
    [0.2, CAB_H, CAB_D, CAB_W / 2 - 0.1, CAB_MID_Y, 0],
    [CAB_W, 0.2, CAB_D, 0, PAD_TOP_Y + 0.1, 0],
    [CAB_W, 0.2, CAB_D, 0, CAB_TOP_Y - 0.1, 0],
  ].forEach(([w, h, d, x, y, z]) => {
    const panel = addHit(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), caseMat));
    panel.position.set(x, y, z);
  });

  // Zwei halbhohe Nachbarschränke, damit die Mitte als Rack-Reihe liest. Gemeinsames
  // Material: im Meltdown werden sie zusammen mit dem Hauptschrank rußig.
  const sideCabMat = lambert('steel');
  [-1, 1].forEach((sgn) => {
    const cab = addHit(
      new THREE.Mesh(new THREE.BoxGeometry(SIDE_CAB_W, SIDE_CAB_TOP_Y - PAD_TOP_Y, CAB_D - 0.3), sideCabMat)
    );
    cab.position.set(sgn * SIDE_CAB_X, (SIDE_CAB_TOP_Y + PAD_TOP_Y) / 2, 0);
  });

  // Türrahmen und Glastür vorne: dahinter sieht man die Blades.
  const frameMat = lambert('steel');
  [
    [CAB_W, 0.22, 0.16, 0, CAB_TOP_Y - 0.11],
    [CAB_W, 0.22, 0.16, 0, PAD_TOP_Y + 0.11],
    [0.22, CAB_TOP_Y - PAD_TOP_Y, 0.16, -CAB_W / 2 + 0.11, (CAB_TOP_Y + PAD_TOP_Y) / 2],
    [0.22, CAB_TOP_Y - PAD_TOP_Y, 0.16, CAB_W / 2 - 0.11, (CAB_TOP_Y + PAD_TOP_Y) / 2],
  ].forEach(([w, h, d, x, y]) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), frameMat);
    bar.position.set(x, y, FRONT_Z + 0.04);
    bar.castShadow = true;
    group.add(bar);
    hitMeshes.push(bar);
  });
  const glassMat = new THREE.MeshBasicMaterial({
    color: palette.glass,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });
  const door = new THREE.Mesh(new THREE.PlaneGeometry(CAB_W - 0.44, CAB_TOP_Y - PAD_TOP_Y - 0.44), glassMat);
  door.position.set(0, (CAB_TOP_Y + PAD_TOP_Y) / 2, FRONT_Z + 0.06);
  group.add(door);
  hitMeshes.push(door);
  // Türgriff
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.7, 0.1), frameMat);
  handle.position.set(CAB_W / 2 - 0.36, (CAB_TOP_Y + PAD_TOP_Y) / 2, FRONT_Z + 0.14);
  group.add(handle);
  hitMeshes.push(handle);

  // --- Blades hinter der Tür + LED-Streifen -------------------------------------------
  const bladeMat = lambert('steel');
  const blades = new THREE.InstancedMesh(new THREE.BoxGeometry(CAB_W - 0.56, 0.26, 0.5), bladeMat, BLADE_ROWS);
  blades.frustumCulled = false;
  group.add(blades);
  hitMeshes.push(blades);
  const ledMat = new THREE.MeshBasicMaterial({ color: palette.neon });
  const leds = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.09, 0.05), ledMat, BLADE_ROWS * 4);
  leds.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  leds.frustumCulled = false;
  group.add(leds);
  // Glutspalt zwischen den Blades: wird erst ab "hot" sichtbar.
  const coreGlowMat = new THREE.MeshBasicMaterial({ color: palette.fire, transparent: true, opacity: 0 });
  const coreGlow = new THREE.Mesh(new THREE.PlaneGeometry(CAB_W - 0.6, CAB_TOP_Y - PAD_TOP_Y - 0.7), coreGlowMat);
  coreGlow.position.set(0, (CAB_TOP_Y + PAD_TOP_Y) / 2, FRONT_Z - 0.16);
  group.add(coreGlow);

  const bladeStep = (CAB_TOP_Y - PAD_TOP_Y - 0.7) / BLADE_ROWS;
  const ledSlots = [];
  for (let i = 0; i < BLADE_ROWS; i += 1) {
    const y = PAD_TOP_Y + 0.55 + i * bladeStep;
    dummy.position.set(0, y, FRONT_Z - 0.42);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    blades.setMatrixAt(i, dummy.matrix);
    for (let k = 0; k < 4; k += 1) {
      const x = -CAB_W / 2 + 0.5 + k * 0.42;
      ledSlots.push({ x, y: y + 0.02, blink: 2 + hash01(i * 4 + k) * 9 });
      dummy.position.set(x, y + 0.02, FRONT_Z - 0.15);
      dummy.updateMatrix();
      leds.setMatrixAt(i * 4 + k, dummy.matrix);
    }
  }
  blades.instanceMatrix.needsUpdate = true;
  leds.instanceMatrix.needsUpdate = true;

  // --- Lüftungslamellen an der rechten Seitenwand --------------------------------------
  const louverMat = lambert('steel');
  const louvers = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 0.1, CAB_D - 0.5), louverMat, 10);
  louvers.frustumCulled = false;
  group.add(louvers);
  for (let i = 0; i < 10; i += 1) {
    dummy.position.set(CAB_W / 2 + 0.02, PAD_TOP_Y + 0.7 + i * 0.4, 0);
    dummy.rotation.set(0.35, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    louvers.setMatrixAt(i, dummy.matrix);
  }
  louvers.instanceMatrix.needsUpdate = true;

  // --- Dach: Lüfter, Abluftkamin, Warnleuchte ------------------------------------------
  const roof = addHit(new THREE.Mesh(new THREE.BoxGeometry(CAB_W + 0.2, 0.22, CAB_D + 0.2), lambert('steel')));
  roof.position.y = CAB_TOP_Y + 0.11;

  const fanMat = lambert('steelDark');
  const fans = [-0.75, 0.75].map((x) => {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 10), fanMat);
    ring.position.set(x, CAB_TOP_Y + 0.26, -0.3);
    group.add(ring);
    const blade = new THREE.Group();
    blade.position.set(x, CAB_TOP_Y + 0.3, -0.3);
    for (let k = 0; k < 3; k += 1) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.03, 0.16), lambert('steel'));
      b.rotation.y = (k / 3) * Math.PI * 2;
      blade.add(b);
    }
    group.add(blade);
    return blade;
  });

  // Dunkle Schlitze in Haube und Dach: der Auslass für Dampf, Qualm und später Feuer.
  const ventMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1f });

  // Abluftkamin: schmales Blechrohr hinten auf dem Dach. Bewusst dünn und dunkel - ein
  // heller, dicker Schlot wäre wieder der alte Ziegelofen, den der Schrank ersetzt.
  const duct = addHit(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, DUCT_TOP_Y - CAB_TOP_Y - 0.6, 8), lambert('steel')));
  duct.position.set(DUCT_X, (DUCT_TOP_Y + CAB_TOP_Y + 0.6) / 2, DUCT_Z);
  const ductRing = addHit(new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.46, 0.2, 8), lambert('steelDark')));
  ductRing.position.set(DUCT_X, DUCT_TOP_Y, DUCT_Z);
  // Gitterhaube statt Kaminhut.
  const ductCap = addHit(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.34, 1.0), lambert('steelDark')));
  ductCap.position.set(DUCT_X, DUCT_TOP_Y + 0.3, DUCT_Z);
  for (let i = 0; i < 3; i += 1) {
    const slit = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.05, 0.16), ventMat);
    slit.position.set(DUCT_X, DUCT_TOP_Y + 0.2 + i * 0.1, DUCT_Z - 0.3 + i * 0.3);
    group.add(slit);
  }
  // Dachschlitz, aus dem Dampf und später die Flammen kommen.
  const vent = new THREE.Mesh(new THREE.BoxGeometry(CAB_W - 0.9, 0.06, 0.5), ventMat);
  vent.position.set(0, CAB_TOP_Y + 0.23, 0.78);
  group.add(vent);

  const warnMat = new THREE.MeshBasicMaterial({ color: palette.warnRed });
  const warnLight = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), warnMat);
  warnLight.position.set(-CAB_W / 2 + 0.3, CAB_TOP_Y + 0.42, -0.7);
  warnLight.visible = false;
  group.add(warnLight);

  // Statusdisplay an der Tür: färbt sich mit der Hitzestufe.
  const statusMat = new THREE.MeshBasicMaterial({ color: palette.neon });
  const status = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.3), statusMat);
  status.position.set(-CAB_W / 2 + 0.75, CAB_TOP_Y - 0.5, FRONT_Z + 0.08);
  group.add(status);
  hitMeshes.push(status);

  // Wärmetauscher-Kühlrippen an den Seiten des Serverkamins
  const finMat = lambert('steel');
  [-CAB_W / 2 - 0.04, CAB_W / 2 + 0.04].forEach((sideX) => {
    for (let f = 0; f < 6; f += 1) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, CAB_D * 0.75), finMat);
      fin.position.set(sideX, PAD_TOP_Y + 0.7 + f * 0.45, 0);
      fin.castShadow = true;
      group.add(fin);
    }
  });

  // Warnmarkierungsleiste vor der Schranktür
  const stripeMat = basic('tapeYellow');
  const stripeBar = new THREE.Mesh(new THREE.BoxGeometry(CAB_W * 0.85, 0.06, 0.08), stripeMat);
  stripeBar.position.set(0, PAD_TOP_Y + 0.12, FRONT_Z + 0.16);
  group.add(stripeBar);

  // --- Kabelbäume nach hinten in den Boden ----------------------------------------------
  const cableMat = lambert('junction');
  [-0.8, -0.2, 0.4].forEach((x, i) => {
    const bend = new THREE.Mesh(new THREE.TorusGeometry(0.55 + i * 0.12, 0.09, 5, 8, Math.PI / 2), cableMat);
    bend.position.set(x, PAD_TOP_Y + 0.55 + i * 0.12, -CAB_D / 2 - 0.05);
    bend.rotation.set(0, Math.PI / 2, Math.PI);
    group.add(bend);
  });
  const trench = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.16, 0.7), lambert('stoneDark'));
  trench.position.set(-0.2, PAD_TOP_Y + 0.06, -CAB_D / 2 - 0.7);
  group.add(trench);

  // --- Flammen (erst ab "critical") -----------------------------------------------------
  const flameGroup = new THREE.Group();
  flameGroup.position.set(0, CAB_TOP_Y + 0.2, 0.78);
  flameGroup.visible = false;
  group.add(flameGroup);
  const flameSpecs = [
    { x: 0, z: 0, h: 2.2, r: 0.44, key: 'fireCore', speed: 13 },
    { x: -0.62, z: 0.1, h: 1.7, r: 0.38, key: 'fire', speed: 11 },
    { x: 0.64, z: 0.08, h: 1.8, r: 0.38, key: 'fire', speed: 15 },
    { x: -0.3, z: -0.2, h: 1.35, r: 0.32, key: 'ember', speed: 9 },
    { x: 0.34, z: -0.22, h: 1.4, r: 0.32, key: 'ember', speed: 17 },
  ];
  const flameMats = { fireCore: null, fire: null, ember: null };
  const flames = flameSpecs.map((spec, i) => {
    if (!flameMats[spec.key]) flameMats[spec.key] = new THREE.MeshBasicMaterial({ color: palette[spec.key] });
    const m = new THREE.Mesh(new THREE.ConeGeometry(spec.r, spec.h, 5), flameMats[spec.key]);
    m.position.set(spec.x, spec.h / 2, spec.z);
    m.rotation.y = i;
    m.userData.spec = spec;
    flameGroup.add(m);
    return m;
  });
  // Zweiter, kleinerer Flammenherd im Türspalt - der Schrank brennt von innen.
  const doorFlameMat = new THREE.MeshBasicMaterial({ color: palette.fire, transparent: true, opacity: 0.9 });
  const doorFlame = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 5), doorFlameMat);
  doorFlame.position.set(0, PAD_TOP_Y + 0.9, FRONT_Z + 0.2);
  doorFlame.visible = false;
  group.add(doorFlame);

  // Warmer Lichtschein vor dem Schrank.
  const glowMat = new THREE.MeshBasicMaterial({ color: palette.fire, transparent: true, opacity: 0, depthWrite: false });
  const glow = new THREE.Mesh(new THREE.CircleGeometry(2.1, 16), glowMat);
  glow.rotation.x = -Math.PI / 2;
  glow.position.set(0, PAD_TOP_Y + 0.03, FRONT_Z + 1.3);
  group.add(glow);

  const light = new THREE.PointLight(HEAT_FIRE_COLORS.cold, HEAT_LIGHT_INTENSITY.cold, 14, 1.6);
  light.position.set(0, 2.6, FRONT_Z + 1.0);
  group.add(light);

  // --- Funken -----------------------------------------------------------------------------
  const emberGeo = new THREE.TetrahedronGeometry(0.14, 0);
  const emberMat = new THREE.MeshBasicMaterial({ color: palette.ember });
  const embers = new THREE.InstancedMesh(emberGeo, emberMat, EMBER_MAX);
  embers.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  embers.count = 0;
  embers.frustumCulled = false;
  group.add(embers);
  const emberPhase = Float32Array.from({ length: EMBER_MAX }, (_, i) => hash01(i + 300));
  const emberSeed = Float32Array.from({ length: EMBER_MAX }, (_, i) => hash01(i + 600) * Math.PI * 2);

  // --- Dampf aus dem Dachschlitz (die Stufe VOR dem Feuer) ---------------------------------
  const steamMat = new THREE.MeshLambertMaterial({
    color: palette.mist,
    flatShading: true,
    transparent: true,
    opacity: 0.6,
  });
  const steam = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.3, 0), steamMat, STEAM_MAX);
  steam.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  steam.count = 0;
  steam.frustumCulled = false;
  group.add(steam);
  const steamPhase = Float32Array.from({ length: STEAM_MAX }, (_, i) => (i / STEAM_MAX + hash01(i + 70) * 0.04) % 1);
  const steamSeed = Float32Array.from({ length: STEAM_MAX }, (_, i) => hash01(i + 140) * Math.PI * 2);

  // --- Rauchfahne aus dem Abluftkamin (VPS) -------------------------------------------------
  const smokeGeo = new THREE.IcosahedronGeometry(0.45, 0);
  const smokeMat = new THREE.MeshLambertMaterial({ color: palette.smoke, flatShading: true, transparent: true, opacity: 0.9 });
  const smoke = new THREE.InstancedMesh(smokeGeo, smokeMat, SMOKE_MAX);
  smoke.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  smoke.count = 0;
  smoke.frustumCulled = false;
  group.add(smoke);
  const smokePhase = Float32Array.from({ length: SMOKE_MAX }, (_, i) => (i / SMOKE_MAX + hash01(i) * 0.05) % 1);
  const smokeSeed = Float32Array.from({ length: SMOKE_MAX }, (_, i) => hash01(i + 100) * Math.PI * 2);
  const smokeColor = new THREE.Color();

  // --- Meltdown: Absperrband, Kühlnebel ------------------------------------------------------
  const meltdownGroup = new THREE.Group();
  meltdownGroup.visible = false;
  group.add(meltdownGroup);
  const tapeGeo = new THREE.BoxGeometry(0.62, 0.16, 0.05);
  const tapeMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
  const tape = new THREE.InstancedMesh(tapeGeo, tapeMat, TAPE_SEGMENTS);
  const tapeR = 4.4;
  const tapeColor = new THREE.Color();
  for (let i = 0; i < TAPE_SEGMENTS; i += 1) {
    const a = (i / TAPE_SEGMENTS) * Math.PI * 2;
    dummy.position.set(Math.sin(a) * tapeR, 1.35, Math.cos(a) * tapeR);
    dummy.rotation.set(0, a, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    tape.setMatrixAt(i, dummy.matrix);
    tape.setColorAt(i, tapeColor.setHex(i % 2 ? palette.tapeBlack : palette.tapeYellow));
  }
  meltdownGroup.add(tape);
  const postMat = lambert('steelDark');
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2 + 0.2;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.4, 6), postMat);
    post.position.set(Math.sin(a) * tapeR, 1.6, Math.cos(a) * tapeR);
    meltdownGroup.add(post);
  }
  const mistGeo = new THREE.IcosahedronGeometry(0.6, 0);
  const mistMat = new THREE.MeshLambertMaterial({ color: palette.mist, flatShading: true, transparent: true, opacity: 0.55 });
  const mist = new THREE.InstancedMesh(mistGeo, mistMat, MIST_MAX);
  mist.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mist.count = 0;
  mist.frustumCulled = false;
  group.add(mist);
  const mistPhase = Float32Array.from({ length: MIST_MAX }, (_, i) => hash01(i + 900));
  const mistSeed = Float32Array.from({ length: MIST_MAX }, (_, i) => hash01(i + 1200) * Math.PI * 2);

  // --- Events: Blitze, Goldregen, Seifenblasen -------------------------------------------------
  const boltMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
  const bolts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 2.2, 0.16), boltMat, 10);
  bolts.frustumCulled = false;
  bolts.count = 0;
  group.add(bolts);
  let boltTimer = 0;

  const coinMat = new THREE.MeshLambertMaterial({ color: palette.gold, flatShading: true });
  const coins = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 8), coinMat, 36);
  coins.frustumCulled = false;
  coins.count = 0;
  group.add(coins);
  const coinPhase = Float32Array.from({ length: 36 }, (_, i) => hash01(i + 2000));
  const coinSeed = Float32Array.from({ length: 36 }, (_, i) => hash01(i + 2500) * Math.PI * 2);

  const bubbleMat = new THREE.MeshLambertMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.45, flatShading: true });
  const bubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(0.5, 8, 6), bubbleMat, SMOKE_MAX);
  bubbles.frustumCulled = false;
  bubbles.count = 0;
  group.add(bubbles);

  // --- Zustand ----------------------------------------------------------------------------------
  const corePosition = new THREE.Vector3(0, 2.8, FRONT_Z + 0.5);
  let lastStage = null;
  let lastMood = null;
  let pulse = 0;
  let flare = 0;
  let emberBurst = 0;
  let ledColorHex = palette.neon;
  let fanSpeed = 0.6;
  let steamTarget = 0;
  let burning = false;

  function applyHeat(stage, mood, p) {
    const meltdown = stage === 'meltdown';
    // "Brennen" gibt es erst ganz oben auf der Skala - davor dampft und qualmt es nur.
    burning = stage === 'critical' || meltdown;
    const fireHex = mood === 'golden' ? p.gold : HEAT_FIRE_COLORS[stage] || HEAT_FIRE_COLORS.cold;
    light.color.setHex(fireHex);
    light.intensity = HEAT_LIGHT_INTENSITY[stage] || 1;

    ledColorHex = mood === 'golden' ? p.gold : p[LED_COLORS[stage] || 'neon'];
    ledMat.color.setHex(ledColorHex);
    statusMat.color.setHex(ledColorHex);

    flameGroup.visible = burning;
    doorFlame.visible = burning;
    const core = mood === 'golden' ? p.gold : meltdown ? 0xfef08a : p.fireCore;
    const mid = mood === 'golden' ? p.gold : meltdown ? 0xf43f5e : p.fire;
    flameMats.fireCore.color.setHex(core);
    flameMats.fire.color.setHex(mid);
    flameMats.ember.color.setHex(meltdown ? 0xdc2626 : p.ember);
    doorFlameMat.color.setHex(mid);

    glowMat.color.setHex(mood === 'golden' ? p.gold : meltdown ? 0xef4444 : p.fire);
    glowMat.opacity = stage === 'cold' ? 0.05 : stage === 'warm' ? 0.12 : stage === 'hot' ? 0.28 : 0.55;
    // Glut zwischen den Blades: das ist die Zwischenstufe zwischen Dampf und Feuer.
    coreGlowMat.color.setHex(mood === 'golden' ? p.gold : p.fire);
    coreGlowMat.opacity = stage === 'hot' ? 0.22 : stage === 'critical' ? 0.45 : meltdown ? 0.6 : 0;

    // Verrußtes Gehäuse im Meltdown, sonst normale Blechfarbe.
    caseMat.color.setHex(meltdown ? 0x1b1b1f : p.steelDark);
    sideCabMat.color.setHex(meltdown ? 0x3a3436 : p.steel);
    bladeMat.color.setHex(meltdown ? 0x3a2f2f : p.steel);

    fanSpeed = meltdown ? 0 : stage === 'cold' ? 0.8 : stage === 'warm' ? 3.5 : stage === 'hot' ? 8 : 14;
    steamTarget = STEAM_BY_STAGE[stage] || 0;

    meltdownGroup.visible = meltdown;
    warnLight.visible = meltdown;
    embers.count = stage === 'hot' ? 8 : burning ? EMBER_MAX : 0;
    // Rauchfarbe: weißer Dampf, solange es kühl ist, dann grau, dann schwarz.
    const smokeHex =
      mood === 'golden'
        ? p.gold
        : stage === 'cold' || stage === 'warm'
          ? p.mist
          : stage === 'hot'
            ? p.smoke
            : 0x475569;
    smokeMat.color.setHex(smokeHex);
    smokeMat.opacity = stage === 'cold' ? 0.55 : stage === 'warm' ? 0.7 : 0.9;
    steamMat.color.setHex(mood === 'golden' ? p.gold : p.mist);
  }

  return {
    group,
    hitMeshes,
    corePosition,
    pulse() {
      pulse = 1;
      flare = 1;
      emberBurst = 0.45;
    },
    update(state, dt, t, p) {
      const { heatStage, heatPct, smokeTier } = state.furnace;
      const mood = state.mood;
      const reduced = state.reduced;
      if (heatStage !== lastStage || mood !== lastMood) {
        applyHeat(heatStage, mood, p);
        lastStage = heatStage;
        lastMood = mood;
      }
      const meltdown = heatStage === 'meltdown';

      if (pulse > 0) pulse = Math.max(0, pulse - dt * 4);
      if (flare > 0) flare = Math.max(0, flare - dt * 3);
      if (emberBurst > 0) emberBurst = Math.max(0, emberBurst - dt);
      const s = 1 + pulse * 0.04;
      group.scale.set(s, s, s);

      // Lüfter drehen mit der Hitze.
      if (!reduced) fans.forEach((f, i) => { f.rotation.y += dt * fanSpeed * (i % 2 ? 1 : -1); });

      // LEDs blinken; beim Tap flackert die ganze Front auf.
      if (!reduced) {
        for (let i = 0; i < ledSlots.length; i += 1) {
          const slot = ledSlots[i];
          const on = Math.sin(t * slot.blink + i) > -0.3 || flare > 0.1;
          dummy.position.set(slot.x, slot.y, FRONT_Z - 0.15);
          dummy.rotation.set(0, 0, 0);
          dummy.scale.setScalar(on ? 1 : 0.001);
          dummy.updateMatrix();
          leds.setMatrixAt(i, dummy.matrix);
        }
        leds.instanceMatrix.needsUpdate = true;
      }

      // Flammen: gibt es erst ab "critical". Höhe nach Hitze, Flackern je Flamme,
      // Stoß beim Tap.
      if (burning) {
        const heightK = 0.5 + heatPct * 0.8 + flare * 0.5 + (meltdown ? 0.35 : 0);
        flames.forEach((m, i) => {
          const spec = m.userData.spec;
          const fl = reduced ? 1 : 1 + Math.sin(t * spec.speed + i * 1.7) * 0.18 + Math.sin(t * 3.1 + i) * 0.06;
          m.scale.set(0.85 + fl * 0.15, heightK * fl, 0.85 + fl * 0.15);
          m.position.y = (spec.h * heightK * fl) / 2;
          if (!reduced) m.rotation.y += dt * (0.8 + i * 0.3);
        });
        const df = reduced ? 1 : 1 + Math.sin(t * 12) * 0.2;
        doorFlame.scale.set(df, (meltdown ? 1.2 : 0.7) * df, df);
        doorFlame.position.y = PAD_TOP_Y + 0.8 * doorFlame.scale.y;
      }
      if (!reduced && !meltdown) {
        light.intensity = (HEAT_LIGHT_INTENSITY[heatStage] || 1) * (0.9 + Math.sin(t * 11) * 0.1) + flare * 3;
        glow.scale.setScalar(1 + Math.sin(t * 9) * 0.05 + flare * 0.25);
      } else if (!reduced) {
        warnLight.visible = Math.sin(t * 6) > 0;
        light.intensity = warnLight.visible ? 2.5 : 0.8;
      }

      // Funken: Bogenflug aus dem Dachschlitz nach vorne oben.
      const emberVisible = emberBurst > 0 ? EMBER_MAX : embers.count;
      if (emberVisible > 0) {
        const speed = reduced ? 0 : 0.9;
        for (let i = 0; i < emberVisible; i += 1) {
          emberPhase[i] = (emberPhase[i] + dt * speed * (0.7 + hash01(i + 50) * 0.6)) % 1;
          const ph = emberPhase[i];
          const spread = Math.sin(emberSeed[i]) * 0.9;
          dummy.position.set(
            spread * ph * 1.6,
            CAB_TOP_Y + 0.4 + ph * 3.0 - ph * ph * 2.0,
            0.8 + ph * 2.2
          );
          const sc = (1 - ph) * 0.9 + 0.2;
          dummy.scale.setScalar(sc);
          dummy.rotation.set(ph * 7, emberSeed[i], ph * 5);
          dummy.updateMatrix();
          embers.setMatrixAt(i, dummy.matrix);
        }
        embers.count = emberVisible;
        embers.instanceMatrix.needsUpdate = true;
      }

      // Dampf: steigt ab "warm" aus dem Dachschlitz, löst sich in zwei Metern auf.
      steam.count = steamTarget;
      if (steamTarget > 0) {
        const speed = reduced ? 0 : 0.45;
        for (let i = 0; i < steamTarget; i += 1) {
          steamPhase[i] = (steamPhase[i] + dt * speed) % 1;
          const ph = steamPhase[i];
          dummy.position.set(
            Math.sin(steamSeed[i] + ph * 2.4) * (0.3 + ph * 1.1),
            CAB_TOP_Y + 0.3 + ph * 2.6,
            0.78 + Math.cos(steamSeed[i] * 1.3) * (0.2 + ph * 0.7)
          );
          dummy.scale.setScalar((0.5 + ph * 1.5) * (1 - ph * 0.35));
          dummy.rotation.set(ph * 2, steamSeed[i], ph);
          dummy.updateMatrix();
          steam.setMatrixAt(i, dummy.matrix);
        }
        steamMat.opacity = 0.55 * (1 - heatPct * 0.3);
        steam.instanceMatrix.needsUpdate = true;
      }

      // Rauchfahne: Stufe 0..7, mehr, größer und höher mit jeder Stufe. Bei Bubble-Burn
      // steigen statt Rauch Seifenblasen auf, die oben platzen.
      const target = Math.min(SMOKE_MAX, smokeTier * SMOKE_PER_TIER);
      const isBubble = mood === 'bubble';
      smoke.count = isBubble ? 0 : target;
      bubbles.count = isBubble ? Math.max(8, target) : 0;
      if (isBubble) {
        const n = bubbles.count;
        const speed = reduced ? 0 : 0.3;
        for (let i = 0; i < n; i += 1) {
          smokePhase[i] = (smokePhase[i] + dt * speed) % 1;
          const ph = smokePhase[i];
          const pop = ph > 0.92 ? Math.max(0.001, (1 - ph) / 0.08) : 1; // platzen kurz vor Ende
          dummy.position.set(DUCT_X + Math.sin(smokeSeed[i] + ph * 3) * (0.5 + ph * 2.5), SMOKE_START_Y + ph * 9, DUCT_Z + Math.cos(smokeSeed[i] + ph * 2) * (0.5 + ph * 2.5));
          dummy.scale.setScalar((0.5 + hash01(i + 9) * 0.6) * pop * (1 + (reduced ? 0 : Math.sin(t * 6 + i) * 0.08)));
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          bubbles.setMatrixAt(i, dummy.matrix);
        }
        bubbles.instanceMatrix.needsUpdate = true;
      }
      if (target > 0 && !isBubble) {
        const speed = reduced ? 0 : 0.2 + smokeTier * 0.02;
        const rise = 4.5 + smokeTier * 0.55;
        const size = 0.45 + smokeTier * 0.08;
        for (let i = 0; i < target; i += 1) {
          smokePhase[i] = (smokePhase[i] + dt * speed) % 1;
          const ph = smokePhase[i];
          const drift = 0.4 + ph * (1.0 + smokeTier * 0.12);
          dummy.position.set(
            DUCT_X + Math.sin(smokeSeed[i] + ph * 5) * drift,
            SMOKE_START_Y + ph * rise,
            DUCT_Z + Math.cos(smokeSeed[i] * 1.3 + ph * 4) * drift
          );
          dummy.scale.setScalar(size * (1.0 + ph * 1.8));
          dummy.rotation.set(ph * 3, smokeSeed[i], ph * 2);
          dummy.updateMatrix();
          smoke.setMatrixAt(i, dummy.matrix);
          smokeColor.copy(smokeMat.color).lerp(WHITE, ph * 0.5);
          smoke.setColorAt(i, smokeColor);
        }
        smoke.instanceMatrix.needsUpdate = true;
        if (smoke.instanceColor) smoke.instanceColor.needsUpdate = true;
      }

      // Kühlnebel im Meltdown: kriecht vom Sockel nach außen und löst sich auf.
      mist.count = meltdown ? MIST_MAX : 0;
      if (meltdown) {
        const speed = reduced ? 0 : 0.25;
        for (let i = 0; i < MIST_MAX; i += 1) {
          mistPhase[i] = (mistPhase[i] + dt * speed) % 1;
          const ph = mistPhase[i];
          const r = 3.4 + ph * 3.5;
          dummy.position.set(Math.sin(mistSeed[i]) * r, 1.0 + ph * 1.2, Math.cos(mistSeed[i]) * r);
          dummy.scale.setScalar(0.6 + ph * 1.2);
          dummy.rotation.set(ph, mistSeed[i], 0);
          dummy.updateMatrix();
          mist.setMatrixAt(i, dummy.matrix);
        }
        mist.instanceMatrix.needsUpdate = true;
      }

      // Power Surge: türkise Blitze zucken um den Schrank, alle 80 ms neu gewürfelt.
      if (mood === 'surge') {
        boltTimer -= dt;
        if (boltTimer <= 0 || bolts.count === 0) {
          boltTimer = reduced ? 1 : 0.08;
          const n = 6 + Math.floor(hash01(Math.floor(t * 12)) * 4);
          for (let i = 0; i < n; i += 1) {
            const a = hash01(i * 3 + Math.floor(t * 12)) * Math.PI * 2;
            const r = 2.4 + hash01(i * 5 + Math.floor(t * 12)) * 1.4;
            dummy.position.set(Math.sin(a) * r, 3 + hash01(i * 7 + Math.floor(t * 12)) * 5, Math.cos(a) * r);
            dummy.rotation.set(hash01(i * 11 + t) * 1.2 - 0.6, a, hash01(i * 13 + t) * 1.2 - 0.6);
            dummy.scale.set(1, 0.6 + hash01(i * 17 + t) * 0.8, 1);
            dummy.updateMatrix();
            bolts.setMatrixAt(i, dummy.matrix);
          }
          bolts.count = n;
          bolts.instanceMatrix.needsUpdate = true;
        }
      } else {
        bolts.count = 0;
      }

      // Golden Meme: Goldmünzen regnen über die Insel.
      coins.count = mood === 'golden' ? 36 : 0;
      if (coins.count > 0) {
        for (let i = 0; i < 36; i += 1) {
          coinPhase[i] = (coinPhase[i] + dt * (reduced ? 0 : 0.28 + hash01(i) * 0.15)) % 1;
          const ph = coinPhase[i];
          const r = 3 + hash01(i + 3) * 8;
          dummy.position.set(Math.cos(coinSeed[i]) * r, 14 - ph * 13.5, Math.sin(coinSeed[i]) * r);
          dummy.rotation.set(t * 3 + i, t * 2, 0.4);
          dummy.scale.setScalar(1);
          dummy.updateMatrix();
          coins.setMatrixAt(i, dummy.matrix);
        }
        coins.instanceMatrix.needsUpdate = true;
      }
    },
    applyPalette(p) {
      Object.entries(mats).forEach(([key, list]) => list.forEach((m) => m.color.setHex(p[key])));
      coinMat.color.setHex(p.gold);
      boltMat.color.setHex(p.neon);
      emberMat.color.setHex(p.ember);
      warnMat.color.setHex(p.warnRed);
      mistMat.color.setHex(p.mist);
      glassMat.color.setHex(p.glass);
      for (let i = 0; i < TAPE_SEGMENTS; i += 1) {
        tape.setColorAt(i, tapeColor.setHex(i % 2 ? p.tapeBlack : p.tapeYellow));
      }
      tape.instanceColor.needsUpdate = true;
      lastStage = null; // erzwingt applyHeat (inkl. LED- und Rauchfarben) mit neuer Palette
    },
  };
}
