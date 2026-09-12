import { ISLAND_BASE_SIZE } from '../utils/campusLayout';

// Zonen-Layout der 3D-Insel.
//
// Raster 24 x 24 Einheiten, Ursprung in der Inselmitte, +Z ist vorne (zur Kamera hin).
// Der Ofen steht auf dem Ursprung und ist der Klick-Button; die fünf Zonen liegen als
// Grundflächen um ihn herum. `anchor3d` ist der Mittelpunkt der Zonen-Grundfläche,
// `footprint` deren Ausdehnung. `labelAnchor3d` (optional) setzt die Zonen-Stecknadel
// abweichend von der Standardregel (vom Ofen weg gerückt).
//
// Die Zonen liegen bewusst weiter auseinander (x = +/-9, z = +/-8.5 statt vorher +/-7 und
// +/-6). Der Zuwachs liegt vor allem in z: die Grundstuecke einer Zone wachsen alle in
// x (siehe unten), dort kostet jeder zusaetzliche Meter Abstand also doppelt - die Zone
// wuerde bei starkem Ausbau nur noch weiter aus dem Bild ragen. In z wachsen sie nicht,
// da ist der Abstand geschenkt. Vorher klebten die vier Platten aneinander und reichten bis an den Ofensockel:
// in der Isometrie wurde daraus ein einziger Klumpen, in dem man weder die Grenze
// zwischen zwei Zonen noch den Ofen dazwischen ausmachen konnte. Der freie Ring, der
// dadurch in der Mitte entsteht, ist kein Loch - dort liegt der Ofenhof (siehe
// buildCampus.js: Plattenbelag, Kantstein, Pflanzkübel), und die Wege von den Zonen
// enden an dessen Rand statt am Sockel.
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

// Ab wie vielen Engines einer Zone deren Ausbaustufe steigt (0 = leer/verriegelt).
export const ZONE_TIER_THRESHOLDS = [1, 3, 8, 20, 50, 120, 250, 500, 1000];

// `plot` an einer Engine heißt: ihre Objekte stehen nicht frei auf der Zonenplatte,
// sondern in eigenen Gebäuden/Ständen mit fester Kapazität. Ist eines voll, entsteht
// das nächste NEBENAN (siehe utils/campusLayout.js: lotLocal). `maxProps` ist bei
// diesen Engines bewusst capacity * max - sonst stünde das letzte Grundstück halb leer,
// während die Zahl am Schild weiterläuft.
export const ZONES_DATA = [
  {
    id: 'office',
    anchor3d: { x: -9, z: 8.5 },
    footprint: { w: 8, d: 7 },
    labelAnchor3d: { x: -12.8, y: 0.5, z: 10.7 },
    buildings: [
      { id: 'prompt_intern', maxProps: 200, plot: { capacity: 4, max: 50, axis: 'x', lane: 0, perRow: 5 } },
      { id: 'chatbot_widget', maxProps: 40 },
      { id: 'prompt_engineer', maxProps: 160, plot: { capacity: 4, max: 40, axis: 'x', lane: 0, perRow: 5, offset: 5 } },
    ],
  },
  {
    id: 'basement',
    anchor3d: { x: -9, z: -8.5 },
    footprint: { w: 8, d: 7 },
    labelAnchor3d: { x: -13.2, y: 0.5, z: -5.9 },
    buildings: [
      { id: 'gpu_rack', maxProps: 120, plot: { capacity: 8, max: 15, axis: 'x', lane: 0, perRow: 5 } },
      { id: 'datacenter', maxProps: 50, plot: { capacity: 2, max: 25, axis: 'x', lane: 2, perRow: 5 } },
      { id: 'web_scraper', maxProps: 40 },
      { id: 'token_burner', maxProps: 80, plot: { capacity: 4, max: 20, axis: 'x', lane: 1, perRow: 5 } },
      { id: 'gray_market_dc', maxProps: 40, plot: { capacity: 2, max: 20, axis: 'x', lane: 3, perRow: 5 } },
    ],
  },
  {
    id: 'stage',
    anchor3d: { x: 9, z: 8.5 },
    footprint: { w: 8, d: 7 },
    labelAnchor3d: { x: 13.2, y: 0.5, z: 11.1 },
    buildings: [
      { id: 'thought_leader', maxProps: 120, plot: { capacity: 4, max: 30, axis: 'x', lane: 1, perRow: 5 } },
      { id: 'hype_journalist', maxProps: 120, plot: { capacity: 4, max: 30, axis: 'x', lane: 2, perRow: 5 } },
      { id: 'keynote_stage', maxProps: 25, plot: { capacity: 1, max: 25, axis: 'x', lane: 0, perRow: 5 } },
      { id: 'pitch_deck', maxProps: 40 },
      { id: 'lobbyist', maxProps: 25, plot: { capacity: 1, max: 25, axis: 'x', lane: 3, perRow: 5 } },
    ],
  },
  {
    id: 'tower',
    anchor3d: { x: 9, z: -8.5 },
    footprint: { w: 8, d: 7 },
    labelAnchor3d: { x: 13.2, y: 0.5, z: -5.9 },
    buildings: [
      { id: 'vc_firm', maxProps: 120, plot: { capacity: 6, max: 20, axis: 'x', lane: 0, perRow: 5 } },
      { id: 'pivot_startup', maxProps: 60, plot: { capacity: 3, max: 20, axis: 'x', lane: 1, perRow: 5 } },
      { id: 'agi_clock', maxProps: 1 },
    ],
  },
  {
    id: 'endgame',
    anchor3d: { x: 0, z: -20 },
    footprint: { w: 14, d: 3 },
    labelAnchor3d: { x: -6.6, y: 0.5, z: -20.6 },
    buildings: [
      { id: 'nuclear_reactor', maxProps: 32, plot: { capacity: 2, max: 16, axis: 'x', lane: 0, perRow: 4 } },
      { id: 'metaverse_city', maxProps: 60, plot: { capacity: 3, max: 20, axis: 'x', lane: 1, perRow: 5 } },
      { id: 'excel_sheet', maxProps: 48 },
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
