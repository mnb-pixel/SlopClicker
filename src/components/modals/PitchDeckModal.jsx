import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Copy, Share2, Check, Sparkles, Rocket } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export function PitchDeckModal({
  isOpen,
  onClose,
  startupName,
  valuation,
  vps,
  slopCount,
  overheatCount,
  prestigeLevel,
}) {
  const [copied, setCopied] = useState(false);

  // Trigger confetti when modal opens
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#a855f7', '#ec4899', '#f59e0b'],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const pitchCardText = `🚀 VC PITCH DECK FOR ${startupName.toUpperCase()} 🚀\n` +
    `----------------------------------------\n` +
    `📈 Valuation: ${formatCurrency(valuation)}\n` +
    `💰 Revenue: $0.00 (We prioritize Hype over Profit)\n` +
    `⚡ VPS Income: +${formatCurrency(vps)}/s\n` +
    `🧠 AI Slop Count: ${formatNumber(slopCount)} tokens\n` +
    `🔥 Status: AGI almost reached, ${overheatCount} GPUs melted.\n` +
    `🌌 Prestige Singularity Level: +${prestigeLevel}\n` +
    `----------------------------------------\n` +
    `Build your AI bubble empire on SlopClicker!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pitchCardText);
    setCopied(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareX = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(pitchCardText)}`;
    window.open(tweetUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-2xl max-w-md w-full p-5 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-100 bg-slate-800 p-1.5 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Rocket className="w-6 h-6 text-cyan-400" />
          <h2 className="text-lg font-black text-slate-100 uppercase tracking-wide">
            VC Investor Pitch Deck
          </h2>
        </div>

        {/* Pitch Card Preview */}
        <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 font-mono text-xs text-slate-200 mb-4 space-y-2 shadow-inner">
          <div className="text-cyan-400 font-extrabold text-sm border-b border-slate-800 pb-1 flex justify-between items-center">
            <span>STARTUP: {startupName}</span>
            <Sparkles className="w-4 h-4 text-fuchsia-400" />
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Valuation ($):</span>
            <span className="text-emerald-400 font-black">{formatCurrency(valuation)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Annual Revenue:</span>
            <span className="text-rose-400 font-bold">$0.00 (Pure Hype)</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">VPS Passive Income:</span>
            <span className="text-cyan-300 font-bold">+{formatCurrency(vps)}/s</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">AI Slop Generated:</span>
            <span className="text-fuchsia-300 font-bold">{formatNumber(slopCount)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Status:</span>
            <span className="text-amber-300 font-bold">
              AGI near, {overheatCount} GPUs melted.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleCopy}
            className="w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Meme to Clipboard'}
          </button>

          <button
            onClick={handleShareX}
            className="w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-slate-800 text-cyan-300 hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2 border border-cyan-500/40"
          >
            <Share2 className="w-4 h-4 text-cyan-400" />
            Share Pitch Card on X
          </button>
        </div>
      </div>
    </div>
  );
}
