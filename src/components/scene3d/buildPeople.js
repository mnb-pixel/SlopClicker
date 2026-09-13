import * as THREE from 'three';
import { createVoxelKit } from './voxelModel';
import { PERSON, PERSON_UNIT, PERSON_ARM_ORIGIN, personPants, personTorso, personHead, personHair, personArm } from './voxelLibrary';

// Stehende Personen als Satz instanzierter Voxel-Teile: Hose mit Schuhen, Oberkörper
// (Kapuzenpulli mit Tasche und Hals), Kopf mit Gesicht, Frisur (zwei Varianten), zwei
// Arme. Die Bühnen-Zone nutzt das für Thought Leader, Journalisten und Lobbyisten;
// Zubehör (Krawatte, Kamera, Koffer) legt die Zone selbst dazu und positioniert es über
// composePart() relativ zur Person. Die Modelle selbst liegen in voxelLibrary.js.
//
// Lokales Personen-System: Person schaut nach +z, steht auf y = 0.

const HOODIES = ['hoodieA', 'hoodieB', 'hoodieC'];

export function createPeople(group, palette, capacity) {
  const kit = createVoxelKit(palette);
  const inst = (geo, count, shadow = true) => {
    const m = new THREE.InstancedMesh(geo, kit.mats, count);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.count = 0;
    m.frustumCulled = false;
    m.castShadow = shadow;
    group.add(m);
    return m;
  };

  const pants = inst(kit.geo(personPants, { unit: PERSON_UNIT }), capacity);
  const body = inst(kit.geo(personTorso, { unit: PERSON_UNIT }), capacity);
  const head = inst(kit.geo(personHead, { unit: PERSON_UNIT }), capacity);
  // Zwei Frisuren als zwei Meshes; je Person ist genau eine sichtbar (die andere wird
  // auf Null skaliert) - so bleibt der Instanzindex i für beide gleich.
  const hairA = inst(kit.geo((m) => personHair(m, 0), { unit: PERSON_UNIT }), capacity, false);
  const hairB = inst(kit.geo((m) => personHair(m, 1), { unit: PERSON_UNIT }), capacity, false);
  const arm = inst(kit.geo(personArm, { unit: PERSON_UNIT, origin: PERSON_ARM_ORIGIN }), capacity * 2, false);

  const base = new THREE.Matrix4();
  const part = new THREE.Matrix4();
  const tmp = new THREE.Object3D();
  const color = new THREE.Color();

  // Matrix eines Teils relativ zu einer Person an (x, z) mit Blickrichtung yaw.
  const composePart = (x, z, yaw, lx, ly, lz, rx = 0, ry = 0, rz = 0, out = part, s = 1) => {
    base.makeRotationY(yaw).setPosition(x, 0, z);
    tmp.position.set(lx, ly, lz);
    tmp.rotation.set(rx, ry, rz);
    tmp.scale.set(s, s, s);
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
      pants.setMatrixAt(i, composePart(x, z, yaw, 0, PERSON.pantsY + lift, 0));
      body.setMatrixAt(i, composePart(x, z, yaw, 0, PERSON.torsoY + lift, 0));
      head.setMatrixAt(i, composePart(x, z, yaw, 0, PERSON.headY + lift, 0));
      const variantB = seed % 2 === 1;
      hairA.setMatrixAt(i, composePart(x, z, yaw, 0, PERSON.headY + lift, 0, 0, 0, 0, part, variantB ? 0.001 : 1));
      hairB.setMatrixAt(i, composePart(x, z, yaw, 0, PERSON.headY + lift, 0, 0, 0, 0, part, variantB ? 1 : 0.001));
      // Arme drehen um die Schulter: der Arm-Ursprung IST der Drehpunkt (oben Mitte),
      // also nur Position + Neigung, kein Bogen mehr.
      const shoulderY = PERSON.shoulderY + lift;
      arm.setMatrixAt(i * 2, composePart(x, z, yaw, -PERSON.shoulderX, shoulderY, 0, -armL));
      arm.setMatrixAt(i * 2 + 1, composePart(x, z, yaw, PERSON.shoulderX, shoulderY, 0, -armR));
      if (hoodieHex != null) color.setHex(hoodieHex);
      else color.setHex(p[hoodie || HOODIES[seed % 3]]);
      body.setColorAt(i, color);
    },
    commit(n) {
      pants.count = n;
      body.count = n;
      head.count = n;
      hairA.count = n;
      hairB.count = n;
      arm.count = n * 2;
      [pants, body, head, hairA, hairB, arm].forEach((m) => {
        m.instanceMatrix.needsUpdate = true;
      });
      if (body.instanceColor) body.instanceColor.needsUpdate = true;
    },
    applyPalette(p) {
      kit.applyPalette(p);
    },
  };
}
