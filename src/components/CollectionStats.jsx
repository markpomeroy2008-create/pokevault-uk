import React from 'react';
import { X, Trophy, Layers, Sparkles, Download, ShieldCheck, Heart, CircleCheck } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { formatGBP } from '../utils/currency';

export function CollectionStats({ sets, onClose, onSelectSet }) {
  const { summary, collection, exportCollectionJSON } = useCollection();

  // Calculate per-set progress
  const setProgressList = sets.map((s) => {
    let owned = 0;
    Object.keys(collection).forEach((cardId) => {
      if (cardId.startsWith(`${s.id}-`) || cardId.includes(`-${s.id}`)) {
        if (collection[cardId]?.owned || collection[cardId]?.quantity > 0) {
          owned++;
        }
      }
    });
    const total = s.printedTotal || s.total || 1;
    const pct = Math.min(100, Math.round((owned / total) * 100));
    return {
      set: s,
      owned,
      total,
      pct
    };
  }).filter((item) => item.owned > 0)
    .sort((a, b) => b.owned - a.owned);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                Collection Overview
              </h2>
              <p className="text-xs text-slate-400">
                Track your Pokémon cards and completed sets
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Top Big KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Unique Cards</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {summary.uniqueCards}
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Copies</span>
              <div className="text-2xl font-bold text-slate-100 mt-1">
                {summary.totalPhysicalCards}
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-bold text-amber-400 uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Holos</span>
              </span>
              <div className="text-2xl font-bold text-amber-300 mt-1">
                {summary.holoCards}
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-bold text-rose-400 uppercase flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>Wishlist</span>
              </span>
              <div className="text-2xl font-bold text-rose-300 mt-1">
                {summary.wishlistCount}
              </div>
            </div>
          </div>

          {/* Sets with cards collected */}
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
              Sets You Have Started ({setProgressList.length})
            </h3>

            {setProgressList.length === 0 ? (
              <div className="py-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800 text-sm text-slate-500">
                You haven't marked any cards as owned yet! Pick a set and click "+ Mark as Owned" on your cards.
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {setProgressList.map(({ set, owned, total, pct }) => (
                  <div
                    key={set.id}
                    onClick={() => {
                      onSelectSet(set);
                      onClose();
                    }}
                    className="p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 rounded-2xl transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      {set.images?.symbol && (
                        <img
                          src={set.images.symbol}
                          alt=""
                          className="w-5 h-5 object-contain"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div>
                        <div className="font-semibold text-sm text-white group-hover:text-rose-400 transition">
                          {set.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {owned} of {total} cards ({pct}%)
                        </div>
                      </div>
                    </div>

                    <div className="w-28 text-right">
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold mt-1 inline-block">
                        {pct}% Complete
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Export Action */}
          <div className="pt-2 flex justify-between items-center border-t border-slate-800">
            <span className="text-xs text-slate-400">Keep your collection safe</span>
            <button
              type="button"
              onClick={exportCollectionJSON}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Backup</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
