import React, { useState, useEffect } from 'react';
import { Edit3, Sparkles, BookOpen, Share2, Flame, ShieldAlert, Zap } from 'lucide-react';
import { formatCurrency, formatExactValuation } from '../../utils/formatters';
import { getOverheatRemainingSeconds } from '../../hooks/useGameStore';

// Oberes Overlay der Vollbild-Shell. Ersetzt die frühere Kopfzeile (Header.jsx) und
// liegt über dem Himmel der Szene. Enthält alles, was der Header konnte, nur kompakter:
// Name, Sprache, Handbuch, Teilen, Bewertung, drei Kennzahlen-Chips, Hitzebalken.
// Der Slop-Zähler ist bewusst weg (steht in der Statistik-Schublade), der Newsticker
// läuft als LED-Tafel am Kapital-Turm in der Szene.
//
// Optik im Grafik-Stil der Insel, wie Kaufpanel, Schublade und Buttonreihe: Papier,
// Tinte, klotzige Kanten (siehe .hud-* in scene3d.css). Der Himmel ist hell - dunkler
// Text darauf liest sich besser als das frühere Weiß mit schwarzem Schlagschatten, und
// die Chips sind Papierpillen statt dunklem Glas. Die freistehenden Texte (Bewertung,
// Hitze-Zeile) bekommen stattdessen einen hellen Halo, damit sie auch über der Insel
// und über dunklem Rauch lesbar bleiben.
export function HudTop({
  startupName,
  setStartupName,
  hasAiDomainBonus,
  valuation,
  vps,
  netFlow,
  gpuTemp,
  isOverheated,
  overheatedAt = 0,
  coolingRate = 4,
  powerClickActive,
  themeMode,
  hypeTier,
  burnRate,
  onOpenManual,
  onOpenPitchDeck,
  lang = 'de',
  setLang,
  t,
}) {
  const tr = t || ((k) => k);
  const isSecTheme = themeMode === 'sec_prospectus';
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(startupName);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isOverheated) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [isOverheated]);

  const overheatRemainingSec = isOverheated
    ? getOverheatRemainingSeconds(overheatedAt, gpuTemp, coolingRate, now)
    : 0;

  const handleSaveName = (e) => {
    e.preventDefault();
    if (tempName.trim()) setStartupName(tempName.trim());
    setIsEditingName(false);
  };

  const tempPct = Math.min(100, Math.max(0, gpuTemp));
  // Dieselben drei Stufen wie bisher, nur als Klasse statt als Tailwind-Verlauf -
  // die Farben stehen bei den übrigen Spielfarben in scene3d.css.
  let heatLevel = 'is-cool';
  if (tempPct >= 85) heatLevel = 'is-hot';
  else if (tempPct > 50) heatLevel = 'is-warm';

  return (
    <div className={`hud-top hud-safe-top ${isSecTheme ? 'hud-top--sec' : ''}`}>
      {/* Zeile 1: Name links, Aktionen rechts */}
      <div className="flex items-center justify-between gap-2 px-3 pt-1 pointer-events-auto">
        {isEditingName ? (
          <form onSubmit={handleSaveName} className="flex items-center gap-1.5 min-w-0">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="hud-name-input"
              autoFocus
            />
            <button type="submit" className="hud-name-save">
              {tr('saveLabel')}
            </button>
          </form>
        ) : (
          <button onClick={() => setIsEditingName(true)} className="hud-name">
            <span className="hud-name__text">{startupName}</span>
            <Edit3 className="hud-name__pen" />
            {/* Auf schmalen Handys bleibt vom Bonus nur der Stern stehen (siehe
                .hud-name__bonus-text in scene3d.css): der ausgeschriebene Text ist
                breiter als der halbe Bildschirm und drückte sonst den Namen des
                Spielers komplett aus dem Schild. */}
            {hasAiDomainBonus && (
              <span className="hud-name__bonus" title={tr('aiHypeBonusLabel')}>
                <Sparkles className="w-3 h-3 shrink-0" />
                <span className="hud-name__bonus-text">{tr('aiHypeBonusLabel')}</span>
              </span>
            )}
          </button>
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={lang}
            onChange={(e) => setLang && setLang(e.target.value)}
            aria-label="Language"
            className="hud-round-btn hud-round-btn--wide"
          >
            <option value="de">DE</option>
            <option value="en">EN</option>
          </select>
          <button onClick={onOpenManual} title={tr('openManual')} className="hud-round-btn">
            <BookOpen className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenPitchDeck}
            title={tr('sharePitchDeckTitle')}
            className="hud-round-btn hud-round-btn--share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Zeile 2: Bewertung groß, darunter drei Chips */}
      <div className="text-center px-3 mt-1">
        <div className="hud-caption">
          <Sparkles className="w-3 h-3" />
          {tr('valuationHypeTierLabel')} {hypeTier}/10
        </div>
        <div className="hud-valuation">{formatExactValuation(valuation)}</div>
        <div className="flex items-center justify-center gap-1.5 mt-1.5 flex-wrap">
          <span className="hud-chip hud-chip--net">
            {tr('netVps')} {netFlow >= 0 ? '+' : ''}{formatCurrency(netFlow ?? vps)}/s
          </span>
          <span className="hud-chip hud-chip--burn">
            {tr('burnRate')} {(burnRate * 100).toFixed(1)}%/s
          </span>
          {powerClickActive && (
            <span className="hud-chip hud-chip--power animate-pulse">
              <Zap className="w-3 h-3" /> x2
            </span>
          )}
        </div>
      </div>

      {/* Zeile 3: Hitzebalken, schmal */}
      <div className="hud-heat">
        <div className="hud-heat__row">
          <span className={`hud-heat__label ${heatLevel}`}>
            <Flame className="w-3 h-3" />
            {tr('gpuHeatLabel')} {gpuTemp.toFixed(0)}°C
          </span>
          {isOverheated ? (
            <span className="hud-heat__alarm animate-pulse">
              <ShieldAlert className="w-3 h-3" /> {tr('overheatedLabel')} {overheatRemainingSec > 0 ? `(${overheatRemainingSec}s)` : ''}
            </span>
          ) : (
            <span className="hud-heat__state">
              {gpuTemp < 50 ? tr('tempOptimal') : gpuTemp < 85 ? tr('tempWarm') : tr('tempCritical')}
            </span>
          )}
        </div>
        <div className="hud-heat__track">
          <div
            className={`hud-heat__fill ${heatLevel} ${isOverheated ? 'overheat-pulse' : ''}`}
            style={{ width: `${tempPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
