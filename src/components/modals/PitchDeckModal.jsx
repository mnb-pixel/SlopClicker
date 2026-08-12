import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Copy, Share2, Check, Rocket, Download, MessageSquare, Send, Globe, Award, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { drawPitchDeck } from '../../utils/pitchDeckCanvas';
import { ACHIEVEMENTS_DATA } from '../../data/achievementsData';
import { BUZZWORDS_DATA } from '../../data/buzzwordsData';

const BADGE_TOTAL = ACHIEVEMENTS_DATA.length;
const CARD_TOTAL = BUZZWORDS_DATA.length;

export function PitchDeckModal({
  isOpen,
  onClose,
  startupName = 'tokenkamin',
  hasAiDomainBonus = false,
  valuation = 0,
  vps = 0,
  slopCount = 0,
  overheatCount = 0,
  prestigeLevel = 0,
  hypeTier = 1,
  buildings = {},
  unlockedAchievements = [],
  boughtBuzzwords = [],
  t,
}) {
  const tr = t || ((k) => k);
  const [copied, setCopied] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(true);
  const [pngDataUrl, setPngDataUrl] = useState(null);
  const [detailed, setDetailed] = useState(false);
  const canvasRef = useRef(null);
  const badgeCount = unlockedAchievements.length;
  const badgeTotal = BADGE_TOTAL;
  const cardCount = boughtBuzzwords.length;
  const cardTotal = CARD_TOTAL;
  const cardBonusPct = Math.round(
    BUZZWORDS_DATA.reduce((acc, bw) => (boughtBuzzwords.includes(bw.id) ? acc + bw.bonus : acc), 0) * 100
  );

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

  // HD 1080x1920 Story-Card rendern - das Ergebnis ist gleichzeitig die Vorschau
  // im Modal, damit die Vorschau exakt dem geteilten Bild entspricht.
  useEffect(() => {
    if (!isOpen) return;
    setIsGeneratingPng(true);

    const timer = setTimeout(() => {
      const canvas = canvasRef.current || document.createElement('canvas');
      const dataUrl = drawPitchDeck(canvas, {
        startupName,
        hasAiDomainBonus,
        valuation,
        vps,
        slopCount,
        overheatCount,
        prestigeLevel,
        hypeTier,
        buildings,
        detailed,
        badgeCount,
        badgeTotal,
        cardCount,
        cardTotal,
        cardBonusPct,
        t,
      });
      setPngDataUrl(dataUrl);
      setIsGeneratingPng(false);
    }, 60);

    return () => clearTimeout(timer);
  }, [isOpen, startupName, hasAiDomainBonus, valuation, vps, slopCount, overheatCount, prestigeLevel, hypeTier, buildings, detailed, badgeCount, badgeTotal, cardCount, cardTotal, cardBonusPct, t]);

  if (!isOpen) return null;

  const shareText = `🚀 ${tr('pdShareTitlePrefix')} ${startupName.toUpperCase()} 🚀\n` +
    `📈 ${tr('pdShareValuation')} ${formatCurrency(valuation)}\n` +
    `💰 ${tr('pdShareRevenue')}\n` +
    `⚡ ${tr('pdSharePassiveInflow')} +${formatCurrency(vps)}/s\n` +
    `🔥 ${tr('pdShareStatus')} ${overheatCount} ${tr('pdGpusMelted')}\n` +
    (detailed ? `🏆 ${tr('pdBadgesUnlocked')}: ${badgeCount}/${badgeTotal} • 🎴 ${tr('pdBuzzwordCards')}: ${cardCount}/${cardTotal}\n` : '') +
    tr('pdShareFooter');

  const shareUrl = window.location.href;

  // 1-Click Copy Text
  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Direct PNG Download
  const handleDownloadPng = () => {
    if (!pngDataUrl) return;
    const link = document.createElement('a');
    link.download = `${startupName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_pitchdeck.png`;
    link.href = pngDataUrl;
    link.click();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
    });
  };

  // Native Web Share API (File + Meme Text + Link for Instagram, TikTok, WhatsApp, iMessage)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        if (pngDataUrl && navigator.canShare) {
          // Convert dataURL to File for native image sharing
          const res = await fetch(pngDataUrl);
          const blob = await res.blob();
          const file = new File([blob], `${startupName}_pitchdeck.png`, { type: 'image/png' });

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `${startupName} - ${tr('pdGeneratorTitle')}`,
              text: shareText,
              url: shareUrl,
              files: [file],
            });
            return;
          }
        }

        // Fallback native share without image file
        await navigator.share({
          title: `${startupName} - VC Pitch Deck`,
          text: shareText,
          url: shareUrl,
        });
      } catch (e) {
        console.log('Native share cancelled or failed:', e);
      }
    } else {
      handleCopy();
    }
  };

  // Social Shortcuts
  const handleShareX = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(tweetUrl, '_blank');
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(waUrl, '_blank');
  };

  const handleShareLinkedIn = () => {
    const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(liUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/60 rounded-2xl max-w-sm sm:max-w-md w-full p-4 sm:p-5 shadow-2xl relative overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Rocket className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-100 uppercase tracking-wide">
                {tr('pdGeneratorTitle')}
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                {tr('pdFormatSubtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 bg-slate-800 p-1.5 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Detaillierte Version Toggle - der User entscheidet, ob Badges & Buzzword-Karten mit rein sollen */}
        <label className="flex items-center gap-2 px-3 py-2 mb-3 rounded-xl bg-slate-950/80 border border-slate-800 cursor-pointer shrink-0 text-xs font-bold text-slate-200">
          <input
            type="checkbox"
            checked={detailed}
            onChange={(e) => setDetailed(e.target.checked)}
            className="w-3.5 h-3.5 accent-emerald-400"
          />
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>{tr('pdDetailedToggleLabel')}</span>
        </label>

        {/* Live-Vorschau: exakt das PNG, das geteilt wird (WYSIWYG) */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl shadow-fuchsia-500/10 bg-slate-950">
            {pngDataUrl ? (
              <img
                src={pngDataUrl}
                alt={`${startupName} Pitch Deck`}
                className={`w-full block transition-opacity duration-200 ${isGeneratingPng ? 'opacity-40' : 'opacity-100'}`}
              />
            ) : (
              <div className="w-full aspect-[9/16] flex items-center justify-center text-slate-500 text-xs font-mono gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                {tr('pdPreviewLoading')}
              </div>
            )}

            {isGeneratingPng && pngDataUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-[1px]">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              </div>
            )}
          </div>

          <p className="text-center text-[9px] text-slate-500 font-mono mt-2">
            {tr('pdPreviewHint')}
          </p>
        </div>

        {/* Multi-Channel Share Actions */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col gap-2 shrink-0">
          {/* Main Action Bar: Native Web Share & Download PNG */}
          <div className="grid grid-cols-2 gap-2">
            {typeof navigator !== 'undefined' && 'share' in navigator ? (
              <button
                onClick={handleNativeShare}
                className="py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 via-fuchsia-500 to-cyan-400 text-slate-950 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-fuchsia-500/20"
              >
                <Share2 className="w-4 h-4 text-slate-950" />
                <span>{tr('pdDirectShare')}</span>
              </button>
            ) : (
              <button
                onClick={handleCopy}
                className="py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? tr('pdCopied') : tr('pdCopyMeme')}</span>
              </button>
            )}

            <button
              onClick={handleDownloadPng}
              disabled={isGeneratingPng || !pngDataUrl}
              className="py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider bg-slate-800 text-cyan-300 hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-cyan-500/40 shadow-md disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>{tr('pdSavePng')}</span>
            </button>
          </div>

          {/* Social Media Shortcut Icons */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              onClick={handleShareX}
              className="py-2 rounded-lg bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-600 text-[10px] font-bold transition-all flex items-center justify-center gap-1"
            >
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              <span>X ({tr('pdTweetLabel')})</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="py-2 rounded-lg bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-600 text-[10px] font-bold transition-all flex items-center justify-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>WHATSAPP</span>
            </button>

            <button
              onClick={handleShareLinkedIn}
              className="py-2 rounded-lg bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-600 text-[10px] font-bold transition-all flex items-center justify-center gap-1"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>LINKEDIN</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
