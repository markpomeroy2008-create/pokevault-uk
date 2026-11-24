/**
 * Pokémon TCG API Client with Caching & Offline Support
 */

import { storage, STORAGE_KEYS } from '../utils/storage';
import { INITIAL_SETS, FALLBACK_BASE1_CARDS, FALLBACK_DELTA_REIGN_CARDS } from '../data/featuredSets';

const BASE_URL = 'https://api.pokemontcg.io/v2';

export class PokemonApiService {
  getApiKey() {
    const settings = storage.getItem(STORAGE_KEYS.SETTINGS, {});
    return settings.apiKey || '';
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    const key = this.getApiKey();
    if (key) {
      headers['X-Api-Key'] = key;
    }
    return headers;
  }

  /**
   * Fetch all sets (ordered by release date descending)
   */
  async getSets() {
    // 1. Check local cache (valid for 24 hours)
    const cachedSets = storage.getCachedData(STORAGE_KEYS.SETS_CACHE, 24 * 60 * 60 * 1000);
    if (cachedSets && cachedSets.length > 0) {
      return { sets: cachedSets, source: 'cache' };
    }

    // 2. Fetch live from Pokémon TCG API
    try {
      const response = await fetch(`${BASE_URL}/sets?orderBy=-releaseDate`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const json = await response.json();
      const liveSets = json.data || [];

      if (liveSets.length > 0) {
        storage.setCachedData(STORAGE_KEYS.SETS_CACHE, liveSets);
        return { sets: liveSets, source: 'live' };
      }
    } catch (err) {
      console.warn('Failed to fetch live sets from api.pokemontcg.io, using fallback catalog:', err);
    }

    // 3. Fallback to bundled INITIAL_SETS
    return { sets: INITIAL_SETS, source: 'catalog' };
  }

  /**
   * Fetch all cards for a specific set
   */
  async getCardsForSet(setId) {
    if (!setId) return { cards: [], source: 'empty' };

    const cacheKey = `${STORAGE_KEYS.CARDS_CACHE_PREFIX}${setId}`;

    // 1. Check cache (valid for 12 hours)
    const cachedCards = storage.getCachedData(cacheKey, 12 * 60 * 60 * 1000);
    if (cachedCards && cachedCards.length > 0) {
      // If cached set is Delta Reign but has incomplete card count or old fallback, refresh with full catalog
      if ((setId === 'me06' || setId === 'me6' || setId === 'dlr') && cachedCards.length < FALLBACK_DELTA_REIGN_CARDS.length) {
        storage.setCachedData(cacheKey, FALLBACK_DELTA_REIGN_CARDS);
        return { cards: FALLBACK_DELTA_REIGN_CARDS, source: 'catalog-fallback' };
      }
      return { cards: cachedCards, source: 'cache' };
    }

    // 2. Fetch from API with pagination if set is large
    try {
      let allCards = [];
      let page = 1;
      let totalCount = 0;
      const pageSize = 250;

      do {
        const url = `${BASE_URL}/cards?q=set.id:${setId}&orderBy=number&page=${page}&pageSize=${pageSize}`;
        const response = await fetch(url, { headers: this.getHeaders() });

        if (!response.ok) {
          throw new Error(`API error ${response.status}: ${response.statusText}`);
        }

        const json = await response.json();
        const pageCards = json.data || [];
        totalCount = json.totalCount || pageCards.length;
        allCards = allCards.concat(pageCards);

        page++;
      } while (allCards.length < totalCount && page <= 3);

      if (allCards.length > 0) {
        // Natural numeric sort by card number
        allCards.sort((a, b) => {
          const numA = parseInt(a.number, 10);
          const numB = parseInt(b.number, 10);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return (a.number || '').localeCompare(b.number || '', undefined, { numeric: true });
        });

        storage.setCachedData(cacheKey, allCards);
        return { cards: allCards, source: 'live' };
      }
    } catch (err) {
      console.warn(`Failed to fetch cards for set "${setId}":`, err);
    }

    // 3. If fallback exists for this set, return fallback
    if (setId === 'base1') {
      return { cards: FALLBACK_BASE1_CARDS, source: 'catalog-fallback' };
    }
    if (setId === 'me06' || setId === 'me6' || setId === 'dlr') {
      return { cards: FALLBACK_DELTA_REIGN_CARDS, source: 'catalog-fallback' };
    }

    return { cards: [], source: 'error', error: 'Unable to reach Pokémon TCG API. Check your internet connection or configure an API key in Settings.' };
  }
}

export const pokemonApi = new PokemonApiService();
