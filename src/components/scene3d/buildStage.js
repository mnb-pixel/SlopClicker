import * as THREE from 'three';
import { createPeople } from './buildPeople';

// Bühne und Presse (Zone "stage"): Keynote-Podest mit leuchtender Rückwand und Pult,
// Scheinwerfer auf Traversen, Thought Leader mit Krawatte und Mikrofon, Journalisten
// mit Kamera und Blitz, Pitch-Deck-Blätter, die über der Bühne kreisen, Sendemast mit
// Schüssel und Lobbyisten mit Aktenkoffer.

const STAGE_MAX = 4;
const LEADER_MAX = 10;
const JOURNALIST_MAX = 10;
const PAPER_MAX = 14;
const LOBBY_MAX = 6;

function hash01(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const STAGE_POS = { x: -0.8, z: -1.7 };
const LEADER_SLOTS = [];
for (let i = 0; i < 5; i += 1) LEADER_SLOTS.push({ x: -2.6 + i * 0.9, z: -0.9, y: 0.45 });
for (let i = 0; i < 5; i += 1) LEADER_SLOTS.push({ x: -2.2 + i * 0.9, z: 0.1, y: 0 });
const JOURNALIST_SLOTS = [];
for (let r = 0; r < 2; r += 1) for (let c = 0; c < 5; c += 1) JOURNALIST_SLOTS.push({ x: -3.0 + c * 0.9 + (r % 2) * 0.4, z: 1.4 + r * 0.9 });
const MAST = { x: 3.0, z: -2.4 };
const LOBBY_SLOTS = [];
for (let i = 0; i < LOBBY_MAX; i += 1) {
  const a = 0.3 + (i / LOBBY_MAX) * Math.PI * 1.2;
  LOBBY_SLOTS.push({ x: MAST.x - Math.cos(a) * 1.4, z: MAST.z + Math.sin(a) * 1.4 });
}

export function buildStage(palette, zoneDef) {
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
  const partM = new THREE.Matrix4();

  // --- Bühne -------------------------------------------------------------------------
  const stageGroup = new THREE.Group();
  group.add(stageGroup);
  const platform = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.45, 2.4), lambert('stageFloor'));
  platform.position.set(STAGE_POS.x, 0.22, STAGE_POS.z);
  platform.castShadow = true;
  platform.receiveShadow = true;
  stageGroup.add(platform);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.9, 0.16), lambert('monitor'));
  wall.position.set(STAGE_POS.x, 1.4, STAGE_POS.z - 1.1);
  wall.castShadow = true;
  stageGroup.add(wall);
  const screenMat = basic('screen');
  const wallScreen = new THREE.Mesh(new THREE.PlaneGeometry(3.9, 1.6), screenMat);
  wallScreen.position.set(STAGE_POS.x, 1.45, STAGE_POS.z - 1.01);
  stageGroup.add(wallScreen);
  // Balkendiagramm auf der Rückwand, das immer nur nach oben zeigt.
  const bars = inst(new THREE.BoxGeometry(0.3, 1, 0.05), lambert('gold'), 6, false);
  const lectern = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.95, 0.4), lambert('desk'));
  lectern.position.set(STAGE_POS.x + 0.2, 0.92, STAGE_POS.z + 0.5);
  stageGroup.add(lectern);

  // Scheinwerfer: Mast, Kopf, Lichtkegel
  const spotPole = inst(new THREE.CylinderGeometry(0.05, 0.06, 3.4, 5), lambert('steelDark'), STAGE_MAX, false);
  const spotHead = inst(new THREE.CylinderGeometry(0.12, 0.2, 0.3, 6), lambert('steelDark'), STAGE_MAX, false);
  const spotBeam = inst(
    new THREE.ConeGeometry(0.9, 3.2, 8, 1, true),
    basic('spot', { transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }),
    STAGE_MAX,
    false
  );
  const SPOT_X = [-2.7, -1.4, 0.0, 1.3];

  // --- Personen ------------------------------------------------------------------------
  const people = createPeople(group, palette, LEADER_MAX + JOURNALIST_MAX + LOBBY_MAX);
  const tie = inst(new THREE.BoxGeometry(0.07, 0.3, 0.03), lambert('tie'), LEADER_MAX, false);
  const mic = inst(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 5), lambert('camera'), LEADER_MAX, false);
  const camera = inst(new THREE.BoxGeometry(0.22, 0.16, 0.26), lambert('camera'), JOURNALIST_MAX, false);
  const flash = inst(new THREE.SphereGeometry(0.16, 6, 5), basic('paper'), JOURNALIST_MAX, false);
  const briefcase = inst(new THREE.BoxGeometry(0.3, 0.24, 0.1), lambert('deskDark'), LOBBY_MAX, false);

  // Pitch-Deck-Blätter
  const paper = inst(new THREE.BoxGeometry(0.34, 0.01, 0.46), lambert('paper'), PAPER_MAX, false);

  // --- Sendemast ---------------------------------------------------------------------
  const mastGroup = new THREE.Group();
  group.add(mastGroup);
  const mastBase = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 0.4, 8), lambert('stoneDark'));
  mastBase.position.set(MAST.x, 0.2, MAST.z);
  mastGroup.add(mastBase);
  [1.4, 2.6, 3.7].forEach((y, i) => {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.16 - i * 0.03, 0.22 - i * 0.03, 1.25, 4), lambert('steel'));
    seg.position.set(MAST.x, y, MAST.z);
    seg.rotation.y = Math.PI / 4;
    seg.castShadow = true;
    mastGroup.add(seg);
    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.9 - i * 0.2, 0.05, 0.05), lambert('steelDark'));
    cross.position.set(MAST.x, y - 0.5, MAST.z);
    mastGroup.add(cross);
  });
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.4), lambert('facade'));
  dish.position.set(MAST.x + 0.35, 3.3, MAST.z + 0.35);
  dish.rotation.set(-1.2, 0.8, 0);
  mastGroup.add(dish);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 5), basic('warnRed'));
  beacon.position.set(MAST.x, 4.45, MAST.z);
  mastGroup.add(beacon);
  // Sendewellen: drei Ringe, die vom Mast aus wachsen
  const wave = inst(new THREE.TorusGeometry(0.4, 0.03, 4, 16), basic('token', { transparent: true, opacity: 0.6 }), 3, false);

  let placed = null;

  function layout(counts) {
    stageGroup.visible = counts.stage > 0;
    bars.count = counts.stage > 0 ? 6 : 0;
    for (let i = 0; i < 6; i += 1) {
      const h = 0.3 + i * 0.22;
      dummy.position.set(STAGE_POS.x - 1.4 + i * 0.55, 0.75 + h / 2, STAGE_POS.z - 0.98);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, h, 1);
      dummy.updateMatrix();
      bars.setMatrixAt(i, dummy.matrix);
    }
    bars.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < counts.stage; i += 1) {
      dummy.position.set(SPOT_X[i], 1.7, STAGE_POS.z - 1.8);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      spotPole.setMatrixAt(i, dummy.matrix);
    }
    spotPole.count = counts.stage;
    spotHead.count = counts.stage;
    spotBeam.count = counts.stage;
    spotPole.instanceMatrix.needsUpdate = true;
    paper.count = counts.paper;
    mastGroup.visible = counts.lobby > 0;
    wave.count = counts.lobby > 0 ? 3 : 0;
  }

  return {
    group,
    update(zone, ctx, p) {
      const { t, reduced } = ctx;
      const c = (id) => {
        const b = zone.buildings.find((x) => x.id === id);
        return b ? b.props : 0;
      };
      const counts = {
        stage: Math.min(STAGE_MAX, c('keynote_stage')),
        leader: Math.min(LEADER_MAX, c('thought_leader')),
        journalist: Math.min(JOURNALIST_MAX, c('hype_journalist')),
        paper: Math.min(PAPER_MAX, c('pitch_deck')),
        lobby: Math.min(LOBBY_MAX, c('lobbyist')),
      };
      const key = `${counts.stage}|${counts.leader}|${counts.journalist}|${counts.paper}|${counts.lobby}`;
      if (key !== placed) {
        layout(counts);
        placed = key;
      }

      // Scheinwerfer schwenken leicht
      for (let i = 0; i < counts.stage; i += 1) {
        const sway = reduced ? 0 : Math.sin(t * 0.8 + i * 1.3) * 0.25;
        dummy.position.set(SPOT_X[i], 3.35, STAGE_POS.z - 1.8);
        dummy.rotation.set(0.9 + sway * 0.3, sway, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        spotHead.setMatrixAt(i, dummy.matrix);
        // Kegel hängt am Kopf, Spitze oben
        dummy.position.set(SPOT_X[i] + Math.sin(sway) * 1.4, 1.9, STAGE_POS.z - 0.3 + sway * 0.4);
        dummy.rotation.set(Math.PI + 0.6, sway, 0);
        dummy.updateMatrix();
        spotBeam.setMatrixAt(i, dummy.matrix);
      }
      if (counts.stage > 0) {
        spotHead.instanceMatrix.needsUpdate = true;
        spotBeam.instanceMatrix.needsUpdate = true;
      }

      // Personen
      let pi = 0;
      for (let i = 0; i < counts.leader; i += 1, pi += 1) {
        const s = LEADER_SLOTS[i];
        const yaw = Math.PI * 0.5; // zur Presse und Kamera hin
        const gesture = reduced ? 0.6 : 0.5 + Math.max(0, Math.sin(t * 2.2 + i)) * 0.9;
        const lift = s.y; // vordere Reihe steht auf der Bühne
        people.set(pi, s.x, s.z, yaw, { seed: i + 20, armL: gesture, armR: 1.3, hoodie: 'hoodieA', lift }, p);
        tie.setMatrixAt(i, people.composePart(s.x, s.z, yaw, 0, 0.72 + lift, 0.22, 0.1));
        mic.setMatrixAt(i, people.composePart(s.x, s.z, yaw, 0.27, 0.95 + lift, 0.25, 0.3));
      }
      for (let i = 0; i < counts.journalist; i += 1, pi += 1) {
        const s = JOURNALIST_SLOTS[i];
        const yaw = Math.PI; // schaut zur Bühne (-z)
        people.set(pi, s.x, s.z, yaw, { seed: i + 40, armL: 1.4, armR: 1.4 }, p);
        camera.setMatrixAt(i, people.composePart(s.x, s.z, yaw, 0, 1.05, 0.25));
        // Blitz: kurzer Aufblitz, zufällig verteilt
        const on = reduced ? false : hash01(i + Math.floor(t * 2.5 + hash01(i) * 7)) > 0.82;
        const k = on ? 1 + (t * 20) % 1 : 0.001;
        partM.copy(people.composePart(s.x, s.z, yaw, 0, 1.08, 0.45));
        dummy.position.setFromMatrixPosition(partM);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(k);
        dummy.updateMatrix();
        flash.setMatrixAt(i, dummy.matrix);
      }
      for (let i = 0; i < counts.lobby; i += 1, pi += 1) {
        const s = LOBBY_SLOTS[i];
        const yaw = Math.atan2(MAST.x - s.x, MAST.z - s.z);
        people.set(pi, s.x, s.z, yaw, { seed: i + 60, armL: 0.1, armR: reduced ? 0.4 : 0.3 + Math.sin(t * 1.5 + i) * 0.15, hoodie: 'hoodieB' }, p);
        briefcase.setMatrixAt(i, people.composePart(s.x, s.z, yaw, -0.3, 0.45, 0.05));
      }
      people.commit(pi);
      tie.count = counts.leader;
      mic.count = counts.leader;
      camera.count = counts.journalist;
      flash.count = counts.journalist;
      briefcase.count = counts.lobby;
      [tie, mic, camera, flash, briefcase].forEach((m) => {
        m.instanceMatrix.needsUpdate = true;
      });

      // Blätter kreisen über der Bühne
      for (let i = 0; i < counts.paper; i += 1) {
        const a = (reduced ? 0 : t * (0.5 + hash01(i) * 0.4)) + i * 0.9;
        const r = 1.4 + (i % 4) * 0.5;
        dummy.position.set(STAGE_POS.x + Math.cos(a) * r, 2.4 + (i % 3) * 0.5 + Math.sin(a * 2) * 0.3, STAGE_POS.z + 0.4 + Math.sin(a) * r * 0.7);
        dummy.rotation.set(Math.sin(a * 3) * 0.6, a, Math.cos(a * 2) * 0.5);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        paper.setMatrixAt(i, dummy.matrix);
      }
      if (counts.paper > 0) paper.instanceMatrix.needsUpdate = true;

      // Sendewellen
      if (counts.lobby > 0) {
        for (let i = 0; i < 3; i += 1) {
          const ph = reduced ? 0.4 : ((t * 0.6 + i / 3) % 1);
          dummy.position.set(MAST.x, 4.45, MAST.z);
          dummy.rotation.set(Math.PI / 2, 0, 0);
          dummy.scale.setScalar(0.4 + ph * 3.0);
          dummy.updateMatrix();
          wave.setMatrixAt(i, dummy.matrix);
        }
        wave.instanceMatrix.needsUpdate = true;
        beacon.visible = reduced ? true : Math.sin(t * 4) > 0;
      }
    },
    applyPalette(p) {
      Object.entries(mats).forEach(([key, list]) => list.forEach((m) => m.color.setHex(p[key])));
      people.applyPalette(p);
      placed = null;
    },
  };
}
