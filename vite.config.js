import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Custom plugin to handle Vercel /api routes locally during Vite dev
const vercelApiPlugin = () => ({
  name: 'vercel-api-plugin',
  configureServer(server) {
    server.middlewares.use('/api/transcript', async (req, res, next) => {
      try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        req.query = Object.fromEntries(url.searchParams);
        const { default: handler } = await import('./api/transcript.js');
        // Simple mock of res.status().json() for Vercel
        res.status = (code) => { res.statusCode = code; return res; };
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };
        await handler(req, res);
      } catch (err) {
        console.error('API Error:', err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vercelApiPlugin()],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', '@react-oauth/google', 'jwt-decode'],
          ui: ['lucide-react'],
          data: ['axios', '@supabase/supabase-js'],
          resume: ['jspdf', 'html2canvas', 'tesseract.js']
        }
      }
    },
    chunkSizeWarningLimit: 1000 // Slightly increase limit as we are now intentionally splitting
  }
});
