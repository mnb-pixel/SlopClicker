// Zonen-Layout der 3D-Insel.
//
// Raster 24 x 24 Einheiten, Ursprung in der Inselmitte, +Z ist vorne (zur Kamera hin).
// Der Ofen steht auf dem Ursprung und ist der Klick-Button; die fünf Zonen liegen als
// Grundflächen um ihn herum. `anchor3d` ist der Mittelpunkt der Zonen-Grundfläche,
// `footprint` deren Ausdehnung. `labelAnchor3d` (optional) setzt das Zonenschild
// abweichend von der Standardregel (vom Ofen weg gerückt).
//
// Jede Engine hat `maxProps`: mehr Objekte als das zeichnet die Szene nie, darüber
// wächst nur noch die Zonen-Stufe (siehe ZONE_TIER_THRESHOLDS) und die Zahl am Schild.
// Was die Objekte konkret sind, entscheiden die Bauer in src/components/scene3d/.

export const ISLAND_SIZE = 24;
export const FURNACE_ANCHOR = { x: 0, z: 0 };

// Ab wie vielen Engines einer Zone deren Ausbaustufe steigt (0 = leer/verriegelt).
export const ZONE_TIER_THRESHOLDS = [1, 3, 8, 20, 50, 120, 300];

export const ZONES_DATA = [
  {
    id: 'office',
    anchor3d: { x: -7, z: 6 },
    footprint: { w: 8, d: 7 },
    buildings: [
      { id: 'prompt_intern', maxProps: 12 },
      { id: 'prompt_engineer', maxProps: 8 },
      { id: 'chatbot_widget', maxProps: 10 },
    ],
  },
  {
    id: 'basement',
    anchor3d: { x: -7, z: -6 },
    footprint: { w: 8, d: 7 },
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
    anchor3d: { x: 7, z: 6 },
    footprint: { w: 8, d: 7 },
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
    anchor3d: { x: 7, z: -6 },
    footprint: { w: 8, d: 7 },
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
    labelAnchor3d: { x: -5.8, y: 5.4, z: -10.8 },
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
