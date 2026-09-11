import React, { useState, useEffect } from 'react';
import { Lock, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getIcon } from '../../utils/iconMap';
import { BUILDINGS_DATA } from '../../data/buildingsData';
import { getBuildingVisibility } from '../../utils/buildingUnlock';
import { UPGRADES_DATA, getAvailableUpgrades } from '../../data/upgradesData';
import { GREENWASHING_LAYOFFS_DATA, getCorporateActionCost, getAvailableCorporateActions } from '../../data/greenwashingLayoffsData';
import { formatCurrency, formatNumber, getBuildingCost, getBuildingBulkCost, getMaxAffordableBuildings } from '../../utils/formatters';
import { buildingName, upgradeName, upgradeQuote, upgradeDescription, upgradeTargetBadge, gwName, gwQuote, gwEffectDesc } from '../../utils/storeCopy';
import { BuzzwordAlbum } from '../BuzzwordAlbum';
import { useSkin } from '../skin';

export function StoreTab({
  valuation,
  buildings,
  buyBuilding,
  buyMode,
  setBuyMode,
  boughtUpgrades,
  unlockedUpgrades = [],
  buyUpgrade,
  buyAllUpgrades,
  totalValuation,
  boughtBuzzwords = [],
  buyBoosterPack,
  addCardToAlbum,
  boughtGreenwashingLayoffs = [],
  buyGreenwashingLayoff,
  stickyTopPx = 0,
  // Startabschnitt von außen: aus der Sammlung (StatsTab) führt ein Knopf direkt in den
  // Booster-Kiosk. Danach steuert der Nutzer die Reiter wieder selbst - deshalb nur ein
  // Startwert und kein dauerhaft kontrollierter Zustand. Ein Wechsel des Props öffnet
  // den Abschnitt erneut (siehe useEffect).
  initialSection = 'engines',
  t,
}) {
  const [storeSection, setStoreSection] = useState(initialSection); // 'engines' | 'upgrades' | 'corporate' | 'buzzwords'
  const [showBoughtUpgrades, setShowBoughtUpgrades] = useState(false);
  const [showBoughtCorporate, setShowBoughtCorporate] = useState(false);
  const [hoveredUpgradeId, setHoveredUpgradeId] = useState(null);
  const [hoveredBoughtUpgradeId, setHoveredBoughtUpgradeId] = useState(null);
  const tr = t || ((k) => k);
  // Zwei Looks, ein Markup: 'dark' ist die Tab-Ansicht unter /play, 'game' der
  // Insel-Stil der 3D-Shell. cx(dunkel, spiel) - siehe src/components/skin.js.
  const { isGame, cx } = useSkin();

  // Springt die Shell mit einem neuen Startabschnitt herein (Sammlung -> Kiosk), muss
  // der Reiter mitziehen - der useState-Startwert allein greift nur beim ersten Aufbau.
  useEffect(() => {
    setStoreSection(initialSection);
  }, [initialSection]);

  // Dynamic Icon Resolver helper
  const renderIcon = (iconName, className = 'w-4 h-4') => {
    const IconComp = getIcon(iconName, 'Zap');
    return <IconComp className={className} />;
  };

  // Dynamic Meme Artwork Thumbnail Resolver helper
  const renderItemArtwork = (item, defaultIcon = 'Zap') => {
    if (item && item.image) {
      return (
        <img
          src={item.image}
          alt={tr('subEngines')}
          className={cx(
            'w-7 h-7 rounded-lg object-cover border border-cyan-400/60 shadow-md',
            'gs-thumb'
          )}
        />
      );
    }
    const iconColor = item?.type === 'building' ? 'text-cyan-400' : item?.type === 'click' ? 'text-amber-400' : item?.type === 'syndicate' ? 'text-fuchsia-400' : item?.type === 'global' ? 'text-emerald-400' : 'text-cyan-400';
    return renderIcon(item?.icon || defaultIcon, `w-4 h-4 ${iconColor}`);
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
  // building is actually owned (no shortcut via valuation alone). Die Regel selbst liegt
  // in utils/buildingUnlock.js, weil die 3D-Insel (/voxel) dieselbe braucht.
  const { unlockedIds, teaserId } = getBuildingVisibility(buildings);
  const visibleBuildings = [];

  BUILDINGS_DATA.forEach((b) => {
    if (unlockedIds.has(b.id)) {
      visibleBuildings.push(b);
    } else if (b.id === teaserId) {
      visibleBuildings.push({ id: `locked_teaser_${b.id}`, isTeaser: true });
    }
  });

  // Upgrades List Filtering (ONLY for engines the player ALREADY OWNS!)
  const availableUpgrades = getAvailableUpgrades(buildings, boughtUpgrades, valuation, totalValuation);

  // Corporate Actions List Filtering (gleiche "lowest unbought tier pro Gebäude" Regel wie
  // bei Upgrades) - oben berechnet, damit sowohl der Sub-Tab-Zähler als auch die Liste
  // selbst dieselbe Quelle nutzen.
  const availableCorporate = getAvailableCorporateActions(buildings, boughtGreenwashingLayoffs);

  const boughtUpgradesObjects = boughtUpgrades
    .map((upId) => UPGRADES_DATA.find((u) => u.id === upId))
    .filter(Boolean);

  const boughtCorporateObjects = boughtGreenwashingLayoffs
    .map((itemId) => GREENWASHING_LAYOFFS_DATA.find((g) => g.id === itemId))
    .filter(Boolean);

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      {/* 4 Store Sub-Category Selector. Sticky statt im normalen Fluss: bei langen Listen
          (v.a. Upgrades/Corporate mit hunderten Einträgen) scrollte die Leiste bisher weg,
          man musste zum Wechseln immer erst zurück nach oben. top kommt von außen, weil
          "darunter andocken" je nach Layout etwas anderes bedeutet - auf Mobile relativ zum
          ebenfalls sticky App-Header (dessen Höhe variiert, z.B. durch das SEC-Theme-Banner
          oder umbrechende Startup-Namen), auf Desktop relativ zur eigenen Scroll-Spalte (dort 0). */}
      <div
        className={cx(
          'sticky z-10 grid grid-cols-4 gap-1 mb-4 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold',
          'sticky z-10 mb-4 gs-segment gs-segment--grid'
        )}
        style={{ top: stickyTopPx }}
      >
        {/* Vier Unterkategorien, vier Bedeutungsfarben. Im Spiel-Skin sind das die
            gedeckten Insel-Töne (teal/gold/gras/pflaume) statt Neon auf Schwarz. */}
        {[
          { id: 'engines', label: tr('subEngines'), dark: 'bg-cyan-500', acc: 'gs-acc-teal' },
          { id: 'upgrades', label: `${tr('subUpgrades')} (${availableUpgrades.length})`, dark: 'bg-amber-500', acc: 'gs-acc-gold' },
          { id: 'corporate', label: `${tr('subCorporate')} (${availableCorporate.length})`, dark: 'bg-emerald-500', acc: 'gs-acc-grass' },
          { id: 'buzzwords', label: tr('subBuzzwords'), dark: 'bg-fuchsia-500', acc: 'gs-acc-plum' },
        ].map((sec) => {
          const active = storeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setStoreSection(sec.id)}
              className={cx(
                `py-1.5 rounded-lg transition-all ${active ? `${sec.dark} text-slate-950 shadow-md` : 'text-slate-400 hover:text-slate-200'}`,
                `gs-seg-btn ${sec.acc} ${active ? 'is-active' : ''}`
              )}
            >
              {sec.label}
            </button>
          );
        })}
      </div>

      {/* AI ENGINES SECTION */}
      {storeSection === 'engines' && (
        <div>
          {/* Buy Mode Selector Bar */}
          <div className={cx(
            'flex items-center justify-between bg-slate-900/90 p-2 rounded-xl border border-slate-800 mb-3',
            'flex items-center justify-between gap-2 mb-3 gs-panel gs-panel--sunk'
          )}>
            <span className={cx('text-xs font-bold text-slate-400 uppercase tracking-wider', 'gs-title')}>
              {tr('buyModeLabel')}
            </span>
            <div className={cx('flex gap-1', 'flex gap-1 shrink-0')}>
              {['1', '10', '100', 'MAX'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setBuyMode(mode)}
                  className={cx(
                    `px-2.5 py-1 text-xs font-black rounded-lg transition-all ${
                      buyMode === mode
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`,
                    `gs-seg-btn gs-seg-btn--auto gs-acc-teal ${buyMode === mode ? 'is-active' : ''}`
                  )}
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
                    className={cx(
                      'p-2.5 rounded-xl border border-slate-800 bg-slate-950/70 flex items-center justify-between opacity-50 backdrop-blur-sm',
                      'gs-row gs-row--locked'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={cx('bg-slate-900 p-2 rounded-lg border border-slate-800 text-slate-600', 'gs-iconbox')}>
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={cx('font-bold text-xs text-slate-500', 'gs-title')}>
                          {tr('lockedEngineTier')}
                        </div>
                        <div className={cx('text-[11px] text-slate-500 italic mt-0.5', 'gs-quote mt-0.5')}>
                          {tr('lockedEngineTierDesc')}
                        </div>
                      </div>
                    </div>
                    <div className={cx(
                      'px-2.5 py-1 rounded text-[10px] font-black bg-slate-900 text-slate-600 border border-slate-800',
                      'gs-chip'
                    )}>
                      {tr('locked')}
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
                  <div className={cx(
                    'hidden group-hover:flex flex-col gap-1 absolute bottom-full left-0 right-0 z-50 mb-2 p-3 bg-slate-950/95 backdrop-blur-md border border-cyan-500/50 rounded-xl shadow-2xl text-xs pointer-events-none animate-fadeIn',
                    'hidden group-hover:flex absolute bottom-full left-0 right-0 z-50 mb-2 pointer-events-none animate-fadeIn gs-panel gs-acc-teal gs-tip'
                  )}>
                    <div className={cx(
                      'font-extrabold text-cyan-300 flex items-center justify-between',
                      'flex items-center justify-between gap-2 gs-title'
                    )}>
                      <span>{buildingName(b.id, tr)}</span>
                      <span className={cx('text-[10px] text-slate-400 font-mono', 'gs-mono gs-ink-soft')}>Base: {formatCurrency(b.baseCost)}</span>
                    </div>
                    <div className={cx(
                      'text-emerald-400 font-mono font-bold text-[11px] pt-1 border-t border-slate-800 flex justify-between',
                      'gs-mono font-bold gs-ink-grass pt-1 gs-hr-top flex justify-between gap-2'
                    )}>
                      <span>1 Unit: +{formatCurrency(unitVps)}/s ({bMult.toFixed(1)}x mult)</span>
                      <span>Total: +{formatCurrency(buildingTotalVps)}/s ({vpsSharePct}%)</span>
                    </div>
                  </div>

                  {/* Clean Detailed Row */}
                  <div
                    className={cx(
                      `p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        canAfford
                          ? 'bg-slate-900/90 border-slate-700 hover:border-cyan-500/60 shadow-md'
                          : 'bg-slate-950/60 border-slate-900 opacity-60'
                      }`,
                      `gs-row gs-acc-teal ${canAfford ? 'is-affordable' : 'is-broke'}`
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={cx('bg-slate-800 p-1.5 rounded-lg border border-slate-700 text-cyan-400 shrink-0', 'gs-iconbox')}>
                        {renderItemArtwork(b)}
                      </div>
                      <div className={cx('', 'min-w-0')}>
                        <div className={cx('font-extrabold text-xs text-slate-100 flex items-center gap-1.5', 'gs-title flex items-center gap-1.5')}>
                          {buildingName(b.id, tr)}
                          {count > 0 && (
                            <span className={cx(
                              'bg-cyan-500/20 text-cyan-300 text-[10px] font-black px-1.5 py-0.1 rounded border border-cyan-500/30',
                              'gs-chip gs-acc-teal'
                            )}>
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
                      className={cx(
                        `px-3 py-1.5 rounded-lg font-black text-xs flex flex-col items-end transition-all min-w-[85px] ${
                          canAfford
                            ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-95 shadow-sm'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`,
                        `gs-btn gs-price ${canAfford ? 'gs-btn--buy' : 'is-disabled'}`
                      )}
                    >
                      <span>{tr('buyLabel')} {buyText}</span>
                      <span className={cx('text-[10px] opacity-90 font-mono', 'gs-price__amount')}>
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
        // Aus ALLEN Upgrades suchen (nicht nur den verfügbaren): sobald man kauft,
        // verschwindet das Upgrade aus availableUpgrades - würde die Karte sonst sofort
        // auf ein anderes Upgrade springen lassen oder ganz verschwinden.
        const activeUpgrade = UPGRADES_DATA.find((u) => u.id === hoveredUpgradeId) || availableUpgrades[0];
        const isActiveBought = activeUpgrade && boughtUpgrades.includes(activeUpgrade.id);
        const canAffordActive = activeUpgrade && !isActiveBought && valuation >= activeUpgrade.cost;

        return (
          <div className="flex flex-col gap-3">
            {/* Header + Buy All */}
            <div className={cx(
              'flex justify-between items-center bg-slate-900/90 p-2.5 rounded-xl border border-slate-800',
              'flex justify-between items-center gap-2 gs-panel gs-panel--sunk'
            )}>
              <div className="min-w-0">
                <div className={cx('text-xs font-extrabold text-slate-200 flex items-center gap-1.5', 'gs-title flex items-center gap-1.5')}>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{tr('availableUpgradesLabel')} ({availableUpgrades.length})</span>
                </div>
                <div className={cx('text-[10px] text-slate-400', 'gs-sub')}>{tr('tileTapHint')}</div>
              </div>
              <button
                onClick={buyAllUpgrades}
                disabled={availableUpgrades.filter((u) => valuation >= u.cost).length === 0}
                className={cx(
                  'bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all shrink-0',
                  'gs-btn gs-btn--gold shrink-0'
                )}
              >
                ⚡ {tr('buyAllLabel')}
              </button>
            </div>

            {/* UNTRUNCATED UPGRADE INSPECTOR CARD (Fixed in document flow - Never cut off!) */}
            {activeUpgrade && (
              <div className={cx(
                'bg-slate-950/95 border-2 border-amber-400/80 rounded-xl p-3 shadow-xl flex flex-col gap-1.5 text-xs text-slate-100 animate-fadeIn',
                'gs-panel gs-acc-gold flex flex-col gap-1.5 text-xs animate-fadeIn'
              )}>
                <div className={cx(
                  'flex items-center justify-between font-extrabold text-amber-300 border-b border-slate-800 pb-1',
                  'flex items-center justify-between gap-2 pb-1 border-b-2 gs-title'
                )} style={isGame ? { borderColor: 'var(--game-line)' } : undefined}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={cx('p-1 rounded bg-slate-900 border border-slate-800 shrink-0', 'gs-iconbox')}>
                      {renderItemArtwork(activeUpgrade, 'Zap')}
                    </div>
                    <span className="truncate">{upgradeName(activeUpgrade, tr)}</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-black text-sm shrink-0 ml-2">
                    {formatCurrency(activeUpgrade.cost)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-cyan-300 font-bold">{upgradeTargetBadge(activeUpgrade, tr)}</span>
                  <span className={isActiveBought ? 'text-emerald-400 font-bold' : canAffordActive ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {isActiveBought ? `✓ ${tr('boughtLabel')}` : canAffordActive ? `✓ ${tr('affordableLabel')}` : `🔒 ${tr('notEnoughValuation')}`}
                  </span>
                </div>

                {upgradeQuote(activeUpgrade, tr) && (
                  <div className={cx(
                    'text-slate-300 italic text-[11px] bg-slate-900/60 p-1.5 rounded border border-slate-800/80',
                    'gs-quote gs-panel gs-panel--sunk gs-panel--flat p-1.5'
                  )}>
                    "{upgradeQuote(activeUpgrade, tr)}"
                  </div>
                )}

                <div className="text-amber-300 font-bold text-[11px] pt-1 flex justify-between items-center gap-2">
                  <span>⚡ {upgradeDescription(activeUpgrade, tr)}</span>
                  {isActiveBought ? (
                    <span className="px-3 py-1 rounded-lg font-black text-xs shrink-0 bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {tr('boughtLabel')}
                    </span>
                  ) : (
                  <button
                    onClick={() => buyUpgrade(activeUpgrade.id)}
                    disabled={!canAffordActive}
                    className={cx(
                      `px-3 py-1 rounded-lg font-black text-xs transition-all shrink-0 ${
                        canAffordActive
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 shadow-sm'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`,
                      `gs-btn shrink-0 ${canAffordActive ? 'gs-btn--gold' : 'is-disabled'}`
                    )}
                  >
                    {tr('buyActionLabel')}
                  </button>
                  )}
                </div>
              </div>
            )}

            {availableUpgrades.length === 0 ? (
              <div className={cx(
                'text-center py-8 bg-slate-900/40 rounded-xl border border-slate-800/80 text-slate-400 text-xs italic',
                'text-center py-8 gs-panel gs-panel--sunk gs-panel--flat gs-quote'
              )}>
                {tr('noUpgradesAvailable')}
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
                      className={cx(
                        `w-full aspect-square rounded-xl border flex flex-col items-center justify-between p-1.5 cursor-pointer transition-all ${
                          isHovered
                            ? 'ring-2 ring-amber-400 border-amber-300 bg-amber-950/40 scale-105 shadow-lg shadow-amber-500/20'
                            : canAfford
                            ? 'bg-slate-900 border-amber-500/60 text-amber-400 hover:border-amber-300 hover:scale-105 active:scale-95 shadow-md'
                            : 'bg-slate-950/80 border-slate-800/80 text-slate-600 opacity-50'
                        }`,
                        `gs-card gs-acc-gold w-full aspect-square items-center justify-between cursor-pointer ${
                          isHovered ? 'is-selected' : canAfford ? '' : 'gs-card--locked'
                        }`
                      )}
                    >
                      <div className="flex-1 flex items-center justify-center">
                        {renderItemArtwork(up, 'Zap')}
                      </div>
                      <div className={cx(
                        `text-[9px] font-mono font-bold truncate w-full text-center ${
                          canAfford ? 'text-amber-300' : 'text-slate-500'
                        }`,
                        'gs-card__num truncate w-full text-center'
                      )}>
                        {formatCurrency(up.cost)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* BOUGHT UPGRADES ACCORDION SECTION */}
            <div className={cx(
              'mt-2 bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden',
              'mt-2 gs-panel gs-panel--sunk overflow-hidden p-0'
            )}>
              <button
                onClick={() => setShowBoughtUpgrades((prev) => !prev)}
                className={cx(
                  'w-full p-3 flex items-center justify-between font-extrabold text-xs text-emerald-400 hover:bg-slate-800/60 transition-colors',
                  'w-full p-3 flex items-center justify-between gs-title gs-acc-grass'
                )}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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
                    <>
                      {/* Fixe Spaltenzahl (statt responsive sm:/md:), damit sich Zeilen eindeutig
                          bestimmen lassen - der Inspector wird direkt über der Zeile mit der
                          angeklickten Kachel eingefügt, nicht fix oben an der Sektion. */}
                      {(() => {
                        const BOUGHT_COLS = 4;
                        const boughtRows = [];
                        for (let i = 0; i < boughtUpgradesObjects.length; i += BOUGHT_COLS) {
                          boughtRows.push(boughtUpgradesObjects.slice(i, i + BOUGHT_COLS));
                        }

                        return boughtRows.map((row, rowIdx) => {
                          const activeItem = row.find((u) => u.id === hoveredBoughtUpgradeId);

                          return (
                            <div key={rowIdx} className="flex flex-col gap-2 mb-2">
                              {activeItem && (
                                <div className="bg-slate-950/95 border-2 border-emerald-400/80 rounded-xl p-3 shadow-xl flex flex-col gap-1.5 text-xs text-slate-100 animate-fadeIn">
                                  <div className="flex items-center justify-between font-extrabold text-emerald-300 border-b border-slate-800 pb-1">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="p-1 rounded bg-slate-900 border border-slate-800 shrink-0">
                                        {renderItemArtwork(activeItem, 'Check')}
                                      </div>
                                      <span className="truncate">{upgradeName(activeItem, tr)}</span>
                                    </div>
                                    <span className="flex items-center gap-1 text-emerald-400 font-black text-[10px] shrink-0 ml-2">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> {tr('boughtLabel')}
                                    </span>
                                  </div>

                                  <div className="text-[10px] font-mono text-cyan-300 font-bold">
                                    {upgradeTargetBadge(activeItem, tr)}
                                  </div>

                                  {upgradeQuote(activeItem, tr) && (
                                    <div className="text-slate-300 italic text-[11px] bg-slate-900/60 p-1.5 rounded border border-slate-800/80">
                                      "{upgradeQuote(activeItem, tr)}"
                                    </div>
                                  )}

                                  <div className="text-emerald-300 font-bold text-[11px] pt-1">
                                    ⚡ {upgradeDescription(activeItem, tr)}
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-4 gap-2">
                                {row.map((up) => (
                                  <div
                                    key={up.id}
                                    onMouseEnter={() => setHoveredBoughtUpgradeId(up.id)}
                                    onClick={() => setHoveredBoughtUpgradeId(up.id)}
                                    className={`w-full aspect-square rounded-xl bg-emerald-950/30 border p-1.5 flex flex-col items-center justify-center text-emerald-400 opacity-90 hover:opacity-100 cursor-pointer transition-all ${
                                      hoveredBoughtUpgradeId === up.id
                                        ? 'ring-2 ring-emerald-400 border-emerald-300 scale-105 shadow-lg shadow-emerald-500/20'
                                        : 'border-emerald-500/40 hover:border-emerald-400'
                                    }`}
                                    title={`${upgradeName(up, tr)}: ${upgradeDescription(up, tr)}`}
                                  >
                                    {renderItemArtwork(up, 'Check')}
                                    <span className="text-[9px] font-mono font-bold text-emerald-400/80 mt-0.5">✓</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* CORPORATE ACTIONS SECTION (Greenwashing & Layoffs - Strict Owned Engines & Progressive Tiers) */}
      {storeSection === 'corporate' && (
        <div className="flex flex-col gap-2">
          <div className={cx(
            'bg-amber-950/40 p-3 rounded-xl border border-amber-500/40 mb-2 text-xs',
            'mb-2 gs-section gs-acc-gold'
          )}>
            <div className={cx('font-extrabold text-amber-300 flex items-center gap-1.5 mb-1', 'gs-title gs-acc-gold flex items-center gap-1.5 mb-1')}>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              {tr('corporateTitle')}
            </div>
            <div className={cx('text-[#EAE7DA]/80', 'gs-sub')}>
              {tr('corporateDesc')}
            </div>
          </div>

          {availableCorporate.length === 0 ? (
            <div className="flex flex-col gap-2">
              <div className={cx(
                'text-center py-4 bg-slate-900/40 rounded-xl border border-slate-800/80 text-slate-400 text-xs italic',
                'text-center py-4 gs-panel gs-panel--sunk gs-panel--flat gs-quote'
              )}>
                {tr('noCorporateAvailable')}
              </div>
              {/* Teaser for next locked corporate protocol - gleicher stiller "gesperrt" Look wie bei Engines */}
              {BUILDINGS_DATA.filter((b) => (buildings[b.id] || 0) < 1).slice(0, 2).map((b) => (
                <div
                  key={`teaser_${b.id}`}
                  className={cx(
                    'p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 flex items-center justify-between opacity-60 backdrop-blur-sm',
                    'gs-row gs-row--locked'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cx('p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-600', 'gs-iconbox')}>
                      <Lock className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <div className={cx('font-extrabold text-xs text-slate-400', 'gs-title')}>{tr('lockedCorporate')} ({buildingName(b.id, tr)})</div>
                      <div className={cx('text-[11px] text-slate-500 italic mt-0.5', 'gs-quote mt-0.5')}>
                        {tr('lockedCorporateDesc')}
                      </div>
                    </div>
                  </div>
                  <div className={cx(
                    'px-2.5 py-1 rounded text-[10px] font-black bg-slate-900 text-slate-500 border border-slate-800',
                    'gs-chip'
                  )}>
                    {tr('locked')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            availableCorporate.map((item) => {
              const b = BUILDINGS_DATA.find((itemB) => itemB.id === item.buildingId);
              const baseCost = b ? b.baseCost : 15;
              const cost = getCorporateActionCost(item, baseCost, boughtGreenwashingLayoffs.length);
              const canAfford = valuation >= cost;

              return (
                <div
                  key={item.id}
                  className={cx(
                    `p-3 rounded-xl border flex items-center justify-between transition-all ${
                      canAfford
                        ? 'bg-slate-900/90 border-amber-500/40 hover:border-amber-400 shadow-md'
                        : 'bg-slate-950/60 border-slate-900 opacity-60'
                    }`,
                    `gs-row gs-acc-gold ${canAfford ? 'is-affordable' : 'is-broke'}`
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={cx(
                      `p-2 rounded-lg border shrink-0 ${
                        item.type === 'greenwashing' ? 'bg-emerald-950 border-emerald-500/40 text-emerald-400' : 'bg-rose-950 border-rose-500/40 text-rose-400'
                      }`,
                      `gs-iconbox ${item.type === 'greenwashing' ? 'gs-acc-grass' : 'gs-acc-rust'}`
                    )}>
                      {renderIcon(item.icon || (item.type === 'greenwashing' ? 'Recycle' : 'UserX'), 'w-4 h-4')}
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-slate-100 flex items-center gap-2">
                        <span>{gwName(item, tr)}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">({b ? buildingName(b.id, tr) : ''})</span>
                      </div>
                      <div className="text-[11px] text-slate-300 italic">"{gwQuote(item, tr)}"</div>
                      <div className="text-[10px] text-amber-400 font-mono font-bold mt-1 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 inline-block">
                        {gwEffectDesc(item, tr)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => buyGreenwashingLayoff(item.id)}
                    disabled={!canAfford}
                    className={cx(
                      `px-3 py-1.5 rounded-lg font-black text-xs flex flex-col items-end transition-all min-w-[85px] shrink-0 ml-2 ${
                        canAfford
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 shadow-sm'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`,
                      `gs-btn gs-price ml-2 ${canAfford ? 'gs-btn--gold' : 'is-disabled'}`
                    )}
                  >
                    <span>{formatCurrency(cost)}</span>
                  </button>
                </div>
              );
            })
          )}

          {/* BOUGHT CORPORATE ACTIONS ACCORDION SECTION (same principle as Bought Upgrades) */}
          <div className={cx(
            'mt-2 bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden',
            'mt-2 gs-panel gs-panel--sunk overflow-hidden p-0'
          )}>
            <button
              onClick={() => setShowBoughtCorporate((prev) => !prev)}
              className={cx(
                'w-full p-3 flex items-center justify-between font-extrabold text-xs text-emerald-400 hover:bg-slate-800/60 transition-colors',
                'w-full p-3 flex items-center justify-between gs-title gs-acc-grass'
              )}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{tr('boughtCorporateTitle')} ({boughtCorporateObjects.length})</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                {showBoughtCorporate ? tr('hideBoughtCorporate') : tr('showBoughtCorporate')}
              </span>
            </button>

            {showBoughtCorporate && (
              <div className="p-2 border-t border-slate-800 bg-slate-950/60 flex flex-col gap-2">
                {boughtCorporateObjects.length === 0 ? (
                  <div className="text-center py-4 text-slate-500 text-xs italic">
                    {tr('noBoughtCorporate')}
                  </div>
                ) : (
                  boughtCorporateObjects.map((item) => {
                    const b = BUILDINGS_DATA.find((itemB) => itemB.id === item.buildingId);
                    return (
                      <div
                        key={item.id}
                        className={cx(
                          'p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between opacity-90',
                          'gs-row gs-row--done gs-acc-grass'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-lg border shrink-0 ${
                            item.type === 'greenwashing' ? 'bg-emerald-950 border-emerald-500/40 text-emerald-400' : 'bg-rose-950 border-rose-500/40 text-rose-400'
                          }`}>
                            {renderIcon(item.icon || (item.type === 'greenwashing' ? 'Recycle' : 'UserX'), 'w-4 h-4')}
                          </div>
                          <div>
                            <div className="font-extrabold text-xs text-slate-100 flex items-center gap-2">
                              <span>{gwName(item, tr)}</span>
                              <span className="text-[10px] text-slate-400 font-mono font-normal">({b ? buildingName(b.id, tr) : ''})</span>
                            </div>
                            <div className="text-[10px] text-amber-400 font-mono font-bold mt-1 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 inline-block">
                              {gwEffectDesc(item, tr)}
                            </div>
                          </div>
                        </div>
                        <span className="flex items-center gap-1 text-emerald-400 font-black text-[10px] shrink-0 ml-2">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {tr('executed')}
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

      {/* BUZZWORDS TRADING CARD ALBUM & BOOSTER PACK SHOP */}
      {storeSection === 'buzzwords' && (
        <BuzzwordAlbum
          valuation={valuation}
          boughtBuzzwords={boughtBuzzwords}
          buyBoosterPack={buyBoosterPack}
          addCardToAlbum={addCardToAlbum}
          t={t}
        />
      )}
    </div>
  );
}
