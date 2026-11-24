import { describe, it, expect } from 'vitest';
import { pokemonApi } from '../api/pokemonApi';
import { storage, STORAGE_KEYS } from '../utils/storage';

describe('pokemonApi service', () => {
  it('returns cached sets if available in storage', async () => {
    const fakeSets = [{ id: 'test-set', name: 'Test Set', series: 'Test Series', printedTotal: 100 }];
    storage.setCachedData(STORAGE_KEYS.SETS_CACHE, fakeSets);

    const result = await pokemonApi.getSets();
    expect(result.source).toBe('cache');
    expect(result.sets).toEqual(fakeSets);

    storage.removeItem(STORAGE_KEYS.SETS_CACHE);
  });

  it('falls back to bundled catalog when offline/unreachable', async () => {
    storage.removeItem(STORAGE_KEYS.SETS_CACHE);

    // In unit test environment without real network, it will fallback safely
    const result = await pokemonApi.getSets();
    expect(result.sets.length).toBeGreaterThan(0);
    expect(['catalog', 'live']).toContain(result.source);
  });

  it('returns fallback cards for Base Set when offline', async () => {
    const result = await pokemonApi.getCardsForSet('base1');
    expect(result.cards.length).toBeGreaterThan(0);
    expect(result.cards.find(c => c.name === 'Charizard')).toBeDefined();
  });

  it('returns complete 141 fallback cards for Delta Reign when offline or API lacks set', async () => {
    storage.removeItem(`${STORAGE_KEYS.CARDS_CACHE_PREFIX}me06`);
    const result = await pokemonApi.getCardsForSet('me06');
    expect(result.cards.length).toBe(141);
    expect(result.cards.find(c => c.name === 'Mega Rayquaza ex')).toBeDefined();
    expect(result.cards[0].images.large).toContain('limitlesstcg.nyc3.cdn.digitaloceanspaces.com');
  });

  it('handles empty or null setId safely without crashing', async () => {
    const result = await pokemonApi.getCardsForSet(null);
    expect(result.cards).toEqual([]);
    expect(result.source).toBe('empty');
  });
});
