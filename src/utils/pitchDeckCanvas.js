// Rendering der teilbaren 9:16 Pitch-Deck-Story-Card (1080x1920, +250px in der
// detaillierten Version) - optimiert für Instagram/TikTok Stories & Reels.
//
// Zwei Stile stehen zur Wahl (siehe PITCH_DECK_STYLES):
//   'neon'       - das Cyberpunk-Design der App (diese Datei)
//   'consulting' - seriöser Berater-Einseiter (pitchDeckConsulting.js)
//
// Gemeinsame Zeichen-Helfer liegen in pitchDeckShared.js - dort steht auch,
// warum jeder Pfad-Helfer beginPath() ruft und warum hier nirgends shadowBlur
// verwendet wird.

import { formatCurrency, formatNumber } from './formatters';
import { drawConsultingDeck } from './pitchDeckConsulting';
import {
  PITCH_DECK_WIDTH, SANS, MONO, SERIF,
  fillRound, strokeRound, line, linear, setTracking, fitFont, ellipsize, drawPill,
  getTopEngines, getPitchDeckHeight,
} from './pitchDeckShared';

export { PITCH_DECK_WIDTH, getTopEngines, getPitchDeckHeight };

export const PITCH_DECK_STYLES = ['neon', 'consulting'];

const C = {
  cyan: '#22d3ee',
  cyanSoft: '#67e8f9',
  violet: '#a855f7',
  fuchsia: '#e879f9',
  amber: '#fbbf24',
  amberSoft: '#fde68a',
  emerald: '#34d399',
  rose: '#fb7185',
  orange: '#fb923c',
  slate: '#94a3b8',
  slateLight: '#e2e8f0',
  ink: '#050815',
};

/* ------------------------------------------------------------- background */

function drawBackground(ctx, H) {
  const bg = linear(ctx, 0, 0, PITCH_DECK_WIDTH, H, [
    [0, '#05060f'],
    [0.35, '#0b1026'],
    [0.68, '#1b1040'],
    [1, '#05060f'],
  ]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, PITCH_DECK_WIDTH, H);

  // Weiche Neon-Blobs für Tiefe - bewusst nur 2 statt vieler: jeder Blob ist ein
  // radialer Fill über das komplette Canvas, und zusammen mit der Vignette darunter
  // ergeben zu viele davon auf iOS Safari messbar teures Rendering.
  const blobs = [
    { x: 160, y: 280, r: 640, color: 'rgba(34, 211, 238, 0.18)' },
    { x: 940, y: H - 260, r: 680, color: 'rgba(217, 70, 239, 0.16)' },
  ];
  blobs.forEach(({ x, y, r, color }) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, PITCH_DECK_WIDTH, H);
  });

  // Tech-Grid
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
  ctx.lineWidth = 2;
  for (let x = 0; x <= PITCH_DECK_WIDTH; x += 72) line(ctx, x, 0, x, H, 'rgba(148, 163, 184, 0.06)', 2);
  for (let y = 0; y <= H; y += 72) line(ctx, 0, y, PITCH_DECK_WIDTH, y, 'rgba(148, 163, 184, 0.06)', 2);

  // Vignette
  const vign = ctx.createRadialGradient(540, H / 2, H * 0.28, 540, H / 2, H * 0.72);
  vign.addColorStop(0, 'rgba(0,0,0,0)');
  vign.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, PITCH_DECK_WIDTH, H);
}

function drawFrame(ctx, H) {
  const frameGrad = linear(ctx, 0, 0, PITCH_DECK_WIDTH, H, [
    [0, C.cyan],
    [0.5, C.violet],
    [1, C.amber],
  ]);
  // KEIN ctx.shadowBlur hier: wiederholte Shadow-Blur-Aufrufe auf einem großen
  // Canvas sind auf iOS Safari extrem teuer und haben die App-Seite mit einem
  // Renderer-Crash ("A problem repeatedly occurred") abstürzen lassen. Der
  // Farbverlauf im Rahmen selbst sorgt schon für genug visuellen Pop.
  strokeRound(ctx, 34, 34, PITCH_DECK_WIDTH - 68, H - 68, 46, frameGrad, 6);
  strokeRound(ctx, 50, 50, PITCH_DECK_WIDTH - 100, H - 100, 36, 'rgba(255,255,255,0.10)', 2);
}

/* ---------------------------------------------------------------- content */

function drawHeader(ctx, tr) {
  drawPill(ctx, 540, 122, tr('pdConfidentialTitle'), {
    font: `900 24px ${MONO}`,
    color: C.amber,
    bg: 'rgba(251, 191, 36, 0.12)',
    border: 'rgba(251, 191, 36, 0.55)',
    tracking: 3,
    height: 56,
    padX: 32,
  });

  ctx.font = `700 22px ${MONO}`;
  setTracking(ctx, 2);
  ctx.fillStyle = C.slate;
  ctx.textAlign = 'center';
  ctx.fillText(tr('pdOfficialSubtitle'), 540, 178);
  setTracking(ctx, 0);

  const div = linear(ctx, 90, 0, 990, 0, [
    [0, 'rgba(34,211,238,0)'],
    [0.5, 'rgba(34,211,238,0.6)'],
    [1, 'rgba(34,211,238,0)'],
  ]);
  line(ctx, 90, 212, 990, 212, div, 3);
}

function drawTitle(ctx, tr, startupName, hasAiDomainBonus) {
  const name = String(startupName || '').toUpperCase();
  const size = fitFont(ctx, name, 860, 900, 108, SANS, 44);
  const grad = linear(ctx, 140, 0, 940, 0, [
    [0, C.cyanSoft],
    [0.5, '#ffffff'],
    [1, C.fuchsia],
  ]);
  ctx.textAlign = 'center';
  ctx.font = `900 ${size}px ${SANS}`;
  ctx.fillStyle = grad;
  ctx.fillText(name, 540, 300);

  if (hasAiDomainBonus) {
    drawPill(ctx, 540, 372, tr('pdAiHypeDomainShort'), {
      font: `900 26px ${MONO}`,
      color: C.amberSoft,
      bg: 'rgba(251, 191, 36, 0.14)',
      border: 'rgba(251, 191, 36, 0.6)',
      tracking: 2,
      height: 56,
    });
  }
}

function drawHeroValuation(ctx, tr, valuation, vps) {
  const x = 90;
  const y = 430;
  const w = 900;
  const h = 320;

  fillRound(ctx, x, y, w, h, 40, linear(ctx, x, y, x + w, y + h, [
    [0, 'rgba(13, 22, 45, 0.92)'],
    [1, 'rgba(30, 20, 66, 0.92)'],
  ]));
  strokeRound(ctx, x, y, w, h, 40, linear(ctx, x, y, x + w, y, [
    [0, 'rgba(52, 211, 153, 0.85)'],
    [1, 'rgba(34, 211, 238, 0.85)'],
  ]), 4);

  ctx.textAlign = 'center';
  ctx.font = `900 26px ${MONO}`;
  setTracking(ctx, 4);
  ctx.fillStyle = C.slate;
  ctx.fillText(ellipsize(ctx, tr('pdEstimatedValuation'), 800), 540, y + 62);
  setTracking(ctx, 0);

  const value = formatCurrency(valuation);
  const valueSize = fitFont(ctx, value, 780, 900, 124, SANS, 48);
  ctx.font = `900 ${valueSize}px ${SANS}`;
  ctx.fillStyle = linear(ctx, 180, 0, 900, 0, [
    [0, C.emerald],
    [1, C.cyanSoft],
  ]);
  ctx.fillText(value, 540, y + 160);

  drawPill(ctx, 540, y + 258, `+${formatCurrency(vps)} ${tr('pdPassiveCashflow')}`, {
    font: `800 28px ${MONO}`,
    color: C.cyanSoft,
    bg: 'rgba(34, 211, 238, 0.12)',
    border: 'rgba(34, 211, 238, 0.45)',
    height: 60,
  });
}

function drawTierBar(ctx, tr, hypeTier) {
  const tier = Math.max(1, Math.min(10, hypeTier || 1));

  ctx.font = `800 24px ${MONO}`;
  setTracking(ctx, 3);
  ctx.fillStyle = C.slate;
  ctx.textAlign = 'left';
  ctx.fillText(tr('pdHypeTierRank'), 92, 792);
  setTracking(ctx, 0);

  ctx.font = `900 28px ${MONO}`;
  ctx.fillStyle = C.fuchsia;
  ctx.textAlign = 'right';
  ctx.fillText(`${tr('pdTierLabel')} ${tier} / 10`, 988, 792);

  const barX = 90;
  const barY = 818;
  const barW = 900;
  const barH = 26;
  const gap = 8;
  const segW = (barW - gap * 9) / 10;
  const fillGrad = linear(ctx, barX, 0, barX + barW, 0, [
    [0, C.cyan],
    [0.55, C.violet],
    [1, C.amber],
  ]);

  for (let i = 0; i < 10; i++) {
    const sx = barX + i * (segW + gap);
    if (i < tier) {
      fillRound(ctx, sx, barY, segW, barH, 8, fillGrad);
    } else {
      fillRound(ctx, sx, barY, segW, barH, 8, 'rgba(255,255,255,0.07)');
      strokeRound(ctx, sx, barY, segW, barH, 8, 'rgba(255,255,255,0.10)', 2);
    }
  }
}

function drawStatGrid(ctx, items) {
  const cardW = 435;
  const cardH = 170;
  const colX = [90, 555];
  const rowY = [880, 1065];

  items.slice(0, 4).forEach((item, idx) => {
    const x = colX[idx % 2];
    const y = rowY[Math.floor(idx / 2)];

    fillRound(ctx, x, y, cardW, cardH, 26, 'rgba(11, 18, 38, 0.82)');
    strokeRound(ctx, x, y, cardW, cardH, 26, 'rgba(255,255,255,0.10)', 2);

    // Farbiger Akzent-Balken links
    fillRound(ctx, x + 20, y + 30, 8, cardH - 60, 4, item.color);

    ctx.textAlign = 'left';
    ctx.font = `800 21px ${MONO}`;
    setTracking(ctx, 2);
    ctx.fillStyle = C.slate;
    ctx.fillText(ellipsize(ctx, item.label.toUpperCase(), cardW - 90), x + 44, y + 56);
    setTracking(ctx, 0);

    const size = fitFont(ctx, item.value, cardW - 84, 900, 42, SANS, 20);
    ctx.font = `900 ${size}px ${SANS}`;
    ctx.fillStyle = item.color;
    ctx.fillText(item.value, x + 44, y + 112);
  });
}

function drawEngines(ctx, tr, engines) {
  const x = 90;
  const y = 1265;
  const w = 900;
  const h = 310;

  fillRound(ctx, x, y, w, h, 32, 'rgba(11, 18, 38, 0.82)');
  strokeRound(ctx, x, y, w, h, 32, 'rgba(168, 85, 247, 0.45)', 3);

  ctx.textAlign = 'center';
  ctx.font = `900 27px ${MONO}`;
  setTracking(ctx, 3);
  ctx.fillStyle = C.violet;
  ctx.fillText(ellipsize(ctx, tr('pdDeployedEngines'), 820), 540, y + 50);
  setTracking(ctx, 0);
  line(ctx, x + 40, y + 78, x + w - 40, y + 78, 'rgba(168, 85, 247, 0.25)', 2);

  if (!engines.length) {
    ctx.font = `italic 30px ${SANS}`;
    ctx.fillStyle = C.slate;
    ctx.fillText(ellipsize(ctx, tr('pdManualTappingMode'), 800), 540, y + 190);
    return;
  }

  engines.slice(0, 3).forEach((eng, i) => {
    const rowY = y + 130 + i * 64;

    ctx.beginPath();
    ctx.arc(x + 52, rowY, 21, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(168, 85, 247, 0.18)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = `900 22px ${MONO}`;
    ctx.fillStyle = C.fuchsia;
    ctx.fillText(String(i + 1), x + 52, rowY + 1);

    ctx.textAlign = 'right';
    ctx.font = `900 28px ${MONO}`;
    const countText = `${eng.count}× ${tr('pdDeployedLabel')}`;
    const countW = ctx.measureText(countText).width;
    ctx.fillStyle = C.cyanSoft;
    ctx.fillText(countText, x + w - 40, rowY);

    ctx.textAlign = 'left';
    ctx.font = `800 31px ${SANS}`;
    ctx.fillStyle = C.slateLight;
    ctx.fillText(ellipsize(ctx, eng.name, w - 150 - countW), x + 88, rowY);
  });
}

function drawCollection(ctx, tr, stats) {
  const x = 90;
  const y = 1620;
  const w = 900;
  const h = 210;

  fillRound(ctx, x, y, w, h, 32, 'rgba(11, 18, 38, 0.82)');
  strokeRound(ctx, x, y, w, h, 32, 'rgba(52, 211, 153, 0.45)', 3);

  ctx.textAlign = 'center';
  ctx.font = `900 27px ${MONO}`;
  setTracking(ctx, 3);
  ctx.fillStyle = C.emerald;
  ctx.fillText(ellipsize(ctx, tr('pdCollectionPortfolio'), 820), 540, y + 46);
  setTracking(ctx, 0);

  const rows = [
    {
      label: tr('pdBadgesUnlocked'),
      value: `${stats.badgeCount} / ${stats.badgeTotal}`,
      pct: stats.badgeTotal ? stats.badgeCount / stats.badgeTotal : 0,
      color: C.amber,
    },
    {
      label: tr('pdBuzzwordCards'),
      value: `${stats.cardCount} / ${stats.cardTotal}  (+${stats.cardBonusPct}% VPS)`,
      pct: stats.cardTotal ? stats.cardCount / stats.cardTotal : 0,
      color: C.fuchsia,
    },
  ];

  rows.forEach((row, i) => {
    const rowY = y + 96 + i * 66;

    ctx.textAlign = 'right';
    ctx.font = `900 25px ${MONO}`;
    ctx.fillStyle = row.color;
    const valueW = ctx.measureText(row.value).width;
    ctx.fillText(row.value, x + w - 40, rowY);

    ctx.textAlign = 'left';
    ctx.font = `800 27px ${SANS}`;
    ctx.fillStyle = C.slateLight;
    ctx.fillText(ellipsize(ctx, row.label, w - 110 - valueW), x + 40, rowY);

    const trackW = w - 80;
    fillRound(ctx, x + 40, rowY + 22, trackW, 10, 5, 'rgba(255,255,255,0.08)');
    const filled = Math.max(0.02, Math.min(1, row.pct)) * trackW;
    fillRound(ctx, x + 40, rowY + 22, filled, 10, 5, row.color);
  });
}

function drawBottom(ctx, tr, H) {
  // Zitat
  const quote = tr('pdHypeQuote');
  const quoteSize = fitFont(ctx, quote, 840, 'italic 900', 32, SERIF, 20);
  ctx.textAlign = 'center';
  ctx.font = `italic 900 ${quoteSize}px ${SERIF}`;
  ctx.fillStyle = C.amberSoft;
  ctx.fillText(quote, 540, H - 300);

  // Gestempeltes VC-Siegel (leicht gedreht)
  ctx.save();
  ctx.translate(540, H - 212);
  ctx.rotate((-4 * Math.PI) / 180);
  const stampW = 620;
  const stampH = 96;
  fillRound(ctx, -stampW / 2, -stampH / 2, stampW, stampH, 20, 'rgba(251, 191, 36, 0.14)');
  strokeRound(ctx, -stampW / 2, -stampH / 2, stampW, stampH, 20, C.amber, 4);
  // Tracking VOR dem Fitten setzen, sonst wächst der Text nach der Messung wieder
  // über die Stempelbox hinaus.
  setTracking(ctx, 2);
  fitFont(ctx, tr('pdApprovedBySyndicate'), stampW - 88, 900, 34, MONO, 18);
  ctx.fillStyle = C.amberSoft;
  ctx.textAlign = 'center';
  ctx.fillText(tr('pdApprovedBySyndicate'), 0, 2);
  setTracking(ctx, 0);
  ctx.restore();

  // Footer-CTA-Balken
  const barX = 90;
  const barY = H - 140;
  const barW = 900;
  const barH = 72;
  fillRound(ctx, barX, barY, barW, barH, 36, linear(ctx, barX, 0, barX + barW, 0, [
    [0, C.cyan],
    [0.5, C.fuchsia],
    [1, C.amber],
  ]));

  const cta = tr('pdBuildEmpireFooter');
  setTracking(ctx, 1);
  fitFont(ctx, cta, barW - 80, 900, 32, SANS, 16);
  ctx.fillStyle = C.ink;
  ctx.textAlign = 'center';
  ctx.fillText(cta, 540, barY + barH / 2 + 1);
  setTracking(ctx, 0);
}

function drawNeonDeck(ctx, o) {
  const { tr, H, detailed } = o;

  drawBackground(ctx, H);
  drawFrame(ctx, H);
  drawHeader(ctx, tr);
  drawTitle(ctx, tr, o.startupName, o.hasAiDomainBonus);
  drawHeroValuation(ctx, tr, o.valuation, o.vps);
  drawTierBar(ctx, tr, o.hypeTier);
  drawStatGrid(ctx, [
    { label: tr('pdAnnualRevenue'), value: tr('pdPureHype'), color: C.rose },
    { label: tr('pdTotalTokens'), value: `${formatNumber(o.slopCount)} ${tr('pdTokensLabel')}`, color: C.violet },
    { label: tr('pdMeltedGpuCores'), value: `${o.overheatCount} ${tr('pdOverheatsLabel')}`, color: C.orange },
    { label: tr('pdPrestigeLevelStat'), value: `${o.prestigeLevel} ${tr('pdAscensionsLabel')}`, color: C.cyan },
  ]);
  drawEngines(ctx, tr, o.engines);
  if (detailed) {
    drawCollection(ctx, tr, {
      badgeCount: o.badgeCount, badgeTotal: o.badgeTotal,
      cardCount: o.cardCount, cardTotal: o.cardTotal, cardBonusPct: o.cardBonusPct,
    });
  }
  drawBottom(ctx, tr, H);
}

/* ------------------------------------------------------------------- main */

/**
 * Zeichnet die komplette Story-Card auf das übergebene Canvas.
 * @returns {string|null} PNG data-URL oder null, wenn kein 2D-Context verfügbar ist.
 */
export function drawPitchDeck(canvas, opts = {}) {
  const {
    startupName = 'startup',
    hasAiDomainBonus = false,
    valuation = 0,
    vps = 0,
    slopCount = 0,
    overheatCount = 0,
    prestigeLevel = 0,
    hypeTier = 1,
    buildings = {},
    detailed = false,
    style = 'neon',
    lang = 'de',
    badgeCount = 0,
    badgeTotal = 0,
    cardCount = 0,
    cardTotal = 0,
    cardBonusPct = 0,
    t,
  } = opts;

  const tr = t || ((k) => k);
  const H = getPitchDeckHeight(detailed);

  canvas.width = PITCH_DECK_WIDTH;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  const shared = {
    tr, lang, H, detailed, startupName, hasAiDomainBonus, valuation, vps, slopCount,
    overheatCount, prestigeLevel, hypeTier,
    engines: getTopEngines(buildings, t),
    badgeCount, badgeTotal, cardCount, cardTotal, cardBonusPct,
  };

  if (style === 'consulting') {
    drawConsultingDeck(ctx, shared);
  } else {
    drawNeonDeck(ctx, shared);
  }

  return canvas.toDataURL('image/png');
}
