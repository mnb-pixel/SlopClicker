import { BUILDINGS_DATA } from './buildingsData';
import { UPGRADE_THRESHOLDS, UPGRADE_MULTIPLIERS } from '../i18n/content/upgrades.content';

const THRESHOLD_ICONS = [
  'Zap', 'TrendingUp', 'Cpu', 'Sparkles', 'ShieldCheck',
  'Flame', 'Award', 'Rocket', 'Layers', 'Maximize2',
  'Crown', 'Atom', 'Infinity'
];

const BUILDING_UPGRADES_DATA = BUILDINGS_DATA.flatMap((b) =>
  UPGRADE_THRESHOLDS.map((threshold, i) => ({
    id: `${b.id}_up_${threshold}`,
    type: 'building',
    buildingId: b.id,
    icon: THRESHOLD_ICONS[i % THRESHOLD_ICONS.length] || b.icon || 'Zap',
    cost: Math.floor(10 * b.baseCost * Math.pow(1.15, i)),
    effect: { type: 'buildingMult', value: UPGRADE_MULTIPLIERS[i] },
    req: { buildingCount: { id: b.id, count: threshold } },
  }))
);

// --- Zusätzliche SlopClicker-Mechaniken (nicht Teil des Hype-Clicker-Konzepts,
// bleiben bestehen weil sie an GPU-Overheat/Power-Click gebunden sind) ---
const MISC_UPGRADES_DATA = [
  // --- CLICK TAP UPGRADES (Massive Click Boosts) ---
  {
    id: 'click_1',
    name: 'Ergonomic Cyber Mouse',
    cost: 100,
    quote: 'Reduces RSI while spamming AGI generation.',
    description: 'Taps earn +5 extra Valuation (5x base click!).',
    icon: 'Mouse',
    type: 'click',
    effect: { type: 'addClick', value: 5 },
    req: { totalValuation: 10 },
  },
  {
    id: 'click_2',
    name: 'Overclocked Mechanical Switches',
    cost: 500,
    quote: 'Click noise scares away regulators.',
    description: 'Taps earn +10% of your total VPS on every click!',
    icon: 'Keyboard',
    type: 'click',
    effect: { type: 'vpsClickPct', value: 0.10 },
    req: { totalValuation: 50 },
  },
  {
    id: 'click_3',
    name: 'Neural Link Finger Implant',
    cost: 10000,
    quote: 'Direct brain-to-GPU click interface.',
    description: 'Taps earn +25% of your total VPS on every click!',
    icon: 'Zap',
    type: 'click',
    effect: { type: 'vpsClickPct', value: 0.25 },
    req: { totalValuation: 1000 },
  },
  {
    id: 'click_4',
    name: 'Quantum Haptic Motor',
    cost: 1000000,
    quote: 'Feels like touching AGI itself.',
    description: 'Taps earn +50% of your total VPS on every click!',
    icon: 'Activity',
    type: 'click',
    effect: { type: 'vpsClickPct', value: 0.50 },
    req: { totalValuation: 100000 },
  },
  {
    id: 'click_5',
    name: 'Sub-Lightspeed Tap Beam',
    cost: 100000000,
    quote: 'Tap registered before your brain fires a neuron.',
    description: 'Taps earn +100% of your total VPS on every click!',
    icon: 'Crosshair',
    type: 'click',
    effect: { type: 'vpsClickPct', value: 1.00 },
    req: { totalValuation: 10000000 },
  },

  // --- BOARD SYNDICATE UPGRADES (Achievement/Milestone-based scaling) ---
  // Named after the VC Firm engine, so gated on actually owning it (buildingId below) -
  // not just a valuation threshold, even though vc_firm (Tier 8, ~$941M) is far pricier
  // than syndicate_1/2's own cost. That's intentional: these are VC-firm perks now, not a
  // separate free-floating progression track.
  {
    id: 'syndicate_1',
    name: 'Seed Angel Advisor',
    cost: 5000,
    quote: 'Writes early term sheets in natural language.',
    description: '+10% extra global VPS for every unlocked achievement!',
    icon: 'Briefcase',
    type: 'syndicate',
    effect: { type: 'syndicate', factor: 0.10 },
    req: { totalValuation: 1000, buildingId: 'vc_firm' },
  },
  {
    id: 'syndicate_2',
    name: 'Series-A Board Director',
    cost: 500000,
    quote: 'Attends quarterly board meetings via holograms.',
    description: '+20% extra global VPS for every unlocked achievement!',
    icon: 'Building2',
    type: 'syndicate',
    effect: { type: 'syndicate', factor: 0.20 },
    req: { totalValuation: 100000, buildingId: 'vc_firm' },
  },
  {
    id: 'syndicate_3',
    name: 'Growth VC Syndicate Partner',
    cost: 50000000,
    quote: 'Leverages institutional hype to double term sheet offers.',
    description: '+30% extra global VPS for every unlocked achievement!',
    icon: 'Award',
    type: 'syndicate',
    effect: { type: 'syndicate', factor: 0.30 },
    req: { totalValuation: 10000000, buildingId: 'vc_firm' },
  },
  {
    id: 'syndicate_4',
    name: 'Autonomous AGI Advisory Board',
    cost: 5000000000,
    quote: 'An AI board that approves its own stock option grants.',
    description: '+50% extra global VPS for every unlocked achievement!',
    icon: 'UserCheck',
    type: 'syndicate',
    effect: { type: 'syndicate', factor: 0.50 },
    req: { totalValuation: 1000000000, buildingId: 'vc_firm' },
  },

  // --- GLOBAL MULTIPLIERS & THERMAL EFFICIENCY ---
  {
    id: 'thermal_1',
    name: 'Liquid Cooled Thermal Paste',
    cost: 25000,
    quote: 'Slows down heat generation rate dramatically.',
    description: 'GPU cooling rate increased to -6°C/s (was -4°C/s).',
    icon: 'ThermometerSnowflake',
    type: 'global',
    effect: { type: 'coolingRate', value: 6.0 },
    req: { totalValuation: 5000 },
  },
  {
    id: 'thermal_2',
    name: 'Sub-Zero Cryo Chamber',
    cost: 5000000,
    quote: 'Dips GPUs into liquid helium before every inference.',
    description: 'GPU cooling rate increased to -10°C/s!',
    icon: 'ShieldAlert',
    type: 'global',
    effect: { type: 'coolingRate', value: 10.0 },
    req: { totalValuation: 500000 },
  },
  {
    id: 'hype_boost_1',
    name: 'Sycophantic Marketing Pitch',
    cost: 50000,
    quote: 'Increases all passive income by +50%.',
    description: 'Global VPS output boosted by +50%!',
    icon: 'TrendingUp',
    type: 'global',
    effect: { type: 'globalMult', value: 1.50 },
    req: { totalValuation: 5000 },
  },
  {
    id: 'hype_boost_2',
    name: 'World Tour Keynote Presentation',
    cost: 10000000,
    quote: 'Spends $50M on holographic stage projections.',
    description: 'Global VPS output boosted by +100% (2x)!',
    icon: 'Globe',
    type: 'global',
    effect: { type: 'globalMult', value: 2.00 },
    req: { totalValuation: 1000000 },
  },
  {
    id: 'hype_boost_3',
    name: 'Federal AI Subsidy Loophole',
    cost: 1000000000,
    quote: 'Taxpayers fund your electricity bill entirely.',
    description: 'Global VPS output boosted by +200% (3x)!',
    icon: 'DollarSign',
    type: 'global',
    effect: { type: 'globalMult', value: 3.00 },
    req: { totalValuation: 100000000 },
  },
];

export const UPGRADES_DATA = [...BUILDING_UPGRADES_DATA, ...MISC_UPGRADES_DATA];

// Eligibility filter shared by the Upgrades tile grid (StoreTab) and "BUY ALL" (useGameStore),
// so bulk-buying can never purchase an upgrade the UI wouldn't otherwise show/allow.
export function getAvailableUpgrades(buildings, boughtUpgrades, valuation, totalValuation) {
  const totalBuildingsOwned = Object.values(buildings || {}).reduce((sum, cnt) => sum + cnt, 0);

  const lowestUnboughtBuildingUpgrade = new Map();
  UPGRADES_DATA.forEach((up) => {
    if (up.type === 'building' && !boughtUpgrades.includes(up.id)) {
      const ownedCount = buildings[up.buildingId] || 0;
      if (ownedCount >= 1 && !lowestUnboughtBuildingUpgrade.has(up.buildingId)) {
        lowestUnboughtBuildingUpgrade.set(up.buildingId, up);
      }
    }
  });

  return UPGRADES_DATA.filter((up) => {
    if (boughtUpgrades.includes(up.id)) return false;

    if (up.type === 'building') {
      // STRICT RULE: Must own at least 1 of this building engine!
      const ownedCount = buildings[up.buildingId] || 0;
      if (ownedCount < 1) return false;

      // Must be the next lowest unbought tier for this owned building engine
      const nextUp = lowestUnboughtBuildingUpgrade.get(up.buildingId);
      if (!nextUp || nextUp.id !== up.id) return false;

      // Building count requirement check
      const reqCount = up.req?.buildingCount?.count || 1;
      if (ownedCount < Math.max(1, Math.floor(reqCount * 0.4))) {
        return false;
      }
      return true;
    }

    // Global VPS upgrades require owning at least 1 engine/building
    if (up.type === 'global' && (up.effect?.type === 'globalMult' || up.effect?.type === 'vpsMult')) {
      if (totalBuildingsOwned < 1) return false;
    }

    // Misc Upgrades (Click, Syndicate, Global). A few of these (currently the Board
    // Syndicate line) are named after a specific engine and require owning it, same
    // as building-type upgrades - checked via req.buildingId when present.
    if (up.req && up.req.buildingId) {
      const ownedCount = buildings[up.req.buildingId] || 0;
      if (ownedCount < 1) return false;
    }
    if (up.req && up.req.totalValuation) {
      if (totalValuation < up.req.totalValuation * 0.5 && valuation < up.cost * 0.3) {
        return false;
      }
    }
    return true;
  });
}
