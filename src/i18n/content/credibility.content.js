// Übersetzungen für die 30 Credibility-Baum-Knoten (Idealist- & Zyniker-Pfad, siehe
// src/data/credibilityTreeData.js). Struktur:
// CREDIBILITY_CONTENT[`idealist_<level>` | `cynic_<level>`] = { de: {name, quote}, en: {name, quote} }

export const CREDIBILITY_CONTENT = {
  idealist_1: { de: { name: 'Erste Selbstreflexion', quote: 'Kurzer Moment der Ehrlichkeit im Investorengespräch.' }, en: { name: 'First Moment of Self-Reflection', quote: 'A brief moment of honesty in the investor call.' } },
  idealist_2: { de: { name: 'Transparenzbericht veröffentlicht', quote: 'Wird von niemandem gelesen, zählt trotzdem.' }, en: { name: 'Transparency Report Published', quote: "Nobody reads it, but it still counts." } },
  idealist_3: { de: { name: 'Ethik-Beirat gegründet', quote: 'Berät, wird selten gehört.' }, en: { name: 'Ethics Board Founded', quote: 'Advises, rarely listened to.' } },
  idealist_4: { de: { name: 'Open-Source-Anteil veröffentlicht', quote: '10% des Codes, der Rest bleibt proprietär.' }, en: { name: 'Open-Source Share Released', quote: "10% of the code, the rest stays proprietary." } },
  idealist_5: { de: { name: 'Whistleblower-Kanal eingerichtet', quote: 'Existiert offiziell, genutzt eher selten.' }, en: { name: 'Whistleblower Channel Set Up', quote: 'Officially exists, rarely used.' } },
  idealist_6: { de: { name: 'Impact-Report statt Hype-Report', quote: 'Zahlen ehrlicher, Reichweite kleiner.' }, en: { name: 'Impact Report Instead of Hype Report', quote: 'Numbers more honest, reach smaller.' } },
  idealist_7: { de: { name: 'Externe Prüfung zugelassen', quote: 'Prüfer findet mehr, als geplant war.' }, en: { name: 'External Audit Permitted', quote: "The auditor finds more than planned." } },
  idealist_8: { de: { name: 'Sabbatical-Programm eingeführt', quote: 'Team kommt erholt, aber langsamer zurück.' }, en: { name: 'Sabbatical Program Introduced', quote: 'Team comes back rested, but slower.' } },
  idealist_9: { de: { name: 'Vier-Tage-Woche getestet', quote: 'Produktivität gleich, Werbung dafür laut.' }, en: { name: 'Four-Day Week Tested', quote: 'Same productivity, loud PR about it.' } },
  idealist_10: { de: { name: 'Gehälter offengelegt', quote: 'Ein paar unbequeme Gespräche folgen.' }, en: { name: 'Salaries Disclosed', quote: 'A few uncomfortable conversations follow.' } },
  idealist_11: { de: { name: 'Externe Ombudsperson berufen', quote: 'Wird konsultiert, bevor entschieden wird.' }, en: { name: 'External Ombudsperson Appointed', quote: 'Consulted before decisions are made.' } },
  idealist_12: { de: { name: 'Langfristige Roadmap', quote: 'Investoren nervös, Team entspannter.' }, en: { name: 'Long-Term Roadmap', quote: 'Investors nervous, team more relaxed.' } },
  idealist_13: { de: { name: 'Freiwillige Selbstregulierung', quote: 'Mehr, als das Gesetz verlangt hätte.' }, en: { name: 'Voluntary Self-Regulation', quote: "More than the law would have required." } },
  idealist_14: { de: { name: 'Gründer tritt zurück', quote: 'Nachfolge läuft überraschend geordnet.' }, en: { name: 'Founder Steps Down', quote: 'Succession runs surprisingly smoothly.' } },
  idealist_15: { de: { name: 'Firma als Stiftung umstrukturiert', quote: 'Gewinn fließt zurück, nicht raus.' }, en: { name: 'Company Restructured as a Foundation', quote: 'Profit flows back in, not out.' } },

  cynic_1: { de: { name: 'Investoren-Update ohne Substanz', quote: 'Klingt vielversprechend, sagt nichts.' }, en: { name: 'Investor Update Without Substance', quote: 'Sounds promising, says nothing.' } },
  cynic_2: { de: { name: 'Zweite Marke für dasselbe Produkt', quote: 'Doppelt so viele Logos, ein Produkt.' }, en: { name: 'Second Brand for the Same Product', quote: 'Twice the logos, one product.' } },
  cynic_3: { de: { name: 'Wachstum vor Profitabilität', quote: 'Klassiker. Funktioniert bis es nicht mehr geht.' }, en: { name: 'Growth Over Profitability', quote: "Classic. Works until it doesn't." } },
  cynic_4: { de: { name: 'Aggressive PR-Kampagne', quote: 'Mehr Aufmerksamkeit als Substanz.' }, en: { name: 'Aggressive PR Campaign', quote: 'More attention than substance.' } },
  cynic_5: { de: { name: 'Konkurrenzfirma undercut', quote: 'Preise runter, Qualität auch.' }, en: { name: 'Undercut a Competitor', quote: 'Prices down, quality too.' } },
  cynic_6: { de: { name: 'Wachstumszahlen kreativ dargestellt', quote: 'Die Grafik-Achse beginnt bei 90%.' }, en: { name: 'Growth Numbers Creatively Presented', quote: "The chart axis starts at 90%." } },
  cynic_7: { de: { name: 'Zweite Bewertungsrunde ohne Wachstum', quote: 'Bewertung steigt, Umsatz bleibt flach.' }, en: { name: 'Second Valuation Round Without Growth', quote: 'Valuation rises, revenue stays flat.' } },
  cynic_8: { de: { name: 'Aggressive Lieferantenverträge', quote: 'Lieferanten murren, Preise sinken nicht.' }, en: { name: 'Aggressive Supplier Contracts', quote: "Suppliers grumble, prices don't drop." } },
  cynic_9: { de: { name: 'Wachstum durch Übernahmen', quote: 'Integration wird noch geprüft.' }, en: { name: 'Growth Through Acquisitions', quote: 'Integration is still under review.' } },
  cynic_10: { de: { name: 'Zahlen vor dem IPO geschönt', quote: 'Prospekt liest sich besser als Realität.' }, en: { name: 'Numbers Polished Before the IPO', quote: 'Prospectus reads better than reality.' } },
  cynic_11: { de: { name: 'Kündigungswelle zur Kostensenkung', quote: 'Aktienkurs steigt am selben Tag.' }, en: { name: 'Layoff Wave to Cut Costs', quote: 'Stock price rises the same day.' } },
  cynic_12: { de: { name: 'Rückkauf eigener Aktien', quote: 'Kurzfristig gut, langfristig ungeklärt.' }, en: { name: 'Stock Buyback', quote: 'Good short-term, unresolved long-term.' } },
  cynic_13: { de: { name: 'Guidance nach unten korrigiert', quote: 'Wortwahl wichtiger als Zahl.' }, en: { name: 'Guidance Revised Downward', quote: 'Wording matters more than the number.' } },
  cynic_14: { de: { name: 'Bilanz durch Sonderposten bereinigt', quote: 'Einmalige Effekte zum 5. Mal.' }, en: { name: 'Balance Sheet Cleaned Up With Special Items', quote: 'One-off effects, for the 5th time.' } },
  cynic_15: { de: { name: 'Alles auf eine Karte gesetzt', quote: 'Funktioniert bis zum nächsten Pivot.' }, en: { name: 'All In on One Bet', quote: 'Works until the next pivot.' } },
};
