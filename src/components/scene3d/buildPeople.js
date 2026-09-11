import * as THREE from 'three';

// Stehende Personen als Satz instanzierter Teile: Hose, Oberkörper (Hoodie), Kopf,
// Haar, zwei Arme. Die Bühnen-Zone nutzt das für Thought Leader, Journalisten und
// Lobbyisten; Zubehör (Krawatte, Kamera, Koffer) legt die Zone selbst dazu und
// positioniert es über composePart() relativ zur Person.
//
// Lokales Personen-System: Person schaut nach +z, steht auf y = 0.

const HOODIES = ['hoodieA', 'hoodieB', 'hoodieC'];

export function createPeople(group, palette, capacity) {
  const mats = {};
  const lambert = (key) => {
    const m = new THREE.MeshLambertMaterial({ color: palette[key], flatShading: true });
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

  const pants = inst(new THREE.CylinderGeometry(0.19, 0.21, 0.4, 7), lambert('deskLeg'), capacity);
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
  const body = inst(new THREE.CylinderGeometry(0.2, 0.23, 0.5, 7), bodyMat, capacity);
  const head = inst(new THREE.SphereGeometry(0.17, 7, 6), lambert('skin'), capacity);
  const hair = inst(new THREE.SphereGeometry(0.18, 7, 5, 0, Math.PI * 2, 0, Math.PI * 0.55), lambert('hair'), capacity, false);
  const arm = inst(new THREE.BoxGeometry(0.08, 0.34, 0.08), lambert('skin'), capacity * 2, false);

  const base = new THREE.Matrix4();
  const part = new THREE.Matrix4();
  const tmp = new THREE.Object3D();
  const color = new THREE.Color();

  // Matrix eines Teils relativ zu einer Person an (x, z) mit Blickrichtung yaw.
  const composePart = (x, z, yaw, lx, ly, lz, rx = 0, ry = 0, rz = 0, out = part) => {
    base.makeRotationY(yaw).setPosition(x, 0, z);
    tmp.position.set(lx, ly, lz);
    tmp.rotation.set(rx, ry, rz);
    tmp.scale.set(1, 1, 1);
    tmp.updateMatrix();
    return out.multiplyMatrices(base, tmp.matrix);
  };

  return {
    composePart,
    // armL/armR: Hebewinkel der Arme um die Schulter (0 = hängend, ~1.4 = waagerecht).
    // lift: Person steht erhöht (z.B. auf der Bühne). hoodieHex: fertige Hex-Farbe, die
    // die seed-basierte Wahl übersteuert - für die Sichtstufe aus gekauften Upgrades
    // (siehe tierVisuals.js), die zonenweit gilt und nicht mehr zufällig streuen darf.
    set(i, x, z, yaw, { seed = i, armL = 0, armR = 0, hoodie = null, hoodieHex = null, lift = 0 } = {}, p = palette) {
      pants.setMatrixAt(i, composePart(x, z, yaw, 0, 0.2 + lift, 0));
      body.setMatrixAt(i, composePart(x, z, yaw, 0, 0.65 + lift, 0));
      head.setMatrixAt(i, composePart(x, z, yaw, 0, 1.08 + lift, 0));
      hair.setMatrixAt(i, composePart(x, z, yaw, 0, 1.12 + lift, 0));
      // Arme drehen um die Schulter (y 0.85): Mittelpunkt wandert auf einem Bogen.
      const shoulderY = 0.85 + lift;
      const len = 0.17;
      arm.setMatrixAt(i * 2, composePart(x, z, yaw, -0.27, shoulderY - Math.cos(armL) * len, Math.sin(armL) * len, -armL));
      arm.setMatrixAt(i * 2 + 1, composePart(x, z, yaw, 0.27, shoulderY - Math.cos(armR) * len, Math.sin(armR) * len, -armR));
      if (hoodieHex != null) color.setHex(hoodieHex);
      else color.setHex(p[hoodie || HOODIES[seed % 3]]);
      body.setColorAt(i, color);
    },
    commit(n) {
      pants.count = n;
      body.count = n;
      head.count = n;
      hair.count = n;
      arm.count = n * 2;
      [pants, body, head, hair, arm].forEach((m) => {
        m.instanceMatrix.needsUpdate = true;
      });
      if (body.instanceColor) body.instanceColor.needsUpdate = true;
    },
    applyPalette(p) {
      Object.entries(mats).forEach(([key, list]) => list.forEach((m) => m.color.setHex(p[key])));
    },
  };
}
