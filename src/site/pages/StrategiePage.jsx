import { SiteLayout } from '../SiteLayout.jsx';
import { PageIntro, Toc, PageEnd } from '../ui.jsx';
import { ContentSections } from '../blocks.jsx';
import { STRATEGIE } from '../content/strategie.content.js';

export function StrategiePage() {
  return (
    <SiteLayout path="/strategie">
      <PageIntro kicker={STRATEGIE.kicker} title={STRATEGIE.title} lead={STRATEGIE.lead} />
      <Toc items={STRATEGIE.sections} />
      <ContentSections sections={STRATEGIE.sections} adAfter={1} />
      <PageEnd next={STRATEGIE.next} ctaText={STRATEGIE.ctaText} />
    </SiteLayout>
  );
}
