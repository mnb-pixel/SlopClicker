import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

// TODO: Sobald Termly eingerichtet ist, den generierten Policy-Text (und ggf.
// das Consent-Banner-Script in index.html) hier einsetzen. Diese Fassung
// beschreibt den aktuellen, tatsächlichen Stand (kein Tracking, keine Ads live).
export function DatenschutzModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 text-slate-100 border-2 border-slate-700 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="font-black text-lg tracking-wide uppercase">Datenschutzerklärung</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs leading-relaxed text-slate-300">
          <section>
            <h3 className="font-bold text-sm text-slate-100 mb-1">Verantwortliche Stelle</h3>
            <p>
              Bryopal GmbH, Seeblickstrasse 6a, 9010 St. Gallen, Schweiz<br />
              E-Mail: contact@bryopal.ch
            </p>
          </section>

          <section>
            <h3 className="font-bold text-sm text-slate-100 mb-1">Datenverarbeitung</h3>
            <p>
              SlopClicker läuft vollständig im Browser. Dein Spielstand (Valuation, Gebäude,
              Upgrades, Einstellungen) wird ausschliesslich lokal auf deinem Gerät im
              <code className="mx-1 px-1 bg-slate-800 rounded">localStorage</code>
              gespeichert. Diese Daten verlassen dein Gerät nicht und werden von uns nicht
              eingesehen, übertragen oder ausgewertet.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-sm text-slate-100 mb-1">Cookies, Tracking &amp; Werbung</h3>
            <p>
              Aktuell setzt SlopClicker keine Cookies, kein Analytics- und kein Werbe-Tracking ein.
              Sichtbare "Werbung"-Flächen im Spiel sind reine Platzhalter ohne Verbindung zu
              Drittanbietern. Sobald echte Werbe- oder Analyse-Dienste (z. B. Google AdSense)
              eingebunden werden, informieren wir an dieser Stelle vorab über die verarbeiteten
              Daten, Anbieter und Widerspruchsmöglichkeiten und holen — soweit erforderlich — deine
              Einwilligung über ein Consent-Banner ein.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-sm text-slate-100 mb-1">Hosting</h3>
            <p>
              Die Website wird über ein Content-Delivery-Network ausgeliefert. Dabei werden
              technisch notwendige Zugriffsdaten (u. a. IP-Adresse, Zeitpunkt des Zugriffs)
              kurzzeitig zur Absicherung und Bereitstellung des Dienstes verarbeitet.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-sm text-slate-100 mb-1">Deine Rechte</h3>
            <p>
              Da keine personenbezogenen Daten von uns gespeichert werden, entstehen dir aktuell
              keine Auskunfts- oder Löschungsansprüche gegenüber Bryopal GmbH im Zusammenhang mit
              deinem Spielstand. Für Anliegen zum Datenschutz erreichst du uns jederzeit unter
              contact@bryopal.ch.
            </p>
          </section>

          <p className="text-slate-500 italic">Stand: {new Date().toLocaleDateString('de-CH')}</p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-500 text-slate-950 font-black rounded-xl hover:bg-cyan-400 transition-all uppercase tracking-wider text-xs shadow-lg"
          >
            Schliessen
          </button>
        </div>
      </div>
    </div>
  );
}
