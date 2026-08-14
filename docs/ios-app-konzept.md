# Token Furnace für iOS — Konzept

**Status:** Entwurf zur Abstimmung. Noch keine Implementierung.
**Kern der Fragestellung:** Native iOS-App des Spiels, mit einem In-App-Purchase, der die App
werbefrei macht. Alle Boni, die heute hinter einer Rewarded Ad liegen, sind für Käufer:innen
direkt zum selben Zeitpunkt abholbar — ohne Video, aber mit unveränderter Taktung.

---

## 1. Ausgangslage

Das Spiel ist eine reine Client-App: React 19 + Vite, kompletter Spielzustand in
`src/hooks/useGameStore.js` (~1390 Zeilen), Persistenz über `localStorage`, kein Backend.
Das ist für die Portierung der beste denkbare Fall — es gibt nichts zu synchronisieren.

### 1.1 Wo heute Werbung sitzt

**Rewarded Ads.** Zehn Placements, und — entscheidend für dieses Konzept — *alle* laufen
durch eine einzige Funktion: `startAd(type, onComplete)` (`useGameStore.js:972`). Die Ad
selbst ist heute ein 3-Sekunden-Fake-Timer, die Belohnung hängt an einem `switch` über den
Typ.

| Typ | Ort | Belohnung | Cooldown |
|---|---|---|---|
| `nitrogen` | MiscTab, SlopTab | GPU-Temperatur auf 0, Overheat beendet | 90 s |
| `grant` | MiscTab | `max(500, vps × 100)` Cash | 5 min |
| `power_click` | MiscTab | +1 Power Click | 5 min |
| `ascend_boost` | SpecialTab | +20 % auf die nächste Ascension | 5 min |
| `pivot_boost` | SpecialTab | +20 % auf den nächsten Pivot | 5 min |
| `golden_claim` | GoldenMemeBanner | 10× TPS für 30 s | keiner (Event-limitiert) |
| `bubble_clear` | GoldenMemeBanner | beendet den Bubble-Debuff sofort | 5 min |
| `offline_double` | OfflineEarningsModal | verdoppelt den Offline-Ertrag | keiner |
| `afk_bonus` | AfkReportModal | schreibt den AFK-Ertrag überhaupt erst gut | 60 s (Default¹) |
| `scheduled_bonus` | ScheduledAdModal + MiscTab | `max(250, vps × 60)` Cash | keiner (Zeitplan) |

¹ `afk_bonus` fehlt in `AD_COOLDOWN_SEC` (`useGameStore.js:43`) und fällt auf den 60-s-Default
zurück. Faktisch irrelevant, weil der Report nur einmal pro Abwesenheit entsteht — beim
Aufräumen aber mitnehmen.

Zwei Placements sind Sonderfälle, weil sie keine Zugabe sind, sondern der *einzige* Weg an
den Wert:

- **`golden_claim`** — das Golden Meme startet seit dem Rework nicht mehr von selbst. Es ist
  ein Angebot mit 20 s Bedenkzeit (`GOLDEN_OFFER_SEC`), einlösbar ausschließlich per Ad.
- **`afk_bonus`** — der während ≥ 30 min Abwesenheit erzeugte Wert wird *nicht* live
  gutgeschrieben. Ohne Ad ist er weg.

Beide sind der Grund, warum „werbefrei" hier nicht heißen darf „Boni fallen weg".

**Display Ads.** Drei statische Platzhalter über `AdBanner` (`src/components/AdBanner.jsx`):
Footer-Leiste fix über der Tab-Bar (`App.jsx:279`), Sidebar-Rechteck im Desktop-Layout
(`DesktopView.jsx:40`), Leaderboard im BadgesModal (`BadgesModal.jsx:191`). Dazu im
`index.html` das AdSense-Snippet und der Termly-Consent-Blocker.

### 1.2 Was davon iOS-tauglich ist

Nichts vom Werbe-Stack. AdSense ist für Webseiten lizenziert und darf nicht in einer
App-WebView ausgeliefert werden — in einer nativen App ist AdMob (Google Mobile Ads SDK) der
vorgesehene Weg. Termly ist ebenfalls ein Web-CMP; die App braucht stattdessen Googles UMP
SDK für die DSGVO-Einwilligung. Die Spiellogik dagegen läuft unverändert weiter.

---

## 2. Produktentscheidung

**Ein nicht-verbrauchbarer IAP: „Werbefrei" (Non-Consumable), einmalig, mit Family Sharing.**

Preisvorschlag 3,99 € (Apple-Preisstufe entsprechend, weltweit über Apples Matrix). Ein
Abo wäre für ein Einzelspieler-Idle-Game ohne laufende Serverkosten schwer zu begründen und
zieht Rezensionsärger nach sich. Verbrauchbare Währungspakete würden die Satire des Spiels
gegen sich selbst richten — Token Furnace verkauft Spott über Monetarisierung, das Ding
sollte nicht selbst zur Gacha werden.

**Was der Kauf konkret liefert:**

1. Keine Display-Werbung mehr — Footer-Leiste, Sidebar-Slot, Modal-Slot verschwinden
   vollständig, samt reflowtem Layout ohne Löcher.
2. Keine Rewarded-Video-Ads mehr — jeder Bonus, der heute ein Video verlangt, wird zum
   direkten „Bonus abholen"-Tap **zum gleichen Zeitpunkt und mit dem gleichen Cooldown**.
3. Keine geplanten Ad-Popups mehr als Vollbild-Unterbrechung — der Bonus wandert in ein
   nicht-modales Abzeichen (Details in 4.3).
4. Kein Ad-SDK-Start, keine ATT-Abfrage, kein Consent-Formular. Für Käufer:innen wird die App
   datenschutzseitig zur reinen Offline-App. Das ist ein Verkaufsargument und gehört auf die
   Store-Seite.
5. Optionaler „Auto-Claim"-Schalter für die passiven Boni (siehe 4.4).

**Was der Kauf ausdrücklich nicht liefert:** keine kürzeren Cooldowns, keine höheren
Beträge, keine Inhalte, die Free-Spieler nicht erreichen können. Der IAP verkauft
*Bequemlichkeit und Ruhe*, keine Spielstärke. Das hält die Balance intakt und die
Rezensionen freundlich.

---

## 3. Technische Architektur

### 3.1 Empfehlung: Capacitor-Wrapper, kein Rewrite

| Option | Aufwand | Bewertung |
|---|---|---|
| **Capacitor** (WKWebView + native Plugins) | niedrig | **Empfohlen.** Spielcode 1:1 weiterverwendet, eine Codebasis für Web und iOS, native Plugins für StoreKit/AdMob/Haptics. |
| React Native | hoch | Kompletter UI-Rewrite (Tailwind-Klassen, Portals, DOM-Events). Kein Gegenwert für ein Spiel ohne Listen-Performance-Problem. |
| Nativ SwiftUI | sehr hoch | Zweite Spiellogik-Implementierung, die dauerhaft mit der Web-Version synchron gehalten werden müsste. |

**Das Risiko bei Capacitor ist Guideline 4.2 (Minimum Functionality)**: Apple lehnt Apps ab,
die nur eine Website in einer WebView zeigen. Die Gegenmaßnahmen sind ohnehin Teil des
Konzepts und müssen vor dem ersten Review stehen, nicht danach:

- native Rewarded Ads und natives IAP (keine Web-Bezahlung),
- Haptik auf dem Tap-Button (bei einem Clicker der größte Feel-Gewinn überhaupt),
- lokale Push-Nachrichten („Deine Server laufen heiß"),
- funktionierender Offline-Betrieb ohne Netz,
- Safe-Area-, Notch- und Home-Indicator-korrektes Layout,
- eigenes App-Icon, Launch Screen, Splash.

Zusätzlich sollte im Review-Hinweis stehen, dass die App vollständig offline läuft und die
Web-Version kein Bezahlangebot enthält.

### 3.2 Der Kern: eine Bridge, ein Interface

Der Glücksfall dieser Codebasis ist, dass jede Ad durch `startAd` läuft. Damit braucht der
gesamte werbefrei-Umbau **genau eine Abstraktion**:

```
AdBridge.present(placementType) → Promise<'rewarded' | 'dismissed' | 'failed'>
```

Drei Implementierungen:

- `WebAdBridge` — der heutige 3-Sekunden-Timer, bleibt für die Browser-Version.
- `NativeAdBridge` — AdMob Rewarded, aufgelöst über die SDK-Callbacks.
- `NoAdBridge` — löst sofort mit `'rewarded'` auf. **Das ist der ganze Werbefrei-Modus.**

`startAd` wird zu `requestBonus(type, onComplete)`: es prüft den Cooldown wie bisher, ruft
die Bridge, und führt bei `'rewarded'` exakt denselben `switch` aus. Die Belohnungslogik,
die Cooldowns, die Logs, die Statistik (`stats.adsWatched`) bleiben unangetastet — nur der
Zeitraum zwischen Tap und Auszahlung schrumpft auf null.

Analog für den Kauf:

```
PurchaseBridge.entitlements() → { adFree: boolean }
PurchaseBridge.purchase(productId) → 'purchased' | 'pending' | 'cancelled' | 'failed'
PurchaseBridge.restore() → { adFree: boolean }
```

`WebPurchaseBridge` meldet immer `adFree: false` und blendet die Kauf-UI aus — die
Web-Version bekommt kein Bezahlangebot (und darf laut Apple auch keins bewerben).

**Geschätzter Umfang im bestehenden Code:** `useGameStore.js` bekommt `adFree` in den
Return-Wert und `startAd` wird zu `requestBonus`; die sechs Aufruf-Dateien ändern Icon und
Label; `AdBanner` gibt bei `adFree` `null` zurück; dazu ein neuer Ordner
`src/monetization/` mit den Bridges. Kein Umbau der Spielmechanik.

---

## 4. Verhalten nach dem Kauf, Placement für Placement

### 4.1 Die Standard-Boni

`nitrogen`, `grant`, `power_click`, `ascend_boost`, `pivot_boost`, `bubble_clear`,
`golden_claim`: identische Position, identischer Cooldown, identischer Betrag. Der Button
tauscht das TV-Icon gegen ein Geschenk-/Blitz-Icon und das Label von „Werbung ansehen" auf
„Bonus abholen". Der Cooldown-Countdown bleibt **sichtbar** — er ist das Pacing-Element, das
das Spiel zusammenhält, und war nie die Ad.

Das Golden Meme profitiert hier am deutlichsten: 20 Sekunden Angebotsfenster minus
Ladezeit einer Rewarded Ad ist heute knapp. Ohne Video wird aus einem Hetz-Moment eine
Entscheidung.

### 4.2 Offline- und AFK-Ertrag

`offline_double` und `afk_bonus` sind die beiden, bei denen der Wegfall der Ad die
Modal-Logik verändert:

- **Offline:** Das Modal zeigt heute zwei Wege („Ad für das Doppelte" / „nur einfach
  einsammeln"). Für Käufer:innen bleibt genau einer: der doppelte Betrag, ein Tap. Der
  „nur einfach"-Button verschwindet — eine Wahl, bei der eine Option strikt schlechter ist,
  ist keine Wahl.
- **AFK:** Der Ertrag ist heute *pending* und verfällt ohne Ad. Für Käufer:innen wird er
  direkt gutgeschrieben; das Modal wird von einem Angebot zu einem Report mit einem
  „Einsammeln"-Button. Der „Verzichten"-Pfad entfällt.

### 4.3 Geplante Ad-Popups

`SCHEDULED_AD_MINUTES = [5, 15, 30, 60, 120]` wirft heute ein Vollbild-Modal. Ein
Vollbild-Popup ist für jemanden, der gerade für Werbefreiheit bezahlt hat, genau das
Falsche — auch wenn kein Video dahinter steckt.

**Für Käufer:innen wird das Popup zu einem Abzeichen im Header**: ein pulsender Punkt am
Bonus-Icon, jederzeit antippbar, kein Interrupt. Der Betrag ist derselbe
(`max(250, vps × 60)`), die Zeitpunkte sind dieselben. Der bereits existierende Pfad dafür
ist da — `deferScheduledAd` setzt `scheduledAdUnlocked`, und MiscTab rendert dafür schon
einen Nachhol-Button (`MiscTab.jsx:67`). Für Werbefrei wird dieser Pfad einfach zum
Standardfall, statt Ausnahme zu sein.

### 4.4 Optional: Auto-Claim

Ein Schalter in den Einstellungen, nur für Käufer:innen, standardmäßig **aus**:

> **Boni automatisch abholen** — Offline-Ertrag, AFK-Ertrag und Zeitboni werden ohne
> Nachfrage gutgeschrieben. Golden Memes und taktische Boni bleiben manuell.

Die Trennung ist bewusst: passive Erträge, bei denen ein Tap reine Zeremonie ist, laufen
durch; alles Taktische (Golden Meme, Nitrogen, Power Click) bleibt eine Entscheidung, sonst
spielt sich das Spiel selbst. Das Feature ist ein starkes Kaufargument und kostet wenig —
kann aber ohne Schaden in Version 1.1 nachgeliefert werden.

---

## 5. Kaufflow und Entitlement

**StoreKit 2, on-device.** Für einen Non-Consumable in einem Einzelspieler-Spiel ohne
Server-Ökonomie ist serverseitige Belegprüfung unnötiger Aufwand:
`Transaction.currentEntitlements` mit Apples Signaturprüfung ist die Quelle der Wahrheit.
Das Restrisiko ist ein Jailbreak-Nutzer, der sich Werbefreiheit erschleicht — dabei geht
kein Wert verloren, der irgendwem gehört.

**Ablauf:**

1. **App-Start:** Entitlements lesen, `adFree` setzen. Bis das Ergebnis da ist, gilt der
   gecachte Wert aus den nativen Preferences — die App startet nie kurz mit Werbung, nur
   weil StoreKit noch antwortet.
2. **Kauf:** Kaufkarte in der Einstellungen-/Misc-Ansicht, dazu ein dezenter Einstieg an
   den Ad-Buttons selbst („oder dauerhaft werbefrei"). Kein Interstitial-Verkaufsdruck.
3. **`.pending`** (Ask to Buy / Kindersicherung): eigener Zustand mit dem Hinweis
   „Kauf wartet auf Freigabe" — nicht als Fehler behandeln. Ein `Transaction.updates`-
   Listener läuft über die gesamte App-Laufzeit und schaltet frei, sobald die Freigabe
   kommt, auch mitten im Spiel.
4. **„Käufe wiederherstellen"** ist Pflicht (Guideline 3.1.1) und braucht einen eigenen,
   auffindbaren Button in den Einstellungen.
5. **Family Sharing** aktivieren — kostet nichts und verhindert eine ganze Kategorie
   verärgerter Rezensionen.
6. **Fehlerfälle:** Abbruch ist kein Fehler und bekommt keine Meldung. Netzwerkfehler
   bekommen einen Retry. Ein „bereits gekauft" führt direkt zur Freischaltung.

**Zustand im Store:**

```
adFree: boolean
purchaseState: 'idle' | 'purchasing' | 'pending' | 'restoring' | 'failed'
```

`adFree` gehört **nicht** in den `localStorage`-Spielstand (`saveGame`,
`useGameStore.js:218`) — sonst würde ein Save-Export oder ein manipulierter Speicherstand
den Kauf vortäuschen, und ein `resetSave` (`useGameStore.js:1349`) würde ihn löschen. Es
gehört in einen separaten, von StoreKit gespeisten Preferences-Eintrag, den `resetSave`
nicht anfasst. **Ein Spielstand-Reset darf den Kauf niemals entfernen.**

---

## 6. Werbe-Stack für Free-Nutzer:innen

- **AdMob** ersetzt AdSense: Rewarded für die zehn Placements, Adaptive Banner für den
  Footer-Slot. Das Sidebar-Rechteck aus `DesktopView` entfällt auf iPhone-Größen ohnehin.
- **Google UMP SDK** ersetzt Termly für die DSGVO-Einwilligung, inklusive
  „Datenschutzeinstellungen"-Eintrag in den App-Einstellungen (das Gegenstück zum heutigen
  Cookie-Link).
- **ATT** (`AppTrackingTransparency`) für personalisierte Werbung: nach dem UMP-Formular,
  und **nicht** beim Kaltstart, sondern nach der ersten sinnvollen Spielinteraktion. Vorher
  ein eigener Erklärbildschirm, warum gefragt wird — das hebt die Zustimmungsrate deutlich.
- **Ladefehler dürfen nie blocken — aber auch nicht den Kauf ersetzen.** Ein Ad-Fehlschlag
  (kein Fill, offline, Flugmodus) setzt **keinen Cooldown**, der Versuch ist also sofort
  wiederholbar; der Log-Eintrag sagt das auch so. Ausgezahlt wird bei einem Fehlschlag nur
  beim **Golden Meme**, weil dort das Angebot nach 20 Sekunden ersatzlos verfällt und die Ad
  der einzige Weg zum Boost ist — ein Ladefehler in diesem Fenster darf es nicht vernichten.
  (Ursprünglich war „bei Fehlschlag immer auszahlen" vorgesehen. Das wurde im Audit
  verworfen: sobald Werbefreiheit ein Bezahlprodukt ist, wäre „Flugmodus an" ein
  vollwertiger kostenloser Ersatz dafür — jede Ad schlägt fehl, jeder Bonus kommt trotzdem.
  Die Cooldowns hätten das nicht gedeckelt, weil sie den bezahlten Modus genauso begrenzen.)
  Bei einmaligen, schon geschlossenen Angeboten (Zeitbonus-Popup) wird der Bonus bei einem
  Fehlschlag in den „später einlösen"-Zustand zurückgeführt statt zu verpuffen; Offline- und
  AFK-Report bleiben schlicht offen und sind erneut einlösbar.
- **Nach dem Kauf wird das Ad-SDK gar nicht erst initialisiert.** Nicht nur ausgeblendet —
  nicht geladen. „Werbefrei" muss auch technisch stimmen; Apple prüft das gelegentlich, und
  Rezensionen prüfen es zuverlässig. Das gilt ausdrücklich auch für die **HTML-Ebene**: die
  Web-Version bindet AdSense und den Termly-Consent-Banner direkt in `index.html` ein, und
  beide würden im nativen Build unabhängig vom Kaufstatus laden. Der iOS-Build
  (`npm run build:ios`, siehe `vite.config.js`) entfernt sie deshalb aus dem HTML — AdSense
  ist in einer App-WebView ohnehin nicht zulässig, und Termly würde mit dem nativen
  UMP-Consent kollidieren.

---

## 7. iOS-Feinschliff (unabhängig vom IAP, aber Voraussetzung)

**Persistenz — der wichtigste Punkt.** `localStorage` in einer WKWebView kann vom System
unter Speicherdruck geräumt werden. Ein Idle-Spiel, das den Fortschritt verliert, ist tot.
Der Spielstand muss auf **Capacitor Preferences** (nativ, `UserDefaults`/Datei) umziehen,
mit `localStorage` nur noch als Web-Fallback. Empfohlen dazu: eine gespiegelte Kopie im
iCloud Key-Value Store, damit ein Gerätewechsel den Fortschritt mitnimmt. Der bestehende
`version: 2`-Migrationspfad im Save trägt das ohne Bruch.

**Hintergrund-Verhalten.** iOS suspendiert die WebView; der 200-ms-Loop steht still. Die
Offline-Berechnung nutzt bereits Wall-Clock-Zeitstempel und trägt das. Die AFK-Erkennung
hängt dagegen an `document.visibilitychange` — die feuert bei App-Wechsel nicht zuverlässig
und muss auf Capacitors `App.appStateChange` umgestellt werden.

**Touch-Verhalten für einen Clicker.** Kritisch, sonst ist die App unbenutzbar: Lupe und
Auswahl bei Schnelltaps unterdrücken (`-webkit-touch-callout: none`, `user-select: none`),
Bounce/Overscroll abschalten, `touch-action: manipulation` gegen den 300-ms-Doppeltap-Zoom.
Dazu Haptik auf dem Haupt-Tap.

**Safe Areas.** Der fixe Footer-Slot (`App.jsx:279`), die NavBar und das Golden-Meme-Banner
bei `top-20` brauchen `env(safe-area-inset-*)` — sonst liegt das Banner unter der Dynamic
Island und die Tab-Leiste im Home-Indicator.

**Zeitplan-Härtung.** `SCHEDULED_AD_MINUTES` zählt ab App-Start. Auf iOS, wo Nutzer:innen
Apps ständig neu starten, wird daraus versehentlich eine Farm-Schleife (alle 5 Minuten
neu starten = alle 5 Minuten der 5-Minuten-Bonus). Der Zeitplan gehört an einen persistierten
Zeitstempel gebunden. Betrifft die Web-Version genauso.

**Weiteres:** App-Icon und Launch Screen, Lokalisierung der Store-Seite in DE und EN (die
i18n-Struktur im Spiel steht bereits), lokale Push-Nachrichten für die Rückkehr (opt-in),
optional Game-Center-Bestenlisten.

**Save-Übernahme vom Web:** bewusst *nicht* in Version 1. Ohne Backend bräuchte es einen
Transfercode-Mechanismus; für eine erste Version ist der Aufwand höher als der Nutzen. Als
Kandidat für später vormerken.

---

## 8. App-Store-Compliance-Checkliste

- [ ] Guideline 3.1.1 — Kauf ausschließlich per IAP, kein Link auf eine externe Bezahlung
- [ ] „Käufe wiederherstellen"-Button vorhanden und auffindbar
- [ ] Family Sharing für den Non-Consumable aktiviert
- [ ] Guideline 4.2 — native Funktionen belegbar, Review-Hinweis formuliert
- [ ] Datenschutz-Labels: für die Free-Variante die AdMob-Datenerhebung deklariert
- [ ] ATT-Text und Vor-Erklärbildschirm formuliert
- [ ] Funktionierende Links zu Datenschutzerklärung und EULA (Pflicht bei IAP) — die
      bestehenden Rechtstexte in `src/i18n/content/legal.content.js` müssen auf die App
      angepasst werden (AdMob statt AdSense, UMP statt Termly, StoreKit-Kauf ergänzen)
- [ ] Altersfreigabe festlegen (Einschätzung: 12+ wegen Satire-Inhalten und Werbung)
- [ ] Screenshots, Beschreibung, ASO in DE und EN
- [ ] Store-Beschreibung nennt ausdrücklich: der IAP entfernt Werbung, gewährt keine
      Spielvorteile

---

## 9. Umsetzung in Phasen

| Phase | Inhalt |
|---|---|
| **0 — Vorbereitung** | Bridge-Abstraktion in der Web-Codebasis einziehen (`startAd` → `requestBonus`, `AdBridge`/`PurchaseBridge`). Läuft mit der Web-Version weiter, ändert dort nichts. |
| **1 — Shell** | Capacitor-Setup, Xcode-Projekt, Persistenz auf native Preferences, Safe Areas, Touch-Verhalten, Haptik, App-Icon. Ohne Werbung, ohne Kauf. |
| **2 — Werbung** | AdMob Rewarded + Banner, UMP, ATT, Fallback bei Ladefehlern. |
| **3 — IAP** | StoreKit 2, Kaufkarte, Restore, Pending-Zustand, `NoAdBridge`, Layout-Reflow ohne Werbeflächen, Scheduled-Bonus-Abzeichen. |
| **4 — Store** | Rechtstexte anpassen, Datenschutz-Labels, Screenshots, TestFlight, Einreichung. |
| **später** | Auto-Claim-Schalter, iCloud-Sync, Push-Rückholer, Game Center, Save-Transfer vom Web. |

---

## 10. Offene Entscheidungen

1. **Preis** — 3,99 € als Vorschlag. Alternativ 2,99 € für höheres Volumen oder 4,99 €
   mit „Supporter"-Anstrich (Danke-Bildschirm, kosmetisches Abzeichen im Spiel).
2. **Auto-Claim in Version 1 oder später?** Empfehlung: später, das Grundversprechen trägt
   auch ohne.
3. **AFK-Ertrag für Free-Nutzer:innen.** Dass der Ertrag ohne Ad komplett verfällt, ist
   heute die härteste Ad-Wand im Spiel. Das ist als Kaufanreiz wirksam, aber grenzwertig
   unfreundlich. Zur Abwägung: ein Teilbetrag (z. B. 25 %) ohne Ad, der volle mit.
4. **Zweiter IAP später?** Etwa ein rein kosmetisches Theme-Paket. Bewusst nach Version 1,
   damit die erste Fassung eine klare Botschaft hat.
5. **Android/Play Store** — Capacitor liefert die Plattform quasi mit; Google Play Billing
   und AdMob wären dieselbe Bridge mit anderer Implementierung. Nicht Teil dieses Konzepts,
   aber die Architektur oben hält es offen.
