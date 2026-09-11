import { ISLAND_BASE_SIZE } from '../utils/campusLayout';

// Zonen-Layout der 3D-Insel.
//
// Raster 24 x 24 Einheiten, Ursprung in der Inselmitte, +Z ist vorne (zur Kamera hin).
// Der Ofen steht auf dem Ursprung und ist der Klick-Button; die fünf Zonen liegen als
// Grundflächen um ihn herum. `anchor3d` ist der Mittelpunkt der Zonen-Grundfläche,
// `footprint` deren Ausdehnung. `labelAnchor3d` (optional) setzt die Zonen-Stecknadel
// abweichend von der Standardregel (vom Ofen weg gerückt).
//
// Die Anker sind auf die kleinen Stecknadeln aus CampusScene.jsx getrimmt: bodennah
// (kleines y) am AUSSENrand der jeweiligen Platte, damit die Nadel über Gras oder
// Inselkante steht statt über den Gebäuden der Zone. Nach innen gerückte Anker landen
// in dieser Isometrie zwangsläufig auf dem Ofen bzw. dem Schlot - der liegt im
// Bildschirmraum genau zwischen den vier Zonen.
//
// Jede Engine hat `maxProps`: mehr Objekte als das zeichnet die Szene nie, darüber
// wächst nur noch die Zonen-Stufe (siehe ZONE_TIER_THRESHOLDS) und die Zahl am Schild.
// Was die Objekte konkret sind, entscheiden die Bauer in src/components/scene3d/.

// Basisgröße der Insel. Sie ist nicht mehr fix: sobald die Zonen über ihre
// Grundfläche hinaus bauen, wächst die Insel in Stufen mit (siehe utils/campusLayout.js
// und deriveIsland in utils/sceneState.js). ISLAND_SIZE bleibt das Maß, in dem die
// Geometrie gebaut wird - gewachsen wird über einen Skalierungsfaktor.
export const ISLAND_SIZE = ISLAND_BASE_SIZE;
export const FURNACE_ANCHOR = { x: 0, z: 0 };

// Ab welchem Zonen-Bestand eine Zone eine zusätzliche Halle NEBEN ihrer Grundfläche
// bekommt. Betrifft die Zonen ohne eigenes Grundstücks-Layout (siehe `plot` unten):
// deren Props stehen auf festen Plätzen, der Zuwachs wandert in die Anbauten.
export const ZONE_ANNEX_THRESHOLDS = [30, 80, 200, 500];

// Ab wie vielen Engines einer Zone deren Ausbaustufe steigt (0 = leer/verriegelt).
export const ZONE_TIER_THRESHOLDS = [1, 3, 8, 20, 50, 120, 300];

// `plot` an einer Engine heißt: ihre Objekte stehen nicht frei auf der Zonenplatte,
// sondern in Gebäuden mit fester Kapazität. Ist eines voll, entsteht das nächste
// NEBENAN (`axis` = Wachstumsrichtung, `lane` = Reihe quer dazu, `offset` = Startplatz
// in dieser Reihe). `maxProps` ist bei diesen Engines bewusst capacity * max - sonst
// stünde das letzte Gebäude halb leer da, während die Zahl am Schild weiterläuft.

export const ZONES_DATA = [
  {
    id: 'office',
    anchor3d: { x: -7, z: 6 },
    footprint: { w: 8, d: 7 },
    labelAnchor3d: { x: -10.8, y: 0.5, z: 8.2 },
    buildings: [
      { id: 'prompt_intern', maxProps: 16, plot: { capacity: 4, max: 4, axis: 'x', lane: 0 } },
      { id: 'prompt_engineer', maxProps: 8, plot: { capacity: 4, max: 2, axis: 'z', lane: 0, offset: 1 } },
      { id: 'chatbot_widget', maxProps: 10 },
    ],
  },
  {
    id: 'basement',
    annexMax: 4,
    anchor3d: { x: -7, z: -6 },
    footprint: { w: 8, d: 7 },
    // Nicht in die hintere Ecke: die projiziert auf dieselbe Bildschirmstelle wie der
    // Schlot. Stattdessen an die linke Außenkante der Platte.
    labelAnchor3d: { x: -11.2, y: 0.5, z: -3.4 },
    buildings: [
      { id: 'gpu_rack', maxProps: 14 },
      { id: 'datacenter', maxProps: 8 },
      { id: 'token_burner', maxProps: 8 },
      { id: 'web_scraper', maxProps: 12 },
      { id: 'gray_market_dc', maxProps: 6 },
    ],
  },
  {
    id: 'stage',
    annexMax: 4,
    anchor3d: { x: 7, z: 6 },
    footprint: { w: 8, d: 7 },
    labelAnchor3d: { x: 11.2, y: 0.5, z: 8.6 },
    buildings: [
      { id: 'keynote_stage', maxProps: 4 },
      { id: 'thought_leader', maxProps: 10 },
      { id: 'hype_journalist', maxProps: 10 },
      { id: 'pitch_deck', maxProps: 14 },
      { id: 'lobbyist', maxProps: 6 },
    ],
  },
  {
    id: 'tower',
    annexMax: 4,
    anchor3d: { x: 7, z: -6 },
    footprint: { w: 8, d: 7 },
    labelAnchor3d: { x: 11.2, y: 0.5, z: -3.4 },
    buildings: [
      { id: 'vc_firm', maxProps: 6 },
      { id: 'pivot_startup', maxProps: 8 },
      { id: 'agi_clock', maxProps: 1 },
    ],
  },
  {
    id: 'endgame',
    anchor3d: { x: 0, z: -10 },
    footprint: { w: 14, d: 3 },
    // Standardregel landete über dem Turm bzw. hinter dem Schlot.
    labelAnchor3d: { x: -6.6, y: 0.5, z: -10.6 },
    buildings: [
      { id: 'nuclear_reactor', maxProps: 4 },
      { id: 'metaverse_city', maxProps: 6 },
      { id: 'excel_sheet', maxProps: 6 },
      { id: 'singularity', maxProps: 1 },
    ],
  },
];

// buildingId -> zoneId. Für Black-Swan-Treffer (welche Zone blinkt?) und den Sprung
// aus dem Shop in die Szene.
export const ZONE_BY_BUILDING = ZONES_DATA.reduce((acc, zone) => {
  zone.buildings.forEach((b) => {
    acc[b.id] = zone.id;
  });
  return acc;
}, {});
