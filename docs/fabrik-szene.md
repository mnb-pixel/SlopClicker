# Token-Furnace-Campus: isometrisches Low-Poly-Diorama

Das Spielfeld wird ein einziges, wachsendes Bild: eine schwebende Insel im Stil von
Egg Inc, in der Mitte der Server-Schrank, rundherum die fünf Zonen des KI-Startups.
Rein visuell. Spielprinzip, Zahlen und Punktesystem bleiben unverändert.

**Der Schmelzofen ist ein Server-Schrank.** Die Mitte war anfangs ein Ziegel-Bienenkorb
mit Kamin, der von der ersten Sekunde an loderte. Ein Rechenzentrum brennt aber nicht,
es heizt sich hoch - und deshalb läuft die Hitzeskala jetzt andersherum: kalt, warm,
dampfend, qualmend, und erst ganz oben schlagen Flammen aus dem Dachschlitz (siehe
"Die Mitte: der Server-Schrank"). Der Spielzustand heißt im Code weiter `furnace`, und
das Spiel weiter Token Furnace - das ist der Markenname, nicht die Grafik.

**Das Spielfeld wächst mit - über den Bildrand hinaus.** Insel und Zonenplatten sind
nicht mehr fest: Engines mit `plot` (bisher Praktikanten und Prompt Engineers) füllen
ein Gebäude bis zur Kapazität, danach entsteht das nächste NEBENAN; Zonen ohne eigenes
Grundstücks-Layout bekommen Anbauhallen neben ihrer Grundfläche. Stoßen die äußersten
Gebäude an den Rand, wächst die Insel eine Stufe - bis über das hinaus, was auf einen
Bildschirm passt. Ab da zoomt die Kamera nicht weiter heraus, sondern der Spieler
schiebt und zoomt selbst (siehe "Grundstücke und Inselwachstum" und "Kamera").

Stand: alle sieben Phasen gebaut, dazu der Umbau auf Server-Schrank und wachsendes
Spielfeld. Die 3D-Insel ist der einzige Spielbildschirm mit
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
  eine Gegenmeldung: eine Zonen-Stecknadel trägt einen pulsierenden Punkt, sobald dort
  eine noch nie gebaute Engine freigeschaltet UND bezahlbar ist (`getNewZoneIds` in
  `src/utils/sceneState.js`). Der Preis gehört bewusst ins Kriterium - ohne ihn stünde
  nach jedem Kauf sofort wieder ein NEU an der nächsten Stufe.
* **Stecknadeln statt Namensschilder.** Die erste Fassung hängte den ausgeschriebenen
  Zonennamen über die Insel (`GROSSRAUMBÜRO`, `SINGULARITÄTS-HORIZONT`). Auf dem Handy
  war ein solches Schild breiter als die halbe Insel und lag dauerhaft über genau den
  Gebäuden, die es benennen sollte. Ersetzt durch kleine Stecknadeln am Außenrand der
  Zone: Icon in der Zonenfarbe plus Anzahl, mehr nicht. Den Namen trägt das Kaufpanel,
  das ein Tipp darauf öffnet (auf dem Desktop zusätzlich der Tooltip). Icon und Farbe
  je Zone kommen aus `src/components/scene3d/zoneVisuals.js` - eine Quelle für Nadel
  und Panelkopf, sonst zeigt die Insel ein anderes Zeichen als das Menü dahinter.
* **Ein Grafik-Stil für die ganze Ansicht.** Menüs, Bedienleiste und Kopfzeile sehen
  aus wie ein Teil der Insel: Papierweiß, Tinte, klotzige Kanten mit 2-4px Unterkante,
  die beim Drücken zusammenfällt. Die Farben liegen als CSS-Tokens auf `.game-shell`
  (`--game-paper`, `--game-ink`, `--game-grass`, ...) und sind an `palette.js`
  angelehnt. Kein Verlauf, kein Blur, kein Neon.
  * Zonen-Kaufpanel: komplett so gebaut.
  * Schublade: Rahmen (Griff, Papierkopf, runde Kanten) mit den Tab-Inhalten als
    dunkle Einlassung - `StoreTab` & Co. gehören auch der Ansicht unter `/play` und
    tragen ihre Farben fest im Markup, sie hier per Fern-CSS umzufärben würde bei der
    nächsten Änderung an den Tabs lautlos brechen.
  * Buttonreihe unten: Kantenfarbe je Variante als `--btn-edge`, damit Drücken und
    "Schublade offen" (`.is-active`) mit einer Regel auskommen. Der Aktiv-Zustand ist
    die eingedrückte Taste, nicht mehr ein Cyan-Rand.
  * Kopfzeile: Name und Kennzahlen als Papierpillen, Bewertung in dunklem Geldgrün
    mit hellem Halo. Das frühere Weiß-auf-Schlagschatten war auf dem hellen Himmel
    die schlechtere Hälfte des Kontrasts.

## Entscheidungen

| Frage | Entscheidung |
|---|---|
| Perspektive | Isometrisches Diorama, orthografische Kamera, ca. 35 Grad Neigung, 45 Grad gedreht |
| Gliederung | 5 Zonen, jede Engine ein eigener Prop-Typ innerhalb ihrer Zone |
| Renderer | Three.js, Low-Poly ohne Texturen, Flat Shading, Vertex- bzw. Materialfarben |
| Ohne WebGL | Alte Ansicht (Header, Tabs, GPU-Button, Icon-Liste) bleibt als Fallback, ohne Meme-Bild |
| Licht | Ein Richtungslicht mit Schattenkarte plus Hemisphärenlicht, Tageslicht |
| Stimmung | Insel im Tageslicht, Menüs aus der Szene heraus im selben hellen Low-Poly-Stil (Papier, Tinte, klotzige Kanten) |
| Kaufen | Direkt aus der Szene per Klick auf eine Zone: Engines, deren Upgrades UND deren Corporate Actions in drei Reitern; Klick-Upgrades, Syndicate und Buzzwords bleiben im Shop-Tab, weil sie keiner Zone gehören |
| Meme-Bilder | Nicht in der Szene |
| Tilt-Shift | Nicht als Post-Processing (zu teuer auf Mobile), stattdessen weiche Vignette am Inselrand |
| Bildschirm | Eine Vollbild-Szene, keine Kopf- und Fußzeile mehr. Zähler und wenige Buttons liegen als Overlay auf der Szene |
| Panels | Shop, Statistik, Einstellungen, Belohnungen öffnen als Schublade über der Szene, die Szene bleibt sichtbar |
| Tippen | Server-Schrank in der Szene und ein großer Feuer-Button unten lösen dieselbe Aktion aus |
| Kamera | Fest eingepasst, solange die Insel ins Bild passt; danach schiebt und zoomt der Spieler selbst (ein Finger/Maus schiebt, zwei Finger/Mausrad zoomen) |
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
| Hitze, Feuer | Rotorange `#F97316` |
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
- Tap auf den Schrank: Schrank pulsiert kurz (Scale 1.0 auf 1.04 und zurück), alle LEDs
  flackern auf, Funkenschauer aus dem Dachschlitz.
- Fliegende Zahlen bleiben wie heute (`ClickParticles`), nur über der Canvas.
- Kauf einer Engine: der neue Prop wächst mit Überschwinger aus dem Boden.
- Rauchdichte und Schrankglut folgen VPS und Hitze wie bereits in `sceneState.js` abgeleitet.

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
|     (Insel, Schrank, Zonen, Zonen-Stecknadeln)     |
|                                                    |
|                                                    |
|  [ FEUERN ]   [ SHOP (3) ]   [Stats]  [Optionen]   |  <- Overlay unten
|              Werbebanner (nur wenn aktiv)          |
+--------------------------------------------------+
   darunter, nur Web-Build: SEO-Textblock, scrollbar
```

**Overlay oben** (transparent über dem Himmel, im Grafik-Stil der Insel: Papierpillen
mit klotziger Unterkante, Tinte statt Weiß, freistehende Texte mit hellem Halo statt
schwarzem Schlagschatten - der Himmel ist hell, dunkler Text liest sich darauf besser):
- Startup-Name klein links, editierbar wie heute. Rechts drei runde Buttons:
  Sprache, Handbuch, Teilen (Pitch Deck).
- Valuation groß in der Mitte, darunter drei Chips: Burn, Netto-VPS, Hype-Stufe.
  Slop-Zähler wandert in die Statistik.
- GPU-Hitze als schmaler Balken unter den Chips. Zusätzlich färbt sich der Schrank selbst.
- Newsticker: LED-Laufschrift auf dem Dach des Kapital-Turms (`utils/tickerText.js`
  liefert den Text für Tafel und HTML-Laufzeile). Die dünne Laufzeile oben gibt es nur
  noch im SVG-Fallback ohne WebGL.
- Golden-Meme-Banner, Toasts und Modals bleiben, wie sie sind, sie liegen ohnehin
  über allem.

**Overlay unten:**
- **FEUERN**, groß, links: löst `handleTapAGI` aus, identisch zum Tap auf den Schrank.
  Ein Daumen-Button ist auf dem Handy ergonomischer als ein Ziel in der Bildmitte.
  Die fliegenden Zahlen starten trotzdem am Schrank. Bei Überhitzung zeigt der Button
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

Ein Raster von 24 x 24 Einheiten als BASIS, Ursprung in der Mitte. Der Server-Schrank
steht auf dem Ursprung. Blickrichtung: die Kamera schaut von vorne links, vorne ist +Z.
Die Insel wächst in Vierer-Schritten bis 44 Einheiten mit, sobald Gebäude über den Rand
hinauswollen - gerechnet in `utils/campusLayout.js`, ausgelöst über `deriveIsland()`.

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

Die Anker der Zonen bleiben fest, gewachsen wird nach AUSSEN: neue Grundstücke hängen
sich vom Ofen weg an die Grundfläche an, die Zonenplatte wächst mit ihnen, und die
Datenleitungen zum Schrank bleiben unangetastet.

| Zone | Ankerpunkt (x, z) | Grundfläche (Basis) |
|---|---|---|
| Server-Schrank | 0, 0 | 7 x 6 (Sockel) |
| office | -7, +6 | 8 x 7 |
| stage | +7, +6 | 8 x 7 |
| basement | -7, -6 | 8 x 7 |
| tower | +7, -6 | 8 x 7 |
| endgame | 0, -10 sowie Luftraum über dem Schrank | 14 x 3 |

Vom Büro führt eine transparente Datenleitung über die Tische zum Schranksockel, durch
die Tokens rasen (instanziert, Menge nach Zonenstufe). Die Server-Silos bekommen in
Phase 4 eine zweite Leitung derselben Art.

## Zonen und Props

Fast jede Engine steht inzwischen auf einem eigenen, wachsenden Grundstück (siehe
"Grundstücke und Inselwachstum" unten) statt auf einem festen Platz innerhalb der
Zone: ist eines voll, entsteht das nächste NEBENAN, in einer eigenen Reihe je Engine.
Ausnahmen sind Singletons (AGI-Uhr, Singularität - es gibt nie ein zweites davon) und
frei schwebende Requisiten ohne Grundstück (Sprechblasen, Drohnen, Pitch-Deck-Papiere,
Excel-Tabelle), die einfach über der ganzen - gewachsenen - Zone weiterziehen.

| Zone | Engine | Prop (Low-Poly) | Max. Objekte |
|---|---|---|---|
| office | Prompt-Praktikant | Person am schiefen Tisch, Monitor, Tastatur, Tasse, tippende Arme, hängende Schultern - vier pro Haus, danach ein Haus nebenan, nach vier Häusern eine neue Reihe (bis 12 Häuser) | 48 |
| office | Prompt Engineer | Person am breiteren Tisch mit zwei Monitoren, aufrechte Haltung, schnelleres Tippen - vier pro Haus, eigene Spalten neben den Praktikanten (bis 9 Häuser) | 36 |
| office | Chatbot-Widget | Schwebende Sprechblasen mit pulsierenden Punkten über den Tischen, frei über der Zone | 10 |
| office | Datenleitung | Transparente Röhre vom Büro zum Schranksockel, Tokens rasen hindurch, Menge nach Zonenstufe | 40 Tokens |
| basement | GPU-Rack | Schmaler Turm mit vier blinkenden LED-Streifen, vier pro Grundstück (bis 8 Grundstücke) | 32 |
| basement | Token-Burner | Kubus mit wabernd orangem Kern, vier pro Grundstück (bis 5) | 20 |
| basement | Rechenzentrum | Weißer Zylinder mit Türkis-Ring und Band, Lüfter oben dreht, zwei pro Grundstück (bis 6) | 12 |
| basement | Grauer-Markt-RZ | Dunkles Silo unter grüner Plane hinter Zaun, zwei pro Grundstück (bis 4) | 8 |
| basement | Web-Scraper | Drohne mit vier Rotoren und rotem Auge, kreist frei über der Zone, Radius folgt deren Größe | 12 |
| basement | Datenleitung | Zweite Röhre zum Schrank, kommt an dessen linker, sichtbarer Seite an | 40 Tokens |
| stage | Keynote-Bühne | Podest mit Pult, leuchtender Rückwand mit Gold-Balkendiagramm und zwei Scheinwerfern - eine eigene, kleinere Bühne pro Grundstück (bis 6) | 6 |
| stage | Thought Leader | Person mit Krawatte und Mikrofon, gestikuliert, vier pro Grundstück (bis 6) | 24 |
| stage | Hype-Journalist | Person mit Kamera vor dem Gesicht, Blitz ploppt zufällig auf, vier pro Grundstück (bis 6) | 24 |
| stage | Regulierungs-Lobbyist | Person mit Aktenkoffer an einem eigenen Sendemast mit Schüssel, rotem Blinklicht und Sendewellen, ein Mast pro Grundstück (bis 6) | 6 |
| stage | Recyceltes Pitch Deck | Weiße Blätter, die frei über der Zone in Schleifen segeln, Mitte folgt deren Größe | 14 |
| tower | VC-Firma | Glasturm, ein Stockwerk pro Objekt bis zu sechs pro Turm; ist einer voll, entsteht der nächste GANZE Glasturm nebenan (bis 4 Türme) | 24 |
| tower | Pivot-Startup | Container-Trio am Turmfuß, Logo wechselt alle paar Sekunden die Farbe, drei pro Grundstück (bis 5) | 15 |
| tower | AGI-Countdown-Uhr | LED-Tafel auf dem Dach des ERSTEN Turms, Countdown springt alle 25 Sekunden zurück | 1 |
| tower | Newsticker | LED-Laufschrift auf dem Dach des ersten Turms mit dem Text der bisherigen HUD-Laufzeile | 1 |
| endgame | Kleiner Atomreaktor | Kühlturm-Zwillingspaar mit weißem Dampf, ein Paar pro Grundstück (bis 4) | 8 |
| endgame | 3D-Welt-Geisterstadt | Zwei Hologramm-Gebäude auf einem eigenen kleinen Projektor, ein Projektor pro Grundstück (bis 4) | 8 |
| endgame | Selbstbewusste Excel-Tabelle | Schwebendes Gitterblatt mit zwei Augen, dreht sich frei hoch über den Silos | 6 |
| endgame | Die Singularity | Schwarze Kugel mit zwei Akkretionsringen im Rauch über dem Abluftrohr, Trümmer kreisen hinein | 1 |

Über die Maximalzahl hinaus wächst nur die Zahl an der Zonen-Stecknadel und die Ausbaustufe.

## Grundstücke und Inselwachstum

`utils/campusLayout.js` ist die einzige Quelle für beides - Ableitung (`sceneState.js`)
und Bauer (`components/scene3d/*`) rechnen mit denselben Zahlen. Läge die Rechnung in
den Bauern, müsste die Insel raten, wie weit die Zonen inzwischen gewachsen sind.

* **Grundstück** (`LOT_SIZE` 3,6): ein Haus. `lotLocal()` legt es in die Zone, Index 0
  in die innere Ecke der Grundfläche, jeder weitere Schritt nach außen - ab der Kante
  eben über sie hinaus.
* **Engines mit `plot`** (`zonesData.js`): `capacity` Objekte pro Grundstück, `max`
  Grundstücke, `axis` die Wachstumsrichtung (bei allen vier Zonen `'x'`, weil ihre
  Anker ohnehin vom Ofen weg in x liegen), `lane` die Reihe quer dazu. Jede Engine
  EINER Zone bekommt eine eigene `lane` - zwei Engines geraten sich dadurch beweisbar
  nie ins Gehege, jede Reihe wächst unabhängig beliebig weit nach außen. `maxProps` ist
  bei ihnen bewusst `capacity * max`, sonst stünde das letzte Grundstück halb leer,
  während die Zahl am Schild weiterläuft. Ausnahmen: Singletons (`agi_clock`,
  `singularity`, je `maxProps` 1) und frei schwebende Requisiten ganz ohne `plot`
  (Sprechblasen, Drohnen, Pitch-Deck-Papiere, Excel-Tabelle).
* **Zonenplatte und Stecknadel** folgen dem Rechteck aus Grundfläche + Grundstücken
  (`zoneRect`), die Nadel rückt um genau den Zuwachs nach außen.
* **Inselgröße**: `islandSizeForLots()` nimmt das äußerste Grundstück plus Rand und
  rastert auf Vierer-Schritte (24 bis 96; ausgebaut kommt der Campus heute auf etwa 60).
  Gewachsen wird über einen Skalierungsfaktor auf der Landmasse, nicht über neue
  Geometrie; Bäume, Randlicht und Leiterbahnen fahren mit.

## Kamera: einpassen, schieben, zoomen

Bis zu einer Inselkante von 40 Einheiten (`VIEW_FIT_MAX` in `CampusScene.jsx`) passt die
Kamera die ganze Insel ins Bild. Darüber bleibt der Maßstab stehen: weiter herauszoomen
hieße, dass Häuser und Personen zu klein werden, um noch etwas zu erkennen. Stattdessen
ragt die Insel über den Bildrand hinaus und der Spieler bewegt sich selbst.

* **Schieben**: ein Finger oder die linke Maustaste. Die Kamera wird dabei entlang ihrer
  eigenen Rechts-/Hoch-Achse versetzt - `lookAt()` erneut aufzurufen würde die Isometrie
  verdrehen. Geschoben wird nur so weit, wie die Insel über den Bildrand hinausragt;
  passt sie ganz ins Bild, bleibt sie von selbst mittig.
* **Zoomen**: Mausrad oder zwei Finger, um den Punkt unter Zeiger bzw. Fingermitte
  herum. Bereich: von "ganze Insel im Bild" bis dreifach vergrößert.
* **Tippen bleibt Tippen**: der Tap auf Schrank oder Zone löst erst beim LOSLASSEN aus
  und nur, wenn der Zeiger sich um weniger als 6 Pixel bewegt hat. Entschieden wird am
  Abstand zum Startpunkt, nicht an der letzten Bewegung - ein Finger zittert beim Tippen.
* **Zurück zur Übersicht**: ein Knopf unten rechts, sichtbar nur nach Schieben oder
  Zoomen. Ohne ihn findet man auf einer Insel, die größer ist als das Bild, nicht
  zurück zum Schrank.
* **Stecknadeln** werden dabei pro Frame direkt im DOM gesetzt, nicht über React - beim
  Schieben wäre das ein Re-Render pro Bild. Nadeln außerhalb des Bildes bleiben an der
  Kante kleben und zeigen so die Richtung ihrer Zone an.
* **Schattenkarte folgt dem Blick** statt die ganze Insel abzudecken: bei sechsfacher
  Inselfläche wäre sonst jeder Schatten matschig.

## Die Mitte: der Server-Schrank

Ein Rack auf einem Doppelboden-Podest, flankiert von zwei halbhohen Nachbarschränken,
hinten ein schmales Abluftrohr. Die Front ist eine offene Schale mit Glastür: dahinter
liegen die Blades mit ihren LEDs, davor der Türrahmen. Ein geschlossener Quader war die
erste Fassung - und sah aus wie ein Quader.

| Stufe | Was der Schrank tut |
|---|---|
| cold | LEDs türkis, Lüfter drehen gemächlich, kein Dampf |
| warm | LEDs gold, Lüfter schneller, erster Wasserdampf aus dem Dachschlitz |
| hot | LEDs orange, dichter Dampf, Glut zwischen den Blades, erste Funken |
| critical | LEDs rot, dunkler Qualm, Flammen aus Dachschlitz und Türspalt |
| meltdown | Gehäuse verrußt, volle Flammen, Absperrband, Warnlicht, Kühlnebel |

Die Rauchfahne aus dem Abluftrohr hängt weiter an den VPS (`smokeTier`), ihre FARBE an
der Hitze: weißer Dampf, solange es kühl ist, dann grau, dann schwarz.

## Ausbaustufen

Zwei unabhängige Achsen, beide bereits im Gerüst angelegt:

1. **Campus-Stufe, inselweit**, gekoppelt an die vorhandene Hype-Stufe (1 bis 10),
   siehe `buildCampus.js`: Garage (1 bis 2) nackte Insel; Co-Working (3 bis 5) Wege
   von den freigeschalteten Zonen zum Schrank und sechs Bäume; Container-Dorf (6 bis 8)
   zehn Bäume und schwach leuchtender Inselrand; Hyperscale (9 bis 10) vierzehn Bäume,
   Rand voll, türkise Leiterbahnen im Fels, acht Lichtdrohnen um die Insel.
2. **Zonen-Stufe** aus dem Bestand der Zone (`tier` 0 bis 7 in `sceneState.js`):
   steuert, wie dicht und hoch die Props stehen.

## Zustände, die die Szene zeigt

| Zustand | Quelle | Wirkung |
|---|---|---|
| Hitze cold bis critical | GPU-Temperatur | LED-Farbe, Lüfterdrehzahl, Dampf, Glut, ab critical Flammen |
| meltdown | Overheat-Lock | Schrank verrußt und brennt, Absperrband, Kühlnebel, Klick gesperrt |
| Rauchstufe 0 bis 7 | VPS, logarithmisch | Anzahl und Größe der Wölkchen aus dem Abluftrohr (Farbe nach Hitze) |
| Inselgröße 24 bis 96 | belegte Grundstücke | Landmasse, Bäume und Randlicht wachsen in Stufen mit; bis 40 zoomt die Kamera mit heraus, danach wird geschoben |
| surge | Power Click | Türkise Blitze zucken um den Schrank, alle 80 ms neu gewürfelt |
| golden | Golden Meme | Goldrauch, Goldflammen, Goldmünzen regnen über die Insel |
| bubble | Bubble Burn | Statt Rauch steigen Seifenblasen auf und platzen oben |
| glitch | Halluzination | Kurzes Kanal-Versatz-Flackern der ganzen Insel (CSS auf dem Container) |
| damaged | Black Swan | Zonenplatte blinkt rot, dunkler Rauch über der Zone, 8 Sekunden |
| greenwashed | Corporate Action | Drei Plastikpflanzen in Töpfen und grünes Banner mit Siegel an der Zone |
| laidOff | Corporate Action | Umzugskartons in der Zonenecke; im Büro fehlt jede dritte Person, der Stuhl bleibt |
| blueprint | SEC-Theme | Sepia-Materialset über applyPalette() in allen Bauern, Himmel Pergament |

## Debug-Haken für Screenshots

`window.__campusDebug = { heatStage, heatPct, smokeTier, mood, buildings }` überschreibt
in der Render-Loop NUR die Anzeige (Schrank, Zonen-Bestand und Inselgröße), nie den Spielzustand. Solange er gesetzt ist,
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
- **Interaktion per Raycast**: der Schrank löst `handleTapAGI(event)` aus (Clientkoordinaten
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
| `src/components/scene3d/buildIsland.js`, `buildServerRack.js`, `buildCampus.js` | Insel (inkl. Wachstum), Server-Schrank, Campus-Stufen |
| `src/components/scene3d/buildLotShells.js` | Gebäudehüllen auf den Grundstücken (halboffen fürs Büro, geschlossen für Anbauhallen) |
| `src/utils/campusLayout.js` | Grundstücks-Raster, Zonen-Rechteck, Inselgröße - reine Geometrie |
| `src/components/scene3d/buildOffice.js`, `buildBasement.js`, `buildStage.js`, `buildTower.js`, `buildEndgame.js` | Die fünf Zonen |
| `src/components/scene3d/buildZones.js` | Platten, Klickziele, Nadel-Anker, Zonen-Effekte, hostet die Zonen-Bauer |
| `src/components/scene3d/buildDataLine.js`, `buildPeople.js` | Gemeinsame Bausteine: Datenleitung, Personen |
| `src/components/scene3d/ZoneBuyPanel.jsx` | Kaufen aus der Szene: Engines, Upgrades und Corporate Actions der angeklickten Zone in drei Reitern, Preise/Filterung über dieselben Helfer wie der Shop |
| `src/utils/storeCopy.js` | Anzeigetexte für Upgrades und Corporate Actions (Name, Zitat, Effektbeschreibung) - eine Quelle für StoreTab und ZoneBuyPanel |
| `src/components/scene3d/palette.js` | Materialfarben je Theme, Himmel als CSS-Verlauf |
| `src/components/scene3d/zoneVisuals.js` | Icon und Akzentfarbe je Zone, für Stecknadel und Panelkopf |
| `src/data/zonesData.js` | Zonen-Anker, Grundflächen, Nadel-Anker (`labelAnchor3d`), Engine-Zuordnung, `maxProps`, `plot`, `annexMax` |
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
