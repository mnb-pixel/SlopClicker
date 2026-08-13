import React from 'react';
import { Megaphone } from 'lucide-react';

// Statischer Werbe-Slot-Platzhalter. Rendert aktuell nur eine klar gekennzeichnete
// "Werbung"-Fläche - für eine echte Integration (z.B. Google Ad Manager / AdSense)
// wird hier nur der Platzhalter-Inhalt gegen das Netzwerk-Snippet getauscht, Größe
// und Platzierung im Layout bleiben unverändert.
const SIZES = {
  leaderboard: 'h-[50px] md:h-[90px] max-w-[728px]', // Footer-Leiste
  rectangle: 'h-[250px] max-w-[300px]', // Sidebar/Modal-Slot
};

export function AdBanner({ variant = 'leaderboard', label = 'Werbung', adFree = false }) {
  // Werbefrei-IAP: kein Platzhalter, kein Ad-SDK - die Fläche verschwindet komplett statt nur
  // leer/ausgegraut dazustehen (siehe docs/ios-app-konzept.md §2, Punkt 1).
  if (adFree) return null;
  return (
    <div className="w-full flex justify-center">
      <div
        className={`w-full ${SIZES[variant] || SIZES.leaderboard} rounded-xl border border-dashed border-slate-700 bg-slate-900/60 flex items-center justify-center gap-2 text-slate-500`}
      >
        <Megaphone className="w-3.5 h-3.5 shrink-0" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{label}</span>
      </div>
    </div>
  );
}
