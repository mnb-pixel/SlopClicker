import React from 'react';
import { createPortal } from 'react-dom';
import { Scale, ShieldCheck, X } from 'lucide-react';
import { LegalContent } from '../legal/LegalContent';
import { LEGAL_CONTENT } from '../../i18n/content/legal.content';

// page: 'impressum' | 'datenschutz'
export function LegalModal({ page, onClose, lang = 'de' }) {
  if (!page) return null;

  const title = (LEGAL_CONTENT[lang] || LEGAL_CONTENT.en)[page]?.title;
  if (!title) return null;

  const Icon = page === 'impressum' ? Scale : ShieldCheck;

  const modalContent = (
    <div
      className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="w-5 h-5 text-cyan-400 shrink-0" />
            <h2 className="font-black text-base uppercase tracking-wide text-slate-100 truncate">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          <LegalContent page={page} lang={lang} />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
