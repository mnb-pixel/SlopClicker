import React, { useState } from 'react';
import { Tv, Gift, Loader2, ThermometerSnowflake, Landmark, Zap, Trash2, ShieldCheck, RotateCcw } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export function MiscTab({
  adState,
  requestBonus,
  isAdReady,
  getAdCooldownRemaining,
  resetSave,
  scheduledAdUnlocked,
  claimUnlockedScheduledAd,
  grantAdPreview = 0,
  scheduledAdPreview = 0,
  adFree = false,
  purchaseAvailable = false,
  purchaseState = 'idle',
  purchaseAdFree,
  restorePurchases,
  onOpenLegal,
  t,
}) {
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const tr = t || ((k) => k);
  // Icon/Label je Placement: mit adFree gibt es keine Ad mehr zu "ansehen", nur noch einen
  // Bonus abzuholen - Cooldowns/Beträge bleiben unverändert (siehe requestBonus).
  const CtaIcon = adFree ? Gift : Tv;

  // Kompakter Ad-Button, der je nach Cooldown-Status Play-Button / Countdown / "läuft" zeigt.
  const renderAdCta = (type) => {
    if (adState?.type === type) {
      return (
        <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-1 rounded border border-amber-500/30 shrink-0 animate-pulse">
          {adState.timer}s...
        </span>
      );
    }
    if (isAdReady && !isAdReady(type)) {
      return (
        <span className="text-slate-500 text-[10px] font-mono font-bold px-2 py-1 shrink-0">
          {getAdCooldownRemaining ? getAdCooldownRemaining(type) : 0}s
        </span>
      );
    }
    return null;
  };

  return (
    <div className="p-4 pb-20 max-w-md mx-auto flex flex-col gap-5">


      {/* Werbefrei-IAP: Kaufkarte / Status. Immer oben, damit der Einstieg von den
          Bonus-Buttons direkt darunter aus sichtbar ist. Auf Web (purchaseAvailable=false)
          unsichtbar - siehe PurchaseBridge.js, Guideline 3.1.1 verbietet einen Web-Checkout
          für denselben IAP. */}
      {purchaseAvailable && (
        <div className="bg-slate-900 p-4 rounded-2xl border border-amber-500/30 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-5 h-5 ${adFree ? 'text-emerald-400' : 'text-amber-400'}`} />
            <div>
              <h3 className="font-black text-sm uppercase text-slate-200">
                {tr('adFreeSettingTitle')}
              </h3>
              <div className="text-[10px] text-slate-400">
                {adFree ? tr('adFreeSettingDescActive') : tr('adFreeSettingDescInactive')}
              </div>
            </div>
          </div>

          {!adFree && (
            <div className="flex flex-col gap-2">
              <button
                onClick={purchaseAdFree}
                disabled={purchaseState === 'purchasing' || purchaseState === 'pending'}
                className="w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 to-fuchsia-500 text-slate-950 hover:brightness-110 active:scale-95 shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="w-4 h-4" />
                {purchaseState === 'purchasing'
                  ? tr('adFreePurchasing')
                  : purchaseState === 'pending'
                  ? tr('adFreePendingLabel')
                  : tr('adFreePurchaseBtn')}
              </button>
              <button
                onClick={restorePurchases}
                disabled={purchaseState === 'restoring'}
                className="w-full py-2 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {purchaseState === 'restoring' ? tr('adFreeRestoring') : tr('adFreeRestoreBtn')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Rewarded Ad Monocle / Bonus-Liste (adFree: identische Boni, ohne Video) */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <CtaIcon className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-black text-sm uppercase text-slate-200">
              {adFree ? tr('claimBonusesTitle') : tr('rewardedAdsTitle')}
            </h3>
            <div className="text-[10px] text-slate-400">
              {adFree ? tr('claimBonusesDesc') : tr('rewardedAdsDesc')}
            </div>
          </div>
        </div>

        {adState ? (
          <div className="bg-slate-950 p-4 rounded-xl border border-amber-500 text-center animate-pulse">
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-1" />
            <div className="font-black text-xs text-amber-300">
              {tr('adPlayingRemaining').replace('{sec}', adState.timer)}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {scheduledAdUnlocked && (
              <button
                onClick={claimUnlockedScheduledAd}
                className="p-3 rounded-xl bg-slate-950 border border-amber-500 hover:border-amber-400 text-left transition-all flex items-center justify-between group animate-pulse"
              >
                <div>
                  <div className="font-extrabold text-xs text-amber-300 flex items-center gap-1.5">
                    <CtaIcon className="w-4 h-4 text-amber-400" />
                    🎁 {tr('bonusAdAvailable')}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {tr('deferredAdWatchNow').replace('{amount}', formatCurrency(scheduledAdPreview))}
                  </div>
                </div>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-1 rounded border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shrink-0">
                  {adFree ? tr('claimBonusShort') : tr('watchAdShort')}
                </span>
              </button>
            )}
            <button
              onClick={() => requestBonus('nitrogen')}
              disabled={isAdReady && !isAdReady('nitrogen')}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500 text-left transition-all flex items-center justify-between group disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div>
                <div className="font-extrabold text-xs text-cyan-300 flex items-center gap-1.5">
                  <ThermometerSnowflake className="w-4 h-4 text-cyan-400" />
                  🧊 {tr('nitrogenCoolingTitle')}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {tr('nitrogenCoolingDesc')}
                </div>
              </div>
              {renderAdCta('nitrogen') || (
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black px-2 py-1 rounded border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors shrink-0">
                  {adFree ? tr('claimBonusShort') : tr('watchAd3s')}
                </span>
              )}
            </button>

            <button
              onClick={() => requestBonus('grant')}
              disabled={isAdReady && !isAdReady('grant')}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-left transition-all flex items-center justify-between group disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div>
                <div className="font-extrabold text-xs text-amber-300 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-amber-400" />
                  💰 {tr('govGrantTitle')}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {tr('govGrantDesc').replace('{amount}', formatCurrency(grantAdPreview))}
                </div>
              </div>
              {renderAdCta('grant') || (
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-1 rounded border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shrink-0">
                  {adFree ? tr('claimBonusShort') : tr('watchAd3s')}
                </span>
              )}
            </button>

            <button
              onClick={() => requestBonus('power_click')}
              disabled={isAdReady && !isAdReady('power_click')}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-fuchsia-500 text-left transition-all flex items-center justify-between group disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div>
                <div className="font-extrabold text-xs text-fuchsia-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-fuchsia-400" />
                  ⚡ {tr('bonusPowerClickTitle')}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {tr('bonusPowerClickDesc')}
                </div>
              </div>
              {renderAdCta('power_click') || (
                <span className="bg-fuchsia-500/20 text-fuchsia-300 text-[10px] font-black px-2 py-1 rounded border border-fuchsia-500/30 group-hover:bg-fuchsia-500 group-hover:text-slate-950 transition-colors shrink-0">
                  {adFree ? tr('claimBonusShort') : tr('watchAd3s')}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Kein eigener Werbe-Slot mehr: der Anchor über der Tab-Leiste (mobil) bzw. das
          Rectangle in der linken Spalte (Desktop) ist auf diesem Screen bereits sichtbar.
          Zwei Flächen gleichzeitig wären eine zu viel. */}

      {/* Wipe Save Data (Sprache & Audio sind bereits in der Kopfzeile verfügbar) */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
        {showWipeConfirm ? (
          <div className="bg-rose-950/80 p-3 rounded-xl border border-rose-500 flex flex-col gap-2 mt-2">
            <div className="text-xs font-extrabold text-rose-300">
              {tr('wipeConfirm')}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  resetSave();
                  setShowWipeConfirm(false);
                }}
                className="flex-1 py-1.5 bg-rose-600 text-white rounded font-bold text-xs"
              >
                {tr('yesWipe')}
              </button>
              <button
                onClick={() => setShowWipeConfirm(false)}
                className="flex-1 py-1.5 bg-slate-800 text-slate-300 rounded font-bold text-xs"
              >
                {tr('cancel')}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowWipeConfirm(true)}
            className="mt-2 text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center justify-center gap-1 py-2 rounded-xl bg-rose-950/30 border border-rose-500/20"
          >
            <Trash2 className="w-3.5 h-3.5" /> {tr('wipeSave')}
          </button>
        )}
      </div>

      {/* Footer inkl. Pflichtlinks. Impressum und Datenschutzerklärung müssen von jeder
          Ansicht aus erreichbar sein - der Einstellungen-Tab wird auch in der Desktop-
          Ansicht gerendert, damit gilt das für beide Layouts. */}
      <footer className="text-center text-[11px] text-slate-500 my-2 space-y-2">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onOpenLegal && onOpenLegal('impressum')}
            className="text-slate-400 hover:text-cyan-400 underline underline-offset-2 font-semibold transition-colors"
          >
            {tr('legalImprint')}
          </button>
          <span className="text-slate-700">•</span>
          <button
            onClick={() => onOpenLegal && onOpenLegal('datenschutz')}
            className="text-slate-400 hover:text-cyan-400 underline underline-offset-2 font-semibold transition-colors"
          >
            {tr('legalPrivacy')}
          </button>
          <span className="text-slate-700">•</span>
          <button
            onClick={() => onOpenLegal && onOpenLegal('cookies')}
            className="text-slate-400 hover:text-cyan-400 underline underline-offset-2 font-semibold transition-colors"
          >
            {tr('legalCookies')}
          </button>
          <span className="text-slate-700">•</span>
          {/* class "termly-display-preferences" bleibt für Termlys eigenen Klick-Handler
              erhalten, reicht in dieser SPA aber allein nicht: Termlys Script bindet diesen
              Handler nur an Elemente, die schon im DOM stehen, wenn das Script die Seite
              einmalig scannt - der Link steckt aber im lazy gerenderten Settings-Tab und
              existiert zu dem Zeitpunkt oft noch nicht. Deshalb zusätzlich Termlys
              dokumentierte SPA-Lösung: die global exponierte API-Funktion direkt aufrufen. */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.Termly?.displayPreferenceModal?.();
            }}
            className="termly-display-preferences text-slate-400 hover:text-cyan-400 underline underline-offset-2 font-semibold transition-colors"
          >
            {tr('consentPreferences')}
          </a>
        </div>
        <div>{tr('footerPrivacy')}</div>
        <div className="text-[10px] text-slate-600">Token Furnace Mobile v1.0.0</div>
      </footer>
    </div>
  );
}
