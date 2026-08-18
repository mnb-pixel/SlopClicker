import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BUILDINGS_DATA } from '../data/buildingsData';
import { UPGRADES_DATA, getAvailableUpgrades } from '../data/upgradesData';
import { HEAVENLY_UPGRADES_DATA } from '../data/heavenlyUpgradesData';
import { ACHIEVEMENTS_DATA } from '../data/achievementsData';
import { BUZZWORDS_DATA, getBoosterPackCost } from '../data/buzzwordsData';
import { GREENWASHING_LAYOFFS_DATA, getCorporateActionCost } from '../data/greenwashingLayoffsData';
import { IDEALIST_PATH, CYNIC_PATH, EPOCHS, CREDIBILITY_LEVEL_COST_BASE } from '../data/credibilityTreeData';
import { BLACK_SWAN_EVENTS_DATA } from '../data/blackSwanEventsData';
import { GOLDEN_EVENT_IDS, BUBBLE_EVENT_IDS } from '../i18n/content/events.content';
import { TRANSLATIONS } from '../i18n/translations';
import { formatCurrency, getBuildingCost, getBuildingBulkCost, getMaxAffordableBuildings } from '../utils/formatters';
import { selectAdBridge } from '../monetization/AdBridge';
import { selectPurchaseBridge, AD_FREE_PRODUCT_ID } from '../monetization/PurchaseBridge';
import { nativeAdBridge } from '../monetization/nativeAdBridge';
import { nativePurchaseBridge } from '../monetization/nativePurchaseBridge';
import { ensureAdConsent, getTrackingStatus, requestTrackingAuthorization, showAdPrivacyOptions } from '../monetization/adConsent';
import { getItem as getStorageItem, setItem as setStorageItem, removeItem as removeStorageItem } from '../platform/storage';
import { subscribeNativeAppState } from '../platform/appState';
import { tapFeedback } from '../platform/haptics';

const STORAGE_KEY = 'SLOP_CLICKER_GAME_SAVE_V1';
// Separater Preferences-Key für den zuletzt bekannten Werbefrei-Kaufstatus (siehe
// docs/ios-app-konzept.md §5, Schritt 1): NICHT Teil von STORAGE_KEY, damit weder ein
// resetSave ihn löscht noch ein Save-Import/manipulierter Spielstand ihn vortäuscht. Dient
// nur als Kaltstart-Cache, bis die tatsächliche StoreKit-Antwort da ist - die überschreibt
// ihn danach immer.
const ADFREE_CACHE_KEY = 'SLOP_CLICKER_ADFREE_CACHE_V1';

// ---------------------------------------------------------------------------
// Validierung beim Laden des Spielstands.
//
// Der Save liegt im localStorage und ist damit vollständig unter Kontrolle des
// Clients - er kann durch einen abgebrochenen Schreibvorgang, eine ältere
// Spielversion oder schlicht durch Bearbeiten in der DevTools-Konsole beliebige
// Typen enthalten. Das ist keine Sicherheitsgrenze (wer seinen eigenen Spielstand
// manipuliert, betrügt nur sich selbst), aber ein Robustheitsproblem:
//   - `data.valuation` als String => alle Folgerechnungen ergeben NaN, die
//     Bewertung zeigt dauerhaft "NaN" und lässt sich durch nichts mehr beheben.
//   - `data.boughtUpgrades` als Objekt/String => .includes() bzw. .filter() wirft
//     beim ersten Render, die ErrorBoundary fängt ab und der Spieler sieht bei
//     JEDEM Neuladen nur noch den Fehlerscreen (der kaputte Save wird ja erneut
//     geladen) - ohne Weg zurück außer manuellem Leeren der Browserdaten.
// Deshalb: jeder Wert wird beim Laden auf seinen erwarteten Typ geprüft und fällt
// sonst auf den Default zurück.
// ---------------------------------------------------------------------------

// Number.isFinite schließt NaN und ±Infinity mit ein - beide "vergiften" jede
// weitere Rechnung und sind aus einem manipulierten Save direkt erzeugbar.
function safeNumber(value, fallback = 0, { min = -Infinity } = {}) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min ? value : fallback;
}

function safeBool(value, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

// Nur Strings, und begrenzt: der Startup-Name landet u.a. im document.title und auf
// dem Pitch-Deck-Canvas - ein megabytegroßer String aus einem manipulierten Save
// würde dort das Rendering blockieren.
function safeString(value, fallback, maxLength = 60) {
  return typeof value === 'string' && value.trim() ? value.slice(0, maxLength) : fallback;
}

// Listen im Save sind durchweg ID-Listen (Upgrades, Achievements, Buzzwords). Nicht-
// Strings werden aussortiert, damit spätere .includes()-Vergleiche verlässlich bleiben.
function safeIdList(value) {
  return Array.isArray(value) ? value.filter((id) => typeof id === 'string') : [];
}

// Für blackSwanNextEligible und adCooldowns: beides sind { [id]: timestampMs }-Maps.
// Nicht-Objekt-Werte werden verworfen, Einträge mit kaputtem Timestamp einzeln
// aussortiert statt die ganze Map wegzuwerfen - ein einzelner beschädigter Eintrag soll
// nicht auch die Cooldowns aller anderen, intakten Ad-Placements zurücksetzen.
function safeTimestampMap(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([, ts]) => typeof ts === 'number' && Number.isFinite(ts))
  );
}

// ---------------------------------------------------------------------------
// Versions-Migration.
//
// SAVE_MIGRATIONS[N] hebt einen Save von Version N auf N+1 an. migrateSave() verkettet
// das automatisch von der im Save gefundenen Version bis SAVE_VERSION, eine künftige
// Formatänderung braucht also nur EINEN neuen Eintrag, keine Anpassung an anderer
// Stelle. Aktuell leer: das Format hat sich seit V2 nicht strukturell geändert, neue
// Felder werden von den safe*-Helfern beim Laden ohnehin mit sinnvollen Defaults
// aufgefüllt. Beispiel für eine künftige Migration (Feld umbenannt):
//   1: (data) => { const { altesFeld, ...rest } = data; return { ...rest, version: 2, neuesFeld: altesFeld }; }
const SAVE_VERSION = 2;
const SAVE_MIGRATIONS = {};

function migrateSave(data) {
  let migrated = data;
  let fromVersion = safeNumber(data.version, 1, { min: 1 });
  // Save ist NEUER als diese Build-Version (Nutzer war kurz auf einer neueren Version,
  // dann Rollback auf einen älteren Build): nicht verwerfen. Die safe*-Helfer unten lesen
  // jedes bekannte Feld korrekt, unbekannte Zusatzfelder werden schlicht ignoriert.
  while (fromVersion < SAVE_VERSION && typeof SAVE_MIGRATIONS[fromVersion] === 'function') {
    migrated = SAVE_MIGRATIONS[fromVersion](migrated);
    fromVersion += 1;
  }
  return migrated;
}

// Konzept Abschnitt 4: Zufallsereignisse, geprüft pro Tick (Referenz-Takt 200ms).
// Beide Event-Arten kamen früher viel zu oft (Golden ~5,5min, Bubble ~8min, also im Schnitt
// alle ~3min irgendein Banner). Auf je ~20 Minuten Erwartungswert gesenkt, damit ein Meme
// wieder ein Ereignis ist: 1 / (20min * 300 Ticks/min) ≈ 0,000167.
const GOLDEN_CHANCE_PER_200MS = 0.000167; // ~alle 20 Minuten
const BUBBLE_CHANCE_PER_200MS = 0.000167; // ~alle 20 Minuten
const SHADOW_CHANCE_PER_200MS = 0.0000015; // 0.00015%
const BUBBLE_BURN_DURATION_SEC = 30;
const BUBBLE_GLITCH_SEC = 4;

// Golden Meme: der Boost läuft NICHT mehr automatisch beim Spawnen an. Das Banner ist ein
// Angebot, das GOLDEN_OFFER_SEC lang offen steht; eingelöst wird es ausschließlich über die
// Rewarded Ad. Als Gegenwert für Seltenheit + Ad-Pflicht ist der Boost doppelt so stark und
// doppelt so lang wie der frühere Auto-Boost (war 5x / 15s).
const GOLDEN_OFFER_SEC = 20;
const GOLDEN_BOOST_SEC = 30;
const GOLDEN_BOOST_MULT = 10;

// Black Swan Events (pro Engine-Typ, siehe blackSwanEventsData.js): harte Untergrenze von
// 24h zwischen zwei Events DERSELBEN Engine, obendrauf eine sehr niedrige Tick-Chance, damit
// es auch bei vielen gleichzeitig besessenen Engine-Typen "ultra selten" bleibt (~2%/Tag
// pro bereits eligibler Engine, also im Schnitt mehrere Wochen Abstand).
const BLACK_SWAN_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const BLACK_SWAN_CHANCE_PER_200MS = 0.00000005;

// Monetarisierung: Rewarded-Ad-Cooldowns pro Placement (Sekunden), damit dieselbe
// Ad-Belohnung nicht im Sekundentakt wieder abgegriffen werden kann.
const AD_COOLDOWN_SEC = {
  // Nitrogen bleibt bewusst kürzer: reine Sofort-Kühlung + 2x Click Power, kein Geldwert -
  // alle anderen mit Cooldown sind auf einheitlich 5 Minuten vereinheitlicht.
  nitrogen: 90,
  grant: 5 * 60,
  power_click: 5 * 60,
  ascend_boost: 5 * 60,
  pivot_boost: 5 * 60,
  // Kein Cooldown: der Golden-Meme-Claim ist bereits durch die Seltenheit des Events
  // begrenzt (~20min) und ist der EINZIGE Weg an den Boost - ein Cooldown könnte das
  // Angebot komplett unbenutzbar machen.
  golden_claim: 0,
  bubble_clear: 5 * 60,
  offline_claim: 0,
  scheduled_bonus: 0,
};

// Schwelle, ab der Abwesenheit (Tab im Hintergrund ODER Browser komplett geschlossen)
// nicht mehr automatisch gutgeschrieben wird, sondern nur noch per Ad claimbar ist - unten
// sowohl für pageActivity 'hidden' (Tab offen, im Hintergrund) als auch für den Offline-
// Ertrag (Browser komplett zu) verwendet, damit beide Wege dieselbe Grenze benutzen.
const AFK_THRESHOLD_SECONDS = 1800; // 30 Minuten

// Offline-Ertrag (Browser komplett geschlossen, nicht nur Tab im Hintergrund - dafür siehe
// pageActivity 'hidden' oben): ab 1 Minute Abwesenheit berechnet, gedeckelt auf 4h, zu 20%
// der zuletzt bekannten VPS. Unter AFK_THRESHOLD_SECONDS wird der Betrag automatisch und
// ohne Rückfrage gutgeschrieben; ab der Schwelle ist er PENDING und nur per Ad claimbar
// (alles oder nichts) - exakt dieselbe Regel wie beim Tab-im-Hintergrund-Fall unten.
const OFFLINE_MIN_SECONDS = 60;
const OFFLINE_CAP_SECONDS = 4 * 3600;
const OFFLINE_EFFICIENCY = 0.2;

// Singularity Ascension: Chips = sqrt(totalValuation / Divisor). War vorher 1e9 (der erste
// Chip brauchte $1 Mrd. Lifetime-Valuation - bei den exponentiellen Gebäudekosten praktisch
// unerreichbar, fühlte sich also wie "kaputt" an). Auf 1e7 gesenkt: erster Chip ab $10M.
const ASCEND_CHIP_DIVISOR = 10000000;

// Geplante Ad-Popups (Punkt 9): feste Zeitpunkte seit Beginn der aktuellen "Sitzung", an
// denen ein Popup eine Rewarded Ad anbietet.
const SCHEDULED_AD_MINUTES = [5, 15, 30, 60, 120];

// Der Anker für "seit Beginn der Sitzung" wird im Save persistiert statt bei jedem Mount neu
// gesetzt zu werden - sonst ließe sich der 5-Minuten-Bonus durch simples Neuladen/Neustarten
// der App im Minutentakt farmen (auf iOS trivial, da Nutzer Apps ständig beenden/neu
// starten). Eine neue Sitzung beginnt erst, wenn seit dem letzten Save wirklich Zeit verging
// - derselbe 30-Minuten-Schwellwert wie beim AFK-Report oben (awaySec >= 1800), damit "war
// wirklich weg" überall im Spiel dieselbe Bedeutung hat.
const SCHEDULED_AD_RESET_GAP_SEC = 1800;

// Placements, die bei einem Ad-Fehlschlag (kein Fill, offline) TROTZDEM auszahlen. Bewusst
// nur dort, wo die Ad der einzige Weg zu etwas ist, das sonst unwiederbringlich verfällt:
// Das Golden-Meme-Angebot steht nur GOLDEN_OFFER_SEC lang, ein Ladefehler in diesen 20
// Sekunden darf es nicht ersatzlos vernichten.
//
// Alles andere ist wiederholbar und wird bei Fehlschlag NICHT ausgezahlt - sonst wäre
// "Flugmodus einschalten" ein vollwertiger, kostenloser Ersatz für den Werbefrei-Kauf:
// jede Ad schlüge fehl, jeder Bonus käme trotzdem. Genau die Leistung, die der IAP verkauft.
const GRANT_ON_AD_FAILURE = new Set(['golden_claim']);

const INITIAL_BUILDINGS = BUILDINGS_DATA.reduce((acc, b) => {
  acc[b.id] = 0;
  return acc;
}, {});

export function useGameStore() {
  const [lang, setLang] = useState('de'); // 'de' | 'en'
  const [startupName, setStartupName] = useState('tokenkamin');
  const [valuation, setValuation] = useState(0);
  const [totalValuation, setTotalValuation] = useState(0);
  const [totalBurned, setTotalBurned] = useState(0);
  const [slopCount, setSlopCount] = useState(0);

  const [gpuTemp, setGpuTemp] = useState(0);
  const [isOverheated, setIsOverheated] = useState(false);
  const [coolingRate, setCoolingRate] = useState(4.0); // °C per second

  const [powerClicks, setPowerClicks] = useState(0);
  const [powerClickActive, setPowerClickActive] = useState(false);
  const [powerClickSurgeTimer, setPowerClickSurgeTimer] = useState(0);

  const [prestigeLevel, setPrestigeLevel] = useState(0);
  const [heavenlyChips, setHeavenlyChips] = useState(0);

  // SEC Form S-1 & Hype Ledger Features
  const [themeMode, setThemeMode] = useState('cyberpunk'); // 'sec_prospectus' | 'cyberpunk'
  const [boughtBuzzwords, setBoughtBuzzwords] = useState([]);
  const [boughtGreenwashingLayoffs, setBoughtGreenwashingLayoffs] = useState([]);
  const [epoch, setEpoch] = useState(2); // 0: Blockchain, 1: Virtual World, 2: AI, 3: Quantum
  const [idealistLevel, setIdealistLevel] = useState(0);
  const [cynicLevel, setCynicLevel] = useState(0);
  const [credibility, setCredibility] = useState(0);
  const [pivotCount, setPivotCount] = useState(0);
  const [valuationAtLastPivot, setValuationAtLastPivot] = useState(0);
  const [bubblePopTimer, setBubblePopTimer] = useState(0);
  // Restlaufzeit (Sek.) des per Ad eingelösten Golden-Meme-Boosts. Bewusst getrennt von
  // activeEvent: das Banner ist nur das Angebot, dieser Timer ist der tatsächliche Effekt.
  const [goldenBoostTimer, setGoldenBoostTimer] = useState(0);
  // Endzeit (ms) des Vollbild-Glitch-Effekts bei Bubble Pop. Bewusst NICHT an die Lebensdauer
  // des Banners gekoppelt: der Glitch ist ein kurzer Schock-Effekt, das Banner steht die
  // gesamten 30s Debuff-Dauer - 30s Dauerglitch wäre unbenutzbar.
  const [bubbleGlitchUntil, setBubbleGlitchUntil] = useState(0);

  const [buildings, setBuildings] = useState(INITIAL_BUILDINGS);
  // Black Swan Events: nächstmöglicher Zeitpunkt (ms) für ein Event PRO Engine-Typ.
  // undefined = Engine noch nie beobachtet -> beim ersten Tick mit Bestand > 0 auf
  // "jetzt + 24h" gesetzt (Gnadenfrist, bevor überhaupt ein erstes Event möglich ist).
  const [blackSwanNextEligible, setBlackSwanNextEligible] = useState({});
  const [boughtUpgrades, setBoughtUpgrades] = useState([]);
  const [unlockedUpgrades, setUnlockedUpgrades] = useState([]);
  const [boughtHeavenlyUpgrades, setBoughtHeavenlyUpgrades] = useState([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);

  // { id, kind: 'golden'|'bubble', expiresAt, claimed? }. Bei 'golden' ist expiresAt vor dem
  // Claim das Ende der Überlegzeit und danach das Ende des Boosts.
  const [activeEvent, setActiveEvent] = useState(null);
  const [adState, setAdState] = useState(null); // { type, timer }
  const [adCooldowns, setAdCooldowns] = useState({}); // { [adType]: readyAtTimestamp }
  const [offlineReport, setOfflineReport] = useState(null); // { amount, elapsedSec } | null
  const [pendingAscendBoost, setPendingAscendBoost] = useState(false);
  const [pendingPivotBoost, setPendingPivotBoost] = useState(false);

  // Kurzes Bestätigungs-Toast nach abgeschlossener Rewarded Ad ("Bonus jetzt erhalten!") -
  // ergänzt den Log-Eintrag um eine unübersehbare, selbst-verschwindende Rückmeldung.
  const [adRewardToast, setAdRewardToast] = useState(null); // { id, message } | null
  const flashAdReward = useCallback((message) => {
    setAdRewardToast({ id: Date.now() + Math.random(), message });
  }, []);
  const dismissAdRewardToast = useCallback(() => setAdRewardToast(null), []);

  // Werbefrei-IAP (iOS): Entitlement kommt aus dem PurchaseBridge (StoreKit nativ, immer
  // false im Web-Build), NICHT aus dem Save - ein Save-Reset (resetSave) oder ein
  // manipulierter localStorage-Eintrag darf den Kauf niemals löschen bzw. vortäuschen.
  // Siehe docs/ios-app-konzept.md Abschnitt 5.
  const [adFree, setAdFree] = useState(false);
  const [adFreeProduct, setAdFreeProduct] = useState(null); // { displayPrice, displayName } | null
  const [purchaseState, setPurchaseState] = useState('idle'); // 'idle' | 'purchasing' | 'pending' | 'restoring' | 'failed'
  // Bridge-Auswahl selbst ist stabil für die Lebensdauer des Hooks (native Injection kommt
  // über selectPurchaseBridge/selectAdBridge, siehe dortige TODOs für die Native-Anbindung).
  const purchaseBridge = useMemo(() => selectPurchaseBridge({ nativePurchaseBridge }), []);
  const adBridge = useMemo(() => selectAdBridge({ adFree, nativeAdBridge }), [adFree]);

  useEffect(() => {
    let cancelled = false;
    // Gecachten Kaufstatus sofort anwenden (siehe docs/ios-app-konzept.md §5, Schritt 1):
    // Transaction.currentEntitlements braucht selbst auf dem Gerät einen Moment, in dem die
    // App sonst kurz "nicht gekauft" zeigen würde. Wird unten von der echten StoreKit-Antwort
    // immer überschrieben, dient nur als Kaltstart-Überbrückung.
    getStorageItem(ADFREE_CACHE_KEY).then((cached) => {
      if (!cancelled && cached === '1') setAdFree(true);
    });
    purchaseBridge.getEntitlements().then((ent) => {
      if (cancelled) return;
      const purchased = !!ent.adFree;
      setAdFree(purchased);
      setStorageItem(ADFREE_CACHE_KEY, purchased ? '1' : '0').catch(() => {});
      // Erst NACH der Entitlement-Prüfung initialisieren, nie vorher: sonst würde für
      // wiederkehrende Käufer:innen bei jedem Kaltstart kurz das Ad-SDK anlaufen, bevor der
      // (async) Kaufstatus überhaupt feststeht - genau das darf laut Konzept nicht passieren
      // (docs/ios-app-konzept.md §6, "Ad-SDK wird gar nicht erst initialisiert").
      if (!purchased) {
        ensureAdConsent().catch((e) => console.error('Ad consent init failed:', e));
      }
    });
    // Lokalisierter Preis für die Kaufkarte (MiscTab) - unabhängig vom Kaufstatus geladen,
    // damit er sofort bereitsteht, falls doch mal "restore" statt "purchased" nötig ist.
    purchaseBridge.getProductInfo().then((info) => {
      if (!cancelled) setAdFreeProduct(info);
    });
    // Deckt Ask-to-Buy-Freigaben und Family-Sharing-Transaktionen ab, die außerhalb eines
    // expliziten purchaseAdFree()-Aufrufs eintreffen (siehe docs/ios-app-konzept.md §5.3).
    const unsubscribe = purchaseBridge.onEntitlementChange((ent) => {
      const purchased = !!ent.adFree;
      setAdFree(purchased);
      setStorageItem(ADFREE_CACHE_KEY, purchased ? '1' : '0').catch(() => {});
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [purchaseBridge]);

  // purchaseAdFree/restorePurchases folgen weiter unten, direkt nach der addLog-Deklaration
  // (sie loggen das Kaufergebnis) - addLog existiert an dieser Stelle im Hook-Body noch nicht
  // (TDZ), deshalb hier nur die addLog-freien Teile.

  // ATT-Erklärbildschirm (App Tracking Transparency): wird VOR dem eigentlichen System-Prompt
  // gezeigt, ausgelöst über den attCheckedRef-Guard in handleTapAGI weiter unten - siehe
  // docs/ios-app-konzept.md §6 ("nicht beim Kaltstart", "vorher ein eigener Erklärbildschirm,
  // das hebt die Zustimmungsrate deutlich"). attCheckedRef verhindert, dass der (async)
  // Status bei jedem Tap erneut nativ abgefragt wird, sobald einmal ein definitiver Stand
  // feststeht (auch wenn der Prompt selbst noch aussteht, z.B. während der Nutzer den
  // Erklärbildschirm noch sieht).
  const [trackingExplainer, setTrackingExplainer] = useState(false);
  const attCheckedRef = useRef(false);

  const confirmTrackingExplainer = useCallback(() => {
    setTrackingExplainer(false);
    requestTrackingAuthorization().catch((e) => console.error('ATT request failed:', e));
  }, []);

  // Tab-Aktivität: 'active' (Tab sichtbar & fokussiert) = 100% Rate, 'inactive' (Tab sichtbar,
  // aber Fenster/Browser nicht fokussiert) und 'hidden' (Tab im Hintergrund/minimiert) = 50%.
  // 'hidden' wird zusätzlich NICHT live gutgeschrieben, siehe Tick-Loop weiter unten.
  const [pageActivity, setPageActivity] = useState('active');
  const [afkReport, setAfkReport] = useState(null); // { amount } | null - nach >=30min Abwesenheit bei offenem Tab, PENDING bis Ad/Verzicht
  // Betrag wird bei Rückkehr aus hiddenSinceRef berechnet (siehe updateActivity unten),
  // exakt wie beim Offline-Ertrag (OFFLINE_EFFICIENCY/OFFLINE_CAP_SECONDS) - kein separater
  // Tick-für-Tick-Puffer mehr, der zuvor ungedeckelt zu einer 40%-Rate akkumulierte (5x mehr
  // als der gedeckelte Offline-Pfad für dieselbe Abwesenheit, sobald man >4h wegblieb).
  const hiddenSinceRef = useRef(null);

  // Bei "später" wird statt einer harten Zeitgrenze ein Button im Menü freigeschaltet.
  // Default-Werte gelten nur für einen brandneuen Save ohne vorherigen Stand - der Load-
  // Effect unten überschreibt beide, sobald feststeht, ob die aktuelle Sitzung fortgesetzt
  // oder neu begonnen wird (siehe SCHEDULED_AD_RESET_GAP_SEC).
  const sessionStartRef = useRef(Date.now());
  const nextScheduledIndexRef = useRef(0);
  const [pendingScheduledAd, setPendingScheduledAd] = useState(false);
  const [scheduledAdUnlocked, setScheduledAdUnlocked] = useState(false);

  const [fancyGraphics, setFancyGraphics] = useState(true);

  const [activeTab, setActiveTab] = useState(1);
  const [buyMode, setBuyMode] = useState('1'); // '1', '10', '100', 'MAX'

  const [stats, setStats] = useState({
    totalClicks: 0,
    adsWatched: 0,
    goldenCaught: 0,
    overheatCount: 0,
    ascensionCount: 0,
    pivotCount: 0,
    gpuBounced: false,
    ascendTrillion: false,
    shadowLucky: false,
  });

  const [logs, setLogs] = useState([]);

  const [particles, setParticles] = useState([]);

  // vps ist erst weiter unten deklariert (const, TDZ) - saveGame braucht den aktuellen
  // Wert aber schon jetzt für sein Dependency-Array. Ref umgeht das TDZ-Problem, wird per
  // Effect direkt nach der vps-Berechnung aktuell gehalten.
  const vpsRef = useRef(0);

  // Merkt sich, ob das letzte Speichern fehlgeschlagen ist, damit der Autosave-Takt
  // (alle 8s) den Nutzer nicht mit derselben Fehlermeldung überschüttet. Ref statt State:
  // eine Änderung darf keinen Re-Render auslösen.
  const saveFailedRef = useRef(false);

  // Cross-Tab-Schutz: siehe die beiden Effects weiter unten ("Autosave pausiert, während
  // der Tab im Hintergrund ist" und "Resync beim Zurückkehren aus dem Hintergrund"). Hält
  // den Timestamp des Saves fest, den DIESER Tab zuletzt selbst geschrieben ODER geladen
  // hat, um zu erkennen, ob beim Zurückkehren aus dem Hintergrund ein ANDERER Tab
  // inzwischen etwas Neueres geschrieben hat.
  //
  // Ein früherer Ansatz hier nutzte ein 'storage'-Event, um jeden fremden Schreibvorgang
  // sofort zu erkennen und den Tab dauerhaft "einzufrieren". Das erwies sich als fataler
  // Fehlschluss: mit zwei offenen Tabs sieht JEDER Tab die routinemäßigen Autosave-Ticks
  // des JEWEILS ANDEREN als "fremden Schreiber" - im Test fror dadurch der Tab ein, der
  // gerade AKTIV bespielt wurde (25 echte Klicks gingen komplett verloren, $25 wurden nie
  // gespeichert), nur weil der andere, untätige Tab zufällig eine Nanosekunde früher
  // seinen eigenen harmlosen Autosave-Tick geschrieben hatte. Zwei Tabs offen zu haben
  // (z.B. ein Link in neuem Tab geöffnet, alten vergessen) hätte das Spiel so in JEDEM
  // Tab lautlos am Speichern gehindert - schlimmer als das Problem, das es lösen sollte.
  const lastKnownSaveTimestampRef = useRef(null);
  // Wächter für den Resync-Effect unten: wird nur bei einem selbst beobachteten Wechsel
  // auf 'hidden' gesetzt, damit ein Resync ausschließlich nach einem ECHTEN eigenen
  // Hintergrund-Aufenthalt läuft - nicht bei jedem 'visibilitychange'-Event.
  const wasHiddenRef = useRef(false);

  // `||` würde einen bewusst leeren String (z.B. der leere Epochen-Präfix bei 'ai') als
  // "fehlt" behandeln und bis zum rohen Key durchfallen lassen - darum hier explizit auf
  // undefined/null statt auf Falsy prüfen.
  const t = useCallback((key) => {
    const deVal = TRANSLATIONS[lang]?.[key];
    if (deVal !== undefined && deVal !== null) return deVal;
    const enVal = TRANSLATIONS.en[key];
    return enVal !== undefined && enVal !== null ? enVal : key;
  }, [lang]);

  // Wie t(), aber mit {var}-Platzhalter-Ersetzung - für Log-/Toast-Sätze, die dynamische
  // Werte (Namen, Beträge, Zahlen) an fester Stelle im übersetzten Satz brauchen.
  const tf = useCallback((key, vars = {}) => {
    const deVal = TRANSLATIONS[lang]?.[key];
    const enVal = TRANSLATIONS.en[key];
    let str = deVal !== undefined && deVal !== null
      ? deVal
      : (enVal !== undefined && enVal !== null ? enVal : key);
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replaceAll(`{${k}}`, v);
    });
    return str;
  }, [lang]);

  const addLog = useCallback((text, type = 'info') => {
    setLogs((prev) => [
      { id: Date.now() + Math.random(), timestamp: new Date().toLocaleTimeString(), text, type },
      ...prev.slice(0, 49),
    ]);
  }, []);

  const purchaseAdFree = useCallback(async () => {
    if (!purchaseBridge.isAvailable) return;
    setPurchaseState('purchasing');
    try {
      const result = await purchaseBridge.purchase(AD_FREE_PRODUCT_ID);
      if (result === 'purchased') {
        setAdFree(true);
        setStorageItem(ADFREE_CACHE_KEY, '1').catch(() => {});
        setPurchaseState('idle');
        addLog(tf('log_adFreePurchased'), 'achievement');
      } else if (result === 'pending') {
        setPurchaseState('pending');
        addLog(tf('log_adFreePending'), 'info');
      } else if (result === 'cancelled') {
        setPurchaseState('idle');
      } else {
        setPurchaseState('failed');
        addLog(tf('log_adFreePurchaseFailed'), 'danger');
      }
    } catch (e) {
      console.error('Purchase failed:', e);
      setPurchaseState('failed');
      addLog(tf('log_adFreePurchaseFailed'), 'danger');
    }
  }, [purchaseBridge, addLog, tf]);

  const restorePurchases = useCallback(async () => {
    setPurchaseState('restoring');
    try {
      const ent = await purchaseBridge.restore();
      setAdFree(!!ent.adFree);
      setStorageItem(ADFREE_CACHE_KEY, ent.adFree ? '1' : '0').catch(() => {});
      setPurchaseState('idle');
      addLog(tf(ent.adFree ? 'log_adFreeRestored' : 'log_adFreeRestoreNone'), ent.adFree ? 'achievement' : 'info');
    } catch (e) {
      console.error('Restore failed:', e);
      setPurchaseState('failed');
      addLog(tf('log_adFreePurchaseFailed'), 'danger');
    }
  }, [purchaseBridge, addLog, tf]);

  // --- SAVE & LOAD LOCALSTORAGE ---
  const saveGame = useCallback(() => {
    const saveData = {
      version: 2,
      timestamp: Date.now(),
      lang,
      startupName,
      valuation,
      totalValuation,
      totalBurned,
      slopCount,
      gpuTemp,
      isOverheated,
      coolingRate,
      powerClicks,
      prestigeLevel,
      heavenlyChips,
      themeMode,
      boughtBuzzwords,
      boughtGreenwashingLayoffs,
      epoch,
      idealistLevel,
      cynicLevel,
      credibility,
      pivotCount,
      valuationAtLastPivot,
      buildings,
      blackSwanNextEligible,
      boughtUpgrades,
      unlockedUpgrades,
      boughtHeavenlyUpgrades,
      unlockedAchievements,
      stats,
      fancyGraphics,
      adCooldowns,
      vps: vpsRef.current, // für Offline-Ertrag-Berechnung beim nächsten Laden
      // Für die Geplante-Ad-Popups-Härtung (SCHEDULED_AD_RESET_GAP_SEC): Anker + Fortschritt
      // der aktuellen Sitzung, damit ein Neuladen sie fortsetzt statt zurückzusetzen.
      scheduledAdAnchor: sessionStartRef.current,
      scheduledAdIndex: nextScheduledIndexRef.current,
    };
    // Fire-and-forget wie zuvor bei localStorage.setItem: Aufrufer (Autosave-Interval,
    // pagehide/visibilitychange-Handler) warten nicht auf den Abschluss - aber ein
    // rejectetes Promise wird trotzdem behandelt (siehe platform/storage.js: setItem()
    // schluckt Fehler auf keiner Plattform mehr selbst).
    setStorageItem(STORAGE_KEY, JSON.stringify(saveData)).then(() => {
      lastKnownSaveTimestampRef.current = saveData.timestamp;
      saveFailedRef.current = false;
    }).catch((e) => {
      // Bisher nur console.error: schlug das Speichern fehl (voller Speicher, Safari im
      // privaten Modus, wo setItem wirft, oder ein nativer Preferences-Schreibfehler),
      // spielte der Nutzer stundenlang weiter und verlor beim Schließen alles - ohne
      // jeden Hinweis. Der Autosave läuft alle 8 Sekunden, deshalb nur EINE Meldung pro
      // Fehlerphase, sonst wäre das Audit-Log innerhalb einer Minute zugemüllt.
      console.error('Failed to save game state:', e);
      if (!saveFailedRef.current) {
        saveFailedRef.current = true;
        addLog(tf('log_saveFailed'), 'danger');
      }
    });
  }, [
    lang, startupName, valuation, totalValuation, totalBurned, slopCount, gpuTemp, isOverheated,
    coolingRate, powerClicks, prestigeLevel, heavenlyChips, themeMode, boughtBuzzwords,
    boughtGreenwashingLayoffs, epoch, idealistLevel, cynicLevel, credibility, pivotCount,
    valuationAtLastPivot, buildings, blackSwanNextEligible,
    boughtUpgrades, unlockedUpgrades, boughtHeavenlyUpgrades, unlockedAchievements, stats,
    fancyGraphics, adCooldowns, addLog, tf
  ]);

  // Wendet einen validierten (migrierten) Save auf den React-State an. Gemeinsam genutzt
  // vom initialen Laden beim Mount UND vom Resync, wenn ein Tab aus dem Hintergrund
  // zurückkehrt und dabei feststellt, dass ein ANDERER Tab inzwischen etwas Neueres
  // geschrieben hat (siehe die Effects weiter unten) - beide Stellen sollen exakt dieselbe
  // Feld-für-Feld-Validierung durchlaufen, keine zweite, leicht abweichende Kopie pflegen.
  // useState-Setter haben eine stabile Identität über Re-Renders hinweg (React-Garantie),
  // deshalb ist ein leeres Dependency-Array hier korrekt.
  const applyLoadedState = useCallback((data) => {
    // Alle Werte laufen durch die safe*-Helfer oben: ein durch Abbruch, Altversion oder
    // DevTools beschädigter Save darf das Spiel nicht in einen NaN- oder Crash-Zustand
    // laden, aus dem der Spieler nicht mehr herauskommt.
    const resolvedLang = ['de', 'en'].includes(data.lang) ? data.lang : 'de';
    setLang(resolvedLang);
    setStartupName(safeString(data.startupName, 'tokenkamin'));
    setValuation(safeNumber(data.valuation, 0, { min: 0 }));
    setTotalValuation(safeNumber(data.totalValuation, 0, { min: 0 }));
    setTotalBurned(safeNumber(data.totalBurned, 0, { min: 0 }));
    setSlopCount(safeNumber(data.slopCount, 0, { min: 0 }));
    setGpuTemp(safeNumber(data.gpuTemp, 0, { min: 0 }));
    setIsOverheated(safeBool(data.isOverheated));
    setCoolingRate(safeNumber(data.coolingRate, 4.0, { min: 0 }));
    setPowerClicks(safeNumber(data.powerClicks, 0, { min: 0 }));
    setPrestigeLevel(safeNumber(data.prestigeLevel, 0, { min: 0 }));
    setHeavenlyChips(safeNumber(data.heavenlyChips, 0, { min: 0 }));
    // 'cyberpunk' als Gegenwert, nicht 'modern_slop': der Initial-State und
    // toggleThemeMode benutzen 'cyberpunk', der Ladepfad hatte dafür bisher einen
    // dritten Namen. Ausgewertet wird ohnehin nur === 'sec_prospectus', deshalb ist
    // das nie aufgefallen - ein drittes Synonym im State ist trotzdem eine Falle.
    setThemeMode(data.themeMode === 'sec_prospectus' ? 'sec_prospectus' : 'cyberpunk');
    setBoughtBuzzwords(safeIdList(data.boughtBuzzwords));
    setBoughtGreenwashingLayoffs(safeIdList(data.boughtGreenwashingLayoffs));
    setEpoch(safeNumber(data.epoch, 2, { min: 0 }));
    setIdealistLevel(safeNumber(data.idealistLevel, 0, { min: 0 }));
    setCynicLevel(safeNumber(data.cynicLevel, 0, { min: 0 }));
    setCredibility(safeNumber(data.credibility, 0, { min: 0 }));
    setPivotCount(safeNumber(data.pivotCount, 0, { min: 0 }));
    setValuationAtLastPivot(safeNumber(data.valuationAtLastPivot, 0, { min: 0 }));
    // Nur bekannte Engine-IDs übernehmen: unbekannte Schlüssel aus einem manipulierten
    // Save würden sonst in jede Iteration über buildings wandern.
    const savedBuildings = data.buildings;
    setBuildings(
      Object.keys(INITIAL_BUILDINGS).reduce((acc, id) => {
        acc[id] = Math.floor(safeNumber(savedBuildings?.[id], 0, { min: 0 }));
        return acc;
      }, {})
    );
    setBlackSwanNextEligible(safeTimestampMap(data.blackSwanNextEligible));
    // Ad-Cooldowns wurden bisher NICHT gespeichert: ein Reload setzte jede Rewarded-Ad-
    // Sperre zurück (z.B. die 5-Minuten-Sperre auf 'grant'), solange die Ads simuliert
    // sind folgenlos, mit echten Rewarded Ads wäre das ein Exploit.
    setAdCooldowns(safeTimestampMap(data.adCooldowns));
    setBoughtUpgrades(safeIdList(data.boughtUpgrades));
    setUnlockedUpgrades(safeIdList(data.unlockedUpgrades));
    setBoughtHeavenlyUpgrades(safeIdList(data.boughtHeavenlyUpgrades));
    setUnlockedAchievements(safeIdList(data.unlockedAchievements));
    const savedStats = data.stats;
    setStats({
      totalClicks: safeNumber(savedStats?.totalClicks, 0, { min: 0 }),
      adsWatched: safeNumber(savedStats?.adsWatched, 0, { min: 0 }),
      goldenCaught: safeNumber(savedStats?.goldenCaught, 0, { min: 0 }),
      overheatCount: safeNumber(savedStats?.overheatCount, 0, { min: 0 }),
      ascensionCount: safeNumber(savedStats?.ascensionCount, 0, { min: 0 }),
      gpuBounced: safeBool(savedStats?.gpuBounced),
      ascendTrillion: safeBool(savedStats?.ascendTrillion),
      shadowLucky: safeBool(savedStats?.shadowLucky),
    });
    setFancyGraphics(data.fancyGraphics !== false);
    lastKnownSaveTimestampRef.current = safeNumber(data.timestamp, null);
    return resolvedLang;
  }, []);

  // Load state on mount. Async (await getStorageItem) statt synchronem localStorage.getItem,
  // weil die native Preferences-Bridge (siehe platform/storage.js) über Capacitor läuft und
  // damit zwingend ein Promise liefert - auf Web löst das Promise praktisch sofort auf, der
  // erste Render bleibt also unverändert kurz.
  useEffect(() => {
    let resolvedLang = 'de';
    (async () => {
    // Sprache wird synchron aus dem Save aufgelöst (statt über t()/tf(), die erst nach dem
    // nächsten Render den frisch gesetzten lang-State sehen würden), damit der allererste
    // Log-Eintrag direkt in der tatsächlich aktiven Sprache erscheint statt immer in 'de'.
    try {
      const saved = await getStorageItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const data = parsed ? migrateSave(parsed) : null;
        if (data) {
          resolvedLang = applyLoadedState(data);

          // Offline-Ertrag: nur wenn Spieler >= 1 Minute weg war und beim letzten
          // Speichern tatsächlich etwas produziert hat. Die Schwellenentscheidung
          // (automatisch vs. nur per Ad) läuft über die UNGEDECKELTE Abwesenheitsdauer
          // (elapsedSec), exakt wie beim Tab-im-Hintergrund-Fall unten - der Deckel
          // (cappedSec) bestimmt nur, wie viel von einer SEHR langen Abwesenheit noch in
          // die Betragsberechnung einfließt, nicht ob geclaimt werden muss.
          const savedTimestamp = safeNumber(data.timestamp, Date.now(), { min: 0 });
          const elapsedSec = (Date.now() - savedTimestamp) / 1000;
          const savedVps = safeNumber(data.vps, 0, { min: 0 });
          if (elapsedSec >= OFFLINE_MIN_SECONDS && savedVps > 0) {
            const cappedSec = Math.min(elapsedSec, OFFLINE_CAP_SECONDS);
            const amount = savedVps * cappedSec * OFFLINE_EFFICIENCY;
            if (amount >= 1) {
              if (elapsedSec >= AFK_THRESHOLD_SECONDS) {
                // >= 30 Minuten: PENDING, nur per Ad claimbar (alles oder nichts) - siehe
                // claimOfflineEarnings/dismissOfflineEarnings.
                setOfflineReport({ amount, elapsedSec });
              } else {
                // < 30 Minuten: sofort und ohne Rückfrage gutgeschrieben, kein Modal.
                setValuation((prev) => prev + amount);
                setTotalValuation((prev) => prev + amount);
                setSlopCount((prev) => prev + Math.max(1, Math.floor(amount)));
                // tf()/t() hängen an der 'lang'-State, die zu diesem Zeitpunkt im selben
                // Tick noch nicht aktualisiert ist (siehe resolvedLang-Kommentar oben) -
                // deshalb direkt wie beim systemInit-Log über TRANSLATIONS[resolvedLang].
                const msg = ((TRANSLATIONS[resolvedLang] || TRANSLATIONS.en).log_offlineEarnings || '')
                  .replace('{amount}', Math.floor(amount).toLocaleString());
                addLog(msg, 'success');
              }
            }
          }

          // Geplante Ad-Popups (SCHEDULED_AD_RESET_GAP_SEC): dieselbe Abwesenheitsdauer wie
          // oben entscheidet, ob die Sitzung fortgesetzt (Anker + Fortschritt aus dem Save
          // übernehmen) oder neu begonnen wird (Anker = jetzt, Fortschritt = 0 - die
          // useRef-Defaults von oben gelten dann unverändert weiter). Ein bloßes
          // Neuladen/Neustarten innerhalb der Schwelle darf den Fortschritt NICHT
          // zurücksetzen, sonst ließe sich der 5-Minuten-Bonus farmen.
          if (elapsedSec < SCHEDULED_AD_RESET_GAP_SEC && typeof data.scheduledAdAnchor === 'number') {
            sessionStartRef.current = data.scheduledAdAnchor;
            nextScheduledIndexRef.current = data.scheduledAdIndex || 0;
          }
        }
      }
    } catch (e) {
      console.error('Error loading save state:', e);
    }
    addLog((TRANSLATIONS[resolvedLang] || TRANSLATIONS.en).log_systemInit, 'info');
    })();
  }, [addLog, applyLoadedState]);

  // Auto-save interval (every 8 seconds, matches concept's autosave cadence).
  // saveGame's identity changes on almost every tick (valuation, gpuTemp, etc. are all
  // dependencies), so the interval is read through a ref that's kept up to date instead
  // of being a direct effect dependency — otherwise the effect would tear down and
  // recreate the interval every ~100ms and it would never accumulate to 8s, meaning
  // autosave would effectively never fire during active play.
  const saveGameRef = useRef(saveGame);
  useEffect(() => {
    saveGameRef.current = saveGame;
  }, [saveGame]);

  // Update browser tab title dynamically: "$Value - CompanyName" (No lightning bolts!)
  useEffect(() => {
    document.title = `${formatCurrency(valuation)} - ${startupName}`;
  }, [valuation, startupName]);

  // <html lang> mit der tatsächlich angezeigten Sprache synchron halten. index.html kann
  // nur einen statischen Wert setzen, die Oberfläche startet aber auf Deutsch und ist zur
  // Laufzeit umschaltbar. Ein falsches lang-Attribut lässt Screenreader die Texte mit der
  // falschen Aussprache vorlesen (WCAG 3.1.1/3.1.2) und führt Übersetzungsdienste sowie
  // Suchmaschinen in die Irre.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const saveTimer = setInterval(() => {
      // Ein Tab im Hintergrund speichert nicht: sonst überschreibt ein bloß offen
      // gelassener, untätiger Tab den Stand eines anderen Tabs, den die Person gerade
      // tatsächlich bespielt. Der Moment des Backgrounding selbst ist trotzdem
      // abgesichert (siehe handleVisibilityChange unten, feuert einmalig beim Wechsel
      // auf 'hidden') - hier geht nur der WEITERLAUFENDE 8s-Takt im Hintergrund aus.
      if (document.visibilityState !== 'visible') return;
      saveGameRef.current();
    }, 8000);
    return () => clearInterval(saveTimer);
  }, []);

  // Save on tab close/backgrounding/refresh so nothing since the last 8s tick is lost.
  // Beim Zurückkehren aus dem Hintergrund zusätzlich prüfen, ob ein ANDERER Tab
  // inzwischen etwas Neueres gespeichert hat (siehe applyLoadedState/
  // lastKnownSaveTimestampRef oben) und in dem Fall dessen Stand nachladen, statt mit dem
  // eigenen, jetzt veralteten In-Memory-Stand weiterzuspielen und ihn beim nächsten
  // eigenen Autosave zu überschreiben. Ein früherer Ansatz erkannte fremde Schreibvorgänge
  // per 'storage'-Event sofort und fror den Tab dauerhaft ein - das erwies sich als
  // fataler Fehlschluss: mit zwei offenen Tabs sah JEDER Tab die routinemäßigen Autosave-
  // Ticks des JEWEILS ANDEREN als "fremden Schreiber" und konnte sich dadurch selbst
  // einfrieren, noch bevor er seinen eigenen ersten Autosave geschrieben hatte - im Test
  // gingen so 25 echte Klicks komplett verloren. Die Pause-während-Hintergrund-Lösung
  // hier umgeht das Problem strukturell: nur der zuletzt aktiv angesehene Tab speichert
  // überhaupt, ein Wettlauf zwischen zwei gleichzeitig schreibenden Tabs kann gar nicht
  // erst entstehen (außer bei zwei GLEICHZEITIG sichtbaren Tabs, z.B. Splitscreen - dieser
  // Randfall bleibt wie zuvor: letzter Schreibvorgang gewinnt, wie bei den meisten Apps
  // ohne Realtime-Sync-Infrastruktur).
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveGameRef.current();
        wasHiddenRef.current = true;
        return;
      }
      // Resync NUR nach einem selbst beobachteten Hidden-Zustand, nicht bei jedem
      // 'visibilitychange'-Event: Chromium (mindestens im Headless-Betrieb, siehe Test)
      // feuert dieses Event teils auch dann, wenn document.visibilityState nie wirklich
      // auf 'hidden' wechselt - z.B. schon beim bloßen Öffnen eines zweiten Tabs. Ohne
      // dieses Wächter-Flag hätte JEDES solche Ereignis versucht "nachzuladen", obwohl
      // dieser Tab nie im Hintergrund war und gerade eigenen, noch ungespeicherten
      // Fortschritt im State hat - im Test wurden so 25 echte Klicks ($25) durch den
      // älteren Stand von der Platte überschrieben, BEVOR der eigene Autosave sie
      // überhaupt erreichen konnte.
      if (!wasHiddenRef.current) return;
      wasHiddenRef.current = false;
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;
        const parsed = JSON.parse(saved);
        const data = parsed ? migrateSave(parsed) : null;
        const savedTimestamp = data ? safeNumber(data.timestamp, null) : null;
        // Strikt NEUER statt nur "anders": schützt zusätzlich gegen Uhren-Ungenauigkeiten
        // und stellt sicher, dass wirklich nur ein ECHTER fremder Fortschritt übernommen
        // wird, nie einfach nur ein abweichender Wert.
        if (data && savedTimestamp !== null && savedTimestamp > lastKnownSaveTimestampRef.current) {
          applyLoadedState(data);
        }
      } catch (e) {
        console.error('Error resyncing save state:', e);
      }
    };
    const handlePageHide = () => saveGameRef.current();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    // iOS: siehe appState.js - document.visibilitychange feuert beim Backgrounding über
    // Home-Button/App-Switcher nicht zuverlässig. Ohne dieses zusätzliche Signal blieb der
    // gespeicherte timestamp beim Wiedereinstieg teils veraltet (letzter erfolgreicher
    // Autosave statt tatsächlichem Verlassenszeitpunkt), wodurch die daraus berechnete
    // Abwesenheitsdauer (offlineReport.elapsedSec, siehe Mount-Effect) falsch zu lang oder
    // kurz ausfiel. Auf Web ein No-Op (subscribeNativeAppState feuert dort nie).
    const unsubscribeNativeAppState = subscribeNativeAppState((isActive) => {
      if (!isActive) {
        saveGameRef.current();
        wasHiddenRef.current = true;
      }
    });
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      unsubscribeNativeAppState();
    };
  }, [applyLoadedState]);

  // Tab-Aktivität tracken: hidden = Tab im Hintergrund, inactive = Tab sichtbar aber Fenster
  // ohne Fokus. Bei Rückkehr aus "hidden" entscheidet die Abwesenheitsdauer, was mit dem im
  // Hintergrund erzeugten (aber NICHT live gutgeschriebenen, siehe Tick-Loop oben) Wert
  // passiert:
  // - < 30 min: automatisch & ohne jeden Hinweis gutgeschrieben - dafür war's zu kurz, um
  //   eine Entscheidung zu verlangen.
  // - >= 30 min: bleibt PENDING und wird nur per AfkReportModal aufgelöst - Ad ansehen
  //   (claimAfkBonus) schreibt den Betrag gut, Verzicht (dismissAfkReport) verwirft ihn
  //   ersatzlos. Kein "Popup wegklicken und Geld trotzdem behalten" mehr.
  // nativeBackgroundRef: zusätzliches Signal von @capacitor/app (siehe platform/appState.js).
  // document.visibilityState allein reicht auf iOS nicht - eine WKWebView meldet Hintergrund/
  // Vordergrund darüber nicht durchgängig zuverlässig. Auf Web bleibt der Ref immer false
  // (subscribeNativeAppState ist dort ein No-Op), ändert also nichts am bisherigen Verhalten.
  const nativeBackgroundRef = useRef(false);
  // Deckt sowohl 'hidden' als auch 'inactive' ab (siehe isTabActive im Tick-Loop) - dient
  // nur dazu, beim Rückkehren in den aktiven Zustand verpasste geplante-Ad-Schwellen
  // einmalig und still zu überspringen, statt sie gleich reihenweise nachzuholen.
  const suppressedSinceRef = useRef(null);

  useEffect(() => {
    const updateActivity = () => {
      const isHidden = document.visibilityState === 'hidden' || nativeBackgroundRef.current;
      if (isHidden) {
        if (hiddenSinceRef.current === null) {
          hiddenSinceRef.current = Date.now();
        }
        if (suppressedSinceRef.current === null) suppressedSinceRef.current = Date.now();
        setPageActivity('hidden');
      } else {
        if (hiddenSinceRef.current !== null) {
          const hiddenSince = hiddenSinceRef.current;
          const awaySec = (Date.now() - hiddenSince) / 1000;

          // Schutz gegen doppeltes Gutschreiben bei zwei gleichzeitig im Hintergrund
          // gewesenen Tabs DESSELBEN Browsers (teilen sich localStorage): hat ein ANDERER
          // Tab bereits NACH dem Moment, an dem dieser Tab hier hidden wurde, gespeichert,
          // hat er (mindestens einen Teil) desselben Abwesenheitszeitraums schon behandelt -
          // dann nur dessen neueren Stand übernehmen statt selbst nochmal gutzuschreiben.
          // Schließt das Fenster nicht zu 100% (beide Tabs könnten exakt gleichzeitig
          // zurückkehren, bevor einer speichert), verkleinert es aber von "beliebig lang"
          // auf einen einzelnen Save-Tick - siehe saveGameRef.current() unten, das genau
          // diesen Tick für einen etwaigen dritten Tab so früh wie möglich setzt.
          // Schützt NICHT gegen zwei komplett getrennte Browser/Geräte mit demselben
          // (z.B. per Export/Import kopierten) Spielstand - das bräuchte einen Server als
          // gemeinsame Quelle der Wahrheit, den dieses Spiel bewusst nicht hat.
          let alreadyHandledByOtherTab = false;
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            const parsed = saved ? JSON.parse(saved) : null;
            const data = parsed ? migrateSave(parsed) : null;
            const savedTimestamp = data ? safeNumber(data.timestamp, null) : null;
            if (savedTimestamp !== null && savedTimestamp > hiddenSince) {
              alreadyHandledByOtherTab = true;
              applyLoadedState(data);
            }
          } catch (e) {
            console.error('Error checking for concurrent tab credit:', e);
          }

          if (!alreadyHandledByOtherTab) {
            // Gedeckelt auf OFFLINE_CAP_SECONDS und mit derselben OFFLINE_EFFICIENCY wie
            // der Offline-Ertrag berechnet (siehe Konstanten oben) - vorher akkumulierte
            // der Tick-Loop hier ungedeckelt mit einer höheren Rate (40%), wodurch ein
            // einfach im Hintergrund liegen gelassener Tab je nach Abwesenheitsdauer ein
            // Vielfaches des "richtigen" (Browser wirklich geschlossenen) Offline-Ertrags
            // einbrachte. Der Schwellenwert-Vergleich unten nutzt bewusst die UNGEDECKELTE
            // awaySec, exakt wie beim Offline-Pfad (elapsedSec dort) - der Deckel wirkt
            // nur auf den Betrag.
            const cappedSec = Math.min(awaySec, OFFLINE_CAP_SECONDS);
            const earnedWhileHidden = vpsRef.current * cappedSec * OFFLINE_EFFICIENCY;
            if (awaySec >= AFK_THRESHOLD_SECONDS && earnedWhileHidden >= 1) {
              setAfkReport({ amount: earnedWhileHidden });
            } else if (earnedWhileHidden > 0) {
              setValuation((prev) => prev + earnedWhileHidden);
              setTotalValuation((prev) => prev + earnedWhileHidden);
              setSlopCount((prev) => prev + Math.max(1, Math.floor(earnedWhileHidden)));
            }
            // Sofort speichern statt auf den nächsten 8s-Autosave-Tick zu warten: bumpt
            // den persistierten Zeitstempel jetzt, damit ein zweiter, gleichzeitig hidden
            // gewesener Tab den Check oben beim eigenen Zurückkehren schon greifen sieht.
            saveGameRef.current();
          }
          hiddenSinceRef.current = null;
        }
        const nowActive = document.hasFocus();
        if (nowActive && suppressedSinceRef.current !== null) {
          // Rückkehr aus Hintergrund/Unfokussiert: verpasste geplante-Ad-Schwellen
          // verfallen ersatzlos statt nachgeholt zu werden, sonst ploppen sie nach der
          // Rückkehr im 5s-Poll-Takt reihenweise nacheinander auf (siehe Tick-Loop oben).
          const elapsedMin = (Date.now() - sessionStartRef.current) / 60000;
          while (
            nextScheduledIndexRef.current < SCHEDULED_AD_MINUTES.length &&
            elapsedMin >= SCHEDULED_AD_MINUTES[nextScheduledIndexRef.current]
          ) {
            nextScheduledIndexRef.current += 1;
          }
          suppressedSinceRef.current = null;
        } else if (!nowActive && suppressedSinceRef.current === null) {
          suppressedSinceRef.current = Date.now();
        }
        setPageActivity(nowActive ? 'active' : 'inactive');
      }
    };
    updateActivity();
    document.addEventListener('visibilitychange', updateActivity);
    window.addEventListener('focus', updateActivity);
    window.addEventListener('blur', updateActivity);
    // hasFocus() Wechsel feuern nicht immer zuverlässig ein Event (z.B. Alt-Tab in
    // manchen Browsern) - Poll als Fallback.
    const poll = setInterval(updateActivity, 2000);
    const unsubscribeNativeAppState = subscribeNativeAppState((isActive) => {
      nativeBackgroundRef.current = !isActive;
      updateActivity();
    });
    return () => {
      document.removeEventListener('visibilitychange', updateActivity);
      window.removeEventListener('focus', updateActivity);
      window.removeEventListener('blur', updateActivity);
      clearInterval(poll);
      unsubscribeNativeAppState();
    };
  }, [applyLoadedState]);

  // Geplante Ad-Popups (Punkt 9): pollt gegen SCHEDULED_AD_MINUTES seit Sitzungsbeginn
  // (sessionStartRef - persistiert & vor Farming gehärtet, siehe SCHEDULED_AD_RESET_GAP_SEC
  // oben). Mit adFree wird das unterbrechende Vollbild-Popup übersprungen: der Bonus landet
  // direkt im nicht-modalen "später einlösen"-Zustand (scheduledAdUnlocked), den es für den
  // Ad-Pfad ohnehin schon gibt (siehe deferScheduledAd) - kein Interrupt für jemanden, der
  // gerade für Ruhe bezahlt hat (docs/ios-app-konzept.md §4.3).
  useEffect(() => {
    const poll = setInterval(() => {
      // Nicht im Vordergrund: keine neuen geplanten Ad-Popups auslösen, siehe
      // isTabActive-Kommentar im Tick-Loop oben - sonst würden mehrere verpasste
      // Schwellen nach der Rückkehr in schneller Folge nachgeholt.
      if (pageActivity !== 'active') return;
      const elapsedMin = (Date.now() - sessionStartRef.current) / 60000;
      const nextIdx = nextScheduledIndexRef.current;
      if (nextIdx < SCHEDULED_AD_MINUTES.length && elapsedMin >= SCHEDULED_AD_MINUTES[nextIdx]) {
        nextScheduledIndexRef.current = nextIdx + 1;
        if (adFree) {
          setScheduledAdUnlocked(true);
        } else {
          setPendingScheduledAd(true);
        }
      }
    }, 5000);
    return () => clearInterval(poll);
  }, [adFree, pageActivity]);

  // --- HYPE TIER & BURN RATE CALCULATIONS (Konzept Abschnitt 4) ---
  const hypeTier = useMemo(() => {
    const thresholds = [0, 1e4, 1e6, 1e8, 1e10, 1e12, 1e14, 1e16, 1e18, 1e20];
    let tier = 1;
    for (let i = 0; i < thresholds.length; i++) {
      if (totalValuation >= thresholds[i]) tier = i + 1;
    }
    return Math.min(10, tier);
  }, [totalValuation]);

  const idealistBurnDelta = useMemo(() => {
    let delta = 0;
    for (let i = 0; i < idealistLevel; i++) {
      if (IDEALIST_PATH[i]) delta += IDEALIST_PATH[i].burnDelta;
    }
    return delta;
  }, [idealistLevel]);

  const cynicBurnDelta = useMemo(() => {
    let delta = 0;
    for (let i = 0; i < cynicLevel; i++) {
      if (CYNIC_PATH[i]) delta += CYNIC_PATH[i].burnDelta;
    }
    return delta;
  }, [cynicLevel]);

  // Nur Greenwashing I zählt für den Burn-Rate-Abschlag (Konzept: "-0.001 x Anzahl Gebäude mit Greenwashing-I")
  const greenwashingDiscount = useMemo(() => {
    const gwCount = boughtGreenwashingLayoffs.filter((id) => id.startsWith('gw_') && id.endsWith('_1')).length;
    return gwCount * 0.001;
  }, [boughtGreenwashingLayoffs]);

  // Burn is a continuous % decay of the CURRENT stock every tick (not of production),
  // so it compounds fast: at the old 2-6.5%/s base, valuation halved every ~11-35s even
  // while idle, wiping the player out within a couple of minutes of inactivity. Tuned down
  // 10x (0.2-0.65%/s base, ~10% cap instead of 90%) so idle/short-inattention periods are
  // forgiving while burn still meaningfully matters over longer idle stretches.
  const burnRate = useMemo(() => {
    const base = 0.002 + (hypeTier - 1) * 0.0005;
    // Bubble Pop no longer takes an instant cut of the stock - it's a pure rate hit instead
    // (this burn spike + the matching VPS cut below), so it needs to be clearly noticeable.
    const bubbleBonus = bubblePopTimer > 0 ? 0.015 : 0;
    const total = base + idealistBurnDelta + cynicBurnDelta - greenwashingDiscount + bubbleBonus;
    // Mindestens 0.1%/s, nie exakt 0% - sonst wirkte die Burn Rate (v.a. mit vollem Idealist-Pfad)
    // "kaputt" und zeigte dauerhaft 0.0% an, statt weiterhin spürbar am Bestand zu nagen.
    return Math.max(0.001, Math.min(0.10, total));
  }, [hypeTier, idealistBurnDelta, cynicBurnDelta, greenwashingDiscount, bubblePopTimer]);

  // Buzzwords VPS Multiplier Bonus
  const buzzwordBonus = useMemo(() => {
    let sum = 0;
    boughtBuzzwords.forEach((bId) => {
      const bw = BUZZWORDS_DATA.find((item) => item.id === bId);
      if (bw) sum += bw.bonus;
    });
    return sum;
  }, [boughtBuzzwords]);

  // --- GROSS TPS/VPS (Konzept Abschnitt 4, plus Token-Furnace Board-Syndicate/Prestige-Boni) ---
  const grossVps = useMemo(() => {
    let totalCps = 0;

    BUILDINGS_DATA.forEach((b) => {
      const count = buildings[b.id] || 0;
      if (count > 0) {
        let buildingMult = 1;
        boughtUpgrades.forEach((upId) => {
          const up = UPGRADES_DATA.find((u) => u.id === upId);
          if (up && up.type === 'building' && up.buildingId === b.id) {
            buildingMult *= up.effect.value;
          }
        });

        // Greenwashing II (+10%), Layoff I (+20%), Layoff II (+15%) - Konzept Abschnitt 4
        boughtGreenwashingLayoffs.forEach((itemId) => {
          const gw = GREENWASHING_LAYOFFS_DATA.find((g) => g.id === itemId);
          if (gw && gw.buildingId === b.id) {
            if (gw.type === 'greenwashing' && gw.tier === 2) buildingMult *= 1.10;
            if (gw.type === 'layoff' && gw.tier === 1) buildingMult *= 1.20;
            if (gw.type === 'layoff' && gw.tier === 2) buildingMult *= 1.15;
          }
        });

        totalCps += count * b.baseCps * buildingMult;
      }
    });

    // Zusätzliche Token-Furnace-Multiplikatoren (Global-Upgrades, Board-Syndicate, Prestige, Power-Click)
    let globalMult = 1.0;
    boughtUpgrades.forEach((upId) => {
      const up = UPGRADES_DATA.find((u) => u.id === upId);
      if (up && up.type === 'global' && up.effect.type === 'globalMult') {
        globalMult *= up.effect.value;
      }
    });

    let syndicateBoost = 1.0;
    const achievementCount = unlockedAchievements.length;
    boughtUpgrades.forEach((upId) => {
      const up = UPGRADES_DATA.find((u) => u.id === upId);
      if (up && up.type === 'syndicate') {
        syndicateBoost += achievementCount * up.effect.factor;
      }
    });

    // Idealist & Cynic VPS Bonuses + Buzzword Bonus (Konzept Abschnitt 4, additiv gestapelt)
    let idealistVpsBonus = 0;
    for (let i = 0; i < idealistLevel; i++) {
      if (IDEALIST_PATH[i]) idealistVpsBonus += IDEALIST_PATH[i].vpsBonus;
    }
    let cynicVpsBonus = 0;
    for (let i = 0; i < cynicLevel; i++) {
      if (CYNIC_PATH[i]) cynicVpsBonus += CYNIC_PATH[i].vpsBonus;
    }
    const pathMult = 1.0 + buzzwordBonus + idealistVpsBonus + cynicVpsBonus;

    // War 1%/2% pro Prestige-Level - bei so seltenen Chips (siehe ASCEND_CHIP_DIVISOR) hat
    // sich der harte Reset nicht gelohnt. Verdoppelt, damit Ascension spürbar was bringt.
    let prestigeBonus = 1.0 + (prestigeLevel * 0.02);
    if (boughtHeavenlyUpgrades.includes('heaven_synergy_1')) {
      prestigeBonus = 1.0 + (prestigeLevel * 0.04);
    }

    let powerSurgeMult = 1.0;
    if (powerClickActive && powerClickSurgeTimer > 0) {
      if (boughtHeavenlyUpgrades.includes('demon_3')) powerSurgeMult = 2.0;
      else if (boughtHeavenlyUpgrades.includes('demon_2')) powerSurgeMult = 1.5;
      else if (boughtHeavenlyUpgrades.includes('demon_1')) powerSurgeMult = 1.2;
    }

    // Golden Meme: 10x TPS für 30s - aber nur, wenn das Angebot per Ad eingelöst wurde.
    // Ein bloß sichtbares Banner (activeEvent) boostet nichts mehr.
    const goldenMult = goldenBoostTimer > 0 ? GOLDEN_BOOST_MULT : 1.0;

    // 9. Easter Egg: .ai Company Domain Bonus (+10% VPS)
    const aiDomainMult = (startupName || '').trim().toLowerCase().endsWith('.ai') ? 1.10 : 1.0;

    // Bubble Pop: -35% VPS for 30s (bubblePopTimer)
    const bubbleMult = bubblePopTimer > 0 ? 0.65 : 1.0;

    return totalCps * globalMult * syndicateBoost * pathMult * prestigeBonus * powerSurgeMult * aiDomainMult * goldenMult * bubbleMult;
  }, [buildings, boughtUpgrades, boughtGreenwashingLayoffs, boughtHeavenlyUpgrades, unlockedAchievements, buzzwordBonus, idealistLevel, cynicLevel, prestigeLevel, powerClickActive, powerClickSurgeTimer, goldenBoostTimer, bubblePopTimer, startupName]);

  // vps = gross production rate (Konzept: Gesamt-TPS, vor Burn Rate - Burn frisst den Bestand, nicht den Fluss)
  const vps = grossVps;

  useEffect(() => {
    vpsRef.current = vps;
  }, [vps]);

  // Was der Bestand gerade netto pro Sekunde macht (Produktion minus laufendem Burn) - nur fürs Display
  const netFlow = useMemo(() => vps - valuation * burnRate, [vps, valuation, burnRate]);

  // --- TAP-WERT (Konzept: max(1, Gesamt-TPS x 0.05), zzgl. Token-Furnace Click-Upgrades) ---
  const clickValue = useMemo(() => {
    let baseClick = Math.max(1, vps * 0.05);

    boughtUpgrades.forEach((upId) => {
      const up = UPGRADES_DATA.find((u) => u.id === upId);
      if (up && up.type === 'click' && up.effect.type === 'addClick') {
        baseClick += up.effect.value;
      }
    });
    boughtUpgrades.forEach((upId) => {
      const up = UPGRADES_DATA.find((u) => u.id === upId);
      if (up && up.type === 'click' && up.effect.type === 'vpsClickPct') {
        baseClick += vps * up.effect.value;
      }
    });

    let powerClickTapMult = 1;
    if (powerClickActive) {
      powerClickTapMult = 2;
      if (boughtHeavenlyUpgrades.includes('demon_3')) powerClickTapMult = 10;
      else if (boughtHeavenlyUpgrades.includes('demon_2')) powerClickTapMult = 5;
      else if (boughtHeavenlyUpgrades.includes('demon_1')) powerClickTapMult = 3;
    }

    return baseClick * powerClickTapMult;
  }, [boughtUpgrades, boughtHeavenlyUpgrades, vps, powerClickActive]);

  // --- MAIN TICK ENGINE LOOP (alle 100ms; Wahrscheinlichkeiten sind Tick-Dauer-unabhängig skaliert) ---
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSec = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      const tickScale = deltaSec / 0.2; // Konzept-Wahrscheinlichkeiten sind pro 200ms-Tick angegeben

      // 1. Produktion + kontinuierliches Burn (Konzept Abschnitt 4: Burn frisst den Bestand)
      // Tab inaktiv (sichtbar, aber Fenster ohne Fokus): 50% Produktion, live gutgeschrieben.
      // Tab hidden (im Hintergrund): KEINE Live-Produktion mehr hier - der Ertrag wird bei
      // Rückkehr aus der tatsächlichen Abwesenheitsdauer berechnet (siehe updateActivity
      // weiter oben, gedeckelt auf OFFLINE_CAP_SECONDS/OFFLINE_EFFICIENCY wie der
      // Offline-Ertrag). Vorher akkumulierte dieser Tick-Loop hier ungedeckelt mit einer
      // eigenen, höheren Rate (40%) - ein einfach im Hintergrund liegen gelassener Tab
      // brachte dadurch je nach Abwesenheitsdauer ein Vielfaches des "richtigen" (Browser
      // wirklich geschlossenen) Offline-Ertrags ein.
      const isHiddenTab = pageActivity === 'hidden';
      const activityMult = pageActivity === 'active' ? 1.0 : 0.5;
      setValuation((prevVal) => {
        // Burn läuft unverändert mit vollem Tempo weiter, auch im Hintergrund - das war
        // schon vor dieser Änderung so (siehe burnRate ohne activityMult) und bleibt so.
        const burnLoss = prevVal * burnRate * deltaSec;
        if (burnLoss > 0) {
          setTotalBurned((prev) => prev + burnLoss);
        }

        if (isHiddenTab) {
          return Math.max(0, prevVal - burnLoss);
        }

        const earned = vps * deltaSec * activityMult;
        if (earned > 0) {
          setTotalValuation((prev) => prev + earned);
          setSlopCount((prev) => prev + Math.max(1, Math.floor(earned)));
        }
        return Math.max(0, prevVal + earned - burnLoss);
      });

      // 2. GPU Cooling (-coolingRate °C/s)
      setGpuTemp((prev) => {
        const next = Math.max(0, prev - coolingRate * deltaSec);
        if (isOverheated && next < 50) {
          setIsOverheated(false);
          addLog(tf('log_gpuCooled'), 'success');
        }
        return next;
      });

      // 3. Power Click Surge Timer
      if (powerClickSurgeTimer > 0) {
        setPowerClickSurgeTimer((prev) => {
          const next = prev - deltaSec;
          if (next <= 0) {
            setPowerClickActive(false);
            return 0;
          }
          return next;
        });
      }

      // 4. Bubble-Pop Rate-Penalty Timer (+1.5% Burn Rate & -35% VPS für 30s)
      if (bubblePopTimer > 0) {
        setBubblePopTimer((prev) => Math.max(0, prev - deltaSec));
      }

      // 4b. Golden-Meme-Boost auslaufen lassen (10x TPS, nach Ad-Claim gesetzt)
      if (goldenBoostTimer > 0) {
        setGoldenBoostTimer((prev) => Math.max(0, prev - deltaSec));
      }

      // 4c. Bubble-Glitch nach kurzer Schock-Phase beenden (Banner läuft länger weiter)
      if (bubbleGlitchUntil && now >= bubbleGlitchUntil) {
        setBubbleGlitchUntil(0);
      }

      // 5. Aktives Event ablaufen lassen. Ein nicht eingelöstes Golden Meme verfällt
      // ersatzlos - das ist der Preis dafür, dass der Boost jetzt deutlich stärker ist.
      if (activeEvent && now >= activeEvent.expiresAt) {
        if (activeEvent.kind === 'golden' && !activeEvent.claimed) addLog(tf('log_goldenExpired'), 'info');
        setActiveEvent(null);
      }

      // 6.-8.: Zufalls-Events (Golden Meme, Bubble Pop, Black Swan) spawnen NUR, während
      // aktiv im Vordergrund gespielt wird. Läuft der Tab im Hintergrund oder ist das
      // Fenster unfokussiert, würden sich mehrere Events/Ad-Angebote unbemerkt ansammeln
      // und nach der Rückkehr alle auf einmal aufploppen - stattdessen soll währenddessen
      // einfach nur die Produktion (Schritt 1 oben) weiterlaufen, ganz ohne Interaktion.
      const isTabActive = pageActivity === 'active';

      // 6. Golden Meme (~alle 20 Min): spawnt NUR das Angebot. Der 10x-Boost wird
      // ausschließlich über die Rewarded Ad im Banner eingelöst (siehe requestBonus/'golden_claim'),
      // das Banner selbst hat keinerlei Effekt auf die Produktion.
      if (isTabActive && !activeEvent && Math.random() < GOLDEN_CHANCE_PER_200MS * tickScale) {
        const id = GOLDEN_EVENT_IDS[Math.floor(Math.random() * GOLDEN_EVENT_IDS.length)];
        setActiveEvent({ id, kind: 'golden', startedAt: now, expiresAt: now + GOLDEN_OFFER_SEC * 1000 });
        addLog(`${t(`event_${id}_title`)} - ${t(`event_${id}_desc`)}`, 'warning');
      // 7. Bubble Pop (~alle 20 Min): purely a temporary rate hit for 30s - VPS production
      // cut and burn rate spiked. No instant stock loss ("rates only"). Wirkt anders als das
      // Golden Meme sofort und ungefragt - man kann sich nur per Ad davon freikaufen.
      } else if (isTabActive && !activeEvent && Math.random() < BUBBLE_CHANCE_PER_200MS * tickScale) {
        const id = BUBBLE_EVENT_IDS[Math.floor(Math.random() * BUBBLE_EVENT_IDS.length)];
        // Banner läuft synchron mit dem Debuff (statt wie früher nach 4s zu verschwinden,
        // während der Effekt noch 26s weiterlief): so stimmt der Countdown und die
        // "Debuff sofort beenden"-Ad ist überhaupt lange genug erreichbar.
        setActiveEvent({ id, kind: 'bubble', startedAt: now, expiresAt: now + BUBBLE_BURN_DURATION_SEC * 1000 });
        setBubblePopTimer(BUBBLE_BURN_DURATION_SEC);
        setBubbleGlitchUntil(now + BUBBLE_GLITCH_SEC * 1000);
        addLog(`${t(`event_${id}_title`)} - ${t(`event_${id}_desc`)}`, 'danger');
      }

      // 8. Black Swan Events (pro Engine, siehe blackSwanEventsData.js): harte 24h-Sperre pro
      // Engine-Typ (blackSwanNextEligible) + sehr niedrige Tick-Chance obendrauf, damit es
      // "ultra selten" bleibt. Zerstört bei Auslösung lossPct des aktuellen Bestands dieser
      // einen Engine - kein globaler Effekt.
      if (isTabActive) {
        BUILDINGS_DATA.forEach((b) => {
          const owned = buildings[b.id] || 0;
          if (owned <= 0) return;

          const eligibleAt = blackSwanNextEligible[b.id];
          if (eligibleAt === undefined) {
            setBlackSwanNextEligible((prev) => ({ ...prev, [b.id]: now + BLACK_SWAN_COOLDOWN_MS }));
            return;
          }
          if (now < eligibleAt) return;

          if (Math.random() < BLACK_SWAN_CHANCE_PER_200MS * tickScale) {
            const event = BLACK_SWAN_EVENTS_DATA.find((e) => e.buildingId === b.id);
            if (!event) return;
            const lost = Math.max(1, Math.floor(owned * event.lossPct));
            setBuildings((prev) => ({ ...prev, [b.id]: Math.max(0, (prev[b.id] || 0) - lost) }));
            setBlackSwanNextEligible((prev) => ({ ...prev, [b.id]: now + BLACK_SWAN_COOLDOWN_MS }));
            addLog(`${t(`blackswan_${b.id}_title`)} - ${t(`building_${b.id}_name`)}: -${lost} (-${Math.round(event.lossPct * 100)}%). ${t(`blackswan_${b.id}_desc`)}`, 'danger');
          }
        });
      }

      // 9. Achievements prüfen
      ACHIEVEMENTS_DATA.forEach((ach) => {
        if (!unlockedAchievements.includes(ach.id)) {
          const currentState = {
            stats, totalValuation, valuation, buildings, totalBurned,
            pivotCount, boughtBuzzwords, unlockedAchievements, activeEvent,
            boughtUpgrades, boughtGreenwashingLayoffs,
            prestigeLevel, heavenlyChips, idealistLevel, cynicLevel, epoch, vps,
          };
          if (ach.check(currentState)) {
            setUnlockedAchievements((prev) => Array.from(new Set([...prev, ach.id])));
            addLog(`🏆 ACHIEVEMENT UNLOCKED: "${t(`ach_${ach.id}_name`)}"`, 'achievement');
          }
        }
      });

      // 10. Shadow Achievement "Tatsächlich Gewinn gemacht" (0.00015% pro 200ms-Tick)
      if (Math.random() < SHADOW_CHANCE_PER_200MS * tickScale) {
        setStats((prev) => ({ ...prev, shadowLucky: true }));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [vps, burnRate, coolingRate, isOverheated, activeEvent, powerClickSurgeTimer, bubblePopTimer, goldenBoostTimer, bubbleGlitchUntil, unlockedAchievements, stats, totalValuation, totalBurned, pivotCount, buildings, blackSwanNextEligible, boughtBuzzwords, pageActivity, addLog, t, tf]);

  // Dynamic Sticky Upgrade Unlock Logic (Cash-based & Owned Engine requirement)
  // Sticky rule: Once unlocked by reaching current cash threshold, upgrades stay unlocked even if cash drops!
  useEffect(() => {
    const newlyUnlocked = [];

    // Find lowest unbought upgrade per OWNED building
    const lowestUnboughtBuildingUpgrade = new Map();
    UPGRADES_DATA.forEach((up) => {
      if (up.type === 'building' && !boughtUpgrades.includes(up.id)) {
        const ownedCount = buildings[up.buildingId] || 0;
        if (ownedCount >= 1 && !lowestUnboughtBuildingUpgrade.has(up.buildingId)) {
          lowestUnboughtBuildingUpgrade.set(up.buildingId, up);
        }
      }
    });

    UPGRADES_DATA.forEach((up) => {
      if (boughtUpgrades.includes(up.id) || unlockedUpgrades.includes(up.id)) return;

      if (up.type === 'building') {
        const ownedCount = buildings[up.buildingId] || 0;
        if (ownedCount < 1) return; // STRICT: Must own engine!

        const nextUp = lowestUnboughtBuildingUpgrade.get(up.buildingId);
        if (!nextUp || nextUp.id !== up.id) return;

        const reqCount = up.req?.buildingCount?.count || 1;
        // Unlock when CURRENT CASH 'valuation' reaches 30% of cost or building count is met
        if (valuation >= up.cost * 0.3 || ownedCount >= reqCount) {
          newlyUnlocked.push(up.id);
        }
      } else {
        // Misc Upgrades (Click, Syndicate, Global)
        const targetCost = up.cost || up.req?.totalValuation || 100;
        if (valuation >= targetCost * 0.3) {
          newlyUnlocked.push(up.id);
        }
      }
    });

    if (newlyUnlocked.length > 0) {
      setUnlockedUpgrades((prev) => [...new Set([...prev, ...newlyUnlocked])]);
    }
  }, [valuation, buildings, boughtUpgrades, unlockedUpgrades]);

  // --- ACTIONS ---

  // Click AGI Button
  const handleTapAGI = useCallback((e) => {
    if (isOverheated) {
      return;
    }

    tapFeedback();
    // ATT-Erklärbildschirm an der ersten "sinnvollen Interaktion" statt beim Kaltstart (siehe
    // docs/ios-app-konzept.md §6) - NICHT direkt der System-Prompt, siehe
    // TrackingExplainerModal/confirmTrackingExplainer oben. attCheckedRef sorgt dafür, dass
    // der native Status-Check nur einmal pro Sitzung läuft, unabhängig davon, wie oft
    // getappt wird; adFree-Käufer:innen (kein Ad-SDK, keine Tracking-Notwendigkeit) bekommen
    // den Check gar nicht erst zu Gesicht.
    if (!adFree && !attCheckedRef.current) {
      attCheckedRef.current = true;
      getTrackingStatus()
        .then((status) => {
          if (status === 'notDetermined') setTrackingExplainer(true);
        })
        .catch((err) => console.error('ATT status check failed:', err));
    }

    const earned = clickValue;
    setValuation((prev) => prev + earned);
    setTotalValuation((prev) => prev + earned);
    setSlopCount((prev) => prev + 1);

    setGpuTemp((prev) => {
      const next = prev + 2.0;
      if (next >= 100.0) {
        setIsOverheated(true);
        setStats((s) => ({ ...s, overheatCount: s.overheatCount + 1 }));
        addLog(tf('log_gpuOverheated'), 'danger');
        return 100.0;
      }
      return next;
    });

    setStats((s) => ({ ...s, totalClicks: s.totalClicks + 1 }));

    if (e && e.clientX && e.clientY) {
      const id = Date.now() + Math.random();
      setParticles((prev) => [
        ...prev.slice(-15),
        { id, x: e.clientX, y: e.clientY, text: `+$${Math.floor(earned)}` },
      ]);
    }
  }, [isOverheated, clickValue, addLog, tf, adFree]);

  // Buy Building
  const buyBuilding = useCallback((buildingId) => {
    const b = BUILDINGS_DATA.find((item) => item.id === buildingId);
    if (!b) return;

    const currentCount = buildings[buildingId] || 0;

    let targetCount = 1;
    let cost = 0;

    if (buyMode === '1') {
      targetCount = 1;
      cost = getBuildingCost(b.baseCost, currentCount);
    } else if (buyMode === '10') {
      targetCount = 10;
      cost = getBuildingBulkCost(b.baseCost, currentCount, 10);
    } else if (buyMode === '100') {
      targetCount = 100;
      cost = getBuildingBulkCost(b.baseCost, currentCount, 100);
    } else if (buyMode === 'MAX') {
      const res = getMaxAffordableBuildings(b.baseCost, currentCount, valuation);
      targetCount = res.count;
      cost = res.totalCost;
    }

    if (targetCount <= 0 || valuation < cost) {
      addLog(tf('log_notEnoughForBuilding', { name: t(`building_${b.id}_name`) }), 'danger');
      return;
    }

    setValuation((prev) => prev - cost);
    setBuildings((prev) => ({
      ...prev,
      [buildingId]: (prev[buildingId] || 0) + targetCount,
    }));

    addLog(tf('log_purchasedBuilding', { count: targetCount, name: t(`building_${b.id}_name`), cost: cost.toLocaleString() }), 'success');
  }, [buildings, buyMode, valuation, addLog, t, tf]);

  // Buy Upgrade
  const buyUpgrade = useCallback((upgradeId) => {
    const up = UPGRADES_DATA.find((item) => item.id === upgradeId);
    if (!up || boughtUpgrades.includes(upgradeId)) return;

    if (valuation < up.cost) {
      addLog(tf('log_notEnoughForUpgrade'), 'danger');
      return;
    }

    setValuation((prev) => prev - up.cost);
    setBoughtUpgrades((prev) => [...prev, upgradeId]);

    if (up.type === 'global' && up.effect.type === 'coolingRate') {
      setCoolingRate(up.effect.value);
    }

    const name = up.type === 'building' ? t(`upgrade_${up.id}_name`) : t(`miscup_${up.id}_name`);
    addLog(tf('log_purchasedUpgrade', { name }), 'success');
  }, [boughtUpgrades, valuation, addLog, t, tf]);

  // Native "BUY ALL" Upgrades Button — only from the same eligible set the tile grid shows
  // (must own >=1 of the building etc.), so this can never buy an upgrade the UI hides.
  const buyAllUpgrades = useCallback(() => {
    let currentMoney = valuation;
    const eligible = getAvailableUpgrades(buildings, boughtUpgrades, valuation, totalValuation);
    const affordable = eligible.filter((up) => currentMoney >= up.cost);

    if (affordable.length === 0) {
      addLog(tf('log_noUpgradesToBuy'), 'info');
      return;
    }

    let spent = 0;
    const newBought = [...boughtUpgrades];

    affordable.forEach((up) => {
      if (currentMoney >= up.cost) {
        currentMoney -= up.cost;
        spent += up.cost;
        newBought.push(up.id);
        if (up.type === 'global' && up.effect.type === 'coolingRate') {
          setCoolingRate(up.effect.value);
        }
      }
    });

    setValuation(currentMoney);
    setBoughtUpgrades(newBought);
    addLog(tf('log_buyAllExecuted', { count: newBought.length - boughtUpgrades.length, cost: spent.toLocaleString() }), 'success');
  }, [boughtUpgrades, valuation, totalValuation, buildings, addLog, tf]);

  // Dismiss the currently active event banner (purely informational - effects already auto-applied on spawn)
  const dismissEvent = useCallback(() => {
    setActiveEvent(null);
  }, []);

  // Toggle Power Click
  const togglePowerClick = useCallback(() => {
    if (powerClicks <= 0) {
      addLog(tf('log_noPowerClicks'), 'info');
      return;
    }
    setPowerClicks((prev) => prev - 1);
    setPowerClickActive(true);
    setPowerClickSurgeTimer(20);
    addLog(tf('log_powerClickActivated'), 'success');
  }, [powerClicks, addLog, tf]);

  // Ist dieser Ad-Placement-Typ gerade nutzbar (kein aktiver Cooldown)?
  const isAdReady = useCallback((type) => Date.now() >= (adCooldowns[type] || 0), [adCooldowns]);

  // Verbleibende Cooldown-Sekunden für UI-Countdowns
  const getAdCooldownRemaining = useCallback((type) => {
    return Math.max(0, Math.ceil(((adCooldowns[type] || 0) - Date.now()) / 1000));
  }, [adCooldowns]);

  // Reward-Vorschauwerte, die schon VOR dem Ansehen im Popup/Button genannt werden -
  // dieselbe Formel wird unten bei der tatsächlichen Gutschrift verwendet.
  const grantAdPreview = useMemo(() => Math.max(500, vps * 100), [vps]);
  const scheduledAdPreview = useMemo(() => Math.max(250, vps * 60), [vps]);

  // Zahlt die eigentliche Belohnung für einen Placement-Typ aus. Geteilt zwischen dem
  // Ad-Pfad (nach erfolgreicher Rewarded Ad) und dem Werbefrei-Direktclaim-Pfad in
  // requestBonus, damit die Auszahlungslogik nur an einer Stelle steht.
  const grantReward = useCallback((type) => {
    if (type === 'nitrogen') {
      setGpuTemp(0);
      setIsOverheated(false);
      const msg = tf('log_bonusNitrogen');
      addLog(msg, 'success');
      flashAdReward(msg);
    } else if (type === 'grant') {
      const reward = grantAdPreview;
      setValuation((prev) => prev + reward);
      setTotalValuation((prev) => prev + reward);
      const msg = tf('log_bonusGrant', { amount: Math.floor(reward).toLocaleString() });
      addLog(msg, 'success');
      flashAdReward(msg);
    } else if (type === 'power_click') {
      setPowerClicks((prev) => prev + 1);
      const msg = tf('log_bonusPowerClick');
      addLog(msg, 'success');
      flashAdReward(msg);
    } else if (type === 'ascend_boost') {
      setPendingAscendBoost(true);
      const msg = tf('log_bonusAscendBoost');
      addLog(msg, 'success');
      flashAdReward(msg);
    } else if (type === 'pivot_boost') {
      setPendingPivotBoost(true);
      const msg = tf('log_bonusPivotBoost');
      addLog(msg, 'success');
      flashAdReward(msg);
    } else if (type === 'golden_claim') {
      // Einziger Weg an den Boost: 10x TPS für 30s scharf schalten. Das Banner bleibt als
      // "claimed" stehen und läuft synchron mit dem Boost aus, damit der laufende Effekt
      // sichtbar ist statt kommentarlos im Hintergrund zu ticken.
      setActiveEvent((prev) => (
        prev && prev.kind === 'golden'
          ? { ...prev, claimed: true, startedAt: Date.now(), expiresAt: Date.now() + GOLDEN_BOOST_SEC * 1000 }
          : prev
      ));
      setGoldenBoostTimer(GOLDEN_BOOST_SEC);
      setStats((s) => ({ ...s, goldenCaught: (s.goldenCaught || 0) + 1 }));
      // Kein flashAdReward: der Toast sitzt an derselben Position wie das Banner und würde
      // es überdecken - das Banner zeigt den laufenden Boost ohnehin selbst an.
      addLog(tf('log_bonusGoldenClaim', { mult: GOLDEN_BOOST_MULT, sec: GOLDEN_BOOST_SEC }), 'success');
    } else if (type === 'bubble_clear') {
      setActiveEvent((prev) => (prev && prev.kind === 'bubble' ? null : prev));
      setBubblePopTimer(0);
      setBubbleGlitchUntil(0);
      const msg = tf('log_bonusBubbleClear');
      addLog(msg, 'success');
      flashAdReward(msg);
    }
  }, [grantAdPreview, addLog, flashAdReward, tf]);

  // Fordert einen Ad-Placement-Bonus an. Ohne adFree läuft das über die AdBridge (Web:
  // Fake-Timer, iOS: AdMob Rewarded); mit adFree wird sofort ausgezahlt, ohne jedes Ad-SDK
  // anzufassen (siehe docs/ios-app-konzept.md §3.2/§4). `onComplete` lässt Aufrufer eigene
  // Belohnungslogik anhängen (z.B. Booster-Pack-Reveal), die nicht generisch genug für
  // grantReward() ist.
  //
  // Fehlgeschlagene Ad: siehe GRANT_ON_AD_FAILURE oben - nur das Golden Meme zahlt trotzdem
  // aus, alles andere ist ohne Cooldown sofort erneut versuchbar. `onFailed` lässt Aufrufer
  // einen verworfenen Einmal-Zustand wiederherstellen (z.B. den Scheduled-Bonus wieder
  // einlösbar machen, statt ihn an einem Ladefehler verpuffen zu lassen).
  const requestBonus = useCallback((type, onComplete, onFailed) => {
    if (adState) return; // schon eine Ad/ein Claim am Laufen
    if (Date.now() < (adCooldowns[type] || 0)) {
      addLog(tf('log_adOnCooldown'), 'info');
      return;
    }

    const finish = (rewarded, wasAdFree) => {
      setAdState(null);

      if (!rewarded && !wasAdFree && !GRANT_ON_AD_FAILURE.has(type)) {
        // Kein Cooldown setzen: der Fehlversuch war nicht die Schuld der Spielenden, ein
        // sofortiger zweiter Versuch muss möglich bleiben.
        addLog(tf('log_adFailedRetry'), 'info');
        if (onFailed) onFailed();
        return;
      }

      if (!wasAdFree) {
        if (rewarded) {
          setStats((s) => ({ ...s, adsWatched: (s.adsWatched || 0) + 1 }));
        } else {
          addLog(tf('log_adFailedGranted'), 'info');
        }
      }

      const cooldownSec = AD_COOLDOWN_SEC[type] ?? 60;
      if (cooldownSec > 0) {
        setAdCooldowns((prev) => ({ ...prev, [type]: Date.now() + cooldownSec * 1000 }));
      }

      grantReward(type);
      if (onComplete) onComplete();
    };

    if (adFree) {
      finish(true, true);
      return;
    }

    setAdState({ type, timer: 3 });
    addLog(tf('log_watchingAd'), 'info');
    adBridge
      .present(type, (secondsLeft) => setAdState({ type, timer: Math.max(0, secondsLeft) }))
      .then((result) => finish(result === 'rewarded', false))
      // Ohne catch bliebe adState bei einem rejecteten Promise für immer gesetzt und der
      // Guard ganz oben (`if (adState) return`) würde JEDEN weiteren Bonus-Button sperren.
      .catch((e) => {
        console.error('Ad bridge threw:', e);
        finish(false, false);
      });
  }, [addLog, adState, adCooldowns, adFree, adBridge, grantReward, tf]);

  // Offline-Ertrag (>= 30min Abwesenheit, siehe Mount-Effect oben) per Ad claimen - exakt
  // dieselbe alles-oder-nichts-Logik wie beim AFK-Report unten, kein Verdopplungs-Bonus
  // mehr: die Ad ist die Voraussetzung, um überhaupt etwas zu bekommen, kein Multiplikator
  // auf einen ohnehin schon kostenlos verfügbaren Betrag.
  const claimOfflineEarnings = useCallback(() => {
    if (!offlineReport) return;
    const amount = offlineReport.amount;
    setValuation((prev) => prev + amount);
    setTotalValuation((prev) => prev + amount);
    setOfflineReport(null);
    const msg = tf('log_offlineEarningsClaimed', { amount: Math.floor(amount).toLocaleString() });
    addLog(msg, 'success');
    flashAdReward(msg);
  }, [offlineReport, addLog, flashAdReward, tf]);

  // Verzicht auf einen >= 30min-Offline-Ertrag: verfällt ersatzlos, wie dismissAfkReport
  // unten - kein "wegklicken und trotzdem behalten".
  const dismissOfflineEarnings = useCallback(() => {
    if (offlineReport) {
      addLog(tf('log_offlineEarningsForfeited', { amount: Math.floor(offlineReport.amount).toLocaleString() }), 'info');
    }
    setOfflineReport(null);
  }, [offlineReport, addLog, tf]);

  // AFK-Report: der während der >=30min-Abwesenheit erzeugte Wert wurde NICHT live
  // gutgeschrieben (siehe pageActivity 'hidden' im Tick-Loop) und ist bis hierhin rein
  // PENDING. Verzicht verwirft ihn ersatzlos - kein "Popup wegklicken, Geld trotzdem
  // behalten" mehr.
  const dismissAfkReport = useCallback(() => {
    if (afkReport) {
      addLog(tf('log_afkBonusForfeited', { amount: Math.floor(afkReport.amount).toLocaleString() }), 'info');
    }
    setAfkReport(null);
  }, [afkReport, addLog, tf]);

  const claimAfkBonus = useCallback(() => {
    if (!afkReport) return;
    setValuation((prev) => prev + afkReport.amount);
    setTotalValuation((prev) => prev + afkReport.amount);
    const msg = tf('log_afkBonusClaimed', { amount: Math.floor(afkReport.amount).toLocaleString() });
    addLog(msg, 'success');
    flashAdReward(msg);
    setAfkReport(null);
  }, [afkReport, addLog, flashAdReward, tf]);

  // Geplantes Ad-Popup (Punkt 9): jetzt ansehen (sofortige Belohnung) oder auf später
  // verschieben (Button erscheint im Menü, keine feste Verfallszeit).
  const watchScheduledAdNow = useCallback(() => {
    setPendingScheduledAd(false);
    requestBonus('scheduled_bonus', () => {
      const reward = scheduledAdPreview;
      setValuation((prev) => prev + reward);
      setTotalValuation((prev) => prev + reward);
      const msg = tf('log_scheduledAdRedeemed', { amount: Math.floor(reward).toLocaleString() });
      addLog(msg, 'success');
      flashAdReward(msg);
    // Ad fehlgeschlagen: das Popup ist schon zu, der Bonus wäre sonst weg. Stattdessen in
    // den "später einlösen"-Zustand überführen - dieselbe Behandlung wie bei "Später".
    }, () => setScheduledAdUnlocked(true));
  }, [scheduledAdPreview, addLog, requestBonus, flashAdReward, tf]);

  const deferScheduledAd = useCallback(() => {
    setPendingScheduledAd(false);
    setScheduledAdUnlocked(true);
  }, []);

  const claimUnlockedScheduledAd = useCallback(() => {
    setScheduledAdUnlocked(false);
    requestBonus('scheduled_bonus', () => {
      const reward = scheduledAdPreview;
      setValuation((prev) => prev + reward);
      setTotalValuation((prev) => prev + reward);
      const msg = tf('log_scheduledAdRedeemed', { amount: Math.floor(reward).toLocaleString() });
      addLog(msg, 'success');
      flashAdReward(msg);
    // Ad fehlgeschlagen: Button zurückholen statt den Bonus verfallen zu lassen.
    }, () => setScheduledAdUnlocked(true));
  }, [scheduledAdPreview, addLog, requestBonus, flashAdReward, tf]);

  // Chips, die eine Ascension JETZT bringen würde (ohne Ad-Boost) - von SpecialTab fürs
  // Anzeigen/Deaktivieren des Buttons genutzt, damit die Formel nur an einer Stelle steht.
  const pendingHeavenlyChips = useMemo(() => {
    return Math.floor(Math.sqrt(Math.max(0, totalValuation) / ASCEND_CHIP_DIVISOR));
  }, [totalValuation]);

  // Singularity Ascension (Token-Furnace Prestige Reset - bleibt zusätzlich zu Pivot bestehen)
  const ascend = useCallback(() => {
    const earnedChips = pendingAscendBoost ? Math.floor(pendingHeavenlyChips * 1.2) : pendingHeavenlyChips;
    // STRICT: muss tatsächlich >=1 Heavenly Chip verdient haben - sonst konnte man nach dem
    // ersten Ascend (prestigeLevel > 0) den Button beliebig oft drücken und pro Klick +1
    // Prestige (=permanenter VPS-Bonus) geschenkt bekommen, ohne neue Lifetime-Valuation
    // dafür erwirtschaftet zu haben (Exploit + unbegrenzter Zinseszins-Effekt).
    if (earnedChips <= 0) {
      addLog(tf('log_notEnoughForAscend'), 'warning');
      return;
    }

    if (totalValuation >= 1000000000000) {
      setStats((s) => ({ ...s, ascendTrillion: true }));
    }

    setPrestigeLevel((prev) => prev + earnedChips);
    setHeavenlyChips((prev) => prev + earnedChips);
    setStats((s) => ({ ...s, ascensionCount: s.ascensionCount + 1 }));

    setValuation(0);
    setBuildings(INITIAL_BUILDINGS);
    setBlackSwanNextEligible({});
    setBoughtUpgrades([]);
    setUnlockedUpgrades([]);
    setGpuTemp(0);
    setIsOverheated(false);

    if (pendingAscendBoost) setPendingAscendBoost(false);

    addLog(tf('log_ascendExecuted', { chips: earnedChips }) + (pendingAscendBoost ? ` ${tf('log_adBonusSuffix')}` : ''), 'achievement');
  }, [totalValuation, addLog, pendingAscendBoost, pendingHeavenlyChips, tf]);

  // Pivot is a milestone, not a reset: Engines, Upgrades and Valuation all stay. Credibility
  // is earned on lifetime valuation GAINED SINCE THE LAST PIVOT.
  // War Divisor 1e6 mit keiner Mindestschwelle - bei exponentiellem Valuation-Wachstum ließ
  // sich das schon nach kurzer Zeit wieder erreichen, Epochen rotierten praktisch im
  // Minutentakt durch. Divisor 10x höher + Mindestgewinn von 5 Credibility, damit ein Pivot
  // echten Fortschritt seit dem letzten Pivot voraussetzt statt nur ">0".
  const MIN_PIVOT_CRED_GAIN = 5;
  const pivotCredGain = useMemo(() => {
    const base = Math.floor(Math.sqrt(Math.max(0, totalValuation - valuationAtLastPivot) / 10000000));
    return pendingPivotBoost ? Math.floor(base * 1.2) : base;
  }, [totalValuation, valuationAtLastPivot, pendingPivotBoost]);

  const pivot = useCallback(() => {
    if (pivotCredGain < MIN_PIVOT_CRED_GAIN) {
      addLog(tf('log_notEnoughForPivot', { min: MIN_PIVOT_CRED_GAIN }), 'warning');
      return;
    }
    const nextEpoch = (epoch + 1) % EPOCHS.length;
    // Alter Credibility-Kontostand verpufft mit dem Pivot - nur der frisch verdiente
    // pivotCredGain bleibt als neues Startkapital für den (ebenfalls zurückgesetzten) Baum.
    // Verhindert, dass Idealist/Cynic-Baum über beliebig viele Pivots hinweg permanent
    // weiterwächst, statt bei jeder Epoche neu erkämpft werden zu müssen.
    setCredibility(pivotCredGain);
    setIdealistLevel(0);
    setCynicLevel(0);
    setEpoch(nextEpoch);
    setPivotCount((prev) => prev + 1);
    setValuationAtLastPivot(totalValuation);
    if (pendingPivotBoost) setPendingPivotBoost(false);

    addLog(tf('log_pivotExecuted', { epoch: t(`epoch_${EPOCHS[nextEpoch].id}_name`), cred: pivotCredGain }) + (pendingPivotBoost ? ` ${tf('log_adBonusSuffix')}` : ''), 'achievement');
  }, [pivotCredGain, totalValuation, epoch, addLog, pendingPivotBoost, t, tf]);

  // Buy Buzzword Card Directly
  const buyBuzzword = useCallback((buzzId) => {
    const bw = BUZZWORDS_DATA.find((item) => item.id === buzzId);
    if (!bw || boughtBuzzwords.includes(buzzId)) return false;

    if (valuation < bw.cost) {
      addLog(tf('log_notEnoughForBuzzword', { name: bw.name }), 'danger');
      return false;
    }

    setValuation((prev) => prev - bw.cost);
    setBoughtBuzzwords((prev) => [...prev, buzzId]);
    addLog(tf('log_buzzwordAdded', { name: bw.name, pct: Math.round(bw.bonus * 100) }), 'success');
    return true;
  }, [boughtBuzzwords, valuation, addLog, tf]);

  // Buy Trading Card Booster Pack. Cost is deducted AND the card is committed to
  // boughtBuzzwords in the same call, so autosave/unmount between purchase and the
  // reveal animation's confirm click can never charge the player without granting a card.


  // Buy Trading Card Booster Pack (Deducts cost & returns random uncollected card)
  const buyBoosterPack = useCallback(() => {
    const uncollected = BUZZWORDS_DATA.filter((bw) => !boughtBuzzwords.includes(bw.id));
    if (uncollected.length === 0) {
      addLog(tf('log_albumComplete'), 'info');
      return null;
    }

    // Pack price increases with each collected card
    const packCost = Math.floor(600 * Math.pow(1.20, boughtBuzzwords.length));

    if (valuation < packCost) {
      addLog(tf('log_notEnoughForBoosterPack', { cost: packCost.toLocaleString() }), 'danger');
      return null;
    }

    // Random uncollected card selection (duplication protection!)
    const randomIndex = Math.floor(Math.random() * uncollected.length);
    const pulledCard = uncollected[randomIndex];

    setValuation((prev) => prev - packCost);

    return pulledCard;
  }, [boughtBuzzwords, valuation, addLog, tf]);

  // Add Pulled Card to Album
  const addCardToAlbum = useCallback((cardId) => {
    if (!cardId || boughtBuzzwords.includes(cardId)) return;
    const bw = BUZZWORDS_DATA.find((item) => item.id === cardId);
    setBoughtBuzzwords((prev) => [...prev, cardId]);
    if (bw) {
      addLog(tf('log_buzzwordSorted', { name: bw.name, pct: Math.round(bw.bonus * 100) }), 'achievement');
    }
  }, [boughtBuzzwords, addLog, tf]);

  // Buy Corporate Greenwashing & Layoff Action
  const buyGreenwashingLayoff = useCallback((itemId) => {
    const item = GREENWASHING_LAYOFFS_DATA.find((g) => g.id === itemId);
    if (!item || boughtGreenwashingLayoffs.includes(itemId)) return;

    const b = BUILDINGS_DATA.find((itemB) => itemB.id === item.buildingId);
    const baseCost = b ? b.baseCost : 15;
    const cost = getCorporateActionCost(item, baseCost, boughtGreenwashingLayoffs.length);

    if (valuation < cost) {
      addLog(tf('log_notEnoughForAction'), 'danger');
      return;
    }

    setValuation((prev) => prev - cost);
    setBoughtGreenwashingLayoffs((prev) => [...prev, itemId]);
    addLog(tf('log_executedAction', { name: t(`gw_${itemId}_name`) }), 'success');
  }, [boughtGreenwashingLayoffs, valuation, addLog, t, tf]);

  // Buy Idealist Path Level
  const buyIdealistLevel = useCallback(() => {
    if (idealistLevel >= 15) return;
    const nextNode = IDEALIST_PATH[idealistLevel];
    const cost = Math.pow(CREDIBILITY_LEVEL_COST_BASE, idealistLevel);

    if (credibility < cost) {
      addLog(tf('log_notEnoughForIdealist', { level: idealistLevel + 1 }), 'danger');
      return;
    }

    setCredibility((prev) => prev - cost);
    setIdealistLevel((prev) => prev + 1);
    addLog(tf('log_unlockedIdealistNode', { name: t(`idealist_${nextNode.level}_name`) }), 'success');
  }, [idealistLevel, credibility, addLog, t, tf]);

  // Buy Cynic Path Level
  const buyCynicLevel = useCallback(() => {
    if (cynicLevel >= 15) return;
    const nextNode = CYNIC_PATH[cynicLevel];
    const cost = Math.pow(CREDIBILITY_LEVEL_COST_BASE, cynicLevel);

    if (credibility < cost) {
      addLog(tf('log_notEnoughForCynic', { level: cynicLevel + 1 }), 'danger');
      return;
    }

    setCredibility((prev) => prev - cost);
    setCynicLevel((prev) => prev + 1);
    addLog(tf('log_unlockedCynicNode', { name: t(`cynic_${nextNode.level}_name`) }), 'success');
  }, [cynicLevel, credibility, addLog, t, tf]);

  // Theme Mode (SEC Prospectus vs Cyberpunk) - explizite Nutzer-Entscheidung, wird gespeichert
  const toggleThemeMode = useCallback(() => {
    setThemeMode((prev) => (prev === 'sec_prospectus' ? 'cyberpunk' : 'sec_prospectus'));
  }, []);

  // Buy Heavenly Upgrade
  const buyHeavenlyUpgrade = useCallback((upgradeId) => {
    const up = HEAVENLY_UPGRADES_DATA.find((item) => item.id === upgradeId);
    if (!up || boughtHeavenlyUpgrades.includes(upgradeId)) return;

    if (heavenlyChips < up.chipsCost) {
      addLog(tf('log_notEnoughForHeavenly', { name: t(`heavenly_${up.id}_name`) }), 'danger');
      return;
    }

    setHeavenlyChips((prev) => prev - up.chipsCost);
    setBoughtHeavenlyUpgrades((prev) => [...prev, upgradeId]);
    addLog(tf('log_purchasedHeavenly', { name: t(`heavenly_${up.id}_name`) }), 'success');
  }, [boughtHeavenlyUpgrades, heavenlyChips, addLog, t, tf]);

  const hasAiDomainBonus = useMemo(() => {
    return (startupName || '').trim().toLowerCase().endsWith('.ai');
  }, [startupName]);

  // Wipe Save Data
  const resetSave = useCallback(() => {
    removeStorageItem(STORAGE_KEY);
    setStartupName('tokenkamin');
    setValuation(0);
    setTotalValuation(0);
    setTotalBurned(0);
    setSlopCount(0);
    setGpuTemp(0);
    setIsOverheated(false);
    setBuildings(INITIAL_BUILDINGS);
    setBlackSwanNextEligible({});
    setBoughtUpgrades([]);
    setUnlockedUpgrades([]);
    setBoughtHeavenlyUpgrades([]);
    setUnlockedAchievements([]);
    setPrestigeLevel(0);
    setHeavenlyChips(0);
    setBoughtBuzzwords([]);
    setBoughtGreenwashingLayoffs([]);
    setEpoch(2);
    setIdealistLevel(0);
    setCynicLevel(0);
    setCredibility(0);
    setPivotCount(0);
    setStats({
      totalClicks: 0, adsWatched: 0, goldenCaught: 0,
      overheatCount: 0, ascensionCount: 0, gpuBounced: false,
      ascendTrillion: false, shadowLucky: false,
    });
    // Diese vier wurden beim Wipe bisher übersehen, obwohl sie mitgespeichert werden:
    // der Spielstand war danach nicht wirklich leer, sondern behielt die erspielte
    // Kühlrate, die Power-Clicks und den Pivot-Referenzwert - und schrieb sie beim
    // nächsten Autosave (8s später) direkt wieder in den localStorage zurück.
    setCoolingRate(4.0);
    setPowerClicks(0);
    setValuationAtLastPivot(0);
    setScheduledAdUnlocked(false);
    setAdCooldowns({});
    setOfflineReport(null);
    setPendingAscendBoost(false);
    setPendingPivotBoost(false);
    // Vollständiger Wipe statt nur Fortschritt: "Spielstand löschen" setzt jetzt auch die
    // Einstellungen zurück, die vorher bewusst als "kein Fortschritt" verschont blieben.
    // addLog() unten läuft noch mit der ALTEN Sprache (React-State-Updates sind async,
    // die tf()-Closure sieht in dieser Funktion noch den bisherigen lang-Wert) - die
    // Bestätigung erscheint also einmalig in der Sprache, die gerade aktiv war, bevor
    // die Oberfläche direkt danach auf Deutsch zurückspringt.
    setLang('de');
    setThemeMode('cyberpunk');
    setFancyGraphics(true);
    addLog(tf('log_saveWiped'), 'danger');
  }, [addLog, tf]);

  // Export Save Data: erzwingt erst einen frischen saveGame()-Schreibvorgang (der letzte
  // Autosave-Tick kann bis zu 8s alt sein), liest danach exakt das, was auch beim nächsten
  // Laden gelesen würde, statt eine zweite, potenziell abweichende Kopie des Save-Objekts
  // zu bauen.
  const exportSave = useCallback(async () => {
    saveGame();
    const raw = await getStorageItem(STORAGE_KEY);
    if (!raw) return;
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `token-furnace-save-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    addLog(tf('log_exportSuccess'), 'info');
  }, [saveGame, addLog, tf]);

  // Import Save Data: läuft durch dieselbe migrateSave()/applyLoadedState()-Pipeline wie das
  // Laden beim Mount und der Cross-Tab-Resync (siehe dort) - eine manipulierte oder von einer
  // uralten Version stammende Datei darf das Spiel nicht in einen NaN-/Crash-Zustand bringen.
  const importSave = useCallback(async (jsonString) => {
    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      parsed = null;
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      addLog(tf('log_importFailed'), 'danger');
      return false;
    }
    const data = migrateSave(parsed);
    await setStorageItem(STORAGE_KEY, JSON.stringify(data));
    applyLoadedState(data);
    addLog(tf('log_importSuccess'), 'success');
    return true;
  }, [addLog, tf, applyLoadedState]);

  return {
    lang, setLang, t, tf,
    startupName, setStartupName, hasAiDomainBonus,
    valuation, totalValuation, totalBurned, slopCount,
    gpuTemp, isOverheated, coolingRate,
    powerClicks, powerClickActive, powerClickSurgeTimer, togglePowerClick,
    prestigeLevel, heavenlyChips, ascend, pendingHeavenlyChips, buyHeavenlyUpgrade, boughtHeavenlyUpgrades,
    buildings, buyBuilding, buyMode, setBuyMode,
    boughtUpgrades, unlockedUpgrades, buyUpgrade, buyAllUpgrades,
    unlockedAchievements,
    activeEvent, dismissEvent, bubbleGlitchUntil,
    adState, requestBonus, isAdReady, getAdCooldownRemaining,
    adRewardToast, dismissAdRewardToast, grantAdPreview, scheduledAdPreview,
    adFree, adFreeProduct, purchaseState, purchaseAvailable: purchaseBridge.isAvailable, purchaseAdFree, restorePurchases,
    trackingExplainer, confirmTrackingExplainer, showAdPrivacyOptions,
    offlineReport, claimOfflineEarnings, dismissOfflineEarnings,
    pageActivity, afkReport, dismissAfkReport, claimAfkBonus,
    pendingScheduledAd, watchScheduledAdNow, deferScheduledAd,
    scheduledAdUnlocked, claimUnlockedScheduledAd,
    pendingAscendBoost, pendingPivotBoost,
    stats, logs,
    fancyGraphics, setFancyGraphics,
    activeTab, setActiveTab,
    vps, grossVps, netFlow, clickValue, handleTapAGI,
    resetSave, exportSave, importSave, particles,

    // Investor Ledger & Hype Features
    themeMode, toggleThemeMode,
    hypeTier, burnRate,
    boughtBuzzwords, buyBuzzword, buyBoosterPack, addCardToAlbum,
    boughtGreenwashingLayoffs, buyGreenwashingLayoff,
    epoch, idealistLevel, buyIdealistLevel, cynicLevel, buyCynicLevel, credibility, pivotCount, pivot, pivotCredGain,
  };
}
