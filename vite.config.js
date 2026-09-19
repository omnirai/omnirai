import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import https from 'https'

function ttsDevMiddlewarePlugin() {
  return {
    name: 'tts-dev-middleware-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && (req.url.startsWith('/api/tts') || req.url.startsWith('/tts'))) {
          try {
            const urlObj = new URL(req.url, 'http://localhost:5173');
            const text = urlObj.searchParams.get('text') || '';
            const lang = urlObj.searchParams.get('lang') || 'en';

            if (!text) {
              res.statusCode = 400;
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end('Missing text parameter');
              return;
            }

            const cleanText = encodeURIComponent(text.slice(0, 190));
            const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${cleanText}`;

            const request = https.get(googleUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://translate.google.com/'
              }
            }, (googleRes) => {
              res.statusCode = googleRes.statusCode || 200;
              res.setHeader('Content-Type', 'audio/mpeg');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Cache-Control', 'public, max-age=86400');
              googleRes.pipe(res);
            });

            request.on('error', (err) => {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'text/plain');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(err.message);
            });
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(e.message);
          }
          return;
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ttsDevMiddlewarePlugin()
  ],
  server: {
    port: 5173,
    proxy: {
      '/api/generate-image': {
        target: 'http://127.0.0.1:5050',
        changeOrigin: true,
        secure: false,
      },
      '/api/image-quota': {
        target: 'http://127.0.0.1:5050',
        changeOrigin: true,
        secure: false,
      },
      '/api/send-email': {
        target: 'http://127.0.0.1:5050',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
