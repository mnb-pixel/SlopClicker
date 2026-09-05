// Klaro-Konfiguration für die Werbe-Cookie-Einwilligung. Aktuell ist kein Werbe-Anbieter
// aktiv (siehe AdBanner.jsx - reiner Platzhalter nach dem kurzen, wieder verworfenen
// Adsterra-Zwischenspiel), der Service-Name bleibt deshalb bewusst generisch ("advertising")
// statt an einen bestimmten Anbieter gebunden - sobald ein neuer Anbieter feststeht, reicht
// es, Name/Texte hier anzupassen und die neue Ad-Komponente an useAdConsent()
// (adConsentStore.js) zu koppeln, statt die Klaro-Integration neu aufzusetzen.
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
          'Token Furnace ist kostenlos und finanziert sich (falls aktiv) über Werbung. Hier kannst du entscheiden, ob Werbe-Cookies gesetzt werden dürfen.',
      },
      consentNotice: {
        description: 'Wir verwenden ggf. Werbe-Cookies, um dieses kostenlose Spiel zu finanzieren.',
        learnMore: 'Einstellungen',
      },
      purposes: {
        advertising: 'Werbung',
      },
      advertising: {
        title: 'Werbung',
        description: 'Werbe-Cookies zur Finanzierung des Spiels (aktuell kein Anbieter aktiv).',
      },
    },
    en: {
      consentModal: {
        title: 'Privacy settings',
        description:
          'Token Furnace is free and, if active, funded by ads. Here you can decide whether ad cookies may be set.',
      },
      consentNotice: {
        description: 'We may use ad cookies to fund this free game.',
        learnMore: 'Settings',
      },
      purposes: {
        advertising: 'Advertising',
      },
      advertising: {
        title: 'Advertising',
        description: 'Ad cookies that fund the game (no active provider right now).',
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
