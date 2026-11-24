import { describe, it, expect } from 'vitest';
import { INITIAL_SETS, FEATURED_SERIES, FALLBACK_BASE1_CARDS, FALLBACK_DELTA_REIGN_CARDS } from '../data/featuredSets';

describe('featured sets catalog and fallbacks', () => {
  it('has Delta Reign as the newest first set in INITIAL_SETS', () => {
    expect(INITIAL_SETS[0].name).toBe('Delta Reign');
    expect(INITIAL_SETS[0].id).toBe('me06');
    expect(INITIAL_SETS[0].series).toBe('Mega Evolution');
  });

  it('contains sets for all primary Pokémon TCG eras', () => {
    expect(INITIAL_SETS.length).toBeGreaterThan(25);

    const seriesInCatalog = new Set(INITIAL_SETS.map(s => s.series));
    expect(seriesInCatalog.has('Mega Evolution')).toBe(true);
    expect(seriesInCatalog.has('Scarlet & Violet')).toBe(true);
    expect(seriesInCatalog.has('Sword & Shield')).toBe(true);
    expect(seriesInCatalog.has('Sun & Moon')).toBe(true);
    expect(seriesInCatalog.has('XY')).toBe(true);
    expect(seriesInCatalog.has('Black & White')).toBe(true);
    expect(seriesInCatalog.has('Base')).toBe(true);
  });

  it('every set has valid id, name, series, printedTotal and symbols', () => {
    INITIAL_SETS.forEach(set => {
      expect(set.id).toBeTruthy();
      expect(set.name).toBeTruthy();
      expect(set.series).toBeTruthy();
      expect(typeof set.printedTotal).toBe('number');
      expect(set.printedTotal).toBeGreaterThan(0);
      expect(set.images?.symbol).toBeTruthy();
    });
  });

  it('fallback Base Set cards have complete data for offline testing', () => {
    expect(FALLBACK_BASE1_CARDS.length).toBeGreaterThan(5);

    FALLBACK_BASE1_CARDS.forEach(card => {
      expect(card.id).toBeTruthy();
      expect(card.name).toBeTruthy();
      expect(card.number).toBeTruthy();
      expect(card.images?.small).toBeTruthy();
      expect(card.images?.large).toBeTruthy();
      expect(card.cardmarket?.prices?.lowPrice).toBeGreaterThan(0);
    });
  });

  it('fallback Delta Reign cards have complete 141-card master catalog with artwork', () => {
    expect(FALLBACK_DELTA_REIGN_CARDS.length).toBe(141);

    // Verify key headliner cards
    const megaRayquazaEx = FALLBACK_DELTA_REIGN_CARDS.find(c => c.number === '84');
    expect(megaRayquazaEx).toBeDefined();
    expect(megaRayquazaEx.name).toBe('Mega Rayquaza ex');
    expect(megaRayquazaEx.images.large).toContain('limitlesstcg.nyc3.cdn.digitaloceanspaces.com');

    const goldMegaRayquaza = FALLBACK_DELTA_REIGN_CARDS.find(c => c.number === '141');
    expect(goldMegaRayquaza).toBeDefined();
    expect(goldMegaRayquaza.name).toBe('Mega Rayquaza ex');
    expect(goldMegaRayquaza.rarity).toBe('Hyper Rare');

    FALLBACK_DELTA_REIGN_CARDS.forEach(card => {
      expect(card.id).toBeTruthy();
      expect(card.name).toBeTruthy();
      expect(card.number).toBeTruthy();
      expect(card.images?.small).toBeTruthy();
      expect(card.images?.large).toBeTruthy();
      expect(card.cardmarket?.prices?.lowPrice).toBeGreaterThan(0);
    });
  });
});
