import os
import sys
import json
from http.server import BaseHTTPRequestHandler

# Ensure root workspace directory is in python path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from quick_ai_engine import QuickAiEngine

engine = QuickAiEngine()

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body_raw = self.rfile.read(content_length).decode('utf-8', errors='ignore') if content_length > 0 else ''
            try:
                data = json.loads(body_raw, strict=False) if body_raw else {}
            except Exception:
                data = {'prompt': body_raw}

            prompt = data.get('prompt', '') if isinstance(data, dict) else str(body_raw)
            mode = data.get('mode', 'chat') if isinstance(data, dict) else 'chat'
            model = data.get('model', 'gpt-4o') if isinstance(data, dict) else 'gpt-4o'

            response_text = engine.process_query(prompt, mode=mode, model=model)
            res_bytes = json.dumps({'response': response_text}, ensure_ascii=False).encode('utf-8')

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS, GET')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            self.wfile.write(res_bytes)
        except Exception as e:
            err_bytes = json.dumps({'response': f"⚠️ Server Error: {str(e)}"}).encode('utf-8')
            self.send_response(500)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(err_bytes)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS, GET')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        body = json.dumps({'status': 'Quick AI Backend Online', 'creator': 'bishalcodes.com'}).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)
