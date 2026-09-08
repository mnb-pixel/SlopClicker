import { Mail } from 'lucide-react';
import { SiteLayout } from '../SiteLayout.jsx';
import { OPERATOR } from '../../i18n/content/legal.content';
import { UEBER } from '../content/ueber.content.js';
import { PageIntro, Section, Prose, Bullets, PageEnd } from '../ui.jsx';
import { ContentSections } from '../blocks.jsx';

// Bewusst OHNE Anschrift: die vollständigen Anbieterangaben (Firma, Adresse, UID,
// Handelsregister) gehören ausschließlich ins Impressum (siehe ImpressumPage.jsx) - die
// Kontakt-Sektion hier ist nur der schnelle Weg zur E-Mail, kein zweites Impressum.
export function UeberPage() {
  const k = UEBER.kontakt;
  return (
    <SiteLayout path="/ueber">
      <PageIntro kicker={UEBER.kicker} title={UEBER.title} lead={UEBER.lead} />
      <ContentSections sections={UEBER.sections} adAfter={-1} />

      <Section id="kontakt" title={k.title}>
        <Prose>
          <p>{k.intro}</p>
        </Prose>
        <a
          href={`mailto:${OPERATOR.email}`}
          className="mt-4 flex items-start gap-3 rounded-xl border border-slate-800 hover:border-cyan-500/50 bg-slate-900/50 px-4 py-3 transition-colors max-w-xs"
        >
          <Mail className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-500">E-Mail</span>
            <span className="block font-semibold text-slate-100 break-all">{OPERATOR.email}</span>
          </span>
        </a>
        <p className="mt-6 font-bold text-slate-100 mb-2">{k.hintsTitle}</p>
        <Prose>
          <Bullets items={k.hints} keyPrefix="hint" />
        </Prose>
        <p className="mt-6 text-sm text-slate-500">
          Vollständige Anbieterangaben (Firma, Anschrift, Handelsregister) stehen im{' '}
          <a href="/impressum" className="site-link">
            Impressum
          </a>
          .
        </p>
      </Section>

      <PageEnd next={UEBER.next} ctaText={UEBER.ctaText} />
    </SiteLayout>
  );
}
