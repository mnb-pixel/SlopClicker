import React from 'react';
import { Zap, Flame, ShieldAlert, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { BuildingVisualGrid } from '../BuildingVisualGrid';

export function SlopTab({
  handleTapAGI,
  isOverheated,
  gpuTemp,
  clickValue,
  activeEvent,
  catchGoldenMeme,
  powerClickActive,
  particles,
  buildings,
  boughtUpgrades,
  boughtGreenwashingLayoffs,
  themeMode,
  t,
}) {
  const isSecTheme = themeMode === 'sec_prospectus';
  const tr = t || ((k) => k);

  return (
    <div className="flex flex-col items-center justify-start gap-2 p-2 relative overflow-hidden">
      {/* SEC Form S-1 Confidential Watermark */}
      {isSecTheme && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-15 select-none z-0">
          <div className="text-5xl md:text-7xl font-black font-serif text-[#8A6A1F] -rotate-12 tracking-widest text-center border-8 border-dashed border-[#8A6A1F] p-6">
            {tr('watermark')}
          </div>
        </div>
      )}

      {/* Floating Particles Container */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="pointer-events-none fixed z-50 text-cyan-300 font-black text-xl animate-float-particle drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]"
          style={{ left: p.x - 20, top: p.y - 20 }}
        >
          {p.text}
        </div>
      ))}

      {/* Power Click Active Indicator */}
      {powerClickActive && (
        <div className="bg-amber-500/20 border border-amber-500 text-amber-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse mb-2 z-10">
          <Zap className="w-4 h-4 text-amber-400" />
          {tr('powerSurge')}
        </div>
      )}

      {/* Overheat Lock Warning */}
      {isOverheated && (
        <div className="bg-rose-950/90 border-2 border-rose-500 text-rose-200 p-4 rounded-xl text-center shadow-2xl overheat-pulse max-w-xs mb-4 z-10">
          <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-1 animate-bounce" />
          <h3 className="font-black text-lg uppercase tracking-wide">{tr('gpuOverheated')}</h3>
          <p className="text-xs text-rose-300 mt-1">
            {tr('gpuCooling')}
          </p>
        </div>
      )}

      {/* Central Big AGI GPU / SEC Seal Click Button */}
      <div className="flex flex-col items-center justify-center relative my-2 z-10">
        <div
          className={`absolute w-64 h-64 rounded-full blur-3xl transition-opacity duration-500 ${
            isOverheated
              ? 'bg-rose-600/40'
              : powerClickActive
              ? 'bg-amber-500/40'
              : isSecTheme
              ? 'bg-[#8A6A1F]/30'
              : 'bg-cyan-500/30'
          }`}
        />

        {isSecTheme ? (
          /* W-9 Form Official Tax Certificate Stamp Button */
          <button
            onClick={handleTapAGI}
            disabled={isOverheated}
            className={`relative w-64 h-56 rounded-lg border-4 border-slate-900 bg-[#FBF9F5] text-slate-900 flex flex-col items-center justify-center p-4 text-center transition-all transform active:scale-95 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] group overflow-hidden ${
              isOverheated ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-[#F4F1EA]'
            }`}
          >
            <div className="absolute top-0 left-0 right-0 bg-slate-900 text-[#F4F1EA] text-[9px] font-mono font-black py-0.5 px-2 uppercase tracking-widest flex justify-between">
              <span>{tr('sealHeader')}</span>
              <span>{tr('sealPart')}</span>
            </div>

            <div className="mt-3 text-[10px] font-mono tracking-widest text-slate-800 uppercase font-bold mb-1">
              {tr('sealTitle')}
            </div>
            <div className="bg-[#F4F1EA] p-3 rounded border-2 border-slate-900 my-1">
              <Sparkles className="w-8 h-8 text-slate-900" />
            </div>
            <span className="font-serif font-black text-base text-slate-900 tracking-wider uppercase">
              {tr('sealButtonText')}
            </span>
            <span className="text-[11px] font-mono text-[#166534] mt-1 font-bold">
              +{formatCurrency(clickValue)} {tr('perTap')}
            </span>
          </button>
        ) : (
          /* Cyberpunk AGI GPU Button */
          <button
            onClick={handleTapAGI}
            disabled={isOverheated}
            className={`relative w-56 h-56 rounded-full border-4 flex flex-col items-center justify-center p-3 text-center transition-all transform active:scale-95 shadow-2xl overflow-hidden group ${
              isOverheated
                ? 'bg-slate-900/90 border-rose-600 text-slate-600 cursor-not-allowed grayscale'
                : powerClickActive
                ? 'bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900 border-amber-400 text-amber-300 cyber-glow'
                : 'bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 border-cyan-400 text-cyan-300 cyber-glow hover:border-cyan-300'
            }`}
          >
            {/* GPU Chip Meme Background Graphic */}
            <img
              src="/gpu_chip_meme.jpg"
              alt="AGI GPU Meme"
              className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
            />

            <div className="relative z-10 bg-slate-950/80 p-2.5 rounded-full border border-cyan-500/40 mb-1">
              {isOverheated ? (
                <Flame className="w-8 h-8 text-rose-500 animate-pulse" />
              ) : (
                <Zap className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
              )}
            </div>

            <span className="relative z-10 font-black text-lg tracking-wider uppercase bg-gradient-to-r from-cyan-300 via-cyan-100 to-fuchsia-300 bg-clip-text text-transparent">
              {isOverheated ? 'MELTDOWN' : '⚡ GENERATE AGI ⚡'}
            </span>

            <span className="relative z-10 text-[11px] font-semibold text-slate-300 mt-0.5">
              +{formatCurrency(clickValue)} / tap (+2°C)
            </span>
          </button>
        )}
      </div>

      {/* Visual Building Grid (Owned Items Display in Middle) */}
      <BuildingVisualGrid
        buildings={buildings || {}}
        boughtUpgrades={boughtUpgrades || []}
        boughtGreenwashingLayoffs={boughtGreenwashingLayoffs || []}
      />
    </div>
  );
}
