import React from 'react';
import { Sparkles, ShieldAlert, Tv } from 'lucide-react';

// Konzept Abschnitt 14: Effekte werden beim Spawnen automatisch angewendet (kein
// Timing-Minispiel), das Banner ist rein informativ und kann weggeklickt werden.
export function GoldenMemeBanner({ activeEvent, dismissEvent, adState, startAd, isAdReady, t }) {
  if (!activeEvent) return null;

  const tr = t || ((k) => k);
  const isBubble = activeEvent.kind === 'bubble';
  const title = tr(`event_${activeEvent.id}_title`);
  const desc = tr(`event_${activeEvent.id}_desc`);
  const adType = isBubble ? 'bubble_clear' : 'golden_extend';
  const adLabel = isBubble ? 'Debuff sofort beenden' : 'Event um 15s verlängern';
  const isAdPlaying = adState?.type === adType;
  const adReady = !startAd || !isAdReady || isAdReady(adType);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 pointer-events-auto">
      <div
        className={`w-full p-4 rounded-2xl border-4 shadow-2xl transition-all golden-meme-pulse ${
          isBubble
            ? 'bg-rose-950/95 border-rose-500 text-rose-100 shadow-rose-600/40'
            : 'bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-amber-400 text-amber-100 shadow-amber-500/40'
        }`}
      >
        <button
          onClick={dismissEvent}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full font-black animate-spin shrink-0 ${
              isBubble ? 'bg-rose-500 text-slate-950' : 'bg-amber-400 text-slate-950'
            }`}>
              {isBubble ? <ShieldAlert className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
            </div>
            <div>
              <div className={`font-black text-base md:text-lg flex items-center gap-2 uppercase tracking-wider ${
                isBubble ? 'text-rose-300' : 'text-amber-300'
              }`}>
                {title}
              </div>
              <div className="text-xs md:text-sm font-medium opacity-90 text-slate-200 mt-0.5">
                {desc}
              </div>
            </div>
          </div>

          <span className={`text-xs md:text-sm font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-lg shrink-0 ml-2 ${
            isBubble
              ? 'bg-rose-500 hover:bg-rose-400 text-slate-950'
              : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
          }`}>
            {isBubble ? tr('noticedBtn') : tr('claimMemeBtn')}
          </span>
        </button>

        {startAd && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (adReady && !isAdPlaying) startAd(adType);
            }}
            disabled={!adReady || isAdPlaying}
            className={`mt-2 w-full py-2 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              isAdPlaying
                ? 'bg-slate-950/80 border border-amber-500 text-amber-300 animate-pulse'
                : adReady
                ? 'bg-slate-950/60 border border-slate-100/40 text-slate-100 hover:bg-slate-950/80 active:scale-95'
                : 'bg-slate-950/40 border border-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            {isAdPlaying ? `Ad läuft... (${adState.timer}s)` : `Video ansehen: ${adLabel}`}
          </button>
        )}
      </div>
    </div>
  );
}
