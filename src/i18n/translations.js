// Multi-Language Dictionary (DE, EN) for SlopClicker / Hype Clicker

import { buildContentTranslations } from './mergeContent';

export const TRANSLATIONS = {
  de: {
    // Header
    formHeader: 'FINANZ PROSPEKT | UNTERNEHMENS-PROFIL & AUDIT',
    confidentialTicker: 'CONFIDENTIAL DRAFT FILING • REGISTRATION • HYPE-STUFE',
    burnRate: '🔥 Burn:',
    netVps: 'Netto-VPS:',
    slopCount: 'Slop:',
    powerTap: 'Power Tap:',
    viewDesktop: 'Web All-in-One',
    viewMobile: 'Mobile 5-Tabs',
    themeLedger: '📜 Investor Ledger',
    themeCyber: '📱 Cyberpunk',
    openManual: 'Handbuch',

    // Tabs
    tabSlop: 'Slop Core',
    tabStore: 'Shop',
    tabSpecial: 'Special',
    tabStats: 'Statistik',
    tabMisc: 'Settings',

    // Slop Tab
    watermark: 'CONFIDENTIAL DRAFT',
    sealTitle: '★ OFFICIAL AUTHORIZATION SEAL ★',
    sealHeader: 'ZEILE 1: TAXPAYER AUTHORIZATION',
    sealPart: 'TEIL I',
    sealButtonText: 'PROMPT & TOKENS AUTHORISIEREN',
    perTap: '/ Tap',
    powerSurge: 'Power Click Surge Aktiv! Taps zählen doppelt!',
    gpuOverheated: 'GPU ÜBERHITZT!',
    gpuCooling: 'Thermische Schutzschaltung bei 100°C ausgelöst. Kühlung läuft (-4°C/s).',

    // Store Sub-tabs
    subEngines: 'AI Engines',
    subUpgrades: 'Upgrades',
    subCorporate: 'Corporate',
    subBuzzwords: 'Buzzwords',

    // Corporate Section
    corporateTitle: 'Corporate Actions & Greenwashing Protocol',
    corporateDesc: 'Senke die Burn Rate mit Greenwashing (-0.1%) oder triggere AI Massenentlassungen (+20% bis +35% Engine Output)!',
    lockedCorporate: '??? Sperr-Protokoll',
    lockedCorporateDesc: 'Erfordert höhere Bewertung oder verknüpfte KI-Engine.',
    executed: 'AUSGEFÜHRT',
    locked: 'GESPERRT',

    // Buzzwords Section
    buzzwordTitle: 'Sammelbare Buzzword-Karten',
    buzzwordDesc: 'Sammle KI-Buzzwords für bis zu +290% kumulativen Ertrags-Bonus!',
    buzzwordCollected: 'Gesammelt:',
    lockedBuzzword: '??? Verborgene Buzzword-Karte',
    lockedBuzzwordDesc: 'Erfordert höhere Bewertung.',
    collected: 'GESAMMELT',

    // Special Tab
    pivotTitle: 'Pivot Strategy & Epochen-Rotation',
    pivotDesc: 'Pivotiere dein Startup in die nächste Hype-Ära und sammle Credibility. Engines, Upgrades & Valuation bleiben erhalten!',
    credBalance: 'Credibility Guthaben:',
    pivotGain: 'Pivot Gewinn:',
    executePivot: 'Pivot Ausführen (+',

    pathIdealist: '😇 Idealist',
    pathCynic: '😈 Zyniker',
    pathAscension: '🌌 Singularität',
    idealistTitle: 'Idealisten Credibility-Pfad',
    idealistDesc: 'Schaltet ethische Strukturen frei, die deine Token Burn Rate dauerhaft senken!',
    cynicTitle: 'Zyniker Credibility-Pfad',
    cynicDesc: 'Aggressives Hype-Wachstum! Steigert VPS, erhöht aber die Burn Rate!',
    ascendTitle: 'Singularity Ascension',
    prestigeLevelText: 'Prestige Level:',
    heavenlyChipsText: 'Heavenly Chips:',
    executeAscend: 'Singularity Reset Ausführen (+',

    // Stats Tab
    statsTitle: 'Startup Bilanz & Audit Logs',
    statValuation: 'Aktueller Wert:',
    statTotalValuation: 'Lifetime Valuation:',
    statTotalClicks: 'Manuelle Taps:',
    statOverheats: 'GPU Überhitzungen:',
    milestones: 'Meilensteine / Erfolge',

    // Settings Tab
    settingsTitle: 'Einstellungen & Audio',
    audioTitle: 'Web Audio SFX Tones',
    graphicsTitle: 'Fancy Cyber Grafiken',
    wipeSave: 'Spielstand Löschen',
    wipeConfirm: 'Bist du sicher? Alle Fortschritte werden gelöscht!',
    yesWipe: 'JA, SP IELSTAND LÖSCHEN',
    cancel: 'ABBRECHEN',
    pitchDeck: 'Meme Pitch Deck Exportieren',
    manualTitle: 'Investor & Startup Handbuch',

    // Language Selector
    language: 'Sprache / Lang:',

    // Upgrade Details & Purchased Upgrades
    targetLabel: '🎯 Ziel:',
    affectsClick: 'Manuelle Click-Kraft',
    affectsSyndicate: 'Vorstands-Syndikat Scaling',
    affectsGlobal: 'Globale VPS-Produktion',
    boughtUpgradesTitle: 'Gekaufte Upgrades',
    noBoughtUpgrades: 'Noch keine Upgrades erworben.',
    unitProduction: 'Pro Einheit:',
    totalProduction: 'Gesamtertrag:',
    incomeShare: 'des Gesamteinkommens',
    multiplierLabel: 'Multiplikator:',
    showBoughtUpgrades: 'Gekaufte Upgrades anzeigen',
    hideBoughtUpgrades: 'Gekaufte Upgrades ausblenden',

    // Events / Meme Banners
    claimMemeBtn: '⚡ MEME SICHERN!',
    noticedBtn: '📋 ZUR KENNTNIS GENOMMEN',
    event_vc_tweet_title: '🟢 VC Hype Tweet',
    event_vc_tweet_desc: 'Pam Saltman teilt dein Startup! Sofortiger +20% Bewertungs-Boost!',
    event_eu_ai_act_title: '🔴 Global Slop Act Verabschiedet',
    event_eu_ai_act_desc: 'Bürokratischer Regulierungs-Overhead! VPS für 20 Sekunden um 50% gesenkt.',
    event_llm_hallucination_title: '🌀 LLM Halluzination',
    event_llm_hallucination_desc: 'Modelle halluzinieren kreativen Slop! 5x Click-Wert für 15s!',
  },

  en: {
    // Header
    formHeader: 'FINANCIAL PROSPECTUS | COMPANY PROFILE & AUDIT',
    confidentialTicker: 'CONFIDENTIAL DRAFT FILING • REGISTRATION • HYPE TIER',
    burnRate: '🔥 Burn:',
    netVps: 'Net VPS:',
    slopCount: 'Slop:',
    powerTap: 'Power Tap:',
    viewDesktop: 'Web All-in-One',
    viewMobile: 'Mobile 5-Tabs',
    themeLedger: '📜 Investor Ledger',
    themeCyber: '📱 Cyberpunk',
    openManual: 'Manual',

    // Tabs
    tabSlop: 'Slop Core',
    tabStore: 'Store',
    tabSpecial: 'Special',
    tabStats: 'Stats',
    tabMisc: 'Settings',

    // Slop Tab
    watermark: 'CONFIDENTIAL DRAFT',
    sealTitle: '★ OFFICIAL AUTHORIZATION SEAL ★',
    sealHeader: 'LINE 1: TAXPAYER AUTHORIZATION',
    sealPart: 'PART I',
    sealButtonText: 'AUTHORIZE PROMPT & TOKENS',
    perTap: '/ tap',
    powerSurge: 'Power Click Surge Active! Taps deal 2x value!',
    gpuOverheated: 'GPU OVERHEATED!',
    gpuCooling: 'Thermal safety throttled the AGI core at 100°C. Cooling (-4°C/s).',

    // Store Sub-tabs
    subEngines: 'AI Engines',
    subUpgrades: 'Upgrades',
    subCorporate: 'Corporate',
    subBuzzwords: 'Buzzwords',

    // Corporate Section
    corporateTitle: 'Corporate Actions & Greenwashing Protocol',
    corporateDesc: 'Mitigate Burn Rate with Greenwashing (-0.1%) or trigger AI Mass Layoffs (+20% to +35% Engine Output)!',
    lockedCorporate: '??? Locked Corporate Protocol',
    lockedCorporateDesc: 'Requires higher valuation or linked AI engine.',
    executed: 'EXECUTED',
    locked: 'LOCKED',

    // Buzzwords Section
    buzzwordTitle: 'Collectible Buzzword Cards',
    buzzwordDesc: 'Collect AI Buzzwords for up to +290% cumulative VPS bonus!',
    buzzwordCollected: 'Collected:',
    lockedBuzzword: '??? Hidden Buzzword Card',
    lockedBuzzwordDesc: 'Requires higher valuation to reveal.',
    collected: 'COLLECTED',

    // Special Tab
    pivotTitle: 'Pivot Strategy & Epoch Rotation',
    pivotDesc: 'Pivot your startup into the next hype era and earn Credibility. Engines, Upgrades & Valuation stay intact!',
    credBalance: 'Credibility Balance:',
    pivotGain: 'Pivot Gain:',
    executePivot: 'Execute Pivot (+',

    pathIdealist: '😇 Idealist',
    pathCynic: '😈 Cynic',
    pathAscension: '🌌 Singularity',
    idealistTitle: 'Idealist Credibility Path',
    idealistDesc: 'Unlocks ethical practices that permanently lower your Token Burn Rate!',
    cynicTitle: 'Cynic Credibility Path',
    cynicDesc: 'Aggressive hype growth! Skyrockets VPS but increases Burn Rate risk!',
    ascendTitle: 'Singularity Ascension',
    prestigeLevelText: 'Prestige Level:',
    heavenlyChipsText: 'Heavenly Chips:',
    executeAscend: 'Execute Singularity Reset (+',

    // Stats Tab
    statsTitle: 'Startup Balance Sheet & Audit Logs',
    statValuation: 'Current Value:',
    statTotalValuation: 'Lifetime Valuation:',
    statTotalClicks: 'Manual Taps:',
    statOverheats: 'GPU Overheats:',
    milestones: 'Milestones / Achievements',

    // Settings Tab
    settingsTitle: 'Settings & Audio',
    audioTitle: 'Web Audio SFX Tones',
    graphicsTitle: 'Fancy Cyber Graphics',
    wipeSave: 'Wipe Save Game Data',
    wipeConfirm: 'Are you sure? This will delete all startup progress!',
    yesWipe: 'YES, WIPE SAVE',
    cancel: 'CANCEL',
    pitchDeck: 'Export Meme Pitch Deck',
    manualTitle: 'Investor & Startup Manual',

    // Language Selector
    language: 'Language / Lang:',

    // Upgrade Details & Purchased Upgrades
    targetLabel: '🎯 Target:',
    affectsClick: 'Manual Click Power',
    affectsSyndicate: 'Board Syndicate Hype',
    affectsGlobal: 'Global VPS Output',
    boughtUpgradesTitle: 'Bought Upgrades',
    noBoughtUpgrades: 'No upgrades purchased yet.',
    unitProduction: 'Per Unit:',
    totalProduction: 'Total Output:',
    incomeShare: 'of total income',
    multiplierLabel: 'Multiplier:',
    showBoughtUpgrades: 'Show Bought Upgrades',
    hideBoughtUpgrades: 'Hide Bought Upgrades',

    // Events / Meme Banners
    claimMemeBtn: '⚡ CLAIM MEME!',
    noticedBtn: '📋 NOTICED',
    event_vc_tweet_title: '🟢 VC Hype Tweet',
    event_vc_tweet_desc: 'Pam Saltman retweets your startup! Instant +20% Valuation burst!',
    event_eu_ai_act_title: '🔴 Global Slop Act Passed',
    event_eu_ai_act_desc: 'Regulatory compliance overhead! VPS reduced by 50% for 20 seconds.',
    event_llm_hallucination_title: '🌀 LLM Hallucination',
    event_llm_hallucination_desc: 'Models producing ultra-creative slop! Click Value multiplied 5x for 15s!',
  },
};

// Große Content-Dictionaries (Gebäude, 260 Upgrades, 100 Greenwashing/Layoffs,
// Achievements, Events) leben in src/i18n/content/*.content.js und werden hier
// eingemischt, damit t()/tr() sie wie jeden anderen UI-Text auflösen kann.
const CONTENT_TRANSLATIONS = buildContentTranslations();
Object.assign(TRANSLATIONS.de, CONTENT_TRANSLATIONS.de);
Object.assign(TRANSLATIONS.en, CONTENT_TRANSLATIONS.en);
