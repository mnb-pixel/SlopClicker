import { BUILDINGS_DATA } from './buildingsData';

// 100 Greenwashing- & Layoff-Maßnahmen (Konzept Abschnitt 7): 5 Stufen x 20 Gebäude.
// Kosten-Faktoren (x Gebäude-Basiskosten): GW I=5, GW II=15, GW III=40, Layoff I=20, Layoff II=60.
// Effekt (Konzept Abschnitt 4): GW I senkt Burn Rate (-0.1%/Gebäude mit GW I),
// GW II = Gebäude-Multiplikator x1.10, GW III = rein kosmetisch (kein Zahlen-Effekt),
// Layoff I = x1.20, Layoff II = x1.15.
const TIERS = [
  { key: '1', type: 'greenwashing', tier: 1, costMult: 5, icon: 'Leaf' },
  { key: '2', type: 'greenwashing', tier: 2, costMult: 15, icon: 'Trees' },
  { key: '3', type: 'greenwashing', tier: 3, costMult: 40, icon: 'Recycle' },
];
const LAYOFF_TIERS = [
  { key: '1', type: 'layoff', tier: 1, costMult: 20, icon: 'UserMinus' },
  { key: '2', type: 'layoff', tier: 2, costMult: 60, icon: 'UserX' },
];

export const GREENWASHING_LAYOFFS_DATA = BUILDINGS_DATA.flatMap((b) => [
  ...TIERS.map((t) => ({
    id: `gw_${b.id}_${t.key}`,
    buildingId: b.id,
    type: t.type,
    tier: t.tier,
    costMult: t.costMult,
    icon: t.icon,
  })),
  ...LAYOFF_TIERS.map((t) => ({
    id: `lay_${b.id}_${t.key}`,
    buildingId: b.id,
    type: t.type,
    tier: t.tier,
    costMult: t.costMult,
    icon: t.icon,
  })),
]);

// Zusätzlich zum Gebäude-Basiskosten-Multiplikator (costMult) steigt der Preis mit JEDER
// bereits gekauften Corporate Action global um 15% - ohne das würde die Teuerung rein aus
// den Gebäude-Tier-Kosten kommen und über die Spielzeit kaum spürbar zunehmen (Kritik:
// "Teuerung noch nicht steil genug"). Bei 20 gekauften Aktionen macht das bereits ~16x,
// bei 50 ~1080x - spürbar steiler, aber pro Gebäude+Tier weiterhin nur einmal kaufbar.
const CORPORATE_ESCALATION = 1.15;
export function getCorporateActionCost(item, baseCost, boughtCount) {
  return Math.floor(item.costMult * baseCost * Math.pow(CORPORATE_ESCALATION, boughtCount));
}

// Sichtbare Corporate Actions: nur die jeweils niedrigste noch nicht gekaufte Stufe pro
// Gebäude+Art (Greenwashing bzw. Layoff getrennt gezählt), und nur für Gebäude, von
// denen mindestens eines steht. Geteilt von StoreTab (alle Gebäude) und ZoneBuyPanel
// (auf eine Zone gefiltert) - sonst könnten beide Stellen unterschiedliche "nächste
// Stufe" zeigen.
export function getAvailableCorporateActions(buildings, boughtGreenwashingLayoffs) {
  const lowestUnbought = new Map();
  GREENWASHING_LAYOFFS_DATA.forEach((item) => {
    const isBought = boughtGreenwashingLayoffs.includes(item.id);
    const ownedCount = buildings[item.buildingId] || 0;
    if (ownedCount >= 1 && !isBought) {
      const key = `${item.buildingId}_${item.type}`;
      if (!lowestUnbought.has(key)) lowestUnbought.set(key, item);
    }
  });
  return GREENWASHING_LAYOFFS_DATA.filter((item) => {
    if (boughtGreenwashingLayoffs.includes(item.id)) return false;
    const ownedCount = buildings[item.buildingId] || 0;
    if (ownedCount < 1) return false;
    const key = `${item.buildingId}_${item.type}`;
    const nextItem = lowestUnbought.get(key);
    return nextItem && nextItem.id === item.id;
  });
}
