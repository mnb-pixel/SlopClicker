// Native AdBridge implementation (iOS/AdMob), used by useGameStore's requestBonus in place
// of webAdBridge when running natively and adFree is false (see selectAdBridge in AdBridge.js
// and docs/ios-app-konzept.md §3.2/§6).
//
// present() hands off to AdMob's own full-screen rewarded-ad UI - unlike the web fallback it
// does not drive a countdown via onTick (the native ad UI has its own).
import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';

// TODO before shipping: replace with the real AdMob ad unit ID from the AdMob console. This
// is Google's public TEST rewarded ad unit for iOS - safe for development/TestFlight builds,
// but a production build hitting a test ID earns no revenue and Google will flag the
// mismatch. See https://developers.google.com/admob/ios/test-ads#test_ad_unit_ids
const REWARDED_AD_UNIT_ID = 'ca-app-pub-3940256099942544/1712485313';

// Shared across the app (also used by adConsent.js) so AdMob.initialize() only ever runs
// once regardless of how many places need it ready.
let initPromise = null;
export function ensureAdMobInitialized() {
  if (!initPromise) {
    initPromise = AdMob.initialize().catch((e) => {
      initPromise = null; // erlaubt einen erneuten Versuch beim nächsten Aufruf
      throw e;
    });
  }
  return initPromise;
}

export const nativeAdBridge = {
  async present(_type, _onTick) {
    try {
      await ensureAdMobInitialized();
      await AdMob.prepareRewardVideoAd({ adId: REWARDED_AD_UNIT_ID });

      return await new Promise((resolve) => {
        let settled = false;
        const handles = [];
        const finish = (value) => {
          if (settled) return;
          settled = true;
          // Listener wieder abräumen, sonst würde jeder weitere .present()-Aufruf im
          // Verlauf der Session zusätzliche, längst erledigte Listener aufhäufen.
          handles.splice(0).forEach((h) => h.then((handle) => handle.remove()).catch(() => {}));
          resolve(value);
        };
        handles.push(AdMob.addListener(RewardAdPluginEvents.Rewarded, () => finish('rewarded')));
        handles.push(AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => finish('failed')));
        // Dismissed ohne vorheriges Rewarded-Event = Nutzer:in hat abgebrochen, bevor die
        // Belohnung ausgelöst wurde - zählt als nicht eingelöst.
        handles.push(AdMob.addListener(RewardAdPluginEvents.Dismissed, () => finish('failed')));
        AdMob.showRewardVideoAd().catch(() => finish('failed'));
      });
    } catch (e) {
      console.error('AdMob rewarded ad failed:', e);
      // "Nie blockieren" (siehe useGameStore.requestBonus): 'failed' führt dort trotzdem zu
      // einer Auszahlung, nur ohne den adsWatched-Stat-Zähler und mit einem Log-Hinweis.
      return 'failed';
    }
  },
};
