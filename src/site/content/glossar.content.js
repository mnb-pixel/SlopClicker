// Buzzword-Glossar (/glossar): Spielbegriffe und die Branchenbegriffe, die das Spiel
// persifliert – alphabetisch sortiert (ohne Berücksichtigung von Groß-/Kleinschreibung).
const ENTRIES = [
  {
    term: 'AGI',
    def: 'Artificial General Intelligence – eine KI, die jede geistige Aufgabe eines Menschen beherrscht. In der Branche das Versprechen, das jede Bewertung rechtfertigt; im Spiel der Button, auf den du klickst. Die AGI-Countdown-Uhr (Engine Nr. 15) zählt seit Jahren zuverlässig darauf hinunter.',
  },
  {
    term: 'Ausbaustufe',
    def: 'Eines von 13 Upgrades pro Engine, freigeschaltet bei 1, 5, 10, 25, 50, 100, 150, 200, 250, 300, 400, 500 und 750 Exemplaren. Jede Stufe multipliziert die Produktion dieser Engine und hat einen eigenen Namen samt Kommentar. Siehe [Anleitung](/anleitung#upgrades).',
  },
  {
    term: 'Badge-Wand',
    def: 'Die „Board-zertifizierte Badge-Wand“ im Statistik-Tab: 80 Erfolge in neun Gruppen, filterbar nach freigeschaltet und gesperrt. Jeder Erfolg trägt einen satirischen Kommentar statt nur eines Hakens.',
  },
  {
    term: 'Black Swan',
    def: 'In der Finanzwelt ein unvorhersehbares Ereignis mit großer Wirkung. Im Spiel ein sehr seltenes Katastrophen-Ereignis pro Engine-Typ (frühestens alle 24 Stunden, meist Wochen dazwischen), das 15 bis 30 % der Exemplare dieser einen Engine vernichtet – etwa „Rechenzentrum brennt ab“.',
  },
  {
    term: 'Booster-Pack',
    def: 'Der einzige Weg an Buzzword-Karten: ein Pack enthält eine zufällige, noch nicht gesammelte Karte. Das erste kostet 600 Dollar, jedes weitere das Doppelte des vorherigen.',
  },
  {
    term: 'Bubble Pop',
    def: 'Negatives Markt-Ereignis, etwa alle 20 Minuten: 30 Sekunden lang minus 35 % Produktion und plus 1,5 Prozentpunkte Burn Rate. Lässt sich per Bonus-Video sofort beenden. Namensgeber ist die Blase, die im Setting irgendwann platzen muss – nur im Spiel nie endgültig.',
  },
  {
    term: 'Burn Rate',
    def: 'In der Branche das Geld, das ein Startup pro Monat verbrennt, bevor es Umsatz macht. Im Spiel ein Prozentsatz deines aktuellen Bestands, der jede Sekunde verschwindet: 0,2 % auf Hype-Stufe 1 bis 0,65 % auf Stufe 10, senkbar durch Greenwashing I, nie unter 0,1 %.',
  },
  {
    term: 'Buzzword',
    def: 'Ein Schlagwort, das Kompetenz signalisiert, ohne etwas festzulegen. Im Spiel eine von 80 Sammelkarten wie „Agentic Synergy“ oder „Sovereign Moat“, jede mit eigenem Produktionsbonus. Das komplette Album bringt rund +290 %.',
  },
  {
    term: 'Corporate Action',
    def: 'Eine Unternehmensmaßnahme pro Engine-Typ: drei Stufen Greenwashing und zwei Wellen Layoffs, insgesamt 100. Jede gekaufte Maßnahme verteuert alle weiteren um 15 %.',
  },
  {
    term: 'Duplikatschutz',
    def: 'Garantie des Booster-Packs, dass jede gezogene Karte neu ist. Welche Karte kommt, bleibt Zufall – nur doppelt gibt es nichts.',
  },
  {
    term: 'Engine',
    def: 'Eine Produktionsanlage, die passiv Bewertung erzeugt. 20 Typen vom Prompt-Praktikanten (15 Dollar) bis zur Singularity (21,9 Trilliarden Dollar); jede Stufe kostet das 13-Fache und produziert das 11-Fache der vorherigen.',
  },
  {
    term: 'Golden Meme',
    def: 'Positives Markt-Ereignis, etwa alle 20 Minuten: ein Angebot mit 20 Sekunden Bedenkzeit, das per Bonus-Video für 30 Sekunden die zehnfache Produktion freischaltet. Die Schlagzeilen dazu reichen von „Analyst nennt euch ‚das nächste große Ding‘. Schon wieder.“ bis „Fünf Sterne von Accounts ohne Profilbild“.',
  },
  {
    term: 'GPU-Hitze',
    def: 'Jeder manuelle Tap erhitzt die GPU um 2 °C, die Kühlung schafft 4 °C pro Sekunde (mit Upgrades 6 oder 10). Bei 100 °C überhitzt sie: 45 Sekunden ohne Kühlung, danach Freigabe unter 50 °C.',
  },
  {
    term: 'Greenwashing',
    def: 'Sich nachhaltiger darstellen, als man ist. Im Spiel drei Corporate Actions je Engine: Greenwashing I senkt die Burn Rate um 0,1 Prozentpunkte, Greenwashing II steigert die Produktion um 10 %, Greenwashing III ist rein kosmetisch – „Zertifikat gekauft, Server unverändert.“',
  },
  {
    term: 'Hype-Stufe',
    def: 'Zehn Stufen, abhängig von der Lebenszeit-Bewertung: Stufe 2 ab 10.000 Dollar, danach jede weitere ab dem Hundertfachen. Höhere Stufen erhöhen die Burn Rate.',
  },
  {
    term: 'Idle Clicker',
    def: 'Spielgenre (auch „Incremental Game“), in dem man anfangs selbst klickt und dann Automatisierung kauft, die von allein weiterproduziert – auch während man nicht spielt. Token Furnace gehört dazu, mit dem KI-Startup als Setting.',
  },
  {
    term: 'Kaufmodus',
    def: 'Die Umschaltung im Shop, wie viele Exemplare ein Klick kauft: 1, 10, 100 oder MAX (so viele, wie du dir gerade leisten kannst).',
  },
  {
    term: 'Layoff',
    def: 'Entlassungswelle – offiziell „Restrukturierung“, wie der Ticker im Spiel bestätigt. Zwei Corporate Actions je Engine: Layoff I steigert die Produktion um 20 % („Die anderen 90 % trainieren jetzt die AI“), Layoff II um weitere 15 %.',
  },
  {
    term: 'Lebenszeit-Bewertung',
    def: 'Alles, was du jemals erwirtschaftet hast – unabhängig von Ausgaben und Burn. Bestimmt die Hype-Stufe und schaltet Upgrades und Erfolge frei.',
  },
  {
    term: 'Netto-VPS',
    def: 'Valuation pro Sekunde nach Abzug der Burn Rate. Negativ, wenn dein Bestand so groß ist, dass die Burn Rate mehr frisst, als deine Engines produzieren.',
  },
  {
    term: 'Offline-Ertrag',
    def: 'Was deine Engines produzieren, während der Tab geschlossen ist: 10 % der normalen Rate, für maximal vier Stunden. Bis 30 Minuten Abwesenheit direkt gutgeschrieben, danach als Bericht mit Bonus-Video.',
  },
  {
    term: 'Pivot',
    def: 'Der Kurswechsel eines Startups, wenn das alte Geschäftsmodell nicht funktioniert – gern als „strategische Neuausrichtung“ verkauft. Im Spiel als Engine Nr. 11 verewigt: das Pivot-Startup.',
  },
  {
    term: 'Prompt Engineering',
    def: 'Die Kunst, einer KI die richtige Frage zu stellen. Im Spiel gleich zwei Engines: der Prompt-Praktikant (Nr. 1) und der Prompt Engineer (Nr. 3) – „Gleiche Aufgaben, neuer Titel, kein neues Gehalt.“',
  },
  {
    term: 'Runway',
    def: 'Die Zeit, die einem Startup bleibt, bis das Geld ausgeht – Kasse geteilt durch Burn Rate. Im Spiel eine der 20 Karten-Vokabeln („Exponential Runway“). Eine Runway im eigentlichen Sinn hast du in Token Furnace nicht: Die Burn Rate hört nie auf.',
  },
  {
    term: 'Slop',
    def: 'KI-generierter Massen-Content ohne Substanz. Im Spiel der Zähler für erzeugte Tokens und der Name des Haupt-Tabs: Slop Core.',
  },
  {
    term: 'Term Sheet',
    def: 'Die Absichtserklärung eines Investors mit den Eckdaten einer Finanzierung – Bewertung, Anteile, Bedingungen. Der Seed-Angel-Berater im Spiel „schreibt frühe Term Sheets in natürlicher Sprache“.',
  },
  {
    term: 'Token',
    def: 'Die Einheit, in der Sprachmodelle Text verarbeiten und abgerechnet werden – ein Wort sind grob ein bis zwei Token. Der Token Furnace ist der Ofen, in dem sie verbrannt werden; der Token-Burner ist Engine Nr. 12.',
  },
  {
    term: 'Unicorn',
    def: 'Ein Startup mit einer Bewertung von mindestens einer Milliarde Dollar. Im Spiel gibt es den Erfolg „Einhorn im Werden“ schon ab einer Million – man muss ja irgendwo anfangen.',
  },
  {
    term: 'Valuation',
    def: 'Die Unternehmensbewertung in Dollar – in Token Furnace gleichzeitig die einzige Währung. Sie steigt durch Taps und Engines, sinkt durch Käufe und die Burn Rate.',
  },
  {
    term: 'VC (Venture Capital)',
    def: 'Wagniskapital: Investoren, die Startups gegen Anteile finanzieren und auf den einen großen Exit hoffen. Im Spiel die VC-Firma (Engine Nr. 8) samt vier VC-Syndicate-Upgrades, die pro freigeschaltetem Erfolg zusätzliche Produktion bringen.',
  },
  {
    term: 'VPS',
    def: 'Valuation pro Sekunde – die Produktion aller Engines zusammen. Als Netto-VPS nach Abzug der Burn Rate in der Kopfzeile sichtbar.',
  },
  {
    term: 'Werbefrei',
    def: 'Einmaliger In-App-Kauf in der iOS-App: entfernt alle Videos und Banner dauerhaft. Sämtliche Boni bleiben erhalten und sind dann mit einem Tap statt eines Videos abholbar. Siehe [iOS-App](/ios-app).',
  },
];

export const GLOSSAR = {
  kicker: 'Glossar',
  title: 'Buzzword-Glossar',
  lead:
    'Token Furnace spricht die Sprache der Branche, die es persifliert. Hier stehen die Spielbegriffe – und was die Wörter dahinter außerhalb des Spiels bedeuten.',
  ctaText: 'Vokabeln gelernt? Dann fehlt nur noch das Startup.',
  items: [...ENTRIES]
    .sort((a, b) => a.term.localeCompare(b.term, 'de', { sensitivity: 'base' }))
    .map((entry) => ({ ...entry, id: entry.term.toLowerCase().replace(/[^a-z0-9äöü]+/g, '-').replace(/^-|-$/g, '') })),
  next: [
    { href: '/anleitung', label: 'Spielanleitung', teaser: 'Wie die Begriffe im Spiel zusammenwirken.' },
    { href: '/faq', label: 'Häufige Fragen', teaser: 'Spielstand, Werbung, Web vs. App.' },
  ],
};
