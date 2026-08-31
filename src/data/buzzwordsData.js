// 80 Collectible Buzzword Cards generated from 20 modifiers x 20 nouns

const MODIFIERS = [
  'Agentic', 'Exponential', 'Disruptive', 'Autonomous', 'Synthetic',
  'Generative', 'Emergent', 'Federated', 'Quantum-Ready', 'Next-Gen',
  'Hyper-Scalable', 'Zero-Shot', 'Multi-Modal', 'Self-Improving', 'Composable',
  'Sovereign', 'Frictionless', 'Post-Human', 'Bleeding-Edge', 'Democratized'
];

const NOUNS = [
  'Synergy', 'Moat', 'Flywheel', 'Paradigm Shift',
  'Value Chain', 'Ecosystem', 'Alpha', 'Runway',
  'North Star', 'Product-Market-Fit', 'Network Effect', 'First-Mover Advantage',
  'Deep Tech', 'Category Creation', 'Land Grab', 'Compute Layer',
  'Data Moat', 'Talent Density', 'Vertical Integration', 'Platform Shift'
];

const NOUN_ICONS = {
  'Synergy': 'Zap',
  'Moat': 'ShieldCheck',
  'Flywheel': 'RotateCw',
  'Paradigm Shift': 'Sparkles',
  'Value Chain': 'TrendingUp',
  'Ecosystem': 'Globe',
  'Alpha': 'Crown',
  'Runway': 'Rocket',
  'North Star': 'Compass',
  'Product-Market-Fit': 'Target',
  'Network Effect': 'Network',
  'First-Mover Advantage': 'Flame',
  'Deep Tech': 'Cpu',
  'Category Creation': 'Wand2',
  'Land Grab': 'Flag',
  'Compute Layer': 'Server',
  'Data Moat': 'Database',
  'Talent Density': 'Users',
  'Vertical Integration': 'Layers',
  'Platform Shift': 'Activity',
};

const MODIFIER_QUOTES = {
  'Agentic': 'Operates without human intervention or common sense.',
  'Exponential': 'Doubles on every single pitch deck slide.',
  'Disruptive': 'Breaks regulations before asking for permission.',
  'Autonomous': 'Thinks for itself, mostly about stock options.',
  'Synthetic': '100% artificial, 0% organic reality.',
  'Generative': 'Creates infinite content from finite intelligence.',
  'Emergent': 'Nobody programmed this behavior, but it works.',
  'Federated': 'Distributed across 50 offshore shell corporations.',
  'Quantum-Ready': 'Superposition of working and broken.',
  'Next-Gen': 'Yesterday’s tech with tomorrow’s price tag.',
  'Hyper-Scalable': 'Grows faster than your server hosting budget.',
  'Zero-Shot': 'Nails it on the first try, or pretends to.',
  'Multi-Modal': 'Translates text into hype and back.',
  'Self-Improving': 'Learns exclusively from its own hallucinations.',
  'Composable': 'Lego bricks of pure financial valuation.',
  'Sovereign': 'Answers to no government or board of directors.',
  'Frictionless': 'Smooth enough to slip right past compliance.',
  'Post-Human': 'Surpasses human comprehension and revenue.',
  'Bleeding-Edge': 'So sharp it cuts quarterly gross margins.',
  'Democratized': 'Available to anyone with an approved term sheet.',
};

// Rarity-Bänder bleiben fürs Badge/Filter-UI (40 Common / 25 Uncommon / 10 Rare / 5 Legendary),
// der Bonus selbst wächst aber kontinuierlich mit dem Kartenindex (statt 4 flachen Stufen) -
// jede neue Karte fühlt sich dadurch spürbar wertvoller an als die vorherige, nicht nur beim
// Sprung in die nächste Rarität. bonus(0)=0.4%, bonus(79)≈13%, Summe aller 80 Karten ≈ +295% VPS.
export const BUZZWORDS_DATA = Array.from({ length: 80 }, (_, i) => {
  const modIndex = Math.floor(i / 4);
  const nounIndex = i % NOUNS.length;
  const modifier = MODIFIERS[modIndex];
  const noun = NOUNS[nounIndex];
  const name = `${modifier} ${noun}`;

  let rarity = 'Common';
  if (i >= 75) rarity = 'Legendary';
  else if (i >= 65) rarity = 'Rare';
  else if (i >= 40) rarity = 'Uncommon';

  const bonus = Math.round(0.004 * Math.pow(1.045, i) * 1000) / 1000;

  const cardNum = `#${String(i + 1).padStart(2, '0')}`;
  const icon = NOUN_ICONS[noun] || 'Sparkles';
  const quote = MODIFIER_QUOTES[modifier] || 'The pinnacle of AI marketing hype.';

  return {
    id: `buzz_${i}`,
    index: i,
    cardNum,
    name,
    modifier,
    noun,
    rarity,
    bonus,
    icon,
    quote,
  };
});

// Booster Pack Cost Formula: 600 * 2^cardsOwned (shared by store logic and UI display).
// Cards can only be obtained via booster packs (no direct per-card purchase), so this is
// the sole price curve for the collection - doubles with each card already collected.
export function getBoosterPackCost(cardsOwned) {
  return Math.floor(600 * Math.pow(2, cardsOwned));
}
