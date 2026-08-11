import React, { useState, useEffect } from 'react';
import { useGameStore } from './hooks/useGameStore';
import { Header } from './components/Header';
import { NavBar } from './components/NavBar';
import { DesktopView } from './components/views/DesktopView';
import { SlopTab } from './components/tabs/SlopTab';
import { StoreTab } from './components/tabs/StoreTab';
import { SpecialTab } from './components/tabs/SpecialTab';
import { StatsTab } from './components/tabs/StatsTab';
import { MiscTab } from './components/tabs/MiscTab';
import { GoldenMemeBanner } from './components/GoldenMemeBanner';
import { AdRewardToast } from './components/AdRewardToast';
import { AdBanner } from './components/AdBanner';
import { PitchDeckModal } from './components/modals/PitchDeckModal';
import { ManualModal } from './components/modals/ManualModal';
import { OfflineEarningsModal } from './components/modals/OfflineEarningsModal';
import { AfkReportModal } from './components/modals/AfkReportModal';
import { ScheduledAdModal } from './components/modals/ScheduledAdModal';
import { UPGRADES_DATA } from './data/upgradesData';

export default function App() {
  const store = useGameStore();
  const [isPitchDeckOpen, setIsPitchDeckOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);

  // Automatische View-Erkennung (Punkt 8): Mobile Geräte bekommen automatisch die
  // 5-Tab-Ansicht, Desktop/PC automatisch die All-in-One-Ansicht - kein manueller Button mehr.
  const detectLayoutMode = () => {
    if (typeof window === 'undefined') return 'desktop';
    const isMobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
    return (isMobileUA || window.innerWidth <= 768) ? 'mobile' : 'desktop';
  };
  const [layoutMode, setLayoutMode] = useState(detectLayoutMode);

  useEffect(() => {
    const handleResize = () => setLayoutMode(detectLayoutMode());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Count affordable upgrades for navbar badge indicator
  const affordableUpgradesCount = UPGRADES_DATA.filter(
    (up) => !store.boughtUpgrades.includes(up.id) && store.valuation >= up.cost
  ).length;

  const isW9Theme = store.themeMode === 'sec_prospectus';

  return (
    <div className={`min-h-screen flex flex-col select-none transition-colors ${
      isW9Theme ? 'sec-w9-theme bg-[#F4F1EA] text-[#0F172A]' : 'bg-slate-950 text-slate-100 font-sans'
    } ${store.activeEvent?.kind === 'bubble' ? 'glitch-mode' : ''}`}>
      {/* Top Status Header */}
      <Header
        startupName={store.startupName}
        setStartupName={store.setStartupName}
        hasAiDomainBonus={store.hasAiDomainBonus}
        valuation={store.valuation}
        vps={store.vps}
        grossVps={store.grossVps}
        netFlow={store.netFlow}
        slopCount={store.slopCount}
        gpuTemp={store.gpuTemp}
        isOverheated={store.isOverheated}
        powerClicks={store.powerClicks}
        powerClickActive={store.powerClickActive}
        togglePowerClick={store.togglePowerClick}
        themeMode={store.themeMode}
        hypeTier={store.hypeTier}
        burnRate={store.burnRate}
        onOpenManual={() => setIsManualOpen(true)}
        onOpenPitchDeck={() => setIsPitchDeckOpen(true)}
        lang={store.lang}
        setLang={store.setLang}
        logs={store.logs}
        t={store.t}
      />

      {/* Viewport Fullscreen Floating Golden Meme Banner */}
      <GoldenMemeBanner
        activeEvent={store.activeEvent}
        dismissEvent={store.dismissEvent}
        adState={store.adState}
        startAd={store.startAd}
        isAdReady={store.isAdReady}
        t={store.t}
      />

      <AdRewardToast
        adRewardToast={store.adRewardToast}
        dismissAdRewardToast={store.dismissAdRewardToast}
      />

      {/* Willkommen-zurück Offline-Ertrag Screen */}
      <OfflineEarningsModal
        offlineReport={store.offlineReport}
        adState={store.adState}
        startAd={store.startAd}
        claimOfflineEarnings={store.claimOfflineEarnings}
      />

      {/* AFK-Report (Punkt 1): >=30min inaktiver Tab */}
      <AfkReportModal
        afkReport={store.afkReport}
        adState={store.adState}
        startAd={store.startAd}
        claimAfkBonus={store.claimAfkBonus}
        dismissAfkReport={store.dismissAfkReport}
      />

      {/* Geplantes Ad-Popup (Punkt 9) */}
      <ScheduledAdModal
        pendingScheduledAd={store.pendingScheduledAd}
        adState={store.adState}
        watchScheduledAdNow={store.watchScheduledAdNow}
        deferScheduledAd={store.deferScheduledAd}
        scheduledAdPreview={store.scheduledAdPreview}
      />

      {/* WEB DESKTOP ALL-IN-ONE VIEW (Everything on 1 Page in 3 Columns) */}
      {layoutMode === 'desktop' ? (
        <main className="flex-1 pb-10">
          <DesktopView store={store} setIsPitchDeckOpen={setIsPitchDeckOpen} />
        </main>
      ) : (
        /* MOBILE 5-TAB VIEW */
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col relative min-h-screen bg-slate-950 border-x border-slate-900 shadow-2xl">
          <main className="flex-1 pb-16">
            {store.activeTab === 1 && (
              <SlopTab
                handleTapAGI={store.handleTapAGI}
                isOverheated={store.isOverheated}
                gpuTemp={store.gpuTemp}
                clickValue={store.clickValue}
                activeEvent={store.activeEvent}
                powerClickActive={store.powerClickActive}
                particles={store.particles}
                bounceGPU={store.bounceGPU}
                buildings={store.buildings}
                boughtUpgrades={store.boughtUpgrades}
                boughtGreenwashingLayoffs={store.boughtGreenwashingLayoffs}
                themeMode={store.themeMode}
                adState={store.adState}
                startAd={store.startAd}
                isAdReady={store.isAdReady}
                getAdCooldownRemaining={store.getAdCooldownRemaining}
                t={store.t}
              />
            )}

            {store.activeTab === 2 && (
              <StoreTab
                valuation={store.valuation}
                buildings={store.buildings}
                buyBuilding={store.buyBuilding}
                buyMode={store.buyMode}
                setBuyMode={store.setBuyMode}
                boughtUpgrades={store.boughtUpgrades}
                unlockedUpgrades={store.unlockedUpgrades}
                buyUpgrade={store.buyUpgrade}
                buyAllUpgrades={store.buyAllUpgrades}
                totalValuation={store.totalValuation}
                boughtBuzzwords={store.boughtBuzzwords}
                buyBuzzword={store.buyBuzzword}
                buyBoosterPack={store.buyBoosterPack}
                addCardToAlbum={store.addCardToAlbum}
                boughtGreenwashingLayoffs={store.boughtGreenwashingLayoffs}
                buyGreenwashingLayoff={store.buyGreenwashingLayoff}
                t={store.t}
              />
            )}

            {store.activeTab === 3 && (
              <SpecialTab
                prestigeLevel={store.prestigeLevel}
                heavenlyChips={store.heavenlyChips}
                ascend={store.ascend}
                pendingHeavenlyChips={store.pendingHeavenlyChips}
                boughtHeavenlyUpgrades={store.boughtHeavenlyUpgrades}
                buyHeavenlyUpgrade={store.buyHeavenlyUpgrade}
                epoch={store.epoch}
                credibility={store.credibility}
                idealistLevel={store.idealistLevel}
                buyIdealistLevel={store.buyIdealistLevel}
                cynicLevel={store.cynicLevel}
                buyCynicLevel={store.buyCynicLevel}
                pivot={store.pivot}
                pivotCredGain={store.pivotCredGain}
                adState={store.adState}
                startAd={store.startAd}
                isAdReady={store.isAdReady}
                getAdCooldownRemaining={store.getAdCooldownRemaining}
                pendingAscendBoost={store.pendingAscendBoost}
                pendingPivotBoost={store.pendingPivotBoost}
                t={store.t}
              />
            )}

            {store.activeTab === 4 && (
              <StatsTab
                stats={store.stats}
                valuation={store.valuation}
                totalValuation={store.totalValuation}
                vps={store.vps}
                clickValue={store.clickValue}
                slopCount={store.slopCount}
                unlockedAchievements={store.unlockedAchievements}
                logs={store.logs}
                t={store.t}
              />
            )}

            {store.activeTab === 5 && (
              <MiscTab
                adState={store.adState}
                startAd={store.startAd}
                isAdReady={store.isAdReady}
                getAdCooldownRemaining={store.getAdCooldownRemaining}
                resetSave={store.resetSave}
                scheduledAdUnlocked={store.scheduledAdUnlocked}
                claimUnlockedScheduledAd={store.claimUnlockedScheduledAd}
                grantAdPreview={store.grantAdPreview}
                scheduledAdPreview={store.scheduledAdPreview}
              />
            )}
          </main>

          {/* Statischer Werbe-Slot (Banner) über der Tab-Leiste */}
          <div className="px-3 pb-2">
            <AdBanner variant="leaderboard" label="Werbung" />
          </div>

          {/* 5-Tab Navigation Bar */}
          <NavBar
            activeTab={store.activeTab}
            setActiveTab={store.setActiveTab}
            affordableUpgradesCount={affordableUpgradesCount}
            t={store.t}
          />
        </div>
      )}

      {/* VC Pitch Deck Export Modal */}
      <PitchDeckModal
        isOpen={isPitchDeckOpen}
        onClose={() => setIsPitchDeckOpen(false)}
        startupName={store.startupName}
        hasAiDomainBonus={store.hasAiDomainBonus}
        valuation={store.valuation}
        vps={store.vps}
        slopCount={store.slopCount}
        overheatCount={store.stats.overheatCount}
        prestigeLevel={store.prestigeLevel}
        hypeTier={store.hypeTier}
        buildings={store.buildings}
        unlockedAchievements={store.unlockedAchievements}
        boughtBuzzwords={store.boughtBuzzwords}
        t={store.t}
      />

      {/* Interactive Form S-1 Game Manual Modal */}
      <ManualModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
      />
    </div>
  );
}
