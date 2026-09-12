import React, { useEffect } from 'react';
import { Menu, Play, ShieldCheck, ArrowLeft, Box } from 'lucide-react';
import { SITE_ROUTES } from './siteRoutes.js';
import { VOXEL_PLAY_URL } from './ui.jsx';
import { initKlaro, showKlaroManager } from '../monetization/klaroLoader';

// Isometrisches Voxel-Logo
function VoxelHeaderLogo() {
  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-sky-600 to-fuchsia-600 p-[1.5px] shadow-[0_0_12px_rgba(6,182,212,0.5)]">
        <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
          <Box className="w-4 h-4 text-cyan-300 animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="font-mono font-black text-sm tracking-wide text-slate-100 leading-none">
          TOKEN FURNACE
        </span>
        <span className="font-mono text-[9px] font-bold text-cyan-400 tracking-widest uppercase">
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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans antialiased relative selection:bg-cyan-500 selection:text-black">
      {/* Voxel Cyberpunk Grid Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(14, 165, 233, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(14, 165, 233, 0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <header className="border-b border-cyan-500/30 bg-slate-950/90 backdrop-blur sticky top-0 z-40 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3 relative z-10">
          <a href="/voxel" className="flex items-center gap-2">
            <VoxelHeaderLogo />
          </a>

          <nav aria-label="Voxel Navigation" className="hidden lg:flex items-center gap-1">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
              title="Zurück zur Standard-Homepage"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Classic 2D
            </a>
            {navItems.map((route) => (
              <a
                key={route.path}
                href={route.path}
                className="px-3 py-1.5 text-xs font-mono font-semibold text-slate-300 hover:text-cyan-300 rounded-lg hover:bg-slate-900 transition-colors"
              >
                {route.nav}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <a
              href={VOXEL_PLAY_URL}
              className="voxel-btn px-4 py-1.5 text-xs sm:text-sm font-mono tracking-wider text-cyan-200"
              title="3D Voxel Spiel starten"
            >
              <Play className="w-3.5 h-3.5 fill-cyan-300 text-cyan-300" />
              <span>Voxel Spielen</span>
              <span className="voxel-led-dot" />
            </a>

            <details className="lg:hidden relative">
              <summary
                aria-label="Menü öffnen"
                className="list-none [&::-webkit-details-marker]:hidden cursor-pointer p-2 rounded-lg border border-cyan-500/40 text-slate-200 hover:border-cyan-400"
              >
                <Menu className="w-5 h-5" />
              </summary>
              <nav
                aria-label="Hauptnavigation (mobil)"
                className="absolute right-0 mt-2 w-56 flex flex-col gap-1 bg-slate-900 border border-cyan-500/40 rounded-xl p-2.5 shadow-2xl z-50 font-mono text-xs"
              >
                <a
                  href="/"
                  className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-slate-800 border-b border-slate-800"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Zurück zu Classic 2D
                </a>
                {navItems.map((route) => (
                  <a
                    key={route.path}
                    href={route.path}
                    className="block px-3 py-2 text-slate-300 hover:text-cyan-300 rounded-lg hover:bg-slate-800"
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

      <footer className="border-t border-cyan-500/20 bg-slate-950/80 mt-12 relative z-10">
        <div className="max-w-5xl mx-auto px-4 py-8 text-[11px] text-slate-500 flex flex-col gap-3 text-center font-mono">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a href="/" className="text-cyan-400 hover:underline">
              Classic Version (2D)
            </a>
            <span className="text-slate-700">•</span>
            <a href="/impressum" className="text-slate-400 hover:text-cyan-400 underline">
              Impressum
            </a>
            <span className="text-slate-700">•</span>
            <a href="/datenschutz" className="text-slate-400 hover:text-cyan-400 underline">
              Datenschutz
            </a>
            <span className="text-slate-700">•</span>
            <a href="/ueber#kontakt" className="text-slate-400 hover:text-cyan-400 underline">
              Kontakt
            </a>
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={() => showKlaroManager()}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-cyan-400 underline"
            >
              <ShieldCheck className="w-3 h-3" /> Cookie-Einstellungen
            </button>
          </div>
          <p className="text-slate-600 text-[10px] mt-1">
            Token Furnace Voxel Edition – Handgefertigte 3D Micro-Voxel-Grafik mit Three.js.
          </p>
        </div>
      </footer>
    </div>
  );
}
