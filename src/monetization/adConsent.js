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

// Ohne diese Deckelung kann ein Plugin-Aufruf, der nie resolved/rejected (statt sauber
// zu scheitern), consentPromise für den Rest der Sitzung in der Schwebe halten - und damit
// jeden Rewarded-Ad-Button dauerhaft lahmlegen, siehe den `adState`-Guard in
// requestBonus (useGameStore.js), der bei einem ewig hängenden Promise nie zurückgesetzt wird.
function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

const CONSENT_TIMEOUT_MS = 10000;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// showConsentForm() braucht eine bereits im Fenster verankerte native Root-View-Controller-
// Kette, um das Formular modal zu präsentieren. ensureAdConsent() wird aber typischerweise
// ganz am App-Start aufgerufen (App.jsx-Mount-Effect) - zu diesem sehr frühen Zeitpunkt kann
// die Kette noch fehlen, auch wenn "WebView loaded" längst gefeuert hat (bestätigt per
// Gerätekonsole: erster Versuch scheitert reproduzierbar mit "No ViewController", ein
// einziger Retry nach kurzer Pause geht danach zuverlässig durch). Es gibt in Capacitor kein
// "deviceready"-Äquivalent für "Root-View-Controller ist jetzt präsentierbereit" - eine kurze
// Verzögerung vor dem Retry ist der pragmatische, von der Community verbreitete Workaround.
async function showConsentFormWithRetry() {
  try {
    await withTimeout(AdMob.showConsentForm(), CONSENT_TIMEOUT_MS);
  } catch (e) {
    console.error('showConsentForm failed on first attempt, retrying shortly:', e);
    await delay(1500);
    await withTimeout(AdMob.showConsentForm(), CONSENT_TIMEOUT_MS);
  }
}

let consentPromise = null;

export function ensureAdConsent() {
  if (!consentPromise) {
    consentPromise = (async () => {
      try {
        const info = await withTimeout(AdMob.requestConsentInfo(), CONSENT_TIMEOUT_MS);
        if (info.isConsentFormAvailable && info.status === AdmobConsentStatus.REQUIRED) {
          await showConsentFormWithRetry();
        }
      } catch (e) {
        // Kein Blocker: ohne verwertbare Consent-Antwort (z.B. Netzwerkfehler oder Timeout)
        // trotzdem initialisieren - das SDK selbst fällt dann konservativ auf nicht-
        // personalisierte Ads zurück, statt die App komplett ohne Werbung/Bonus hängen zu
        // lassen.
        console.error('AdMob consent request failed:', e);
      }
      try {
        await withTimeout(AdMob.initialize(), CONSENT_TIMEOUT_MS);
      } catch (e) {
        // Auch das SDK-Init darf ensureAdConsent() nie dauerhaft blockieren - present()/
        // showBanner() scheitern dann eben ihrerseits klar mit einem eigenen Fehler, statt
        // dass jeder künftige Aufruf in dieser Sitzung auf demselben toten Promise wartet.
        console.error('AdMob initialize failed or timed out:', e);
      }
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
