// Einzige Quelle für die Zuordnung Tab-ID <-> URL-Pfad, von App.jsx (Location -> activeTab)
// UND NavBar.jsx (Link-Ziele) importiert, damit beide niemals auseinanderlaufen können.
// Nur für den reinen Web-Build relevant (siehe isCrazyGamesBuild()/isNativePlatform in
// App.jsx) - echte URLs pro Tab sind der Punkt: token-furnace.com bestand bislang aus
// genau einer crawlbaren Seite ("/"), was Google wiederholt als "low value content"
// abgelehnt hat. Mit eigenen Pfaden pro Tab bekommt jeder Bereich (Shop, Special, Stats,
// Einstellungen) eine eigene, über echte <a href> verlinkte, indexierbare URL statt nur
// internem React-State. CrazyGames (relative Basis, fremd gehosteter Unterpfad) und die
// iOS-App (kein Interesse an URLs, kein Crawler) behalten bewusst das alte reine
// State-Verhalten - siehe NavBar.jsx/App.jsx useRoutes-Flag.
export const TAB_ROUTES = {
  1: '/',
  2: '/shop',
  3: '/special',
  4: '/statistik',
  5: '/einstellungen',
};

export const ROUTE_TABS = Object.fromEntries(
  Object.entries(TAB_ROUTES).map(([tab, path]) => [path, Number(tab)])
);

// Eigene, volle Seiten statt Tabs (siehe main.jsx: LegalStandalonePage wird dafür ANSTELLE
// von App gemountet). Pfad -> 'impressum' | 'datenschutz', analog zum page-Prop von
// LegalModal.jsx/LegalContent.jsx.
export const LEGAL_ROUTES = {
  '/impressum': 'impressum',
  '/datenschutz': 'datenschutz',
};
