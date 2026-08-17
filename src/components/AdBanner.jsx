import React from 'react';
import { Megaphone } from 'lucide-react';

// Statischer Werbe-Slot-Platzhalter. Rendert aktuell nur eine klar gekennzeichnete
// "Werbung"-Fläche - für eine echte Integration (z.B. Google Ad Manager / AdSense)
// wird hier nur der Platzhalter-Inhalt gegen das Netzwerk-Snippet getauscht, Größe
// und Platzierung im Layout bleiben unverändert.
const SIZES = {
  leaderboard: 'h-[50px] md:h-[90px] max-w-[728px]', // Footer-Leiste
  rectangle: 'h-[250px] max-w-[300px]', // Sidebar/Modal-Slot
  // Kopfzeilen-Slot (Desktop): Half-Banner-Format neben der Bewertung. Bewusst flach -
  // der Header ist sticky, jeder zusätzliche Pixel Höhe geht dauerhaft vom Spielfeld ab.
  // Die Breite darf schrumpfen (w-full), damit der Slot auf schmalen Desktops nicht die
  // Bewertung aus der Mitte drückt.
  headerBanner: 'h-[60px] max-w-[468px]',
};

// Vorübergehend deaktiviert, bis der AdSense-Site-Review durch ist: eine leere, mit
// "Werbung" beschriftete Fläche ohne echten Anzeigeninhalt sieht für einen Reviewer
// selbst wie ein Screen ohne (Publisher-)Content aus. Zurück auf true, sobald das Konto
// freigeschaltet ist und hier ein echtes <ins class="adsbygoogle"> rein soll.
export const ADS_ENABLED = false;

export function AdBanner({ variant = 'leaderboard', label = 'Werbung', adFree = false }) {
  if (!ADS_ENABLED) return null;
  // Werbefrei-IAP: kein Platzhalter, kein Ad-SDK - die Fläche verschwindet komplett statt nur
  // leer/ausgegraut dazustehen (siehe docs/ios-app-konzept.md §2, Punkt 1).
  if (adFree) return null;
  // Nativ (iOS): die eigentliche Banner-Anzeige ist kein DOM-Element, sondern ein
  // natives Overlay, das AdMob selbst positioniert (siehe monetization/nativeBanner.js,
  // von App.jsx anhand von adFree gesteuert). Dieser Platzhalter-Kasten ist rein für Web/
  // AdSense gedacht und würde nativ nur eine leere, verwirrende zweite Fläche zeigen.
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
