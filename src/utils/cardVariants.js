/**
 * Pokémon TCG Variant Detection Engine
 * Determines which card variants (Normal, Holo, Reverse Holo, etc.)
 * legitimately exist for a given card based on its rarity, set, and market data.
 */

export function getApplicableVariants(card, set) {
  if (!card) return [];

  const rarity = (card.rarity || '').toLowerCase().trim();
  const setId = (set?.id || card.set?.id || '').toLowerCase();
  const series = (set?.series || card.set?.series || '').toLowerCase();

  // 1. TCGPlayer prices data provides exact market-verified variants
  const tcgPrices = card.tcgplayer?.prices;
  if (tcgPrices && typeof tcgPrices === 'object') {
    const keys = Object.keys(tcgPrices);
    const hasNormal = keys.includes('normal');
    const hasHolo = keys.includes('holofoil');
    const hasRev = keys.includes('reverseHolofoil');

    // If TCGPlayer lists specific variants for this card
    if (hasNormal || hasHolo || hasRev) {
      const detected = [];
      if (hasNormal) {
        detected.push({
          id: 'normal',
          label: 'Regular',
          shortLabel: 'Normal',
          color: 'emerald',
          isHolo: false,
          description: 'Standard non-holo printing'
        });
      }
      if (hasHolo) {
        detected.push({
          id: 'holo',
          label: 'Holofoil',
          shortLabel: 'Holo',
          color: 'amber',
          isHolo: true,
          description: 'Holographic foil finish'
        });
      }
      if (hasRev) {
        detected.push({
          id: 'reverseHolo',
          label: 'Reverse Holo',
          shortLabel: 'Rev Holo',
          color: 'purple',
          isHolo: true,
          description: 'Parallel reverse holofoil'
        });
      }
      if (detected.length > 0) return detected;
    }
  }

  // 2. Single-variant special rarities
  // Illustration Rares, SIRs, Ultra Rares, Hyper/Gold Rares, Radiant, ACE SPEC, Promos
  // only exist in ONE single textured/foil variant.
  const isSingleVariantSpecial =
    rarity.includes('illustration') ||
    rarity.includes('special illustration') ||
    rarity.includes('hyper') ||
    rarity.includes('secret') ||
    rarity.includes('ultra') ||
    rarity.includes('double rare') ||
    rarity.includes('radiant') ||
    rarity.includes('ace spec') ||
    rarity.includes('vmax') ||
    rarity.includes('vstar') ||
    rarity.includes('promo') ||
    rarity.includes('amazing');

  if (isSingleVariantSpecial) {
    const displayRarity = card.rarity || 'Special Foil';
    return [
      {
        id: 'holo',
        label: displayRarity,
        shortLabel: 'Holo Foil',
        color: 'amber',
        isHolo: true,
        singleVariant: true,
        description: `${displayRarity} (Single Foil Variant)`
      }
    ];
  }

  // 3. Vintage Sets without Reverse Holos (Pre-2002 sets: Base Set, Jungle, Fossil, Team Rocket, Gym, Neo)
  const vintageSets = ['base1', 'base2', 'base3', 'base4', 'base5', 'gym1', 'gym2', 'neo1', 'neo2', 'neo3', 'neo4'];
  const isVintage = vintageSets.includes(setId) || series.includes('base') || series.includes('neo');

  if (isVintage) {
    if (rarity.includes('holo')) {
      return [
        {
          id: 'holo',
          label: 'Holofoil',
          shortLabel: 'Holo',
          color: 'amber',
          isHolo: true,
          singleVariant: true,
          description: 'Vintage holofoil card'
        }
      ];
    } else {
      return [
        {
          id: 'normal',
          label: 'Regular',
          shortLabel: 'Normal',
          color: 'emerald',
          isHolo: false,
          singleVariant: true,
          description: 'Standard non-holo card'
        }
      ];
    }
  }

  // 4. Standard modern Rare Holo cards
  // Modern Holo Rares have the Holofoil version and a Reverse Holo version
  if (rarity === 'rare holo' || rarity.includes('rare holo')) {
    return [
      {
        id: 'holo',
        label: 'Holofoil',
        shortLabel: 'Holo',
        color: 'amber',
        isHolo: true,
        description: 'Holographic artwork'
      },
      {
        id: 'reverseHolo',
        label: 'Reverse Holo',
        shortLabel: 'Rev Holo',
        color: 'purple',
        isHolo: true,
        description: 'Reverse holofoil parallel'
      }
    ];
  }

  // 5. Standard modern Commons, Uncommons & Regular Non-Holo Rares
  // Available in Regular (Normal) and Reverse Holo parallel
  return [
    {
      id: 'normal',
      label: 'Regular',
      shortLabel: 'Normal',
      color: 'emerald',
      isHolo: false,
      description: 'Standard non-holo card'
    },
    {
      id: 'reverseHolo',
      label: 'Reverse Holo',
      shortLabel: 'Rev Holo',
      color: 'purple',
      isHolo: true,
      description: 'Reverse holofoil parallel'
    }
  ];
}
