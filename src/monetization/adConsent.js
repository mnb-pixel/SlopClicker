// UMP consent (DSGVO) und App Tracking Transparency, gestützt auf @capacitor-community/admob
// (Googles UMP SDK kommt mit dem Mobile Ads SDK mit, kein separates Paket nötig).
//
// ensureAdConsent() ist die EINZIGE Stelle, die sowohl Consent einholt als auch das Mobile
// Ads SDK initialisiert - bewusst in dieser Reihenfolge, weil Google verlangt, dass Ads erst
// NACH abgeschlossener Consent-Erhebung angefragt werden. nativeAdBridge.js und
// nativeBanner.js warten beide darauf, bevor sie irgendeine Ad-API anfassen - memoized, damit
// es egal ist, welcher Aufrufer zuerst dran ist, und das Formular nur einmal pro Sitzung
// erscheint statt bei jedem Aufruf erneut.
import { AdMob, AdmobConsentStatus } from '@capacitor-community/admob';

let consentPromise = null;

export function ensureAdConsent() {
  if (!consentPromise) {
    consentPromise = (async () => {
      try {
        const info = await AdMob.requestConsentInfo();
        if (info.isConsentFormAvailable && info.status === AdmobConsentStatus.REQUIRED) {
          await AdMob.showConsentForm();
        }
      } catch (e) {
        // Kein Blocker: ohne verwertbare Consent-Antwort (z.B. Netzwerkfehler) trotzdem
        // initialisieren - das SDK selbst fällt dann konservativ auf nicht-personalisierte
        // Ads zurück, statt die App komplett ohne Werbung/Bonus hängen zu lassen.
        console.error('AdMob consent request failed:', e);
      }
      await AdMob.initialize();
    })();
  }
  return consentPromise;
}

// Wiedereinstieg für einen "Datenschutzeinstellungen"-Eintrag in den App-Einstellungen -
// Pendant zum heutigen Cookie-Link auf Web. Öffnet das UMP-Formular erneut, unabhängig vom
// aktuellen Consent-Status (zeigt nur etwas an, wenn Google für diese Nutzerin/diesen Nutzer
// überhaupt Privacy-Options-Pflicht meldet, siehe PrivacyOptionsRequirementStatus).
export async function showAdPrivacyOptions() {
  await ensureAdConsent();
  await AdMob.showPrivacyOptionsForm();
}

// Reiner Status-Check, OHNE den Systemprompt auszulösen - useGameStore.js nutzt das, um zu
// entscheiden, ob der eigene Erklärbildschirm (TrackingExplainerModal) gezeigt werden muss,
// bevor der eigentliche ATT-Prompt kommt (siehe docs/ios-app-konzept.md §6: "nicht beim
// Kaltstart", "vorher ein eigener Erklärbildschirm").
export async function getTrackingStatus() {
  const { status } = await AdMob.trackingAuthorizationStatus();
  return status;
}

// Löst den eigentlichen ATT-Systemprompt aus - wird erst NACH dem Erklärbildschirm
// aufgerufen (siehe TrackingExplainerModal/confirmTrackingExplainer in useGameStore.js).
export async function requestTrackingAuthorization() {
  await AdMob.requestTrackingAuthorization();
}
