import React, { useState, forwardRef } from 'react';
import { Flame, Edit3, Sparkles, ShieldAlert, Cpu, ChevronUp, ChevronDown, BookOpen, Share2 } from 'lucide-react';
import { formatCurrency, formatExactValuation, formatNumber } from '../utils/formatters';
import { NewsTicker } from './NewsTicker';
import { AdBanner } from './AdBanner';

// forwardRef, damit App.jsx die tatsächliche Höhe DES <header>-Elements messen kann (für
// Sticky-Elemente, die direkt darunter andocken sollen). Ein zusätzlicher Wrapper-Div um
// Header herum wäre hierfür der falsche Weg: dessen Elternbox wäre exakt so hoch wie der
// Header selbst und würde position:sticky jeden Spielraum nehmen - der Header würde beim
// Scrollen komplett verschwinden statt oben kleben zu bleiben.
export const Header = forwardRef(function Header({
  startupName,
  setStartupName,
  hasAiDomainBonus,
  valuation,
  vps,
  grossVps,
  netFlow,
  slopCount,
  gpuTemp,
  isOverheated,
  themeMode,
  hypeTier,
  burnRate,
  onOpenManual,
  onOpenShare,
  lang = 'de',
  setLang,
  logs,
  // Nur in der Desktop-Ansicht true: die Mobil-Ansicht hat bereits den Anchor-Slot über
  // der Tab-Leiste, zwei Flächen gleichzeitig wären eine zu viel (und der md:-Breakpoint
  // allein würde auf Tablets mit Mobile-UA genau das auslösen).
  showAdSlot = false,
  adFree = false,
  t,
}, ref) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(startupName);
  // Default true (eingeklappt): mit dem WERBEFREI-Button dazu passen Sprache+Handbuch+
  // Werbefrei+Teilen nicht mehr alle nebeneinander in den Startzustand - der Name-Bereich
  // wurde dadurch auf 0px gequetscht und war unsichtbar (gemeldetes "Name verdeckt").
  // Eingeklappt bleiben nur Collapse-Toggle + Werbefrei + Teilen sichtbar, das passt.
  const [buttonsCollapsed, setButtonsCollapsed] = useState(true);

  const handleSaveName = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setStartupName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const isSecTheme = themeMode === 'sec_prospectus';
  const tempPct = Math.min(100, Math.max(0, gpuTemp));
  let tempColor = 'from-cyan-500 to-blue-600';
  let textColor = 'text-cyan-400';
  if (tempPct > 50 && tempPct < 85) {
    tempColor = 'from-amber-400 to-orange-500';
    textColor = 'text-amber-400';
  } else if (tempPct >= 85) {
    tempColor = 'from-rose-500 to-rose-600';
    textColor = 'text-rose-400';
  }

  const tr = t || ((k) => k);

  return (
    <header ref={ref} className={`${
      isSecTheme
        ? 'bg-[#FBF9F5] border-b-4 border-slate-900 text-slate-900 shadow-md font-serif'
        : 'bg-slate-900/95 backdrop-blur-md border-b border-cyan-500/20 text-slate-100'
    } sticky top-0 z-40 p-3 header-safe-top w-full transition-colors`}>
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        {/* Official Header Banner in Ledger Mode */}
        {isSecTheme && (
          <div className="border-2 border-slate-900 bg-[#F4F1EA] p-2 flex items-center justify-between text-[11px] font-serif font-bold uppercase tracking-wider border-b-2">
            <div className="flex items-center gap-2">
              <span className="bg-slate-900 text-[#F4F1EA] px-2 py-0.5 font-mono text-[10px] font-black">
                PROSPECTUS
              </span>
              <span>{tr('formHeader')}</span>
            </div>
            <span className="font-mono text-[10px]">AUDIT VERIFIED</span>
          </div>
        )}

        {/* Financial Newswire Ticker: live game events mixed with satirical filler headlines */}
        <NewsTicker logs={logs} lang={lang} hypeTier={hypeTier} burnRate={burnRate} isSecTheme={isSecTheme} t={t} />

        {/* Top Row: Startup Name, Theme Switcher & View Mode.
            flex-nowrap statt flex-wrap: bei flex-wrap kippte diese Zeile je nach Länge des
            Startup-Namens bzw. je nachdem ob der AI-Domain-Bonus-Badge gerade sichtbar war
            zwischen ein- und zweizeilig um - sichtbar als "Springen" des Bereichs oben
            (gemeldeter Bug). Stattdessen bekommt der Name-Bereich min-w-0+truncate und
            schrumpft bei Platzmangel, die Buttons rechts bleiben mit shrink-0 stabil in
            fester Breite - die Zeile bleibt so immer genau eine Zeile hoch.
            overflow-hidden auf dem Name-Wrapper ist Pflicht, sobald min-w-0 im Spiel ist.
            Der AI-Domain-Badge steht bewusst in einer EIGENEN Zeile unter dem Namen statt
            daneben: als Geschwister in derselben Zeile war er (shrink-0, feste Breite)
            immer im Vorteil gegenüber dem Namen (flex-shrink:1) und hat ihn bei kurzen
            Namen mit ".ai"-Endung auf einen unlesbaren Rest gequetscht (gemeldeter Bug -
            derselbe Namens-Squeeze wie beim WERBEFREI-Button, nur diesmal durch den Badge
            statt durch Buttons rechts). In der eigenen Zeile konkurriert er mit nichts. */}
        <div className="flex items-center justify-between gap-2 flex-nowrap">
          {isEditingName ? (
            <form onSubmit={handleSaveName} className="flex items-center gap-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className={`px-2 py-0.5 rounded text-sm font-bold focus:outline-none ${
                  isSecTheme ? 'bg-[#2A3C50] text-[#EAE7DA] border border-[#8A6A1F]' : 'bg-slate-800 text-cyan-300 border border-cyan-500'
                }`}
                autoFocus
              />
              <button type="submit" className={`px-2 py-0.5 rounded text-xs font-bold ${
                isSecTheme ? 'bg-[#8A6A1F] text-slate-950' : 'bg-cyan-500 text-slate-950'
              }`}>
                {tr('saveLabel')}
              </button>
            </form>
          ) : (
            <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
              <button
                onClick={() => setIsEditingName(true)}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity group"
              >
                <span className={`font-extrabold text-sm tracking-wider uppercase ${
                  isSecTheme
                    ? 'text-[#EAE7DA] font-serif underline decoration-[#8A6A1F]'
                    : 'bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent'
                }`}>
                  {startupName}
                </span>
                <Edit3 className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
              </button>

              {hasAiDomainBonus && (
                <span className="mt-0.5 self-start max-w-full bg-amber-400/20 text-amber-300 border border-amber-400/60 font-mono text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md shadow-amber-500/20 animate-pulse whitespace-nowrap">
                  <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                  <span className="truncate">{tr('aiHypeBonusLabel')}</span>
                </span>
              )}
            </div>
          )}

          {/* Right Action Buttons - kollabierbar auf nur den SHARE-Button (Punkt 12) */}
          <div className="flex items-center gap-2">
            {/* Collapse/Expand Toggle */}
            <button
              onClick={() => setButtonsCollapsed((prev) => !prev)}
              title={buttonsCollapsed ? tr('showButtonsTitle') : tr('hideButtonsTitle')}
              className="p-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500 text-xs transition-all flex items-center justify-center"
            >
              {buttonsCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>

            {!buttonsCollapsed && (
              <>
                {/* Language Switcher Button */}
                <select
                  value={lang}
                  onChange={(e) => setLang && setLang(e.target.value)}
                  className={`px-1.5 py-1 rounded text-xs font-mono font-black border transition-all cursor-pointer ${
                    isSecTheme ? 'bg-[#F4F1EA] text-slate-900 border-slate-900' : 'bg-slate-800 text-cyan-300 border-slate-700'
                  }`}
                >
                  <option value="de">🇩🇪 DE</option>
                  <option value="en">🇬🇧 EN</option>
                </select>

                {/* Game Manual Button */}
                <button
                  onClick={onOpenManual}
                  title={tr('openManual')}
                  className="p-1 rounded-full bg-slate-800 text-amber-300 border border-amber-500/40 hover:border-amber-400 text-xs transition-all flex items-center justify-center"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* Top Bar Prominent Virality SHARE Button - immer sichtbar */}
            <button
              onClick={onOpenShare}
              title={tr('sharePitchDeckTitle')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-fuchsia-500 to-cyan-400 text-slate-950 hover:brightness-110 active:scale-95 shadow-md shadow-fuchsia-500/20 transition-all border border-amber-300/60"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-950" />
              <span>🚀 {tr('shareLabel')}</span>
            </button>
          </div>
        </div>

        {/* Valuation Display + Desktop-Werbeslot.
            Der Slot sitzt rechts NEBEN der Bewertung, nicht darunter: der Header ist das
            einzige dauerhaft sichtbare (sticky) Element der Desktop-Ansicht, eine Fläche
            hier ist also in jedem Scroll-Zustand im Viewport - anders als der frühere
            Rectangle-Slot unter dem Clicker, der auf niedrigen Laptop-Displays aus der
            sticky Spalte unten herauslief.
            Der leere Spacer links spiegelt den Slot, damit die Bewertung optisch in der
            Seitenmitte bleibt statt durch die Anzeige nach links zu rutschen.
            Die Breiten-Aufteilung ist bewusst herum: die Bewertung ist der Kern der
            Kopfzeile und bekommt mit shrink-0 ihre volle Content-Breite, Spacer und Slot
            teilen sich per flex-1 nur den REST (gedeckelt auf 468px, das Half-Banner-
            Maß). Andersherum - fester Slot, flexible Bewertung - brach die Zeile
            "Netto-VPS / Burn / Slop" auf drei Zeilen um und der Header wurde höher. */}
        <div className="my-0.5 flex items-center justify-center gap-3">
          {showAdSlot && <div className="hidden md:block flex-1 min-w-0 max-w-[468px]" aria-hidden="true" />}

          {/* Ohne Slot (Mobil-Ansicht) bleibt es bei flex-1: die Bewertung darf dort die
              volle Breite nutzen UND umbrechen, sonst könnte ein sehr langer Betrag auf
              schmalen Displays seitlich aus dem Viewport laufen. */}
          <div className={`text-center ${showAdSlot ? 'shrink-0' : 'flex-1'}`}>
            <div className="text-[11px] uppercase tracking-widest font-bold flex items-center justify-center gap-1 opacity-80">
              <Sparkles className={`w-3.5 h-3.5 ${isSecTheme ? 'text-[#8A6A1F]' : 'text-cyan-400'}`} />
              {tr('valuationHypeTierLabel')} {hypeTier}/10
            </div>
            <div className={`text-3xl md:text-4xl font-black tracking-tight font-mono ${
              isSecTheme ? 'text-[#38512E]' : 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]'
            }`}>
              {formatExactValuation(valuation)}
            </div>
            <div className="flex items-center justify-center gap-3 text-xs mt-0.5">
              <span className={isSecTheme ? 'text-[#38512E] font-bold' : 'text-cyan-400 font-semibold'}>
                {tr('netVps')} {netFlow >= 0 ? '+' : ''}{formatCurrency(netFlow ?? vps)}/s
              </span>
              <span className="opacity-40">•</span>
              <span className={`font-mono font-bold ${isSecTheme ? 'text-[#8C2F26]' : 'text-rose-400'}`}>
                {tr('burnRate')} {(burnRate * 100).toFixed(1)}%/s
              </span>
              <span className="opacity-40">•</span>
              <span className="opacity-80 font-semibold flex items-center gap-0.5">
                <Cpu className="w-3 h-3 inline" /> {tr('slopCount')} {formatNumber(slopCount)}
              </span>
            </div>
          </div>

          {showAdSlot && (
            <div className="hidden md:flex flex-1 min-w-0 max-w-[468px]">
              <AdBanner variant="headerBanner" label={tr('adPlaceholderLabel')} adFree={adFree} />
            </div>
          )}
        </div>

        {/* GPU Temperature Bar */}
        <div className={`${isSecTheme ? 'bg-[#14202C] border-[#8A6A1F]/40' : 'bg-slate-950 border-slate-800'} p-2 rounded-lg border relative`}>
          <div className="flex justify-between items-center text-xs mb-1 font-mono">
            <span className={`flex items-center gap-1 font-bold ${textColor}`}>
              <Flame className="w-3.5 h-3.5" />
              {tr('gpuHeatLabel')} {gpuTemp.toFixed(1)}°C
            </span>
            {isOverheated ? (
              <span className="text-rose-500 font-extrabold flex items-center gap-1 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5" /> {tr('overheatedLabel')}
              </span>
            ) : (
              <span className="opacity-70 text-[10px]">
                {gpuTemp < 50 ? tr('tempOptimal') : gpuTemp < 85 ? tr('tempWarm') : tr('tempCritical')}
              </span>
            )}
          </div>

          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden relative border border-slate-700">
            <div
              className={`h-full bg-gradient-to-r ${tempColor} transition-all duration-200 ${
                isOverheated ? 'overheat-pulse' : ''
              }`}
              style={{ width: `${tempPct}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
});
