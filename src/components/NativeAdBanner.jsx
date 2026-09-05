import React, { useEffect, useRef } from 'react';
import { isCrazyGamesBuild } from '../monetization/crazyGamesSdk';
import { useAdsterraConsent } from '../monetization/adConsentStore';
import { ADSTERRA_ENABLED } from '../monetization/adsterraToggle';

// Adsterra "Native Banner" (4 Bilder in einer Reihe): anders als die atOptions-Slots in
// AdBanner.jsx braucht dieses Format keine globale Options-Variable, sondern nur einen
// Container mit fester ID plus ein Script, das sich selbst dort hinein rendert - kein
// iframe-Isolations-Bedarf, da keine window-globale Kollisionsgefahr besteht.
const CONTAINER_ID = 'container-aa4252e217f78529ef13682c804080ca';
const SCRIPT_SRC = 'https://pl31205242.profitableratecpmnetwork.com/aa4252e217f78529ef13682c804080ca/invoke.js';

export function NativeAdBanner({ label = 'Werbung', adFree = false }) {
  const containerRef = useRef(null);
  const hasConsent = useAdsterraConsent();

  const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();
  // Klaro-Einwilligung (siehe klaroConfig.js/adConsentStore.js): ohne "Adsterra"-Consent
  // bleibt der Container leer statt das Skript ungefragt zu laden. ADSTERRA_ENABLED:
  // Kill-Switch (siehe adsterraToggle.js), unabhängig vom Consent-Status.
  const skip = !ADSTERRA_ENABLED || adFree || isNative || isCrazyGamesBuild() || !hasConsent;

  useEffect(() => {
    if (skip) return undefined;
    const container = containerRef.current;
    const script = document.createElement('script');
    script.async = true;
    script.dataset.cfasync = 'false';
    script.src = SCRIPT_SRC;
    container?.appendChild(script);
    return () => {
      script.remove();
    };
  }, [skip]);

  if (skip) return null;
  return (
    <div className="w-full flex flex-col items-center gap-1">
      <span className="text-[9px] font-mono uppercase tracking-widest text-slate-600">{label}</span>
      <div id={CONTAINER_ID} ref={containerRef} className="w-full" />
    </div>
  );
}
