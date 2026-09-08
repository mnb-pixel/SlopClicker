// iOS-App-Seite (/ios-app). Fakten: Deployment Target iOS 15.0 (ios/App/App.xcodeproj),
// AdMob-Banner + Rewarded (nativeBanner.js/nativeAdBridge.js), Werbefrei-IAP (PurchaseBridge.js),
// Haptik (platform/haptics.js), Export/Import auch nativ (MiscTab.jsx, nur CrazyGames ohne).
export const IOS_APP = {
  kicker: 'iOS-App',
  title: 'Tokenkamin: AI Clicker – Token Furnace fürs iPhone',
  lead:
    'Dasselbe Spiel wie im Browser, als native App: mit haptischem Feedback, Bonus-Videos für Sofort-Boni und einem einmaligen Werbefrei-Kauf. Im App Store heißt es „Tokenkamin: AI Clicker“ – Tokenkamin ist schlicht die deutsche Übersetzung von Token Furnace.',
  badgeNote: 'Kostenlos im App Store. Optionaler In-App-Kauf: Werbefrei.',

  highlights: {
    title: 'Was die App bietet',
    items: [
      '**Der komplette Spielinhalt:** 20 Engines, 13 Ausbaustufen je Engine, 100 Corporate Actions, 80 Buzzword-Karten, 80 Erfolge und der VC-Pitch-Deck-Generator – identisch mit der Web-Version.',
      '**Haptisches Feedback** beim Tippen auf den AGI-Kern, bei Käufen und beim Ziehen einer Karte.',
      '**Bonus-Videos** für die Flüssigstickstoff-Kühlung, den Power-Click-Boost, das Golden Meme, das Beenden einer Bubble und den Offline-Ertrag.',
      '**Werbefrei** als einmaliger Kauf: keine Banner, keine Videos – alle Boni bleiben und sind mit einem Tap abholbar.',
      '**Spielstand-Export und -Import**, kompatibel mit der Web-Version: Du kannst am Rechner weiterspielen, wo du unterwegs aufgehört hast.',
      '**Offline-Ertrag:** Deine Engines produzieren weiter, während die App geschlossen ist – bis zu vier Stunden lang.',
    ],
  },

  compare: {
    title: 'Web-Version oder App?',
    head: ['', 'Web-Version', 'iOS-App'],
    rows: [
      ['Installation', 'keine – läuft im Browser', 'aus dem App Store'],
      ['Preis', 'kostenlos', 'kostenlos'],
      ['Spielstand', 'lokal im Browser, Export/Import', 'lokal auf dem iPhone, Export/Import'],
      ['Bonus-Videos', 'ja, nach Cookie-Zustimmung', 'ja'],
      ['Werbefrei-Kauf', '–', 'einmalig, per In-App-Kauf'],
      ['Haptisches Feedback', '–', 'ja'],
      ['Eigene URLs für Shop, Statistik, Einstellungen', 'ja', '–'],
      ['Sprachen', 'Deutsch, Englisch', 'Deutsch, Englisch'],
    ],
  },

  adFree: {
    title: 'Werbefrei',
    paragraphs: [
      'Die App finanziert sich über einen Banner am unteren Rand und über Bonus-Videos, die du freiwillig ansiehst, um Boni freizuschalten. Wer darauf verzichten möchte, kauft einmalig **Werbefrei** in den Einstellungen der App: Banner und Videos verschwinden dauerhaft, und jeder Bonus, der vorher ein Video verlangte, ist danach mit einem Tap abholbar – mit exakt demselben Wert und denselben Wartezeiten.',
      'Der Kauf läuft vollständig über Apples In-App-Kauf-System. Auf einem neuen Gerät holst du ihn über „Käufe wiederherstellen“ zurück. Es gibt keine weiteren Käufe – nichts, was das Spiel schneller macht, und nichts, was sich abonnieren ließe.',
    ],
  },

  requirements: {
    title: 'Voraussetzungen',
    items: [
      'iPhone mit iOS 15 oder neuer.',
      'Für Bonus-Videos eine Internetverbindung; das Spiel selbst läuft auch ohne.',
      'Kein Konto, keine Anmeldung. Der Spielstand bleibt auf dem Gerät.',
    ],
  },

  support: {
    title: 'Support & Datenschutz',
    paragraphs: [
      'Fragen, Fehler oder Anregungen zur App nimmt der [Kontakt](/ueber#kontakt) entgegen – am hilfreichsten mit iOS-Version, Gerät und einer kurzen Beschreibung. Was die App und ihre Werbepartner verarbeiten, steht in der [Datenschutzerklärung](/datenschutz); sie gilt für die App und die Website gleichermaßen.',
      'Auf iOS fragt die App vor personalisierter Werbung über Apples App-Tracking-Transparenz nach deiner Erlaubnis. Ohne Zustimmung siehst du ausschließlich nicht personalisierte Anzeigen – oder mit Werbefrei gar keine.',
    ],
  },

  shots: [
    { src: '/screenshots/core.webp', alt: 'Tokenkamin: AI Clicker auf dem iPhone – Slop Core mit AGI-Kern und Engines', caption: 'Slop Core' },
    { src: '/screenshots/buzzwords.webp', alt: 'Buzzword-Bereich der App mit Booster-Pack und Sammelalbum', caption: 'Booster-Pack & Album' },
    { src: '/screenshots/card.webp', alt: 'Neu gezogene Karte „Quantum-Ready Compute Layer“ mit +2 % globalem VPS-Bonus', caption: 'Neue Karte gezogen' },
    { src: '/screenshots/pitchdeck.webp', alt: 'VC-Pitch-Deck-Generator in der App mit Bewertungsgutachten', caption: 'Pitch-Deck-Generator' },
  ],

  next: [
    { href: '/faq', label: 'Häufige Fragen', teaser: 'Spielstand übertragen, Werbefrei wiederherstellen, mehr.' },
    { href: '/anleitung', label: 'Spielanleitung', teaser: 'Alle Mechaniken – gelten in App und Browser gleich.' },
  ],
};
