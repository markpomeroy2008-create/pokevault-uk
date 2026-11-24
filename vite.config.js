import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Only load backend middleware when running the local dev server
// (not during static production builds for GitHub Pages)
let backendPlugin = null;
if (process.env.NODE_ENV !== 'production') {
  try {
    const { apiMiddleware } = await import('./server/apiMiddleware.js');
    backendPlugin = {
      name: 'pokevault-database-api',
      configureServer(server) {
        server.middlewares.use(apiMiddleware());
      },
      configurePreviewServer(server) {
        server.middlewares.use(apiMiddleware());
      }
    };
  } catch (e) {
    // No backend available (e.g. CI/build environment)
  }
}

// https://vite.dev/config/
export default defineConfig({
  // base path matches the GitHub Pages repo name
  base: '/pokevault-uk/',
  plugins: [
    react(),
    tailwindcss(),
    ...(backendPlugin ? [backendPlugin] : [])
  ],
  server: {
    port: 3000,
    host: true, // Exposes the dev server to your local Wi-Fi network
    watch: {
      ignored: ['**/data/**', '**/data/collection_db.json*']
    },
    open: true
  }
});
