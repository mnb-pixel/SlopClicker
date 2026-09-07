import React, { useEffect, useRef } from 'react';
import { Megaphone } from 'lucide-react';
import { ADSENSE_CLIENT_ID, isAdsenseConfigured, loadAdsense } from '../monetization/adsensePlacement';
import { useAdConsent } from '../monetization/adConsentStore';

// Werbe-Slot: rendert eine echte Google-AdSense-Anzeige (Ad Placement API/adsbygoogle.js,
// siehe monetization/adsensePlacement.js), sobald sowohl eine Client-ID (VITE_ADSENSE_
// CLIENT_ID) als auch eine Slot-ID für das jeweilige Format konfiguriert sind UND
// Werbe-Cookie-Consent erteilt wurde (Klaro, siehe adConsentStore.js) - andernfalls bleibt
// es beim reinen Platzhalter-Kasten von vorher. Nach einem kurzen Adsterra-Zwischenspiel
// (Banner, Native Banner, Popunder - Netzwerk wirkte zu "shady") war länger kein Anbieter
// aktiv; AdSense ist jetzt der feststehende Anbieter, die Slot-IDs fehlen aber noch (siehe
// .env) - bis die dort eingetragen sind, verhält sich diese Komponente exakt wie vorher.
const SIZES = {
  leaderboard: 'h-[50px] md:h-[90px] max-w-[728px]', // Footer-Leiste
  rectangle: 'h-[250px] max-w-[300px]', // Sidebar/Modal-Slot
  // Kopfzeilen-Slot (Desktop): Half-Banner-Format neben der Bewertung. Bewusst flach -
  // der Header ist sticky, jeder zusätzliche Pixel Höhe geht dauerhaft vom Spielfeld ab.
  // Die Breite darf schrumpfen (w-full), damit der Slot auf schmalen Desktops nicht die
  // Bewertung aus der Mitte drückt.
  headerBanner: 'h-[60px] max-w-[468px]',
};

// Anzeigenblock-IDs pro Format, in AdSense selbst angelegt - noch leer (siehe .env). Fehlt
// die Slot-ID für ein Format, zeigt AdBanner dafür weiter den Platzhalter statt eine <ins>
// ohne data-ad-slot zu rendern.
const SLOT_IDS = {
  leaderboard: import.meta.env.VITE_ADSENSE_SLOT_LEADERBOARD || '',
  rectangle: import.meta.env.VITE_ADSENSE_SLOT_RECTANGLE || '',
  headerBanner: import.meta.env.VITE_ADSENSE_SLOT_HEADER || '',
};

// true erst, sobald VITE_ADSENSE_CLIENT_ID gesetzt ist (nach AdSense-Freischaltung) - siehe
// adsensePlacement.js. Weiterhin exportiert: App.jsx macht daran den Platzbedarf (Anker-
// Leiste unten, Padding) fest, Header.jsx den Kopfzeilen-Anzeigen-Slot.
export const ADS_ENABLED = isAdsenseConfigured();

export function AdBanner({ variant = 'leaderboard', label = 'Werbung', adFree = false }) {
  // Hooks müssen unabhängig von den früheren Returns unten IMMER in derselben Reihenfolge
  // laufen (Rules of Hooks) - deshalb hier oben, die eigentlichen "verstecken"-Entscheidungen
  // fallen erst danach in showRealAd/hidden.
  const hasConsent = useAdConsent();
  const insRef = useRef(null);
  const pushedRef = useRef(false);

  // Nativ (iOS): die eigentliche Banner-Anzeige ist kein DOM-Element, sondern ein natives
  // Overlay, das AdMob selbst positioniert (siehe monetization/nativeBanner.js, von App.jsx
  // anhand von adFree gesteuert). Dieser Slot ist rein für Web gedacht und würde nativ nur
  // eine leere, verwirrende zweite Fläche zeigen.
  const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();
  const slotId = SLOT_IDS[variant] || '';
  // Werbefrei-IAP: kein Platzhalter, kein Ad-SDK - die Fläche verschwindet komplett statt nur
  // leer/ausgegraut dazustehen (siehe docs/ios-app-konzept.md §2, Punkt 1).
  const hidden = !ADS_ENABLED || adFree || isNative;
  const showRealAd = !hidden && !!slotId && hasConsent;

  // Pusht die Anzeige erst, wenn wirklich eine echte gerendert wird UND adsbygoogle.js
  // geladen ist - pushedRef verhindert einen zweiten Push auf dasselbe <ins>-Element bei
  // einem Re-Render (AdSense wirft dafür einen Fehler: "already have ads in this slot").
  useEffect(() => {
    if (!showRealAd || pushedRef.current || !insRef.current) return;
    pushedRef.current = true;
    loadAdsense().then((ready) => {
      if (!ready) return;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense push failed:', e);
      }
    });
  }, [showRealAd]);

  if (hidden) return null;

  if (showRealAd) {
    return (
      <div className="w-full flex justify-center">
        <ins
          ref={insRef}
          className={`adsbygoogle block ${SIZES[variant] || SIZES.leaderboard}`}
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={slotId}
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div
        className={`w-full ${SIZES[variant] || SIZES.leaderboard} rounded-xl border border-dashed border-slate-700 bg-slate-900/60 flex items-center justify-center gap-2 text-slate-500`}
      >
        <Megaphone className="w-3.5 h-3.5 shrink-0" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{label}</span>
      </div>
    </div>
  );
}
