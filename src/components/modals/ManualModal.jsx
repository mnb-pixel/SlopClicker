import React from 'react';
import { BookOpen, X, Sparkles, Flame, ShieldAlert, Cpu } from 'lucide-react';
import { MANUAL_CONTENT } from '../../i18n/content/manual.content';
import { useSkin } from '../skin';

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
  // Zwei Looks, ein Markup - siehe src/components/skin.jsx. Im Spiel-Skin wird aus der
  // dunklen Akte ein Papierheft im Grafik-Stil der Insel: vier Abschnitte als Bögen mit
  // farbigem Reiter an der Kante, dieselben Bedeutungsfarben wie im Shop.
  const { cx } = useSkin();

  if (!isOpen) return null;

  const m = MANUAL_CONTENT[lang] || MANUAL_CONTENT.en;

  return (
    <div className={cx(
      'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn',
      'gs-modal-backdrop gs-skin animate-fadeIn'
    )}>
      <div className={cx(
        'bg-[#1C2B3A] text-[#EAE7DA] border-2 border-[#8A6A1F] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans',
        'gs-modal'
      )}>
        {/* Header */}
        <div className={cx(
          'p-4 bg-[#14202C] border-b border-[#8A6A1F]/40 flex items-center justify-between',
          'gs-modal__head'
        )}>
          <div className="flex items-center gap-2">
            <BookOpen className={cx('w-5 h-5 text-[#8A6A1F]', 'w-5 h-5 gs-ink-gold')} />
            <h2 className={cx(
              'font-serif font-black text-lg tracking-wide uppercase text-[#EAE7DA]',
              'gs-title'
            )}>
              {m.modalTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={cx(
              'p-1 rounded-lg bg-[#2A3C50] text-[#EAE7DA] hover:bg-[#8A6A1F] hover:text-slate-950 transition-colors',
              'gs-iconbtn'
            )}
          >
            <X className={cx('w-5 h-5', 'w-4 h-4')} />
          </button>
        </div>

        {/* Scrollable Manual Content */}
        <div className={cx(
          'p-5 overflow-y-auto flex flex-col gap-6 text-xs leading-relaxed',
          'gs-modal__body'
        )}>
          {/* Section 1 */}
          <section className={cx('bg-[#14202C]/60 p-4 rounded-xl border border-[#8A6A1F]/30', 'gs-section gs-acc-gold')}>
            <h3 className={cx('font-serif font-extrabold text-sm text-[#8A6A1F] uppercase mb-2 flex items-center gap-1.5', '')}>
              <Sparkles className="w-4 h-4" /> {m.s1Title}
            </h3>
            <p className="mb-2">{renderRich(m.s1Body1)}</p>
            <ul className={cx('list-disc list-inside space-y-1 text-slate-300', 'list-disc list-inside space-y-1')}>
              <li>{renderRich(m.s1Li1)}</li>
              <li>{renderRich(m.s1Li2)}</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className={cx('bg-[#14202C]/60 p-4 rounded-xl border border-rose-500/30', 'gs-section gs-acc-rust')}>
            <h3 className={cx('font-serif font-extrabold text-sm text-rose-400 uppercase mb-2 flex items-center gap-1.5', '')}>
              <Flame className={cx('w-4 h-4 text-rose-500', 'w-4 h-4')} /> {m.s2Title}
            </h3>
            <p className="mb-2">{renderRich(m.s2Body1)}</p>
            <p className={cx('text-slate-300', '')}>{renderRich(m.s2Body2)}</p>
          </section>

          {/* Section 3 */}
          <section className={cx('bg-[#14202C]/60 p-4 rounded-xl border border-cyan-500/30', 'gs-section gs-acc-teal')}>
            <h3 className={cx('font-serif font-extrabold text-sm text-cyan-400 uppercase mb-2 flex items-center gap-1.5', '')}>
              <Cpu className={cx('w-4 h-4 text-cyan-400', 'w-4 h-4')} /> {m.s3Title}
            </h3>
            <div className={cx('space-y-2 text-slate-300', 'space-y-2')}>
              <div>{renderRich(m.s3Li1)}</div>
              <div>{renderRich(m.s3Li2)}</div>
              <div>{renderRich(m.s3Li3)}</div>
              <div>{renderRich(m.s3Li4)}</div>
            </div>
          </section>

          {/* Section 4 */}
          <section className={cx('bg-[#14202C]/60 p-4 rounded-xl border border-amber-500/30', 'gs-section gs-acc-gold')}>
            <h3 className={cx('font-serif font-extrabold text-sm text-amber-300 uppercase mb-2 flex items-center gap-1.5', '')}>
              <ShieldAlert className={cx('w-4 h-4 text-amber-400', 'w-4 h-4')} /> {m.s4Title}
            </h3>
            <ul className={cx('list-disc list-inside space-y-1 text-slate-300', 'list-disc list-inside space-y-1')}>
              <li>{renderRich(m.s4Li1)}</li>
              <li>{renderRich(m.s4Li2)}</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className={cx(
          'p-4 bg-[#14202C] border-t border-[#8A6A1F]/40 flex justify-end',
          'gs-modal__foot'
        )}>
          <button
            onClick={onClose}
            className={cx(
              'px-5 py-2 bg-[#8A6A1F] text-slate-950 font-black rounded-xl hover:bg-[#C59B3F] transition-all uppercase tracking-wider text-xs shadow-lg',
              'gs-btn gs-btn--gold'
            )}
          >
            {m.closeButton}
          </button>
        </div>
      </div>
    </div>
  );
}
