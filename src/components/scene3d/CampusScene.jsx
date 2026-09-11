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
    activeEvent,
    powerClickActive,
    bubbleGlitchUntil,
    themeMode,
    lastBlackSwan,
    valuation,
    buyBuilding,
    buyMode,
    setBuyMode,
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

  stateRef.current = { zones, furnace, island: islandState, mood, theme, selectedZone, isOverheated, reduced, handleTapAGI, tickerText, hypeTier };

  // Bildschirmposition (Client-Koordinaten) eines Weltpunkts, für Beschriftungen und
  // für den Feuer-Button, dessen Partikel am Ofen starten sollen.
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
      getFurnaceScreenPos: () => (apiRef.current ? projectToClient(apiRef.current.furnace.corePosition) : null),
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

    // Orthografische Kamera von vorne links oben, ca. 32 Grad Neigung.
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
    camera.position.set(30, 26, 30);
    camera.lookAt(0, 0, 0);

    const hemi = new THREE.HemisphereLight(palette.hemiSky, palette.hemiGround, 0.9);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(palette.sun, 2.2);
    sun.position.set(-14, 26, 10);
    sun.castShadow = true;
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

    apiRef.current = { renderer, scene, camera, furnace: furnaceObj, zones: zonesObj };
    container.style.background = palette.skyCss;

    // Kamera-Ausschnitt: Hochformat füllt die Breite (Insel diagonal ~34 Einheiten),
    // Querformat die Höhe. Der Ursprung liegt bewusst ÜBER der Bildmitte: der
    // sichtbare Schwerpunkt der Insel (Sockel nach unten) soll etwa auf 45 Prozent
    // Höhe sitzen, damit weder Zähler noch Buttons über der Insel liegen.
    // `zoom` ist die aktuelle Inselgröße relativ zur Basis: die Kamera fährt mit dem
    // Wachstum zurück, sonst schöbe die größere Insel ihre äußeren Zonen aus dem Bild.
    let viewScale = 1;
    let lastSize = { w: 0, h: 0 };
    const fitCamera = (w, h) => {
      lastSize = { w, h };
      const aspect = w / Math.max(1, h);
      let halfW;
      let halfH;
      // Der Versatz nach unten ist bewusst eine feste Weltgröße (aus dem UNskalierten
      // Ausschnitt), keine Prozentzahl: er gleicht die Felsspitze unter der Insel aus,
      // und die wächst nicht mit. Als Anteil gerechnet schöbe er die Insel bei jedem
      // Wachstumsschritt weiter nach oben aus dem Bild.
      let shiftY;
      if (aspect < 1) {
        halfW = 17.5 * viewScale;
        halfH = halfW / aspect;
        shiftY = (17.5 / aspect) * 0.18;
      } else {
        halfH = 17 * viewScale;
        halfW = halfH * aspect;
        shiftY = 17 * 0.02;
      }
      camera.top = halfH - shiftY;
      camera.bottom = -halfH - shiftY;
      camera.left = -halfW;
      camera.right = halfW;
      camera.updateProjectionMatrix();
    };

    let layoutVersion = -1;
    const updateLabels = () => {
      const r = container.getBoundingClientRect();
      const next = {};
      Object.entries(zonesObj.labelAnchors).forEach(([id, anchor]) => {
        const v = anchor.clone().project(camera);
        // Stecknadeln bleiben im Bild, auch wenn ihr Ankerpunkt am Inselrand knapp
        // außerhalb liegt (Hochformat, äußere Zonen). Der Rand ist auf die Nadel
        // zugeschnitten (PIN_EDGE_PX, halbe Nadelbreite): früher lag er bei 72px für
        // die breiten Namensschilder - der schob die äußeren Schilder so weit nach
        // innen, dass sie auf den Gebäuden landeten, die sie beschriften sollten.
        const x = Math.min(r.width - PIN_EDGE_PX, Math.max(PIN_EDGE_PX, ((v.x + 1) / 2) * r.width));
        const y = Math.min(r.height - PIN_BOTTOM_PX, Math.max(PIN_TOP_PX, ((1 - v.y) / 2) * r.height));
        next[id] = { x, y };
      });
      setLabelPos(next);
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

    // Klick: Raycast auf Ofen und Zonenplatten. pointerdown statt click, damit
    // schnelles Tippen nicht am Klick-Timing hängt.
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onPointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      const r = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const furnaceHit = raycaster.intersectObjects(furnaceObj.hitMeshes, false);
      if (furnaceHit.length > 0) {
        if (!stateRef.current.isOverheated) {
          furnaceObj.pulse();
          stateRef.current.handleTapAGI({ clientX: e.clientX, clientY: e.clientY });
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
    canvas.addEventListener('pointerdown', onPointerDown);

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
        hemi.color.setHex(palette.hemiSky);
        hemi.groundColor.setHex(palette.hemiGround);
        sun.color.setHex(palette.sun);
        container.style.background = palette.skyCss;
      }

      const targetScale = (s.island && s.island.scale) || 1;
      island.update(dt, now / 1000, s.reduced, targetScale);
      const grown = island.getScale();
      furnaceObj.update(s, dt, now / 1000, palette);
      zonesObj.update(s.zones, s.selectedZone, palette, { dt, t: now / 1000, reduced: s.reduced, tickerText: s.tickerText });
      campus.update(s.hypeTier, now / 1000, s.reduced, s.zones, grown);
      // Wächst die Insel, muss die Kamera zurückfahren und die Stecknadeln müssen neu
      // projiziert werden. Beides bewusst nur bei spürbarer Änderung: sonst stünde hier
      // ein React-Render pro Frame, genau das, was diese Komponente vermeidet.
      if (lastSize.w && (Math.abs(grown - viewScale) > 0.01 || zonesObj.getLayoutVersion() !== layoutVersion)) {
        viewScale = grown;
        layoutVersion = zonesObj.getLayoutVersion();
        // Schattenkamera mitwachsen lassen, sonst enden die Schatten am alten Rand.
        sun.shadow.camera.left = -22 * grown;
        sun.shadow.camera.right = 22 * grown;
        sun.shadow.camera.top = 22 * grown;
        sun.shadow.camera.bottom = -22 * grown;
        sun.shadow.camera.updateProjectionMatrix();
        fitCamera(lastSize.w, lastSize.h);
        updateLabels();
      }
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

      {selectedDef && (
        <ZoneBuyPanel
          zoneDef={selectedDef}
          zoneState={selectedState}
          valuation={valuation}
          buildings={buildings}
          buyBuilding={buyBuilding}
          buyMode={buyMode}
          setBuyMode={setBuyMode}
          onClose={() => setSelectedZone(null)}
          t={t}
        />
      )}
    </div>
  );
});
