import * as THREE from 'three';
import { HEAT_FIRE_COLORS, HEAT_LIGHT_INTENSITY } from './palette';

// Der Schmelzofen, Phase 2: Ziegel-Bienenkorb mit sichtbaren Steinen, Metallbändern,
// gewölbtem Ofenmund, Flammen, Funken, Schlotkappe, Seitenrohr und Vortreppe.
// Dazu die Zustände: fünf Hitzestufen (Glut, Ziegelglühen, Funken), acht
// Rauchstufen, Meltdown (Absperrband, Warnlicht, Kühlnebel, erloschene Kammer)
// und der Tap-Puls mit Flammenstoß.
//
// Alle Massen sind ein paar Draw Calls: Ziegel, Funken, Rauch, Nebel und Band sind
// je EIN InstancedMesh. Zustandsänderungen (Hitzestufe, Stimmung) werden nur bei
// Wechsel angewendet, der Rest der update() ist reine Bewegung.

const SMOKE_MAX = 32;
const SMOKE_PER_TIER = 4;
const EMBER_MAX = 28;
const MIST_MAX = 18;
const TAPE_SEGMENTS = 30;

const BODY_BOTTOM_Y = 0.9;
const BODY_TOP_Y = 5.3;
const BODY_R_BOTTOM = 2.7;
const BODY_R_TOP = 1.75;
const CHIMNEY_TOP_Y = 8.3;
const SMOKE_START_Y = 8.9;
const MOUTH_HALF_ANGLE = 0.52; // Öffnungswinkel des Ofenmunds (Bogenmaß, je Seite)
const MOUTH_TOP_Y = 3.1;

const WHITE = new THREE.Color(0xffffff);

function radiusAt(y) {
  const k = (y - BODY_BOTTOM_Y) / (BODY_TOP_Y - BODY_BOTTOM_Y);
  return BODY_R_BOTTOM + (BODY_R_TOP - BODY_R_BOTTOM) * k;
}

// Deterministischer Pseudozufall, damit das Ziegelmuster bei jedem Neuaufbau
// (Theme-Wechsel, Kontextverlust) identisch bleibt.
function hash01(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function buildFurnace(palette) {
  const group = new THREE.Group();
  const hitMeshes = [];
  const mats = {};

  const lambert = (key, extra = {}) => {
    const m = new THREE.MeshLambertMaterial({ color: palette[key], flatShading: true, ...extra });
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

  // --- Sockel und Treppe ----------------------------------------------------------
  const base = addHit(new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.6, 0.9, 14), lambert('stone')));
  base.position.y = 0.45;
  const baseRim = addHit(new THREE.Mesh(new THREE.CylinderGeometry(3.45, 3.45, 0.18, 14), lambert('stoneDark')));
  baseRim.position.y = 0.9;

  [
    [3.2, 0.3, 0.9, 3.75],
    [2.6, 0.3, 0.8, 4.35],
    [2.0, 0.3, 0.7, 4.9],
  ].forEach(([w, h, d, z], i) => {
    const step = addHit(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lambert(i % 2 ? 'stoneDark' : 'stone')));
    step.position.set(0, 0.9 - 0.15 - i * 0.3, z);
  });

  // --- Ofenkörper: Mörtel-Kegelstumpf + instanzierte Ziegel ----------------------
  const mortarMat = lambert('mortar');
  const body = addHit(
    new THREE.Mesh(new THREE.CylinderGeometry(BODY_R_TOP - 0.12, BODY_R_BOTTOM - 0.12, BODY_TOP_Y - BODY_BOTTOM_Y, 16), mortarMat)
  );
  body.position.y = (BODY_TOP_Y + BODY_BOTTOM_Y) / 2;

  const brickH = 0.34;
  const brickGap = 0.05;
  const brickW = 0.72;
  const rowCount = Math.floor((BODY_TOP_Y - BODY_BOTTOM_Y) / (brickH + brickGap));
  const brickTransforms = [];
  for (let row = 0; row < rowCount; row += 1) {
    const y = BODY_BOTTOM_Y + brickH / 2 + row * (brickH + brickGap) + 0.05;
    const r = radiusAt(y);
    const n = Math.max(8, Math.round((2 * Math.PI * r) / (brickW + brickGap)));
    const offset = row % 2 ? Math.PI / n : 0;
    for (let k = 0; k < n; k += 1) {
      const a = offset + (k / n) * Math.PI * 2;
      // Ofenmund vorne (+z, a = 0) freilassen: unterhalb der Mundhöhe im vollen
      // Winkel, in der Bogenreihe darüber nur die Mitte.
      const front = Math.atan2(Math.sin(a), Math.cos(a)); // -PI..PI, 0 = vorne
      const inMouthRows = y < MOUTH_TOP_Y;
      const inArchRow = y >= MOUTH_TOP_Y && y < MOUTH_TOP_Y + brickH + brickGap;
      if (inMouthRows && Math.abs(front) < MOUTH_HALF_ANGLE) continue;
      if (inArchRow && Math.abs(front) < MOUTH_HALF_ANGLE * 0.5) continue;
      brickTransforms.push({ a, y, r });
    }
  }
  const brickGeo = new THREE.BoxGeometry(brickW, brickH, 0.36);
  const brickMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
  const bricks = new THREE.InstancedMesh(brickGeo, brickMat, brickTransforms.length);
  const dummy = new THREE.Object3D();
  brickTransforms.forEach(({ a, y, r }, i) => {
    dummy.position.set(Math.sin(a) * r, y, Math.cos(a) * r);
    dummy.rotation.set(0, a, 0);
    dummy.updateMatrix();
    bricks.setMatrixAt(i, dummy.matrix);
  });
  bricks.castShadow = true;
  bricks.receiveShadow = true;
  hitMeshes.push(bricks);
  group.add(bricks);

  const brickBase = new THREE.Color();
  const brickTmp = new THREE.Color();
  function paintBricks(p, glow) {
    const shades = [p.brick, p.brickLight, p.brickDark];
    for (let i = 0; i < brickTransforms.length; i += 1) {
      const h = hash01(i);
      brickBase.setHex(shades[h < 0.55 ? 0 : h < 0.85 ? 1 : 2]);
      if (glow > 0) {
        // Untere Reihen glühen stärker als obere.
        const rowK = 1 - (brickTransforms[i].y - BODY_BOTTOM_Y) / (BODY_TOP_Y - BODY_BOTTOM_Y);
        brickTmp.setHex(p.fire);
        brickBase.lerp(brickTmp, glow * (0.35 + rowK * 0.65));
      }
      bricks.setColorAt(i, brickBase);
    }
    bricks.instanceColor.needsUpdate = true;
  }
  paintBricks(palette, 0);

  // Metallbänder um den Körper
  [1.6, 3.9].forEach((y) => {
    const r = radiusAt(y) + 0.22;
    const band = addHit(new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.03, 0.22, 16), lambert('steelDark')));
    band.position.y = y;
  });

  // Oberer Ziegelkranz und Schulter
  const shoulder = addHit(new THREE.Mesh(new THREE.CylinderGeometry(1.2, BODY_R_TOP + 0.05, 0.7, 16), lambert('brickDark')));
  shoulder.position.y = BODY_TOP_Y + 0.35;

  // --- Ofenmund: dunkle Kammer hinter der Öffnung + Bogen aus Stein --------------
  const chamberMat = new THREE.MeshLambertMaterial({ color: 0x1a0f0a, flatShading: true });
  const chamber = new THREE.Mesh(new THREE.BoxGeometry(2.3, MOUTH_TOP_Y - BODY_BOTTOM_Y + 0.4, 1.6), chamberMat);
  chamber.position.set(0, (MOUTH_TOP_Y + BODY_BOTTOM_Y) / 2, radiusAt(2.0) - 0.9);
  group.add(chamber);
  hitMeshes.push(chamber);

  const archMat = lambert('stoneDark');
  const arch = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.2, 6, 10, Math.PI), archMat);
  arch.position.set(0, MOUTH_TOP_Y - 0.15, radiusAt(MOUTH_TOP_Y) + 0.05);
  group.add(arch);
  hitMeshes.push(arch);
  [-1.05, 1.05].forEach((x) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.4, MOUTH_TOP_Y - BODY_BOTTOM_Y - 0.1, 0.4), archMat);
    post.position.set(x, (MOUTH_TOP_Y - 0.15 + BODY_BOTTOM_Y) / 2, radiusAt(2.0) + 0.05);
    post.castShadow = true;
    group.add(post);
    hitMeshes.push(post);
  });

  // --- Flammen ---------------------------------------------------------------------
  const flameGroup = new THREE.Group();
  flameGroup.position.set(0, BODY_BOTTOM_Y + 0.15, radiusAt(2.0) - 0.05);
  group.add(flameGroup);
  const flameSpecs = [
    { x: 0, z: 0.1, h: 2.4, r: 0.5, key: 'fireCore', speed: 13 },
    { x: -0.5, z: 0.25, h: 1.9, r: 0.42, key: 'fire', speed: 11 },
    { x: 0.52, z: 0.2, h: 2.0, r: 0.42, key: 'fire', speed: 15 },
    { x: -0.25, z: -0.25, h: 1.5, r: 0.36, key: 'ember', speed: 9 },
    { x: 0.3, z: -0.25, h: 1.55, r: 0.36, key: 'ember', speed: 17 },
  ];
  const flameMats = { fireCore: null, fire: null, ember: null };
  const flames = flameSpecs.map((spec, i) => {
    if (!flameMats[spec.key]) flameMats[spec.key] = new THREE.MeshBasicMaterial({ color: palette[spec.key] });
    const m = new THREE.Mesh(new THREE.ConeGeometry(spec.r, spec.h, 5), flameMats[spec.key]);
    m.position.set(spec.x, spec.h / 2, spec.z);
    m.rotation.y = i;
    m.userData.spec = spec;
    flameGroup.add(m);
    hitMeshes.push(m);
    return m;
  });

  // Glutschein: flache Scheibe auf dem Sockel vor dem Ofenmund. Billiger und
  // deutlicher als das Punktlicht allein, das auf Lambert-Flächen kaum zu sehen ist.
  const glowMat = new THREE.MeshBasicMaterial({ color: palette.fire, transparent: true, opacity: 0, depthWrite: false });
  const glow = new THREE.Mesh(new THREE.CircleGeometry(1.9, 16), glowMat);
  glow.rotation.x = -Math.PI / 2;
  glow.position.set(0, BODY_BOTTOM_Y + 0.02, radiusAt(2.0) + 1.1);
  group.add(glow);

  const light = new THREE.PointLight(HEAT_FIRE_COLORS.cold, HEAT_LIGHT_INTENSITY.cold, 14, 1.6);
  light.position.set(0, 2.2, radiusAt(2.0) + 1.2);
  group.add(light);

  // --- Funken aus dem Ofenmund -------------------------------------------------------
  const emberGeo = new THREE.TetrahedronGeometry(0.14, 0);
  const emberMat = new THREE.MeshBasicMaterial({ color: palette.ember });
  const embers = new THREE.InstancedMesh(emberGeo, emberMat, EMBER_MAX);
  embers.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  embers.count = 0;
  embers.frustumCulled = false;
  group.add(embers);
  const emberPhase = Float32Array.from({ length: EMBER_MAX }, (_, i) => hash01(i + 300));
  const emberSeed = Float32Array.from({ length: EMBER_MAX }, (_, i) => hash01(i + 600) * Math.PI * 2);

  // --- Schlot mit Kappe, Warnlicht, Seitenrohr ----------------------------------------
  const chimney = addHit(new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, CHIMNEY_TOP_Y - BODY_TOP_Y - 0.7, 10), lambert('chimney')));
  chimney.position.y = (CHIMNEY_TOP_Y + BODY_TOP_Y + 0.7) / 2;
  const capRing = addHit(new THREE.Mesh(new THREE.CylinderGeometry(1.15, 0.95, 0.3, 10), lambert('steelDark')));
  capRing.position.y = CHIMNEY_TOP_Y;
  const capHat = addHit(new THREE.Mesh(new THREE.ConeGeometry(1.25, 0.55, 10), lambert('steel')));
  capHat.position.y = CHIMNEY_TOP_Y + 0.75;
  for (let i = 0; i < 3; i += 1) {
    const a = (i / 3) * Math.PI * 2;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.45, 5), lambert('steelDark'));
    post.position.set(Math.sin(a) * 0.85, CHIMNEY_TOP_Y + 0.35, Math.cos(a) * 0.85);
    group.add(post);
  }
  const warnMat = new THREE.MeshBasicMaterial({ color: palette.warnRed });
  const warnLight = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 6), warnMat);
  warnLight.position.y = CHIMNEY_TOP_Y + 1.15;
  warnLight.visible = false;
  group.add(warnLight);

  const pipeMat = lambert('steel');
  const pipeUp = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.6, 8), pipeMat);
  pipeUp.position.set(-2.55, 4.3, -0.6);
  pipeUp.castShadow = true;
  group.add(pipeUp);
  const pipeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 6), pipeMat);
  pipeJoint.position.set(-2.55, 5.6, -0.6);
  group.add(pipeJoint);
  const pipeOut = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.9, 8), pipeMat);
  pipeOut.rotation.z = Math.PI / 2;
  pipeOut.position.set(-3.0, 5.6, -0.6);
  group.add(pipeOut);

  // --- Rauch -------------------------------------------------------------------------
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

  // --- Meltdown: Absperrband, Kühlnebel ----------------------------------------------
  const meltdownGroup = new THREE.Group();
  meltdownGroup.visible = false;
  group.add(meltdownGroup);
  const tapeGeo = new THREE.BoxGeometry(0.62, 0.16, 0.05);
  const tapeMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
  const tape = new THREE.InstancedMesh(tapeGeo, tapeMat, TAPE_SEGMENTS);
  const tapeR = 4.1;
  const tapeColor = new THREE.Color();
  for (let i = 0; i < TAPE_SEGMENTS; i += 1) {
    const a = (i / TAPE_SEGMENTS) * Math.PI * 2;
    dummy.position.set(Math.sin(a) * tapeR, 1.35, Math.cos(a) * tapeR);
    dummy.rotation.set(0, a, 0);
    dummy.updateMatrix();
    tape.setMatrixAt(i, dummy.matrix);
    tape.setColorAt(i, tapeColor.setHex(i % 2 ? palette.tapeBlack : palette.tapeYellow));
  }
  meltdownGroup.add(tape);
  const postMat = lambert('steelDark');
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2 + 0.2;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.4, 6), postMat);
    post.position.set(Math.sin(a) * tapeR, 0.7 + 0.9, Math.cos(a) * tapeR);
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

  // --- Events: Blitze, Goldregen, Seifenblasen ---------------------------------------
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

  // --- Zustand ------------------------------------------------------------------------
  const corePosition = new THREE.Vector3(0, 2.0, radiusAt(2.0) + 0.6);
  let lastStage = null;
  let lastMood = null;
  let pulse = 0;
  let flare = 0;
  let emberBurst = 0;

  function applyHeat(stage, mood, p) {
    const meltdown = stage === 'meltdown';
    const fireHex = mood === 'golden' ? p.gold : HEAT_FIRE_COLORS[stage] || HEAT_FIRE_COLORS.cold;
    light.color.setHex(fireHex);
    light.intensity = HEAT_LIGHT_INTENSITY[stage] || 1;

    // Flammenfarben: kalt dunkel, warm gold, heiß orange, kritisch rot, Meltdown aus.
    const core = mood === 'golden' ? p.gold : stage === 'cold' ? 0x9a3412 : stage === 'critical' ? 0xfef08a : p.fireCore;
    const mid = mood === 'golden' ? p.gold : stage === 'cold' ? 0x7c2d12 : stage === 'warm' ? p.gold : stage === 'critical' ? 0xf43f5e : p.fire;
    const outer = stage === 'cold' ? 0x581c0f : stage === 'critical' ? 0xdc2626 : p.ember;
    flameMats.fireCore.color.setHex(core);
    flameMats.fire.color.setHex(mid);
    flameMats.ember.color.setHex(outer);
    flameGroup.visible = !meltdown;
    glowMat.color.setHex(mood === 'golden' ? p.gold : stage === 'critical' ? 0xef4444 : p.fire);
    glowMat.opacity = meltdown ? 0 : stage === 'cold' ? 0.08 : stage === 'warm' ? 0.22 : stage === 'hot' ? 0.4 : 0.6;

    const glow = stage === 'hot' ? 0.18 : stage === 'critical' ? 0.45 : 0;
    paintBricks(p, glow);
    mortarMat.emissive.setHex(p.fire).multiplyScalar(glow * 0.5);

    meltdownGroup.visible = meltdown;
    warnLight.visible = meltdown;
    embers.count = stage === 'hot' ? 10 : stage === 'critical' ? EMBER_MAX : 0;
    smokeMat.color.setHex(mood === 'golden' ? p.gold : meltdown ? 0x64748b : p.smoke);
    smokeMat.opacity = meltdown ? 0.95 : 0.9;
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
      const s = 1 + pulse * 0.05;
      group.scale.set(s, s, s);

      // Flammen: Höhe nach Hitze, Flackern pro Flamme, Stoß beim Tap.
      if (!meltdown) {
        const heightK = 0.35 + heatPct * 0.85 + flare * 0.5;
        flames.forEach((m, i) => {
          const spec = m.userData.spec;
          const fl = reduced ? 1 : 1 + Math.sin(t * spec.speed + i * 1.7) * 0.18 + Math.sin(t * 3.1 + i) * 0.06;
          m.scale.set(0.85 + fl * 0.15, heightK * fl, 0.85 + fl * 0.15);
          m.position.y = (spec.h * heightK * fl) / 2;
          if (!reduced) m.rotation.y += dt * (0.8 + i * 0.3);
        });
        if (!reduced) light.intensity = (HEAT_LIGHT_INTENSITY[heatStage] || 1) * (0.9 + Math.sin(t * 11) * 0.1) + flare * 3;
        glow.scale.setScalar((reduced ? 1 : 1 + Math.sin(t * 9) * 0.05) + flare * 0.25);
      } else if (!reduced) {
        warnLight.visible = Math.sin(t * 6) > 0;
        light.intensity = warnLight.visible ? 2.5 : 0.3;
        light.color.setHex(p.warnRed);
      }

      // Funken: Bogenflug aus dem Ofenmund nach vorne oben.
      const emberTarget = meltdown ? 0 : Math.max(embers.count, emberBurst > 0 ? EMBER_MAX : 0);
      const emberVisible = emberBurst > 0 ? EMBER_MAX : embers.count;
      if (emberVisible > 0 && emberTarget >= 0) {
        const speed = reduced ? 0 : 0.9;
        for (let i = 0; i < emberVisible; i += 1) {
          emberPhase[i] = (emberPhase[i] + dt * speed * (0.7 + hash01(i + 50) * 0.6)) % 1;
          const ph = emberPhase[i];
          const spread = Math.sin(emberSeed[i]) * 0.9;
          dummy.position.set(
            spread * ph * 1.4,
            BODY_BOTTOM_Y + 0.6 + ph * 3.2 - ph * ph * 2.2,
            radiusAt(2.0) + 0.3 + ph * 2.4
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

      // Rauch: Stufe 0..7, mehr, größer und höher mit jeder Stufe. Bei Bubble-Burn
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
          dummy.position.set(Math.sin(smokeSeed[i] + ph * 3) * (0.5 + ph * 2.5), SMOKE_START_Y + ph * 9, Math.cos(smokeSeed[i] + ph * 2) * (0.5 + ph * 2.5));
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
            Math.sin(smokeSeed[i] + ph * 5) * drift,
            SMOKE_START_Y + ph * rise,
            Math.cos(smokeSeed[i] * 1.3 + ph * 4) * drift
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
          const r = 3.2 + ph * 3.5;
          dummy.position.set(Math.sin(mistSeed[i]) * r, 1.0 + ph * 1.2, Math.cos(mistSeed[i]) * r);
          dummy.scale.setScalar(0.6 + ph * 1.2);
          dummy.rotation.set(ph, mistSeed[i], 0);
          dummy.updateMatrix();
          mist.setMatrixAt(i, dummy.matrix);
        }
        mist.instanceMatrix.needsUpdate = true;
      }

      // Power Surge: türkise Blitze zucken um den Schlot, alle 80 ms neu gewürfelt.
      if (mood === 'surge') {
        boltTimer -= dt;
        if (boltTimer <= 0 || bolts.count === 0) {
          boltTimer = reduced ? 1 : 0.08;
          const n = 6 + Math.floor(hash01(Math.floor(t * 12)) * 4);
          for (let i = 0; i < n; i += 1) {
            const a = hash01(i * 3 + Math.floor(t * 12)) * Math.PI * 2;
            const r = 2.2 + hash01(i * 5 + Math.floor(t * 12)) * 1.4;
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
    // (Fortsetzung update: Events) siehe updateEvents unten
    applyPalette(p) {
      Object.entries(mats).forEach(([key, list]) => list.forEach((m) => m.color.setHex(p[key])));
      coinMat.color.setHex(p.gold);
      boltMat.color.setHex(p.neon);
      emberMat.color.setHex(p.ember);
      warnMat.color.setHex(p.warnRed);
      mistMat.color.setHex(p.mist);
      for (let i = 0; i < TAPE_SEGMENTS; i += 1) {
        tape.setColorAt(i, tapeColor.setHex(i % 2 ? p.tapeBlack : p.tapeYellow));
      }
      tape.instanceColor.needsUpdate = true;
      lastStage = null; // erzwingt applyHeat (inkl. Ziegelfarben) mit neuer Palette
    },
  };
}
