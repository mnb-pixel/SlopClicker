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
import { LegalModal } from './components/modals/LegalModal';
import { UPGRADES_DATA } from './data/upgradesData';

export default function App() {
  const store = useGameStore();
  const [isPitchDeckOpen, setIsPitchDeckOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  // null | 'impressum' | 'datenschutz' - Rechtstexte als Modal, damit sie aus jeder
  // Ansicht (mobil wie Desktop) über die Einstellungen erreichbar bleiben.
  const [legalPage, setLegalPage] = useState(null);

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
    } ${store.bubbleGlitchUntil ? 'glitch-mode' : ''}`}>
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
        tf={store.tf}
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
        t={store.t}
      />

      {/* AFK-Report (Punkt 1): >=30min inaktiver Tab */}
      <AfkReportModal
        afkReport={store.afkReport}
        adState={store.adState}
        startAd={store.startAd}
        claimAfkBonus={store.claimAfkBonus}
        dismissAfkReport={store.dismissAfkReport}
        t={store.t}
      />

      {/* Geplantes Ad-Popup (Punkt 9) */}
      <ScheduledAdModal
        pendingScheduledAd={store.pendingScheduledAd}
        adState={store.adState}
        watchScheduledAdNow={store.watchScheduledAdNow}
        deferScheduledAd={store.deferScheduledAd}
        scheduledAdPreview={store.scheduledAdPreview}
        t={store.t}
      />

      {/* WEB DESKTOP ALL-IN-ONE VIEW (Everything on 1 Page in 3 Columns) */}
      {layoutMode === 'desktop' ? (
        <main className="flex-1 pb-10">
          <DesktopView store={store} setIsPitchDeckOpen={setIsPitchDeckOpen} onOpenLegal={setLegalPage} />
        </main>
      ) : (
        /* MOBILE 5-TAB VIEW */
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col relative min-h-screen bg-slate-950 border-x border-slate-900 shadow-2xl">
          {/* pb deckt Tab-Leiste (56px) + Werbe-Anker (~65px) ab, damit der letzte
              Listeneintrag nicht hinter der unteren Leiste verschwindet. */}
          <main className="flex-1 pb-32">
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
                onOpenLegal={setLegalPage}
                t={store.t}
              />
            )}
          </main>

          {/* Statischer Werbe-Slot, fix über der Tab-Leiste verankert. Vorher lag er im
              normalen Flow hinter der fixierten NavBar und damit dauerhaft unter der Falz -
              der Slot war in JEDEM Scroll-Zustand unsichtbar und lieferte null Impressions.
              pointer-events: der Abstandsrahmen bleibt klickdurchlässig, nur die Anzeigefläche
              selbst nimmt Klicks entgegen, damit Fehltaps Richtung Tab-Leiste ins Leere gehen. */}
          <div className="fixed bottom-14 left-0 right-0 z-20 max-w-md mx-auto px-3 pt-1.5 pb-2 bg-slate-950/90 backdrop-blur-sm border-t border-slate-800/60 pointer-events-none">
            <div className="pointer-events-auto">
              <AdBanner variant="leaderboard" label={store.t('adPlaceholderLabel')} />
            </div>
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

      {/* Impressum / Datenschutzerklärung */}
      <LegalModal page={legalPage} onClose={() => setLegalPage(null)} lang={store.lang} />

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
        lang={store.lang}
        t={store.t}
      />

      {/* Interactive Form S-1 Game Manual Modal */}
      <ManualModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        lang={store.lang}
      />
    </div>
  );
}
