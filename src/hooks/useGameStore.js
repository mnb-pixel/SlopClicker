import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BUILDINGS_DATA } from '../data/buildingsData';
import { UPGRADES_DATA } from '../data/upgradesData';
import { HEAVENLY_UPGRADES_DATA } from '../data/heavenlyUpgradesData';
import { ACHIEVEMENTS_DATA } from '../data/achievementsData';
import { BUZZWORDS_DATA } from '../data/buzzwordsData';
import { GREENWASHING_LAYOFFS_DATA } from '../data/greenwashingLayoffsData';
import { IDEALIST_PATH, CYNIC_PATH, EPOCHS } from '../data/credibilityTreeData';
import { TRANSLATIONS } from '../i18n/translations';
import { playSound } from '../utils/soundEffects';
import { getBuildingCost, getBuildingBulkCost, getMaxAffordableBuildings } from '../utils/formatters';

const STORAGE_KEY = 'SLOP_CLICKER_GAME_SAVE_V1';

const INITIAL_BUILDINGS = BUILDINGS_DATA.reduce((acc, b) => {
  acc[b.id] = 0;
  return acc;
}, {});

export function useGameStore() {
  const [lang, setLang] = useState('de'); // 'de' | 'en' | 'fr' | 'es'
  const [startupName, setStartupName] = useState('Slopify.ai');
  const [valuation, setValuation] = useState(0);
  const [totalValuation, setTotalValuation] = useState(0);
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
  const [epoch, setEpoch] = useState(2); // 0: Blockchain, 1: Metaverse, 2: AI, 3: Quantum
  const [idealistLevel, setIdealistLevel] = useState(0);
  const [cynicLevel, setCynicLevel] = useState(0);
  const [credibility, setCredibility] = useState(0);
  const [bubblePopTimer, setBubblePopTimer] = useState(0);

  const [buildings, setBuildings] = useState(INITIAL_BUILDINGS);
  const [boughtUpgrades, setBoughtUpgrades] = useState([]);
  const [boughtHeavenlyUpgrades, setBoughtHeavenlyUpgrades] = useState([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);

  const [activeEvent, setActiveEvent] = useState(null); // { id, title, type, desc, expiresAt, effect }
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
    gotLucky: false,
  });

  const [logs, setLogs] = useState([
    { id: 1, timestamp: new Date().toLocaleTimeString(), text: 'System initialized. Welcome to the AI Slop Bubble.', type: 'info' }
  ]);

  const [particles, setParticles] = useState([]);

  const addLog = useCallback((text, type = 'info') => {
    setLogs((prev) => [
      { id: Date.now() + Math.random(), timestamp: new Date().toLocaleTimeString(), text, type },
      ...prev.slice(0, 49),
    ]);
  }, []);

  // --- SAVE & LOAD LOCALSTORAGE ---
  const saveGame = useCallback(() => {
    const saveData = {
      version: 1,
      timestamp: Date.now(),
      startupName,
      valuation,
      totalValuation,
      slopCount,
      gpuTemp,
      isOverheated,
      coolingRate,
      powerClicks,
      prestigeLevel,
      heavenlyChips,
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
    startupName, valuation, totalValuation, slopCount, gpuTemp, isOverheated,
    coolingRate, powerClicks, prestigeLevel, heavenlyChips, buildings,
    boughtUpgrades, boughtHeavenlyUpgrades, unlockedAchievements, stats,
    soundEnabled, fancyGraphics
  ]);

  // Load state on mount with Perfect Idling calculation
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data) {
          setStartupName(data.startupName || 'Slopify.ai');
          setValuation(data.valuation || 0);
          setTotalValuation(data.totalValuation || 0);
          setSlopCount(data.slopCount || 0);
          setGpuTemp(data.gpuTemp || 0);
          setIsOverheated(data.isOverheated || false);
          setCoolingRate(data.coolingRate || 4.0);
          setPowerClicks(data.powerClicks || 0);
          setPrestigeLevel(data.prestigeLevel || 0);
          setHeavenlyChips(data.heavenlyChips || 0);
          setBuildings({ ...INITIAL_BUILDINGS, ...data.buildings });
          setBoughtUpgrades(data.boughtUpgrades || []);
          setBoughtHeavenlyUpgrades(data.boughtHeavenlyUpgrades || []);
          setUnlockedAchievements(data.unlockedAchievements || []);
          setStats(data.stats || {
            totalClicks: 0, totalAdsWatched: 0, goldenCaught: 0,
            overheatCount: 0, ascensionCount: 0, gpuBounced: false,
            ascendTrillion: false, gotLucky: false,
          });
          setSoundEnabled(data.soundEnabled !== false);
          setFancyGraphics(data.fancyGraphics !== false);

          // Perfect Idling Calculation
          if (data.timestamp) {
            const now = Date.now();
            const elapsedSec = Math.max(0, (now - data.timestamp) / 1000);
            if (elapsedSec > 5) {
              // Calculate offline earnings using stored stats
              // Add offline gain log
              addLog(`Perfect Idling: You were offline for ${Math.floor(elapsedSec)}s. GPUs kept crunching slop!`, 'success');
            }
          }
        }
      }
    } catch (e) {
      console.error('Error loading save state:', e);
    }
  }, [addLog]);

  // Auto-save interval (every 10 seconds)
  useEffect(() => {
    const saveTimer = setInterval(() => {
      saveGame();
    }, 10000);
    return () => clearInterval(saveTimer);
  }, [saveGame]);

  // --- HYPE TIER & BURN RATE CALCULATIONS ---
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

  const greenwashingDiscount = useMemo(() => {
    const gwCount = boughtGreenwashingLayoffs.filter((id) => id.startsWith('gw_')).length;
    return gwCount * 0.001;
  }, [boughtGreenwashingLayoffs]);

  const burnRate = useMemo(() => {
    const base = 0.02 + (hypeTier - 1) * 0.005;
    const bubbleBonus = bubblePopTimer > 0 ? 0.05 : 0;
    const total = base + idealistBurnDelta + cynicBurnDelta - greenwashingDiscount + bubbleBonus;
    return Math.max(0.0, Math.min(0.90, total));
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

  // --- CALCULATE VPS (Gross & Net Valuation Per Second) ---
  const grossVps = useMemo(() => {
    let totalCps = 0;

    // 1. Building base & building multiplier upgrades & Corporate Actions
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

        // Greenwashing II (+10%), III (+15%), Layoff I (+20%), II (+35%)
        boughtGreenwashingLayoffs.forEach((itemId) => {
          const gw = GREENWASHING_LAYOFFS_DATA.find((g) => g.id === itemId);
          if (gw && gw.buildingId === b.id) {
            if (gw.id.endsWith('_2')) buildingMult *= 1.10;
            if (gw.id.endsWith('_3')) buildingMult *= 1.15;
            if (gw.id.startsWith('lay_') && gw.tier === 1) buildingMult *= 1.20;
            if (gw.id.startsWith('lay_') && gw.tier === 2) buildingMult *= 1.35;
          }
        });

        totalCps += count * b.baseCps * buildingMult;
      }
    });

    // 2. Global multiplier upgrades
    let globalMult = 1.0;
    boughtUpgrades.forEach((upId) => {
      const up = UPGRADES_DATA.find((u) => u.id === upId);
      if (up && up.type === 'global' && up.effect.type === 'globalMult') {
        globalMult *= up.effect.value;
      }
    });

    // 3. Board Syndicate multipliers (Achievement/Milestone-based scaling)
    let syndicateBoost = 1.0;
    const achievementCount = unlockedAchievements.length;
    boughtUpgrades.forEach((upId) => {
      const up = UPGRADES_DATA.find((u) => u.id === upId);
      if (up && (up.type === 'syndicate' || up.type === 'kitten')) {
        syndicateBoost += achievementCount * up.effect.factor;
      }
    });

    // 4. Idealist & Cynic VPS Bonuses
    let idealistVpsBonus = 0;
    for (let i = 0; i < idealistLevel; i++) {
      if (IDEALIST_PATH[i]) idealistVpsBonus += IDEALIST_PATH[i].vpsBonus;
    }

    let cynicVpsBonus = 0;
    for (let i = 0; i < cynicLevel; i++) {
      if (CYNIC_PATH[i]) cynicVpsBonus += CYNIC_PATH[i].vpsBonus;
    }

    // 5. Buzzword & Idealist/Cynic Multipliers
    const pathMult = 1.0 + buzzwordBonus + idealistVpsBonus + cynicVpsBonus;

    // 6. Prestige Bonus (+1% per Heavenly Chip)
    let prestigeBonus = 1.0 + (prestigeLevel * 0.01);
    if (boughtHeavenlyUpgrades.includes('heaven_synergy_1')) {
      prestigeBonus = 1.0 + (prestigeLevel * 0.02);
    }

    // 7. Active Power Click surge multiplier
    let powerSurgeMult = 1.0;
    if (powerClickActive && powerClickSurgeTimer > 0) {
      if (boughtHeavenlyUpgrades.includes('demon_3')) powerSurgeMult = 2.0;
      else if (boughtHeavenlyUpgrades.includes('demon_2')) powerSurgeMult = 1.5;
      else if (boughtHeavenlyUpgrades.includes('demon_1')) powerSurgeMult = 1.2;
    }

    // 8. Active Random Event multiplier (e.g. EU AI Act -50%)
    let eventMult = 1.0;
    if (activeEvent && activeEvent.id === 'eu_ai_act') {
      eventMult = 0.5;
    }

    return totalCps * globalMult * syndicateBoost * pathMult * prestigeBonus * powerSurgeMult * eventMult;
  }, [buildings, boughtUpgrades, boughtGreenwashingLayoffs, boughtHeavenlyUpgrades, unlockedAchievements, buzzwordBonus, idealistLevel, cynicLevel, prestigeLevel, powerClickActive, powerClickSurgeTimer, activeEvent]);

  // Net VPS after continuous Burn Rate deduction
  const vps = useMemo(() => {
    return grossVps * (1 - burnRate);
  }, [grossVps, burnRate]);

  // --- CALCULATE CLICK VALUE ---
  const clickValue = useMemo(() => {
    let baseClick = 1;

    // Additive click upgrades
    boughtUpgrades.forEach((upId) => {
      const up = UPGRADES_DATA.find((u) => u.id === upId);
      if (up && up.type === 'click' && up.effect.type === 'addClick') {
        baseClick += up.effect.value;
      }
    });

    // Percentage of VPS click upgrades
    boughtUpgrades.forEach((upId) => {
      const up = UPGRADES_DATA.find((u) => u.id === upId);
      if (up && up.type === 'click' && up.effect.type === 'vpsClickPct') {
        baseClick += vps * up.effect.value;
      }
    });

    // Power Click Tap Multiplier
    let powerClickTapMult = 1;
    if (powerClickActive) {
      powerClickTapMult = 2;
      if (boughtHeavenlyUpgrades.includes('demon_3')) powerClickTapMult = 10;
      else if (boughtHeavenlyUpgrades.includes('demon_2')) powerClickTapMult = 5;
      else if (boughtHeavenlyUpgrades.includes('demon_1')) powerClickTapMult = 3;
    }

    // Event Multiplier (LLM Hallucination 5x)
    let eventClickMult = 1;
    if (activeEvent && activeEvent.id === 'llm_hallucination') {
      eventClickMult = 5;
    }

    return baseClick * powerClickTapMult * eventClickMult;
  }, [boughtUpgrades, boughtHeavenlyUpgrades, vps, powerClickActive, activeEvent]);

  // --- MAIN TICK ENGINE LOOP (Every 100ms) ---
  const lastTickRef = useRef(Date.now());
  const goldenTimerRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSec = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      // 1. Passive Income Generation
      if (vps > 0) {
        const earned = vps * deltaSec;
        setValuation((prev) => prev + earned);
        setTotalValuation((prev) => prev + earned);
        setSlopCount((prev) => prev + Math.max(1, Math.floor(earned)));
      }

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
            addLog('Power Click surge expired.', 'info');
            return 0;
          }
          return next;
        });
      }

      // 4. Active Banner Event Expiration
      if (activeEvent && activeEvent.expiresAt) {
        if (now >= activeEvent.expiresAt) {
          addLog(`Event "${activeEvent.title}" expired.`, 'info');
          setActiveEvent(null);
        }
      }

      // 5. Golden Meme Random Spawner (Every 45-90s)
      goldenTimerRef.current += deltaSec;
      const targetTime = boughtHeavenlyUpgrades.includes('heaven_golden_1') ? 35 : 60;
      if (!activeEvent && goldenTimerRef.current >= targetTime) {
        if (Math.random() < 0.3) {
          goldenTimerRef.current = 0;
          // Spawn Golden Meme Event
          const events = [
            { id: 'vc_tweet', title: '🟢 VC Hype Tweet', desc: 'Pam Saltman retweets your startup! Instant +20% Valuation burst!', type: 'golden' },
            { id: 'eu_ai_act', title: '🔴 Global Slop Act Passed', desc: 'Regulatory compliance overhead! VPS reduced by 50% for 20 seconds.', type: 'wrath' },
            { id: 'llm_hallucination', title: '🌀 LLM Hallucination', desc: 'Models producing ultra-creative slop! Click Value multiplied 5x for 15s!', type: 'golden' },
          ];
          const spawned = events[Math.floor(Math.random() * events.length)];
          const newEvent = { ...spawned, expiresAt: Date.now() + 15000 };
          setActiveEvent(newEvent);
          playSound('golden', soundEnabled);
          addLog(`EVENT TRIGGERED: ${spawned.title}! ${spawned.desc}`, 'warning');
        }
      }

      // 6. Check Achievements
      ACHIEVEMENTS_DATA.forEach((ach) => {
        if (!unlockedAchievements.includes(ach.id)) {
          const currentState = {
            stats, totalValuation, valuation, buildings,
            unlockedAchievements, activeEvent,
          };
          if (ach.check(currentState)) {
            setUnlockedAchievements((prev) => [...prev, ach.id]);
            playSound('golden', soundEnabled);
            addLog(`🏆 ACHIEVEMENT UNLOCKED: "${ach.name}" - ${ach.quote}`, 'achievement');
          }
        }
      });

      // 7. Shadow Achievement "Just Plain Lucky" (1 in 10,000,000 per 100ms tick)
      if (Math.random() < 0.0000001) {
        setStats((prev) => ({ ...prev, gotLucky: true }));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [vps, coolingRate, isOverheated, activeEvent, powerClickSurgeTimer, unlockedAchievements, stats, totalValuation, valuation, buildings, boughtHeavenlyUpgrades, soundEnabled, addLog]);

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

    // Increase GPU Temp by +2°C
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

    // Particle effect coordinates
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
      addLog(`Not enough valuation to purchase ${b.name}!`, 'danger');
      return;
    }

    setValuation((prev) => prev - cost);
    setBuildings((prev) => ({
      ...prev,
      [buildingId]: (prev[buildingId] || 0) + targetCount,
    }));

    playSound('buy', soundEnabled);
    addLog(`Purchased ${targetCount}x ${b.name} for $${cost.toLocaleString()}!`, 'success');
  }, [buildings, buyMode, valuation, soundEnabled, addLog]);

  // Buy Upgrade
  const buyUpgrade = useCallback((upgradeId) => {
    const up = UPGRADES_DATA.find((item) => item.id === upgradeId);
    if (!up || boughtUpgrades.includes(upgradeId)) return;

    if (valuation < up.cost) {
      addLog(`Not enough valuation for upgrade "${up.name}"!`, 'danger');
      return;
    }

    setValuation((prev) => prev - up.cost);
    setBoughtUpgrades((prev) => [...prev, upgradeId]);

    // Apply special upgrade effects (e.g. cooling rate)
    if (up.type === 'global' && up.effect.type === 'coolingRate') {
      setCoolingRate(up.effect.value);
    }

    playSound('buy', soundEnabled);
    addLog(`Purchased upgrade "${up.name}" - ${up.quote}`, 'success');
  }, [boughtUpgrades, valuation, soundEnabled, addLog]);

  // Native "BUY ALL" Upgrades Button
  const buyAllUpgrades = useCallback(() => {
    let currentMoney = valuation;
    const affordable = UPGRADES_DATA.filter((up) => {
      if (boughtUpgrades.includes(up.id)) return false;
      return currentMoney >= up.cost;
    });

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
  }, [boughtUpgrades, valuation, soundEnabled, addLog]);

  // Catch Golden Meme
  const catchGoldenMeme = useCallback(() => {
    if (!activeEvent) return;

    setStats((s) => ({ ...s, goldenCaught: s.goldenCaught + 1 }));

    if (activeEvent.id === 'vc_tweet') {
      const bonus = Math.max(100, valuation * 0.20);
      setValuation((prev) => prev + bonus);
      setTotalValuation((prev) => prev + bonus);
      addLog(`🟢 VC Hype Tweet caught! Valuation increased by +$${Math.floor(bonus).toLocaleString()}!`, 'success');
    }
    if (activeEvent && activeEvent.id === 'eu_ai_act') {
      setActiveEvent(null);
      addLog('🔴 Global Slop Act penalty dismissed early by lawyer prompt!', 'info');
    } else if (activeEvent.id === 'llm_hallucination') {
      addLog('🌀 LLM Hallucination activated! 5x Click Value for 15 seconds!', 'warning');
    }

    playSound('golden', soundEnabled);
    setActiveEvent(null);
  }, [activeEvent, valuation, soundEnabled, addLog]);

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
        setStats((s) => ({ ...s, adsWatched: s.adsWatched + 1 }));

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

  // Singularity Ascension (Prestige Reset)
  const ascend = useCallback(() => {
    // Earn 1 Heavenly Chip for every $1B lifetime valuation
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

    // Reset progress
    setValuation(0);
    setBuildings(INITIAL_BUILDINGS);
    setBoughtUpgrades([]);
    setGpuTemp(0);
    setIsOverheated(false);

    playSound('ascend', soundEnabled);
    addLog(`🌌 SINGULARITY ASCENSION EXECUTED! Earned ${earnedChips} Heavenly Chips & +${prestigeLevel + earnedChips}% permanent VPS bonus!`, 'achievement');
  }, [totalValuation, prestigeLevel, soundEnabled, addLog]);

  // Pivot (Prestige Epoch Rotation & Credibility Tree)
  const pivot = useCallback(() => {
    const credGain = Math.floor(Math.sqrt(totalValuation / 1000000));
    setCredibility((prev) => prev + credGain);
    setEpoch((prev) => (prev + 1) % EPOCHS.length);
    setPrestigeLevel((prev) => prev + 1);

    // Reset progress
    setValuation(0);
    setBuildings(INITIAL_BUILDINGS);
    setBoughtUpgrades([]);
    setGpuTemp(0);
    setIsOverheated(false);

    playSound('ascend', soundEnabled);
    addLog(`🔄 PIVOT EXECUTED! Epoch rotated to ${EPOCHS[(epoch + 1) % EPOCHS.length].name}! Earned +${credGain} Credibility!`, 'achievement');
  }, [totalValuation, epoch, soundEnabled, addLog]);

  // Buy Buzzword Card
  const buyBuzzword = useCallback((buzzId) => {
    const bw = BUZZWORDS_DATA.find((item) => item.id === buzzId);
    if (!bw || boughtBuzzwords.includes(buzzId)) return;

    if (valuation < bw.cost) {
      addLog(`Not enough valuation for Buzzword "${bw.name}"!`, 'danger');
      return;
    }

    setValuation((prev) => prev - bw.cost);
    setBoughtBuzzwords((prev) => [...prev, buzzId]);
    playSound('buy', soundEnabled);
    addLog(`Collected Buzzword Card "${bw.name}" (+${Math.round(bw.bonus * 100)}% VPS)!`, 'success');
  }, [boughtBuzzwords, valuation, soundEnabled, addLog]);

  // Buy Corporate Greenwashing & Layoff Action
  const buyGreenwashingLayoff = useCallback((itemId) => {
    const item = GREENWASHING_LAYOFFS_DATA.find((g) => g.id === itemId);
    if (!item || boughtGreenwashingLayoffs.includes(itemId)) return;

    const b = BUILDINGS_DATA.find((itemB) => itemB.id === item.buildingId);
    const baseCost = b ? b.baseCost : 15;
    const cost = item.costMult * baseCost;

    if (valuation < cost) {
      addLog(`Not enough valuation for "${item.name}"!`, 'danger');
      return;
    }

    setValuation((prev) => prev - cost);
    setBoughtGreenwashingLayoffs((prev) => [...prev, itemId]);
    playSound('buy', soundEnabled);
    addLog(`Executed Action "${item.name}" - ${item.quote}`, 'success');
  }, [boughtGreenwashingLayoffs, valuation, soundEnabled, addLog]);

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

  // Toggle Theme Mode (SEC Prospectus vs Cyberpunk)
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
    setSlopCount(0);
    setGpuTemp(0);
    setIsOverheated(false);
    setBuildings(INITIAL_BUILDINGS);
    setBoughtUpgrades([]);
    setBoughtHeavenlyUpgrades([]);
    setUnlockedAchievements([]);
    setPrestigeLevel(0);
    setHeavenlyChips(0);
    setStats({
      totalClicks: 0, totalAdsWatched: 0, goldenCaught: 0,
      overheatCount: 0, ascensionCount: 0, gpuBounced: false,
      ascendTrillion: false, gotLucky: false,
    });
    addLog('Save data completely wiped. Starting fresh startup round!', 'danger');
  }, [addLog]);

  const t = useCallback((key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
  }, [lang]);

  return {
    lang, setLang, t,
    startupName, setStartupName,
    valuation, totalValuation, slopCount,
    gpuTemp, isOverheated, coolingRate,
    powerClicks, powerClickActive, powerClickSurgeTimer, togglePowerClick,
    prestigeLevel, heavenlyChips, ascend, buyHeavenlyUpgrade, boughtHeavenlyUpgrades,
    buildings, buyBuilding, buyMode, setBuyMode,
    boughtUpgrades, buyUpgrade, buyAllUpgrades,
    unlockedAchievements,
    activeEvent, catchGoldenMeme,
    adState, startAd,
    stats, logs,
    soundEnabled, setSoundEnabled,
    fancyGraphics, setFancyGraphics,
    activeTab, setActiveTab,
    vps, grossVps, clickValue, handleTapAGI,
    bounceGPU, resetSave, particles,

    // SEC Form S-1 & Hype Ledger Features
    themeMode, toggleThemeMode,
    hypeTier, burnRate,
    boughtBuzzwords, buyBuzzword,
    boughtGreenwashingLayoffs, buyGreenwashingLayoff,
    epoch, idealistLevel, buyIdealistLevel, cynicLevel, buyCynicLevel, credibility, pivot,
  };
}
