import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../data/collection_db.json');

const dbEmitter = new EventEmitter();

function getDefaultDb() {
  return {
    version: '1.0',
    lastModified: new Date().toISOString(),
    collection: {},
    wishlist: []
  };
}

class JsonDatabase {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.collection) this.data.collection = {};
        if (!Array.isArray(this.data.wishlist)) this.data.wishlist = [];
      } else {
        this.data = getDefaultDb();
        this.saveToDisk();
      }
    } catch (err) {
      console.error('Error initializing database, using fallback in-memory state:', err);
      this.data = getDefaultDb();
    }
  }

  saveToDisk() {
    try {
      this.data.lastModified = new Date().toISOString();
      const tmpPath = `${DB_PATH}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpPath, DB_PATH);
      dbEmitter.emit('change', this.data);
    } catch (err) {
      console.error('Failed to write database to disk:', err);
    }
  }

  getData() {
    if (!this.data) this.init();
    return this.data;
  }

  saveCard(cardId, cardData) {
    if (!cardId) return null;
    const current = this.data.collection[cardId] || {};
    
    // Merge variants carefully
    const currentVariants = current.variants || { normal: 0, holo: 0, reverseHolo: 0, firstEdition: 0 };
    const newVariants = cardData.variants 
      ? { ...currentVariants, ...cardData.variants } 
      : currentVariants;
      
    const totalQty = cardData.quantity !== undefined 
      ? Number(cardData.quantity)
      : Object.values(newVariants).reduce((sum, count) => sum + (Number(count) || 0), 0);

    const isOwned = totalQty > 0 || (cardData.owned === true && totalQty >= 0);

    const updated = {
      ...current,
      ...cardData,
      variants: newVariants,
      quantity: totalQty,
      owned: isOwned,
      updatedAt: new Date().toISOString()
    };

    if (totalQty <= 0 && (!updated.notes || !updated.notes.trim()) && !cardData.owned) {
      delete this.data.collection[cardId];
    } else {
      this.data.collection[cardId] = updated;
    }

    this.saveToDisk();
    return this.data.collection[cardId] || null;
  }

  toggleCard(cardId) {
    if (!cardId) return false;
    const current = this.data.collection[cardId];
    const currentlyOwned = current && (current.quantity > 0 || current.owned);

    if (currentlyOwned) {
      delete this.data.collection[cardId];
    } else {
      this.data.collection[cardId] = {
        owned: true,
        quantity: 1,
        variants: { normal: 1, holo: 0, reverseHolo: 0, firstEdition: 0 },
        notes: '',
        updatedAt: new Date().toISOString()
      };
    }

    this.saveToDisk();
    return !currentlyOwned;
  }

  toggleWishlist(cardId) {
    if (!cardId) return false;
    if (!Array.isArray(this.data.wishlist)) this.data.wishlist = [];

    const index = this.data.wishlist.indexOf(cardId);
    let added = false;
    if (index >= 0) {
      this.data.wishlist.splice(index, 1);
    } else {
      this.data.wishlist.push(cardId);
      added = true;
    }

    this.saveToDisk();
    return added;
  }

  bulkSync(collectionData, wishlistData) {
    if (collectionData && typeof collectionData === 'object') {
      this.data.collection = collectionData;
    }
    if (Array.isArray(wishlistData)) {
      this.data.wishlist = wishlistData;
    }
    this.saveToDisk();
    return this.data;
  }

  onDbChange(listener) {
    dbEmitter.on('change', listener);
    return () => dbEmitter.off('change', listener);
  }
}

export const db = new JsonDatabase();
