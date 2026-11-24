import { describe, it, expect } from 'vitest';
import { getApplicableVariants } from '../utils/cardVariants';

describe('card variant detection engine (cardVariants.js)', () => {
  it('returns exactly 1 variant for Illustration Rares', () => {
    const irCard = {
      id: 'sv3pt5-166',
      name: 'Bulbasaur',
      rarity: 'Illustration Rare',
      set: { id: 'sv3pt5', name: '151', series: 'Scarlet & Violet' }
    };

    const variants = getApplicableVariants(irCard, irCard.set);
    expect(variants.length).toBe(1);
    expect(variants[0].isHolo).toBe(true);
    expect(variants[0].singleVariant).toBe(true);
  });

  it('returns exactly 1 variant for Special Illustration Rares', () => {
    const sirCard = {
      id: 'sv3pt5-199',
      name: 'Charizard ex',
      rarity: 'Special Illustration Rare',
      set: { id: 'sv3pt5', name: '151' }
    };

    const variants = getApplicableVariants(sirCard, sirCard.set);
    expect(variants.length).toBe(1);
    expect(variants[0].singleVariant).toBe(true);
  });

  it('returns 2 variants (Normal + Rev Holo) for modern Common/Uncommon cards', () => {
    const commonCard = {
      id: 'sv3pt5-4',
      name: 'Charmander',
      rarity: 'Common',
      set: { id: 'sv3pt5', name: '151' }
    };

    const variants = getApplicableVariants(commonCard, commonCard.set);
    expect(variants.length).toBe(2);
    const ids = variants.map(v => v.id);
    expect(ids).toContain('normal');
    expect(ids).toContain('reverseHolo');
    expect(ids).not.toContain('holo'); // Commons don't have standard holo rare finish in booster packs
  });

  it('returns 2 variants (Holo + Rev Holo) for modern Rare Holo cards', () => {
    const holoCard = {
      id: 'sv3pt5-150',
      name: 'Mewtwo',
      rarity: 'Rare Holo',
      set: { id: 'sv3pt5', name: '151' }
    };

    const variants = getApplicableVariants(holoCard, holoCard.set);
    expect(variants.length).toBe(2);
    const ids = variants.map(v => v.id);
    expect(ids).toContain('holo');
    expect(ids).toContain('reverseHolo');
  });

  it('returns exactly 1 variant for Vintage Base Set cards (before reverse holos existed)', () => {
    const vintageHolo = {
      id: 'base1-4',
      name: 'Charizard',
      rarity: 'Rare Holo',
      set: { id: 'base1', name: 'Base Set', series: 'Base' }
    };

    const variantsHolo = getApplicableVariants(vintageHolo, vintageHolo.set);
    expect(variantsHolo.length).toBe(1);
    expect(variantsHolo[0].id).toBe('holo');

    const vintageCommon = {
      id: 'base1-58',
      name: 'Pikachu',
      rarity: 'Common',
      set: { id: 'base1', name: 'Base Set', series: 'Base' }
    };

    const variantsCommon = getApplicableVariants(vintageCommon, vintageCommon.set);
    expect(variantsCommon.length).toBe(1);
    expect(variantsCommon[0].id).toBe('normal');
  });

  it('respects verified market data from tcgplayer prices', () => {
    const marketCard = {
      id: 'test-1',
      name: 'Custom Card',
      rarity: 'Rare',
      tcgplayer: {
        prices: {
          holofoil: { market: 5.00 }
        }
      }
    };

    const variants = getApplicableVariants(marketCard);
    expect(variants.length).toBe(1);
    expect(variants[0].id).toBe('holo');
  });
});
