import * as THREE from 'three';

// Voxel-Modelle: der Kern des Detail-Umbaus der 3D-Szene.
//
// Vorher bestand jedes Prop aus einer Handvoll GROSSER Grundformen (Zylinder-Körper,
// Kugel-Kopf, ein Quader pro Etage). Jetzt ist ein Prop ein echtes Voxel-Modell: viele
// KLEINE Würfel auf einem Ganzzahl-Raster, jeder mit einem Palettenschlüssel - Gesicht,
// Kapuze, Schubladen, Fensterraster, Wellblech werden damit Geometrie statt Andeutung.
//
// Damit das nicht teurer wird als vorher, wird ein Modell nur EINMAL aus seinen Voxeln
// zu einer einzigen BufferGeometry mit Vertex-Farben verschmolzen (Flächen zwischen zwei
// Voxeln fallen dabei weg), und diese Geometrie wird dann genau wie bisher instanziert:
// gleiche Zahl an Draw Calls, nur mehr Dreiecke je Modell. Die Layout- und Animations-
// logik der Zonen bleibt unberührt - sie setzt weiter nur Instanz-Matrizen.
//
// Theme-Wechsel: die Farben stecken in den Vertizes, also merkt sich jede Geometrie den
// Palettenschlüssel je Vertex und färbt sich auf Zuruf um (recolor). Ein VoxelKit je
// build*.js sammelt alle Geometrien und macht applyPalette() zu einem Einzeiler.
//
// Konventionen: Voxel (x, y, z) belegt den Raum [x, x+1) usw. in Rastereinheiten;
// y zeigt nach oben. Der Ursprung eines Modells liegt standardmäßig unten in der Mitte
// (Bodenkontakt bei y = 0, Mitte der Grundfläche bei x = z = 0), Blickrichtung +z.

const FACES = [
  // [nx, ny, nz, [4 Eckpunkte relativ zum Voxel-Ursprung]]
  { n: [1, 0, 0], v: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]] },
  { n: [-1, 0, 0], v: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]] },
  { n: [0, 1, 0], v: [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]] },
  { n: [0, -1, 0], v: [[0, 0, 1], [0, 0, 0], [1, 0, 0], [1, 0, 1]] },
  { n: [0, 0, 1], v: [[1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]] },
  { n: [0, 0, -1], v: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]] },
];

// Schlüssel für die Map: drei vorzeichenbehaftete Ganzzahlen in eine Zahl gepackt
// (je 10 Bit + Offset, reicht für Modelle bis 1024 Voxel Kantenlänge).
const OFF = 512;
function cellKey(x, y, z) {
  return ((x + OFF) << 20) | ((y + OFF) << 10) | (z + OFF);
}

function hash01(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export class VoxelModel {
  constructor() {
    this.cells = new Map(); // cellKey -> { x, y, z, key, shade }
  }

  set(x, y, z, key, shade = 1) {
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);
    this.cells.set(cellKey(x, y, z), { x, y, z, key, shade });
    return this;
  }

  has(x, y, z) {
    return this.cells.has(cellKey(Math.round(x), Math.round(y), Math.round(z)));
  }

  remove(x, y, z) {
    this.cells.delete(cellKey(Math.round(x), Math.round(y), Math.round(z)));
    return this;
  }

  // Voller Quader ab Ecke (x0, y0, z0) mit w × h × d Voxeln. `noise` streut die Helligkeit
  // je Voxel leicht (Ziegel, Rasen, Holz), `seed` macht das Muster wiederholbar.
  box(x0, y0, z0, w, h, d, key, { noise = 0, seed = 0 } = {}) {
    for (let x = 0; x < w; x += 1) {
      for (let y = 0; y < h; y += 1) {
        for (let z = 0; z < d; z += 1) {
          const shade = noise ? 1 - noise + hash01(seed + x * 7 + y * 131 + z * 17) * noise * 2 : 1;
          this.set(x0 + x, y0 + y, z0 + z, key, shade);
        }
      }
    }
    return this;
  }

  // Quader nur als Hülle (Wände `t` dick), innen leer - für Häuser, Schränke, Kisten.
  shell(x0, y0, z0, w, h, d, key, t = 1, opts) {
    this.box(x0, y0, z0, w, h, d, key, opts);
    if (w > 2 * t && h > 2 * t && d > 2 * t) this.clear(x0 + t, y0 + t, z0 + t, w - 2 * t, h - 2 * t, d - 2 * t);
    return this;
  }

  clear(x0, y0, z0, w, h, d) {
    for (let x = 0; x < w; x += 1) {
      for (let y = 0; y < h; y += 1) {
        for (let z = 0; z < d; z += 1) this.remove(x0 + x, y0 + y, z0 + z);
      }
    }
    return this;
  }

  // Zylinder um die Achse (cx, cz), Radius `r` in Voxeln, von y0 aus `h` hoch. Die
  // Voxelmitten entscheiden, ob ein Voxel drin ist - liefert bei r >= 2 runde Formen.
  cylinder(cx, cz, y0, h, r, key, opts = {}) {
    const { noise = 0, seed = 0, hollow = 0 } = opts;
    const r0 = Math.ceil(r);
    for (let x = -r0; x <= r0; x += 1) {
      for (let z = -r0; z <= r0; z += 1) {
        const dd = (x + 0.5) * (x + 0.5) + (z + 0.5) * (z + 0.5);
        if (dd > r * r) continue;
        if (hollow && dd < (r - hollow) * (r - hollow)) continue;
        for (let y = 0; y < h; y += 1) {
          const shade = noise ? 1 - noise + hash01(seed + x * 7 + y * 131 + z * 17) * noise * 2 : 1;
          this.set(cx + x, y0 + y, cz + z, key, shade);
        }
      }
    }
    return this;
  }

  sphere(cx, cy, cz, r, key, opts = {}) {
    const { noise = 0, seed = 0, yMin = -Infinity, yMax = Infinity } = opts;
    const r0 = Math.ceil(r);
    for (let x = -r0; x <= r0; x += 1) {
      for (let y = -r0; y <= r0; y += 1) {
        if (y < yMin || y > yMax) continue;
        for (let z = -r0; z <= r0; z += 1) {
          const dd = (x + 0.5) * (x + 0.5) + (y + 0.5) * (y + 0.5) + (z + 0.5) * (z + 0.5);
          if (dd > r * r) continue;
          const shade = noise ? 1 - noise + hash01(seed + x * 7 + y * 131 + z * 17) * noise * 2 : 1;
          this.set(cx + x, cy + y, cz + z, key, shade);
        }
      }
    }
    return this;
  }

  // Spiegelt alles mit x >= 0 nach x < 0 (um die Ebene x = 0, Voxel 0 bleibt Mitte...).
  // Für symmetrische Figuren: eine Hälfte bauen, spiegeln. `axis` = Spiegelebene in
  // Voxeln (Standard -0.5: Voxel x wird zu -1 - x, d.h. Spalten 0 | -1 sind Nachbarn).
  mirrorX(axis = -0.5) {
    const add = [];
    this.cells.forEach((c) => {
      if (c.x > axis) add.push({ ...c, x: Math.round(2 * axis - c.x) });
    });
    add.forEach((c) => this.set(c.x, c.y, c.z, c.key, c.shade));
    return this;
  }

  bounds() {
    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;
    this.cells.forEach((c) => {
      if (c.x < minX) minX = c.x;
      if (c.y < minY) minY = c.y;
      if (c.z < minZ) minZ = c.z;
      if (c.x > maxX) maxX = c.x;
      if (c.y > maxY) maxY = c.y;
      if (c.z > maxZ) maxZ = c.z;
    });
    if (minX === Infinity) return { minX: 0, minY: 0, minZ: 0, maxX: 0, maxY: 0, maxZ: 0 };
    return { minX, minY, minZ, maxX: maxX + 1, maxY: maxY + 1, maxZ: maxZ + 1 };
  }
}

// Farbe für einen Schlüssel: Zahl = direkte Hexfarbe, sonst Palettenschlüssel. Fehlt der
// Schlüssel in der Palette, fällt er sichtbar auf Magenta zurück - besser als ein
// lautloses Schwarz, das aussieht wie ein beabsichtigter Schatten.
export function resolveColor(key, palette) {
  if (typeof key === 'number') return key;
  const v = palette[key];
  return v === undefined ? 0xff00ff : v;
}

// Verschmilzt ein Modell zu einer Geometrie. `unit` = Kantenlänge eines Voxels in Welt-
// einheiten. `origin` in Voxeln: dieser Punkt wird zum Ursprung (Standard: unten Mitte).
// `resolve(key)` liefert die Hexfarbe (Standard: palette[key]); `faceShade` dunkelt
// Seiten- und Unterflächen leicht ab, damit auch unbeleuchtete (MeshBasic) Modelle
// plastisch wirken.
export function buildVoxelGeometry(model, { unit = 0.1, origin = null, palette = {}, resolve = null, faceShade = 0, unlit = null } = {}) {
  const b = model.bounds();
  const ox = origin ? origin[0] : (b.minX + b.maxX) / 2;
  const oy = origin ? origin[1] : b.minY;
  const oz = origin ? origin[2] : (b.minZ + b.maxZ) / 2;

  const positions = [];
  const normals = [];
  const colors = [];
  const indices0 = []; // Materialgruppe 0: beleuchtet (Lambert)
  const indices1 = []; // Materialgruppe 1: unbeleuchtet (Basic) - Bildschirme, LEDs, Leuchten
  const isUnlit = typeof unlit === 'function' ? unlit : unlit ? (k) => unlit.has(k) : () => false;
  const keys = []; // je Vertex: Schlüssel (für recolor)
  const shades = []; // je Vertex: Helligkeitsfaktor (Voxel-Noise × Flächen-Schattierung)
  const color = new THREE.Color();
  const res = resolve || ((k) => resolveColor(k, palette));

  let vi = 0;
  model.cells.forEach((c) => {
    for (let f = 0; f < 6; f += 1) {
      const face = FACES[f];
      const [nx, ny, nz] = face.n;
      if (model.cells.has(cellKey(c.x + nx, c.y + ny, c.z + nz))) continue;
      let fs = 1;
      if (faceShade) {
        if (ny < 0) fs = 1 - faceShade * 1.6;
        else if (ny === 0) fs = 1 - faceShade * (nx !== 0 ? 0.55 : 1.0);
      }
      const shade = c.shade * fs;
      color.setHex(res(c.key)).multiplyScalar(shade);
      for (let k = 0; k < 4; k += 1) {
        const [vx, vy, vz] = face.v[k];
        positions.push((c.x + vx - ox) * unit, (c.y + vy - oy) * unit, (c.z + vz - oz) * unit);
        normals.push(nx, ny, nz);
        colors.push(color.r, color.g, color.b);
        keys.push(c.key);
        shades.push(shade);
      }
      (isUnlit(c.key) ? indices1 : indices0).push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3);
      vi += 4;
    }
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices0.concat(indices1));
  geo.addGroup(0, indices0.length, 0);
  if (indices1.length) geo.addGroup(indices0.length, indices1.length, 1);
  geo.computeBoundingSphere();
  geo.userData.voxelKeys = keys;
  geo.userData.voxelShades = shades;
  return geo;
}

// Färbt eine Voxel-Geometrie mit einer neuen Palette (oder einem anderen resolve) um,
// ohne die Geometrie neu zu bauen - nur das Farb-Attribut wird überschrieben.
export function recolorVoxelGeometry(geo, palette, resolve = null) {
  const keys = geo.userData.voxelKeys;
  const shades = geo.userData.voxelShades;
  if (!keys) return;
  const attr = geo.getAttribute('color');
  const arr = attr.array;
  const color = new THREE.Color();
  const res = resolve || ((k) => resolveColor(k, palette));
  const cache = new Map();
  for (let i = 0; i < keys.length; i += 1) {
    const k = keys[i];
    let hex = cache.get(k);
    if (hex === undefined) {
      hex = res(k);
      cache.set(k, hex);
    }
    color.setHex(hex).multiplyScalar(shades[i]);
    arr[i * 3] = color.r;
    arr[i * 3 + 1] = color.g;
    arr[i * 3 + 2] = color.b;
  }
  attr.needsUpdate = true;
}

// Sammelt die Voxel-Geometrien einer build*.js-Datei samt ihrer Bauvorschrift, damit
// applyPalette() sie alle in einem Rutsch umfärbt. `override(key, p)` darf je Modell
// einzelne Schlüssel übersteuern (z.B. Glas Richtung Gold je Sichtstufe).
export function createVoxelKit(palette) {
  const entries = []; // { geo, override }
  let current = palette;

  const lambertMat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const basicMat = new THREE.MeshBasicMaterial({ vertexColors: true });

  function makeResolve(override, p) {
    return (k) => {
      if (override) {
        const o = override(k, p);
        if (o !== undefined && o !== null) return o;
      }
      return resolveColor(k, p);
    };
  }

  return {
    // Beleuchtetes bzw. unbeleuchtetes Standardmaterial mit Vertex-Farben. Gemeinsam für
    // alle Modelle des Kits - eine Geometrie pro Prop, ein Material pro Kit.
    lambert: lambertMat,
    basic: basicMat,
    // build(model) füllt das Modell; opts wie bei buildVoxelGeometry, plus `override`.
    // Meshes bekommen `kit.mats` als Material-Array: Gruppe 0 beleuchtet, Gruppe 1
    // unbeleuchtet (Schlüssel aus `unlit`).
    mats: [lambertMat, basicMat],
    geo(build, { unit = 0.1, origin = null, faceShade = 0, override = null, unlit = null } = {}) {
      const model = new VoxelModel();
      build(model);
      const geo = buildVoxelGeometry(model, { unit, origin, faceShade, unlit, resolve: makeResolve(override, current) });
      entries.push({ geo, override });
      return geo;
    },
    // Ein einzelnes Modell neu färben (z.B. bei Wechsel der Sichtstufe).
    recolor(geo, override = null) {
      const e = entries.find((x) => x.geo === geo);
      if (e) e.override = override;
      recolorVoxelGeometry(geo, current, makeResolve(e ? e.override : override, current));
    },
    applyPalette(p) {
      current = p;
      entries.forEach((e) => recolorVoxelGeometry(e.geo, p, makeResolve(e.override, p)));
    },
  };
}
