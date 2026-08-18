// Native AdBridge implementation (iOS/AdMob), used by useGameStore's requestBonus in place of
// webAdBridge when running natively and adFree is false (see selectAdBridge in AdBridge.js).
// Rewarded-only - see docs/ios-app-konzept.md section 6.
import { AdMob } from '@capacitor-community/admob';
import { ensureAdConsent } from './adConsent';

const REWARDED_AD_UNIT_ID = 'ca-app-pub-6020764817262332/6734821895';

export const nativeAdBridge = {
  // onTick bleibt ungenutzt: ein natives Rewarded-Ad ist eine eigene Vollbild-UI außerhalb
  // der WebView, kein in-JS-Countdown möglich (siehe AdBridge.js-Kommentar zum Interface).
  async present(_type, _onTick) {
    try {
      await ensureAdConsent();
      await AdMob.prepareRewardVideoAd({ adId: REWARDED_AD_UNIT_ID });
      // Laut Plugin-Doku löst showRewardVideoAd() auf, WENN die Belohnung verdient wurde -
      // wird die Ad ohne Reward weggeklickt, kommt stattdessen ein Reject (siehe catch unten).
      // Beide Fehlerfälle laufen hier auf 'failed' hinaus - requestBonus in useGameStore.js
      // zahlt den Bonus laut Konzept trotzdem aus ("Ladefehler dürfen nie blocken").
      await AdMob.showRewardVideoAd();
      return 'rewarded';
    } catch (e) {
      console.error('Rewarded ad failed:', e);
      return 'failed';
    }
  },
};
