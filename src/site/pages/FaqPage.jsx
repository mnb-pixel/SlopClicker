import { Fragment } from 'react';
import { SiteLayout } from '../SiteLayout.jsx';
import { AdBanner } from '../../components/AdBanner';
import { PageIntro, Toc, Section, FaqItems, PageEnd } from '../ui.jsx';
import { FAQ } from '../content/faq.content.js';

export function FaqPage() {
  return (
    <SiteLayout path="/faq">
      <PageIntro kicker={FAQ.kicker} title={FAQ.title} lead={FAQ.lead} />
      <Toc items={FAQ.groups} />
      {FAQ.groups.map((group, i) => (
        <Fragment key={group.id}>
          <Section id={group.id} title={group.title}>
            <FaqItems items={group.items} />
          </Section>
          {i === 1 && (
            <div className="mt-10">
              <AdBanner variant="rectangle" label="Werbung" />
            </div>
          )}
        </Fragment>
      ))}
      <PageEnd next={FAQ.next} ctaText={FAQ.ctaText} />
    </SiteLayout>
  );
}
