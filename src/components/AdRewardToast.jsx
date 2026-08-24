import React, { useEffect } from 'react';
import { CheckCircle2, WifiOff } from 'lucide-react';

// Kurze, selbst-verschwindende Bestätigung/Rückmeldung direkt nach einer Rewarded Ad -
// ergänzt den Log-Eintrag (der im scrollenden Ticker leicht übersehen wird) um eine
// unübersehbare Rückmeldung. variant 'success': Bonus wurde gutgeschrieben. 'failed': keine
// Ad verfügbar/geladen, kein Bonus - ohne dieses Toast war der Fehlschlag nur eine
// Ticker-Zeile unter vielen und leicht zu übersehen (gemeldet als "keine Info").
const VARIANTS = {
  success: {
    icon: CheckCircle2,
    className: 'bg-emerald-950/95 border-emerald-400/80 text-emerald-200',
    iconClassName: 'text-emerald-400',
  },
  failed: {
    icon: WifiOff,
    className: 'bg-amber-950/95 border-amber-400/80 text-amber-200',
    iconClassName: 'text-amber-400',
  },
};

export function AdRewardToast({ adRewardToast, dismissAdRewardToast }) {
  useEffect(() => {
    if (!adRewardToast) return;
    const timer = setTimeout(dismissAdRewardToast, 3000);
    return () => clearTimeout(timer);
  }, [adRewardToast, dismissAdRewardToast]);

  if (!adRewardToast) return null;

  const { icon: Icon, className, iconClassName } = VARIANTS[adRewardToast.variant] || VARIANTS.success;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] px-4 w-full max-w-md pointer-events-none animate-fadeIn">
      <div className={`${className} border-2 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-2 text-sm font-bold`}>
        <Icon className={`w-5 h-5 shrink-0 ${iconClassName}`} />
        <span>{adRewardToast.message}</span>
      </div>
    </div>
  );
}
