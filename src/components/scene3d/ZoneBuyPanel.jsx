import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { BUILDINGS_DATA } from '../../data/buildingsData';
import { ZONE_BY_BUILDING } from '../../data/zonesData';
import { UPGRADES_DATA, getAvailableUpgrades } from '../../data/upgradesData';
import { GREENWASHING_LAYOFFS_DATA, getCorporateActionCost, getAvailableCorporateActions } from '../../data/greenwashingLayoffsData';
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

  // Map der Gebäude-Reihenfolge nach Output-Wertigkeit (Tier / baseCps in BUILDINGS_DATA)
  const BUILDING_ORDER_MAP = new Map(BUILDINGS_DATA.map((b, idx) => [b.id, idx]));

  // zoneState.buildings trägt die Sichtbarkeits-Flags aus deriveZones. Fehlt es (die
  // Zone wurde noch nie abgeleitet), bleibt die Liste leer statt versehentlich alles zu
  // zeigen. Sortiert nach Output-Wertigkeit, identisch zum Store:
  const zoneEntries = (zoneState ? [...zoneState.buildings] : [])
    .filter((b) => b.unlocked || b.isTeaser)
    .sort((a, b) => {
      const orderA = BUILDING_ORDER_MAP.has(a.id) ? BUILDING_ORDER_MAP.get(a.id) : 999;
      const orderB = BUILDING_ORDER_MAP.has(b.id) ? BUILDING_ORDER_MAP.get(b.id) : 999;
      return orderA - orderB;
    });

  // Upgrades und Corporate Actions auf die Engines DIESER Zone eingegrenzt: beide
  // Helfer geben schon "nächste unbezahlte Stufe pro Gebäude" zurück (dieselbe Regel wie
  // im Shop), hier bleibt nur noch der Zonenfilter über ZONE_BY_BUILDING übrig.
  // Ebenfalls nach Output-Wertigkeit der Engines sortiert:
  const zoneUpgrades = getAvailableUpgrades(buildings, boughtUpgrades, valuation, totalValuation)
    .filter((up) => up.type === 'building' && ZONE_BY_BUILDING[up.buildingId] === zoneDef.id)
    .sort((a, b) => {
      const orderA = BUILDING_ORDER_MAP.has(a.buildingId) ? BUILDING_ORDER_MAP.get(a.buildingId) : 999;
      const orderB = BUILDING_ORDER_MAP.has(b.buildingId) ? BUILDING_ORDER_MAP.get(b.buildingId) : 999;
      return orderA - orderB;
    });

  const zoneCorporate = getAvailableCorporateActions(buildings, boughtGreenwashingLayoffs)
    .filter((item) => ZONE_BY_BUILDING[item.buildingId] === zoneDef.id)
    .sort((a, b) => {
      const orderA = BUILDING_ORDER_MAP.has(a.buildingId) ? BUILDING_ORDER_MAP.get(a.buildingId) : 999;
      const orderB = BUILDING_ORDER_MAP.has(b.buildingId) ? BUILDING_ORDER_MAP.get(b.buildingId) : 999;
      return orderA - orderB;
    });

  // Gesamt-Brutto-VPS über alle Gebäude für Prozentanteil-Berechnung
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

              let cost = 0;
              let buyText = `+1`;
              if (buyMode === '1') {
                cost = getBuildingCost(meta.baseCost, count);
                buyText = `+1`;
              } else if (buyMode === '10') {
                cost = getBuildingBulkCost(meta.baseCost, count, 10);
                buyText = `+10`;
              } else if (buyMode === '100') {
                cost = getBuildingBulkCost(meta.baseCost, count, 100);
                buyText = `+100`;
              } else if (buyMode === 'MAX') {
                const res = getMaxAffordableBuildings(meta.baseCost, count, valuation);
                cost = res.totalCost;
                buyText = res.count > 0 ? `+${res.count}` : `+0`;
              }

              const canAfford = cost > 0 && valuation >= cost;

              // Exakte Produktionsrate & Multiplikator dieser Engine berechnen
              let bMult = 1.0;
              boughtUpgrades.forEach((upId) => {
                const up = UPGRADES_DATA.find((u) => u.id === upId);
                if (up && up.type === 'building' && up.buildingId === entry.id) {
                  bMult *= up.effect.value;
                }
              });
              boughtGreenwashingLayoffs.forEach((itemId) => {
                const gw = GREENWASHING_LAYOFFS_DATA.find((g) => g.id === itemId);
                if (gw && gw.buildingId === entry.id) {
                  if (gw.type === 'greenwashing' && gw.tier === 2) bMult *= 1.10;
                  if (gw.type === 'layoff' && gw.tier === 1) bMult *= 1.20;
                  if (gw.type === 'layoff' && gw.tier === 2) bMult *= 1.15;
                }
              });

              const unitVps = meta.baseCps * bMult;
              const buildingTotalVps = count * unitVps;
              const vpsSharePct = totalGrossCpsSum > 0 ? ((buildingTotalVps / totalGrossCpsSum) * 100).toFixed(1) : '0.0';

              return (
                <div key={entry.id} className="relative group">
                  {/* Hover-Infokarte wie im Store */}
                  <div className="campus-row-tooltip">
                    <div className="campus-row-tooltip__head">
                      <span>{tr(`building_${entry.id}_name`)}</span>
                      <span>Basis: {formatCurrency(meta.baseCost)}</span>
                    </div>
                    <div className="campus-row-tooltip__body">
                      <span>1 Stk: +{formatCurrency(unitVps)}/s {bMult > 1 && `(${bMult.toFixed(1)}x)`}</span>
                      <span>Gesamt: +{formatCurrency(buildingTotalVps)}/s ({vpsSharePct}%)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => buyBuilding(entry.id)}
                    disabled={!canAfford}
                    className={`campus-row ${canAfford ? 'is-affordable' : 'is-broke'}`}
                  >
                    <RowIcon buildingId={entry.id} tier={entry.tier} />
                    <span className="campus-row__texts">
                      <span className="campus-row__name-line">
                        <span className="campus-row__name">{tr(`building_${entry.id}_name`)}</span>
                        {count > 0 ? (
                          <span className="campus-row__count-pill">x{count}</span>
                        ) : (
                          <span className="campus-panel__new">{tr('sceneNewBadge')}</span>
                        )}
                      </span>
                      <span className="campus-row__stats">
                        <span className="campus-row__vps">
                          +{formatCurrency(count > 0 ? buildingTotalVps : unitVps)}/s
                        </span>
                        <span className="campus-row__sub-stats">
                          {count > 0
                            ? `(1x: +${formatCurrency(unitVps)}/s · ${vpsSharePct}%)`
                            : `(Basis: +${formatCurrency(unitVps)}/s)`}
                        </span>
                      </span>
                    </span>

                    <span className="campus-row__buy-col">
                      <span className="campus-row__buy-amount">{buyText}</span>
                      <span className="campus-row__price">{formatCurrency(cost)}</span>
                    </span>
                  </button>
                </div>
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
