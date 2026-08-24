// Einzige Quelle für die Zuordnung Tab-ID <-> URL-Pfad, von App.jsx (Location -> activeTab)
// UND NavBar.jsx (Link-Ziele) importiert, damit beide niemals auseinanderlaufen können.
// Nur für den reinen Web-Build relevant (siehe isCrazyGamesBuild()/isNativePlatform in
// App.jsx) - echte URLs pro Tab sind der Punkt: token-furnace.com bestand bislang aus
// genau einer crawlbaren Seite ("/"), was Google wiederholt als "low value content"
// abgelehnt hat. Mit eigenen Pfaden pro Tab bekommt jeder Bereich (Shop, Stats,
// Einstellungen) eine eigene, über echte <a href> verlinkte, indexierbare URL statt nur
// internem React-State. CrazyGames (relative Basis, fremd gehosteter Unterpfad) und die
// iOS-App (kein Interesse an URLs, kein Crawler) behalten bewusst das alte reine
// State-Verhalten - siehe NavBar.jsx/App.jsx useRoutes-Flag.
// /special wurde entfernt (Special-Tab komplett aus der UI gestrichen, siehe App.jsx/
// NavBar.jsx/DesktopView.jsx) - eventuell noch existierende Backlinks auf /special landen
// über den Catch-all in main.jsx/App.jsx (nicht gematchte Pfade -> Tab 1) auf der Startseite.
export const TAB_ROUTES = {
  1: '/',
  2: '/shop',
  3: '/statistik',
  4: '/einstellungen',
};

export const ROUTE_TABS = Object.fromEntries(
  Object.entries(TAB_ROUTES).map(([tab, path]) => [path, Number(tab)])
);
