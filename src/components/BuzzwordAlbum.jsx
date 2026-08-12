import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Layers, Sparkles, BookOpen, Zap, Search, Lock, CheckCircle2, X, PlusCircle } from 'lucide-react';
import { getIcon } from '../utils/iconMap';
import { BUZZWORDS_DATA } from '../data/buzzwordsData';
import { formatCurrency } from '../utils/formatters';

export function BuzzwordAlbum({
  valuation,
  boughtBuzzwords = [],
  buyBuzzword,
  buyBoosterPack,
  addCardToAlbum,
  t,
}) {
  const tr = t || ((k) => k);
  const [rarityFilter, setRarityFilter] = useState('ALL'); // 'ALL' | 'Legendary' | 'Rare' | 'Uncommon' | 'Common'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'BOUGHT' | 'MISSING'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);

  // Booster Pack Opening Animation State
  const [openingState, setOpeningState] = useState('CLOSED'); // 'CLOSED' | 'SHAKING' | 'REVEALED'
  const [pulledCard, setPulledCard] = useState(null);

  // Dynamic Lucide Icon Renderer
  const renderCardIcon = (iconName, className = 'w-5 h-5') => {
    const IconComp = getIcon(iconName, 'Sparkles');
    return <IconComp className={className} />;
  };

  // Booster Pack Cost Formula: 600 * 1.20^cardsOwned
  const packCost = Math.floor(600 * Math.pow(1.20, boughtBuzzwords.length));
  const canAffordPack = valuation >= packCost && boughtBuzzwords.length < BUZZWORDS_DATA.length;

  // Handler for Booster Pack Purchase & Reveal Animation
  const handleBuyBoosterPack = () => {
    if (!buyBoosterPack) return;
    const card = buyBoosterPack();
    if (card) {
      setPulledCard(card);
      setOpeningState('SHAKING');

      // 700ms shake animation before reveal
      setTimeout(() => {
        setOpeningState('REVEALED');
      }, 700);
    }
  };

  // Commit pulled card into album
  const handleInsertIntoAlbum = () => {
    if (pulledCard && addCardToAlbum) {
      addCardToAlbum(pulledCard.id);
    }
    setOpeningState('CLOSED');
    setPulledCard(null);
  };

  // Stats calculation
  const totalCards = BUZZWORDS_DATA.length;
  const boughtCount = boughtBuzzwords.length;
  const progressPct = Math.round((boughtCount / totalCards) * 100);

  const totalBonus = BUZZWORDS_DATA.reduce((acc, bw) => {
    return boughtBuzzwords.includes(bw.id) ? acc + bw.bonus : acc;
  }, 0);
  const totalBonusPct = Math.round(totalBonus * 100);

  // Rarity counters
  const rarityCounts = {
    Common: { bought: 0, total: 40 },
    Uncommon: { bought: 0, total: 25 },
    Rare: { bought: 0, total: 10 },
    Legendary: { bought: 0, total: 5 },
  };

  BUZZWORDS_DATA.forEach((bw) => {
    if (boughtBuzzwords.includes(bw.id)) {
      rarityCounts[bw.rarity].bought += 1;
    }
  });

  // Filtering
  const filteredCards = BUZZWORDS_DATA.filter((bw) => {
    const isBought = boughtBuzzwords.includes(bw.id);

    if (rarityFilter !== 'ALL' && bw.rarity !== rarityFilter) return false;
    if (statusFilter === 'BOUGHT' && !isBought) return false;
    if (statusFilter === 'MISSING' && isBought) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (isBought && bw.name.toLowerCase().includes(q)) ||
        bw.cardNum.toLowerCase().includes(q) ||
        bw.rarity.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* 🎴 BOOSTER PACK SHOP CARD */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-fuchsia-950 border-2 border-fuchsia-500/50 p-4 shadow-xl flex flex-col items-center text-center gap-3">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-600 to-amber-400 text-slate-950 border-2 border-amber-300 shadow-lg shrink-0">
            <Layers className="w-7 h-7 text-slate-950" />
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                🎴 {tr('boosterPackTitle')}
              </span>
              <span className="text-[10px] font-mono font-bold bg-fuchsia-500/20 text-fuchsia-300 px-1.5 py-0.5 rounded border border-fuchsia-500/40">
                {tr('duplicateProtection')}
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              {tr('boosterPackDesc')}
            </div>
            <div className="text-[10px] font-mono text-fuchsia-400 font-bold mt-0.5">
              {tr('remainingLabel')} {totalCards - boughtCount} / {totalCards}
            </div>
          </div>
        </div>

        {/* Buy Booster Pack Button - Central Bottom Placement */}
        <button
          onClick={handleBuyBoosterPack}
          disabled={!canAffordPack}
          className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg mt-1 ${
            canAffordPack
              ? 'bg-gradient-to-r from-amber-400 via-fuchsia-500 to-cyan-400 text-slate-950 hover:brightness-110 active:scale-95 shadow-fuchsia-500/30'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{boughtCount >= totalCards ? tr('allCollected') : `${tr('openPackLabel')} (${formatCurrency(packCost)})`}</span>
        </button>
      </div>

      {/* 📘 BINDER HEADER & PORTFOLIO PROGRESS */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-fuchsia-400" />
              {tr('albumPortfolioTitle')} ({boughtCount}/{totalCards})
            </h2>
          </div>

          {/* Cumulative Bonus Badge */}
          <div className="bg-emerald-950/80 border border-emerald-500/50 px-3 py-1 rounded-xl shadow-md flex items-center gap-2 shrink-0">
            <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div>
              <div className="text-[9px] text-slate-400 uppercase font-mono font-bold">{tr('totalPortfolioBonus')}</div>
              <div className="text-emerald-300 text-xs font-mono font-black">+ {totalBonusPct}% {tr('vpsGlobalLabel')}</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono font-bold text-slate-300">
            <span>{tr('albumProgressLabel')}</span>
            <span className="text-fuchsia-400">{progressPct}%</span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full border border-slate-800 overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-amber-400 h-full rounded-full transition-all duration-500 shadow-md"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Rarity Counter Badges */}
        <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono font-bold pt-1">
          <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-slate-300">
            <span className="text-slate-400 block text-[9px]">COMMON</span>
            <span className="text-slate-200">{rarityCounts.Common.bought}/40</span>
          </div>
          <div className="bg-cyan-950/40 p-1.5 rounded-lg border border-cyan-500/40 text-cyan-300">
            <span className="text-cyan-400 block text-[9px]">UNCOMMON</span>
            <span>{rarityCounts.Uncommon.bought}/25</span>
          </div>
          <div className="bg-purple-950/40 p-1.5 rounded-lg border border-purple-500/40 text-purple-300">
            <span className="text-purple-400 block text-[9px]">RARE</span>
            <span>{rarityCounts.Rare.bought}/10</span>
          </div>
          <div className="bg-amber-950/40 p-1.5 rounded-lg border border-amber-500/40 text-amber-300">
            <span className="text-amber-400 block text-[9px]">★ LEGENDARY</span>
            <span>{rarityCounts.Legendary.bought}/5</span>
          </div>
        </div>
      </div>

      {/* 🔍 ALBUM FILTER & SEARCH BAR */}
      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col gap-2.5">
        <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
          {/* Rarity Tabs */}
          <div className="flex flex-wrap gap-1 text-[11px] font-bold">
            {['ALL', 'Common', 'Uncommon', 'Rare', 'Legendary'].map((rar) => (
              <button
                key={rar}
                onClick={() => setRarityFilter(rar)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  rarityFilter === rar
                    ? rar === 'Legendary'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : rar === 'Rare'
                      ? 'bg-purple-500 text-slate-950 font-black shadow-sm'
                      : rar === 'Uncommon'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'bg-fuchsia-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {rar === 'ALL' ? tr('filterAll') : rar}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[140px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={tr('cardSearchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-fuchsia-500 font-mono"
            />
          </div>
        </div>

        {/* Status Filter Toggle */}
        <div className="flex gap-1 text-[10px] font-bold pt-1 border-t border-slate-800">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-0.5 rounded ${statusFilter === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
          >
            {tr('allSlotsLabel')} (1-80)
          </button>
          <button
            onClick={() => setStatusFilter('BOUGHT')}
            className={`px-2.5 py-0.5 rounded ${statusFilter === 'BOUGHT' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400'}`}
          >
            ✨ {tr('inAlbumLabel')} ({boughtCount})
          </button>
          <button
            onClick={() => setStatusFilter('MISSING')}
            className={`px-2.5 py-0.5 rounded ${statusFilter === 'MISSING' ? 'bg-rose-500 text-slate-950 font-black' : 'text-slate-400'}`}
          >
            🔒 {tr('undiscoveredLabel')} ({totalCards - boughtCount})
          </button>
        </div>
      </div>

      {/* 🃏 SAMMELKARTEN ALBUM GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {filteredCards.map((bw) => {
          const isBought = boughtBuzzwords.includes(bw.id);

          // 🔒 UNBOUGHT MYSTERY CARD SLOT
          if (!isBought) {
            return (
              <div
                key={bw.id}
                onClick={() => setSelectedCard(bw)}
                className="group relative rounded-xl border border-slate-800 bg-slate-950/90 p-2.5 flex flex-col justify-between overflow-hidden shadow-sm cursor-pointer hover:border-fuchsia-500/50 transition-colors min-h-[130px]"
              >
                {/* Top Bar: Card Num & Status Badge */}
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500">
                  <span>{bw.cardNum}</span>
                  <span className="uppercase text-[9px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-500">
                    🔒 {tr('undiscoveredShort')}
                  </span>
                </div>

                {/* Silhouette Placeholder Content */}
                <div className="my-2 flex flex-col items-center justify-center py-2.5 rounded-lg border border-slate-900 bg-slate-900/40 text-slate-600 group-hover:text-fuchsia-400 transition-colors">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 mb-1">
                    <Lock className="w-5 h-5 text-slate-600 group-hover:text-fuchsia-400 transition-colors" />
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 select-none blur-[3px] mt-0.5">
                    ??? {tr('secretLabel')} ???
                  </div>
                </div>

                {/* Bottom Tag */}
                <div className="w-full py-0.5 rounded font-mono font-bold text-[9px] bg-slate-900/80 text-slate-500 border border-slate-800 text-center">
                  🔒 {tr('inBoosterPacksLabel')}
                </div>
              </div>
            );
          }

          // ✨ UNLOCKED PHYSICAL TRADING CARD LAYOUT
          let cardStyle = 'border-slate-600 bg-slate-900/90 text-slate-100 shadow-sm';
          let badgeStyle = 'bg-slate-700 text-slate-200 border-slate-600';
          let iconBoxStyle = 'bg-slate-800 text-slate-300 border-slate-700';

          if (bw.rarity === 'Legendary') {
            cardStyle = 'border-amber-400/90 bg-gradient-to-b from-amber-950/80 via-slate-900 to-amber-950/40 text-amber-200 shadow-amber-500/20 shadow-lg';
            badgeStyle = 'bg-amber-500 text-slate-950 font-black border-amber-300';
            iconBoxStyle = 'bg-amber-500/20 text-amber-300 border-amber-400/60';
          } else if (bw.rarity === 'Rare') {
            cardStyle = 'border-purple-400/90 bg-gradient-to-b from-purple-950/80 via-slate-900 to-purple-950/40 text-purple-200 shadow-purple-500/20 shadow-md';
            badgeStyle = 'bg-purple-500 text-slate-950 font-black border-purple-300';
            iconBoxStyle = 'bg-purple-500/20 text-purple-300 border-purple-400/60';
          } else if (bw.rarity === 'Uncommon') {
            cardStyle = 'border-cyan-400/80 bg-gradient-to-b from-cyan-950/80 via-slate-900 to-cyan-950/40 text-cyan-200 shadow-cyan-500/10 shadow-md';
            badgeStyle = 'bg-cyan-500 text-slate-950 font-black border-cyan-300';
            iconBoxStyle = 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60';
          }

          return (
            <div
              key={bw.id}
              onClick={() => setSelectedCard(bw)}
              className={`group relative rounded-xl border-2 p-2.5 flex flex-col justify-between transition-all hover:scale-[1.03] hover:z-10 cursor-pointer min-h-[130px] ${cardStyle}`}
            >
              {/* Card Top: Number & Rarity Badge */}
              <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                <span className="opacity-75">{bw.cardNum}</span>
                <span className={`uppercase text-[9px] px-1.5 py-0.2 rounded border font-black ${badgeStyle}`}>
                  {bw.rarity === 'Legendary' ? '★ LEGENDARY' : bw.rarity}
                </span>
              </div>

              {/* Card Artwork Icon Box */}
              <div className="my-1 flex flex-col items-center justify-center py-2 rounded-lg border backdrop-blur-sm relative overflow-hidden group-hover:border-fuchsia-400/80 transition-colors">
                <div className={`p-1.5 rounded-xl border ${iconBoxStyle} mb-1 shadow-inner`}>
                  {renderCardIcon(bw.icon, 'w-5 h-5')}
                </div>
                <div className="text-xs font-extrabold text-center px-1 truncate w-full text-slate-100">
                  {bw.name}
                </div>
              </div>

              {/* Card Stats */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono font-black text-emerald-300 text-center bg-emerald-950/60 py-0.5 rounded border border-emerald-500/30">
                  ⚡ +{Math.round(bw.bonus * 100)}% VPS
                </div>

                <div className="w-full py-0.5 rounded font-black text-[10px] bg-slate-950 text-slate-300 border border-slate-800 text-center flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{tr('inAlbumBadge')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🎬 BOOSTER PACK OPENING MODAL */}
      {openingState !== 'CLOSED' && pulledCard && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-sm w-full max-h-[90vh] overflow-y-auto my-auto bg-slate-900 border-2 border-amber-400/80 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col items-center text-center">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-fuchsia-500/10 to-slate-950 pointer-events-none" />

            {/* STAGE 1: SHAKING PACK */}
            {openingState === 'SHAKING' && (
              <div className="flex flex-col items-center my-6">
                <div className="w-20 h-28 rounded-2xl bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-amber-400 border-4 border-amber-300 shadow-2xl flex flex-col items-center justify-center text-slate-950 animate-pulse">
                  <Sparkles className="w-10 h-10 text-slate-950 animate-spin" />
                  <span className="font-black text-[10px] uppercase tracking-wider mt-2">{tr('openingLabel')}</span>
                </div>
                <div className="text-amber-300 font-extrabold text-xs font-mono mt-4 animate-pulse">
                  🎴 {tr('drawingCardLabel')}
                </div>
              </div>
            )}

            {/* STAGE 2: REVEALED CARD */}
            {openingState === 'REVEALED' && (
              <div className="flex flex-col items-center w-full animate-fadeIn">
                <div className="text-xs font-mono font-black text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                  {tr('newCardDrawn')}
                </div>

                {/* Card Artwork */}
                <div className={`w-full p-4 rounded-2xl border-2 my-2 shadow-2xl flex flex-col items-center gap-2 ${
                  pulledCard.rarity === 'Legendary'
                    ? 'border-amber-400 bg-gradient-to-b from-amber-950 via-slate-900 to-amber-950 text-amber-200'
                    : pulledCard.rarity === 'Rare'
                    ? 'border-purple-400 bg-gradient-to-b from-purple-950 via-slate-900 to-purple-950 text-purple-200'
                    : pulledCard.rarity === 'Uncommon'
                    ? 'border-cyan-400 bg-gradient-to-b from-cyan-950 via-slate-900 to-cyan-950 text-cyan-200'
                    : 'border-slate-500 bg-slate-900 text-slate-100'
                }`}>
                  <div className="flex justify-between w-full text-xs font-mono font-extrabold">
                    <span>{pulledCard.cardNum}</span>
                    <span className="uppercase font-black px-2 py-0.5 rounded bg-slate-950/80 border border-current text-[10px]">
                      {pulledCard.rarity === 'Legendary' ? '★ LEGENDARY ★' : pulledCard.rarity}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-current/50 my-1 text-amber-300">
                    {renderCardIcon(pulledCard.icon, 'w-10 h-10')}
                  </div>

                  <div className="text-base font-black text-slate-100">{pulledCard.name}</div>
                  <div className="text-[11px] font-mono italic text-slate-300">"{pulledCard.quote}"</div>

                  <div className="mt-1 text-xs font-mono font-black text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-500/40">
                    ⚡ +{Math.round(pulledCard.bonus * 100)}% {tr('globalVpsBonusLabel')}
                  </div>
                </div>

                <button
                  onClick={handleInsertIntoAlbum}
                  className="w-full mt-3 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-amber-400 text-slate-950 hover:bg-amber-300 active:scale-95 shadow-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>✨ {tr('insertIntoAlbumLabel')}</span>
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* 🔍 CARD INSPECT MODAL */}
      {selectedCard && (() => {
        const bw = selectedCard;
        const isBought = boughtBuzzwords.includes(bw.id);
        const canAffordDirect = valuation >= bw.cost && !isBought;

        return createPortal(
          <div
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setSelectedCard(null)}
          >
            <div
              className="relative max-w-xs w-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-fuchsia-500/60 rounded-2xl p-5 shadow-2xl flex flex-col gap-3 text-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-3 right-3 p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Card Header */}
              <div className="flex items-center justify-between text-xs font-mono font-extrabold border-b border-slate-800 pb-2">
                <span className="text-fuchsia-400">{bw.cardNum} {tr('ofLabel')} 80</span>
                <span className="uppercase px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40">
                  {isBought ? bw.rarity : `🔒 ${tr('undiscoveredShort')}`}
                </span>
              </div>

              {/* Card Content */}
              {isBought ? (
                <div className="my-2 p-4 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-fuchsia-500/30 flex flex-col items-center justify-center gap-2 shadow-inner">
                  <div className="p-3 rounded-2xl bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/50 shadow-xl">
                    {renderCardIcon(bw.icon, 'w-10 h-10')}
                  </div>
                  <div className="text-base font-black text-center text-slate-100 mt-1">
                    {bw.name}
                  </div>
                  <div className="text-[11px] text-fuchsia-300/80 font-mono italic text-center">
                    "{bw.quote}"
                  </div>
                </div>
              ) : (
                <div className="my-2 p-4 rounded-xl bg-slate-950 border-2 border-slate-800 flex flex-col items-center justify-center gap-2 relative overflow-hidden select-none">
                  <div className="p-3 rounded-2xl bg-slate-900 text-slate-700">
                    <Lock className="w-8 h-8 text-fuchsia-400" />
                  </div>
                  <div className="text-xs font-black text-center text-slate-400 uppercase">
                    {tr('notYetUnlocked')}
                  </div>
                  <div className="text-[10px] text-slate-400 text-center font-mono mt-1">
                    {tr('unlockCardHint')}
                  </div>
                </div>
              )}

              {/* Card Stats */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">{tr('vpsMultiplierLabel')}</span>
                  <span className="text-emerald-400 font-extrabold">
                    {isBought ? `+${Math.round(bw.bonus * 100)}% ${tr('vpsGlobalLabel')}` : '🔒 ???'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{tr('statusLabel')}</span>
                  <span className={isBought ? 'text-emerald-400 font-bold' : 'text-slate-500 font-bold'}>
                    {isBought ? `✨ ${tr('completedInAlbum')}` : `🔒 ${tr('notYetDiscovered')}`}
                  </span>
                </div>
              </div>

              {/* Direct Purchase Action in Inspect Modal */}
              {!isBought && (
                <button
                  onClick={() => {
                    if (buyBuzzword) {
                      buyBuzzword(bw.id);
                      setSelectedCard(null);
                    }
                  }}
                  disabled={!canAffordDirect}
                  className={`w-full py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg ${
                    canAffordDirect
                      ? 'bg-fuchsia-500 text-slate-950 hover:bg-fuchsia-400 active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{tr('buyCardDirectLabel')} ({formatCurrency(bw.cost)})</span>
                </button>
              )}
            </div>
          </div>,
          document.body
        );
      })()}
    </div>
  );
}
