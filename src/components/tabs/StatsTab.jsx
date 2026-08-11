import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { ACHIEVEMENTS_DATA } from '../../data/achievementsData';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { BadgesModal } from '../modals/BadgesModal';

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
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);

  const renderIcon = (iconName, className = 'w-4 h-4') => {
    const IconComp = Icons[iconName] || Icons.Award;
    return <IconComp className={className} />;
  };

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS_DATA.length;
  const hypePct = Math.min(100, Math.floor((unlockedCount / totalCount) * 100));

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      {isBadgesModalOpen && (
        <BadgesModal
          unlockedAchievements={unlockedAchievements}
          onClose={() => setIsBadgesModalOpen(false)}
        />
      )}

      {/* Sub-tab switcher */}
      <div className="grid grid-cols-3 gap-1.5 mb-4 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-extrabold">
        <button
          onClick={() => setStatsSection('overview')}
          className={`py-1.5 rounded-lg transition-all ${
            statsSection === 'overview'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          KPI Stats
        </button>
        <button
          onClick={() => setStatsSection('log')}
          className={`py-1.5 rounded-lg transition-all ${
            statsSection === 'log'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          VC Audit Log
        </button>
        <button
          onClick={() => {
            setStatsSection('achievements');
            setIsBadgesModalOpen(true);
          }}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
            statsSection === 'achievements'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🏆 Badges ({unlockedCount})
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

      {/* ACHIEVEMENTS / BADGE WALL LAUNCHER CARD */}
      {statsSection === 'achievements' && (
        <div className="bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center gap-3">
          <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/60 shadow-xl">
            <Icons.Trophy className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider text-slate-100">
              🏆 SEC Certified Badges Wall
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Badges freigeschaltet: <span className="text-amber-400 font-mono font-black">{unlockedCount} / {totalCount}</span>
            </p>
          </div>

          <button
            onClick={() => setIsBadgesModalOpen(true)}
            className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 hover:brightness-110 active:scale-95 shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Icons.Sparkles className="w-4 h-4 text-slate-950" />
            <span>✨ BADGES POPUP ÖFFNEN ({unlockedCount}/{totalCount})</span>
          </button>
        </div>
      )}
    </div>
  );
}
