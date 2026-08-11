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

// Rarity assignment (40 Common +1%, 25 Uncommon +2%, 10 Rare +5%, 5 Legendary +10%)
export const BUZZWORDS_DATA = Array.from({ length: 80 }, (_, i) => {
  const modIndex = Math.floor(i / 4);
  const nounIndex = (i * 3) % NOUNS.length;
  const name = `${MODIFIERS[modIndex]} ${NOUNS[nounIndex]}`;

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

  // Cost formula: 40 * baseCost1 (15) * 1.22^i
  const cost = Math.floor(600 * Math.pow(1.22, i));

  return {
    id: `buzz_${i}`,
    index: i,
    name,
    rarity,
    bonus,
    cost,
  };
});
