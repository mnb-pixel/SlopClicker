import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { LEGAL_CONTENT, hasOpenTodos } from '../../i18n/content/legal.content';
import { SiteLayout } from '../SiteLayout.jsx';

// Eigenständige Seite unter /datenschutz (statt des LegalModal im Spiel): bei direktem Aufruf
// lädt main.jsx NUR diese Komponente, nie App.jsx/useGameStore - die Seite ist zudem die in
// App Store Connect hinterlegte Privacy-Policy-URL. Nur Deutsch (siehe HINWEIS in
// legal.content.js).
export function DatenschutzPage() {
  const c = LEGAL_CONTENT.de;
  const doc = c.datenschutz;
  const isDraft = hasOpenTodos();

  return (
    <SiteLayout path="/datenschutz">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
          <h1 className="font-black text-base uppercase tracking-wide text-slate-100">{doc.title}</h1>
        </div>

        <div className="flex flex-col gap-5">
          {isDraft && (
            <div className="flex items-start gap-2.5 bg-amber-950/50 border border-amber-500/60 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-amber-200 font-semibold">{c.draftBanner}</p>
            </div>
          )}

          {/* Roher, von datenschutz-generator.de erzeugter HTML-Rechtstext - Styling dafür in
              index.css unter .legal-html (identisch zum Modal im Spiel). */}
          <div className="legal-html" dangerouslySetInnerHTML={{ __html: doc.html }} />

          <div className="text-[10px] text-slate-500 font-mono border-t border-slate-800 pt-3">
            {c.lastUpdatedLabel}: {c.lastUpdated}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
