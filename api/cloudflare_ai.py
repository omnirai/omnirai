import os
import re
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

def safe_log(*args, **kwargs):
    try:
        print(*args, **kwargs)
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
DAILY_LIMIT = int(os.getenv("DAILY_IMAGE_LIMIT", "25"))

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
        safe_log("Database quota check warning:", e)
        return {
            "used": 0,
            "limit": DAILY_LIMIT,
            "remaining": DAILY_LIMIT,
            "date": date_str
        }

def prepare_model_prompt(raw_prompt: str) -> str:
    """
    Cleans conversational chatbot command prefixes so that conversational speech
    (e.g., "please make", "can you generate", "draw an image of") is not literally
    rendered as English text inside the image.
    Preserves all subjects, colors, counts, locations, and user-specified styles faithfully.
    """
    cleaned = raw_prompt.strip()
    if not cleaned:
        return ""

    # 1. Strip conversational filler/polite commands
    # e.g., "please make", "can you create", "kindly generate", "please draw"
    cleaned = re.sub(
        r'^(?:can\s+you\s+|could\s+you\s+|would\s+you\s+)?(?:please\s+|kindly\s+)?(?:make|create|generate|draw|design|render|produce)\s+(?:me\s+)?',
        '',
        cleaned,
        flags=re.IGNORECASE
    ).strip()

    # 2. If the user prompt starts with "an image of", "a photo of", "a picture of"
    cleaned = re.sub(
        r'^(?:an?\s+)?(?:image|picture|photo|photograph|drawing|illustration)\s+(?:of|showing|depicting)\s+',
        '',
        cleaned,
        flags=re.IGNORECASE
    ).strip()

    # 3. Special handling for LOGO requests:
    # If the user asked for a logo, e.g. "logo of bt care" or "a logo for bishal codes"
    # Ensure the text/brand name is clearly demarcated with quotes so FLUX renders
    # the typography cleanly instead of generating arbitrary words or split collages.
    logo_match = re.match(
        r'^(?:a\s+)?(?:modern\s+)?logo\s+(?:of|for)\s+["\']?([^"\']+)["\']?$',
        cleaned,
        flags=re.IGNORECASE
    )
    if logo_match:
        brand = logo_match.group(1).strip()
        cleaned = f'modern vector logo design for "{brand}", clean typography'

    return cleaned if cleaned else raw_prompt.strip()

def generate_image_with_quota(user_id: str, prompt: str) -> tuple:
    """
    Atomically checks quota, calls Cloudflare Workers AI with faithfully preserved prompt,
    and increments count if successful.
    Returns (success: bool, payload: str or dict, status_code: int, quota_info: dict)
    """
    if not user_id:
        user_id = "guest_user"
        
    user_prompt = prompt.strip()
    if not user_prompt:
        return False, {"error": "Please describe the image you'd like me to create."}, 400, check_quota(user_id)

    account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID", "").strip()
    api_token = os.getenv("CLOUDFLARE_API_TOKEN", "").strip()
    primary_model = os.getenv("CLOUDFLARE_IMAGE_MODEL", "@cf/black-forest-labs/flux-1-schnell").strip()
    fallback_model = "@cf/bytedance/stable-diffusion-xl-lightning"

    if not account_id or not api_token:
        return False, {
            "error": "Cloudflare Workers AI credentials missing on server. Please configure CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN."
        }, 500, check_quota(user_id)

    # 1. PRESERVE THE USER'S PROMPT FAITHFULLY
    model_prompt = prepare_model_prompt(user_prompt)

    # 2. SAFE SERVER-SIDE LOGGING (No API keys, tokens, or credentials logged)
    safe_log("\n================ [OMNIRA IMAGE GENERATION] ================")
    safe_log("USER PROMPT:")
    safe_log(user_prompt)
    safe_log("MODEL PROMPT:")
    safe_log(model_prompt)
    safe_log("PRIMARY MODEL:")
    safe_log(primary_model)
    safe_log("===========================================================\n")

    date_str = get_utc_date_str()
    
    try:
        conn = get_db()
    except Exception as db_err:
        return False, {"error": f"Database initialization error: {str(db_err)}"}, 500, check_quota(user_id)

    try:
        # ATOMIC TRANSACTION: Check Quota with SQLite Lock
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

        # Helper to invoke a Cloudflare AI model
        def call_cf_model(target_model: str):
            url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{target_model}"
            headers = {
                "Authorization": f"Bearer {api_token}",
                "Content-Type": "application/json",
                "User-Agent": "OMNIRA-AI-Chat/1.0"
            }
            body_data = json.dumps({"prompt": model_prompt}).encode("utf-8")
            req = urllib.request.Request(url, data=body_data, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=50) as response:
                content_type = response.headers.get("Content-Type", "")
                raw_bytes = response.read()

                if "application/json" in content_type:
                    res_json = json.loads(raw_bytes.decode("utf-8", errors="ignore"))
                    if res_json.get("success") is False:
                        errors = res_json.get("errors", [])
                        err_msg = errors[0].get("message") if errors else "Cloudflare Workers AI error"
                        raise RuntimeError(err_msg)
                    
                    result = res_json.get("result", {})
                    base64_str = result.get("image") or result.get("data")
                    if base64_str:
                        return f"data:image/png;base64,{base64_str}"
                    raise RuntimeError("Invalid JSON response structure from Cloudflare AI.")
                else:
                    b64_encoded = base64.b64encode(raw_bytes).decode("utf-8")
                    mime = "image/png"
                    if "jpeg" in content_type or "jpg" in content_type:
                        mime = "image/jpeg"
                    return f"data:{mime};base64,{b64_encoded}"

        # 3. Call Primary Model with Fallback Protection
        active_model = primary_model
        data_url = None
        last_error = None

        try:
            data_url = call_cf_model(primary_model)
        except Exception as e_prim:
            last_error = str(e_prim)
            safe_log(f"[OMNIRA] Primary model {primary_model} failed: {e_prim}. Trying fallback...")
            if primary_model != fallback_model:
                try:
                    data_url = call_cf_model(fallback_model)
                    active_model = fallback_model
                    safe_log(f"[OMNIRA] Fallback model {fallback_model} succeeded!")
                except Exception as e_fb:
                    last_error = str(e_fb)
                    safe_log(f"[OMNIRA] Fallback model failed as well: {e_fb}")

        if not data_url:
            conn.rollback()
            return False, {"error": f"Image generation is temporarily unavailable. ({last_error})"}, 500, check_quota(user_id)

        # 4. SUCCESS — ATOMICALLY INCREMENT QUOTA COUNT
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
            "prompt": user_prompt,
            "user_prompt": user_prompt,
            "model_prompt": model_prompt,
            "model": active_model,
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
