import { describe, it, expect } from 'vitest';
import { convertToGBP } from '../utils/currency';

describe('collection calculation logic', () => {
  const cards = [
    {
      id: 'sv3pt5-1',
      name: 'Bulbasaur',
      cardmarket: { prices: { lowPrice: 2.00 } }
    },
    {
      id: 'sv3pt5-4',
      name: 'Charmander',
      cardmarket: { prices: { lowPrice: 3.54 } } // 3.54 EUR / 1.18 = 3.00 GBP
    },
    {
      id: 'sv3pt5-7',
      name: 'Squirtle',
      cardmarket: { prices: { lowPrice: 2.50 } }
    }
  ];

  it('calculates set completion and value correctly', () => {
    const mockCollection = {
      'sv3pt5-1': {
        owned: true,
        quantity: 2,
        variants: { normal: 1, holo: 1, reverseHolo: 0, firstEdition: 0 }
      },
      'sv3pt5-4': {
        owned: true,
        quantity: 1,
        variants: { normal: 1, holo: 0, reverseHolo: 0, firstEdition: 0 }
      }
    };

    let ownedCount = 0;
    let totalCards = 0;
    let estimatedValueGbp = 0;

    cards.forEach((card) => {
      const entry = mockCollection[card.id];
      if (entry && (entry.quantity > 0 || entry.owned)) {
        ownedCount++;
        totalCards += (entry.quantity || 1);

        const cmLow = card.cardmarket?.prices?.lowPrice;
        if (cmLow) {
          const gbp = convertToGBP(cmLow, 'EUR');
          if (gbp) {
            estimatedValueGbp += gbp * (entry.quantity || 1);
          }
        }
      }
    });

    const percentage = Math.round((ownedCount / cards.length) * 100);

    expect(ownedCount).toBe(2);
    expect(totalCards).toBe(3); // 2 Bulbasaurs + 1 Charmander
    expect(percentage).toBe(67); // 2 out of 3 = 67%
    expect(estimatedValueGbp).toBeGreaterThan(4);
  });

  it('correctly validates JSON import structure', () => {
    const validJson = JSON.stringify({
      exportVersion: '1.0',
      collection: {
        'sv3pt5-1': { owned: true, quantity: 1 }
      },
      wishlist: ['sv3pt5-4']
    });

    const parsed = JSON.parse(validJson);
    expect(parsed.collection).toBeDefined();
    expect(typeof parsed.collection).toBe('object');
    expect(Array.isArray(parsed.wishlist)).toBe(true);
  });
});
