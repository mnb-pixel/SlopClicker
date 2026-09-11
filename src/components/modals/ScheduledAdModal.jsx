import React from 'react';
import { createPortal } from 'react-dom';
import { Tv, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useSkin } from '../skin';

// Punkt 9: Popups zu festen Zeitpunkten seit App-Start (5min, 15min, 30min, ...), die eine
// Rewarded Ad anbieten. "Später" schaltet statt einer harten Zeitgrenze einen Button im
// Menü frei, der jederzeit nachträglich eingelöst werden kann.
export function ScheduledAdModal({ pendingScheduledAd, adState, watchScheduledAdNow, deferScheduledAd, scheduledAdPreview = 0, t }) {
  // Zwei Looks, ein Markup - siehe src/components/skin.jsx.
  const { cx } = useSkin();

  if (!pendingScheduledAd) return null;

  const tr = t || ((k) => k);
  const isAdPlaying = !!adState && adState.type === 'scheduled_bonus';

  return createPortal(
    <div className={cx(
      'fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn',
      'gs-modal-backdrop gs-skin z-[60] animate-fadeIn'
    )}>
      <div className={cx(
        'relative max-w-sm w-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/60 rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center gap-3',
        'gs-modal gs-acc-gold max-w-sm p-5 items-center text-center gap-3'
      )}>
        <div className={cx(
          'p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-lg',
          'gs-medal gs-medal--lg gs-acc-gold'
        )}>
          <Tv className="w-8 h-8" />
        </div>

        <div>
          <h2 className={cx('text-base font-black uppercase tracking-wide text-slate-100', 'gs-title text-sm')}>
            {tr('bonusAdAvailable')}
          </h2>
          <p className={cx('text-xs text-slate-400 mt-1', 'gs-sub mt-1')}>
            {tr('scheduledAdDesc').replace('{amount}', formatCurrency(scheduledAdPreview))}
          </p>
        </div>

        {isAdPlaying ? (
          <div className={cx(
            'w-full bg-slate-950 p-3 rounded-xl border border-amber-500 text-center animate-pulse',
            'gs-panel gs-panel--sunk gs-acc-gold w-full text-center animate-pulse'
          )}>
            <div className={cx('font-black text-xs text-amber-300', 'gs-title gs-ink-gold')}>
              {tr('adPlaying')} ({adState.timer}s)
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-2">
            <button
              onClick={watchScheduledAdNow}
              className={cx(
                'w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 to-fuchsia-500 text-slate-950 hover:brightness-110 active:scale-95 shadow-xl transition-all flex items-center justify-center gap-2',
                'gs-btn gs-btn--gold gs-btn--block'
              )}
            >
              <Tv className="w-4 h-4" />
              {tr('watchNowLabel')}
            </button>
            <button
              onClick={deferScheduledAd}
              className={cx(
                'w-full py-2 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1.5',
                'gs-btn gs-btn--block'
              )}
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
