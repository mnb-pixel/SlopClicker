// Strategie & Tipps (/strategie). Rechenbasis wie in anleitung.content.js; die Halbwertszeit
// des Bestands folgt aus der Burn Rate (ln 2 / 0,002 ≈ 347 s auf Stufe 1, ln 2 / 0,0065 ≈ 107 s
// auf Stufe 10), die Greenwashing-I-Preise aus 5 × Engine-Basispreis.
export const STRATEGIE = {
  kicker: 'Strategie & Tipps',
  title: 'Schneller zur Milliarde – ohne alles zu verbrennen',
  lead:
    'Token Furnace belohnt nicht das schnellste Klicken, sondern das richtige Timing: wann eine Engine mehr bringt als ein Upgrade, wann sich Greenwashing lohnt und warum ein volles Konto das Schlechteste ist, was dir passieren kann.',
  ctaText: 'Theorie ist gut, ein zweiter Prompt-Praktikant ist besser.',

  sections: [
    {
      id: 'early-game',
      title: 'Die ersten zehn Minuten',
      blocks: [
        ['ul', [
          'Klicke im Rhythmus von etwa **zwei Taps pro Sekunde**. Das entspricht genau der Standardkühlung von 4 °C/s – so überhitzt die GPU nie, und du verlierst keine Minute an die Zwangspause.',
          'Kaufe bei 15 Dollar den ersten **Prompt-Praktikanten**, dann weitere, sobald du sie dir leisten kannst. Passive Produktion schlägt jeden Klick, sobald sie einmal läuft.',
          'Die **Ergonomische Cyber-Maus** (100 Dollar) ist das erste Upgrade, das sich lohnt: Sie erhöht den Wert jedes Taps, und getappt wird am Anfang viel.',
          'Bei 195 Dollar folgt das **Chatbot-Widget**. Als Faustregel gilt: Kaufe die Engine, bei der das Verhältnis aus Preis und Produktion pro Sekunde am besten ist – der Shop zeigt beides.',
          'Die ersten **Ausbaustufen** (bei 1, 5 und 10 Exemplaren) kosten das Zehnfache des Engine-Basispreises und amortisieren sich in wenigen Minuten. Nimm sie mit, sobald sie auftauchen.',
        ]],
      ],
    },
    {
      id: 'mid-game',
      title: 'Mid Game: skalieren, ohne zu verbrennen',
      blocks: [
        ['p', 'Ab der zweiten Hype-Stufe (10.000 Dollar Lebenszeit-Bewertung) beginnt die Burn Rate zu zählen. Ab hier gilt: Die Bewertung ist kein Kontostand, sondern Baumaterial.'],
        ['ul', [
          '**Kaufmodus nutzen.** Stelle bei günstigen Engines auf 10 oder 100, um schnell die Ausbaustufen bei 100, 150 und 200 Exemplaren zu erreichen. Jede Stufe multipliziert die Produktion dieser Engine – und die Stufen kommen umso schneller, je mehr du auf einmal kaufst.',
          '**Greenwashing I ist die günstigste Burn-Rate-Senkung im Spiel.** Beim Prompt-Praktikanten kostet es 75 Dollar, beim Chatbot-Widget 975 – und jede Maßnahme senkt die Burn Rate um 0,1 Prozentpunkte. Mit fünf gekauften Greenwashing-I-Maßnahmen liegt die Burn Rate bis Stufe 3 bereits an der Untergrenze von 0,1 %.',
          '**Globale Multiplikatoren zuerst.** Der Unterwürfige Marketing-Pitch (+10 %, 50.000 Dollar) und die World-Tour-Keynote-Präsentation (+20 %, 10 Millionen) wirken auf alles, was du besitzt und noch kaufen wirst.',
          '**Kühlung nachrüsten.** Die Flüssigkeitsgekühlte Wärmeleitpaste (25.000 Dollar) hebt die Kühlung auf 6 °C/s – drei Taps pro Sekunde ohne Überhitzung.',
          '**Layoff I auf deine stärkste Engine.** Plus 20 % Produktion für das 20-Fache des Basispreises rechnet sich bei der Engine, die den größten Anteil an deinem Einkommen hat. Der Shop zeigt den Anteil in Prozent.',
        ]],
        ['callout', 'Reihenfolge bei Corporate Actions', 'Jede gekaufte Maßnahme verteuert alle weiteren um 15 %. Kaufe deshalb zuerst, was wirkt – Greenwashing I für die Burn Rate, Layoff I und Greenwashing II für die Produktion – und hebe dir Greenwashing III (rein kosmetisch) für später auf, wenn Geld keine Rolle mehr spielt.'],
      ],
    },
    {
      id: 'late-game',
      title: 'Late Game: Karten, Milliarden, Geduld',
      blocks: [
        ['ul', [
          '**Booster-Packs verdoppeln sich.** Das erste Pack kostet 600 Dollar, das zehnte rund 307.000, das zwanzigste rund 315 Millionen, das dreißigste rund 322 Milliarden. Das komplette Album mit 80 Karten ist ein Projekt für Wochen – dafür bringt jede neue Karte mehr als die vorherige, insgesamt bis zu +290 % Produktion.',
          '**Karten sind Zufall.** Der Duplikatschutz garantiert nur, dass jede gezogene Karte neu ist – welche Seltenheit kommt, kannst du nicht steuern. Plane Packs deshalb als Investition in den Gesamtbonus, nicht als Jagd auf eine bestimmte Karte.',
          '**VC-Syndicate lohnt sich spät.** Die vier Upgrades zahlen 0,1 bis 0,5 % pro freigeschaltetem Erfolg. Mit 40 Erfolgen sind das zusammen bis zu +44 % – sinnvoll, sobald die VC-Firma steht und du ohnehin Erfolge sammelst.',
          '**Die Föderale KI-Subventions-Lücke** (+40 %, eine Milliarde Dollar) ist das stärkste einzelne Upgrade im Spiel. Sobald du sie dir leisten kannst, gibt es keinen Grund zu warten.',
          '**Black Swans einkalkulieren.** Sehr selten verlierst du 15 bis 30 % einer einzelnen Engine. Wer sein Einkommen auf mehrere Engine-Typen verteilt, spürt das kaum.',
        ]],
      ],
    },
    {
      id: 'burn-rate',
      title: 'Burn Rate im Griff',
      blocks: [
        ['p', 'Ein negativer Netto-VPS ist kein Fehler: Dein Bestand ist so groß, dass die Burn Rate mehr frisst, als deine Engines produzieren. Zwei Auswege – Geld ausgeben (ein kleinerer Bestand brennt weniger) oder Produktion erhöhen. Bewertung zu horten lohnt sich nie: Auf Stufe 1 halbiert sich ungenutzter Bestand in rund sechs Minuten, auf Stufe 10 in unter zwei.'],
        ['ul', [
          'Behalte im Kopf, dass die Burn Rate mit der **Lebenszeit**-Bewertung steigt, nicht mit dem aktuellen Bestand. Du kannst ihr also nicht durch Ausgeben entkommen – nur ihre Wirkung klein halten.',
          'Greenwashing I für alle Engine-Typen, die du besitzt, ist der direkteste Hebel. Zehn Maßnahmen bedeuten minus 1 Prozentpunkt – mehr, als die Hype-Stufen 1 bis 10 zusammen aufschlagen.',
          'Während einer **Bubble** (plus 1,5 Prozentpunkte für 30 Sekunden) kann das Beenden per Bonus-Video im Late Game Milliarden wert sein. Im Early Game kannst du sie einfach aussitzen.',
        ]],
      ],
    },
    {
      id: 'klicken',
      title: 'Klicken: Rhythmus statt Hektik',
      blocks: [
        ['p', 'Jeder Tap bringt 2 °C. Bei 4 °C/s Kühlung sind zwei Taps pro Sekunde dauerhaft möglich, bei 6 °C/s drei, bei 10 °C/s fünf. Wer schneller tippt, erreicht die 100 °C – und dann passiert 45 Sekunden lang gar nichts, bevor die Kühlung überhaupt beginnt. Mit Standardkühlung dauert die komplette Pause bis unter 50 °C rund eine Minute.'],
        ['ul', [
          'Ein bewusster **Sprint** kann sich lohnen, wenn du dir eine Pause leisten kannst – etwa direkt bevor du den Tab ohnehin schließt.',
          'Die **Flüssigstickstoff-Kühlung** setzt die Temperatur per Bonus-Video sofort auf 0 °C und verdoppelt für 30 Sekunden den Tap-Wert – der beste Moment für einen Sprint, alle 90 Sekunden verfügbar.',
          'Klick-Upgrades verlieren im Late Game an Bedeutung: Sobald deine Engines Millionen pro Sekunde produzieren, ist Klicken nur noch ein Zeitvertreib. Investiere dann in Engines und Karten.',
        ]],
      ],
    },
    {
      id: 'ereignisse-nutzen',
      title: 'Ereignisse nutzen',
      blocks: [
        ['ul', [
          '**Golden Meme:** Das Angebot bleibt 20 Sekunden offen. Zehnfache Produktion für 30 Sekunden ist im Mid Game oft mehr, als du in den zehn Minuten davor verdient hast – einlösen lohnt sich praktisch immer.',
          '**Bubble Pop:** Minus 35 % Produktion und höhere Burn Rate für 30 Sekunden. Die Frage ist nur, ob 30 Sekunden Verlust ein Video wert sind – je größer dein Bestand, desto eher ja.',
          '**Offline-Bericht:** Nach mehr als 30 Minuten Abwesenheit wartet ein Teil des Ertrags auf ein Bonus-Video. Der Offline-Ertrag ist auf vier Stunden gedeckelt – wer täglich einmal vorbeischaut, holt das Maximum heraus.',
        ]],
      ],
    },
    {
      id: 'haeufige-fehler',
      title: 'Häufige Fehler',
      blocks: [
        ['ul', [
          '**Sparen für die nächste große Engine.** Während du sparst, brennt die Burn Rate. Meist ist es schneller, kleinere Engines und Upgrades zu kaufen und die Produktion anzuheben.',
          '**Greenwashing III früh kaufen.** Es ändert nichts an den Zahlen – und verteuert alle folgenden Maßnahmen um 15 %.',
          '**Dauerhaft überhitzen.** Jede Überhitzung kostet rund eine Minute Klickzeit. Zwei Taps pro Sekunde sind auf Dauer mehr als ein Sprint mit Pause.',
          '**Den Tab im Hintergrund liegen lassen** und volle Produktion erwarten. Im Hintergrund gilt der Offline-Ertrag: 10 % der Rate, maximal vier Stunden.',
          '**Ohne Backup das Gerät wechseln.** Der Spielstand liegt nur lokal. Vorher unter Einstellungen exportieren, danach importieren.',
        ]],
      ],
    },
  ],

  next: [
    { href: '/anleitung', label: 'Spielanleitung', teaser: 'Alle Zahlen und Mechaniken im Detail.' },
    { href: '/glossar', label: 'Buzzword-Glossar', teaser: 'Was Burn Rate, Runway und Term Sheet eigentlich bedeuten.' },
  ],
};
