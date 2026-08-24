import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ShoppingBag, BarChart2, Settings } from 'lucide-react';
import { TAB_ROUTES } from '../routes';

export function NavBar({ activeTab, setActiveTab, affordableUpgradesCount, useRoutes = false, t }) {
  const tabs = [
    { id: 1, label: t ? t('tabSlop') : 'Slop', icon: Cpu },
    { id: 2, label: t ? t('tabStore') : 'Store', icon: ShoppingBag, badge: affordableUpgradesCount },
    { id: 3, label: t ? t('tabStats') : 'Stats', icon: BarChart2 },
    { id: 4, label: t ? t('tabMisc') : 'Settings', icon: Settings },
  ];

  return (
    <nav className="bg-slate-900/95 backdrop-blur-lg border-t border-cyan-500/20 fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto shadow-2xl navbar-safe-bottom">
      <div className="grid grid-cols-4 h-14">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          const className = `relative flex flex-col items-center justify-center gap-0.5 text-xs font-bold transition-all ${
            isActive
              ? 'text-cyan-400 bg-slate-800/80 border-t-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`;
          const content = (
            <>
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : ''}`} />
              <span className="text-[10px]">{t.label}</span>

              {/* Badge for affordable upgrades */}
              {t.badge > 0 && (
                <span className="absolute top-1.5 right-2 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full px-1.5 py-0.2 animate-bounce">
                  {t.badge}
                </span>
              )}
            </>
          );

          // Echte <a href> nur im reinen Web-Build (siehe routes.js) - crawlbar und
          // Rechtsklick-"In neuem Tab öffnen"-fähig, statt reinem State-Handler. CrazyGames/
          // nativ (useRoutes=false) behalten den alten reinen Button-Klick unverändert bei,
          // damit sich dort an URL/History nichts ändert (siehe App.jsx).
          return useRoutes ? (
            <Link key={t.id} to={TAB_ROUTES[t.id]} className={className}>
              {content}
            </Link>
          ) : (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={className}>
              {content}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
