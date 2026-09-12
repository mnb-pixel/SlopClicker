import { useEffect } from 'react';
import { Menu, Play, ShieldCheck } from 'lucide-react';
import { SITE_ROUTES } from './siteRoutes.js';
import { APP_STORE_URL, PLAY_URL } from './ui.jsx';
import { VoxelButton } from './components/VoxelButton.jsx';
import { initKlaro, showKlaroManager } from '../monetization/klaroLoader';

// Gemeinsamer Rahmen aller Content-Seiten (siehe siteRoutes.js): Kopfzeile mit Navigation
// und "Spielen"-CTA, Fußzeile mit Pflichtlinks. Das Spiel selbst (/play/*) nutzt diesen
// Rahmen NICHT - es hat seinen eigenen Header/NavBar/LegalFooter.
// Mobil-Menü als <details>: funktioniert auch im vorgerenderten HTML ohne JavaScript.
export function SiteLayout({ path, wide = false, children }) {
  useEffect(() => {
    initKlaro();
  }, []);

  const navItems = SITE_ROUTES.filter((route) => route.nav);

  const navLink = (route, extra = '') => {
    const active = route.path === path;
    return (
      <a
        key={route.path}
        href={route.path}
        aria-current={active ? 'page' : undefined}
        className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
          active ? 'text-cyan-300 bg-cyan-500/10' : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60'
        } ${extra}`}
      >
        {route.nav}
      </a>
    );
  };

  const voxelPath = path === '/' ? '/voxel' : `/voxel${path}`;

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#inhalt"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-cyan-500 focus:text-black focus:px-3 focus:py-1.5 focus:rounded-lg"
      >
        Zum Inhalt springen
      </a>

      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-2 font-black tracking-tight text-slate-100 shrink-0">
            <img src="/icon/app-icon.webp" alt="" width={28} height={28} className="w-7 h-7 rounded-lg" />
            Token Furnace
          </a>

          <nav aria-label="Hauptnavigation" className="hidden lg:flex items-center gap-0.5">
            {navItems.map((route) => navLink(route))}
          </nav>

          <div className="flex items-center gap-2">
            <VoxelButton variant="compact" href={voxelPath} className="hidden sm:inline-flex" />
            <a href={PLAY_URL} className="inline-flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm px-4 py-2 rounded-xl transition-colors">
              <Play className="w-4 h-4" /> Spielen
            </a>
            <details className="lg:hidden relative">
              <summary
                aria-label="Menü öffnen"
                className="list-none [&::-webkit-details-marker]:hidden cursor-pointer p-2 rounded-lg border border-slate-700 text-slate-200 hover:border-cyan-400"
              >
                <Menu className="w-5 h-5" />
              </summary>
              <nav
                aria-label="Hauptnavigation (mobil)"
                className="absolute right-0 mt-2 w-56 flex flex-col gap-0.5 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl"
              >
                <div className="sm:hidden mb-2 px-1">
                  <VoxelButton variant="compact" href={voxelPath} className="w-full justify-start py-2" />
                </div>
                {navItems.map((route) => navLink(route, 'block'))}
              </nav>
            </details>
          </div>
        </div>
      </header>

      <main id="inhalt" className={`flex-1 w-full mx-auto px-4 py-8 sm:py-12 ${wide ? 'max-w-5xl' : 'max-w-3xl'}`}>
        {children}
      </main>

      <footer className="border-t border-slate-800/80 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-8 text-[11px] text-slate-500 flex flex-col gap-3 text-center">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="/impressum" className="text-slate-400 hover:text-cyan-400 underline underline-offset-2 font-semibold transition-colors">
              Impressum
            </a>
            <span className="text-slate-700">•</span>
            <a href="/datenschutz" className="text-slate-400 hover:text-cyan-400 underline underline-offset-2 font-semibold transition-colors">
              Datenschutz
            </a>
            <span className="text-slate-700">•</span>
            <a href="/ueber#kontakt" className="text-slate-400 hover:text-cyan-400 underline underline-offset-2 font-semibold transition-colors">
              Kontakt
            </a>
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={() => showKlaroManager()}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-cyan-400 underline underline-offset-2 font-semibold transition-colors"
            >
              <ShieldCheck className="w-3 h-3" /> Werbe-Cookie-Einstellungen
            </button>
            <span className="text-slate-700">•</span>
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 underline underline-offset-2 font-semibold transition-colors"
            >
              Tokenkamin im App Store
            </a>
          </div>
          <p>Spielstand bleibt auf deinem Gerät • AI-Bubble-sicher</p>
          <p className="text-slate-600">
            Token Furnace ist Satire. Alle Firmen, Personen, Produkte und Meldungen im Spiel sind frei erfunden.
          </p>
        </div>
      </footer>
    </div>
  );
}
