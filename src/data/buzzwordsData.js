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

// Rarity assignment (40 Common +1%, 25 Uncommon +2%, 10 Rare +5%, 5 Legendary +10%)
export const BUZZWORDS_DATA = Array.from({ length: 80 }, (_, i) => {
  const modIndex = Math.floor(i / 4);
  const nounIndex = i % NOUNS.length;
  const modifier = MODIFIERS[modIndex];
  const noun = NOUNS[nounIndex];
  const name = `${modifier} ${noun}`;

  let rarity = 'Common';
  let bonus = 0.01; // +1%

  if (i >= 75) {
    rarity = 'Legendary';
    bonus = 0.10; // +10%
  } else if (i >= 65) {
    rarity = 'Rare';
    bonus = 0.05; // +5%
  } else if (i >= 40) {
    rarity = 'Uncommon';
    bonus = 0.02; // +2%
  }

  // Cost formula: steep exponential (1.45^i) so later cards are a genuine late-game goal,
  // not a footnote - direct-buy price is fixed per card by its position in the 80-card set.
  const cost = Math.floor(600 * Math.pow(1.45, i));

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
    cost,
    icon,
    quote,
  };
});

// Booster Pack Cost Formula: 600 * 1.45^cardsOwned (shared by store logic and UI display).
// Same steep curve as the per-card direct-buy price above, so packs don't become a cheaper
// backdoor around the direct-buy cost as the collection fills up.
export function getBoosterPackCost(cardsOwned) {
  return Math.floor(600 * Math.pow(1.45, cardsOwned));
}
