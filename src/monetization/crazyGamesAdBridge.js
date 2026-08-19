import { isCrazyGamesBuild } from './crazyGamesSdk';

// Rewarded-ad bridge for the CrazyGames build - implements the same present(type, onTick)
// contract as webAdBridge/nativeAdBridge (see AdBridge.js). CrazyGames renders its own
// full-screen ad UI and doesn't expose a countdown, so onTick is called once just to clear
// any "watching ad..." UI state the caller may be tracking, not to drive a visible timer.
// Docs: https://docs.crazygames.com/sdk/video-ads/
export const crazyGamesAdBridge = {
  present(_type, onTick) {
    onTick?.(0);
    if (!isCrazyGamesBuild()) return Promise.resolve('failed');
    return new Promise((resolve) => {
      window.CrazyGames.SDK.ad.requestAd('rewarded', {
        adFinished: () => resolve('rewarded'),
        adError: () => resolve('failed'),
      });
    });
  },
};
