import React from 'react';

export function Footer({ onOpenImpressum, onOpenDatenschutz }) {
  return (
    <footer className="w-full py-3 flex items-center justify-center gap-4 text-[10px] font-mono uppercase tracking-widest text-slate-600">
      <button onClick={onOpenImpressum} className="hover:text-slate-300 transition-colors">
        Impressum
      </button>
      <span className="text-slate-800">·</span>
      <button onClick={onOpenDatenschutz} className="hover:text-slate-300 transition-colors">
        Datenschutz
      </button>
      <span className="text-slate-800">·</span>
      <span>© {new Date().getFullYear()} Bryopal GmbH</span>
    </footer>
  );
}
