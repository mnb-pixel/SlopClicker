// Gemeinsame Canvas-Bausteine für alle Pitch-Deck-Stile (Neon & Consulting).
//
// WICHTIG: Jeder Pfad-Helfer ruft IMMER ctx.beginPath() auf, bevor er einen Pfad
// baut. Ohne das sammeln sich alle roundRect()-Subpfade im selben Pfad an und ein
// späteres fill() übermalt sämtliche vorher gezeichneten Boxen samt Text.
//
// Ausserdem bewusst KEIN ctx.shadowBlur: das ist auf iOS Safari CPU-gebunden und
// hat auf dem grossen Canvas den Renderer der Seite zum Absturz gebracht.

import { BUILDINGS_DATA } from '../data/buildingsData';

export const PITCH_DECK_WIDTH = 1080;
export const PITCH_DECK_BASE_HEIGHT = 1920;
const DETAILED_EXTRA_HEIGHT = 250;

export const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
export const MONO = 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Courier New", monospace';
export const SERIF = 'Georgia, "Times New Roman", serif';

export function roundedPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function fillRound(ctx, x, y, w, h, r, style) {
  roundedPath(ctx, x, y, w, h, r);
  ctx.fillStyle = style;
  ctx.fill();
}

export function strokeRound(ctx, x, y, w, h, r, style, lineWidth = 2) {
  roundedPath(ctx, x, y, w, h, r);
  ctx.strokeStyle = style;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

export function line(ctx, x1, y1, x2, y2, style, lineWidth = 2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = style;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

export function linear(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([offset, color]) => g.addColorStop(offset, color));
  return g;
}

export function setTracking(ctx, px) {
  // letterSpacing wird von älteren Engines ignoriert - dann rendert es einfach eng.
  try { ctx.letterSpacing = `${px}px`; } catch { /* nicht unterstützt */ }
}

// Schriftgröße so lange verkleinern, bis der Text in maxWidth passt.
export function fitFont(ctx, text, maxWidth, weight, size, family, minSize = 14) {
  let current = size;
  ctx.font = `${weight} ${current}px ${family}`;
  while (current > minSize && ctx.measureText(text).width > maxWidth) {
    current -= 2;
    ctx.font = `${weight} ${current}px ${family}`;
  }
  return current;
}

// Text mit "…" kürzen, falls er zu breit ist (Font muss vorher gesetzt sein).
export function ellipsize(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxWidth) {
    cut = cut.slice(0, -1);
  }
  return `${cut.trim()}…`;
}

// Umbricht Text an Wortgrenzen (Font muss vorher gesetzt sein).
export function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(candidate).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });
  if (current) lines.push(current);
  return lines;
}

// {platzhalter} in übersetzten Sätzen ersetzen (wie tf() im Store).
export function fmt(str, vars = {}) {
  let out = String(str);
  Object.entries(vars).forEach(([k, v]) => { out = out.replaceAll(`{${k}}`, v); });
  return out;
}

export function drawPill(ctx, cx, cy, text, opts = {}) {
  const {
    font = `900 26px ${MONO}`,
    color = '#e2e8f0',
    bg = 'rgba(255,255,255,0.06)',
    border = null,
    padX = 30,
    height = 54,
    tracking = 0,
  } = opts;

  ctx.font = font;
  setTracking(ctx, tracking);
  const w = ctx.measureText(text).width + padX * 2;
  const x = cx - w / 2;
  const y = cy - height / 2;

  fillRound(ctx, x, y, w, height, height / 2, bg);
  if (border) strokeRound(ctx, x, y, w, height, height / 2, border, 2);

  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(text, cx, cy);
  setTracking(ctx, 0);
  return w;
}

// Liefert die 3 höchstwertigen gekauften Engines (teuerste zuerst).
export function getTopEngines(buildings = {}, t) {
  return BUILDINGS_DATA
    .map((b) => ({
      name: (t && t(`building_${b.id}_name`)) || b.id,
      count: buildings[b.id] || 0,
    }))
    .filter((b) => b.count > 0)
    .slice(-3)
    .reverse();
}

export function getPitchDeckHeight(detailed) {
  return PITCH_DECK_BASE_HEIGHT + (detailed ? DETAILED_EXTRA_HEIGHT : 0);
}
