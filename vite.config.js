import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Entfernt die reinen Web-Skripte (Google AdSense) aus index.html, wenn für die native App
// gebaut wird - `npm run build:ios` setzt dafür --mode native. Gesteuert über
// <!-- web-only:start/end -->-Marker im HTML, damit hier keine URL-Regex gepflegt werden muss,
// die beim nächsten Snippet-Update still danebengreift.
//
// Warum das nötig ist: AdSense ist für Webseiten lizenziert und in einer App-WebView nicht
// zulässig - es würde sonst auch für Werbefrei-Käufer:innen laden, also genau das brechen,
// was der IAP verspricht.
// Siehe docs/ios-app-konzept.md §6.
function stripWebOnlyTags(isNative) {
  return {
    name: 'strip-web-only-tags',
    transformIndexHtml(html) {
      if (!isNative) return html;
      return html.replace(/<!-- web-only:start -->[\s\S]*?<!-- web-only:end -->/g, '');
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), stripWebOnlyTags(mode === 'native')],
}))
