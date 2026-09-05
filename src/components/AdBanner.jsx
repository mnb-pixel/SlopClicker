import React, { useEffect, useRef } from 'react';
import { isCrazyGamesBuild } from '../monetization/crazyGamesSdk';
import { useAdsterraConsent } from '../monetization/adConsentStore';
import { ADSTERRA_ENABLED } from '../monetization/adsterraToggle';

const AD_HOST = 'https://www.highrevenueformat.com';

// Ein Slot kann aus mehreren Einheiten bestehen (responsive Breakpoints): Adsterras
// atOptions-Format ist eine feste Pixelgröße pro Einheit, es gibt kein einzelnes
// "responsives" Snippet. className steuert hier, bei welcher Breite welche Einheit
// sichtbar ist - beide werden geladen, aber per CSS nur eine angezeigt (Standardverfahren
// für responsive Fixed-Size-Ad-Units).
const AD_UNITS = {
  // Kopfzeilen-Slot (Desktop, siehe Header.jsx showAdSlot) - nur eine Größe nötig.
  headerBanner: [{ key: 'd6b090c3bf7f09019784f264928634bd', width: 468, height: 60 }],
  // Footer-Anker: 320x50 auf Mobile, 728x90 ab md-Breakpoint - deckt sich mit der
  // bisherigen Platzhalter-Höhe h-[50px] md:h-[90px].
  leaderboard: [
    { key: '0829ef14a6a83a9c512f325d10ab09e3', width: 320, height: 50, className: 'flex md:hidden' },
    { key: '181bec189d3fa0a8dbdf629c40af1cfe', width: 728, height: 90, className: 'hidden md:flex' },
  ],
  // Modal-Slot (BadgesModal).
  rectangle: [{ key: '1d8e8e22bc28152b8abc107c60695968', width: 300, height: 250 }],
};

// ADS_ENABLED folgt dem Adsterra-Kill-Switch (siehe adsterraToggle.js) - App.jsx/Header.jsx
// nutzen diesen Namen bereits für Layout-Entscheidungen (Abstandsrahmen etc.), deshalb hier
// als Re-Export statt einer zweiten, unabhängigen Konstante.
export const ADS_ENABLED = ADSTERRA_ENABLED;

// Rendert eine Adsterra-Anzeigeneinheit in einem eigenen, leeren iframe statt direkt im
// Hauptdokument. Grund: Adsterras invoke.js liest sein Options-Objekt aus der globalen
// Variable window.atOptions - mit mehreren Slots gleichzeitig auf der Seite (Header +
// Footer + Modal) würde ein zweiter Slot das atOptions des ersten überschreiben, bevor
// dessen async geladenes Skript es ausliest. Ein eigenes iframe-Fenster pro Slot gibt
// jedem sein eigenes globales atOptions ohne Kollisionsrisiko.
function AdSlotFrame({ adKey, width, height }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc) return;
    const options = { key: adKey, format: 'iframe', height, width, params: {} };
    doc.open();
    doc.write(
      '<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;overflow:hidden}</style></head><body>' +
        `<script>atOptions=${JSON.stringify(options)};</script>` +
        `<script src="${AD_HOST}/${adKey}/invoke.js"></script>` +
        '</body></html>'
    );
    doc.close();
  }, [adKey, width, height]);

  return (
    <iframe
      ref={iframeRef}
      title="Werbung"
      width={width}
      height={height}
      scrolling="no"
      style={{ border: 0, display: 'block' }}
    />
  );
}

export function AdBanner({ variant = 'leaderboard', label = 'Werbung', adFree = false }) {
  // Hook zuerst, vor allen frühen Returns unten (Rules of Hooks - adFree/ADS_ENABLED etc.
  // können sich zur Laufzeit ändern, der Hook muss aber bei jedem Render gleich oft laufen).
  const hasConsent = useAdsterraConsent();
  if (!ADS_ENABLED) return null;
  // Werbefrei-IAP: kein Ad-Netzwerk-Skript, keine Fläche - die Fläche verschwindet komplett
  // statt nur leer/ausgegraut dazustehen (siehe docs/ios-app-konzept.md §2, Punkt 1).
  if (adFree) return null;
  // Nativ (iOS): die eigentliche Banner-Anzeige ist kein DOM-Element, sondern ein natives
  // Overlay, das AdMob selbst positioniert (siehe monetization/nativeBanner.js, von App.jsx
  // anhand von adFree gesteuert). Dieser Slot ist rein für Web/Adsterra gedacht und würde
  // nativ nur eine leere, verwirrende zweite Fläche zeigen.
  const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();
  if (isNative) return null;
  // CrazyGames: zweites, eigenes Ad-Netzwerk auf derselben Seite ist gegen deren
  // Richtlinien - Monetarisierung läuft dort exklusiv über crazyGamesAdBridge.js.
  if (isCrazyGamesBuild()) return null;
  // Klaro-Einwilligung (siehe klaroConfig.js/adConsentStore.js): ohne "Adsterra"-Consent
  // bleibt die Fläche leer statt den Werbe-Iframe ungefragt zu laden.
  if (!hasConsent) return null;

  const units = AD_UNITS[variant] || AD_UNITS.leaderboard;
  return (
    <div className="w-full flex flex-col items-center gap-1">
      <span className="text-[9px] font-mono uppercase tracking-widest text-slate-600">{label}</span>
      <div className="w-full flex justify-center">
        {units.map((unit) => (
          <div key={unit.key} className={unit.className || 'flex'}>
            <AdSlotFrame adKey={unit.key} width={unit.width} height={unit.height} />
          </div>
        ))}
      </div>
    </div>
  );
}
