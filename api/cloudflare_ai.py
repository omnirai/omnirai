import os
import json
import sqlite3
import base64
import tempfile
import urllib.request
import urllib.error
from datetime import datetime, timezone

# Load local .env if present (for local dev)
def load_env_file():
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        if k.strip() not in os.environ:
                            os.environ[k.strip()] = v.strip().strip('"').strip("'")
        except Exception:
            pass

load_env_file()

# Database path for persistent quota tracking (Uses /tmp on Vercel/serverless for write permissions)
try:
    if os.name != "nt" or (os.path.exists("/tmp") and os.access("/tmp", os.W_OK)):
        DB_DIR = "/tmp"
    else:
        DB_DIR = tempfile.gettempdir()
except Exception:
    DB_DIR = tempfile.gettempdir()

DB_PATH = os.path.join(DB_DIR, "omnira_quota.db")
DAILY_LIMIT = 2

def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    try:
        conn.execute("PRAGMA journal_mode=WAL;")
    except Exception:
        pass
    conn.execute("""
        CREATE TABLE IF NOT EXISTS daily_quota (
            user_id TEXT NOT NULL,
            date_str TEXT NOT NULL,
            image_count INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (user_id, date_str)
        );
    """)
    conn.commit()
    return conn

def get_utc_date_str():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")

def check_quota(user_id: str) -> dict:
    if not user_id:
        user_id = "guest_user"
    date_str = get_utc_date_str()
    try:
        conn = get_db()
        try:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT image_count FROM daily_quota WHERE user_id = ? AND date_str = ?",
                (user_id, date_str)
            )
            row = cursor.fetchone()
            used = row[0] if row else 0
            remaining = max(0, DAILY_LIMIT - used)
            return {
                "used": used,
                "limit": DAILY_LIMIT,
                "remaining": remaining,
                "date": date_str
            }
        finally:
            conn.close()
    except Exception as e:
        print("Database quota check warning:", e)
        return {
            "used": 0,
            "limit": DAILY_LIMIT,
            "remaining": DAILY_LIMIT,
            "date": date_str
        }

def enhance_prompt_for_cloudflare(raw_prompt: str) -> str:
    import re
    cleaned = raw_prompt.strip()
    
    # Strip duplicate or nested phrase prefixes
    prefix_pattern = r'^(create|generate|make|draw|paint)\s+(an?\s+)?(image|photo|picture|logo|sticker)\s+of\s+'
    while re.search(prefix_pattern, cleaned, re.IGNORECASE):
        cleaned = re.sub(prefix_pattern, '', cleaned, flags=re.IGNORECASE).strip()
    
    cleaned = re.sub(r'^(create|generate|draw|make)\s+', '', cleaned, flags=re.IGNORECASE).strip()

    lower_c = cleaned.lower()
    if 'logo' in lower_c:
        # Strip duplicate "create logo of" or "logo of"
        clean_brand = re.sub(r'^(create\s+)?(logo\s+of\s+)?', '', cleaned, flags=re.IGNORECASE).strip()
        enhanced = f"Professional modern vector logo for '{clean_brand}', minimalist icon mark, sharp typography, clean lines, high resolution 8k graphic design, vector art on clean studio background"
    elif 'photo' in lower_c or 'portrait' in lower_c or 'realistic' in lower_c:
        enhanced = f"High quality realistic photograph of {cleaned}, 8k resolution, detailed texture, professional camera shot, cinematic lighting, masterpiece"
    elif len(cleaned.split()) <= 4:
        enhanced = f"Detailed high-resolution artwork of {cleaned}, 8k resolution, vibrant color palette, masterpiece"
    else:
        enhanced = cleaned

    return enhanced

def generate_image_with_quota(user_id: str, prompt: str) -> tuple:
    """
    Atomically checks quota, calls Cloudflare Workers AI, and increments count if successful.
    Returns (success: bool, payload: str or dict, status_code: int, quota_info: dict)
    """
    if not user_id:
        user_id = "guest_user"
        
    prompt = prompt.strip()
    if not prompt:
        return False, {"error": "Please describe the image you'd like me to create."}, 400, check_quota(user_id)

    account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID", "").strip()
    api_token = os.getenv("CLOUDFLARE_API_TOKEN", "").strip()
    model = os.getenv("CLOUDFLARE_IMAGE_MODEL", "@cf/bytedance/stable-diffusion-xl-lightning").strip()

    if not account_id or not api_token:
        return False, {
            "error": "Cloudflare Workers AI credentials missing on server. Please configure CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN."
        }, 500, check_quota(user_id)

    date_str = get_utc_date_str()
    
    try:
        conn = get_db()
    except Exception as db_err:
        return False, {"error": f"Database initialization error: {str(db_err)}"}, 500, check_quota(user_id)

    try:
        # 1. ATOMIC TRANSACTION: Check Quota with SQLite Lock
        conn.execute("BEGIN IMMEDIATE;")
        cursor = conn.cursor()
        cursor.execute(
            "SELECT image_count FROM daily_quota WHERE user_id = ? AND date_str = ?",
            (user_id, date_str)
        )
        row = cursor.fetchone()
        used = row[0] if row else 0

        if used >= DAILY_LIMIT:
            conn.rollback()
            return False, {
                "error": f"You've reached today's {DAILY_LIMIT}-image limit. Try again tomorrow."
            }, 429, {
                "used": used,
                "limit": DAILY_LIMIT,
                "remaining": 0,
                "date": date_str
            }

        # Enhance Prompt for Cloudflare AI Model Quality
        enhanced_prompt = enhance_prompt_for_cloudflare(prompt)

        # 2. Call Cloudflare Workers AI Endpoint
        url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{model}"
        headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json",
            "User-Agent": "OMNIRA-AI-Chat/1.0"
        }
        body_data = json.dumps({"prompt": enhanced_prompt}).encode("utf-8")

        req = urllib.request.Request(url, data=body_data, headers=headers, method="POST")

        try:
            with urllib.request.urlopen(req, timeout=45) as response:
                content_type = response.headers.get("Content-Type", "")
                raw_bytes = response.read()

                # Check if Cloudflare returned JSON or direct binary image bytes
                if "application/json" in content_type:
                    res_json = json.loads(raw_bytes.decode("utf-8", errors="ignore"))
                    if res_json.get("success") is False:
                        errors = res_json.get("errors", [])
                        err_msg = errors[0].get("message") if errors else "Cloudflare Workers AI error"
                        conn.rollback()
                        return False, {"error": f"Image generation temporarily unavailable: {err_msg}"}, 500, check_quota(user_id)
                    
                    # Extract base64 image from result JSON
                    result = res_json.get("result", {})
                    base64_str = result.get("image") or result.get("data")
                    if base64_str:
                        data_url = f"data:image/png;base64,{base64_str}"
                    else:
                        conn.rollback()
                        return False, {"error": "Invalid response format from Cloudflare AI."}, 500, check_quota(user_id)
                else:
                    # Direct binary image data (e.g. image/png or image/jpeg)
                    b64_encoded = base64.b64encode(raw_bytes).decode("utf-8")
                    mime = "image/png"
                    if "jpeg" in content_type or "jpg" in content_type:
                        mime = "image/jpeg"
                    data_url = f"data:{mime};base64,{b64_encoded}"

        except urllib.error.HTTPError as http_err:
            conn.rollback()
            try:
                err_body = json.loads(http_err.read().decode("utf-8", errors="ignore"))
                err_msg = err_body.get("errors", [{}])[0].get("message", str(http_err))
            except Exception:
                err_msg = str(http_err)
            return False, {"error": f"Image generation is temporarily unavailable. ({err_msg})"}, http_err.code, check_quota(user_id)
        except Exception as net_err:
            conn.rollback()
            return False, {"error": f"Failed to connect to image generation server: {str(net_err)}"}, 500, check_quota(user_id)

        # 3. SUCCESS — ATOMICALLY INCREMENT QUOTA COUNT
        cursor.execute(
            """
            INSERT INTO daily_quota (user_id, date_str, image_count)
            VALUES (?, ?, 1)
            ON CONFLICT(user_id, date_str) DO UPDATE SET image_count = image_count + 1;
            """,
            (user_id, date_str)
        )
        conn.commit()

        new_used = used + 1
        new_quota = {
            "used": new_used,
            "limit": DAILY_LIMIT,
            "remaining": max(0, DAILY_LIMIT - new_used),
            "date": date_str
        }

        return True, {
            "success": True,
            "image": data_url,
            "prompt": prompt,
            "quota": new_quota
        }, 200, new_quota

    except Exception as ex:
        try:
            conn.rollback()
        except Exception:
            pass
        return False, {"error": f"Server processing error: {str(ex)}"}, 500, check_quota(user_id)
    finally:
        try:
            conn.close()
        except Exception:
            pass
