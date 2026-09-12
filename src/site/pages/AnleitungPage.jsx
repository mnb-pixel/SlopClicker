import { SiteLayout } from '../SiteLayout.jsx';
import { VoxelSiteLayout } from '../VoxelSiteLayout.jsx';
import { PageIntro, Toc, PageEnd } from '../ui.jsx';
import { ContentSections } from '../blocks.jsx';
import { ANLEITUNG } from '../content/anleitung.content.js';

export function AnleitungPage({ isVoxel = false }) {
  const Layout = isVoxel ? VoxelSiteLayout : SiteLayout;
  const path = isVoxel ? '/voxel/anleitung' : '/anleitung';

  return (
    <Layout path={path}>
      <PageIntro kicker={ANLEITUNG.kicker} title={ANLEITUNG.title} lead={ANLEITUNG.lead} />
      <Toc items={ANLEITUNG.sections} />
      <ContentSections sections={ANLEITUNG.sections} adAfter={1} />
      <PageEnd next={ANLEITUNG.next} ctaText={ANLEITUNG.ctaText} isVoxel={isVoxel} />
    </Layout>
  );
}

export function VoxelAnleitungPage() {
  return <AnleitungPage isVoxel />;
}
