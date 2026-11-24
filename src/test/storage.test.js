import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '../utils/storage';

describe('storage service', () => {
  beforeEach(() => {
    storage.memoryFallback.clear();
  });

  it('stores and retrieves items correctly', () => {
    storage.setItem('test_key', { name: 'Pikachu', hp: 40 });
    const val = storage.getItem('test_key');
    expect(val).toEqual({ name: 'Pikachu', hp: 40 });
  });

  it('returns default value when key does not exist', () => {
    const val = storage.getItem('non_existent_key', 'DEFAULT');
    expect(val).toBe('DEFAULT');
  });

  it('removes items correctly', () => {
    storage.setItem('test_key_remove', 123);
    storage.removeItem('test_key_remove');
    expect(storage.getItem('test_key_remove')).toBeNull();
  });

  it('handles TTL caching properly', () => {
    const cacheKey = 'test_cache_ttl';
    const sampleData = [{ id: 'sv1', name: 'Scarlet & Violet' }];

    // Set cached data
    storage.setCachedData(cacheKey, sampleData);

    // Retrieve immediately (within TTL) -> valid
    const cached = storage.getCachedData(cacheKey, 5000);
    expect(cached).toEqual(sampleData);

    // Retrieve with 0ms TTL (expired) -> returns null
    const expired = storage.getCachedData(cacheKey, -1);
    expect(expired).toBeNull();
  });
});
