import * as THREE from 'three';
import { createVoxelKit } from './voxelModel';
import { tree, car, TREE_UNIT, CAR_UNIT } from './voxelLibrary';

// ===============================================================================
// Token-Furnace: Detailliertes Dorf (NORD, SÜD, WEST, OST), Fluss quer & Verdrängung
// ===============================================================================
// Ein ganzes, lebendiges isometrisches Miniaturdorf, das das Startup VOLLSTÄNDIG
// umgibt: nördlich (oben), südlich (unten), westlich (links) und östlich (rechts).
// - 48 detaillierte Einfamilienhäuser mit Giebeldächern, Kaminen, Fenstern, Türen,
//   Gartenzäunen, Bäumen und parkenden Autos in allen vier Himmelsrichtungen.
// - Eine Dorfkirche mit Glockenturm und Kirchturmuhr als malerischer Mittelpunkt.
// - Ein natürlich geschwungener Fluss, der diagonal über das gesamte Spielfeld zieht,
//   überspannt von einer soliden Bogenbrücke für die Dorfstraße.
// - Ein malerischer See mit Sandstrand, hölzernem Bootssteg, sanft schaukelndem
//   Ruderboot, Seerosenblättern und Schilf.
// - PROGRESSIVE 360°-VERDRÄNGUNG: Mit wachsender Größe des Startups (progress 0..1)
//   expandiert der Konzern von der Mitte aus in ALLE Richtungen: Die campusnächsten
//   Grundstücke (N, S, W, O) werden zuerst zu aufgerissenen Baustellen (Matsch, Bagger,
//   Bauzäune, Schutt) und anschließend zu kalten Unternehmens-Kuben.
//   Eine industrielle Kühlleitung pumpt Abwärme in den Fluss, der See trübt sich ein
//   und Algen breiten sich aus.

// --- 1. DORFLAYOUT & 89 GRUNDSTÜCKE (BIS AN DIE SPIELFELDRÄNDER) ----------------
// Streng mathematisch gegen Fluss (dist >= 6.5) und See (dist >= 8.5) abgesichert -
// kein einziges Haus, kein Baum und kein Auto steht mehr im Wasser.
const LOTS = [
  // === NORD-DORF (Oberhalb / -z, reicht bis z = -67) ==========================
  // Zeile 1 (z = -19.5, suedlich von Strasse z = -23, Abstand 3.5m)
  { id: 101, x: -16, z: -19.5, rot: 0.1, type: 'A', wall: 'townWall', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 102, x: 16, z: -19.5, rot: -0.12, type: 'A', wall: 'townWallAlt', roof: 'townRoof', hasTree: false, hasCar: false },

  // Zeile 2 (z = -26.5, noerdlich von Strasse z = -23, Abstand 3.5m)
  { id: 103, x: -24, z: -26.5, rot: 0.15, type: 'B', wall: 'townWallAlt', roof: 'townRoofAlt', hasTree: false, hasCar: true, carCol: 'carPaintA' },
  { id: 104, x: -5, z: -26.5, rot: -0.05, type: 'A', wall: 'townWall', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 105, x: 10, z: -26.5, rot: 0.08, type: 'C', wall: 'townWallC', roof: 'townRoofSlate', hasTree: true, hasCar: true, carCol: 'carPaintB' },
  { id: 106, x: 24, z: -26.5, rot: -0.15, type: 'B', wall: 'townWall', roof: 'townRoofAlt', hasTree: false, hasCar: true, carCol: 'carPaintA' },

  // Zeile 3 (z = -33.5, suedlich von Strasse z = -37, Abstand 3.5m)
  { id: 107, x: -32, z: -33.5, rot: 0.1, type: 'A', wall: 'townWallAlt', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 108, x: -16, z: -33.5, rot: -0.08, type: 'C', wall: 'townWallC', roof: 'townRoofSlate', hasTree: false, hasCar: true, carCol: 'carPaintB' },
  { id: 109, x: 0, z: -33.5, rot: 0.05, type: 'A', wall: 'townWall', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 110, x: 16, z: -33.5, rot: -0.1, type: 'B', wall: 'townWallAlt', roof: 'townRoofAlt', hasTree: true, hasCar: true, carCol: 'carPaintA' },
  { id: 111, x: 32, z: -33.5, rot: 0.18, type: 'A', wall: 'townWall', roof: 'townRoof', hasTree: false, hasCar: false },

  // Zeile 4 (z = -40.5, noerdlich von Strasse z = -37, Abstand 3.5m)
  { id: 112, x: -24, z: -40.5, rot: -0.05, type: 'B', wall: 'townWall', roof: 'townRoofAlt', hasTree: true, hasCar: true, carCol: 'carPaintB' },
  { id: 113, x: -5, z: -40.5, rot: 0.12, type: 'A', wall: 'townWallAlt', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 114, x: 8, z: -40.5, rot: -0.15, type: 'C', wall: 'townWallC', roof: 'townRoofSlate', hasTree: false, hasCar: true, carCol: 'carPaintA' },
  { id: 115, x: 24, z: -40.5, rot: 0.08, type: 'B', wall: 'townWallAlt', roof: 'townRoofAlt', hasTree: true, hasCar: false },
  { id: 116, x: -40, z: -40.5, rot: 0.1, type: 'A', wall: 'townWall', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 117, x: 40, z: -40.5, rot: -0.1, type: 'A', wall: 'townWall', roof: 'townRoof', hasTree: true, hasCar: true, carCol: 'carPaintB' },

  // Zeile 5 (z = -51.5, suedlich von Strasse z = -55, Abstand 3.5m)
  { id: 118, x: -32, z: -51.5, rot: 0.15, type: 'C', wall: 'townWallC', roof: 'townRoofSlate', hasTree: true, hasCar: true, carCol: 'carPaintA' },
  { id: 119, x: -16, z: -51.5, rot: -0.08, type: 'A', wall: 'townWall', roof: 'townRoof', hasTree: false, hasCar: false },
  { id: 120, x: 0, z: -51.5, rot: 0.05, type: 'B', wall: 'townWallAlt', roof: 'townRoofAlt', hasTree: true, hasCar: true, carCol: 'carPaintB' },
  { id: 121, x: 16, z: -51.5, rot: -0.12, type: 'A', wall: 'townWallAlt', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 122, x: 32, z: -51.5, rot: 0.2, type: 'B', wall: 'townWall', roof: 'townRoofAlt', hasTree: false, hasCar: true, carCol: 'carPaintA' },

  // Zeile 6 (z = -58.5, noerdlich von Strasse z = -55, Abstand 3.5m)
  { id: 123, x: -24, z: -58.5, rot: -0.1, type: 'A', wall: 'townWallAlt', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 124, x: -5, z: -58.5, rot: 0.08, type: 'B', wall: 'townWall', roof: 'townRoofAlt', hasTree: true, hasCar: true, carCol: 'carPaintB' },
  { id: 125, x: 8, z: -58.5, rot: -0.15, type: 'C', wall: 'townWallC', roof: 'townRoofSlate', hasTree: false, hasCar: true, carCol: 'carPaintA' },
  { id: 126, x: 24, z: -58.5, rot: 0.1, type: 'A', wall: 'townWall', roof: 'townRoof', hasTree: true, hasCar: false },

  // Zeile 7 (z = -67.0, noerdlich von Strasse z = -63.5, Abstand 3.5m)
  { id: 127, x: -16, z: -67.0, rot: 0.05, type: 'A', wall: 'townWall', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 128, x: 16, z: -67.0, rot: -0.08, type: 'B', wall: 'townWallAlt', roof: 'townRoofAlt', hasTree: false, hasCar: true, carCol: 'carPaintA' },

  // === WEST-DORF (Links / -x, reicht bis x = -74) =============================
  { id: 201, x: -21, z: -10, rot: 0.1, type: 'B', wall: 'townWallAlt', roof: 'townRoofAlt', hasTree: false, hasCar: true, carCol: 'carPaintB' },
  { id: 202, x: -21, z: 0, rot: -0.05, type: 'A', wall: 'townWall', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 203, x: -21, z: 10, rot: 0.15, type: 'C', wall: 'townWallC', roof: 'townRoofSlate', hasTree: true, hasCar: true, carCol: 'carPaintA' },
  { id: 204, x: -29, z: -14, rot: -0.1, type: 'A', wall: 'townWallAlt', roof: 'townRoof', hasTree: false, hasCar: false },
  { id: 205, x: -29, z: -4, rot: 0.08, type: 'B', wall: 'townWall', roof: 'townRoofAlt', hasTree: true, hasCar: true, carCol: 'carPaintB' },
  { id: 206, x: -29, z: 6, rot: -0.12, type: 'A', wall: 'townWallAlt', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 207, x: -31, z: 14.5, rot: 0.2, type: 'C', wall: 'townWallC', roof: 'townRoofSlate', hasTree: false, hasCar: true, carCol: 'carPaintA' },
  { id: 208, x: -38, z: -10, rot: -0.08, type: 'B', wall: 'townWallAlt', roof: 'townRoofAlt', hasTree: true, hasCar: false },
  { id: 209, x: -38, z: 0, rot: 0.05, type: 'A', wall: 'townWall', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 210, x: -38, z: 10, rot: -0.15, type: 'B', wall: 'townWall', roof: 'townRoofAlt', hasTree: false, hasCar: true, carCol: 'carPaintB' },
  { id: 211, x: -45, z: -5, rot: 0.1, type: 'A', wall: 'townWallAlt', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 212, x: -45, z: 7, rot: -0.1, type: 'C', wall: 'townWallC', roof: 'townRoofSlate', hasTree: true, hasCar: true, carCol: 'carPaintA' },
  { id: 213, x: -55, z: -14, rot: 0.12, type: 'B', wall: 'townWall', roof: 'townRoofAlt', hasTree: true, hasCar: true, carCol: 'carPaintA' },
  { id: 214, x: -55, z: 0, rot: -0.08, type: 'A', wall: 'townWallAlt', roof: 'townRoof', hasTree: false, hasCar: false },
  { id: 215, x: -55, z: 14, rot: 0.15, type: 'B', wall: 'townWallAlt', roof: 'townRoofAlt', hasTree: true, hasCar: true, carCol: 'carPaintB' },
  { id: 216, x: -62, z: -8, rot: -0.05, type: 'C', wall: 'townWallC', roof: 'townRoofSlate', hasTree: true, hasCar: false },
  { id: 217, x: -62, z: 6, rot: 0.1, type: 'A', wall: 'townWall', roof: 'townRoof', hasTree: false, hasCar: true, carCol: 'carPaintA' },
  { id: 218, x: -68, z: -14.5, rot: 0.18, type: 'B', wall: 'townWallAlt', roof: 'townRoofAlt', hasTree: true, hasCar: false },
  { id: 219, x: -68, z: 0, rot: -0.12, type: 'A', wall: 'townWall', roof: 'townRoof', hasTree: true, hasCar: true, carCol: 'carPaintB' },
  { id: 220, x: -68, z: 12, rot: 0.08, type: 'C', wall: 'townWallC', roof: 'townRoofSlate', hasTree: false, hasCar: false },
  { id: 221, x: -74, z: -8, rot: 0.1, type: 'A', wall: 'townWallAlt', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 222, x: -74, z: 6, rot: -0.15, type: 'C', wall: 'townWallC', roof: 'townRoofSlate', hasTree: false, hasCar: true, carCol: 'carPaintB' },

  // === OST-DORF (Rechts / +x, reicht bis x = 74) ==============================
  { id: 301, x: 21, z: -10, rot: -0.1, type: 'C', wall: 'townWallC', roof: 'townRoofSlate', hasTree: true, hasCar: true, carCol: 'carPaintA' },
  { id: 302, x: 21, z: 0, rot: 0.08, type: 'A', wall: 'townWall', roof: 'townRoof', hasTree: false, hasCar: false },
  { id: 303, x: 21, z: 10, rot: -0.12, type: 'B', wall: 'townWallAlt', roof: 'townRoofAlt', hasTree: true, hasCar: true, carCol: 'carPaintB' },
  { id: 304, x: 29, z: -14, rot: 0.15, type: 'B', wall: 'townWall', roof: 'townRoofAlt', hasTree: false, hasCar: true, carCol: 'carPaintA' },
  { id: 305, x: 29, z: -4, rot: -0.05, type: 'A', wall: 'townWallAlt', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 306, x: 29, z: 6, rot: 0.1, type: 'C', wall: 'townWallC', roof: 'townRoofSlate', hasTree: false, hasCar: true, carCol: 'carPaintB' },
  { id: 307, x: 38, z: -10, rot: 0.05, type: 'A', wall: 'townWall', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 308, x: 38, z: 0, rot: -0.08, type: 'B', wall: 'townWall', roof: 'townRoofAlt', hasTree: false, hasCar: true, carCol: 'carPaintA' },
  { id: 309, x: 38, z: 10, rot: 0.12, type: 'C', wall: 'townWallC', roof: 'townRoofSlate', hasTree: true, hasCar: true, carCol: 'carPaintB' },
  { id: 310, x: 45, z: -5, rot: -0.15, type: 'A', wall: 'townWallAlt', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 311, x: 45, z: 7, rot: 0.1, type: 'B', wall: 'townWall', roof: 'townRoofAlt', hasTree: false, hasCar: true, carCol: 'carPaintA' },
  { id: 312, x: 55, z: -14, rot: -0.1, type: 'C', wall: 'townWallC', roof: 'townRoofSlate', hasTree: true, hasCar: true, carCol: 'carPaintB' },
  { id: 313, x: 55, z: 0, rot: 0.08, type: 'A', wall: 'townWall', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 314, x: 55, z: 14, rot: -0.15, type: 'B', wall: 'townWallAlt', roof: 'townRoofAlt', hasTree: false, hasCar: true, carCol: 'carPaintA' },
  { id: 315, x: 62, z: -8, rot: 0.12, type: 'A', wall: 'townWallAlt', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 316, x: 62, z: 6, rot: -0.05, type: 'C', wall: 'townWallC', roof: 'townRoofSlate', hasTree: true, hasCar: true, carCol: 'carPaintB' },
  { id: 317, x: 68, z: -14.5, rot: 0.08, type: 'B', wall: 'townWall', roof: 'townRoofAlt', hasTree: false, hasCar: true, carCol: 'carPaintA' },
  { id: 318, x: 68, z: 0, rot: -0.18, type: 'A', wall: 'townWallAlt', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 319, x: 68, z: 12, rot: 0.1, type: 'C', wall: 'townWallC', roof: 'townRoofSlate', hasTree: true, hasCar: false },
  { id: 320, x: 74, z: -8, rot: -0.05, type: 'B', wall: 'townWall', roof: 'townRoofAlt', hasTree: true, hasCar: true, carCol: 'carPaintA' },
  { id: 321, x: 74, z: 6, rot: 0.12, type: 'A', wall: 'townWallAlt', roof: 'townRoof', hasTree: true, hasCar: false },

  // === SÜD-DORF (Unterhalb / +z, vollkommen wasserfrei & strassenfrei) =======
  // Nordufer-Bezirk (vor dem Flusslauf)
  { id: 401, x: -23, z: 14.5, rot: 0.08, type: 'A', wall: 'townWall', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 402, x: 15, z: 18.0, rot: -0.1, type: 'A', wall: 'townWallAlt', roof: 'townRoof', hasTree: false, hasCar: false },
  { id: 403, x: -24, z: 28, rot: 0.15, type: 'B', wall: 'townWallAlt', roof: 'townRoofAlt', hasTree: false, hasCar: true, carCol: 'carPaintA' },
  { id: 404, x: -5, z: 26.0, rot: -0.05, type: 'B', wall: 'townWall', roof: 'townRoofAlt', hasTree: true, hasCar: true, carCol: 'carPaintB' },
  { id: 405, x: 9, z: 26.0, rot: 0.1, type: 'C', wall: 'townWallC', roof: 'townRoofSlate', hasTree: true, hasCar: true, carCol: 'carPaintA' },
  { id: 406, x: -5, z: 33.0, rot: -0.12, type: 'A', wall: 'townWallAlt', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 407, x: 5, z: 33.0, rot: 0.08, type: 'B', wall: 'townWallAlt', roof: 'townRoofAlt', hasTree: false, hasCar: true, carCol: 'carPaintB' },
  { id: 408, x: 15, z: 26, rot: -0.15, type: 'C', wall: 'townWallC', roof: 'townRoofSlate', hasTree: true, hasCar: false },

  // Südufer-Bezirk (hinter dem Fluss & jenseits der Brücke: Zeilen bei z = 63 und z = 70)
  { id: 409, x: -28, z: 63, rot: 0.1, type: 'A', wall: 'townWall', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 410, x: -18, z: 63, rot: -0.08, type: 'B', wall: 'townWallAlt', roof: 'townRoofAlt', hasTree: true, hasCar: true, carCol: 'carPaintA' },
  { id: 411, x: -5, z: 63, rot: 0.05, type: 'A', wall: 'townWallAlt', roof: 'townRoof', hasTree: false, hasCar: false },
  { id: 412, x: 6, z: 63, rot: -0.1, type: 'C', wall: 'townWallC', roof: 'townRoofSlate', hasTree: true, hasCar: true, carCol: 'carPaintB' },
  { id: 413, x: 18, z: 63, rot: 0.18, type: 'B', wall: 'townWall', roof: 'townRoofAlt', hasTree: false, hasCar: true, carCol: 'carPaintA' },
  { id: 414, x: 28, z: 63, rot: -0.05, type: 'A', wall: 'townWall', roof: 'townRoof', hasTree: true, hasCar: false },
  { id: 415, x: -22, z: 70, rot: 0.12, type: 'C', wall: 'townWallC', roof: 'townRoofSlate', hasTree: true, hasCar: false },
  { id: 416, x: -11, z: 70, rot: -0.15, type: 'A', wall: 'townWall', roof: 'townRoof', hasTree: false, hasCar: true, carCol: 'carPaintB' },
  { id: 417, x: 11, z: 70, rot: 0.08, type: 'B', wall: 'townWallAlt', roof: 'townRoofAlt', hasTree: true, hasCar: false },
  { id: 418, x: 22, z: 70, rot: -0.1, type: 'A', wall: 'townWallAlt', roof: 'townRoof', hasTree: true, hasCar: true, carCol: 'carPaintA' },
];

// Grundstücke nach Abstand zum Zentrum (0, 0) sortieren (360° Verdrängung)
LOTS.sort((a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z));
const LOT_COUNT = LOTS.length;

// Kirche / Dorfmittelpunkt am Südrand des Zentrums
const CHURCH_POS = { x: -16, z: 27 };

// --- 2. SEE & FLUSS GEOMETRIE-DATEN ---------------------------------------------
const LAKE_CENTER = { x: 26, z: 24 };
const LAKE_RADIUS = 5.8;

// Der Fluss fließt quer über das gesamte Spielfeld (weicht der zentralen Ofen-Allee nach Süden aus)
const RIVER_POINTS = [
  { x: -80, z: 35 },
  { x: -55, z: 34 },
  { x: -30, z: 36 },
  { x: -16, z: 42 },
  { x: -10, z: 50 }, // Hier kreuzt die Bogenbrücke der Nebenstraße!
  { x: -6, z: 55 },
  { x: 0, z: 57 }, // Bogen weit südlich der Ofen-Allee (die Allee endet bei z = 48)
  { x: 6, z: 55 },
  { x: 12, z: 49 },
  { x: 18, z: 40 },
  { x: LAKE_CENTER.x - LAKE_RADIUS * 0.75, z: LAKE_CENTER.z + LAKE_RADIUS * 0.75 }, // fließt nah am See vorbei
  { x: 42, z: 36 },
  { x: 62, z: 35 },
  { x: 80, z: 36.5 },
];
const RIVER_WIDTH = 2.4;

// Brückenposition bei x = -10, z = 50
const BRIDGE_POS = { x: -10, z: 50 };

// Bootssteg am See
const PIER_START = { x: LAKE_CENTER.x - 3.2, z: LAKE_CENTER.z - 2.8 };
const PIER_END = { x: LAKE_CENTER.x - 1.0, z: LAKE_CENTER.z - 0.4 };
const BOAT_POS = { x: PIER_END.x + 0.8, z: PIER_END.z + 0.5 };

// Seerosen auf dem See (5 Blütenpads)
const LILY_PADS = [
  { x: LAKE_CENTER.x + 1.0, z: LAKE_CENTER.z + 1.4, r: 0.45 },
  { x: LAKE_CENTER.x + 2.2, z: LAKE_CENTER.z - 0.8, r: 0.55 },
  { x: LAKE_CENTER.x - 0.6, z: LAKE_CENTER.z + 2.5, r: 0.4 },
  { x: LAKE_CENTER.x + 3.0, z: LAKE_CENTER.z + 1.6, r: 0.5 },
  { x: LAKE_CENTER.x - 1.5, z: LAKE_CENTER.z + 1.1, r: 0.48 },
];

// Schilfhalme an See- und Flussufern
const REED_SPOTS = [
  { x: LAKE_CENTER.x + 4.2, z: LAKE_CENTER.z - 2.8 },
  { x: LAKE_CENTER.x + 4.8, z: LAKE_CENTER.z + 0.5 },
  { x: LAKE_CENTER.x + 3.5, z: LAKE_CENTER.z + 3.6 },
  { x: LAKE_CENTER.x - 3.5, z: LAKE_CENTER.z + 3.2 },
  { x: -22, z: 34.2 },
  { x: 2, z: 54.5 },
  { x: 45, z: 34.5 },
  { x: -44, z: 33.8 },
];

// Straßennetz: Verbindungsstraßen bis an die Ränder des Spielfelds
const ROAD_SEGMENTS = [
  // ZENTRALE OFEN-HAUPTSTRASSE (Permanente, unblockierte Zufahrts-Allee bis an den Spielfeldrand bei z = 380)
  { a: { x: 0, z: 380 }, b: { x: 0, z: 2.2 }, w: 2.5 },
  { a: { x: -3.6, z: 3.6 }, b: { x: 3.6, z: 3.6 }, w: 3.2 },
  { a: { x: -10, z: 22 }, b: { x: 0, z: 22 }, w: 2.2 },

  // Nord-Süd Hauptverbindung (führt über die Brücke bei z: 50)
  { a: { x: -10, z: -64 }, b: { x: -10, z: 47 }, w: 1.8 },
  { a: { x: -10, z: 53 }, b: { x: -10, z: 66.5 }, w: 1.8 },

  // Norddorf-Netz (Straßen verlaufen harmonisch ZWISCHEN den Häuserzeilen)
  { a: { x: -45, z: -23 }, b: { x: 45, z: -23 }, w: 1.5 },
  { a: { x: -45, z: -37 }, b: { x: 45, z: -37 }, w: 1.5 },
  { a: { x: -38, z: -55 }, b: { x: 38, z: -55 }, w: 1.5 },
  { a: { x: -28, z: -63.5 }, b: { x: 28, z: -63.5 }, w: 1.4 },

  // Westdorf-Netz (Ringstraßen oben und unten, Querverbindung bei x = -50)
  { a: { x: -74, z: -18 }, b: { x: -21, z: -18 }, w: 1.5 },
  { a: { x: -74, z: 18 }, b: { x: -21, z: 18 }, w: 1.5 },
  { a: { x: -50, z: -18 }, b: { x: -50, z: 18 }, w: 1.4 },

  // Ostdorf-Netz (Ringstraßen oben und unten, Querverbindung bei x = 50)
  { a: { x: 21, z: -18 }, b: { x: 74, z: -18 }, w: 1.5 },
  { a: { x: 21, z: 18 }, b: { x: 74, z: 18 }, w: 1.5 },
  { a: { x: 50, z: -18 }, b: { x: 50, z: 18 }, w: 1.4 },

  // Süddorf-Netz Nordufer (vor dem Fluss)
  { a: { x: -30, z: 22 }, b: { x: -10, z: 22 }, w: 1.6 },
  { a: { x: 0, z: 22 }, b: { x: 20, z: 22 }, w: 1.6 },
  { a: { x: -16, z: 22 }, b: { x: -16, z: 23.5 }, w: 1.4 }, // Zufahrt zum Kirchplatz
  { a: { x: 18, z: 22 }, b: { x: LAKE_CENTER.x - 3.2, z: LAKE_CENTER.z - 2.8 }, w: 1.3 }, // Seeweg

  // Süddorf-Netz Südufer (hinter dem Fluss: Straße bei z = 66.5 zwischen den beiden Häuserzeilen)
  { a: { x: -35, z: 66.5 }, b: { x: 35, z: 66.5 }, w: 1.6 },
];

// ===============================================================================
// MAIN BUILDER FUNCTION
// ===============================================================================
export function buildEnvironment(palette) {
  const group = new THREE.Group();
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

  const dummy = new THREE.Object3D();

  // --- 3. GEWÄSSER: SEE & FLUSS --------------------------------------------------
  const bedMat = lambert('soilDeep');
  const sandMat = lambert('sand');
  const waterMat = lambert('water', { transparent: true, opacity: 0.90 });

  // See-Boden & Sandstrand (organisches 14-Eck)
  const lakeBedGeo = new THREE.CylinderGeometry(LAKE_RADIUS + 0.8, LAKE_RADIUS + 0.8, 0.15, 14);
  const lakeBedMesh = new THREE.Mesh(lakeBedGeo, bedMat);
  lakeBedMesh.position.set(LAKE_CENTER.x, 0.02, LAKE_CENTER.z);
  lakeBedMesh.receiveShadow = true;
  group.add(lakeBedMesh);

  // Sandstrand-Ring um den See
  const beachGeo = new THREE.RingGeometry(LAKE_RADIUS - 0.2, LAKE_RADIUS + 0.9, 14);
  const beachMesh = new THREE.Mesh(beachGeo, sandMat);
  beachMesh.rotation.x = -Math.PI / 2;
  beachMesh.position.set(LAKE_CENTER.x, 0.035, LAKE_CENTER.z);
  beachMesh.receiveShadow = true;
  group.add(beachMesh);

  // See-Wasserfläche
  const lakeWaterGeo = new THREE.CylinderGeometry(LAKE_RADIUS, LAKE_RADIUS, 0.16, 14);
  const lakeWater = new THREE.Mesh(lakeWaterGeo, waterMat);
  lakeWater.position.set(LAKE_CENTER.x, 0.08, LAKE_CENTER.z);
  group.add(lakeWater);

  // Flussbett und Flusswasser-Segmente
  const riverGroup = new THREE.Group();
  const riverWaterGroup = new THREE.Group();
  group.add(riverGroup);
  group.add(riverWaterGroup);

  for (let i = 0; i < RIVER_POINTS.length - 1; i += 1) {
    const p1 = RIVER_POINTS[i];
    const p2 = RIVER_POINTS[i + 1];
    const dx = p2.x - p1.x;
    const dz = p2.z - p1.z;
    const len = Math.hypot(dx, dz);
    const rot = Math.atan2(dx, dz);
    const midX = (p1.x + p2.x) / 2;
    const midZ = (p1.z + p2.z) / 2;

    // Sandiges / kiesiges Uferbett
    const rBed = new THREE.Mesh(new THREE.BoxGeometry(RIVER_WIDTH + 1.2, 0.12, len + 0.6), sandMat);
    rBed.position.set(midX, 0.02, midZ);
    rBed.rotation.y = rot;
    rBed.receiveShadow = true;
    riverGroup.add(rBed);

    // Wasserlauf
    const rWater = new THREE.Mesh(new THREE.BoxGeometry(RIVER_WIDTH, 0.14, len), waterMat);
    rWater.position.set(midX, 0.075, midZ);
    rWater.rotation.y = rot;
    riverWaterGroup.add(rWater);
  }

  // --- 4. BRÜCKE ÜBER DEN FLUSS ---------------------------------------------------
  // Schöne Stein- & Holzbogenbrücke
  const stoneMat = lambert('stone');
  const woodDarkMat = lambert('woodDark');
  const woodLightMat = lambert('woodLight');
  const roadMat = lambert('path');
  const curbMat = lambert('stoneDark');
  const dashMat = basic('facade');
  const lampPoleMat = lambert('steelDark');
  const lampLightMat = basic('fireCore');

  const bridgeGroup = new THREE.Group();
  bridgeGroup.position.set(BRIDGE_POS.x, 0, BRIDGE_POS.z);

  // Pfeiler links & rechts des Flusses
  [-1.5, 1.5].forEach((offsetSide) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.5, 0.9), stoneMat);
    pillar.position.set(0, 0.25, offsetSide * 1.8);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    bridgeGroup.add(pillar);
  });

  // Fahrbahndeck der Brücke
  const deck = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.2, 4.4), woodLightMat);
  deck.position.set(0, 0.38, 0);
  deck.castShadow = true;
  deck.receiveShadow = true;
  bridgeGroup.add(deck);

  // Geländer der Brücke (links und rechts)
  [-1.0, 1.0].forEach((side) => {
    const railBeam = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 4.4), woodDarkMat);
    railBeam.position.set(side, 0.72, 0);
    bridgeGroup.add(railBeam);

    [-1.8, -0.9, 0, 0.9, 1.8].forEach((postZ) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.12), woodDarkMat);
      post.position.set(side, 0.55, postZ);
      post.castShadow = true;
      bridgeGroup.add(post);
    });
  });
  group.add(bridgeGroup);

  // --- 4b. HAUPTBRÜCKE DER OFEN-ALLEE (x: 0, z: 57) -----------------------------
  // Führt die zentrale Zufahrtsstraße über den Fluss in den südlichen Dorfteil
  const avenueBridgeGroup = new THREE.Group();
  avenueBridgeGroup.position.set(0, 0, 57);

  // Massive Steinpfeiler an den Ufern
  [-2.3, 2.3].forEach((offsetSide) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.45, 1.1), stoneMat);
    pillar.position.set(0, 0.22, offsetSide);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    avenueBridgeGroup.add(pillar);
  });

  // Breites Fahrbahndeck
  const avenueDeck = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.18, 5.2), roadMat);
  avenueDeck.position.set(0, 0.22, 0);
  avenueDeck.castShadow = true;
  avenueDeck.receiveShadow = true;
  avenueBridgeGroup.add(avenueDeck);

  // Steingeländer mit Voxel-Brüstung links und rechts
  [-1.45, 1.45].forEach((side) => {
    const railBeam = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 5.2), curbMat);
    railBeam.position.set(side, 0.42, 0);
    railBeam.castShadow = true;
    avenueBridgeGroup.add(railBeam);

    [-2.2, -1.1, 0, 1.1, 2.2].forEach((postZ) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.35, 0.24), stoneMat);
      post.position.set(side, 0.45, postZ);
      post.castShadow = true;
      avenueBridgeGroup.add(post);
    });
  });
  group.add(avenueBridgeGroup);

  // --- 5. BOOTSSTEG & SCHAUKELNDES RUDERBOOT -------------------------------------
  const pierGroup = new THREE.Group();
  const pDx = PIER_END.x - PIER_START.x;
  const pDz = PIER_END.z - PIER_START.z;
  const pLen = Math.hypot(pDx, pDz);
  const pRot = Math.atan2(pDx, pDz);

  const pierDeck = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, pLen), woodLightMat);
  pierDeck.position.set((PIER_START.x + PIER_END.x) / 2, 0.22, (PIER_START.z + PIER_END.z) / 2);
  pierDeck.rotation.y = pRot;
  pierDeck.castShadow = true;
  pierGroup.add(pierDeck);

  // Pfähle im Wasser
  [0.1, 0.5, 0.9].forEach((f) => {
    const px = PIER_START.x + pDx * f;
    const pz = PIER_START.z + pDz * f;
    [-0.38, 0.38].forEach((s) => {
      const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 5), woodDarkMat);
      pile.position.set(px + -Math.cos(pRot) * s, 0.14, pz + Math.sin(pRot) * s);
      pierGroup.add(pile);
    });
  });
  group.add(pierGroup);

  // Ruderboot am Stegende (animiert)
  const boatGroup = new THREE.Group();
  boatGroup.position.set(BOAT_POS.x, 0.12, BOAT_POS.z);
  boatGroup.rotation.y = pRot + 0.35;

  const boatHull = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.24, 1.4), woodDarkMat);
  boatHull.castShadow = true;
  boatGroup.add(boatHull);

  const boatSeat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.25), woodLightMat);
  boatSeat.position.set(0, 0.08, 0);
  boatGroup.add(boatSeat);

  // Ruder
  const oar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.06), woodLightMat);
  oar.position.set(0, 0.16, -0.1);
  oar.rotation.z = 0.15;
  boatGroup.add(oar);
  group.add(boatGroup);

  // Seerosen & Blüten
  const lilyPadMat = lambert('lilyPad');
  const lilyFlowerMat = lambert('lilyFlower');
  LILY_PADS.forEach((lp) => {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(lp.r, lp.r, 0.02, 7), lilyPadMat);
    pad.position.set(lp.x, 0.14, lp.z);
    group.add(pad);

    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.12, 5, 4), lilyFlowerMat);
    flower.position.set(lp.x + 0.08, 0.20, lp.z);
    group.add(flower);
  });

  // Schilf-Pflanzen (Zylinder mit bräunlichen Spitzen)
  const reedMat = lambert('reed');
  const reedHeadMat = lambert('woodDark');
  REED_SPOTS.forEach((spot, si) => {
    for (let k = 0; k < 4; k += 1) {
      const rx = spot.x + ((k % 2) - 0.5) * 0.4;
      const rz = spot.z + (Math.floor(k / 2) - 0.5) * 0.4;
      const h = 0.65 + ((si + k) % 3) * 0.15;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, h, 4), reedMat);
      stem.position.set(rx, h / 2, rz);
      stem.rotation.z = (((k * 13) % 7) - 3) * 0.04;
      group.add(stem);

      const head = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.2, 4), reedHeadMat);
      head.position.set(rx, h + 0.02, rz);
      group.add(head);
    }
  });

  // --- 6. STRASSENNETZ DES DORFES ------------------------------------------------
  ROAD_SEGMENTS.forEach((seg) => {
    const dx = seg.b.x - seg.a.x;
    const dz = seg.b.z - seg.a.z;
    const len = Math.hypot(dx, dz);
    const rot = Math.atan2(dx, dz);
    const midX = (seg.a.x + seg.b.x) / 2;
    const midZ = (seg.a.z + seg.b.z) / 2;

    const r = new THREE.Mesh(new THREE.BoxGeometry(seg.w, 0.06, len), roadMat);
    r.position.set(midX, 0.04, midZ);
    r.rotation.y = rot;
    r.receiveShadow = true;
    group.add(r);

    // Bordsteine links & rechts für Hauptzufahrtsstraßen
    if (seg.w >= 2.0) {
      [-seg.w / 2 - 0.08, seg.w / 2 + 0.08].forEach((cx) => {
        const curb = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, len), curbMat);
        curb.position.set(midX + Math.cos(rot) * cx, 0.05, midZ - Math.sin(rot) * cx);
        curb.rotation.y = rot;
        group.add(curb);
      });
    }
  });

  // Fahrbahn-Mittelstreifen auf der Ofen-Allee bis an den Spielfeldrand (x = 0 von z = 6 bis z = 378)
  for (let z = 6; z <= 378; z += 3.2) {
    const isBridge = z >= 54.5 && z <= 59.5;
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.065, 1.4), dashMat);
    dash.position.set(0, isBridge ? 0.32 : 0.045, z);
    group.add(dash);
  }

  // Straßenlaternen entlang der Hauptzufahrt zum Serverkamin bis ins Süddorf
  [8, 16, 24, 32, 40, 48, 64, 72, 80, 96, 112, 128].forEach((lz) => {
    [-1.7, 1.7].forEach((lx) => {
      const pole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 0.12), lampPoleMat);
      pole.position.set(lx, 1.1, lz);
      pole.castShadow = true;
      group.add(pole);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.3), lampLightMat);
      head.position.set(lx, 2.25, lz);
      group.add(head);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 0.42), lampPoleMat);
      cap.position.set(lx, 2.45, lz);
      group.add(cap);
    });
  });

  // --- 7. DORFKIRCHE & DORFPLATZ -------------------------------------------------
  const churchGroup = new THREE.Group();
  churchGroup.position.set(CHURCH_POS.x, 0, CHURCH_POS.z);

  // Kirchplatz-Pflaster
  const plazaMat = lambert('stoneDark');
  const plaza = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.07, 7.0), plazaMat);
  plaza.position.set(0, 0.035, 0);
  plaza.receiveShadow = true;
  churchGroup.add(plaza);

  // Kirche als ein Voxel-Modell (Raster 0,1): Schiff mit Satteldach und Rundbogen-
  // fenstern, Glockenturm mit Schallöffnungen, Uhr und Spitzhelm, Portal.
  const churchKit = createVoxelKit(palette);
  const churchGeo = churchKit.geo((m) => {
    // Schiff: x -12..23, z -13..12, Höhe 24; Turm x -24..-10
    m.box(-12, 0, -13, 36, 24, 26, 'townWall', { noise: 0.03, seed: 51 });
    m.box(-12, 0, -13, 36, 1, 26, 'stoneDark');
    for (let l = 0; l < 13; l += 1) {
      m.box(-14, 24 + l, -14 + l, 40, 1, 28 - 2 * l, 'townRoofSlate', { noise: 0.06, seed: 60 + l });
    }
    // Rundbogenfenster an der Längsseite (+z) und Portal
    [-6, 2, 10, 18].forEach((x) => {
      m.box(x, 6, 12, 3, 9, 1, 'windowGlass');
      m.box(x + 1, 15, 12, 1, 1, 1, 'windowGlass');
      m.box(x - 1, 5, 12, 5, 1, 1, 'stone');
    });
    m.box(2, 0, 12, 6, 12, 1, 'stone');
    m.box(3, 0, 12, 4, 10, 1, 'woodDark');
    m.set(4, 10, 12, 'woodDark');
    m.set(5, 10, 12, 'woodDark');
    m.box(3, 0, 13, 4, 1, 2, 'stone');
    // Turm
    m.box(-24, 0, -7, 14, 48, 14, 'townWall', { noise: 0.03, seed: 52 });
    m.box(-24, 0, -7, 14, 1, 14, 'stoneDark');
    m.box(-25, 30, -8, 16, 1, 16, 'stone');
    [[-17, 6], [-25, 0]].forEach(([x, z]) => {
      m.box(x, 36, z, 2, 6, 1, 'tapeBlack');
    });
    m.box(-18, 36, 6, 4, 6, 1, 'tapeBlack');
    m.box(-18, 38, 6, 4, 1, 1, 'woodDark');
    m.box(-18, 40, 6, 4, 1, 1, 'woodDark');
    m.box(-25, 36, -2, 1, 6, 4, 'tapeBlack');
    m.box(-25, 38, -2, 1, 1, 4, 'woodDark');
    m.box(-25, 40, -2, 1, 1, 4, 'woodDark');
    // Uhr
    m.cylinder(-17, 7, 43, 1, 3.2, 'gold');
    m.set(-17, 43, 7, 'tapeBlack');
    m.set(-17, 44, 7, 'tapeBlack');
    m.set(-16, 43, 7, 'tapeBlack');
    // Spitzhelm
    for (let l = 0; l < 26; l += 1) {
      const r = Math.max(1, 8 - Math.floor(l * 0.3));
      m.box(-17 - r, 48 + l, -r, 2 * r, 1, 2 * r, 'townRoofSlate', { noise: 0.06, seed: 80 + l });
    }
    m.box(-18, 74, -1, 2, 5, 2, 'gold');
    m.box(-19, 76, -1, 4, 1, 2, 'gold');
  }, { unit: 0.1, unlit: new Set(['windowGlass']), faceShade: 0.04 });
  const church = new THREE.Mesh(churchGeo, churchKit.mats);
  church.castShadow = true;
  church.receiveShadow = true;
  church.position.set(0, 0, 0);
  churchGroup.add(church);

  group.add(churchGroup);

  // --- 8. DORFHÄUSER (INSTANCED MESHES FÜR HOHE PERFORMANCE) --------------------

  const smokeMat = basic('smoke', { transparent: true, opacity: 0.75 });
  const kit = createVoxelKit(palette);

  // --- Voxel-Häuser ----------------------------------------------------------------
  // Ein Modell je Kombination aus Haustyp (A: Vordach, B: Garage, C: Gaube), Wand- und
  // Dachfarbe - Farben stecken in den Vertizes, deshalb ein InstancedMesh je Kombination
  // (fünf Stück für die 48 Parzellen). Raster 0,1; Front (Tür, Fenster, Zaun) zeigt +z.
  function houseModel(m, type, wallKey, roofKey) {
    m.box(-11, 0, -9, 23, 15, 19, wallKey, { noise: 0.03, seed: 1 });
    m.box(-11, 0, -9, 23, 1, 19, 'stoneDark');
    // Walmdach mit Überstand, Ziegelreihen leicht abgestuft
    for (let l = 0; l <= 10; l += 1) {
      m.box(-13 + l, 15 + l, -11 + l, 26 - 2 * l, 1, 22 - 2 * l, roofKey, { noise: 0.06, seed: 20 + l });
    }
    // Kamin
    m.box(4, 15, 2, 3, 13, 3, 'brickDark');
    m.box(4, 27, 2, 3, 1, 3, 'stoneDark');
    // Tür mit Rahmen und Klinke, Weg zum Zaun
    m.box(-3, 1, 9, 6, 8, 1, 'woodDark');
    m.box(-2, 1, 9, 4, 7, 1, 'woodLight');
    m.set(1, 4, 10, 'gold');
    m.box(-2, 0, 10, 4, 1, 5, 'stone');
    // Fenster vorn (zwei) und je eines an den Seiten, mit Rahmen und Fensterbank
    [[-7, 9], [5, 9]].forEach(([x, z]) => {
      m.box(x - 1, 5, z, 5, 6, 1, 'woodDark');
      m.box(x, 6, z, 3, 4, 1, 'windowGlass');
      m.box(x - 1, 5, z + 1, 5, 1, 1, 'woodDark');
    });
    [[-11, -2], [11, -2]].forEach(([x, z]) => {
      m.box(x, 5, z - 1, 1, 6, 5, 'woodDark');
      m.box(x, 6, z, 1, 4, 3, 'windowGlass');
    });
    // Gartenzaun mit Tor-Lücke
    for (let x = -13; x <= 12; x += 2) {
      if (x >= -2 && x <= 1) continue;
      m.box(x, 0, 15, 1, 4, 1, 'woodLight');
    }
    m.box(-13, 1, 15, 11, 1, 1, 'woodLight');
    m.box(2, 1, 15, 11, 1, 1, 'woodLight');
    m.box(-13, 3, 15, 11, 1, 1, 'woodLight');
    m.box(2, 3, 15, 11, 1, 1, 'woodLight');
    if (type === 'A') {
      // Vordach über der Tür auf zwei Pfosten
      m.box(-4, 9, 10, 8, 1, 3, roofKey, { noise: 0.06, seed: 40 });
      m.box(-4, 1, 12, 1, 8, 1, 'woodDark');
      m.box(3, 1, 12, 1, 8, 1, 'woodDark');
    } else if (type === 'B') {
      // Garage mit Flachdach und Rolltor
      m.box(9, 0, -8, 14, 10, 17, 'townWallAlt', { noise: 0.03, seed: 5 });
      m.box(8, 10, -9, 16, 1, 19, 'townRoofSlate');
      m.box(11, 1, 8, 10, 8, 1, 'woodLight');
      for (let y = 2; y < 9; y += 2) for (let x = 11; x < 21; x += 1) m.set(x, y, 8, 'woodLight', 0.82);
    } else {
      // Gaube mit eigenem Fenster
      m.box(-3, 17, 3, 6, 5, 7, wallKey, { noise: 0.03, seed: 6 });
      m.box(-4, 22, 2, 8, 1, 9, roofKey, { noise: 0.06, seed: 41 });
      m.box(-2, 18, 9, 4, 3, 1, 'windowGlass');
    }
  }
  const HOUSE_UNLIT = new Set(['windowGlass']);
  const houseMeshes = {};
  LOTS.forEach((slot) => {
    const key = `${slot.type}|${slot.wall}|${slot.roof}`;
    if (houseMeshes[key]) return;
    const geo = kit.geo((m) => houseModel(m, slot.type, slot.wall, slot.roof), { unit: 0.1, unlit: HOUSE_UNLIT, faceShade: 0.04 });
    houseMeshes[key] = new THREE.InstancedMesh(geo, kit.mats, LOT_COUNT);
  });
  const houseKey = (slot) => `${slot.type}|${slot.wall}|${slot.roof}`;

  // Rauch-Puff aus Kamin (Voxel-Wölkchen, halbtransparent)
  const smokeVoxMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.75 });
  const puffGeo = kit.geo((m) => {
    m.sphere(0, 0, 0, 2.3, 'smoke');
    m.sphere(2, 1, 0, 1.6, 'smoke', { seed: 2 });
    m.sphere(-1, 2, 1, 1.5, 'smoke', { seed: 3 });
  }, { unit: 0.08, origin: [0.5, 0.5, 0.5], unlit: () => true });
  const chimneySmokes = new THREE.InstancedMesh(puffGeo, [kit.lambert, smokeVoxMat], LOT_COUNT);

  // Vorgarten-Bäume (Schirmkrone, klein) und parkende Autos (zwei Lackfarben)
  const gardenTreeGeo = kit.geo((m) => tree(m, 2, 31), { unit: TREE_UNIT });
  const gardenTrees = new THREE.InstancedMesh(gardenTreeGeo, kit.mats, LOT_COUNT);
  const carGeoA = kit.geo((m) => car(m, 'carPaintA'), { unit: CAR_UNIT, unlit: new Set(['fireCore', 'warnRed']) });
  const carGeoB = kit.geo((m) => car(m, 'carPaintB'), { unit: CAR_UNIT, unlit: new Set(['fireCore', 'warnRed']) });
  const carsA = new THREE.InstancedMesh(carGeoA, kit.mats, LOT_COUNT);
  const carsB = new THREE.InstancedMesh(carGeoB, kit.mats, LOT_COUNT);

  const villageMeshes = [...Object.values(houseMeshes), chimneySmokes, gardenTrees, carsA, carsB];

  villageMeshes.forEach((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
    m.frustumCulled = false;
    m.count = 0;
    group.add(m);
  });

  // --- 9. GEWÄSSER-EFFEKTE --------------------------------------------------------

  // Industrielle Kühlrohre (vom Campus zum Fluss, wachsen mit Verdrängung)
  const pipeMat = lambert('steel');
  const coolingPipe = new THREE.Group();
  coolingPipe.position.set(-2, 0, 18);

  const pipeStraight = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 17, 8), pipeMat);
  pipeStraight.position.set(0, 0.45, 8.5);
  pipeStraight.rotation.x = Math.PI / 2;
  pipeStraight.castShadow = true;
  coolingPipe.add(pipeStraight);

  // Kühlrohr-Mündung am Fluss
  const pipeNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 1.0, 8), pipeMat);
  pipeNozzle.position.set(0, 0.4, 17.2);
  pipeNozzle.rotation.x = Math.PI / 2;
  coolingPipe.add(pipeNozzle);

  // Aufsteigender Dampf am Auslauf
  const steamMesh = new THREE.Mesh(new THREE.SphereGeometry(0.7, 6, 5), smokeMat);
  steamMesh.position.set(0, 0.9, 17.7);
  coolingPipe.add(steamMesh);

  coolingPipe.visible = false;
  group.add(coolingPipe);

  // Algenflecken auf See und Fluss bei hoher Verschmutzung
  const algaeMat = lambert('algae');
  const algaeSpots = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.55, 0), algaeMat, 16);
  algaeSpots.count = 0;
  group.add(algaeSpots);

  for (let i = 0; i < 16; i += 1) {
    const a = (i / 16) * Math.PI * 2;
    const isLake = i < 8;
    const ax = isLake ? LAKE_CENTER.x + Math.cos(a) * (LAKE_RADIUS * 0.5) : RIVER_POINTS[i - 8].x;
    const az = isLake ? LAKE_CENTER.z + Math.sin(a) * (LAKE_RADIUS * 0.5) : RIVER_POINTS[i - 8].z;
    dummy.position.set(ax, 0.13, az);
    dummy.rotation.set(0, i, 0);
    dummy.scale.set(0.7, 0.2, 0.7);
    dummy.updateMatrix();
    algaeSpots.setMatrixAt(i, dummy.matrix);
  }
  algaeSpots.instanceMatrix.needsUpdate = true;

  // --- 10. GEOMETRIE-LAYOUT DER HAUSPLÄTZE ---------------------------------------
  function renderHouse(slot, counters) {
    const rot = slot.rot || 0;
    const c = Math.cos(rot);
    const sn = Math.sin(rot);

    // 1. Haus (Wände, Dach, Kamin, Tür, Fenster, Zaun, Anbau - alles ein Modell)
    dummy.position.set(slot.x, 0, slot.z);
    dummy.rotation.set(0, rot, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    const key = houseKey(slot);
    houseMeshes[key].setMatrixAt(counters[key] || 0, dummy.matrix);
    counters[key] = (counters[key] || 0) + 1;

    // 2. Schornstein-Rauchpuff
    dummy.position.set(slot.x + c * 0.55 - sn * 0.35, 2.85, slot.z + sn * 0.55 + c * 0.35);
    dummy.scale.setScalar(0.7 + (counters.chimneySmoke % 3) * 0.15);
    dummy.updateMatrix();
    chimneySmokes.setMatrixAt(counters.chimneySmoke++, dummy.matrix);

    // 3. Parkendes Auto
    if (slot.hasCar) {
      dummy.position.set(slot.x + c * 2.1 - sn * 0.4, 0, slot.z + sn * 2.1 + c * 0.4);
      dummy.rotation.set(0, rot + 0.1, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      if (slot.carCol === 'carPaintB') {
        carsB.setMatrixAt(counters.carB++, dummy.matrix);
      } else {
        carsA.setMatrixAt(counters.carA++, dummy.matrix);
      }
    }

    // 4. Baum im Garten
    if (slot.hasTree) {
      dummy.position.set(slot.x - c * 1.6, 0, slot.z - sn * 1.6);
      dummy.rotation.set(0, slot.id * 0.7, 0);
      dummy.scale.setScalar(0.55);
      dummy.updateMatrix();
      gardenTrees.setMatrixAt(counters.tree++, dummy.matrix);
    }
  }

  // --- 11. 360°-DORF-AKTUALISIERUNG ---------------------------------------------
  let lastDisplacementKey = '';

  function applyDisplacement(progress, activeLots = [], zoneRects = []) {
    const progKey = Math.round(progress * 100);
    const key = `${progKey}_${activeLots.length}_${zoneRects.length}`;
    if (key === lastDisplacementKey) return;
    lastDisplacementKey = key;

    const counters = { chimneySmoke: 0, carA: 0, carB: 0, tree: 0 };

    // 1. Grundstücke filtern: Häuser verschwinden sofort, wenn ein Campus-Objekt
    // (Büro-Arbeitsplatz, Rechenzentrum, Bühne, Turm, Endgame) darauf platziert wird.
    // Das gesamte Vorortdorf besteht dauerhaft aus den gemütlichen kleinen Häusern (keine fetten Hochhäuser).
    const nonCampusLots = [];
    LOTS.forEach((slot) => {
      let occupied = false;
      // Kollision mit konkreten Gebäude-Grundstücken der Zonen (LOT_SIZE 3.6 -> Radius 4.2)
      for (let i = 0; i < activeLots.length; i += 1) {
        const dx = slot.x - activeLots[i].x;
        const dz = slot.z - activeLots[i].z;
        if (dx * dx + dz * dz < 18.0) {
          occupied = true;
          break;
        }
      }
      // Kollision mit Zonen-Grundflächen
      if (!occupied) {
        for (let i = 0; i < zoneRects.length; i += 1) {
          const r = zoneRects[i];
          if (
            slot.x >= r.minX - 1.2 &&
            slot.x <= r.maxX + 1.2 &&
            slot.z >= r.minZ - 1.2 &&
            slot.z <= r.maxZ + 1.2
          ) {
            occupied = true;
            break;
          }
        }
      }
      if (!occupied) {
        nonCampusLots.push(slot);
      }
    });

    // 2. Alle verbleibenden Parzellen als gemütliche kleine Vororthäuser rendern
    nonCampusLots.forEach((slot) => {
      renderHouse(slot, counters);
    });

    // Exakte Instanzen-Anzahl für jedes Bauteil-Mesh setzen
    Object.entries(houseMeshes).forEach(([key, mesh]) => {
      mesh.count = counters[key] || 0;
    });
    chimneySmokes.count = counters.chimneySmoke;
    carsA.count = counters.carA;
    carsB.count = counters.carB;
    gardenTrees.count = counters.tree;

    villageMeshes.forEach((m) => {
      m.instanceMatrix.needsUpdate = true;
    });

    coolingPipe.visible = progress > 0.15;
    algaeSpots.count = Math.round(progress * 16);

    const targetWaterCol = new THREE.Color(palette.water).lerp(new THREE.Color(palette.waterDirty), progress);
    waterMat.color.copy(targetWaterCol);
    const lakeShrink = 1 - progress * 0.25;
    lakeWater.scale.set(lakeShrink, 1, lakeShrink);
  }

  applyDisplacement(0, [], []);

  // --- 12. UPDATE & ANIMATION ---------------------------------------------------
  return {
    group,
    update(progress, t = 0, dt = 0.016, reduced = false, activeLots = [], zoneRects = []) {
      applyDisplacement(Math.min(1, Math.max(0, progress)), activeLots, zoneRects);

      if (reduced) return;

      // Sanftes Wippen des Ruderboots am See
      boatGroup.rotation.z = Math.sin(t * 1.7) * 0.05;
      boatGroup.position.y = 0.12 + Math.sin(t * 2.3) * 0.02;

      // Sanft pulsierender Kühlrohr-Dampf
      if (coolingPipe.visible) {
        const steamScale = 0.8 + Math.sin(t * 3.2) * 0.2;
        steamMesh.scale.set(steamScale, steamScale * 1.3, steamScale);
        steamMesh.position.y = 0.9 + (Math.sin(t * 2.5) + 1) * 0.15;
      }
    },

    applyPalette(newPal) {
      kit.applyPalette(newPal);
      churchKit.applyPalette(newPal);
      Object.entries(mats).forEach(([key, list]) => {
        if (key === 'water') return;
        list.forEach((m) => {
          if (newPal[key] !== undefined) m.color.setHex(newPal[key]);
        });
      });
      const p = Math.max(0, currentProgress);
      waterMat.color.copy(new THREE.Color(newPal.water).lerp(new THREE.Color(newPal.waterDirty), p));
    },
  };
}
