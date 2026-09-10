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
    if (!mods[id]) mods[id] = { mult: 1.0, greenwashed: false, laidOff: false };
    return mods[id];
  };

  boughtUpgrades.forEach((upId) => {
    const up = UPGRADES_BY_ID[upId];
    if (up && up.type === 'building' && up.buildingId) {
      ensure(up.buildingId).mult *= up.effect.value;
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

const EMPTY_MOD = { mult: 1.0, greenwashed: false, laidOff: false };

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

  return ZONES_DATA.map((zone) => {
    const zoneBuildings = zone.buildings.map((entry) => {
      const meta = BUILDING_META_BY_ID[entry.id];
      const mod = mods[entry.id] || EMPTY_MOD;
      const count = buildings[entry.id] || 0;

      return {
        id: entry.id,
        maxProps: entry.maxProps,
        count,
        // Wie viele Einzelobjekte der Grafik-Pass tatsächlich zeichnet.
        props: Math.min(count, entry.maxProps),
        // Rest, der nur noch als Zahl am Zonenschild auftaucht.
        overflow: Math.max(0, count - entry.maxProps),
        mult: mod.mult,
        greenwashed: mod.greenwashed,
        laidOff: mod.laidOff,
        vps: count * (meta ? meta.baseCps : 0) * mod.mult,
        damaged: entry.id === damagedBuildingId,
      };
    });

    const population = zoneBuildings.reduce((sum, b) => sum + b.count, 0);

    return {
      id: zone.id,
      anchor3d: zone.anchor3d,
      footprint: zone.footprint,
      buildings: zoneBuildings,
      population,
      tier: tierFromThresholds(population, ZONE_TIER_THRESHOLDS),
      unlocked: population > 0,
      zoneVps: zoneBuildings.reduce((sum, b) => sum + b.vps, 0),
      // Die ganze Zone blinkt, wenn eine ihrer Engines gerade einen Black Swan abbekam.
      damaged: zone.id === damagedZoneId,
      greenwashed: zoneBuildings.some((b) => b.greenwashed),
      laidOff: zoneBuildings.some((b) => b.laidOff),
    };
  });
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
