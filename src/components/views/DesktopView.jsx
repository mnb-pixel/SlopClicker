import React from 'react';
import { SlopTab } from '../tabs/SlopTab';
import { StoreTab } from '../tabs/StoreTab';
import { StatsTab } from '../tabs/StatsTab';
import { MiscTab } from '../tabs/MiscTab';
import { SeoContent } from '../SeoContent';
import { LegalFooter } from '../LegalFooter';
import { isCrazyGamesBuild } from '../../monetization/crazyGamesSdk';

export function DesktopView({ store, onOpenLegal, useRoutes = false }) {
  return (
    <>
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
          requestBonus={store.requestBonus}
          isAdReady={store.isAdReady}
          getAdCooldownRemaining={store.getAdCooldownRemaining}
          adFree={store.adFree}
          t={store.t}
        />
      </div>

        {/* Der frühere Rectangle-Slot lag hier unter dem Clicker. Er ist in die Kopfzeile
            neben die Bewertung gewandert (siehe Header.jsx): diese Spalte ist zwar sticky,
            ihr Inhalt (Panel + 250px Anzeige) überschritt aber auf niedrigen Laptop-
            Displays die Viewport-Höhe, wodurch der Slot unten abgeschnitten wurde. Der
            Header ist dauerhaft und vollständig sichtbar. */}
      </div>

      {/* CENTER COLUMN: Rewards/Misc zuoberst (meistgenutzte Aktion - Belohnungs-Werbung
          claimen), darunter Stats/Logs/Achievements (4 cols) */}
      <div className="md:col-span-4 flex flex-col gap-4">
        {/* Ads, Pitch Deck & Misc Settings (enthält den Belohnungs-Werbung-Bereich) */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-2 shadow-xl">
          <MiscTab
            adState={store.adState}
            requestBonus={store.requestBonus}
            isAdReady={store.isAdReady}
            getAdCooldownRemaining={store.getAdCooldownRemaining}
            resetSave={store.resetSave}
            exportSave={store.exportSave}
            importSave={store.importSave}
            scheduledAdUnlocked={store.scheduledAdUnlocked}
            claimUnlockedScheduledAd={store.claimUnlockedScheduledAd}
            grantAdPreview={store.grantAdPreview}
            scheduledAdPreview={store.scheduledAdPreview}
            adFree={store.adFree}
            adFreeProduct={store.adFreeProduct}
            purchaseAvailable={store.purchaseAvailable}
            purchaseState={store.purchaseState}
            purchaseAdFree={store.purchaseAdFree}
            restorePurchases={store.restorePurchases}
            t={store.t}
            tf={store.tf}
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
            adFree={store.adFree}
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

    {/* Dauerhaft sichtbarer Beschreibungstext (kein Modal, kein Pre-Hydration-Fallback) -
        AUSSERHALB des Grids oben: innerhalb des Grids überlappte die Box beim Scrollen die
        noch "sticky" linke/rechte Spalte, weil deren Zellenhöhe (gedeckelt per max-h) weit
        unter der Zeilenhöhe (bestimmt durch die viel längere mittlere Spalte) liegt. Rein
        für den AdSense-Site-Review gedacht (siehe SeoContent.jsx, AdBanner.jsx) - DesktopView
        läuft ohnehin nur im Web-Layout, nie in der iOS-App. NICHT im CrazyGames-Build: der
        Block existiert einzig, damit Googles AdSense-Crawler auf token-furnace.com echten
        Content sieht - auf CrazyGames' eigener Spieleseite ist er nur unnötiger Ballast
        unter dem eigentlichen Spiel. */}
    {!isCrazyGamesBuild() && (
      <div className="w-full max-w-3xl mx-auto p-4 pt-0">
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-4 text-sm text-slate-400 leading-relaxed">
          <SeoContent t={store.t} lang={store.lang} />
        </div>
      </div>
    )}

    {/* Pflichtlinks einmal für die gesamte Ein-Seiten-Ansicht, statt nur im Einstellungen-
        Panel versteckt - siehe LegalFooter.jsx. */}
    <LegalFooter
      onOpenLegal={onOpenLegal}
      purchaseAvailable={store.purchaseAvailable}
      adFree={store.adFree}
      showAdPrivacyOptions={store.showAdPrivacyOptions}
      useRoutes={useRoutes}
      t={store.t}
    />
    </>
  );
}
