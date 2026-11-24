import { describe, it, expect } from 'vitest';
import { getCardBuyOptions } from '../api/buyLinks';

describe('buyLinks service', () => {
  const sampleCard = {
    id: 'sv3pt5-4',
    name: 'Charmander',
    number: '4',
    rarity: 'Common',
    set: {
      id: 'sv3pt5',
      name: '151',
      series: 'Scarlet & Violet',
      printedTotal: 165
    },
    cardmarket: {
      url: 'https://www.cardmarket.com/en/Pokemon/Products/Singles/151/Charmander-MEW004',
      prices: {
        lowPrice: 0.50,
        trendPrice: 1.20,
        averageSellPrice: 0.95,
        reverseHoloLow: 2.10
      }
    },
    tcgplayer: {
      url: 'https://www.tcgplayer.com/product/516999',
      prices: {
        normal: { market: 0.65 }
      }
    }
  };

  const sampleSet = {
    id: 'sv3pt5',
    name: '151',
    printedTotal: 165
  };

  it('generates buy options including all required UK marketplaces', () => {
    const options = getCardBuyOptions(sampleCard, sampleSet);

    const ids = options.map(o => o.id);
    expect(ids).toContain('cardmarket');
    expect(ids).toContain('ebay-uk');
    expect(ids).toContain('magic-madhouse');
    expect(ids).toContain('chaos-cards');
    expect(ids).toContain('total-cards');
    expect(ids).toContain('gocards-uk');
    expect(ids).toContain('tcgplayer');
  });

  it('configures eBay UK with cheapest-first sort (_sop=15) and UK location (LH_PrefLoc=1)', () => {
    const options = getCardBuyOptions(sampleCard, sampleSet);
    const ebay = options.find(o => o.id === 'ebay-uk');

    expect(ebay).toBeDefined();
    expect(ebay.url).toContain('ebay.co.uk');
    expect(ebay.url).toContain('_sop=15'); // Price + P&P: lowest first
    expect(ebay.url).toContain('LH_PrefLoc=1'); // UK Only
    expect(ebay.url).toContain('_sacat=183454'); // Pokémon card category
    expect(ebay.ukDelivery).toBe(true);
  });

  it('configures Go Cards UK with product search filter', () => {
    const options = getCardBuyOptions(sampleCard, sampleSet);
    const gocards = options.find(o => o.id === 'gocards-uk');

    expect(gocards).toBeDefined();
    expect(gocards.url).toContain('https://gocardsuk.co.uk/search?type=product&q=');
    expect(gocards.url).toContain(encodeURIComponent('Charmander'));
    expect(gocards.ukDelivery).toBe(true);
  });

  it('uses direct Cardmarket product URL when available', () => {
    const options = getCardBuyOptions(sampleCard, sampleSet);
    const cm = options.find(o => o.id === 'cardmarket');

    expect(cm).toBeDefined();
    expect(cm.url).toBe(sampleCard.cardmarket.url);
    expect(cm.priceEstimate).toBeGreaterThan(0);
  });

  it('falls back to Cardmarket search URL when direct url is missing', () => {
    const cardWithoutCmUrl = {
      ...sampleCard,
      cardmarket: {
        prices: { lowPrice: 2.0 }
      }
    };
    const options = getCardBuyOptions(cardWithoutCmUrl, sampleSet);
    const cm = options.find(o => o.id === 'cardmarket');

    expect(cm).toBeDefined();
    expect(cm.url).toContain('cardmarket.com/en/Pokemon/Products/Search?searchString=');
  });

  it('handles special characters in Pokémon names safely', () => {
    const cardWithSpecialChars = {
      id: 'base1-83',
      name: "Farfetch'd & Nidoran♀",
      number: '83',
      set: { name: 'Base Set', printedTotal: 102 }
    };

    const options = getCardBuyOptions(cardWithSpecialChars, cardWithSpecialChars.set);
    options.forEach(opt => {
      // Must not throw URIError or produce invalid URIs
      expect(() => new URL(opt.url)).not.toThrow();
    });
  });

  it('orders options with estimated cheapest prices first', () => {
    const options = getCardBuyOptions(sampleCard, sampleSet);
    expect(options.length).toBeGreaterThanOrEqual(6);

    // Cardmarket and eBay UK should be ranked first based on price / lowest sorting
    expect(['cardmarket', 'ebay-uk']).toContain(options[0].id);
  });

  it('returns empty array when passed null card', () => {
    expect(getCardBuyOptions(null)).toEqual([]);
  });
});
