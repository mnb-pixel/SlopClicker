import Foundation
import Capacitor
import StoreKit

// Custom Capacitor plugin for the single "ad-free" non-consumable IAP, using StoreKit 2
// directly - on-device entitlement, no backend, no third-party billing SDK. See
// docs/ios-app-konzept.md §5 for why this is hand-written instead of RevenueCat or similar:
// a single non-consumable product doesn't need subscription-management infrastructure, and
// StoreKit 2's Transaction.currentEntitlements is the source of truth Apple itself signs.
//
// JS side: src/monetization/nativePurchaseBridge.js (registerPlugin('AdFreePurchase', ...)).
@objc(AdFreePurchasePlugin)
public class AdFreePurchasePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AdFreePurchasePlugin"
    public let jsName = "AdFreePurchase"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getEntitlements", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise)
    ]

    // TODO vor dem ersten Release-Build: muss exakt der Product-ID aus App Store Connect
    // entsprechen UND mit AD_FREE_PRODUCT_ID in src/monetization/PurchaseBridge.js
    // übereinstimmen (dort nur zu Dokumentationszwecken mitgeführt - dieser native Wert
    // hier ist die tatsächlich verwendete ID).
    private let productId = "com.tokenfurnace.adfree"

    private var updateListenerTask: Task<Void, Never>?

    override public func load() {
        // Läuft für die gesamte App-Laufzeit: fängt Transaktionen ab, die außerhalb eines
        // expliziten purchase()-Aufrufs eintreffen (Ask-to-Buy-Freigabe, Family-Sharing-
        // Übernahme von einem anderen Gerät) - siehe docs/ios-app-konzept.md §5.3.
        updateListenerTask = Task { [weak self] in
            guard let self = self else { return }
            for await result in Transaction.updates {
                if case .verified(let transaction) = result, transaction.productID == self.productId {
                    await transaction.finish()
                    self.notifyListeners("entitlementChange", data: ["adFree": true])
                }
            }
        }
    }

    deinit {
        updateListenerTask?.cancel()
    }

    @objc func getEntitlements(_ call: CAPPluginCall) {
        Task {
            let adFree = await self.hasAdFreeEntitlement()
            call.resolve(["adFree": adFree])
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        Task {
            do {
                let products = try await Product.products(for: [self.productId])
                guard let product = products.first else {
                    // Produkt in App Store Connect nicht gefunden/nicht freigegeben - kein
                    // Absturz, der Aufrufer (purchaseAdFree in useGameStore.js) behandelt
                    // 'failed' bereits als regulären, loggenswerten Fehlerfall.
                    call.resolve(["status": "failed"])
                    return
                }

                let result = try await product.purchase()
                switch result {
                case .success(let verification):
                    if case .verified(let transaction) = verification {
                        await transaction.finish()
                        call.resolve(["status": "purchased"])
                    } else {
                        // StoreKit konnte die Transaktion nicht verifizieren (z.B.
                        // manipulierter Jailbreak-Beleg) - NICHT als Kauf werten.
                        call.resolve(["status": "failed"])
                    }
                case .userCancelled:
                    call.resolve(["status": "cancelled"])
                case .pending:
                    // Ask to Buy o.ä. - Freigabe kommt später über Transaction.updates oben,
                    // dann feuert notifyListeners("entitlementChange", ...) automatisch.
                    call.resolve(["status": "pending"])
                @unknown default:
                    call.resolve(["status": "failed"])
                }
            } catch {
                call.reject("Purchase failed: \(error.localizedDescription)", nil, error)
            }
        }
    }

    @objc func restore(_ call: CAPPluginCall) {
        Task {
            // AppStore.sync() fordert die aktuellen Kaufbelege frisch von Apple an (deckt
            // z.B. einen Gerätewechsel ohne vorherige Transaction.updates-Zustellung ab).
            // Kann ohne Netz/Account fehlschlagen - dann trotzdem gegen den lokalen
            // Beleg-Cache prüfen statt hart abzubrechen, ein Offline-"Restore" auf einem
            // Gerät mit gültigem lokalen Kaufbeleg soll trotzdem funktionieren.
            try? await AppStore.sync()
            let adFree = await self.hasAdFreeEntitlement()
            call.resolve(["adFree": adFree])
        }
    }

    private func hasAdFreeEntitlement() async -> Bool {
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result, transaction.productID == productId {
                return true
            }
        }
        return false
    }
}
