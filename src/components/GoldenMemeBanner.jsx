import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldAlert, Tv, Gift, X, Zap } from 'lucide-react';

// Golden Memes sind selten (~20 Min) und laufen NICHT mehr automatisch an: das Banner ist ein
// zeitlich begrenztes Angebot, das ohne adFree ausschließlich per Rewarded Ad eingelöst wird
// (mit adFree ein Instant-Claim, siehe requestBonus in useGameStore.js). Nach dem Claim
// bleibt dasselbe Banner als Boost-Anzeige stehen, bis der Effekt ausläuft.
// Bubble Pops bleiben rein informativ - der Debuff wirkt sofort, die Ad/der Claim beendet ihn vorzeitig.
export function GoldenMemeBanner({ activeEvent, dismissEvent, adState, requestBonus, isAdReady, adFree = false, t, tf }) {
  const expiresAt = activeEvent?.expiresAt ?? 0;
  const [remainingMs, setRemainingMs] = useState(0);

  // Eigener Takt statt Store-Timer: das Banner ist die einzige Stelle, die den Countdown
  // braucht, und so rendert der Rest des Spiels dafür nicht mit.
  useEffect(() => {
    if (!expiresAt) return undefined;
    const update = () => setRemainingMs(Math.max(0, expiresAt - Date.now()));
    update();
    const id = setInterval(update, 100);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!activeEvent) return null;

  const tr = t || ((k) => k);
  const trf = tf || ((k, vars = {}) => Object.entries(vars).reduce((s, [n, v]) => s.replaceAll(`{${n}}`, v), tr(k)));

  const isBubble = activeEvent.kind === 'bubble';
  const isClaimed = !isBubble && activeEvent.claimed;
  const title = tr(`event_${activeEvent.id}_title`);
  const desc = tr(`event_${activeEvent.id}_desc`);

  const adType = isBubble ? 'bubble_clear' : 'golden_claim';
  const isAdPlaying = adState?.type === adType;
  const adReady = !requestBonus || !isAdReady || isAdReady(adType);
  // Nach dem Claim gibt es nichts mehr zu holen - dann ist das Banner reine Statusanzeige.
  const showAdButton = Boolean(requestBonus) && !isClaimed;

  const accent = isBubble
    ? {
        card: 'bg-rose-950/95 border-rose-500 text-rose-100 shadow-rose-600/40',
        icon: 'bg-rose-500 text-slate-950',
        title: 'text-rose-300',
        bar: 'bg-rose-400',
        cta: 'bg-rose-500 hover:bg-rose-400 active:bg-rose-500 text-slate-950',
      }
    : {
        card: 'bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-amber-400 text-amber-100 shadow-amber-500/40',
        icon: 'bg-amber-400 text-slate-950',
        title: 'text-amber-300',
        bar: 'bg-amber-400',
        cta: 'bg-amber-400 hover:bg-amber-300 active:bg-amber-400 text-slate-950',
      };

  // Countdown-Balken: vor dem Claim die Überlegzeit, danach die Boost-Restlaufzeit.
  const secondsLeft = Math.ceil(remainingMs / 1000);
  const totalMs = Math.max(1, expiresAt - (activeEvent.startedAt ?? expiresAt));
  const progressPct = Math.min(100, Math.max(0, (remainingMs / totalMs) * 100));

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-3 pointer-events-auto">
      <div className={`w-full p-3 md:p-4 rounded-2xl border-4 shadow-2xl golden-meme-pulse ${accent.card}`}>
        {/* min-w-0 auf dem Textblock: ohne das kann der Titel nicht umbrechen und drückt
            die rechte Spalte aus dem Banner heraus (lange Event-Titel, schmale Displays). */}
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-full shrink-0 ${accent.icon}`}>
            {isBubble ? <ShieldAlert className="w-5 h-5" /> : isClaimed ? <Zap className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className={`font-black text-sm md:text-base uppercase tracking-wide break-words ${accent.title}`}>
              {title}
            </div>
            <div className="text-[11px] md:text-sm font-medium opacity-90 text-slate-200 mt-0.5 break-words">
              {isClaimed ? trf('memeBoostActive', { sec: secondsLeft }) : desc}
            </div>
          </div>

          <button
            onClick={dismissEvent}
            aria-label={tr('dismissLabel')}
            className="shrink-0 p-1.5 -m-1 rounded-lg text-slate-300/70 hover:text-slate-100 hover:bg-slate-950/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ablauf-Countdown: macht die Überlegzeit sichtbar, statt sie still verstreichen zu lassen */}
        <div className="mt-2.5">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-300/80 mb-1">
            <span>{isBubble ? tr('bubbleDebuffRemaining') : isClaimed ? tr('memeBoostRemaining') : tr('memeExpiresLabel')}</span>
            <span className="tabular-nums">{secondsLeft}s</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-950/50 overflow-hidden">
            <div
              className={`h-full rounded-full transition-[width] duration-200 ease-linear ${accent.bar}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {showAdButton && (
          <button
            onClick={() => {
              if (adReady && !isAdPlaying) requestBonus(adType);
            }}
            disabled={!adReady || isAdPlaying}
            className={`mt-2.5 w-full py-3 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
              isAdPlaying
                ? 'bg-slate-950/80 border border-current text-slate-100 animate-pulse'
                : adReady
                ? `${accent.cta} active:scale-[0.98]`
                : 'bg-slate-950/40 border border-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {adFree ? <Gift className="w-4 h-4 shrink-0" /> : <Tv className="w-4 h-4 shrink-0" />}
            <span className="break-words">
              {isAdPlaying
                ? `${tr('adPlaying')} (${adState.timer}s)`
                : isBubble
                ? tr('endDebuffLabel')
                : tr('claimMemeBtn')}
            </span>
          </button>
        )}

        {!isBubble && !isClaimed && (
          <div className="mt-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {adFree ? tr('memeInstantHint') : tr('memeAdOnlyHint')}
          </div>
        )}
      </div>
    </div>
  );
}
