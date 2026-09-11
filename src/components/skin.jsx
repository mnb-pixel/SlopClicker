import React, { createContext, useContext } from 'react';

// Zwei Oberflächen-Looks für dieselben Komponenten.
//
// 'dark'  - der Terminal-Look der normalen Ansicht (/play, App.jsx). Das ist der
//           Default, damit sich dort nichts ändert, wenn eine Komponente hier nichts
//           über sich weiß.
// 'game'  - der Grafik-Stil der Insel (/voxel, GameShell): Papier, Tinte, klotzige
//           Kanten, dieselben Farben wie die 3D-Palette.
//
// Warum ein Kontext und kein CSS-Override von außen: StoreTab & Co. gehören BEIDEN
// Ansichten und tragen ihre dunklen Farben fest im Markup. Sie aus der Ferne per CSS
// umzufärben hieße, sich an Tailwind-Klassen fremder Komponenten zu hängen - jede
// spätere Änderung an den Tabs ginge in der Inselansicht lautlos kaputt. Mit dem
// Kontext steht die Entscheidung dort, wo die Klassen stehen, und ist beim Lesen der
// Komponente sichtbar.
//
// Benutzt wird er über useSkin().cx(dunkleKlassen, spielKlassen): im dunklen Skin
// kommt der erste String unverändert zurück (deshalb ist /play byte-identisch zu
// vorher), im Spiel-Skin der zweite. Die gs-*-Klassen dazu stehen in scene3d.css und
// werden nur auf /voxel geladen.
const SkinContext = createContext('dark');

export function SkinProvider({ skin = 'dark', children }) {
  return <SkinContext.Provider value={skin}>{children}</SkinContext.Provider>;
}

export function useSkin() {
  const skin = useContext(SkinContext);
  const isGame = skin === 'game';
  // cx(dark, game): zwei Varianten desselben Elements. Fehlt die Spiel-Variante,
  // bleibt es beim dunklen String - so bleibt ein neu hinzugefügtes Element
  // funktionsfähig, auch wenn niemand daran gedacht hat (die Sicherheitsnetz-Regeln
  // in scene3d.css fangen die Farben dann grob ab).
  const cx = (dark, game) => (isGame && game !== undefined ? game : dark);
  return { skin, isGame, cx };
}
