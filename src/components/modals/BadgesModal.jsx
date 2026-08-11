import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { ACHIEVEMENTS_DATA } from '../../data/achievementsData';

export function BadgesModal({ isOpen, onClose, unlockedAchievements = [] }) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNLOCKED' | 'LOCKED'
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const renderIcon = (iconName, className = 'w-5 h-5') => {
    const IconComp = Icons[iconName] || Icons.Trophy;
    return <IconComp className={className} />;
  };

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS_DATA.length;
  const progressPct = Math.round((unlockedCount / totalCount) * 100);

  const filteredBadges = ACHIEVEMENTS_DATA.filter((ach) => {
    const isUnlocked = unlockedAchievements.includes(ach.id);
    if (filter === 'UNLOCKED' && !isUnlocked) return false;
    if (filter === 'LOCKED' && isUnlocked) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (isUnlocked && ach.name.toLowerCase().includes(q)) ||
        (isUnlocked && ach.desc.toLowerCase().includes(q)) ||
        (isUnlocked && ach.quote.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full max-h-[85vh] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/60 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg">
              <Icons.Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
                🏆 SEC Certified Badge Wall
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Erreichte Meilensteine & Auszeichnungen ({unlockedCount} / {totalCount} Badges)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-mono font-bold">
            <span className="text-slate-300">Gesamt-Fortschritt Badges</span>
            <span className="text-amber-400 font-black">{progressPct}% ({unlockedCount}/{totalCount})</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full border border-slate-800 overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-amber-500 via-fuchsia-500 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-md"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
          <div className="flex gap-1 text-xs font-bold">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-xl transition-all ${
                filter === 'ALL' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Alle ({totalCount})
            </button>
            <button
              onClick={() => setFilter('UNLOCKED')}
              className={`px-3 py-1 rounded-xl transition-all ${
                filter === 'UNLOCKED' ? 'bg-emerald-500 text-slate-950 font-black shadow-md' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              ✨ Freigeschaltet ({unlockedCount})
            </button>
            <button
              onClick={() => setFilter('LOCKED')}
              className={`px-3 py-1 rounded-xl transition-all ${
                filter === 'LOCKED' ? 'bg-rose-500 text-slate-950 font-black shadow-md' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              🔒 Sperren ({totalCount - unlockedCount})
            </button>
          </div>

          <div className="relative">
            <Icons.Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Badge suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
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
                  className="p-3 rounded-2xl border border-slate-800/80 bg-slate-950/70 flex items-center justify-between opacity-50 backdrop-blur-sm select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-700">
                      <Icons.Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-mono text-xs text-slate-500 blur-[3px]">
                        ??? Locked Badge
                      </div>
                      <div className="text-[11px] text-slate-600 italic blur-[2px] mt-0.5">
                        "Unbekannter Meilenstein"
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-black bg-slate-900 text-slate-600 border border-slate-800">
                    LOCKED
                  </span>
                </div>
              );
            }

            return (
              <div
                key={ach.id}
                className="p-3 rounded-2xl border border-amber-400/50 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950 flex items-center justify-between shadow-md hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/60 text-amber-300 shadow-inner">
                    {renderIcon(ach.icon, 'w-5 h-5')}
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-100 flex items-center gap-1.5">
                      <span>{ach.name}</span>
                      <Icons.CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">{ach.desc}</div>
                    <div className="text-[10px] text-amber-300/80 font-mono italic mt-0.5">"{ach.quote}"</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
