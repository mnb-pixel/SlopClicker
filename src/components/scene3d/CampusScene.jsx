import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import * as THREE from 'three';
import { Crosshair } from 'lucide-react';
import { ZONES_DATA } from '../../data/zonesData';
import {
  deriveZones,
  deriveFurnace,
  deriveIsland,
  getSceneMood,
  getNewZoneIds,
  DAMAGE_FLASH_MS,
} from '../../utils/sceneState';
import { ZoneBuyPanel } from './ZoneBuyPanel';
import { getZoneVisual } from './zoneVisuals';
import { getPalette3d } from './palette';
import { buildIsland } from './buildIsland';
import { buildServerRack } from './buildServerRack';
import { buildZones } from './buildZones';
import { buildCampus } from './buildCampus';
import { buildEnvironment } from './buildEnvironment';
import { buildDeliveryTruck } from './buildDeliveryTruck';
import { FURNACE_ANCHOR } from '../../data/zonesData';

// Ränder, in denen der Ankerpunkt einer Zonen-Stecknadel noch liegen darf (Clientpixel).
// Links/rechts etwa die halbe Nadelbreite, oben unter der Kopfzeile, unten über der
// Buttonreihe - eine Nadel hinter dem HUD wäre weder gut sichtbar noch anklickbar.
// Die Nadel steht ÜBER ihrem Anker, deshalb ist der obere Rand um ihre Höhe größer als
// die Kopfzeile selbst. Greift praktisch nur im Querformat: dort ist die Insel flacher
// und die hinteren Zonen projizieren bis in die Kopfzeile hinein.
const PIN_EDGE_PX = 46;
const PIN_TOP_PX = 196;
const PIN_BOTTOM_PX = 112;

// Ab welcher Inselgröße die Kamera NICHT mehr weiter herauszoomt (Vielfaches der
// Basisinsel, siehe utils/campusLayout.js). Bis dahin passt die Insel von selbst ins
// Bild; darüber hinaus würde alles nur noch kleiner und unleserlich - ab da schiebt
// und zoomt der Spieler selbst.
const VIEW_FIT_MAX = 64 / 24;
const ZOOM_MAX = 3.6;
const ZOOM_STEP = 0.0016; // Rad pro Mausrad-Pixel
// Ab so vielen Pixeln Bewegung ist es ein Schieben und kein Tippen mehr.
const DRAG_THRESHOLD_PX = 6;

// Die 3D-Insel als React-Komponente.
//
// Regel Nummer eins: KEIN React-Re-Render pro Frame. Der Spielzustand kommt per Props,
// wird in stateRef geschrieben und von der Render-Loop gelesen. React rendert nur noch,
// wenn sich Kaufpanel, Beschriftungen oder die Zonen-Ableitung ändern.
//
// Aufbau in einem Effect: Renderer, Kamera, Licht, Insel, Ofen, Zonen. Läuft einmal
// beim Mount und noch einmal nach einem WebGL-Kontextverlust (rebuild-Zähler).
export const CampusScene = forwardRef(function CampusScene(
  {
    buildings,
    boughtUpgrades,
    boughtGreenwashingLayoffs,
    vps,
    gpuTemp,
    isOverheated,
    overheatedAt = 0,
    activeEvent,
    powerClickActive,
    bubbleGlitchUntil,
    themeMode,
    lastBlackSwan,
    valuation,
    totalValuation,
    buyBuilding,
    buyMode,
    setBuyMode,
    buyUpgrade,
    buyGreenwashingLayoff,
    handleTapAGI,
    tickerText = '',
    hypeTier = 1,
    t,
  },
  ref
) {
  const tr = t || ((k) => k);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const stateRef = useRef({});
  const apiRef = useRef(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [labelPos, setLabelPos] = useState({});
  const [rebuild, setRebuild] = useState(0);
  // Sichtbar, sobald der Spieler geschoben oder gezoomt hat: ohne Rückweg verliert man
  // auf einer Insel, die größer ist als das Bild, die Orientierung.
  const [viewMoved, setViewMoved] = useState(false);
  const viewMovedRef = useRef(false);
  // Die Stecknadeln werden pro Frame direkt im DOM gesetzt (siehe Render-Loop), nicht
  // über React - beim Schieben wäre das ein Re-Render pro Bild.
  const pinRefs = useRef(new Map());

  // Black-Swan-Blitz: der Store hält den letzten Treffer dauerhaft, sichtbar ist er
  // nur DAMAGE_FLASH_MS lang. Gemerkt wird, welcher Treffer schon abgeblitzt ist.
  const [clearedFlashAt, setClearedFlashAt] = useState(null);
  useEffect(() => {
    if (!lastBlackSwan || !lastBlackSwan.buildingId) return undefined;
    const timer = setTimeout(() => setClearedFlashAt(lastBlackSwan.at), DAMAGE_FLASH_MS);
    return () => clearTimeout(timer);
  }, [lastBlackSwan]);
  const damagedBuildingId =
    lastBlackSwan && clearedFlashAt !== lastBlackSwan.at ? lastBlackSwan.buildingId : null;

  const zones = useMemo(
    () => deriveZones({ buildings, boughtUpgrades, boughtGreenwashingLayoffs, damagedBuildingId }),
    [buildings, boughtUpgrades, boughtGreenwashingLayoffs, damagedBuildingId]
  );
  // NEU-Hinweis am Zonenschild: bewusst NICHT im zones-useMemo, das hängt an der
  // Bewertung und würde sonst die ganze Zonen-Ableitung in jeden Tick ziehen.
  const newZoneIds = useMemo(() => getNewZoneIds({ zones, valuation }), [zones, valuation]);
  // Wie groß muss die Insel sein? Hängt nur an den Zonen, also am selben Memo-Takt.
  const islandState = useMemo(() => deriveIsland(zones), [zones]);

  const furnace = deriveFurnace({ vps, gpuTemp, isOverheated });
  const mood = getSceneMood({ isOverheated, activeEvent, powerClickActive });
  const theme = themeMode === 'sec_prospectus' ? 'blueprint' : 'day';
  const glitch = Boolean(bubbleGlitchUntil);

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  stateRef.current = { zones, furnace, island: islandState, mood, theme, selectedZone, isOverheated, overheatedAt, reduced, handleTapAGI, tickerText, hypeTier };

  // Ref-Setter je Zone, stabil über Renders hinweg - ein neuer Callback pro Render
  // würde React jedes Mal ab- und wieder anmelden lassen.
  const pinRefSetters = useRef(new Map());
  const setPinRef = useCallback((id) => {
    const map = pinRefSetters.current;
    if (!map.has(id)) {
      map.set(id, (el) => {
        if (el) pinRefs.current.set(id, el);
        else pinRefs.current.delete(id);
      });
    }
    return map.get(id);
  }, []);

  // Bildschirmposition (Client-Koordinaten) eines Weltpunkts, für Beschriftungen und
  // für den Feuer-Button, dessen Partikel am Schrank starten sollen.
  const projectToClient = useCallback((vec3) => {
    const api = apiRef.current;
    const el = containerRef.current;
    if (!api || !el) return null;
    const v = vec3.clone().project(api.camera);
    const r = el.getBoundingClientRect();
    return {
      clientX: r.left + ((v.x + 1) / 2) * r.width,
      clientY: r.top + ((1 - v.y) / 2) * r.height,
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      // Auf den sichtbaren Bereich geklemmt: seit die Insel größer sein darf als das
      // Bild, kann der Schrank weggeschoben sein - die fliegenden Zahlen sollen dann am
      // Bildrand in seiner Richtung starten statt unsichtbar daneben.
      getFurnaceScreenPos: () => {
        const el = containerRef.current;
        const pos = apiRef.current ? projectToClient(apiRef.current.furnace.corePosition) : null;
        if (!pos || !el) return pos;
        const r = el.getBoundingClientRect();
        return {
          clientX: Math.min(r.right - 24, Math.max(r.left + 24, pos.clientX)),
          clientY: Math.min(r.bottom - 24, Math.max(r.top + 24, pos.clientY)),
        };
      },
      pulse: () => apiRef.current && apiRef.current.furnace.pulse(),
    }),
    [projectToClient]
  );

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    let palette = getPalette3d(stateRef.current.theme);
    let appliedTheme = stateRef.current.theme;

    // Orthografische Kamera von vorne links oben, ca. 32 Grad Neigung. Die BLICKRICHTUNG
    // wird genau einmal gesetzt und danach nie mehr angefasst: Schieben heißt, die Kamera
    // entlang ihrer eigenen Rechts-/Hoch-Achse zu versetzen (lookAt() erneut aufzurufen
    // würde die Isometrie verdrehen).
    // Die Kamera steht bewusst weit entfernt (statt nah dran mit kleinem Fern-Clip):
    // bei orthografischer Projektion ändert der Abstand entlang einer festen Richtung
    // weder Ausschnitt noch Maßstab, aber das flache Grasfeld (800x800) reicht beim
    // Herauszoomen bis weit vor die Kamera - stünde sie zu nah, würde die dem
    // Betrachter zugewandte Feldecke hinter der Nah-Clip-Ebene verschwinden.
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 3000);
    const CAM_BASE = new THREE.Vector3(30, 26, 30).multiplyScalar(12);
    camera.position.copy(CAM_BASE);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    const camRight = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).normalize();
    const camUp = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1).normalize();
    const camForward = new THREE.Vector3();
    camera.getWorldDirection(camForward);
    const focus = new THREE.Vector3();

    const hemi = new THREE.HemisphereLight(palette.hemiSky, palette.hemiGround, 0.9);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(palette.sun, 2.2);
    const SUN_OFFSET = new THREE.Vector3(-14, 26, 10);
    sun.position.copy(SUN_OFFSET);
    sun.castShadow = true;
    // Die Schattenkarte deckt nicht mehr die ganze Insel ab - die kann inzwischen
    // sechsmal so groß sein wie der Bildausschnitt. Stattdessen folgt sie dem Blick:
    // scharfe Schatten dort, wo man hinschaut, statt matschiger überall.
    const sunTarget = new THREE.Object3D();
    scene.add(sunTarget);
    sun.target = sunTarget;
    const isSmall = Math.min(window.innerWidth, window.innerHeight) < 700;
    sun.shadow.mapSize.set(isSmall ? 1024 : 2048, isSmall ? 1024 : 2048);
    sun.shadow.camera.left = -22;
    sun.shadow.camera.right = 22;
    sun.shadow.camera.top = 22;
    sun.shadow.camera.bottom = -22;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 80;
    sun.shadow.bias = -0.0005;
    scene.add(sun);

    const island = buildIsland(palette);
    scene.add(island.group);
    const furnaceObj = buildServerRack(palette);
    scene.add(furnaceObj.group);
    const zonesObj = buildZones(palette, ZONES_DATA);
    scene.add(zonesObj.group);
    const campus = buildCampus(palette, ZONES_DATA, FURNACE_ANCHOR);
    scene.add(campus.group);
    const environment = buildEnvironment(palette);
    scene.add(environment.group);
    const deliveryTruck = buildDeliveryTruck(palette, FURNACE_ANCHOR);
    scene.add(deliveryTruck.group);

    // resetView() wird weiter unten definiert, deshalb der Umweg über den Aufruf -
    // der Knopf drückt erst, wenn längst alles steht.
    apiRef.current = { renderer, scene, camera, furnace: furnaceObj, zones: zonesObj, resetView: () => resetView() };
    container.style.background = palette.skyCss;

    // Kamera-Ausschnitt: Hochformat füllt die Breite, Querformat die Höhe. Der Campus
    // sitzt eine Spur UNTER der Bildmitte: oben liegt die Kopfzeile (Name, Bewertung,
    // Kennzahlen, Hitzebalken), unten nur die Buttonreihe - die freie Fläche dazwischen
    // hat ihre Mitte also unterhalb der Bildmitte.
    //
    // `viewScale` ist die Inselgröße relativ zur Basis, gedeckelt auf VIEW_FIT_MAX: bis
    // dahin fährt die Kamera beim Wachstum zurück, danach bleibt der Maßstab stehen und
    // die Insel ragt über den Bildrand hinaus - ab da schiebt und zoomt der Spieler.
    let viewScale = 1;
    let lastSize = { w: 0, h: 0 };
    let pinVersion = -1;
    // Der vom Spieler gesteuerte Teil der Kamera: Versatz entlang der Bildachsen und
    // Zoomfaktor auf dem eingepassten Ausschnitt (1 = eingepasst).
    const view = { panX: 0, panY: 0, zoom: 1 };
    let islandExtent = 24;
    const fitCamera = (w, h) => {
      lastSize = { w, h };
      const aspect = w / Math.max(1, h);
      let halfW;
      let halfH;
      // Der Versatz ist bewusst eine feste Weltgröße (aus dem UNskalierten Ausschnitt),
      // keine Prozentzahl: als Anteil gerechnet schöbe er den Campus bei jedem
      // Wachstumsschritt weiter aus dem Bild.
      //
      // Er ist jetzt NEGATIV (Campus etwas tiefer im Bild). Der frühere kräftige Schub
      // nach oben (0.18) stammt aus der Zeit der schwebenden Insel: die hatte eine
      // Felsspitze unter sich, die Platz nach unten brauchte. Seit das Spielfeld eine
      // flache Wiese ist, schob derselbe Wert den Campus nur noch in die obere
      // Bildhälfte und ließ darunter ein leeres Drittel Rasen stehen.
      let shiftY;
      if (aspect < 1) {
        halfW = 17.5 * viewScale;
        halfH = halfW / aspect;
        shiftY = -(17.5 / aspect) * 0.05;
      } else {
        halfH = 17 * viewScale;
        halfW = halfH * aspect;
        shiftY = -17 * 0.04;
      }
      camera.top = halfH - shiftY;
      camera.bottom = -halfH - shiftY;
      camera.left = -halfW;
      camera.right = halfW;
      applyView();
    };

    // Halbe sichtbare Weltbreite/-höhe beim aktuellen Zoom.
    const halfViewW = () => (camera.right - camera.left) / (2 * view.zoom);
    const halfViewH = () => (camera.top - camera.bottom) / (2 * view.zoom);

    // Wie weit darf man schieben? Nur so weit, wie die Insel über den Bildrand hinaus
    // ragt, plus etwas Luft. Passt sie ganz ins Bild (weit herausgezoomt), bleibt sie
    // damit von selbst in der Mitte - sonst könnte man die ganze Insel aus dem Bild
    // schieben und stünde vor leerem Himmel.
    const panLimit = () => {
      const half = islandExtent / 2;
      const spanU = half * (Math.abs(camRight.x) + Math.abs(camRight.z));
      const spanV = half * (Math.abs(camUp.x) + Math.abs(camUp.z));
      return {
        x: Math.max(0, spanU - halfViewW() * 0.75) + 3,
        y: Math.max(0, spanV - halfViewH() * 0.75) + 3,
      };
    };
    // Kleinster Zoom: so weit heraus, dass die ganze Insel ins Bild passt (mehr bringt
    // nichts), aber nie enger als der eingepasste Ausschnitt.
    const minZoom = () => Math.min(1, (VIEW_FIT_MAX * 24) / Math.max(24, islandExtent));

    let viewVersion = 0;
    function applyView() {
      view.zoom = Math.min(ZOOM_MAX, Math.max(minZoom(), view.zoom));
      const lim = panLimit();
      view.panX = Math.min(lim.x, Math.max(-lim.x, view.panX));
      view.panY = Math.min(lim.y, Math.max(-lim.y, view.panY));
      camera.position.copy(CAM_BASE).addScaledVector(camRight, view.panX).addScaledVector(camUp, view.panY);
      camera.zoom = view.zoom;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      // Schattenkarte und Sonne auf den Punkt setzen, den die Kamera gerade anschaut:
      // von der Kameraposition entlang der Blickrichtung bis auf Bodenhöhe.
      focus.copy(camera.position).addScaledVector(camForward, -camera.position.y / camForward.y);
      sunTarget.position.copy(focus);
      sun.position.copy(focus).add(SUN_OFFSET);
      const shadowHalf = Math.min(26, Math.max(halfViewW(), halfViewH()) * 0.85);
      sun.shadow.camera.left = -shadowHalf;
      sun.shadow.camera.right = shadowHalf;
      sun.shadow.camera.top = shadowHalf;
      sun.shadow.camera.bottom = -shadowHalf;
      sun.shadow.camera.updateProjectionMatrix();
      viewVersion += 1;
      const moved = Math.abs(view.panX) > 0.5 || Math.abs(view.panY) > 0.5 || Math.abs(view.zoom - 1) > 0.02;
      if (moved !== viewMovedRef.current) {
        viewMovedRef.current = moved;
        setViewMoved(moved);
      }
    }

    // Zoomen um einen Bildpunkt herum: der Weltpunkt unter dem Finger bleibt liegen.
    const zoomAt = (factor, px, py, rect) => {
      const before = { w: halfViewW(), h: halfViewH() };
      view.zoom = Math.min(ZOOM_MAX, Math.max(minZoom(), view.zoom * factor));
      const after = { w: halfViewW(), h: halfViewH() };
      const nx = (px / rect.width) * 2 - 1;
      const ny = 1 - (py / rect.height) * 2;
      view.panX += nx * (before.w - after.w);
      view.panY += ny * (before.h - after.h);
      applyView();
    };

    const resetView = () => {
      view.panX = 0;
      view.panY = 0;
      view.zoom = 1;
      applyView();
    };

    // Bildschirmposition einer Zonen-Stecknadel, auf den sichtbaren Bereich geklemmt.
    const pinVec = new THREE.Vector3();
    const pinScreen = (anchor, w, h) => {
      pinVec.copy(anchor).project(camera);
      // Stecknadeln bleiben im Bild, auch wenn ihr Ankerpunkt weit außerhalb liegt -
      // seit die Insel größer sein darf als das Bild, ist das der Normalfall und nicht
      // mehr die Ausnahme: die geklemmte Nadel zeigt, in welcher Richtung die Zone
      // liegt. Der Rand ist auf die Nadel zugeschnitten (PIN_EDGE_PX, halbe
      // Nadelbreite): früher lag er bei 72px für die breiten Namensschilder - der schob
      // die äußeren Schilder so weit nach innen, dass sie auf den Gebäuden landeten,
      // die sie beschriften sollten.
      const x = Math.min(w - PIN_EDGE_PX, Math.max(PIN_EDGE_PX, ((pinVec.x + 1) / 2) * w));
      const y = Math.min(h - PIN_BOTTOM_PX, Math.max(PIN_TOP_PX, ((1 - pinVec.y) / 2) * h));
      return { x, y };
    };

    // Beim Mount und bei Größenänderungen: Positionen über React setzen, damit die
    // Nadeln schon im ersten Bild richtig stehen.
    const updateLabels = () => {
      const r = container.getBoundingClientRect();
      const next = {};
      Object.entries(zonesObj.labelAnchors).forEach(([id, anchor]) => {
        next[id] = pinScreen(anchor, r.width, r.height);
      });
      setLabelPos(next);
    };

    // Pro Frame: nur noch Pixel ins DOM schreiben, ohne React.
    const placePins = () => {
      const w = lastSize.w;
      const h = lastSize.h;
      const version = viewVersion + zonesObj.getLayoutVersion();
      if (version === pinVersion) return;
      pinVersion = version;
      pinRefs.current.forEach((el, id) => {
        const anchor = zonesObj.labelAnchors[id];
        if (!el || !anchor) return;
        const pos = pinScreen(anchor, w, h);
        el.style.left = `${Math.round(pos.x)}px`;
        el.style.top = `${Math.round(pos.y)}px`;
      });
    };

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      fitCamera(w, h);
      updateLabels();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Zeigereingabe: EIN Finger schiebt die Insel oder tippt (unter DRAG_THRESHOLD_PX
    // Bewegung), ZWEI Finger zoomen, das Mausrad zoomt. Der Tap darf erst beim Loslassen
    // ausgelöst werden - sonst feuerte jeder Schiebe-Anfang einen Klick auf den Schrank.
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const pointers = new Map(); // pointerId -> { x, y }
    let dragged = false;
    let pinchDist = 0;

    const tapAt = (clientX, clientY) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = ((clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -((clientY - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const furnaceHit = raycaster.intersectObjects(furnaceObj.hitMeshes, false);
      if (furnaceHit.length > 0) {
        if (!stateRef.current.isOverheated) {
          furnaceObj.pulse();
          stateRef.current.handleTapAGI({ clientX, clientY });
        }
        return;
      }
      // Nur freigeschaltete Zonen öffnen ein Kaufpanel: unsichtbare Platten liegen
      // weiterhin im Raycast-Array, und der "???"-Platzhalter hat nichts zu verkaufen
      // (siehe buildZones.js, userData.clickable).
      const zoneHit = raycaster
        .intersectObjects(zonesObj.hitMeshes, false)
        .find((h) => h.object.visible && h.object.userData.clickable);
      if (zoneHit) {
        setSelectedZone(zoneHit.object.userData.zoneId);
      }
    };

    const pointerCenter = () => {
      let x = 0;
      let y = 0;
      pointers.forEach((p) => {
        x += p.x;
        y += p.y;
      });
      return { x: x / pointers.size, y: y / pointers.size };
    };

    const onPointerDown = (e) => {
      if (e.button !== undefined && e.button > 0) return;
      // Capture kann fehlschlagen (fremder/abgelaufener Zeiger). Das darf das Schieben
      // nicht verhindern - ohne Capture geht es nur schlechter, nicht gar nicht.
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* ignoriert */
      }
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, ox: e.clientX, oy: e.clientY });
      if (pointers.size === 1) {
        dragged = false;
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
        dragged = true; // zwei Finger sind nie ein Tap
      }
    };

    const onPointerMove = (e) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      const r = canvas.getBoundingClientRect();
      const beforeCenter = pointerCenter();
      prev.x = e.clientX;
      prev.y = e.clientY;
      const afterCenter = pointerCenter();

      if (pointers.size >= 2) {
        const [a, b] = [...pointers.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchDist > 0 && dist > 0) {
          const mid = afterCenter;
          zoomAt(dist / pinchDist, mid.x - r.left, mid.y - r.top, r);
        }
        pinchDist = dist;
      }

      // Schieben: Bildpixel in Weltmaß umrechnen und die Kamera gegenläufig versetzen.
      const dx = afterCenter.x - beforeCenter.x;
      const dy = afterCenter.y - beforeCenter.y;
      if (dx || dy) {
        view.panX -= (dx / r.width) * 2 * halfViewW();
        view.panY += (dy / r.height) * 2 * halfViewH();
        applyView();
      }
      // Tap oder Schieben? Entschieden wird am Abstand zum Startpunkt, nicht an der
      // letzten Bewegung: ein Finger zittert beim Tippen, und jedes Zittern als
      // Schieben zu werten würde das Tippen auf den Schrank unmöglich machen.
      if (Math.hypot(prev.x - prev.ox, prev.y - prev.oy) > DRAG_THRESHOLD_PX) dragged = true;
    };

    const onPointerUp = (e) => {
      const p = pointers.get(e.pointerId);
      if (!p) return;
      pointers.delete(e.pointerId);
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* ignoriert */
      }
      if (pointers.size < 2) pinchDist = 0;
      if (pointers.size === 0 && !dragged && e.type === 'pointerup') {
        tapAt(e.clientX, e.clientY);
      }
    };

    const onWheel = (e) => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * ZOOM_STEP), e.clientX - r.left, e.clientY - r.top, r);
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // Kontextverlust: Loop stoppen, nach Wiederherstellung alles neu bauen.
    const onLost = (e) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
    };
    const onRestored = () => setRebuild((n) => n + 1);
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    // Loop, pausiert bei verstecktem Tab oder wenn die Canvas aus dem Viewport ist.
    let raf = 0;
    let running = true;
    let visible = true;
    let last = performance.now();
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (!running || !visible) return;
      // Math.max(0, ...): der rAF-Zeitstempel ist der FRAMEBEGINN und kann älter sein
      // als ein performance.now(), das danach in einem Observer-Callback (Sichtbarkeit,
      // IntersectionObserver) in `last` geschrieben wurde. Ohne die Klammer wird dt in
      // genau diesen Frames negativ, alle Phasen-Zähler laufen rückwärts unter null -
      // und getPointAt() der Datenleitung wirft bei negativem u (siehe buildDataLine.js).
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      // Rein visueller Debug-Haken für Screenshots: window.__campusDebug = { heatStage,
      // heatPct, smokeTier, mood } überschreibt NUR die Anzeige, nie den Spielzustand.
      // Wird in der Loop gelesen, damit er auch ohne React-Render greift.
      const dbg = window.__campusDebug;
      if (dbg) window.__campusApi = apiRef.current;
      const dbgZones =
        dbg && dbg.buildings
          ? deriveZones({
              buildings: dbg.buildings,
              boughtGreenwashingLayoffs: dbg.boughtGreenwashingLayoffs || [],
              damagedBuildingId: dbg.damaged || null,
            })
          : null;
      const s = dbg
        ? {
            ...stateRef.current,
            zones: dbgZones || stateRef.current.zones,
            // Die Insel wächst auch im Debug-Modus mit - sonst zeigte ein Screenshot
            // vierzig Praktikanten auf der Startinsel.
            island: dbgZones ? deriveIsland(dbgZones) : stateRef.current.island,
            hypeTier: dbg.hypeTier || stateRef.current.hypeTier,
            theme: dbg.theme || stateRef.current.theme,
            furnace: { ...stateRef.current.furnace, ...dbg },
            mood: dbg.mood || stateRef.current.mood,
            isOverheated: dbg.heatStage ? dbg.heatStage === 'meltdown' : stateRef.current.isOverheated,
          }
        : stateRef.current;

      if (s.theme !== appliedTheme) {
        appliedTheme = s.theme;
        palette = getPalette3d(s.theme);
        island.applyPalette(palette);
        furnaceObj.applyPalette(palette);
        zonesObj.applyPalette(palette);
        campus.applyPalette(palette);
        environment.applyPalette(palette);
        deliveryTruck.applyPalette(palette);
        hemi.color.setHex(palette.hemiSky);
        hemi.groundColor.setHex(palette.hemiGround);
        sun.color.setHex(palette.sun);
        container.style.background = palette.skyCss;
      }

      const targetScale = (s.island && s.island.scale) || 1;
      island.update(dt, now / 1000, s.reduced, targetScale);
      const grown = island.getScale();
      islandExtent = 24 * grown;
      furnaceObj.update(s, dt, now / 1000, palette);
      zonesObj.update(s.zones, s.selectedZone, palette, { dt, t: now / 1000, reduced: s.reduced, tickerText: s.tickerText });
      campus.update(s.hypeTier, now / 1000, s.reduced, s.zones, grown);
      deliveryTruck.update({
        isOverheated: s.isOverheated,
        overheatedAt: s.overheatedAt,
        now,
        dt,
        reduced: s.reduced,
        palette,
      });
      // Wie weit hat der Campus die Kulisse am Feldrand schon verdrängt: an dieselbe
      // Hype-Stufe (1 bis 10) gekoppelt wie die Campus-Ausbaustufen oben - keine eigene
      // Spielzahl nötig, und anders als die Inselgröße (campusLayout.js) tatsächlich bei
      // 1 erreichbar, statt an den Grundstücks-Obergrenzen der Zonen hängenzubleiben.
      environment.update((s.hypeTier - 1) / 9, now / 1000, dt, s.reduced);
      // Wächst die Insel, wird der eingepasste Ausschnitt neu gerechnet - bis zur
      // Obergrenze VIEW_FIT_MAX. Danach bleibt der Maßstab stehen und die Insel ragt
      // über den Bildrand hinaus; ab da ist Schieben und Zoomen dran.
      if (lastSize.w && Math.abs(grown - viewScale) > 0.01) {
        viewScale = Math.min(grown, VIEW_FIT_MAX);
        fitCamera(lastSize.w, lastSize.h);
      }
      // Stecknadeln: Position direkt im DOM, jedes Bild. Über React wäre das beim
      // Schieben ein Re-Render pro Frame.
      if (lastSize.w) placePins();
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    const onVisibility = () => {
      running = !document.hidden;
      last = performance.now();
    };
    document.addEventListener('visibilitychange', onVisibility);
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((en) => en.isIntersecting);
      last = performance.now();
    });
    io.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const list = Array.isArray(obj.material) ? obj.material : [obj.material];
          list.forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
      apiRef.current = null;
    };
  }, [rebuild]);

  const selectedDef = selectedZone ? ZONES_DATA.find((z) => z.id === selectedZone) : null;
  const selectedState = selectedZone ? zones.find((z) => z.id === selectedZone) : null;

  return (
    <div
      ref={containerRef}
      className={`campus-scene campus-scene--${mood} ${glitch ? 'glitch-mode' : ''}`}
    >
      <canvas ref={canvasRef} className="campus-scene__canvas" aria-label={tr('sceneAriaLabel')} role="img" />

      {/* Zonen-Stecknadeln als HTML über der Canvas, Position per Projektion.
          Was noch nicht freigeschaltet ist, bekommt gar keine Nadel - genau eine Zone
          weiter steht die "?"-Nadel als Platzhalter (dieselbe Regel wie im Shop,
          siehe utils/buildingUnlock.js).

          Bewusst KEIN ausgeschriebener Zonenname mehr in der Szene: die alten breiten
          Namensschilder ("GROSSRAUMBÜRO" & Co.) waren auf dem Handy breiter als die
          halbe Insel und lagen dauerhaft über genau den Gebäuden, die sie benannten.
          Jetzt trägt die Nadel nur Icon + Anzahl; der Name steht dort, wo Platz für ihn
          ist - im Kaufpanel, das ein Tipp auf die Nadel öffnet (und auf dem Desktop
          zusätzlich als Tooltip am title-Attribut). */}
      {zones.map((z) => {
        const pos = labelPos[z.id];
        if (!pos || (!z.revealed && !z.teaser)) return null;

        if (z.teaser) {
          return (
            <span
              key={z.id}
              ref={setPinRef(z.id)}
              className="zone-pin zone-pin--teaser"
              style={{ left: pos.x, top: pos.y }}
              title={tr('lockedEngineTierDesc')}
            >
              <span className="zone-pin__icon" aria-hidden="true">?</span>
            </span>
          );
        }

        const { Icon, accent } = getZoneVisual(z.id);
        const name = tr(`zone_${z.id}_name`);
        const isNew = newZoneIds.has(z.id);

        return (
          <button
            key={z.id}
            ref={setPinRef(z.id)}
            type="button"
            className={`zone-pin ${z.unlocked ? '' : 'zone-pin--locked'} ${selectedZone === z.id ? 'is-selected' : ''}`}
            style={{ left: pos.x, top: pos.y, '--zone-accent': accent }}
            onClick={() => setSelectedZone(z.id)}
            aria-label={isNew ? `${name} - ${tr('sceneNewBadge')}` : name}
            title={name}
          >
            <span className="zone-pin__icon" aria-hidden="true">
              <Icon className="zone-pin__glyph" />
            </span>
            {z.unlocked && <span className="zone-pin__count">{z.population}</span>}
            {/* "Hier ist gerade etwas Neues bezahlbar" - der einzige Weg, von der Insel
                aus überhaupt mitzubekommen, dass eine Stufe aufgegangen ist. Als Punkt
                statt als NEU-Schild: der Text hätte die Nadel wieder so breit gemacht
                wie die alten Schilder. */}
            {isNew && <span className="zone-pin__new" aria-hidden="true" />}
          </button>
        );
      })}

      {/* Zurück zur Übersicht: erscheint erst, wenn geschoben oder gezoomt wurde.
          Auf einer Insel, die größer ist als der Bildausschnitt, ist das der einzige
          verlässliche Weg zurück zum Schrank. */}
      {viewMoved && (
        <button
          type="button"
          className="scene-recenter"
          onClick={() => apiRef.current && apiRef.current.resetView()}
          aria-label={tr('sceneResetView')}
          title={tr('sceneResetView')}
        >
          <Crosshair className="scene-recenter__glyph" aria-hidden="true" />
        </button>
      )}

      {selectedDef && (
        <ZoneBuyPanel
          zoneDef={selectedDef}
          zoneState={selectedState}
          valuation={valuation}
          totalValuation={totalValuation}
          buildings={buildings}
          buyBuilding={buyBuilding}
          buyMode={buyMode}
          setBuyMode={setBuyMode}
          boughtUpgrades={boughtUpgrades}
          buyUpgrade={buyUpgrade}
          boughtGreenwashingLayoffs={boughtGreenwashingLayoffs}
          buyGreenwashingLayoff={buyGreenwashingLayoff}
          onClose={() => setSelectedZone(null)}
          t={t}
        />
      )}
    </div>
  );
});
