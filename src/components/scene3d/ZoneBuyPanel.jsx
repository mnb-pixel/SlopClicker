import React from 'react';
import { X } from 'lucide-react';
import { BUILDINGS_DATA } from '../../data/buildingsData';
import {
  formatCurrency,
  getBuildingCost,
  getBuildingBulkCost,
  getMaxAffordableBuildings,
} from '../../utils/formatters';

const BUY_MODES = ['1', '10', '100', 'MAX'];

// Kaufpanel einer Zone: klickt man in der Szene z.B. den Serverkeller an, erscheint hier
// genau dessen Engine-Liste zum Kaufen.
//
// Bewusst KEINE eigene Kauflogik: Preise kommen aus denselben Helfern wie im Shop
// (formatters.js) und gekauft wird über store.buyBuilding. Zwei Kaufwege, eine Wahrheit -
// sonst driften Bulk-Preise und Rabatte zwischen Shop und Szene auseinander.
export function ZoneBuyPanel({
  zoneDef,
  zoneState,
  valuation,
  buildings,
  buyBuilding,
  buyMode,
  setBuyMode,
  onClose,
  t,
}) {
  const tr = t || ((k) => k);

  const costFor = (baseCost, count) => {
    if (buyMode === '1') return getBuildingCost(baseCost, count);
    if (buyMode === '10') return getBuildingBulkCost(baseCost, count, 10);
    if (buyMode === '100') return getBuildingBulkCost(baseCost, count, 100);
    return getMaxAffordableBuildings(baseCost, count, valuation).totalCost;
  };

  return (
    <div className="campus-panel">
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-xs font-black uppercase tracking-wider text-cyan-300 truncate">
            {tr(`zone_${zoneDef.id}_name`)}
          </span>
          <span className="text-[10px] font-mono text-slate-400 shrink-0">
            {zoneState ? zoneState.population : 0} · +{formatCurrency(zoneState ? zoneState.zoneVps : 0)}/s
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label={tr('closeLabel')}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-1 mb-2">
        {BUY_MODES.map((mode) => (
          <button
            key={mode}
            onClick={() => setBuyMode(mode)}
            className={`flex-1 py-1 rounded-lg text-[10px] font-black transition-colors ${
              buyMode === mode
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {mode === 'MAX' ? tr('buyModeMax') : `x${mode}`}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        {zoneDef.buildings.map((entry) => {
          const meta = BUILDINGS_DATA.find((b) => b.id === entry.id);
          if (!meta) return null;
          const count = buildings[entry.id] || 0;
          const cost = costFor(meta.baseCost, count);
          const canAfford = cost > 0 && valuation >= cost;

          return (
            <button
              key={entry.id}
              onClick={() => buyBuilding(entry.id)}
              disabled={!canAfford}
              className={`flex items-center justify-between gap-2 p-2 rounded-xl border text-left transition-all ${
                canAfford
                  ? 'bg-slate-900 border-cyan-500/40 hover:border-cyan-400 active:scale-[0.99]'
                  : 'bg-slate-950/70 border-slate-800 opacity-60 cursor-not-allowed'
              }`}
            >
              <span className="min-w-0">
                <span className="block text-[11px] font-bold text-slate-200 truncate">
                  {tr(`building_${entry.id}_name`)}
                </span>
                <span className="block text-[10px] font-mono text-slate-500">x{count}</span>
              </span>
              <span
                className={`text-[11px] font-mono font-black shrink-0 ${
                  canAfford ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {formatCurrency(cost)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
