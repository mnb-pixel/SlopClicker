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
  t,
}) {
  const [statsSection, setStatsSection] = useState('overview'); // 'overview' | 'log' | 'achievements'
  const tr = t || ((k) => k);

  const renderIcon = (iconName, className = 'w-4 h-4') => {
    const IconComp = Icons[iconName] || Icons.Award;
    return <IconComp className={className} />;
  };

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS_DATA.length;
  const milkPct = Math.min(100, Math.floor((unlockedCount / totalCount) * 100));

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
          {/* Hype Milk Level Banner */}
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider">
                Hype Milk Quality ({milkPct}%)
              </div>
              <div className="text-[11px] text-slate-400">
                Unlocked milestones boost Board Syndicate Upgrades!
              </div>
            </div>
            <div className="w-12 h-12 bg-slate-950 rounded-full border-2 border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black text-sm">
              {milkPct}%
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

      {/* ACHIEVEMENTS LIST */}
      {statsSection === 'achievements' && (
        <div className="flex flex-col gap-2">
          {ACHIEVEMENTS_DATA.map((ach) => {
            const isUnlocked = unlockedAchievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  isUnlocked
                    ? ach.isShadow
                      ? 'bg-fuchsia-950/40 border-fuchsia-500/50 text-fuchsia-200 shadow-lg'
                      : 'bg-slate-900/90 border-slate-700 text-slate-200 shadow-md'
                    : 'bg-slate-950/60 border-slate-900 opacity-40 grayscale'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg border ${
                    isUnlocked
                      ? ach.isShadow
                        ? 'bg-fuchsia-900 border-fuchsia-400 text-fuchsia-300 animate-pulse'
                        : 'bg-cyan-950 border-cyan-500/40 text-cyan-400'
                      : 'bg-slate-900 border-slate-800 text-slate-600'
                  }`}
                >
                  {renderIcon(ach.icon)}
                </div>
                <div>
                  <div className="font-extrabold text-sm flex items-center gap-2">
                    {tr(`ach_${ach.id}_name`)}
                    {ach.isShadow && (
                      <span className="bg-fuchsia-500/20 text-fuchsia-300 text-[9px] font-black px-1.5 py-0.2 rounded border border-fuchsia-500/30">
                        SHADOW
                      </span>
                    )}
                    {isUnlocked && (
                      <span className="text-emerald-400 text-xs font-black">✓</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 italic">"{tr(`ach_${ach.id}_quote`)}"</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
