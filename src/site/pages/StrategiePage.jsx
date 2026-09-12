import { SiteLayout } from '../SiteLayout.jsx';
import { VoxelSiteLayout } from '../VoxelSiteLayout.jsx';
import { PageIntro, Toc, PageEnd } from '../ui.jsx';
import { ContentSections } from '../blocks.jsx';
import { STRATEGIE } from '../content/strategie.content.js';

export function StrategiePage({ isVoxel = false }) {
  const Layout = isVoxel ? VoxelSiteLayout : SiteLayout;
  const path = isVoxel ? '/voxel/strategie' : '/strategie';

  return (
    <Layout path={path}>
      <PageIntro kicker={STRATEGIE.kicker} title={STRATEGIE.title} lead={STRATEGIE.lead} />
      <Toc items={STRATEGIE.sections} />
      <ContentSections sections={STRATEGIE.sections} adAfter={1} />
      <PageEnd next={STRATEGIE.next} ctaText={STRATEGIE.ctaText} isVoxel={isVoxel} />
    </Layout>
  );
}

export function VoxelStrategiePage() {
  return <StrategiePage isVoxel />;
}
