import * as THREE from 'three';

// ===============================================================================
// GPU-Reparatur-Laster (Delivery Truck)
// ===============================================================================
// Fährt bei Server-Kamin-Überhitzung (isOverheated, 45 Sekunden Cooldown) vor:
// - Kommt über die Dorfstraße auf den Ofenhof gefahren.
// - Bringt frische, kalt leuchtende GPU-Server-Racks auf der Ladefläche.
// - Öffnet die Türen, entlädt neue Hardware, sprüht Kühlnebel auf den Kamin und
//   führt Reparaturen durch.
// - Schließt die Türen, wendet und fährt vor Ablauf der 45s wieder ab.

export function buildDeliveryTruck(palette, furnaceAnchor = { x: 0, z: 0 }) {
  const group = new THREE.Group();
  group.visible = false;

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

  // --- FAHRZEUG-GEOMETRIE ------------------------------------------------------
  const truckRoot = new THREE.Group();
  group.add(truckRoot);

  const chassisMat = lambert('steelDark');
  const cabMat = lambert('constructionOrange');
  const boxMat = lambert('facade');
  const windowMat = basic('windowGlass');
  const tireMat = lambert('tapeBlack');
  const wheelHubMat = lambert('steel');
  const beaconMat = basic('tapeYellow');
  const headlightMat = basic('fireCore');
  const taillightMat = basic('warnRed');
  const rackMat = lambert('rack');
  const ledMat = basic('neon');
  const sprayMat = basic('cloud', { transparent: true, opacity: 0.65 });

  // Chassis / Unterbau
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.28, 4.4), chassisMat);
  chassis.position.y = 0.42;
  chassis.castShadow = true;
  truckRoot.add(chassis);

  // Fahrerkabine (vorne: +z)
  const cabGroup = new THREE.Group();
  cabGroup.position.set(0, 0.56, 1.4);

  const cabBody = new THREE.Mesh(new THREE.BoxGeometry(1.65, 1.15, 1.4), cabMat);
  cabBody.position.y = 0.55;
  cabBody.castShadow = true;
  cabGroup.add(cabBody);

  // Windschutzscheibe
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.55, 0.05), windowMat);
  windshield.position.set(0, 0.72, 0.71);
  cabGroup.add(windshield);

  // Seitenscheiben
  [-0.83, 0.83].forEach((sx) => {
    const sideWindow = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.45, 0.65), windowMat);
    sideWindow.position.set(sx, 0.72, 0.2);
    cabGroup.add(sideWindow);
  });

  // Scheinwerfer vorne
  [-0.6, 0.6].forEach((hx) => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.06), headlightMat);
    hl.position.set(hx, 0.32, 0.72);
    cabGroup.add(hl);
  });

  // Stoßstange
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.22, 0.18), chassisMat);
  bumper.position.set(0, 0.2, 0.75);
  cabGroup.add(bumper);

  // Kühlergrill (Voxel-Rippen)
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 0.05), chassisMat);
  grille.position.set(0, 0.38, 0.73);
  cabGroup.add(grille);

  // Sonnenblende über der Windschutzscheibe
  const visor = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.2), chassisMat);
  visor.position.set(0, 1.05, 0.78);
  visor.rotation.x = 0.2;
  cabGroup.add(visor);

  // Seitenspiegel links & rechts
  [-0.92, 0.92].forEach((mx) => {
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.25, 0.1), chassisMat);
    mirror.position.set(mx, 0.75, 0.6);
    cabGroup.add(mirror);
  });

  // Einstiegsstufen & Türgriffe
  [-0.86, 0.86].forEach((sx) => {
    const step = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.4), chassisMat);
    step.position.set(sx, 0.22, 0.2);
    cabGroup.add(step);

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.18), wheelHubMat);
    handle.position.set(sx * 0.98, 0.65, 0.1);
    cabGroup.add(handle);
  });

  // Vertikales Chrom-Auspuffrohr hinter der Fahrerkabine
  const exhaustPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 6), wheelHubMat);
  exhaustPipe.position.set(0.72, 0.95, -0.65);
  exhaustPipe.castShadow = true;
  cabGroup.add(exhaustPipe);
  const exhaustCap = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.14), chassisMat);
  exhaustCap.position.set(0.72, 1.68, -0.68);
  exhaustCap.rotation.x = 0.3;
  cabGroup.add(exhaustCap);

  // Rundumleuchten auf dem Dach (Amber Beacons)
  const beaconBar = new THREE.Group();
  beaconBar.position.set(0, 1.18, 0.2);
  [-0.55, 0.55].forEach((bx) => {
    const bMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.14, 6), beaconMat);
    bMesh.position.set(bx, 0.07, 0);
    beaconBar.add(bMesh);
  });
  cabGroup.add(beaconBar);
  truckRoot.add(cabGroup);

  // Räder (6 Räder: 2 vorne, 4 hinten)
  const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.24, 8);
  wheelGeo.rotateZ(Math.PI / 2);
  const hubGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.26, 6);
  hubGeo.rotateZ(Math.PI / 2);

  const wheels = [];
  const WHEEL_POS = [
    [-0.88, 0.32, 1.4], [0.88, 0.32, 1.4], // Vorne
    [-0.88, 0.32, -0.6], [0.88, 0.32, -0.6], // Hinten 1
    [-0.88, 0.32, -1.5], [0.88, 0.32, -1.5], // Hinten 2
  ];

  WHEEL_POS.forEach(([wx, wy, wz]) => {
    const wGroup = new THREE.Group();
    wGroup.position.set(wx, wy, wz);
    const tire = new THREE.Mesh(wheelGeo, tireMat);
    tire.castShadow = true;
    wGroup.add(tire);
    const hub = new THREE.Mesh(hubGeo, wheelHubMat);
    wGroup.add(hub);
    truckRoot.add(wGroup);
    wheels.push(wGroup);
  });

  // Kofferaufbau (Ladefläche)
  const boxGroup = new THREE.Group();
  boxGroup.position.set(0, 0.56, -0.85);

  const boxBody = new THREE.Mesh(new THREE.BoxGeometry(1.72, 1.5, 2.9), boxMat);
  boxBody.position.y = 0.75;
  boxBody.castShadow = true;
  boxGroup.add(boxBody);

  // Corporate Banner an den Seiten ("GPU EXPRESS")
  [-0.87, 0.87].forEach((bx) => {
    const banner = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.45, 2.2), lambert('neon'));
    banner.position.set(bx, 0.85, 0);
    boxGroup.add(banner);
  });

  // Rückleuchten
  [-0.7, 0.7].forEach((rx) => {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.25, 0.05), taillightMat);
    tl.position.set(rx, 0.28, -1.46);
    boxGroup.add(tl);
  });

  // Hecktüren (öffnen sich bei der Entladung)
  const leftDoor = new THREE.Group();
  leftDoor.position.set(-0.84, 0.75, -1.45);
  const leftDoorMesh = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.45, 0.06), chassisMat);
  leftDoorMesh.position.x = 0.41;
  leftDoor.add(leftDoorMesh);
  boxGroup.add(leftDoor);

  const rightDoor = new THREE.Group();
  rightDoor.position.set(0.84, 0.75, -1.45);
  const rightDoorMesh = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.45, 0.06), chassisMat);
  rightDoorMesh.position.x = -0.41;
  rightDoor.add(rightDoorMesh);
  boxGroup.add(rightDoor);

  truckRoot.add(boxGroup);

  // Frische GPU-Server-Racks (werden entladen)
  const deliveredRack = new THREE.Group();
  deliveredRack.visible = false;
  const rackBody = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.25, 0.65), rackMat);
  rackBody.position.y = 0.62;
  rackBody.castShadow = true;
  deliveredRack.add(rackBody);

  // Leuchtende Türkis-LEDs am neuen Rack
  for (let li = 0; li < 4; li += 1) {
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.04), ledMat);
    led.position.set(0, 0.28 + li * 0.26, 0.33);
    deliveredRack.add(led);
  }
  group.add(deliveredRack);

  // Techniker / Reparateur (im High-Vis-Look)
  const techGroup = new THREE.Group();
  techGroup.visible = false;
  const techBody = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.25), lambert('constructionOrange'));
  techBody.position.y = 0.48;
  techBody.castShadow = true;
  techGroup.add(techBody);

  const techHead = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 5), lambert('skin'));
  techHead.position.y = 0.88;
  techGroup.add(techHead);

  const techHelmet = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 4, 0, Math.PI * 2, 0, Math.PI * 0.55), basic('tapeYellow'));
  techHelmet.position.y = 0.92;
  techGroup.add(techHelmet);

  // Sprühdüse / Stickstoff-Lanze in der Hand
  const nozzle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.45), chassisMat);
  nozzle.position.set(0.2, 0.52, 0.25);
  techGroup.add(nozzle);

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
      Object.entries(mats).forEach(([key, list]) => {
        list.forEach((m) => {
          if (p[key] !== undefined) m.color.setHex(p[key]);
        });
      });
    },
  };
}
