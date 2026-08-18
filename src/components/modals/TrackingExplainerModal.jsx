import React from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck } from 'lucide-react';

// Eigener Erklärbildschirm VOR dem System-ATT-Prompt (siehe docs/ios-app-konzept.md §6:
// "nicht beim Kaltstart", "vorher ein eigener Erklärbildschirm, das hebt die Zustimmungsrate
// deutlich"). Ein Tap auf "Weiter" löst erst dann den eigentlichen iOS-Systemdialog aus
// (siehe confirmTrackingExplainer in useGameStore.js) - kein separater Ablehnen-Button hier,
// die Ablehnung passiert im System-Dialog selbst ("Ask App Not to Track").
export function TrackingExplainerModal({ open, onConfirm, t }) {
  if (!open) return null;

  const tr = t || ((k) => k);

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative max-w-sm w-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/60 rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center gap-3">
        <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-lg">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-base font-black uppercase tracking-wide text-slate-100">
            {tr('trackingExplainerTitle')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {tr('trackingExplainerDesc')}
          </p>
        </div>
        <button
          onClick={onConfirm}
          className="w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 to-fuchsia-500 text-slate-950 hover:brightness-110 active:scale-95 shadow-xl transition-all"
        >
          {tr('trackingExplainerBtn')}
        </button>
      </div>
    </div>,
    document.body
  );
}
