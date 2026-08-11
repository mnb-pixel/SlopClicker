import React, { useState } from 'react';
import { Flame, Edit3, Sparkles, Zap, ShieldAlert, Cpu, LayoutGrid, Smartphone, Volume2, VolumeX, BookOpen, Globe } from 'lucide-react';
import { formatCurrency, formatExactValuation, formatNumber } from '../utils/formatters';

export function Header({
  startupName,
  setStartupName,
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
  layoutMode,
  setLayoutMode,
  themeMode,
  toggleThemeMode,
  hypeTier,
  burnRate,
  soundEnabled,
  setSoundEnabled,
  setActiveTab,
  onOpenManual,
  lang = 'de',
  setLang,
  t,
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(startupName);

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
        {/* W-9 Official Header Banner in SEC Mode */}
        {isSecTheme && (
          <div className="border-2 border-slate-900 bg-[#F4F1EA] p-2 flex items-center justify-between text-[11px] font-serif font-bold uppercase tracking-wider border-b-2">
            <div className="flex items-center gap-2">
              <span className="bg-slate-900 text-[#F4F1EA] px-2 py-0.5 font-mono text-[10px] font-black">
                FORM W-9 / S-1
              </span>
              <span>{tr('formHeader')}</span>
            </div>
            <span className="font-mono text-[10px]">OMB No. 1545-0074</span>
          </div>
        )}

        {/* Financial Newswire Ticker */}
        <div className={`text-[10px] font-mono tracking-widest overflow-hidden whitespace-nowrap py-0.5 border-b ${
          isSecTheme ? 'bg-[#F4F1EA] text-slate-900 border-slate-900' : 'bg-slate-950 text-cyan-400/80 border-slate-800'
        }`}>
          <div className="inline-block animate-marquee uppercase font-bold">
            {tr('confidentialTicker')} {hypeTier}/10 • {tr('burnRate')} {(burnRate * 100).toFixed(1)}%/s • GREENWASHING CERTIFIED • INVESTOR RELATIONS RUNWAY ACTIVE •
          </div>
        </div>

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
          )}

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
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
              <option value="fr">🇫🇷 FR</option>
              <option value="es">🇪🇸 ES</option>
            </select>

            {/* Game Manual Button */}
            <button
              onClick={onOpenManual}
              title={tr('openManual')}
              className="p-1 rounded-full bg-slate-800 text-amber-300 border border-amber-500/40 hover:border-amber-400 text-xs transition-all flex items-center justify-center"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>

            {/* Quick Audio Mute / Unmute Button */}
            <button
              onClick={() => setSoundEnabled && setSoundEnabled(!soundEnabled)}
              title="Toggle Audio SFX"
              className={`p-1 rounded-full border text-xs transition-all ${
                soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Quick Settings Button */}
            <button
              onClick={() => setActiveTab && setActiveTab(5)}
              title="Open Settings & Misc"
              className="p-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 hover:border-cyan-400 text-xs transition-all"
            >
              <Cpu className="w-3.5 h-3.5" />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleThemeMode}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all border ${
                isSecTheme
                  ? 'bg-[#8A6A1F] text-slate-950 border-[#8A6A1F]'
                  : 'bg-slate-800 text-amber-300 border-amber-500/40 hover:border-amber-400'
              }`}
            >
              <span>{isSecTheme ? tr('themeLedger') : tr('themeCyber')}</span>
            </button>

            {/* View Switcher Button */}
            <button
              onClick={() => setLayoutMode(layoutMode === 'desktop' ? 'mobile' : 'desktop')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                isSecTheme
                  ? 'bg-[#2A3C50] text-[#EAE7DA] border-[#8A6A1F]/40 hover:border-[#8A6A1F]'
                  : 'bg-slate-800 text-cyan-300 border-cyan-500/30 hover:border-cyan-400'
              }`}
            >
              {layoutMode === 'desktop' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{tr('viewMobile')}</span>
                </>
              ) : (
                <>
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>{tr('viewDesktop')}</span>
                </>
              )}
            </button>

            {/* Power Click Badge */}
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
