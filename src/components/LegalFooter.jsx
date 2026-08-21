import React from 'react';
import { isCrazyGamesBuild } from '../monetization/crazyGamesSdk';

// Geteilte Fusszeile mit den Pflichtlinks (Impressum/Datenschutz). Wird auf JEDEM Tab
// gerendert (Mobile: einmal ausserhalb der Pro-Tab-Bedingungen in App.jsx, Desktop: einmal
// in DesktopView.jsx) statt nur versteckt im Einstellungen-Tab - vorher war das Impressum
// auf der Startansicht komplett unsichtbar und nur über einen Tab-Wechsel zu "Einstellungen"
// erreichbar, was der Impressumspflicht (leichte Erkennbarkeit von JEDER Seite aus) nur knapp
// genügte. Datenschutzerklärung NICHT im CrazyGames-Build: der Text ist für die
// token-furnace.com-Bereitstellung geschrieben (nennt Cloudflare-Hosting, Google AdSense/Ads/
// Cookies) - nichts davon läuft im CrazyGames-Build, dort übernimmt CrazyGames' eigene
// Datenschutzerklärung Ads/Spielstand (Data Module). Den Text trotzdem zu zeigen wäre
// sachlich falsch. Impressum bleibt: reine, plattformunabhängige Anbieterkennzeichnung.
export function LegalFooter({
  onOpenLegal,
  purchaseAvailable = false,
  adFree = false,
  showAdPrivacyOptions,
  t,
}) {
  const tr = t || ((k) => k);

  return (
    <footer className="text-center text-[11px] text-slate-500 my-2 space-y-2">
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => onOpenLegal && onOpenLegal('impressum')}
          className="text-slate-400 hover:text-cyan-400 underline underline-offset-2 font-semibold transition-colors"
        >
          {tr('legalImprint')}
        </button>
        {!isCrazyGamesBuild() && (
          <>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => onOpenLegal && onOpenLegal('datenschutz')}
              className="text-slate-400 hover:text-cyan-400 underline underline-offset-2 font-semibold transition-colors"
            >
              {tr('legalPrivacy')}
            </button>
          </>
        )}
        {/* Nur nativ und nur solange Werbung läuft (adFree: kein Ad-SDK mehr initialisiert,
            siehe adConsent.js) - Pendant zum Web-Cookie-Link, öffnet das UMP-Formular erneut. */}
        {purchaseAvailable && !adFree && (
          <>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => showAdPrivacyOptions && showAdPrivacyOptions()}
              className="text-slate-400 hover:text-cyan-400 underline underline-offset-2 font-semibold transition-colors"
            >
              {tr('adPrivacySettings')}
            </button>
          </>
        )}
      </div>
      <div>{tr('footerPrivacy')}</div>
      <div className="text-[10px] text-slate-600">Token Furnace Mobile v1.0.0</div>
    </footer>
  );
}
