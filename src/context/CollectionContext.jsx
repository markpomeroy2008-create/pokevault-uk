import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { convertToGBP } from '../utils/currency';
import { syncService } from '../api/syncService';

const CollectionContext = createContext(null);

export function CollectionProvider({ children }) {
  // Collection storage: { [cardId]: { owned: boolean, quantity: number, variants: { normal, holo, reverseHolo, firstEdition }, notes, updatedAt } }
  const [collection, setCollection] = useState(() => {
    return storage.getItem(STORAGE_KEYS.COLLECTION, {});
  });

  // Settings: { apiKey, currency: 'GBP', defaultSort: 'number' }
  const [settings, setSettings] = useState(() => {
    return storage.getItem(STORAGE_KEYS.SETTINGS, {
      apiKey: '',
      currency: 'GBP',
      defaultSort: 'number'
    });
  });

  // Wishlist: Set of card IDs
  const [wishlist, setWishlist] = useState(() => {
    return storage.getItem('pokevault_wishlist_v1', []);
  });

  // Central Database Connection status
  const [isServerConnected, setIsServerConnected] = useState(false);

  // Initial Database Load & Realtime Sync across Phone & Mac
  useEffect(() => {
    // 1. Initial fetch from Mac central database
    syncService.fetchCollection().then((res) => {
      if (res.success && res.data) {
        setIsServerConnected(true);
        const serverColl = res.data.collection || {};
        const serverWish = res.data.wishlist || [];
        const serverKeys = Object.keys(serverColl);
        const localKeys = Object.keys(collection);

        if (serverKeys.length > 0) {
          // Central database has cards, sync down to this device
          setCollection(serverColl);
          setWishlist(serverWish);
        } else if (localKeys.length > 0) {
          // Central database is empty, seed it with cards already marked in this browser
          syncService.bulkSync(collection, wishlist);
        }
      }
    });

    // 2. Start realtime event stream (SSE / polling) so changes on phone show immediately on Mac
    const unsubscribe = syncService.startRealtimeSync(
      (update) => {
        if (update.collection) {
          setCollection(update.collection);
        }
        if (update.wishlist) {
          setWishlist(update.wishlist);
        }
      },
      (connected) => {
        setIsServerConnected(connected);
      }
    );

    return unsubscribe;
  }, []);

  // Persist collection changes to LocalStorage (as fast offline cache)
  useEffect(() => {
    storage.setItem(STORAGE_KEYS.COLLECTION, collection);
  }, [collection]);

  // Persist settings changes
  useEffect(() => {
    storage.setItem(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  // Persist wishlist changes
  useEffect(() => {
    storage.setItem('pokevault_wishlist_v1', wishlist);
  }, [wishlist]);

  // Check if a card is owned (including any variant having count > 0)
  const isOwned = useCallback((cardId) => {
    const entry = collection[cardId];
    if (!entry) return false;

    // Check variant counts
    if (entry.variants) {
      const variantSum = Object.values(entry.variants).reduce((s, c) => s + (Number(c) || 0), 0);
      if (variantSum > 0) return true;
    }

    if (entry.owned === false && (!entry.quantity || entry.quantity <= 0)) return false;
    return (entry.quantity || 0) > 0 || !!entry.owned;
  }, [collection]);

  // Get full card record from collection
  const getCardEntry = useCallback((cardId) => {
    return collection[cardId] || {
      owned: false,
      quantity: 0,
      variants: { normal: 0, holo: 0, reverseHolo: 0, firstEdition: 0 },
      notes: ''
    };
  }, [collection]);

  // Quick toggle owned status
  const toggleCardOwned = useCallback((cardId) => {
    setCollection((prev) => {
      const current = prev[cardId];
      const currentlyOwned = current && (current.quantity > 0 || current.owned);

      if (currentlyOwned) {
        // Toggle OFF
        syncService.updateCard(cardId, {
          owned: false,
          quantity: 0,
          variants: { normal: 0, holo: 0, reverseHolo: 0, firstEdition: 0 },
          notes: ''
        });
        const updated = { ...prev };
        delete updated[cardId];
        return updated;
      } else {
        // Toggle ON (default 1 regular copy)
        const nextEntry = {
          owned: true,
          quantity: 1,
          variants: { normal: 1, holo: 0, reverseHolo: 0, firstEdition: 0 },
          notes: '',
          updatedAt: new Date().toISOString()
        };
        syncService.updateCard(cardId, nextEntry);
        return {
          ...prev,
          [cardId]: nextEntry
        };
      }
    });
  }, []);

  // Update specific variant counts or notes
  const updateCardDetails = useCallback((cardId, { variants: updatedVariants, notes: updatedNotes }) => {
    setCollection((prev) => {
      const current = prev[cardId] || {
        owned: false,
        quantity: 0,
        variants: { normal: 0, holo: 0, reverseHolo: 0, firstEdition: 0 },
        notes: ''
      };
      const newVariants = { ...(current.variants || {}), ...(updatedVariants || {}) };
      const totalQuantity = Object.values(newVariants).reduce((sum, count) => sum + (Number(count) || 0), 0);
      const notes = updatedNotes !== undefined ? updatedNotes : (current.notes || '');

      const shouldDelete = totalQuantity <= 0 && (!notes || !notes.trim());

      const nextEntry = shouldDelete
        ? null
        : {
            ...current,
            owned: totalQuantity > 0,
            quantity: totalQuantity,
            variants: newVariants,
            notes,
            updatedAt: new Date().toISOString()
          };

      // Sync to Central Database
      if (nextEntry) {
        syncService.updateCard(cardId, nextEntry);
      } else {
        syncService.updateCard(cardId, {
          owned: false,
          quantity: 0,
          variants: newVariants,
          notes: ''
        });
      }

      if (shouldDelete) {
        const updated = { ...prev };
        delete updated[cardId];
        return updated;
      }

      return {
        ...prev,
        [cardId]: nextEntry
      };
    });
  }, []);

  // Quick increment/decrement card quantity
  const adjustQuantity = useCallback((cardId, variant = 'normal', delta = 1) => {
    setCollection((prev) => {
      const current = prev[cardId] || {
        owned: false,
        quantity: 0,
        variants: { normal: 0, holo: 0, reverseHolo: 0, firstEdition: 0 },
        notes: ''
      };
      const curVariantCount = current.variants?.[variant] || 0;
      const nextVariantCount = Math.max(0, curVariantCount + delta);

      const newVariants = {
        ...(current.variants || { normal: 0, holo: 0, reverseHolo: 0, firstEdition: 0 }),
        [variant]: nextVariantCount
      };

      const newTotal = Object.values(newVariants).reduce((sum, count) => sum + (Number(count) || 0), 0);
      const shouldDelete = newTotal <= 0 && (!current.notes || !current.notes.trim());

      const nextEntry = shouldDelete
        ? null
        : {
            ...current,
            owned: newTotal > 0,
            quantity: newTotal,
            variants: newVariants,
            updatedAt: new Date().toISOString()
          };

      // Sync to Central Database with the exact computed variant counts
      if (nextEntry) {
        syncService.updateCard(cardId, nextEntry);
      } else {
        syncService.updateCard(cardId, {
          owned: false,
          quantity: 0,
          variants: newVariants,
          notes: ''
        });
      }

      if (shouldDelete) {
        const copy = { ...prev };
        delete copy[cardId];
        return copy;
      }

      return {
        ...prev,
        [cardId]: nextEntry
      };
    });
  }, []);

  // Wishlist toggles
  const toggleWishlist = useCallback((cardId) => {
    setWishlist((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      } else {
        return [...prev, cardId];
      }
    });

    // Sync to Mac Central Database
    syncService.toggleWishlist(cardId);
  }, []);

  const isInWishlist = useCallback((cardId) => {
    return wishlist.includes(cardId);
  }, [wishlist]);

  // Calculate set statistics
  const getSetStats = useCallback((cards = []) => {
    if (!cards || cards.length === 0) {
      return { total: 0, ownedCount: 0, totalCards: 0, percentage: 0, estimatedValueGbp: 0 };
    }

    let ownedCount = 0;
    let totalCards = 0;
    let estimatedValueGbp = 0;

    cards.forEach((card) => {
      const entry = collection[card.id];
      if (!entry) return;

      const variantSum = entry.variants
        ? Object.values(entry.variants).reduce((s, c) => s + (Number(c) || 0), 0)
        : 0;

      const totalQty = entry.quantity !== undefined
        ? Number(entry.quantity)
        : (variantSum > 0 ? variantSum : (entry.owned ? 1 : 0));

      const isCardOwned = totalQty > 0 || variantSum > 0 || !!entry.owned;

      if (isCardOwned) {
        ownedCount++;
        const effectiveQty = Math.max(totalQty, variantSum, 1);
        totalCards += effectiveQty;

        // Estimate value from Cardmarket low/trend price in GBP
        const cmLow = card.cardmarket?.prices?.lowPrice || card.cardmarket?.prices?.trendPrice;
        if (cmLow) {
          const gbp = convertToGBP(cmLow, 'EUR');
          if (gbp) {
            estimatedValueGbp += gbp * effectiveQty;
          }
        }
      }
    });

    const percentage = cards.length > 0 ? Math.round((ownedCount / cards.length) * 100) : 0;

    return {
      total: cards.length,
      ownedCount,
      totalCards,
      percentage,
      estimatedValueGbp
    };
  }, [collection]);

  // Overall collection summary
  const summary = useMemo(() => {
    let uniqueOwnedCount = 0;
    let totalQuantity = 0;
    let holoCount = 0;
    let reverseHoloCount = 0;

    Object.values(collection).forEach((item) => {
      if (!item) return;

      const variantSum = item.variants
        ? Object.values(item.variants).reduce((s, c) => s + (Number(c) || 0), 0)
        : 0;

      const totalQty = item.quantity !== undefined
        ? Number(item.quantity)
        : (variantSum > 0 ? variantSum : (item.owned ? 1 : 0));

      const isItemOwned = totalQty > 0 || variantSum > 0 || !!item.owned;

      if (isItemOwned) {
        uniqueOwnedCount++;
        totalQuantity += Math.max(totalQty, variantSum, 1);
        holoCount += (item.variants?.holo || 0);
        reverseHoloCount += (item.variants?.reverseHolo || 0);
      }
    });

    return {
      uniqueCards: uniqueOwnedCount,
      totalPhysicalCards: totalQuantity,
      holoCards: holoCount,
      reverseHoloCards: reverseHoloCount,
      wishlistCount: wishlist.length
    };
  }, [collection, wishlist]);

  // Export collection as JSON file
  const exportCollectionJSON = useCallback(() => {
    const dataToExport = {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      collection,
      wishlist,
      stats: summary
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pokevault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [collection, wishlist, summary]);

  // Import collection from JSON file
  const importCollectionJSON = useCallback((jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed.collection === 'object') {
        setCollection(parsed.collection);
        if (Array.isArray(parsed.wishlist)) {
          setWishlist(parsed.wishlist);
        }
        // Sync imported data to Mac database
        syncService.bulkSync(parsed.collection, parsed.wishlist || []);
        return { success: true, count: Object.keys(parsed.collection).length };
      } else if (parsed && typeof parsed === 'object') {
        // Direct collection object format
        setCollection(parsed);
        syncService.bulkSync(parsed, []);
        return { success: true, count: Object.keys(parsed).length };
      }
      return { success: false, error: 'Invalid JSON format' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const clearCollection = useCallback(() => {
    setCollection({});
    setWishlist([]);
    syncService.bulkSync({}, []);
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const value = {
    collection,
    isOwned,
    getCardEntry,
    toggleCardOwned,
    updateCardDetails,
    adjustQuantity,
    wishlist,
    toggleWishlist,
    isInWishlist,
    getSetStats,
    summary,
    exportCollectionJSON,
    importCollectionJSON,
    clearCollection,
    settings,
    updateSettings,
    isServerConnected
  };

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection() {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }
  return context;
}
