// Credibility Tree: Idealist Path (lowers Burn Rate) vs Cynic Path (boosts VPS, raises Burn Rate)
// Costs per level s (0..14): 1.35^s Credibility

export const IDEALIST_PATH = [
  { level: 1, name: 'Erste Selbstreflexion', burnDelta: -0.002, vpsBonus: 0, icon: 'HeartHandshake', quote: 'Kurzer Moment der Ehrlichkeit im Investorengespräch.' },
  { level: 2, name: 'Transparenzbericht veröffentlicht', burnDelta: -0.002, vpsBonus: 0, icon: 'FileCheck', quote: 'Wird von niemandem gelesen, zählt trotzdem.' },
  { level: 3, name: 'Ethik-Beirat gegründet', burnDelta: -0.003, vpsBonus: 0.02, icon: 'ShieldCheck', quote: 'Berät, wird selten gehört.' },
  { level: 4, name: 'Open-Source-Anteil veröffentlicht', burnDelta: -0.003, vpsBonus: 0, icon: 'Code', quote: '10% des Codes, der Rest bleibt proprietär.' },
  { level: 5, name: 'Whistleblower-Kanal eingerichtet', burnDelta: -0.004, vpsBonus: 0, icon: 'Siren', quote: 'Existiert offiziell, genutzt eher selten.' },
  { level: 6, name: 'Impact-Report statt Hype-Report', burnDelta: -0.004, vpsBonus: 0.05, icon: 'FileText', quote: 'Zahlen ehrlicher, Reichweite kleiner.' },
  { level: 7, name: 'Externe Prüfung zugelassen', burnDelta: -0.005, vpsBonus: 0, icon: 'SearchCheck', quote: 'Prüfer findet mehr, als geplant war.' },
  { level: 8, name: 'Sabbatical-Programm eingeführt', burnDelta: -0.005, vpsBonus: 0.05, icon: 'Sun', quote: 'Team kommt erholt, aber langsamer zurück.' },
  { level: 9, name: 'Vier-Tage-Woche getestet', burnDelta: -0.006, vpsBonus: 0, icon: 'CalendarCheck', quote: 'Produktivität gleich, Werbung dafür laut.' },
  { level: 10, name: 'Gehälter offengelegt', burnDelta: -0.006, vpsBonus: 0.03, icon: 'DollarSign', quote: 'Ein paar unbequeme Gespräche folgen.' },
  { level: 11, name: 'Externe Ombudsperson berufen', burnDelta: -0.007, vpsBonus: 0, icon: 'UserCheck', quote: 'Wird konsultiert, bevor entschieden wird.' },
  { level: 12, name: 'Langfristige Roadmap', burnDelta: -0.007, vpsBonus: 0.08, icon: 'Compass', quote: 'Investoren nervös, Team entspannter.' },
  { level: 13, name: 'Freiwillige Selbstregulierung', burnDelta: -0.008, vpsBonus: 0, icon: 'BookOpen', quote: 'Mehr, als das Gesetz verlangt hätte.' },
  { level: 14, name: 'Gründer tritt zurück', burnDelta: -0.010, vpsBonus: 0.05, icon: 'UserMinus', quote: 'Nachfolge läuft überraschend geordnet.' },
  { level: 15, name: 'Firma als Stiftung umstrukturiert', burnDelta: -0.015, vpsBonus: 0, icon: 'Building2', quote: 'Gewinn fließt zurück, nicht raus.' },
];

export const CYNIC_PATH = [
  { level: 1, name: 'Investoren-Update ohne Substanz', burnDelta: 0, vpsBonus: 0.05, icon: 'TrendingUp', quote: 'Klingt vielversprechend, sagt nichts.' },
  { level: 2, name: 'Zweite Marke für dasselbe Produkt', burnDelta: 0.002, vpsBonus: 0.05, icon: 'Copy', quote: 'Doppelt so viele Logos, ein Produkt.' },
  { level: 3, name: 'Wachstum vor Profitabilität', burnDelta: 0, vpsBonus: 0.08, icon: 'Zap', quote: 'Klassiker. Funktioniert bis es nicht mehr geht.' },
  { level: 4, name: 'Aggressive PR-Kampagne', burnDelta: 0.002, vpsBonus: 0.08, icon: 'Megaphone', quote: 'Mehr Aufmerksamkeit als Substanz.' },
  { level: 5, name: 'Konkurrenzfirma undercut', burnDelta: 0, vpsBonus: 0.10, icon: 'Scissors', quote: 'Preise runter, Qualität auch.' },
  { level: 6, name: 'Wachstumszahlen kreativ dargestellt', burnDelta: 0.003, vpsBonus: 0.10, icon: 'BarChart2', quote: 'Die Grafik-Achse beginnt bei 90%.' },
  { level: 7, name: 'Zweite Bewertungsrunde ohne Wachstum', burnDelta: 0, vpsBonus: 0.12, icon: 'DollarSign', quote: 'Bewertung steigt, Umsatz bleibt flach.' },
  { level: 8, name: 'Aggressive Lieferantenverträge', burnDelta: 0.003, vpsBonus: 0.12, icon: 'Truck', quote: 'Lieferanten murren, Preise sinken nicht.' },
  { level: 9, name: 'Wachstum durch Übernahmen', burnDelta: 0, vpsBonus: 0.15, icon: 'Briefcase', quote: 'Integration wird noch geprüft.' },
  { level: 10, name: 'Zahlen vor dem IPO geschönt', burnDelta: 0.004, vpsBonus: 0.15, icon: 'FileSpreadsheet', quote: 'Prospekt liest sich besser als Realität.' },
  { level: 11, name: 'Kündigungswelle zur Kostensenkung', burnDelta: 0, vpsBonus: 0.18, icon: 'UserX', quote: 'Aktienkurs steigt am selben Tag.' },
  { level: 12, name: 'Rückkauf eigener Aktien', burnDelta: 0.004, vpsBonus: 0.18, icon: 'RefreshCw', quote: 'Kurzfristig gut, langfristig ungeklärt.' },
  { level: 13, name: 'Guidance nach unten korrigiert', burnDelta: 0, vpsBonus: 0.20, icon: 'AlertTriangle', quote: 'Wortwahl wichtiger als Zahl.' },
  { level: 14, name: 'Bilanz durch Sonderposten bereinigt', burnDelta: 0.005, vpsBonus: 0.20, icon: 'Calculator', quote: 'Einmalige Effekte zum 5. Mal.' },
  { level: 15, name: 'Alles auf eine Karte gesetzt', burnDelta: 0.005, vpsBonus: 0.25, icon: 'Bomb', quote: 'Funktioniert bis zum nächsten Pivot.' },
];

export const EPOCHS = [
  { id: 'blockchain', name: 'Blockchain Era', theme: 'bronze', prefix: 'On-Chain: ' },
  { id: 'metaverse', name: 'Virtual World Era', theme: 'violet', prefix: 'Virtual World: ' },
  { id: 'ai', name: 'AI Hype Era', theme: 'navy_gold', prefix: '' },
  { id: 'quantum', name: 'Quantum Era', theme: 'petrol_silver', prefix: 'Quanten-' },
];
