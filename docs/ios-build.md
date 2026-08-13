# iOS-Build — Übergabe an Xcode

Begleitdokument zu [`ios-app-konzept.md`](./ios-app-konzept.md) (das *Warum/Was*). Dieses
Dokument ist das *Wie*: alles, was ohne macOS/Xcode vorbereitet werden konnte, ist erledigt
und committet. Diese Anleitung ist der Übergabepunkt — ab hier auf einem Mac weiter.

## Was bereits steht

- Kompletter Capacitor-iOS-Projektordner unter `ios/` (Xcode-Projekt, kein CocoaPods —
  Capacitor 8 löst Plugins über Swift Package Manager auf, siehe
  `ios/App/CapApp-SPM/Package.swift`)
- Werbefrei-IAP-Bridge (`src/monetization/`), Native-Plugin-Anbindung
  (`src/platform/`), Safe-Area-/Touch-CSS, AdMob-Wiring, ein selbstgeschriebenes
  StoreKit-2-Plugin (`ios/App/App/AdFreePurchasePlugin.swift`) für den Kauf
- Alles auf dem Web-Build durchgetestet (`npm run dev` + Playwright), da hier kein
  Simulator/Gerät zur Verfügung steht — native Pfade (AdMob, StoreKit, Haptics, Preferences,
  App-Lifecycle) sind nach bestem Wissen gegen die jeweiligen Plugin-APIs geschrieben, aber
  **noch nie auf einem echten iOS-Build gelaufen**. Der erste Simulator-Start ist der erste
  echte Test dieser Pfade.

## Voraussetzungen

- Mac mit aktuellem Xcode (mindestens Xcode 16, wegen `swift-tools-version: 5.9` und
  `.iOS(.v15)` in `Package.swift`)
- Ein Apple Developer Account (für Signing; für reine Simulator-Läufe ohne echtes Gerät reicht
  ein kostenloser Account, für Kauf-/StoreKit-Tests s.u. auch)
- Node.js (Version wie in der Haupt-`package.json` verwendet) für den Web-Build-Schritt

## Erststart

```bash
npm install
npm run build:ios      # NICHT `npm run build` - siehe Kasten unten
npx cap sync ios
open ios/App/App.xcodeproj
```

> **Immer `build:ios`, nie `build`.** Der normale Web-Build lässt die AdSense- und
> Termly-Skripte in `index.html` stehen. Beide gehören nicht in die App: AdSense ist für
> Webseiten lizenziert und in einer WebView nicht zulässig, Termly würde parallel zum
> nativen UMP-Consent laufen — und beide würden auch für Werbefrei-Käufer:innen laden.
> `build:ios` (= `vite build --mode native`) entfernt sie, siehe `vite.config.js`.
> Kontrolle nach dem Sync:
> `grep -c "termly\|googlesyndication" ios/App/App/public/index.html` muss `0` ergeben.

**Wichtig: `App.xcodeproj` öffnen, nicht nach einer `.xcworkspace` suchen.** Es gibt bewusst
keine CocoaPods-`Pods.xcworkspace` — Plugins kommen über SPM. `pod install` NICHT ausführen,
das ist hier kein Schritt im Workflow.

## Vor dem ersten Build: TODOs abarbeiten

Alle Platzhalter sind im Code mit `TODO`-Kommentaren markiert. Zusammengefasst:

| Datei | Was | Wonach |
|---|---|---|
| `capacitor.config.ts` | `appId` | echte Bundle ID aus App Store Connect |
| `ios/App/App/Info.plist` | `GADApplicationIdentifier` (`SAMPLE_APP_ID`) | echte AdMob **App**-ID (nicht Ad-Unit-ID) aus der AdMob-Konsole |
| `src/monetization/nativeAdBridge.js` | `REWARDED_AD_UNIT_ID` | echte Rewarded-Ad-Unit-ID |
| `src/monetization/nativeBanner.js` | `BANNER_AD_UNIT_ID` | echte Banner-Ad-Unit-ID |
| `ios/App/App/AdFreePurchasePlugin.swift` | `productId` (`com.tokenfurnace.adfree`) | **muss exakt** der Non-Consumable-Produkt-ID aus App Store Connect entsprechen |
| `src/monetization/PurchaseBridge.js` | `AD_FREE_PRODUCT_ID` | **muss mit der Zeile oben übereinstimmen** (nur zu Dokuzwecken mitgeführt, der native Wert im Swift-Plugin ist der tatsächlich verwendete) |

Alle vier Ad-Unit-/App-IDs sind aktuell Googles öffentliche AdMob-Test-IDs (aus deren eigener
Dokumentation) — Simulator-/TestFlight-Builds funktionieren damit, generieren aber keinen
Umsatz. Ein Produktionsbuild mit Test-IDs wird von Google als Traffic-Anomalie erkannt.

Zusätzlich, nicht TODO-markiert weil kein Platzhalterwert, sondern schlicht noch nicht
vorhanden:

- **App-Icon & Launch-Screen**: `Assets.xcassets/AppIcon.appiconset` und
  `Assets.xcassets/Splash.imageset` enthalten noch Capacitors generische Platzhalterbilder.
  Vor jeder echten Einreichung ersetzen (Xcode-Editor oder per Asset-Generator).

## StoreKit lokal testen (Simulator, ohne App Store Connect)

Um den Kaufablauf zu testen, bevor das Produkt in App Store Connect angelegt/freigegeben ist:

1. In Xcode: **File → New → File… → StoreKit Configuration File**, im selben `App`-Ordner
   anlegen.
2. Ein Produkt hinzufügen: Typ **Non-Consumable**, Produkt-ID exakt
   `com.tokenfurnace.adfree` (oder der Wert, auf den beide Stellen aus der Tabelle oben
   geändert wurden).
3. Scheme bearbeiten (**Product → Scheme → Edit Scheme… → Run → Options**) → **StoreKit
   Configuration** auf die neu angelegte Datei setzen.
4. Simulator starten, in der App den "Werbefrei kaufen"-Button antippen — der
   Sandbox-Kaufdialog von StoreKit erscheint, ganz ohne echten Account.

Das deckt `purchase()`/`getEntitlements()` ab. `restore()` (`AppStore.sync()`) und
Ask-to-Buy-/Family-Sharing-Zustellung über `Transaction.updates` lassen sich damit nur
eingeschränkt testen — dafür braucht es einen echten Sandbox-Tester-Account (App Store
Connect → Benutzer und Zugriff → Sandbox-Tester) auf einem Gerät oder Simulator mit
angemeldetem Sandbox-Account.

## Bei jeder weiteren Code-Änderung

```bash
npm run build:ios
npx cap sync ios     # nach neuen/entfernten Plugins oder package.json-Änderungen
# ODER, wenn sich nur src/ geändert hat und keine Plugins dazukamen:
npx cap copy ios
```

Xcode braucht danach keinen Neustart — die App im Simulator/auf dem Gerät lädt das frisch
synchronisierte `ios/App/App/public`-Bundle beim nächsten Start neu.

## Vor dem ersten echten Review-Build noch zu prüfen

Diese Punkte konnten ohne Simulator/Gerät nicht verifiziert werden — vor TestFlight/Review
einmal bewusst durchgehen:

- **Safe Areas visuell**: `.header-safe-top`, `.banner-safe-top`, `.ad-anchor-safe-bottom`,
  `.navbar-safe-bottom` (siehe `src/index.css`) auf einem Gerät/Simulator mit Notch *und*
  einem mit Dynamic Island prüfen (z.B. iPhone SE vs. iPhone 15 Pro) — die `calc()`-Werte
  sind aus den bisherigen Tailwind-Abständen abgeleitet, aber nie gegen eine echte
  Safe-Area-Inset getestet.
- **Touch-Verhalten**: die Regeln (kein Doppeltap-Zoom, keine Auswahl-Lupe, kein Bounce)
  hängen an der Klasse `.native-app`, die `src/main.jsx` nur setzt, wenn Capacitor eine
  native Plattform meldet — bewusst so, damit die Web-Version unverändert bleibt. Falls das
  Verhalten in der App ausbleibt, zuerst prüfen, ob `<html>` die Klasse trägt.
- **`AdRewardToast`** (`src/components/AdRewardToast.jsx`, `fixed top-24`) hat *keine*
  Safe-Area-Anpassung bekommen (siehe Commit-Notiz) — bei Bedarf nachziehen, falls er auf
  einem Gerät mit Dynamic Island sichtbar überlappt.
- **SKAdNetworkItems-Liste** (`Info.plist`) gegen die aktuell auf
  `developers.google.com/admob/ios/quick-start` veröffentlichte Liste gegenprüfen - Google
  ergänzt sie gelegentlich.
- **ATT-Pre-Permission-Screen**: im Konzept (`ios-app-konzept.md` §6) als
  Konversionsrate-Verbesserung vorgeschlagen, hier bewusst NICHT gebaut (neue UI/Copy/
  Übersetzung außerhalb des Scopes dieser Runde). `requestTrackingIfNeeded()` in
  `src/monetization/adConsent.js` feuert aktuell direkt den System-Prompt.
- **Orientierung**: `Info.plist` erlaubt aktuell Portrait + Landscape (Capacitor-Default).
  Für einen Idle-Clicker ist Portrait-only meist die bessere Wahl — falls gewünscht, in
  Xcode unter Target → General → Device Orientation einschränken.
- **App-Icon/Launch-Screen** (s.o.) — Platzhalter, nicht Teil dieser Runde, weil dafür
  fertige Bildassets gebraucht werden.

Die vollständige App-Store-Compliance-Checkliste (Guideline 3.1.1, Family Sharing,
Datenschutz-Labels, Rechtstexte etc.) steht in
[`ios-app-konzept.md`](./ios-app-konzept.md) Abschnitt 8.
