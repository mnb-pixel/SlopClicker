// Consulting-Stil der Pitch-Deck-Karte: seriöser Berater-/IC-Einseiter auf weissem
// Papier statt Neon-Cyberpunk. Die Satire lebt hier vom Kontrast - bierernste
// Layout-Sprache (Management Summary, nummerierte Abbildungen, Fussnoten,
// Haftungsausschluss) über komplett absurden Zahlen.
//
// Bewusst KEINE Anlehnung an eine reale Beratungsgesellschaft: eigene Farbwelt
// (Navy/Petrol), und als Absender dient das spielinterne, frei erfundene
// "Board Syndicate" - kein realer Firmenname, kein reales Logo.

import { formatCurrency, formatNumber } from './formatters';
import {
  PITCH_DECK_WIDTH, SANS, SERIF,
  fillRound, line, setTracking, fitFont, ellipsize, wrapText, fmt,
} from './pitchDeckShared';

const K = {
  paper: '#ffffff',
  panel: '#f3f6f9',
  rowAlt: '#fafbfc',
  navy: '#12365c',
  navyDeep: '#0b2440',
  accent: '#0f766e',
  ink: '#1f2937',
  gray: '#6b7280',
  grayLight: '#9ca3af',
  hair: '#dde1e6',
};

const L = 90;
const R = 990;
const W = R - L;

function formatDocDate(lang) {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  if (lang === 'en') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${dd}, ${d.getFullYear()}`;
  }
  return `${dd}.${mm}.${d.getFullYear()}`;
}

function docCode(startupName) {
  const initials = String(startupName || 'SC').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) || 'SC';
  return `${initials}-VAL-${new Date().getFullYear()}-001`;
}

function drawWatermark(ctx, tr, H) {
  ctx.save();
  ctx.translate(PITCH_DECK_WIDTH / 2, H * 0.5);
  ctx.rotate((-32 * Math.PI) / 180);
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(18, 54, 92, 0.055)';
  fitFont(ctx, tr('cdDraftWatermark'), 1150, 900, 210, SANS, 90);
  ctx.fillText(tr('cdDraftWatermark'), 0, 0);
  ctx.restore();
}

function drawHeader(ctx, tr, startupName, lang) {
  // Farbbänder oben
  ctx.fillStyle = K.navy;
  ctx.fillRect(0, 0, PITCH_DECK_WIDTH, 16);
  ctx.fillStyle = K.accent;
  ctx.fillRect(0, 16, PITCH_DECK_WIDTH, 4);

  ctx.textAlign = 'left';
  ctx.font = `800 21px ${SANS}`;
  setTracking(ctx, 3);
  ctx.fillStyle = K.gray;
  ctx.fillText(ellipsize(ctx, `${tr('cdProjectPrefix')} ${String(startupName).toUpperCase()}`, 520), L, 66);

  ctx.textAlign = 'right';
  ctx.fillStyle = K.accent;
  ctx.fillText(tr('cdConfidential'), R, 66);
  setTracking(ctx, 0);

  line(ctx, L, 94, R, 94, K.hair, 2);

  // Titelblock
  ctx.textAlign = 'left';
  const titleSize = fitFont(ctx, tr('cdDocTitle'), W, 800, 52, SANS, 28);
  ctx.font = `800 ${titleSize}px ${SANS}`;
  ctx.fillStyle = K.navy;
  ctx.fillText(tr('cdDocTitle'), L, 152);

  ctx.font = `400 25px ${SANS}`;
  ctx.fillStyle = K.gray;
  ctx.fillText(ellipsize(ctx, tr('cdDocSubtitle'), W), L, 198);

  ctx.font = `700 20px ${SANS}`;
  setTracking(ctx, 1);
  ctx.fillStyle = K.grayLight;
  ctx.fillText(`${formatDocDate(lang)}  ·  ${docCode(startupName)}`, L, 234);
  setTracking(ctx, 0);

  line(ctx, L, 262, R, 262, K.hair, 2);
}

function drawExecutiveSummary(ctx, tr, o) {
  ctx.textAlign = 'left';
  ctx.font = `900 21px ${SANS}`;
  setTracking(ctx, 3);
  ctx.fillStyle = K.accent;
  ctx.fillText(tr('cdExecSummary'), L, 300);
  setTracking(ctx, 0);

  const textX = L + 46;
  const textW = W - 76;
  const lineH = 38;

  const bullets = [
    fmt(tr('cdBullet1'), { val: formatCurrency(o.valuation) }),
    tr('cdBullet2'),
    fmt(tr('cdBullet3'), { vps: formatCurrency(o.vps) }),
  ];

  ctx.font = `400 26px ${SANS}`;
  const wrapped = bullets.map((b) => wrapText(ctx, b, textW));
  ctx.font = `700 26px ${SANS}`;
  const recLines = wrapText(ctx, tr('cdRecommendation'), textW);

  const bulletsH = wrapped.reduce((acc, lines) => acc + lines.length * lineH + 12, 0);
  const panelY = 322;
  const panelH = bulletsH + recLines.length * lineH + 62;

  fillRound(ctx, L, panelY, W, panelH, 4, K.panel);
  ctx.fillStyle = K.accent;
  ctx.fillRect(L, panelY, 6, panelH);

  let y = panelY + 40;
  wrapped.forEach((lines) => {
    ctx.fillStyle = K.accent;
    ctx.fillRect(L + 24, y - 5, 9, 9);
    ctx.font = `400 26px ${SANS}`;
    ctx.fillStyle = K.ink;
    lines.forEach((ln, i) => ctx.fillText(ln, textX, y + i * lineH));
    y += lines.length * lineH + 12;
  });

  ctx.font = `700 26px ${SANS}`;
  ctx.fillStyle = K.navy;
  recLines.forEach((ln, i) => ctx.fillText(ln, textX, y + 8 + i * lineH));

  return panelY + panelH;
}

function drawExhibitLabel(ctx, label, y) {
  ctx.textAlign = 'left';
  ctx.font = `900 21px ${SANS}`;
  setTracking(ctx, 2);
  ctx.fillStyle = K.navy;
  ctx.fillText(ellipsize(ctx, label, W), L, y);
  setTracking(ctx, 0);
  line(ctx, L, y + 18, R, y + 18, K.navy, 2);
  return y + 18;
}

function drawMetricsTable(ctx, tr, o, startY) {
  const labelY = startY + 46;
  const tableTop = drawExhibitLabel(ctx, tr('cdExhibit1'), labelY) + 2;

  const rows = [
    [tr('cdRowValuation'), formatCurrency(o.valuation)],
    [tr('cdRowLifetimeValuation'), formatCurrency(o.totalValuation)],
    [tr('cdRowCashflow'), `+${formatCurrency(o.vps)}`],
    [tr('cdRowRevenue'), tr('pdPureHype')],
    [tr('cdRowTier'), `${o.hypeTier} / 10`],
    [tr('cdRowTokens'), formatNumber(o.slopCount)],
    [tr('cdRowGpu'), String(o.overheatCount)],
    [tr('cdRowPrestige'), String(o.prestigeLevel)],
  ];
  if (o.hasAiDomainBonus) rows.push([tr('cdRowDomain'), '+10% VPS']);

  const rowH = 56;
  rows.forEach(([label, value], i) => {
    const y = tableTop + i * rowH;
    if (i % 2 === 1) {
      ctx.fillStyle = K.rowAlt;
      ctx.fillRect(L, y, W, rowH);
    }

    ctx.textAlign = 'left';
    ctx.font = `400 25px ${SANS}`;
    ctx.fillStyle = K.ink;
    ctx.fillText(ellipsize(ctx, label, W - 300), L + 20, y + rowH / 2);

    // Werte schrumpfen statt abzuschneiden - "$0.00 (100% Purer Hype)" ist deutlich
    // länger als die reinen Zahlen und wäre sonst als "…" abgeschnitten.
    ctx.textAlign = 'right';
    fitFont(ctx, value, 440, 700, 25, SANS, 17);
    ctx.fillStyle = K.navy;
    ctx.fillText(value, R - 20, y + rowH / 2);

    line(ctx, L, y + rowH, R, y + rowH, K.hair, 1);
  });

  return tableTop + rows.length * rowH;
}

function drawEngineChart(ctx, tr, engines, totals, startY) {
  const labelY = startY + 60;
  const chartTop = drawExhibitLabel(ctx, tr('cdExhibit2'), labelY) + 24;

  if (!engines.length) {
    ctx.textAlign = 'left';
    ctx.font = `italic 400 25px ${SANS}`;
    ctx.fillStyle = K.gray;
    ctx.fillText(ellipsize(ctx, tr('cdNoEngines'), W - 20), L + 20, chartTop + 26);
    return chartTop + 60;
  }

  // Nur die 3 teuersten Engine-Typen bekommen einen Balken (Platzgründe) - diese Zeile
  // zeigt den tatsächlichen Gesamtumfang über alle Typen, siehe pitchDeckCanvas.js
  // drawEngines() für dieselbe Ergänzung im Neon-Stil.
  let totalsLineH = 0;
  if (totals && totals.typesOwned > 0) {
    ctx.textAlign = 'left';
    ctx.font = `italic 400 22px ${SANS}`;
    ctx.fillStyle = K.gray;
    ctx.fillText(
      ellipsize(ctx, tr('pdEngineTypesTotal')
        .replace('{types}', String(totals.typesOwned))
        .replace('{units}', formatNumber(totals.totalUnits)), W - 20),
      L + 20, chartTop
    );
    totalsLineH = 40;
  }

  const barX = L + 340;
  const barMaxW = 430;
  const rowH = 62;
  const maxCount = Math.max(...engines.map((e) => e.count), 1);

  engines.slice(0, 3).forEach((eng, i) => {
    const y = chartTop + totalsLineH + i * rowH + 20;

    ctx.textAlign = 'left';
    ctx.font = `600 24px ${SANS}`;
    ctx.fillStyle = K.ink;
    ctx.fillText(ellipsize(ctx, eng.name, 300), L + 20, y);

    ctx.fillStyle = '#eaeef2';
    ctx.fillRect(barX, y - 13, barMaxW, 26);

    const w = Math.max(6, (eng.count / maxCount) * barMaxW);
    ctx.fillStyle = i === 0 ? K.navy : K.accent;
    ctx.fillRect(barX, y - 13, w, 26);

    ctx.textAlign = 'right';
    ctx.font = `700 24px ${SANS}`;
    ctx.fillStyle = K.navy;
    ctx.fillText(`${eng.count}×`, R, y);
  });

  return chartTop + totalsLineH + Math.min(engines.length, 3) * rowH + 20;
}

function drawPortfolioExhibit(ctx, tr, o, startY) {
  const labelY = startY + 60;
  const top = drawExhibitLabel(ctx, tr('cdExhibit3'), labelY) + 24;

  const rows = [
    {
      label: tr('cdRowBadges'),
      value: `${o.badgeCount} / ${o.badgeTotal}`,
      pct: o.badgeTotal ? o.badgeCount / o.badgeTotal : 0,
      color: K.navy,
    },
    {
      label: tr('cdRowCards'),
      value: `${o.cardCount} / ${o.cardTotal} (+${o.cardBonusPct}% VPS)`,
      pct: o.cardTotal ? o.cardCount / o.cardTotal : 0,
      color: K.accent,
    },
  ];

  const barX = L + 340;
  const barMaxW = 430;
  const rowH = 62;

  rows.forEach((row, i) => {
    const y = top + i * rowH + 20;

    ctx.textAlign = 'left';
    ctx.font = `600 24px ${SANS}`;
    ctx.fillStyle = K.ink;
    ctx.fillText(ellipsize(ctx, row.label, 300), L + 20, y);

    ctx.fillStyle = '#eaeef2';
    ctx.fillRect(barX, y - 13, barMaxW, 26);
    ctx.fillStyle = row.color;
    ctx.fillRect(barX, y - 13, Math.max(4, row.pct * barMaxW), 26);

    ctx.textAlign = 'right';
    ctx.font = `700 22px ${SANS}`;
    ctx.fillStyle = K.navy;
    ctx.fillText(ellipsize(ctx, row.value, 300), R, y);
  });

  return top + rows.length * rowH + 20;
}

// Füllt den Rest der Seite mit einem Management-Zitat - ohne das wirkt die Seite
// unten leer, sobald wenig Inhalt da ist (z. B. ohne Engines oder ohne Detailteil).
function drawPullQuote(ctx, tr, cursor, footTop) {
  const top = cursor + 54;
  const available = footTop - top;
  if (available < 170) return;

  const textW = W - 90;
  ctx.font = `italic 400 30px ${SERIF}`;
  const lines = wrapText(ctx, tr('pdHypeQuote'), textW);
  const boxH = lines.length * 44 + 96;

  fillRound(ctx, L, top, W, boxH, 4, K.panel);
  ctx.fillStyle = K.navy;
  ctx.fillRect(L, top, 6, boxH);

  ctx.textAlign = 'left';
  ctx.font = `italic 400 30px ${SERIF}`;
  ctx.fillStyle = K.navy;
  lines.forEach((ln, i) => ctx.fillText(ln, L + 46, top + 48 + i * 44));

  ctx.font = `700 20px ${SANS}`;
  setTracking(ctx, 2);
  ctx.fillStyle = K.gray;
  ctx.fillText(tr('cdQuoteSource'), L + 46, top + boxH - 32);
  setTracking(ctx, 0);
}

function drawFooter(ctx, tr, H) {
  ctx.textAlign = 'left';
  ctx.font = `italic 400 19px ${SANS}`;
  ctx.fillStyle = K.grayLight;
  ctx.fillText(ellipsize(ctx, tr('cdFootnote1'), W), L, H - 258);
  ctx.fillText(ellipsize(ctx, tr('cdFootnote2'), W), L, H - 228);
  ctx.fillText(ellipsize(ctx, tr('cdSource'), W), L, H - 198);

  ctx.font = `italic 400 19px ${SANS}`;
  ctx.fillStyle = K.gray;
  ctx.fillText(ellipsize(ctx, tr('cdDisclaimer'), W), L, H - 162);

  line(ctx, L, H - 128, R, H - 128, K.hair, 2);

  ctx.font = `700 20px ${SANS}`;
  ctx.fillStyle = K.navy;
  ctx.textAlign = 'left';
  ctx.fillText(ellipsize(ctx, tr('cdAdvisor'), 420), L, H - 96);

  ctx.textAlign = 'center';
  ctx.fillStyle = K.grayLight;
  ctx.font = `400 20px ${SANS}`;
  ctx.fillText(tr('cdPageLabel'), PITCH_DECK_WIDTH / 2, H - 96);

  // Navy-Fussband mit dem Spiel-Link
  ctx.fillStyle = K.navyDeep;
  ctx.fillRect(0, H - 56, PITCH_DECK_WIDTH, 56);
  ctx.textAlign = 'center';
  ctx.font = `800 24px ${SANS}`;
  setTracking(ctx, 3);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('TOKEN-FURNACE.COM', PITCH_DECK_WIDTH / 2, H - 27);
  setTracking(ctx, 0);
}

export function drawConsultingDeck(ctx, o) {
  const { tr, lang, H, detailed } = o;

  ctx.fillStyle = K.paper;
  ctx.fillRect(0, 0, PITCH_DECK_WIDTH, H);

  drawWatermark(ctx, tr, H);
  drawHeader(ctx, tr, o.startupName, lang);

  let cursor = drawExecutiveSummary(ctx, tr, o);
  cursor = drawMetricsTable(ctx, tr, o, cursor);
  cursor = drawEngineChart(ctx, tr, o.engines, o.engineTotals, cursor);
  if (detailed) cursor = drawPortfolioExhibit(ctx, tr, o, cursor);

  drawPullQuote(ctx, tr, cursor, H - 280);
  drawFooter(ctx, tr, H);
}
