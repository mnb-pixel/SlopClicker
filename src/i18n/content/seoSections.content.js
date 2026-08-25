// Kurze, themenspezifische Einleitungstexte für die Shop-/Stats-Tabs (siehe
// SeoContent.jsx). Ergänzt MANUAL_CONTENT (manual.content.js) um Abschnitte, die dort
// fehlen (Stats gibt es im Investoren-Prospekt nicht) bzw. bündelt, was auf der jeweiligen
// Tab-Route inhaltlich hingehört - kein neu erfundener Fülltext, sondern eine an der
// tatsächlichen Seitenstruktur ausgerichtete Aufteilung des ohnehin vorhandenen Materials.
export const SEO_SECTIONS_CONTENT = {
  de: {
    shopTitle: 'Der Shop',
    shopIntro: 'Hier baust du deine Infrastruktur aus: 20 Gebäudetypen vom Prompt-Praktikanten bis zum Dyson-Swarm-Rechenzentrum, dazu Effizienz-Upgrades pro Gebäude und Buzzword-Karten. Jedes Gebäude hat 13 Ausbaustufen mit eigenem Namen und Kommentar - kein generischer Zahlen-Fortschrittsbalken, sondern erzählte Meilensteine.',
    shopExamplesTitle: 'Beispiele für Ausbaustufen',
    shopEx1: '„Zweiter Monitor" (Prompt-Praktikant, Stufe 5): Jetzt mit 2 Chatbot-Tabs gleichzeitig sichtbar.',
    shopEx2: '„Praktikanten-Zahl übersteigt Festangestellte" (Prompt-Praktikant, Stufe 400): Niemand hat das geplant, aber es funktioniert irgendwie.',
    shopEx3: '„Recyceltes Pitch Deck – Fünfzig Slides Hype": Mindestens ein Pitch-Deck-Generator im Besitz.',

    statsTitle: 'Statistik & Erfolge',
    statsIntro: 'Der Statistik-Tab zeichnet manuelle Klicks, Gesamtbewertung, Überhitzungen und Spielzeit auf und schaltet dafür über 80 einzelne Erfolge frei - von ersten Gehversuchen bis zu absurden Meilensteinen weit im Endgame. Jeder Erfolg hat einen eigenen, satirischen Kommentar statt nur eines Hakens.',
    statsExamplesTitle: 'Beispiele für Erfolge',
    statsEx1: '„Tastatur-Zerstörer": 1.000 manuelle Taps ausgeführt.',
    statsEx2: '„Einhorn im Werden": Gesamtbewertung ≥ 1 Million Dollar erreicht.',
    statsEx3: '„Sonnensystem-Energienetz": mindestens einen Dyson-Swarm-Compute-Grid besessen.',
  },
  en: {
    shopTitle: 'The Shop',
    shopIntro: 'This is where you expand your infrastructure: 20 building types from the Prompt Intern to the Dyson Swarm data center, plus per-building efficiency upgrades and buzzword cards. Each building has 13 upgrade tiers with its own name and flavor line - not a generic progress bar, but narrated milestones.',
    shopExamplesTitle: 'Example upgrade tiers',
    shopEx1: '"Second Monitor" (Prompt Intern, tier 5): Now with 2 chatbot tabs visible at once.',
    shopEx2: '"Intern Headcount Exceeds Full-Timers" (Prompt Intern, tier 400): Nobody planned it, but it somehow works.',
    shopEx3: '"Recycled Pitch Deck – Fifty Slides of Hype": Own at least one Pitch Deck Generator.',

    statsTitle: 'Stats & Achievements',
    statsIntro: 'The Stats tab tracks manual clicks, total valuation, overheats, and playtime, and unlocks over 80 individual achievements along the way - from first baby steps to absurd late-game milestones. Every achievement gets its own satirical flavor line instead of just a checkmark.',
    statsExamplesTitle: 'Example achievements',
    statsEx1: '"Keyboard Destroyer": Tapped 1,000 times.',
    statsEx2: '"Unicorn in the Making": Reached a total valuation of $1 million.',
    statsEx3: '"Solar System Energy Grid": Owned at least one Dyson Swarm Compute Grid.',
  },
};
