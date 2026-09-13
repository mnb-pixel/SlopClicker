import * as THREE from 'three';

// Kleine instanzierte Dach-Requisiten (Klimagerät, Lüfterrohr, Schüssel, Antenne) für
// die Bürohäuser (buildLotShells.js). Die eigentlichen Props der Szene sind Voxel-
// Modelle (voxelModel.js); dieser Baukasten ergänzt sie um ein paar Zufalls-Aufbauten
// je Haus, damit eine Häuserreihe nicht wie ein Stempel wirkt.
const unitBox = new THREE.BoxGeometry(1, 1, 1);
const dummy = new THREE.Object3D();

export function hash01(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Ersetzt die in praktisch jeder build*.js-Datei wiederholte inst()-Funktion: ein
// InstancedMesh mit denselben Standard-Flags (dynamisch, kein Frustum-Culling - die
// Insel ist immer ganz im Bild -, Schatten optional).
export function makeInstanced(group, geo, mat, count, shadow = true) {
  const m = new THREE.InstancedMesh(geo, mat, Math.max(1, count));
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.count = 0;
  m.frustumCulled = false;
  m.castShadow = shadow;
  m.receiveShadow = shadow;
  group.add(m);
  return m;
}

// Setzt Position + Gier-Rotation + Skalierung einer Instanz. Deckt den häufigsten
// Fall ab (Boxen/radialsymmetrische Formen, nur um Y gedreht); Teile mit voller
// Rotation setzen ihre Matrix weiterhin selbst über THREE.Object3D.
export function putBox(mesh, i, x, y, z, sx, sy, sz, ry = 0) {
  dummy.position.set(x, y, z);
  dummy.rotation.set(0, ry, 0);
  dummy.scale.set(sx, sy, sz);
  dummy.updateMatrix();
  mesh.setMatrixAt(i, dummy.matrix);
}

// --- Dachaufbauten -------------------------------------------------------------------
// Vier Requisiten-Sorten für Dächer, Podeste und andere freie Flächen: Klimagerät
// (Box + Lüftergitter), Lüfterrohr (Zylinder + Kegelhaube), Satellitenschüssel (flacher
// Kegel) und Antenne (dünner Mast + rote Kuppe). Radialsymmetrische Formen (Zylinder,
// Kegel, Kugel) brauchen keine Gier-Rotation - nur die AC-Box wird gedreht.
//
// `place(x, y, z, ry, seed)` wählt deterministisch EINE der vier Requisiten (aus
// `seed`) und setzt sie auf den Dachpunkt (x, y, z); `ry` gilt nur für die AC-Box.
// `finish()` schreibt die gesammelten counts in die Meshes - erst danach sichtbar.
export function createRoofProps(group, lambert, basic, max) {
  const acBody = makeInstanced(group, unitBox, lambert('steel'), max, false);
  const acGrille = makeInstanced(group, unitBox, lambert('steelDark'), max, false);
  const vent = makeInstanced(group, new THREE.CylinderGeometry(0.1, 0.12, 0.24, 8), lambert('steelDark'), max, false);
  const ventCap = makeInstanced(group, new THREE.ConeGeometry(0.13, 0.09, 8), lambert('steel'), max, false);
  const dish = makeInstanced(group, new THREE.ConeGeometry(0.17, 0.09, 12, 1, true), lambert('facade'), max, false);
  const antennaMast = makeInstanced(group, new THREE.CylinderGeometry(0.014, 0.022, 0.85, 4), lambert('steelDark'), max, false);
  const antennaTip = makeInstanced(group, new THREE.SphereGeometry(0.028, 5, 4), basic('warnRed'), max, false);

  const meshes = [acBody, acGrille, vent, ventCap, dish, antennaMast, antennaTip];
  const counts = { ac: 0, vent: 0, dish: 0, antenna: 0 };

  function place(x, y, z, ry, seed) {
    const pick = Math.floor(hash01(seed) * 4);
    if (pick === 0) {
      const i = counts.ac;
      putBox(acBody, i, x, y + 0.11, z, 0.32, 0.22, 0.26, ry);
      putBox(acGrille, i, x + Math.sin(ry) * 0.16, y + 0.11, z + Math.cos(ry) * 0.16, 0.2, 0.16, 0.02, ry);
      counts.ac += 1;
    } else if (pick === 1) {
      const i = counts.vent;
      putBox(vent, i, x, y + 0.12, z, 1, 1, 1);
      putBox(ventCap, i, x, y + 0.28, z, 1, 1, 1);
      counts.vent += 1;
    } else if (pick === 2) {
      const i = counts.dish;
      dummy.position.set(x, y + 0.3 + 0.045, z);
      dummy.rotation.set(Math.PI * 0.32, hash01(seed + 1) * Math.PI * 2, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      dish.setMatrixAt(i, dummy.matrix);
      counts.dish += 1;
    } else {
      const i = counts.antenna;
      putBox(antennaMast, i, x, y + 0.425, z, 1, 1, 1);
      dummy.position.set(x, y + 0.87, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      antennaTip.setMatrixAt(i, dummy.matrix);
      counts.antenna += 1;
    }
  }

  function reset() {
    counts.ac = 0;
    counts.vent = 0;
    counts.dish = 0;
    counts.antenna = 0;
  }

  function finish() {
    acBody.count = counts.ac;
    acGrille.count = counts.ac;
    vent.count = counts.vent;
    ventCap.count = counts.vent;
    dish.count = counts.dish;
    antennaMast.count = counts.antenna;
    antennaTip.count = counts.antenna;
    meshes.forEach((m) => {
      m.instanceMatrix.needsUpdate = true;
    });
  }

  return { place, reset, finish, meshes };
}
