import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

// Kurze, selbst-verschwindende Bestätigung direkt nach einer abgeschlossenen Rewarded Ad -
// ergänzt den Log-Eintrag (der im scrollenden Ticker leicht übersehen wird) um eine
// unübersehbare Rückmeldung, dass der Bonus jetzt gutgeschrieben wurde.
export function AdRewardToast({ adRewardToast, dismissAdRewardToast }) {
  useEffect(() => {
    if (!adRewardToast) return;
    const timer = setTimeout(dismissAdRewardToast, 3000);
    return () => clearTimeout(timer);
  }, [adRewardToast, dismissAdRewardToast]);

  if (!adRewardToast) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] px-4 w-full max-w-md pointer-events-none animate-fadeIn">
      <div className="bg-emerald-950/95 border-2 border-emerald-400/80 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-2 text-sm font-bold text-emerald-200">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <span>{adRewardToast.message}</span>
      </div>
    </div>
  );
}
