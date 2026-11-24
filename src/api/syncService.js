/**
 * Central Database Sync Client
 * Connects phone, Mac, and any device to the central database hosted on the Mac.
 *
 * On GitHub Pages (static hosting): all API calls are silently skipped and the
 * app falls back to per-device localStorage only.
 * On localhost (Vite dev server): full multi-device sync via SSE + polling.
 */

// Detect whether we are running on the local Vite dev server.
// On GitHub Pages the origin will be https://markpomeroy2008.github.io/pokevault-uk/
const IS_LOCAL_SERVER = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ||
   /^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname));

class DatabaseSyncService {
  constructor() {
    this.eventSource = null;
    this.isConnected = false;
    this.listeners = new Set();
    this.pollInterval = null;
  }

  // Fetch initial database state from Mac server
  async fetchCollection() {
    if (!IS_LOCAL_SERVER) return { success: false, error: 'static-host' };
    try {
      const res = await fetch('/api/collection');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { success: true, data };
    } catch (err) {
      console.warn('Could not reach central database, operating in offline/localStorage mode:', err);
      return { success: false, error: err.message };
    }
  }

  // Toggle card ownership on central database
  async toggleCard(cardId) {
    if (!IS_LOCAL_SERVER) return { success: false };
    try {
      const res = await fetch('/api/collection/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, action: 'toggle' })
      });
      return await res.json();
    } catch (err) {
      console.warn('Failed to sync card toggle to central database:', err);
      return { success: false };
    }
  }

  // Update card details (variants, quantities, notes) on central database
  async updateCard(cardId, cardData) {
    if (!IS_LOCAL_SERVER) return { success: false };
    try {
      const res = await fetch('/api/collection/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, action: 'update', cardData })
      });
      return await res.json();
    } catch (err) {
      console.warn('Failed to sync card update to central database:', err);
      return { success: false };
    }
  }

  // Toggle wishlist item on central database
  async toggleWishlist(cardId) {
    if (!IS_LOCAL_SERVER) return { success: false };
    try {
      const res = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId })
      });
      return await res.json();
    } catch (err) {
      console.warn('Failed to sync wishlist toggle to central database:', err);
      return { success: false };
    }
  }

  // Bulk sync collection to central database
  async bulkSync(collection, wishlist) {
    if (!IS_LOCAL_SERVER) return { success: false };
    try {
      const res = await fetch('/api/collection/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection, wishlist })
      });
      return await res.json();
    } catch (err) {
      console.warn('Failed to bulk sync to central database:', err);
      return { success: false };
    }
  }

  // Start real-time SSE listener with resilient background polling fallback.
  // On GitHub Pages this returns immediately with a no-op teardown.
  startRealtimeSync(onUpdate, onStatusChange) {
    if (typeof window === 'undefined') return () => {};
    if (!IS_LOCAL_SERVER) return () => {};

    let lastKnownTimestamp = null;

    // Helper to apply updates if newer
    const applyUpdate = (data) => {
      if (!data) return;
      if (data.timestamp && data.timestamp === lastKnownTimestamp) return;
      if (data.timestamp) lastKnownTimestamp = data.timestamp;

      if (onUpdate) {
        onUpdate({
          type: 'db_update',
          collection: data.collection,
          wishlist: data.wishlist
        });
      }
    };

    const connectSSE = () => {
      if (!window.EventSource) return;

      try {
        if (this.eventSource) {
          this.eventSource.close();
        }

        this.eventSource = new EventSource('/api/sync/events');

        this.eventSource.onopen = () => {
          this.isConnected = true;
          if (onStatusChange) onStatusChange(true);
        };

        this.eventSource.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'db_update') {
              applyUpdate(payload);
            }
          } catch (e) {
            console.error('Error parsing sync message:', e);
          }
        };

        this.eventSource.onerror = () => {
          this.isConnected = false;
          if (onStatusChange) onStatusChange(false);
          this.eventSource?.close();

          // Try reconnecting after 3 seconds
          setTimeout(connectSSE, 3000);
        };
      } catch (err) {
        console.warn('EventSource failed:', err);
      }
    };

    connectSSE();

    // Parallel active polling loop (every 2.5s) to guarantee sync even if mobile browser throttles SSE
    this.pollInterval = setInterval(async () => {
      const res = await this.fetchCollection();
      if (res.success && res.data) {
        if (!this.isConnected && onStatusChange) {
          onStatusChange(true);
        }
        applyUpdate(res.data);
      }
    }, 2500);

    return () => {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
        this.pollInterval = null;
      }
    };
  }
}

export const syncService = new DatabaseSyncService();
