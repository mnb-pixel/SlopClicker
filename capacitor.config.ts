import type { CapacitorConfig } from '@capacitor/cli';

// TODO vor dem ersten Xcode-Build: appId muss exakt der Bundle ID entsprechen, die in
// App Store Connect für diese App registriert wird (Reverse-DNS, siehe token-furnace.com in
// .env). Ändert man ihn später nochmal, verlangt Xcode i.d.R. ein neues Signing-Profil.
const config: CapacitorConfig = {
  appId: 'com.tokenfurnace.app',
  appName: 'Token Furnace',
  webDir: 'dist',
  // Server-Block bewusst leer: die App lädt ihr Bundle ausschließlich aus dem lokal
  // gebauten dist/-Ordner (siehe docs/ios-app-konzept.md §3.1, "vollständig offline"-
  // Anforderung für den App-Review) - kein Live-Reload von einer Remote-URL im Release-Build.
  ios: {
    // Contentful-Inset statt automatischer WKWebView-Insets: das bestehende Layout setzt
    // Safe-Area-Paddings selbst (siehe index.css), damit iOS nicht zusätzlich eigene
    // Scroll-Insets addiert, die den Header/Footer doppelt verschieben würden.
    contentInset: 'never',
  },
};

export default config;
