import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, X, Search, Lock, CheckCircle2 } from 'lucide-react';
import { getIcon } from '../../utils/iconMap';
import { ACHIEVEMENTS_DATA } from '../../data/achievementsData';
import { AdBanner } from '../AdBanner';
import { useSkin } from '../skin';

export function BadgesModal({ isOpen = true, onClose, unlockedAchievements = [], adFree = false, t }) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNLOCKED' | 'LOCKED'
  const [searchQuery, setSearchQuery] = useState('');
  // Zwei Looks, ein Markup - siehe src/components/skin.jsx. Im Spiel-Skin wird aus der
  // dunklen Trophäenwand eine Pinnwand aus Papier: Orden als Plaketten mit klotziger
  // Kante, ungelöste als gestrichelte Leerstellen.
  const { cx } = useSkin();

  if (!isOpen) return null;

  const tr = t || ((k) => k);

  const renderIcon = (iconName, className = 'w-5 h-5') => {
    const IconComp = getIcon(iconName, 'Trophy');
    return <IconComp className={className} />;
  };

  const unlockedCount = new Set(unlockedAchievements).size;
  const totalCount = ACHIEVEMENTS_DATA.length;
  const progressPct = Math.round((unlockedCount / totalCount) * 100);

  const getAchTitle = (ach) => {
    const key = `ach_${ach.id}_name`;
    const val = tr(key);
    return val && val !== key ? val : ach.name || `Badge ${ach.id}`;
  };

  const getAchQuote = (ach) => {
    const key = `ach_${ach.id}_quote`;
    const val = tr(key);
    return val && val !== key ? val : ach.quote || tr('badgeFallbackQuote');
  };

  const filteredBadges = ACHIEVEMENTS_DATA.filter((ach) => {
    const isUnlocked = unlockedAchievements.includes(ach.id);
    if (filter === 'UNLOCKED' && !isUnlocked) return false;
    if (filter === 'LOCKED' && isUnlocked) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = getAchTitle(ach).toLowerCase();
      const quote = getAchQuote(ach).toLowerCase();
      return (isUnlocked && (title.includes(q) || quote.includes(q)));
    }
    return true;
  });

  const modalContent = (
    <div
      className={cx(
        'fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn',
        'gs-modal-backdrop gs-skin animate-fadeIn'
      )}
      onClick={onClose}
    >
      <div
        className={cx(
          'relative max-w-2xl w-full max-h-[85vh] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/60 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-slate-100 overflow-hidden',
          'gs-modal gs-acc-gold p-4 gap-3'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={cx(
          'flex items-center justify-between border-b border-slate-800 pb-3',
          'flex items-center justify-between gap-2 pb-3 gs-hr'
        )}>
          <div className="flex items-center gap-3">
            <div className={cx(
              'p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg',
              'gs-iconbox gs-iconbox--lg gs-acc-gold'
            )}>
              <Trophy className={cx('w-6 h-6 text-amber-400', 'w-6 h-6')} />
            </div>
            <div>
              <h2 className={cx(
                'text-base font-black uppercase tracking-wider text-slate-100 flex items-center gap-2',
                'gs-title flex items-center gap-2'
              )}>
                🏆 {tr('badgesWallTitle')}
              </h2>
              <p className={cx('text-xs text-slate-400 font-mono', 'gs-mono gs-ink-soft')}>
                {tr('badgesModalSubtitle')} ({unlockedCount} / {totalCount})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={cx(
              'p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors',
              'gs-iconbtn'
            )}
          >
            <X className={cx('w-5 h-5', 'w-4 h-4')} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className={cx(
          'bg-slate-900 p-3 rounded-2xl border border-slate-800 flex flex-col gap-2',
          'gs-panel gs-panel--sunk gs-acc-gold flex flex-col gap-2'
        )}>
          <div className={cx('flex justify-between items-center text-xs font-mono font-bold', 'flex justify-between items-center gs-mono font-bold')}>
            <span className={cx('text-slate-300', '')}>{tr('overallBadgeProgress')}</span>
            <span className={cx('text-amber-400 font-black', 'font-black gs-ink-gold')}>
              {progressPct}% ({unlockedCount}/{totalCount})
            </span>
          </div>
          <div className={cx(
            'w-full bg-slate-950 h-3 rounded-full border border-slate-800 overflow-hidden p-0.5',
            'gs-meter gs-acc-gold w-full'
          )}>
            <div
              className={cx(
                'bg-gradient-to-r from-amber-500 via-fuchsia-500 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-md',
                'gs-meter__fill'
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
          <div className={cx('flex gap-1 text-xs font-bold', 'gs-segment')}>
            {[
              { id: 'ALL', label: `${tr('filterAll')} (${totalCount})`, dark: 'bg-amber-500', acc: 'gs-acc-gold' },
              { id: 'UNLOCKED', label: `✨ ${tr('filterUnlocked')} (${unlockedCount})`, dark: 'bg-emerald-500', acc: 'gs-acc-grass' },
              { id: 'LOCKED', label: `🔒 ${tr('filterLocked')} (${totalCount - unlockedCount})`, dark: 'bg-rose-500', acc: 'gs-acc-rust' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cx(
                  `px-3 py-1 rounded-xl transition-all ${
                    filter === f.id ? `${f.dark} text-slate-950 font-black shadow-md` : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`,
                  `gs-seg-btn ${f.acc} ${filter === f.id ? 'is-active' : ''}`
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className={cx(
              'w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400',
              'w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2'
            )} />
            <input
              type="text"
              placeholder={tr('badgeSearchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cx(
                'w-full sm:w-48 bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono',
                'gs-input w-full sm:w-48'
              )}
            />
          </div>
        </div>

        {/* Badge Grid Container */}
        <div className="overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-h-[300px] max-h-[50vh]">
          {filteredBadges.map((ach) => {
            const isUnlocked = unlockedAchievements.includes(ach.id);

            if (!isUnlocked) {
              return (
                <div
                  key={ach.id}
                  className={cx(
                    'p-3 rounded-2xl border border-slate-800/80 bg-slate-950/70 flex items-center justify-between opacity-50 backdrop-blur-sm select-none',
                    'gs-row gs-row--locked select-none'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cx('p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-700', 'gs-iconbox')}>
                      <Lock className={cx('w-5 h-5', 'w-4 h-4')} />
                    </div>
                    <div>
                      <div className={cx('font-mono text-xs text-slate-500 blur-[3px]', 'gs-mono blur-[3px]')}>
                        {tr('lockedBadgeLabel')}
                      </div>
                      <div className={cx('text-[11px] text-slate-600 italic blur-[2px] mt-0.5', 'gs-quote blur-[2px] mt-0.5')}>
                        "{tr('unknownMilestone')}"
                      </div>
                    </div>
                  </div>
                  <span className={cx(
                    'px-2 py-0.5 rounded text-[9px] font-black bg-slate-900 text-slate-600 border border-slate-800',
                    'gs-chip'
                  )}>
                    {tr('locked')}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={ach.id}
                className={cx(
                  'p-3 rounded-2xl border border-amber-400/50 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950 flex items-center justify-between shadow-md hover:border-amber-400 transition-colors',
                  'gs-row gs-acc-gold gs-row--medal'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cx(
                    'p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/60 text-amber-300 shadow-inner',
                    'gs-medal gs-acc-gold'
                  )}>
                    {renderIcon(ach.icon, cx('w-5 h-5', 'w-4 h-4'))}
                  </div>
                  <div className="min-w-0">
                    <div className={cx('font-extrabold text-xs text-slate-100 flex items-center gap-1.5', 'gs-title flex items-center gap-1.5')}>
                      <span>{getAchTitle(ach)}</span>
                      <CheckCircle2 className={cx('w-3.5 h-3.5 text-emerald-400', 'w-3.5 h-3.5 gs-ink-grass')} />
                    </div>
                    <div className={cx('text-[10px] text-amber-300/80 font-mono italic mt-0.5', 'gs-quote mt-0.5')}>"{getAchQuote(ach)}"</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <AdBanner variant="leaderboard" label={tr('adPlaceholderLabel')} adFree={adFree} />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
