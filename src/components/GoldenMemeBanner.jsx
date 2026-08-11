import React from 'react';
import { Sparkles, Zap, ShieldAlert } from 'lucide-react';

export function GoldenMemeBanner({ activeEvent, catchGoldenMeme, t }) {
  if (!activeEvent) return null;

  const tr = t || ((k) => k);
  const isWrath = activeEvent.type === 'wrath';
  const titleKey = `event_${activeEvent.id}_title`;
  const descKey = `event_${activeEvent.id}_desc`;

  const displayTitle = tr(titleKey) !== titleKey ? tr(titleKey) : activeEvent.title;
  const displayDesc = tr(descKey) !== descKey ? tr(descKey) : activeEvent.desc;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 pointer-events-auto animate-bounce">
      <button
        onClick={catchGoldenMeme}
        className={`w-full p-4 rounded-2xl border-4 flex items-center justify-between text-left shadow-2xl transition-all golden-meme-pulse ${
          isWrath
            ? 'bg-rose-950/95 border-rose-500 text-rose-100 shadow-rose-600/40'
            : 'bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-amber-400 text-amber-100 shadow-amber-500/40'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full font-black animate-spin shrink-0 ${
            isWrath ? 'bg-rose-500 text-slate-950' : 'bg-amber-400 text-slate-950'
          }`}>
            {isWrath ? <ShieldAlert className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
          </div>
          <div>
            <div className={`font-black text-base md:text-lg flex items-center gap-2 uppercase tracking-wider ${
              isWrath ? 'text-rose-300' : 'text-amber-300'
            }`}>
              {displayTitle}
            </div>
            <div className="text-xs md:text-sm font-medium opacity-90 text-slate-200 mt-0.5">
              {displayDesc}
            </div>
          </div>
        </div>

        <span className={`text-xs md:text-sm font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-lg shrink-0 ml-2 ${
          isWrath
            ? 'bg-rose-500 hover:bg-rose-400 text-slate-950'
            : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
        }`}>
          {isWrath ? tr('noticedBtn') : tr('claimMemeBtn')}
        </span>
      </button>
    </div>
  );
}
