/**
 * Safe LocalStorage and Cache Manager
 */

const STORAGE_KEYS = {
  COLLECTION: 'pokevault_collection_v1',
  SETTINGS: 'pokevault_settings_v1',
  SETS_CACHE: 'pokevault_sets_cache_v1',
  CARDS_CACHE_PREFIX: 'pokevault_cards_cache_'
};

class StorageService {
  constructor() {
    this.memoryFallback = new Map();
  }

  isAvailable() {
    try {
      const test = '__storage_test__';
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  getItem(key, defaultValue = null) {
    if (this.isAvailable()) {
      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (err) {
        console.warn(`Error reading key "${key}" from localStorage:`, err);
        return defaultValue;
      }
    }
    return this.memoryFallback.has(key) ? this.memoryFallback.get(key) : defaultValue;
  }

  setItem(key, value) {
    if (this.isAvailable()) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (err) {
        console.warn(`Error writing key "${key}" to localStorage:`, err);
        this.memoryFallback.set(key, value);
        return false;
      }
    }
    this.memoryFallback.set(key, value);
    return true;
  }

  removeItem(key) {
    if (this.isAvailable()) {
      window.localStorage.removeItem(key);
    }
    this.memoryFallback.delete(key);
  }

  // Cache helper with TTL (time to live, default 24 hours)
  getCachedData(key, ttlMs = 24 * 60 * 60 * 1000) {
    const cached = this.getItem(key);
    if (!cached || !cached.timestamp || !cached.data) return null;
    if (Date.now() - cached.timestamp > ttlMs) {
      return null; // Expired
    }
    return cached.data;
  }

  setCachedData(key, data) {
    this.setItem(key, {
      timestamp: Date.now(),
      data
    });
  }
}

export const storage = new StorageService();
export { STORAGE_KEYS };
