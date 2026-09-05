import React from 'react';
import { Megaphone } from 'lucide-react';

// Statischer Werbe-Slot-Platzhalter. Nach einem kurzen Adsterra-Zwischenspiel (Banner,
// Native Banner, Popunder - Netzwerk wirkte zu "shady") wieder auf reinen Platzhalter
// zurückgesetzt, bis ein neuer Anbieter feststeht. Klaro/Cookie-Consent (siehe
// monetization/klaroLoader.js, adConsentStore.js) bleibt bewusst bestehen, damit die
// Einwilligungs-Basis für den nächsten Anbieter schon da ist - dieser Platzhalter selbst
// lädt aber nichts, setzt keine Cookies und braucht deshalb keinen Consent-Check.
const SIZES = {
  leaderboard: 'h-[50px] md:h-[90px] max-w-[728px]', // Footer-Leiste
  rectangle: 'h-[250px] max-w-[300px]', // Sidebar/Modal-Slot
  // Kopfzeilen-Slot (Desktop): Half-Banner-Format neben der Bewertung. Bewusst flach -
  // der Header ist sticky, jeder zusätzliche Pixel Höhe geht dauerhaft vom Spielfeld ab.
  // Die Breite darf schrumpfen (w-full), damit der Slot auf schmalen Desktops nicht die
  // Bewertung aus der Mitte drückt.
  headerBanner: 'h-[60px] max-w-[468px]',
};

// Vorübergehend deaktiviert, bis ein neuer Werbe-Anbieter feststeht. Zurück auf true,
// sobald ein echtes Ad-Netzwerk-Snippet hier rein soll.
export const ADS_ENABLED = false;

export function AdBanner({ variant = 'leaderboard', label = 'Werbung', adFree = false }) {
  if (!ADS_ENABLED) return null;
  // Werbefrei-IAP: kein Platzhalter, kein Ad-SDK - die Fläche verschwindet komplett statt nur
  // leer/ausgegraut dazustehen (siehe docs/ios-app-konzept.md §2, Punkt 1).
  if (adFree) return null;
  // Nativ (iOS): die eigentliche Banner-Anzeige ist kein DOM-Element, sondern ein
  // natives Overlay, das AdMob selbst positioniert (siehe monetization/nativeBanner.js,
  // von App.jsx anhand von adFree gesteuert). Dieser Platzhalter-Kasten ist rein für Web
  // gedacht und würde nativ nur eine leere, verwirrende zweite Fläche zeigen.
  const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();
  if (isNative) return null;
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
