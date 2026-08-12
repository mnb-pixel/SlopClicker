// Übersetzungen für die 8 Heavenly Upgrades (Chips-Kacheln, siehe
// src/data/heavenlyUpgradesData.js). Struktur:
// HEAVENLY_CONTENT[id] = { de: {name, quote, description}, en: {name, quote, description} }

export const HEAVENLY_CONTENT = {
  angel_1: {
    de: {
      name: 'Seraphim Power Clicks',
      quote: 'Senkt die Power-Click-Abklingzeit von 30 auf 25 Minuten.',
      description: 'Erhöht die maximal speicherbaren Power Clicks auf 15.',
    },
    en: {
      name: 'Seraphim Power Clicks',
      quote: 'Reduces Power Click cooldown from 30m to 25m.',
      description: 'Increases max stored Power Clicks to 15.',
    },
  },
  angel_2: {
    de: {
      name: 'Erzengel-Datenpuffer',
      quote: 'Senkt die Power-Click-Abklingzeit auf 20 Minuten.',
      description: 'Erhöht die maximal speicherbaren Power Clicks auf 25.',
    },
    en: {
      name: 'Archangel Data Buffer',
      quote: 'Reduces Power Click cooldown to 20m.',
      description: 'Increases max stored Power Clicks to 25.',
    },
  },
  angel_3: {
    de: {
      name: 'Cherubim-Unendlichspeicher',
      quote: 'Power Clicks laden alle 15 Minuten auf.',
      description: 'Erhöht die maximal speicherbaren Power Clicks auf 50.',
    },
    en: {
      name: 'Cherubim Infinite Storage',
      quote: 'Power Clicks recharge every 15 minutes.',
      description: 'Increases max stored Power Clicks to 50.',
    },
  },
  demon_1: {
    de: {
      name: 'Belphegors Hype-Surge',
      quote: 'Power Clicks verursachen 3x statt 2x Tap-Schaden.',
      description: 'Aktiver Power-Click-Surge gibt 15s lang +20% VPS.',
    },
    en: {
      name: 'Belphegor Hype Surge',
      quote: 'Power Clicks deal 3x tap damage instead of 2x.',
      description: 'Active Power Click surge gives +20% VPS for 15s.',
    },
  },
  demon_2: {
    de: {
      name: 'Asmodeus-Token-Inflation',
      quote: 'Power Clicks verursachen 5x Tap-Schaden!',
      description: 'Aktiver Power-Click-Surge gibt 25s lang +50% VPS.',
    },
    en: {
      name: 'Asmodeus Token Inflation',
      quote: 'Power Clicks deal 5x tap damage!',
      description: 'Active Power Click surge gives +50% VPS for 25s.',
    },
  },
  demon_3: {
    de: {
      name: 'Luziferische Singularität',
      quote: 'Entfesselt die volle unheilige Kraft der AGI.',
      description: 'Power Clicks verursachen 10x Tap-Schaden und geben 35s lang +100% VPS-Surge!',
    },
    en: {
      name: 'Luciferian Singularity',
      quote: 'Unleashes the full unholy power of AGI.',
      description: 'Power Clicks deal 10x tap damage and give +100% VPS surge for 35s!',
    },
  },
  heaven_golden_1: {
    de: {
      name: 'Glückliche Goldene Memes',
      quote: 'Goldene Memes erscheinen 25% häufiger.',
      description: 'Verringert die Spawn-Abklingzeit von Goldenen Memes.',
    },
    en: {
      name: 'Lucky Golden Memes',
      quote: 'Golden Memes spawn 25% more frequently.',
      description: 'Reduces spawn cooldown of Golden Memes.',
    },
  },
  heaven_synergy_1: {
    de: {
      name: 'Prestige-Synergie-Engine',
      quote: 'Jeder Heavenly Chip gibt +2% statt +1% VPS-Bonus.',
      description: 'Verdoppelt die Effizienz aller Heavenly Chips.',
    },
    en: {
      name: 'Prestige Synergy Engine',
      quote: 'Each Heavenly Chip gives +2% VPS bonus instead of +1%.',
      description: 'Doubles the efficiency of all Heavenly Chips.',
    },
  },
};
