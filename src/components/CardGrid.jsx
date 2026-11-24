import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, CheckCircle, Circle, Sparkles, LayoutGrid, Grid3X3, List, Eye } from 'lucide-react';
import { CardItem } from './CardItem';
import { useCollection } from '../context/CollectionContext';
import { convertToGBP, formatGBP } from '../utils/currency';

const TYPES = ['All Types', 'Colorless', 'Darkness', 'Dragon', 'Fairy', 'Fighting', 'Fire', 'Grass', 'Lightning', 'Metal', 'Psychic', 'Water'];

export function CardGrid({ cards, set, onOpenDetail, isLoading, error }) {
  const { isOwned, getSetStats } = useCollection();
  
  // Local filter states
  const [search, setSearch] = useState('');
  const [filterOwned, setFilterOwned] = useState('all'); // 'all' | 'owned' | 'missing'
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedRarity, setSelectedRarity] = useState('All Rarities');
  const [sortBy, setSortBy] = useState('number'); // 'number' | 'name' | 'price-asc' | 'price-desc' | 'rarity'
  const [viewMode, setViewMode] = useState('standard'); // 'standard' | 'compact'

  // Available rarities dynamically collected from cards
  const availableRarities = useMemo(() => {
    const setRarities = new Set();
    cards.forEach((c) => {
      if (c.rarity) setRarities.add(c.rarity);
    });
    return ['All Rarities', ...Array.from(setRarities).sort()];
  }, [cards]);

  // Set stats
  const setStats = useMemo(() => {
    return getSetStats(cards);
  }, [cards, getSetStats]);

  // Filtered & sorted cards
  const filteredCards = useMemo(() => {
    return cards
      .filter((card) => {
        // Name or Number search
        const matchesSearch =
          card.name.toLowerCase().includes(search.toLowerCase()) ||
          card.number.toString().includes(search) ||
          (card.artist && card.artist.toLowerCase().includes(search.toLowerCase()));

        // Ownership filter
        const owned = isOwned(card.id);
        const matchesOwned =
          filterOwned === 'all' ||
          (filterOwned === 'owned' && owned) ||
          (filterOwned === 'missing' && !owned);

        // Type filter
        const matchesType =
          selectedType === 'All Types' ||
          (card.types && card.types.includes(selectedType));

        // Rarity filter
        const matchesRarity =
          selectedRarity === 'All Rarities' ||
          card.rarity === selectedRarity;

        return matchesSearch && matchesOwned && matchesType && matchesRarity;
      })
      .sort((a, b) => {
        if (sortBy === 'number') {
          const numA = parseInt(a.number, 10);
          const numB = parseInt(b.number, 10);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return (a.number || '').localeCompare(b.number || '', undefined, { numeric: true });
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'price-asc') {
          const pA = convertToGBP(a.cardmarket?.prices?.lowPrice, 'EUR');
          const pB = convertToGBP(b.cardmarket?.prices?.lowPrice, 'EUR');
          const valA = pA !== null && !isNaN(pA) ? pA : 999999;
          const valB = pB !== null && !isNaN(pB) ? pB : 999999;
          return valA - valB;
        }
        if (sortBy === 'price-desc') {
          const pA = convertToGBP(a.cardmarket?.prices?.lowPrice, 'EUR');
          const pB = convertToGBP(b.cardmarket?.prices?.lowPrice, 'EUR');
          const valA = pA !== null && !isNaN(pA) ? pA : -1;
          const valB = pB !== null && !isNaN(pB) ? pB : -1;
          return valB - valA;
        }
        if (sortBy === 'rarity') {
          return (a.rarity || '').localeCompare(b.rarity || '');
        }
        return 0;
      });
  }, [cards, search, filterOwned, selectedType, selectedRarity, sortBy, isOwned]);

  return (
    <div className="space-y-6">
      
      {/* Set Completion Bar & Stats */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-slate-400">
              Set Completion Progress
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white font-display flex items-baseline gap-2 mt-0.5">
              <span>{setStats.ownedCount} of {setStats.total} cards owned</span>
              <span className="text-emerald-400 text-base font-semibold">
                ({setStats.percentage}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Copies</span>
              <span className="font-bold text-slate-200 text-sm">{setStats.totalCards} physical cards</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Est. Value (UK)</span>
              <span className="font-bold text-emerald-400 text-sm">{formatGBP(setStats.estimatedValueGbp)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${Math.max(setStats.percentage, setStats.ownedCount > 0 ? 3 : 0)}%` }}
          />
        </div>
      </div>

      {/* Filter and Search Control Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Card Name / Number Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cards in this set by name or number (e.g. Charizard, 4, Pikachu)..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          {/* Ownership Filter Segmented Control */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setFilterOwned('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterOwned === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({cards.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterOwned('owned')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                filterOwned === 'owned'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Owned ({setStats.ownedCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterOwned('missing')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                filterOwned === 'missing'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              <Circle className="w-3.5 h-3.5" />
              <span>Missing ({Math.max(0, cards.length - setStats.ownedCount)})</span>
            </button>
          </div>

        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-xs">
          
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Type selector */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-rose-500"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Rarity selector */}
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-rose-500"
            >
              {availableRarities.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {/* Sort order selector */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-slate-300">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-none text-slate-200 cursor-pointer"
              >
                <option value="number">Sort: Card Number</option>
                <option value="name">Sort: Name (A to Z)</option>
                <option value="price-asc">Sort: Price (Cheapest First)</option>
                <option value="price-desc">Sort: Price (Highest First)</option>
                <option value="rarity">Sort: Rarity</option>
              </select>
            </div>

          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setViewMode('standard')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'standard' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Standard Visual Card Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'compact' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Compact Dense Grid"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-20 text-center">
          <div className="inline-block w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin mb-4" />
          <h3 className="font-bold text-lg text-white">Loading Pokémon Cards...</h3>
          <p className="text-xs text-slate-400 mt-1">Retrieving cards, pictures and UK pricing data</p>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-6 text-center">
          <p className="text-rose-300 font-semibold text-sm">{error}</p>
          <p className="text-xs text-slate-400 mt-2">
            You can enter a free Pokémon TCG API key in Settings (top right) to bypass public rate limits.
          </p>
        </div>
      )}

      {/* Cards Grid View */}
      {!isLoading && (
        <>
          {filteredCards.length === 0 ? (
            <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
              <p className="text-slate-300 font-medium">No cards match your current filters</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting the search or ownership filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setFilterOwned('all');
                  setSelectedType('All Types');
                  setSelectedRarity('All Rarities');
                }}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-4 sm:gap-6 ${
                viewMode === 'standard'
                  ? 'grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3'
              }`}
            >
              {filteredCards.map((card) => (
                <CardItem
                  key={card.id}
                  card={card}
                  set={set}
                  onOpenDetail={onOpenDetail}
                />
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
}
