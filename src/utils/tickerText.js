import { SATIRE_HEADLINES } from '../data/newsTickerData';

export const TICKER_SATIRE_COUNT = 5;
export const TICKER_RECENT_LOGS = 5;

// Baut den Text des Newstickers: Marktdaten, dann abwechselnd echte Log-Einträge und
// Satire-Schlagzeilen. Reine Funktion, damit die HTML-Laufzeile (NewsTicker.jsx) und
// die LED-Tafel am Kapital-Turm (buildTower.js) garantiert denselben Text zeigen.
export function buildTickerText({ logs = [], lang = 'de', hypeTier = 1, burnRate = 0, satireOffset = 0, t }) {
  const tr = t || ((k) => k);
  const pool = SATIRE_HEADLINES[lang] || SATIRE_HEADLINES.en;
  const satireItems = Array.from(
    { length: TICKER_SATIRE_COUNT },
    (_, i) => pool[(satireOffset + i) % pool.length]
  );
  const breakingItems = logs.slice(0, TICKER_RECENT_LOGS).map((l) => l.text);

  const items = [
    `${tr('tickerMarketWatch')}: ${tr('tickerHypeTier')} ${hypeTier}/10 • ${tr('tickerBurnRate')} ${(burnRate * 100).toFixed(2)}%/S • ${tr('tickerGreenwashingCertified')}`,
  ];
  const maxLen = Math.max(breakingItems.length, satireItems.length);
  for (let i = 0; i < maxLen; i += 1) {
    if (breakingItems[i]) items.push(`${tr('tickerBreaking')}: ${breakingItems[i]}`);
    if (satireItems[i]) items.push(`${tr('tickerTrending')}: ${satireItems[i]}`);
  }
  return items.join('     •     ');
}
