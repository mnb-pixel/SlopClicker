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

function hexNum(n) {
  return `#${n.toString(16).padStart(6, '0')}`;
}
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex([r, g, b]) {
  const c = (v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}
function shade(hex, amt) {
  const [r, g, b] = hexToRgb(hex);
  const d = amt * 255;
  return rgbToHex([r + d, g + d, b + d]);
}
const GOLD = hexNum(P.gold);
// Identische Formel wie tierMix() in tierVisuals.js (strength 0.55, Stufe 0..TIER_MAX).
export function tierColor(baseHex, tier, strength = 0.55) {
  const t = (Math.min(VISUAL_TIER_MAX, Math.max(0, tier)) / VISUAL_TIER_MAX) * strength;
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

// --- Bausteine -----------------------------------------------------------------------
// Extrudierter Block: Frontfläche plus angeschrägte Deck- und Seitenfläche, heller bzw.
// dunkler getönt - der Trick hinter fast jedem "3D"-Icon in flachem Stil. Deckt Racks,
// Türme, Container, Silos, Podeste, Kuben ab.
function Block({ x, y, w, h, color, depth = 5, skew = 5 }) {
  const top = shade(color, 0.16);
  const side = shade(color, -0.2);
  return (
    <g>
      <polygon points={`${x},${y} ${x + w + skew},${y - depth} ${x + w + skew},${y - depth + h} ${x},${y + h}`} fill={side} />
      <polygon points={`${x},${y} ${x + skew},${y - depth} ${x + w + skew},${y - depth} ${x + w},${y}`} fill={top} />
      <rect x={x} y={y} width={w} height={h} fill={color} />
    </g>
  );
}
// Liegender Zylinder-Look (Silo/Reaktor): Ellipse oben, Rumpf, Ellipse unten.
function Silo({ cx, topY, rx, ry, h, color }) {
  const top = shade(color, 0.16);
  const bodyColor = color;
  return (
    <g>
      <rect x={cx - rx} y={topY} width={rx * 2} height={h} fill={bodyColor} />
      <ellipse cx={cx} cy={topY + h} rx={rx} ry={ry} fill={shade(color, -0.15)} />
      <ellipse cx={cx} cy={topY} rx={rx} ry={ry} fill={top} />
    </g>
  );
}
function Person({ cx, y, shirt, tie, small }) {
  const s = small ? 0.82 : 1;
  return (
    <g>
      <rect x={cx - 5 * s} y={y} width={10 * s} height={13 * s} rx={3} fill={shirt} />
      {tie && <rect x={cx - 1 * s} y={y + 1} width={2 * s} height={9 * s} fill={tie} />}
      <circle cx={cx} cy={y - 4 * s} r={4.6 * s} fill={hexNum(P.skin)} />
      <path d={`M${cx - 4.6 * s},${y - 6.5 * s} a${4.6 * s},${4.6 * s} 0 0 1 ${9.2 * s},0 z`} fill={hexNum(P.hair)} />
    </g>
  );
}

// --- Die 20 Engines --------------------------------------------------------------------
// Jede Funktion bekommt die Sichtstufe (0..3) und liefert den Inhalt eines
// 40x40-viewBox-SVGs. Farben kommen möglichst aus derselben Palette wie die echte Szene.
const ICONS = {
  // Monitor(e) NACH der Person gezeichnet und seitlich versetzt, statt mittig hinter ihr
  // zu verschwinden - sonst deckt der breite Oberkörper den Bildschirm komplett zu.
  prompt_intern: (tier) => (
    <>
      <Block x={9} y={27} w={20} h={5} color={hexNum(P.desk)} depth={3} skew={3} />
      <Person cx={18} y={13} shirt={tierColor(hexNum(P.hoodieA), tier)} small />
      <Block x={25} y={20} w={6} h={6} color={tierColor(hexNum(P.screen), tier, 0.7)} depth={2} skew={2} />
    </>
  ),
  prompt_engineer: (tier) => (
    <>
      <Block x={7} y={27} w={26} h={5} color={hexNum(P.desk)} depth={3} skew={3} />
      <Person cx={20} y={12} shirt={tierColor(hexNum(P.hoodieB), tier)} />
      <Block x={8} y={19} w={6} h={6} color={tierColor(hexNum(P.screen), tier, 0.7)} depth={2} skew={2} />
      <Block x={27} y={19} w={6} h={6} color={tierColor(hexNum(P.screen), tier, 0.7)} depth={2} skew={2} />
    </>
  ),
  chatbot_widget: (tier) => {
    const c = tierColor(hexNum(P.token), tier, 0.7);
    return (
      <>
        <rect x={7} y={11} width={26} height={16} rx={7} fill={hexNum(P.bubble)} stroke={shade(hexNum(P.bubble), -0.15)} strokeWidth={1.5} />
        <polygon points="14,26 10,33 19,27" fill={hexNum(P.bubble)} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={15 + i * 5} cy={19} r={2.1} fill={c} />
        ))}
      </>
    );
  },
  gpu_rack: (tier) => (
    <>
      <Block x={13} y={10} w={12} h={23} color={hexNum(P.rack)} depth={4} skew={4} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={15} y={14 + i * 4.5} width={8} height={1.6} fill={tierColor(hexNum(P.neon), tier, 0.8)} />
      ))}
    </>
  ),
  token_burner: (tier) => (
    <>
      <Block x={9} y={16} w={20} h={17} color={hexNum(P.burner)} depth={4} skew={4} />
      <circle cx={19} cy={25} r={5} fill={tierColor(hexNum(P.fire), tier, 0.9)} />
      <circle cx={19} cy={25} r={2.4} fill={hexNum(P.fireCore)} />
    </>
  ),
  datacenter: (tier) => (
    <>
      <Silo cx={20} topY={11} rx={9} ry={3} h={20} color={hexNum(P.facade)} />
      <rect x={11} y={22} width={18} height={3} fill={tierColor(hexNum(P.neon), tier, 0.85)} />
    </>
  ),
  gray_market_dc: (tier) => (
    <>
      <Silo cx={20} topY={14} rx={8} ry={2.6} h={16} color={hexNum(P.steelDark)} />
      <polygon points="12,14 20,7 28,14" fill={tierColor(hexNum(P.tarp), tier, 0.4)} />
    </>
  ),
  web_scraper: (tier) => (
    <>
      {[[-9, -6], [9, -6], [-9, 6], [9, 6]].map(([dx, dy], i) => (
        <line key={i} x1={20} y1={20} x2={20 + dx} y2={20 + dy} stroke={hexNum(P.steel)} strokeWidth={1.6} />
      ))}
      <ellipse cx={20} cy={20} rx={7.5} ry={4.5} fill={hexNum(P.steelDark)} />
      <circle cx={24.5} cy={18.5} r={2.2} fill={tierColor(hexNum(P.warnRed), tier, 0.4)} />
    </>
  ),
  keynote_stage: (tier) => (
    <>
      <rect x={8} y={22} width={24} height={3} fill={tierColor(hexNum(P.spot), tier, 0.5)} opacity={0.55} />
      <Block x={10} y={25} w={20} h={5} color={hexNum(P.stageFloor)} depth={3} skew={3} />
      <rect x={17} y={17} width={6} height={8} fill={hexNum(P.stageFloor)} />
    </>
  ),
  thought_leader: (tier) => <Person cx={20} y={16} shirt={hexNum(P.hoodieA)} tie={tierColor(hexNum(P.tie), tier, 0.6)} />,
  hype_journalist: (tier) => (
    <>
      <Person cx={20} y={16} shirt={hexNum(P.hoodieC)} />
      <rect x={24} y={20} width={7} height={5} rx={1} fill={tierColor(hexNum(P.camera), tier, 0.5)} />
      <circle cx={27.5} cy={22.5} r={1.4} fill={hexNum(P.screen)} />
    </>
  ),
  lobbyist: (tier) => (
    <>
      <line x1={30} y1={30} x2={30} y2={11} stroke={hexNum(P.steel)} strokeWidth={1.6} />
      <circle cx={30} cy={10} r={2.2} fill={tierColor(hexNum(P.warnRed), tier, 0.5)} />
      <Person cx={15} y={17} shirt={hexNum(P.hoodieA)} />
      <rect x={19} y={23} width={6} height={5} rx={1} fill={hexNum(P.steelDark)} />
    </>
  ),
  pitch_deck: () => (
    <>
      <rect x={11} y={13} width={16} height={20} rx={1.5} fill={hexNum(P.paper)} stroke={shade(hexNum(P.paper), -0.2)} strokeWidth={1} transform="rotate(-8 19 23)" />
      <rect x={14} y={10} width={16} height={20} rx={1.5} fill={hexNum(P.paper)} stroke={shade(hexNum(P.paper), -0.2)} strokeWidth={1} transform="rotate(6 22 20)" />
    </>
  ),
  vc_firm: (tier) => (
    <>
      <Block x={12} y={8} w={14} h={25} color={tierColor(hexNum(P.glass), tier, 0.45)} depth={4} skew={4} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={13.5} y={11 + i * 5.5} width={11} height={1.3} fill={shade(hexNum(P.glass), -0.25)} />
      ))}
    </>
  ),
  pivot_startup: () => (
    <>
      <Block x={6} y={22} w={9} h={9} color={hexNum(P.containerA)} depth={2.5} skew={2.5} />
      <Block x={16} y={19} w={9} h={12} color={hexNum(P.containerB)} depth={2.5} skew={2.5} />
      <Block x={26} y={23} w={8} h={8} color={hexNum(P.containerC)} depth={2.5} skew={2.5} />
    </>
  ),
  agi_clock: (tier) => (
    <>
      <rect x={8} y={13} width={24} height={13} rx={2} fill={hexNum(P.ledBoard)} />
      {[0, 1, 3, 4].map((i) => (
        <rect key={i} x={11 + i * 4.4} y={17} width={3} height={5} fill={tierColor(P.ledTextCss, tier, 0.7)} />
      ))}
      <circle cx={20} cy={19.5} r={0.9} fill={tierColor(P.ledTextCss, tier, 0.7)} />
    </>
  ),
  nuclear_reactor: (tier) => (
    <>
      {[13, 27].map((cx, i) => (
        <path
          key={i}
          d={`M${cx - 6},31 C${cx - 6},31 ${cx - 3},20 ${cx},20 C${cx + 3},20 ${cx + 6},31 ${cx + 6},31 Z`}
          fill={hexNum(P.stone)}
          stroke={shade(hexNum(P.stone), -0.2)}
          strokeWidth={0.6}
        />
      ))}
      <circle cx={13} cy={13} r={3} fill={tierColor(hexNum(P.mist), tier, 0.3)} opacity={0.85} />
      <circle cx={27} cy={11} r={3.6} fill={tierColor(hexNum(P.mist), tier, 0.3)} opacity={0.85} />
    </>
  ),
  metaverse_city: (tier) => (
    <>
      <Block x={9} y={28} w={22} h={4} color={hexNum(P.steelDark)} depth={2} skew={2} />
      <Block x={13} y={17} w={6} h={11} color={tierColor(hexNum(P.rim), tier, 0.5)} depth={2} skew={2} />
      <Block x={21} y={13} w={6} h={15} color={tierColor(hexNum(P.rim), tier, 0.5)} depth={2} skew={2} />
    </>
  ),
  excel_sheet: (tier) => (
    <>
      <rect x={9} y={11} width={22} height={18} rx={1.5} fill={hexNum(P.paper)} stroke={shade(hexNum(P.paper), -0.25)} />
      {[1, 2, 3].map((i) => (
        <line key={`h${i}`} x1={9} y1={11 + i * 4.5} x2={31} y2={11 + i * 4.5} stroke={shade(hexNum(P.paper), -0.15)} strokeWidth={0.6} />
      ))}
      {[1, 2, 3].map((i) => (
        <line key={`v${i}`} x1={9 + i * 5.5} y1={11} x2={9 + i * 5.5} y2={29} stroke={shade(hexNum(P.paper), -0.15)} strokeWidth={0.6} />
      ))}
      <circle cx={16} cy={19} r={1.3} fill={hexNum(P.hair)} />
      <circle cx={24} cy={19} r={1.3} fill={hexNum(P.hair)} />
      {tier >= 2 && <path d="M15,25 Q20,29 25,25" stroke={hexNum(P.hair)} strokeWidth={1} fill="none" />}
    </>
  ),
  singularity: (tier) => (
    <>
      <circle cx={20} cy={20} r={8} fill={hexNum(P.void)} />
      <ellipse cx={20} cy={20} rx={13} ry={4} fill="none" stroke={tierColor(hexNum(P.gold), tier, 1)} strokeWidth={1.6} transform="rotate(-18 20 20)" />
    </>
  ),
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

