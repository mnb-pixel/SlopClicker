import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Entfernt den CrazyGames-SDK-Marker-Block aus index.html außerhalb von --mode crazygames -
// dort bliebe window.CrazyGames sonst undefiniert und jeder Aufruf müsste das separat
// abfangen. Marker-Kommentar statt URL-Regex, damit hier nichts beim nächsten Snippet-Update
// stillschweigend danebengreift.
function stripMarkedTags(tagName, shouldStrip) {
  return {
    name: `strip-${tagName}-tags`,
    transformIndexHtml(html) {
      if (!shouldStrip) return html;
      const re = new RegExp(`<!-- ${tagName}:start -->[\\s\\S]*?<!-- ${tagName}:end -->`, 'g');
      return html.replace(re, '');
    },
  };
}

// public/_headers UND public/_redirects landen unverändert in JEDEM Build-Output, weil Vite
// public/ komplett kopiert - unabhängig vom transformIndexHtml-Marker-Mechanismus oben, der
// nur index.html selbst betrifft. Beide Dateien sind reine Web-/Cloudflare-Artefakte
// (Security-Header/CSP bzw. die /play-Redirects aus dem Landingpage-Umbau, siehe routes.js),
// die im CrazyGames-Build (fremd gehostet, eigenes Ad-SDK, siehe crazyGamesAdBridge.js) und
// im nativen Build (App-WebView, siehe docs/ios-app-konzept.md §6) nichts verloren haben,
// selbst wenn sie dort inert wären. Post-Build statt Marker-Strip, weil es echte Dateien im
// Output sind, keine HTML-Fragmente.
function stripWebOnlyHeadersFile(shouldStrip) {
  return {
    name: 'strip-web-only-headers-file',
    apply: 'build',
    async writeBundle(options) {
      if (!shouldStrip) return;
      const dir = options.dir || 'dist';
      await Promise.all([
        rm(resolve(dir, '_headers'), { force: true }),
        rm(resolve(dir, '_redirects'), { force: true }),
      ]);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // CrazyGames hostet Spiele unter einem Unterpfad (z.B. crazygames.com/game/<slug>/), nicht
  // an der Domain-Wurzel - absolute Asset-Pfade ("/assets/...") würden dort ins Leere zeigen,
  // relative Pfade funktionieren unabhängig vom tatsächlichen Hosting-Pfad.
  base: mode === 'crazygames' ? './' : '/',
  plugins: [
    react(),
    tailwindcss(),
    stripMarkedTags('crazygames-only', mode !== 'crazygames'),
    // Vorbestehende Lücke, beim /play-Umbau (routes.js/LandingPage.jsx) aufgefallen: der
    // "web-only"-Marker um den <nav>-Block in index.html (echte <a href>s zu den Tab-Routen
    // für JS-lose Crawler) hatte trotz gegenteiligem Kommentar dort noch NIE einen
    // passenden stripMarkedTags-Aufruf - der Block blieb bislang in JEDEM Build erhalten,
    // auch nativ/CrazyGames, wo diese Pfade gar nicht existieren.
    stripMarkedTags('web-only', mode === 'native' || mode === 'crazygames'),
    stripWebOnlyHeadersFile(mode === 'native' || mode === 'crazygames'),
  ],
}))
