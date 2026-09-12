import React from 'react';
import { Scale, AlertTriangle } from 'lucide-react';
import {
  LEGAL_CONTENT,
  OPERATOR,
  formatOperatorField,
  hasOpenTodos,
  LEGAL_TODO,
} from '../../i18n/content/legal.content';
import { SiteLayout } from '../SiteLayout.jsx';
import { VoxelSiteLayout } from '../VoxelSiteLayout.jsx';

// Statische Impressum-Seite unter /impressum (Direktaufruf ohne Spiel-Bundle). Im Spiel
// selbst bleibt das Impressum weiterhin als LegalModal erreichbar - dieselben Texte
// (LEGAL_CONTENT/OPERATOR), die Platzhalter-/Auszeichnungslogik ist hier bewusst als
// kleine Kopie von LegalModal.jsx gehalten: LegalModal hängt lazy im Spiel-Chunk, ein
// Import von dort würde diesen in die Content-Seite ziehen.
function fillOperator(line) {
  return line.replace(/\{(\w+)\}/g, (_, key) =>
    key in OPERATOR ? formatOperatorField(OPERATOR[key]) : `{${key}}`);
}

function renderLegal(text, keyPrefix) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[\[ BITTE EINTRAGEN \]\])/g).map((part, i) => {
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

export function ImpressumPage({ isVoxel = false }) {
  const c = LEGAL_CONTENT.de;
  const doc = c.impressum;
  const isDraft = hasOpenTodos();
  const Layout = isVoxel ? VoxelSiteLayout : SiteLayout;
  const path = isVoxel ? '/voxel/impressum' : '/impressum';

  return (
    <Layout path={path}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-5">
          <Scale className="w-5 h-5 text-cyan-400 shrink-0" />
          <h1 className="font-black text-base uppercase tracking-wide text-slate-100">{doc.title}</h1>
        </div>

        <div className="flex flex-col gap-5">
          {isDraft && (
            <div className="flex items-start gap-2.5 bg-amber-950/50 border border-amber-500/60 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-amber-200 font-semibold">{c.draftBanner}</p>
            </div>
          )}

          {doc.sections.map((section, si) => (
            <section key={si}>
              <h2 className="font-mono text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-1.5">
                {section.title}
              </h2>
              <div className="text-sm text-slate-300 leading-relaxed flex flex-col gap-1">
                {section.lines.map((line, li) => (
                  <p key={li}>{renderLegal(fillOperator(line), `s${si}-l${li}`)}</p>
                ))}
              </div>
            </section>
          ))}

          <div className="text-[10px] text-slate-500 font-mono border-t border-slate-800 pt-3">
            {c.lastUpdatedLabel}: {c.lastUpdated}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export function VoxelImpressumPage() {
  return <ImpressumPage isVoxel />;
}
