// Übersetzungen für die 4 Hype-Epochen (siehe EPOCHS in src/data/credibilityTreeData.js).
// Struktur: EPOCHS_CONTENT[epochId] = { de: {name, prefix}, en: {name, prefix} }

export const EPOCHS_CONTENT = {
  blockchain: {
    de: { name: 'Blockchain-Ära', prefix: 'On-Chain: ' },
    en: { name: 'Blockchain Era', prefix: 'On-Chain: ' },
  },
  metaverse: {
    de: { name: 'Virtual-World-Ära', prefix: 'Virtual World: ' },
    en: { name: 'Virtual World Era', prefix: 'Virtual World: ' },
  },
  ai: {
    de: { name: 'KI-Hype-Ära', prefix: '' },
    en: { name: 'AI Hype Era', prefix: '' },
  },
  quantum: {
    de: { name: 'Quanten-Ära', prefix: 'Quanten-' },
    en: { name: 'Quantum Era', prefix: 'Quantum-' },
  },
};
