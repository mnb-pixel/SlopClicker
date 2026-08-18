// Native AdMob banner controller for the footer slot - App.jsx calls these based on adFree
// (see the useEffect there). Not a DOM element: AdMob draws this as a native overlay on top
// of the WebView, positioned via the `margin`/`position` options below.
import { AdMob, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';
import { ensureAdConsent } from './adConsent';

// TODO vor Release: durch die echte Banner-Ad-Unit-ID aus der AdMob-Konsole ersetzen (siehe
// den REWARDED_AD_UNIT_ID-TODO in nativeAdBridge.js). Aktuell Googles offizielle
// iOS-Test-Ad-Unit-ID für adaptive Banner.
const BANNER_AD_UNIT_ID = 'ca-app-pub-3940256099942544/2934735716';

// Bottom-Margin über der Tab-Leiste (56px, siehe App.jsx-Kommentar "Tab-Leiste (56px)") plus
// etwas Sicherheitsabstand - der native Banner liegt sonst genau auf den Tab-Buttons.
const BOTTOM_MARGIN = 56;

let bannerShown = false;

export async function showNativeBanner() {
  try {
    await ensureAdConsent();
    await AdMob.showBanner({
      adId: BANNER_AD_UNIT_ID,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: BOTTOM_MARGIN,
      isTesting: true,
    });
    bannerShown = true;
  } catch (e) {
    console.error('Native banner failed:', e);
  }
}

export async function hideNativeBanner() {
  // removeBanner() statt hideBanner(): eine Käuferin/ein Käufer von "werbefrei" soll das
  // Banner nicht nur unsichtbar, sondern tatsächlich entfernt bekommen (siehe
  // docs/ios-app-konzept.md §6, "Ad-SDK gar nicht erst initialisiert" - hier zumindest nicht
  // dauerhaft geladen lassen). Nur aufrufen, wenn zuvor auch tatsächlich eins gezeigt wurde,
  // sonst meldet das Plugin unnötig einen Fehler für ein nie existierendes Banner.
  if (!bannerShown) return;
  bannerShown = false;
  try {
    await AdMob.removeBanner();
  } catch (e) {
    console.error('Removing native banner failed:', e);
  }
}
