// Native AdBridge implementation (iOS), used by useGameStore's requestBonus in place of
// webAdBridge when running natively and adFree is false (see selectAdBridge in AdBridge.js).
//
// @capacitor-community/admob wurde aus dem iOS-Build entfernt: Googles Mobile Ads SDK
// verifiziert seine App-ID (GADApplicationIdentifier in Info.plist) automatisch beim
// App-Start, unabhängig davon, ob irgendein Code AdMob.initialize() aufruft - allein das
// Linken des Frameworks reicht, um beim Start mit SIGABRT abzustürzen
// (GADApplicationVerifyPublisherInitializedCorrectly), solange dort nur der Platzhalter
// SAMPLE_APP_ID steht. Ein JS-seitiger Guard kann das nicht abfangen, da der Crash vor jedem
// JS-Code passiert. Bis eine echte (oder Googles offizielle Test-)AdMob-App-ID vorliegt, gibt
// es hier deshalb keine native Werbung - present() liefert immer 'failed', wie bei jedem
// anderen Ad-Fehler auch.
export function ensureAdMobInitialized() {
  return Promise.resolve();
}

export const nativeAdBridge = {
  async present(_type, _onTick) {
    // "Nie blockieren" (siehe useGameStore.requestBonus): 'failed' führt dort trotzdem zu
    // einer Auszahlung, nur ohne den adsWatched-Stat-Zähler und mit einem Log-Hinweis.
    return 'failed';
  },
};
