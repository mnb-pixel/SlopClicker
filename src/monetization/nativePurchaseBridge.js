// Native PurchaseBridge implementation (iOS/StoreKit 2), used by useGameStore in place of
// webPurchaseBridge when running natively (see selectPurchaseBridge in PurchaseBridge.js).
// Talks to the custom native plugin at ios/App/App/AdFreePurchasePlugin.swift - see that
// file and docs/ios-app-konzept.md §5 for why this is hand-written instead of a third-party
// billing SDK.
import { registerPlugin } from '@capacitor/core';

const AdFreePurchase = registerPlugin('AdFreePurchase');

export const nativePurchaseBridge = {
  isAvailable: true,
  async getEntitlements() {
    try {
      const result = await AdFreePurchase.getEntitlements();
      return { adFree: !!result.adFree };
    } catch (e) {
      console.error('getEntitlements failed:', e);
      return { adFree: false };
    }
  },
  // productId kommt aus PurchaseBridge.js (AD_FREE_PRODUCT_ID) rein zur Konsistenz mit dem
  // Interface - der native Plugin kennt die ID bereits selbst (siehe productId in
  // AdFreePurchasePlugin.swift, MUSS mit AD_FREE_PRODUCT_ID synchron gehalten werden).
  async purchase(_productId) {
    try {
      const result = await AdFreePurchase.purchase();
      return result.status;
    } catch (e) {
      console.error('purchase failed:', e);
      return 'failed';
    }
  },
  async restore() {
    try {
      const result = await AdFreePurchase.restore();
      return { adFree: !!result.adFree };
    } catch (e) {
      console.error('restore failed:', e);
      return { adFree: false };
    }
  },
  // Deckt Transaktionen ab, die außerhalb eines expliziten purchase()-Aufrufs eintreffen
  // (Ask-to-Buy-Freigabe, Family-Sharing-Übernahme) - der native Plugin meldet sie über
  // denselben "entitlementChange"-Event, den Transaction.updates dort empfängt.
  onEntitlementChange(listener) {
    const handlePromise = AdFreePurchase.addListener('entitlementChange', (data) => {
      listener({ adFree: !!data.adFree });
    });
    return () => {
      handlePromise.then((handle) => handle.remove()).catch(() => {});
    };
  },
};
