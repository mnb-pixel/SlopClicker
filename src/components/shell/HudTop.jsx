import React, { useState } from 'react';
import { Edit3, Sparkles, BookOpen, Share2, Flame, ShieldAlert, Zap } from 'lucide-react';
import { formatCurrency, formatExactValuation } from '../../utils/formatters';

// Oberes Overlay der Vollbild-Shell. Ersetzt die frühere Kopfzeile (Header.jsx) und
// liegt transparent über dem Himmel der Szene: kein eigener Hintergrund, Lesbarkeit
// kommt aus Textschatten. Enthält alles, was der Header konnte, nur kompakter:
// Name, Sprache, Handbuch, Teilen, Bewertung, drei Kennzahlen-Chips, Hitzebalken.
// Der Slop-Zähler ist bewusst weg (steht in der Statistik-Schublade), der Newsticker
// läuft als LED-Tafel am Kapital-Turm in der Szene.
export function HudTop({
  startupName,
  setStartupName,
  hasAiDomainBonus,
  valuation,
  vps,
  netFlow,
  gpuTemp,
  isOverheated,
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

  const handleSaveName = (e) => {
    e.preventDefault();
    if (tempName.trim()) setStartupName(tempName.trim());
    setIsEditingName(false);
  };

  const tempPct = Math.min(100, Math.max(0, gpuTemp));
  let tempColor = 'from-cyan-400 to-blue-500';
  let textColor = 'text-cyan-200';
  if (tempPct > 50 && tempPct < 85) {
    tempColor = 'from-amber-400 to-orange-500';
    textColor = 'text-amber-200';
  } else if (tempPct >= 85) {
    tempColor = 'from-rose-500 to-rose-600';
    textColor = 'text-rose-200';
  }

  const chip = 'hud-chip';

  return (
    <div className={`hud-top hud-safe-top ${isSecTheme ? 'hud-top--sec' : ''}`}>
      {/* Zeile 1: Name links, Aktionen rechts */}
      <div className="flex items-center justify-between gap-2 px-3 pt-1 pointer-events-auto">
        {isEditingName ? (
          <form onSubmit={handleSaveName} className="flex items-center gap-1">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="px-2 py-0.5 rounded text-sm font-bold bg-slate-900/80 text-cyan-200 border border-cyan-500 focus:outline-none"
              autoFocus
            />
            <button type="submit" className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-500 text-slate-950">
              {tr('saveLabel')}
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="flex items-center gap-1.5 min-w-0 hover:opacity-80 transition-opacity group hud-text"
          >
            <span className="font-extrabold text-xs tracking-wider uppercase truncate">{startupName}</span>
            <Edit3 className="w-3 h-3 opacity-60 group-hover:opacity-100 shrink-0" />
            {hasAiDomainBonus && (
              <span className="bg-amber-400/30 text-amber-100 border border-amber-300/60 font-mono text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                <Sparkles className="w-3 h-3" />
                {tr('aiHypeBonusLabel')}
              </span>
            )}
          </button>
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={lang}
            onChange={(e) => setLang && setLang(e.target.value)}
            aria-label="Language"
            className="hud-round-btn hud-round-btn--wide text-[11px] font-mono font-black"
          >
            <option value="de">DE</option>
            <option value="en">EN</option>
          </select>
          <button onClick={onOpenManual} title={tr('openManual')} className="hud-round-btn text-amber-200">
            <BookOpen className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenPitchDeck}
            title={tr('sharePitchDeckTitle')}
            className="hud-round-btn bg-gradient-to-r from-amber-400 via-fuchsia-500 to-cyan-400 text-slate-950 border-amber-200"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Zeile 2: Bewertung groß, darunter drei Chips */}
      <div className="text-center px-3 mt-1 hud-text">
        <div className="text-[10px] uppercase tracking-[0.25em] font-bold opacity-90 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" />
          {tr('valuationHypeTierLabel')} {hypeTier}/10
        </div>
        <div className={`hud-valuation ${isSecTheme ? 'text-[#38512E]' : 'text-emerald-300'}`}>
          {formatExactValuation(valuation)}
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-1 flex-wrap">
          <span className={`${chip} hud-chip--cyan`}>
            {tr('netVps')} {netFlow >= 0 ? '+' : ''}{formatCurrency(netFlow ?? vps)}/s
          </span>
          <span className={`${chip} hud-chip--rose`}>
            {tr('burnRate')} {(burnRate * 100).toFixed(1)}%/s
          </span>
          {powerClickActive && (
            <span className={`${chip} hud-chip--amber animate-pulse`}>
              <Zap className="w-3 h-3" /> x2
            </span>
          )}
        </div>
      </div>

      {/* Zeile 3: Hitzebalken, schmal */}
      <div className="mx-auto mt-1.5 w-full max-w-xs px-3 hud-text">
        <div className="flex justify-between items-center text-[10px] font-mono mb-0.5">
          <span className={`flex items-center gap-1 font-bold ${textColor}`}>
            <Flame className="w-3 h-3" />
            {tr('gpuHeatLabel')} {gpuTemp.toFixed(0)}°C
          </span>
          {isOverheated ? (
            <span className="text-rose-200 font-extrabold flex items-center gap-1 animate-pulse">
              <ShieldAlert className="w-3 h-3" /> {tr('overheatedLabel')}
            </span>
          ) : (
            <span className="opacity-80">
              {gpuTemp < 50 ? tr('tempOptimal') : gpuTemp < 85 ? tr('tempWarm') : tr('tempCritical')}
            </span>
          )}
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-900/50 border border-white/20">
          <div
            className={`h-full bg-gradient-to-r ${tempColor} transition-all duration-200 ${isOverheated ? 'overheat-pulse' : ''}`}
            style={{ width: `${tempPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
