// Native AdMob banner controller. A native banner is NOT a DOM element - it's an overlay the
// Google Mobile Ads SDK draws above the WKWebView at a position AdMob itself controls
// (BannerAdPosition.BOTTOM_CENTER etc.), so it has no 1:1 correspondence with the `<AdBanner>`
// placeholder box used on web. On native, AdBanner.jsx renders nothing at all instead, and
// this controller shows/hides the real native banner in step with adFree.
import { AdMob, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';
import { ensureAdMobInitialized } from './nativeAdBridge';

// TODO before shipping: replace with the real AdMob banner ad unit ID from the AdMob
// console (Google's public iOS test banner ID, see nativeAdBridge.js for the same caveat).
const BANNER_AD_UNIT_ID = 'ca-app-pub-3940256099942544/2934735716';

const isNative = () => typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();

let shown = false;

export async function showNativeBanner() {
  if (!isNative() || shown) return;
  try {
    await ensureAdMobInitialized();
    await AdMob.showBanner({
      adId: BANNER_AD_UNIT_ID,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
    });
    shown = true;
  } catch (e) {
    console.error('AdMob banner failed to show:', e);
  }
}

export async function hideNativeBanner() {
  if (!isNative() || !shown) return;
  try {
    await AdMob.removeBanner();
  } catch (e) {
    console.error('AdMob banner failed to hide:', e);
  } finally {
    shown = false;
  }
}
