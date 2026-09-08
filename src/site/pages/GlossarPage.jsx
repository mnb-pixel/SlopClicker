import { SiteLayout } from '../SiteLayout.jsx';
import { AdBanner } from '../../components/AdBanner';
import { PageIntro, Glossary, PageEnd } from '../ui.jsx';
import { GLOSSAR } from '../content/glossar.content.js';

export function GlossarPage() {
  return (
    <SiteLayout path="/glossar">
      <PageIntro kicker={GLOSSAR.kicker} title={GLOSSAR.title} lead={GLOSSAR.lead}>
        <p className="mt-4 text-sm text-slate-500">
          {GLOSSAR.items.length} Begriffe, alphabetisch.
        </p>
      </PageIntro>
      <Glossary items={GLOSSAR.items} />
      <div className="mt-10">
        <AdBanner variant="leaderboard" label="Werbung" />
      </div>
      <PageEnd next={GLOSSAR.next} ctaText={GLOSSAR.ctaText} />
    </SiteLayout>
  );
}
