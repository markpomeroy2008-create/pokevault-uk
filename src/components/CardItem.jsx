import React, { useState } from 'react';
import { Check, ShoppingBag, ExternalLink, Plus, Minus, Star, Heart, Sparkles } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { convertToGBP, formatGBP } from '../utils/currency';
import { getCardBuyOptions } from '../api/buyLinks';
import { getApplicableVariants } from '../utils/cardVariants';

export function CardItem({ card, set, onOpenDetail }) {
  const { isOwned, getCardEntry, toggleCardOwned, adjustQuantity, isInWishlist, toggleWishlist } = useCollection();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imgSrc, setImgSrc] = useState(card.images?.small || card.images?.large);

  const owned = isOwned(card.id);
  const cardEntry = getCardEntry(card.id);
  const inWishlist = isInWishlist(card.id);
  const variants = cardEntry.variants || { normal: 0, holo: 0, reverseHolo: 0, firstEdition: 0 };
  
  // Determine legitimately applicable variants for this specific card
  const applicableVariants = getApplicableVariants(card, set);

  // Buy options (sorted cheapest first)
  const buyOptions = getCardBuyOptions(card, set);
  const cheapestOption = buyOptions[0] || null;

  // Pricing info
  const cmPrice = card.cardmarket?.prices?.lowPrice || card.cardmarket?.prices?.trendPrice;
  const priceGbp = cmPrice ? convertToGBP(cmPrice, 'EUR') : null;

  const isHolo = card.rarity && (
    card.rarity.toLowerCase().includes('holo') ||
    card.rarity.toLowerCase().includes('secret') ||
    card.rarity.toLowerCase().includes('ultra') ||
    card.rarity.toLowerCase().includes('illustration')
  );

  return (
    <div
      className={`group relative flex flex-col rounded-2xl bg-slate-900 border transition-all duration-300 overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 ${
        owned
          ? 'border-emerald-500/50 shadow-emerald-950/20 ring-1 ring-emerald-500/20'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Card Badge / Controls Bar */}
      <div className="absolute top-2.5 inset-x-2.5 z-10 flex items-center justify-between pointer-events-none">
        
        {/* Card Number & Rarity */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[11px] font-mono font-bold text-slate-200 border border-slate-700/60 shadow-sm">
            #{card.number}
          </span>
          {isHolo && (
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 backdrop-blur-md text-[10px] font-semibold text-amber-300 border border-amber-500/30 flex items-center gap-0.5 shadow-sm">
              <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
              <span>Holo</span>
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(card.id);
          }}
          className={`pointer-events-auto w-7 h-7 rounded-full flex items-center justify-center transition backdrop-blur-md shadow-sm ${
            inWishlist
              ? 'bg-rose-500 text-white'
              : 'bg-slate-950/70 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-700/60'
          }`}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Card Image Area */}
      <div
        className={`relative aspect-[2.5/3.5] bg-slate-950 flex items-center justify-center p-3 cursor-pointer ${
          isHolo ? 'holo-card-effect' : ''
        }`}
        onClick={() => onOpenDetail(card)}
      >
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 animate-pulse">
            <div className="w-12 h-16 rounded border-2 border-dashed border-slate-700" />
          </div>
        )}

        {imageError ? (
          <div className="w-full h-full rounded-xl bg-slate-800/80 flex flex-col items-center justify-center p-4 text-center">
            <div className="text-xs font-semibold text-slate-300">{card.name}</div>
            <div className="text-[10px] text-slate-500 mt-1">Image unavailable</div>
          </div>
        ) : (
          <img
            src={imgSrc}
            alt={card.name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              if (card.images?.large && imgSrc !== card.images.large) {
                setImgSrc(card.images.large);
              } else {
                setImageError(true);
              }
            }}
            className={`w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Owned Status Watermark overlay if owned */}
        {owned && (
          <div className="absolute bottom-2 right-2 pointer-events-none">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[11px] font-bold shadow-lg shadow-emerald-950/60 backdrop-blur-sm border border-emerald-400/40">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Owned {cardEntry.quantity > 1 ? `(${cardEntry.quantity})` : ''}</span>
            </div>
          </div>
        )}
      </div>

      {/* Card Information */}
      <div className="p-3.5 flex flex-col flex-1 justify-between bg-slate-900/90">
        <div>
          {/* Card Name */}
          <h3
            onClick={() => onOpenDetail(card)}
            className="font-bold text-sm text-slate-100 hover:text-rose-400 transition cursor-pointer truncate"
            title={card.name}
          >
            {card.name}
          </h3>

          {/* Rarity & Supertype */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span className="truncate max-w-[120px]">{card.rarity || card.supertype || 'Card'}</span>
            {priceGbp ? (
              <span className="font-semibold text-emerald-400">
                ~{formatGBP(priceGbp)}
              </span>
            ) : (
              <span className="text-slate-500 text-[10px]">Market price N/A</span>
            )}
          </div>
        </div>

        {/* Variant Choice & Ownership Controls */}
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-col gap-2">
          
          {/* If the card only has 1 legitimate variant (e.g. Illustration Rare, Secret Rare, or Vintage Holo) */}
          {applicableVariants.length === 1 ? (
            (() => {
              const v = applicableVariants[0];
              const count = (variants[v.id] || (owned ? cardEntry.quantity || 1 : 0));
              const isVarOwned = count > 0 || owned;

              return (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    adjustQuantity(card.id, v.id, isVarOwned ? -count : 1);
                  }}
                  className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm ${
                    isVarOwned
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600'
                  }`}
                  title={isVarOwned ? `Marked as owned (${count} copy). Click to remove.` : `Mark this ${v.label} as owned`}
                >
                  <Check className={`w-3.5 h-3.5 ${isVarOwned ? 'text-white stroke-[3]' : 'text-slate-500'}`} />
                  <span>{isVarOwned ? `I Have This Card (${count})` : `+ I Have This Card`}</span>
                  {v.isHolo && (
                    <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 flex items-center gap-0.5 ml-1">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>{v.shortLabel}</span>
                    </span>
                  )}
                </button>
              );
            })()
          ) : (
            /* Multi-variant card (e.g. Normal + Reverse Holo, or Holo + Reverse Holo) */
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                <span>Choose Variant:</span>
                {owned && (
                  <span className="text-emerald-400 font-bold text-[10px]">
                    {cardEntry.quantity || 1} owned
                  </span>
                )}
              </div>

              <div className={`grid ${applicableVariants.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800`}>
                {applicableVariants.map((v) => {
                  const count = variants[v.id] || 0;
                  const isVarOwned = count > 0;

                  let activeColor = 'bg-emerald-600 text-white';
                  if (v.id === 'holo') activeColor = 'bg-amber-600 text-white';
                  if (v.id === 'reverseHolo') activeColor = 'bg-purple-600 text-white';

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        adjustQuantity(card.id, v.id, count > 0 ? -1 : 1);
                      }}
                      className={`py-1.5 px-1 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center transition ${
                        isVarOwned
                          ? `${activeColor} shadow-sm`
                          : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200'
                      }`}
                      title={isVarOwned ? `${v.label}: ${count} owned (Click to remove)` : `Click to add ${v.label}`}
                    >
                      <span className="flex items-center gap-0.5">
                        {v.isHolo && <Star className="w-2.5 h-2.5 fill-current" />}
                        <span>{v.shortLabel}</span>
                      </span>
                      <span className="text-[9px] font-semibold opacity-90">
                        {isVarOwned ? `✓ (${count})` : '+ Add'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* UK Buy Link (Sorted Cheapest First) */}
          {cheapestOption && (
            <div className="flex items-center gap-1.5 w-full mt-0.5">
              <a
                href={cheapestOption.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-bold transition shadow-sm ${cheapestOption.btnColor}`}
                title={`Buy on ${cheapestOption.name} (UK Delivery)`}
              >
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Buy: {cheapestOption.name.split(' ')[0]}</span>
                <ExternalLink className="w-3 h-3 shrink-0 opacity-75" />
              </a>

              {/* View all marketplace links button */}
              <button
                type="button"
                onClick={() => onOpenDetail(card)}
                className="shrink-0 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1 shadow-sm"
                title="Compare all UK buying options (eBay UK, Cardmarket, Magic Madhouse)"
              >
                <span>All</span>
                <span className="text-[10px] text-slate-400">({buyOptions.length})</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
