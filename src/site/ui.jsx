import React from 'react';
import { Play, Smartphone, ArrowRight } from 'lucide-react';

export const PLAY_URL = '/play';
export const VOXEL_URL = '/voxel';

// iOS-App im App Store (eigener App-Name "Tokenkamin: AI Clicker", deutsche Übersetzung von
// "Token Furnace") - gleiches Spiel wie die Web-Version.
export const APP_STORE_URL = 'https://apps.apple.com/ch/app/tokenkamin-ai-clicker/id6801915828?l=de-DE';

// Offizielles "Laden im App Store"-Badge von Apples Marketing-Tools-API. Apples Guidelines
// (developer.apple.com/app-store/marketing/guidelines) verbieten eigene Nachbauten, schreiben
// die schwarze Variante als Standard vor und erlauben nur EIN Badge pro Layout - deshalb
// gibt es das Badge nur auf der Startseite und der iOS-App-Seite, überall sonst Textlinks.
export const APP_STORE_BADGE_SRC =
  'https://toolbox.marketingtools.apple.com/api/badges/download-on-the-app-store/black/de-de';

// public/screenshots/*.webp - alle aus 1320x2868-Simulator-Aufnahmen auf 640 px Breite
// skaliert, Statusleiste/Home-Indicator abgeschnitten (siehe Plan).
export const SHOT_W = 640;
export const SHOT_H = 1245;

export const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm px-5 py-2.5 rounded-xl transition-colors';
export const BTN_SECONDARY =
  'inline-flex items-center justify-center gap-2 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors';

// Inline-Auszeichnung in Content-Strings: **fett** und [Text](/pfad) - bewusst nur diese
// zwei, alles andere bleibt Struktur (Komponenten) statt Markup im Text.
export function renderRich(text, keyPrefix = 'r') {
  return String(text)
    .split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
    .map((part, i) => {
      const key = `${keyPrefix}-${i}`;
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={key} className="font-semibold text-slate-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        const external = /^https?:\/\//.test(link[2]);
        return (
          <a
            key={key}
            href={link[2]}
            className="site-link"
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {link[1]}
          </a>
        );
      }
      return <React.Fragment key={key}>{part}</React.Fragment>;
    });
}

export function Kicker({ children }) {
  return (
    <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-400 mb-2">
      {children}
    </p>
  );
}

export function PageIntro({ kicker, title, lead, children }) {
  return (
    <header className="mb-10">
      {kicker && <Kicker>{kicker}</Kicker>}
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-100">{title}</h1>
      <div className="mt-3 h-px w-24 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-transparent" />
      {lead && (
        <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
          {renderRich(lead, 'lead')}
        </p>
      )}
      {children}
    </header>
  );
}

export function Section({ id, kicker, title, children }) {
  return (
    <section id={id} className="mt-12 scroll-mt-20">
      {kicker && <Kicker>{kicker}</Kicker>}
      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100 mb-4">{title}</h2>
      {children}
    </section>
  );
}

export function Sub({ id, children }) {
  return (
    <h3 id={id} className="text-base sm:text-lg font-bold text-slate-100 mt-7 mb-2 scroll-mt-20">
      {children}
    </h3>
  );
}

export function Prose({ children }) {
  return <div className="site-prose">{children}</div>;
}

export function Paragraphs({ items, keyPrefix = 'p' }) {
  return items.map((text, i) => <p key={`${keyPrefix}-${i}`}>{renderRich(text, `${keyPrefix}-${i}`)}</p>);
}

export function Bullets({ items, keyPrefix = 'b' }) {
  return (
    <ul>
      {items.map((text, i) => (
        <li key={`${keyPrefix}-${i}`}>{renderRich(text, `${keyPrefix}-${i}`)}</li>
      ))}
    </ul>
  );
}

export function Steps({ items }) {
  return (
    <ol className="!list-none !pl-0 flex flex-col gap-4">
      {items.map((step, i) => (
        <li key={i} className="flex gap-4 !pl-0">
          <span className="shrink-0 w-8 h-8 rounded-full bg-slate-900 border border-cyan-500/50 text-cyan-300 font-mono text-sm font-bold flex items-center justify-center">
            {i + 1}
          </span>
          <div>
            <p className="font-bold text-slate-100 !mb-1">{step.title}</p>
            <p className="!mb-0 text-slate-300">{renderRich(step.text, `step-${i}`)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function DataTable({ caption, head, rows }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50 my-5">
      <table className="w-full text-sm text-left">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-slate-800">
            {head.map((h, i) => (
              <th key={i} scope="col" className="px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-cyan-400 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-slate-800/60 last:border-0">
              {row.map((cell, ci) => (
                <td key={ci} className={`px-3 py-2 align-top text-slate-300 ${ci === 0 ? 'font-semibold text-slate-100 whitespace-nowrap' : ''}`}>
                  {renderRich(cell, `t-${ri}-${ci}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Glossary({ items }) {
  return (
    <dl className="flex flex-col gap-5">
      {items.map((entry) => (
        <div key={entry.term} id={entry.id} className="scroll-mt-20">
          <dt className="font-bold text-slate-100">{entry.term}</dt>
          <dd className="text-slate-300 leading-relaxed mt-0.5">{renderRich(entry.def, entry.term)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function FaqItems({ items }) {
  return (
    <div className="flex flex-col gap-6">
      {items.map((item, i) => (
        <div key={i} id={item.id} className="scroll-mt-20">
          <h3 className="font-bold text-slate-100 mb-1.5">{item.q}</h3>
          <div className="site-prose">
            {(Array.isArray(item.a) ? item.a : [item.a]).map((text, j) => (
              <p key={j}>{renderRich(text, `faq-${i}-${j}`)}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Callout({ title, children }) {
  return (
    <aside className="my-6 rounded-xl border border-cyan-500/30 bg-cyan-500/5 px-4 py-3">
      {title && <p className="font-mono text-[11px] uppercase tracking-wider text-cyan-400 mb-1">{title}</p>}
      <div className="text-sm text-slate-300 leading-relaxed">{children}</div>
    </aside>
  );
}

export function PhoneShot({ src, alt, caption, priority = false, className = '' }) {
  return (
    <figure className={`flex flex-col items-center gap-2 ${className}`}>
      <img
        src={src}
        alt={alt}
        width={SHOT_W}
        height={SHOT_H}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="w-full max-w-[260px] rounded-[1.6rem] border border-slate-700 shadow-2xl shadow-black/60 bg-slate-950"
      />
      {caption && <figcaption className="text-xs text-slate-500 text-center max-w-[260px]">{caption}</figcaption>}
    </figure>
  );
}

export function FeatureRow({ id, kicker, title, paragraphs, image, alt, caption, reverse = false }) {
  return (
    <section id={id} className="mt-14 grid gap-8 md:grid-cols-[minmax(0,1fr)_260px] md:items-center scroll-mt-20">
      <div className={reverse ? 'md:order-2' : ''}>
        {kicker && <Kicker>{kicker}</Kicker>}
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100 mb-3">{title}</h2>
        <Prose>
          <Paragraphs items={paragraphs} keyPrefix={id || title} />
        </Prose>
      </div>
      <PhoneShot src={image} alt={alt} caption={caption} className={reverse ? 'md:order-1' : ''} />
    </section>
  );
}

export function AppStoreBadge() {
  return (
    <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="inline-block">
      <img src={APP_STORE_BADGE_SRC} alt="Jetzt im App Store laden" className="h-11 w-auto" width={135} height={40} />
    </a>
  );
}

export function CtaBar({ title = 'Selbst ausprobieren', text }) {
  return (
    <div className="mt-14 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
      <p className="font-black text-slate-100 text-lg">{title}</p>
      {text && <p className="text-sm text-slate-400 mt-1 mb-4 max-w-xl">{text}</p>}
      <div className={`flex flex-wrap gap-3 ${text ? '' : 'mt-4'}`}>
        <a href={PLAY_URL} className={BTN_PRIMARY}>
          <Play className="w-4 h-4" /> Im Browser spielen
        </a>
        <a href="/ios-app" className={BTN_SECONDARY}>
          <Smartphone className="w-4 h-4" /> Auch als iOS-App
        </a>
      </div>
    </div>
  );
}

export function PageEnd({ next = [], ctaText }) {
  return (
    <>
      <CtaBar text={ctaText} />
      {next.length > 0 && (
        <nav aria-label="Weiterlesen" className="mt-8 grid gap-3 sm:grid-cols-2">
          {next.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group rounded-xl border border-slate-800 hover:border-cyan-500/50 bg-slate-900/40 px-4 py-3 transition-colors"
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Weiterlesen</span>
              <span className="flex items-center justify-between gap-2 font-bold text-slate-100">
                {item.label}
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </span>
              {item.teaser && <span className="block text-xs text-slate-400 mt-0.5">{item.teaser}</span>}
            </a>
          ))}
        </nav>
      )}
    </>
  );
}

export function Toc({ items }) {
  return (
    <nav aria-label="Inhalt" className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-2">Inhalt</p>
      <ol className="grid gap-x-6 gap-y-1 sm:grid-cols-2 text-sm list-decimal list-inside marker:text-slate-600">
        {items.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`} className="site-link">
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
