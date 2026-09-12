import React, { useEffect } from 'react';
import { Menu, Play, ShieldCheck, ArrowLeft, Box } from 'lucide-react';
import { SITE_ROUTES } from './siteRoutes.js';
import { VOXEL_PLAY_URL } from './ui.jsx';
import { initKlaro, showKlaroManager } from '../monetization/klaroLoader';

// Isometrisches Voxel-Logo im Farb-Stil der 3D-Insel (Gras, Ziegel, Fluss)
function VoxelHeaderLogo() {
  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <div className="w-8 h-8 rounded-lg bg-[#fffdf6] border-2 border-[#c8bb9f] shadow-[0_2px_0_#c8bb9f] flex items-center justify-center p-1">
        <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
          <polygon points="16,3 29,10 16,17 3,10" fill="#48bb78" stroke="#2f855a" strokeWidth="1.5" strokeLinejoin="round" />
          <polygon points="3,10 16,17 16,29 3,22" fill="#c05621" stroke="#8a4a2a" strokeWidth="1.5" strokeLinejoin="round" />
          <polygon points="16,17 29,10 29,22 16,29" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="font-mono font-black text-sm tracking-wide text-[#22313f] leading-none">
          TOKEN FURNACE
        </span>
        <span className="font-mono text-[9px] font-black text-[#2f855a] tracking-widest uppercase">
          VOXEL 3D EDITION
        </span>
      </div>
    </div>
  );
}

export function VoxelSiteLayout({ children }) {
  useEffect(() => {
    initKlaro();
  }, []);

  const navItems = SITE_ROUTES.filter((route) => route.nav && route.path !== '/voxel');

  return (
    <div
      className="min-h-screen flex flex-col text-[#22313f] font-sans antialiased relative selection:bg-[#48bb78] selection:text-white"
      style={{
        background: 'linear-gradient(180deg, #8fd3ff 0%, #bde7ff 30%, #e1f4ff 65%, #f4fbf8 100%)',
      }}
    >
      {/* Voxel Sky Grid Overlay (subtile 3D-Kachel-Struktur) */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30 z-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(56, 189, 248, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.25) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Kopfzeile im Papier-Stil der 3D-Insel (--game-paper & --game-line-strong) */}
      <header className="border-b-2 border-[#c8bb9f] bg-[#fffdf6]/95 backdrop-blur sticky top-0 z-40 shadow-[0_3px_0_#c8bb9f,0_6px_20px_rgba(28,42,56,0.06)]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3 relative z-10">
          <a href="/voxel" className="flex items-center gap-2">
            <VoxelHeaderLogo />
          </a>

          <nav aria-label="Voxel Navigation" className="hidden lg:flex items-center gap-1.5">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-[#22313f] bg-[#f3ece0] hover:bg-[#fffdf6] rounded-xl border-2 border-[#c8bb9f] shadow-[0_2px_0_#c8bb9f] active:translate-y-0.5 active:shadow-none transition-all"
              title="Zurück zur 2D-Startseite"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#6d7f8e]" /> Classic 2D
            </a>
            {navItems.map((route) => (
              <a
                key={route.path}
                href={route.path}
                className="px-3 py-1.5 text-xs font-mono font-bold text-[#22313f] hover:text-[#2f855a] hover:bg-[#f3ece0]/70 rounded-xl transition-colors"
              >
                {route.nav}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <a
              href={VOXEL_PLAY_URL}
              className="voxel-btn px-4 py-2 text-xs sm:text-sm"
              title="3D Voxel Spiel starten"
            >
              <Play className="w-3.5 h-3.5 fill-white text-white" />
              <span>Voxel Spielen</span>
              <span className="voxel-led-dot" />
            </a>

            <details className="lg:hidden relative">
              <summary
                aria-label="Menü öffnen"
                className="list-none [&::-webkit-details-marker]:hidden cursor-pointer p-2 rounded-xl border-2 border-[#c8bb9f] bg-[#fffdf6] text-[#22313f] shadow-[0_2px_0_#c8bb9f]"
              >
                <Menu className="w-5 h-5" />
              </summary>
              <nav
                aria-label="Hauptnavigation (mobil)"
                className="absolute right-0 mt-2 w-56 flex flex-col gap-1 bg-[#fffdf6] border-2 border-[#c8bb9f] rounded-2xl p-2.5 shadow-[0_4px_0_#c8bb9f,0_12px_28px_rgba(28,42,56,0.15)] z-50 font-mono text-xs"
              >
                <a
                  href="/"
                  className="flex items-center gap-2 px-3 py-2 text-[#22313f] bg-[#f3ece0] rounded-xl border border-[#c8bb9f] font-bold"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#6d7f8e]" /> Zurück zu Classic 2D
                </a>
                {navItems.map((route) => (
                  <a
                    key={route.path}
                    href={route.path}
                    className="block px-3 py-2 text-[#22313f] hover:text-[#2f855a] hover:bg-[#f3ece0] rounded-xl font-bold transition-colors"
                  >
                    {route.nav}
                  </a>
                ))}
              </nav>
            </details>
          </div>
        </div>
      </header>

      <main id="inhalt" className="flex-1 w-full mx-auto px-4 py-8 sm:py-12 max-w-5xl relative z-10">
        {children}
      </main>

      <footer className="border-t-2 border-[#ded3bd] bg-[#fffdf6]/90 mt-12 relative z-10 shadow-[0_-4px_16px_rgba(28,42,56,0.03)]">
        <div className="max-w-5xl mx-auto px-4 py-8 text-[11px] text-[#6d7f8e] flex flex-col gap-3 text-center font-mono">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a href="/" className="text-[#0e7490] hover:underline font-bold">
              Classic Version (2D)
            </a>
            <span className="text-[#ded3bd]">•</span>
            <a href="/impressum" className="text-[#22313f] hover:text-[#2f855a] underline">
              Impressum
            </a>
            <span className="text-[#ded3bd]">•</span>
            <a href="/datenschutz" className="text-[#22313f] hover:text-[#2f855a] underline">
              Datenschutz
            </a>
            <span className="text-[#ded3bd]">•</span>
            <a href="/ueber#kontakt" className="text-[#22313f] hover:text-[#2f855a] underline">
              Kontakt
            </a>
            <span className="text-[#ded3bd]">•</span>
            <button
              type="button"
              onClick={() => showKlaroManager()}
              className="inline-flex items-center gap-1 text-[#22313f] hover:text-[#2f855a] underline"
            >
              <ShieldCheck className="w-3 h-3 text-[#2f855a]" /> Cookie-Einstellungen
            </button>
          </div>
          <p className="text-[#8c9ba8] text-[10px] mt-1">
            Token Furnace Voxel Edition – Handgefertigte 3D Micro-Voxel-Grafik mit Three.js.
          </p>
        </div>
      </footer>
    </div>
  );
}
