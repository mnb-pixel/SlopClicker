import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { BUILDINGS_DATA } from '../../data/buildingsData';
import { UPGRADES_DATA, getAvailableUpgrades } from '../../data/upgradesData';
import { GREENWASHING_LAYOFFS_DATA } from '../../data/greenwashingLayoffsData';
import { formatCurrency, getBuildingCost, getBuildingBulkCost, getMaxAffordableBuildings } from '../../utils/formatters';
import { BuzzwordAlbum } from '../BuzzwordAlbum';

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
  buyBoosterPack,
  boughtGreenwashingLayoffs = [],
  buyGreenwashingLayoff,
  t,
}) {
  const [storeSection, setStoreSection] = useState('engines'); // 'engines' | 'upgrades' | 'corporate' | 'buzzwords'
  const [showBoughtUpgrades, setShowBoughtUpgrades] = useState(false);
  const [hoveredUpgradeId, setHoveredUpgradeId] = useState(null);
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
          alt="AI Engine Meme"
          className="w-7 h-7 rounded-lg object-cover border border-cyan-400/60 shadow-md"
        />
      );
    }
    const iconColor = item?.type === 'building' ? 'text-cyan-400' : item?.type === 'click' ? 'text-amber-400' : item?.type === 'syndicate' ? 'text-fuchsia-400' : item?.type === 'global' ? 'text-emerald-400' : 'text-cyan-400';
    return renderIcon(item?.icon || defaultIcon, `w-4 h-4 ${iconColor}`);
  };

  const buildingName = (buildingId) => tr(`building_${buildingId}_name`);

  // Target Badge Resolver helper
  const getTargetBadge = (up) => {
    if (!up) return '';
    if (up.type === 'building') {
      return `🎯 ${buildingName(up.buildingId)}`;
    }
    if (up.type === 'click') return `🎯 ${tr('affectsClick')}`;
    if (up.type === 'syndicate') {
      return up.req?.buildingId ? `🎯 ${buildingName(up.req.buildingId)}` : `🎯 ${tr('affectsSyndicate')}`;
    }
    if (up.type === 'global') return `🎯 ${tr('affectsGlobal')}`;
    return '🎯 Global';
  };

  // Für die 260 Gebäude-Upgrades (nur type:'building') gibt es Name/Flavor über t(),
  // description wird dynamisch aus Gebäude-Name + Multiplikator gebaut.
  const upgradeName = (up) => (up.type === 'building' ? tr(`upgrade_${up.id}_name`) : up.name);
  const upgradeQuote = (up) => (up.type === 'building' ? tr(`upgrade_${up.id}_quote`) : up.quote);
  const upgradeDescription = (up) => {
    if (up.type !== 'building') return up.description;
    return `${buildingName(up.buildingId)} produce ${up.effect.value}x more Valuation!`;
  };

  // Für die 100 Greenwashing/Layoff-Aktionen: Name/Flavor über t(), effectDesc dynamisch.
  const gwName = (item) => tr(`gw_${item.id}_name`);
  const gwQuote = (item) => tr(`gw_${item.id}_quote`);
  const gwEffectDesc = (item) => {
    if (item.type === 'greenwashing' && item.tier === 1) return 'Burn Rate -0.1%';
    if (item.type === 'greenwashing' && item.tier === 2) return 'Engine VPS +10%';
    if (item.type === 'greenwashing' && item.tier === 3) return 'Cosmetic only (no numeric effect)';
    if (item.type === 'layoff' && item.tier === 1) return 'Engine VPS +20%';
    if (item.type === 'layoff' && item.tier === 2) return 'Engine VPS +15%';
    return '';
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
        if (gw.type === 'greenwashing' && gw.tier === 2) bMult *= 1.10;
        if (gw.type === 'layoff' && gw.tier === 1) bMult *= 1.20;
        if (gw.type === 'layoff' && gw.tier === 2) bMult *= 1.15;
      }
    });
    return acc + count * b.baseCps * bMult;
  }, 0);

  // Progressive Building Visibility: a building's tile only shows once the PREVIOUS
  // building is actually owned (no shortcut via valuation alone).
  const visibleBuildings = [];
  let foundFirstLocked = false;

  BUILDINGS_DATA.forEach((b, idx) => {
    const count = buildings[b.id] || 0;
    const prevBuilding = idx > 0 ? BUILDINGS_DATA[idx - 1] : null;
    const prevCount = prevBuilding ? (buildings[prevBuilding.id] || 0) : 0;

    const isUnlocked = idx === 0 || count > 0 || prevCount >= 1;

    if (isUnlocked) {
      visibleBuildings.push(b);
    } else if (!foundFirstLocked) {
      visibleBuildings.push({ id: `locked_teaser_${b.id}`, isTeaser: true });
      foundFirstLocked = true;
    }
  });

  // Upgrades List Filtering (ONLY for engines the player ALREADY OWNS!) — shared with
  // buyAllUpgrades() in useGameStore.js so "BUY ALL" can never buy what isn't shown here.
  const availableUpgrades = getAvailableUpgrades(buildings, boughtUpgrades, valuation, totalValuation);

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
                          Requires owning the previous AI Engine tier.
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
                  if (gw.type === 'greenwashing' && gw.tier === 2) bMult *= 1.10;
                  if (gw.type === 'layoff' && gw.tier === 1) bMult *= 1.20;
                  if (gw.type === 'layoff' && gw.tier === 2) bMult *= 1.15;
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
                      <span>{buildingName(b.id)}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Base: {formatCurrency(b.baseCost)}</span>
                    </div>
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
                          {buildingName(b.id)}
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

      {/* UPGRADES SECTION (Kachel Grid / Tiles View) */}
      {storeSection === 'upgrades' && (() => {
        const activeUpgrade = availableUpgrades.find((u) => u.id === hoveredUpgradeId) || availableUpgrades[0];
        const canAffordActive = activeUpgrade && valuation >= activeUpgrade.cost;

        return (
          <div className="flex flex-col gap-3">
            {/* Header + Buy All */}
            <div className="flex justify-between items-center bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <div>
                <div className="text-xs font-extrabold text-slate-200 flex items-center gap-1.5">
                  <Icons.Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Verfügbare Upgrades ({availableUpgrades.length})</span>
                </div>
                <div className="text-[10px] text-slate-400">Kachel antippen für Details, dann unten "KAUFEN" drücken.</div>
              </div>
              <button
                onClick={buyAllUpgrades}
                disabled={availableUpgrades.filter((u) => valuation >= u.cost).length === 0}
                className="bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all shrink-0"
              >
                ⚡ BUY ALL
              </button>
            </div>

            {/* UNTRUNCATED UPGRADE INSPECTOR CARD (Fixed in document flow - Never cut off!) */}
            {activeUpgrade && (
              <div className="bg-slate-950/95 border-2 border-amber-400/80 rounded-xl p-3 shadow-xl flex flex-col gap-1.5 text-xs text-slate-100 animate-fadeIn">
                <div className="flex items-center justify-between font-extrabold text-amber-300 border-b border-slate-800 pb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1 rounded bg-slate-900 border border-slate-800 shrink-0">
                      {renderItemArtwork(activeUpgrade, 'Zap')}
                    </div>
                    <span className="truncate">{upgradeName(activeUpgrade)}</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-black text-sm shrink-0 ml-2">
                    {formatCurrency(activeUpgrade.cost)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-cyan-300 font-bold">{getTargetBadge(activeUpgrade)}</span>
                  <span className={canAffordActive ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {canAffordActive ? '✓ Bezahlbar' : '🔒 Nicht genug Valuation'}
                  </span>
                </div>

                {upgradeQuote(activeUpgrade) && (
                  <div className="text-slate-300 italic text-[11px] bg-slate-900/60 p-1.5 rounded border border-slate-800/80">
                    "{upgradeQuote(activeUpgrade)}"
                  </div>
                )}

                <div className="text-amber-300 font-bold text-[11px] pt-1 flex justify-between items-center gap-2">
                  <span>⚡ {upgradeDescription(activeUpgrade)}</span>
                  <button
                    onClick={() => buyUpgrade(activeUpgrade.id)}
                    disabled={!canAffordActive}
                    className={`px-3 py-1 rounded-lg font-black text-xs transition-all shrink-0 ${
                      canAffordActive
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 shadow-sm'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    KAUFEN
                  </button>
                </div>
              </div>
            )}

            {availableUpgrades.length === 0 ? (
              <div className="text-center py-8 bg-slate-900/40 rounded-xl border border-slate-800/80 text-slate-400 text-xs italic">
                Keine neuen Upgrades freigeschaltet. Kaufe mehr KI-Engines für neue Upgrades!
              </div>
            ) : (
              /* Tile Grid (Kacheln) */
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {availableUpgrades.map((up) => {
                  const canAfford = valuation >= up.cost;
                  const isHovered = activeUpgrade?.id === up.id;

                  return (
                    <div
                      key={up.id}
                      onMouseEnter={() => setHoveredUpgradeId(up.id)}
                      onClick={() => setHoveredUpgradeId(up.id)}
                      className={`w-full aspect-square rounded-xl border flex flex-col items-center justify-between p-1.5 cursor-pointer transition-all ${
                        isHovered
                          ? 'ring-2 ring-amber-400 border-amber-300 bg-amber-950/40 scale-105 shadow-lg shadow-amber-500/20'
                          : canAfford
                          ? 'bg-slate-900 border-amber-500/60 text-amber-400 hover:border-amber-300 hover:scale-105 active:scale-95 shadow-md'
                          : 'bg-slate-950/80 border-slate-800/80 text-slate-600 opacity-50'
                      }`}
                    >
                      <div className="flex-1 flex items-center justify-center">
                        {renderItemArtwork(up, 'Zap')}
                      </div>
                      <div className={`text-[9px] font-mono font-bold truncate w-full text-center ${
                        canAfford ? 'text-amber-300' : 'text-slate-500'
                      }`}>
                        {formatCurrency(up.cost)}
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
                <div className="p-2 border-t border-slate-800 bg-slate-950/60">
                  {boughtUpgradesObjects.length === 0 ? (
                    <div className="text-center py-4 text-slate-500 text-xs italic">
                      {tr('noBoughtUpgrades')}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                      {boughtUpgradesObjects.map((up) => {
                        const targetText = getTargetBadge(up);
                        return (
                          <div
                            key={up.id}
                            onMouseEnter={() => setHoveredUpgradeId(up.id)}
                            className="w-full aspect-square rounded-xl bg-emerald-950/30 border border-emerald-500/40 p-1.5 flex flex-col items-center justify-center text-emerald-400 opacity-90 hover:opacity-100 hover:border-emerald-400 cursor-pointer transition-all"
                            title={`${upgradeName(up)}: ${upgradeDescription(up)}`}
                          >
                            {renderItemArtwork(up, 'Check')}
                            <span className="text-[9px] font-mono font-bold text-emerald-400/80 mt-0.5">✓</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* CORPORATE ACTIONS SECTION (Greenwashing & Layoffs - only for engines you own) */}
      {storeSection === 'corporate' && (() => {
        const visibleCorporate = [];
        let foundFirstLocked = false;

        GREENWASHING_LAYOFFS_DATA.forEach((item) => {
          const isBought = boughtGreenwashingLayoffs.includes(item.id);
          const b = BUILDINGS_DATA.find((itemB) => itemB.id === item.buildingId);
          const baseCost = b ? b.baseCost : 15;
          const cost = item.costMult * baseCost;
          const currentCount = buildings[item.buildingId] || 0;
          const isUnlocked = isBought || currentCount >= 1;

          if (isUnlocked) {
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
                          Requires owning the related AI Engine.
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
                      {renderIcon(item.icon || (item.type === 'greenwashing' ? 'Recycle' : 'UserX'), 'w-4 h-4')}
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-slate-100">{gwName(item)}</div>
                      <div className="text-[11px] text-slate-400 italic">"{gwQuote(item)}"</div>
                      <div className="text-[10px] text-amber-400 font-mono font-bold mt-0.5">{gwEffectDesc(item)}</div>
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

      {/* BUZZWORDS SAMMELALBUM SECTION */}
      {storeSection === 'buzzwords' && (
        <BuzzwordAlbum
          valuation={valuation}
          boughtBuzzwords={boughtBuzzwords}
          buyBuzzword={buyBuzzword}
          buyBoosterPack={buyBoosterPack}
          t={t}
        />
      )}
    </div>
  );
}
