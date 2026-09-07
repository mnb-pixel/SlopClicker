// Klaro-Konfiguration für die Werbe-Cookie-Einwilligung. Anbieter ist Google AdSense (Ad
// Placement API für Rewarded Ads, klassische Display-Anzeigen im Banner - siehe
// monetization/adsensePlacement.js/AdBanner.jsx), Google wird deshalb hier namentlich
// genannt statt nur generisch "Werbung" zu sagen (Googles "EU User Consent Policy" verlangt
// das explizit). adsbygoogle.js selbst lädt trotzdem erst NACH dieser Einwilligung UND nur
// mit gesetzter VITE_ADSENSE_CLIENT_ID (siehe .env) - service.callback unten koppelt
// weiterhin an useAdConsent() (adConsentStore.js), unverändert seit vor der AdSense-Wahl.
//
// WICHTIG: Google verlangt für Publisher mit EWR/UK-Traffic inzwischen i.d.R. einen bei
// Google registrierten CMP (IAB TCF) - ob Klaro dafür ausreicht oder eine TCF-zertifizierte
// Lösung nötig wird, VOR dem Go-Live mit echten Anzeigen in der aktuellen AdSense-
// Publisher-Richtlinie ("EU-Nutzereinwilligungsrichtlinie") gegenprüfen.
//
// Klaro selbst ist Open Source (BSD-3, kein SaaS, keine Traffic-Grenze, siehe
// github.com/kiprotect/klaro) und rendert seinen Consent-Hinweis/-Manager als eigenes
// DOM-Overlay - initialize() in App.jsx ruft nur setup(klaroConfig) auf, der Rest (Anzeigen,
// Speichern der Entscheidung) übernimmt Klaro selbst.
//
// default:false + kein Service als "default"/"required" markiert => Opt-in: ohne aktive
// Zustimmung bleibt der Service deaktiviert.
import { setAdConsent } from './adConsentStore';

const klaroConfig = {
  storageMethod: 'cookie',
  cookieName: 'klaro-token-furnace',
  cookieExpiresAfterDays: 365,
  default: false,
  mustConsent: false,
  acceptAll: true,
  hideDeclineAll: false,
  lang: 'de',
  translations: {
    de: {
      consentModal: {
        title: 'Datenschutzeinstellungen',
        description:
          'Token Furnace ist kostenlos und finanziert sich über Werbung von Google AdSense. Hier kannst du entscheiden, ob Werbe-Cookies gesetzt werden dürfen.',
      },
      consentNotice: {
        description: 'Wir verwenden Werbe-Cookies von Google AdSense, um dieses kostenlose Spiel zu finanzieren.',
        learnMore: 'Einstellungen',
      },
      purposes: {
        advertising: 'Werbung',
      },
      advertising: {
        title: 'Google AdSense',
        description: 'Werbe-Cookies von Google AdSense zur Finanzierung des Spiels (Banner-Anzeigen und optionale Rewarded Ads für Bonus-Belohnungen).',
      },
    },
    en: {
      consentModal: {
        title: 'Privacy settings',
        description:
          'Token Furnace is free and funded by Google AdSense ads. Here you can decide whether ad cookies may be set.',
      },
      consentNotice: {
        description: 'We use Google AdSense ad cookies to fund this free game.',
        learnMore: 'Settings',
      },
      purposes: {
        advertising: 'Advertising',
      },
      advertising: {
        title: 'Google AdSense',
        description: 'Google AdSense ad cookies that fund the game (banner ads and optional rewarded ads for bonus rewards).',
      },
    },
  },
  services: [
    {
      name: 'advertising',
      purposes: ['advertising'],
      default: false,
      required: false,
      onlyOnce: false,
      callback: (consent) => setAdConsent(!!consent),
    },
  ],
};

export default klaroConfig;
