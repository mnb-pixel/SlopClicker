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

const STORAGE_KEY = 'SLOP_CLICKER_GAME_SAVE_V1';

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
  offline_double: 0,
  scheduled_bonus: 0,
};

// Offline-Ertrag (Browser komplett geschlossen, nicht nur Tab im Hintergrund - dafür siehe
// pageActivity 'hidden' oben): gutgeschrieben ab 1 Minute Abwesenheit, gedeckelt auf 4h,
// zu 20% der zuletzt bekannten VPS.
const OFFLINE_MIN_SECONDS = 60;
const OFFLINE_CAP_SECONDS = 4 * 3600;
const OFFLINE_EFFICIENCY = 0.2;

// Singularity Ascension: Chips = sqrt(totalValuation / Divisor). War vorher 1e9 (der erste
// Chip brauchte $1 Mrd. Lifetime-Valuation - bei den exponentiellen Gebäudekosten praktisch
// unerreichbar, fühlte sich also wie "kaputt" an). Auf 1e7 gesenkt: erster Chip ab $10M.
const ASCEND_CHIP_DIVISOR = 10000000;

// Geplante Ad-Popups (Punkt 9): feste Zeitpunkte seit App-Start, an denen ein Popup eine
// Rewarded Ad anbietet.
const SCHEDULED_AD_MINUTES = [5, 15, 30, 60, 120];

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

  // Tab-Aktivität: 'active' (Tab sichtbar & fokussiert) = 100% Rate, 'inactive' (Tab sichtbar,
  // aber Fenster/Browser nicht fokussiert) und 'hidden' (Tab im Hintergrund/minimiert) = 50%.
  // 'hidden' wird zusätzlich NICHT live gutgeschrieben, siehe Tick-Loop weiter unten.
  const [pageActivity, setPageActivity] = useState('active');
  const [afkReport, setAfkReport] = useState(null); // { amount } | null - nach >=30min Abwesenheit bei offenem Tab, PENDING bis Ad/Verzicht
  const hiddenSinceRef = useRef(null);
  const awayEarnedRef = useRef(0);

  // Bei "später" wird statt einer harten Zeitgrenze ein Button im Menü freigeschaltet.
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
      vps: vpsRef.current, // für Offline-Ertrag-Berechnung beim nächsten Laden
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    } catch (e) {
      console.error('Failed to save game state:', e);
    }
  }, [
    lang, startupName, valuation, totalValuation, totalBurned, slopCount, gpuTemp, isOverheated,
    coolingRate, powerClicks, prestigeLevel, heavenlyChips, themeMode, boughtBuzzwords,
    boughtGreenwashingLayoffs, epoch, idealistLevel, cynicLevel, credibility, pivotCount,
    valuationAtLastPivot, buildings, blackSwanNextEligible,
    boughtUpgrades, unlockedUpgrades, boughtHeavenlyUpgrades, unlockedAchievements, stats,
    fancyGraphics
  ]);

  // Load state on mount
  useEffect(() => {
    // Sprache wird synchron aus dem Save aufgelöst (statt über t()/tf(), die erst nach dem
    // nächsten Render den frisch gesetzten lang-State sehen würden), damit der allererste
    // Log-Eintrag direkt in der tatsächlich aktiven Sprache erscheint statt immer in 'de'.
    let resolvedLang = 'de';
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data) {
          resolvedLang = ['de', 'en'].includes(data.lang) ? data.lang : 'de';
          setLang(resolvedLang);
          setStartupName(data.startupName || 'tokenkamin');
          setValuation(data.valuation || 0);
          setTotalValuation(data.totalValuation || 0);
          setTotalBurned(data.totalBurned || 0);
          setSlopCount(data.slopCount || 0);
          setGpuTemp(data.gpuTemp || 0);
          setIsOverheated(data.isOverheated || false);
          setCoolingRate(data.coolingRate || 4.0);
          setPowerClicks(data.powerClicks || 0);
          setPrestigeLevel(data.prestigeLevel || 0);
          setHeavenlyChips(data.heavenlyChips || 0);
          setThemeMode(data.themeMode || 'modern_slop');
          setBoughtBuzzwords(data.boughtBuzzwords || []);
          setBoughtGreenwashingLayoffs(data.boughtGreenwashingLayoffs || []);
          setEpoch(data.epoch !== undefined ? data.epoch : 2);
          setIdealistLevel(data.idealistLevel || 0);
          setCynicLevel(data.cynicLevel || 0);
          setCredibility(data.credibility || 0);
          setPivotCount(data.pivotCount || 0);
          setValuationAtLastPivot(data.valuationAtLastPivot || 0);
          setBuildings({ ...INITIAL_BUILDINGS, ...data.buildings });
          setBlackSwanNextEligible(data.blackSwanNextEligible || {});
          setBoughtUpgrades(data.boughtUpgrades || []);
          setUnlockedUpgrades(data.unlockedUpgrades || []);
          setBoughtHeavenlyUpgrades(data.boughtHeavenlyUpgrades || []);
          setUnlockedAchievements(data.unlockedAchievements || []);
          setStats(data.stats || {
            totalClicks: 0, adsWatched: 0, goldenCaught: 0,
            overheatCount: 0, ascensionCount: 0, gpuBounced: false,
            ascendTrillion: false, shadowLucky: false,
          });
          setFancyGraphics(data.fancyGraphics !== false);

          // Offline-Ertrag: nur wenn Spieler >= 1 Minute weg war und beim letzten
          // Speichern tatsächlich etwas produziert hat.
          const elapsedSec = (Date.now() - (data.timestamp || Date.now())) / 1000;
          const savedVps = data.vps || 0;
          if (elapsedSec >= OFFLINE_MIN_SECONDS && savedVps > 0) {
            const cappedSec = Math.min(elapsedSec, OFFLINE_CAP_SECONDS);
            const amount = savedVps * cappedSec * OFFLINE_EFFICIENCY;
            if (amount >= 1) {
              setOfflineReport({ amount, elapsedSec: cappedSec });
            }
          }
        }
      }
    } catch (e) {
      console.error('Error loading save state:', e);
    }
    addLog((TRANSLATIONS[resolvedLang] || TRANSLATIONS.en).log_systemInit, 'info');
  }, [addLog]);

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

  useEffect(() => {
    const saveTimer = setInterval(() => {
      saveGameRef.current();
    }, 8000);
    return () => clearInterval(saveTimer);
  }, []);

  // Also save on tab close/backgrounding/refresh so nothing since the last 8s tick is lost.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') saveGameRef.current();
    };
    const handlePageHide = () => saveGameRef.current();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  // Tab-Aktivität tracken: hidden = Tab im Hintergrund, inactive = Tab sichtbar aber Fenster
  // ohne Fokus. Bei Rückkehr aus "hidden" entscheidet die Abwesenheitsdauer, was mit dem im
  // Hintergrund erzeugten (aber NICHT live gutgeschriebenen, siehe Tick-Loop oben) Wert
  // passiert:
  // - < 30 min: automatisch & ohne jeden Hinweis gutgeschrieben - dafür war's zu kurz, um
  //   eine Entscheidung zu verlangen.
  // - >= 30 min: bleibt PENDING und wird nur per AfkReportModal aufgelöst - Ad ansehen
  //   (claimAfkBonus) schreibt den Betrag gut, Verzicht (dismissAfkReport) verwirft ihn
  //   ersatzlos. Kein "Popup wegklicken und Geld trotzdem behalten" mehr.
  useEffect(() => {
    const updateActivity = () => {
      if (document.visibilityState === 'hidden') {
        if (hiddenSinceRef.current === null) {
          hiddenSinceRef.current = Date.now();
          awayEarnedRef.current = 0;
        }
        setPageActivity('hidden');
      } else {
        if (hiddenSinceRef.current !== null) {
          const awaySec = (Date.now() - hiddenSinceRef.current) / 1000;
          const earnedWhileHidden = awayEarnedRef.current;
          if (awaySec >= 1800 && earnedWhileHidden >= 1) {
            setAfkReport({ amount: earnedWhileHidden });
          } else if (earnedWhileHidden > 0) {
            setValuation((prev) => prev + earnedWhileHidden);
            setTotalValuation((prev) => prev + earnedWhileHidden);
            setSlopCount((prev) => prev + Math.max(1, Math.floor(earnedWhileHidden)));
          }
          awayEarnedRef.current = 0;
          hiddenSinceRef.current = null;
        }
        setPageActivity(document.hasFocus() ? 'active' : 'inactive');
      }
    };
    updateActivity();
    document.addEventListener('visibilitychange', updateActivity);
    window.addEventListener('focus', updateActivity);
    window.addEventListener('blur', updateActivity);
    // hasFocus() Wechsel feuern nicht immer zuverlässig ein Event (z.B. Alt-Tab in
    // manchen Browsern) - Poll als Fallback.
    const poll = setInterval(updateActivity, 2000);
    return () => {
      document.removeEventListener('visibilitychange', updateActivity);
      window.removeEventListener('focus', updateActivity);
      window.removeEventListener('blur', updateActivity);
      clearInterval(poll);
    };
  }, []);

  // Geplante Ad-Popups (Punkt 9): pollt gegen SCHEDULED_AD_MINUTES seit App-Start.
  useEffect(() => {
    const poll = setInterval(() => {
      const elapsedMin = (Date.now() - sessionStartRef.current) / 60000;
      const nextIdx = nextScheduledIndexRef.current;
      if (nextIdx < SCHEDULED_AD_MINUTES.length && elapsedMin >= SCHEDULED_AD_MINUTES[nextIdx]) {
        nextScheduledIndexRef.current = nextIdx + 1;
        setPendingScheduledAd(true);
      }
    }, 5000);
    return () => clearInterval(poll);
  }, []);

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
      // Tab inaktiv/hidden: Produktion läuft nur gedrosselt weiter (50% statt zuvor 10%/20%
      // gestaffelt - "nicht so tief wie bisher").
      const activityMult = pageActivity !== 'active' ? 0.5 : 1.0;
      const isHiddenTab = pageActivity === 'hidden';
      setValuation((prevVal) => {
        // Burn läuft unverändert mit vollem Tempo weiter, auch im Hintergrund - das war
        // schon vor dieser Änderung so (siehe burnRate ohne activityMult) und bleibt so.
        const burnLoss = prevVal * burnRate * deltaSec;
        if (burnLoss > 0) {
          setTotalBurned((prev) => prev + burnLoss);
        }

        const earned = vps * deltaSec * activityMult;

        // 'hidden' (Tab wirklich im Hintergrund, nicht nur unfokussiert): NICHT mehr live
        // gutschreiben, nur im awayEarnedRef-Puffer sammeln. Ob daraus am Ende Wert wird,
        // entscheidet sich erst bei Rückkehr in der updateActivity()-Effect weiter unten:
        // < 30 min automatisch & ohne Hinweis, ab 30 min nur per Ad-Ansehen oder explizitem
        // Verzicht (AfkReportModal) - kein "einfach ignorieren und trotzdem behalten" mehr.
        if (isHiddenTab) {
          if (earned > 0) awayEarnedRef.current += earned;
          return Math.max(0, prevVal - burnLoss);
        }

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

      // 6. Golden Meme (~alle 20 Min): spawnt NUR das Angebot. Der 10x-Boost wird
      // ausschließlich über die Rewarded Ad im Banner eingelöst (siehe startAd/'golden_claim'),
      // das Banner selbst hat keinerlei Effekt auf die Produktion.
      if (!activeEvent && Math.random() < GOLDEN_CHANCE_PER_200MS * tickScale) {
        const id = GOLDEN_EVENT_IDS[Math.floor(Math.random() * GOLDEN_EVENT_IDS.length)];
        setActiveEvent({ id, kind: 'golden', startedAt: now, expiresAt: now + GOLDEN_OFFER_SEC * 1000 });
        addLog(`${t(`event_${id}_title`)} - ${t(`event_${id}_desc`)}`, 'warning');
      // 7. Bubble Pop (~alle 20 Min): purely a temporary rate hit for 30s - VPS production
      // cut and burn rate spiked. No instant stock loss ("rates only"). Wirkt anders als das
      // Golden Meme sofort und ungefragt - man kann sich nur per Ad davon freikaufen.
      } else if (!activeEvent && Math.random() < BUBBLE_CHANCE_PER_200MS * tickScale) {
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
  }, [isOverheated, clickValue, addLog, tf]);

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

  // Watch Rewarded Ad. `onComplete` lässt Aufrufer eigene Belohnungslogik anhängen
  // (z.B. Booster-Pack-Reveal), die nicht generisch genug für den Switch unten ist.
  const startAd = useCallback((type, onComplete) => {
    if (adState) return; // schon eine Ad am Laufen
    if (Date.now() < (adCooldowns[type] || 0)) {
      addLog(tf('log_adOnCooldown'), 'info');
      return;
    }

    setAdState({ type, timer: 3 });
    addLog(tf('log_watchingAd'), 'info');

    let count = 3;
    const adInterval = setInterval(() => {
      count -= 1;
      setAdState({ type, timer: count });
      if (count <= 0) {
        clearInterval(adInterval);
        setAdState(null);
        setStats((s) => ({ ...s, adsWatched: (s.adsWatched || 0) + 1 }));

        const cooldownSec = AD_COOLDOWN_SEC[type] ?? 60;
        if (cooldownSec > 0) {
          setAdCooldowns((prev) => ({ ...prev, [type]: Date.now() + cooldownSec * 1000 }));
        }

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

        if (onComplete) onComplete();
      }
    }, 1000);
  }, [addLog, adState, adCooldowns, grantAdPreview, flashAdReward, tf]);

  // Offline-Ertrag einsammeln (optional per Ad verdoppelt)
  const claimOfflineEarnings = useCallback((doubled = false) => {
    if (!offlineReport) return;
    const amount = doubled ? offlineReport.amount * 2 : offlineReport.amount;
    setValuation((prev) => prev + amount);
    setTotalValuation((prev) => prev + amount);
    setOfflineReport(null);
    const msg = tf(doubled ? 'log_offlineEarningsDoubled' : 'log_offlineEarnings', { amount: Math.floor(amount).toLocaleString() });
    addLog(msg, 'success');
    if (doubled) flashAdReward(msg);
  }, [offlineReport, addLog, flashAdReward, tf]);

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
    startAd('scheduled_bonus', () => {
      const reward = scheduledAdPreview;
      setValuation((prev) => prev + reward);
      setTotalValuation((prev) => prev + reward);
      const msg = tf('log_scheduledAdRedeemed', { amount: Math.floor(reward).toLocaleString() });
      addLog(msg, 'success');
      flashAdReward(msg);
    });
  }, [scheduledAdPreview, addLog, startAd, flashAdReward, tf]);

  const deferScheduledAd = useCallback(() => {
    setPendingScheduledAd(false);
    setScheduledAdUnlocked(true);
  }, []);

  const claimUnlockedScheduledAd = useCallback(() => {
    setScheduledAdUnlocked(false);
    startAd('scheduled_bonus', () => {
      const reward = scheduledAdPreview;
      setValuation((prev) => prev + reward);
      setTotalValuation((prev) => prev + reward);
      const msg = tf('log_scheduledAdRedeemed', { amount: Math.floor(reward).toLocaleString() });
      addLog(msg, 'success');
      flashAdReward(msg);
    });
  }, [scheduledAdPreview, addLog, startAd, flashAdReward, tf]);

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
    localStorage.removeItem(STORAGE_KEY);
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
    setAdCooldowns({});
    setOfflineReport(null);
    setPendingAscendBoost(false);
    setPendingPivotBoost(false);
    addLog(tf('log_saveWiped'), 'danger');
  }, [addLog, tf]);

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
    adState, startAd, isAdReady, getAdCooldownRemaining,
    adRewardToast, dismissAdRewardToast, grantAdPreview, scheduledAdPreview,
    offlineReport, claimOfflineEarnings,
    pageActivity, afkReport, dismissAfkReport, claimAfkBonus,
    pendingScheduledAd, watchScheduledAdNow, deferScheduledAd,
    scheduledAdUnlocked, claimUnlockedScheduledAd,
    pendingAscendBoost, pendingPivotBoost,
    stats, logs,
    fancyGraphics, setFancyGraphics,
    activeTab, setActiveTab,
    vps, grossVps, netFlow, clickValue, handleTapAGI,
    resetSave, particles,

    // Investor Ledger & Hype Features
    themeMode, toggleThemeMode,
    hypeTier, burnRate,
    boughtBuzzwords, buyBuzzword, buyBoosterPack, addCardToAlbum,
    boughtGreenwashingLayoffs, buyGreenwashingLayoff,
    epoch, idealistLevel, buyIdealistLevel, cynicLevel, buyCynicLevel, credibility, pivotCount, pivot, pivotCredGain,
  };
}
