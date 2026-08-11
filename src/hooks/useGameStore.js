import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BUILDINGS_DATA } from '../data/buildingsData';
import { UPGRADES_DATA, getAvailableUpgrades } from '../data/upgradesData';
import { HEAVENLY_UPGRADES_DATA } from '../data/heavenlyUpgradesData';
import { ACHIEVEMENTS_DATA } from '../data/achievementsData';
import { BUZZWORDS_DATA, getBoosterPackCost } from '../data/buzzwordsData';
import { GREENWASHING_LAYOFFS_DATA } from '../data/greenwashingLayoffsData';
import { IDEALIST_PATH, CYNIC_PATH, EPOCHS } from '../data/credibilityTreeData';
import { GOLDEN_EVENT_IDS, BUBBLE_EVENT_IDS } from '../i18n/content/events.content';
import { TRANSLATIONS } from '../i18n/translations';
import { playSound } from '../utils/soundEffects';
import { getBuildingCost, getBuildingBulkCost, getMaxAffordableBuildings } from '../utils/formatters';

const STORAGE_KEY = 'SLOP_CLICKER_GAME_SAVE_V1';

// Konzept Abschnitt 4: Zufallsereignisse, geprüft pro Tick (Referenz-Takt 200ms)
const GOLDEN_CHANCE_PER_200MS = 0.0006; // 0.06%
const BUBBLE_CHANCE_PER_200MS = 0.0004; // 0.04%
const SHADOW_CHANCE_PER_200MS = 0.0000015; // 0.00015%
const GOLDEN_DURATION_SEC = 15;
const BUBBLE_BURN_DURATION_SEC = 30;

const INITIAL_BUILDINGS = BUILDINGS_DATA.reduce((acc, b) => {
  acc[b.id] = 0;
  return acc;
}, {});

export function useGameStore() {
  const [lang, setLang] = useState('de'); // 'de' | 'en' | 'fr' | 'es'
  const [startupName, setStartupName] = useState('Slopify.ai');
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
  const [themeMode, setThemeMode] = useState('sec_prospectus'); // 'sec_prospectus' | 'cyberpunk'
  const [boughtBuzzwords, setBoughtBuzzwords] = useState([]);
  const [boughtGreenwashingLayoffs, setBoughtGreenwashingLayoffs] = useState([]);
  const [epoch, setEpoch] = useState(2); // 0: Blockchain, 1: Metaverse, 2: AI, 3: Quantum
  const [idealistLevel, setIdealistLevel] = useState(0);
  const [cynicLevel, setCynicLevel] = useState(0);
  const [credibility, setCredibility] = useState(0);
  const [pivotCount, setPivotCount] = useState(0);
  const [valuationAtLastPivot, setValuationAtLastPivot] = useState(0);
  const [bubblePopTimer, setBubblePopTimer] = useState(0);

  const [buildings, setBuildings] = useState(INITIAL_BUILDINGS);
  const [boughtUpgrades, setBoughtUpgrades] = useState([]);
  const [boughtHeavenlyUpgrades, setBoughtHeavenlyUpgrades] = useState([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);

  const [activeEvent, setActiveEvent] = useState(null); // { id, kind: 'golden'|'bubble', expiresAt }
  const [adState, setAdState] = useState(null); // { type, timer }

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fancyGraphics, setFancyGraphics] = useState(true);

  const [activeTab, setActiveTab] = useState(1);
  const [buyMode, setBuyMode] = useState('1'); // '1', '10', '100', 'MAX'

  const [stats, setStats] = useState({
    totalClicks: 0,
    totalAdsWatched: 0,
    goldenCaught: 0,
    overheatCount: 0,
    ascensionCount: 0,
    gpuBounced: false,
    ascendTrillion: false,
    shadowLucky: false,
  });

  const [logs, setLogs] = useState([
    { id: 1, timestamp: new Date().toLocaleTimeString(), text: 'System initialized. Welcome to the AI Slop Bubble.', type: 'info' }
  ]);

  const [particles, setParticles] = useState([]);

  const t = useCallback((key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
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
      boughtUpgrades,
      boughtHeavenlyUpgrades,
      unlockedAchievements,
      stats,
      soundEnabled,
      fancyGraphics,
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
    valuationAtLastPivot, buildings,
    boughtUpgrades, boughtHeavenlyUpgrades, unlockedAchievements, stats,
    soundEnabled, fancyGraphics
  ]);

  // Load state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data) {
          setLang(data.lang || 'de');
          setStartupName(data.startupName || 'Slopify.ai');
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
          setThemeMode(data.themeMode || 'sec_prospectus');
          setBoughtBuzzwords(data.boughtBuzzwords || []);
          setBoughtGreenwashingLayoffs(data.boughtGreenwashingLayoffs || []);
          setEpoch(data.epoch ?? 2);
          setIdealistLevel(data.idealistLevel || 0);
          setCynicLevel(data.cynicLevel || 0);
          setCredibility(data.credibility || 0);
          setPivotCount(data.pivotCount || 0);
          setValuationAtLastPivot(data.valuationAtLastPivot || 0);
          setBuildings({ ...INITIAL_BUILDINGS, ...data.buildings });
          setBoughtUpgrades(data.boughtUpgrades || []);
          setBoughtHeavenlyUpgrades(data.boughtHeavenlyUpgrades || []);
          setUnlockedAchievements(data.unlockedAchievements || []);
          setStats(data.stats || {
            totalClicks: 0, totalAdsWatched: 0, goldenCaught: 0,
            overheatCount: 0, ascensionCount: 0, gpuBounced: false,
            ascendTrillion: false, shadowLucky: false,
          });
          setSoundEnabled(data.soundEnabled !== false);
          setFancyGraphics(data.fancyGraphics !== false);
        }
      }
    } catch (e) {
      console.error('Error loading save state:', e);
    }
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
    return Math.max(0.0, Math.min(0.10, total));
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

  // --- GROSS TPS/VPS (Konzept Abschnitt 4, plus SlopClicker Board-Syndicate/Prestige-Boni) ---
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

    // Zusätzliche SlopClicker-Multiplikatoren (Global-Upgrades, Board-Syndicate, Prestige, Power-Click)
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

    let prestigeBonus = 1.0 + (prestigeLevel * 0.01);
    if (boughtHeavenlyUpgrades.includes('heaven_synergy_1')) {
      prestigeBonus = 1.0 + (prestigeLevel * 0.02);
    }

    let powerSurgeMult = 1.0;
    if (powerClickActive && powerClickSurgeTimer > 0) {
      if (boughtHeavenlyUpgrades.includes('demon_3')) powerSurgeMult = 2.0;
      else if (boughtHeavenlyUpgrades.includes('demon_2')) powerSurgeMult = 1.5;
      else if (boughtHeavenlyUpgrades.includes('demon_1')) powerSurgeMult = 1.2;
    }

    // Golden Headline: 5x TPS für 15 Sekunden (Konzept Abschnitt 4)
    const goldenMult = activeEvent?.kind === 'golden' ? 5 : 1.0;

    // Bubble Pop: -35% VPS for 30s (bubblePopTimer, not activeEvent - the event banner itself
    // only shows for 4s but the rate penalty runs the full 30s, matching the burn-rate spike).
    const bubbleMult = bubblePopTimer > 0 ? 0.65 : 1.0;

    return totalCps * globalMult * syndicateBoost * pathMult * prestigeBonus * powerSurgeMult * goldenMult * bubbleMult;
  }, [buildings, boughtUpgrades, boughtGreenwashingLayoffs, boughtHeavenlyUpgrades, unlockedAchievements, buzzwordBonus, idealistLevel, cynicLevel, prestigeLevel, powerClickActive, powerClickSurgeTimer, activeEvent, bubblePopTimer]);

  // vps = gross production rate (Konzept: Gesamt-TPS, vor Burn Rate - Burn frisst den Bestand, nicht den Fluss)
  const vps = grossVps;

  // Was der Bestand gerade netto pro Sekunde macht (Produktion minus laufendem Burn) - nur fürs Display
  const netFlow = useMemo(() => vps - valuation * burnRate, [vps, valuation, burnRate]);

  // --- TAP-WERT (Konzept: max(1, Gesamt-TPS x 0.05), zzgl. SlopClicker Click-Upgrades) ---
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
      setValuation((prevVal) => {
        const earned = vps * deltaSec;
        const burnLoss = prevVal * burnRate * deltaSec;
        if (earned > 0) {
          setTotalValuation((prev) => prev + earned);
          setSlopCount((prev) => prev + Math.max(1, Math.floor(earned)));
        }
        if (burnLoss > 0) {
          setTotalBurned((prev) => prev + burnLoss);
        }
        return Math.max(0, prevVal + earned - burnLoss);
      });

      // 2. GPU Cooling (-coolingRate °C/s)
      setGpuTemp((prev) => {
        const next = Math.max(0, prev - coolingRate * deltaSec);
        if (isOverheated && next < 50) {
          setIsOverheated(false);
          addLog('GPU temperature dropped below 50°C. AGI Button unlocked!', 'success');
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

      // 5. Aktives Event ablaufen lassen
      if (activeEvent && now >= activeEvent.expiresAt) {
        setActiveEvent(null);
      }

      // 6. Golden Headline (0.06%/Tick@200ms): purely a temporary rate boost - 5x TPS for 15s.
      // No item reward: Buzzword cards are earned only via booster packs / direct purchase now.
      if (!activeEvent && Math.random() < GOLDEN_CHANCE_PER_200MS * tickScale) {
        const id = GOLDEN_EVENT_IDS[Math.floor(Math.random() * GOLDEN_EVENT_IDS.length)];
        setActiveEvent({ id, kind: 'golden', expiresAt: now + GOLDEN_DURATION_SEC * 1000 });
        setStats((s) => ({ ...s, goldenCaught: s.goldenCaught + 1 }));
        playSound('golden', soundEnabled);
        addLog(`${t(`event_${id}_title`)} - ${t(`event_${id}_desc`)}`, 'warning');
      // 7. Bubble Pop (0.04%/Tick@200ms): purely a temporary rate hit for 30s - VPS production
      // cut and burn rate spiked. No instant stock loss, same "rates only" rule as Golden Headline.
      } else if (!activeEvent && Math.random() < BUBBLE_CHANCE_PER_200MS * tickScale) {
        const id = BUBBLE_EVENT_IDS[Math.floor(Math.random() * BUBBLE_EVENT_IDS.length)];
        setActiveEvent({ id, kind: 'bubble', expiresAt: now + 4000 });
        setBubblePopTimer(BUBBLE_BURN_DURATION_SEC);
        playSound('overheat', soundEnabled);
        addLog(`${t(`event_${id}_title`)} - ${t(`event_${id}_desc`)}`, 'danger');
      }

      // 8. Achievements prüfen
      ACHIEVEMENTS_DATA.forEach((ach) => {
        if (!unlockedAchievements.includes(ach.id)) {
          const currentState = {
            stats, totalValuation, valuation, buildings, totalBurned,
            pivotCount, boughtBuzzwords, unlockedAchievements, activeEvent,
          };
          if (ach.check(currentState)) {
            setUnlockedAchievements((prev) => [...prev, ach.id]);
            playSound('golden', soundEnabled);
            addLog(`🏆 ACHIEVEMENT UNLOCKED: "${t(`ach_${ach.id}_name`)}"`, 'achievement');
          }
        }
      });

      // 9. Shadow Achievement "Tatsächlich Gewinn gemacht" (0.00015% pro 200ms-Tick)
      if (Math.random() < SHADOW_CHANCE_PER_200MS * tickScale) {
        setStats((prev) => ({ ...prev, shadowLucky: true }));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [vps, burnRate, coolingRate, isOverheated, activeEvent, powerClickSurgeTimer, bubblePopTimer, unlockedAchievements, stats, totalValuation, totalBurned, pivotCount, buildings, boughtBuzzwords, soundEnabled, addLog, t]);

  // --- ACTIONS ---

  // Click AGI Button
  const handleTapAGI = useCallback((e) => {
    if (isOverheated) {
      playSound('overheat', soundEnabled);
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
        playSound('overheat', soundEnabled);
        addLog('🔥 GPU OVERHEATED AT 100°C! Cooling initiated (-4°C/s). Button locked until < 50°C.', 'danger');
        return 100.0;
      }
      return next;
    });

    setStats((s) => ({ ...s, totalClicks: s.totalClicks + 1 }));
    playSound('click', soundEnabled);

    if (e && e.clientX && e.clientY) {
      const id = Date.now() + Math.random();
      setParticles((prev) => [
        ...prev.slice(-15),
        { id, x: e.clientX, y: e.clientY, text: `+$${Math.floor(earned)}` },
      ]);
    }
  }, [isOverheated, clickValue, soundEnabled, addLog]);

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
      addLog(`Not enough valuation to purchase ${t(`building_${b.id}_name`)}!`, 'danger');
      return;
    }

    setValuation((prev) => prev - cost);
    setBuildings((prev) => ({
      ...prev,
      [buildingId]: (prev[buildingId] || 0) + targetCount,
    }));

    playSound('buy', soundEnabled);
    addLog(`Purchased ${targetCount}x ${t(`building_${b.id}_name`)} for $${cost.toLocaleString()}!`, 'success');
  }, [buildings, buyMode, valuation, soundEnabled, addLog, t]);

  // Buy Upgrade
  const buyUpgrade = useCallback((upgradeId) => {
    const up = UPGRADES_DATA.find((item) => item.id === upgradeId);
    if (!up || boughtUpgrades.includes(upgradeId)) return;

    if (valuation < up.cost) {
      addLog('Not enough valuation for this upgrade!', 'danger');
      return;
    }

    setValuation((prev) => prev - up.cost);
    setBoughtUpgrades((prev) => [...prev, upgradeId]);

    if (up.type === 'global' && up.effect.type === 'coolingRate') {
      setCoolingRate(up.effect.value);
    }

    playSound('buy', soundEnabled);
    const name = up.type === 'building' ? t(`upgrade_${up.id}_name`) : up.name;
    addLog(`Purchased upgrade "${name}"`, 'success');
  }, [boughtUpgrades, valuation, soundEnabled, addLog, t]);

  // Native "BUY ALL" Upgrades Button — only from the same eligible set the tile grid shows
  // (must own >=1 of the building etc.), so this can never buy an upgrade the UI hides.
  const buyAllUpgrades = useCallback(() => {
    let currentMoney = valuation;
    const eligible = getAvailableUpgrades(buildings, boughtUpgrades, valuation, totalValuation);
    const affordable = eligible.filter((up) => currentMoney >= up.cost);

    if (affordable.length === 0) {
      addLog('No upgrades available to buy.', 'info');
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
    playSound('buy', soundEnabled);
    addLog(`"BUY ALL" executed! Purchased ${newBought.length - boughtUpgrades.length} upgrades for $${spent.toLocaleString()}!`, 'success');
  }, [boughtUpgrades, valuation, totalValuation, buildings, soundEnabled, addLog]);

  // Dismiss the currently active event banner (purely informational - effects already auto-applied on spawn)
  const dismissEvent = useCallback(() => {
    setActiveEvent(null);
  }, []);

  // Toggle Power Click
  const togglePowerClick = useCallback(() => {
    if (powerClicks <= 0) {
      addLog('No Power Clicks accumulated yet! Earn 1 every 30 minutes.', 'info');
      return;
    }
    setPowerClicks((prev) => prev - 1);
    setPowerClickActive(true);
    setPowerClickSurgeTimer(20);
    playSound('golden', soundEnabled);
    addLog('⚡ POWER CLICK ACTIVATED! Next taps deal double damage + temporary VPS surge!', 'success');
  }, [powerClicks, soundEnabled, addLog]);

  // Watch Simulated Rewarded Ad
  const startAd = useCallback((type) => {
    setAdState({ type, timer: 3 });
    addLog('▶️ Watching simulated 3-second Rewarded Ad...', 'info');

    let count = 3;
    const adInterval = setInterval(() => {
      count -= 1;
      setAdState({ type, timer: count });
      if (count <= 0) {
        clearInterval(adInterval);
        setAdState(null);
        setStats((s) => ({ ...s, totalAdsWatched: s.totalAdsWatched + 1 }));

        if (type === 'nitrogen') {
          setGpuTemp(0);
          setIsOverheated(false);
          addLog('🧊 Nitrogen Cooling applied! GPU reset to 0°C + 2x Click Power!', 'success');
        } else if (type === 'grant') {
          const reward = Math.max(500, vps * 100);
          setValuation((prev) => prev + reward);
          setTotalValuation((prev) => prev + reward);
          addLog(`💰 Government AI Grant awarded! Earned +$${Math.floor(reward).toLocaleString()}!`, 'success');
        }
        playSound('ad', soundEnabled);
      }
    }, 1000);
  }, [vps, soundEnabled, addLog]);

  // Singularity Ascension (SlopClicker Prestige Reset - bleibt zusätzlich zu Pivot bestehen)
  const ascend = useCallback(() => {
    const earnedChips = Math.floor(Math.pow(totalValuation / 1000000000, 0.5));
    if (earnedChips <= 0 && prestigeLevel === 0) {
      addLog('Singularity Ascension requires at least $1B lifetime valuation!', 'warning');
      return;
    }

    if (totalValuation >= 1000000000000) {
      setStats((s) => ({ ...s, ascendTrillion: true }));
    }

    setPrestigeLevel((prev) => prev + earnedChips + 1);
    setHeavenlyChips((prev) => prev + earnedChips);
    setStats((s) => ({ ...s, ascensionCount: s.ascensionCount + 1 }));

    setValuation(0);
    setBuildings(INITIAL_BUILDINGS);
    setBoughtUpgrades([]);
    setGpuTemp(0);
    setIsOverheated(false);

    playSound('ascend', soundEnabled);
    addLog(`🌌 SINGULARITY ASCENSION EXECUTED! Earned ${earnedChips} Heavenly Chips!`, 'achievement');
  }, [totalValuation, prestigeLevel, soundEnabled, addLog]);

  // Pivot is a milestone, not a reset: Engines, Upgrades and Valuation all stay. Credibility
  // is earned on lifetime valuation GAINED SINCE THE LAST PIVOT (not lifetime-total, which
  // never decreases) so repeated pivots can't farm Credibility for free without new growth.
  // Ascension remains the actual full-wipe prestige mechanic for Heavenly Chips.
  const pivotCredGain = useMemo(() => {
    return Math.floor(Math.sqrt(Math.max(0, totalValuation - valuationAtLastPivot) / 1000000));
  }, [totalValuation, valuationAtLastPivot]);

  const pivot = useCallback(() => {
    if (pivotCredGain <= 0) {
      addLog('Pivot requires enough NEW lifetime valuation since your last Pivot to earn Credibility!', 'warning');
      return;
    }
    const nextEpoch = (epoch + 1) % EPOCHS.length;
    setCredibility((prev) => prev + pivotCredGain);
    setEpoch(nextEpoch);
    setPivotCount((prev) => prev + 1);
    setValuationAtLastPivot(totalValuation);

    playSound('ascend', soundEnabled);
    addLog(`🔄 PIVOT EXECUTED! Epoch rotated to ${EPOCHS[nextEpoch].name}! Earned +${pivotCredGain} Credibility!`, 'achievement');
  }, [pivotCredGain, totalValuation, epoch, soundEnabled, addLog]);

  // Buy Buzzword Card Directly
  const buyBuzzword = useCallback((buzzId) => {
    const bw = BUZZWORDS_DATA.find((item) => item.id === buzzId);
    if (!bw || boughtBuzzwords.includes(buzzId)) return false;

    if (valuation < bw.cost) {
      addLog(`Nicht genug Valuation für Buzzword "${bw.name}"!`, 'danger');
      return false;
    }

    setValuation((prev) => prev - bw.cost);
    setBoughtBuzzwords((prev) => [...prev, buzzId]);
    playSound('buy', soundEnabled);
    addLog(`✨ Buzzword-Karte "${bw.name}" (+${Math.round(bw.bonus * 100)}% VPS) ins Album gelegt!`, 'success');
    return true;
  }, [boughtBuzzwords, valuation, soundEnabled, addLog]);

  // Buy Trading Card Booster Pack. Cost is deducted AND the card is committed to
  // boughtBuzzwords in the same call, so autosave/unmount between purchase and the
  // reveal animation's confirm click can never charge the player without granting a card.
  // The returned card is only used by the UI to drive the reveal animation.
  const buyBoosterPack = useCallback(() => {
    const uncollected = BUZZWORDS_DATA.filter((bw) => !boughtBuzzwords.includes(bw.id));
    if (uncollected.length === 0) {
      addLog('Du hast bereits alle 80 Buzzword-Karten im Sammelalbum vervollständigt!', 'info');
      return null;
    }

    // Pack price increases with each collected card
    const packCost = getBoosterPackCost(boughtBuzzwords.length);

    if (valuation < packCost) {
      addLog(`Nicht genug Valuation für ein Trading Card Booster Pack ($${packCost.toLocaleString()})!`, 'danger');
      return null;
    }

    // Random uncollected card selection (duplication protection!)
    const randomIndex = Math.floor(Math.random() * uncollected.length);
    const pulledCard = uncollected[randomIndex];

    setValuation((prev) => prev - packCost);
    setBoughtBuzzwords((prev) => [...prev, pulledCard.id]);
    playSound('golden', soundEnabled);
    addLog(`🎴 Buzzword-Karte "${pulledCard.name}" (+${Math.round(pulledCard.bonus * 100)}% VPS) ins Album gezogen!`, 'achievement');

    return pulledCard;
  }, [boughtBuzzwords, valuation, soundEnabled, addLog]);

  // Buy Corporate Greenwashing & Layoff Action
  const buyGreenwashingLayoff = useCallback((itemId) => {
    const item = GREENWASHING_LAYOFFS_DATA.find((g) => g.id === itemId);
    if (!item || boughtGreenwashingLayoffs.includes(itemId)) return;

    const b = BUILDINGS_DATA.find((itemB) => itemB.id === item.buildingId);
    const baseCost = b ? b.baseCost : 15;
    const cost = item.costMult * baseCost;

    if (valuation < cost) {
      addLog('Not enough valuation for this action!', 'danger');
      return;
    }

    setValuation((prev) => prev - cost);
    setBoughtGreenwashingLayoffs((prev) => [...prev, itemId]);
    playSound('buy', soundEnabled);
    addLog(`Executed Action "${t(`gw_${itemId}_name`)}"`, 'success');
  }, [boughtGreenwashingLayoffs, valuation, soundEnabled, addLog, t]);

  // Buy Idealist Path Level
  const buyIdealistLevel = useCallback(() => {
    if (idealistLevel >= 15) return;
    const nextNode = IDEALIST_PATH[idealistLevel];
    const cost = Math.pow(1.35, idealistLevel);

    if (credibility < cost) {
      addLog(`Not enough Credibility for Idealist level ${idealistLevel + 1}!`, 'danger');
      return;
    }

    setCredibility((prev) => prev - cost);
    setIdealistLevel((prev) => prev + 1);
    playSound('buy', soundEnabled);
    addLog(`Unlocked Idealist Node "${nextNode.name}"!`, 'success');
  }, [idealistLevel, credibility, soundEnabled, addLog]);

  // Buy Cynic Path Level
  const buyCynicLevel = useCallback(() => {
    if (cynicLevel >= 15) return;
    const nextNode = CYNIC_PATH[cynicLevel];
    const cost = Math.pow(1.35, cynicLevel);

    if (credibility < cost) {
      addLog(`Not enough Credibility for Cynic level ${cynicLevel + 1}!`, 'danger');
      return;
    }

    setCredibility((prev) => prev - cost);
    setCynicLevel((prev) => prev + 1);
    playSound('buy', soundEnabled);
    addLog(`Unlocked Cynic Node "${nextNode.name}"!`, 'success');
  }, [cynicLevel, credibility, soundEnabled, addLog]);

  // Theme Mode (SEC Prospectus vs Cyberpunk) - explizite Nutzer-Entscheidung, wird gespeichert
  const toggleThemeMode = useCallback(() => {
    setThemeMode((prev) => (prev === 'sec_prospectus' ? 'cyberpunk' : 'sec_prospectus'));
    playSound('click', soundEnabled);
  }, [soundEnabled]);

  // Buy Heavenly Upgrade
  const buyHeavenlyUpgrade = useCallback((upgradeId) => {
    const up = HEAVENLY_UPGRADES_DATA.find((item) => item.id === upgradeId);
    if (!up || boughtHeavenlyUpgrades.includes(upgradeId)) return;

    if (heavenlyChips < up.chipsCost) {
      addLog(`Not enough Heavenly Chips for "${up.name}"!`, 'danger');
      return;
    }

    setHeavenlyChips((prev) => prev - up.chipsCost);
    setBoughtHeavenlyUpgrades((prev) => [...prev, upgradeId]);
    playSound('buy', soundEnabled);
    addLog(`Purchased Heavenly Upgrade "${up.name}"!`, 'success');
  }, [boughtHeavenlyUpgrades, heavenlyChips, soundEnabled, addLog]);

  // Bouncing GPU Easter Egg
  const bounceGPU = useCallback(() => {
    setStats((s) => ({ ...s, gpuBounced: true }));
    playSound('golden', soundEnabled);
    addLog('🛸 GPU Detached! Meltdown physics Easter Egg unlocked!', 'achievement');
  }, [soundEnabled, addLog]);

  // Wipe Save Data
  const resetSave = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setStartupName('Slopify.ai');
    setValuation(0);
    setTotalValuation(0);
    setTotalBurned(0);
    setSlopCount(0);
    setGpuTemp(0);
    setIsOverheated(false);
    setBuildings(INITIAL_BUILDINGS);
    setBoughtUpgrades([]);
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
      totalClicks: 0, totalAdsWatched: 0, goldenCaught: 0,
      overheatCount: 0, ascensionCount: 0, gpuBounced: false,
      ascendTrillion: false, shadowLucky: false,
    });
    addLog('Save data completely wiped. Starting fresh startup round!', 'danger');
  }, [addLog]);

  return {
    lang, setLang, t,
    startupName, setStartupName,
    valuation, totalValuation, totalBurned, slopCount,
    gpuTemp, isOverheated, coolingRate,
    powerClicks, powerClickActive, powerClickSurgeTimer, togglePowerClick,
    prestigeLevel, heavenlyChips, ascend, buyHeavenlyUpgrade, boughtHeavenlyUpgrades,
    buildings, buyBuilding, buyMode, setBuyMode,
    boughtUpgrades, buyUpgrade, buyAllUpgrades,
    unlockedAchievements,
    activeEvent, dismissEvent,
    adState, startAd,
    stats, logs,
    soundEnabled, setSoundEnabled,
    fancyGraphics, setFancyGraphics,
    activeTab, setActiveTab,
    vps, grossVps, netFlow, clickValue, handleTapAGI,
    bounceGPU, resetSave, particles,

    // SEC Form S-1 & Hype Ledger Features
    themeMode, toggleThemeMode,
    hypeTier, burnRate,
    boughtBuzzwords, buyBuzzword, buyBoosterPack,
    boughtGreenwashingLayoffs, buyGreenwashingLayoff,
    epoch, idealistLevel, buyIdealistLevel, cynicLevel, buyCynicLevel, credibility, pivotCount, pivot, pivotCredGain,
  };
}
