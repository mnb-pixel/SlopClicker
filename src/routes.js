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
//
// Alle Tab-Pfade liegen unter /play (siehe main.jsx, LandingPage.jsx): "/" ist jetzt eine
// eigenständige, content-starke Landingpage (kein Spiel-Zustand, kein Tab), das eigentliche
// Spiel zieht komplett auf /play um und wird von der Landingpage per <iframe> eingebettet.
// Grund: der AdSense-Review bemängelte "low value content" weiterhin, obwohl "/" schon
// echten Text zeigte - ein Reviewer sieht auf "/" aber zuerst das Spiel selbst, nicht die
// Fließtext-Inhalte darunter. Mit dieser Trennung ist "/" eine normale, textlastige Seite
// (Anleitung, FAQ, Investoren-Prospekt) mit dem Spiel als EINEM Element darauf, nicht als
// einzigem Inhalt - ein bei HTML5-Game-Portalen übliches und AdSense-konformes Muster.
// Alte Bookmarks/Backlinks auf die bisherigen bloßen Pfade (/shop etc.) werden per
// public/_redirects auf die neuen /play-Pfade umgeleitet; landen sie trotzdem im SPA (z.B.
// weil _redirects nicht greift), fallen sie wie /special auf den Catch-all (Tab 1) zurück.
export const TAB_ROUTES = {
  1: '/play',
  2: '/play/shop',
  3: '/play/statistik',
  4: '/play/einstellungen',
};

export const ROUTE_TABS = Object.fromEntries(
  Object.entries(TAB_ROUTES).map(([tab, path]) => [path, Number(tab)])
);

// Impressum ist kein Tab, sondern ein Overlay (LegalModal, siehe App.jsx legalPage-State) -
// braucht aber trotzdem eine echte, direkt aufrufbare URL für externe Links. /datenschutz
// ist NICHT hier drin: das ist eine komplett eigenständige Seite (main.jsx/
// DatenschutzPage.jsx, siehe App Store Connect "Privacy Policy URL"), kein App-internes
// Overlay - LegalFooter.jsx verlinkt dorthin per echtem <a href>, nicht per Client-Routing.
export const LEGAL_ROUTES = {
  impressum: '/impressum',
};

export const ROUTE_LEGAL_PAGES = Object.fromEntries(
  Object.entries(LEGAL_ROUTES).map(([page, path]) => [path, page])
);
