// 20 Gebäude aus dem Hype-Clicker-Konzept (Abschnitt 5)
// baseCost(Tier) = 15 * 13^(Tier-1) ; baseTps(Tier) = 0.1 * 11^(Tier-1)
// Anzeigetext liegt in src/i18n/content/buildings.content.js (Key: building_<id>_name)

const BUILDING_META = [
  { id: 'prompt_intern', icon: 'UserCog' },
  { id: 'chatbot_widget', icon: 'MessageSquare' },
  { id: 'prompt_engineer', icon: 'Terminal' },
  { id: 'gpu_rack', icon: 'Cpu' },
  { id: 'datacenter', icon: 'Server' },
  { id: 'web_scraper', icon: 'Scan' },
  { id: 'thought_leader', icon: 'Megaphone' },
  { id: 'vc_firm', icon: 'Landmark' },
  { id: 'hype_journalist', icon: 'Newspaper' },
  { id: 'keynote_stage', icon: 'Presentation' },
  { id: 'pivot_startup', icon: 'Rocket' },
  { id: 'token_burner', icon: 'Flame' },
  { id: 'pitch_deck', icon: 'FileText' },
  { id: 'lobbyist', icon: 'Scale' },
  { id: 'agi_clock', icon: 'Clock' },
  { id: 'gray_market_dc', icon: 'ShieldAlert' },
  { id: 'nuclear_reactor', icon: 'Atom' },
  { id: 'metaverse_city', icon: 'Globe' },
  { id: 'excel_sheet', icon: 'FileSpreadsheet' },
  { id: 'singularity', icon: 'Sparkles' },
];

export const BUILDINGS_DATA = BUILDING_META.map((meta, idx) => {
  const tier = idx + 1;
  return {
    id: meta.id,
    icon: meta.icon,
    baseCost: 15 * Math.pow(13, tier - 1),
    baseCps: 0.1 * Math.pow(11, tier - 1),
  };
});
