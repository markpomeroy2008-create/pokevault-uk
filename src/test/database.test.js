import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../server/db.js';

describe('central database engine (server/db.js)', () => {
  beforeEach(() => {
    // Reset database to clean state for testing
    db.bulkSync({}, []);
  });

  it('initializes and returns default structure', () => {
    const data = db.getData();
    expect(data).toBeDefined();
    expect(data.collection).toEqual({});
    expect(data.wishlist).toEqual([]);
    expect(data.lastModified).toBeTruthy();
  });

  it('saves and updates card with variants and quantities', () => {
    const cardId = 'sv3pt5-4';
    db.saveCard(cardId, {
      owned: true,
      quantity: 2,
      variants: { normal: 1, holo: 1, reverseHolo: 0, firstEdition: 0 },
      notes: 'Pack fresh'
    });

    const card = db.getData().collection[cardId];
    expect(card).toBeDefined();
    expect(card.owned).toBe(true);
    expect(card.quantity).toBe(2);
    expect(card.variants.holo).toBe(1);
    expect(card.notes).toBe('Pack fresh');
  });

  it('toggles card on and off', () => {
    const cardId = 'sv3pt5-25';

    // 1st toggle: turns ON
    const state1 = db.toggleCard(cardId);
    expect(state1).toBe(true);
    expect(db.getData().collection[cardId]?.owned).toBe(true);

    // 2nd toggle: turns OFF
    const state2 = db.toggleCard(cardId);
    expect(state2).toBe(false);
    expect(db.getData().collection[cardId]).toBeUndefined();
  });

  it('toggles wishlist items', () => {
    const cardId = 'sv3pt5-6';

    // Add to wishlist
    const added = db.toggleWishlist(cardId);
    expect(added).toBe(true);
    expect(db.getData().wishlist).toContain(cardId);

    // Remove from wishlist
    const removed = db.toggleWishlist(cardId);
    expect(removed).toBe(false);
    expect(db.getData().wishlist).not.toContain(cardId);
  });

  it('accurately stores and syncs Reverse Holo variant selections', () => {
    const cardId = 'sv3pt5-7';
    // User taps "Rev Holo" on card
    db.saveCard(cardId, {
      owned: true,
      quantity: 1,
      variants: { normal: 0, holo: 0, reverseHolo: 1, firstEdition: 0 }
    });

    const card = db.getData().collection[cardId];
    expect(card).toBeDefined();
    expect(card.owned).toBe(true);
    expect(card.quantity).toBe(1);
    expect(card.variants.reverseHolo).toBe(1);
    expect(card.variants.normal).toBe(0);
  });

  it('performs bulk sync correctly', () => {
    const newCollection = {
      'base1-4': { owned: true, quantity: 1 }
    };
    const newWishlist = ['base1-2'];

    db.bulkSync(newCollection, newWishlist);

    const data = db.getData();
    expect(data.collection).toEqual(newCollection);
    expect(data.wishlist).toEqual(newWishlist);
  });
});
