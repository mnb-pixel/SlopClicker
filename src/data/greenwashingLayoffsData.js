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
