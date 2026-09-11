import React from 'react';
import { createPortal } from 'react-dom';
import { Rocket, Tv, Gift, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useSkin } from '../skin';

// Willkommen-zurück-Screen: zeigt den passiv erwirtschafteten Offline-Ertrag seit dem
// letzten Speichern (gedeckelt, siehe useGameStore). Dieses Modal erscheint NUR noch für
// die >= 30min-Abwesenheit (siehe useGameStore-Mount-Effect) - kürzere Abwesenheiten
// werden automatisch und ohne Rückfrage gutgeschrieben, kein Modal nötig. Ab der Schwelle
// gilt dieselbe alles-oder-nichts-Regel wie beim AfkReportModal: Ad ansehen zum Einsammeln,
// sonst verfällt der Betrag ersatzlos - kein "Nur einsammeln"-Ausweg mehr.
// Mit adFree entfällt der Verzichten-Pfad: es gibt keinen Grund, einen kostenlosen Bonus
// abzulehnen, den man ohnehin nur mit einem Tap statt einem Video bekommt (siehe
// docs/ios-app-konzept.md §4.2).
export function OfflineEarningsModal({ offlineReport, adState, requestBonus, claimOfflineEarnings, dismissOfflineEarnings, adFree = false, t }) {
  // Zwei Looks, ein Markup - siehe src/components/skin.jsx. Im Spiel-Skin ist das
  // Fenster ein Papieraushang im Grafik-Stil der Insel statt einer dunklen Konsole.
  const { cx } = useSkin();

  if (!offlineReport) return null;

  const tr = t || ((k) => k);
  const isAdPlaying = !!adState && adState.type === 'offline_claim';
  const hours = Math.floor(offlineReport.elapsedSec / 3600);
  const minutes = Math.floor((offlineReport.elapsedSec % 3600) / 60);
  const timeAwayText = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

  return createPortal(
    <div className={cx(
      'fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn',
      'gs-modal-backdrop gs-skin z-[60] animate-fadeIn'
    )}>
      <div className={cx(
        'relative max-w-sm w-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/60 rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center gap-3',
        'gs-modal gs-acc-teal max-w-sm p-5 items-center text-center gap-3'
      )}>
        <div className={cx(
          'p-3 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-lg',
          'gs-medal gs-medal--lg gs-acc-teal'
        )}>
          <Rocket className="w-8 h-8" />
        </div>

        <div>
          <h2 className={cx('text-base font-black uppercase tracking-wide text-slate-100', 'gs-title text-sm')}>
            {tr('welcomeBackTitle')}
          </h2>
          <p className={cx('text-xs text-slate-400 mt-1', 'gs-sub mt-1')}>
            {tr('offlineInfraRan').replace('{time}', timeAwayText)}
          </p>
        </div>

        <div className={cx(
          'w-full bg-slate-950 border border-cyan-500/30 rounded-xl p-3',
          'gs-panel gs-panel--sunk gs-acc-grass w-full'
        )}>
          <div className={cx("text-[10px] uppercase font-mono font-bold text-slate-400", 'gs-stat__label')}>{tr('offlineEarningsLabel')}</div>
          <div className={cx('text-2xl font-black text-emerald-400 font-mono', 'gs-stat__value text-2xl')}>
            +{formatCurrency(offlineReport.amount)}
          </div>
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
              onClick={() => (adFree ? claimOfflineEarnings() : requestBonus('offline_claim', claimOfflineEarnings))}
              className={cx(
                'w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 to-fuchsia-500 text-slate-950 hover:brightness-110 active:scale-95 shadow-xl transition-all flex items-center justify-center gap-2',
                'gs-btn gs-btn--gold gs-btn--block'
              )}
            >
              {adFree ? <Gift className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
              {tr(adFree ? 'claimBonusCollect' : 'watchAdCollect').replace('{amount}', formatCurrency(offlineReport.amount))}
            </button>
            {!adFree && (
              <button
                onClick={dismissOfflineEarnings}
                className={cx(
                  'w-full py-2 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1.5',
                  'gs-btn gs-btn--block'
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {tr('afkForfeitBtn')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
