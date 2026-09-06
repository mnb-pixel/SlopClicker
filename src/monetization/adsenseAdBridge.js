import { getAdConsent } from './adConsentStore';
import { isAdsenseConfigured, loadAdsense } from './adsensePlacement';

// Rewarded-Ad-Bridge für den reinen Web-Build über Googles Ad Placement API (Teil von
// AdSense, siehe adsensePlacement.js) - implementiert denselben present(type, onTick)-
// Vertrag wie webAdBridge/nativeAdBridge/crazyGamesAdBridge (siehe AdBridge.js). onTick wird
// hier nur einmal mit 0 aufgerufen: adBreak() zeigt eine eigene Vollbild-UI inkl. eigenem
// Ladezustand, ein zusätzlicher Fake-Countdown wie im Web-Fallback wäre nur verwirrend
// doppelt.
//
// Ohne erteilten Werbe-Cookie-Consent (Klaro, siehe adConsentStore.js) wird nie ein Script
// geladen und nie adBreak() aufgerufen - weder AdSense-Richtlinien noch DSGVO erlauben das
// vor der Einwilligung. present() liefert dann sofort 'failed'; requestBonus()
// (useGameStore.js) vergibt die Belohnung trotzdem (siehe dortiger "nie wegen Ad-Fill
// blockieren"-Grundsatz) - kein Consent bedeutet für Spieler:innen also bestenfalls "Bonus
// ohne Wartezeit", nie "Bonus blockiert".
export const adsenseAdBridge = {
  // selectAdBridge() (AdBridge.js) calls this to decide whether the plain web build should
  // use AdSense at all - false (no VITE_ADSENSE_CLIENT_ID set) means "not approved/configured
  // yet", falling back to webAdBridge's fake timer, exactly like before this bridge existed.
  isConfigured: isAdsenseConfigured,
  async present(_type, onTick) {
    onTick?.(0);
    if (!getAdConsent()) return 'failed';

    const ready = await loadAdsense();
    if (!ready || typeof window.adBreak !== 'function') return 'failed';

    return new Promise((resolve) => {
      window.adBreak({
        type: 'reward',
        name: 'bonus-reward',
        beforeReward: (showAdFn) => showAdFn(),
        adDismissed: () => resolve('failed'),
        adViewed: () => resolve('rewarded'),
        // "Immer zuletzt aufgerufen" (Google-Doku) - Sicherheitsnetz für Fälle ohne Ad-Fill,
        // in denen weder adViewed noch adDismissed feuert (z.B. breakStatus
        // "noAdPreloaded"/"ignored"/"timeout"). Ohne das bliebe das Promise für immer offen
        // und requestBonus() hinge fest. resolve() ist idempotent, doppeltes Auflösen (z.B.
        // nach adViewed) ist also unschädlich.
        adBreakDone: (placementInfo) => {
          if (!['viewed', 'dismissed'].includes(placementInfo?.breakStatus)) {
            resolve('failed');
          }
        },
      });
    });
  },
};
