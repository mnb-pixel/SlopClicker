import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft, Copy, Share2, Check, Rocket, Download, Loader2, Sparkles, FileText,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { drawPitchDeck } from '../../utils/pitchDeckCanvas';
import { ACHIEVEMENTS_DATA } from '../../data/achievementsData';
import { BUZZWORDS_DATA } from '../../data/buzzwordsData';
import { hideNativeBanner, showNativeBanner } from '../../monetization/nativeBanner';
import { isCrazyGamesBuild } from '../../monetization/crazyGamesSdk';

const BADGE_TOTAL = ACHIEVEMENTS_DATA.length;
const CARD_TOTAL = BUZZWORDS_DATA.length;

// Link, der im GETEILTEN Inhalt landet (Copy-Text, nativer Teilen-Dialog): weder
// window.location.href der aktuellen Tab-Route (siehe routes.js, z.B. "/shop") noch die
// CrazyGames-iFrame-URL sind für die eingeladene Person brauchbar - beide zeigen auf etwas,
// das außerhalb dieser Sitzung nicht existiert bzw. nicht die eigentliche Seite ist. Die
// bereits vorhandene VITE_SITE_URL (siehe .env, auch für og:url in index.html genutzt) ist
// die einzige stabile, öffentlich erreichbare Adresse.
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://token-furnace.com';

export function ShareScreen({
  isOpen,
  onClose,
  startupName = 'tokenkamin',
  hasAiDomainBonus = false,
  valuation = 0,
  totalValuation = 0,
  vps = 0,
  slopCount = 0,
  overheatCount = 0,
  prestigeLevel = 0,
  hypeTier = 1,
  buildings = {},
  unlockedAchievements = [],
  boughtBuzzwords = [],
  adFree = false,
  lang = 'de',
  t,
}) {
  const tr = t || ((k) => k);
  // CrazyGames: Spiel läuft in einem fremden iFrame/Sandbox - window.open() zu X/WhatsApp/
  // LinkedIn kann dort geblockt werden oder verlässt aus Nutzersicht "die CrazyGames-Seite",
  // beides gegen deren Richtlinien für eingebettete Spiele. Native Web Share API (navigator.
  // share) ist im iFrame ebenso unzuverlässig (je nach Permissions-Policy der einbettenden
  // Seite deaktiviert). Einzig verlässliche, komplett lokale Option bleibt der PNG-Download
  // (reiner <a download>-Link, siehe handleDownloadPng) - deshalb dort NUR den Download
  // anbieten statt der vollen Teilen-Aktionsleiste.
  const isCrazyGames = isCrazyGamesBuild();
  const [copied, setCopied] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(true);
  const [pngDataUrl, setPngDataUrl] = useState(null);
  // Consulting statt Neon als Default: die seriöse Beratungs-Folie wirkt für die meisten
  // Teil-Anlässe (Investoren-Gag, LinkedIn) passender als der Cyberpunk-Stil - wer neon will,
  // schaltet bewusst um.
  const [style, setStyle] = useState('consulting');
  const [snapshot, setSnapshot] = useState(null);
  const canvasRef = useRef(null);

  // Die native AdMob-Leiste ist kein DOM-Element, sondern ein natives Overlay, das AdMob
  // IMMER über der WebView zeichnet (siehe monetization/nativeBanner.js) - kein CSS-z-index
  // kommt darüber. Auf dem eigenen Share-Screen blenden wir sie deshalb aktiv aus, statt uns
  // auf Layout allein zu verlassen (das war der gemeldete Bug: Werbung überlagerte die
  // Teilen-Buttons am unteren Rand). Beim Verlassen kommt sie zurück, außer bei adFree. Auf
  // Web (kein natives Capacitor-Target) sind beide Funktionen ein No-Op.
  useEffect(() => {
    if (!isOpen) return;
    hideNativeBanner();
    return () => {
      if (!adFree) showNativeBanner();
    };
  }, [isOpen, adFree]);

  // Die Story-Card ist ein Snapshot fürs Teilen, kein Live-Ticker: Werte werden
  // NUR beim Öffnen des Screens eingefroren (Effekt hat bewusst nur [isOpen] als
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
      startupName, hasAiDomainBonus, valuation, totalValuation, vps, slopCount, overheatCount,
      prestigeLevel, hypeTier, buildings,
      badgeCount, badgeTotal: BADGE_TOTAL, cardCount, cardTotal: CARD_TOTAL, cardBonusPct,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // HD 1080x1920 Story-Card rendern - das Ergebnis ist gleichzeitig die Vorschau
  // im Screen, damit die Vorschau exakt dem geteilten Bild entspricht.
  useEffect(() => {
    if (!isOpen || !snapshot) return;
    setIsGeneratingPng(true);

    const timer = setTimeout(() => {
      const canvas = canvasRef.current || document.createElement('canvas');
      const dataUrl = drawPitchDeck(canvas, { ...snapshot, style, lang, t });
      setPngDataUrl(dataUrl);
      setIsGeneratingPng(false);
    }, 60);

    return () => clearTimeout(timer);
  }, [isOpen, snapshot, style, lang, t]);

  if (!isOpen || !snapshot) return null;

  const shareText = `🚀 ${tr('pdShareTitlePrefix')} ${snapshot.startupName.toUpperCase()} 🚀\n` +
    `📈 ${tr('pdShareValuation')} ${formatCurrency(snapshot.valuation)}\n` +
    `🏆 ${tr('pdLifetimeValuation')} ${formatCurrency(snapshot.totalValuation)}\n` +
    `💰 ${tr('pdShareRevenue')}\n` +
    `⚡ ${tr('pdSharePassiveInflow')} +${formatCurrency(snapshot.vps)}/s\n` +
    `🔥 ${tr('pdShareStatus')} ${snapshot.overheatCount} ${tr('pdGpusMelted')}\n` +
    tr('pdShareFooter');

  const shareUrl = SITE_URL;

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

  // Der Neon-Stil exportiert als JPEG statt PNG (siehe pitchDeckCanvas.js) - Dateiname
  // & MIME-Type also aus der tatsächlichen Daten-URL ableiten statt hart auf .png.
  const imageExt = pngDataUrl?.startsWith('data:image/jpeg') ? 'jpg' : 'png';

  // Data-URL SYNCHRON (kein fetch/await!) in ein File umwandeln: WebKit verwirft die
  // "User Activation" aus dem Klick-Event, sobald zwischen Klick und navigator.share() ein
  // await liegt - der Aufruf bricht dann lautlos mit NotAllowedError ab, ohne dass der Nutzer
  // eine Fehlermeldung sieht (das war der gemeldete Bug in der iOS-App: "Direct Share Button
  // geht nicht" / "Save PNG geht auch nicht"). Ein früheres fetch(dataUrl) hier war genau
  // diese Async-Lücke. atob/Uint8Array laufen synchron, also bleibt alles im selben Tick wie
  // der Klick - relevant für jede WebKit-basierte Umgebung, nicht nur die native App.
  const dataUrlToFile = (dataUrl, filename) => {
    const [header, base64] = dataUrl.split(',');
    const mime = header.match(/data:(.*?);base64/)?.[1] || 'image/png';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new File([bytes], filename, { type: mime });
  };

  // Baut die Bilddatei fürs native Teilen/Sichern - gibt null zurück, wenn kein Bild vorliegt
  // oder die Plattform File-Sharing gar nicht unterstützt (canShare fehlt oder lehnt die Datei
  // ab). Aufrufer entscheiden dann selbst über den Fallback.
  const buildShareFile = () => {
    if (!pngDataUrl || !navigator.canShare) return null;
    const file = dataUrlToFile(pngDataUrl, `${snapshot.startupName}_pitchdeck.${imageExt}`);
    return navigator.canShare({ files: [file] }) ? file : null;
  };

  // Native Web Share API (File + Text + Link) - EIN globaler Teilen-Button für alle Kanäle
  // (X, WhatsApp, Instagram, TikTok, LinkedIn, Mail, ...), statt einzelner Kachel-Buttons pro
  // Plattform: das native Blatt zeigt ohnehin nur die auf dem Gerät installierten/erreichbaren
  // Ziele, eigene Kacheln liefen dem also nur redundant hinterher (und einige, z.B. Instagram/
  // TikTok, unterstützen sowieso kein Vorbefüllen per URL-Intent).
  const handleNativeShare = async () => {
    if (navigator.share) {
      const file = buildShareFile();
      try {
        if (file) {
          await navigator.share({
            title: `${snapshot.startupName} - ${tr('pdGeneratorTitle')}`,
            text: shareText,
            url: shareUrl,
            files: [file],
          });
          return;
        }

        // Fallback native share without image file
        await navigator.share({
          title: `${snapshot.startupName} - ${tr('pdGeneratorTitle')}`,
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

  const isMobileDevice = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');

  // Bild sichern. Ein klassisches <a download> mit data:-URL wird von WKWebView (der
  // nativen App) ignoriert - der Klick landet ohne jede Fehlermeldung im Leeren. Ohne
  // natives Filesystem-Plugin ist das native Teilen-Blatt der einzige zuverlässige Weg,
  // das Bild dort in die Fotos-App zu bekommen ("Bild sichern" ist eine Standard-Option
  // darin) - deshalb auf Mobilgeräten darüber, auf dem Desktop bleibt der klassische
  // Download-Link (dort funktioniert er).
  const handleDownloadPng = async () => {
    if (!pngDataUrl) return;

    if (isMobileDevice && navigator.share) {
      const file = buildShareFile();
      if (file) {
        try {
          await navigator.share({ files: [file] });
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
        } catch (e) {
          console.log('Native save-share cancelled or failed:', e);
        }
        return;
      }
    }

    const link = document.createElement('a');
    link.download = `${snapshot.startupName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_pitchdeck_${style}.${imageExt}`;
    link.href = pngDataUrl;
    link.click();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
    });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col animate-fadeIn">
      <canvas ref={canvasRef} className="hidden" />

      {/* Screen Header - eigener Screen statt Modal-Karte, damit unten mehr Platz für die
          Share-Actions bleibt und der native Ad-Banner (siehe useEffect oben) nicht mehr
          hineinragen kann. */}
      <div className="flex items-center justify-between border-b border-slate-800 header-safe-top pb-3 shrink-0 bg-gradient-to-b from-slate-900 to-slate-950">
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-100 bg-slate-800 p-2 rounded-full transition-colors"
          aria-label={tr('pdBack')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

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

        {/* Spacer, damit der Titel trotz des einseitigen Zurück-Buttons optisch zentriert bleibt */}
        <div className="w-9 shrink-0" />
      </div>

      {/* Scrollbarer Inhalt: Stil-Umschalter, Live-Vorschau */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4">
        <div className="max-w-md mx-auto w-full flex flex-col gap-3 py-3">
          {/* Design-Umschalter: Neon-Cyberpunk (App-Look) oder seriöse Beratungs-Folie */}
          <div className="flex items-center gap-2">
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

          {/* Live-Vorschau: exakt das PNG, das geteilt wird (WYSIWYG) */}
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

          <p className="text-center text-[9px] text-slate-500 font-mono">
            {tr('pdPreviewHint')}
          </p>
        </div>
      </div>

      {/* Share Actions - fix am unteren Rand, safe-area-bewusst (gleiche Klasse
          wie NavBar.jsx), damit die Buttons auf jedem Gerät über der Home-Indicator-Zone
          bleiben. */}
      <div className="shrink-0 border-t border-slate-800 bg-slate-950 navbar-safe-bottom">
        <div className="max-w-md mx-auto w-full px-3 sm:px-4 pt-3 pb-3 flex flex-col gap-2">
          {isCrazyGames ? (
            /* CrazyGames: nur lokaler Download, siehe isCrazyGames-Kommentar oben. */
            <button
              onClick={handleDownloadPng}
              disabled={isGeneratingPng || !pngDataUrl}
              className="py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 via-fuchsia-500 to-cyan-400 text-slate-950 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-fuchsia-500/20 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>{tr('pdSavePng')}</span>
            </button>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
