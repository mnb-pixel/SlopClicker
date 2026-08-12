import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export function MiscTab({
  adState,
  startAd,
  isAdReady,
  getAdCooldownRemaining,
  resetSave,
  scheduledAdUnlocked,
  claimUnlockedScheduledAd,
  grantAdPreview = 0,
  scheduledAdPreview = 0,
  t,
}) {
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const tr = t || ((k) => k);

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


      {/* Rewarded Ad Monocle */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Icons.Tv className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-black text-sm uppercase text-slate-200">
              {tr('rewardedAdsTitle')}
            </h3>
            <div className="text-[10px] text-slate-400">
              {tr('rewardedAdsDesc')}
            </div>
          </div>
        </div>

        {adState ? (
          <div className="bg-slate-950 p-4 rounded-xl border border-amber-500 text-center animate-pulse">
            <Icons.Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-1" />
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
                    <Icons.Tv className="w-4 h-4 text-amber-400" />
                    🎁 {tr('bonusAdAvailable')}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {tr('deferredAdWatchNow').replace('{amount}', formatCurrency(scheduledAdPreview))}
                  </div>
                </div>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-1 rounded border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shrink-0">
                  {tr('watchAdShort')}
                </span>
              </button>
            )}
            <button
              onClick={() => startAd('nitrogen')}
              disabled={isAdReady && !isAdReady('nitrogen')}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500 text-left transition-all flex items-center justify-between group disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div>
                <div className="font-extrabold text-xs text-cyan-300 flex items-center gap-1.5">
                  <Icons.ThermometerSnowflake className="w-4 h-4 text-cyan-400" />
                  🧊 {tr('nitrogenCoolingTitle')}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {tr('nitrogenCoolingDesc')}
                </div>
              </div>
              {renderAdCta('nitrogen') || (
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black px-2 py-1 rounded border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors shrink-0">
                  {tr('watchAd3s')}
                </span>
              )}
            </button>

            <button
              onClick={() => startAd('grant')}
              disabled={isAdReady && !isAdReady('grant')}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-left transition-all flex items-center justify-between group disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div>
                <div className="font-extrabold text-xs text-amber-300 flex items-center gap-1.5">
                  <Icons.Landmark className="w-4 h-4 text-amber-400" />
                  💰 {tr('govGrantTitle')}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {tr('govGrantDesc').replace('{amount}', formatCurrency(grantAdPreview))}
                </div>
              </div>
              {renderAdCta('grant') || (
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-1 rounded border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shrink-0">
                  {tr('watchAd3s')}
                </span>
              )}
            </button>

            <button
              onClick={() => startAd('power_click')}
              disabled={isAdReady && !isAdReady('power_click')}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-fuchsia-500 text-left transition-all flex items-center justify-between group disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div>
                <div className="font-extrabold text-xs text-fuchsia-300 flex items-center gap-1.5">
                  <Icons.Zap className="w-4 h-4 text-fuchsia-400" />
                  ⚡ {tr('bonusPowerClickTitle')}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {tr('bonusPowerClickDesc')}
                </div>
              </div>
              {renderAdCta('power_click') || (
                <span className="bg-fuchsia-500/20 text-fuchsia-300 text-[10px] font-black px-2 py-1 rounded border border-fuchsia-500/30 group-hover:bg-fuchsia-500 group-hover:text-slate-950 transition-colors shrink-0">
                  {tr('watchAd3s')}
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
            <Icons.Trash2 className="w-3.5 h-3.5" /> {tr('wipeSave')}
          </button>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-500 my-2 space-y-1">
        <div>{tr('footerPrivacy')}</div>
        <div className="text-[10px] text-slate-600">SlopClicker Mobile v1.0.0</div>
      </footer>
    </div>
  );
}
