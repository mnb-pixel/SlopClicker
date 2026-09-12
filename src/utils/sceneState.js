// Ableitung des VISUELLEN Szenen-Zustands aus dem Spielzustand.
//
// Bewusst reine Funktionen ohne React: die Fabrik-Szene soll nichts über den Store
// wissen und der Store nichts über die Szene. Hier liegt die einzige Stelle, an der
// Spielzahlen (VPS, Temperatur, Gebäudemengen) in Grafik-Stufen übersetzt werden -
// der Grafik-Pass liest nur noch die Stufen, nie die Rohwerte.
//
// WICHTIG: hier wird keine Spiellogik dupliziert. Alles ist reine Anzeige.

import { BUILDINGS_DATA } from '../data/buildingsData';
import { UPGRADES_DATA } from '../data/upgradesData';
import { GREENWASHING_LAYOFFS_DATA } from '../data/greenwashingLayoffsData';
import { ZONES_DATA, ZONE_TIER_THRESHOLDS, ZONE_BY_BUILDING } from '../data/zonesData';
import { getBuildingVisibility } from './buildingUnlock';
import { islandSizeForLots, lotLocal, toWorld, zoneRect, ISLAND_BASE_SIZE } from './campusLayout';

const UPGRADES_BY_ID = Object.fromEntries(UPGRADES_DATA.map((u) => [u.id, u]));
const GREENWASHING_BY_ID = Object.fromEntries(GREENWASHING_LAYOFFS_DATA.map((g) => [g.id, g]));
const BUILDING_META_BY_ID = Object.fromEntries(BUILDINGS_DATA.map((b) => [b.id, b]));

// Wie lange eine Zone nach einem Black-Swan-Treffer sichtbar "beschädigt" bleibt.
export const DAMAGE_FLASH_MS = 8000;

// Rauchdichte über dem Kamin. Schwellen in VPS - logarithmisch, weil die VPS über das
// Spiel hinweg um viele Zehnerpotenzen wachsen und ein linearer Verlauf nach zehn
// Minuten dauerhaft am Anschlag stünde.
const SMOKE_THRESHOLDS = [0.5, 5, 50, 1e3, 1e5, 1e8, 1e12];
export const MAX_SMOKE_TIER = SMOKE_THRESHOLDS.length; // 7

function tierFromThresholds(value, thresholds) {
  let tier = 0;
  for (let i = 0; i < thresholds.length; i += 1) {
    if (value >= thresholds[i]) tier = i + 1;
  }
  return tier;
}

// Hitzestufe des Kamins. 'meltdown' kommt NICHT aus der Temperatur, sondern aus dem
// Overheat-Lock des Stores - der bleibt bis zum Abkühlen auf 50 Grad aktiv, auch wenn
// die Temperatur zwischendurch schon wieder unter 85 liegt.
export function getHeatStage(gpuTemp, isOverheated) {
  if (isOverheated) return 'meltdown';
  if (gpuTemp >= 85) return 'critical';
  if (gpuTemp >= 50) return 'hot';
  if (gpuTemp >= 25) return 'warm';
  return 'cold';
}

// Stimmung der Gesamtszene. Genau EINE gewinnt, in dieser Reihenfolge - sonst würden
// sich Meltdown-Feuer und Goldrauch gegenseitig überlagern und beides sähe kaputt aus.
export function getSceneMood({ isOverheated, activeEvent, powerClickActive }) {
  if (isOverheated) return 'meltdown';
  if (activeEvent && activeEvent.kind === 'bubble') return 'bubble';
  if (activeEvent && activeEvent.kind === 'golden') return 'golden';
  if (powerClickActive) return 'surge';
  return 'normal';
}

// Multiplikatoren und Corporate-Action-Flags aller Engines in EINEM Durchlauf über die
// gekauften Posten. Vorher lief pro Engine eine .find()-Suche über alle Upgrades - bei
// dreistelligen Kaufmengen und fünf Ticks pro Sekunde war das die teuerste Stelle der
// ganzen Szene. Jetzt ist es linear in der Zahl der Käufe, nicht quadratisch.
function buildBuildingModifiers(boughtUpgrades, boughtGreenwashingLayoffs) {
  const mods = {};
  const ensure = (id) => {
    if (!mods[id]) mods[id] = { mult: 1.0, greenwashed: false, laidOff: false, upgradeCount: 0 };
    return mods[id];
  };

  boughtUpgrades.forEach((upId) => {
    const up = UPGRADES_BY_ID[upId];
    if (up && up.type === 'building' && up.buildingId) {
      const entry = ensure(up.buildingId);
      entry.mult *= up.effect.value;
      // Sichtstufe hängt an der ANZAHL gekaufter Upgrades für diese Engine, nicht am
      // Multiplikator - der wäre je nach Tier-Höhe unterschiedlich groß und würde die
      // Grafikstufen uneinheitlich springen lassen (siehe tierVisuals.js).
      entry.upgradeCount += 1;
    }
  });

  boughtGreenwashingLayoffs.forEach((itemId) => {
    const gw = GREENWASHING_BY_ID[itemId];
    if (!gw || !gw.buildingId) return;
    const entry = ensure(gw.buildingId);
    if (gw.type === 'greenwashing') {
      entry.greenwashed = true;
      if (gw.tier === 2) entry.mult *= 1.10;
    }
    if (gw.type === 'layoff') {
      entry.laidOff = true;
      if (gw.tier === 1) entry.mult *= 1.20;
      if (gw.tier === 2) entry.mult *= 1.15;
    }
  });

  return mods;
}

const EMPTY_MOD = { mult: 1.0, greenwashed: false, laidOff: false, upgradeCount: 0 };

// Wie viele Gebäude-Upgrades stecken hinter jeder Grafik-Stufe: 4 Upgrades pro Stufe,
// weil es je Engine bis zu 13 davon gibt (UPGRADE_THRESHOLDS in upgrades.content.js) -
// vier Stufen (0..VISUAL_TIER_MAX) sind spürbar genug, ohne bei jedem einzelnen Kauf
// die Optik neu zu zeichnen. VISUAL_TIER_MAX muss zu tierVisuals.js (TIER_MAX) passen -
// bewusst nicht von dort importiert, damit diese Datei ohne three.js auskommt.
export const UPGRADES_PER_VISUAL_TIER = 4;
export const VISUAL_TIER_MAX = 3;

// --- Zwei getrennte Ableitungen, absichtlich ---------------------------------------
//
// deriveZones() ist die teure Hälfte (20 Engines, Multiplikatoren, Zonen-Stufen), ändert
// sich aber nur beim Kaufen. deriveFurnace() ist billig, ändert sich dafür bei JEDEM
// Spiel-Tick (Temperatur, VPS). Zusammen in einer Funktion hätte der Tick fünfmal pro
// Sekunde die komplette Zonen-Rechnung mitgezogen - genau das vermeidet die Trennung.

export function deriveZones({
  buildings = {},
  boughtUpgrades = [],
  boughtGreenwashingLayoffs = [],
  damagedBuildingId = null,
} = {}) {
  const mods = buildBuildingModifiers(boughtUpgrades, boughtGreenwashingLayoffs);
  const damagedZoneId = damagedBuildingId ? ZONE_BY_BUILDING[damagedBuildingId] : null;
  // Dieselbe progressive Sichtbarkeit wie im Shop (siehe utils/buildingUnlock.js): eine
  // Zone taucht auf der Insel erst auf, wenn mindestens eine ihrer Engines freigeschaltet
  // ist. Genau eine Zone weiter steht der Platzhalter, alles dahinter bleibt unsichtbar.
  const { unlockedIds, teaserId } = getBuildingVisibility(buildings);

  return ZONES_DATA.map((zone) => {
    const zoneBuildings = zone.buildings.map((entry) => {
      const meta = BUILDING_META_BY_ID[entry.id];
      const mod = mods[entry.id] || EMPTY_MOD;
      const count = buildings[entry.id] || 0;
      const unlocked = unlockedIds.has(entry.id);

      const props = Math.min(count, entry.maxProps);

      return {
        id: entry.id,
        maxProps: entry.maxProps,
        count,
        // Wie viele Einzelobjekte der Grafik-Pass tatsächlich zeichnet.
        props,
        // Wie viele Gebäude diese Engine dafür braucht: ist eines voll, entsteht das
        // nächste nebenan (siehe utils/campusLayout.js).
        plot: entry.plot || null,
        plots: entry.plot ? Math.min(entry.plot.max, Math.ceil(props / entry.plot.capacity)) : 0,
        // Rest, der nur noch als Zahl am Zonenschild auftaucht.
        overflow: Math.max(0, count - entry.maxProps),
        mult: mod.mult,
        greenwashed: mod.greenwashed,
        laidOff: mod.laidOff,
        // Grafik-Stufe aus gekauften Upgrades (siehe tierVisuals.js): steuert Farbe/
        // Glanz der Engine-Props, NICHT ihre Anzahl oder Position.
        tier: Math.min(VISUAL_TIER_MAX, Math.floor(mod.upgradeCount / UPGRADES_PER_VISUAL_TIER)),
        vps: count * (meta ? meta.baseCps : 0) * mod.mult,
        damaged: entry.id === damagedBuildingId,
        // Sichtbarkeit/Neuheit - Preis und Kaufbarkeit bleiben bewusst draußen, die
        // hängen an der Bewertung und würden diese Ableitung in jeden Tick ziehen.
        unlocked,
        isTeaser: entry.id === teaserId,
        // "Noch nie gebaut, aber freigeschaltet" - Grundlage für den NEU-Hinweis am
        // Zonenschild (die Bewertung kommt erst in CampusScene dazu).
        isNew: unlocked && count === 0,
        baseCost: meta ? meta.baseCost : 0,
      };
    });

    const population = zoneBuildings.reduce((sum, b) => sum + b.count, 0);
    const revealed = zoneBuildings.some((b) => b.unlocked);

    // Belegte Grundstücke der Zone: ein Eintrag je Gebäude jeder Engine mit `plot`.
    // Bestimmt zusammen mit der Grundfläche, wie groß Zonenplatte und Insel sein müssen
    // (siehe zoneRect/islandSizeForLots unten).
    const lots = [];
    if (population > 0) {
      zoneBuildings.forEach((b) => {
        for (let i = 0; i < b.plots; i += 1) {
          const local = lotLocal(zone, b.plot, i);
          lots.push({ id: b.id, index: i, lx: local.x, lz: local.z, ...toWorld(zone, local) });
        }
      });
    }

    return {
      id: zone.id,
      anchor3d: zone.anchor3d,
      footprint: zone.footprint,
      buildings: zoneBuildings,
      population,
      lots,
      // Grundfläche plus Grundstücke - daraus wachsen Platte und Stecknadel.
      rect: zoneRect(zone, lots),
      tier: tierFromThresholds(population, ZONE_TIER_THRESHOLDS),
      unlocked: population > 0,
      // revealed: Zone existiert für den Spieler (Schild, Platte, anklickbar).
      // teaser: die eine Zone dahinter, als "???" ohne Namen und ohne Kaufpanel.
      // Weder noch -> die Zone wird gar nicht gezeichnet.
      revealed,
      teaser: !revealed && zoneBuildings.some((b) => b.isTeaser),
      zoneVps: zoneBuildings.reduce((sum, b) => sum + b.vps, 0),
      // Die ganze Zone blinkt, wenn eine ihrer Engines gerade einen Black Swan abbekam.
      damaged: zone.id === damagedZoneId,
      greenwashed: zoneBuildings.some((b) => b.greenwashed),
      laidOff: zoneBuildings.some((b) => b.laidOff),
    };
  });
}

// Welche Zonen sollen gerade ein "NEU" am Schild tragen? Getrennt von deriveZones, weil
// hier die Bewertung mitspielt: die ändert sich in JEDEM Tick, deriveZones nur beim
// Kaufen (siehe Kommentar oben). Läuft über höchstens 20 Engines und ist damit billig.
//
// Kriterium bewusst "freigeschaltet UND noch nie gebaut UND bezahlbar": ohne den Preis
// stünde nach jedem Kauf sofort wieder ein NEU an der nächsten Stufe und der Hinweis
// wäre Dauerzustand statt Signal.
export function getNewZoneIds({ zones = [], valuation = 0 } = {}) {
  const ids = new Set();
  zones.forEach((zone) => {
    if (!zone.revealed) return;
    const hit = zone.buildings.some((b) => b.isNew && b.baseCost > 0 && valuation >= b.baseCost);
    if (hit) ids.add(zone.id);
  });
  return ids;
}

// Wie groß muss die Insel sein, damit alle belegten Grundstücke daraufpassen?
// Getrennt von deriveZones, damit die Szene den Wert auch aus dem Debug-Zustand
// ableiten kann; billig, weil deriveZones die Grundstücke schon fertig geliefert hat.
export function deriveIsland(zones = []) {
  const lots = [];
  zones.forEach((z) => {
    if (z.unlocked && z.lots) lots.push(...z.lots);
  });
  const size = islandSizeForLots(lots);
  return { size, scale: size / ISLAND_BASE_SIZE };
}

export function deriveFurnace({ vps = 0, gpuTemp = 0, isOverheated = false } = {}) {
  const smokeTier = tierFromThresholds(vps, SMOKE_THRESHOLDS);
  return {
    heatStage: getHeatStage(gpuTemp, isOverheated),
    // 0..1 für stufenlose Effekte (Glutfarbe, Flammenhöhe).
    heatPct: Math.min(100, Math.max(0, gpuTemp)) / 100,
    smokeTier,
    smokeRatio: smokeTier / MAX_SMOKE_TIER,
  };
}
