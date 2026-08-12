import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Copy, Share2, Check, Sparkles, Rocket, Download, MessageSquare, Send, Globe, Award, Layers } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { BUILDINGS_DATA } from '../../data/buildingsData';
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
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
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

  // Generate HD 1080x1920 Mobile Story Canvas Graphic
  useEffect(() => {
    if (!isOpen) return;

    // Detaillierte Version braucht Platz für 2 zusätzliche Stat-Boxen (Badges + Buzzword-Karten) -
    // Canvas wächst dafür in der Höhe, alles ab dem Zitat/Stempel/Footer rutscht um EXTRA_H runter.
    const EXTRA_H = 260;
    const extra = detailed ? EXTRA_H : 0;
    const canvasHeight = 1920 + extra;

    const generateCanvas = () => {
      setIsGeneratingPng(true);
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Dark Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, canvasHeight);
      bgGrad.addColorStop(0, '#030712'); // slate-950
      bgGrad.addColorStop(0.3, '#0f172a'); // slate-900
      bgGrad.addColorStop(0.7, '#1e1b4b'); // indigo-950
      bgGrad.addColorStop(1, '#030712');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, canvasHeight);

      // Subtle Tech Grid Lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.07)';
      ctx.lineWidth = 2;
      for (let x = 0; x < 1080; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y < canvasHeight; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1080, y);
        ctx.stroke();
      }

      // Outer Decorative Border Frame
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 10;
      ctx.strokeRect(40, 40, 1000, canvasHeight - 80);

      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.strokeRect(52, 52, 976, canvasHeight - 104);

      // 2. Top Header Banner: Prospectus & Watermark
      ctx.fillStyle = '#f59e0b'; // amber-500
      ctx.font = '900 36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(tr('pdConfidentialTitle'), 540, 130);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 28px sans-serif';
      ctx.fillText(tr('pdOfficialSubtitle'), 540, 175);

      // Horizontal Divider
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(80, 210);
      ctx.lineTo(1000, 210);
      ctx.stroke();

      // 3. Startup Title Header
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 76px sans-serif';
      ctx.fillText(startupName.toUpperCase(), 540, 310);

      if (hasAiDomainBonus) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = '900 32px monospace';
        ctx.fillText(tr('pdAiHypeDomainLong'), 540, 365);
      }

      // 4. Main Metric Card Box: VALUATION
      const cardGrad = ctx.createLinearGradient(100, 420, 980, 720);
      cardGrad.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
      cardGrad.addColorStop(1, 'rgba(30, 27, 75, 0.9)');
      ctx.fillStyle = cardGrad;
      ctx.roundRect(100, 420, 880, 300, 30);
      ctx.fill();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 4;
      ctx.roundRect(100, 420, 880, 300, 30);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '900 32px monospace';
      ctx.fillText(tr('pdEstimatedValuation'), 540, 480);

      ctx.fillStyle = '#10b981'; // emerald-500
      ctx.font = '900 96px monospace';
      ctx.fillText(formatCurrency(valuation), 540, 590);

      ctx.fillStyle = '#67e8f9';
      ctx.font = '700 34px monospace';
      ctx.fillText(`+${formatCurrency(vps)} ${tr('pdPassiveCashflow')}`, 540, 665);

      // 5. Financial Highlights Grid (2x2)
      const gridItems = [
        { label: tr('pdAnnualRevenue'), val: tr('pdPureHype'), color: '#f43f5e' },
        { label: tr('pdHypeTierRank'), val: `${tr('pdTierLabel')} ${hypeTier} / 10`, color: '#ec4899' },
        { label: tr('pdTotalTokens'), val: `${formatNumber(slopCount)} ${tr('pdTokensLabel')}`, color: '#c084fc' },
        { label: tr('pdMeltedGpuCores'), val: `${overheatCount} ${tr('pdOverheatsLabel')}`, color: '#fb923c' },
      ];

      gridItems.forEach((item, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x = 100 + col * 450;
        const y = 760 + row * 190;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.roundRect(x, y, 430, 160, 20);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.roundRect(x, y, 430, 160, 20);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '800 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, x + 215, y + 55);

        ctx.fillStyle = item.color;
        ctx.font = '900 36px sans-serif';
        ctx.fillText(item.val, x + 215, y + 115);
      });

      // 6. Top Owned AI Infrastructure Section
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.roundRect(100, 1180, 880, 320, 24);
      ctx.fill();
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.lineWidth = 3;
      ctx.roundRect(100, 1180, 880, 320, 24);
      ctx.stroke();

      ctx.fillStyle = '#a855f7';
      ctx.font = '900 30px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(tr('pdDeployedEngines'), 540, 1235);

      // Get top 3 owned building engines
      const ownedEngines = BUILDINGS_DATA.map((b) => ({
        name: (t && t(`building_${b.id}_name`)) || b.id,
        count: buildings[b.id] || 0,
      })).filter((b) => b.count > 0).slice(-3).reverse();

      if (ownedEngines.length === 0) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'italic 30px sans-serif';
        ctx.fillText(tr('pdManualTappingMode'), 540, 1340);
      } else {
        ownedEngines.forEach((eng, i) => {
          ctx.fillStyle = '#e2e8f0';
          ctx.font = '800 32px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(`• ${eng.name}`, 140, 1300 + i * 55);

          ctx.fillStyle = '#38bdf8';
          ctx.font = '900 32px monospace';
          ctx.textAlign = 'right';
          ctx.fillText(`${eng.count}x ${tr('pdDeployedLabel')}`, 940, 1300 + i * 55);
        });
      }

      // 6b. DETAILED MODE: Badges & Buzzword Card Collection Stats (optional, user-toggled)
      if (detailed) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.roundRect(100, 1520, 880, 200, 24);
        ctx.fill();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 3;
        ctx.roundRect(100, 1520, 880, 200, 24);
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.font = '900 30px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(tr('pdCollectionPortfolio'), 540, 1568);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '800 30px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`🏆 ${tr('pdBadgesUnlocked')}`, 140, 1630);
        ctx.fillStyle = '#fbbf24';
        ctx.font = '900 30px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${badgeCount} / ${badgeTotal}`, 940, 1630);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '800 30px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`🎴 ${tr('pdBuzzwordCards')}`, 140, 1685);
        ctx.fillStyle = '#e879f9';
        ctx.font = '900 30px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${cardCount} / ${cardTotal} (+${cardBonusPct}% VPS)`, 940, 1685);
      }

      // 7. Satirical VC Prospectus Stamp Seal & Quote
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'italic 900 32px serif';
      ctx.textAlign = 'center';
      ctx.fillText(tr('pdHypeQuote'), 540, 1560 + extra);

      // VC Approved Stamp Badge Box
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.roundRect(290, 1610 + extra, 500, 100, 20);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.roundRect(290, 1610 + extra, 500, 100, 20);
      ctx.stroke();

      ctx.fillStyle = '#fef3c7';
      ctx.font = '900 36px monospace';
      ctx.fillText(tr('pdApprovedBySyndicate'), 540, 1672 + extra);

      // 8. Footer Call-to-Action Link Branding
      ctx.fillStyle = '#06b6d4';
      ctx.font = '900 34px sans-serif';
      ctx.fillText(tr('pdBuildEmpireFooter'), 540, 1820 + extra);

      setPngDataUrl(canvas.toDataURL('image/png'));
      setIsGeneratingPng(false);
    };

    // Small delay to ensure modal open DOM state
    setTimeout(generateCanvas, 100);
  }, [isOpen, startupName, hasAiDomainBonus, valuation, vps, slopCount, overheatCount, hypeTier, buildings, detailed, badgeCount, badgeTotal, cardCount, cardTotal, cardBonusPct, t, tr]);

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

        {/* Story Card Visual Preview */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="bg-gradient-to-b from-slate-950 via-indigo-950/60 to-slate-950 rounded-xl border-2 border-cyan-500/40 p-4 font-mono text-xs text-slate-200 shadow-2xl relative space-y-3">
            {/* Stamp Badge Overlay */}
            <div className="absolute top-3 right-3 opacity-20 pointer-events-none select-none">
              <div className="border-4 border-amber-400 text-amber-300 font-black text-xs p-2 rounded-xl -rotate-12 uppercase tracking-widest text-center">
                {tr('pdVcApprovedStamp')}
              </div>
            </div>

            {/* Startup Header */}
            <div className="border-b border-slate-800 pb-2">
              <div className="text-[10px] text-amber-400 font-black uppercase tracking-widest">
                {tr('pdInvestorProspectus')}
              </div>
              <div className="text-base font-black text-slate-100 flex items-center justify-between">
                <span>{startupName.toUpperCase()}</span>
                <Sparkles className="w-4 h-4 text-fuchsia-400" />
              </div>
              {hasAiDomainBonus && (
                <span className="inline-block mt-1 text-[9px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/50 px-2 py-0.5 rounded-full">
                  ✨ {tr('pdAiHypeDomainShort')}
                </span>
              )}
            </div>

            {/* Valuation Featured Box */}
            <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-500/40 text-center shadow-inner">
              <div className="text-[10px] text-slate-400 uppercase font-bold">{tr('pdEstimatedValuation')}</div>
              <div className="text-xl font-black text-emerald-400">{formatCurrency(valuation)}</div>
              <div className="text-[11px] text-cyan-300 font-bold mt-0.5">+{formatCurrency(vps)} {tr('pdCashflowSuffix')}</div>
            </div>

            {/* Grid Metrics */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">{tr('pdAnnualRevenue')}:</span>
                <span className="text-rose-400 font-bold">{tr('pdPureHype')}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">{tr('pdHypeTierRank')}:</span>
                <span className="text-fuchsia-300 font-bold">{tr('pdTierLabel')} {hypeTier} / 10</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">{tr('pdAiTokensLabel')}</span>
                <span className="text-purple-300 font-bold">{formatNumber(slopCount)}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">{tr('pdMeltedGpuCores')}:</span>
                <span className="text-amber-300 font-bold">{overheatCount} {tr('pdMeltedLabel')}</span>
              </div>
            </div>

            {/* Collection Portfolio (nur in der detaillierten Version) */}
            {detailed && (
              <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-500/40 space-y-1.5">
                <div className="text-[10px] text-emerald-400 uppercase font-bold text-center">{tr('pdCollectionPortfolio')}</div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1"><Award className="w-3 h-3 text-amber-400" /> {tr('pdBadgesUnlocked')}</span>
                  <span className="text-amber-300 font-bold">{badgeCount} / {badgeTotal}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1"><Layers className="w-3 h-3 text-fuchsia-400" /> {tr('pdBuzzwordCards')}</span>
                  <span className="text-fuchsia-300 font-bold">{cardCount} / {cardTotal} (+{cardBonusPct}% VPS)</span>
                </div>
              </div>
            )}

            {/* Quote Tagline */}
            <div className="text-center italic text-[10px] text-amber-300/90 bg-amber-950/30 p-2 rounded-lg border border-amber-500/30">
              {tr('pdHypeQuote')}
            </div>
          </div>
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
              className="py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider bg-slate-800 text-cyan-300 hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-cyan-500/40 shadow-md"
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
