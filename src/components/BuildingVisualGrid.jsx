import React from 'react';
import * as Icons from 'lucide-react';
import { BUILDINGS_DATA } from '../data/buildingsData';
import { UPGRADES_DATA } from '../data/upgradesData';
import { GREENWASHING_LAYOFFS_DATA } from '../data/greenwashingLayoffsData';
import { formatCurrency, formatNumber } from '../utils/formatters';

export function BuildingVisualGrid({ buildings, boughtUpgrades = [], boughtGreenwashingLayoffs = [], t }) {
  const tr = t || ((k) => k);
  const buildingName = (b) => tr(`building_${b.id}_name`) || b.name;
  const renderItemArtwork = (b, sizeClass = 'w-6 h-6') => {
    if (b && b.image) {
      return (
        <img
          src={b.image}
          alt={buildingName(b)}
          className={`${sizeClass} rounded-md object-cover border border-cyan-400/60 shadow-md`}
        />
      );
    }
    const IconComp = Icons[b?.icon] || Icons.Server;
    return <IconComp className="w-3.5 h-3.5 text-cyan-400" />;
  };

  // Filter owned buildings
  const ownedBuildings = BUILDINGS_DATA.filter((b) => (buildings[b.id] || 0) > 0);

  if (ownedBuildings.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center mt-2 mb-1 backdrop-blur-md w-full">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          ⚡ AI Compute Matrix (Empty)
        </div>
        <div className="text-[11px] text-slate-600 italic">
          No AI Engines deployed yet. Head to the Store to deploy your first Auto-Prompt Cursors & Prompt Engineers!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-3.5 shadow-2xl mt-2 mb-1 backdrop-blur-md w-full">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
        <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
          <Icons.Cpu className="w-4 h-4 text-cyan-400" />
          Deployed AI Engines ({ownedBuildings.length} types)
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          Total Count: {Object.values(buildings).reduce((a, b) => a + b, 0)}
        </span>
      </div>

      {/* Visual Building Rows - grows with the list, page scrolls instead of a nested scrollbar */}
      <div className="flex flex-col gap-2.5">
        {ownedBuildings.map((b) => {
          const count = buildings[b.id] || 0;

          // Apply purchased Upgrade & Corporate Action multipliers, same as the Store tab
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
          const totalVps = count * unitVps;
          const displayCount = Math.min(15, count);

          return (
            <div
              key={b.id}
              className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/90 flex flex-col gap-1.5 hover:border-cyan-500/40 transition-all shadow-md group"
            >
              {/* Row Header */}
              <div className="flex items-center justify-between text-xs font-extrabold">
                <div className="flex items-center gap-2 text-slate-200">
                  <div className="p-0.5 rounded bg-slate-800 border border-slate-700">
                    {renderItemArtwork(b, 'w-6 h-6')}
                  </div>
                  <span>{buildingName(b)}</span>
                  <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black px-1.5 py-0.1 rounded border border-cyan-500/30">
                    x{count}
                  </span>
                  {bMult > 1 && (
                    <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-1.5 py-0.1 rounded border border-amber-500/30">
                      {bMult.toFixed(1)}x
                    </span>
                  )}
                </div>
                <span className="text-emerald-400 font-mono text-[11px]">
                  +{formatCurrency(totalVps)}/s
                </span>
              </div>

              {/* Animated Miniature Sprites Cluster */}
              <div className="flex flex-wrap gap-1.5 pt-1 items-center">
                {Array.from({ length: displayCount }).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded-lg bg-slate-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner transform group-hover:scale-105 transition-transform animate-pulse overflow-hidden"
                    style={{ animationDelay: `${(idx % 5) * 200}ms` }}
                    title={`${buildingName(b)} #${idx + 1}`}
                  >
                    {renderItemArtwork(b, 'w-full h-full')}
                  </div>
                ))}
                {count > 15 && (
                  <span className="text-[10px] font-mono text-slate-500 pl-1 font-bold">
                    +{count - 15} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
