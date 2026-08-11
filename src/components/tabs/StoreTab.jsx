import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { BUILDINGS_DATA } from '../../data/buildingsData';
import { UPGRADES_DATA } from '../../data/upgradesData';
import { BUZZWORDS_DATA } from '../../data/buzzwordsData';
import { GREENWASHING_LAYOFFS_DATA } from '../../data/greenwashingLayoffsData';
import { formatCurrency, formatNumber, getBuildingCost, getBuildingBulkCost, getMaxAffordableBuildings } from '../../utils/formatters';

export function StoreTab({
  valuation,
  buildings,
  buyBuilding,
  buyMode,
  setBuyMode,
  boughtUpgrades,
  buyUpgrade,
  buyAllUpgrades,
  totalValuation,
  boughtBuzzwords = [],
  buyBuzzword,
  boughtGreenwashingLayoffs = [],
  buyGreenwashingLayoff,
  t,
}) {
  const [storeSection, setStoreSection] = useState('engines'); // 'engines' | 'upgrades' | 'corporate' | 'buzzwords'
  const [showBoughtUpgrades, setShowBoughtUpgrades] = useState(false);
  const tr = t || ((k) => k);

  // Dynamic Icon Resolver helper
  const renderIcon = (iconName, className = 'w-4 h-4') => {
    const IconComp = Icons[iconName] || Icons.Zap;
    return <IconComp className={className} />;
  };

  // Dynamic Meme Artwork Thumbnail Resolver helper
  const renderItemArtwork = (item, defaultIcon = 'Zap') => {
    if (item && item.image) {
      return (
        <img
          src={item.image}
          alt={item.name || 'AI Engine Meme'}
          className="w-7 h-7 rounded-lg object-cover border border-cyan-400/60 shadow-md"
        />
      );
    }
    return renderIcon(item?.icon || defaultIcon, 'w-4 h-4 text-cyan-400');
  };

  // Target Badge Resolver helper
  const getTargetBadge = (up) => {
    if (!up) return '';
    if (up.type === 'building') {
      const targetB = BUILDINGS_DATA.find((b) => b.id === up.buildingId);
      return targetB ? `🎯 ${targetB.name}` : `🎯 ${up.buildingId}`;
    }
    if (up.type === 'click') return `🎯 ${tr('affectsClick')}`;
    if (up.type === 'syndicate') return `🎯 ${tr('affectsSyndicate')}`;
    if (up.type === 'global') return `🎯 ${tr('affectsGlobal')}`;
    return '🎯 Global';
  };

  // Calculate gross base CPS sum across all buildings for income percentage share
  const totalGrossCpsSum = BUILDINGS_DATA.reduce((acc, b) => {
    const count = buildings[b.id] || 0;
    if (count <= 0) return acc;
    let bMult = 1.0;
    boughtUpgrades.forEach((upId) => {
      const up = UPGRADES_DATA.find((u) => u.id === upId);
      if (up && up.type === 'building' && up.buildingId === b.id) {
        bMult *= up.effect.value;
      }
    });
    boughtGreenwashingLayoffs.forEach((itemId) => {
      const gw = GREENWASHING_LAYOFFS_DATA.find((g) => g.id === itemId);
      if (gw && gw.buildingId === b.id) {
        if (gw.id.endsWith('_2')) bMult *= 1.10;
        if (gw.id.endsWith('_3')) bMult *= 1.15;
        if (gw.id.startsWith('lay_') && gw.tier === 1) bMult *= 1.20;
        if (gw.id.startsWith('lay_') && gw.tier === 2) bMult *= 1.35;
      }
    });
    return acc + count * b.baseCps * bMult;
  }, 0);

  // Progressive Building Visibility
  const visibleBuildings = [];
  let foundFirstLocked = false;

  BUILDINGS_DATA.forEach((b, idx) => {
    const count = buildings[b.id] || 0;
    const prevBuilding = idx > 0 ? BUILDINGS_DATA[idx - 1] : null;
    const prevCount = prevBuilding ? (buildings[prevBuilding.id] || 0) : 0;

    const isUnlocked = idx === 0 || count > 0 || prevCount >= 1 || totalValuation >= b.baseCost * 0.15;

    if (isUnlocked) {
      visibleBuildings.push(b);
    } else if (!foundFirstLocked) {
      visibleBuildings.push({ id: `locked_teaser_${b.id}`, isTeaser: true, name: b.name });
      foundFirstLocked = true;
    }
  });

  // Upgrades List Filtering
  const availableUpgrades = UPGRADES_DATA.filter((up) => {
    if (boughtUpgrades.includes(up.id)) return false;
    if (up.req) {
      if (up.req.totalValuation && totalValuation < up.req.totalValuation * 0.10 && valuation < up.cost * 0.10) {
        return false;
      }
      if (up.req.buildingCount) {
        const count = buildings[up.req.buildingCount.id] || 0;
        if (count < 1 && totalValuation < up.cost * 0.10) return false;
      }
    }
    return true;
  });

  const boughtUpgradesObjects = boughtUpgrades
    .map((upId) => UPGRADES_DATA.find((u) => u.id === upId))
    .filter(Boolean);

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      {/* 4 Store Sub-Category Selector */}
      <div className="grid grid-cols-4 gap-1 mb-4 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
        <button
          onClick={() => setStoreSection('engines')}
          className={`py-1.5 rounded-lg transition-all ${
            storeSection === 'engines' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {tr('subEngines')}
        </button>
        <button
          onClick={() => setStoreSection('upgrades')}
          className={`py-1.5 rounded-lg transition-all ${
            storeSection === 'upgrades' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {tr('subUpgrades')} ({availableUpgrades.length})
        </button>
        <button
          onClick={() => setStoreSection('corporate')}
          className={`py-1.5 rounded-lg transition-all ${
            storeSection === 'corporate' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {tr('subCorporate')}
        </button>
        <button
          onClick={() => setStoreSection('buzzwords')}
          className={`py-1.5 rounded-lg transition-all ${
            storeSection === 'buzzwords' ? 'bg-fuchsia-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {tr('subBuzzwords')}
        </button>
      </div>

      {/* AI ENGINES SECTION */}
      {storeSection === 'engines' && (
        <div>
          {/* Buy Mode Selector Bar */}
          <div className="flex items-center justify-between bg-slate-900/90 p-2 rounded-xl border border-slate-800 mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Buy Mode:</span>
            <div className="flex gap-1">
              {['1', '10', '100', 'MAX'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setBuyMode(mode)}
                  className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all ${
                    buyMode === mode
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* AI Engines Cards List */}
          <div className="flex flex-col gap-2">
            {visibleBuildings.map((b) => {
              if (b.isTeaser) {
                return (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/70 flex items-center justify-between opacity-50 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-slate-600">
                        <Icons.Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-500">
                          ??? Locked Engine Tier
                        </div>
                        <div className="text-[11px] text-slate-500 italic mt-0.5">
                          Requires higher valuation or previous engine tier.
                        </div>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 rounded text-[10px] font-black bg-slate-900 text-slate-600 border border-slate-800">
                      LOCKED
                    </div>
                  </div>
                );
              }

              const count = buildings[b.id] || 0;

              let cost = 0;
              let buyText = `+1`;
              if (buyMode === '1') {
                cost = getBuildingCost(b.baseCost, count);
                buyText = `+1`;
              } else if (buyMode === '10') {
                cost = getBuildingBulkCost(b.baseCost, count, 10);
                buyText = `+10`;
              } else if (buyMode === '100') {
                cost = getBuildingBulkCost(b.baseCost, count, 100);
                buyText = `+100`;
              } else if (buyMode === 'MAX') {
                const res = getMaxAffordableBuildings(b.baseCost, count, valuation);
                cost = res.totalCost;
                buyText = res.count > 0 ? `+${res.count}` : `+0`;
              }

              const canAfford = valuation >= cost && cost > 0;

              // Calculate exact unit production and multiplier for this building
              let bMult = 1.0;
              boughtUpgrades.forEach((upId) => {
                const up = UPGRADES_DATA.find((u) => u.id === upId);
                if (up && up.type === 'building' && up.buildingId === b.id) {
                  bMult *= up.effect.value;
                }
              });
              boughtGreenwashingLayoffs.forEach((itemId) => {
                const gw = GREENWASHING_LAYOFFS_DATA.find((g) => g.id === itemId);
                if (gw && gw.buildingId === b.id) {
                  if (gw.id.endsWith('_2')) bMult *= 1.10;
                  if (gw.id.endsWith('_3')) bMult *= 1.15;
                  if (gw.id.startsWith('lay_') && gw.tier === 1) bMult *= 1.20;
                  if (gw.id.startsWith('lay_') && gw.tier === 2) bMult *= 1.35;
                }
              });

              const unitVps = b.baseCps * bMult;
              const buildingTotalVps = count * unitVps;
              const vpsSharePct = totalGrossCpsSum > 0 ? ((buildingTotalVps / totalGrossCpsSum) * 100).toFixed(1) : '0.0';

              return (
                <div key={b.id} className="relative group">
                  {/* Mouseover Hover Tooltip Card */}
                  <div className="hidden group-hover:flex flex-col gap-1 absolute bottom-full left-0 right-0 z-50 mb-2 p-3 bg-slate-950/95 backdrop-blur-md border border-cyan-500/50 rounded-xl shadow-2xl text-xs pointer-events-none animate-fadeIn">
                    <div className="font-extrabold text-cyan-300 flex items-center justify-between">
                      <span>{b.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Base: {formatCurrency(b.baseCost)}</span>
                    </div>
                    <div className="text-slate-300 italic text-[11px]">"{b.quote}"</div>
                    <div className="text-slate-400 text-[11px]">{b.description}</div>
                    <div className="text-emerald-400 font-mono font-bold text-[11px] pt-1 border-t border-slate-800 flex justify-between">
                      <span>1 Unit: +{formatCurrency(unitVps)}/s ({bMult.toFixed(1)}x mult)</span>
                      <span>Total: +{formatCurrency(buildingTotalVps)}/s ({vpsSharePct}%)</span>
                    </div>
                  </div>

                  {/* Clean Detailed Row */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      canAfford
                        ? 'bg-slate-900/90 border-slate-700 hover:border-cyan-500/60 shadow-md'
                        : 'bg-slate-950/60 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="bg-slate-800 p-1.5 rounded-lg border border-slate-700 text-cyan-400 shrink-0">
                        {renderItemArtwork(b)}
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-100 flex items-center gap-1.5">
                          {b.name}
                          {count > 0 && (
                            <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black px-1.5 py-0.1 rounded border border-cyan-500/30">
                              x{count}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-cyan-400 font-semibold font-mono flex items-center gap-2 mt-0.5">
                          <span>⚡ 1 Unit: +{formatCurrency(unitVps)}/s {bMult > 1 && `(${bMult.toFixed(1)}x)`}</span>
                        </div>
                        {count > 0 && (
                          <div className="text-[9px] text-emerald-400 font-mono font-bold">
                            📊 Total: +{formatCurrency(buildingTotalVps)}/s ({vpsSharePct}% {tr('incomeShare')})
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => buyBuilding(b.id)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-lg font-black text-xs flex flex-col items-end transition-all min-w-[85px] ${
                        canAfford
                          ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-95 shadow-sm'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <span>BUY {buyText}</span>
                      <span className="text-[10px] opacity-90 font-mono">
                        {formatCurrency(cost)}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* UPGRADES SECTION */}
      {storeSection === 'upgrades' && (
        <div className="flex flex-col gap-3">
          {/* Native "BUY ALL" Button */}
          <div className="flex justify-between items-center bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
            <div>
              <div className="text-xs font-extrabold text-slate-200">Native "Buy All" Function</div>
              <div className="text-[10px] text-slate-400">Instantly buys all affordable upgrades.</div>
            </div>
            <button
              onClick={buyAllUpgrades}
              className="bg-amber-500 text-slate-950 hover:bg-amber-400 px-3 py-1.5 rounded-lg font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              ⚡ BUY ALL
            </button>
          </div>

          {availableUpgrades.length === 0 ? (
            <div className="text-center py-6 bg-slate-900/40 rounded-xl border border-slate-800/80 text-slate-400 text-xs italic">
              No new available upgrades discovered right now.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {availableUpgrades.map((up) => {
                const canAfford = valuation >= up.cost;
                const targetText = getTargetBadge(up);

                return (
                  <div key={up.id} className="relative group">
                    {/* Mouseover Hover Tooltip Card */}
                    <div className="hidden group-hover:flex flex-col gap-1 absolute bottom-full left-0 right-0 z-50 mb-2 p-3 bg-slate-950/95 backdrop-blur-md border border-amber-500/50 rounded-xl shadow-2xl text-xs pointer-events-none animate-fadeIn">
                      <div className="font-extrabold text-amber-300 flex items-center justify-between">
                        <span>{up.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{formatCurrency(up.cost)}</span>
                      </div>
                      <div className="text-cyan-400 text-[10px] font-mono font-bold">{targetText}</div>
                      <div className="text-slate-300 italic text-[11px]">"{up.quote}"</div>
                      <div className="text-amber-400 font-semibold text-[11px] pt-1 border-t border-slate-800">
                        {up.description}
                      </div>
                    </div>

                    {/* Upgrade Row */}
                    <div
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        canAfford
                          ? 'bg-slate-900/90 border-slate-700 hover:border-amber-500/60 shadow-md'
                          : 'bg-slate-950/60 border-slate-900 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="bg-slate-800 p-2 rounded-lg border border-slate-700 text-amber-400 shrink-0">
                          {renderItemArtwork(up, 'Zap')}
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-slate-100 flex items-center gap-1.5 flex-wrap">
                            <span>{up.name}</span>
                            <span className="bg-amber-500/20 text-amber-300 text-[9px] font-black px-1.5 py-0.2 rounded border border-amber-500/30 font-mono">
                              {targetText}
                            </span>
                          </div>
                          <div className="text-[10px] text-amber-300/90 font-mono font-semibold mt-0.5">
                            {up.description}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => buyUpgrade(up.id)}
                        disabled={!canAfford}
                        className={`px-3 py-1.5 rounded-lg font-black text-xs flex flex-col items-end transition-all min-w-[80px] ${
                          canAfford
                            ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 shadow-sm'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        <span>BUY</span>
                        <span className="text-[10px] font-mono opacity-90">
                          {formatCurrency(up.cost)}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* BOUGHT UPGRADES ACCORDION SECTION */}
          <div className="mt-2 bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden">
            <button
              onClick={() => setShowBoughtUpgrades((prev) => !prev)}
              className="w-full p-3 flex items-center justify-between font-extrabold text-xs text-emerald-400 hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icons.CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{tr('boughtUpgradesTitle')} ({boughtUpgradesObjects.length})</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                {showBoughtUpgrades ? tr('hideBoughtUpgrades') : tr('showBoughtUpgrades')}
              </span>
            </button>

            {showBoughtUpgrades && (
              <div className="p-2 border-t border-slate-800 flex flex-col gap-2 bg-slate-950/60">
                {boughtUpgradesObjects.length === 0 ? (
                  <div className="text-center py-4 text-slate-500 text-xs italic">
                    {tr('noBoughtUpgrades')}
                  </div>
                ) : (
                  boughtUpgradesObjects.map((up) => {
                    const targetText = getTargetBadge(up);
                    return (
                      <div
                        key={up.id}
                        className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                            {renderItemArtwork(up, 'Check')}
                          </div>
                          <div>
                            <div className="font-bold text-slate-200 flex items-center gap-1.5">
                              <span>{up.name}</span>
                              <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold px-1 rounded">
                                {targetText}
                              </span>
                            </div>
                            <div className="text-[10px] text-emerald-400 font-mono">{up.description}</div>
                          </div>
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded border border-emerald-500/40 shrink-0">
                          ✓ BOUGHT
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CORPORATE ACTIONS SECTION (Greenwashing & Layoffs - Progressive Discovery) */}
      {storeSection === 'corporate' && (() => {
        const visibleCorporate = [];
        let foundFirstLocked = false;

        GREENWASHING_LAYOFFS_DATA.forEach((item) => {
          const isBought = boughtGreenwashingLayoffs.includes(item.id);
          const b = BUILDINGS_DATA.find((itemB) => itemB.id === item.buildingId);
          const baseCost = b ? b.baseCost : 15;
          const cost = item.costMult * baseCost;
          const currentCount = buildings[item.buildingId] || 0;
          const isUnlocked = isBought || currentCount >= 1 || totalValuation >= cost * 0.15;

          if (isUnlocked && !foundFirstLocked) {
            visibleCorporate.push({ ...item, isTeaser: false, cost });
          } else if (!foundFirstLocked) {
            visibleCorporate.push({ ...item, isTeaser: true, cost });
            foundFirstLocked = true;
          }
        });

        return (
          <div className="flex flex-col gap-2">
            <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/40 mb-2 text-xs">
              <div className="font-extrabold text-amber-300 flex items-center gap-1.5 mb-1">
                <Icons.ShieldAlert className="w-4 h-4 text-amber-400" />
                Corporate Actions & Greenwashing Protocol
              </div>
              <div className="text-[#EAE7DA]/80">
                Mitigate Burn Rate with Greenwashing (-0.1% burn rate) or trigger AI Mass Layoffs (+20% to +35% engine output)!
              </div>
            </div>

            {visibleCorporate.map((item) => {
              if (item.isTeaser) {
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-950/70 flex items-center justify-between opacity-50 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-slate-600">
                        <Icons.Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-500">
                          ??? Locked Corporate Protocol
                        </div>
                        <div className="text-[11px] text-slate-500 italic mt-0.5">
                          Requires higher valuation or related AI Engine.
                        </div>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 rounded text-[10px] font-black bg-slate-900 text-slate-600 border border-slate-800">
                      LOCKED
                    </div>
                  </div>
                );
              }

              const isBought = boughtGreenwashingLayoffs.includes(item.id);
              const canAfford = valuation >= item.cost && !isBought;

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    isBought
                      ? 'bg-slate-950/40 border-slate-900 opacity-50'
                      : canAfford
                      ? 'bg-slate-900/90 border-amber-500/40 hover:border-amber-400 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg border shrink-0 ${
                      item.type === 'greenwashing' ? 'bg-emerald-950 border-emerald-500/40 text-emerald-400' : 'bg-rose-950 border-rose-500/40 text-rose-400'
                    }`}>
                      {item.type === 'greenwashing' ? <Icons.Recycle className="w-4 h-4" /> : <Icons.UserX className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-slate-100">{item.name}</div>
                      <div className="text-[11px] text-slate-400 italic">"{item.quote}"</div>
                      <div className="text-[10px] text-amber-400 font-mono font-bold mt-0.5">{item.effectDesc}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => buyGreenwashingLayoff(item.id)}
                    disabled={!canAfford || isBought}
                    className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all ${
                      isBought
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : canAfford
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 shadow-sm'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isBought ? 'EXECUTED' : formatCurrency(item.cost)}
                  </button>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* BUZZWORDS DECK SECTION (80 Collectible Cards - Progressive Discovery) */}
      {storeSection === 'buzzwords' && (() => {
        const visibleBuzzwords = [];
        let foundFirstLocked = false;

        BUZZWORDS_DATA.forEach((bw) => {
          const isBought = boughtBuzzwords.includes(bw.id);
          const isUnlocked = isBought || totalValuation >= bw.cost * 0.15;

          if (isUnlocked && !foundFirstLocked) {
            visibleBuzzwords.push({ ...bw, isTeaser: false });
          } else if (!foundFirstLocked) {
            visibleBuzzwords.push({ ...bw, isTeaser: true });
            foundFirstLocked = true;
          }
        });

        return (
          <div className="flex flex-col gap-2">
            <div className="bg-fuchsia-950/40 p-3 rounded-xl border border-fuchsia-500/40 mb-2 text-xs">
              <div className="font-extrabold text-fuchsia-300 flex items-center gap-1.5 mb-1">
                <Icons.Layers className="w-4 h-4 text-fuchsia-400" />
                80 Collectible Buzzword Cards Portfolio
              </div>
              <div className="text-[#EAE7DA]/80">
                Collect all 80 AI Buzzwords (Common +1%, Uncommon +2%, Rare +5%, Legendary +10%) for up to +190% cumulative VPS!
              </div>
              <div className="text-[10px] text-fuchsia-400 font-mono font-bold mt-1">
                Portfolio Collected: {boughtBuzzwords.length} / 80 Cards
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {visibleBuzzwords.map((bw) => {
                if (bw.isTeaser) {
                  return (
                    <div
                      key={bw.id}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-950/70 flex items-center justify-between opacity-50 backdrop-blur-sm sm:col-span-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-slate-600">
                          <Icons.Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-500">
                            ??? Hidden Buzzword Card
                          </div>
                          <div className="text-[11px] text-slate-500 italic mt-0.5">
                            Requires higher valuation to unlock next buzzword.
                          </div>
                        </div>
                      </div>
                      <div className="px-2.5 py-1 rounded text-[10px] font-black bg-slate-900 text-slate-600 border border-slate-800">
                        LOCKED
                      </div>
                    </div>
                  );
                }

                const isBought = boughtBuzzwords.includes(bw.id);
                const canAfford = valuation >= bw.cost && !isBought;

                let rarityColor = 'border-slate-700 text-slate-300';
                if (bw.rarity === 'Legendary') rarityColor = 'border-amber-400 text-amber-300 bg-amber-950/30';
                else if (bw.rarity === 'Rare') rarityColor = 'border-purple-400 text-purple-300 bg-purple-950/30';
                else if (bw.rarity === 'Uncommon') rarityColor = 'border-cyan-400 text-cyan-300 bg-cyan-950/30';

                return (
                  <div
                    key={bw.id}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${rarityColor} ${
                      isBought
                        ? 'opacity-50 grayscale'
                        : canAfford
                        ? 'hover:scale-[1.02] shadow-md'
                        : 'opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="truncate">{bw.name}</span>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {bw.rarity}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 font-bold mb-2">
                      +{Math.round(bw.bonus * 100)}% Global VPS
                    </div>

                    <button
                      onClick={() => buyBuzzword(bw.id)}
                      disabled={!canAfford || isBought}
                      className={`w-full py-1 rounded font-black text-xs transition-all ${
                        isBought
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : canAfford
                          ? 'bg-fuchsia-500 text-slate-950 hover:bg-fuchsia-400 active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isBought ? 'COLLECTED' : formatCurrency(bw.cost)}
                    </button>
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
