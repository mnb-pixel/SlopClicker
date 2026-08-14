// UMP consent (GDPR) and App Tracking Transparency orchestration. Both run entirely through
// @capacitor-community/admob - no separate UMP SDK integration needed. See
// docs/ios-app-konzept.md §6.
//
// None of this runs for adFree purchasers: the ad SDK is never initialized for them in the
// first place (see selectAdBridge in AdBridge.js), so these functions are simply never
// called on that path.
import { AdMob } from '@capacitor-community/admob';
import { ensureAdMobInitialized } from './nativeAdBridge';

const isNative = () => typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();

// Call once at app start (before any ad is requested): fetches the UMP consent status and
// shows Google's consent form if required. AdMob won't serve personalized ads - and in some
// regions no ads at all - until this resolves, so it must run before the first
// requestBonus() that could hit the ad bridge.
export async function ensureAdConsent() {
  if (!isNative()) return;
  await ensureAdMobInitialized();
  const info = await AdMob.requestConsentInfo();
  if (info.isConsentFormAvailable && info.status === 'REQUIRED') {
    await AdMob.showConsentForm();
  }
}

// Opens the privacy-options form - the native counterpart to today's Termly
// "Datenschutzeinstellungen" link (see MiscTab.jsx). Only meaningful after ensureAdConsent()
// has run at least once.
export async function showAdPrivacyOptions() {
  if (!isNative()) return;
  await AdMob.showPrivacyOptionsForm();
}

// App Tracking Transparency: deliberately NOT called at cold start. Apple's and the
// concept's own guidance (docs/ios-app-konzept.md §6) is to ask after the first meaningful
// interaction, with the request framed by context rather than firing the OS prompt on an
// empty screen - callers should invoke this once that "meaningful interaction" has happened
// (e.g. after the first tap). Idempotent: only the first call actually asks.
//
// A pre-permission explainer screen ahead of the system prompt (recommended in the concept
// for conversion rate) is NOT implemented here - it's new UI (copy, translations, styling)
// that didn't fit this pass; see the README for that as a follow-up.
let attRequested = false;
export async function requestTrackingIfNeeded() {
  if (!isNative() || attRequested) return;
  attRequested = true;
  try {
    const { status } = await AdMob.trackingAuthorizationStatus();
    if (status === 'notDetermined') {
      await AdMob.requestTrackingAuthorization();
    }
  } catch (e) {
    console.error('ATT request failed:', e);
  }
}
