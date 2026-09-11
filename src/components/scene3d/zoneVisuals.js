import { Users, Server, Megaphone, Landmark, Sparkles } from 'lucide-react';

// Icon und Akzentfarbe je Zone - die einzige Quelle für beides.
//
// Seit die Zonenschilder keine ausgeschriebenen Namen mehr über der Insel tragen
// (siehe CampusScene.jsx), ist das Icon das Erkennungsmerkmal einer Zone: es steht
// auf der Stecknadel in der Szene UND im Kopf des Kaufpanels. Beides muss deshalb
// aus demselben Eintrag kommen, sonst zeigt die Insel ein anderes Zeichen als das
// Menü, das sie öffnet.
//
// Die Akzentfarben sind bewusst an die 3D-Palette angelehnt (palette.js): Büro-Blau
// wie die Hoodies, Keller-Schiefer wie die Racks, Bühnen-Bernstein wie die
// Scheinwerfer, Turm-Violett wie die Container, Endgame-Cyan wie der Rim-Glow.
export const ZONE_VISUALS = {
  office: { Icon: Users, accent: '#2b6cb0' },
  basement: { Icon: Server, accent: '#3d4c5f' },
  stage: { Icon: Megaphone, accent: '#d97706' },
  tower: { Icon: Landmark, accent: '#7c5cd6' },
  endgame: { Icon: Sparkles, accent: '#0e7490' },
};

// Fällt eine Zone ohne Eintrag herein (neue Zone in zonesData.js, hier vergessen),
// bleibt sie sichtbar statt lautlos ohne Icon zu rendern.
export const ZONE_VISUAL_FALLBACK = { Icon: Landmark, accent: '#64748b' };

export function getZoneVisual(zoneId) {
  return ZONE_VISUALS[zoneId] || ZONE_VISUAL_FALLBACK;
}
