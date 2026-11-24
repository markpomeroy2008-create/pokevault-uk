import React, { useState } from 'react';
import { X, Check, ShoppingBag, ExternalLink, Plus, Minus, Star, Heart, ShieldCheck, Truck, ArrowUpDown } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { getCardBuyOptions } from '../api/buyLinks';
import { formatGBP, convertToGBP } from '../utils/currency';
import { getApplicableVariants } from '../utils/cardVariants';

export function CardDetailModal({ card, set, onClose }) {
  const { isOwned, getCardEntry, toggleCardOwned, adjustQuantity, updateCardDetails, isInWishlist, toggleWishlist } = useCollection();
  
  if (!card) return null;

  const owned = isOwned(card.id);
  const cardEntry = getCardEntry(card.id);
  const inWishlist = isInWishlist(card.id);
  const applicableVariants = getApplicableVariants(card, set);

  // Buy options pre-sorted by cheapest first
  const buyOptions = getCardBuyOptions(card, set);

  // Notes state
  const [notes, setNotes] = useState(cardEntry.notes || '');

  const handleNotesBlur = () => {
    updateCardDetails(card.id, { notes });
  };

  const cmPrices = card.cardmarket?.prices;
  const lowGbp = cmPrices?.lowPrice ? convertToGBP(cmPrices.lowPrice, 'EUR') : null;
  const trendGbp = cmPrices?.trendPrice ? convertToGBP(cmPrices.trendPrice, 'EUR') : null;
  const avgGbp = cmPrices?.averageSellPrice ? convertToGBP(cmPrices.averageSellPrice, 'EUR') : null;
  const revGbp = cmPrices?.reverseHoloLow ? convertToGBP(cmPrices.reverseHoloLow, 'EUR') : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono font-bold border border-slate-700">
              #{card.number}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white font-display truncate">
              {card.name}
            </h2>
            {card.rarity && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold">
                {card.rarity}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleWishlist(card.id)}
              className={`p-2 rounded-xl border transition ${
                inWishlist
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title={inWishlist ? 'In your wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: High-Res Card Artwork */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] rounded-2xl overflow-hidden bg-slate-950 shadow-2xl p-2 border border-slate-800">
              <img
                src={card.images?.large || card.images?.small}
                alt={card.name}
                className="w-full h-auto object-contain rounded-xl filter drop-shadow-xl"
                onError={(e) => {
                  e.target.onerror = null;
                  if (card.images?.small && e.target.src !== card.images.small) {
                    e.target.src = card.images.small;
                  }
                }}
              />
              {owned && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 border border-emerald-400">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>In Collection ({cardEntry.quantity || 1})</span>
                </div>
              )}
            </div>

            {/* Set & Subtypes */}
            <div className="mt-4 text-center">
              <div className="text-xs text-slate-400">
                {card.set?.name || set?.name} • {card.set?.series || set?.series}
              </div>
              <div className="text-xs font-semibold text-slate-300 mt-0.5">
                {card.supertype} {card.subtypes ? `• ${card.subtypes.join(', ')}` : ''}
              </div>
              {card.artist && (
                <div className="text-[11px] text-slate-500 mt-1">
                  Illustrated by {card.artist}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Collection Tracking & Where To Buy (UK Delivery) */}
          <div className="md:col-span-7 flex flex-col space-y-6">
            
            {/* 1. Collection State Management ("I Have This Card") */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-sm text-white uppercase tracking-wider">
                    My Collection Status
                  </span>
                </div>
                
                {/* Master Owned Toggle */}
                <button
                  type="button"
                  onClick={() => toggleCardOwned(card.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                    owned
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${owned ? 'stroke-[3]' : 'opacity-40'}`} />
                  <span>{owned ? 'I Have This Card' : 'Mark as Owned'}</span>
                </button>
              </div>

              {/* Variant Quantity Counters */}
              <div className={`grid ${applicableVariants.length === 1 ? 'grid-cols-1' : applicableVariants.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-2.5 mt-3 pt-3 border-t border-slate-850`}>
                {applicableVariants.map((v) => {
                  const count = (cardEntry.variants?.[v.id] || (v.singleVariant && owned ? cardEntry.quantity || 1 : 0));
                  const isVarOwned = count > 0;

                  let borderActive = 'bg-emerald-950/30 border-emerald-500/50 shadow-sm';
                  let btnColor = 'bg-emerald-600 hover:bg-emerald-500';
                  let textColor = 'text-emerald-400';
                  let badgeBg = 'bg-emerald-500/10';

                  if (v.id === 'holo') {
                    borderActive = 'bg-amber-950/30 border-amber-500/50 shadow-sm';
                    btnColor = 'bg-amber-600 hover:bg-amber-500';
                    textColor = 'text-amber-400';
                    badgeBg = 'bg-amber-500/10';
                  } else if (v.id === 'reverseHolo') {
                    borderActive = 'bg-purple-950/30 border-purple-500/50 shadow-sm';
                    btnColor = 'bg-purple-600 hover:bg-purple-500';
                    textColor = 'text-purple-400';
                    badgeBg = 'bg-purple-500/10';
                  }

                  return (
                    <div
                      key={v.id}
                      className={`rounded-xl p-3 flex flex-col justify-between border transition ${
                        isVarOwned ? borderActive : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                          {v.isHolo && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                          <span>{v.label}</span>
                        </span>
                        {isVarOwned && (
                          <span className={`text-[10px] font-bold ${textColor} ${badgeBg} px-1.5 py-0.5 rounded`}>
                            Owned ({count})
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {v.description}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60">
                        <button
                          type="button"
                          onClick={() => adjustQuantity(card.id, v.id, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition active:scale-95"
                          title={`Decrease ${v.label} quantity`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className={`font-mono font-bold text-base ${isVarOwned ? textColor : 'text-slate-400'}`}>
                          {count}
                        </span>
                        <button
                          type="button"
                          onClick={() => adjustQuantity(card.id, v.id, 1)}
                          className={`w-7 h-7 rounded-lg ${btnColor} text-white flex items-center justify-center transition shadow-sm active:scale-95`}
                          title={`Add ${v.label} copy`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Card Condition / Notes */}
              <div className="mt-3">
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleNotesBlur}
                  placeholder="Card notes (e.g. Near Mint, Binder Page 3, Graded PSA 9)..."
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* 2. Where To Buy on the Internet (UK Delivery & Sorted Cheapest First) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                    <ShoppingBag className="w-4 h-4 text-rose-500" />
                    <span>Where to Buy (UK Delivery)</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3 text-emerald-400" />
                    <span>Sorted by cheapest available first • Verified UK delivery</span>
                  </p>
                </div>

                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                  <Truck className="w-3 h-3" />
                  <span>UK Shipping</span>
                </div>
              </div>

              {/* Market Reference Price Ticker */}
              {(lowGbp || trendGbp) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Lowest Price</span>
                    <span className="font-bold text-emerald-400">{formatGBP(lowGbp)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Market Trend</span>
                    <span className="font-bold text-slate-200">{formatGBP(trendGbp)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Avg Sold</span>
                    <span className="font-bold text-slate-300">{formatGBP(avgGbp)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Reverse Holo</span>
                    <span className="font-bold text-purple-300">{formatGBP(revGbp)}</span>
                  </div>
                </div>
              )}

              {/* Marketplace Buy Links List */}
              <div className="space-y-2">
                {buyOptions.map((opt, idx) => (
                  <div
                    key={opt.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${opt.color} flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-md`}>
                        {opt.logoText}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white">{opt.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            {opt.badge}
                          </span>
                          {idx === 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              ★ Cheapest Option
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {opt.priceNote}
                        </div>
                      </div>
                    </div>

                    <a
                      href={opt.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${opt.btnColor}`}
                    >
                      <span>View on {opt.name.split(' ')[0]}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </a>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
