import React from 'react';
import { createPortal } from 'react-dom';
import { Moon, Tv, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

// Punkt 1: Wenn der Tab >=30min im Hintergrund war (nicht komplett geschlossen, nur
// inaktiv), zeigt dieser Screen, wie viel in der Zeit (mit gedrosselter 10%-Rate) erzeugt
// wurde, und bietet an, den Betrag per Rewarded Ad zu verdoppeln.
export function AfkReportModal({ afkReport, adState, startAd, claimAfkBonus, dismissAfkReport, t }) {
  if (!afkReport) return null;

  const tr = t || ((k) => k);
  const isAdPlaying = !!adState && adState.type === 'afk_bonus';

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative max-w-sm w-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-fuchsia-500/60 rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center gap-3">
        <div className="p-3 rounded-2xl bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/50 shadow-lg">
          <Moon className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-base font-black uppercase tracking-wide text-slate-100">
            {tr('afkTitle')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {tr('afkDesc').replace('{amount}', formatCurrency(afkReport.amount))}
          </p>
        </div>

        {isAdPlaying ? (
          <div className="w-full bg-slate-950 p-3 rounded-xl border border-amber-500 text-center animate-pulse">
            <div className="font-black text-xs text-amber-300">
              {tr('adPlaying')} ({adState.timer}s)
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-2">
            <button
              onClick={() => startAd('afk_bonus', claimAfkBonus)}
              className="w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 to-fuchsia-500 text-slate-950 hover:brightness-110 active:scale-95 shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Tv className="w-4 h-4" />
              {tr('watchAdExtra').replace('{amount}', formatCurrency(afkReport.amount))}
            </button>
            <button
              onClick={dismissAfkReport}
              className="w-full py-2 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {tr('noticedBtn')}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
