import React from 'react';
import { Scale, ShieldCheck } from 'lucide-react';
import { LegalContent } from './legal/LegalContent';
import { LEGAL_CONTENT } from '../i18n/content/legal.content';

// Eigene, volle Seite für /impressum bzw. /datenschutz - gemountet in main.jsx ANSTELLE von
// App (kein Clicker, kein Game-Store, keine Tab-Navigation). Grund: token-furnace.com/
// datenschutz wurde bisher extern verlinkt (u.a. aus der iOS-App), landete mangels echter
// Route aber auf der vollen Spiel-Seite - Besucher mussten sich erst durch die App zum
// Rechtstext-Modal durchklicken (gemeldeter Bug). Diese Seite zeigt NUR den Rechtstext.
// page: 'impressum' | 'datenschutz'
export function LegalStandalonePage({ page, lang = 'de' }) {
  const title = (LEGAL_CONTENT[lang] || LEGAL_CONTENT.en)[page]?.title;
  const Icon = page === 'impressum' ? Scale : ShieldCheck;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
          <Icon className="w-5 h-5 text-cyan-400 shrink-0" />
          <h1 className="font-black text-base uppercase tracking-wide text-slate-100 truncate">
            {title}
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto p-4">
        <LegalContent page={page} lang={lang} />
      </main>

      <footer className="max-w-2xl w-full mx-auto p-4 pt-0 text-center">
        <a
          href="/"
          className="text-[11px] text-slate-500 hover:text-cyan-400 underline underline-offset-2 font-semibold transition-colors"
        >
          token-furnace.com
        </a>
      </footer>
    </div>
  );
}
