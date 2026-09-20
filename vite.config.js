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

import { spawn } from 'child_process';

function emailDevMiddlewarePlugin() {
  return {
    name: 'email-dev-middleware-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const isEmailOrFeedback = req.url && (
          req.url.startsWith('/api/send-email') || 
          req.url.startsWith('/api/send-feedback') || 
          req.url.startsWith('/send-email') ||
          req.url.startsWith('/send-feedback')
        );

        if (isEmailOrFeedback && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const pyScript = `
import sys, json
sys.path.append('.')
try:
    from api.email_service import send_auto_email
    d = json.loads(sys.stdin.read())
    event_type = d.get('type', 'feedback')
    email = d.get('email', 'guest@omnira.ai')
    name = d.get('name', 'OMNIRA User')
    plan = d.get('plan', 'Pro')
    categories = d.get('categories', [])
    details = d.get('details', '')
    user_query = d.get('user_query', '')
    ai_response = d.get('ai_response', '')
    model = d.get('model', 'OMNIRA (GPT-4o)')
    ok = send_auto_email(
        event_type=event_type,
        to_email=email,
        name=name,
        plan=plan,
        categories=categories,
        details=details,
        user_query=user_query,
        ai_response=ai_response,
        model=model
    )
    print(json.dumps({'success': ok}))
except Exception as e:
    print(json.dumps({'success': False, 'error': str(e)}))
`;
              const py = spawn('python', ['-c', pyScript]);
              py.stdin.write(JSON.stringify(data));
              py.stdin.end();

              let output = '';
              py.stdout.on('data', chunk => { output += chunk; });
              py.on('close', () => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(output || JSON.stringify({ success: true, message: 'Dispatched' }));
              });
            } catch (err) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ success: true, message: 'Fallback ok' }));
            }
          });
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
    ttsDevMiddlewarePlugin(),
    emailDevMiddlewarePlugin()
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
