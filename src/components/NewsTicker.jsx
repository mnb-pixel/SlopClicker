import React, { useEffect, useMemo, useState } from 'react';
import { SATIRE_HEADLINES } from '../data/newsTickerData';

const SATIRE_ROTATE_MS = 45000; // rotate the satire selection every 45s (real log entries update live)
const SATIRE_COUNT = 5;
const RECENT_LOGS_COUNT = 5;
const PX_PER_SEC = 55; // constant reading speed regardless of how much text is queued up
const APPROX_CHAR_WIDTH_PX = 6.5; // rough mono-font glyph width at the ticker's font size

export function NewsTicker({ logs = [], lang = 'de', hypeTier, burnRate, isSecTheme, t }) {
  const [satireOffset, setSatireOffset] = useState(0);
  const tr = t || ((k) => k);

  useEffect(() => {
    const id = setInterval(() => setSatireOffset((prev) => prev + SATIRE_COUNT), SATIRE_ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const combinedText = useMemo(() => {
    const pool = SATIRE_HEADLINES[lang] || SATIRE_HEADLINES.en;
    const satireItems = Array.from(
      { length: SATIRE_COUNT },
      (_, i) => pool[(satireOffset + i) % pool.length]
    );
    const breakingItems = logs.slice(0, RECENT_LOGS_COUNT).map((l) => l.text);

    const items = [
      `${tr('tickerMarketWatch')}: ${tr('tickerHypeTier')} ${hypeTier}/10 • ${tr('tickerBurnRate')} ${(burnRate * 100).toFixed(2)}%/S • ${tr('tickerGreenwashingCertified')}`,
    ];
    const maxLen = Math.max(breakingItems.length, satireItems.length);
    for (let i = 0; i < maxLen; i++) {
      if (breakingItems[i]) items.push(`${tr('tickerBreaking')}: ${breakingItems[i]}`);
      if (satireItems[i]) items.push(`${tr('tickerTrending')}: ${satireItems[i]}`);
    }
    return items.join('     •     ');
  }, [logs, lang, satireOffset, hypeTier, burnRate, tr]);

  const durationSec = Math.max(20, (combinedText.length * APPROX_CHAR_WIDTH_PX) / PX_PER_SEC);

  return (
    <div className={`text-[10px] font-mono tracking-widest overflow-hidden whitespace-nowrap py-0.5 border-b ${
      isSecTheme ? 'bg-[#F4F1EA] text-slate-900 border-slate-900' : 'bg-slate-950 text-cyan-400/80 border-slate-800'
    }`}>
      <div
        className="inline-flex animate-marquee uppercase font-bold"
        style={{ animationDuration: `${durationSec}s` }}
      >
        <span className="pr-16">{combinedText}</span>
        <span className="pr-16" aria-hidden="true">{combinedText}</span>
      </div>
    </div>
  );
}
