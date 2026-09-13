import * as THREE from 'three';
import { createVoxelKit } from './voxelModel';
import { PERSON, PERSON_UNIT, PERSON_ARM_ORIGIN, personPants, personTorso, personHead, personArm, hardHat, remapKeys } from './voxelLibrary';

// ===============================================================================
// GPU-Reparatur-Laster (Delivery Truck)
// ===============================================================================
// Fährt bei Server-Kamin-Überhitzung (isOverheated, 45 Sekunden Cooldown) vor:
// - Kommt über die Dorfstraße auf den Ofenhof gefahren.
// - Bringt frische, kalt leuchtende GPU-Server-Racks auf der Ladefläche.
// - Öffnet die Türen, entlädt neue Hardware, sprüht Kühlnebel auf den Kamin und
//   führt Reparaturen durch.
// - Schließt die Türen, wendet und fährt vor Ablauf der 45s wieder ab.
//
// Fahrzeug, Räder, Hecktüren, das gelieferte Rack und der Techniker (Voxel-Person mit
// Warnweste, Helm und Stickstofflanze) sind Voxel-Modelle (voxelModel.js, Raster 0,05).

export function buildDeliveryTruck(palette, furnaceAnchor = { x: 0, z: 0 }) {
  const group = new THREE.Group();
  group.visible = false;

  const mats = {};
  const basic = (key, extra = {}) => {
    const m = new THREE.MeshBasicMaterial({ color: palette[key], ...extra });
    (mats[key] = mats[key] || []).push(m);
    return m;
  };

  // --- FAHRZEUG-GEOMETRIE ------------------------------------------------------
  const truckRoot = new THREE.Group();
  group.add(truckRoot);
  const kit = createVoxelKit(palette);
  const U = 0.05;
  const UNLIT = new Set(['windowGlass', 'fireCore', 'warnRed', 'neon', 'tapeYellow']);
  const beaconMat = basic('tapeYellow');
  const sprayMat = basic('cloud', { transparent: true, opacity: 0.65 });

  // Aufbau in einem Modell: Fahrgestell, Kabine (vorn +z) mit Scheiben, Grill, Spiegeln,
  // Stufen und Auspuff, Koffer mit Banner, Rücklichtern und Dachlüfter.
  const bodyGeo = kit.geo((m) => {
    m.box(-17, 6, -44, 34, 5, 88, 'steelDark');
    // Kabine
    m.box(-16, 11, 14, 33, 23, 28, 'constructionOrange', { noise: 0.02, seed: 1 });
    m.box(-14, 24, 41, 29, 9, 1, 'windowGlass');
    m.box(-17, 24, 22, 1, 8, 12, 'windowGlass');
    m.box(16, 24, 22, 1, 8, 12, 'windowGlass');
    for (let y = 12; y < 33; y += 1) {
      m.set(-16, y, 27, 'constructionOrange', 0.8);
      m.set(16, y, 27, 'constructionOrange', 0.8);
    }
    m.set(-16, 22, 24, 'steel');
    m.set(16, 22, 24, 'steel');
    m.box(-14, 15, 41, 5, 3, 1, 'fireCore');
    m.box(10, 15, 41, 5, 3, 1, 'fireCore');
    m.box(-17, 9, 40, 34, 4, 3, 'steelDark');
    m.box(-9, 14, 41, 18, 7, 1, 'steelDark');
    for (let y = 15; y < 21; y += 2) for (let x = -8; x < 9; x += 1) m.set(x, y, 41, 'steel', 0.7);
    m.box(-15, 33, 40, 31, 2, 4, 'steelDark');
    m.box(-19, 25, 34, 2, 5, 2, 'steelDark');
    m.box(17, 25, 34, 2, 5, 2, 'steelDark');
    m.box(-18, 9, 20, 3, 2, 8, 'steelDark');
    m.box(15, 9, 20, 3, 2, 8, 'steelDark');
    m.box(14, 11, 12, 2, 30, 2, 'steel');
    m.box(13, 41, 11, 4, 1, 4, 'steelDark');
    // Koffer
    m.box(-17, 11, -46, 34, 30, 58, 'facade', { noise: 0.02, seed: 2 });
    m.box(-18, 20, -40, 1, 9, 44, 'neon');
    m.box(17, 20, -40, 1, 9, 44, 'neon');
    for (let z = -38; z < 2; z += 4) {
      m.box(-18, 22, z, 1, 5, 2, 'neon', { noise: 0 });
      m.box(17, 22, z, 1, 5, 2, 'neon', { noise: 0 });
      for (let y = 22; y < 27; y += 1) {
        m.set(-18, y, z, 'facade');
        m.set(17, y, z, 'facade');
      }
    }
    for (let z = -44; z < 12; z += 6) m.box(-17, 11, z, 34, 1, 1, 'steel');
    m.box(-14, 15, -47, 4, 5, 1, 'warnRed');
    m.box(10, 15, -47, 4, 5, 1, 'warnRed');
    m.box(-3, 41, -20, 6, 2, 6, 'steel');
    m.box(-17, 41, -46, 34, 1, 1, 'steel');
  }, { unit: U, unlit: UNLIT });
  const body = new THREE.Mesh(bodyGeo, kit.mats);
  body.castShadow = true;
  truckRoot.add(body);

  // Rundumleuchten auf dem Kabinendach (Amber Beacons)
  const beaconBar = new THREE.Group();
  beaconBar.position.set(0, 1.74, 1.6);
  [-0.55, 0.55].forEach((bx) => {
    const bMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.18), beaconMat);
    bMesh.position.set(bx, 0.07, 0);
    beaconBar.add(bMesh);
  });
  truckRoot.add(beaconBar);

  // Räder (6 Räder: 2 vorne, 4 hinten): Voxel-Reifen mit Felge und Radbolzen.
  const wheelGeo = kit.geo((m) => {
    m.cylinder(0, 0, 0, 5, 6.4, 'tapeBlack', { noise: 0.06, seed: 3 });
    m.cylinder(0, 0, -1, 7, 3.2, 'steel');
    [[2, 0], [-3, 0], [0, 2], [0, -3]].forEach(([x, z]) => m.set(x, 6, z, 'steelDark'));
  }, { unit: U, origin: [0, 2.5, 0] });
  const wheels = [];
  const WHEEL_POS = [
    [-0.88, 0.32, 1.4], [0.88, 0.32, 1.4], // Vorne
    [-0.88, 0.32, -0.6], [0.88, 0.32, -0.6], // Hinten 1
    [-0.88, 0.32, -1.5], [0.88, 0.32, -1.5], // Hinten 2
  ];
  WHEEL_POS.forEach(([wx, wy, wz]) => {
    const wGroup = new THREE.Group();
    wGroup.position.set(wx, wy, wz);
    const tire = new THREE.Mesh(wheelGeo, kit.mats);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wGroup.add(tire);
    truckRoot.add(wGroup);
    wheels.push(wGroup);
  });

  // Hecktüren (öffnen sich bei der Entladung): Drehpunkt an der Außenkante.
  const doorGeo = (sign) =>
    kit.geo((m) => {
      m.box(sign > 0 ? 0 : -16, 0, 0, 16, 29, 1, 'steelDark', { noise: 0.03, seed: 4 });
      m.box(sign > 0 ? 1 : -15, 4, 0, 14, 21, 1, 'steel', { noise: 0 });
      m.box(sign > 0 ? 13 : -14, 12, -1, 1, 4, 1, 'steel');
      for (let y = 6; y < 24; y += 5) m.box(sign > 0 ? 2 : -14, y, 0, 12, 1, 1, 'steelDark');
    }, { unit: U, origin: [0, 0, 0.5] });
  const leftDoor = new THREE.Group();
  leftDoor.position.set(-0.84, 0.58, -2.31);
  leftDoor.add(new THREE.Mesh(doorGeo(1), kit.mats));
  truckRoot.add(leftDoor);
  const rightDoor = new THREE.Group();
  rightDoor.position.set(0.84, 0.58, -2.31);
  rightDoor.add(new THREE.Mesh(doorGeo(-1), kit.mats));
  truckRoot.add(rightDoor);

  // Frische GPU-Server-Racks (werden entladen): Schrank mit Einschüben und LED-Reihen.
  const deliveredRack = new THREE.Group();
  deliveredRack.visible = false;
  const rackGeo = kit.geo((m) => {
    m.shell(-7, 0, -6, 14, 25, 13, 'rack', 1, { noise: 0.04, seed: 5 });
    for (let l = 0; l < 4; l += 1) {
      const y = 4 + l * 5;
      m.box(-6, y, 6, 12, 3, 1, 'steel', { noise: 0.05, seed: 10 + l });
      m.box(-5, y + 1, 7, 10, 1, 1, 'neon');
    }
    m.box(-5, 25, -4, 10, 1, 9, 'steelDark');
  }, { unit: U, unlit: UNLIT });
  const rackBody = new THREE.Mesh(rackGeo, kit.mats);
  rackBody.castShadow = true;
  deliveredRack.add(rackBody);
  group.add(deliveredRack);

  // Techniker / Reparateur (im High-Vis-Look): Voxel-Person mit Warnweste, Helm und
  // Stickstofflanze, etwas kleiner als die Zonen-Figuren.
  const techGroup = new THREE.Group();
  techGroup.visible = false;
  const TECH_SCALE = 0.85;
  const techParts = new THREE.Group();
  techParts.scale.setScalar(TECH_SCALE);
  techGroup.add(techParts);
  const addPart = (geo, x, y, z, rx = 0) => {
    const mesh = new THREE.Mesh(geo, kit.mats);
    mesh.position.set(x, y, z);
    mesh.rotation.x = rx;
    mesh.castShadow = true;
    techParts.add(mesh);
    return mesh;
  };
  addPart(kit.geo(personPants, { unit: PERSON_UNIT }), 0, PERSON.pantsY, 0);
  addPart(
    kit.geo((m) => {
      personTorso(m);
      remapKeys(m, new Map([[0xffffff, 'constructionOrange'], [0xd9d9d9, 'tapeYellow'], [0xe4e4e4, 'constructionOrange'], [0xdddddd, 'tapeYellow']]));
      // Reflexstreifen quer über Brust und Rücken
      for (let x = -4; x < 4; x += 1) {
        m.set(x, 6, 2, 'tapeYellow');
        m.set(x, 6, -2, 'tapeYellow');
      }
    }, { unit: PERSON_UNIT, unlit: new Set(['tapeYellow']) }),
    0, PERSON.torsoY, 0
  );
  addPart(kit.geo(personHead, { unit: PERSON_UNIT }), 0, PERSON.headY, 0);
  addPart(kit.geo((m) => hardHat(m), { unit: PERSON_UNIT }), 0, PERSON.headY, 0);
  const armGeo = kit.geo(personArm, { unit: PERSON_UNIT, origin: PERSON_ARM_ORIGIN });
  addPart(armGeo, -PERSON.shoulderX, PERSON.shoulderY, 0, -0.3);
  addPart(armGeo, PERSON.shoulderX, PERSON.shoulderY, 0, -1.3);
  // Lanze in der rechten Hand, Tank auf dem Rücken
  const nozzle = new THREE.Mesh(
    kit.geo((m) => {
      m.box(0, 0, -2, 1, 1, 10, 'steelDark');
      m.box(-1, 0, 8, 3, 1, 1, 'steel');
      m.box(-1, -1, -1, 3, 3, 2, 'steel');
    }, { unit: U, origin: [0.5, 0.5, 0] }),
    kit.mats
  );
  nozzle.position.set(PERSON.shoulderX, 0.62, 0.3);
  techParts.add(nozzle);
  const tank = new THREE.Mesh(
    kit.geo((m) => {
      m.cylinder(0, 0, 0, 9, 2.2, 'steel', { noise: 0.05, seed: 6 });
      m.cylinder(0, 0, 9, 1, 1.2, 'steelDark');
      m.box(-2, 3, -2, 5, 1, 1, 'warnRed');
    }, { unit: U }),
    kit.mats
  );
  tank.position.set(0, 0.45, -0.28);
  techParts.add(tank);
  group.add(techGroup);

  // Kühlmittel-Sprühnebel (Cone/Partikel zum Ofen gerichtet)
  const sprayCone = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.8, 7), sprayMat);
  sprayCone.position.set(-1.8, 1.1, 1.2);
  sprayCone.rotation.x = Math.PI / 2;
  sprayCone.rotation.z = -0.6;
  sprayCone.visible = false;
  group.add(sprayCone);

  // --- TIMELINE & BEWEGUNGSPFAD ------------------------------------------------
  // Dauer: 45 Sekunden
  // Parkposition: Direkt vor dem Serverkamin auf dem Ofenhof (x: -1.5, z: 4.2)
  const PARK_POS = { x: -1.5, z: 4.2, rot: Math.PI - 0.25 };

  // Berechnet die maximale sichtbare Entfernung der Ofen-Allee (x = 0, y = 0, z >= 0) im aktuellen
  // Kamera-Bildausschnitt (unter Berücksichtigung von Zoom, Seitenverhältnis und Pan).
  // Der Laster startet und endet genau außerhalb des aktuell sichtbaren Bildrandes.
  const tempVecA = new THREE.Vector3();
  const tempVecB = new THREE.Vector3();

  function getViewportMaxRoadZ(camera, margin = 1.18) {
    if (!camera) return 80;
    tempVecA.set(0, 0, 0).project(camera);
    tempVecB.set(0, 0, 100).project(camera);
    const dx = (tempVecB.x - tempVecA.x) / 100;
    const dy = (tempVecB.y - tempVecA.y) / 100;

    let minExitZ = Infinity;
    if (dx < -1e-6) {
      const zLeft = (-margin - tempVecA.x) / dx;
      if (zLeft > 0 && zLeft < minExitZ) minExitZ = zLeft;
    } else if (dx > 1e-6) {
      const zRight = (margin - tempVecA.x) / dx;
      if (zRight > 0 && zRight < minExitZ) minExitZ = zRight;
    }

    if (dy < -1e-6) {
      const zBottom = (-margin - tempVecA.y) / dy;
      if (zBottom > 0 && zBottom < minExitZ) minExitZ = zBottom;
    } else if (dy > 1e-6) {
      const zTop = (margin - tempVecA.y) / dy;
      if (zTop > 0 && zTop < minExitZ) minExitZ = zTop;
    }

    if (!Number.isFinite(minExitZ)) {
      minExitZ = 80;
    }
    // Mindestens hinter Flussbrücke & Süddorf (z >= 68), maximal bis an das Ende der Straße (z = 370)
    return Math.min(370, Math.max(minExitZ, 68));
  }

  // Brückenerhebung: Über der Flussbrücke (z = 54.2 bis 59.8) hebt sich der LKW sanft um bis zu 18cm an
  function getRoadElevation(z) {
    if (z >= 54.2 && z <= 59.8) {
      return 0.18 * Math.sin(((z - 54.2) / 5.6) * Math.PI);
    }
    return 0;
  }

  let startZRef = null;
  let internalStartTime = null;

  return {
    group,
    update({ camera, isOverheated, overheatedAt, dt = 0.016, reduced = false }) {
      if (!isOverheated) {
        group.visible = false;
        startZRef = null;
        internalStartTime = null;
        truckRoot.visible = true;
        deliveredRack.visible = false;
        techGroup.visible = false;
        sprayCone.visible = false;
        return;
      }

      group.visible = true;

      // Startposition: ermittelt den maximalen sichtbaren Bildausschnitt der Straße
      if (startZRef === null && camera) {
        startZRef = getViewportMaxRoadZ(camera);
      }

      // Robuste Zeitbasis in Sekunden:
      let elapsed = 0;
      if (overheatedAt && overheatedAt > 0) {
        elapsed = Math.max(0, (Date.now() - overheatedAt) / 1000);
      } else {
        if (!internalStartTime) internalStartTime = Date.now();
        elapsed = Math.max(0, (Date.now() - internalStartTime) / 1000);
      }

      // Falls die Kamera in den ersten Sekunden noch herauszoomt, Startpunkt dynamisch nach außen anpassen
      if (elapsed < 1.2 && camera) {
        startZRef = Math.max(startZRef || 68, getViewportMaxRoadZ(camera));
      }
      const startZ = startZRef || 80;

      // Rundumleuchten rotieren lassen
      if (!reduced) {
        beaconBar.rotation.y += dt * 9.0;
      }

      // --- PHASE 1: ANFAHRT (0s bis 7.5s) ---------------------------------------
      // Fährt von maximaler Bildrandentfernung (startZ) auf der Allee (x = 0) heran und bremst vor dem Kamin (x = -1.5, z = 4.2)
      if (elapsed < 7.5) {
        truckRoot.visible = true;
        const tDrive = Math.min(1, elapsed / 7.0);
        // Geschmeidiges Abbremsen (Cubic Ease-Out)
        const ease = 1 - Math.pow(1 - tDrive, 2.5);

        // Bis kurz vor dem Kamin geradeaus auf der Allee (x = 0),
        // im letzten Drittel sanft nach x = -1.5 vor den Kamin einlenken
        const zCurrent = startZ + (PARK_POS.z - startZ) * ease;
        const tCurve = Math.max(0, (ease - 0.72) / 0.28);
        const smoothCurve = tCurve * tCurve * (3 - 2 * tCurve);
        const xCurrent = 0 + (PARK_POS.x - 0) * smoothCurve;
        const rotCurrent = Math.PI + (PARK_POS.rot - Math.PI) * smoothCurve;

        truckRoot.position.set(xCurrent, getRoadElevation(zCurrent), zCurrent);
        truckRoot.rotation.y = rotCurrent;

        // Räder drehen sich beim Fahren passend zur tatsächlichen Geschwindigkeit
        if (!reduced) {
          const driveDist = startZ - PARK_POS.z;
          const speed = Math.max(0, (1 - ease) * (driveDist * 0.55));
          wheels.forEach((w) => {
            w.children[0].rotation.x += dt * speed;
          });
        }

        leftDoor.rotation.y = 0;
        rightDoor.rotation.y = 0;
        deliveredRack.visible = false;
        techGroup.visible = false;
        sprayCone.visible = false;
      }

      // --- PHASE 2 & 3: ENTLADEN & KÜHLEN / REPARIEREN (7.5s bis 32s) ------------
      else if (elapsed >= 7.5 && elapsed < 32) {
        truckRoot.visible = true;
        truckRoot.position.set(PARK_POS.x, 0, PARK_POS.z);
        truckRoot.rotation.y = PARK_POS.rot;

        // Türen öffnen sich in den ersten 2 Sekunden (7.5s bis 9.5s)
        const doorProgress = Math.min(1, (elapsed - 7.5) / 2.0);
        leftDoor.rotation.y = -doorProgress * 1.9;
        rightDoor.rotation.y = doorProgress * 1.9;

        // Techniker steigt aus und tritt an den Kamin (8.5s bis 11.5s)
        techGroup.visible = true;
        const techT = Math.min(1, Math.max(0, (elapsed - 8.5) / 3.0));
        techGroup.position.set(
          PARK_POS.x + (furnaceAnchor.x - 1.8 - PARK_POS.x) * techT,
          0,
          PARK_POS.z + (furnaceAnchor.z + 1.6 - PARK_POS.z) * techT
        );
        techGroup.rotation.y = Math.atan2(furnaceAnchor.x - techGroup.position.x, furnaceAnchor.z - techGroup.position.z);

        // Neues GPU-Rack wird herausgebracht (ab 10.5s)
        if (elapsed > 10.5) {
          deliveredRack.visible = true;
          const rackT = Math.min(1, (elapsed - 10.5) / 3.5);
          deliveredRack.position.set(
            PARK_POS.x + (furnaceAnchor.x - 1.3 - PARK_POS.x) * rackT,
            0,
            PARK_POS.z + (furnaceAnchor.z + 1.1 - PARK_POS.z) * rackT
          );
          deliveredRack.rotation.y = 0.2;
        } else {
          deliveredRack.visible = false;
        }

        // Kühlnebel aktivieren (zwischen 12s und 29s)
        if (elapsed > 12 && elapsed < 29) {
          sprayCone.visible = true;
          const pulse = 0.85 + Math.sin(elapsed * 10.0) * 0.15;
          sprayCone.scale.set(pulse, pulse * 1.2, pulse);
          sprayCone.position.set(
            techGroup.position.x + 0.3,
            0.6,
            techGroup.position.z - 0.4
          );
        } else {
          sprayCone.visible = false;
        }
      }

      // --- PHASE 4 & 5: TÜREN SCHLIESSEN, WENDEN & ABFAHRT (32s bis 45s) --------
      else if (elapsed >= 32 && elapsed < 45) {
        sprayCone.visible = false;
        techGroup.visible = false;
        // Das neue Rack bleibt am Kamin stehen (erfolgreich eingebaut!)
        deliveredRack.visible = true;

        // Türen schließen (32s bis 34s)
        const closeProgress = Math.min(1, (elapsed - 32) / 2.0);
        leftDoor.rotation.y = -(1 - closeProgress) * 1.9;
        rightDoor.rotation.y = (1 - closeProgress) * 1.9;

        // Wenden auf der Allee (34s bis 36.5s)
        if (elapsed >= 34 && elapsed < 36.5) {
          truckRoot.visible = true;
          const tTurn = (elapsed - 34) / 2.5;
          const easeTurn = tTurn * tTurn * (3 - 2 * tTurn);
          const xTurn = PARK_POS.x + (0 - PARK_POS.x) * easeTurn;
          const zTurn = PARK_POS.z - Math.sin(easeTurn * Math.PI) * 0.6;
          const rotTurn = PARK_POS.rot - (PARK_POS.rot) * easeTurn;

          truckRoot.position.set(xTurn, 0, zTurn);
          truckRoot.rotation.y = rotTurn;

          if (!reduced) {
            wheels.forEach((w) => {
              w.children[0].rotation.x += dt * 8.0;
            });
          }
        }
        // Fahrt nach Süden die Allee hinunter bis aus dem Bild (36.5s bis 43.5s)
        else if (elapsed >= 36.5 && elapsed < 43.5) {
          const exitZ = Math.max(startZ, camera ? getViewportMaxRoadZ(camera) : 80);
          const tDriveOut = (elapsed - 36.5) / 6.5;
          const easeOut = Math.pow(tDriveOut, 1.8);
          const zOut = PARK_POS.z + (exitZ - PARK_POS.z) * easeOut;

          // Sobald der Laster den Bildausschnitt verlassen hat (zOut >= exitZ oder tDriveOut >= 1.0), ausblenden
          if (zOut >= exitZ || tDriveOut >= 1.0) {
            truckRoot.visible = false;
          } else {
            truckRoot.visible = true;
            truckRoot.position.set(0, getRoadElevation(zOut), zOut);
            truckRoot.rotation.y = 0; // Geradewegs nach Süden

            if (!reduced) {
              const speedOut = 4.0 + easeOut * ((exitZ - PARK_POS.z) * 0.45);
              wheels.forEach((w) => {
                w.children[0].rotation.x += dt * speedOut;
              });
            }
          }
        }
        // Ab 43.5s: Laster hat den Bildrand verlassen
        else if (elapsed >= 43.5) {
          truckRoot.visible = false;
        }
      }

      // Nach 45s: Einsatz abgeschlossen, LKW ist weg
      else {
        truckRoot.visible = false;
      }
    },

    applyPalette(p) {
      kit.applyPalette(p);
      Object.entries(mats).forEach(([key, list]) => {
        list.forEach((m) => {
          if (p[key] !== undefined) m.color.setHex(p[key]);
        });
      });
    },
  };
}
