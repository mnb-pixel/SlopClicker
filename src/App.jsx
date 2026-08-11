import React, { useState } from 'react';
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
import { PitchDeckModal } from './components/modals/PitchDeckModal';
import { ManualModal } from './components/modals/ManualModal';
import { UPGRADES_DATA } from './data/upgradesData';

export default function App() {
  const store = useGameStore();
  const [isPitchDeckOpen, setIsPitchDeckOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState('desktop'); // 'desktop' (All-in-one) | 'mobile' (5-Tabs)

  // Count affordable upgrades for navbar badge indicator
  const affordableUpgradesCount = UPGRADES_DATA.filter(
    (up) => !store.boughtUpgrades.includes(up.id) && store.valuation >= up.cost
  ).length;

  const isW9Theme = store.themeMode === 'sec_prospectus';

  return (
    <div className={`min-h-screen flex flex-col select-none transition-colors ${
      isW9Theme ? 'sec-w9-theme bg-[#F4F1EA] text-[#0F172A]' : 'bg-slate-950 text-slate-100 font-sans'
    } ${store.activeEvent?.id === 'llm_hallucination' ? 'glitch-mode' : ''}`}>
      {/* Top Status Header */}
      <Header
        startupName={store.startupName}
        setStartupName={store.setStartupName}
        hasAiDomainBonus={store.hasAiDomainBonus}
        valuation={store.valuation}
        vps={store.vps}
        grossVps={store.grossVps}
        slopCount={store.slopCount}
        gpuTemp={store.gpuTemp}
        isOverheated={store.isOverheated}
        powerClicks={store.powerClicks}
        powerClickActive={store.powerClickActive}
        togglePowerClick={store.togglePowerClick}
        layoutMode={layoutMode}
        setLayoutMode={setLayoutMode}
        themeMode={store.themeMode}
        hypeTier={store.hypeTier}
        burnRate={store.burnRate}
        soundEnabled={store.soundEnabled}
        setSoundEnabled={store.setSoundEnabled}
        setActiveTab={store.setActiveTab}
        onOpenManual={() => setIsManualOpen(true)}
        lang={store.lang}
        setLang={store.setLang}
        t={store.t}
      />

      {/* Viewport Fullscreen Floating Golden Meme Banner */}
      <GoldenMemeBanner
        activeEvent={store.activeEvent}
        catchGoldenMeme={store.catchGoldenMeme}
        t={store.t}
      />

      {/* WEB DESKTOP ALL-IN-ONE VIEW (Everything on 1 Page in 3 Columns) */}
      {layoutMode === 'desktop' ? (
        <main className="flex-1 pb-10">
          <DesktopView store={store} setIsPitchDeckOpen={setIsPitchDeckOpen} onOpenManual={() => setIsManualOpen(true)} />
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
                catchGoldenMeme={store.catchGoldenMeme}
                powerClickActive={store.powerClickActive}
                particles={store.particles}
                bounceGPU={store.bounceGPU}
                buildings={store.buildings}
                boughtUpgrades={store.boughtUpgrades}
                boughtGreenwashingLayoffs={store.boughtGreenwashingLayoffs}
                themeMode={store.themeMode}
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
                totalValuation={store.totalValuation}
                prestigeLevel={store.prestigeLevel}
                heavenlyChips={store.heavenlyChips}
                ascend={store.ascend}
                boughtHeavenlyUpgrades={store.boughtHeavenlyUpgrades}
                buyHeavenlyUpgrade={store.buyHeavenlyUpgrade}
                epoch={store.epoch}
                credibility={store.credibility}
                idealistLevel={store.idealistLevel}
                buyIdealistLevel={store.buyIdealistLevel}
                cynicLevel={store.cynicLevel}
                buyCynicLevel={store.buyCynicLevel}
                pivot={store.pivot}
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
                soundEnabled={store.soundEnabled}
                setSoundEnabled={store.setSoundEnabled}
                fancyGraphics={store.fancyGraphics}
                setFancyGraphics={store.setFancyGraphics}
                adState={store.adState}
                startAd={store.startAd}
                onOpenPitchDeck={() => setIsPitchDeckOpen(true)}
                onOpenManual={() => setIsManualOpen(true)}
                resetSave={store.resetSave}
                lang={store.lang}
                setLang={store.setLang}
                t={store.t}
              />
            )}
          </main>

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
        valuation={store.valuation}
        vps={store.vps}
        slopCount={store.slopCount}
        overheatCount={store.stats.overheatCount}
        prestigeLevel={store.prestigeLevel}
      />

      {/* Interactive Form S-1 Game Manual Modal */}
      <ManualModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
      />
    </div>
  );
}
