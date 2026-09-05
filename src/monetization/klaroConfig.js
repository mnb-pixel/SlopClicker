// Klaro-Konfiguration für die Adsterra-Einwilligung (Banner, Native Banner, Popunder - alle
// drei Formate sind derselbe Anbieter, siehe legal.content.js Abschnitt "Onlinemarketing",
// deshalb EIN Service statt drei). Klaro selbst ist Open Source (BSD-3, kein SaaS, keine
// Traffic-Grenze, siehe github.com/kiprotect/klaro) und rendert seinen Consent-Hinweis/
// -Manager als eigenes DOM-Overlay - initialize() in App.jsx ruft nur setup(klaroConfig) auf,
// der Rest (Anzeigen, Speichern der Entscheidung) übernimmt Klaro selbst.
//
// default:false + kein Service als "default"/"required" markiert => Opt-in: ohne aktive
// Zustimmung bleibt der Service deaktiviert, das deckt sich mit der in legal.content.js
// angegebenen Rechtsgrundlage "Einwilligung (Art. 6 Abs. 1 S. 1 lit. a) DSGVO)".
import { setAdsterraConsent } from './adConsentStore';

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
          'Token Furnace ist kostenlos und finanziert sich über Werbung. Hier kannst du entscheiden, ob Adsterra-Werbe-Cookies gesetzt werden dürfen.',
      },
      consentNotice: {
        description:
          'Wir verwenden Werbe-Cookies von Adsterra, um dieses kostenlose Spiel zu finanzieren.',
        learnMore: 'Einstellungen',
      },
      purposes: {
        advertising: 'Werbung',
      },
      adsterra: {
        title: 'Adsterra',
        description:
          'Banner-, Native-Banner- und Popunder-Werbung zur Finanzierung des Spiels.',
      },
    },
    en: {
      consentModal: {
        title: 'Privacy settings',
        description:
          'Token Furnace is free and funded by ads. Here you can decide whether Adsterra ad cookies may be set.',
      },
      consentNotice: {
        description: 'We use Adsterra ad cookies to fund this free game.',
        learnMore: 'Settings',
      },
      purposes: {
        advertising: 'Advertising',
      },
      adsterra: {
        title: 'Adsterra',
        description: 'Banner, native banner and popunder ads that fund the game.',
      },
    },
  },
  services: [
    {
      name: 'adsterra',
      purposes: ['advertising'],
      default: false,
      required: false,
      onlyOnce: false,
      callback: (consent) => setAdsterraConsent(!!consent),
    },
  ],
};

export default klaroConfig;
