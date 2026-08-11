import React from 'react';
import { createPortal } from 'react-dom';
import { Rocket, Tv, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

// Willkommen-zurück-Screen: zeigt den passiv erwirtschafteten Offline-Ertrag seit dem
// letzten Speichern (gedeckelt, siehe useGameStore) und bietet an, ihn per Rewarded Ad
// zu verdoppeln, bevor er gutgeschrieben wird.
export function OfflineEarningsModal({ offlineReport, adState, startAd, claimOfflineEarnings }) {
  if (!offlineReport) return null;

  const isAdPlaying = !!adState && adState.type === 'offline_double';
  const hours = Math.floor(offlineReport.elapsedSec / 3600);
  const minutes = Math.floor((offlineReport.elapsedSec % 3600) / 60);
  const timeAwayText = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative max-w-sm w-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/60 rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center gap-3">
        <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-lg">
          <Rocket className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-base font-black uppercase tracking-wide text-slate-100">
            Willkommen zurück!
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Deine Infrastruktur lief {timeAwayText} weiter, während du weg warst.
          </p>
        </div>

        <div className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl p-3">
          <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Offline-Ertrag</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            +{formatCurrency(offlineReport.amount)}
          </div>
        </div>

        {isAdPlaying ? (
          <div className="w-full bg-slate-950 p-3 rounded-xl border border-amber-500 text-center animate-pulse">
            <div className="font-black text-xs text-amber-300">
              Ad läuft... ({adState.timer}s)
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-2">
            <button
              onClick={() => startAd('offline_double', () => claimOfflineEarnings(true))}
              className="w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 to-fuchsia-500 text-slate-950 hover:brightness-110 active:scale-95 shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Tv className="w-4 h-4" />
              Video ansehen: {formatCurrency(offlineReport.amount * 2)} einsammeln
            </button>
            <button
              onClick={() => claimOfflineEarnings(false)}
              className="w-full py-2 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Nur einsammeln ({formatCurrency(offlineReport.amount)})
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
