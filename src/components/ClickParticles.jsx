import React from 'react';
import { createPortal } from 'react-dom';

// Über createPortal direkt an document.body statt tief in SlopTab gerendert: die "+$X"-
// Partikel nutzen position:fixed mit e.clientX/clientY (Viewport-Koordinaten). In der
// Desktop-Ansicht sitzt der Tap-Button aber innerhalb eines backdrop-blur-md-Panels, und
// backdrop-filter erzeugt in Chromium (wie filter/transform) einen neuen Containing Block
// für fixed-positionierte Nachfahren - die Partikel landeten dadurch relativ zu diesem
// Panel statt zum Viewport, weit entfernt vom tatsächlichen Klickpunkt. Derselbe Effekt
// träte während eines Bubble Pops auch über den glitch-mode-Transform auf. Ein Portal an
// document.body umgeht beide Fälle, unabhängig davon, in welchem Layout/Zustand geklickt wird.
export function ClickParticles({ particles }) {
  if (!particles.length) return null;

  return createPortal(
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="pointer-events-none fixed z-50 text-cyan-300 font-black text-xl animate-float-particle drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]"
          style={{ left: p.x - 20, top: p.y - 20 }}
        >
          {p.text}
        </div>
      ))}
    </>,
    document.body
  );
}
