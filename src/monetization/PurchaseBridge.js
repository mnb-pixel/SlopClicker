// Entitlement + purchase abstraction for the single "ad-free" IAP (a non-consumable).
// See docs/ios-app-konzept.md section 5.
//
// Two responsibilities:
//  - report the current entitlement ({ adFree: boolean }) so the game can gate the UI and
//    the ad bridge choice
//  - drive the purchase / restore flow when the player taps a "buy" / "restore" button
//
// The web build never offers a purchase: Apple requires IAP purchases to go through
// StoreKit (Guideline 3.1.1), so a web checkout for the same product is off the table.
// webPurchaseBridge always reports "not purchased" and hides the purchase UI via
// `isAvailable: false` - see the isAvailable check in the settings card component.

export const AD_FREE_PRODUCT_ID = 'com.tokenfurnace.adfree'; // TODO: must match the App Store Connect product id exactly

export const webPurchaseBridge = {
  isAvailable: false,
  async getEntitlements() {
    return { adFree: false };
  },
  async getProductInfo() {
    return null;
  },
  async purchase() {
    return 'failed';
  },
  async restore() {
    return { adFree: false };
  },
  // Native bridges call this back when a StoreKit transaction updates outside of an explicit
  // purchase() call (Ask to Buy approval, a transaction from another device via iCloud family
  // sharing). The web bridge never fires it. Returns an unsubscribe function.
  onEntitlementChange(_listener) {
    return () => {};
  },
};

// Picks the bridge to use. Same lazy-injection pattern as selectAdBridge: no static import
// of the native bridge here, so this file (and anything that imports it) works before
// Capacitor / the native purchase plugin exist in the project.
export function selectPurchaseBridge({ nativePurchaseBridge } = {}) {
  const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();
  if (isNative && nativePurchaseBridge) return nativePurchaseBridge;
  return webPurchaseBridge;
}
