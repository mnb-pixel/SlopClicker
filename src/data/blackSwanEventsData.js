// Black Swan Events: ein ultra-seltenes Katastrophen-Event pro Engine-Typ (siehe
// buildingsData.js). Zerstört einen Teil (lossPct) der aktuell besessenen Menge dieser
// einen Engine - kein globaler Effekt, trifft immer nur den betroffenen Gebäudetyp.
// Timing/Cooldown-Logik (Mindestabstand 24h pro Engine + sehr niedrige Tick-Chance
// obendrauf) lebt in useGameStore.js.
export const BLACK_SWAN_EVENTS_DATA = [
  { buildingId: 'prompt_intern', title: '🦢 Praktikanten-Shitstorm', desc: 'Ein virales Meme über Ausbeutung sorgt für Massenkündigung.', lossPct: 0.20 },
  { buildingId: 'chatbot_widget', title: '🦢 Chatbot rät vom eigenen Produkt ab', desc: 'Ein Prompt-Leak lässt den Bot Kunden aktiv vergraulen. Widgets abgeschaltet.', lossPct: 0.20 },
  { buildingId: 'prompt_engineer', title: '🦢 Layoff-Welle', desc: '20% der Prompt Engineers werden über Nacht entlassen.', lossPct: 0.20 },
  { buildingId: 'gpu_rack', title: '🦢 Fehlerhafte GPU-Charge', desc: 'Ein Herstellerfehler zwingt zum Rückruf ganzer Racks.', lossPct: 0.20 },
  { buildingId: 'datacenter', title: '🦢 Rechenzentrum brennt ab', desc: 'Ein Kühlungsfehler setzt ein komplettes Rechenzentrum in Brand.', lossPct: 0.30 },
  { buildingId: 'web_scraper', title: '🦢 Anti-Bot-System schlägt zu', desc: 'Die komplette Scraper-Farm wird geblockt und stillgelegt.', lossPct: 0.20 },
  { buildingId: 'thought_leader', title: '🦢 Exodus der Thought Leader', desc: 'Reihenweise Wechsel zur Konkurrenz nach einem besseren Angebot.', lossPct: 0.20 },
  { buildingId: 'vc_firm', title: '🦢 VC-Fonds zieht sich zurück', desc: 'Ein Marktschock lässt Investoren fluchtartig aussteigen.', lossPct: 0.20 },
  { buildingId: 'hype_journalist', title: '🦢 Presse-Skandal', desc: 'Aufgedeckte Falschmeldungen kosten reihenweise Journalisten den Job.', lossPct: 0.20 },
  { buildingId: 'keynote_stage', title: '🦢 Bühneneinsturz', desc: 'Ein Sturm zerstört die Keynote-Infrastruktur mitten im Aufbau.', lossPct: 0.20 },
  { buildingId: 'pivot_startup', title: '🦢 Akquisitions-Fallout', desc: 'Zugekaufte Startups springen reihenweise wieder ab.', lossPct: 0.20 },
  { buildingId: 'token_burner', title: '🦢 Token-Burner überhitzt', desc: 'Ein Cluster brennt bei Überlast komplett durch.', lossPct: 0.25 },
  { buildingId: 'pitch_deck', title: '🦢 Pitch Decks als Fälschung enttarnt', desc: 'Investoren ziehen massenhaft ihre Zusagen zurück.', lossPct: 0.20 },
  { buildingId: 'lobbyist', title: '🦢 Lobbyisten-Skandal', desc: 'Aufgedeckte Bestechung kündigt reihenweise Verträge.', lossPct: 0.20 },
  { buildingId: 'agi_clock', title: '🦢 Manipulierte AGI-Clock aufgedeckt', desc: 'Das Vertrauen in die Countdown-Zahlen bricht ein.', lossPct: 0.20 },
  { buildingId: 'gray_market_dc', title: '🦢 Behörden-Razzia', desc: 'Ein Grey-Market-Rechenzentrum wird versiegelt.', lossPct: 0.25 },
  { buildingId: 'nuclear_reactor', title: '🦢 Reaktor-Störfall', desc: 'Ein Zwischenfall erzwingt die sofortige Teilabschaltung.', lossPct: 0.30 },
  { buildingId: 'metaverse_city', title: '🦢 Server-Kollaps', desc: 'Die Metaverse-City stürzt ab, Nutzer verschwinden für immer.', lossPct: 0.20 },
  { buildingId: 'excel_sheet', title: '🦢 Korrupte Zentral-Tabelle', desc: 'Eine fehlerhafte Formel überschreibt Wochen an Daten.', lossPct: 0.20 },
  { buildingId: 'singularity', title: '🦢 Instabile Singularität', desc: 'Eine kurze Fluktuation reißt einen Teil der Kapazität mit sich.', lossPct: 0.15 },
];
