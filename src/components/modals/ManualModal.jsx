import React from 'react';
import { BookOpen, X, Sparkles, RotateCw, Flame, ShieldAlert, Cpu, Zap } from 'lucide-react';
import { MANUAL_CONTENT } from '../../i18n/content/manual.content';

// Wandelt **fett markierten** Text in <strong>-Segmente um, damit die Übersetzungs-Strings
// (siehe manual.content.js) einfache Markdown-Bold-Syntax statt eingebetteter JSX nutzen können.
function renderRich(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export function ManualModal({ isOpen, onClose, lang = 'de' }) {
  if (!isOpen) return null;

  const m = MANUAL_CONTENT[lang] || MANUAL_CONTENT.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#1C2B3A] text-[#EAE7DA] border-2 border-[#8A6A1F] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 bg-[#14202C] border-b border-[#8A6A1F]/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#8A6A1F]" />
            <h2 className="font-serif font-black text-lg tracking-wide uppercase text-[#EAE7DA]">
              {m.modalTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-[#2A3C50] text-[#EAE7DA] hover:bg-[#8A6A1F] hover:text-slate-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Manual Content */}
        <div className="p-5 overflow-y-auto flex flex-col gap-6 text-xs leading-relaxed">
          {/* Section 1 */}
          <section className="bg-[#14202C]/60 p-4 rounded-xl border border-[#8A6A1F]/30">
            <h3 className="font-serif font-extrabold text-sm text-[#8A6A1F] uppercase mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> {m.s1Title}
            </h3>
            <p className="mb-2">{renderRich(m.s1Body1)}</p>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>{renderRich(m.s1Li1)}</li>
              <li>{renderRich(m.s1Li2)}</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="bg-[#14202C]/60 p-4 rounded-xl border border-rose-500/30">
            <h3 className="font-serif font-extrabold text-sm text-rose-400 uppercase mb-2 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-500" /> {m.s2Title}
            </h3>
            <p className="mb-2">{renderRich(m.s2Body1)}</p>
            <p className="text-slate-300">{renderRich(m.s2Body2)}</p>
          </section>

          {/* Section 3 */}
          <section className="bg-[#14202C]/60 p-4 rounded-xl border border-cyan-500/30">
            <h3 className="font-serif font-extrabold text-sm text-cyan-400 uppercase mb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" /> {m.s3Title}
            </h3>
            <div className="space-y-2 text-slate-300">
              <div>{renderRich(m.s3Li1)}</div>
              <div>{renderRich(m.s3Li2)}</div>
              <div>{renderRich(m.s3Li3)}</div>
              <div>{renderRich(m.s3Li4)}</div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-[#14202C]/60 p-4 rounded-xl border border-[#8A6A1F]/30">
            <h3 className="font-serif font-extrabold text-sm text-[#8A6A1F] uppercase mb-2 flex items-center gap-1.5">
              <RotateCw className="w-4 h-4" /> {m.s4Title}
            </h3>
            <p className="mb-2">{renderRich(m.s4Body1)}</p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 mb-2">
              <li>{renderRich(m.s4Li1)}</li>
              <li>{renderRich(m.s4Li2)}</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-[#14202C]/60 p-4 rounded-xl border border-purple-500/30">
            <h3 className="font-serif font-extrabold text-sm text-purple-300 uppercase mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-purple-400" /> {m.s5Title}
            </h3>
            <p className="mb-2">{renderRich(m.s5Body1)}</p>
            <p className="text-slate-300">{renderRich(m.s5Body2)}</p>
          </section>

          {/* Section 6 */}
          <section className="bg-[#14202C]/60 p-4 rounded-xl border border-amber-500/30">
            <h3 className="font-serif font-extrabold text-sm text-amber-300 uppercase mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> {m.s6Title}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>{renderRich(m.s6Li1)}</li>
              <li>{renderRich(m.s6Li2)}</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#14202C] border-t border-[#8A6A1F]/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#8A6A1F] text-slate-950 font-black rounded-xl hover:bg-[#C59B3F] transition-all uppercase tracking-wider text-xs shadow-lg"
          >
            {m.closeButton}
          </button>
        </div>
      </div>
    </div>
  );
}
