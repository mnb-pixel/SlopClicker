import * as THREE from 'three';

// Das Spielfeld: eine einzige, flache Wiese statt der früheren schwebenden Insel -
// im Stil von Egg Inc, wo der Hof einfach auf einer grünen Fläche steht statt auf
// einem Felsbrocken zu schweben. Der Rasen ist bewusst riesig (FIELD_SIZE), damit sein
// Rand bei keinem Zoomstand je ins Bild gerät; die Kamera kann höchstens so weit heraus,
// wie VIEW_FIT_MAX/ZOOM_MAX in CampusScene.jsx erlauben, und das bleibt weit innerhalb
// dieser Kante. Dazu drei Low-Poly-Wolken, die langsam driften.
//
// Alles Flat Shading ohne Texturen. Materialien werden in einem Objekt gesammelt,
// damit applyPalette() beim Theme-Wechsel nur Farben tauscht statt Geometrie neu zu bauen.
const FIELD_SIZE = 800;

export function buildIsland(palette) {
  const group = new THREE.Group();
  const mats = {};

  const lambert = (key) => {
    const m = new THREE.MeshLambertMaterial({ color: palette[key], flatShading: true });
    mats[key] = mats[key] || [];
    mats[key].push(m);
    return m;
  };

  // Rasen: Oberkante bei y = 0, eine einzige flache Platte, kein sichtbarer Rand.
  const grass = new THREE.Mesh(new THREE.BoxGeometry(FIELD_SIZE, 1.2, FIELD_SIZE), lambert('grass'));
  grass.position.y = -0.6;
  grass.receiveShadow = true;
  group.add(grass);

  // Wolken: drei Klumpen aus je drei bis vier Ikosaedern.
  const clouds = new THREE.Group();
  const cloudMat = lambert('cloud');
  // Alle Wolken hinter bzw. seitlich des Campus, keine vor dem Schrank.
  const cloudSpecs = [
    { x: -18, y: 12, z: -8, s: 1.0, speed: 0.12 },
    { x: 16, y: 14, z: -15, s: 1.4, speed: 0.08 },
    { x: -5, y: 16, z: -20, s: 0.9, speed: 0.15 },
  ];
  cloudSpecs.forEach((spec) => {
    const c = new THREE.Group();
    const parts = [
      [0, 0, 0, 1.6],
      [1.5, 0.3, 0.2, 1.2],
      [-1.4, 0.2, 0.3, 1.1],
      [0.4, 0.9, -0.2, 1.0],
    ];
    parts.forEach(([px, py, pz, r]) => {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r * spec.s, 0), cloudMat);
      m.position.set(px * spec.s, py * spec.s, pz * spec.s);
      c.add(m);
    });
    c.position.set(spec.x, spec.y, spec.z);
    c.userData.baseX = spec.x;
    c.userData.baseZ = spec.z;
    c.userData.speed = spec.speed;
    clouds.add(c);
  });
  group.add(clouds);

  // `scale` bleibt als Signal erhalten, auch wenn der Rasen selbst nicht mehr mitwächst
  // (er ist ja schon riesig): buildCampus.js braucht ihn weiterhin, um Bäume, Wege und
  // Lichtdrohnen mit dem tatsächlich bebauten Bereich nach außen wandern zu lassen, und
  // CampusScene.jsx, um die Schattenkamera auf den bebauten Bereich zu begrenzen.
  let scale = 1;

  return {
    group,
    // targetScale kommt aus deriveIsland(); wandert weich, damit ein Kauf die
    // Campus-Dekoration nicht springen lässt.
    update(dt, t, reduced, targetScale = 1) {
      if (Math.abs(targetScale - scale) > 0.001) {
        scale = reduced ? targetScale : scale + (targetScale - scale) * Math.min(1, dt * 2.5);
        // Wolken rücken mit nach außen, sonst hängen sie bei großem Campus über ihm.
        clouds.children.forEach((c) => {
          c.position.z = c.userData.baseZ * scale;
        });
      }
      if (reduced) return;
      clouds.children.forEach((c, i) => {
        c.position.x = (c.userData.baseX + Math.sin(t * c.userData.speed + i) * 1.5) * scale;
      });
    },
    getScale: () => scale,
    applyPalette(p) {
      Object.entries(mats).forEach(([key, list]) => {
        list.forEach((m) => m.color.setHex(p[key]));
      });
    },
  };
}
