// Native AdBridge implementation (iOS/AdMob), used by useGameStore's requestBonus in place of
// webAdBridge when running natively and adFree is false (see selectAdBridge in AdBridge.js).
// Rewarded-only - see docs/ios-app-konzept.md section 6.
import { AdMob } from '@capacitor-community/admob';
import { ensureAdConsent } from './adConsent';

const REWARDED_AD_UNIT_ID = 'ca-app-pub-6020764817262332/6734821895';

// Deckelt jeden einzelnen Plugin-Aufruf: ohne das könnte ein prepareRewardVideoAd(), das nie
// resolved/rejected (z.B. bei "no fill" ohne sauberen Fehler), present() für immer hängen
// lassen - requestBonus() in useGameStore.js bekäme dann nie ein 'rewarded'/'failed' zurück
// und der `adState`-Guard dort würde jeden weiteren Ad-Button für den Rest der Sitzung sperren.
const AD_LOAD_TIMEOUT_MS = 20000;

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export const nativeAdBridge = {
  // onTick bleibt ungenutzt: ein natives Rewarded-Ad ist eine eigene Vollbild-UI außerhalb
  // der WebView, kein in-JS-Countdown möglich (siehe AdBridge.js-Kommentar zum Interface).
  async present(_type, _onTick) {
    try {
      await ensureAdConsent();
      await withTimeout(AdMob.prepareRewardVideoAd({ adId: REWARDED_AD_UNIT_ID }), AD_LOAD_TIMEOUT_MS);
      // Laut Plugin-Doku löst showRewardVideoAd() auf, WENN die Belohnung verdient wurde -
      // wird die Ad ohne Reward weggeklickt, kommt stattdessen ein Reject (siehe catch unten).
      // Beide Fehlerfälle laufen hier auf 'failed' hinaus - requestBonus in useGameStore.js
      // zahlt den Bonus laut Konzept trotzdem aus ("Ladefehler dürfen nie blocken").
      await withTimeout(AdMob.showRewardVideoAd(), AD_LOAD_TIMEOUT_MS);
      return 'rewarded';
    } catch (e) {
      console.error('Rewarded ad failed:', e);
      return 'failed';
    }
  },
};
