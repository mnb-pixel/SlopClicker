// Gemeinsame Voxel-Modelle, die mehr als eine Zone braucht: die Person (Büro, Bühne)
// und der Baum (Campus, Stadtrand). Jede Funktion füllt ein VoxelModel; gebaut werden
// sie über kit.geo(fn, opts) des jeweiligen build*.js (siehe voxelModel.js).
//
// Personen-Raster: 1 Voxel = 0,05 Einheiten (PERSON_UNIT). Die Figur ist rund 25 Voxel
// hoch (1,25 Einheiten) und damit so groß wie die alte Zylinder-Kugel-Figur, nur mit
// Schuhen, Kapuzenpulli-Tasche, Hals, Gesicht und Frisur. Blickrichtung +z.
//
// Teile und ihre Ursprünge (für people.set / place im Büro):
//   pants   unten Mitte, Höhe 8  -> steht auf y = 0,          belegt 0,00 .. 0,40
//   torso   unten Mitte, Höhe 11 -> steht auf y = 0,40,       belegt 0,40 .. 0,95 (inkl. Hals)
//   head    unten Mitte, Höhe 7  -> steht auf y = 0,90,       belegt 0,90 .. 1,25
//   hair    unten Mitte des KOPFES (gleicher Ursprung wie head), ragt darüber hinaus
//   arm     OBEN Mitte (Schulterdrehpunkt), hängt 7 Voxel nach unten
// Die Pulli-Voxel sind weiß (0xffffff) und werden pro Instanz über instanceColor
// getönt; Details (Tasche, Kapuze) sind leicht dunkleres Weiß, so bleibt die Abstufung
// bei jeder Pullifarbe erhalten.

export const PERSON_UNIT = 0.05;
export const PERSON = {
  pantsY: 0,
  torsoY: 0.4,
  headY: 0.9,
  shoulderY: 0.87,
  shoulderX: 0.27,
  armLen: 0.35,
};

export function personPants(m) {
  // rechtes Bein (x 1..3), gespiegelt nach links (-4..-2); Lücke von zwei Voxeln
  m.box(1, 2, -1, 3, 6, 3, 'deskLeg');
  // Schuh: zwei Voxel hoch, einen Voxel nach vorn
  m.box(1, 0, -1, 3, 2, 4, 'tapeBlack');
  m.set(2, 1, 3, 'tapeBlack'); // Schuhspitze
  m.mirrorX();
  // Gürtel
  m.box(-4, 7, -1, 8, 1, 3, 'tapeBlack');
  m.set(-1, 7, 2, 'gold');
  m.set(0, 7, 2, 'gold');
}

export function personTorso(m) {
  m.box(0, 0, -2, 4, 10, 5, 0xffffff);
  // Schulterkappe (kurzer Ärmel)
  m.box(4, 6, -2, 1, 4, 4, 0xffffff);
  // Bauchtasche vorn
  m.box(0, 2, 3, 3, 3, 1, 0xd9d9d9);
  // Kapuze hinten, hängt am Rücken
  m.box(0, 5, -4, 4, 5, 2, 0xe4e4e4);
  m.box(0, 10, -4, 3, 1, 2, 0xe4e4e4);
  // Kordel vorn
  m.set(0, 8, 3, 0xdddddd);
  m.mirrorX();
  // Hals
  m.box(-1, 10, -1, 2, 1, 2, 'skin');
}

export function personHead(m) {
  m.box(-3, 0, -3, 7, 7, 7, 'skin');
  // Augen
  m.set(-2, 4, 3, 'tapeBlack');
  m.set(2, 4, 3, 'tapeBlack');
  // Mund
  m.set(-1, 2, 3, 0xd9a982);
  m.set(0, 2, 3, 0xd9a982);
  // Ohren
  m.box(3, 3, -1, 1, 2, 2, 'skin');
  m.box(-4, 3, -1, 1, 2, 2, 'skin');
}

// Zwei Frisuren: Kappe mit Pony, und kurz mit Seitenscheitel. Beide sitzen außen auf
// dem Kopf (kein Voxel teilt sich den Platz mit dem Kopf, sonst z-fighten die Flächen).
export function personHair(m, variant = 0) {
  // Deckel
  m.box(-3, 7, -3, 7, 1, 7, 'hair');
  // Hinterkopf
  m.box(-3, 3, -4, 7, 4, 1, 'hair');
  // Seiten
  m.box(-4, 5, -3, 1, 2, 6, 'hair');
  m.box(3, 5, -3, 1, 2, 6, 'hair');
  if (variant === 0) {
    // Pony vorn
    m.box(-3, 6, 3, 7, 1, 1, 'hair');
    m.set(-3, 5, 3, 'hair');
    m.set(3, 5, 3, 'hair');
  } else {
    // Seitenscheitel: nur links vorn, rechts höher
    m.box(-3, 6, 3, 4, 1, 1, 'hair');
    m.box(-3, 7, 3, 7, 1, 1, 'hair');
  }
}

export function personArm(m) {
  // x 0..2, z 0..2, y 0..6 (Ursprung wird oben Mitte gesetzt: [1.5, 7, 1.5])
  m.box(0, 0, 0, 3, 7, 3, 'skin');
  // Hand einen Hauch dunkler abgesetzt
  m.box(0, 0, 0, 3, 2, 3, 0xe6b48f);
}
export const PERSON_ARM_ORIGIN = [1.5, 7, 1.5];

// --- Baum ----------------------------------------------------------------------------
// Drei Kronenformen auf 0,1er-Raster: Kugelkrone (Laub), Kegelkrone (Nadel), breite
// Schirmkrone. Stamm mit Aststummeln, Krone aus mehreren Kugeln mit Farbnoise, damit
// sie aus der Nähe nicht wie eine glatte Kugel wirkt. Höhe 2,4 .. 3,0 Einheiten.
export function tree(m, variant = 0, seed = 1) {
  m.cylinder(0, 0, 0, 9, 1.6, 'trunk', { noise: 0.08, seed });
  m.set(1, 5, 0, 'trunk');
  m.set(-2, 7, 0, 'trunk');
  if (variant === 0) {
    m.sphere(0, 13, 0, 5.2, 'crown', { noise: 0.12, seed });
    m.sphere(3, 11, 2, 3.4, 'crownDark', { noise: 0.12, seed: seed + 3 });
    m.sphere(-3, 12, -2, 3.2, 'crown', { noise: 0.12, seed: seed + 5 });
    m.sphere(0, 17, 0, 3.0, 'crownDark', { noise: 0.12, seed: seed + 7 });
  } else if (variant === 1) {
    for (let i = 0; i < 5; i += 1) {
      const y = 6 + i * 4;
      const r = 5.5 - i * 1.0;
      m.cylinder(0, 0, y, 3, r, i % 2 ? 'crownDark' : 'crown', { noise: 0.1, seed: seed + i });
    }
    m.box(-1, 26, -1, 2, 2, 2, 'crownDark');
  } else {
    m.sphere(0, 12, 0, 6.4, 'crown', { noise: 0.12, seed, yMin: -2 });
    m.sphere(4, 12, 0, 3.6, 'crownDark', { noise: 0.12, seed: seed + 3, yMin: -1 });
    m.sphere(-4, 12, 1, 3.6, 'crownDark', { noise: 0.12, seed: seed + 4, yMin: -1 });
    m.sphere(0, 12, -4, 3.4, 'crown', { noise: 0.12, seed: seed + 6, yMin: -1 });
  }
}
export const TREE_UNIT = 0.1;

// --- Kleines Auto (Stadtrand) ---------------------------------------------------------
// Karosserie mit Fenstern, Rädern, Scheinwerfern, Rücklichtern. Raster 0,05, Länge 1,6.
// `paintKey` = Lackfarbe. Blickrichtung +z (Front bei +z).
export function car(m, paintKey = 'carPaintA') {
  m.box(-7, 2, -16, 14, 4, 32, paintKey); // Unterbau
  m.box(-6, 6, -9, 12, 5, 18, paintKey); // Kabine
  // Fenster (rundum, unbeleuchtet)
  m.box(-6, 7, 9, 12, 3, 1, 'windowGlass'); // Frontscheibe
  m.box(-6, 7, -10, 12, 3, 1, 'windowGlass'); // Heck
  m.box(-7, 7, -7, 1, 3, 14, 'windowGlass');
  m.box(6, 7, -7, 1, 3, 14, 'windowGlass');
  m.box(-6, 6, -9, 12, 1, 18, paintKey); // Fensterlinie unten
  m.box(-6, 10, -9, 12, 1, 18, paintKey); // Dach
  // Räder
  [[-7, -10], [5, -10], [-7, 9], [5, 9]].forEach(([x, z]) => {
    m.box(x, 0, z, 3, 4, 4, 'tapeBlack');
    m.set(x + 1, 1, z + 1, 'steel');
    m.set(x + 1, 2, z + 1, 'steel');
  });
  // Scheinwerfer / Rücklichter
  m.set(-6, 3, 16, 'fireCore');
  m.set(5, 3, 16, 'fireCore');
  m.set(-6, 3, -17, 'warnRed');
  m.set(5, 3, -17, 'warnRed');
  // Stoßstangen
  m.box(-7, 1, 15, 14, 1, 2, 'steel');
  m.box(-7, 1, -17, 14, 1, 2, 'steel');
}
export const CAR_UNIT = 0.05;

// Tauscht Farbschlüssel eines fertigen Modells (z.B. den weißen Tint-Pulli der Person
// gegen Warnweste-Orange, wenn die Figur kein instanceColor bekommt).
export function remapKeys(m, map) {
  m.cells.forEach((c) => {
    if (map.has(c.key)) c.key = map.get(c.key);
  });
}

// Schutzhelm: sitzt außen auf dem Kopf wie die Frisur (gleicher Ursprung wie head).
export function hardHat(m, key = 'tapeYellow') {
  m.box(-4, 6, -4, 9, 1, 9, key);
  m.box(-3, 7, -3, 7, 2, 7, key);
  m.box(-2, 9, -2, 5, 1, 5, key);
  m.box(-1, 7, 3, 3, 1, 2, key, { noise: 0 });
}
