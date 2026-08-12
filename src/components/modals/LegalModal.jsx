import React from 'react';
import { createPortal } from 'react-dom';
import { Scale, ShieldCheck, X, AlertTriangle } from 'lucide-react';
import {
  LEGAL_CONTENT,
  OPERATOR,
  formatOperatorField,
  hasOpenTodos,
  LEGAL_TODO,
} from '../../i18n/content/legal.content';

// Ersetzt {feld}-Platzhalter durch die zentral gepflegten Betreiberdaten. Fehlende
// Pflichtangaben werden bewusst als sichtbarer LEGAL_TODO-Marker gerendert statt still
// leer zu bleiben - ein halb ausgefülltes Impressum darf nicht unbemerkt online gehen.
function fillOperator(line) {
  return line.replace(/\{(\w+)\}/g, (_, key) =>
    key in OPERATOR ? formatOperatorField(OPERATOR[key]) : `{${key}}`);
}

// **fett**, `code` und der TODO-Marker werden hervorgehoben.
function renderRich(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[\[ BITTE EINTRAGEN \]\])/g);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part === LEGAL_TODO) {
      return (
        <mark key={key} className="bg-amber-500/25 text-amber-300 font-black px-1.5 py-0.5 rounded not-italic">
          {part}
        </mark>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key} className="text-slate-100">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={key} className="font-mono text-[11px] bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-cyan-300">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

// page: 'impressum' | 'datenschutz'
export function LegalModal({ page, onClose, lang = 'de' }) {
  if (!page) return null;

  const c = LEGAL_CONTENT[lang] || LEGAL_CONTENT.en;
  const doc = c[page];
  if (!doc) return null;

  const isDraft = hasOpenTodos();
  const Icon = page === 'impressum' ? Scale : ShieldCheck;

  const modalContent = (
    <div
      className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="w-5 h-5 text-cyan-400 shrink-0" />
            <h2 className="font-black text-base uppercase tracking-wide text-slate-100 truncate">
              {doc.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex flex-col gap-5">
          {isDraft && (
            <div className="flex items-start gap-2.5 bg-amber-950/50 border border-amber-500/60 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-amber-200 font-semibold">
                {renderRich(c.draftBanner, 'draft')}
              </p>
            </div>
          )}

          {doc.sections.map((section, si) => (
            <section key={si} className="flex flex-col gap-1.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400">
                {section.title}
              </h3>
              {section.lines.map((line, li) => (
                <p key={li} className="text-[12px] leading-relaxed text-slate-300">
                  {renderRich(fillOperator(line), `s${si}-l${li}`)}
                </p>
              ))}
            </section>
          ))}

          <div className="text-[10px] text-slate-500 font-mono border-t border-slate-800 pt-3">
            {c.lastUpdatedLabel}: {c.lastUpdated}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
