// Statisches Vorrendern der Content-Seiten (siehe src/site/siteRoutes.js) - läuft nur im
// Web-Build nach `vite build` (package.json "build"), nicht für build:ios/build:crazygames.
// Ablauf: SSR-Bundle bauen -> jede Route rendern -> in das fertige dist/index.html-Template
// (mit den gehashten Asset-Tags) einsetzen -> dist/index.html bzw. dist/<file>.html schreiben.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const distDir = resolve('dist');
const ssrDir = resolve('dist-ssr');

execSync('npx vite build --ssr src/site/prerender-entry.jsx --outDir dist-ssr', { stdio: 'inherit' });

const { SITE_ROUTES, renderRoute } = await import(pathToFileURL(resolve(ssrDir, 'prerender-entry.js')).href);
const template = readFileSync(resolve(distDir, 'index.html'), 'utf8');

const SITE_URL = (process.env.VITE_SITE_URL || readEnvSiteUrl() || 'https://token-furnace.com').replace(/\/+$/, '');

function readEnvSiteUrl() {
  try {
    const match = readFileSync(resolve('.env'), 'utf8').match(/^VITE_SITE_URL=(.+)$/m);
    return match ? match[1].trim() : '';
  } catch {
    return '';
  }
}

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const escapeText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function replaceOnce(html, regex, replacement, label) {
  if (!regex.test(html)) throw new Error(`prerender: ${label} nicht im Template gefunden`);
  return html.replace(regex, replacement);
}

for (const route of SITE_ROUTES) {
  const appHtml = await renderRoute(route);
  const url = route.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${route.path}`;
  const title = escapeText(route.title);
  const description = escapeAttr(route.description);

  let html = template;
  html = replaceOnce(html, /<!--site-html-->/, () => appHtml, 'Marker <!--site-html-->');
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${title}</title>`, '<title>');
  html = replaceOnce(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${description}" />`, 'meta description');
  html = replaceOnce(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeAttr(route.title)}" />`, 'og:title');
  html = replaceOnce(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${description}" />`, 'og:description');
  html = replaceOnce(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`, 'og:url');
  html = replaceOnce(html, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapeAttr(route.title)}" />`, 'twitter:title');
  html = replaceOnce(html, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${description}" />`, 'twitter:description');
  html = replaceOnce(html, /<!--site-head-->/, `<link rel="canonical" href="${url}" />`, 'Marker <!--site-head-->');

  writeFileSync(resolve(distDir, `${route.file}.html`), html);
  console.log(`prerender: ${route.path} -> dist/${route.file}.html (${(appHtml.length / 1024).toFixed(1)} kB HTML)`);
}

// Spiel-Hülle für /play/*: der SPA-Fallback ist dist/index.html (die vorgerenderte
// Startseite) - ein Deep-Link wie /play/shop würde bis zum JS-Start kurz Startseiten-Text
// zeigen. dist/play.html ist dieselbe Hülle mit leerem #root; Cloudflare liefert sie unter
// /play direkt aus, für /play/* greift die 200-Rewrite-Regel in public/_redirects.
writeFileSync(
  resolve(distDir, 'play.html'),
  template.replace(/<!--site-html-->/, '').replace(/<!--site-head-->/, ''),
);
console.log('prerender: /play/* -> dist/play.html (leere Spiel-Hülle)');

rmSync(ssrDir, { recursive: true, force: true });
