import React from 'react';
import { createPortal } from 'react-dom';
import { Tv, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

// Punkt 9: Popups zu festen Zeitpunkten seit App-Start (5min, 15min, 30min, ...), die eine
// Rewarded Ad anbieten. "Später" schaltet statt einer harten Zeitgrenze einen Button im
// Menü frei, der jederzeit nachträglich eingelöst werden kann.
export function ScheduledAdModal({ pendingScheduledAd, adState, watchScheduledAdNow, deferScheduledAd, scheduledAdPreview = 0, t }) {
  if (!pendingScheduledAd) return null;

  const tr = t || ((k) => k);
  const isAdPlaying = !!adState && adState.type === 'scheduled_bonus';

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative max-w-sm w-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/60 rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center gap-3">
        <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-lg">
          <Tv className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-base font-black uppercase tracking-wide text-slate-100">
            {tr('bonusAdAvailable')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {tr('scheduledAdDesc').replace('{amount}', formatCurrency(scheduledAdPreview))}
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
              onClick={watchScheduledAdNow}
              className="w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 to-fuchsia-500 text-slate-950 hover:brightness-110 active:scale-95 shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Tv className="w-4 h-4" />
              {tr('watchNowLabel')}
            </button>
            <button
              onClick={deferScheduledAd}
              className="w-full py-2 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              {tr('laterMenuLabel')}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
