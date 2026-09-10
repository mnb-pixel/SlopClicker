// Progressive Engine-Sichtbarkeit - die EINE Quelle für "welche Engine-Stufe darf der
// Spieler überhaupt sehen".
//
// Regel (unverändert aus dem Shop, StoreTab.jsx): eine Engine ist sichtbar, sobald die
// VORHERIGE Stufe tatsächlich im Bestand ist. Kein Abkürzen über die Bewertung allein -
// wer reich ist, aber Stufe 4 nie gekauft hat, sieht Stufe 5 nicht. Direkt dahinter steht
// genau EIN Platzhalter ("??? Gesperrte Engine-Stufe"), alles Weitere bleibt unsichtbar.
//
// Liegt hier und nicht mehr in StoreTab, weil die 3D-Insel (/voxel) dieselbe Regel
// braucht: dort entscheidet sie, welche Zonen überhaupt auf der Insel auftauchen. Zwei
// Ansichten mit zwei Kopien derselben Regel wären sonst die erste Stelle, an der Shop und
// Spielplan auseinanderlaufen.

import { BUILDINGS_DATA } from '../data/buildingsData';

// -> { unlockedIds: Set<string>, teaserId: string|null }
// teaserId ist die erste gesperrte Engine (der Platzhalter), null wenn alles offen ist.
export function getBuildingVisibility(buildings = {}) {
  const unlockedIds = new Set();
  let teaserId = null;

  BUILDINGS_DATA.forEach((b, idx) => {
    const count = buildings[b.id] || 0;
    const prevBuilding = idx > 0 ? BUILDINGS_DATA[idx - 1] : null;
    const prevCount = prevBuilding ? (buildings[prevBuilding.id] || 0) : 0;

    // count > 0 hält Engines sichtbar, die aus einem Spielstand kommen, obwohl die Stufe
    // davor inzwischen (Black Swan) auf 0 steht.
    if (idx === 0 || count > 0 || prevCount >= 1) {
      unlockedIds.add(b.id);
    } else if (teaserId === null) {
      teaserId = b.id;
    }
  });

  return { unlockedIds, teaserId };
}
