// Einzige Quelle für alle Content-Seiten der Website (NICHT das Spiel unter /play/*, das
// weiterhin App.jsx/routes.js gehört): main.jsx hydratisiert daraus im Browser,
// scripts/prerender.mjs erzeugt daraus beim Web-Build die statischen HTML-Dateien
// (dist/index.html bzw. dist/<file>.html). Cloudflare Workers Static Assets liefert
// dist/anleitung.html unter /anleitung aus (html_handling "auto-trailing-slash", Default,
// siehe wrangler.jsonc) - echte Dateien haben Vorrang vor dem SPA-Fallback.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://token-furnace.com').replace(/\/+$/, '');

export const SITE_ROUTES = [
  {
    path: '/',
    file: 'index',
    nav: 'Start',
    title: 'Token Furnace – Der AI-Bubble Idle Clicker',
    description:
      'Token Furnace ist ein kostenloser, satirischer Idle Clicker über den KI-Hype: Baue ein KI-Startup ohne Produkt zur Milliardenbewertung auf – im Browser oder als iOS-App.',
    load: () => import('./pages/HomePage.jsx').then((m) => m.HomePage),
  },
  {
    path: '/anleitung',
    file: 'anleitung',
    nav: 'Anleitung',
    title: 'Spielanleitung – Token Furnace',
    description:
      'Wie Token Furnace funktioniert: Valuation, Netto-VPS, Hype-Stufen, Burn Rate, GPU-Hitze, alle 20 Engines, Upgrades, Corporate Actions, Buzzword-Karten und Erfolge – komplett erklärt.',
    load: () => import('./pages/AnleitungPage.jsx').then((m) => m.AnleitungPage),
  },
  {
    path: '/strategie',
    file: 'strategie',
    nav: 'Strategie',
    title: 'Strategie & Tipps – Token Furnace',
    description:
      'Strategien für Token Furnace: Early, Mid und Late Game, Kaufmodus richtig nutzen, Burn Rate im Griff behalten, Überhitzung vermeiden, Booster-Packs planen und typische Fehler vermeiden.',
    load: () => import('./pages/StrategiePage.jsx').then((m) => m.StrategiePage),
  },
  {
    path: '/glossar',
    file: 'glossar',
    nav: 'Glossar',
    title: 'Buzzword-Glossar – Token Furnace',
    description:
      'Alle Spielbegriffe und Branchen-Buzzwords aus Token Furnace erklärt – von AGI über Burn Rate und Netto-VPS bis Term Sheet und Unicorn.',
    load: () => import('./pages/GlossarPage.jsx').then((m) => m.GlossarPage),
  },
  {
    path: '/faq',
    file: 'faq',
    nav: 'FAQ',
    title: 'Häufige Fragen (FAQ) – Token Furnace',
    description:
      'Antworten auf die häufigsten Fragen zu Token Furnace: Kosten, Spielstand, Offline-Ertrag, Werbung, Datenschutz, Web-Version und iOS-App.',
    load: () => import('./pages/FaqPage.jsx').then((m) => m.FaqPage),
  },
  {
    path: '/ios-app',
    file: 'ios-app',
    nav: 'iOS-App',
    title: 'Tokenkamin: AI Clicker – die iOS-App – Token Furnace',
    description:
      'Token Furnace als native iOS-App „Tokenkamin: AI Clicker“: Funktionen, Unterschiede zur Web-Version, Werbefrei-Option und Systemvoraussetzungen.',
    load: () => import('./pages/IosAppPage.jsx').then((m) => m.IosAppPage),
  },
  {
    path: '/ueber',
    file: 'ueber',
    nav: 'Über uns',
    title: 'Über uns & Kontakt – Token Furnace',
    description: 'Wer hinter Token Furnace steckt, warum es das Spiel gibt und wie du uns erreichst.',
    load: () => import('./pages/UeberPage.jsx').then((m) => m.UeberPage),
  },
  {
    path: '/impressum',
    file: 'impressum',
    title: 'Impressum – Token Furnace',
    description: 'Impressum und Anbieterkennzeichnung von token-furnace.com.',
    load: () => import('./pages/ImpressumPage.jsx').then((m) => m.ImpressumPage),
  },
  {
    path: '/datenschutz',
    file: 'datenschutz',
    title: 'Datenschutzerklärung – Token Furnace',
    description: 'Datenschutzerklärung für token-furnace.com und die iOS-App Tokenkamin: AI Clicker.',
    load: () => import('./pages/DatenschutzPage.jsx').then((m) => m.DatenschutzPage),
  },
  {
    path: '/voxel',
    file: 'voxel',
    title: 'Token Furnace Voxel 3D – Der AI-Bubble Idle Clicker in 3D',
    description:
      'Erlebe Token Furnace in voller 3D-Voxel-Grafik: 3D-Campus, gemütliches Vorortdorf am Fluss, überhitzter Server-Kamin, GPU-Express-Laster und 20 handgefertigte Micro-Voxel-Engines.',
    load: () => import('./pages/VoxelHomePage.jsx').then((m) => m.VoxelHomePage),
  },
  {
    path: '/voxel/anleitung',
    file: 'voxel/anleitung',
    nav: 'Anleitung',
    title: 'Spielanleitung (3D Voxel) – Token Furnace',
    description:
      'Wie Token Furnace in der 3D-Voxel-Edition funktioniert: 3D-Campus, Vorortdorf, Serverkeller, Kamin, GPU-Express, alle 20 Micro-Voxel Engines, Upgrades und Erfolge erklärt.',
    load: () => import('./pages/AnleitungPage.jsx').then((m) => m.VoxelAnleitungPage),
  },
  {
    path: '/voxel/strategie',
    file: 'voxel/strategie',
    nav: 'Strategie',
    title: 'Strategie & Tipps (3D Voxel) – Token Furnace',
    description:
      'Strategien für Token Furnace Voxel 3D: Early, Mid und Late Game, Campus-Ausbau, Kamin-Kühlung, GPU-Laster und maximale Bewertung.',
    load: () => import('./pages/StrategiePage.jsx').then((m) => m.VoxelStrategiePage),
  },
  {
    path: '/voxel/glossar',
    file: 'voxel/glossar',
    nav: 'Glossar',
    title: 'Buzzword-Glossar (3D Voxel) – Token Furnace',
    description:
      'Alle Spielbegriffe und Branchen-Buzzwords aus Token Furnace Voxel 3D erklärt – von AGI über Burn Rate bis Unicorn.',
    load: () => import('./pages/GlossarPage.jsx').then((m) => m.VoxelGlossarPage),
  },
  {
    path: '/voxel/faq',
    file: 'voxel/faq',
    nav: 'FAQ',
    title: 'Häufige Fragen (FAQ) (3D Voxel) – Token Furnace',
    description:
      'Antworten auf die häufigsten Fragen zu Token Furnace Voxel 3D: Spielstand-Sync mit der 2D-Version, WebGL-Anforderungen, Steuerung und Features.',
    load: () => import('./pages/FaqPage.jsx').then((m) => m.VoxelFaqPage),
  },
  {
    path: '/voxel/ios-app',
    file: 'voxel/ios-app',
    nav: 'iOS-App',
    title: 'Tokenkamin: AI Clicker – die iOS-App – Token Furnace Voxel 3D',
    description:
      'Token Furnace als native iOS-App „Tokenkamin: AI Clicker“: Funktionen, Unterschiede zur Web-Version und Werbefrei-Option.',
    load: () => import('./pages/IosAppPage.jsx').then((m) => m.VoxelIosAppPage),
  },
  {
    path: '/voxel/ueber',
    file: 'voxel/ueber',
    nav: 'Über uns',
    title: 'Über uns & Kontakt (3D Voxel) – Token Furnace',
    description:
      'Wer hinter Token Furnace und der Voxel 3D Edition steckt, warum es das Spiel gibt und wie du uns erreichst.',
    load: () => import('./pages/UeberPage.jsx').then((m) => m.VoxelUeberPage),
  },
  {
    path: '/voxel/impressum',
    file: 'voxel/impressum',
    title: 'Impressum (3D Voxel) – Token Furnace',
    description: 'Impressum und Anbieterkennzeichnung von token-furnace.com (Voxel Edition).',
    load: () => import('./pages/ImpressumPage.jsx').then((m) => m.VoxelImpressumPage),
  },
  {
    path: '/voxel/datenschutz',
    file: 'voxel/datenschutz',
    title: 'Datenschutzerklärung (3D Voxel) – Token Furnace',
    description: 'Datenschutzerklärung für token-furnace.com und Token Furnace Voxel 3D.',
    load: () => import('./pages/DatenschutzPage.jsx').then((m) => m.VoxelDatenschutzPage),
  },
];

export function findSiteRoute(pathname) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return SITE_ROUTES.find((route) => route.path === normalized) || null;
}
