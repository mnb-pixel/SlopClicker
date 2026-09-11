import React from 'react';
import { Lock, X } from 'lucide-react';
import { BUILDINGS_DATA } from '../../data/buildingsData';
import { getZoneVisual } from './zoneVisuals';
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
// Optik bewusst im Stil der Insel statt im dunklen Terminal-Look der Shop-Tabs: das
// Panel klebt direkt an der hellen, freundlichen Low-Poly-Szene und wird aus ihr heraus
// geöffnet. Die Klassen liegen in scene3d.css (.campus-panel*), die Akzentfarbe im Kopf
// kommt aus derselben Quelle wie das Icon der Stecknadel (zoneVisuals.js) - so gehören
// Nadel und Menü sichtbar zusammen.
//
// Bewusst KEINE eigene Kauflogik: Preise kommen aus denselben Helfern wie im Shop
// (formatters.js) und gekauft wird über store.buyBuilding. Zwei Kaufwege, eine Wahrheit -
// sonst driften Bulk-Preise und Rabatte zwischen Shop und Szene auseinander.
//
// Das gilt auch für die Sichtbarkeit: gelistet wird nur, was der Shop auch listen würde
// (deriveZones markiert die Engines, Regel in utils/buildingUnlock.js) - freigeschaltete
// Stufen plus höchstens der eine "???"-Platzhalter. Käme die Szene hier an höhere Stufen
// heran, wäre die progressive Freischaltung über den Umweg Insel ausgehebelt.
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
  const { Icon, accent } = getZoneVisual(zoneDef.id);

  // zoneState.buildings trägt die Sichtbarkeits-Flags aus deriveZones. Fehlt es (die
  // Zone wurde noch nie abgeleitet), bleibt die Liste leer statt versehentlich alles zu
  // zeigen.
  const zoneEntries = (zoneState ? zoneState.buildings : []).filter(
    (b) => b.unlocked || b.isTeaser
  );

  const costFor = (baseCost, count) => {
    if (buyMode === '1') return getBuildingCost(baseCost, count);
    if (buyMode === '10') return getBuildingBulkCost(baseCost, count, 10);
    if (buyMode === '100') return getBuildingBulkCost(baseCost, count, 100);
    return getMaxAffordableBuildings(baseCost, count, valuation).totalCost;
  };

  return (
    <div className="campus-panel" style={{ '--zone-accent': accent }}>
      <div className="campus-panel__head">
        <span className="campus-panel__badge" aria-hidden="true">
          <Icon className="campus-panel__badge-glyph" />
        </span>
        <span className="campus-panel__titles">
          <span className="campus-panel__title">{tr(`zone_${zoneDef.id}_name`)}</span>
          <span className="campus-panel__sub">
            {zoneState ? zoneState.population : 0} · +{formatCurrency(zoneState ? zoneState.zoneVps : 0)}/s
          </span>
        </span>
        <button onClick={onClose} aria-label={tr('closeLabel')} className="campus-panel__close">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="campus-panel__modes">
        {BUY_MODES.map((mode) => (
          <button
            key={mode}
            onClick={() => setBuyMode(mode)}
            className={`campus-mode ${buyMode === mode ? 'is-active' : ''}`}
          >
            {mode === 'MAX' ? tr('buyModeMax') : `x${mode}`}
          </button>
        ))}
      </div>

      <div className="campus-panel__list">
        {zoneEntries.map((entry) => {
          const meta = BUILDINGS_DATA.find((b) => b.id === entry.id);
          if (!meta) return null;

          // Der Platzhalter verrät weder Namen noch Preis - wie die "???"-Kachel im Shop.
          if (entry.isTeaser) {
            return (
              <div key={entry.id} className="campus-row campus-row--locked">
                <Lock className="campus-row__lock" />
                <span className="campus-row__texts">
                  <span className="campus-row__name">{tr('lockedEngineTier')}</span>
                  <span className="campus-row__hint">{tr('lockedEngineTierDesc')}</span>
                </span>
              </div>
            );
          }

          const count = buildings[entry.id] || 0;
          const cost = costFor(meta.baseCost, count);
          const canAfford = cost > 0 && valuation >= cost;

          return (
            <button
              key={entry.id}
              onClick={() => buyBuilding(entry.id)}
              disabled={!canAfford}
              className={`campus-row ${canAfford ? 'is-affordable' : 'is-broke'}`}
            >
              <span className="campus-row__texts">
                <span className="campus-row__name">
                  {tr(`building_${entry.id}_name`)}
                  {count === 0 && (
                    <span className="campus-panel__new">{tr('sceneNewBadge')}</span>
                  )}
                </span>
                <span className="campus-row__count">x{count}</span>
              </span>
              <span className="campus-row__price">{formatCurrency(cost)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
