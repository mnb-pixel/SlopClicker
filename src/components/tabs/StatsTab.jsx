import React, { useState, lazy, Suspense } from 'react';
import { Trophy, Sparkles, Layers } from 'lucide-react';
import { ACHIEVEMENTS_DATA } from '../../data/achievementsData';
import { BUZZWORDS_DATA } from '../../data/buzzwordsData';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { useSkin } from '../skin';

// Lazy statt statisch: reines Klick-zum-Öffnen-Modal (Badge-Übersicht), lädt seinen Code
// erst bei tatsächlichem Öffnen nach statt bei jedem Statistik-Tab-Aufruf.
const BadgesModal = lazy(() =>
  import('../modals/BadgesModal').then((m) => ({ default: m.BadgesModal }))
);

export function StatsTab({
  stats,
  valuation,
  totalValuation,
  vps,
  clickValue,
  slopCount,
  unlockedAchievements,
  logs,
  adFree = false,
  // Sammelkarten gehören zur Sammlung, gekauft werden sie aber im Shop (Booster-Kiosk).
  // Deshalb steht hier nur der Fortschritt plus ein Absprung dorthin; onOpenCards kommt
  // von der Shell bzw. der Tab-Ansicht und schaltet auf den Shop um. Fehlt er, bleibt
  // die Karten-Kachel eine reine Fortschrittsanzeige.
  boughtBuzzwords = [],
  onOpenCards,
  t,
}) {
  const [statsSection, setStatsSection] = useState('overview'); // 'overview' | 'log' | 'achievements'
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const tr = t || ((k) => k);
  const { cx } = useSkin();

  const unlockedCount = new Set(unlockedAchievements).size;
  const totalCount = ACHIEVEMENTS_DATA.length;
  const hypePct = Math.min(100, Math.floor((unlockedCount / totalCount) * 100));
  const cardCount = new Set(boughtBuzzwords).size;
  const cardTotal = BUZZWORDS_DATA.length;

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      {isBadgesModalOpen && (
        <Suspense fallback={null}>
          <BadgesModal
            isOpen={isBadgesModalOpen}
            unlockedAchievements={unlockedAchievements}
            onClose={() => setIsBadgesModalOpen(false)}
            adFree={adFree}
            t={t}
          />
        </Suspense>
      )}

      {/* Sub-tab switcher */}
      <div className={cx(
        'grid grid-cols-3 gap-1.5 mb-4 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-extrabold',
        'mb-4 gs-segment gs-segment--grid'
      )}>
        <button
          onClick={() => setStatsSection('overview')}
          className={cx(
            `py-1.5 rounded-lg transition-all ${
              statsSection === 'overview'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`,
            `gs-seg-btn gs-acc-teal ${statsSection === 'overview' ? 'is-active' : ''}`
          )}
        >
          {tr('kpiStatsTab')}
        </button>
        <button
          onClick={() => setStatsSection('log')}
          className={cx(
            `py-1.5 rounded-lg transition-all ${
              statsSection === 'log'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`,
            `gs-seg-btn gs-acc-teal ${statsSection === 'log' ? 'is-active' : ''}`
          )}
        >
          {tr('auditLogTab')}
        </button>
        <button
          onClick={() => setStatsSection('achievements')}
          className={cx(
            `py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              statsSection === 'achievements'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`,
            `gs-seg-btn gs-acc-gold ${statsSection === 'achievements' ? 'is-active' : ''}`
          )}
        >
          🏆 {tr('badgesTab')} ({unlockedCount})
        </button>
      </div>

      {/* OVERVIEW STATS */}
      {statsSection === 'overview' && (
        <div className="flex flex-col gap-3">
          {/* Hype Index Banner */}
          <div className={cx(
            'bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between',
            'gs-panel gs-acc-teal flex items-center justify-between gap-2'
          )}>
            <div className="min-w-0">
              <div className={cx('text-xs font-extrabold text-cyan-300 uppercase tracking-wider', 'gs-title')}>
                {tr('hypeIndexLabel')} ({hypePct}%)
              </div>
              <div className={cx('text-[11px] text-slate-400', 'gs-sub')}>
                {tr('hypeIndexDesc')}
              </div>
            </div>
            <div className={cx(
              'w-12 h-12 bg-slate-950 rounded-full border-2 border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black text-sm',
              'gs-dial gs-acc-teal'
            )}>
              {hypePct}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className={cx(
              'bg-slate-900/90 p-3 rounded-xl border border-slate-800',
              'gs-panel gs-panel--sunk gs-stat gs-acc-grass'
            )}>
              <div className={cx('text-slate-400 text-[10px]', 'gs-stat__label')}>{tr('statValuation')}</div>
              <div className={cx('text-emerald-400 font-extrabold text-sm', 'gs-stat__value')}>{formatCurrency(valuation)}</div>
            </div>
            <div className={cx(
              'bg-slate-900/90 p-3 rounded-xl border border-slate-800',
              'gs-panel gs-panel--sunk gs-stat gs-acc-teal'
            )}>
              <div className={cx('text-slate-400 text-[10px]', 'gs-stat__label')}>{tr('statTotalValuation')}</div>
              <div className={cx('text-cyan-400 font-extrabold text-sm', 'gs-stat__value')}>{formatCurrency(totalValuation)}</div>
            </div>
            <div className={cx(
              'bg-slate-900/90 p-3 rounded-xl border border-slate-800',
              'gs-panel gs-panel--sunk gs-stat gs-acc-gold'
            )}>
              <div className={cx('text-slate-400 text-[10px]', 'gs-stat__label')}>{tr('statVpsLabel')}</div>
              <div className={cx('text-amber-400 font-extrabold text-sm', 'gs-stat__value')}>+{formatCurrency(vps)}</div>
            </div>
            <div className={cx(
              'bg-slate-900/90 p-3 rounded-xl border border-slate-800',
              'gs-panel gs-panel--sunk gs-stat gs-acc-plum'
            )}>
              <div className={cx('text-slate-400 text-[10px]', 'gs-stat__label')}>{tr('statPerTapLabel')}</div>
              <div className={cx('text-fuchsia-400 font-extrabold text-sm', 'gs-stat__value')}>+{formatCurrency(clickValue)}</div>
            </div>
            <div className={cx(
              'bg-slate-900/90 p-3 rounded-xl border border-slate-800',
              'gs-panel gs-panel--sunk gs-stat '
            )}>
              <div className={cx('text-slate-400 text-[10px]', 'gs-stat__label')}>{tr('statTotalClicks')}</div>
              <div className={cx('text-slate-200 font-extrabold text-sm', 'gs-stat__value')}>{formatNumber(stats.totalClicks)}</div>
            </div>
            <div className={cx(
              'bg-slate-900/90 p-3 rounded-xl border border-slate-800',
              'gs-panel gs-panel--sunk gs-stat '
            )}>
              <div className={cx('text-slate-400 text-[10px]', 'gs-stat__label')}>{tr('statSlopCountLabel')}</div>
              <div className={cx('text-slate-200 font-extrabold text-sm', 'gs-stat__value')}>{formatNumber(slopCount)}</div>
            </div>
            <div className={cx(
              'bg-slate-900/90 p-3 rounded-xl border border-slate-800',
              'gs-panel gs-panel--sunk gs-stat gs-acc-rust'
            )}>
              <div className={cx('text-slate-400 text-[10px]', 'gs-stat__label')}>{tr('statOverheats')}</div>
              <div className={cx('text-rose-400 font-extrabold text-sm', 'gs-stat__value')}>{stats.overheatCount} {tr('timesLabel')}</div>
            </div>
            <div className={cx(
              'bg-slate-900/90 p-3 rounded-xl border border-slate-800',
              'gs-panel gs-panel--sunk gs-stat gs-acc-gold'
            )}>
              <div className={cx('text-slate-400 text-[10px]', 'gs-stat__label')}>{tr('statGoldenMemesLabel')}</div>
              <div className={cx('text-amber-400 font-extrabold text-sm', 'gs-stat__value')}>{stats.goldenCaught}</div>
            </div>
          </div>
        </div>
      )}

      {/* CHRONOLOGICAL LOG STREAM */}
      {statsSection === 'log' && (
        <div className={cx(
          'bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs max-h-[450px] overflow-y-auto flex flex-col gap-2',
          'gs-panel gs-panel--sunk font-mono text-xs max-h-[450px] overflow-y-auto flex flex-col gap-2'
        )}>
          {logs.map((l) => (
            <div
              key={l.id}
              className={cx(
                `p-2 rounded border text-[11px] ${
                  l.type === 'achievement'
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                    : l.type === 'warning'
                    ? 'bg-amber-950/20 border-amber-500/20 text-amber-200'
                    : l.type === 'danger'
                    ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                    : l.type === 'success'
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`,
                `gs-log ${
                  l.type === 'achievement' || l.type === 'warning'
                    ? 'gs-acc-gold'
                    : l.type === 'danger'
                    ? 'gs-acc-rust'
                    : l.type === 'success'
                    ? 'gs-acc-grass'
                    : ''
                }`
              )}
            >
              <span className="text-[10px] opacity-60 mr-2">[{l.timestamp}]</span>
              {l.text}
            </div>
          ))}
        </div>
      )}

      {/* SAMMLUNG: Badges UND Sammelkarten. Beides ist dasselbe Spielgefühl ("was habe
          ich schon?") und stand bisher an zwei völlig verschiedenen Enden der App - die
          Badges hier, die Karten allein im Shop. Die Karten-Kachel zeigt den Stand und
          springt in den Booster-Kiosk, gekauft wird weiterhin dort (onOpenCards). */}
      {statsSection === 'achievements' && (
        <div className="flex flex-col gap-3">
          <div className={cx(
            'bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center gap-3',
            'gs-panel gs-acc-gold flex flex-col items-center text-center gap-3'
          )}>
            <div className={cx(
              'p-3.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/60 shadow-xl',
              'gs-iconbox gs-iconbox--lg gs-acc-gold'
            )}>
              <Trophy className={cx('w-8 h-8 text-amber-400 animate-pulse', 'w-6 h-6')} />
            </div>
            <div>
              <h3 className={cx('font-black text-sm uppercase tracking-wider text-slate-100', 'gs-title')}>
                🏆 {tr('badgesWallTitle')}
              </h3>
              <p className={cx('text-xs text-slate-300 mt-1', 'gs-sub mt-1')}>
                {tr('badgesUnlockedLabel')}{' '}
                <span className={cx('text-amber-400 font-mono font-black', 'gs-mono font-black')}>
                  {unlockedCount} / {totalCount}
                </span>
              </p>
            </div>

            <div className={cx('hidden', 'gs-meter gs-acc-gold w-full')}>
              <div className="gs-meter__fill" style={{ width: `${hypePct}%` }} />
            </div>

            <button
              onClick={() => setIsBadgesModalOpen(true)}
              className={cx(
                'w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 hover:brightness-110 active:scale-95 shadow-xl transition-all flex items-center justify-center gap-2',
                'gs-btn gs-btn--gold gs-btn--block py-3'
              )}
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>✨ {tr('openBadgesPopup')} ({unlockedCount}/{totalCount})</span>
            </button>
          </div>

          <div className={cx(
            'bg-gradient-to-br from-purple-950/60 via-slate-900 to-slate-950 border-2 border-fuchsia-500/50 rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center gap-3',
            'gs-panel gs-acc-plum flex flex-col items-center text-center gap-3'
          )}>
            <div className={cx(
              'p-3.5 rounded-2xl bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/60 shadow-xl',
              'gs-iconbox gs-iconbox--lg gs-acc-plum'
            )}>
              <Layers className={cx('w-8 h-8 text-fuchsia-400', 'w-6 h-6')} />
            </div>
            <div>
              <h3 className={cx('font-black text-sm uppercase tracking-wider text-slate-100', 'gs-title')}>
                🎴 {tr('albumPortfolioTitle')}
              </h3>
              <p className={cx('text-xs text-slate-300 mt-1', 'gs-sub mt-1')}>
                <span className={cx('text-fuchsia-400 font-mono font-black', 'gs-mono font-black')}>
                  {cardCount} / {cardTotal}
                </span>
              </p>
            </div>

            <div className={cx('hidden', 'gs-meter gs-acc-plum w-full')}>
              <div
                className="gs-meter__fill"
                style={{ width: `${cardTotal ? Math.round((cardCount / cardTotal) * 100) : 0}%` }}
              />
            </div>

            {onOpenCards && (
              <button
                onClick={onOpenCards}
                className={cx(
                  'w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-fuchsia-400 via-fuchsia-500 to-purple-600 text-slate-950 hover:brightness-110 active:scale-95 shadow-xl transition-all flex items-center justify-center gap-2',
                  'gs-btn gs-btn--plum gs-btn--block py-3'
                )}
              >
                <Layers className="w-4 h-4" />
                <span>{tr('boosterPackTitle')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
