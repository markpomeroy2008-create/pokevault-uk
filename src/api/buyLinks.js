/**
 * Smart Buy Links Generator (UK Delivery Focused, Cheapest-First)
 */
import { convertToGBP } from '../utils/currency';

export function getCardBuyOptions(card, set) {
  if (!card) return [];

  const cardName = card.name || '';
  const cardNumber = card.number || '';
  const setTotal = (set && set.printedTotal) || (card.set && card.set.printedTotal) || '';
  const setName = (set && set.name) || (card.set && card.set.name) || '';
  const cleanSetName = setName
    .replace(/Pokémon|Pokemon/gi, '')
    .replace(/^[\s\-–—:]+|[\s\-–—:]+$/g, '')
    .trim();

  // Optimized search terms
  const cardIdentifier = `${cardName} ${cardNumber}${setTotal ? '/' + setTotal : ''}`;
  const fullSearchQuery = `${cardName} ${cardNumber} ${cleanSetName}`.trim();

  const options = [];

  // 1. Cardmarket (Europe & UK's premier singles marketplace)
  // Cardmarket offers the absolute lowest raw singles prices in the UK/Europe.
  const cmPrices = card.cardmarket?.prices;
  const cmLowEur = cmPrices?.lowPrice ?? cmPrices?.trendPrice ?? null;
  const cmLowGbp = cmLowEur ? convertToGBP(cmLowEur, 'EUR') : null;
  const cmTrendGbp = cmPrices?.trendPrice ? convertToGBP(cmPrices.trendPrice, 'EUR') : null;

  // Use direct product page URL if available from API, otherwise search URL
  const cardmarketUrl = card.cardmarket?.url || 
    `https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${encodeURIComponent(cardIdentifier || fullSearchQuery)}`;

  options.push({
    id: 'cardmarket',
    name: 'Cardmarket (UK & EU)',
    badge: 'Europe & UK #1 Singles Market',
    tag: 'Direct Marketplace',
    priceEstimate: cmLowGbp,
    priceNote: cmLowGbp ? `Low from ~£${cmLowGbp.toFixed(2)} (Trend: £${cmTrendGbp?.toFixed(2) || '—'})` : 'Lowest single card prices',
    url: cardmarketUrl,
    ukDelivery: true,
    sortFeature: 'All listings sorted cheapest first by default',
    color: 'from-blue-600 to-indigo-700',
    btnColor: 'bg-blue-600 hover:bg-blue-500 text-white',
    logoText: 'CM',
    rankScore: cmLowGbp ? cmLowGbp * 0.95 : 1 // High priority because typically cheapest in Europe/UK
  });

  // 2. eBay UK (Pre-sorted by Lowest Price + P&P, UK Item Location)
  // _sop=15 => Price + Postage: lowest first
  // LH_PrefLoc=1 => UK Only (No international customs/VAT surprises)
  // _sacat=183454 => Collectible Card Games > Pokémon Individual Cards
  const ebayQuery = `Pokemon ${cardName} ${cardNumber} ${cleanSetName}`.trim();
  const ebayUrl = `https://www.ebay.co.uk/sch/i.html?_nkw=${encodeURIComponent(ebayQuery)}&_sacat=183454&_sop=15&LH_PrefLoc=1&LH_ItemCondition=1000|1500|2000|2500|3000`;

  options.push({
    id: 'ebay-uk',
    name: 'eBay UK',
    badge: 'Sorted: Cheapest First (Price + P&P)',
    tag: 'Auction & Buy It Now',
    priceEstimate: cmLowGbp ? cmLowGbp * 1.1 : null, // estimated rough ballpark based on market
    priceNote: 'Live listings pre-filtered to lowest Price + Postage',
    url: ebayUrl,
    ukDelivery: true,
    sortFeature: 'Pre-sorted by Price + P&P: lowest first (UK Only)',
    color: 'from-amber-600 to-yellow-600',
    btnColor: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold',
    logoText: 'eBay',
    rankScore: cmLowGbp ? cmLowGbp : 2
  });

  // 3. Magic Madhouse UK (Leading dedicated UK TCG singles store)
  const mmQuery = `${cardName} ${cleanSetName}`.trim();
  const magicMadhouseUrl = `https://magicmadhouse.co.uk/search.php?search_query=${encodeURIComponent(mmQuery)}`;

  options.push({
    id: 'magic-madhouse',
    name: 'Magic Madhouse UK',
    badge: 'Official UK Specialist Retailer',
    tag: 'Trusted Retailer',
    priceEstimate: null,
    priceNote: 'Fast UK dispatch & flat tracked shipping',
    url: magicMadhouseUrl,
    ukDelivery: true,
    sortFeature: 'Dedicated singles inventory with grading guarantee',
    color: 'from-purple-600 to-violet-700',
    btnColor: 'bg-purple-600 hover:bg-purple-500 text-white',
    logoText: 'MM',
    rankScore: 10
  });

  // 4. Chaos Cards UK (Leading UK hobby shop)
  const chaosCardsUrl = `https://www.chaoscards.co.uk/search?q=${encodeURIComponent(fullSearchQuery)}`;

  options.push({
    id: 'chaos-cards',
    name: 'Chaos Cards UK',
    badge: 'UK Card Superstore',
    tag: 'UK Retailer',
    priceEstimate: null,
    priceNote: 'Next-day UK delivery available',
    url: chaosCardsUrl,
    ukDelivery: true,
    sortFeature: 'Competitive UK singles & sealed stock',
    color: 'from-rose-600 to-red-700',
    btnColor: 'bg-rose-600 hover:bg-rose-500 text-white',
    logoText: 'CC',
    rankScore: 11
  });

  // 5. Total Cards UK (UK Independent store)
  const totalCardsUrl = `https://www.totalcards.net/search?q=${encodeURIComponent(fullSearchQuery)}`;

  options.push({
    id: 'total-cards',
    name: 'Total Cards UK',
    badge: 'Independent UK Hobby Shop',
    tag: 'UK Retailer',
    priceEstimate: null,
    priceNote: 'Singles and booster singles',
    url: totalCardsUrl,
    ukDelivery: true,
    sortFeature: 'UK loyalty rewards program',
    color: 'from-emerald-600 to-teal-700',
    btnColor: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    logoText: 'TC',
    rankScore: 12
  });

  // 6. Go Cards UK (Specialist UK Pokémon TCG store)
  const goCardsUrl = `https://gocardsuk.co.uk/search?type=product&q=${encodeURIComponent(fullSearchQuery)}`;

  options.push({
    id: 'gocards-uk',
    name: 'Go Cards UK',
    badge: 'UK Pokémon Specialist',
    tag: 'UK Retailer',
    priceEstimate: null,
    priceNote: 'UK singles, slabs & sealed Pokémon stock',
    url: goCardsUrl,
    ukDelivery: true,
    sortFeature: 'Specialist UK Pokémon shop with fast UK dispatch',
    color: 'from-cyan-600 to-sky-700',
    btnColor: 'bg-cyan-600 hover:bg-cyan-500 text-white',
    logoText: 'GC',
    rankScore: 13
  });

  // 7. TCGPlayer (US Reference / International)
  if (card.tcgplayer?.url) {
    const tcgNormal = card.tcgplayer.prices?.normal?.market || card.tcgplayer.prices?.holofoil?.market;
    const tcgGbp = tcgNormal ? convertToGBP(tcgNormal, 'USD') : null;

    options.push({
      id: 'tcgplayer',
      name: 'TCGPlayer (Direct Link)',
      badge: 'Global Pricing Benchmark',
      tag: 'International',
      priceEstimate: tcgGbp,
      priceNote: tcgGbp ? `US Market ~$${tcgNormal.toFixed(2)} (~£${tcgGbp.toFixed(2)})` : 'US Market Reference',
      url: card.tcgplayer.url,
      ukDelivery: false,
      sortFeature: 'Check international sellers who ship to UK',
      color: 'from-slate-700 to-slate-800',
      btnColor: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
      logoText: 'TCG',
      rankScore: 20
    });
  }

  // Sort by rankScore (lowest estimated price first)
  return options.sort((a, b) => a.rankScore - b.rankScore);
}
