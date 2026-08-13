import React from 'react';
import { Megaphone } from 'lucide-react';

// Statischer Werbe-Slot-Platzhalter. Rendert aktuell nur eine klar gekennzeichnete
// "Werbung"-Fläche - für eine echte Integration (z.B. Google Ad Manager / AdSense)
// wird hier nur der Platzhalter-Inhalt gegen das Netzwerk-Snippet getauscht, Größe
// und Platzierung im Layout bleiben unverändert.
const SIZES = {
  leaderboard: 'h-[50px] md:h-[90px] max-w-[728px]', // Footer-Leiste
  rectangle: 'h-[250px] max-w-[300px]', // Sidebar/Modal-Slot
  // Kopfzeilen-Slot (Desktop): Half-Banner-Format neben der Bewertung. Bewusst flach -
  // der Header ist sticky, jeder zusätzliche Pixel Höhe geht dauerhaft vom Spielfeld ab.
  // Die Breite darf schrumpfen (w-full), damit der Slot auf schmalen Desktops nicht die
  // Bewertung aus der Mitte drückt.
  headerBanner: 'h-[60px] max-w-[468px]',
};

export function AdBanner({ variant = 'leaderboard', label = 'Werbung' }) {
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
