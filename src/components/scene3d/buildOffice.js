import * as THREE from 'three';
import { buildDataLine, defaultLineRoute } from './buildDataLine';
import { buildLotShells } from './buildLotShells';
import { tierMix } from './tierVisuals';
import { createVoxelKit } from './voxelModel';
import { PERSON_UNIT, PERSON_ARM_ORIGIN, personTorso, personHead, personHair, personArm } from './voxelLibrary';

// Großraumbüro (Zone "office"): Praktikanten und Prompt Engineers sitzen an schäbigen
// Schreibtischen und tippen - seit dem Grundstücks-Umbau nicht mehr frei auf der Wiese,
// sondern IN Häusern. Vier Arbeitsplätze passen in ein Haus; ist es voll, entsteht das
// nächste nebenan; nach vier bzw. drei Häusern beginnt eine neue Reihe, sodass jede
// Engine als eigenes Viertel wächst (siehe utils/campusLayout.js). Vom Büro führt weiter eine Datenleitung zum Ofen, durch die
// Tokens rasen; Chatbot-Widgets schweben als Sprechblasen über den Dächern.
//
// Jede Teilesorte (Schreibtisch, Monitor, Tastatur, Maus, Rechner, Stuhl, Körper, Kopf,
// Frisur, Arme, Tasse, Papier, Blase, Token) ist EIN InstancedMesh mit einem Voxel-
// Modell als Geometrie (siehe voxelModel.js, Raster 0,05): Schubladen mit Griffen,
// Monitore mit Bildschirminhalt und Logo auf der Rückseite, Tastaturen mit Tasten,
// Bürostühle mit Fußkreuz. Statische Teile werden nur bei geänderter Anzahl neu gesetzt,
// pro Frame bewegen sich nur Arme, Köpfe, Blasen, Tokens und das Deckenlicht.

const INTERN_MAX = 200;
const ENGINEER_MAX = 160;
const INTERN_LOTS_MAX = 50;
const ENGINEER_LOTS_MAX = 40;
const WIDGET_MAX = 40;
const UNIT_YAW = Math.PI / 4; // Tische schauen zur offenen Hausecke (+x,+z) und damit zur Kamera
// Arbeitsplätze sind kleiner als früher: sie stehen jetzt in einem Haus von 3,3
// Einheiten Kantenlänge, in Originalgröße passte kein Vierer-Block hinein.
const UNIT_SCALE = 0.68;
const LOT_SIZE = 3.3;
const WALL_H = 2.0;

// Vier Arbeitsplätze je Haus, relativ zur Hausmitte.
const DESK_OFFSETS = [
  { x: -0.75, z: -0.75 },
  { x: 0.75, z: -0.75 },
  { x: -0.75, z: 0.75 },
  { x: 0.75, z: 0.75 },
];
const DESKS_PER_LOT = DESK_OFFSETS.length;

function hash01(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function buildOffice(palette, zoneDef, furnaceAnchor) {
  const group = new THREE.Group();
  const { anchor3d } = zoneDef;
  group.position.set(anchor3d.x, 0.3, anchor3d.z);

  const mats = {};
  const basic = (key, extra = {}) => {
    const m = new THREE.MeshBasicMaterial({ color: palette[key], ...extra });
    (mats[key] = mats[key] || []).push(m);
    return m;
  };

  const TOTAL = INTERN_MAX + ENGINEER_MAX;
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

  // --- Häuser ------------------------------------------------------------------------
  const internShells = buildLotShells(palette, {
    max: INTERN_LOTS_MAX,
    size: LOT_SIZE,
    height: WALL_H,
    accentKey: 'screen',
  });
  group.add(internShells.group);
  const engineerShells = buildLotShells(palette, {
    max: ENGINEER_LOTS_MAX,
    size: LOT_SIZE,
    height: WALL_H,
    accentKey: 'token',
  });
  group.add(engineerShells.group);

  // --- Voxel-Modelle -------------------------------------------------------------------
  // Lokales System je Arbeitsplatz: Person schaut nach +z, Tischplatte bei y = 0,8.
  const kit = createVoxelKit(palette);
  const U = 0.05;
  const vox = (build, opts = {}) => kit.geo(build, { unit: U, ...opts });
  const instV = (geo, count, shadow = true) => inst(geo, kit.mats, count, shadow);

  const deskGeo = vox((m) => {
    m.box(-13, 14, -7, 27, 2, 14, 'desk', { noise: 0.05, seed: 3 });
    // Schubladenblock rechts, Fronten zur Person (-z), Griffe aus Stahl
    m.box(7, 0, -6, 6, 14, 12, 'deskDark');
    [2, 6, 10].forEach((y) => {
      m.box(8, y, -7, 4, 3, 1, 'desk');
      m.set(9, y + 1, -8, 'steel');
      m.set(10, y + 1, -8, 'steel');
    });
    // Seitenwange links, Rückwand zur Kamera mit hellem Streifen
    m.box(-13, 0, -6, 2, 14, 12, 'deskLeg');
    m.box(-11, 3, 6, 18, 11, 1, 'deskDark');
    m.box(-11, 12, 6, 18, 1, 1, 'deskLeg');
  });
  const monitorGeo = vox((m) => {
    m.box(-3, 0, -2, 6, 1, 4, 'deskLeg');
    m.box(-1, 1, -1, 2, 3, 2, 'deskLeg');
    m.box(-5, 4, 0, 11, 8, 1, 'monitor');
    // Bildschirm zur Person (-z): Titelleiste dunkler, Textzeilen heller
    m.box(-4, 5, -1, 9, 6, 1, 'screen');
    for (let x = -4; x <= 4; x += 1) m.set(x, 10, -1, 'screen', 0.7);
    for (let y = 6; y <= 9; y += 1) {
      for (let x = -3; x <= 2; x += 1) if ((x + y * 2) % 3 !== 0) m.set(x, y, -1, 'screen', 1.18);
    }
    // Rückseite zur Kamera: Logo und Kabel
    m.set(0, 8, 1, 'steel');
    m.box(0, 4, 1, 1, 2, 1, 'tapeBlack');
  }, { unlit: new Set(['screen']) });
  const keyboardGeo = vox((m) => {
    m.box(-5, 0, -2, 10, 1, 4, 'deskDark');
    for (let x = -4; x <= 3; x += 1) {
      for (let z = -1; z <= 0; z += 1) m.set(x, 1, z, 'steel', (x + z) % 2 ? 0.88 : 1.04);
    }
    m.box(-2, 1, 1, 4, 1, 1, 'steel', { noise: 0 });
  });
  const mouseGeo = vox((m) => {
    m.box(-1, 0, -1, 2, 2, 3, 'deskDark');
    m.set(-1, 1, 1, 'steel');
    m.set(0, 1, 1, 'steel');
  });
  const pcGeo = vox((m) => {
    m.box(-2, 0, -4, 4, 9, 9, 'monitor');
    for (let y = 1; y <= 7; y += 2) {
      for (let z = -3; z <= 3; z += 1) m.set(2, y, z, 'monitor', 0.55);
    }
    m.set(-1, 7, -5, 'neon');
    m.set(0, 7, -5, 'steel');
    m.set(1, 2, -5, 'steel', 0.7);
  }, { unlit: new Set(['neon']) });
  const chairGeo = vox((m) => {
    // Fußkreuz mit Rollen, Säule, Sitz, Lehne (hinten, -z), Armlehnen
    m.box(-4, 0, -1, 9, 1, 3, 'deskLeg');
    m.box(-1, 0, -4, 3, 1, 9, 'deskLeg');
    [[-4, 0], [4, 0], [0, -4], [0, 4]].forEach(([x, z]) => m.set(x, 0, z, 'tapeBlack'));
    m.box(-1, 1, -1, 2, 7, 2, 'deskLeg');
    m.box(-5, 8, -5, 10, 2, 10, 'chair');
    for (let x = -5; x <= 4; x += 1) m.set(x, 9, -1, 'chair', 0.85);
    m.box(-5, 10, -5, 10, 10, 2, 'chair');
    for (let x = -5; x <= 4; x += 1) m.set(x, 14, -3, 'chair', 0.85);
    m.box(-7, 12, -3, 2, 1, 6, 'chair', { noise: 0 });
    m.box(5, 12, -3, 2, 1, 6, 'chair', { noise: 0 });
    m.box(-7, 8, -1, 2, 4, 2, 'deskLeg');
    m.box(5, 8, -1, 2, 4, 2, 'deskLeg');
  });
  const cupGeo = vox((m) => {
    m.cylinder(0, 0, 0, 4, 1.6, 'cup');
    m.set(2, 1, 0, 'cup');
    m.set(2, 2, 0, 'cup');
    [[0, 0], [-1, 0], [0, -1], [-1, -1]].forEach(([x, z]) => m.set(x, 3, z, 0x5b3a1e));
  });
  const paperGeo = vox((m) => {
    m.box(-3, 0, -4, 6, 1, 8, 'paper');
    [-2, 0, 2].forEach((z) => {
      for (let x = -2; x <= 1; x += 1) m.set(x, 0, z, 'paper', 0.78);
    });
  });
  const bubbleGeo = vox((m) => {
    m.box(-7, 0, 0, 14, 9, 2, 'bubble');
    [[-7, 0], [6, 0], [-7, 8], [6, 8]].forEach(([x, y]) => {
      m.remove(x, y, 0);
      m.remove(x, y, 1);
    });
    m.box(-4, -2, 0, 2, 2, 2, 'bubble');
    m.set(-4, -3, 0, 'bubble');
    m.set(-4, -3, 1, 'bubble');
  }, { origin: [0, 4.5, 1] });

  // --- Teile -------------------------------------------------------------------------
  const desk = instV(deskGeo, TOTAL);
  const monitor = instV(monitorGeo, TOTAL + ENGINEER_MAX);
  const keyboard = instV(keyboardGeo, TOTAL, false);
  const mouse = instV(mouseGeo, TOTAL, false);
  const pcTower = instV(pcGeo, TOTAL, false);
  const chair = instV(chairGeo, TOTAL);
  const body = instV(kit.geo(personTorso, { unit: PERSON_UNIT }), TOTAL);
  const head = instV(kit.geo(personHead, { unit: PERSON_UNIT }), TOTAL);
  const hairA = instV(kit.geo((m) => personHair(m, 0), { unit: PERSON_UNIT }), TOTAL, false);
  const hairB = instV(kit.geo((m) => personHair(m, 1), { unit: PERSON_UNIT }), TOTAL, false);
  const arm = instV(kit.geo(personArm, { unit: PERSON_UNIT, origin: PERSON_ARM_ORIGIN }), TOTAL * 2, false);
  const cup = instV(cupGeo, TOTAL, false);
  const paper = instV(paperGeo, TOTAL, false);

  const bubble = instV(bubbleGeo, WIDGET_MAX, false);
  const bubbleDot = inst(new THREE.BoxGeometry(0.1, 0.1, 0.06), basic('token'), WIDGET_MAX * 3, false);

  // Sitzende Person: Oberkörper auf dem Stuhl (Sitzfläche y 0,5), Kopf darüber. Die
  // Hose entfällt - die Beine stecken unter dem Tisch.
  const SIT_TORSO_Y = 0.55;
  const SIT_HEAD_Y = 1.1;
  const SIT_SHOULDER_Y = 1.02;
  const SIT_Z = -0.7;

  // --- Deckenlicht je Haus ------------------------------------------------------------
  // Früher standen zwei freie Neonmasten auf der Wiese. Mit Häusern gehört das Licht
  // unter deren Attika: eine Röhre pro Haus, gemeinsames Material, das flackert.
  const neonMat = basic('screen', { transparent: true, opacity: 0.9 });
  const ceilingLight = inst(new THREE.BoxGeometry(1.9, 0.07, 0.09), neonMat, INTERN_LOTS_MAX + ENGINEER_LOTS_MAX, false);
  let neonFlickerUntil = 0;

  // --- Datenleitung zum Ofen (gemeinsames Modul, siehe buildDataLine.js) ---------
  const route = defaultLineRoute(anchor3d, furnaceAnchor, 1.2);
  const line = buildDataLine(palette, route.points, group.position, route.dir);
  group.add(line.group);

  // --- Sitzplätze setzen (statisch, nur bei Änderung der Anzahl) ---------------------
  const dummy = new THREE.Object3D();
  const unitM = new THREE.Matrix4();
  const partM = new THREE.Matrix4();
  const tmp = new THREE.Object3D();
  const color = new THREE.Color();
  const unitScale = new THREE.Vector3(UNIT_SCALE, UNIT_SCALE, UNIT_SCALE);
  const unitQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), UNIT_YAW);
  const unitPos = new THREE.Vector3();

  // Setzt ein Teil relativ zu einem Sitzplatz. Lokal: Person schaut nach +z.
  // compose() statt makeRotationY().setPosition(): der Arbeitsplatz wird zusätzlich
  // verkleinert (UNIT_SCALE), damit vier davon in ein Haus passen.
  const place = (mesh, index, slot, lx, ly, lz, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    unitPos.set(slot.x, slot.y || 0, slot.z);
    unitM.compose(unitPos, unitQuat, unitScale);
    tmp.position.set(lx, ly, lz);
    tmp.rotation.set(rx, ry, rz);
    tmp.scale.set(sx, sy, sz);
    tmp.updateMatrix();
    partM.multiplyMatrices(unitM, tmp.matrix);
    mesh.setMatrixAt(index, partM);
  };

  let placedKey = null;
  let placedWidgets = -1;
  let lastScreenTier = -1;
  // Ruhelage der Sprechblasen (wird pro Frame nur noch auf und ab gewippt).
  const widgetBase = new Float32Array(WIDGET_MAX);
  const widgetPos = new Float32Array(WIDGET_MAX * 2);
  let units = []; // { slot, isEngineer, seed, absent }

  // Arbeitsplätze eines Hauses: vier Plätze auf der Bodenplatte (y = 0.18).
  function deskSlots(lot) {
    return DESK_OFFSETS.map((o) => ({ x: lot.lx + o.x, y: 0.18, z: lot.lz + o.z }));
  }

  // laidOff: jede dritte Person fehlt (leerer Stuhl), der Tisch bleibt. internTier/
  // engineerTier kommen aus gekauften Upgrades (siehe tierVisuals.js) und heben Hoodie-
  // Farbe sowie Tisch-Zubehör an - dieselbe Stufe für alle Praktikanten bzw. alle
  // Engineers, weil das Upgrade die ganze Engine betrifft, nicht eine einzelne Person.
  function layout(internLots, engineerLots, internCount, engineerCount, p, laidOff, internTier, engineerTier) {
    units = [];
    const fill = (lots, count, isEngineer) => {
      let left = count;
      lots.forEach((lot, li) => {
        const slots = deskSlots(lot);
        for (let k = 0; k < DESKS_PER_LOT && left > 0; k += 1) {
          const seed = (isEngineer ? 100 : 0) + li * DESKS_PER_LOT + k;
          units.push({ slot: slots[k], isEngineer, seed, absent: laidOff && seed % 3 === 1 });
          left -= 1;
        }
      });
    };
    fill(internLots, internCount, false);
    fill(engineerLots, engineerCount, true);

    const n = units.length;
    let monitorIdx = 0;
    let cupIdx = 0;
    let paperIdx = 0;
    units.forEach((u, i) => {
      const { slot, isEngineer, seed } = u;
      const wobble = isEngineer ? 0 : (hash01(seed) - 0.5) * 0.06; // schiefe Praktikanten-Tische
      const wide = isEngineer ? 1.25 : 1;
      place(desk, i, slot, 0, 0, 0, 0, 0, wobble, wide, 1, 1);
      place(keyboard, i, slot, 0, 0.8, -0.14);
      place(mouse, i, slot, 0.34, 0.8, -0.14);
      place(pcTower, i, slot, 0.5 * wide + 0.14, 0, 0.05);
      const monitors = isEngineer ? 2 : 1;
      for (let m = 0; m < monitors; m += 1) {
        const mx = isEngineer ? (m === 0 ? -0.3 : 0.3) : 0;
        const yaw = isEngineer ? (m === 0 ? 0.35 : -0.35) : 0;
        place(monitor, monitorIdx, slot, mx, 0.8, 0.2, 0, yaw);
        monitorIdx += 1;
      }
      place(chair, i, slot, 0, 0, SIT_Z);
      // Person: Oberkörper sitzt auf dem Stuhl, Kopf darüber. Praktikanten hängen etwas
      // (Neigung um den Sitz, Kopf rückt entsprechend nach vorn).
      const slump = isEngineer ? 0 : 0.12;
      const sc = u.absent ? 0.001 : 1;
      place(body, i, slot, 0, SIT_TORSO_Y, SIT_Z, slump, 0, 0, sc, sc, sc);
      const hy = SIT_HEAD_Y - slump * 0.05;
      const hz = SIT_Z + slump * 0.55;
      const variantB = seed % 2 === 1;
      place(head, i, slot, 0, hy, hz, 0, 0, 0, sc, sc, sc);
      place(hairA, i, slot, 0, hy, hz, 0, 0, 0, variantB ? 0.001 : sc, variantB ? 0.001 : sc, variantB ? 0.001 : sc);
      place(hairB, i, slot, 0, hy, hz, 0, 0, 0, variantB ? sc : 0.001, variantB ? sc : 0.001, variantB ? sc : 0.001);
      const tier = isEngineer ? engineerTier : internTier;
      color.setHex(tierMix([p.hoodieA, p.hoodieB, p.hoodieC][seed % 3], p.gold, tier));
      body.setColorAt(i, color);
      // Ab Stufe 2 hat jeder Platz Tasse und Papier - besser ausgestattet statt
      // zufällig, das liest sich als sichtbarer Fortschritt.
      if (tier >= 2 || hash01(seed + 7) > 0.45) {
        place(cup, cupIdx, slot, 0.42, 0.8, -0.06);
        cupIdx += 1;
      }
      if (tier >= 2 || hash01(seed + 13) > 0.5) {
        place(paper, paperIdx, slot, -0.42, 0.8, 0.02, 0, hash01(seed) * 0.6);
        paperIdx += 1;
      }
    });

    desk.count = n;
    keyboard.count = n;
    mouse.count = n;
    pcTower.count = n;
    monitor.count = monitorIdx;
    chair.count = n;
    body.count = n;
    head.count = n;
    hairA.count = n;
    hairB.count = n;
    arm.count = n * 2;
    cup.count = cupIdx;
    paper.count = paperIdx;
    [desk, keyboard, mouse, pcTower, monitor, chair, body, head, hairA, hairB, arm, cup, paper].forEach((m) => {
      m.instanceMatrix.needsUpdate = true;
    });
    if (body.instanceColor) body.instanceColor.needsUpdate = true;

    // Häuser und ihr Deckenlicht.
    internShells.layout(internLots.map((l) => ({ x: l.lx, z: l.lz })));
    engineerShells.layout(engineerLots.map((l) => ({ x: l.lx, z: l.lz })));
    const allLots = [...internLots, ...engineerLots];
    allLots.forEach((lot, i) => {
      dummy.position.set(lot.lx, WALL_H + 0.02, lot.lz);
      dummy.rotation.set(0, UNIT_YAW, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      ceilingLight.setMatrixAt(i, dummy.matrix);
    });
    ceilingLight.count = allLots.length;
    ceilingLight.instanceMatrix.needsUpdate = true;
  }

  function layoutWidgets(count, lots) {
    for (let i = 0; i < count; i += 1) {
      const lot = lots[i % Math.max(1, lots.length)] || { lx: 0, lz: 0 };
      dummy.position.set(lot.lx + ((i % 2) - 0.5) * 1.2, WALL_H + 1.1 + (i % 3) * 0.35, lot.lz + ((i % 3) - 1) * 0.8);
      dummy.rotation.set(0, UNIT_YAW, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      bubble.setMatrixAt(i, dummy.matrix);
      widgetBase[i] = dummy.position.y;
      widgetPos[i * 2] = dummy.position.x;
      widgetPos[i * 2 + 1] = dummy.position.z;
    }
    bubble.count = count;
    bubbleDot.count = count * 3;
    bubble.instanceMatrix.needsUpdate = true;
  }

  return {
    group,
    update(zone, ctx, p) {
      const { dt, t, reduced } = ctx;
      const interns = zone.buildings.find((b) => b.id === 'prompt_intern');
      const engineers = zone.buildings.find((b) => b.id === 'prompt_engineer');
      const widgets = zone.buildings.find((b) => b.id === 'chatbot_widget');
      const internCount = Math.min(INTERN_MAX, interns ? interns.props : 0);
      const engineerCount = Math.min(ENGINEER_MAX, engineers ? engineers.props : 0);
      const widgetCount = Math.min(WIDGET_MAX, widgets ? widgets.props : 0);
      const lots = zone.lots || [];
      const internLots = lots.filter((l) => l.id === 'prompt_intern').slice(0, INTERN_LOTS_MAX);
      const engineerLots = lots.filter((l) => l.id === 'prompt_engineer').slice(0, ENGINEER_LOTS_MAX);

      const laidOff = Boolean(zone.laidOff);
      const internTier = interns ? interns.tier : 0;
      const engineerTier = engineers ? engineers.tier : 0;
      // Ein Schlüssel statt vieler Vergleiche: die Häuser können sich auch bei gleicher
      // Kopfzahl verschieben (neues Grundstück) oder umfärben (neue Sichtstufe), dann
      // muss alles neu gesetzt werden.
      const key = `${internCount}/${engineerCount}/${internLots.length}/${engineerLots.length}/${laidOff}/${internTier}/${engineerTier}`;
      if (key !== placedKey) {
        layout(internLots, engineerLots, internCount, engineerCount, p, laidOff, internTier, engineerTier);
        placedKey = key;
        placedWidgets = -1;
      }
      // Monitore leuchten mit der höheren der beiden Sichtstufen heller/goldener -
      // ein gemeinsames Material für alle Bildschirme, deshalb EINE Stufe fürs ganze Büro.
      const screenTier = Math.max(internTier, engineerTier);
      if (screenTier !== lastScreenTier) {
        lastScreenTier = screenTier;
        const screenHex = tierMix(p.screen, p.gold, screenTier, 0.7);
        kit.recolor(monitorGeo, (k) => (k === 'screen' ? screenHex : undefined));
      }
      if (widgetCount !== placedWidgets) {
        layoutWidgets(widgetCount, internLots.length ? internLots : engineerLots);
        placedWidgets = widgetCount;
      }

      // Tippen: Arme (Drehpunkt Schulter) pendeln gegenläufig über der Tastatur, Kopf
      // nickt minimal.
      const n = units.length;
      for (let i = 0; i < n; i += 1) {
        const { slot, isEngineer, seed, absent } = units[i];
        if (absent) {
          place(arm, i * 2, slot, 0, 0, 0, 0, 0, 0, 0.001, 0.001, 0.001);
          place(arm, i * 2 + 1, slot, 0, 0, 0, 0, 0, 0, 0.001, 0.001, 0.001);
          continue;
        }
        const speed = isEngineer ? 14 : 9 + hash01(seed) * 4;
        const ph = reduced ? 0 : t * speed + seed;
        const lift0 = Math.max(0, Math.sin(ph)) * 0.12;
        const lift1 = Math.max(0, Math.sin(ph + Math.PI)) * 0.12;
        const slump = isEngineer ? 0 : 0.12;
        const sy = SIT_SHOULDER_Y - slump * 0.05;
        const sz = SIT_Z + slump * 0.5;
        place(arm, i * 2, slot, -0.27, sy, sz, -(1.25 + lift0));
        place(arm, i * 2 + 1, slot, 0.27, sy, sz, -(1.25 + lift1));
        const nod = reduced ? 0 : Math.sin(ph * 0.5) * 0.02;
        const hy = SIT_HEAD_Y - slump * 0.05 + nod;
        const hz = SIT_Z + slump * 0.55;
        const variantB = seed % 2 === 1;
        place(head, i, slot, 0, hy, hz);
        place(hairA, i, slot, 0, hy, hz, 0, 0, 0, variantB ? 0.001 : 1, variantB ? 0.001 : 1, variantB ? 0.001 : 1);
        place(hairB, i, slot, 0, hy, hz, 0, 0, 0, variantB ? 1 : 0.001, variantB ? 1 : 0.001, variantB ? 1 : 0.001);
      }
      if (n > 0) {
        arm.instanceMatrix.needsUpdate = true;
        head.instanceMatrix.needsUpdate = true;
        hairA.instanceMatrix.needsUpdate = true;
        hairB.instanceMatrix.needsUpdate = true;
      }

      // Sprechblasen wippen über den Dächern.
      for (let i = 0; i < widgetCount; i += 1) {
        const bob = reduced ? 0 : Math.sin(t * 1.6 + i) * 0.12;
        dummy.position.set(widgetPos[i * 2], widgetBase[i] + bob, widgetPos[i * 2 + 1]);
        dummy.rotation.set(0, UNIT_YAW, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        bubble.setMatrixAt(i, dummy.matrix);
        for (let d = 0; d < 3; d += 1) {
          const pulse = reduced ? 1 : 0.7 + Math.max(0, Math.sin(t * 4 + d * 1.2 + i)) * 0.6;
          tmp.position.set((d - 1) * 0.18, 0, 0.08);
          tmp.rotation.set(0, 0, 0);
          tmp.scale.setScalar(pulse);
          tmp.updateMatrix();
          partM.multiplyMatrices(dummy.matrix, tmp.matrix);
          bubbleDot.setMatrixAt(i * 3 + d, partM);
        }
      }
      if (widgetCount > 0) {
        bubble.instanceMatrix.needsUpdate = true;
        bubbleDot.instanceMatrix.needsUpdate = true;
      }

      // Tokens rasen durch die Leitung, Menge nach Zonenstufe.
      line.update(zone.tier, dt, t, reduced);

      // Deckenlicht flackert gelegentlich.
      if (!reduced) {
        if (t > neonFlickerUntil && hash01(Math.floor(t * 3)) > 0.93) neonFlickerUntil = t + 0.25;
        const flick = t < neonFlickerUntil ? 0.3 + Math.abs(Math.sin(t * 60)) * 0.4 : 0.75;
        neonMat.opacity = zone.unlocked ? flick : 0.25;
      }
    },
    applyPalette(p) {
      Object.entries(mats).forEach(([key, list]) => list.forEach((m) => m.color.setHex(p[key])));
      kit.applyPalette(p);
      line.applyPalette(p);
      internShells.applyPalette(p);
      engineerShells.applyPalette(p);
      placedKey = null; // erzwingt neues Layout inkl. Hoodie-Farben
      lastScreenTier = -1; // erzwingt neuen Monitor-Ton auf der frischen Palette
    },
  };
}
