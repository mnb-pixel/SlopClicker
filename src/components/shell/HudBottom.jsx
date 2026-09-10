import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ShoppingBag, BarChart2, Settings, Tv, Gift, ThermometerSnowflake } from 'lucide-react';
import { TAB_ROUTES } from '../../routes';
import { formatCurrency } from '../../utils/formatters';

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
  if (isOverheated) {
    const adRunning = adState?.type === 'nitrogen';
    const onCooldown = isAdReady && !isAdReady('nitrogen');
    fireContent = (
      <span className="flex flex-col items-center gap-0.5 leading-tight">
        <span className="hud-nav-label text-rose-200">{tr('gpuOverheated')}</span>
        {adRunning ? (
          <span className="text-[10px] font-mono text-amber-200 animate-pulse">{tr('adPlaying')} ({adState.timer}s)</span>
        ) : onCooldown ? (
          <span className="text-[10px] font-mono opacity-80">
            {tr('hudCoolingShort')} {gpuTemp.toFixed(0)}°C · {tr('instantCoolingCooldown').replace('{sec}', getAdCooldownRemaining ? getAdCooldownRemaining('nitrogen') : 0)}
          </span>
        ) : requestBonus ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); requestBonus('nitrogen'); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); requestBonus('nitrogen'); } }}
            className="text-[10px] font-black uppercase flex items-center gap-1 bg-cyan-400 text-slate-950 px-2 py-0.5 rounded-full"
          >
            {adFree ? <Gift className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
            <ThermometerSnowflake className="w-3 h-3" />
            {adFree ? tr('claimInstantCooling') : tr('watchAdInstantCooling')}
          </span>
        ) : null}
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
        <button
          onClick={onFire}
          disabled={isOverheated}
          className={`hud-nav-btn hud-nav-btn--fire ${isOverheated ? 'is-locked' : ''}`}
        >
          {fireContent}
        </button>
        {navButton(2, tr('tabStore'), ShoppingBag, 'hud-nav-btn--shop', affordableUpgradesCount)}
        {navButton(3, tr('tabStats'), BarChart2, 'hud-nav-btn--small')}
        {navButton(4, tr('hudOptions'), Settings, 'hud-nav-btn--small')}
      </div>
    </div>
  );
}
