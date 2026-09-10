# Token-Furnace-Campus: isometrisches Low-Poly-Diorama

Das Spielfeld wird ein einziges, wachsendes Bild: eine schwebende Insel im Stil von
Egg Inc, in der Mitte der Schmelzofen, rundherum die fünf Zonen des KI-Startups.
Rein visuell. Spielprinzip, Zahlen und Punktesystem bleiben unverändert.

Stand: alle sieben Phasen gebaut. Die 3D-Insel ist der einzige Spielbildschirm mit
WebGL; ohne WebGL läuft die frühere Ansicht (Kopfzeile, Tabs, GPU-Button, Icon-Liste)
als Fallback weiter. Das SVG-Zwischengerüst ist entfernt.

## Stand in DIESEM Repo (token-furnace.com)

Das Konzept oben stammt aus dem CrazyGames-Repo, wo die Szene den normalen Spiel-
bildschirm ersetzt. Hier ist sie vorerst NUR eine versteckte Testseite:

* Erreichbar unter `/voxel`, nirgends verlinkt, nicht in `sitemap.xml`, per
  `robots.txt` gesperrt und mit `noindex` ausgeliefert (siehe `scripts/prerender.mjs`).
* Eigene Wurzelkomponente `src/VoxelApp.jsx`, eingehängt in `src/main.jsx`. `App.jsx`
  (das Spiel unter `/play`) und die Content-Website sind unverändert - die 3D-Ansicht
  ist dort weder eingebaut noch als Fallback vorgesehen.
* Gleiche Spiellogik und derselbe Spielstand wie `/play` (`useGameStore`), nur eine
  andere Oberfläche.
* Die Schubladen laufen über `activeTab`, nicht über die URL (`useRoutes={false}`):
  die Tab-Routen aus `routes.js` zeigen auf `/play/*` und würden die Testseite
  verlassen.
* Ohne WebGL gibt es hier keinen Fallback auf die alte Ansicht, sondern nur einen
  Hinweis mit Link auf `/play` - die alte Ansicht ist ja genau das, was diese Seite
  nicht zeigen soll.
* CSS liegt getrennt in `src/scene3d.css` und wird nur von `VoxelApp` geladen, damit
  es nicht in den Bundles der anderen Seiten landet.
* **Progressive Freischaltung statt kompletter Insel.** Im CrazyGames-Repo liegen alle
  fünf Zonen von Anfang an sichtbar da (gesperrte nur abgedunkelt). Hier gilt dieselbe
  Regel wie im Shop (`src/utils/buildingUnlock.js`): eine Zone erscheint erst, wenn
  mindestens eine ihrer Engines freigeschaltet ist, genau eine Zone weiter steht ein
  `???`-Platzhalter ohne Namen und ohne Kaufpanel, alles Dahinter wird gar nicht
  gezeichnet. Das Zonen-Kaufpanel listet ebenfalls nur freigeschaltete Engines plus
  denselben Platzhalter - sonst wäre die Freischaltung über den Umweg Insel ausgehebelt.
* **NEU-Hinweis auf dem Spielplan.** Weil die Insel jetzt Stufen verbirgt, braucht sie
  eine Gegenmeldung: ein Zonenschild trägt ein pulsierendes `NEU`, sobald dort eine noch
  nie gebaute Engine freigeschaltet UND bezahlbar ist (`getNewZoneIds` in
  `src/utils/sceneState.js`). Der Preis gehört bewusst ins Kriterium - ohne ihn stünde
  nach jedem Kauf sofort wieder ein NEU an der nächsten Stufe.

## Entscheidungen

| Frage | Entscheidung |
|---|---|
| Perspektive | Isometrisches Diorama, orthografische Kamera, ca. 35 Grad Neigung, 45 Grad gedreht |
| Gliederung | 5 Zonen, jede Engine ein eigener Prop-Typ innerhalb ihrer Zone |
| Renderer | Three.js, Low-Poly ohne Texturen, Flat Shading, Vertex- bzw. Materialfarben |
| Ohne WebGL | Alte Ansicht (Header, Tabs, GPU-Button, Icon-Liste) bleibt als Fallback, ohne Meme-Bild |
| Licht | Ein Richtungslicht mit Schattenkarte plus Hemisphärenlicht, Tageslicht |
| Stimmung | Insel im Tageslicht, Bedienpanels als dunkles Glas darüber |
| Kaufen | Direkt aus der Szene per Klick auf eine Zone, Shop-Tab bleibt bestehen |
| Meme-Bilder | Nicht in der Szene |
| Tilt-Shift | Nicht als Post-Processing (zu teuer auf Mobile), stattdessen weiche Vignette am Inselrand |
| Bildschirm | Eine Vollbild-Szene, keine Kopf- und Fußzeile mehr. Zähler und wenige Buttons liegen als Overlay auf der Szene |
| Panels | Shop, Statistik, Einstellungen, Belohnungen öffnen als Schublade über der Szene, die Szene bleibt sichtbar |
| Tippen | Ofen in der Szene und ein großer Feuer-Button unten lösen dieselbe Aktion aus |
| Sound | Eigene Phase nach der Grafik, nicht Teil dieses Konzepts |
| Gameplay-Ideen (Halten, Forschung, Pivots, Sweet Spot) | Nicht Teil dieses Konzepts |

## Look

**Palette** (aus dem Konzept übernommen, in `sceneTheme.js` gepflegt):

| Rolle | Farbe |
|---|---|
| Gras | `#48BB78` |
| Wege, Förderband-Rand | `#E2E8F0` |
| Tech-Fassaden | `#F7FAFC` |
| Daten, Neon | Türkis `#22D3EE` |
| Hitze, Ofen | Rotorange `#F97316` |
| Kapital, Hype | Gold `#FACC15` |
| Inselsockel | Erdbraun, unten dunkler, mit türkisen Leiterbahn-Linien |
| Himmel | Hellblau-Verlauf, zwei bis drei Low-Poly-Wolken |

**Geometrie:** nur Quader, Zylinder, Kegel, Kugeln, Ikosaeder. Runde Kanten über
leicht abgeschrägte Boxen. Keine Texturen, keine Normal Maps. Einzige Ausnahme: die
beiden LED-Tafeln am Turm (Ticker, AGI-Uhr) sind Canvas-Texturen, weil Text nicht
anders geht. Jedes Objekt hat
maximal einige hundert Dreiecke.

**SEC-Prospekt-Modus:** dieselbe Szene, Materialien getauscht: Sepia-Weiß-Flächen,
dunkle Drahtgitter-Kanten, Himmel Pergament. Ein Materialset pro Theme, sonst nichts.

**Juiciness (rein visuell):**
- Tap auf den Ofen: Ofen pulsiert kurz (Scale 1.0 auf 1.06 und zurück), Flammenstoß
  und Funkenschauer aus dem Ofenmund.
- Fliegende Zahlen bleiben wie heute (`ClickParticles`), nur über der Canvas.
- Kauf einer Engine: der neue Prop wächst mit Überschwinger aus dem Boden.
- Rauchdichte und Ofenglut folgen VPS und Hitze wie bereits in `sceneState.js` abgeleitet.

## Bildschirmaufbau

Vorbild ist das Referenzbild: oben der Zähler, unten wenige Buttons, dazwischen nur
Szene. Kopfzeile, Newsticker-Leiste, Tab-Leiste und das dreispaltige Desktop-Layout
entfallen. Handy und Desktop bekommen denselben Aufbau, auf dem Desktop ist die
Insel nur größer und die Schublade liegt rechts statt unten.

```
+--------------------------------------------------+
| Startup-Name (klein, editierbar)   [DE] [?] [Teilen] |  <- Overlay oben
|                 VALUATION                          |
|              $2.500.000.000                        |
|      [Burn 0.2%/s] [Netto-VPS] [Hype 3/10]         |
|      ===== GPU-Hitze 62°C =========-------         |
|                                                    |
|                                                    |
|                  S Z E N E                         |
|         (Insel, Ofen, Zonen, Zonenschilder)        |
|                                                    |
|                                                    |
|  [ FEUERN ]   [ SHOP (3) ]   [Stats]  [Optionen]   |  <- Overlay unten
|              Werbebanner (nur wenn aktiv)          |
+--------------------------------------------------+
   darunter, nur Web-Build: SEO-Textblock, scrollbar
```

**Overlay oben** (transparent, Text mit weichem Schatten auf dem Himmel):
- Startup-Name klein links, editierbar wie heute. Rechts drei runde Buttons:
  Sprache, Handbuch, Teilen (Pitch Deck).
- Valuation groß in der Mitte, darunter drei Chips: Burn, Netto-VPS, Hype-Stufe.
  Slop-Zähler wandert in die Statistik.
- GPU-Hitze als schmaler Balken unter den Chips. Zusätzlich färbt der Ofen selbst.
- Newsticker: LED-Laufschrift auf dem Dach des Kapital-Turms (`utils/tickerText.js`
  liefert den Text für Tafel und HTML-Laufzeile). Die dünne Laufzeile oben gibt es nur
  noch im SVG-Fallback ohne WebGL.
- Golden-Meme-Banner, Toasts und Modals bleiben, wie sie sind, sie liegen ohnehin
  über allem.

**Overlay unten:**
- **FEUERN**, groß, links: löst `handleTapAGI` aus, identisch zum Tap auf den Ofen.
  Ein Daumen-Button ist auf dem Handy ergonomischer als ein Ziel in der Bildmitte.
  Die fliegenden Zahlen starten trotzdem am Ofen. Bei Überhitzung zeigt der Button
  die Abkühlung und den Kühl-Werbespot an, der heute in der roten Warnbox steckt.
- **SHOP**, groß, rechts daneben: Engines, Upgrades, Corporate, Buzzwords. Badge
  mit der Zahl leistbarer Upgrades wie heute in der Tab-Leiste.
- **Statistik** und **Optionen**, klein: Statistik enthält Stats, Logs, Achievements.
  Optionen enthält Belohnungs-Werbung, Spielstand, Theme, Rechtliches, Werbefrei-Kauf.
- Werbebanner darunter, nur wenn Werbung aktiv ist. Das native iOS-Banner hat kein
  DOM-Element und bleibt unberührt.

**Schubladen statt Tabs:** Jeder Button öffnet eine Schublade über der Szene, Handy von
unten bis etwa 70 Prozent Höhe, Desktop von rechts mit 420 Pixel Breite. Die Szene
bleibt dahinter sichtbar und läuft weiter. Die bestehenden Tab-Komponenten
(`StoreTab`, `StatsTab`, `MiscTab`) werden unverändert in die Schubladen gesetzt.

**Was erhalten bleibt, obwohl es unsichtbar wird:**
- Die Tab-URLs (`/shop`, `/statistik`, `/einstellungen`) bleiben und öffnen die
  jeweilige Schublade. Sie sind der Grund, warum Google die Seite indexiert.
- Der SEO-Textblock bleibt im Web-Build unter der Vollbild-Szene, scrollbar.
  Im Portal-Build und in der iOS-App gibt es ihn wie heute nicht.
- Die Werbeflächen bleiben als Slots, auch wenn Web-Werbung gerade aus ist.
- Der SEC-Prospekt-Modus färbt Overlay und Schubladen mit, wie heute die Kopfzeile.

## Die Insel

Ein Raster von 24 x 24 Einheiten, Ursprung in der Mitte. Der Ofen steht auf dem
Ursprung. Blickrichtung: die Kamera schaut von vorne links, vorne ist +Z.

```
                   hinten
     +----------------------------------+
     |  SERVER-SILOS      KAPITAL-TURM  |
     |  (basement)        (tower)       |
     |                                  |
     |          ENDGAME hängt über der  |
     |          hinteren Kante / Himmel |
     |                                  |
     |              [OFEN]              |
     |                                  |
     |  GROSSRAUMBÜRO     BÜHNE&PRESSE  |
     |  (office)          (stage)       |
     +----------------------------------+
                   vorne
```

| Zone | Ankerpunkt (x, z) | Grundfläche |
|---|---|---|
| Ofen | 0, 0 | 5 x 5 |
| office | -7, +6 | 8 x 7 |
| stage | +7, +6 | 8 x 7 |
| basement | -7, -6 | 8 x 7 |
| tower | +7, -6 | 8 x 7 |
| endgame | 0, -10 sowie Luftraum über dem Ofen | 14 x 3 |

Vom Büro führt eine transparente Datenleitung über die Tische zum Ofensockel, durch
die Tokens rasen (instanziert, Menge nach Zonenstufe). Die Server-Silos bekommen in
Phase 4 eine zweite Leitung derselben Art.

## Zonen und Props

| Zone | Engine | Prop (Low-Poly) | Max. Objekte |
|---|---|---|---|
| office | Prompt-Praktikant | Person am schiefen Tisch, Monitor, Tastatur, Tasse, tippende Arme, hängende Schultern | 12 |
| office | Prompt Engineer | Person am breiteren Tisch mit zwei Monitoren, aufrechte Haltung, schnelleres Tippen | 8 |
| office | Chatbot-Widget | Schwebende Sprechblasen mit pulsierenden Punkten über den Tischen | 10 |
| office | Datenleitung | Transparente Röhre vom Büro zum Ofensockel, Tokens rasen hindurch, Menge nach Zonenstufe | 40 Tokens |
| basement | GPU-Rack | Schmaler Turm mit vier blinkenden LED-Streifen | 14 |
| basement | Rechenzentrum | Weißer Zylinder mit zwei Türkis-Ringen und Band, Lüfter oben dreht | 8 |
| basement | Token-Burner | Kubus mit wabernd orangem Kern | 8 |
| basement | Web-Scraper | Drohne mit vier Rotoren und rotem Auge, kreist über den Silos | 12 |
| basement | Grauer-Markt-RZ | Dunkles Silo unter grüner Plane hinter Zaun, links am Rand | 6 |
| basement | Datenleitung | Zweite Röhre zum Ofen, kommt an dessen linker, sichtbarer Seite an | 40 Tokens |
| stage | Keynote-Bühne | Podest mit Pult, leuchtender Rückwand mit Gold-Balkendiagramm; jede weitere Bühne ein Scheinwerfer mit schwenkendem Lichtkegel | 4 |
| stage | Thought Leader | Person mit Krawatte und Mikrofon, gestikuliert, vordere Reihe auf der Bühne | 10 |
| stage | Hype-Journalist | Person mit Kamera vor dem Gesicht, Blitz ploppt zufällig auf | 10 |
| stage | Recyceltes Pitch Deck | Weiße Blätter, die über der Bühne in Schleifen segeln | 14 |
| stage | Regulierungs-Lobbyist | Person mit Aktenkoffer am Sendemast mit Schüssel, rotem Blinklicht und Sendewellen | 6 |
| tower | VC-Firma | Glasturm, ein Stockwerk pro Objekt, Gold-Bänder, Lobby immer da | 6 |
| tower | Pivot-Startup | Container am Turmfuß, Logo wechselt alle paar Sekunden die Farbe | 8 |
| tower | AGI-Countdown-Uhr | LED-Tafel auf dem Dach, Countdown springt alle 25 Sekunden zurück | 1 |
| tower | Newsticker | LED-Laufschrift auf dem Dach mit dem Text der bisherigen HUD-Laufzeile | 1 |
| endgame | Kleiner Atomreaktor | Kühlturm an der hinteren Kante mit weißem Dampf, je einer links und rechts | 4 |
| endgame | 3D-Welt-Geisterstadt | Hologramm-Skyline aus türkisen Glasquadern auf einem Projektor, flimmert | 6 |
| endgame | Selbstbewusste Excel-Tabelle | Schwebendes Gitterblatt mit zwei Augen, dreht sich, hoch über den Silos | 6 |
| endgame | Die Singularity | Schwarze Kugel mit zwei Akkretionsringen im Rauch über dem Schlot, Trümmer kreisen hinein | 1 |

Über die Maximalzahl hinaus wächst nur das Zonenschild (Zahl) und die Ausbaustufe.

## Ausbaustufen

Zwei unabhängige Achsen, beide bereits im Gerüst angelegt:

1. **Campus-Stufe, inselweit**, gekoppelt an die vorhandene Hype-Stufe (1 bis 10),
   siehe `buildCampus.js`: Garage (1 bis 2) nackte Insel; Co-Working (3 bis 5) Wege
   von den freigeschalteten Zonen zum Ofen und sechs Bäume; Container-Dorf (6 bis 8)
   zehn Bäume und schwach leuchtender Inselrand; Hyperscale (9 bis 10) vierzehn Bäume,
   Rand voll, türkise Leiterbahnen im Fels, acht Lichtdrohnen um die Insel.
2. **Zonen-Stufe** aus dem Bestand der Zone (`tier` 0 bis 7 in `sceneState.js`):
   steuert, wie dicht und hoch die Props stehen.

## Zustände, die die Szene zeigt

| Zustand | Quelle | Wirkung |
|---|---|---|
| Hitze cold bis critical | GPU-Temperatur | Ofenmauer grau bis rot glühend, Flammenhöhe |
| meltdown | Overheat-Lock | Ofen dunkel, Absperrband, Kühlnebel, Klick gesperrt |
| Rauchstufe 0 bis 7 | VPS, logarithmisch | Anzahl und Größe der Rauchwölkchen |
| surge | Power Click | Türkise Blitze zucken um den Schlot, alle 80 ms neu gewürfelt |
| golden | Golden Meme | Goldrauch, Goldflammen, Goldmünzen regnen über die Insel |
| bubble | Bubble Burn | Statt Rauch steigen Seifenblasen auf und platzen oben |
| glitch | Halluzination | Kurzes Kanal-Versatz-Flackern der ganzen Insel (CSS auf dem Container) |
| damaged | Black Swan | Zonenplatte blinkt rot, dunkler Rauch über der Zone, 8 Sekunden |
| greenwashed | Corporate Action | Drei Plastikpflanzen in Töpfen und grünes Banner mit Siegel an der Zone |
| laidOff | Corporate Action | Umzugskartons in der Zonenecke; im Büro fehlt jede dritte Person, der Stuhl bleibt |
| blueprint | SEC-Theme | Sepia-Materialset über applyPalette() in allen Bauern, Himmel Pergament |

## Debug-Haken für Screenshots

`window.__campusDebug = { heatStage, heatPct, smokeTier, mood, buildings }` überschreibt
in der Render-Loop NUR die Anzeige (Ofen und Zonen-Bestand), nie den Spielzustand. Solange er gesetzt ist,
liegt die Szenen-API unter `window.__campusApi`. Gedacht für Screenshots aller Stufen
ohne stundenlanges Spielen; kein Cheat, weil nichts davon in den Store zurückfließt.

## Technik

- **Ein React-Wrapper** (`CampusScene.jsx`) hält Canvas, Renderer, Kamera, Licht und
  Render-Loop. Spielzustand kommt per Props, wird in einen Ref geschrieben und in der
  Loop gelesen. Kein React-Re-Render pro Frame.
- **Three.js wird lazy geladen** wie die Modals, damit Shop und Statistik nicht auf den
  3D-Chunk warten. Budget: rund 150 KB gzip zusätzlich.
- **Instancing** für Praktikanten, Rauch, Blätter, Drohnen. Alles Wuselnde ist ein
  InstancedMesh mit Matrix-Update pro Frame, nie einzelne Meshes.
- **Interaktion per Raycast**: Ofen löst `handleTapAGI(event)` aus (Clientkoordinaten
  bleiben erhalten, die fliegenden Zahlen brauchen sie), Zonen öffnen `ZoneBuyPanel`.
- **Render nur bei Bedarf**: Loop läuft mit 60 FPS, solange die Szene sichtbar und der
  Tab aktiv ist. Bei `prefers-reduced-motion` stehen Rauch und Wusler still.
- **WebGL-Kontextverlust** wird abgefangen, Szene wird neu aufgebaut. Ohne WebGL fällt
  die Ansicht auf das bisherige Button-Layout zurück.
- **Mobile Portrait**: Insel füllt die Breite, Kamera etwas höher, damit die vorderen
  Zonen nicht unter der Tab-Leiste liegen. Desktop: Insel über die volle Breite,
  Panels darunter.
- Der SEO-Textblock bleibt, eine Canvas ist für Crawler leer.

## Dateien

| Datei | Aufgabe |
|---|---|
| `src/platform/webgl.js` | Einmalige WebGL-Erkennung, entscheidet Shell oder Fallback |
| `src/components/shell/GameShell.jsx`, `HudTop.jsx`, `HudBottom.jsx`, `Drawer.jsx` | Vollbild-Shell mit Overlays und Schubladen |
| `src/components/scene3d/CampusScene.jsx` | React-Wrapper: Renderer, Kamera, Licht, Loop, Raycast, Beschriftungen, Debug-Haken |
| `src/components/scene3d/buildIsland.js`, `buildFurnace.js`, `buildCampus.js` | Insel, Ofen, Campus-Stufen |
| `src/components/scene3d/buildOffice.js`, `buildBasement.js`, `buildStage.js`, `buildTower.js`, `buildEndgame.js` | Die fünf Zonen |
| `src/components/scene3d/buildZones.js` | Platten, Klickziele, Schild-Anker, Zonen-Effekte, hostet die Zonen-Bauer |
| `src/components/scene3d/buildDataLine.js`, `buildPeople.js` | Gemeinsame Bausteine: Datenleitung, Personen |
| `src/components/scene3d/ZoneBuyPanel.jsx` | Kaufen aus der Szene, Preise über dieselben Helfer wie der Shop |
| `src/components/scene3d/palette.js` | Materialfarben je Theme, Himmel als CSS-Verlauf |
| `src/data/zonesData.js` | Zonen-Anker, Grundflächen, Engine-Zuordnung, `maxProps` |
| `src/utils/sceneState.js` | Spielzahlen zu Grafik-Stufen, reine Funktionen |
| `src/utils/tickerText.js` | Ticker-Text für LED-Tafel und HTML-Laufzeile (Fallback) |
| Store: `lastBlackSwan` | Rein visuelles Signal für den Schadensblitz, nicht gespeichert |
| `Header.jsx`, `NavBar.jsx`, `DesktopView.jsx`, `SlopTab.jsx`, `BuildingVisualGrid.jsx` | Nur noch im Fallback ohne WebGL |

## Bauphasen

Jede Phase endet mit Build, Lint und Screenshot auf Desktop und Handy.

| Phase | Inhalt | Fertig, wenn |
|---|---|---|
| 0 | Bildschirm-Shell: Vollbild-Container, Overlay oben mit Zähler, Overlay unten mit vier Buttons, Schubladen mit den bestehenden Tabs, Kopf- und Fußzeile hinter dem Schalter abgeschaltet. Als Szene läuft vorerst das SVG-Gerüst | Handy und Desktop zeigen denselben Aufbau, alle Tabs sind über Buttons und URLs erreichbar, Feuer-Button und Ofen erzeugen Slop |
| 1 | Three.js einbinden, Kamera, Licht, leere Insel mit Sockel und Himmel, Raycast auf einen Platzhalter-Ofen | Klick auf den Ofen erzeugt Slop, Szene läuft auf dem Handy flüssig |
| 2 | Ofen: Ziegelkegel, Feuerkammer, Hitzestufen, Rauchwölkchen, Meltdown, Tap-Puls | Alle fünf Hitzestufen und acht Rauchstufen sichtbar |
| 3 | Großraumbüro: Schreibtische, tippende Praktikanten und Engineers, Datenleitung mit Tokens, Widgets, Neonröhren | Bestand bis 12 Praktikanten und 8 Engineers sichtbar, Tokens laufen, Kauf aus der Szene funktioniert |
| 4 | Server-Silos, Bühne und Presse, Kapital-Turm mit Newsticker-Tafel | Alle 20 Engines haben einen Prop |
| 5 | Endgame-Zone, Singularität, Campus-Stufen nach Hype-Stufe | Insel verändert sich sichtbar über die Stufen |
| 6 | Events: surge, golden, bubble, glitch, Black Swan, Corporate Actions, SEC-Blaupause | Jeder Zustand aus der Tabelle oben ist sichtbar |
| 7 | Aufräumen: Schalter und SVG-Szene raus, Meme-Bilder raus, alte Ansicht bleibt als Fallback ohne WebGL | Kein toter Code, Bundle geprüft |

Alle sieben Phasen sind abgeschlossen. Sound wäre eine eigene Phase danach.
