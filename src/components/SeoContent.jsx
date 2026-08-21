import React from 'react';
import { MANUAL_CONTENT } from '../i18n/content/manual.content';
import { SEO_SECTIONS_CONTENT } from '../i18n/content/seoSections.content';

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

function Heading({ compact, children }) {
  const cls = compact
    ? 'text-[10px] font-black uppercase tracking-wider text-cyan-400 mb-1.5'
    : 'text-xs font-black uppercase tracking-wider text-cyan-400 mb-2';
  return <h2 className={cls}>{children}</h2>;
}

function SubHeading({ children }) {
  return <h3 className="font-bold text-slate-300 mb-1">{children}</h3>;
}

// Dauerhaft sichtbarer Beschreibungstext (kein Modal, kein Pre-Hydration-Fallback) - für
// den AdSense-Site-Review gedacht (siehe AdBanner.jsx). "section" ordnet echten, bereits
// vorhandenen Content (MANUAL_CONTENT, SEO_SECTIONS_CONTENT) der jeweils passenden
// Tab-Route zu, statt denselben Block überall zu wiederholen - jede Route bekommt damit
// eigenständigen, thematisch passenden Text statt fünffach duplizierten Fülltext:
// 'home'    -> About/HowToPlay/FAQ + Manual §1 (Skalierung), §2 (Burn Rate), §6 (Thermik)
// 'shop'    -> Manual §3 (Infrastruktur & Strategie-Portfolio) + Ausbaustufen-Beispiele
// 'special' -> Manual §4 (Pivot) + §5 (Singularity Ascension)
// 'stats'   -> Erfolge-System + Beispiele
// 'all'     -> kompletter Text (Desktop-Ansicht ohne eigene Tab-Routen, siehe DesktopView.jsx)
export function SeoContent({ t, lang, compact = false, section = 'all' }) {
  const m = MANUAL_CONTENT[lang] || MANUAL_CONTENT.en;
  const s = SEO_SECTIONS_CONTENT[lang] || SEO_SECTIONS_CONTENT.en;
  const showHome = section === 'all' || section === 'home';
  const showShop = section === 'all' || section === 'shop';
  const showSpecial = section === 'all' || section === 'special';
  const showStats = section === 'all' || section === 'stats';

  return (
    <div className="flex flex-col gap-4">
      {showHome && (
        <>
          <div>
            <Heading compact={compact}>{t('aboutTitle')}</Heading>
            <p>{t('aboutText')}</p>
          </div>
          <div>
            <Heading compact={compact}>{t('howToPlayTitle')}</Heading>
            <p className={compact ? 'mb-1.5' : 'mb-2'}>{t('htpP1')}</p>
            <p className={compact ? 'mb-1.5' : 'mb-2'}>{t('htpP2')}</p>
            <p className={compact ? 'mb-1.5' : 'mb-2'}>{t('htpP3')}</p>
            <p>{t('htpP4')}</p>
          </div>
          <div>
            <Heading compact={compact}>{t('faqTitle')}</Heading>
            <dl className="flex flex-col gap-1.5">
              {[1, 2, 3, 4].map((n) => (
                <div key={n}>
                  <dt className="font-bold text-slate-300">{t(`faqQ${n}`)}</dt>
                  <dd>{t(`faqA${n}`)}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <Heading compact={compact}>{m.modalTitle}</Heading>
            <div className="flex flex-col gap-3">
              <div>
                <SubHeading>{m.s1Title}</SubHeading>
                <p className="mb-1">{renderRich(m.s1Body1)}</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{renderRich(m.s1Li1)}</li>
                  <li>{renderRich(m.s1Li2)}</li>
                </ul>
              </div>
              <div>
                <SubHeading>{m.s2Title}</SubHeading>
                <p className="mb-1">{renderRich(m.s2Body1)}</p>
                <p>{renderRich(m.s2Body2)}</p>
              </div>
              <div>
                <SubHeading>{m.s6Title}</SubHeading>
                <ul className="list-disc list-inside space-y-1">
                  <li>{renderRich(m.s6Li1)}</li>
                  <li>{renderRich(m.s6Li2)}</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {showShop && (
        <div>
          <Heading compact={compact}>{s.shopTitle}</Heading>
          <p className="mb-2">{s.shopIntro}</p>
          <div className="mt-2">
            <SubHeading>{m.s3Title}</SubHeading>
            <ul className="list-disc list-inside space-y-1">
              <li>{renderRich(m.s3Li1)}</li>
              <li>{renderRich(m.s3Li2)}</li>
              <li>{renderRich(m.s3Li3)}</li>
              <li>{renderRich(m.s3Li4)}</li>
            </ul>
          </div>
          <div className="mt-2">
            <SubHeading>{s.shopExamplesTitle}</SubHeading>
            <ul className="list-disc list-inside space-y-1">
              <li>{s.shopEx1}</li>
              <li>{s.shopEx2}</li>
              <li>{s.shopEx3}</li>
            </ul>
          </div>
        </div>
      )}

      {showSpecial && (
        <div>
          <Heading compact={compact}>{s.specialTitle}</Heading>
          <p className="mb-2">{s.specialIntro}</p>
          <div className="flex flex-col gap-3">
            <div>
              <SubHeading>{m.s4Title}</SubHeading>
              <p className="mb-1">{renderRich(m.s4Body1)}</p>
              <ul className="list-disc list-inside space-y-1">
                <li>{renderRich(m.s4Li1)}</li>
                <li>{renderRich(m.s4Li2)}</li>
              </ul>
            </div>
            <div>
              <SubHeading>{m.s5Title}</SubHeading>
              <p className="mb-1">{renderRich(m.s5Body1)}</p>
              <p>{renderRich(m.s5Body2)}</p>
            </div>
          </div>
        </div>
      )}

      {showStats && (
        <div>
          <Heading compact={compact}>{s.statsTitle}</Heading>
          <p className="mb-2">{s.statsIntro}</p>
          <div className="mt-2">
            <SubHeading>{s.statsExamplesTitle}</SubHeading>
            <ul className="list-disc list-inside space-y-1">
              <li>{s.statsEx1}</li>
              <li>{s.statsEx2}</li>
              <li>{s.statsEx3}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
