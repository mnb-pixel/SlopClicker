import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, ShoppingBag, BarChart2, Settings, Tv, Gift } from 'lucide-react';
import { TAB_ROUTES } from '../../routes';
import { formatCurrency } from '../../utils/formatters';
import { getOverheatRemainingSeconds } from '../../hooks/useGameStore';

// Unteres Overlay der Vollbild-Shell. Ersetzt die Tab-Leiste (NavBar.jsx): zwei große
// Buttons (Feuern, Shop), zwei kleine (Statistik, Optionen), wie im Referenzbild.
//
// FEUERN löst exakt dieselbe Aktion aus wie der Tap auf den Ofen in der Szene. Der
// Button ist nur ein zweites, daumenfreundliches Ziel - die fliegenden Zahlen starten
// trotzdem am Ofen (siehe GameShell.jsx, fireFromFurnace).
//
// Shop/Statistik/Optionen: echte <Link>s im Web-Build (Tab-URLs sind SEO-relevant, siehe
// routes.js), sonst reine State-Buttons - dieselbe Regel wie in der alten NavBar.
export function HudBottom({
  onFire,
  isOverheated,
  overheatedAt = 0,
  coolingRate = 4,
  gpuTemp,
  clickValue,
  activeTab,
  setActiveTab,
  affordableUpgradesCount,
  useRoutes = false,
  adState,
  requestBonus,
  isAdReady,
  getAdCooldownRemaining,
  adFree = false,
  t,
}) {
  const tr = t || ((k) => k);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isOverheated) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [isOverheated]);

  const overheatRemainingSec = isOverheated
    ? getOverheatRemainingSeconds(overheatedAt, gpuTemp, coolingRate, now)
    : 0;

  const navButton = (tabId, label, Icon, extraClass, badge) => {
    const isActive = activeTab === tabId;
    const className = `hud-nav-btn ${extraClass} ${isActive ? 'is-active' : ''}`;
    const content = (
      <>
        <Icon className="hud-nav-icon" />
        <span className="hud-nav-label">{label}</span>
        {badge > 0 && <span className="hud-badge">{badge}</span>}
      </>
    );
    // Aktiver Tab: Klick schließt die Schublade wieder (zurück auf "/").
    const target = isActive ? 1 : tabId;
    return useRoutes ? (
      <Link key={tabId} to={TAB_ROUTES[target]} className={className} aria-label={label} title={label}>
        {content}
      </Link>
    ) : (
      <button key={tabId} onClick={() => setActiveTab(target)} className={className} aria-label={label} title={label}>
        {content}
      </button>
    );
  };

  // Überhitzt: der Feuer-Button wird zum Kühl-Status und bietet die Sofort-Kühlung per
  // Werbespot an - genau der Moment, in dem der Spieler blockiert ist (vorher rote
  // Warnbox in SlopTab.jsx).
  let fireContent;
  const adRunning = adState?.type === 'nitrogen';
  const onCooldown = isAdReady && !isAdReady('nitrogen');
  const adCooldownSec = getAdCooldownRemaining ? getAdCooldownRemaining('nitrogen') : 0;

  const handleCoolNow = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!adRunning && !onCooldown && requestBonus) {
      requestBonus('nitrogen');
    }
  };

  if (isOverheated) {
    fireContent = (
      <span className="hud-fire-overheat">
        <div className="flex items-center justify-center gap-1 max-w-full">
          <span className="hud-nav-label">{tr('gpuOverheated')}</span>
          {overheatRemainingSec > 0 && (
            <span
              className="hud-countdown-pill"
              title={tr('hudCoolingCountdown') ? tr('hudCoolingCountdown').replace('{sec}', overheatRemainingSec) : `${overheatRemainingSec}s`}
            >
              ⏳ {overheatRemainingSec}s
            </span>
          )}
        </div>
        {adRunning ? (
          <span className="text-[10px] font-mono animate-pulse opacity-90">{tr('adPlaying')} ({adState.timer}s)</span>
        ) : onCooldown ? (
          <span className="text-[9px] font-mono opacity-80 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
            {tr('hudCoolingShort')} {gpuTemp.toFixed(0)}°C · Ad: {adCooldownSec}s
          </span>
        ) : requestBonus ? (
          <button
            type="button"
            onClick={handleCoolNow}
            className="hud-cool-chip"
            title={adFree ? tr('claimInstantCooling') : tr('watchAdInstantCooling')}
            aria-label={adFree ? tr('claimInstantCooling') : tr('watchAdInstantCooling')}
          >
            {/* Ein Icon, Kurztext: in die Pille passt genau eine Zeile von rund 110px.
                Das Video-/Geschenk-Icon bleibt (es sagt, was der Klick auslöst), der
                Schneeflocken-Zusatz fiel raus - "kühlen" steht daneben. Der
                ausgeschriebene Satz steht im title/aria-label. */}
            {adFree ? <Gift className="hud-cool-chip__icon" /> : <Tv className="hud-cool-chip__icon" />}
            <span>{tr('hudCoolNow')}</span>
          </button>
        ) : (
          <span className="text-[10px] font-mono opacity-80">
            {tr('hudCoolingShort')} {gpuTemp.toFixed(0)}°C
          </span>
        )}
      </span>
    );
  } else {
    fireContent = (
      <>
        <Flame className="hud-nav-icon hud-nav-icon--big" />
        <span className="flex flex-col items-start leading-tight">
          <span className="hud-nav-label hud-nav-label--big">{tr('hudFire')}</span>
          <span className="text-[10px] font-mono opacity-80">+{formatCurrency(clickValue)}</span>
        </span>
      </>
    );
  }

  return (
    <div className="hud-bottom hud-safe-bottom">
      <div className="hud-bottom__row">
        {isOverheated ? (
          <div
            onClick={handleCoolNow}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleCoolNow(e);
              }
            }}
            role="button"
            tabIndex={0}
            className="hud-nav-btn hud-nav-btn--fire is-locked"
            aria-label={`${tr('gpuOverheated')} (${overheatRemainingSec}s)`}
            title={!adRunning && !onCooldown && requestBonus ? (adFree ? tr('claimInstantCooling') : tr('watchAdInstantCooling')) : undefined}
          >
            {fireContent}
          </div>
        ) : (
          <button
            onClick={onFire}
            className="hud-nav-btn hud-nav-btn--fire"
          >
            {fireContent}
          </button>
        )}
        {navButton(2, tr('tabStore'), ShoppingBag, 'hud-nav-btn--shop', affordableUpgradesCount)}
        {navButton(3, tr('tabStats'), BarChart2, 'hud-nav-btn--small')}
        {navButton(4, tr('hudOptions'), Settings, 'hud-nav-btn--small')}
      </div>
    </div>
  );
}
