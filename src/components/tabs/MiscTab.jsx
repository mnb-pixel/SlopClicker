import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const TIPS = [
  'Tip #1: Always add .ai to your domain to instantly double your seed round valuation.',
  'Tip #2: If your model hallucinates non-existent citations, call it "emergent creative intelligence".',
  'Tip #3: When GPUs overheat, hold a bag of frozen peas against your PCIe slots.',
  'Tip #4: Never write backend code when you can write a 20-line ClosedAI API wrapper.',
  'Tip #5: Pam Saltman recommends posting enigmatic photos of pine trees on X to raise $7 Trillion.',
];

export function MiscTab({
  soundEnabled,
  setSoundEnabled,
  fancyGraphics,
  setFancyGraphics,
  adState,
  startAd,
  onOpenPitchDeck,
  onOpenManual,
  resetSave,
  lang = 'de',
  setLang,
}) {
  const [tipIndex, setTipIndex] = useState(0);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  const nextTip = () => {
    setTipIndex((prev) => (prev + 1) % TIPS.length);
  };

  return (
    <div className="p-4 pb-20 max-w-md mx-auto flex flex-col gap-5">
      {/* Tip of the Day Box (Saltman Avatar Parody) */}
      <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex items-start gap-3 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-fuchsia-500 p-0.5 shrink-0 overflow-hidden shadow-md">
          <img
            src="/altman_avatar_meme.jpg"
            alt="Saltman Founder Avatar"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">
              Tip of the Day
            </span>
            <button
              onClick={nextTip}
              className="text-[10px] text-slate-500 hover:text-slate-300 font-bold"
            >
              Next Tip →
            </button>
          </div>
          <p className="text-xs text-slate-300 italic">{TIPS[tipIndex]}</p>
        </div>
      </div>

      {/* Game Manual Banner */}
      <div className="bg-gradient-to-r from-[#1C2B3A] via-slate-900 to-[#14202C] p-4 rounded-2xl border-2 border-[#8A6A1F] shadow-2xl flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Icons.BookOpen className="w-5 h-5 text-[#8A6A1F]" />
          <h3 className="font-serif font-black text-sm uppercase tracking-wide text-[#EAE7DA]">
            SEC Form S-1 Investor & Game Manual
          </h3>
        </div>
        <p className="text-xs text-slate-300">
          Learn how Valuation, Token Burn Rate, Pivots, Epochen-Rotation, Credibility-Trees & Singularity Ascension work!
        </p>
        <button
          onClick={onOpenManual}
          className="mt-1 w-full py-2.5 rounded-xl font-serif font-black text-xs uppercase tracking-wider bg-[#8A6A1F] text-slate-950 hover:bg-[#C59B3F] active:scale-95 shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Icons.BookOpen className="w-4 h-4" /> Open Full Game Manual
        </button>
      </div>

      {/* Export VC Pitch Deck Banner */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-fuchsia-950 p-4 rounded-2xl border border-cyan-500/40 shadow-2xl flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Icons.Share2 className="w-5 h-5 text-cyan-400" />
          <h3 className="font-black text-sm uppercase tracking-wide text-cyan-200">
            Meme Pitch Deck Generator
          </h3>
        </div>
        <p className="text-xs text-slate-300">
          Export your hilarious startup investor card, copy formatted meme to clipboard, share on X, and blast confetti!
        </p>
        <button
          onClick={onOpenPitchDeck}
          className="mt-1 w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-slate-950 hover:from-cyan-400 hover:to-fuchsia-400 active:scale-95 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Icons.FileText className="w-4 h-4" /> Export VC Pitch Deck
        </button>
      </div>

      {/* Simulated Rewarded Ad Monocle */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Icons.Tv className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-black text-sm uppercase text-slate-200">
              Simulated Rewarded Ads
            </h3>
            <div className="text-[10px] text-slate-400">
              Watch a 3-second fake ad for instant venture boosts!
            </div>
          </div>
        </div>

        {adState ? (
          <div className="bg-slate-950 p-4 rounded-xl border border-amber-500 text-center animate-pulse">
            <Icons.Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-1" />
            <div className="font-black text-xs text-amber-300">
              Ad Playing... ({adState.timer}s remaining)
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => startAd('nitrogen')}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500 text-left transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-extrabold text-xs text-cyan-300 flex items-center gap-1.5">
                  <Icons.ThermometerSnowflake className="w-4 h-4 text-cyan-400" />
                  🧊 Liquid Nitrogen Cooling
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Instantly cools GPU to 0°C + grants 2x Click Power for 30s.
                </div>
              </div>
              <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black px-2 py-1 rounded border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors shrink-0">
                WATCH AD (3s)
              </span>
            </button>

            <button
              onClick={() => startAd('grant')}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-left transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-extrabold text-xs text-amber-300 flex items-center gap-1.5">
                  <Icons.Landmark className="w-4 h-4 text-amber-400" />
                  💰 Government AI Grant
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Receives an instant non-dilutive government payout of (VPS × 100).
                </div>
              </div>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-1 rounded border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shrink-0">
                WATCH AD (3s)
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Settings Options */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
        <h3 className="font-black text-sm uppercase text-slate-200 flex items-center gap-2">
          <Icons.Settings className="w-4 h-4 text-slate-400" /> Settings & Audio
        </h3>

        {/* Language Selection Row */}
        <div className="flex items-center justify-between py-1 border-b border-slate-800 text-xs">
          <span className="text-slate-300 font-semibold flex items-center gap-1">
            <Icons.Globe className="w-3.5 h-3.5 text-cyan-400" /> Language / Sprache
          </span>
          <select
            value={lang}
            onChange={(e) => setLang && setLang(e.target.value)}
            className="px-2 py-1 rounded bg-slate-950 text-cyan-300 border border-slate-800 font-mono font-bold text-xs"
          >
            <option value="de">🇩🇪 Deutsch</option>
            <option value="en">🇬🇧 English</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="es">🇪🇸 Español</option>
          </select>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-800 text-xs">
          <span className="text-slate-300 font-semibold">Web Audio SFX Tones</span>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
              soundEnabled ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-500'
            }`}
          >
            {soundEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-800 text-xs">
          <span className="text-slate-300 font-semibold">Fancy Cyber Graphics</span>
          <button
            onClick={() => setFancyGraphics(!fancyGraphics)}
            className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
              fancyGraphics ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-500'
            }`}
          >
            {fancyGraphics ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Wipe Save Button */}
        {showWipeConfirm ? (
          <div className="bg-rose-950/80 p-3 rounded-xl border border-rose-500 flex flex-col gap-2 mt-2">
            <div className="text-xs font-extrabold text-rose-300">
              Are you sure? This will delete all startup progress!
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  resetSave();
                  setShowWipeConfirm(false);
                }}
                className="flex-1 py-1.5 bg-rose-600 text-white rounded font-bold text-xs"
              >
                YES, WIPE SAVE
              </button>
              <button
                onClick={() => setShowWipeConfirm(false)}
                className="flex-1 py-1.5 bg-slate-800 text-slate-300 rounded font-bold text-xs"
              >
                CANCEL
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowWipeConfirm(true)}
            className="mt-2 text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center justify-center gap-1 py-2 rounded-xl bg-rose-950/30 border border-rose-500/20"
          >
            <Icons.Trash2 className="w-3.5 h-3.5" /> Wipe Save Game Data
          </button>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-500 my-2 space-y-1">
        <div>No Data Collected • 100% Offline • AI Bubble Safe</div>
        <div className="text-[10px] text-slate-600">SlopClicker Mobile v1.0.0</div>
      </footer>
    </div>
  );
}
