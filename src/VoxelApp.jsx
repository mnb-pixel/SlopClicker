import React, { useState, lazy, Suspense } from 'react';
import { useGameStore } from './hooks/useGameStore';
import { GameShell } from './components/shell/GameShell';
import { GoldenMemeBanner } from './components/GoldenMemeBanner';
import { AdRewardToast } from './components/AdRewardToast';
import { ClickParticles } from './components/ClickParticles';
import { OfflineEarningsModal } from './components/modals/OfflineEarningsModal';
import { AfkReportModal } from './components/modals/AfkReportModal';
import { ScheduledAdModal } from './components/modals/ScheduledAdModal';
import { TrackingExplainerModal } from './components/modals/TrackingExplainerModal';
import { hasWebGL } from './platform/webgl';
import { UPGRADES_DATA } from './data/upgradesData';

// Versteckte Testseite /voxel: dieselbe Spiellogik (useGameStore, derselbe Spielstand),
// aber die 3D-Vollbild-Shell aus dem CrazyGames-Repo statt Kopfzeile + Tabs. App.jsx
// (/play) und die Content-Website bleiben davon vollständig unberührt - deshalb eine
// eigene Wurzelkomponente statt eines Schalters in App.jsx.
//
// useRoutes ist hier bewusst fest false: die Schubladen (Shop/Statistik/Einstellungen)
// laufen rein über activeTab, ohne die URL zu verändern. Die Tab-Routen aus routes.js
// zeigen auf /play/* - würde die Shell die benutzen, verließe ein Klick auf "Shop" die
// Testseite und landete in der alten Ansicht.

// Wie in App.jsx: reine Klick-zum-Öffnen-Overlays, die die meisten Sitzungen nie öffnen.
const ShareScreen = lazy(() =>
  import('./components/screens/ShareScreen').then((m) => ({ default: m.ShareScreen }))
);
const ManualModal = lazy(() =>
  import('./components/modals/ManualModal').then((m) => ({ default: m.ManualModal }))
);
const LegalModal = lazy(() =>
  import('./components/modals/LegalModal').then((m) => ({ default: m.LegalModal }))
);

export default function VoxelApp() {
  const store = useGameStore();
  const [isShareScreenOpen, setIsShareScreenOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [legalPage, setLegalPage] = useState(null);

  const affordableUpgradesCount = UPGRADES_DATA.filter(
    (up) => !store.boughtUpgrades.includes(up.id) && store.valuation >= up.cost
  ).length;

  // Ohne WebGL gibt es hier nichts zu testen. Statt still auf die alte Ansicht
  // zurückzufallen (das ist ja gerade das, was diese Seite NICHT zeigen soll) ein
  // klarer Hinweis mit Verweis auf das normale Spiel.
  if (!hasWebGL()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-lg font-black uppercase tracking-wider text-cyan-400">
            3D-Testansicht
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Dieser Browser meldet kein WebGL - die 3D-Szene kann deshalb nicht dargestellt
            werden. Die normale Spielansicht funktioniert unabhängig davon.
          </p>
          <a
            href="/play"
            className="inline-block px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black text-sm"
          >
            Zum Spiel
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`select-none ${store.bubbleGlitchUntil ? 'glitch-mode' : ''}`}>
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

      <OfflineEarningsModal
        offlineReport={store.offlineReport}
        adState={store.adState}
        requestBonus={store.requestBonus}
        claimOfflineEarnings={store.claimOfflineEarnings}
        dismissOfflineEarnings={store.dismissOfflineEarnings}
        adFree={store.adFree}
        t={store.t}
      />

      <AfkReportModal
        afkReport={store.afkReport}
        adState={store.adState}
        requestBonus={store.requestBonus}
        claimAfkBonus={store.claimAfkBonus}
        dismissAfkReport={store.dismissAfkReport}
        adFree={store.adFree}
        t={store.t}
      />

      <ScheduledAdModal
        pendingScheduledAd={store.pendingScheduledAd}
        adState={store.adState}
        watchScheduledAdNow={store.watchScheduledAdNow}
        deferScheduledAd={store.deferScheduledAd}
        scheduledAdPreview={store.scheduledAdPreview}
        t={store.t}
      />

      <TrackingExplainerModal
        open={store.trackingExplainer}
        onConfirm={store.confirmTrackingExplainer}
        t={store.t}
      />

      <GameShell
        store={store}
        affordableUpgradesCount={affordableUpgradesCount}
        useRoutes={false}
        onOpenManual={() => setIsManualOpen(true)}
        onOpenPitchDeck={() => setIsShareScreenOpen(true)}
        onOpenLegal={setLegalPage}
      />

      <Suspense fallback={null}>
        <LegalModal page={legalPage} onClose={() => setLegalPage(null)} lang={store.lang} />

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

        <ManualModal
          isOpen={isManualOpen}
          onClose={() => setIsManualOpen(false)}
          lang={store.lang}
        />
      </Suspense>
    </div>
  );
}
