import React, { useCallback, useMemo, useRef, useState, useEffect, lazy, Suspense } from 'react';
import { buildTickerText, TICKER_SATIRE_COUNT } from '../../utils/tickerText';
import { HudTop } from './HudTop';
import { HudBottom } from './HudBottom';
import { Drawer } from './Drawer';
import { StoreTab } from '../tabs/StoreTab';
import { StatsTab } from '../tabs/StatsTab';
import { MiscTab } from '../tabs/MiscTab';
import { AdBanner, ADS_ENABLED } from '../AdBanner';

// Die 3D-Insel lädt lazy: Three.js ist ein eigener Chunk, Shop und Statistik sollen
// nicht darauf warten. Solange er lädt, steht nur der Himmel. Ob WebGL überhaupt da
// ist, entscheidet App.jsx (platform/webgl.js) - ohne WebGL wird diese Shell gar nicht
// erst gerendert, sondern die alte Ansicht.
const CampusScene = lazy(() =>
  import('../scene3d/CampusScene').then((m) => ({ default: m.CampusScene }))
);

export function GameShell({
  store,
  affordableUpgradesCount,
  useRoutes,
  onOpenManual,
  onOpenPitchDeck,
  onOpenLegal,
}) {
  const t = store.t;
  const { handleTapAGI } = store;
  const sceneApi = useRef(null);

  // Newsticker-Text für die LED-Tafel am Kapital-Turm: gleiche Quelle wie die
  // HTML-Laufzeile (NewsTicker.jsx), gleiche Satire-Rotation alle 45 Sekunden.
  const [satireOffset, setSatireOffset] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSatireOffset((prev) => prev + TICKER_SATIRE_COUNT), 45000);
    return () => clearInterval(id);
  }, []);
  const tickerText = useMemo(
    () =>
      buildTickerText({
        logs: store.logs,
        lang: store.lang,
        hypeTier: store.hypeTier,
        burnRate: store.burnRate,
        satireOffset,
        t,
      }),
    [store.logs, store.lang, store.hypeTier, store.burnRate, satireOffset, t]
  );

  // Feuer-Button und Ofen sind ein und dieselbe Aktion. Damit die fliegenden Zahlen
  // trotzdem am Ofen starten, wird dem Store die Bildschirmposition der Brennkammer
  // untergeschoben statt der des Buttons. Fällt die Suche aus (Szene noch nicht
  // gerendert), nimmt handleTapAGI schlicht keine Partikelposition - der Tap zählt.
  const fireFromFurnace = useCallback(() => {
    const api = sceneApi.current;
    if (api && api.getFurnaceScreenPos) {
      const pos = api.getFurnaceScreenPos();
      if (api.pulse) api.pulse();
      handleTapAGI(pos || null);
      return;
    }
    // Szene noch nicht geladen: Tap zählt trotzdem, nur ohne Partikelposition.
    handleTapAGI(null);
  }, [handleTapAGI]);

  // Aus der Sammlung (Statistik-Schublade) in den Booster-Kiosk des Shops: Schublade
  // wechseln UND dort den Buzzword-Reiter öffnen. Der Zähler erzwingt das Öffnen auch
  // beim zweiten Mal - der Abschnittsname allein hätte sich nicht geändert.
  const [storeJump, setStoreJump] = useState({ section: 'engines', nonce: 0 });
  const openCardKiosk = useCallback(() => {
    setStoreJump((prev) => ({ section: 'buzzwords', nonce: prev.nonce + 1 }));
    store.setActiveTab(2);
  }, [store]);

  const drawerTab = store.activeTab >= 2 && store.activeTab <= 4 ? store.activeTab : null;
  const drawerTitle =
    drawerTab === 2 ? t('hudDrawerShop') : drawerTab === 3 ? t('hudDrawerStats') : t('hudDrawerMisc');

  return (
    <div className="game-shell">
      {/* Szene füllt die ganze Fläche, Overlays liegen darüber. */}
      <div className="game-shell__scene">
        {(() => {
          const sceneProps = {
            buildings: store.buildings,
            boughtUpgrades: store.boughtUpgrades,
            boughtGreenwashingLayoffs: store.boughtGreenwashingLayoffs,
            vps: store.vps,
            gpuTemp: store.gpuTemp,
            isOverheated: store.isOverheated,
            overheatedAt: store.overheatedAt,
            activeEvent: store.activeEvent,
            powerClickActive: store.powerClickActive,
            bubbleGlitchUntil: store.bubbleGlitchUntil,
            themeMode: store.themeMode,
            lastBlackSwan: store.lastBlackSwan,
            valuation: store.valuation,
            totalValuation: store.totalValuation,
            buyBuilding: store.buyBuilding,
            buyMode: store.buyMode,
            setBuyMode: store.setBuyMode,
            buyUpgrade: store.buyUpgrade,
            buyGreenwashingLayoff: store.buyGreenwashingLayoff,
            handleTapAGI: store.handleTapAGI,
            tickerText,
            hypeTier: store.hypeTier,
            t,
          };
          return (
            <Suspense fallback={<div className="campus-scene" aria-hidden="true" />}>
              <CampusScene ref={sceneApi} {...sceneProps} />
            </Suspense>
          );
        })()}
      </div>

      <HudTop
        startupName={store.startupName}
        setStartupName={store.setStartupName}
        hasAiDomainBonus={store.hasAiDomainBonus}
        valuation={store.valuation}
        vps={store.vps}
        netFlow={store.netFlow}
        gpuTemp={store.gpuTemp}
        isOverheated={store.isOverheated}
        powerClickActive={store.powerClickActive}
        themeMode={store.themeMode}
        hypeTier={store.hypeTier}
        burnRate={store.burnRate}
        onOpenManual={onOpenManual}
        onOpenPitchDeck={onOpenPitchDeck}
        lang={store.lang}
        setLang={store.setLang}
        t={t}
      />

      <HudBottom
        onFire={fireFromFurnace}
        isOverheated={store.isOverheated}
        gpuTemp={store.gpuTemp}
        clickValue={store.clickValue}
        activeTab={store.activeTab}
        setActiveTab={store.setActiveTab}
        affordableUpgradesCount={affordableUpgradesCount}
        useRoutes={useRoutes}
        adState={store.adState}
        requestBonus={store.requestBonus}
        isAdReady={store.isAdReady}
        getAdCooldownRemaining={store.getAdCooldownRemaining}
        adFree={store.adFree}
        t={t}
      />

      {/* Werbe-Slot unter den Buttons. Rendert bei adFree oder abgeschalteter Web-Werbung
          nichts, das native iOS-Banner hat ohnehin kein DOM-Element. */}
      {!store.adFree && ADS_ENABLED && (
        <div className="hud-ad-slot">
          <AdBanner variant="leaderboard" label={t('adPlaceholderLabel')} adFree={store.adFree} />
        </div>
      )}

      <Drawer
        open={drawerTab !== null}
        title={drawerTitle}
        onClose={() => store.setActiveTab(1)}
        useRoutes={useRoutes}
      >
        {drawerTab === 2 && (
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
            buyBoosterPack={store.buyBoosterPack}
            addCardToAlbum={store.addCardToAlbum}
            boughtGreenwashingLayoffs={store.boughtGreenwashingLayoffs}
            buyGreenwashingLayoff={store.buyGreenwashingLayoff}
            stickyTopPx={0}
            key={storeJump.nonce}
            initialSection={storeJump.section}
            t={t}
          />
        )}
        {drawerTab === 3 && (
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
            boughtBuzzwords={store.boughtBuzzwords}
            onOpenCards={openCardKiosk}
            t={t}
          />
        )}
        {drawerTab === 4 && (
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
            showAdPrivacyOptions={store.showAdPrivacyOptions}
            onOpenLegal={onOpenLegal}
            t={t}
            tf={store.tf}
          />
        )}
      </Drawer>
    </div>
  );
}
