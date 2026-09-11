import * as THREE from 'three';

// Sichtstufen aus gekauften Gebäude-Upgrades: je mehr Upgrades für eine Engine gekauft
// sind, desto hochwertiger sieht sie aus - Farbe und Glanz wandern Richtung Gold. EINE
// Stufe pro Engine, nicht pro Objekt: alle Praktikanten sehen gleich hochwertig aus,
// weil die Upgrades global für die Engine gelten (mehr Produktivität je Einheit), nicht
// für eine einzelne Person. Siehe utils/sceneState.js (deriveZones) für die Berechnung
// aus boughtUpgrades.
export const TIER_MAX = 3;

const tmp = new THREE.Color();
const accent = new THREE.Color();

// Mischt `baseHex` mit `accentHex` (meist Gold) je nach Stufe (0..TIER_MAX). Reine
// Funktion, gibt eine neue Hex-Zahl zurück - sicher für setColorAt() in einer Schleife.
export function tierMix(baseHex, accentHex, tier, strength = 0.55) {
  tmp.setHex(baseHex);
  accent.setHex(accentHex);
  tmp.lerp(accent, Math.min(1, Math.max(0, tier) / TIER_MAX) * strength);
  return tmp.getHex();
}
