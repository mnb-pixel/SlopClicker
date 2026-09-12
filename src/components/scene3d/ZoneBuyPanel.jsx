import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { BUILDINGS_DATA } from '../../data/buildingsData';
import { ZONE_BY_BUILDING } from '../../data/zonesData';
import { getAvailableUpgrades } from '../../data/upgradesData';
import { getCorporateActionCost, getAvailableCorporateActions } from '../../data/greenwashingLayoffsData';
import { getZoneVisual } from './zoneVisuals';
import { VoxelIcon, tierAfterUpgrade } from './voxelIcons';
import { upgradeName, upgradeQuote, upgradeDescription, gwName, gwQuote, gwEffectDesc } from '../../utils/storeCopy';
import {
  formatCurrency,
  getBuildingCost,
  getBuildingBulkCost,
  getMaxAffordableBuildings,
} from '../../utils/formatters';

const BUY_MODES = ['1', '10', '100', 'MAX'];

// Kaufpanel einer Zone: klickt man in der Szene z.B. den Serverkeller an, erscheint hier
// alles, was zu dessen Engines gehört - Kauf der Engines selbst, ihre Upgrades UND ihre
// Corporate Actions (Greenwashing/Layoffs). Vorher steckten Upgrades und Corporate
// Actions nur in der Schublade (StoreTab), gemischt über alle 20 Engines hinweg; wer aus
// der Szene heraus kaufte mmusste für ein Upgrade jedes Mal den Umweg über den Shop
// nehmen. Jetzt landet, wer eine Zone anklickt, direkt bei genau dem, was zu ihr gehört -
// der Shop bleibt daneben bestehen für Klick-Upgrades, Syndicate und Buzzwords, die
// keiner Zone gehören.
//
// Optik bewusst im Stil der Insel statt im dunklen Terminal-Look der Shop-Tabs: das
// Panel klebt direkt an der hellen, freundlichen Low-Poly-Szene und wird aus ihr heraus
// geöffnet. Die Klassen liegen in scene3d.css (.campus-panel*), die Akzentfarbe im Kopf
// kommt aus derselben Quelle wie das Icon der Stecknadel (zoneVisuals.js) - so gehören
// Nadel und Menü sichtbar zusammen.
//
// Bewusst KEINE eigene Kauflogik: Preise und die "nächste Stufe pro Gebäude"-Filterung
// kommen aus denselben Helfern wie im Shop (formatters.js, upgradesData.js,
// greenwashingLayoffsData.js) und gekauft wird über dieselben Store-Funktionen. Zwei
// Kaufwege, eine Wahrheit - sonst driften Preise und Sichtbarkeit zwischen Shop und
// Szene auseinander.
//
// Das gilt auch für die Engine-Liste: gelistet wird nur, was der Shop auch listen würde
// (deriveZones markiert die Engines, Regel in utils/buildingUnlock.js) - freigeschaltete
// Stufen plus höchstens der eine "???"-Platzhalter. Käme die Szene hier an höhere Stufen
// heran, wäre die progressive Freischaltung über den Umweg Insel ausgehebelt.
export function ZoneBuyPanel({
  zoneDef,
  zoneState,
  valuation,
  totalValuation,
  buildings,
  buyBuilding,
  buyMode,
  setBuyMode,
  boughtUpgrades = [],
  buyUpgrade,
  boughtGreenwashingLayoffs = [],
  buyGreenwashingLayoff,
  onClose,
  t,
}) {
  const tr = t || ((k) => k);
  const { Icon, accent } = getZoneVisual(zoneDef.id);
  const [section, setSection] = useState('engines'); // 'engines' | 'upgrades' | 'corporate'

  // Icon-Kachel je Zeile: statt eines generischen Lucide-Symbols zeigt sie jetzt dasselbe
  // Motiv wie das Prop in der 3D-Szene, gefärbt nach Sichtstufe (voxelIcons.js) - "so
  // sieht die Engine gerade aus" bei den Engines, "so sieht sie NACH diesem Kauf aus" bei
  // Upgrades und Corporate Actions.
  const RowIcon = ({ buildingId, tier }) => (
    <span className="campus-row__icon" aria-hidden="true">
      <VoxelIcon buildingId={buildingId} tier={tier} className="campus-row__icon-glyph" />
    </span>
  );

  // zoneState.buildings trägt die Sichtbarkeits-Flags aus deriveZones. Fehlt es (die
  // Zone wurde noch nie abgeleitet), bleibt die Liste leer statt versehentlich alles zu
  // zeigen.
  const zoneEntries = (zoneState ? zoneState.buildings : []).filter(
    (b) => b.unlocked || b.isTeaser
  );

  // Upgrades und Corporate Actions auf die Engines DIESER Zone eingegrenzt: beide
  // Helfer geben schon "nächste unbezahlte Stufe pro Gebäude" zurück (dieselbe Regel wie
  // im Shop), hier bleibt nur noch der Zonenfilter über ZONE_BY_BUILDING übrig.
  const zoneUpgrades = getAvailableUpgrades(buildings, boughtUpgrades, valuation, totalValuation).filter(
    (up) => up.type === 'building' && ZONE_BY_BUILDING[up.buildingId] === zoneDef.id
  );
  const zoneCorporate = getAvailableCorporateActions(buildings, boughtGreenwashingLayoffs).filter(
    (item) => ZONE_BY_BUILDING[item.buildingId] === zoneDef.id
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

      {/* Drei Reiter statt der vier im Shop: Buzzwords gehören keiner Zone, die bleiben
          in der Schublade. Zähler wie im Shop, damit man von außen sieht, wo etwas
          Neues wartet, ohne erst umzuschalten. */}
      <div className="campus-panel__tabs">
        <button
          onClick={() => setSection('engines')}
          className={`campus-panel__tab ${section === 'engines' ? 'is-active' : ''}`}
        >
          {tr('subEngines')}
        </button>
        <button
          onClick={() => setSection('upgrades')}
          className={`campus-panel__tab ${section === 'upgrades' ? 'is-active' : ''}`}
        >
          {tr('subUpgrades')} ({zoneUpgrades.length})
        </button>
        <button
          onClick={() => setSection('corporate')}
          className={`campus-panel__tab ${section === 'corporate' ? 'is-active' : ''}`}
        >
          {tr('subCorporate')} ({zoneCorporate.length})
        </button>
      </div>

      {section === 'engines' && (
        <>
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
                  <RowIcon buildingId={entry.id} tier={entry.tier} />
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
        </>
      )}

      {section === 'upgrades' && (
        <div className="campus-panel__list">
          {zoneUpgrades.length === 0 ? (
            <div className="campus-panel__empty">{tr('noUpgradesAvailable')}</div>
          ) : (
            zoneUpgrades.map((up) => {
              const canAfford = valuation >= up.cost;
              return (
                <button
                  key={up.id}
                  onClick={() => buyUpgrade(up.id)}
                  disabled={!canAfford}
                  className={`campus-row campus-row--stacked ${canAfford ? 'is-affordable' : 'is-broke'}`}
                >
                  <RowIcon buildingId={up.buildingId} tier={tierAfterUpgrade(boughtUpgrades, up.buildingId)} />
                  <span className="campus-row__texts">
                    <span className="campus-row__name">{upgradeName(up, tr)}</span>
                    <span className="campus-row__hint">{upgradeDescription(up, tr)}</span>
                    {upgradeQuote(up, tr) && <span className="campus-row__quote">"{upgradeQuote(up, tr)}"</span>}
                  </span>
                  <span className="campus-row__price">{formatCurrency(up.cost)}</span>
                </button>
              );
            })
          )}
        </div>
      )}

      {section === 'corporate' && (
        <div className="campus-panel__list">
          {zoneCorporate.length === 0 ? (
            <div className="campus-panel__empty">{tr('noCorporateAvailable')}</div>
          ) : (
            zoneCorporate.map((item) => {
              const meta = BUILDINGS_DATA.find((b) => b.id === item.buildingId);
              const cost = getCorporateActionCost(item, meta ? meta.baseCost : 15, boughtGreenwashingLayoffs.length);
              const canAfford = valuation >= cost;
              const itemTier = zoneState ? zoneState.buildings.find((b) => b.id === item.buildingId)?.tier || 0 : 0;
              return (
                <button
                  key={item.id}
                  onClick={() => buyGreenwashingLayoff(item.id)}
                  disabled={!canAfford}
                  className={`campus-row campus-row--stacked ${canAfford ? 'is-affordable' : 'is-broke'}`}
                >
                  <RowIcon buildingId={item.buildingId} tier={itemTier} />
                  <span className="campus-row__texts">
                    <span className="campus-row__name">{gwName(item, tr)}</span>
                    <span className="campus-row__hint">{gwEffectDesc(item, tr)}</span>
                    <span className="campus-row__quote">"{gwQuote(item, tr)}"</span>
                  </span>
                  <span className="campus-row__price">{formatCurrency(cost)}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
