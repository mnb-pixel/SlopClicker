import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Entfernt Plattform-spezifische Marker-Blöcke aus index.html je nach Build-Ziel. Zwei
// Blöcke, zwei unabhängige Bedingungen:
// - web-only (Google AdSense): raus für --mode native (App-WebView, AdSense nicht
//   lizenziert, würde auch Werbefrei-Käufer:innen treffen - siehe docs/ios-app-konzept.md §6)
//   UND für --mode crazygames (dort läuft Monetarisierung exklusiv über deren eigenes
//   Ad-SDK, siehe src/monetization/crazyGamesAdBridge.js - ein zweites Netzwerk auf derselben
//   Seite ist gegen die CrazyGames-Richtlinien).
// - crazygames-only (CrazyGames SDK Script): nur FÜR --mode crazygames drin, in den anderen
//   beiden Builds unnötiger Ballast, der dort ohnehin nie initialisieren würde.
// Marker-Kommentare statt URL-Regex, damit hier nichts beim nächsten Snippet-Update
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

// public/ads.txt und public/_headers landen unverändert in JEDEM Build-Output, weil Vite
// public/ komplett kopiert - unabhängig vom transformIndexHtml-Marker-Mechanismus oben, der
// nur index.html selbst betrifft. ads.txt ist eine von Google erkannte AdSense-Publisher-
// Verifizierungsdatei, _headers nennt in seiner Content-Security-Policy explizit
// pagead2.googlesyndication.com (AdSense) - beide sind reine AdSense-/Cloudflare-Artefakte,
// die im CrazyGames-Build (fremd gehostet, eigenes Ad-SDK, siehe crazyGamesAdBridge.js) und
// im nativen Build (App-WebView, siehe docs/ios-app-konzept.md §6) nichts verloren haben,
// selbst wenn sie dort inert wären. Post-Build statt Marker-Strip, weil es echte Dateien
// im Output sind, kein HTML-Fragment.
function stripAdSenseOnlyFiles(shouldStrip) {
  return {
    name: 'strip-adsense-only-files',
    apply: 'build',
    async writeBundle(options) {
      if (!shouldStrip) return;
      const dir = options.dir || 'dist';
      await Promise.all(
        ['ads.txt', '_headers'].map((file) => rm(resolve(dir, file), { force: true }))
      );
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
    stripMarkedTags('web-only', mode === 'native' || mode === 'crazygames'),
    stripMarkedTags('crazygames-only', mode !== 'crazygames'),
    stripAdSenseOnlyFiles(mode === 'native' || mode === 'crazygames'),
  ],
}))
