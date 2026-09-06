// Gemeinsame Ladelogik für Google AdSense / die Ad Placement API (Googles "H5 Games Ads") -
// von AdBanner.jsx (Display-Anzeigen) UND adsenseAdBridge.js (Rewarded Ads) genutzt, damit
// das adsbygoogle.js-Script und der adBreak/adConfig-Shim nur EINMAL pro Sitzung geladen
// werden, unabhängig davon, welcher der beiden Aufrufer zuerst dran ist.
//
// Client-ID kommt aus einer Env-Var statt hartcodiert: bis zur AdSense-Freischaltung ist sie
// leer, isAdsenseConfigured() liefert dann false und jeder Aufrufer bleibt beim bisherigen
// Platzhalter-/Fake-Verhalten (siehe AdBanner.jsx/AdBridge.js) - kein Code-Zweig muss vor dem
// Go-Live nochmal angefasst werden, nur die Env-Var in .env bzw. den Cloudflare-Build-Settings.
//
// Doku: https://developers.google.com/ad-placement (Getting Started + adBreak()/adConfig()-
// Referenz). Der Shim unten (adBreak = adConfig = Funktion, die auf `adsbygoogle` pusht) ist
// exakt das dort dokumentierte Muster, keine eigene Erfindung - er macht adBreak()/adConfig()
// synchron aufrufbar, noch bevor das eigentliche Script geladen hat.
export const ADSENSE_CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID || '';

export function isAdsenseConfigured() {
  return !!ADSENSE_CLIENT_ID;
}

let loadPromise = null;

// Ein hängendes oder von einem Adblocker gestopptes Script darf präsentierende Aufrufer
// (adsenseAdBridge.present(), AdBanner) nie dauerhaft blockieren - selbes Muster wie
// initWithTimeout in crazyGamesSdk.js.
const READY_TIMEOUT_MS = 5000;

// Lädt adsbygoogle.js genau einmal pro Sitzung und löst auf, sobald die API bereit ist
// (adConfig-onReady) oder nach READY_TIMEOUT_MS - je nachdem, was zuerst eintritt. Auflösung
// mit `false`, wenn das Script selbst nicht laden konnte (Netzwerkfehler/Adblocker);
// Aufrufer behandeln das identisch zu "kein Ad verfügbar".
export function loadAdsense() {
  if (!isAdsenseConfigured()) return Promise.resolve(false);
  if (!loadPromise) {
    loadPromise = new Promise((resolve) => {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adBreak = window.adConfig = function (o) {
        window.adsbygoogle.push(o);
      };

      let resolved = false;
      const finish = (ok) => {
        if (resolved) return;
        resolved = true;
        resolve(ok);
      };

      window.adConfig({ onReady: () => finish(true) });
      setTimeout(() => finish(true), READY_TIMEOUT_MS);

      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
      script.onerror = () => finish(false);
      document.head.appendChild(script);
    });
  }
  return loadPromise;
}
