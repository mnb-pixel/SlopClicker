// Multi-Language Dictionary (DE, EN, FR, ES) for SlopClicker / Hype Clicker

import { buildContentTranslations } from './mergeContent';

export const TRANSLATIONS = {
  de: {
    // Header
    formHeader: 'FORMULAR W-9 / S-1 | DEPARTEMENT DER FINANZEN — INTERNAL REVENUE SERVICE & SEC FILING',
    confidentialTicker: 'CONFIDENTIAL DRAFT S-1 FILING • SEC FORM S-1 REGISTRATION • HYPE-STUFE',
    burnRate: '🔥 Burn:',
    netVps: 'Netto-VPS:',
    slopCount: 'Slop:',
    powerTap: 'Power Tap:',
    viewDesktop: 'Web All-in-One',
    viewMobile: 'Mobile 5-Tabs',
    themeLedger: '📜 S-1 Ledger',
    themeCyber: '📱 Cyberpunk',
    openManual: 'Handbuch',

    // Tabs
    tabSlop: 'Slop Core',
    tabStore: 'Shop',
    tabSpecial: 'Special',
    tabStats: 'Statistik',
    tabMisc: 'Settings',

    // Slop Tab
    watermark: 'CONFIDENTIAL DRAFT S-1',
    sealTitle: '★ OFFICIAL AUTHORIZATION SEAL ★',
    sealHeader: 'W-9 ZEILE 1: TAXPAYER AUTHORIZATION',
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
    buzzwordDesc: 'Sammle KI-Buzzwords für bis zu +190% kumulativen Ertrags-Bonus!',
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
    manualTitle: 'SEC Form S-1 Investor Handbuch',

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
    formHeader: 'FORM W-9 / S-1 | DEPARTMENT OF THE TREASURY — INTERNAL REVENUE SERVICE & SEC FILING',
    confidentialTicker: 'CONFIDENTIAL DRAFT S-1 FILING • SEC FORM S-1 REGISTRATION • HYPE TIER',
    burnRate: '🔥 Burn:',
    netVps: 'Net VPS:',
    slopCount: 'Slop:',
    powerTap: 'Power Tap:',
    viewDesktop: 'Web All-in-One',
    viewMobile: 'Mobile 5-Tabs',
    themeLedger: '📜 S-1 Ledger',
    themeCyber: '📱 Cyberpunk',
    openManual: 'Manual',

    // Tabs
    tabSlop: 'Slop Core',
    tabStore: 'Store',
    tabSpecial: 'Special',
    tabStats: 'Stats',
    tabMisc: 'Settings',

    // Slop Tab
    watermark: 'CONFIDENTIAL DRAFT S-1',
    sealTitle: '★ OFFICIAL AUTHORIZATION SEAL ★',
    sealHeader: 'W-9 LINE 1: TAXPAYER AUTHORIZATION',
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
    buzzwordDesc: 'Collect AI Buzzwords for up to +190% cumulative VPS bonus!',
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
    manualTitle: 'SEC Form S-1 Investor Manual',

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

  fr: {
    // Header
    formHeader: 'FORMULAIRE W-9 / S-1 | DÉPARTEMENT DU TRÉSOR — SERVICE DES IMPÔTS ET DE LA SEC',
    confidentialTicker: 'DÉPÔT CONFIDENTIEL S-1 • ENREGISTREMENT SEC FORM S-1 • NIVEAU HYPE',
    burnRate: '🔥 Burn:',
    netVps: 'Net VPS:',
    slopCount: 'Slop:',
    powerTap: 'Power Tap:',
    viewDesktop: 'Web Tout-en-un',
    viewMobile: 'Mobile 5-Onglets',
    themeLedger: '📜 S-1 Ledger',
    themeCyber: '📱 Cyberpunk',
    openManual: 'Manuel',

    // Tabs
    tabSlop: 'Slop Core',
    tabStore: 'Boutique',
    tabSpecial: 'Spécial',
    tabStats: 'Statistiques',
    tabMisc: 'Paramètres',

    // Slop Tab
    watermark: 'PROJET CONFIDENTIEL S-1',
    sealTitle: '★ SCEAU OFFICIEL D\'AUTORISATION ★',
    sealHeader: 'W-9 LIGNE 1: AUTORISATION DU CONTRIBUABLE',
    sealPart: 'PARTIE I',
    sealButtonText: 'AUTORISER PROMPT ET JETONS',
    perTap: '/ tap',
    powerSurge: 'Power Click Actif ! Les taps comptent double !',
    gpuOverheated: 'GPU EN SURCHAUFFE !',
    gpuCooling: 'Sécurité thermique déclenchée à 100°C. Refroidissement (-4°C/s).',

    // Store Sub-tabs
    subEngines: 'Engines IA',
    subUpgrades: 'Améliorations',
    subCorporate: 'Entreprise',
    subBuzzwords: 'Buzzwords',

    // Corporate Section
    corporateTitle: 'Protocoles d\'Entreprise & Greenwashing',
    corporateDesc: 'Réduisez le taux de combustion avec le greenwashing ou lancez des licenciements IA !',
    lockedCorporate: '??? Protocole Verrouillé',
    lockedCorporateDesc: 'Nécessite une valeur plus élevée ou un moteur IA lié.',
    executed: 'EXÉCUTÉ',
    locked: 'VERROUILLÉ',

    // Buzzwords Section
    buzzwordTitle: 'Cartes Buzzwords à Collectionner',
    buzzwordDesc: 'Collectionnez les buzzwords IA pour jusqu\'à +190% de bonus VPS !',
    buzzwordCollected: 'Collectionnés:',
    lockedBuzzword: '??? Carte Verrouillée',
    lockedBuzzwordDesc: 'Nécessite une valorisation plus élevée.',
    collected: 'COLLECTIONNÉ',

    // Special Tab
    pivotTitle: 'Stratégie de Pivotement & Époques',
    pivotDesc: 'Pivotez votre startup vers la prochaine ère et gagnez de la Crédibilité. Moteurs, Améliorations & Valorisation restent intacts !',
    credBalance: 'Solde de Crédibilité:',
    pivotGain: 'Gain du Pivot:',
    executePivot: 'Exécuter le Pivot (+',

    pathIdealist: '😇 Idéaliste',
    pathCynic: '😈 Cynique',
    pathAscension: '🌌 Singularité',
    idealistTitle: 'Voie de Crédibilité Idéaliste',
    idealistDesc: 'Débloque des pratiques éthiques qui réduisent le taux de combustion !',
    cynicTitle: 'Voie de Crédibilité Cynique',
    cynicDesc: 'Croissance agressive ! Booste le VPS mais augmente les risques !',
    ascendTitle: 'Ascension vers la Singularité',
    prestigeLevelText: 'Niveau de Prestige:',
    heavenlyChipsText: 'Jetons Célestes:',
    executeAscend: 'Exécuter la Réinitialisation (+',

    // Stats Tab
    statsTitle: 'Bilan de la Startup & Journaux d\'Audit',
    statValuation: 'Valeur Actuelle:',
    statTotalValuation: 'Valeur Totale Cumulée:',
    statTotalClicks: 'Taps Manuels:',
    statOverheats: 'Surchauffes GPU:',
    milestones: 'Jalons / Succès',

    // Settings Tab
    settingsTitle: 'Paramètres & Audio',
    audioTitle: 'Sons Effets Web Audio',
    graphicsTitle: 'Graphismes Cyber',
    wipeSave: 'Effacer la Sauvegarde',
    wipeConfirm: 'Êtes-vous sûr ? Toute la progression sera supprimée !',
    yesWipe: 'OUI, EFFACER LA SAUVEGARDE',
    cancel: 'ANNULER',
    pitchDeck: 'Exporter le Pitch Deck Meme',
    manualTitle: 'Manuel Investisseur SEC Form S-1',

    // Language Selector
    language: 'Langue / Lang:',

    // Upgrade Details & Purchased Upgrades
    targetLabel: '🎯 Cible:',
    affectsClick: 'Puissance des Clics Manuels',
    affectsSyndicate: 'Hype du Syndicat du Conseil',
    affectsGlobal: 'Production Globale VPS',
    boughtUpgradesTitle: 'Améliorations Achetées',
    noBoughtUpgrades: 'Aucune amélioration achetée.',
    unitProduction: 'Par Unité:',
    totalProduction: 'Rendement Total:',
    incomeShare: 'du revenu total',
    multiplierLabel: 'Multiplicateur:',
    showBoughtUpgrades: 'Afficher les Améliorations Achetées',
    hideBoughtUpgrades: 'Masquer les Améliorations Achetées',

    // Events / Meme Banners
    claimMemeBtn: '⚡ RÉCLAMER LE MEME !',
    noticedBtn: '📋 PRIS EN COMPTE',
    event_vc_tweet_title: '🟢 VC Hype Tweet',
    event_vc_tweet_desc: 'Pam Saltman partage votre startup ! Boost immédiat de +20% de valorisation !',
    event_eu_ai_act_title: '🔴 Loi Mondiale Slop Adoptée',
    event_eu_ai_act_desc: 'Frais de conformité réglementaire ! VPS réduit de 50% pendant 20 secondes.',
    event_llm_hallucination_title: '🌀 Hallucination du LLM',
    event_llm_hallucination_desc: 'Modèles produisant du slop ultra-créatif ! Valeur de clic x5 pendant 15s !',
  },

  es: {
    // Header
    formHeader: 'FORMULARIO W-9 / S-1 | DEPARTAMENTO DEL TESORO — SERVICIO DE IMPUESTOS Y SEC',
    confidentialTicker: 'REGISTRO CONFIDENCIAL S-1 • FORMULARIO SEC S-1 • NIVEL DE HYPE',
    burnRate: '🔥 Burn:',
    netVps: 'Net VPS:',
    slopCount: 'Slop:',
    powerTap: 'Power Tap:',
    viewDesktop: 'Web Todo-en-uno',
    viewMobile: 'Móvil 5-Pestañas',
    themeLedger: '📜 S-1 Ledger',
    themeCyber: '📱 Cyberpunk',
    openManual: 'Manual',

    // Tabs
    tabSlop: 'Slop Core',
    tabStore: 'Tienda',
    tabSpecial: 'Especial',
    tabStats: 'Estadísticas',
    tabMisc: 'Ajustes',

    // Slop Tab
    watermark: 'BORRADOR CONFIDENCIAL S-1',
    sealTitle: '★ SELLO OFICIAL DE AUTORIZACIÓN ★',
    sealHeader: 'W-9 LÍNEA 1: AUTORIZACIÓN DEL CONTRIBUYENTE',
    sealPart: 'PARTE I',
    sealButtonText: 'AUTORIZAR PROMPT Y TOKENS',
    perTap: '/ tap',
    powerSurge: '¡Power Click Activo! ¡Los taps valen el doble!',
    gpuOverheated: '¡GPU SOBRECALENTADA!',
    gpuCooling: 'Protección térmica activada a 100°C. Enfriando (-4°C/s).',

    // Store Sub-tabs
    subEngines: 'Motores IA',
    subUpgrades: 'Mejoras',
    subCorporate: 'Corporativo',
    subBuzzwords: 'Buzzwords',

    // Corporate Section
    corporateTitle: 'Protocolos Corporativos & Greenwashing',
    corporateDesc: '¡Reduce la tasa de quemado con greenwashing o activa despidos masivos con IA!',
    lockedCorporate: '??? Protocolo Bloqueado',
    lockedCorporateDesc: 'Requiere una mayor valoración o motor IA vinculado.',
    executed: 'EJECUTADO',
    locked: 'BLOQUEADO',

    // Buzzwords Section
    buzzwordTitle: 'Tarjetas Buzzwords Coleccionables',
    buzzwordDesc: '¡Colecciona buzzwords de IA para obtener hasta +190% de bonificación VPS!',
    buzzwordCollected: 'Coleccionadas:',
    lockedBuzzword: '??? Tarjeta Oculta',
    lockedBuzzwordDesc: 'Requiere mayor valoración para revelar.',
    collected: 'COLECCIONADO',

    // Special Tab
    pivotTitle: 'Estrategia de Pivote & Épocas',
    pivotDesc: '¡Pivota tu startup hacia la próxima era y gana Credibilidad! ¡Motores, Mejoras y Valoración se mantienen intactos!',
    credBalance: 'Saldo de Credibilidad:',
    pivotGain: 'Ganancia del Pivote:',
    executePivot: 'Ejecutar Pivote (+',

    pathIdealist: '😇 Idealista',
    pathCynic: '😈 Cínico',
    pathAscension: '🌌 Singularidad',
    idealistTitle: 'Ruta de Credibilidad Idealista',
    idealistDesc: '¡Desbloquea prácticas éticas que reducen permanentemente la tasa de quemado!',
    cynicTitle: 'Ruta de Credibilidad Cínica',
    cynicDesc: '¡Crecimiento agresivo! ¡Aumenta drásticamente el VPS pero eleva el riesgo!',
    ascendTitle: 'Ascensión a la Singularidad',
    prestigeLevelText: 'Nivel de Prestigio:',
    heavenlyChipsText: 'Fichas Celestiales:',
    executeAscend: 'Ejecutar Reinicio de Singularidad (+',

    // Stats Tab
    statsTitle: 'Balance General & Registros de Auditoría',
    statValuation: 'Valor Actual:',
    statTotalValuation: 'Valor Histórico Acumulado:',
    statTotalClicks: 'Taps Manuales:',
    statOverheats: 'Sobrecalentamientos GPU:',
    milestones: 'Hitos / Logros',

    // Settings Tab
    settingsTitle: 'Ajustes & Audio',
    audioTitle: 'Sonidos Efectos Web Audio',
    graphicsTitle: 'Gráficos Cyber',
    wipeSave: 'Borrar Datos de Guardado',
    wipeConfirm: '¿Estás seguro? ¡Se borrará todo el progreso!',
    yesWipe: 'SÍ, BORRAR GUARDADO',
    cancel: 'CANCELAR',
    pitchDeck: 'Exportar Pitch Deck Meme',
    manualTitle: 'Manual del Inversor SEC Form S-1',

    // Language Selector
    language: 'Idioma / Lang:',

    // Upgrade Details & Purchased Upgrades
    targetLabel: '🎯 Objetivo:',
    affectsClick: 'Poder de Clic Manual',
    affectsSyndicate: 'Hype del Sindicato de la Junta',
    affectsGlobal: 'Producción Global VPS',
    boughtUpgradesTitle: 'Mejoras Compradas',
    noBoughtUpgrades: 'Aún no has comprado mejoras.',
    unitProduction: 'Por Unidad:',
    totalProduction: 'Rendimiento Total:',
    incomeShare: 'del ingreso total',
    multiplierLabel: 'Multiplicador:',
    showBoughtUpgrades: 'Mostrar Mejoras Compradas',
    hideBoughtUpgrades: 'Ocultar Mejoras Compradas',

    // Events / Meme Banners
    claimMemeBtn: '⚡ ¡RECLAMAR MEME!',
    noticedBtn: '📋 ENTENDIDO',
    event_vc_tweet_title: '🟢 Tweet de VC Hype',
    event_vc_tweet_desc: '¡Pam Saltman retwittea tu startup! ¡Impulso instantáneo del +20% en valoración!',
    event_eu_ai_act_title: '🔴 Ley Mundial de Slop Aprobada',
    event_eu_ai_act_desc: '¡Carga regulatoria de cumplimiento! VPS reducido en un 50% durante 20 segundos.',
    event_llm_hallucination_title: '🌀 Alucinación del LLM',
    event_llm_hallucination_desc: '¡Los modelos producen slop ultra creativo! ¡Valor de clic x5 por 15s!',
  },
};

// Große Content-Dictionaries (Gebäude, 260 Upgrades, 100 Greenwashing/Layoffs,
// Achievements, Events) leben in src/i18n/content/*.content.js und werden hier
// eingemischt, damit t()/tr() sie wie jeden anderen UI-Text auflösen kann.
// de/en sind vollständig befüllt; fr/es fallen auf en zurück (t() macht das
// automatisch: TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key).
const CONTENT_TRANSLATIONS = buildContentTranslations();
Object.assign(TRANSLATIONS.de, CONTENT_TRANSLATIONS.de);
Object.assign(TRANSLATIONS.en, CONTENT_TRANSLATIONS.en);
