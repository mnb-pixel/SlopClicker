import { BUILDINGS_DATA } from './buildingsData';

// 80 Badges / Achievements
export const ACHIEVEMENTS_DATA = [
  // 1. TAP MILESTONES (6)
  { id: 'tap_1', icon: 'Terminal', check: (s) => s.stats.totalClicks >= 1 },
  { id: 'tap_100', icon: 'Zap', check: (s) => s.stats.totalClicks >= 100 },
  { id: 'tap_1000', icon: 'Keyboard', check: (s) => s.stats.totalClicks >= 1000 },
  { id: 'tap_5000', icon: 'Flame', check: (s) => s.stats.totalClicks >= 5000 },
  { id: 'tap_25000', icon: 'Activity', check: (s) => s.stats.totalClicks >= 25000 },
  { id: 'tap_100000', icon: 'Cpu', check: (s) => s.stats.totalClicks >= 100000 },

  // 2. VALUATION MILESTONES (10)
  { id: 'val_1k', icon: 'DollarSign', check: (s) => s.totalValuation >= 1e3 },
  { id: 'val_10k', icon: 'TrendingUp', check: (s) => s.totalValuation >= 1e4 },
  { id: 'val_100k', icon: 'Briefcase', check: (s) => s.totalValuation >= 1e5 },
  { id: 'val_1m', icon: 'Award', check: (s) => s.totalValuation >= 1e6 },
  { id: 'val_10m', icon: 'Building2', check: (s) => s.totalValuation >= 1e7 },
  { id: 'val_100m', icon: 'Sparkles', check: (s) => s.totalValuation >= 1e8 },
  { id: 'val_1b', icon: 'Globe', check: (s) => s.totalValuation >= 1e9 },
  { id: 'val_10b', icon: 'ShieldAlert', check: (s) => s.totalValuation >= 1e10 },
  { id: 'val_100b', icon: 'Crown', check: (s) => s.totalValuation >= 1e11 },
  { id: 'val_1t', icon: 'Sun', check: (s) => s.totalValuation >= 1e12 },

  // 3. INDIVIDUAL BUILDING ENGINES (20)
  { id: 'b_prompt_intern', icon: 'User', check: (s) => (s.buildings.prompt_intern || 0) >= 1 },
  { id: 'b_chatbot_widget', icon: 'MessageSquare', check: (s) => (s.buildings.chatbot_widget || 0) >= 1 },
  { id: 'b_prompt_engineer', icon: 'Code', check: (s) => (s.buildings.prompt_engineer || 0) >= 1 },
  { id: 'b_gpu_rack', icon: 'Server', check: (s) => (s.buildings.gpu_rack || 0) >= 1 },
  { id: 'b_datacenter', icon: 'Database', check: (s) => (s.buildings.datacenter || 0) >= 1 },
  { id: 'b_web_scraper', icon: 'Globe', check: (s) => (s.buildings.web_scraper || 0) >= 1 },
  { id: 'b_thought_leader', icon: 'UserCheck', check: (s) => (s.buildings.thought_leader || 0) >= 1 },
  { id: 'b_vc_firm', icon: 'Building2', check: (s) => (s.buildings.vc_firm || 0) >= 1 },
  { id: 'b_hype_journalist', icon: 'FileText', check: (s) => (s.buildings.hype_journalist || 0) >= 1 },
  { id: 'b_keynote_stage', icon: 'Tv', check: (s) => (s.buildings.keynote_stage || 0) >= 1 },
  { id: 'b_pivot_startup', icon: 'RotateCw', check: (s) => (s.buildings.pivot_startup || 0) >= 1 },
  { id: 'b_token_burner', icon: 'Flame', check: (s) => (s.buildings.token_burner || 0) >= 1 },
  { id: 'b_pitch_deck', icon: 'Rocket', check: (s) => (s.buildings.pitch_deck || 0) >= 1 },
  { id: 'b_lobbyist', icon: 'Shield', check: (s) => (s.buildings.lobbyist || 0) >= 1 },
  { id: 'b_agi_clock', icon: 'Clock', check: (s) => (s.buildings.agi_clock || 0) >= 1 },
  { id: 'b_synthetic_user', icon: 'Users', check: (s) => (s.buildings.synthetic_user || 0) >= 1 },
  { id: 'b_slop_streamer', icon: 'Video', check: (s) => (s.buildings.slop_streamer || 0) >= 1 },
  { id: 'b_paperclip_factory', icon: 'Paperclip', check: (s) => (s.buildings.paperclip_factory || 0) >= 1 },
  { id: 'b_quantum_datacenter', icon: 'Cpu', check: (s) => (s.buildings.quantum_datacenter || 0) >= 1 },
  { id: 'b_dyson_swarm', icon: 'Sparkles', check: (s) => (s.buildings.dyson_swarm || 0) >= 1 },

  // 4. BUILDING MASS & TYPES (8)
  { id: 'b_total_10', icon: 'Layers', check: (s) => Object.values(s.buildings || {}).reduce((a, b) => a + b, 0) >= 10 },
  { id: 'b_total_50', icon: 'Layers', check: (s) => Object.values(s.buildings || {}).reduce((a, b) => a + b, 0) >= 50 },
  { id: 'b_total_100', icon: 'Layers', check: (s) => Object.values(s.buildings || {}).reduce((a, b) => a + b, 0) >= 100 },
  { id: 'b_total_250', icon: 'Layers', check: (s) => Object.values(s.buildings || {}).reduce((a, b) => a + b, 0) >= 250 },
  { id: 'b_total_500', icon: 'Layers', check: (s) => Object.values(s.buildings || {}).reduce((a, b) => a + b, 0) >= 500 },
  { id: 'b_types_10', icon: 'Grid', check: (s) => BUILDINGS_DATA.filter((b) => (s.buildings[b.id] || 0) >= 1).length >= 10 },
  { id: 'b_types_15', icon: 'Grid', check: (s) => BUILDINGS_DATA.filter((b) => (s.buildings[b.id] || 0) >= 1).length >= 15 },
  { id: 'b_types_20', icon: 'Crown', check: (s) => BUILDINGS_DATA.every((b) => (s.buildings[b.id] || 0) >= 1) },

  // 5. BUZZWORD COLLECTION (8)
  { id: 'bw_1', icon: 'Sparkles', check: (s) => (s.boughtBuzzwords?.length || 0) >= 1 },
  { id: 'bw_5', icon: 'Sparkles', check: (s) => (s.boughtBuzzwords?.length || 0) >= 5 },
  { id: 'bw_10', icon: 'Sparkles', check: (s) => (s.boughtBuzzwords?.length || 0) >= 10 },
  { id: 'bw_20', icon: 'Sparkles', check: (s) => (s.boughtBuzzwords?.length || 0) >= 20 },
  { id: 'bw_35', icon: 'Sparkles', check: (s) => (s.boughtBuzzwords?.length || 0) >= 35 },
  { id: 'bw_50', icon: 'Star', check: (s) => (s.boughtBuzzwords?.length || 0) >= 50 },
  { id: 'bw_65', icon: 'Star', check: (s) => (s.boughtBuzzwords?.length || 0) >= 65 },
  { id: 'bw_80', icon: 'Crown', check: (s) => (s.boughtBuzzwords?.length || 0) >= 80 },

  // 6. UPGRADES MILESTONES (6)
  { id: 'up_1', icon: 'Zap', check: (s) => (s.boughtUpgrades?.length || 0) >= 1 },
  { id: 'up_5', icon: 'Zap', check: (s) => (s.boughtUpgrades?.length || 0) >= 5 },
  { id: 'up_15', icon: 'Zap', check: (s) => (s.boughtUpgrades?.length || 0) >= 15 },
  { id: 'up_30', icon: 'Zap', check: (s) => (s.boughtUpgrades?.length || 0) >= 30 },
  { id: 'up_50', icon: 'Zap', check: (s) => (s.boughtUpgrades?.length || 0) >= 50 },
  { id: 'up_100', icon: 'Crown', check: (s) => (s.boughtUpgrades?.length || 0) >= 100 },

  // 7. CORPORATE ACTIONS (6)
  { id: 'corp_1', icon: 'Recycle', check: (s) => (s.boughtGreenwashingLayoffs?.length || 0) >= 1 },
  { id: 'corp_5', icon: 'Recycle', check: (s) => (s.boughtGreenwashingLayoffs?.length || 0) >= 5 },
  { id: 'corp_15', icon: 'UserMinus', check: (s) => (s.boughtGreenwashingLayoffs?.length || 0) >= 15 },
  { id: 'corp_30', icon: 'UserX', check: (s) => (s.boughtGreenwashingLayoffs?.length || 0) >= 30 },
  { id: 'corp_50', icon: 'ShieldAlert', check: (s) => (s.boughtGreenwashingLayoffs?.length || 0) >= 50 },
  { id: 'corp_100', icon: 'Crown', check: (s) => (s.boughtGreenwashingLayoffs?.length || 0) >= 100 },

  // 8. PIVOTS & CREDIBILITY (8)
  { id: 'pivot_1', icon: 'RotateCw', check: (s) => (s.pivotCount || 0) >= 1 },
  { id: 'pivot_3', icon: 'RefreshCw', check: (s) => (s.pivotCount || 0) >= 3 },
  { id: 'pivot_5', icon: 'RotateCw', check: (s) => (s.pivotCount || 0) >= 5 },
  { id: 'pivot_10', icon: 'Crown', check: (s) => (s.pivotCount || 0) >= 10 },
  { id: 'cred_idealist_3', icon: 'Smile', check: (s) => (s.idealistLevel || 0) >= 3 },
  { id: 'cred_cynic_3', icon: 'Frown', check: (s) => (s.cynicLevel || 0) >= 3 },
  { id: 'prestige_1', icon: 'Sun', check: (s) => (s.prestigeLevel || 0) >= 1 },
  { id: 'prestige_5', icon: 'Crown', check: (s) => (s.prestigeLevel || 0) >= 5 },

  // 9. GPU OVERHEAT & MEME (8)
  { id: 'heat_1', icon: 'Thermometer', check: (s) => (s.stats?.overheatCount || 0) >= 1 },
  { id: 'heat_5', icon: 'Flame', check: (s) => (s.stats?.overheatCount || 0) >= 5 },
  { id: 'heat_20', icon: 'ShieldAlert', check: (s) => (s.stats?.overheatCount || 0) >= 20 },
  { id: 'net_neg', icon: 'TrendingDown', check: (s) => s.totalValuation >= 1e9 && ((s.totalValuation - (s.totalBurned || 0)) / s.totalValuation) < 0.20 },
  { id: 'ai_domain', icon: 'Globe', check: (s) => (s.startupName || '').trim().toLowerCase().endsWith('.ai') },
  { id: 'shadow_lucky', icon: 'Clover', isShadow: true, check: (s) => s.stats?.shadowLucky === true },
  { id: 'booster_pack', icon: 'Package', check: (s) => (s.boughtBuzzwords?.length || 0) >= 3 },
  { id: 'album_master', icon: 'BookOpen', check: (s) => (s.boughtBuzzwords?.length || 0) >= 25 },
];
