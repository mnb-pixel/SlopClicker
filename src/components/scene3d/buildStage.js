import * as THREE from 'three';
import { createPeople } from './buildPeople';

// Bühne und Presse (Zone "stage"): Keynote-Podeste mit leuchtender Rückwand und Pult,
// Scheinwerfer auf Traversen, Thought Leader mit Krawatte und Mikrofon, Journalisten
// mit Kamera und Blitz, ein Sendemast mit Schüssel und Lobbyisten mit Aktenkoffer -
// jede dieser vier Engines auf eigenen, WACHSENDEN Grundstücken (siehe
// utils/campusLayout.js), jede in ihrer eigenen Reihe. Ist ein Podest voll besetzt
// bzw. ein Sendemast gebaut, entsteht das nächste Grundstück nebenan: mehr Keynote-
// Stufen bedeuten mehr eigene kleine Bühnen statt einer, die endlos wächst. Pitch-
// Deck-Blätter bleiben frei über der ganzen Zone kreisende Requisiten ohne eigenes
// Grundstück, wie zuvor.

const STAGE_MAX = 6;
const LEADER_MAX = 24;
const JOURNALIST_MAX = 24;
const PAPER_MAX = 14;
const LOBBY_MAX = 6;

function hash01(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Personen pro Bühnen-Grundstück (Thought Leader) bzw. Presse-Grundstück (Journalist),
// relativ zur Grundstücksmitte. Vier pro Grundstück, wie die Arbeitsplätze im Büro.
const CROWD_OFFSETS = [
  { x: -0.8, z: -0.6 }, { x: 0.8, z: -0.6 },
  { x: -0.8, z: 0.6 }, { x: 0.8, z: 0.6 },
];

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

  // --- Bühnen (eine pro Grundstück, verkleinert damit sie in ein Grundstück passt) ---
  // Platform 3.2 x 1.8 statt vormals 4.4 x 2.4 - etwa 25% kleiner, passt damit in
  // LOT_SIZE 3.6 statt die ganze Zone zu belegen.
  const stagePlatform = inst(new THREE.BoxGeometry(3.2, 0.4, 1.8), lambert('stageFloor'), STAGE_MAX);
  const stageWall = inst(new THREE.BoxGeometry(3.0, 1.5, 0.14), lambert('monitor'), STAGE_MAX);
  const stageScreen = inst(new THREE.PlaneGeometry(2.75, 1.25), basic('screen'), STAGE_MAX, false);
  const bars = inst(new THREE.BoxGeometry(0.22, 1, 0.05), lambert('gold'), STAGE_MAX * 5, false);
  const lectern = inst(new THREE.BoxGeometry(0.38, 0.75, 0.32), lambert('desk'), STAGE_MAX);

  // Scheinwerfer: ein Paar pro Bühnen-Grundstück (Mast, Kopf, Lichtkegel).
  const spotPole = inst(new THREE.CylinderGeometry(0.05, 0.06, 2.6, 5), lambert('steelDark'), STAGE_MAX * 2, false);
  const spotHead = inst(new THREE.CylinderGeometry(0.1, 0.16, 0.24, 6), lambert('steelDark'), STAGE_MAX * 2, false);
  const spotBeam = inst(
    new THREE.ConeGeometry(0.65, 2.3, 8, 1, true),
    basic('spot', { transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }),
    STAGE_MAX * 2,
    false
  );

  // --- Personen ------------------------------------------------------------------------
  const people = createPeople(group, palette, LEADER_MAX + JOURNALIST_MAX + LOBBY_MAX);
  const tie = inst(new THREE.BoxGeometry(0.07, 0.3, 0.03), lambert('tie'), LEADER_MAX, false);
  const mic = inst(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 5), lambert('camera'), LEADER_MAX, false);
  const camera = inst(new THREE.BoxGeometry(0.22, 0.16, 0.26), lambert('camera'), JOURNALIST_MAX, false);
  const flash = inst(new THREE.SphereGeometry(0.16, 6, 5), basic('paper'), JOURNALIST_MAX, false);
  const briefcase = inst(new THREE.BoxGeometry(0.3, 0.24, 0.1), lambert('deskDark'), LOBBY_MAX, false);

  // Pitch-Deck-Blätter: frei über der ganzen (gewachsenen) Zone, kein Grundstück.
  const paper = inst(new THREE.BoxGeometry(0.34, 0.01, 0.46), lambert('paper'), PAPER_MAX, false);

  // --- Sendemast (ein Mast pro Lobbyisten-Grundstück) -----------------------------------
  const mastBase = inst(new THREE.CylinderGeometry(0.4, 0.56, 0.32, 8), lambert('stoneDark'), LOBBY_MAX);
  const mastSeg = inst(new THREE.CylinderGeometry(0.1, 0.15, 1.0, 4), lambert('steel'), LOBBY_MAX * 3, false);
  const mastCross = inst(new THREE.BoxGeometry(0.6, 0.05, 0.05), lambert('steelDark'), LOBBY_MAX * 3, false);
  const dish = inst(new THREE.SphereGeometry(0.4, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.4), lambert('facade'), LOBBY_MAX, false);
  const beacon = inst(new THREE.SphereGeometry(0.09, 6, 5), basic('warnRed'), LOBBY_MAX, false);
  const wave = inst(new THREE.TorusGeometry(0.3, 0.025, 4, 16), basic('token', { transparent: true, opacity: 0.6 }), LOBBY_MAX * 3, false);

  let placedKey = null;
  let stageLots = [];
  let leaderUnits = []; // { x, z, seed }
  let journalistUnits = [];
  let mastLots = [];

  function placeStages(lots, n) {
    stageLots = [];
    for (let i = 0; i < n; i += 1) {
      const lot = lots[i];
      stageLots.push(lot);
      dummy.position.set(lot.lx, 0.2, lot.lz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      stagePlatform.setMatrixAt(i, dummy.matrix);
      dummy.position.set(lot.lx, 1.15, lot.lz - 0.8);
      dummy.updateMatrix();
      stageWall.setMatrixAt(i, dummy.matrix);
      dummy.position.set(lot.lx, 1.18, lot.lz - 0.73);
      dummy.updateMatrix();
      stageScreen.setMatrixAt(i, dummy.matrix);
      dummy.position.set(lot.lx + 0.15, 0.72, lot.lz + 0.35);
      dummy.updateMatrix();
      lectern.setMatrixAt(i, dummy.matrix);
      for (let b = 0; b < 5; b += 1) {
        const h = 0.25 + b * 0.16;
        dummy.position.set(lot.lx - 1.0 + b * 0.4, 0.6 + h / 2, lot.lz - 0.72);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, h, 1);
        dummy.updateMatrix();
        bars.setMatrixAt(i * 5 + b, dummy.matrix);
      }
      [-1.1, 1.1].forEach((sx, si) => {
        const idx = i * 2 + si;
        dummy.position.set(lot.lx + sx, 1.3, lot.lz - 1.4);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        spotPole.setMatrixAt(idx, dummy.matrix);
      });
    }
    stagePlatform.count = n;
    stageWall.count = n;
    stageScreen.count = n;
    lectern.count = n;
    bars.count = n * 5;
    spotPole.count = n * 2;
    spotHead.count = n * 2;
    spotBeam.count = n * 2;
  }

  // Vier Personen je Grundstück, egal ob Thought Leader oder Journalist - die beiden
  // Helfer sind identisch bis auf die Ausrichtung (Leader schaut Richtung Presse,
  // Journalist Richtung Bühne).
  function placeCrowd(lots, n, yaw) {
    const units = [];
    let idx = 0;
    for (let li = 0; li < lots.length && idx < n; li += 1) {
      const lot = lots[li];
      for (let s = 0; s < CROWD_OFFSETS.length && idx < n; s += 1, idx += 1) {
        const o = CROWD_OFFSETS[s];
        units.push({ x: lot.lx + o.x, z: lot.lz + o.z, seed: idx, yaw });
      }
    }
    return units;
  }

  function placeMasts(lots, n) {
    mastLots = [];
    for (let i = 0; i < n; i += 1) {
      const lot = lots[i];
      mastLots.push(lot);
      dummy.position.set(lot.lx, 0.16, lot.lz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mastBase.setMatrixAt(i, dummy.matrix);
      [0.9, 1.7, 2.4].forEach((y, si) => {
        const segIdx = i * 3 + si;
        const r = 0.12 - si * 0.025;
        dummy.position.set(lot.lx, y, lot.lz);
        dummy.rotation.set(0, Math.PI / 4, 0);
        dummy.scale.set(r / 0.1, 1, r / 0.1);
        dummy.updateMatrix();
        mastSeg.setMatrixAt(segIdx, dummy.matrix);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1 - si * 0.15, 1, 1);
        dummy.position.set(lot.lx, y - 0.35, lot.lz);
        dummy.updateMatrix();
        mastCross.setMatrixAt(segIdx, dummy.matrix);
      });
      dummy.position.set(lot.lx + 0.25, 2.85, lot.lz + 0.25);
      dummy.rotation.set(-1.2, 0.8, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      dish.setMatrixAt(i, dummy.matrix);
      dummy.position.set(lot.lx, 3.1, lot.lz);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      beacon.setMatrixAt(i, dummy.matrix);
    }
    mastBase.count = n;
    mastSeg.count = n * 3;
    mastCross.count = n * 3;
    dish.count = n;
    beacon.count = n;
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
      const lotsFor = (id) => (zone.lots || []).filter((l) => l.id === id);
      const key = `${counts.stage}|${counts.leader}|${counts.journalist}|${counts.paper}|${counts.lobby}|${(zone.lots || []).length}`;
      if (key !== placedKey) {
        placeStages(lotsFor('keynote_stage'), counts.stage);
        leaderUnits = placeCrowd(lotsFor('thought_leader'), counts.leader, Math.PI * 0.5);
        journalistUnits = placeCrowd(lotsFor('hype_journalist'), counts.journalist, Math.PI);
        placeMasts(lotsFor('lobbyist'), counts.lobby);
        [stagePlatform, stageWall, stageScreen, lectern, bars, mastBase, mastSeg, mastCross, dish, beacon].forEach((m) => {
          m.instanceMatrix.needsUpdate = true;
        });
        placedKey = key;
      }

      // Scheinwerfer schwenken leicht, je Bühne ein Paar.
      for (let i = 0; i < counts.stage; i += 1) {
        const lot = stageLots[i];
        [-1.1, 1.1].forEach((sx, si) => {
          const idx = i * 2 + si;
          const sway = reduced ? 0 : Math.sin(t * 0.8 + idx * 1.3) * 0.22;
          dummy.position.set(lot.lx + sx, 2.75, lot.lz - 1.4);
          dummy.rotation.set(0.9 + sway * 0.3, sway, 0);
          dummy.scale.setScalar(1);
          dummy.updateMatrix();
          spotHead.setMatrixAt(idx, dummy.matrix);
          dummy.position.set(lot.lx + sx + Math.sin(sway) * 1.1, 1.6, lot.lz - 0.5 + sway * 0.3);
          dummy.rotation.set(Math.PI + 0.6, sway, 0);
          dummy.updateMatrix();
          spotBeam.setMatrixAt(idx, dummy.matrix);
        });
      }
      if (counts.stage > 0) {
        spotHead.instanceMatrix.needsUpdate = true;
        spotBeam.instanceMatrix.needsUpdate = true;
      }

      // Personen: Leader gestikulieren zur Presse, Journalisten fotografieren die Bühne.
      let pi = 0;
      for (let i = 0; i < counts.leader; i += 1, pi += 1) {
        const u = leaderUnits[i];
        const gesture = reduced ? 0.6 : 0.5 + Math.max(0, Math.sin(t * 2.2 + i)) * 0.9;
        people.set(pi, u.x, u.z, u.yaw, { seed: u.seed + 20, armL: gesture, armR: 1.3, hoodie: 'hoodieA' }, p);
        tie.setMatrixAt(i, people.composePart(u.x, u.z, u.yaw, 0, 0.72, 0.22, 0.1));
        mic.setMatrixAt(i, people.composePart(u.x, u.z, u.yaw, 0.27, 0.95, 0.25, 0.3));
      }
      for (let i = 0; i < counts.journalist; i += 1, pi += 1) {
        const u = journalistUnits[i];
        people.set(pi, u.x, u.z, u.yaw, { seed: u.seed + 40, armL: 1.4, armR: 1.4 }, p);
        camera.setMatrixAt(i, people.composePart(u.x, u.z, u.yaw, 0, 1.05, 0.25));
        const on = reduced ? false : hash01(i + Math.floor(t * 2.5 + hash01(i) * 7)) > 0.82;
        const k = on ? 1 + (t * 20) % 1 : 0.001;
        partM.copy(people.composePart(u.x, u.z, u.yaw, 0, 1.08, 0.45));
        dummy.position.setFromMatrixPosition(partM);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(k);
        dummy.updateMatrix();
        flash.setMatrixAt(i, dummy.matrix);
      }
      for (let i = 0; i < counts.lobby; i += 1, pi += 1) {
        const lot = mastLots[i];
        const yaw = Math.PI * 0.75;
        const lx = lot.lx - 0.9;
        const lz = lot.lz + 0.9;
        people.set(pi, lx, lz, yaw, { seed: i + 60, armL: 0.1, armR: reduced ? 0.4 : 0.3 + Math.sin(t * 1.5 + i) * 0.15, hoodie: 'hoodieB' }, p);
        briefcase.setMatrixAt(i, people.composePart(lx, lz, yaw, -0.3, 0.45, 0.05));
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

      // Blätter kreisen über der ganzen (gewachsenen) Zone, Mitte folgt dem Zonen-Rechteck.
      const rect = zone.rect;
      const cx = rect ? rect.cx - anchor3d.x : 0;
      const cz = rect ? rect.cz - anchor3d.z : 0;
      const spanR = rect ? Math.max(1.4, Math.min(rect.w, rect.d) * 0.3) : 1.4;
      for (let i = 0; i < counts.paper; i += 1) {
        const a = (reduced ? 0 : t * (0.5 + hash01(i) * 0.4)) + i * 0.9;
        const r = spanR + (i % 4) * 0.5;
        dummy.position.set(cx + Math.cos(a) * r, 2.4 + (i % 3) * 0.5 + Math.sin(a * 2) * 0.3, cz + Math.sin(a) * r * 0.7);
        dummy.rotation.set(Math.sin(a * 3) * 0.6, a, Math.cos(a * 2) * 0.5);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        paper.setMatrixAt(i, dummy.matrix);
      }
      if (counts.paper > 0) paper.instanceMatrix.needsUpdate = true;

      // Sendewellen je Mast.
      if (counts.lobby > 0) {
        for (let i = 0; i < counts.lobby; i += 1) {
          const lot = mastLots[i];
          for (let w = 0; w < 3; w += 1) {
            const ph = reduced ? 0.4 : ((t * 0.6 + w / 3 + i * 0.3) % 1);
            dummy.position.set(lot.lx, 3.1, lot.lz);
            dummy.rotation.set(Math.PI / 2, 0, 0);
            dummy.scale.setScalar(0.3 + ph * 2.2);
            dummy.updateMatrix();
            wave.setMatrixAt(i * 3 + w, dummy.matrix);
          }
        }
        wave.count = counts.lobby * 3;
        wave.instanceMatrix.needsUpdate = true;
        const blink = reduced ? true : Math.sin(t * 4) > 0;
        for (let i = 0; i < counts.lobby; i += 1) {
          const lot = mastLots[i];
          dummy.position.set(lot.lx, 3.1, lot.lz);
          dummy.rotation.set(0, 0, 0);
          dummy.scale.setScalar(blink ? 1 : 0.001);
          dummy.updateMatrix();
          beacon.setMatrixAt(i, dummy.matrix);
        }
        beacon.instanceMatrix.needsUpdate = true;
      } else {
        wave.count = 0;
      }
    },
    applyPalette(p) {
      Object.entries(mats).forEach(([key, list]) => list.forEach((m) => m.color.setHex(p[key])));
      people.applyPalette(p);
      placedKey = null;
    },
  };
}
