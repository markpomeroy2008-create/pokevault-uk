import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Calendar, Layers, Sparkles, CheckCircle2, Trophy } from 'lucide-react';
import { FEATURED_SERIES } from '../data/featuredSets';
import { useCollection } from '../context/CollectionContext';

export function SetSelector({ sets, selectedSet, onSelectSet, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('All Series');
  const [isOpen, setIsOpen] = useState(false);
  const { collection } = useCollection();

  // Filter sets by series and search term
  const filteredSets = useMemo(() => {
    return sets.filter((set) => {
      const matchesSearch =
        set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        set.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (set.series && set.series.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSeries =
        selectedSeries === 'All Series' ||
        (set.series && set.series.toLowerCase() === selectedSeries.toLowerCase());

      return matchesSearch && matchesSeries;
    });
  }, [sets, searchTerm, selectedSeries]);

  // Compute set card completion from collection
  const getSetCompletion = (setId) => {
    let owned = 0;
    Object.entries(collection).forEach(([cardId, entry]) => {
      if (!entry) return;
      if (cardId.startsWith(`${setId}-`) || cardId.includes(`-${setId}`)) {
        const variantSum = entry.variants
          ? Object.values(entry.variants).reduce((s, c) => s + (Number(c) || 0), 0)
          : 0;
        const totalQty = entry.quantity !== undefined ? Number(entry.quantity) : 0;
        if (totalQty > 0 || variantSum > 0 || !!entry.owned) {
          owned++;
        }
      }
    });
    return owned;
  };

  return (
    <div className={`bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl mb-8 backdrop-blur-sm transition-all ${isOpen ? 'relative z-20' : 'relative z-10'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Choose Pokémon TCG Set
          </label>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display flex items-center gap-2">
            <span>{selectedSet ? selectedSet.name : 'Select a Set'}</span>
            {selectedSet?.images?.symbol && (
              <img
                src={selectedSet.images.symbol}
                alt=""
                className="w-5 h-5 object-contain inline-block drop-shadow"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </h2>
          {selectedSet && (
            <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                {selectedSet.series}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {selectedSet.releaseDate ? selectedSet.releaseDate.replace(/\//g, '-') : 'Release Date N/A'}
              </span>
              <span>•</span>
              <span>{selectedSet.total || selectedSet.printedTotal} Total Cards</span>
            </p>
          )}
        </div>

        {/* Quick Set Selector Dropdown Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full md:w-auto min-w-[280px] flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 rounded-xl text-white font-medium shadow-sm transition text-left"
          >
            <div className="flex items-center gap-2.5 truncate">
              {selectedSet?.images?.symbol && (
                <img
                  src={selectedSet.images.symbol}
                  alt=""
                  className="w-5 h-5 object-contain shrink-0"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <span className="truncate">{selectedSet ? selectedSet.name : 'Choose Set...'}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu Modal & Click Outside Backdrop */}
          {isOpen && (
            <>
              {/* Invisible full-screen backdrop to handle clicking outside */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />

              <div className="absolute right-0 top-full mt-2 w-full md:w-[420px] max-h-[500px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
                
                {/* Search Set by Name */}
              <div className="p-3 border-b border-slate-800 bg-slate-950/70">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search set by name (e.g. 151, Base Set)..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-850 border border-slate-750 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    autoFocus
                  />
                </div>

                {/* Series Tabs Filter */}
                <div className="flex gap-1.5 overflow-x-auto mt-2.5 pb-1 no-scrollbar text-xs">
                  {FEATURED_SERIES.map((series) => (
                    <button
                      key={series}
                      type="button"
                      onClick={() => setSelectedSeries(series)}
                      className={`px-2.5 py-1 rounded-lg shrink-0 transition font-medium ${
                        selectedSeries === series
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {series}
                    </button>
                  ))}
                </div>
              </div>

              {/* Set Results List */}
              <div className="overflow-y-auto max-h-[360px] p-2 space-y-1 divide-y divide-slate-800/40">
                {filteredSets.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-500">
                    No Pokémon sets found matching "{searchTerm}"
                  </div>
                ) : (
                  filteredSets.map((set) => {
                    const isSelected = selectedSet?.id === set.id;
                    const ownedCount = getSetCompletion(set.id);
                    const totalCards = set.total || set.printedTotal || 1;
                    const pct = Math.min(100, Math.round((ownedCount / totalCards) * 100));

                    return (
                      <button
                        key={set.id}
                        type="button"
                        onClick={() => {
                          onSelectSet(set);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition group ${
                          isSelected
                            ? 'bg-rose-500/15 border border-rose-500/30 text-white'
                            : 'hover:bg-slate-800/80 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                            {set.images?.symbol ? (
                              <img
                                src={set.images.symbol}
                                alt=""
                                className="w-5 h-5 object-contain"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <Layers className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div className="truncate">
                            <div className="font-semibold text-sm truncate group-hover:text-rose-400 transition">
                              {set.name}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              <span>{set.series}</span>
                              <span>•</span>
                              <span>{set.printedTotal} cards</span>
                              {set.releaseDate && (
                                <>
                                  <span>•</span>
                                  <span>{set.releaseDate.slice(0, 4)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Owned status badge if any */}
                        {ownedCount > 0 && (
                          <div className="shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{ownedCount}/{set.printedTotal || totalCards}</span>
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

            </div>
            </>
          )}
        </div>
      </div>

      {/* Selected Set Visual Header & Logo */}
      {selectedSet && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {selectedSet.images?.logo ? (
              <div className="h-14 sm:h-16 max-w-[180px] flex items-center justify-center p-1 bg-slate-950/40 rounded-xl border border-slate-800/60">
                <img
                  src={selectedSet.images.logo}
                  alt={selectedSet.name}
                  className="max-h-full max-w-full object-contain filter drop-shadow"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            ) : null}

            <div>
              <div className="text-xs text-slate-400">Card Set Catalog</div>
              <div className="font-bold text-white text-base">
                Showing all cards in <span className="text-rose-400">{selectedSet.name}</span>
              </div>
            </div>
          </div>

          {/* Quick set jump chips */}
          <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Popular:</span>
            {['Delta Reign', '151', 'Prismatic Evolutions', 'Crown Zenith', 'Base Set (1999)', 'Evolving Skies'].map((name) => {
              const match = sets.find((s) => s.name.toLowerCase() === name.toLowerCase() || s.name.includes(name));
              if (!match) return null;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => onSelectSet(match)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                    selectedSet?.id === match.id
                      ? 'bg-rose-500 text-white border-rose-400'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
