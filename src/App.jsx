import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SetSelector } from './components/SetSelector';
import { CardGrid } from './components/CardGrid';
import { CardDetailModal } from './components/CardDetailModal';
import { CollectionStats } from './components/CollectionStats';
import { SettingsModal } from './components/SettingsModal';
import { pokemonApi } from './api/pokemonApi';
import { INITIAL_SETS, FALLBACK_DELTA_REIGN_CARDS } from './data/featuredSets';
import { useCollection } from './context/CollectionContext';
import { storage } from './utils/storage';
import { Sparkles, ShoppingBag, ShieldCheck, Heart, Layers } from 'lucide-react';

export function App() {
  const [sets, setSets] = useState(INITIAL_SETS);
  const [selectedSet, setSelectedSet] = useState(() => {
    const savedId = storage.getItem('pokevault_selected_set_id');
    // If user previously had 'sv3pt5' saved as the old default, update to the latest set (Delta Reign)
    if (savedId && savedId !== 'sv3pt5') {
      const match = INITIAL_SETS.find(s => s.id === savedId);
      if (match) return match;
    }
    return INITIAL_SETS.find(s => s.id === 'me06' || s.name.toLowerCase().includes('delta reign')) || INITIAL_SETS[0];
  });
  const [cards, setCards] = useState(() => {
    const savedId = storage.getItem('pokevault_selected_set_id');
    if (!savedId || savedId === 'me06' || savedId === 'sv3pt5') {
      return FALLBACK_DELTA_REIGN_CARDS;
    }
    return [];
  });
  const [isLoadingSets, setIsLoadingSets] = useState(true);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [cardError, setCardError] = useState(null);

  // Active modal card
  const [detailCard, setDetailCard] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [activeTab, setActiveTab] = useState('sets'); // 'sets' | 'wishlist'

  const { wishlist, collection } = useCollection();

  // Save selected set to local storage whenever it changes
  useEffect(() => {
    if (selectedSet?.id) {
      storage.setItem('pokevault_selected_set_id', selectedSet.id);
    }
  }, [selectedSet]);

  // Load sets on mount
  const loadSets = useCallback(async () => {
    setIsLoadingSets(true);
    try {
      const res = await pokemonApi.getSets();
      if (res.sets && res.sets.length > 0) {
        setSets(res.sets);
        // If saved set exists and was not the old default, keep it
        const savedId = storage.getItem('pokevault_selected_set_id');
        if (savedId && savedId !== 'sv3pt5') {
          const match = res.sets.find(s => s.id === savedId);
          if (match) {
            setSelectedSet(match);
            return;
          }
        }
        // Default to the latest set available (Delta Reign)
        const latestSet = res.sets.find(s => s.id === 'me06' || s.name.toLowerCase().includes('delta reign')) || res.sets[0];
        setSelectedSet(latestSet);
      }
    } catch (err) {
      console.warn('Error loading sets:', err);
    } finally {
      setIsLoadingSets(false);
    }
  }, []);

  useEffect(() => {
    loadSets();
  }, []);

  // Load cards whenever selectedSet changes
  const loadCards = useCallback(async (setId) => {
    if (!setId) return;
    setIsLoadingCards(true);
    setCardError(null);

    // If loading Delta Reign, clear any obsolete incomplete cache
    if (setId === 'me06' || setId === 'dlr') {
      const cached = storage.getItem('pokevault_cards_me06');
      if (cached && cached.data && cached.data.length < FALLBACK_DELTA_REIGN_CARDS.length) {
        storage.removeItem('pokevault_cards_me06');
      }
    }

    try {
      const res = await pokemonApi.getCardsForSet(setId);
      if (res.cards && res.cards.length > 0) {
        if ((setId === 'me06' || setId === 'dlr') && res.cards.length < FALLBACK_DELTA_REIGN_CARDS.length) {
          setCards(FALLBACK_DELTA_REIGN_CARDS);
        } else {
          setCards(res.cards);
        }
      } else if (setId === 'me06' || setId === 'dlr') {
        setCards(FALLBACK_DELTA_REIGN_CARDS);
      }
      if (res.error) {
        setCardError(res.error);
      }
    } catch (err) {
      if (setId === 'me06' || setId === 'dlr') {
        setCards(FALLBACK_DELTA_REIGN_CARDS);
      } else {
        setCardError('Failed to load cards. Please check your internet connection.');
      }
    } finally {
      setIsLoadingCards(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSet) {
      loadCards(selectedSet.id);
    }
  }, [selectedSet, loadCards]);

  // Wishlist cards view
  const wishlistCards = cards.filter(c => wishlist.includes(c.id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      
      {/* Header */}
      <Header
        onOpenSettings={() => setShowSettings(true)}
        onOpenOverview={() => setShowOverview(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* UK Value Proposition Hero Bar */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40 border border-rose-900/30 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
                <span>UK Pokémon TCG Price Finder & Delivery Guaranteed</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Cheapest First
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Every card provides direct links to eBay UK (pre-sorted lowest price + P&P), Cardmarket singles, and premier UK retailers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowOverview(true)}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
            >
              Collection Stats
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
            >
              Configure API / Backup
            </button>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'wishlist' ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                <h2 className="text-xl font-bold font-display text-white">
                  Your Wishlist ({wishlist.length} cards)
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('sets')}
                className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-slate-200 transition"
              >
                ← Back to Set Browser
              </button>
            </div>

            {wishlistCards.length === 0 ? (
              <div className="py-20 text-center bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                <Heart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">No cards in wishlist for current set</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Click the heart icon on any card to add it to your wishlist and track deals.
                </p>
              </div>
            ) : (
              <CardGrid
                cards={wishlistCards}
                set={selectedSet}
                onOpenDetail={(card) => setDetailCard(card)}
                isLoading={false}
              />
            )}
          </div>
        ) : (
          <div>
            {/* Set Selection Component */}
            <SetSelector
              sets={sets}
              selectedSet={selectedSet}
              onSelectSet={(newSet) => setSelectedSet(newSet)}
              isLoading={isLoadingSets}
            />

            {/* Cards Grid */}
            <CardGrid
              cards={cards}
              set={selectedSet}
              onOpenDetail={(card) => setDetailCard(card)}
              isLoading={isLoadingCards}
              error={cardError}
            />
          </div>
        )}

      </main>

      {/* Card Detail & Buy Comparison Modal */}
      {detailCard && (
        <CardDetailModal
          card={detailCard}
          set={selectedSet}
          onClose={() => setDetailCard(null)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onRefreshSets={loadSets}
        />
      )}

      {/* Overall Collection Stats Modal */}
      {showOverview && (
        <CollectionStats
          sets={sets}
          onClose={() => setShowOverview(false)}
          onSelectSet={(s) => setSelectedSet(s)}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">PokéVault UK</span>
            <span>•</span>
            <span>Pokémon TCG Repository & UK Price Comparison</span>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-600 space-y-1">
            <p>
              Prices, images, and card data provided via Pokémon TCG API, Cardmarket & eBay UK.
            </p>
            <p>
              Pokémon and its trademarks are © 1995–2026 Nintendo / Creatures Inc. / GAME FREAK inc.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
