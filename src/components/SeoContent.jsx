import React from 'react';
import { MANUAL_CONTENT } from '../i18n/content/manual.content';

// Wandelt **fett markierte** Textstellen in <strong> um - selbe simple Markdown-Bold-Syntax
// wie in ManualModal.jsx, hier separat gehalten statt importiert: ManualModal ist lazy
// geladen (siehe App.jsx), ein Import von dort würde den gesamten Modal-Chunk (inkl. Icons)
// in den Hauptbundle ziehen, den dieser Block gar nicht braucht.
function renderRich(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-slate-300">{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

// Dauerhaft sichtbarer Beschreibungstext (kein Modal, kein Pre-Hydration-Fallback) - für
// den AdSense-Site-Review gedacht (siehe AdBanner.jsx). Erneut mit "low value content"
// abgelehnt trotz About/So-funktioniert's/FAQ-Block: der eigentliche Investoren-Prospekt
// (ManualModal, MANUAL_CONTENT) mit den ausführlichsten, spielspezifischsten Texten stand
// bis dahin nur hinter einem Klick - für einen Crawler, der keine Buttons klickt, unsichtbar.
// Hier wird exakt derselbe, bereits vorhandene Text zusätzlich permanent gerendert, statt
// neuen Füll-/SEO-Text zu erfinden. Nutzt DesktopView UND die mobile SlopTab-Ansicht in
// App.jsx - beide binden diese eine Komponente ein statt den Block zu duplizieren.
export function SeoContent({ t, lang, compact = false }) {
  const m = MANUAL_CONTENT[lang] || MANUAL_CONTENT.en;
  const headingCls = compact
    ? 'text-[10px] font-black uppercase tracking-wider text-cyan-400 mb-1.5'
    : 'text-xs font-black uppercase tracking-wider text-cyan-400 mb-2';
  const pCls = compact ? 'mb-1.5' : 'mb-2';

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className={headingCls}>{t('aboutTitle')}</h2>
        <p>{t('aboutText')}</p>
      </div>
      <div>
        <h2 className={headingCls}>{t('howToPlayTitle')}</h2>
        <p className={pCls}>{t('htpP1')}</p>
        <p className={pCls}>{t('htpP2')}</p>
        <p className={pCls}>{t('htpP3')}</p>
        <p>{t('htpP4')}</p>
      </div>
      <div>
        <h2 className={headingCls}>{t('faqTitle')}</h2>
        <dl className="flex flex-col gap-1.5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n}>
              <dt className="font-bold text-slate-300">{t(`faqQ${n}`)}</dt>
              <dd>{t(`faqA${n}`)}</dd>
            </div>
          ))}
        </dl>
      </div>
      {/* Investoren-Prospekt (identisch zu ManualModal.jsx): sechs Abschnitte zu den
          tatsächlichen Spielmechaniken (Engines, Burn Rate, Pivot, Singularity Ascension
          etc.) - konkreter, spielspezifischer Text statt generischer Clicker-Beschreibung. */}
      <div>
        <h2 className={headingCls}>{m.modalTitle}</h2>
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="font-bold text-slate-300 mb-1">{m.s1Title}</h3>
            <p className={pCls}>{renderRich(m.s1Body1)}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{renderRich(m.s1Li1)}</li>
              <li>{renderRich(m.s1Li2)}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-300 mb-1">{m.s2Title}</h3>
            <p className={pCls}>{renderRich(m.s2Body1)}</p>
            <p>{renderRich(m.s2Body2)}</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-300 mb-1">{m.s3Title}</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>{renderRich(m.s3Li1)}</li>
              <li>{renderRich(m.s3Li2)}</li>
              <li>{renderRich(m.s3Li3)}</li>
              <li>{renderRich(m.s3Li4)}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-300 mb-1">{m.s4Title}</h3>
            <p className={pCls}>{renderRich(m.s4Body1)}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{renderRich(m.s4Li1)}</li>
              <li>{renderRich(m.s4Li2)}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-300 mb-1">{m.s5Title}</h3>
            <p className={pCls}>{renderRich(m.s5Body1)}</p>
            <p>{renderRich(m.s5Body2)}</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-300 mb-1">{m.s6Title}</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>{renderRich(m.s6Li1)}</li>
              <li>{renderRich(m.s6Li2)}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
