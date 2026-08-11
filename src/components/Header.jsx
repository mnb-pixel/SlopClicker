import React, { useState } from 'react';
import { Flame, Edit3, Sparkles, Zap, ShieldAlert, Cpu, ChevronUp, ChevronDown, BookOpen, Share2 } from 'lucide-react';
import { formatCurrency, formatExactValuation, formatNumber } from '../utils/formatters';
import { NewsTicker } from './NewsTicker';

export function Header({
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
  powerClicks,
  powerClickActive,
  togglePowerClick,
  themeMode,
  hypeTier,
  burnRate,
  onOpenManual,
  onOpenPitchDeck,
  lang = 'de',
  setLang,
  logs,
  t,
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(startupName);
  const [buttonsCollapsed, setButtonsCollapsed] = useState(false);

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
    <header className={`${
      isSecTheme
        ? 'bg-[#FBF9F5] border-b-4 border-slate-900 text-slate-900 shadow-md font-serif'
        : 'bg-slate-900/95 backdrop-blur-md border-b border-cyan-500/20 text-slate-100'
    } sticky top-0 z-40 p-3 w-full transition-colors`}>
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
        <NewsTicker logs={logs} lang={lang} hypeTier={hypeTier} burnRate={burnRate} isSecTheme={isSecTheme} />

        {/* Top Row: Startup Name, Theme Switcher & View Mode */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
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
                Save
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
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
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/60 font-mono text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md shadow-amber-500/20 animate-pulse">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>.AI HYPE BONUS (+10% VPS)</span>
                </span>
              )}
            </div>
          )}

          {/* Right Action Buttons - kollabierbar auf nur den SHARE-Button (Punkt 12) */}
          <div className="flex items-center gap-2">
            {/* Collapse/Expand Toggle */}
            <button
              onClick={() => setButtonsCollapsed((prev) => !prev)}
              title={buttonsCollapsed ? 'Buttons einblenden' : 'Buttons ausblenden'}
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
              onClick={onOpenPitchDeck}
              title="Share Startup Pitch Deck"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-fuchsia-500 to-cyan-400 text-slate-950 hover:brightness-110 active:scale-95 shadow-md shadow-fuchsia-500/20 transition-all border border-amber-300/60"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-950" />
              <span>🚀 SHARE</span>
            </button>

            {!buttonsCollapsed && (
              <button
                onClick={togglePowerClick}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold transition-all border ${
                  powerClickActive
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg animate-pulse'
                    : powerClicks > 0
                    ? isSecTheme ? 'bg-[#2A3C50] text-[#8A6A1F] border-[#8A6A1F]' : 'bg-slate-800 text-amber-400 border-amber-500/40'
                    : 'opacity-50 cursor-not-allowed border-slate-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{tr('powerTap')} {powerClicks}</span>
              </button>
            )}
          </div>
        </div>

        {/* Valuation Display */}
        <div className="text-center my-0.5">
          <div className="text-[11px] uppercase tracking-widest font-bold flex items-center justify-center gap-1 opacity-80">
            <Sparkles className={`w-3.5 h-3.5 ${isSecTheme ? 'text-[#8A6A1F]' : 'text-cyan-400'}`} />
            Valuation ($) • Hype Tier {hypeTier}/10
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

        {/* GPU Temperature Bar */}
        <div className={`${isSecTheme ? 'bg-[#14202C] border-[#8A6A1F]/40' : 'bg-slate-950 border-slate-800'} p-2 rounded-lg border relative`}>
          <div className="flex justify-between items-center text-xs mb-1 font-mono">
            <span className={`flex items-center gap-1 font-bold ${textColor}`}>
              <Flame className="w-3.5 h-3.5" />
              GPU Heat: {gpuTemp.toFixed(1)}°C
            </span>
            {isOverheated ? (
              <span className="text-rose-500 font-extrabold flex items-center gap-1 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5" /> OVERHEATED! (Cooling to 50°C)
              </span>
            ) : (
              <span className="opacity-70 text-[10px]">
                {gpuTemp < 50 ? 'Optimal' : gpuTemp < 85 ? 'Warm' : 'CRITICAL'}
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
}
