// 100 Corporate Greenwashing & Layoff Action items (5 per building tier)

export const GREENWASHING_LAYOFFS_DATA = [
  // --- Prompt-Praktikant ---
  { id: 'gw_cursor_1', buildingId: 'cursor', type: 'greenwashing', tier: 1, costMult: 5, name: 'Praktikum als "nachhaltige Talentförderung"', quote: 'Klingt sozial, ändert am Gehalt nichts.', effectDesc: 'Senkt Burn Rate um -0.1%' },
  { id: 'gw_cursor_2', buildingId: 'cursor', type: 'greenwashing', tier: 2, costMult: 15, name: 'Praktikanten-Laptop generalüberholt', quote: 'War eh schon zwei Generationen alt.', effectDesc: 'Engine VPS +10%' },
  { id: 'gw_cursor_3', buildingId: 'cursor', type: 'greenwashing', tier: 3, costMult: 40, name: '"Circular Talent Pipeline" ausgerufen', quote: 'Neue Praktikanten ersetzen alte im Kreis.', effectDesc: 'Engine VPS +15%' },
  { id: 'lay_cursor_1', buildingId: 'cursor', type: 'layoff', tier: 1, costMult: 20, name: '10% der Praktikanten durch AI ersetzt', quote: 'Die anderen 90% trainieren jetzt die AI.', effectDesc: 'Engine VPS +20%' },
  { id: 'lay_cursor_2', buildingId: 'cursor', type: 'layoff', tier: 2, costMult: 60, name: 'Absage-Mails KI-generiert', quote: 'Klingen jetzt versehentlich sehr höflich.', effectDesc: 'Engine VPS +35%' },

  // --- Prompt Engineer ---
  { id: 'gw_prompt_1', buildingId: 'prompt_engineer', type: 'greenwashing', tier: 1, costMult: 5, name: 'Home-Office als "CO2-Einsparung" verbucht', quote: 'Pendelweg zählt jetzt als Klimaschutz.', effectDesc: 'Senkt Burn Rate um -0.1%' },
  { id: 'gw_prompt_2', buildingId: 'prompt_engineer', type: 'greenwashing', tier: 2, costMult: 15, name: 'Alte Prompts "wiederaufbereitet"', quote: 'Copy-Paste mit grünem Label.', effectDesc: 'Engine VPS +10%' },
  { id: 'gw_prompt_3', buildingId: 'prompt_engineer', type: 'greenwashing', tier: 3, costMult: 40, name: '"Circular Prompting" zur Methode erklärt', quote: 'Dieselben Prompts in anderer Reihenfolge.', effectDesc: 'Engine VPS +15%' },
  { id: 'lay_prompt_1', buildingId: 'prompt_engineer', type: 'layoff', tier: 1, costMult: 20, name: '10% der Prompt Engineers durch AI ersetzt', quote: 'Die AI schreibt jetzt die Prompts für sich selbst.', effectDesc: 'Engine VPS +20%' },
  { id: 'lay_prompt_2', buildingId: 'prompt_engineer', type: 'layoff', tier: 2, costMult: 60, name: 'Kündigung als perfekt formulierter Prompt', quote: 'Klingt professioneller als das Original.', effectDesc: 'Engine VPS +35%' },

  // --- Human-in-the-Loop AI ---
  { id: 'gw_turk_1', buildingId: 'fake_indian_turk', type: 'greenwashing', tier: 1, costMult: 5, name: 'Klimaneutrale Kaffee-Station', quote: 'Zertifikat gekauft, Kaffee bleibt schrecklich.', effectDesc: 'Senkt Burn Rate um -0.1%' },
  { id: 'gw_turk_2', buildingId: 'fake_indian_turk', type: 'greenwashing', tier: 2, costMult: 15, name: 'Tastatur-Recycling-Programm', quote: 'Alte Keycaps werden neu poliert.', effectDesc: 'Engine VPS +10%' },
  { id: 'gw_turk_3', buildingId: 'fake_indian_turk', type: 'greenwashing', tier: 3, costMult: 40, name: '"Circular Micro-Tasking" ausgerufen', quote: 'Tasks zirkulieren endlos.', effectDesc: 'Engine VPS +15%' },
  { id: 'lay_turk_1', buildingId: 'fake_indian_turk', type: 'layoff', tier: 1, costMult: 20, name: '10% der Contractors durch Makros ersetzt', quote: 'Makros tippen noch schneller.', effectDesc: 'Engine VPS +20%' },
  { id: 'lay_turk_2', buildingId: 'fake_indian_turk', type: 'layoff', tier: 2, costMult: 60, name: 'Automatische Kündigungsvorlage im Slack', quote: 'Bot schickt Abschieds-Meme.', effectDesc: 'Engine VPS +35%' },

  // --- 6-Finger Gen ---
  { id: 'gw_sixfinger_1', buildingId: 'six_finger_gen', type: 'greenwashing', tier: 1, costMult: 5, name: 'Pixel-Recycling-Initiative', quote: 'Verwendet alte Farbpalette wieder.', effectDesc: 'Senkt Burn Rate um -0.1%' },
  { id: 'gw_sixfinger_2', buildingId: 'six_finger_gen', type: 'greenwashing', tier: 2, costMult: 15, name: 'Grüner Modus für Finger-Rendering', quote: 'Zieht 2% weniger GPU-Strom.', effectDesc: 'Engine VPS +10%' },
  { id: 'gw_sixfinger_3', buildingId: 'six_finger_gen', type: 'greenwashing', tier: 3, costMult: 40, name: '"Circular Art Generation" erklärt', quote: 'Generiert Bilder aus alten Bildern.', effectDesc: 'Engine VPS +15%' },
  { id: 'lay_sixfinger_1', buildingId: 'six_finger_gen', type: 'layoff', tier: 1, costMult: 20, name: '10% der Illustratoren entlassen', quote: '6-Finger Gen übernimmt das Art-Department.', effectDesc: 'Engine VPS +20%' },
  { id: 'lay_sixfinger_2', buildingId: 'six_finger_gen', type: 'layoff', tier: 2, costMult: 60, name: 'Kündigungs-Postkarte von AI gezeichnet', quote: 'Mit 7 Fingern zum Abschied gewinkt.', effectDesc: 'Engine VPS +35%' },

  // --- 1-Page Wrapper Startup ---
  { id: 'gw_wrapper_1', buildingId: 'wrapper_startup', type: 'greenwashing', tier: 1, costMult: 5, name: 'Grüner Modus im API-Wrapper', quote: 'Darkmode spart OLED-Strom.', effectDesc: 'Senkt Burn Rate um -0.1%' },
  { id: 'gw_wrapper_2', buildingId: 'wrapper_startup', type: 'greenwashing', tier: 2, costMult: 15, name: 'Eco-Friendly Pitch Deck', quote: 'Auf Recycling-Papier gedruckt.', effectDesc: 'Engine VPS +10%' },
  { id: 'gw_wrapper_3', buildingId: 'wrapper_startup', type: 'greenwashing', tier: 3, costMult: 40, name: '"Circular Wrapper Economy"', quote: 'Wrapper wickelt Wrapper ein.', effectDesc: 'Engine VPS +15%' },
  { id: 'lay_wrapper_1', buildingId: 'wrapper_startup', type: 'layoff', tier: 1, costMult: 20, name: '10% des Dev-Teams freigesetzt', quote: 'API-Script schreibt sich von allein.', effectDesc: 'Engine VPS +20%' },
  { id: 'lay_wrapper_2', buildingId: 'wrapper_startup', type: 'layoff', tier: 2, costMult: 60, name: 'Kündigung per JSON-Endpoint', quote: 'Status: 410 Gone.', effectDesc: 'Engine VPS +35%' },
];
