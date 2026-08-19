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
  ],
}))
