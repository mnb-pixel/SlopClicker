import { Mail, MapPin } from 'lucide-react';
import { SiteLayout } from '../SiteLayout.jsx';
import { OPERATOR } from '../../i18n/content/legal.content';
import { UEBER } from '../content/ueber.content.js';
import { PageIntro, Section, Prose, Bullets, PageEnd } from '../ui.jsx';
import { ContentSections } from '../blocks.jsx';

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
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <a
            href={`mailto:${OPERATOR.email}`}
            className="flex items-start gap-3 rounded-xl border border-slate-800 hover:border-cyan-500/50 bg-slate-900/50 px-4 py-3 transition-colors"
          >
            <Mail className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-500">E-Mail</span>
              <span className="block font-semibold text-slate-100 break-all">{OPERATOR.email}</span>
            </span>
          </a>
          <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3">
            <MapPin className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-500">Anschrift</span>
              <span className="block font-semibold text-slate-100">{OPERATOR.name}</span>
              <span className="block text-sm text-slate-300">
                {OPERATOR.street}, {OPERATOR.postalCode} {OPERATOR.city}, {OPERATOR.country}
              </span>
            </span>
          </div>
        </div>
        <p className="mt-6 font-bold text-slate-100 mb-2">{k.hintsTitle}</p>
        <Prose>
          <Bullets items={k.hints} keyPrefix="hint" />
        </Prose>
      </Section>

      <PageEnd next={UEBER.next} ctaText={UEBER.ctaText} />
    </SiteLayout>
  );
}
