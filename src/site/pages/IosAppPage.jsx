import { SiteLayout } from '../SiteLayout.jsx';
import { VoxelSiteLayout } from '../VoxelSiteLayout.jsx';
import { IOS_APP } from '../content/iosApp.content.js';
import {
  PageIntro,
  Section,
  Prose,
  Paragraphs,
  Bullets,
  DataTable,
  PhoneShot,
  AppStoreBadge,
  PageEnd,
} from '../ui.jsx';

// Einzige Seite neben der Startseite mit dem offiziellen App-Store-Badge (Apple: ein Badge
// pro Layout, siehe ui.jsx). Die Screenshots hier zeigen die App im Simulator.
export function IosAppPage({ isVoxel = false }) {
  const Layout = isVoxel ? VoxelSiteLayout : SiteLayout;
  const path = isVoxel ? '/voxel/ios-app' : '/ios-app';
  const c = IOS_APP;
  return (
    <Layout path={path} wide>
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_260px] md:items-center">
        <PageIntro kicker={c.kicker} title={c.title} lead={c.lead}>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <AppStoreBadge />
            <span className="text-xs text-slate-500">{c.badgeNote}</span>
          </div>
        </PageIntro>
        <PhoneShot src={c.shots[0].src} alt={c.shots[0].alt} priority className="justify-self-center" />
      </div>

      <div className="max-w-3xl">
        <Section id="funktionen" title={c.highlights.title}>
          <Prose>
            <Bullets items={c.highlights.items} keyPrefix="hl" />
          </Prose>
        </Section>
      </div>

      <Section id="vergleich" title={c.compare.title}>
        <DataTable caption={c.compare.title} head={c.compare.head} rows={c.compare.rows} />
      </Section>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 justify-items-center">
        {c.shots.slice(1).map((shot) => (
          <PhoneShot key={shot.src} src={shot.src} alt={shot.alt} caption={shot.caption} />
        ))}
      </div>

      <div className="max-w-3xl">
        <Section id="werbefrei" title={c.adFree.title}>
          <Prose>
            <Paragraphs items={c.adFree.paragraphs} keyPrefix="adfree" />
          </Prose>
        </Section>

        <Section id="voraussetzungen" title={c.requirements.title}>
          <Prose>
            <Bullets items={c.requirements.items} keyPrefix="req" />
          </Prose>
        </Section>

        <Section id="support" title={c.support.title}>
          <Prose>
            <Paragraphs items={c.support.paragraphs} keyPrefix="support" />
          </Prose>
        </Section>

        <PageEnd
          next={c.next}
          ctaText="Lieber ohne Installation? Die Web-Version ist dasselbe Spiel – direkt im Browser."
          isVoxel={isVoxel}
        />
      </div>
    </Layout>
  );
}

export function VoxelIosAppPage() {
  return <IosAppPage isVoxel />;
}
