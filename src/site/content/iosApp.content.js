// App-Seite (/ios-app). Fakten: Deployment Target iOS 15.0 (ios/App/App.xcodeproj),
// AdMob-Banner + Rewarded (nativeBanner.js/nativeAdBridge.js), Werbefrei-IAP (PurchaseBridge.js),
// Haptik (platform/haptics.js), Export/Import auch nativ (MiscTab.jsx, nur CrazyGames ohne).
// Seit dem Android-Release (com.tokenfurnace.app bei Google Play) deckt diese Seite beide
// Plattformen ab statt nur iOS - Pfad/Datei heißen aus Kontinuitätsgründen weiter "ios-app".
export const IOS_APP = {
  kicker: 'App',
  title: 'Tokenkamin: AI Clicker – Token Furnace fürs Handy',
  lead:
    'Dasselbe Spiel wie im Browser, als native App für iPhone und Android: mit haptischem Feedback, Bonus-Videos für Sofort-Boni und einem einmaligen Werbefrei-Kauf. In den Stores heißt sie „Tokenkamin: AI Clicker“ – Tokenkamin ist schlicht die deutsche Übersetzung von Token Furnace.',
  badgeNote: 'Kostenlos im App Store und bei Google Play. Optionaler In-App-Kauf: Werbefrei.',

  highlights: {
    title: 'Was die App bietet',
    items: [
      '**Der komplette Spielinhalt:** 20 Engines, 13 Ausbaustufen je Engine, 100 Corporate Actions, 80 Buzzword-Karten, 80 Erfolge und der VC-Pitch-Deck-Generator – identisch mit der Web-Version.',
      '**Haptisches Feedback** beim Tippen auf den AGI-Kern, bei Käufen und beim Ziehen einer Karte.',
      '**Bonus-Videos** für die Flüssigstickstoff-Kühlung, den Power-Click-Boost, das Golden Meme, das Beenden einer Bubble und den Offline-Ertrag.',
      '**Werbefrei** als einmaliger Kauf: keine Banner, keine Videos – alle Boni bleiben und sind mit einem Tap abholbar.',
      '**Spielstand-Export und -Import**: Sichere deinen Fortschritt als Datei oder übertrage ihn auf ein anderes iPhone.',
      '**Offline-Ertrag:** Deine Engines produzieren weiter, während die App geschlossen ist – bis zu vier Stunden lang.',
    ],
  },

  compare: {
    title: 'Web-Version oder App?',
    head: ['', 'Web-Version', 'iOS-App', 'Android-App'],
    rows: [
      ['Installation', 'keine – läuft im Browser', 'aus dem App Store', 'aus Google Play'],
      ['Preis', 'kostenlos', 'kostenlos', 'kostenlos'],
      ['Spielstand', 'lokal im Browser, Export/Import', 'lokal auf dem Gerät, Export/Import', 'lokal auf dem Gerät, Export/Import'],
      ['Bonus-Videos', 'ja, nach Cookie-Zustimmung', 'ja', 'ja'],
      ['Werbefrei-Kauf', '–', 'einmalig, per In-App-Kauf', 'einmalig, per In-App-Kauf'],
      ['Haptisches Feedback', '–', 'ja', 'ja'],
      ['Eigene URLs für Shop, Statistik, Einstellungen', 'ja', '–', '–'],
      ['Sprachen', 'Deutsch, Englisch', 'Deutsch, Englisch', 'Deutsch, Englisch'],
    ],
  },

  adFree: {
    title: 'Werbefrei',
    paragraphs: [
      'Die App finanziert sich über einen Banner am unteren Rand und über Bonus-Videos, die du freiwillig ansiehst, um Boni freizuschalten. Wer darauf verzichten möchte, kauft einmalig **Werbefrei** in den Einstellungen der App: Banner und Videos verschwinden dauerhaft, und jeder Bonus, der vorher ein Video verlangte, ist danach mit einem Tap abholbar – mit exakt demselben Wert und denselben Wartezeiten.',
      'Der Kauf läuft vollständig über das In-App-Kauf-System des jeweiligen Stores (Apple auf iOS, Google Play auf Android). Auf einem neuen Gerät holst du ihn über „Käufe wiederherstellen“ zurück. Es gibt keine weiteren Käufe – nichts, was das Spiel schneller macht, und nichts, was sich abonnieren ließe.',
    ],
  },

  requirements: {
    title: 'Voraussetzungen',
    items: [
      'iPhone mit iOS 15 oder neuer, oder ein Smartphone mit aktuellem Android.',
      'Für Bonus-Videos eine Internetverbindung; das Spiel selbst läuft auch ohne.',
      'Kein Konto, keine Anmeldung. Der Spielstand bleibt auf dem Gerät.',
    ],
  },

  support: {
    title: 'Support & Datenschutz',
    paragraphs: [
      'Fragen, Fehler oder Anregungen zur App nimmt der [Kontakt](/ueber#kontakt) entgegen – am hilfreichsten mit Betriebssystem-Version, Gerät und einer kurzen Beschreibung. Was die App und ihre Werbepartner verarbeiten, steht in der [Datenschutzerklärung](/datenschutz); sie gilt für die App (iOS und Android) und die Website gleichermaßen.',
      'Auf iOS fragt die App vor personalisierter Werbung über Apples App-Tracking-Transparenz nach deiner Erlaubnis. Auf Android greifen die Werbeeinstellungen deines Google-Kontos. Ohne Zustimmung siehst du ausschließlich nicht personalisierte Anzeigen – oder mit Werbefrei gar keine.',
    ],
  },

  shots: [
    { src: '/screenshots/core.webp', alt: 'Tokenkamin: AI Clicker auf dem iPhone – Slop Core mit AGI-Kern und Engines', caption: 'Slop Core' },
    { src: '/screenshots/buzzwords.webp', alt: 'Buzzword-Bereich der App mit Booster-Pack und Sammelalbum', caption: 'Booster-Pack & Album' },
    { src: '/screenshots/card.webp', alt: 'Neu gezogene Karte „Quantum-Ready Compute Layer“ mit +2 % globalem VPS-Bonus', caption: 'Neue Karte gezogen' },
    { src: '/screenshots/pitchdeck.webp', alt: 'VC-Pitch-Deck-Generator in der App mit Bewertungsgutachten', caption: 'Pitch-Deck-Generator' },
  ],

  // Nur für die 3D-Voxel-Variante der Seite (/voxel/ios-app) – eigene Screenshots im hellen Voxel-UI.
  voxelShots: [
    { src: '/screenshots/voxel-village.webp', alt: 'Tokenkamin: AI Clicker auf dem iPhone – 3D-Voxel-Dorfkarte mit Rechenzentren, Häusern und Fluss', caption: 'Voxel-Dorfkarte' },
    { src: '/screenshots/voxel-card-drawn.webp', alt: 'Neu gezogene Buzzword-Karte „Bleeding-Edge Deep Tech“ (Rare) mit +10 % globalem VPS-Bonus', caption: 'Neue Buzzword-Karte' },
    { src: '/screenshots/voxel-engines.webp', alt: 'KI-Infrastruktur-Modal mit den AI Engines Prompt-Praktikant, Chatbot-Widget, Prompt Engineer, GPU-Rack und Rechenzentrum samt Kaufmodus', caption: 'AI Engines & Kaufmodus' },
    { src: '/screenshots/voxel-upgrades.webp', alt: 'Upgrade-Kacheln im Shop mit geöffneter Detailkarte „Praktikanten-Pipeline zur Uni“ für 457 Dollar', caption: 'Upgrades' },
  ],

  next: [
    { href: '/faq', label: 'Häufige Fragen', teaser: 'Spielstand übertragen, Werbefrei wiederherstellen, mehr.' },
    { href: '/anleitung', label: 'Spielanleitung', teaser: 'Alle Mechaniken – gelten in App und Browser gleich.' },
  ],
};
