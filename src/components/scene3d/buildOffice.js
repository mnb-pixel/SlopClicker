import * as THREE from 'three';
import { buildDataLine, defaultLineRoute } from './buildDataLine';
import { buildLotShells } from './buildLotShells';
import { tierMix } from './tierVisuals';

// Großraumbüro (Zone "office"): Praktikanten und Prompt Engineers sitzen an schäbigen
// Schreibtischen und tippen - seit dem Grundstücks-Umbau nicht mehr frei auf der Wiese,
// sondern IN Häusern. Vier Arbeitsplätze passen in ein Haus; ist es voll, entsteht das
// nächste nebenan; nach vier bzw. drei Häusern beginnt eine neue Reihe, sodass jede
// Engine als eigenes Viertel wächst (siehe utils/campusLayout.js). Vom Büro führt weiter eine Datenleitung zum Ofen, durch die
// Tokens rasen; Chatbot-Widgets schweben als Sprechblasen über den Dächern.
//
// Jede Teilesorte (Tischplatte, Böcke, Monitor, Tastatur, Stuhl, Körper, Kopf, Arme,
// Tasse, Papier, Blase, Token) ist EIN InstancedMesh. Statische Teile werden nur bei
// geänderter Anzahl neu gesetzt, pro Frame bewegen sich nur Arme, Köpfe, Blasen,
// Tokens und das Deckenlicht.

const INTERN_MAX = 48;
const ENGINEER_MAX = 36;
const INTERN_LOTS_MAX = 12;
const ENGINEER_LOTS_MAX = 9;
const WIDGET_MAX = 10;
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

  // --- Teile -------------------------------------------------------------------------
  const deskTop = inst(new THREE.BoxGeometry(1.35, 0.08, 0.7), lambert('desk'), TOTAL);
  const deskLeg = inst(new THREE.BoxGeometry(0.08, 0.7, 0.62), lambert('deskLeg'), TOTAL * 2);
  const monitor = inst(new THREE.BoxGeometry(0.52, 0.4, 0.1), lambert('monitor'), TOTAL + ENGINEER_MAX);
  const screenMat = basic('screen');
  const screen = inst(new THREE.PlaneGeometry(0.44, 0.32), screenMat, TOTAL + ENGINEER_MAX, false);
  const monitorStand = inst(new THREE.BoxGeometry(0.1, 0.16, 0.1), lambert('deskLeg'), TOTAL + ENGINEER_MAX, false);
  const keyboard = inst(new THREE.BoxGeometry(0.5, 0.04, 0.2), lambert('deskDark'), TOTAL, false);
  const chairSeat = inst(new THREE.BoxGeometry(0.5, 0.08, 0.5), lambert('chair'), TOTAL);
  const chairBack = inst(new THREE.BoxGeometry(0.5, 0.5, 0.08), lambert('chair'), TOTAL);
  const chairLeg = inst(new THREE.CylinderGeometry(0.04, 0.04, 0.42, 5), lambert('deskLeg'), TOTAL, false);
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
  const body = inst(new THREE.CylinderGeometry(0.2, 0.24, 0.5, 7), bodyMat, TOTAL);
  const head = inst(new THREE.SphereGeometry(0.17, 7, 6), lambert('skin'), TOTAL);
  const hair = inst(new THREE.SphereGeometry(0.18, 7, 5, 0, Math.PI * 2, 0, Math.PI * 0.55), lambert('hair'), TOTAL, false);
  const arm = inst(new THREE.BoxGeometry(0.08, 0.08, 0.32), lambert('skin'), TOTAL * 2, false);
  const cup = inst(new THREE.CylinderGeometry(0.06, 0.05, 0.12, 6), lambert('cup'), TOTAL, false);
  const paper = inst(new THREE.BoxGeometry(0.28, 0.01, 0.36), lambert('paper'), TOTAL, false);

  const bubble = inst(new THREE.BoxGeometry(0.7, 0.45, 0.12), lambert('bubble'), WIDGET_MAX, false);
  const bubbleDot = inst(new THREE.SphereGeometry(0.05, 5, 4), basic('token'), WIDGET_MAX * 3, false);

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
      place(deskTop, i, slot, 0, 0.75, 0, 0, 0, wobble, isEngineer ? 1.25 : 1, 1, 1);
      place(deskLeg, i * 2, slot, -0.55 * (isEngineer ? 1.25 : 1), 0.36, 0);
      place(deskLeg, i * 2 + 1, slot, 0.55 * (isEngineer ? 1.25 : 1), 0.36, 0);
      place(keyboard, i, slot, 0, 0.81, -0.12);
      const monitors = isEngineer ? 2 : 1;
      for (let m = 0; m < monitors; m += 1) {
        const mx = isEngineer ? (m === 0 ? -0.3 : 0.3) : 0;
        const yaw = isEngineer ? (m === 0 ? 0.35 : -0.35) : 0;
        place(monitor, monitorIdx, slot, mx, 1.07, 0.2, 0, yaw);
        place(monitorStand, monitorIdx, slot, mx, 0.86, 0.2, 0, yaw);
        // Bildschirmfläche zeigt zur Person (-z), leicht vor dem Gehäuse.
        place(screen, monitorIdx, slot, mx - Math.sin(yaw) * 0.06, 1.07, 0.2 - Math.cos(yaw) * 0.06, 0, Math.PI + yaw);
        monitorIdx += 1;
      }
      place(chairSeat, i, slot, 0, 0.5, -0.72);
      place(chairBack, i, slot, 0, 0.78, -0.95);
      place(chairLeg, i, slot, 0, 0.25, -0.72);
      // Person: Körper sitzt auf dem Stuhl, Kopf darüber. Praktikanten hängen etwas.
      const slump = isEngineer ? 0 : 0.12;
      const sc = u.absent ? 0.001 : 1;
      place(body, i, slot, 0, 0.8, -0.7, slump, 0, 0, sc, sc, sc);
      place(head, i, slot, 0, 1.2 - slump * 0.3, -0.62 + slump * 0.3, 0, 0, 0, sc, sc, sc);
      place(hair, i, slot, 0, 1.24 - slump * 0.3, -0.62 + slump * 0.3, 0, 0, 0, sc, sc, sc);
      const tier = isEngineer ? engineerTier : internTier;
      color.setHex(tierMix([p.hoodieA, p.hoodieB, p.hoodieC][seed % 3], p.gold, tier));
      body.setColorAt(i, color);
      // Ab Stufe 2 hat jeder Platz Tasse und Papier - besser ausgestattet statt
      // zufällig, das liest sich als sichtbarer Fortschritt.
      if (tier >= 2 || hash01(seed + 7) > 0.45) {
        place(cup, cupIdx, slot, 0.45, 0.85, -0.1);
        cupIdx += 1;
      }
      if (tier >= 2 || hash01(seed + 13) > 0.5) {
        place(paper, paperIdx, slot, -0.45, 0.8, 0.05, 0, hash01(seed) * 0.6);
        paperIdx += 1;
      }
    });

    deskTop.count = n;
    deskLeg.count = n * 2;
    keyboard.count = n;
    monitor.count = monitorIdx;
    monitorStand.count = monitorIdx;
    screen.count = monitorIdx;
    chairSeat.count = n;
    chairBack.count = n;
    chairLeg.count = n;
    body.count = n;
    head.count = n;
    hair.count = n;
    arm.count = n * 2;
    cup.count = cupIdx;
    paper.count = paperIdx;
    [deskTop, deskLeg, keyboard, monitor, monitorStand, screen, chairSeat, chairBack, chairLeg, body, head, hair, cup, paper].forEach(
      (m) => {
        m.instanceMatrix.needsUpdate = true;
      }
    );
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
        screenMat.color.setHex(tierMix(p.screen, p.gold, screenTier, 0.7));
      }
      if (widgetCount !== placedWidgets) {
        layoutWidgets(widgetCount, internLots.length ? internLots : engineerLots);
        placedWidgets = widgetCount;
      }

      // Tippen: Arme wippen gegenläufig, Kopf nickt minimal.
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
        const lift0 = Math.max(0, Math.sin(ph)) * 0.05;
        const lift1 = Math.max(0, Math.sin(ph + Math.PI)) * 0.05;
        const slump = isEngineer ? 0 : 0.12;
        place(arm, i * 2, slot, -0.14, 0.86 + lift0, -0.42 + slump * 0.2, -0.3);
        place(arm, i * 2 + 1, slot, 0.14, 0.86 + lift1, -0.42 + slump * 0.2, -0.3);
        const nod = reduced ? 0 : Math.sin(ph * 0.5) * 0.02;
        place(head, i, slot, 0, 1.2 - slump * 0.3 + nod, -0.62 + slump * 0.3);
        place(hair, i, slot, 0, 1.24 - slump * 0.3 + nod, -0.62 + slump * 0.3);
      }
      if (n > 0) {
        arm.instanceMatrix.needsUpdate = true;
        head.instanceMatrix.needsUpdate = true;
        hair.instanceMatrix.needsUpdate = true;
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
      line.applyPalette(p);
      internShells.applyPalette(p);
      engineerShells.applyPalette(p);
      placedKey = null; // erzwingt neues Layout inkl. Hoodie-Farben
      lastScreenTier = -1; // erzwingt neuen Monitor-Ton auf der frischen Palette
    },
  };
}
