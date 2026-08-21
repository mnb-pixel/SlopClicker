import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
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
import { ClickParticles } from './components/ClickParticles';
import { AdBanner, ADS_ENABLED } from './components/AdBanner';
import { SeoContent } from './components/SeoContent';
import { LegalFooter } from './components/LegalFooter';
import { OfflineEarningsModal } from './components/modals/OfflineEarningsModal';
import { AfkReportModal } from './components/modals/AfkReportModal';
import { ScheduledAdModal } from './components/modals/ScheduledAdModal';
import { TrackingExplainerModal } from './components/modals/TrackingExplainerModal';
import { showNativeBanner, hideNativeBanner } from './monetization/nativeBanner';
import { isCrazyGamesBuild } from './monetization/crazyGamesSdk';
import { UPGRADES_DATA } from './data/upgradesData';
import { ROUTE_TABS } from './routes';

// Lazy geladen statt statisch importiert: alle drei sind reine Klick-zum-Öffnen-Overlays,
// die die meisten Sessions nie aufrufen. ShareScreen allein zieht canvas-confetti plus
// ~1000 Zeilen Canvas-Zeichenlogik (pitchDeckCanvas/Consulting/Shared.js) mit - das lud
// bisher jede Sitzung ungefragt mit, auch wenn "Teilen" nie geklickt wird. Named statt
// Default-Export -> .then()-Mapping ist der Standard-Weg, React.lazy() das zu erlauben.
const ShareScreen = lazy(() =>
  import('./components/screens/ShareScreen').then((m) => ({ default: m.ShareScreen }))
);
const ManualModal = lazy(() =>
  import('./components/modals/ManualModal').then((m) => ({ default: m.ManualModal }))
);
const LegalModal = lazy(() =>
  import('./components/modals/LegalModal').then((m) => ({ default: m.LegalModal }))
);

export default function App() {
  const store = useGameStore();
  const [isShareScreenOpen, setIsShareScreenOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  // null | 'impressum' | 'datenschutz' - Rechtstexte als Modal, damit sie aus jeder
  // Ansicht (mobil wie Desktop) über die Einstellungen erreichbar bleiben.
  const [legalPage, setLegalPage] = useState(null);

  const isNativePlatform = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();
  // Echte Tab-Routen nur im reinen Web-Build (siehe routes.js) - CrazyGames hostet unter
  // einem fremden, zur Buildzeit unbekannten Unterpfad (absolute Pfade wie "/shop" würden
  // dort auf die CrazyGames-Domain-Wurzel zeigen statt ins Spiel), die iOS-App braucht
  // ohnehin keine URLs. BrowserRouter selbst ist in main.jsx trotzdem immer aktiv (siehe
  // dort) - hier wird nur entschieden, ob NavBar echte <Link>s rendert und ob die Route
  // den activeTab-State treibt.
  const useRoutes = !isNativePlatform && !isCrazyGamesBuild();
  const location = useLocation();
  useEffect(() => {
    if (!useRoutes) return;
    const tabFromRoute = ROUTE_TABS[location.pathname];
    if (tabFromRoute && tabFromRoute !== store.activeTab) {
      store.setActiveTab(tabFromRoute);
    }
  }, [location.pathname]);

  // Natives AdMob-Banner (kein DOM-Element, siehe AdBanner.jsx) folgt adFree. Auf Web ist
  // showNativeBanner/hideNativeBanner ein No-Op.
  useEffect(() => {
    if (store.adFree) {
      hideNativeBanner();
    } else {
      showNativeBanner();
    }
  }, [store.adFree]);

  // Live gemessene Header-Höhe (statt fest verdrahtetem px-Wert): der Header wechselt seine
  // Höhe je nach Zustand (SEC-Theme blendet eine zusätzliche Banner-Zeile ein, ein langer
  // Startup-Name kann umbrechen). Ein sticky-Element, das direkt UNTER dem ebenfalls
  // sticky Header andocken soll (z.B. die Store-Unterkategorien-Leiste auf Mobile, wo
  // beide relativ zum Dokument-Scroll positioniert sind), braucht diesen Wert als "top".
  const headerWrapRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    const el = headerWrapRef.current;
    if (!el) return undefined;
    // getBoundingClientRect() statt entries[0].contentRect: ResizeObserver liefert per
    // Default die Content-Box OHNE Padding/Border, der Header hat aber p-3 + border-b -
    // contentRect wäre um genau diese ~25px zu klein und die Leiste würde teilweise
    // unter dem Header verschwinden statt direkt darunter anzudocken.
    const ro = new ResizeObserver(() => setHeaderHeight(el.getBoundingClientRect().height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
      {/* Top Status Header. ref geht direkt an das <header>-Element (siehe forwardRef in
          Header.jsx) - ein umschließender Wrapper-Div hier würde position:sticky brechen. */}
      <Header
        ref={headerWrapRef}
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
        onOpenShare={() => setIsShareScreenOpen(true)}
        lang={store.lang}
        setLang={store.setLang}
        logs={store.logs}
        showAdSlot={layoutMode === 'desktop'}
        adFree={store.adFree}
        t={store.t}
      />

      {/* Viewport Fullscreen Floating Golden Meme Banner */}
      <GoldenMemeBanner
        activeEvent={store.activeEvent}
        dismissEvent={store.dismissEvent}
        adState={store.adState}
        requestBonus={store.requestBonus}
        isAdReady={store.isAdReady}
        adFree={store.adFree}
        t={store.t}
        tf={store.tf}
      />

      <AdRewardToast
        adRewardToast={store.adRewardToast}
        dismissAdRewardToast={store.dismissAdRewardToast}
      />

      <ClickParticles particles={store.particles} />

      {/* Willkommen-zurück Offline-Ertrag Screen */}
      <OfflineEarningsModal
        offlineReport={store.offlineReport}
        adState={store.adState}
        requestBonus={store.requestBonus}
        claimOfflineEarnings={store.claimOfflineEarnings}
        dismissOfflineEarnings={store.dismissOfflineEarnings}
        adFree={store.adFree}
        t={store.t}
      />

      {/* AFK-Report (Punkt 1): >=30min inaktiver Tab */}
      <AfkReportModal
        afkReport={store.afkReport}
        adState={store.adState}
        requestBonus={store.requestBonus}
        claimAfkBonus={store.claimAfkBonus}
        dismissAfkReport={store.dismissAfkReport}
        adFree={store.adFree}
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

      {/* ATT-Erklärbildschirm vor dem System-Tracking-Prompt (Punkt 6) */}
      <TrackingExplainerModal
        open={store.trackingExplainer}
        onConfirm={store.confirmTrackingExplainer}
        t={store.t}
      />

      {/* WEB DESKTOP ALL-IN-ONE VIEW (Everything on 1 Page in 3 Columns) */}
      {layoutMode === 'desktop' ? (
        <main className="flex-1 pb-10">
          <DesktopView store={store} onOpenLegal={setLegalPage} />
        </main>
      ) : (
        /* MOBILE 5-TAB VIEW */
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col relative min-h-screen bg-slate-950 border-x border-slate-900 shadow-2xl">
          {/* pb deckt Tab-Leiste (56px) + Werbe-Anker (~65px) ab, damit der letzte
              Listeneintrag nicht hinter der unteren Leiste verschwindet. Mit adFree entfällt
              der Werbe-Anker (siehe unten), daher reicht dann die kleinere Tab-Leisten-Höhe. */}
          <main className={`flex-1 ${store.adFree || !ADS_ENABLED ? 'pb-16' : 'pb-32'}`}>
            {store.activeTab === 1 && (
              <SlopTab
                handleTapAGI={store.handleTapAGI}
                isOverheated={store.isOverheated}
                gpuTemp={store.gpuTemp}
                clickValue={store.clickValue}
                activeEvent={store.activeEvent}
                powerClickActive={store.powerClickActive}
                bounceGPU={store.bounceGPU}
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
                stickyTopPx={headerHeight}
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
                requestBonus={store.requestBonus}
                isAdReady={store.isAdReady}
                getAdCooldownRemaining={store.getAdCooldownRemaining}
                pendingAscendBoost={store.pendingAscendBoost}
                pendingPivotBoost={store.pendingPivotBoost}
                adFree={store.adFree}
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
                adFree={store.adFree}
                t={store.t}
              />
            )}

            {store.activeTab === 5 && (
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
            )}

            {/* Pro Tab EIGENER, thematisch passender Beschreibungstext statt ein einziger
                Block nur auf dem Start-Tab - siehe SeoContent.jsx (section-Prop) und
                routes.js. Grund: Google hat token-furnace.com wiederholt mit "low value
                content" abgelehnt, obwohl auf "/" bereits echter Text stand - eine Domain
                mit nur EINER crawlbaren URL wirkt trotzdem wie eine Dünnschicht-Seite. Mit
                useRoutes bekommt jeder Tab jetzt eine eigene URL (routes.js) UND eigenen,
                zur Route passenden Content, statt denselben Block fünffach zu wiederholen.
                Nur Web UND nicht CrazyGames/nativ (== useRoutes): in der iOS-App (AdMob,
                App-Store-Review) und auf CrazyGames' eigener Spieleseite ist der Text nur
                unnötiger Platz unter dem eigentlichen Spiel. */}
            {useRoutes && (
              <div className="mx-3 mt-4 bg-slate-900/60 rounded-xl border border-slate-800 p-3 text-xs text-slate-400 leading-relaxed">
                {store.activeTab === 1 && <SeoContent t={store.t} lang={store.lang} compact section="home" />}
                {store.activeTab === 2 && <SeoContent t={store.t} lang={store.lang} compact section="shop" />}
                {store.activeTab === 3 && <SeoContent t={store.t} lang={store.lang} compact section="special" />}
                {store.activeTab === 4 && <SeoContent t={store.t} lang={store.lang} compact section="stats" />}
              </div>
            )}

            {/* Pflichtlinks auf JEDEM Tab statt nur im Einstellungen-Tab versteckt - siehe
                LegalFooter.jsx. Unconditional (nicht an activeTab gekoppelt), damit das
                Impressum von jeder Ansicht aus per Scroll erreichbar ist, nicht erst nach
                einem Tab-Wechsel. */}
            <LegalFooter
              onOpenLegal={setLegalPage}
              purchaseAvailable={store.purchaseAvailable}
              adFree={store.adFree}
              showAdPrivacyOptions={store.showAdPrivacyOptions}
              t={store.t}
            />
          </main>

          {/* Statischer Werbe-Slot, fix über der Tab-Leiste verankert. Vorher lag er im
              normalen Flow hinter der fixierten NavBar und damit dauerhaft unter der Falz -
              der Slot war in JEDEM Scroll-Zustand unsichtbar und lieferte null Impressions.
              pointer-events: der Abstandsrahmen bleibt klickdurchlässig, nur die Anzeigefläche
              selbst nimmt Klicks entgegen, damit Fehltaps Richtung Tab-Leiste ins Leere gehen.
              Mit adFree rendert AdBanner selbst null - der Abstandsrahmen bliebe sonst als
              leere Lücke stehen, deshalb fällt er hier komplett weg. */}
          {!store.adFree && ADS_ENABLED && (
            <div className="fixed ad-anchor-safe-bottom left-0 right-0 z-20 max-w-md mx-auto px-3 pt-1.5 pb-2 bg-slate-950/90 backdrop-blur-sm border-t border-slate-800/60 pointer-events-none">
              <div className="pointer-events-auto">
                <AdBanner variant="leaderboard" label={store.t('adPlaceholderLabel')} adFree={store.adFree} />
              </div>
            </div>
          )}

          {/* 5-Tab Navigation Bar */}
          <NavBar
            activeTab={store.activeTab}
            setActiveTab={store.setActiveTab}
            affordableUpgradesCount={affordableUpgradesCount}
            useRoutes={useRoutes}
            t={store.t}
          />
        </div>
      )}

      {/* fallback=null: alle drei sind Klick-zum-Öffnen-Overlays, die davor ohnehin nichts
          rendern (isOpen/page ist erst nach dem Klick gesetzt) - ein kurzer Moment ohne
          sichtbaren Ladeindikator ist hier unauffälliger als ein Spinner-Flackern. */}
      <Suspense fallback={null}>
        {/* Impressum / Datenschutzerklärung */}
        <LegalModal page={legalPage} onClose={() => setLegalPage(null)} lang={store.lang} />

        {/* VC Pitch Deck Share Screen */}
        <ShareScreen
          isOpen={isShareScreenOpen}
          onClose={() => setIsShareScreenOpen(false)}
          startupName={store.startupName}
          hasAiDomainBonus={store.hasAiDomainBonus}
          valuation={store.valuation}
          totalValuation={store.totalValuation}
          vps={store.vps}
          slopCount={store.slopCount}
          overheatCount={store.stats.overheatCount}
          prestigeLevel={store.prestigeLevel}
          hypeTier={store.hypeTier}
          buildings={store.buildings}
          unlockedAchievements={store.unlockedAchievements}
          boughtBuzzwords={store.boughtBuzzwords}
          adFree={store.adFree}
          lang={store.lang}
          t={store.t}
        />

        {/* Interactive Form S-1 Game Manual Modal */}
        <ManualModal
          isOpen={isManualOpen}
          onClose={() => setIsManualOpen(false)}
          lang={store.lang}
        />
      </Suspense>
    </div>
  );
}
