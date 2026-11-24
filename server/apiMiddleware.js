import { db } from './db.js';

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(data));
}

// Active SSE client connections
const sseClients = new Set();

// Broadcast database updates to all connected devices in real time
db.onDbChange((updatedData) => {
  const payload = JSON.stringify({
    type: 'db_update',
    timestamp: updatedData.lastModified,
    collection: updatedData.collection,
    wishlist: updatedData.wishlist
  });

  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
});

export function apiMiddleware() {
  return async (req, res, next) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.end();
    }

    // Health check
    if (pathname === '/api/health') {
      return sendJson(res, 200, { status: 'ok', time: new Date().toISOString() });
    }

    // Get collection
    if (pathname === '/api/collection' && req.method === 'GET') {
      const data = db.getData();
      return sendJson(res, 200, {
        success: true,
        collection: data.collection,
        wishlist: data.wishlist,
        lastModified: data.lastModified
      });
    }

    // Update / Toggle single card
    if (pathname === '/api/collection/card' && req.method === 'POST') {
      const body = await parseBody(req);
      const { cardId, action, cardData } = body;

      if (!cardId) {
        return sendJson(res, 400, { success: false, error: 'cardId is required' });
      }

      if (action === 'toggle') {
        const isOwned = db.toggleCard(cardId);
        return sendJson(res, 200, { success: true, cardId, isOwned });
      } else {
        const updated = db.saveCard(cardId, cardData || {});
        return sendJson(res, 200, { success: true, cardId, card: updated });
      }
    }

    // Bulk sync / restore
    if (pathname === '/api/collection/sync' && req.method === 'POST') {
      const body = await parseBody(req);
      const updated = db.bulkSync(body.collection, body.wishlist);
      return sendJson(res, 200, { success: true, data: updated });
    }

    // Toggle wishlist
    if (pathname === '/api/wishlist/toggle' && req.method === 'POST') {
      const body = await parseBody(req);
      if (!body.cardId) {
        return sendJson(res, 400, { success: false, error: 'cardId is required' });
      }
      const added = db.toggleWishlist(body.cardId);
      return sendJson(res, 200, { success: true, cardId: body.cardId, inWishlist: added });
    }

    // Real-Time Server-Sent Events (SSE) Stream
    if (pathname === '/api/sync/events' && req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });

      if (typeof res.flushHeaders === 'function') {
        res.flushHeaders();
      }

      // Send initial confirmation
      res.write(`data: ${JSON.stringify({ type: 'connected', time: new Date().toISOString() })}\n\n`);

      sseClients.add(res);

      // Heartbeat ping every 10s to keep connection alive
      const pingInterval = setInterval(() => {
        try {
          res.write(': keepalive\n\n');
        } catch {
          clearInterval(pingInterval);
          sseClients.delete(res);
        }
      }, 10000);

      req.on('close', () => {
        clearInterval(pingInterval);
        sseClients.delete(res);
      });
      return;
    }

    // Pass through non-API requests to Vite
    next();
  };
}
