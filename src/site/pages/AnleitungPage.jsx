import { SiteLayout } from '../SiteLayout.jsx';
import { PageIntro, Toc, PageEnd } from '../ui.jsx';
import { ContentSections } from '../blocks.jsx';
import { ANLEITUNG } from '../content/anleitung.content.js';

export function AnleitungPage() {
  return (
    <SiteLayout path="/anleitung">
      <PageIntro kicker={ANLEITUNG.kicker} title={ANLEITUNG.title} lead={ANLEITUNG.lead} />
      <Toc items={ANLEITUNG.sections} />
      <ContentSections sections={ANLEITUNG.sections} adAfter={1} />
      <PageEnd next={ANLEITUNG.next} ctaText={ANLEITUNG.ctaText} />
    </SiteLayout>
  );
}
