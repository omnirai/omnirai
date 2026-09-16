import os
import sys
import json
import urllib.parse
from http.server import BaseHTTPRequestHandler

# Ensure root workspace directory is in python path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from quick_ai_engine import QuickAiEngine
from api.cloudflare_ai import generate_image_with_quota, check_quota

engine = QuickAiEngine()

class handler(BaseHTTPRequestHandler):
    def send_json_res(self, status_code, data):
        res_bytes = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(res_bytes)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS, GET')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id')
        self.end_headers()
        self.wfile.write(res_bytes)

    def get_auth_user_id(self, data=None):
        user_id = self.headers.get('X-User-Id')
        if not user_id and isinstance(data, dict):
            user_id = data.get('user_id') or data.get('userId')
        if not user_id:
            user_id = 'guest_user'
        return str(user_id).strip()

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body_raw = self.rfile.read(content_length).decode('utf-8', errors='ignore') if content_length > 0 else ''
            try:
                data = json.loads(body_raw, strict=False) if body_raw else {}
            except Exception:
                data = {'prompt': body_raw}

            path = self.path.split('?')[0].rstrip('/')

            # 1. Image Generation Endpoint
            if path in ['/api/generate-image', '/generate-image']:
                prompt = data.get('prompt', '') if isinstance(data, dict) else str(body_raw)
                user_id = self.get_auth_user_id(data if isinstance(data, dict) else None)
                
                success, payload, status_code, quota_info = generate_image_with_quota(user_id, prompt)
                if success:
                    self.send_json_res(200, payload)
                else:
                    self.send_json_res(status_code, payload)
                return

            # 2. Image Quota Check Endpoint
            if path in ['/api/image-quota', '/image-quota']:
                user_id = self.get_auth_user_id(data if isinstance(data, dict) else None)
                quota = check_quota(user_id)
                self.send_json_res(200, {"quota": quota})
                return

            # 3. Default Chat Endpoint
            prompt = data.get('prompt', '') if isinstance(data, dict) else str(body_raw)
            mode = data.get('mode', 'chat') if isinstance(data, dict) else 'chat'
            model = data.get('model', 'gpt-4o') if isinstance(data, dict) else 'gpt-4o'

            response_text = engine.process_query(prompt, mode=mode, model=model)
            self.send_json_res(200, {'response': response_text})

        except Exception as e:
            self.send_json_res(500, {'response': f"⚠️ Server Error: {str(e)}", 'error': str(e)})

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS, GET')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id')
        self.end_headers()

    def do_GET(self):
        try:
            path = self.path.split('?')[0].rstrip('/')
            if path in ['/api/image-quota', '/image-quota']:
                # Extract user_id from query params or header
                query = urllib.parse.urlparse(self.path).query if hasattr(urllib.parse, 'urlparse') else ''
                user_id = self.headers.get('X-User-Id', 'guest_user')
                quota = check_quota(user_id)
                self.send_json_res(200, {"quota": quota})
                return

            body = json.dumps({'status': 'Quick AI Backend Online', 'creator': 'bishalcodes.com'}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(body)
        except Exception as e:
            self.send_json_res(500, {'error': str(e)})

