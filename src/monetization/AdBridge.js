// Rewarded-ad presentation, abstracted behind one interface so the game logic in
// useGameStore never has to know whether it's talking to the web fake-timer, the native
// AdMob SDK, or "ad-free" (which skips presentation entirely).
// See docs/ios-app-konzept.md section 3.2.
//
// present(type, onTick) resolves to 'rewarded' | 'failed'.
// - onTick(secondsRemaining) is called while a countdown should be shown in the UI (the
//   web bridge fakes one). Bridges that hand off to a full-screen native ad UI, or that
//   never show a countdown at all (ad-free), can ignore it.
// - 'failed' means no reward was granted (the caller decides what to do - see
//   requestBonus in useGameStore, which currently grants the reward anyway per the
//   concept's "never block the player on ad fill" rule).

// Web fallback: fakes the same 3-second countdown the game has always shown, and always
// resolves 'rewarded'. This is NOT a real ad network integration - it exists so the browser
// build keeps working unchanged while native builds get a real implementation.
export const webAdBridge = {
  present(_type, onTick) {
    return new Promise((resolve) => {
      let count = 3;
      onTick?.(count);
      const interval = setInterval(() => {
        count -= 1;
        onTick?.(count);
        if (count <= 0) {
          clearInterval(interval);
          resolve('rewarded');
        }
      }, 1000);
    });
  },
};

// Ad-free entitlement: resolves immediately, no countdown, no ad SDK ever touched. This is
// the entire behaviour change "werbefrei" makes to rewarded placements - useGameStore just
// picks this bridge and skips the adState/timer UI (see requestBonus).
export const noAdBridge = {
  present() {
    return Promise.resolve('rewarded');
  },
};

// Picks the bridge to use. adFree always wins (never initializes an ad SDK for a paying
// customer). Native detection is done via the global Capacitor injects at runtime - no
// static import of @capacitor/core here, so this file works before Capacitor is even
// installed in the project and during plain `npm run dev`.
export function selectAdBridge({ adFree, nativeAdBridge } = {}) {
  if (adFree) return noAdBridge;
  const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();
  if (isNative && nativeAdBridge) return nativeAdBridge;
  return webAdBridge;
}
