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
from api.email_service import send_auto_email
from api.tts import get_tts_audio_bytes

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

            # 3. Auto Email & Feedback Dispatch Endpoint
            if path in ['/api/send-email', '/send-email', '/api/send-feedback', '/send-feedback', '/api/feedback']:
                email = data.get('email', '').strip() if isinstance(data, dict) else ''
                name = data.get('name', '').strip() if isinstance(data, dict) else ''
                event_type = data.get('type', 'welcome').strip() if isinstance(data, dict) else 'welcome'
                if path in ['/api/send-feedback', '/send-feedback', '/api/feedback']:
                    event_type = 'feedback'
                plan = data.get('plan', 'Pro').strip() if isinstance(data, dict) else 'Pro'
                categories = data.get('categories', []) if isinstance(data, dict) else []
                details = data.get('details', '') if isinstance(data, dict) else ''
                user_query = data.get('user_query', '') if isinstance(data, dict) else ''
                ai_response = data.get('ai_response', '') if isinstance(data, dict) else ''
                model = data.get('model', 'OMNIRA (GPT-4o)') if isinstance(data, dict) else 'OMNIRA (GPT-4o)'

                if event_type in ['feedback', 'dislike', 'report']:
                    if not email or '@' not in email:
                        email = 'user_feedback@omnira.ai'
                    dispatched = send_auto_email(
                        event_type=event_type,
                        to_email=email,
                        name=name or 'OMNIRA User',
                        plan=plan,
                        categories=categories,
                        details=details,
                        user_query=user_query,
                        ai_response=ai_response,
                        model=model
                    )
                    self.send_json_res(200, {'success': dispatched, 'message': 'Feedback report received and sent to administrator.'})
                    return

                if not email or '@' not in email:
                    self.send_json_res(400, {'success': False, 'error': 'Valid recipient email required.'})
                    return

                dispatched = send_auto_email(event_type, email, name, plan)
                self.send_json_res(200, {'success': dispatched, 'message': f'Auto-email {event_type} queued for {email}.'})
                return

            # 4. Default Chat Endpoint
            prompt = data.get('prompt', '') if isinstance(data, dict) else str(body_raw)
            mode = data.get('mode', 'chat') if isinstance(data, dict) else 'chat'
            model = data.get('model', 'gpt-4o') if isinstance(data, dict) else 'gpt-4o'
            language = data.get('language') if isinstance(data, dict) else None
            instructions = data.get('instructions') if isinstance(data, dict) else None
            project_context = data.get('project_context') if isinstance(data, dict) else None

            response_text = engine.process_query(
                prompt, 
                mode=mode, 
                model=model, 
                language=language, 
                instructions=instructions, 
                project_context=project_context
            )
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
            if path in ['/api/tts', '/tts']:
                query = urllib.parse.urlparse(self.path).query
                params = urllib.parse.parse_qs(query)
                text = params.get('text', [''])[0]
                lang = params.get('lang', ['en'])[0]
                audio_data = get_tts_audio_bytes(text, lang)
                self.send_response(200)
                self.send_header('Content-Type', 'audio/mpeg')
                self.send_header('Content-Length', str(len(audio_data)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Cache-Control', 'public, max-age=86400')
                self.end_headers()
                self.wfile.write(audio_data)
                return

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

