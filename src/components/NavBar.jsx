import React from 'react';
import { Cpu, ShoppingBag, Sparkles, BarChart2, Settings } from 'lucide-react';

export function NavBar({ activeTab, setActiveTab, affordableUpgradesCount, t }) {
  const tabs = [
    { id: 1, label: t ? t('tabSlop') : 'Slop', icon: Cpu },
    { id: 2, label: t ? t('tabStore') : 'Store', icon: ShoppingBag, badge: affordableUpgradesCount },
    { id: 3, label: t ? t('tabSpecial') : 'Special', icon: Sparkles },
    { id: 4, label: t ? t('tabStats') : 'Stats', icon: BarChart2 },
    { id: 5, label: t ? t('tabMisc') : 'Settings', icon: Settings },
  ];

  return (
    <nav className="bg-slate-900/95 backdrop-blur-lg border-t border-cyan-500/20 fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto shadow-2xl navbar-safe-bottom">
      <div className="grid grid-cols-5 h-14">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 text-xs font-bold transition-all ${
                isActive
                  ? 'text-cyan-400 bg-slate-800/80 border-t-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : ''}`} />
              <span className="text-[10px]">{t.label}</span>

              {/* Badge for affordable upgrades */}
              {t.badge > 0 && (
                <span className="absolute top-1.5 right-2 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full px-1.5 py-0.2 animate-bounce">
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
