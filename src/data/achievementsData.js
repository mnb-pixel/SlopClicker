import { BUILDINGS_DATA } from './buildingsData';

// 12 Achievements (Konzept Abschnitt 11). Anzeigetext liegt in
// src/i18n/content/achievements.content.js (Key: ach_<id>_name / ach_<id>_quote)
export const ACHIEVEMENTS_DATA = [
  {
    id: 'first_tap',
    icon: 'Terminal',
    isShadow: false,
    check: (state) => state.stats.totalClicks >= 1,
  },
  {
    id: 'tokens_1m',
    icon: 'Award',
    isShadow: false,
    check: (state) => state.totalValuation >= 1e6,
  },
  {
    id: 'tokens_1b',
    icon: 'TrendingUp',
    isShadow: false,
    check: (state) => state.totalValuation >= 1e9,
  },
  {
    id: 'tokens_1t',
    icon: 'Globe',
    isShadow: false,
    check: (state) => state.totalValuation >= 1e12,
  },
  {
    id: 'first_pivot',
    icon: 'RotateCw',
    isShadow: false,
    check: (state) => (state.pivotCount || 0) >= 1,
  },
  {
    id: 'pivots_3',
    icon: 'RefreshCw',
    isShadow: false,
    check: (state) => (state.pivotCount || 0) >= 3,
  },
  {
    id: 'buildings_10',
    icon: 'Server',
    isShadow: false,
    check: (state) => BUILDINGS_DATA.filter((b) => (state.buildings[b.id] || 0) >= 1).length >= 10,
  },
  {
    id: 'buildings_20',
    icon: 'Layers',
    isShadow: false,
    check: (state) => BUILDINGS_DATA.every((b) => (state.buildings[b.id] || 0) >= 1),
  },
  {
    id: 'buzzwords_50',
    icon: 'Sparkles',
    isShadow: false,
    check: (state) => (state.boughtBuzzwords?.length || 0) >= 50,
  },
  {
    id: 'buzzwords_80',
    icon: 'Star',
    isShadow: false,
    check: (state) => (state.boughtBuzzwords?.length || 0) >= 80,
  },
  {
    id: 'net_negative_billions',
    icon: 'Flame',
    isShadow: false,
    check: (state) => {
      if (state.totalValuation < 1e9) return false;
      const netShare = (state.totalValuation - (state.totalBurned || 0)) / state.totalValuation;
      return netShare < 0.20;
    },
  },
  {
    id: 'actual_profit',
    icon: 'Clover',
    isShadow: true,
    check: (state) => state.stats.shadowLucky === true,
  },
];
