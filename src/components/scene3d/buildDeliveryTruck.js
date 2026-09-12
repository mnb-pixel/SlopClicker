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
  // Start: direkt auf der neuen Ofen-Allee im Süden (x: 0, z: 42, Blickrichtung Norden)
  // Zielhalteplatz: Direkt vor dem Serverkamin auf dem Ofenhof (x: -1.5, z: 4.2)
  const START_POS = { x: 0, z: 42, rot: Math.PI };
  const PARK_POS = { x: -1.5, z: 4.2, rot: Math.PI - 0.25 };

  let internalStartTime = null;

  return {
    group,
    update({ isOverheated, overheatedAt, now, dt = 0.016, reduced = false, palette: curPal }) {
      if (!isOverheated) {
        group.visible = false;
        internalStartTime = null;
        return;
      }

      group.visible = true;

      if (!internalStartTime) {
        internalStartTime = overheatedAt && overheatedAt > 0 ? overheatedAt : now;
      }

      // Sekunden seit Überhitzungsstart (0 bis 45)
      const elapsed = Math.max(0, (now - internalStartTime) / 1000);
      const progress = Math.min(1, elapsed / 45);

      // Rundumleuchten rotieren lassen
      if (!reduced) {
        beaconBar.rotation.y += dt * 9.0;
      }

      // --- PHASE 1: ANFAHRT (0s bis 8s) ---------------------------------------
      if (elapsed < 8) {
        const tDrive = Math.min(1, elapsed / 7.5);
        // Smooth ease-out bremsen
        const ease = 1 - Math.pow(1 - tDrive, 2);

        truckRoot.position.x = START_POS.x + (PARK_POS.x - START_POS.x) * ease;
        truckRoot.position.z = START_POS.z + (PARK_POS.z - START_POS.z) * ease;
        truckRoot.rotation.y = START_POS.rot + (PARK_POS.rot - START_POS.rot) * ease;

        // Räder drehen sich beim Fahren
        if (!reduced) {
          const speed = (1 - ease) * 16.0;
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

      // --- PHASE 2 & 3: ENTLADEN & KÜHLEN / REPARIEREN (8s bis 32s) ------------
      else if (elapsed >= 8 && elapsed < 32) {
        truckRoot.position.set(PARK_POS.x, 0, PARK_POS.z);
        truckRoot.rotation.y = PARK_POS.rot;

        // Türen öffnen sich in den ersten 2 Sekunden (8s bis 10s)
        const doorProgress = Math.min(1, (elapsed - 8) / 2.0);
        leftDoor.rotation.y = -doorProgress * 1.9;
        rightDoor.rotation.y = doorProgress * 1.9;

        // Techniker steigt aus und tritt an den Kamin
        techGroup.visible = true;
        const techT = Math.min(1, (elapsed - 9) / 3.0);
        techGroup.position.set(
          PARK_POS.x + (furnaceAnchor.x - 1.8 - PARK_POS.x) * techT,
          0,
          PARK_POS.z + (furnaceAnchor.z + 1.6 - PARK_POS.z) * techT
        );
        techGroup.rotation.y = Math.atan2(furnaceAnchor.x - techGroup.position.x, furnaceAnchor.z - techGroup.position.z);

        // Neues GPU-Rack wird herausgebracht (ab 11s)
        if (elapsed > 11) {
          deliveredRack.visible = true;
          const rackT = Math.min(1, (elapsed - 11) / 3.5);
          deliveredRack.position.set(
            PARK_POS.x + (furnaceAnchor.x - 1.3 - PARK_POS.x) * rackT,
            0,
            PARK_POS.z + (furnaceAnchor.z + 1.1 - PARK_POS.z) * rackT
          );
          deliveredRack.rotation.y = 0.2;
        }

        // Kühlnebel aktivieren (zwischen 12s und 29s)
        if (elapsed > 12 && elapsed < 29) {
          sprayCone.visible = true;
          const pulse = 0.85 + Math.sin(now * 8.0) * 0.15;
          sprayCone.scale.set(pulse, pulse * 1.2, pulse);
          sprayCone.position.set(
            techGroup.position.x + 0.3,
            0.6,
            techGroup.position.y || (techGroup.position.z - 0.4)
          );
        } else {
          sprayCone.visible = false;
        }
      }

      // --- PHASE 4 & 5: TÜREN SCHLIESSEN & ABFAHRT (32s bis 45s) --------------
      else if (elapsed >= 32 && elapsed < 45) {
        sprayCone.visible = false;
        techGroup.visible = false;
        // Das neue Rack bleibt am Kamin stehen (erfolgreich eingebaut!)
        deliveredRack.visible = true;

        // Türen schließen (32s bis 34s)
        const closeProgress = Math.min(1, (elapsed - 32) / 2.0);
        leftDoor.rotation.y = -(1 - closeProgress) * 1.9;
        rightDoor.rotation.y = (1 - closeProgress) * 1.9;

        // Abfahrt (35s bis 44s)
        if (elapsed >= 34.5) {
          const tLeave = Math.min(1, (elapsed - 34.5) / 9.5);
          const easeLeave = Math.pow(tLeave, 1.8);

          // LKW wendet und fährt die Allee hinunter nach Süden (+z)
          truckRoot.position.x = PARK_POS.x + (0 - PARK_POS.x) * easeLeave;
          truckRoot.position.z = PARK_POS.z + (44 - PARK_POS.z) * easeLeave;
          truckRoot.rotation.y = PARK_POS.rot - Math.PI * 0.9 * Math.min(1, tLeave * 2.0);

          if (!reduced) {
            wheels.forEach((w) => {
              w.children[0].rotation.x += dt * 14.0;
            });
          }
        }
      }

      // Nach 45s ist der Einsatz abgeschlossen
      else {
        group.visible = false;
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
