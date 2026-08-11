import React from 'react';
import { Scale, X } from 'lucide-react';

export function ImpressumModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 text-slate-100 border-2 border-slate-700 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-cyan-400" />
            <h2 className="font-black text-lg tracking-wide uppercase">Impressum</h2>
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
            <h3 className="font-bold text-sm text-slate-100 mb-1">Angaben gemäss Art. 3 UWG</h3>
            <p>
              Bryopal GmbH<br />
              Seeblickstrasse 6a<br />
              9010 St. Gallen<br />
              Schweiz
            </p>
          </section>

          <section>
            <h3 className="font-bold text-sm text-slate-100 mb-1">Vertretungsberechtigt</h3>
            <p>Björn Moosmann</p>
          </section>

          <section>
            <h3 className="font-bold text-sm text-slate-100 mb-1">Kontakt</h3>
            <p>E-Mail: contact@bryopal.ch</p>
          </section>

          <section>
            <h3 className="font-bold text-sm text-slate-100 mb-1">Handelsregister</h3>
            <p>
              Handelsregisteramt des Kantons St. Gallen<br />
              UID: CHE-194.217.671
            </p>
          </section>

          <section>
            <h3 className="font-bold text-sm text-slate-100 mb-1">Haftungshinweis</h3>
            <p>
              SlopClicker ist ein satirisches Idle-Game und dient ausschliesslich der Unterhaltung.
              Sämtliche Inhalte (Firmennamen, Kennzahlen, Ereignisse) sind fiktiv bzw. überspitzt
              dargestellt und stellen keine Anlage-, Finanz- oder sonstige Beratung dar.
            </p>
          </section>
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
