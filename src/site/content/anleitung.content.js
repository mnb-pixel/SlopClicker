// Spielanleitung (/anleitung). Alle Zahlen aus dem Spielcode:
// Hype-Schwellen/Burn Rate: useGameStore.js (hypeTier, burnRate) · GPU: +2 °C/Tap, Overheat
// bei 100 °C, 45 s Verzögerung, Freigabe < 50 °C, Kühlung 4/6/10 °C/s (upgradesData.js) ·
// Engines: baseCost 15·13^(n-1), baseCps 0,05·11^(n-1) (buildingsData.js) · Ausbaustufen:
// UPGRADE_THRESHOLDS (upgrades.content.js) · Corporate Actions: greenwashingLayoffsData.js ·
// Karten: buzzwordsData.js · Offline: OFFLINE_* / AFK_* in useGameStore.js.
export const ANLEITUNG = {
  kicker: 'Spielanleitung',
  title: 'So funktioniert Token Furnace',
  lead:
    'Alles, was das Spiel dir nicht auf den ersten Blick erklärt: wie Bewertung, Burn Rate und Hype-Stufen zusammenhängen, was die 20 Engines kosten, wann sich Upgrades lohnen und was hinter Golden Memes, Black Swans und dem Offline-Ertrag steckt.',
  ctaText: 'Am schnellsten lernt man Token Furnace, indem man es spielt – die ersten Engines sind in zwei Minuten gekauft.',

  sections: [
    {
      id: 'grundlagen',
      title: 'Grundlagen: Bewertung, VPS und Slop',
      blocks: [
        ['p', 'Die zentrale Zahl in Token Furnace ist die **Valuation**, die Unternehmensbewertung in Dollar. Sie ist gleichzeitig deine Währung: Alles im Shop wird mit Bewertung bezahlt. Sie steigt durch manuelle Taps und durch die Produktion deiner Engines – und sie sinkt jede Sekunde um die Burn Rate.'],
        ['p', '**Netto-VPS** („Valuation pro Sekunde“) zeigt, was unter dem Strich pro Sekunde übrig bleibt: Bruttoproduktion aller Engines minus Burn. Der Wert kann negativ werden, wenn dein Bestand groß und deine Produktion klein ist – dann schmilzt die Bewertung, bis sich beides wieder die Waage hält.'],
        ['p', 'Die **Lebenszeit-Bewertung** ist alles, was du jemals erwirtschaftet hast, unabhängig von Ausgaben und Burn. Sie bestimmt deine Hype-Stufe und schaltet Upgrades und Erfolge frei – ausgeben kannst du sie nicht.'],
        ['p', '**Slop** zählt die insgesamt generierten KI-Tokens: eine reine Fortschrittsanzeige ohne Spielwirkung, dafür mit dem passenden Namen für das, was hier produziert wird.'],
      ],
    },
    {
      id: 'hype-und-burn',
      title: 'Hype-Stufen und Burn Rate',
      blocks: [
        ['p', 'Es gibt zehn Hype-Stufen. Die erste hast du ab Spielstart, jede weitere ab dem Hundertfachen der vorherigen Lebenszeit-Bewertung: Stufe 2 ab 10.000 Dollar, Stufe 3 ab einer Million, Stufe 4 ab 100 Millionen – bis Stufe 10 ab 100 Trillionen Dollar.'],
        ['p', 'Mit jeder Stufe steigt die **Burn Rate**: 0,2 % pro Sekunde auf Stufe 1, dann 0,05 Prozentpunkte mehr je Stufe, also 0,65 % auf Stufe 10. Sie wird auf den aktuellen Bestand angewendet, nicht auf die Produktion – bei einer Milliarde Bewertung und 0,4 % sind das 4 Millionen pro Sekunde, die du erst einmal erwirtschaften musst, bevor überhaupt etwas übrig bleibt.'],
        ['table', {
          caption: 'Hype-Stufen mit Schwellenwert und Basis-Burn-Rate',
          head: ['Stufe', 'Ab Lebenszeit-Bewertung', 'Burn Rate (Basis)'],
          rows: [
            ['1', 'Spielstart', '0,20 % / s'],
            ['2', '10.000 $', '0,25 % / s'],
            ['3', '1 Million $', '0,30 % / s'],
            ['4', '100 Millionen $', '0,35 % / s'],
            ['5', '10 Milliarden $', '0,40 % / s'],
            ['6', '1 Billion $', '0,45 % / s'],
            ['7', '100 Billionen $', '0,50 % / s'],
            ['8', '10 Billiarden $', '0,55 % / s'],
            ['9', '1 Trillion $', '0,60 % / s'],
            ['10', '100 Trillionen $', '0,65 % / s'],
          ],
        }],
        ['p', 'Senken kannst du die Burn Rate mit **Greenwashing I**: minus 0,1 Prozentpunkte für jeden Engine-Typ, für den du die Maßnahme gekauft hast. Unter 0,1 % fällt sie nie, über 10 % steigt sie nie. Während eines Bubble-Pop-Ereignisses kommen vorübergehend 1,5 Prozentpunkte dazu.'],
        ['callout', 'Warum Horten nicht funktioniert', 'Weil die Burn Rate am Bestand zehrt, halbiert sich ungenutzte Bewertung auf Stufe 1 in rund sechs Minuten von selbst – auf Stufe 10 in unter zwei. Geld, das auf dem Konto liegt, ist in Token Furnace immer Geld, das verschwindet.'],
      ],
    },
    {
      id: 'gpu-hitze',
      title: 'GPU-Hitze und Überhitzung',
      blocks: [
        ['p', 'Jeder manuelle Tap erhitzt die GPU um 2 °C. Bei 100 °C **überhitzt** sie: Der AGI-Kern ist gesperrt, und die passive Kühlung setzt erst 45 Sekunden später ein. Erst wenn die Temperatur wieder unter 50 °C gefallen ist, kannst du weiterklicken.'],
        ['p', 'Die Standardkühlung beträgt 4 °C pro Sekunde. Zwei Upgrades beschleunigen sie: die Flüssigkeitsgekühlte Wärmeleitpaste auf 6 °C/s und die Sub-Zero-Kryokammer auf 10 °C/s. Die Flüssigstickstoff-Kühlung (per Bonus-Video, im Werbefrei-Modus der iOS-App mit einem Tap) setzt die Temperatur sofort auf 0 °C und verdoppelt für 30 Sekunden den Tap-Wert.'],
        ['callout', 'Faustregel', 'Bei 4 °C/s Kühlung kannst du dauerhaft etwa zwei Taps pro Sekunde halten, ohne je zu überhitzen. Alles darüber ist ein Sprint mit anschließender Zwangspause von rund einer Minute.'],
      ],
    },
    {
      id: 'shop',
      title: 'Der Shop',
      blocks: [
        ['p', 'Der Shop hat vier Bereiche: AI Engines, Upgrades, Corporate Actions und Buzzwords. Oben wählst du den **Kaufmodus** – 1, 10, 100 oder MAX Exemplare pro Klick; MAX kauft so viele, wie du dir gerade leisten kannst.'],
        ['h3', 'AI Engines', 'engines'],
        ['p', 'Engines sind die 20 Produktionsanlagen des Spiels. Jede Stufe kostet das 13-Fache der vorherigen und produziert das 11-Fache. Die Tabelle zeigt die Kosten des ersten Exemplars und die Basisproduktion pro Stück, bevor Ausbaustufen, Karten und Multiplikatoren wirken. Mit jedem gekauften Exemplar steigt der Preis für das nächste.'],
        ['table', {
          caption: 'Alle 20 Engines mit Einstiegskosten und Basisproduktion',
          head: ['Nr.', 'Engine', 'Erstes Exemplar', 'Basisproduktion je Stück'],
          rows: [
            ['1', 'Prompt-Praktikant', '15 $', '0,05 $/s'],
            ['2', 'Chatbot-Widget', '195 $', '0,55 $/s'],
            ['3', 'Prompt Engineer', '2.535 $', '6,05 $/s'],
            ['4', 'GPU-Rack', '32.955 $', '66,6 $/s'],
            ['5', 'Rechenzentrum', '428.415 $', '732 $/s'],
            ['6', 'Web-Scraper', '5,57 Millionen $', '8.053 $/s'],
            ['7', 'ProNet-Thought-Leader', '72,4 Millionen $', '88.578 $/s'],
            ['8', 'VC-Firma', '941 Millionen $', '974.359 $/s'],
            ['9', 'Hype-Journalist', '12,2 Milliarden $', '10,7 Millionen $/s'],
            ['10', 'Keynote-Bühne', '159 Milliarden $', '118 Millionen $/s'],
            ['11', 'Pivot-Startup', '2,07 Billionen $', '1,30 Milliarden $/s'],
            ['12', 'Token-Burner', '26,9 Billionen $', '14,3 Milliarden $/s'],
            ['13', 'Recyceltes Pitch Deck', '349 Billionen $', '157 Milliarden $/s'],
            ['14', 'Regulierungs-Lobbyist', '4,54 Billiarden $', '1,73 Billionen $/s'],
            ['15', 'AGI-Countdown-Uhr', '59,1 Billiarden $', '19,0 Billionen $/s'],
            ['16', 'Grauer-Markt-Rechenzentrum', '768 Billiarden $', '209 Billionen $/s'],
            ['17', 'Kleiner Atomreaktor', '9,98 Trillionen $', '2,30 Billiarden $/s'],
            ['18', '3D-Welt-Geisterstadt', '130 Trillionen $', '25,3 Billiarden $/s'],
            ['19', 'Selbstbewusste Excel-Tabelle', '1,69 Trilliarden $', '278 Billiarden $/s'],
            ['20', 'Die Singularity', '21,9 Trilliarden $', '3,06 Trillionen $/s'],
          ],
        }],
        ['h3', 'Upgrades', 'upgrades'],
        ['p', 'Für jede Engine gibt es 13 **Ausbaustufen**, freigeschaltet bei 1, 5, 10, 25, 50, 100, 150, 200, 250, 300, 400, 500 und 750 Exemplaren – zusammen 260 Engine-Upgrades. Jede Stufe multipliziert die Produktion dieser Engine und trägt einen eigenen Namen samt Kommentar: Beim Chatbot-Widget beginnt es mit „Popup nach 3 Sekunden“ („Erscheint, bevor man die Seite überhaupt gelesen hat“) und geht über „Mehrsprachig (schlecht)“ weiter. Dazu kommen 14 allgemeine Upgrades:'],
        ['ul', [
          '**Klick-Upgrades** (5): von der Ergonomischen Cyber-Maus über Übertaktete Mechanische Switches, Neural-Link-Finger-Implantat und Quanten-Haptik-Motor bis zum Unterlichtgeschwindigkeits-Tap-Strahl – alle erhöhen den Wert eines manuellen Taps.',
          '**VC-Syndicate** (4): Seed-Angel-Berater, Series-A-Board-Direktor, Growth-VC-Syndicate-Partner und Autonomes AGI-Beirats-Board geben 0,1 bis 0,5 % globale Produktion **pro freigeschaltetem Erfolg**. Voraussetzung ist jeweils eine VC-Firma.',
          '**Kühlung** (2): Flüssigkeitsgekühlte Wärmeleitpaste (6 °C/s) und Sub-Zero-Kryokammer (10 °C/s).',
          '**Globale Multiplikatoren** (3): Unterwürfiger Marketing-Pitch (+10 %), World-Tour-Keynote-Präsentation (+20 %) und Föderale KI-Subventions-Lücke (+40 % – „Steuerzahler übernehmen die komplette Stromrechnung“).',
        ]],
        ['h3', 'Corporate Actions', 'corporate-actions'],
        ['p', 'Corporate Actions sind Maßnahmen pro Engine-Typ: drei Stufen Greenwashing und zwei Wellen Layoffs. Die Kosten richten sich nach dem Basispreis der jeweiligen Engine – für den Prompt-Praktikanten kostet Greenwashing I also 75 Dollar, für das Chatbot-Widget 975.'],
        ['table', {
          caption: 'Corporate Actions je Engine mit Kosten und Effekt',
          head: ['Maßnahme', 'Kosten', 'Effekt'],
          rows: [
            ['Greenwashing I', '5 × Engine-Basispreis', 'Burn Rate −0,1 Prozentpunkte (einmal pro Engine-Typ)'],
            ['Greenwashing II', '15 × Engine-Basispreis', 'Produktion dieser Engine × 1,10'],
            ['Greenwashing III', '40 × Engine-Basispreis', 'Rein kosmetisch – gut fürs Image, nichts für die Zahlen'],
            ['Layoff I', '20 × Engine-Basispreis', 'Produktion dieser Engine × 1,20'],
            ['Layoff II', '60 × Engine-Basispreis', 'Produktion dieser Engine × 1,15'],
          ],
        }],
        ['p', 'Fünf Maßnahmen pro Engine, 100 insgesamt. Jede gekaufte Maßnahme verteuert alle weiteren um 15 % – nach 20 Käufen kostet die nächste bereits rund das 16-Fache ihres Grundpreises.'],
        ['h3', 'Buzzword-Karten', 'buzzword-karten'],
        ['p', 'Das Sammelalbum enthält 80 Karten in vier Seltenheitsstufen: 40 Common, 25 Uncommon, 10 Rare und 5 Legendary. Die Namen entstehen aus 20 Modifikatoren (Agentic, Exponential, Disruptive, Quantum-Ready, Post-Human …) und 20 Begriffen (Synergy, Moat, Flywheel, Runway, North Star …), und jede Karte trägt einen Kommentar – „Quantum-Ready: Superposition of working and broken.“'],
        ['p', 'Jede Karte erhöht deine **globale Produktion**, beginnend bei 0,4 % für die erste und steigend bis rund 13 % für die achtzigste. Das komplette Album summiert sich auf rund +290 %. Karten gibt es ausschließlich im **Booster-Pack**: Das erste kostet 600 Dollar, jedes weitere das Doppelte. Der Duplikatschutz garantiert, dass jede gezogene Karte neu ist – welche kommt, entscheidet der Zufall.'],
      ],
    },
    {
      id: 'erfolge',
      title: 'Erfolge und Statistik',
      blocks: [
        ['p', 'Die Badge-Wand im Statistik-Tab führt 80 Erfolge in neun Gruppen:'],
        ['ul', [
          '**Tap-Meilensteine** (6): vom ersten Prompt bis zu 100.000 manuellen Taps – „Tastatur-Zerstörer“ gibt es bei 1.000.',
          '**Bewertungs-Meilensteine** (10): Lebenszeit-Bewertung von 1.000 Dollar bis zu einer Billion; „Einhorn im Werden“ ab einer Million.',
          '**Engines** (20): je ein Badge für das erste Exemplar eines Engine-Typs.',
          '**Engine-Menge und -Vielfalt** (8): 10 bis 500 Engines insgesamt, 10, 15 oder alle 20 Typen im Besitz.',
          '**Buzzword-Sammlung** (8): 1 bis 80 Karten im Album.',
          '**Upgrades** (6) und **Corporate Actions** (6): 1 bis 100 gekaufte Upgrades bzw. Maßnahmen.',
          '**Pivots und Prestige** (8): stammen aus einem älteren Spielsystem ohne aktuelle Oberfläche.',
          '**GPU-Hitze und Besonderes** (8): Überhitzungen, ein Startup-Name mit „.ai“ am Ende, ein negatives Netto-Ergebnis in Milliardenhöhe – und ein verstecktes Glücks-Badge.',
        ]],
        ['p', 'Jeder Erfolg trägt einen eigenen satirischen Kommentar. Daneben zeigt der Statistik-Tab die Startup-Bilanz: aktuelle und Lebenszeit-Bewertung, manuelle Taps und GPU-Überhitzungen. Die Badge-Wand lässt sich nach freigeschalteten und gesperrten Erfolgen filtern und durchsuchen.'],
      ],
    },
    {
      id: 'ereignisse',
      title: 'Markt-Ereignisse und der News-Ticker',
      blocks: [
        ['p', 'Etwa alle 20 Minuten erscheint ein **Golden Meme** – ein Angebot mit 20 Sekunden Bedenkzeit, das dir per Bonus-Video für 30 Sekunden die zehnfache Produktion gibt („Tech-Milliardär antwortet ‚interessant‘ auf euren Post“). Genauso oft platzt eine **Bubble**: 30 Sekunden lang minus 35 % Produktion und plus 1,5 Prozentpunkte Burn Rate („Großkunde kündigt – über euer eigenes Chatbot-Widget“). Ein Bonus-Video beendet den Effekt sofort.'],
        ['p', '**Black-Swan-Ereignisse** sind sehr selten – frühestens alle 24 Stunden pro Engine-Typ, meist liegen Wochen dazwischen – und vernichten 15 bis 30 % der Exemplare einer einzelnen Engine: Das Rechenzentrum brennt ab, die Behörde versiegelt das Grauer-Markt-Rechenzentrum, der Atomreaktor hat einen Störfall.'],
        ['p', 'Der Ticker in der Kopfzeile mischt echte Spielereignisse – Käufe, Erfolge, Ereignisse – mit erfundenen Schlagzeilen: „SEC-Akte: Prospekt enthält Wort ‚Synergie‘ 212 Mal.“'],
      ],
    },
    {
      id: 'offline',
      title: 'Offline-Ertrag und Abwesenheit',
      blocks: [
        ['p', 'Deine Engines produzieren weiter, wenn der Tab geschlossen oder im Hintergrund ist – mit 10 % ihrer normalen Rate und für maximal vier Stunden. Kommst du nach weniger als 30 Minuten zurück, wird der Betrag direkt gutgeschrieben. Nach längerer Abwesenheit zeigt das Spiel einen Bericht: In der Web-Version bekommst du 10 % sofort und den Rest per Bonus-Video, in der iOS-App den vollen Betrag per Video – oder im Werbefrei-Modus mit einem Tap.'],
        ['p', 'Ein sichtbarer, aber nicht fokussierter Tab produziert mit halber Rate. Die Burn Rate läuft in allen Fällen mit vollem Tempo weiter – lange Abwesenheit kostet dich also Bestand, wenn deine Produktion nicht dagegen ankommt.'],
      ],
    },
    {
      id: 'bonus-videos',
      title: 'Bonus-Videos',
      blocks: [
        ['p', 'Einige Boni sind an ein kurzes Werbevideo gebunden: die Flüssigstickstoff-Kühlung (alle 90 Sekunden), ein Investoren-Zuschuss und der Power-Click-Boost (doppelter Tap-Wert für 30 Sekunden, alle 5 Minuten), das Einlösen eines Golden Memes, das Beenden einer Bubble sowie der Offline-Ertrag nach längerer Abwesenheit.'],
        ['p', 'In der iOS-App entfernt der einmalige Kauf **Werbefrei** alle Videos und Banner. Die Boni bleiben identisch – sie sind dann nur noch einen Tap entfernt. Mehr dazu auf der [Seite zur iOS-App](/ios-app).'],
      ],
    },
    {
      id: 'spielstand',
      title: 'Spielstand, Sprache und Neustart',
      blocks: [
        ['p', 'Der Spielstand wird automatisch lokal gespeichert – im Browser beziehungsweise auf dem Gerät. Es gibt kein Konto und keine Synchronisation über Geräte hinweg. Unter **Einstellungen** kannst du den Spielstand als Datei exportieren (als Backup oder für den Umzug auf ein anderes Gerät) und wieder importieren; der Import ersetzt den aktuellen Fortschritt.'],
        ['p', 'Das Spiel gibt es auf Deutsch und Englisch, umschaltbar in der Kopfzeile. „Spielstand löschen“ setzt alles zurück – nach Bestätigung und ohne Rückweg. Deinen Startup-Namen änderst du per Tap auf den Namen in der Kopfzeile; endet er auf „.ai“, bekommst du 10 % Hype-Bonus.'],
      ],
    },
    {
      id: 'teilen',
      title: 'Teilen: der VC-Pitch-Deck-Generator',
      blocks: [
        ['p', 'Über „Teilen“ in der Kopfzeile erzeugt das Spiel aus deinem aktuellen Stand eine Grafik im Hochformat – wahlweise als **Neon**-Story-Karte oder als **Consulting**-Bewertungsgutachten mit Management Summary, Finanzkennzahlen und Infrastruktur-Auslastung. Das Gutachten stuft deinen Jahresumsatz von 0,00 Dollar als „vorübergehende Kennzahl“ ein und empfiehlt eine Anschlussfinanzierung zu deutlich höherer Bewertung.'],
        ['p', 'Die Grafik lässt sich direkt über das Teilen-Menü deines Geräts verschicken oder als PNG speichern.'],
      ],
    },
  ],

  next: [
    { href: '/strategie', label: 'Strategie & Tipps', teaser: 'Was du wann kaufen solltest – und was nicht.' },
    { href: '/glossar', label: 'Buzzword-Glossar', teaser: 'Spiel- und Branchenbegriffe von AGI bis VC.' },
  ],
};
