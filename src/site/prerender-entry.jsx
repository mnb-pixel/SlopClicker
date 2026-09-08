// SSR-Einstieg für scripts/prerender.mjs (vite build --ssr): rendert jede Content-Seite aus
// siteRoutes.js zu statischem HTML. Identischer Komponentenbaum wie main.jsx (ErrorBoundary
// um die Seite), damit hydrateRoot() im Browser ohne Mismatch auf das Markup aufsetzt.
import { renderToString } from 'react-dom/server';
import { ErrorBoundary } from '../components/ErrorBoundary.jsx';
import { SITE_ROUTES } from './siteRoutes.js';

export { SITE_ROUTES };

export async function renderRoute(route) {
  const Page = await route.load();
  return renderToString(
    <ErrorBoundary>
      <Page />
    </ErrorBoundary>,
  );
}
