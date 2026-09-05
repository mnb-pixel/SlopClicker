// Adsterra Popunder: ein sitewide eingebundenes Script, das sich selbst um Klick-Listener
// kümmert und bei Klick irgendwo auf der Seite ein neues Tab/Fenster öffnet. Kein DOM-Slot,
// daher hier als eigenes show/hide-Paar analog zu monetization/nativeBanner.js, statt als
// React-Komponente - App.jsx ruft showPopunderAd()/hidePopunderAd() im selben Effect auf,
// der auch das native Banner an adFree koppelt.
const SCRIPT_SRC = 'https://pl31205249.profitableratecpmnetwork.com/36/c1/e5/36c1e52c1492450409fd92e60cc714c4.js';

let scriptEl = null;
// true, sobald das Skript tatsächlich mal geladen wurde (nicht nur "sollte laufen") -
// unterscheidet den echten Teardown-Fall (siehe hidePopunderAd) vom harmlosen Erstaufruf
// direkt nach einem frischen Seitenaufruf, wo noch nie ein Popunder-Skript lief.
let hasBeenShown = false;

export function showPopunderAd() {
  if (scriptEl) return;
  hasBeenShown = true;
  scriptEl = document.createElement('script');
  scriptEl.src = SCRIPT_SRC;
  scriptEl.async = true;
  document.body.appendChild(scriptEl);
}

// Entfernt das Script-Tag - reicht aber allein NICHT: bereits vom Netzwerk-Skript
// angehängte Klick-Listener liefen sonst bis zum nächsten zufälligen Seitenaufruf weiter
// (kein von Adsterra angebotener Teardown-Hook). Ein Widerruf der Einwilligung (oder ein
// Werbefrei-Kauf) muss aber sofort wirken, nicht erst "irgendwann" - ein harter Reload ist
// der einzige zuverlässige Weg, bereits registrierte Listener wirklich loszuwerden. Nur
// wenn das Skript in DIESEM Seitenaufruf tatsächlich mal lief (hasBeenShown), sonst würde
// schon der allererste Render (noch keine Einwilligung erteilt) einen Reload auslösen.
export function hidePopunderAd() {
  const wasShown = hasBeenShown;
  if (scriptEl) {
    scriptEl.remove();
    scriptEl = null;
  }
  if (wasShown) {
    hasBeenShown = false;
    window.location.reload();
  }
}
