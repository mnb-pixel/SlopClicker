import { BUILDINGS_DATA } from './buildingsData';

// 100 Greenwashing- & Layoff-Maßnahmen (Konzept Abschnitt 7): 5 Stufen x 20 Gebäude.
// Kosten-Faktoren (x Gebäude-Basiskosten): GW I=5, GW II=15, GW III=40, Layoff I=20, Layoff II=60.
// Effekt (Konzept Abschnitt 4): GW I senkt Burn Rate (-0.1%/Gebäude mit GW I),
// GW II = Gebäude-Multiplikator x1.10, GW III = rein kosmetisch (kein Zahlen-Effekt),
// Layoff I = x1.20, Layoff II = x1.15.
const TIERS = [
  { key: '1', type: 'greenwashing', tier: 1, costMult: 5 },
  { key: '2', type: 'greenwashing', tier: 2, costMult: 15 },
  { key: '3', type: 'greenwashing', tier: 3, costMult: 40 },
];
const LAYOFF_TIERS = [
  { key: '1', type: 'layoff', tier: 1, costMult: 20 },
  { key: '2', type: 'layoff', tier: 2, costMult: 60 },
];

export const GREENWASHING_LAYOFFS_DATA = BUILDINGS_DATA.flatMap((b) => [
  ...TIERS.map((t) => ({
    id: `gw_${b.id}_${t.key}`,
    buildingId: b.id,
    type: t.type,
    tier: t.tier,
    costMult: t.costMult,
  })),
  ...LAYOFF_TIERS.map((t) => ({
    id: `lay_${b.id}_${t.key}`,
    buildingId: b.id,
    type: t.type,
    tier: t.tier,
    costMult: t.costMult,
  })),
]);
