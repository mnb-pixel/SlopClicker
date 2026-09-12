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

function Block({ x, y, w, h, color, depth = 3.5, skew = 3.5 }) {
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
    return (
      <>
        <Voxel x={6} y={26} w={24} h={3.2} d={3.0} color={hexNum(P.desk)} />
        <Voxel x={8} y={29.2} w={2} h={6} d={1.5} color={hexNum(P.deskLeg)} />
        <Voxel x={26} y={29.2} w={2} h={6} d={1.5} color={hexNum(P.deskLeg)} />
        <VoxelPerson cx={15} y={11} shirtColor={shirt} small />
        <Voxel x={23} y={24} w={1.8} h={2} d={1.2} color={hexNum(P.deskLeg)} />
        <Voxel x={20.5} y={16.5} w={7} h={7.5} d={1.8} color={hexNum(P.monitor)} />
        <rect x={21.2} y={17.2} width={5.4} height={5.8} fill={screen} />
        <Voxel x={10.5} y={23.5} w={2.2} h={2.5} d={1.4} color={hexNum(P.cup)} />
      </>
    );
  },

  // 2. Chatbot Widget
  chatbot_widget: (tier) => {
    const bubbleCol = hexNum(P.bubble);
    const tokenCol = tierColor(hexNum(P.token), tier, 0.85);
    return (
      <>
        <Voxel x={8} y={10} w={22} h={15} d={3.2} color={bubbleCol} />
        <Voxel x={12} y={25} w={4} h={4} d={2.5} color={bubbleCol} />
        <Voxel x={10} y={28} w={3} h={3} d={2.0} color={bubbleCol} />
        {[0, 1, 2].map((i) => (
          <Voxel key={i} x={12 + i * 5.5} y={16} w={3.2} h={3.2} d={1.5} color={tokenCol} />
        ))}
      </>
    );
  },

  // 3. Prompt Engineer
  prompt_engineer: (tier) => {
    const shirt = tierColor(hexNum(P.hoodieB), tier);
    const screen = tierColor(hexNum(P.screen), tier, 0.8);
    return (
      <>
        <Voxel x={5} y={26} w={27} h={3.2} d={3.0} color={hexNum(P.desk)} />
        <Voxel x={7} y={29.2} w={2.2} h={6} d={1.5} color={hexNum(P.deskLeg)} />
        <Voxel x={28} y={29.2} w={2.2} h={6} d={1.5} color={hexNum(P.deskLeg)} />
        <VoxelPerson cx={18.5} y={10} shirtColor={shirt} />
        <Voxel x={7.5} y={16} w={6.5} h={7.5} d={1.8} color={hexNum(P.monitor)} />
        <rect x={8.2} y={16.8} width={5.0} height={5.8} fill={screen} />
        <Voxel x={23.5} y={16} w={6.5} h={7.5} d={1.8} color={hexNum(P.monitor)} />
        <rect x={24.2} y={16.8} width={5.0} height={5.8} fill={screen} />
        <Voxel x={14} y={25.2} w={9} h={1.2} d={2.2} color={hexNum(P.deskDark)} />
      </>
    );
  },

  // 4. GPU Server Rack
  gpu_rack: (tier) => {
    const neonCol = tierColor(hexNum(P.neon), tier, 0.9);
    return (
      <>
        <Voxel x={11} y={8} w={16} h={26} d={4.0} color={hexNum(P.rack)} />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x={13} y={10.5 + i * 4.6} width={12} height={2.8} fill={shade(hexNum(P.rack), -0.2)} />
            <rect x={14} y={11.2 + i * 4.6} width={7.5} height={1.2} fill={neonCol} />
            <rect x={22.5} y={11.2 + i * 4.6} width={1.2} height={1.2} fill={tierColor(hexNum(P.gold), tier, 0.6)} />
          </g>
        ))}
      </>
    );
  },

  // 5. Rechenzentrum (Datacenter)
  datacenter: (tier) => {
    const neonCol = tierColor(hexNum(P.neon), tier, 0.85);
    return (
      <>
        <Voxel x={8} y={28} w={22} h={4} d={3.5} color={hexNum(P.stoneDark)} />
        <Voxel x={10} y={17} w={18} h={11} d={3.5} color={hexNum(P.facade)} />
        <Voxel x={9.5} y={19.5} w={19} h={1.8} d={3.6} color={neonCol} />
        <Voxel x={12} y={10} w={14} h={7} d={3.2} color={shade(hexNum(P.facade), 0.08)} />
        <Voxel x={16} y={6.5} w={6} h={3.5} d={2.2} color={hexNum(P.steel)} />
      </>
    );
  },

  // 6. Web Scraper
  web_scraper: (tier) => {
    const redCol = tierColor(hexNum(P.warnRed), tier, 0.5);
    return (
      <>
        <line x1={12} y1={14} x2={28} y2={26} stroke={hexNum(P.steel)} strokeWidth={2.4} />
        <line x1={28} y1={14} x2={12} y2={26} stroke={hexNum(P.steel)} strokeWidth={2.4} />
        {[[10, 12], [26, 12], [10, 24], [26, 24]].map(([rx, ry], i) => (
          <ellipse key={i} cx={rx + 2} cy={ry + 2} rx={4.0} ry={1.8} fill={hexNum(P.cloud)} opacity={0.65} />
        ))}
        <Voxel x={15} y={16} w={8} h={7} d={2.8} color={hexNum(P.steelDark)} />
        <Voxel x={17.5} y={20} w={3} h={3} d={1.5} color={redCol} />
      </>
    );
  },

  // 7. Thought Leader
  thought_leader: (tier) => {
    const tie = tierColor(hexNum(P.tie), tier, 0.8);
    return (
      <>
        <Voxel x={7} y={28} w={24} h={4} d={3.0} color={hexNum(P.stageFloor)} />
        <VoxelPerson cx={17} y={11} shirtColor={hexNum(P.hoodieA)} tieColor={tie} />
        <Voxel x={22} y={19} w={7} h={9} d={2.5} color={hexNum(P.woodDeck || P.desk)} />
        <line x1={25} y1={19} x2={23.5} y2={15} stroke={hexNum(P.steelDark)} strokeWidth={1.2} />
        <circle cx={23.5} cy={14.5} r={1.2} fill={hexNum(P.steel)} />
      </>
    );
  },

  // 8. VC-Firma
  vc_firm: (tier) => {
    const glass = tierColor(hexNum(P.glass), tier, 0.5);
    return (
      <>
        <Voxel x={10} y={29} w={18} h={3.5} d={3.5} color={hexNum(P.steelDark)} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <Voxel x={11} y={12 + i * 4.2} w={16} h={3.6} d={3.5} color={glass} />
            <rect x={12} y={14 + i * 4.2} width={14} height={0.7} fill={shade(glass, -0.3)} />
          </g>
        ))}
        <Voxel x={13} y={7.5} w={12} h={4.5} d={2.8} color={tierColor(hexNum(P.gold), tier, 0.7)} />
      </>
    );
  },

  // 9. Hype-Journalist
  hype_journalist: (tier) => {
    const cam = tierColor(hexNum(P.camera), tier, 0.6);
    return (
      <>
        <VoxelPerson cx={18} y={12} shirtColor={hexNum(P.hoodieC)} />
        <Voxel x={22} y={19} w={7.5} h={5.5} d={2.5} color={cam} />
        <circle cx={25.5} cy={22} r={1.6} fill={hexNum(P.screen)} />
        <polygon points="28,18 33,14 30,19" fill={hexNum(P.gold)} />
      </>
    );
  },

  // 10. Keynote-Bühne
  keynote_stage: (tier) => {
    const spot = tierColor(hexNum(P.spot), tier, 0.6);
    return (
      <>
        <polygon points="8,8 30,8 33,26 5,26" fill={spot} opacity={0.3} />
        <Voxel x={6} y={27} w={26} h={3.5} d={3.2} color={shade(hexNum(P.stageFloor), -0.15)} />
        <Voxel x={9} y={23} w={20} h={4.0} d={3.0} color={hexNum(P.stageFloor)} />
        <Voxel x={14} y={12} w={10} h={11} d={1.8} color={hexNum(P.screen)} />
        <rect x={15} y={13.5} width={8} height={8} fill={tierColor(hexNum(P.neon), tier, 0.6)} />
      </>
    );
  },

  // 11. Pivot-Startup
  pivot_startup: (tier) => {
    const fireCol = tierColor(hexNum(P.fireCore), tier, 0.8);
    return (
      <>
        <Voxel x={8} y={10} w={3.5} h={21} d={2.2} color={hexNum(P.steelDark)} />
        <rect x={11.5} y={15} width={4} height={1.6} fill={hexNum(P.steel)} />
        <rect x={11.5} y={22} width={4} height={1.6} fill={hexNum(P.steel)} />
        <Voxel x={16} y={11} w={7.5} h={15} d={3.0} color={hexNum(P.facade)} />
        <polygon points="19.7,4 16,11 23.5,11" fill={tierColor(hexNum(P.warnRed), tier, 0.5)} />
        <polygon points="16,22 12,26 16,26" fill={hexNum(P.warnRed)} />
        <polygon points="23.5,22 27.5,26 23.5,26" fill={hexNum(P.warnRed)} />
        <polygon points="17,26 19.7,33 22.5,26" fill={fireCol} />
      </>
    );
  },

  // 12. Token Burner
  token_burner: (tier) => {
    const fire = tierColor(hexNum(P.fire), tier, 0.9);
    return (
      <>
        <Voxel x={15} y={7} w={8} h={8} d={3.0} color={shade(hexNum(P.burner), 0.1)} />
        <Voxel x={9} y={15} w={20} h={16} d={4.0} color={hexNum(P.burner)} />
        <Voxel x={14} y={20} w={10} h={9} d={2.0} color="#150a06" />
        <polygon points="19,21 16,27 22,27" fill={fire} />
        <polygon points="19,23 17,27 21,27" fill={hexNum(P.fireCore)} />
      </>
    );
  },

  // 13. Pitch Deck
  pitch_deck: (tier) => {
    const stamp = tierColor(hexNum(P.gold), tier, 0.85);
    return (
      <>
        <Voxel x={8} y={12} w={15} h={19} d={1.5} color={shade(hexNum(P.paper), -0.15)} />
        <Voxel x={13} y={8} w={16} h={20} d={1.8} color={hexNum(P.paper)} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={16} y={13 + i * 3.5} width={10} height={1.2} fill={hexNum(P.steelDark)} />
        ))}
        <circle cx={23} cy={22} r={2.5} fill={stamp} />
      </>
    );
  },

  // 14. Lobbyist
  lobbyist: (tier) => {
    const goldCol = tierColor(hexNum(P.gold), tier, 0.8);
    return (
      <>
        <VoxelPerson cx={16} y={12} shirtColor={hexNum(P.hoodieA)} />
        <Voxel x={8} y={21} w={6} h={6} d={2.2} color={hexNum(P.steelDark)} />
        <line x1={26} y1={12} x2={26} y2={28} stroke={goldCol} strokeWidth={1.5} />
        <line x1={22} y1={15} x2={30} y2={15} stroke={goldCol} strokeWidth={1.5} />
        <circle cx={22} cy={19} r={1.6} fill={goldCol} />
        <circle cx={30} cy={19} r={1.6} fill={goldCol} />
      </>
    );
  },

  // 15. AGI-Countdown
  agi_clock: (tier) => {
    const led = tierColor(P.ledTextCss, tier, 0.8);
    return (
      <>
        <Voxel x={7} y={11} w={24} h={18} d={3.5} color={hexNum(P.ledBoard)} />
        {[0, 1, 3, 4].map((i) => (
          <rect key={i} x={10 + i * 4.5} y={16} width={3.2} height={6.5} fill={led} rx={0.5} />
        ))}
        <circle cx={19.5} cy={17.5} r={0.8} fill={led} />
        <circle cx={19.5} cy={21.0} r={0.8} fill={led} />
      </>
    );
  },

  // 16. Schwarzmarkt-DC
  gray_market_dc: (tier) => {
    const tarp = tierColor(hexNum(P.tarp), tier, 0.6);
    return (
      <>
        <Voxel x={10} y={13} w={18} h={17} d={3.5} color={hexNum(P.steelDark)} />
        <polygon points="8,13 19,6 30,13" fill={tarp} />
        <line x1={12} y1={17} x2={26} y2={27} stroke={hexNum(P.tapeYellow)} strokeWidth={1.8} />
        <line x1={12} y1={23} x2={26} y2={13} stroke={hexNum(P.tapeYellow)} strokeWidth={1.8} />
      </>
    );
  },

  // 17. Fusionsreaktor
  nuclear_reactor: (tier) => {
    const core = tierColor(hexNum(P.neon), tier, 0.85);
    return (
      <>
        <Voxel x={6} y={15} w={11} h={15} d={3.0} color={hexNum(P.stone)} />
        <circle cx={11.5} cy={11} r={3.2} fill={hexNum(P.mist)} opacity={0.8} />
        <Voxel x={19} y={12} w={13} h={18} d={3.5} color={hexNum(P.stone)} />
        <circle cx={25.5} cy={8} r={3.8} fill={hexNum(P.mist)} opacity={0.8} />
        <circle cx={18} cy={23} r={2.5} fill={core} />
      </>
    );
  },

  // 18. Metaverse City
  metaverse_city: (tier) => {
    const neon = tierColor(hexNum(P.rim), tier, 0.85);
    return (
      <>
        <Voxel x={6} y={26} w={13} h={4} d={2.5} color={hexNum(P.steelDark)} />
        <Voxel x={9} y={16} w={6} h={10} d={2.0} color={neon} />
        <Voxel x={18} y={21} w={14} h={4} d={2.5} color={hexNum(P.steelDark)} />
        <Voxel x={22} y={11} w={6} h={10} d={2.0} color={neon} />
        <line x1={12} y1={17} x2={22} y2={13} stroke={hexNum(P.neon)} strokeWidth={1.5} strokeDasharray="2,2" />
      </>
    );
  },

  // 19. Excel-Tabelle
  excel_sheet: (tier) => {
    const green = tierColor(hexNum(P.grassDark || P.plant), tier, 0.8);
    return (
      <>
        <Voxel x={6} y={12} w={26} h={18} d={3.0} color={hexNum(P.paper)} />
        {[0, 1, 2].map((i) => (
          <line key={`h${i}`} x1={8} y1={16 + i * 5} x2={30} y2={16 + i * 5} stroke={shade(hexNum(P.paper), -0.2)} strokeWidth={0.8} />
        ))}
        <Voxel x={10} y={20} w={3.5} h={7} d={1.8} color={green} />
        <Voxel x={16} y={16} w={3.5} h={11} d={1.8} color={green} />
        <Voxel x={22} y={11} w={3.5} h={16} d={1.8} color={green} />
      </>
    );
  },

  // 20. Technologische Singularität
  singularity: (tier) => {
    const gold = tierColor(hexNum(P.gold), tier, 1.0);
    return (
      <>
        <ellipse cx={20} cy={20} rx={14} ry={4.5} fill="none" stroke={gold} strokeWidth={2.0} transform="rotate(-25 20 20)" />
        <ellipse cx={20} cy={20} rx={14} ry={4.5} fill="none" stroke={hexNum(P.neon)} strokeWidth={1.6} transform="rotate(35 20 20)" />
        <Voxel x={14} y={14} w={10} h={10} d={3.2} color={hexNum(P.void)} />
        <circle cx={19} cy={19} r={2.5} fill={hexNum(P.fireCore)} />
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

