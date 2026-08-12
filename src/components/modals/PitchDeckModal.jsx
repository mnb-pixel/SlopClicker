import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Copy, Share2, Check, Rocket, Download, MessageSquare, Send, Globe, Award, Loader2, Sparkles, FileText } from 'lucide-react';
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
  lang = 'de',
  t,
}) {
  const tr = t || ((k) => k);
  const [copied, setCopied] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(true);
  const [pngDataUrl, setPngDataUrl] = useState(null);
  const [detailed, setDetailed] = useState(false);
  const [style, setStyle] = useState('neon');
  const [snapshot, setSnapshot] = useState(null);
  const canvasRef = useRef(null);

  // Die Story-Card ist ein Snapshot fürs Teilen, kein Live-Ticker: Werte werden
  // NUR beim Öffnen des Modals eingefroren (Effekt hat bewusst nur [isOpen] als
  // Dependency). Würde man live an valuation/vps/slopCount hängen, feuert der
  // 100ms-Game-Tick (useGameStore) das Canvas-Redraw pausenlos neu -> Dauer-
  // Ladeanimation & Geflacker im Preview-Bild.
  useEffect(() => {
    if (!isOpen) return;
    const badgeCount = unlockedAchievements.length;
    const cardCount = boughtBuzzwords.length;
    const cardBonusPct = Math.round(
      BUZZWORDS_DATA.reduce((acc, bw) => (boughtBuzzwords.includes(bw.id) ? acc + bw.bonus : acc), 0) * 100
    );
    setSnapshot({
      startupName, hasAiDomainBonus, valuation, vps, slopCount, overheatCount,
      prestigeLevel, hypeTier, buildings,
      badgeCount, badgeTotal: BADGE_TOTAL, cardCount, cardTotal: CARD_TOTAL, cardBonusPct,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // HD 1080x1920 Story-Card rendern - das Ergebnis ist gleichzeitig die Vorschau
  // im Modal, damit die Vorschau exakt dem geteilten Bild entspricht.
  useEffect(() => {
    if (!isOpen || !snapshot) return;
    setIsGeneratingPng(true);

    const timer = setTimeout(() => {
      const canvas = canvasRef.current || document.createElement('canvas');
      const dataUrl = drawPitchDeck(canvas, { ...snapshot, detailed, style, lang, t });
      setPngDataUrl(dataUrl);
      setIsGeneratingPng(false);
    }, 60);

    return () => clearTimeout(timer);
  }, [isOpen, snapshot, detailed, style, lang, t]);

  if (!isOpen || !snapshot) return null;

  const shareText = `🚀 ${tr('pdShareTitlePrefix')} ${snapshot.startupName.toUpperCase()} 🚀\n` +
    `📈 ${tr('pdShareValuation')} ${formatCurrency(snapshot.valuation)}\n` +
    `💰 ${tr('pdShareRevenue')}\n` +
    `⚡ ${tr('pdSharePassiveInflow')} +${formatCurrency(snapshot.vps)}/s\n` +
    `🔥 ${tr('pdShareStatus')} ${snapshot.overheatCount} ${tr('pdGpusMelted')}\n` +
    (detailed ? `🏆 ${tr('pdBadgesUnlocked')}: ${snapshot.badgeCount}/${snapshot.badgeTotal} • 🎴 ${tr('pdBuzzwordCards')}: ${snapshot.cardCount}/${snapshot.cardTotal}\n` : '') +
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
    link.download = `${snapshot.startupName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_pitchdeck_${style}.png`;
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
          const file = new File([blob], `${snapshot.startupName}_pitchdeck.png`, { type: 'image/png' });

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `${snapshot.startupName} - ${tr('pdGeneratorTitle')}`,
              text: shareText,
              url: shareUrl,
              files: [file],
            });
            return;
          }
        }

        // Fallback native share without image file
        await navigator.share({
          title: `${snapshot.startupName} - VC Pitch Deck`,
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

        {/* Design-Umschalter: Neon-Cyberpunk (App-Look) oder seriöse Beratungs-Folie */}
        <div className="flex items-center gap-2 mb-2 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 shrink-0">
            {tr('pdStyleLabel')}
          </span>
          <div className="grid grid-cols-2 gap-1 flex-1 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
            <button
              onClick={() => setStyle('neon')}
              className={`py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all flex items-center justify-center gap-1 ${
                style === 'neon'
                  ? 'bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              {tr('pdStyleNeon')}
            </button>
            <button
              onClick={() => setStyle('consulting')}
              className={`py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all flex items-center justify-center gap-1 ${
                style === 'consulting'
                  ? 'bg-slate-200 text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3 h-3" />
              {tr('pdStyleConsulting')}
            </button>
          </div>
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
                alt={`${snapshot.startupName} Pitch Deck`}
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
