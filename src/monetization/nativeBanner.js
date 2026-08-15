// Native AdMob banner controller - currently a no-op. @capacitor-community/admob wurde aus
// dem iOS-Build entfernt (siehe nativeAdBridge.js für den Grund: die App stürzte allein durch
// das Linken des Google-Mobile-Ads-SDK beim Start ab, solange keine echte AdMob-App-ID
// konfiguriert ist). AdBanner.jsx rendert auf nativ ohnehin nichts, showNativeBanner/
// hideNativeBanner bleiben als Aufrufstellen für App.jsx bestehen, tun aber nichts.
export async function showNativeBanner() {}

export async function hideNativeBanner() {}
