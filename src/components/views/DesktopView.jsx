import React from 'react';
import { SlopTab } from '../tabs/SlopTab';
import { StoreTab } from '../tabs/StoreTab';
import { SpecialTab } from '../tabs/SpecialTab';
import { StatsTab } from '../tabs/StatsTab';
import { MiscTab } from '../tabs/MiscTab';

export function DesktopView({ store, setIsPitchDeckOpen, onOpenLegal }) {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
      {/* LEFT COLUMN: Main GPU Clicker, Heat Bar, Golden Memes, Owned Visual Items Grid (4 cols) */}
      <div className="md:col-span-4 flex flex-col gap-4 sticky top-20">
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-3 shadow-xl">
        <h2 className="text-xs font-black uppercase tracking-wider text-cyan-400 mb-2 text-center border-b border-slate-800 pb-2">
          ⚡ {store.t('agiCoreGeneratorTitle')}
        </h2>
        <SlopTab
          handleTapAGI={store.handleTapAGI}
          isOverheated={store.isOverheated}
          gpuTemp={store.gpuTemp}
          clickValue={store.clickValue}
          activeEvent={store.activeEvent}
          powerClickActive={store.powerClickActive}
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
      </div>

        {/* Der frühere Rectangle-Slot lag hier unter dem Clicker. Er ist in die Kopfzeile
            neben die Bewertung gewandert (siehe Header.jsx): diese Spalte ist zwar sticky,
            ihr Inhalt (Panel + 250px Anzeige) überschritt aber auf niedrigen Laptop-
            Displays die Viewport-Höhe, wodurch der Slot unten abgeschnitten wurde. Der
            Header ist dauerhaft und vollständig sichtbar. */}
      </div>

      {/* CENTER COLUMN: Special Ascension, Stats, Logs, Achievements, Misc (4 cols) */}
      <div className="md:col-span-4 flex flex-col gap-4">
        {/* Special Ascension */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-2 shadow-xl">
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
        </div>

        {/* Stats, Logs & Achievements */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-2 shadow-xl">
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
        </div>

        {/* Ads, Pitch Deck & Misc Settings */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-2 shadow-xl">
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
            onOpenLegal={onOpenLegal}
            t={store.t}
          />
        </div>
      </div>

      {/* RIGHT COLUMN: Store (Buildings & Upgrades) (4 cols) */}
      <div className="md:col-span-4 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-2 shadow-xl sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto">
        <h2 className="text-xs font-black uppercase tracking-wider text-cyan-400 p-2 text-center border-b border-slate-800">
          🏬 {store.t('infraShopTitle')}
        </h2>
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
          // 0, nicht die globale Header-Höhe: diese Spalte scrollt in ihrem EIGENEN
          // overflow-y-auto-Container statt mit der Seite, der App-Header liegt außerhalb
          // davon - die Unterkategorien-Leiste soll direkt an dessen eigenem Rand andocken.
          stickyTopPx={0}
          t={store.t}
        />
      </div>
    </div>
  );
}
