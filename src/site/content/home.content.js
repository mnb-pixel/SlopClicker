// Startseite (/). Zahlen stammen aus den Spieldaten: 20 Engines (buildingsData.js),
// 13 Ausbaustufen je Engine (upgrades.content.js), 80 Erfolge (achievementsData.js),
// 80 Buzzword-Karten (buzzwordsData.js), 100 Corporate Actions (greenwashingLayoffsData.js).
export const HOME = {
  hero: {
    kicker: 'Kostenloser Idle Clicker · Browser & iOS',
    title: 'Baue das wertvollste KI-Startup der Welt. Ohne Produkt.',
    lead:
      'Token Furnace ist ein satirischer Idle Clicker über den KI-Hype: Du klickst dich vom ersten Prompt-Praktikanten bis zur Milliardenbewertung – mit Buzzwords, GPU-Racks, Greenwashing und einem Pitch Deck, das niemand gelesen hat. Kostenlos, ohne Anmeldung, direkt im Browser.',
    shotAlt:
      'Hauptbildschirm von Token Furnace: Bewertung von 2,78 Milliarden Dollar, Netto-VPS, Burn Rate, GPU-Hitze und der große AGI-generieren-Button',
  },

  facts: [
    { value: '20', label: 'Engine-Typen' },
    { value: '13', label: 'Ausbaustufen je Engine' },
    { value: '80', label: 'Buzzword-Karten' },
    { value: '80', label: 'Erfolge' },
  ],

  about: {
    title: 'Was ist Token Furnace?',
    paragraphs: [
      'Token Furnace ist ein Idle Clicker – ein Spiel, in dem du zunächst selbst klickst und dann Schritt für Schritt Automatisierung aufbaust, die für dich weiterarbeitet. Die Satire liegt im Setting: Du führst ein KI-Startup, dessen einzige Kennzahl die Unternehmensbewertung ist. Umsatz gibt es nicht, ein Produkt auch nicht. Was es gibt, sind Investoren, Hype-Stufen und eine Burn Rate, die jede Sekunde an deinem Wert nagt.',
      'Jeder Klick auf den AGI-Kern erzeugt Unternehmenswert. Mit dem Geld kaufst du Engines – 20 Typen vom Prompt-Praktikanten über GPU-Racks und Rechenzentren bis zur Singularity –, die passiv weiterproduzieren. Dazu kommen 13 Ausbaustufen für jede Engine, 100 Corporate Actions zwischen Greenwashing und Massenentlassung, ein Sammelalbum mit 80 Buzzword-Karten und 80 Erfolge, die jeden Meilenstein trocken kommentieren.',
      'Das Spiel läuft komplett im Browser, braucht kein Konto und speichert deinen Fortschritt lokal auf deinem Gerät. Deine Infrastruktur arbeitet auch weiter, wenn der Tab geschlossen ist – beim nächsten Öffnen bekommst du einen Bericht über den Offline-Ertrag. Wer lieber unterwegs spielt, bekommt dasselbe Spiel als [iOS-App „Tokenkamin: AI Clicker“](/ios-app).',
    ],
  },

  features: [
    {
      id: 'agi-kern',
      kicker: 'Slop Core',
      title: 'Der AGI-Kern: klicken, überhitzen, abkühlen',
      paragraphs: [
        'Im Zentrum steht ein Button: „AGI generieren“. Jeder Tap bringt Unternehmenswert – und erhitzt deine GPU um 2 °C. Bei 100 °C überhitzt sie, der Button sperrt sich, und die passive Kühlung setzt erst nach 45 Sekunden ein. Wer zu gierig klickt, verliert Zeit; wer das Tempo hält, kommt schneller voran.',
        'Darunter siehst du deine eingesetzten Engines in Echtzeit: wie viele du besitzt, was jede pro Sekunde beisteuert und wie sich dein Netto-VPS aus Produktion und Burn Rate zusammensetzt.',
      ],
      image: '/screenshots/core.webp',
      alt: 'Slop-Core-Ansicht mit AGI-Kern-Button, GPU-Hitze-Anzeige und der Liste eingesetzter Engines',
      caption: 'Slop Core: Bewertung, Burn Rate, GPU-Hitze und der AGI-Kern.',
    },
    {
      id: 'engines',
      kicker: 'Shop · AI Engines',
      title: '20 Engines, vom Praktikanten bis zur Singularity',
      paragraphs: [
        'Engines sind deine Produktionsanlagen. Der Prompt-Praktikant kostet 15 Dollar und bringt ein paar Cent pro Sekunde; jede weitere Stufe – Chatbot-Widget, Prompt Engineer, GPU-Rack, Rechenzentrum, Web-Scraper, ProNet-Thought-Leader, VC-Firma – kostet das 13-Fache und produziert das 11-Fache. Ganz am Ende warten der Kleine Atomreaktor, die Selbstbewusste Excel-Tabelle und die Singularity.',
        'Der Kaufmodus (1, 10, 100, MAX) erspart dir das Dauerklicken, und der Shop zeigt für jede Engine, welchen Anteil sie an deinem Gesamteinkommen hat.',
      ],
      image: '/screenshots/shop.webp',
      alt: 'Shop-Ansicht mit den AI Engines Prompt-Praktikant, Chatbot-Widget, Prompt Engineer, GPU-Rack und Rechenzentrum samt Kaufmodus',
      caption: 'Der Shop mit Kaufmodus 1 / 10 / 100 / MAX.',
      reverse: true,
    },
    {
      id: 'ausbaustufen',
      kicker: 'Shop · Upgrades',
      title: '13 Ausbaustufen pro Engine, jede mit eigener Geschichte',
      paragraphs: [
        'Sobald du 1, 5, 10, 25 und schließlich 750 Exemplare einer Engine besitzt, schaltet sich die nächste Ausbaustufe frei. Statt eines anonymen „+10 %“ bekommt jede Stufe einen Namen und einen Kommentar: Der Praktikant kopiert eine Notiz-Tool-Vorlage („Fühlt sich jetzt wie Produktivität an“), bekommt einen zweiten Monitor und wird zum „Junior AI Associate“ befördert – gleiche Aufgaben, neuer Titel, kein neues Gehalt.',
        'Dazu kommen Klick-Upgrades von der Ergonomischen Cyber-Maus bis zum Unterlichtgeschwindigkeits-Tap-Strahl, bessere GPU-Kühlung und globale Multiplikatoren wie die Föderale KI-Subventions-Lücke.',
      ],
      image: '/screenshots/upgrades.webp',
      alt: 'Upgrade-Kacheln im Shop mit geöffneter Detailkarte „Notiz-Tool-Vorlage kopiert“ für 150 Dollar',
      caption: 'Upgrades: Kachel antippen, Kommentar lesen, kaufen.',
    },
    {
      id: 'corporate-actions',
      kicker: 'Shop · Corporate Actions',
      title: 'Greenwashing oder Layoffs – du entscheidest',
      paragraphs: [
        'Corporate Actions sind Maßnahmen pro Engine-Typ. Greenwashing I senkt die Burn Rate um 0,1 Prozentpunkte („Praktikum als nachhaltige Talentförderung deklariert – klingt sozial, ändert am Gehalt nichts“). Greenwashing II erhöht die Produktion der Engine, Greenwashing III ist reine Kosmetik fürs Image. Layoffs bringen mehr: „10 % der Praktikanten durch AI ersetzt“ steigert den Output um 20 %, die zweite Welle noch einmal um 15 %.',
        'Jede gekaufte Maßnahme macht alle weiteren um 15 % teurer – wer das ganze Programm durchzieht, zahlt am Ende ein Vielfaches. 100 Maßnahmen gibt es insgesamt, fünf für jede Engine.',
      ],
      image: '/screenshots/corporate.webp',
      alt: 'Corporate-Actions-Liste mit Greenwashing- und Layoff-Maßnahmen für Prompt-Praktikant und Chatbot-Widget',
      caption: 'Corporate Actions & Greenwashing Protocol.',
      reverse: true,
    },
    {
      id: 'buzzword-karten',
      kicker: 'Shop · Buzzwords',
      title: '80 Buzzword-Karten im Booster-Pack',
      paragraphs: [
        'Buzzword-Karten sind Sammelkarten mit Namen wie „Agentic Synergy“, „Quantum-Ready Compute Layer“ oder „Democratized Talent Density“ – 20 Modifikatoren mal 20 Begriffe, in vier Seltenheitsstufen: 40 Common, 25 Uncommon, 10 Rare, 5 Legendary. Jede Karte erhöht deine globale Produktion, und jede neue Karte ist wertvoller als die vorherige; das komplette Album summiert sich auf rund +290 %.',
        'Karten gibt es nur im Booster-Pack: Das erste kostet 600 Dollar, jedes weitere das Doppelte. Ein Duplikatschutz sorgt dafür, dass du nie eine Karte zweimal ziehst.',
      ],
      image: '/screenshots/buzzwords.webp',
      alt: 'Buzzword-Bereich mit Trading Card Booster Pack, Sammelalbum-Fortschritt und den Seltenheitsstufen Common bis Legendary',
      caption: 'Booster-Pack und Sammelalbum-Portfolio.',
    },
    {
      id: 'erfolge',
      kicker: 'Statistik · Erfolge',
      title: '80 Erfolge auf der Badge-Wand',
      paragraphs: [
        'Die Board-zertifizierte Badge-Wand hält fest, was du erreicht hast: Tap-Meilensteine vom ersten Prompt bis zu 100.000 manuellen Taps, Bewertungsstufen von 1.000 Dollar bis zur Billion, ein Badge für jede Engine, für gesammelte Karten, Upgrades und Corporate Actions – und ein paar Sonderfälle wie der „.ai“-Domainbonus, wenn dein Startup-Name auf .ai endet.',
        'Jeder Erfolg trägt einen eigenen Kommentar statt nur eines Hakens: „Tastatur-Zerstörer“ für 1.000 Taps, „Einhorn im Werden“ ab einer Million. Der Statistik-Tab zeigt daneben Lebenszeit-Bewertung, manuelle Taps und Überhitzungen.',
      ],
      image: '/screenshots/badges.webp',
      alt: 'Board-zertifizierte Badge-Wand mit 30 von 80 freigeschalteten Erfolgen, darunter Erster Prompt gesendet und Tastatur-Zerstörer',
      caption: 'Die Badge-Wand mit Suche und Filter.',
      reverse: true,
    },
    {
      id: 'pitch-deck',
      kicker: 'Teilen',
      title: 'Der VC-Pitch-Deck-Generator',
      paragraphs: [
        'Mit einem Tap verwandelt das Spiel deinen aktuellen Stand in ein Bewertungsgutachten im Stil einer Unternehmensberatung – oder in eine Neon-Story-Karte fürs Handy. Darin steht dann schwarz auf weiß: Jahresumsatz 0,00 Dollar („100 % purer Hype“), Bewertung 2,77 Milliarden, Empfehlung: Anschlussfinanzierung zu deutlich höherer Bewertung.',
        'Das Bild lässt sich direkt teilen oder als PNG speichern. Es ist der Moment, in dem die Satire am besten funktioniert: Die Zahlen sind echt, die Logik dahinter ist die der Branche.',
      ],
      image: '/screenshots/pitchdeck.webp',
      alt: 'VC-Pitch-Deck-Generator im Consulting-Design: Bewertungsgutachten mit Management Summary und Finanzkennzahlen',
      caption: 'Bewertungsgutachten im Consulting-Design.',
    },
  ],

  howTo: {
    title: 'So spielst du',
    steps: [
      {
        title: 'Klicken',
        text: 'Tippe auf „AGI generieren“. Jeder Tap bringt Unternehmenswert – am Anfang einen Dollar. Behalte die GPU-Temperatur im Blick: Bei 100 °C ist erst einmal Pause.',
      },
      {
        title: 'Engines kaufen',
        text: 'Sobald du 15 Dollar hast, stellst du im Shop den ersten Prompt-Praktikanten ein. Engines produzieren passiv, auch während du nicht klickst.',
      },
      {
        title: 'Upgrades, Karten, Maßnahmen',
        text: 'Ausbaustufen vervielfachen den Output einzelner Engines, Buzzword-Karten den deiner ganzen Firma. Corporate Actions senken die Burn Rate oder steigern die Produktion.',
      },
      {
        title: 'Burn Rate managen',
        text: 'Mit jeder Hype-Stufe steigt die Burn Rate, die pro Sekunde an deinem Bestand zehrt. Wachse schneller, als sie frisst – oder investiere in Greenwashing.',
      },
    ],
  },

  faq: {
    title: 'Kurz gefragt',
    items: [
      {
        q: 'Ist Token Furnace kostenlos?',
        a: 'Ja. Die Web-Version ist komplett kostenlos, die iOS-App ebenfalls – dort gibt es optional einen einmaligen Werbefrei-Kauf, der alle Videos und Banner entfernt.',
      },
      {
        q: 'Muss ich mich registrieren?',
        a: 'Nein. Es gibt kein Konto und keine Anmeldung. Dein Fortschritt wird automatisch lokal gespeichert und lässt sich als Datei exportieren.',
      },
      {
        q: 'Läuft das Spiel offline weiter?',
        a: 'Deine Engines produzieren auch bei geschlossenem Tab weiter – mit reduzierter Rate und für maximal vier Stunden. Beim nächsten Öffnen bekommst du den Offline-Bericht.',
      },
      {
        q: 'Wie lange dauert eine Runde?',
        a: 'Token Furnace hat kein Ende im klassischen Sinn. Die ersten Milliarden erreichst du in ein, zwei Sitzungen; das komplette Buzzword-Album und die letzten Engines sind Projekte für Wochen.',
      },
      {
        q: 'Worum geht es eigentlich?',
        a: 'Um eine Branche, in der die Bewertung wichtiger ist als das Produkt. Alles im Spiel – Firmen, Personen, Schlagzeilen – ist frei erfunden. Mehr dazu in den [häufigen Fragen](/faq).',
      },
    ],
  },

  satire: {
    title: 'Die Satire dahinter',
    paragraphs: [
      'Token Furnace nimmt die Mechanik jedes Idle-Games – Zahlen, die immer nur wachsen – und legt sie über eine Branche, in der genau das als Geschäftsmodell durchgeht. Die Bewertung steigt, der Umsatz bleibt bei null, und der Ticker meldet dazu: „CFO erklärt: Cashflow negativ, Momentum dafür sehr positiv.“',
      'Die Engines, Upgrades und Erfolge erzählen dabei nebenbei die Geschichte eines Startups, das genau so gut laufen könnte: unbezahlte Praktika als „Erfahrung sammeln“, Layoffs als „Restrukturierung“, ein Pitch Deck mit fünfzig Folien Hype und ein Board, das seine eigenen Aktienoptionen genehmigt. Nichts davon ist echt. Vieles davon kommt einem bekannt vor.',
    ],
  },

  next: [
    { href: '/anleitung', label: 'Spielanleitung', teaser: 'Alle Mechaniken von Valuation bis Black Swan im Detail.' },
    { href: '/strategie', label: 'Strategie & Tipps', teaser: 'Early, Mid und Late Game – und was du besser nicht kaufst.' },
  ],
};
