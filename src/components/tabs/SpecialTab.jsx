import React, { useState } from 'react';
import { Tv, Gift, RotateCw, Sparkles, ShieldAlert, Repeat } from 'lucide-react';
import { getIcon } from '../../utils/iconMap';
import { HEAVENLY_UPGRADES_DATA } from '../../data/heavenlyUpgradesData';
import { IDEALIST_PATH, CYNIC_PATH, EPOCHS, CREDIBILITY_LEVEL_COST_BASE } from '../../data/credibilityTreeData';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export function SpecialTab({
  prestigeLevel,
  heavenlyChips,
  ascend,
  pendingHeavenlyChips = 0,
  boughtHeavenlyUpgrades,
  buyHeavenlyUpgrade,
  epoch = 2,
  credibility = 0,
  idealistLevel = 0,
  buyIdealistLevel,
  cynicLevel = 0,
  buyCynicLevel,
  pivot,
  pivotCredGain = 0,
  adState,
  requestBonus,
  isAdReady,
  getAdCooldownRemaining,
  pendingAscendBoost = false,
  pendingPivotBoost = false,
  adFree = false,
  t,
}) {
  const [activePathTab, setActivePathTab] = useState('pivot'); // 'pivot' | 'idealist' | 'cynic' | 'heavenly'
  const tr = t || ((k) => k);

  const renderIcon = (iconName, className = 'w-5 h-5') => {
    const IconComp = getIcon(iconName, 'Sparkles');
    return <IconComp className={className} />;
  };

  // Rewarded-Ad-Boost-Button, wiederverwendet für Pivot & Ascension: gewährt +20% auf
  // die nächste Ausführung, kein Cash/Gate - reiner Bonus an einem ohnehin großen Meilenstein.
  const renderAdBoost = (type, label, pendingActive) => {
    if (!requestBonus) return null;
    if (pendingActive) {
      return (
        <div className="mt-2 text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 rounded-lg px-2 py-1.5 text-center">
          ✓ {tr('adBonusActive')}
        </div>
      );
    }
    if (adState?.type === type) {
      return (
        <div className="mt-2 text-[10px] font-mono font-bold text-amber-300 bg-slate-950/80 border border-amber-500 rounded-lg px-2 py-1.5 text-center animate-pulse">
          {tr('adPlaying')} ({adState.timer}s)
        </div>
      );
    }
    if (isAdReady && !isAdReady(type)) {
      const mins = getAdCooldownRemaining ? Math.ceil(getAdCooldownRemaining(type) / 60) : 0;
      return (
        <div className="mt-2 text-[10px] text-slate-400 font-mono text-center">
          {tr('adBonusCooldown').replace('{min}', mins)}
        </div>
      );
    }
    return (
      <button
        onClick={() => requestBonus(type)}
        className="mt-2 w-full py-2 rounded-xl font-black text-[10px] uppercase tracking-wider bg-slate-800 border border-purple-400/60 text-purple-200 hover:bg-slate-700 active:scale-95 shadow-md transition-all flex items-center justify-center gap-1.5"
      >
        {adFree ? <Gift className="w-3.5 h-3.5" /> : <Tv className="w-3.5 h-3.5" />}
        {label}
      </button>
    );
  };

  const currentEpoch = EPOCHS[epoch] || EPOCHS[2];
  const credGain = pivotCredGain;
  const pendingChips = pendingHeavenlyChips;
  const currentBonus = prestigeLevel * (boughtHeavenlyUpgrades.includes('heaven_synergy_1') ? 2 : 1);

  // Ascension löscht unwiderruflich Valuation, Engines & Store-Upgrades - vor dem Klick
  // nochmal explizit gegenchecken lassen, kein versehentliches Zurücksetzen.
  const handleAscendClick = () => {
    const confirmMsg = tr('ascendConfirm').replace('{chips}', pendingChips);
    if (window.confirm(confirmMsg)) {
      ascend();
    }
  };

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      {/* Path Selector Tabs */}
      <div className="grid grid-cols-4 gap-1 mb-4 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActivePathTab('pivot')}
          className={`py-1.5 rounded-lg transition-all ${
            activePathTab === 'pivot' ? 'bg-[#8A6A1F] text-slate-950' : 'text-slate-400'
          }`}
        >
          {tr('pathPivot')}
        </button>
        <button
          onClick={() => setActivePathTab('idealist')}
          className={`py-1.5 rounded-lg transition-all ${
            activePathTab === 'idealist' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
          }`}
        >
          {tr('pathIdealist')} ({idealistLevel}/15)
        </button>
        <button
          onClick={() => setActivePathTab('cynic')}
          className={`py-1.5 rounded-lg transition-all ${
            activePathTab === 'cynic' ? 'bg-rose-500 text-slate-950' : 'text-slate-400'
          }`}
        >
          {tr('pathCynic')} ({cynicLevel}/15)
        </button>
        <button
          onClick={() => setActivePathTab('heavenly')}
          className={`py-1.5 rounded-lg transition-all ${
            activePathTab === 'heavenly' ? 'bg-purple-500 text-slate-950' : 'text-slate-400'
          }`}
        >
          {tr('pathAscension')}
        </button>
      </div>

      {/* PIVOT & EPOCH ROTATION TAB */}
      {activePathTab === 'pivot' && (
        <div className="bg-gradient-to-br from-[#1C2B3A] via-slate-900 to-[#14202C] p-4 rounded-2xl border-2 border-[#8A6A1F] shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <RotateCw className="w-5 h-5 text-[#8A6A1F] animate-spin" />
              <h2 className="text-base font-black text-[#EAE7DA] uppercase font-serif">
                {tr('pivotTitle')}
              </h2>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#8A6A1F] text-slate-950 px-2 py-0.5 rounded">
              {tr(`epoch_${currentEpoch.id}_name`)}
            </span>
          </div>

          <p className="text-xs text-[#EAE7DA]/90 mb-3 bg-[#14202C]/80 p-2.5 rounded-xl border border-[#8A6A1F]/30">
            {tr('pivotDesc')}
          </p>

          <div className="grid grid-cols-2 gap-2 bg-[#14202C] p-2.5 rounded-xl border border-[#8A6A1F]/40 mb-3 text-xs font-mono">
            <div>
              <div className="text-slate-400 text-[10px]">{tr('credBalance')}</div>
              <div className="text-[#8A6A1F] font-extrabold text-base">{credibility.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">{tr('pivotGain')}</div>
              <div className="text-emerald-400 font-extrabold text-base">+{credGain} Credibility</div>
            </div>
          </div>

          <button
            onClick={pivot}
            disabled={credGain < 5}
            className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl ${
              credGain > 0
                ? 'bg-[#8A6A1F] text-slate-950 hover:bg-[#C59B3F] active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <RotateCw className="w-4 h-4" />
            {tr('executePivot')}{credGain}{tr('pivotExecuteSuffix')}
          </button>
          {renderAdBoost('pivot_boost', tr(adFree ? 'claimCredBoost' : 'watchAdCredBoost').replace('{amount}', Math.max(0, Math.floor(credGain * 1.2) - credGain)), pendingPivotBoost)}
        </div>
      )}

      {/* IDEALIST PATH TREE (Only show unlocked + 1 single next locked level) */}
      {activePathTab === 'idealist' && (
        <div className="flex flex-col gap-2">
          <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/40 text-xs mb-2">
            <div className="font-extrabold text-emerald-300 mb-0.5">{tr('idealistTitle')}</div>
            <div className="text-[#EAE7DA]/80">{tr('idealistDesc')}</div>
          </div>

          {IDEALIST_PATH.slice(0, idealistLevel + 1).map((node, idx) => {
            const isUnlocked = idx < idealistLevel;
            const isNext = idx === idealistLevel;
            const cost = Math.pow(CREDIBILITY_LEVEL_COST_BASE, idx);
            const canAfford = credibility >= cost && isNext;
            const nodeName = `${tr(`epoch_${currentEpoch.id}_prefix`)}${tr(`idealist_${node.level}_name`)}`;
            const nodeQuote = tr(`idealist_${node.level}_quote`);

            return (
              <div
                key={node.level}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isUnlocked
                    ? 'bg-emerald-950/30 border-emerald-500/40 opacity-80'
                    : isNext && canAfford
                    ? 'bg-slate-900 border-emerald-400 shadow-md'
                    : 'bg-slate-950/60 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 shrink-0">
                    {renderIcon(node.icon || 'HeartHandshake', 'w-4 h-4')}
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-100 flex items-center gap-1.5">
                      <span>Level {node.level}: {nodeName}</span>
                      {isUnlocked && <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1 rounded font-mono font-bold">{tr('unlockedBadge')}</span>}
                    </div>
                    <div className="text-[11px] text-slate-400 italic">"{nodeQuote}"</div>
                    <div className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5">
                      {tr('burnDeltaLabel')}: {(node.burnDelta * 100).toFixed(1)}% {node.vpsBonus > 0 && `| VPS: +${Math.round(node.vpsBonus * 100)}%`}
                    </div>
                  </div>
                </div>

                {isNext && (
                  <button
                    onClick={buyIdealistLevel}
                    disabled={!canAfford}
                    className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all ${
                      canAfford
                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {cost.toFixed(1)} {tr('credUnit')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CYNIC PATH TREE (Only show unlocked + 1 single next locked level) */}
      {activePathTab === 'cynic' && (
        <div className="flex flex-col gap-2">
          <div className="bg-rose-950/40 p-3 rounded-xl border border-rose-500/40 text-xs mb-2">
            <div className="font-extrabold text-rose-300 mb-0.5">{tr('cynicTitle')}</div>
            <div className="text-[#EAE7DA]/80">{tr('cynicDesc')}</div>
          </div>

          {CYNIC_PATH.slice(0, cynicLevel + 1).map((node, idx) => {
            const isUnlocked = idx < cynicLevel;
            const isNext = idx === cynicLevel;
            const cost = Math.pow(CREDIBILITY_LEVEL_COST_BASE, idx);
            const canAfford = credibility >= cost && isNext;
            const nodeName = `${tr(`epoch_${currentEpoch.id}_prefix`)}${tr(`cynic_${node.level}_name`)}`;
            const nodeQuote = tr(`cynic_${node.level}_quote`);

            return (
              <div
                key={node.level}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isUnlocked
                    ? 'bg-rose-950/30 border-rose-500/40 opacity-80'
                    : isNext && canAfford
                    ? 'bg-slate-900 border-rose-400 shadow-md'
                    : 'bg-slate-950/60 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-950 border border-rose-500/40 text-rose-400 shrink-0">
                    {renderIcon(node.icon || 'TrendingUp', 'w-4 h-4')}
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-100 flex items-center gap-1.5">
                      <span>Level {node.level}: {nodeName}</span>
                      {isUnlocked && <span className="bg-rose-500/20 text-rose-300 text-[9px] px-1 rounded font-mono font-bold">{tr('unlockedBadge')}</span>}
                    </div>
                    <div className="text-[11px] text-slate-400 italic">"{nodeQuote}"</div>
                    <div className="text-[10px] text-rose-400 font-mono font-bold mt-0.5">
                      VPS: +{Math.round(node.vpsBonus * 100)}% {node.burnDelta > 0 && `| ${tr('burnLabel')}: +${(node.burnDelta * 100).toFixed(1)}%`}
                    </div>
                  </div>
                </div>

                {isNext && (
                  <button
                    onClick={buyCynicLevel}
                    disabled={!canAfford}
                    className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all ${
                      canAfford
                        ? 'bg-rose-500 text-slate-950 hover:bg-rose-400 active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {cost.toFixed(1)} {tr('credUnit')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* HEAVENLY SINGULARITY ASCENSION TAB (Only show bought + 1 next unbought per path) */}
      {activePathTab === 'heavenly' && (() => {
        const visibleHeavenly = [];
        const unboughtPaths = new Set();

        HEAVENLY_UPGRADES_DATA.forEach((up) => {
          const isBought = boughtHeavenlyUpgrades.includes(up.id);
          if (isBought) {
            visibleHeavenly.push(up);
          } else if (!unboughtPaths.has(up.path)) {
            visibleHeavenly.push(up);
            unboughtPaths.add(up.path);
          }
        });

        return (
          <div>
            {/* Singularity Ascension Card */}
            <div className="bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 p-4 rounded-2xl border-2 border-purple-500/40 shadow-2xl mb-6 relative overflow-hidden group">
              <img
                src="/singularity_prestige_meme.jpg"
                alt={tr('ascendTitle')}
                className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-40 transition-opacity"
              />

              <div className="relative z-10 flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
                <h2 className="text-lg font-black tracking-wide text-purple-200 uppercase">
                  {tr('ascendTitle')}
                </h2>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-2 bg-slate-950/90 p-3 rounded-xl border border-purple-500/30 mb-4 text-xs font-mono">
                <div>
                  <div className="text-slate-400 text-[10px]">{tr('prestigeLevelText')}</div>
                  <div className="text-purple-300 font-extrabold text-base">+{prestigeLevel}</div>
                  <div className="text-emerald-400 text-[10px]">+{currentBonus}% {tr('permanentVpsLabel')}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">{tr('heavenlyChipsText')}</div>
                  <div className="text-amber-400 font-extrabold text-base">{heavenlyChips}</div>
                  <div className="text-purple-400 text-[10px]">+{pendingChips} {tr('onAscensionLabel')}</div>
                </div>
              </div>

              <div className="relative z-10 flex items-start gap-2 bg-rose-950/80 border-2 border-rose-500 rounded-xl p-2.5 mb-3 shadow-lg shadow-rose-500/20">
                <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0 animate-pulse" />
                <p className="text-[11px] text-rose-200 font-bold leading-snug">
                  {tr('ascendWarning')}
                </p>
              </div>

              <button
                onClick={handleAscendClick}
                disabled={pendingChips <= 0}
                className={`relative z-10 w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl ${
                  pendingChips > 0 || prestigeLevel > 0
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 active:scale-95'
                    : 'bg-slate-800/90 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Repeat className="w-4 h-4" />
                {tr('executeAscend')}{pendingChips}{tr('ascendExecuteSuffix')}
              </button>
              <div className="relative z-10">
                {renderAdBoost('ascend_boost', tr(adFree ? 'claimChipsBoost' : 'watchAdChipsBoost').replace('{amount}', Math.max(0, Math.floor(pendingChips * 1.2) - pendingChips)), pendingAscendBoost)}
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {visibleHeavenly.map((up) => {
                const isBought = boughtHeavenlyUpgrades.includes(up.id);
                const canAfford = heavenlyChips >= up.chipsCost;

                return (
                  <div
                    key={up.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isBought
                        ? 'bg-purple-950/40 border-purple-500/40 opacity-80'
                        : canAfford
                        ? 'bg-slate-900/90 border-slate-700 hover:border-purple-400 shadow-lg'
                        : 'bg-slate-950/60 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-purple-950 border border-purple-500/40 text-purple-400">
                        {renderIcon(up.path === 'angel' ? 'Shield' : up.path === 'demon' ? 'Flame' : 'Sparkles')}
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-100">{tr(`heavenly_${up.id}_name`)}</div>
                        <div className="text-[11px] text-purple-300 font-semibold">{tr(`heavenly_${up.id}_description`)}</div>
                      </div>
                    </div>

                    {!isBought && (
                      <button
                        onClick={() => buyHeavenlyUpgrade(up.id)}
                        disabled={!canAfford}
                        className="px-3 py-1.5 rounded bg-purple-600 text-white font-black text-xs"
                      >
                        {up.chipsCost} {tr('chipsUnit')}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
