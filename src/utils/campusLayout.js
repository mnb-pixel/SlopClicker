// Grundstücke ("Lots") auf der Insel: wo ein weiteres Gebäude einer Zone steht und wie
// groß die Insel dafür sein muss.
//
// Reine Geometrie, kein three.js und kein Store - damit sowohl die Ableitung
// (utils/sceneState.js) als auch die Bauer (components/scene3d/*) dieselben Zahlen
// benutzen. Läge die Rechnung in den Bauern, müsste die Insel raten, wie weit die
// Zonen inzwischen gewachsen sind.
//
// Die Regel dahinter: eine Engine füllt ihr Gebäude bis zur Kapazität, danach entsteht
// ein zweites NEBENAN - nach außen, vom Ofen weg. Die Insel wächst mit, sobald die
// äußersten Gebäude an ihren Rand stoßen.

export const LOT_SIZE = 3.6;

// Inselmaße. Basis ist das alte feste Raster, dann in Schritten bis zum Maximum.
export const ISLAND_BASE_SIZE = 24;
// Obergrenze der Insel. Bewusst weit über dem, was auf einen Bildschirm passt: ab
// etwa 40 Einheiten zoomt die Kamera nicht mehr weiter heraus, sondern der Spieler
// schiebt und zoomt selbst (siehe CampusScene.jsx). Das Spielfeld darf größer sein
// als das Bild - genau das ist der Punkt.
export const ISLAND_MAX_SIZE = 96;
export const ISLAND_STEP = 4;
// Luft zwischen dem äußersten Gebäude und der Inselkante.
const ISLAND_MARGIN = 1.4;

// Nach außen zeigende Richtung einer Zone (vom Inselmittelpunkt weg). Zonen auf der
// Achse (x = 0) wachsen nach +x, sonst würden sie über den Ofen laufen.
export function outwardDirs(zone) {
  return {
    ox: zone.anchor3d.x < 0 ? -1 : 1,
    oz: zone.anchor3d.z < 0 ? -1 : 1,
  };
}

// Position eines Grundstücks innerhalb der Zone (lokale Koordinaten, Ursprung =
// Zonen-Anker). `lane` ist die Reihe quer zur Wachstumsachse, `index` die Position
// darin: index 0 liegt in der inneren Ecke der Grundfläche, jeder weitere Schritt geht
// nach außen - und ab der Kante der Grundfläche eben über sie hinaus.
//
// `perRow` bricht die Reihe um: nach so vielen Häusern fängt eine neue Reihe an
// (`laneStep` weiter quer). Ohne das würde eine Engine mit einem Dutzend Häusern eine
// einzige endlose Straße über die halbe Insel bilden statt eines Viertels.
// `offset` schiebt den Startplatz - so bekommen zwei Engines derselben Zone ihre
// eigenen Spalten, ohne sich ins Gehege zu kommen.
export function lotLocal(zone, plot, index) {
  const { ox, oz } = outwardDirs(zone);
  const { w, d } = zone.footprint;
  const perRow = plot.perRow || 0;
  const col = perRow ? index % perRow : index;
  const row = perRow ? Math.floor(index / perRow) : 0;
  const lane = (plot.lane || 0) + row * (plot.laneStep || 1);
  const i = col + (plot.offset || 0);
  const alongX = plot.axis !== 'z';
  const stepX = alongX ? i : lane;
  const stepZ = alongX ? lane : i;
  return {
    x: ox * (-w / 2 + LOT_SIZE / 2 + stepX * LOT_SIZE),
    z: oz * (-d / 2 + LOT_SIZE / 2 + stepZ * LOT_SIZE),
  };
}

// Anbauten: zusätzliche Hallen, die eine Zone bekommt, wenn ihr Bestand über die
// Grundfläche hinauswächst. Sie liegen bewusst KOMPLETT außerhalb der Grundfläche
// (eine halbe Lot-Breite hinter deren Außenkante), damit sie nie in den handgesetzten
// Props der Zone landen - dort ist jeder Platz schon vergeben.
export function annexLocal(zone, index) {
  const { ox, oz } = outwardDirs(zone);
  const { w, d } = zone.footprint;
  const col = index % 2;
  const row = Math.floor(index / 2);
  return {
    x: ox * (w / 2 + LOT_SIZE / 2 + col * LOT_SIZE),
    z: oz * (-d / 2 + LOT_SIZE / 2 + row * LOT_SIZE),
  };
}

export function toWorld(zone, local) {
  return { x: zone.anchor3d.x + local.x, z: zone.anchor3d.z + local.z };
}

// Wie weit reicht ein Grundstück vom Inselmittelpunkt weg (halbe Kantenlänge der
// Insel, die es mindestens braucht)?
export function lotReach(world) {
  return Math.max(Math.abs(world.x), Math.abs(world.z)) + LOT_SIZE / 2 + ISLAND_MARGIN;
}

// Inselkantenlänge für eine Liste belegter Grundstücke (Weltkoordinaten).
// Gerastert in ISLAND_STEP-Schritten: die Insel soll in spürbaren Stufen wachsen,
// nicht bei jedem einzelnen Kauf um ein paar Zentimeter.
export function islandSizeForLots(lots = []) {
  let half = ISLAND_BASE_SIZE / 2;
  lots.forEach((world) => {
    half = Math.max(half, lotReach(world));
  });
  const size = Math.ceil((half * 2) / ISLAND_STEP) * ISLAND_STEP;
  return Math.min(ISLAND_MAX_SIZE, Math.max(ISLAND_BASE_SIZE, size));
}

// Achsenparalleles Rechteck (Weltkoordinaten) um Grundfläche UND Grundstücke einer
// Zone. Daraus wachsen Zonenplatte und die Position der Zonen-Stecknadel.
export function zoneRect(zone, lots = []) {
  const { w, d } = zone.footprint;
  let minX = zone.anchor3d.x - w / 2;
  let maxX = zone.anchor3d.x + w / 2;
  let minZ = zone.anchor3d.z - d / 2;
  let maxZ = zone.anchor3d.z + d / 2;
  lots.forEach((l) => {
    minX = Math.min(minX, l.x - LOT_SIZE / 2 - 0.3);
    maxX = Math.max(maxX, l.x + LOT_SIZE / 2 + 0.3);
    minZ = Math.min(minZ, l.z - LOT_SIZE / 2 - 0.3);
    maxZ = Math.max(maxZ, l.z + LOT_SIZE / 2 + 0.3);
  });
  return { minX, maxX, minZ, maxZ, w: maxX - minX, d: maxZ - minZ, cx: (minX + maxX) / 2, cz: (minZ + maxZ) / 2 };
}
