import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { ACHIEVEMENTS_DATA } from '../../data/achievementsData';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export function StatsTab({
  stats,
  valuation,
  totalValuation,
  vps,
  clickValue,
  slopCount,
  unlockedAchievements,
  logs,
}) {
  const [statsSection, setStatsSection] = useState('overview'); // 'overview' | 'log' | 'achievements'

  const renderIcon = (iconName, className = 'w-4 h-4') => {
    const IconComp = Icons[iconName] || Icons.Award;
    return <IconComp className={className} />;
  };

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS_DATA.length;
  const hypePct = Math.min(100, Math.floor((unlockedCount / totalCount) * 100));

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      {/* Sub-tab switcher */}
      <div className="grid grid-cols-3 gap-1.5 mb-4 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-extrabold">
        <button
          onClick={() => setStatsSection('overview')}
          className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
            statsSection === 'overview' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Icons.BarChart2 className="w-3.5 h-3.5" /> Stats
        </button>
        <button
          onClick={() => setStatsSection('log')}
          className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
            statsSection === 'log' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Icons.List className="w-3.5 h-3.5" /> Log ({logs.length})
        </button>
        <button
          onClick={() => setStatsSection('achievements')}
          className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
            statsSection === 'achievements' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Icons.Trophy className="w-3.5 h-3.5" /> Badges ({unlockedCount}/{totalCount})
        </button>
      </div>

      {/* OVERVIEW STATS */}
      {statsSection === 'overview' && (
        <div className="flex flex-col gap-3">
          {/* Hype Index Banner */}
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider">
                Hype Index ({hypePct}%)
              </div>
              <div className="text-[11px] text-slate-400">
                Unlocked milestones boost Board Syndicate Upgrades!
              </div>
            </div>
            <div className="w-12 h-12 bg-slate-950 rounded-full border-2 border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black text-sm">
              {hypePct}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">Current Valuation:</div>
              <div className="text-emerald-400 font-extrabold text-sm">{formatCurrency(valuation)}</div>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">Lifetime Valuation:</div>
              <div className="text-cyan-400 font-extrabold text-sm">{formatCurrency(totalValuation)}</div>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">Valuation / sec (VPS):</div>
              <div className="text-amber-400 font-extrabold text-sm">+{formatCurrency(vps)}</div>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">Valuation / tap:</div>
              <div className="text-fuchsia-400 font-extrabold text-sm">+{formatCurrency(clickValue)}</div>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">Total AGI Taps:</div>
              <div className="text-slate-200 font-extrabold text-sm">{formatNumber(stats.totalClicks)}</div>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">AI Slop Count:</div>
              <div className="text-slate-200 font-extrabold text-sm">{formatNumber(slopCount)}</div>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">GPU Overheats:</div>
              <div className="text-rose-400 font-extrabold text-sm">{stats.overheatCount} times</div>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px]">Golden Memes Caught:</div>
              <div className="text-amber-400 font-extrabold text-sm">{stats.goldenCaught}</div>
            </div>
          </div>
        </div>
      )}

      {/* CHRONOLOGICAL LOG STREAM */}
      {statsSection === 'log' && (
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs max-h-[450px] overflow-y-auto flex flex-col gap-2">
          {logs.map((l) => (
            <div
              key={l.id}
              className={`p-2 rounded border text-[11px] ${
                l.type === 'achievement'
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                  : l.type === 'warning'
                  ? 'bg-amber-950/20 border-amber-500/20 text-amber-200'
                  : l.type === 'danger'
                  ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                  : l.type === 'success'
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <span className="text-[10px] opacity-60 mr-2">[{l.timestamp}]</span>
              {l.text}
            </div>
          ))}
        </div>
      )}

      {/* ACHIEVEMENTS / BADGE WALL */}
      {statsSection === 'achievements' && (
        <div className="flex flex-col gap-2">
          <div className="bg-cyan-950/40 p-3 rounded-xl border border-cyan-500/40 mb-1 text-xs">
            <div className="font-extrabold text-cyan-300 flex items-center gap-1.5 mb-1">
              <Icons.Trophy className="w-4 h-4 text-cyan-400" />
              Achievement Badge Wall
            </div>
            <div className="text-slate-300/80">
              Locked badges stay blurred until you hit the milestone that unlocks them.
            </div>
            <div className="text-[10px] text-cyan-400 font-mono font-bold mt-1">
              Badges Unlocked: {unlockedCount} / {totalCount}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {ACHIEVEMENTS_DATA.map((ach) => {
              const isUnlocked = unlockedAchievements.includes(ach.id);

              if (!isUnlocked) {
                return (
                  <div
                    key={ach.id}
                    className="relative p-2.5 rounded-xl border border-slate-800 bg-slate-950/70 flex flex-col justify-between opacity-70 backdrop-blur-sm overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-700">
                        <Icons.Lock className="w-3.5 h-3.5" />
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-slate-900 text-slate-600 border border-slate-800">
                        LOCKED
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-600 blur-[3px] select-none truncate">
                      ????????????
                    </div>
                    <div className="text-[10px] text-slate-700 italic mt-0.5 blur-[2px] select-none">
                      "?????????????????"
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={ach.id}
                  className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                    ach.isShadow
                      ? 'bg-fuchsia-950/40 border-fuchsia-500/50 text-fuchsia-200 shadow-lg'
                      : 'bg-slate-900/90 border-slate-700 text-slate-200 shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div
                      className={`p-2 rounded-lg border ${
                        ach.isShadow
                          ? 'bg-fuchsia-900 border-fuchsia-400 text-fuchsia-300 animate-pulse'
                          : 'bg-cyan-950 border-cyan-500/40 text-cyan-400'
                      }`}
                    >
                      {renderIcon(ach.icon)}
                    </div>
                    <div className="flex items-center gap-1">
                      {ach.isShadow && (
                        <span className="bg-fuchsia-500/20 text-fuchsia-300 text-[9px] font-black px-1.5 py-0.2 rounded border border-fuchsia-500/30">
                          SHADOW
                        </span>
                      )}
                      <Icons.CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    </div>
                  </div>
                  <div className="font-extrabold text-xs">{ach.name}</div>
                  <div className="text-[10px] text-slate-400 italic mt-0.5">"{ach.quote}"</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
