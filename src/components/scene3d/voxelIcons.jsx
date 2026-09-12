import React from 'react';
import { PALETTES_3D } from './palette';
import { UPGRADES_PER_VISUAL_TIER, VISUAL_TIER_MAX } from '../../utils/sceneState';

// Kleine "Voxel"-Vorschau je Engine, fürs Kaufpanel (ZoneBuyPanel): dasselbe Motiv wie
// ihr Prop in der 3D-Szene, nur als winziges gezeichnetes Icon statt einer echten
// Mini-WebGL-Szene (siehe docs/fabrik-szene.md, Tabelle "Zonen und Props" - jede Form
// hier ist bewusst dieselbe Silhouette, nur radikal vereinfacht: bei 30px Kantenlänge
// bringt echte Isometrie-Geometrie nichts, ein extrudierter Block/Zylinder reicht).
//
// Färbt sich mit der Ausbaustufe (0..VISUAL_TIER_MAX) Richtung Gold - exakt dieselbe
// Mischung wie tierMix() in tierVisuals.js, hier nur auf CSS-Hexfarben statt auf
// THREE.Color, weil dies eine reine DOM/SVG-Komponente ist (kein three.js-Import nötig).
// Bewusst immer die Tagespalette (PALETTES_3D.day): eine zweite, SEC-Prospekt-Fassung
// jeder Kachel wäre für ein paar Dutzend kleiner Icons mehr Aufwand, als der seltene
// Theme-Wechsel rechtfertigt.
const P = PALETTES_3D.day;

function hexNum(n, fallback = '#666666') {
  if (n === undefined || n === null) return fallback;
  if (typeof n === 'string') return n.startsWith('#') ? n : `#${n}`;
  return `#${(Number(n) & 0xffffff).toString(16).padStart(6, '0')}`;
}
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return [128, 128, 128];
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  if (Number.isNaN(n)) return [128, 128, 128];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex([r, g, b]) {
  const c = (v) => Math.round(Math.min(255, Math.max(0, Number(v) || 0))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}
function shade(hex, amt) {
  const [r, g, b] = hexToRgb(hex);
  const d = amt * 255;
  return rgbToHex([r + d, g + d, b + d]);
}
const GOLD = hexNum(P.gold, '#facc15');
// Identische Formel wie tierMix() in tierVisuals.js (strength 0.55, Stufe 0..TIER_MAX).
export function tierColor(baseHex, tier, strength = 0.55) {
  if (!baseHex) return GOLD;
  const t = (Math.min(VISUAL_TIER_MAX, Math.max(0, Number(tier) || 0)) / VISUAL_TIER_MAX) * strength;
  const a = hexToRgb(baseHex);
  const b = hexToRgb(GOLD);
  return rgbToHex(a.map((v, i) => v + (b[i] - v) * t));
}

// Wie viele Gebäude-Upgrades einer Engine sind schon gekauft? boughtUpgrades trägt IDs
// im Format "<buildingId>_up_<schwelle>" (siehe upgradesData.js) - ein Präfix-Filter
// reicht, ohne die Schwellen-Liste selbst zu kennen.
export function boughtUpgradeCount(boughtUpgrades, buildingId) {
  const prefix = `${buildingId}_up_`;
  return boughtUpgrades.filter((id) => id.startsWith(prefix)).length;
}
// Sichtstufe NACH dem Kauf eines bestimmten Upgrades - für die Upgrade-Kachel selbst
// ("so sieht die Engine aus, wenn du das hier kaufst"), dieselbe Formel wie
// utils/sceneState.js (deriveZones: UPGRADES_PER_VISUAL_TIER, VISUAL_TIER_MAX).
export function tierAfterUpgrade(boughtUpgrades, buildingId) {
  const countAfter = boughtUpgradeCount(boughtUpgrades, buildingId) + 1;
  return Math.min(VISUAL_TIER_MAX, Math.floor(countAfter / UPGRADES_PER_VISUAL_TIER));
}

// --- ECHTER ISOMETRISCHER VOXEL-PRIMITIV ----------------------------------------
// Kleiner Stein mit Top-, Front- und Schatten-Seite für echte Voxel-Ästhetik
function Voxel({ x, y, w = 3, h = 3, d = 2.2, color, stroke = true, opacity = 1 }) {
  const topColor = shade(color, 0.24);
  const sideColor = shade(color, -0.24);
  const strokeColor = shade(color, -0.36);
  const sw = stroke ? 0.35 : 0;

  return (
    <g opacity={opacity}>
      {/* Deckfläche (hell beleuchtet) */}
      <polygon
        points={`${x},${y} ${x + d},${y - d * 0.65} ${x + w + d},${y - d * 0.65} ${x + w},${y}`}
        fill={topColor}
        stroke={strokeColor}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      {/* Schattenfläche rechts */}
      <polygon
        points={`${x + w},${y} ${x + w + d},${y - d * 0.65} ${x + w + d},${y - d * 0.65 + h} ${x + w},${y + h}`}
        fill={sideColor}
        stroke={strokeColor}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      {/* Frontfläche */}
      <polygon
        points={`${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`}
        fill={color}
        stroke={strokeColor}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    </g>
  );
}

// Person aus Voxel-Clustern (Kopf, Haare, Hoodie, Arme)
function VoxelPerson({ cx, y, shirtColor, hairColor = hexNum(P.hair), skinColor = hexNum(P.skin), tieColor = null, small = false }) {
  const s = small ? 0.8 : 1.0;
  const hw = 5.0 * s;
  const hh = 4.2 * s;
  const hd = 2.0 * s;
  const tw = 7.0 * s;
  const th = 6.0 * s;
  const td = 2.4 * s;

  return (
    <g>
      {/* Haare oben */}
      <Voxel x={cx - hw / 2} y={y} w={hw} h={1.8 * s} d={hd} color={hairColor} />
      {/* Kopf */}
      <Voxel x={cx - hw / 2 + 0.3} y={y + 1.8 * s} w={hw - 0.6} h={hh} d={hd} color={skinColor} />
      {/* Augen-Pixel */}
      <rect x={cx - 1.2 * s} y={y + 3.2 * s} width={0.8 * s} height={0.8 * s} fill="#1c2a38" />
      <rect x={cx + 0.6 * s} y={y + 3.2 * s} width={0.8 * s} height={0.8 * s} fill="#1c2a38" />
      {/* Oberkörper / Hoodie */}
      <Voxel x={cx - tw / 2} y={y + 1.8 * s + hh} w={tw} h={th} d={td} color={shirtColor} />
      {/* Krawatte falls vorhanden */}
      {tieColor && (
        <rect x={cx - 0.7 * s} y={y + 2.0 * s + hh} width={1.4 * s} height={4.2 * s} fill={tieColor} />
      )}
      {/* Arme links & rechts */}
      <Voxel x={cx - tw / 2 - 1.8 * s} y={y + 2.5 * s + hh} w={1.6 * s} h={5.0 * s} d={1.8 * s} color={shirtColor} />
      <Voxel x={cx + tw / 2 + 0.2 * s} y={y + 2.5 * s + hh} w={1.6 * s} h={5.0 * s} d={1.8 * s} color={shirtColor} />
    </g>
  );
}

function Block({ x, y, w, h, color, depth = 3.5 }) {
  return <Voxel x={x} y={y} w={w} h={h} d={depth} color={color} />;
}
function Silo({ cx, topY, rx, ry, h, color }) {
  const top = shade(color, 0.24);
  const side = shade(color, -0.22);
  return (
    <g>
      <rect x={cx - rx} y={topY} width={rx * 2} height={h} fill={color} stroke={shade(color, -0.3)} strokeWidth={0.4} />
      <ellipse cx={cx} cy={topY + h} rx={rx} ry={ry} fill={side} />
      <ellipse cx={cx} cy={topY} rx={rx} ry={ry} fill={top} stroke={shade(color, -0.3)} strokeWidth={0.4} />
    </g>
  );
}
function Person(props) {
  return <VoxelPerson {...props} shirtColor={props.shirt} tieColor={props.tie} />;
}

// --- DIE 20 ENGINES: DETAILLIERTE VOXEL-GRAFIKEN -------------------------------
const ICONS = {
  // 1. Prompt Praktikant
  prompt_intern: (tier) => {
    const shirt = tierColor(hexNum(P.hoodieA), tier);
    const screen = tierColor(hexNum(P.screen), tier, 0.7);
    const mugCol = tierColor(hexNum(P.cup), tier, 0.6);
    const deskTop = tier >= 2 ? tierColor(hexNum(P.desk), tier, 0.5) : hexNum(P.desk);
    return (
      <>
        {/* Schreibtischplatte mit Bevel */}
        <Voxel x={4} y={24} w={28} h={2.8} d={3.2} color={deskTop} />
        <Voxel x={6} y={26.8} w={1.8} h={8.5} d={1.2} color={hexNum(P.deskLeg)} />
        <Voxel x={28} y={26.8} w={1.8} h={8.5} d={1.2} color={hexNum(P.deskLeg)} />
        {/* Schreibtischstuhl-Lehne im Hintergrund */}
        <Voxel x={13.5} y={15} w={8} h={11} d={1.5} color={hexNum(P.steelDark)} />
        {/* Praktikant */}
        <VoxelPerson cx={17.5} y={10} shirtColor={shirt} small />
        {/* Kopfhörer auf den Ohren */}
        <rect x={13.8} y={12.5} width={1.2} height={2.2} rx={0.5} fill={hexNum(P.steelDark)} />
        <rect x={19.8} y={12.5} width={1.2} height={2.2} rx={0.5} fill={hexNum(P.steelDark)} />
        <path d="M14.5,12 C14.5,9.5 20.3,9.5 20.3,12" stroke={hexNum(P.steelDark)} strokeWidth={0.8} fill="none" />
        {/* Laptop geöffnet */}
        <Voxel x={13.5} y={22.5} w={8} h={1.2} d={2.5} color={hexNum(P.steel)} />
        <polygon points="14,22.5 14.5,15.5 20.5,15.5 21,22.5" fill={hexNum(P.monitor)} stroke={shade(hexNum(P.monitor), -0.25)} strokeWidth={0.3} />
        <polygon points="14.6,22 15,16.2 20,16.2 20.4,22" fill={screen} />
        {/* Großer Kaffeebecher mit Dampf */}
        <Voxel x={7} y={21} w={3.2} h={3.2} d={1.6} color={mugCol} />
        <path d="M8.6,20 Q8,18 9,17" stroke={hexNum(P.mist)} strokeWidth={0.7} strokeLinecap="round" fill="none" opacity={0.85} />
        {/* Zettel / Post-It / Energy-Drink */}
        <rect x={24.5} y={22.5} width={2.2} height={3.0} fill={hexNum(P.bubble)} rx={0.3} />
        {tier > 0 && <Voxel x={27.5} y={20.5} w={1.8} h={3.6} d={1.0} color={tierColor(hexNum(P.gold), tier, 0.8)} />}
      </>
    );
  },

  // 2. Chatbot Widget
  chatbot_widget: (tier) => {
    const bubbleCol = tierColor(hexNum(P.bubble), tier, 0.35);
    const tokenCol = tierColor(hexNum(P.token), tier, 0.85);
    const eyeCol = tierColor(hexNum(P.neon), tier, 0.9);
    return (
      <>
        {/* Haupt-Chatblase isometrisch */}
        <Voxel x={6} y={8} w={25} h={17} d={3.8} color={bubbleCol} />
        {/* Sprechblasen-Schwänzchen unten */}
        <Voxel x={9} y={25} w={5} h={4.5} d={2.8} color={bubbleCol} />
        <Voxel x={7} y={29.5} w={3.5} h={3.2} d={2.0} color={bubbleCol} />
        {/* Antenne oben mit leuchtendem Ping */}
        <line x1={18.5} y1={8} x2={18.5} y2={4} stroke={hexNum(P.steelDark)} strokeWidth={1.2} />
        <circle cx={18.5} cy={3.2} r={1.6} fill={tokenCol} />
        {/* Display-Visier & lächelndes Gesicht */}
        <rect x={10} y={11.5} width={17} height={9.5} rx={2} fill="#0d1926" />
        {/* Glückliche Voxel-Augen */}
        <rect x={12.5} y={14} width={3.2} height={2} rx={0.8} fill={eyeCol} />
        <rect x={21.3} y={14} width={3.2} height={2} rx={0.8} fill={eyeCol} />
        <path d="M16,18 Q18.5,20 21,18" stroke={eyeCol} strokeWidth={1.0} strokeLinecap="round" fill="none" />
        {/* Schwebende Denk-Partikel / Token-Stars */}
        <circle cx={33} cy={9} r={1.4} fill={tokenCol} />
        <circle cx={35} cy={16} r={1.0} fill={tokenCol} />
        <polygon points="32,24 33.5,21 35,24 33.5,27" fill={tokenCol} />
      </>
    );
  },

  // 3. Prompt Engineer
  prompt_engineer: (tier) => {
    const shirt = tierColor(hexNum(P.hoodieB), tier);
    const screen = tierColor(hexNum(P.screen), tier, 0.85);
    const neonMatrix = tierColor(hexNum(P.neon), tier, 0.95);
    return (
      <>
        {/* Großer Eck-Schreibtisch */}
        <Voxel x={3} y={24} w={32} h={3} d={3.4} color={hexNum(P.deskDark)} />
        <Voxel x={4.5} y={27} w={2} h={8.5} d={1.4} color={hexNum(P.deskLeg)} />
        <Voxel x={31} y={27} w={2} h={8.5} d={1.4} color={hexNum(P.deskLeg)} />
        {/* Gamer-/Ergo-Stuhl mit hoher Lehne & Kopfstütze */}
        <Voxel x={13.5} y={12} w={9} h={14} d={1.8} color="#181e26" />
        <Voxel x={15} y={8.5} w={6} h={3.5} d={1.5} color="#252f3d" />
        {/* Engineer */}
        <VoxelPerson cx={18} y={10} shirtColor={shirt} />
        {/* Linker Monitor (angewinkelt) */}
        <polygon points="4.5,13.5 12,14.5 12,22.5 4.5,21.5" fill={hexNum(P.monitor)} stroke={shade(hexNum(P.monitor), -0.3)} strokeWidth={0.4} />
        <polygon points="5.2,14.2 11.2,15 11.2,21.8 5.2,21" fill={screen} />
        {/* Mittlerer/Rechter Haupt-Breitbild-Monitor */}
        <Voxel x={13.5} y={13} w={19} h={9.5} d={2.0} color={hexNum(P.monitor)} />
        <rect x={14.5} y={14} width={17} height={7.5} rx={0.5} fill="#091209" />
        {/* Matrix-Code-Linien */}
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={16 + i * 3.8} y1={15} x2={16 + i * 3.8} y2={18 + (i % 2) * 2.5} stroke={neonMatrix} strokeWidth={0.8} strokeDasharray="1,1" />
        ))}
        {/* RGB-Tastatur auf Tisch */}
        <Voxel x={13} y={24} w={12} h={1.0} d={2.2} color="#151b22" />
        <line x1={14} y1={24.2} x2={24} y2={24.2} stroke={neonMatrix} strokeWidth={0.8} />
      </>
    );
  },

  // 4. GPU Server Rack
  gpu_rack: (tier) => {
    const neonCol = tierColor(hexNum(P.neon), tier, 0.9);
    const goldCol = tierColor(hexNum(P.gold), tier, 0.85);
    return (
      <>
        {/* Rack-Gehäuse mit Belüftungsschlitzen */}
        <Voxel x={9} y={5} w={20} h={30} d={4.2} color={hexNum(P.rack)} />
        {/* 5 Blade-Server-Einschübe */}
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x={11} y={7.5 + i * 5.4} width={16} height={3.8} fill={shade(hexNum(P.rack), -0.22)} rx={0.4} />
            {/* Lüftergitter links */}
            <circle cx={13.5} cy={9.4 + i * 5.4} r={1.2} fill="#050a0f" />
            <circle cx={13.5} cy={9.4 + i * 5.4} r={0.7} fill={neonCol} />
            <circle cx={16.8} cy={9.4 + i * 5.4} r={1.2} fill="#050a0f" />
            <circle cx={16.8} cy={9.4 + i * 5.4} r={0.7} fill={neonCol} />
            {/* Status-LED-Matrix */}
            <rect x={20} y={8.8 + i * 5.4} width={4.2} height={1.2} fill={neonCol} />
            <circle cx={25.2} cy={9.4 + i * 5.4} r={0.6} fill={goldCol} />
          </g>
        ))}
        {/* Vertikale NVLink-Bus-Schiene rechts */}
        <Voxel x={27} y={7} w={1.5} h={26} d={1.5} color={goldCol} />
      </>
    );
  },

  // 5. Rechenzentrum (Datacenter)
  datacenter: (tier) => {
    const neonCol = tierColor(hexNum(P.neon), tier, 0.85);
    const goldTrim = tierColor(hexNum(P.gold), tier, 0.7);
    return (
      <>
        {/* Sockelfundament mit Sicherheitskante */}
        <Voxel x={5} y={28} w={28} h={4.5} d={4.0} color={hexNum(P.stoneDark)} />
        {/* Hauptgebäude-Korpus */}
        <Voxel x={7} y={14} w={24} h={14} d={4.0} color={hexNum(P.facade)} />
        {/* Fensterfront mit Server-Rack-Schatten & Cyan-Beleuchtung */}
        <rect x={9} y={17} width={20} height={3} fill="#04080e" />
        <rect x={9.5} y={17.5} width={19} height={2} fill={neonCol} opacity={0.8} />
        <rect x={9} y={22} width={20} height={3} fill="#04080e" />
        <rect x={9.5} y={22.5} width={19} height={2} fill={neonCol} opacity={0.8} />
        {/* Dachaufbau & Industrielüfter / Kühler */}
        <Voxel x={9} y={9} w={20} h={5} d={3.5} color={shade(hexNum(P.facade), 0.1)} />
        <Voxel x={12} y={5} w={5} h={4} d={2.2} color={hexNum(P.steelDark)} />
        <circle cx={14.5} cy={7} r={1.5} fill={hexNum(P.steel)} />
        <Voxel x={20} y={5} w={5} h={4} d={2.2} color={hexNum(P.steelDark)} />
        <circle cx={22.5} cy={7} r={1.5} fill={hexNum(P.steel)} />
        {/* Satellitenschüssel / Antenne */}
        <line x1={26} y1={9} x2={28} y2={4} stroke={goldTrim} strokeWidth={1.2} />
        <circle cx={28} cy={3.5} r={1.2} fill={goldTrim} />
      </>
    );
  },

  // 6. Web Scraper
  web_scraper: (tier) => {
    const eyeCol = tierColor(hexNum(P.warnRed), tier, 0.7);
    const dataCol = tierColor(hexNum(P.neon), tier, 0.85);
    return (
      <>
        {/* Dokument / Webseite auf dem Boden */}
        <Voxel x={6} y={24} w={20} h={1.8} d={3.0} color={hexNum(P.paper)} />
        <line x1={8} y1={25} x2={16} y2={25} stroke={hexNum(P.steelDark)} strokeWidth={1} />
        <line x1={8} y1={27} x2={18} y2={27} stroke={hexNum(P.steelDark)} strokeWidth={1} />
        {/* Spinnenbeine links & rechts */}
        <path d="M15,18 L9,14 L5,22" stroke={hexNum(P.steelDark)} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        <path d="M15,19 L8,19 L4,26" stroke={hexNum(P.steelDark)} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        <path d="M23,18 L29,14 L33,22" stroke={hexNum(P.steelDark)} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        <path d="M23,19 L30,19 L34,26" stroke={hexNum(P.steelDark)} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        {/* Cyber-Spinnenkörper */}
        <Voxel x={14} y={13} w={10} h={8.5} d={3.2} color={hexNum(P.steelDark)} />
        {/* Großes Scanner-Auge */}
        <circle cx={19} cy={17.5} r={2.8} fill="#050a0f" />
        <circle cx={19} cy={17.5} r={1.8} fill={eyeCol} />
        {/* Vakuum-Datenstrahl zum Dokument */}
        <polygon points="17,21 21,21 23,25 15,25" fill={dataCol} opacity={0.65} />
      </>
    );
  },

  // 7. Thought Leader
  thought_leader: (tier) => {
    const suitCol = tierColor(hexNum(P.hoodieA), tier, 0.6);
    const goldCol = tierColor(hexNum(P.gold), tier, 0.9);
    return (
      <>
        {/* Konferenz-Bühnenpodest */}
        <Voxel x={5} y={26} w={28} h={4.5} d={3.5} color={hexNum(P.stageFloor)} />
        {/* Redner */}
        <VoxelPerson cx={14} y={9} shirtColor={suitCol} tieColor={goldCol} />
        {/* Acryl-Rednerpult vor dem Sprecher */}
        <Voxel x={18} y={17} w={7.5} h={9.5} d={2.2} color={hexNum(P.glass)} opacity={0.88} />
        <Voxel x={17} y={16.5} w={9.5} h={1.4} d={2.4} color={hexNum(P.steelDark)} />
        {/* Studio-Schwanenhals-Mikrofon */}
        <path d="M22,16.5 Q21,13 18.5,13.5" stroke={hexNum(P.steelDark)} strokeWidth={1.0} fill="none" />
        <circle cx={18.2} cy={13.5} r={1.0} fill={goldCol} />
        {/* Schwebende LinkedIn-Likes & Herzchen */}
        <polygon points="28,11 29,8 31,10 32,8 33,11 30.5,14" fill={hexNum(P.warnRed)} />
        <circle cx={29} cy={18} r={2.0} fill={hexNum(P.token)} />
        <text x="29" y="19.5" textAnchor="middle" fontSize="3" fontWeight="900" fill="#ffffff" fontFamily="sans-serif">👍</text>
      </>
    );
  },

  // 8. VC-Firma
  vc_firm: (tier) => {
    const glass = tierColor(hexNum(P.glass), tier, 0.4);
    const goldGraph = tierColor(hexNum(P.gold), tier, 0.95);
    return (
      <>
        {/* Architektonischer Stahlrahmen */}
        <Voxel x={8} y={28} w={22} h={4} d={3.5} color={hexNum(P.steelDark)} />
        {/* 4 Glasgeschosse mit verspiegelten Streben */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <Voxel x={9.5} y={10 + i * 4.5} w={19} h={4.0} d={3.2} color={glass} />
            <rect x={10.5} y={13.5 + i * 4.5} width={17} height={0.6} fill={shade(glass, -0.35)} />
          </g>
        ))}
        {/* Dachspitze / Goldener Penthouse-Kubus */}
        <Voxel x={12} y={5.5} w={14} h={4.5} d={2.6} color={goldGraph} />
        {/* Holografische Hockeystick-Kurve über dem Gebäude */}
        <path d="M6,26 Q18,25 24,14 L31,5" stroke={goldGraph} strokeWidth={2.0} strokeLinecap="round" fill="none" />
        <polygon points="31,5 27,6 29,9" fill={goldGraph} />
      </>
    );
  },

  // 9. Hype-Journalist
  hype_journalist: (tier) => {
    const hatCol = tierColor(hexNum(P.woodDark || P.desk), tier, 0.5);
    const flashCol = tierColor(hexNum(P.gold), tier, 0.9);
    return (
      <>
        {/* Schreibtisch */}
        <Voxel x={5} y={24} w={28} h={2.8} d={3.2} color={hexNum(P.desk)} />
        <VoxelPerson cx={15} y={10} shirtColor={hexNum(P.hoodieC)} />
        {/* Presse-Fedora mit Schildchen */}
        <ellipse cx={15} cy={9.5} rx={5} ry={1.8} fill={hatCol} />
        <rect x={12.5} y={6.5} width={5} height={3} rx={0.5} fill={hatCol} />
        <rect x={16.5} y={7.2} width={2.2} height={1.6} fill="#ffffff" />
        {/* Kamera auf Stativ mit Blitz */}
        <Voxel x={24} y={17} w={6} h={5} d={2.2} color={hexNum(P.steelDark)} />
        <circle cx={27} cy={19.5} r={1.5} fill={hexNum(P.screen)} />
        <polygon points="29,15 34,11 31,16" fill={flashCol} />
        {/* Herausrollende Boulevard-Zeitung ("BREAKING") */}
        <path d="M19,25 C23,24 25,28 29,27" stroke={hexNum(P.paper)} strokeWidth={3.5} fill="none" />
        <rect x={21} y={23.5} width={6} height={1.2} fill={hexNum(P.warnRed)} />
      </>
    );
  },

  // 10. Keynote-Bühne
  keynote_stage: (tier) => {
    const spotCol = tierColor(hexNum(P.spot), tier, 0.7);
    const neonCol = tierColor(hexNum(P.neon), tier, 0.9);
    return (
      <>
        {/* Scheinwerferkegel */}
        <polygon points="6,4 32,4 35,27 3,27" fill={spotCol} opacity={0.25} />
        {/* Hochglanz-Bühnenboden */}
        <Voxel x={4} y={25} w={30} h={3.8} d={3.5} color="#0d141d" />
        {/* Gebogene Panorama-LED-Wand */}
        <Voxel x={6} y={8} w={26} h={15} d={2.0} color="#050a10" />
        <rect x={7.5} y={9.5} width={23} height={12} rx={0.5} fill="#091424" />
        <text x="19" y="15" textAnchor="middle" fontSize="2.8" fontWeight="900" fill={neonCol} fontFamily="sans-serif">ONE MORE</text>
        <text x="19" y="18.5" textAnchor="middle" fontSize="2.8" fontWeight="900" fill={tierColor(hexNum(P.gold), tier, 0.8)} fontFamily="sans-serif">THING</text>
        {/* Steve Jobs Figur im schwarzen Turtleneck */}
        <VoxelPerson cx={19} y={15.5} shirtColor="#111111" small />
      </>
    );
  },

  // 11. Pivot-Startup
  pivot_startup: (tier) => {
    const fireCol = tierColor(hexNum(P.fireCore), tier, 0.85);
    const flameOuter = tierColor(hexNum(P.fire), tier, 0.7);
    return (
      <>
        {/* Startturm / Gantry links */}
        <Voxel x={6} y={8} w={3.5} h={24} d={2.0} color={hexNum(P.steelDark)} />
        <line x1={9.5} y1={12} x2={14} y2={12} stroke={hexNum(P.steel)} strokeWidth={1.5} />
        <line x1={9.5} y1={20} x2={14} y2={20} stroke={hexNum(P.steel)} strokeWidth={1.5} />
        {/* Raketenrumpf */}
        <Voxel x={15} y={10} w={9} h={15} d={3.2} color={hexNum(P.facade)} />
        {/* Raketenspitze */}
        <polygon points="19.5,2 15,10 24,10" fill={tierColor(hexNum(P.warnRed), tier, 0.6)} />
        {/* Heckflossen */}
        <polygon points="15,22 11,26 15,26" fill={hexNum(P.warnRed)} />
        <polygon points="24,22 28,26 24,26" fill={hexNum(P.warnRed)} />
        {/* "AI" Logo-Badge auf dem Rumpf */}
        <rect x={16.5} y={14} width={6} height={4} rx={0.8} fill="#0d1b2a" />
        <text x={19.5} y={17} textAnchor="middle" fontSize="3.2" fontWeight="900" fill={hexNum(P.neon)} fontFamily="sans-serif">AI</text>
        {/* Mächtige Auspuffflammen */}
        <polygon points="16,25 19.5,35 23,25" fill={flameOuter} />
        <polygon points="17.5,25 19.5,31 21.5,25" fill={fireCol} />
      </>
    );
  },

  // 12. Token Burner
  token_burner: (tier) => {
    const fire = tierColor(hexNum(P.fire), tier, 0.9);
    const goldCoin = tierColor(hexNum(P.gold), tier, 0.95);
    return (
      <>
        {/* Runder Trichter oben mit Münzeinwurf */}
        <Voxel x={13} y={5} w={12} h={6} d={3.0} color={shade(hexNum(P.burner), 0.15)} />
        {/* Münzen die hineinfallen */}
        <circle cx={17} cy={3.5} r={1.6} fill={goldCoin} />
        <circle cx={21} cy={2.8} r={1.4} fill={goldCoin} />
        {/* Brennkammer mit massiven Nieten */}
        <Voxel x={8} y={12} w={22} h={18} d={4.2} color={hexNum(P.burner)} />
        {/* Feurige Ofenluke */}
        <rect x={12} y={18} width={14} height={9} rx={1.5} fill="#100502" />
        <polygon points="19,19 14,26 24,26" fill={fire} />
        <polygon points="19,21 16,26 22,26" fill={hexNum(P.fireCore)} />
        {/* Schornstein links mit Rauchwölkchen */}
        <Voxel x={9} y={4} w={3.5} h={8} d={2.0} color={hexNum(P.steelDark)} />
        <circle cx={10.5} cy={2} r={1.5} fill={hexNum(P.smoke || P.cloud)} opacity={0.7} />
      </>
    );
  },

  // 13. Pitch Deck
  pitch_deck: (tier) => {
    const stamp = tierColor(hexNum(P.gold), tier, 0.9);
    const redSeal = hexNum(P.warnRed);
    return (
      <>
        {/* Untere Folien im Fächer */}
        <Voxel x={6} y={13} w={16} h={20} d={1.6} color={shade(hexNum(P.paper), -0.25)} />
        <Voxel x={10} y={9} w={17} h={20} d={1.6} color={shade(hexNum(P.paper), -0.1)} />
        {/* Oberste Master-Folie */}
        <Voxel x={14} y={5} w={18} h={22} d={2.0} color={hexNum(P.paper)} />
        {/* Folien-Header mit goldenem 100x Banner */}
        <rect x={16.5} y={8} width={13} height={3} rx={0.5} fill={stamp} />
        <text x={23} y={10.4} textAnchor="middle" fontSize="2.4" fontWeight="900" fill="#000000" fontFamily="sans-serif">100x TAM</text>
        {/* Exponentieller Hockeystick-Chart auf der Folie */}
        <path d="M17,21 Q22,20 25,16 L28,13" stroke={hexNum(P.neon)} strokeWidth={1.4} fill="none" strokeLinecap="round" />
        <polygon points="28,13 26,14.5 28,15.5" fill={hexNum(P.neon)} />
        {/* Rotes Wachssiegel mit Band */}
        <circle cx={25} cy={22} r={2.8} fill={redSeal} />
        <circle cx={25} cy={22} r={1.5} fill={stamp} />
      </>
    );
  },

  // 14. Lobbyist
  lobbyist: (tier) => {
    const goldCol = tierColor(hexNum(P.gold), tier, 0.85);
    const pillarCol = hexNum(P.stone);
    return (
      <>
        {/* Marmorsäulen im Hintergrund (Kapitol) */}
        <Voxel x={5} y={7} w={3.5} h={22} d={1.8} color={pillarCol} />
        <Voxel x={29} y={7} w={3.5} h={22} d={1.8} color={pillarCol} />
        <Voxel x={3} y={5} w={32} h={2.5} d={2.4} color={shade(pillarCol, 0.1)} />
        {/* Lobbyist im Nadelstreifenanzug */}
        <VoxelPerson cx={18} y={10} shirtColor="#141a24" tieColor={hexNum(P.warnRed)} />
        {/* Titan-Geldkoffer mit $100-Bündeln */}
        <Voxel x={8} y={20} w={7.5} h={6.5} d={2.8} color={hexNum(P.steelDark)} />
        <line x1={8} y1={23} x2={15.5} y2={23} stroke={goldCol} strokeWidth={0.8} />
        <rect x={11} y={19.5} width={2} height={1.2} fill={goldCol} />
        {/* Justitia-Waage mit Goldmünzen */}
        <line x1={26} y1={13} x2={26} y2={25} stroke={goldCol} strokeWidth={1.2} />
        <line x1={22} y1={15} x2={30} y2={17} stroke={goldCol} strokeWidth={1.2} />
        <circle cx={22} cy={19} r={1.8} fill={goldCol} />
        <circle cx={30} cy={21} r={2.4} fill={goldCol} />
      </>
    );
  },

  // 15. AGI-Countdown
  agi_clock: (tier) => {
    const led = tierColor("#ef4444", tier, 0.85);
    const frame = hexNum(P.ledBoard);
    return (
      <>
        {/* Massives Uhrengehäuse */}
        <Voxel x={5} y={9} w={28} h={20} d={4.0} color={frame} />
        {/* Gelb-schwarze Warnschraffur am oberen Rand */}
        <rect x={7} y={10.5} width={24} height={2} fill={hexNum(P.tapeYellow)} />
        {[0, 1, 2, 3, 4].map((i) => (
          <polygon key={i} points={`${8 + i * 4.5},12.5 ${10 + i * 4.5},10.5 ${11.5 + i * 4.5},10.5 ${9.5 + i * 4.5},12.5`} fill="#000000" />
        ))}
        {/* Schwarzes LED-Panel */}
        <rect x={7} y={14} width={24} height={12} rx={1} fill="#050000" />
        {/* 7-Segment Ziffern "00:42" */}
        <text x="19" y="23" textAnchor="middle" fontSize="7.5" fontWeight="900" fill={led} fontFamily="monospace" letterSpacing="0.8">00:42</text>
        {/* Hochspannungsspulen oben */}
        <line x1={9} y1={9} x2={9} y2={5} stroke={hexNum(P.steel)} strokeWidth={1.5} />
        <circle cx={9} cy={4} r={1.4} fill={hexNum(P.neon)} />
        <line x1={29} y1={9} x2={29} y2={5} stroke={hexNum(P.steel)} strokeWidth={1.5} />
        <circle cx={29} cy={4} r={1.4} fill={hexNum(P.neon)} />
      </>
    );
  },

  // 16. Schwarzmarkt-DC
  gray_market_dc: (tier) => {
    const tarp = tierColor(hexNum(P.tarp), tier, 0.6);
    const warningTape = hexNum(P.tapeYellow);
    return (
      <>
        {/* Wellblech-Schiffscontainer */}
        <Voxel x={8} y={11} w={23} h={18} d={4.0} color="#1b3a3a" />
        {/* Wellblech-Rillen */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={11 + i * 3.8} y1={13} x2={11 + i * 3.8} y2={27} stroke="#112525" strokeWidth={1.0} />
        ))}
        {/* Tarnnetz / Abdeckplane schräg über dem Dach */}
        <polygon points="6,11 20,4 33,11 31,14 7,14" fill={tarp} />
        {/* Gelbes Absperrband "POLICE / CAUTION" gekreuzt vor der Tür */}
        <line x1={10} y1={16} x2={28} y2={26} stroke={warningTape} strokeWidth={1.8} />
        <line x1={10} y1={26} x2={28} y2={16} stroke={warningTape} strokeWidth={1.8} />
        {/* Dieselgenerator-Auspuffrohr mit Rußwolke */}
        <Voxel x={4} y={18} w={3.5} h={8} d={2.0} color={hexNum(P.steelDark)} />
        <line x1={5.5} y1={18} x2={5.5} y2={12} stroke={hexNum(P.steel)} strokeWidth={1.2} />
        <circle cx={5.5} cy={10} r={1.8} fill="#222222" opacity={0.8} />
      </>
    );
  },

  // 17. Fusionsreaktor
  nuclear_reactor: (tier) => {
    const coreGlow = tierColor("#06b6d4", tier, 0.9);
    const steamCol = hexNum(P.mist);
    return (
      <>
        {/* Hyperbolischer Kühlturm */}
        <path d="M7,28 L9,14 Q12,16 15,14 L17,28 Z" fill={hexNum(P.stone)} stroke={shade(hexNum(P.stone), -0.25)} strokeWidth={0.5} />
        <ellipse cx={12} cy={14} rx={3} ry={1} fill={shade(hexNum(P.stone), -0.2)} />
        {/* Dampfwolke über dem Kühlturm */}
        <circle cx={11} cy={9} r={3.0} fill={steamCol} opacity={0.8} />
        <circle cx={14} cy={7} r={3.8} fill={steamCol} opacity={0.7} />
        {/* Reaktor-Kuppel rechts */}
        <path d="M19,28 L19,20 A7,7 0 0,1 33,20 L33,28 Z" fill={shade(hexNum(P.stone), 0.1)} />
        <circle cx={26} cy={20} r={2.0} fill={hexNum(P.gold)} />
        {/* Tscherenkow-Kühlbecken im Vordergrund mit intensiver Cyan-Aura */}
        <ellipse cx={20} cy={27} rx={7} ry={2.5} fill="#042f2e" />
        <ellipse cx={20} cy={27} rx={5.5} ry={1.8} fill={coreGlow} />
        <circle cx={20} cy={27} r={1.2} fill="#ffffff" />
      </>
    );
  },

  // 18. Metaverse City
  metaverse_city: (tier) => {
    const neonPurple = tierColor("#a855f7", tier, 0.85);
    const neonCyan = tierColor("#06b6d4", tier, 0.9);
    return (
      <>
        {/* Dunkle Stadt-Basis */}
        <Voxel x={4} y={27} w={32} h={4} d={3.0} color="#080c14" />
        {/* Wolkenkratzer 1 (links, lila) */}
        <Voxel x={6} y={13} w={8} h={15} d={2.5} color="#151b2e" />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={7.5} y={15 + i * 4} width={5} height={1.5} fill={neonPurple} />
        ))}
        {/* Zentraler Megaturm (hoch, cyan) */}
        <Voxel x={16} y={6} w={9} h={22} d={3.0} color="#0f172a" />
        <polygon points="20.5,1 17,6 24,6" fill={neonCyan} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={18} y={8 + i * 4.5} width={5} height={1.8} fill={neonCyan} />
        ))}
        {/* Wolkenkratzer 3 (rechts) */}
        <Voxel x={27} y={15} w={7} h={13} d={2.2} color="#151b2e" />
        <rect x={28.5} y={18} width={4} height={2} fill={neonPurple} />
        {/* Schwebende leuchtende Sky-Bridge zwischen Turm 1 und Turm 2 */}
        <rect x={13} y={16} width={4} height={1.5} fill={neonCyan} />
      </>
    );
  },

  // 19. Excel-Tabelle
  excel_sheet: (tier) => {
    const excelGreen = tierColor("#107c41", tier, 0.85);
    const barGold = tierColor(hexNum(P.gold), tier, 0.95);
    return (
      <>
        {/* Grünes Excel-Buch / Mappe */}
        <Voxel x={5} y={7} w={29} h={24} d={3.2} color={excelGreen} />
        {/* Tabellenblatt innen weiß */}
        <rect x={8} y={11} width={23} height={18} rx={0.5} fill="#ffffff" />
        {/* Grüne Kopfzeile mit Spalten A, B, C */}
        <rect x={8} y={11} width={23} height={3.5} fill={excelGreen} />
        <text x="12" y="13.8" textAnchor="middle" fontSize="2.5" fontWeight="900" fill="#ffffff" fontFamily="sans-serif">A</text>
        <text x="17" y="13.8" textAnchor="middle" fontSize="2.5" fontWeight="900" fill="#ffffff" fontFamily="sans-serif">B</text>
        <text x="22" y="13.8" textAnchor="middle" fontSize="2.5" fontWeight="900" fill="#ffffff" fontFamily="sans-serif">C</text>
        <text x="27" y="13.8" textAnchor="middle" fontSize="2.5" fontWeight="900" fill="#ffffff" fontFamily="sans-serif">D</text>
        {/* Rasterlinien */}
        <line x1={8} y1={18} x2={31} y2={18} stroke="#e1dfdd" strokeWidth={0.8} />
        <line x1={8} y1={22} x2={31} y2={22} stroke="#e1dfdd" strokeWidth={0.8} />
        <line x1={14.5} y1={14.5} x2={14.5} y2={29} stroke="#e1dfdd" strokeWidth={0.8} />
        <line x1={20} y1={14.5} x2={20} y2={29} stroke="#e1dfdd" strokeWidth={0.8} />
        {/* 3D-Balkendiagramm wächst heraus */}
        <Voxel x={10} y={22} w={3} h={6} d={1.5} color="#22c55e" />
        <Voxel x={16} y={18} w={3} h={10} d={1.5} color={barGold} />
        <Voxel x={22} y={13} w={3} h={15} d={1.5} color="#ef4444" />
      </>
    );
  },

  // 20. Technologische Singularität
  singularity: (tier) => {
    const gold = tierColor(hexNum(P.gold), tier, 1.0);
    const neon = tierColor(hexNum(P.neon), tier, 0.9);
    const core = "#ffffff";
    return (
      <>
        {/* Kosmische Strahlungsaura */}
        <circle cx={20} cy={20} r={16} fill="none" stroke={neon} strokeWidth={0.8} strokeDasharray="2,3" opacity={0.5} />
        {/* Äußerer geneigter Goldring */}
        <ellipse cx={20} cy={20} rx={15} ry={5.5} fill="none" stroke={gold} strokeWidth={2.0} transform="rotate(-30 20 20)" />
        {/* Zweiter kreuzender Ring */}
        <ellipse cx={20} cy={20} rx={15} ry={5.5} fill="none" stroke={neon} strokeWidth={1.8} transform="rotate(40 20 20)" />
        {/* Dritter vertikaler Ring */}
        <ellipse cx={20} cy={20} rx={13} ry={4.5} fill="none" stroke={gold} strokeWidth={1.4} transform="rotate(85 20 20)" />
        {/* Tesserakt / Kernwürfel */}
        <Voxel x={14} y={14} w={10} h={10} d={3.4} color="#050010" />
        {/* Schwarzes Loch / Ereignishorizont im Zentrum */}
        <circle cx={19} cy={19} r={4.0} fill="#000000" />
        <circle cx={19} cy={19} r={2.5} fill={core} />
        {/* Pulsierende kosmische Energiestrahlen */}
        <line x1={19} y1={10} x2={19} y2={6} stroke={gold} strokeWidth={1.5} strokeLinecap="round" />
        <line x1={19} y1={28} x2={19} y2={32} stroke={gold} strokeWidth={1.5} strokeLinecap="round" />
        <line x1={10} y1={19} x2={6} y2={19} stroke={neon} strokeWidth={1.5} strokeLinecap="round" />
        <line x1={28} y1={19} x2={32} y2={19} stroke={neon} strokeWidth={1.5} strokeLinecap="round" />
      </>
    );
  },
};

export function VoxelIcon({ buildingId, tier = 0, className }) {
  const render = ICONS[buildingId];
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      {render ? render(tier) : <circle cx={20} cy={20} r={10} fill={hexNum(P.steel)} />}
    </svg>
  );
}

// --- 20 Buzzword-Icons im einheitlichen Voxel-Look -----------------------------
const BUZZWORD_ICONS = {
  Synergy: () => (
    <>
      <polygon points="22,6 10,22 19,22 17,34 30,17 21,17" fill={hexNum(P.fireCore)} stroke={shade(hexNum(P.fireCore), -0.2)} strokeWidth={1} />
      <polygon points="21,10 13,21 19,21 18,28 26,18 21,18" fill={hexNum(P.gold)} />
    </>
  ),
  Moat: () => (
    <>
      <rect x="7" y="27" width="26" height="5" fill={hexNum(P.water)} rx="1" />
      <Block x={9} y={15} w={6} h={12} color={hexNum(P.stoneDark)} depth={2} skew={2} />
      <Block x={25} y={15} w={6} h={12} color={hexNum(P.stoneDark)} depth={2} skew={2} />
      <Block x={15} y={19} w={10} h={8} color={hexNum(P.stone)} depth={2} skew={2} />
      <rect x="18" y="21" width="4" height="6" rx="2" fill={hexNum(P.steelDark)} />
    </>
  ),
  Flywheel: () => (
    <>
      <circle cx="20" cy="20" r="12" fill="none" stroke={hexNum(P.steelDark)} strokeWidth="4" />
      <circle cx="20" cy="20" r="4" fill={hexNum(P.neon)} />
      {[0, 90, 180, 270].map((deg) => (
        <rect key={deg} x="18.5" y="6" width="3" height="6" fill={hexNum(P.neon)} transform={`rotate(${deg} 20 20)`} />
      ))}
    </>
  ),
  'Paradigm Shift': () => (
    <>
      <polygon points="20,7 29,15 20,33 11,15" fill={hexNum(P.neon)} />
      <polygon points="20,7 29,15 20,20" fill={shade(hexNum(P.neon), 0.25)} />
      <polygon points="20,7 11,15 20,20" fill={shade(hexNum(P.neon), -0.2)} />
      <polygon points="11,15 20,33 20,20" fill={shade(hexNum(P.neon), -0.35)} />
      <polygon points="29,15 20,33 20,20" fill={shade(hexNum(P.neon), 0.1)} />
    </>
  ),
  'Value Chain': () => (
    <>
      <Block x={6} y={26} w={7} h={7} color={hexNum(P.containerA)} depth={2} skew={2} />
      <Block x={15} y={20} w={7} h={13} color={hexNum(P.containerB)} depth={2} skew={2} />
      <Block x={24} y={13} w={7} h={20} color={hexNum(P.containerC)} depth={2} skew={2} />
      <path d="M8,23 L18,17 L28,10" stroke={hexNum(P.gold)} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </>
  ),
  Ecosystem: () => (
    <>
      <circle cx="20" cy="20" r="11" fill={hexNum(P.water)} />
      <rect x="13" y="16" width="6" height="5" rx="1.5" fill={hexNum(P.plant)} />
      <rect x="22" y="13" width="7" height="6" rx="1.5" fill={hexNum(P.plant)} />
      <rect x="16" y="24" width="8" height="4" rx="1.5" fill={hexNum(P.plant)} />
      <ellipse cx="20" cy="20" rx="15" ry="5" fill="none" stroke={hexNum(P.cloud)} strokeWidth="1.2" opacity="0.8" transform="rotate(-20 20 20)" />
    </>
  ),
  Alpha: () => (
    <>
      <polygon points="9,26 12,13 17,20 23,13 26,20 31,13 34,26" fill={hexNum(P.gold)} stroke={shade(hexNum(P.gold), -0.25)} strokeWidth="0.8" />
      <rect x="8" y="26" width="26" height="4" rx="1" fill={shade(hexNum(P.gold), -0.15)} />
      <circle cx="12" cy="12" r="1.5" fill={hexNum(P.warnRed)} />
      <circle cx="21.5" cy="12" r="1.8" fill={hexNum(P.neon)} />
      <circle cx="31" cy="12" r="1.5" fill={hexNum(P.warnRed)} />
    </>
  ),
  Runway: () => (
    <>
      <Block x={15} y={30} w={10} h={3} color={hexNum(P.steelDark)} depth={2} skew={2} />
      <path d="M20,6 C23,11 24,20 24,25 L16,25 C16,20 17,11 20,6 Z" fill={hexNum(P.paper)} stroke={shade(hexNum(P.paper), -0.2)} strokeWidth="0.8" />
      <polygon points="16,22 11,26 16,25" fill={hexNum(P.warnRed)} />
      <polygon points="24,22 29,26 24,25" fill={hexNum(P.warnRed)} />
      <circle cx="20" cy="15" r="2.2" fill={hexNum(P.neon)} />
      <polygon points="18,25 20,32 22,25" fill={hexNum(P.fire)} />
    </>
  ),
  'North Star': () => (
    <>
      <polygon points="20,6 23,17 34,20 23,23 20,34 17,23 6,20 17,17" fill={hexNum(P.gold)} />
      <polygon points="20,10 22,18 30,20 22,22 20,30 18,22 10,20 18,18" fill={hexNum(P.fireCore)} />
      <circle cx="20" cy="20" r="2" fill={hexNum(P.paper)} />
    </>
  ),
  'Product-Market-Fit': () => (
    <>
      <circle cx="20" cy="20" r="12" fill={hexNum(P.paper)} stroke={hexNum(P.warnRed)} strokeWidth="2.5" />
      <circle cx="20" cy="20" r="7" fill={hexNum(P.warnRed)} />
      <circle cx="20" cy="20" r="3" fill={hexNum(P.gold)} />
      <line x1="8" y1="8" x2="19" y2="19" stroke={hexNum(P.steelDark)} strokeWidth="2" strokeLinecap="round" />
      <polygon points="17,19 19,19 19,17" fill={hexNum(P.steelDark)} />
    </>
  ),
  'Network Effect': () => (
    <>
      <line x1="12" y1="12" x2="28" y2="12" stroke={hexNum(P.neon)} strokeWidth="1.5" />
      <line x1="12" y1="12" x2="12" y2="28" stroke={hexNum(P.neon)} strokeWidth="1.5" />
      <line x1="28" y1="12" x2="28" y2="28" stroke={hexNum(P.neon)} strokeWidth="1.5" />
      <line x1="12" y1="28" x2="28" y2="28" stroke={hexNum(P.neon)} strokeWidth="1.5" />
      <line x1="12" y1="12" x2="28" y2="28" stroke={hexNum(P.neon)} strokeWidth="1.2" strokeDasharray="2,2" />
      <Block x={8} y={8} w={7} h={7} color={hexNum(P.neon)} depth={2} skew={2} />
      <Block x={24} y={8} w={7} h={7} color={hexNum(P.gold)} depth={2} skew={2} />
      <Block x={8} y={24} w={7} h={7} color={hexNum(P.containerB)} depth={2} skew={2} />
      <Block x={24} y={24} w={7} h={7} color={hexNum(P.containerA)} depth={2} skew={2} />
    </>
  ),
  'First-Mover Advantage': () => (
    <>
      <polygon points="17,21 23,21 21,34 19,34" fill={hexNum(P.woodDark || P.desk)} />
      <path d="M15,22 C12,17 15,12 20,8 C25,12 28,17 25,22 Z" fill={hexNum(P.fire)} />
      <path d="M17,21 C15,18 17,14 20,11 C23,14 25,18 23,21 Z" fill={hexNum(P.fireCore)} />
      <circle cx="20" cy="18" r="2" fill={hexNum(P.paper)} />
    </>
  ),
  'Deep Tech': () => (
    <>
      <Block x={11} y={11} w={18} h={18} color={hexNum(P.steelDark)} depth={2.5} skew={2.5} />
      <rect x="15" y="15" width="10" height="10" rx="1.5" fill={hexNum(P.neon)} />
      {[-1, 1].map((dir, i) => (
        <g key={i}>
          <line x1="7" y1={16 + i * 8} x2="11" y2={16 + i * 8} stroke={hexNum(P.gold)} strokeWidth="1.5" />
          <line x1="29" y1={16 + i * 8} x2="33" y2={16 + i * 8} stroke={hexNum(P.gold)} strokeWidth="1.5" />
        </g>
      ))}
      <circle cx="20" cy="20" r="2.2" fill={hexNum(P.gold)} />
    </>
  ),
  'Category Creation': () => (
    <>
      <line x1="10" y1="30" x2="26" y2="14" stroke={hexNum(P.desk)} strokeWidth="3" strokeLinecap="round" />
      <rect x="23" y="11" width="4" height="4" fill={hexNum(P.gold)} transform="rotate(45 25 13)" />
      <polygon points="29,7 30,10 33,11 30,12 29,15 28,12 25,11 28,10" fill={hexNum(P.neon)} />
      <polygon points="17,7 18,9 20,10 18,11 17,13 16,11 14,10 16,9" fill={hexNum(P.fireCore)} />
    </>
  ),
  'Land Grab': () => (
    <>
      <Block x={8} y={25} w={24} h={6} color={hexNum(P.grass)} depth={2} skew={2} />
      <line x1="15" y1="9" x2="15" y2="25" stroke={hexNum(P.steelDark)} strokeWidth="1.8" />
      <polygon points="15,9 27,13 15,17" fill={hexNum(P.warnRed)} />
    </>
  ),
  'Compute Layer': () => (
    <>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Block x={10} y={10 + i * 7} w={20} h={5} color={hexNum(P.rack)} depth={2} skew={2} />
          <circle cx="14" cy={12.5 + i * 7} r="1" fill={hexNum(P.neon)} />
          <circle cx="18" cy={12.5 + i * 7} r="1" fill={hexNum(P.neon)} />
        </g>
      ))}
    </>
  ),
  'Data Moat': () => (
    <>
      <Silo cx={20} topY={10} rx={9} ry={3} h={18} color={hexNum(P.steel)} />
      <rect x="15" y="16" width="10" height="8" rx="2" fill={hexNum(P.steelDark)} />
      <circle cx="20" cy="19" r="1.5" fill={hexNum(P.neon)} />
    </>
  ),
  'Talent Density': () => (
    <>
      <Person cx={14} y={15} shirt={hexNum(P.hoodieA)} small />
      <Person cx={26} y={15} shirt={hexNum(P.hoodieB)} small />
      <Person cx={20} y={13} shirt={hexNum(P.hoodieC)} />
    </>
  ),
  'Vertical Integration': () => (
    <>
      <Block x={12} y={24} w={16} h={6} color={hexNum(P.containerA)} depth={2} skew={2} />
      <Block x={12} y={17} w={16} h={6} color={hexNum(P.containerB)} depth={2} skew={2} />
      <Block x={12} y={10} w={16} h={6} color={hexNum(P.containerC)} depth={2} skew={2} />
    </>
  ),
  'Platform Shift': () => (
    <>
      <Block x={6} y={21} w={16} h={6} color={hexNum(P.steelDark)} depth={2.5} skew={2.5} />
      <Block x={18} y={14} w={16} h={6} color={hexNum(P.neon)} depth={2.5} skew={2.5} />
      <polygon points="17,16 23,20 17,24" fill={hexNum(P.fireCore)} />
    </>
  ),
};

export function VoxelBuzzwordIcon({ noun, rarity = 'Common', className }) {
  const render = BUZZWORD_ICONS[noun];
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      {render ? render() : <circle cx={20} cy={20} r={10} fill={hexNum(P.neon)} />}
    </svg>
  );
}

// --- Icons für Nicht-Gebäude-Upgrades & Aktionen -------------------------------
export function VoxelUpgradeIcon({ type, subType, className }) {
  let content = null;
  if (type === 'click') {
    content = (
      <>
        <polygon points="12,8 12,28 17,23 21,31 25,29 21,21 27,21" fill={hexNum(P.gold)} stroke={shade(hexNum(P.gold), -0.3)} strokeWidth={1} />
        <circle cx="28" cy="11" r="1.5" fill={hexNum(P.fireCore)} />
        <circle cx="32" cy="15" r="1.2" fill={hexNum(P.neon)} />
      </>
    );
  } else if (type === 'greenwashing') {
    content = (
      <>
        <Silo cx={20} topY={16} rx={8} ry={2.5} h={14} color={hexNum(P.steelDark)} />
        <circle cx="20" cy="12" r="5" fill={hexNum(P.plant)} />
        <path d="M17,12 Q20,6 23,12 Q20,18 17,12 Z" fill={hexNum(P.crown)} />
      </>
    );
  } else if (type === 'layoff') {
    content = (
      <>
        <rect x="11" y="9" width="18" height="23" rx="1.5" fill={hexNum(P.paper)} stroke={shade(hexNum(P.paper), -0.25)} />
        <line x1="14" y1="14" x2="26" y2="14" stroke={hexNum(P.steelDark)} strokeWidth="1.2" />
        <line x1="14" y1="18" x2="26" y2="18" stroke={hexNum(P.steelDark)} strokeWidth="1.2" />
        <rect x="15" y="22" width="10" height="5" rx="1" fill={hexNum(P.warnRed)} transform="rotate(-12 20 24)" />
      </>
    );
  } else {
    // Global / Syndicate / Multiplier
    content = (
      <>
        <circle cx="20" cy="20" r="12" fill={hexNum(P.gold)} stroke={shade(hexNum(P.gold), -0.25)} strokeWidth="1.2" />
        <text x="20" y="26" textAnchor="middle" fontSize="16" fontWeight="900" fill={shade(hexNum(P.gold), -0.4)} fontFamily="monospace">$</text>
      </>
    );
  }

  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      {content}
    </svg>
  );
}

