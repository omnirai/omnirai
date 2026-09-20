import os
import smtplib
import threading
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Load credentials from environment or defaults
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "bishaldev949@gmail.com").strip()
SMTP_PASS = os.getenv("SMTP_PASS", "xvakizmkikamlssr").strip()
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "OMNIRA AI").strip()
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "bishaldev949@gmail.com").strip()
APP_URL = os.getenv("APP_URL", "https://omnirai.vercel.app").strip().rstrip("/")
APP_LOGO_URL = f"{APP_URL}/icon-192.png"

def send_smtp_email_sync(to_email: str, subject: str, html_content: str, text_content: str = "") -> bool:
    """
    Sends an email using standard Gmail SMTP TLS.
    """
    if not to_email or not SMTP_USER or not SMTP_PASS:
        return False

    sender_header = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = sender_header
    msg["To"] = to_email
    msg["Reply-To"] = SMTP_FROM_EMAIL

    if text_content:
        msg.attach(MIMEText(text_content, "plain", "utf-8"))
    msg.attach(MIMEText(html_content, "html", "utf-8"))

    try:
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_FROM_EMAIL, [to_email], msg.as_string())
        server.quit()
        return True
    except Exception as e:
        # Silently fail or log without crashing
        try:
            print(f"[OMNIRA SMTP ERROR] Failed to send email to {to_email}: {e}")
        except Exception:
            pass
        return False

def send_email_async(to_email: str, subject: str, html_content: str, text_content: str = ""):
    """
    Dispatches email in a background daemon thread so it never blocks HTTP responses.
    """
    t = threading.Thread(
        target=send_smtp_email_sync,
        args=(to_email, subject, html_content, text_content),
        daemon=True
    )
    t.start()

# ==============================================================================
# HUMAN-CRAFTED CLEAN EMAIL TEMPLATES (With official AI icon and working buttons)
# ==============================================================================

def get_base_html(title: str, content: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827; line-height: 1.6;">
  <div style="max-width: 580px; margin: 0 auto; padding: 40px 24px;">
    
    <!-- Official OMNIRA AI Brand Header with Official Icon -->
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 28px;">
      <tr>
        <td style="vertical-align: middle; padding-right: 12px;">
          <a href="{APP_URL}/" style="text-decoration: none; display: inline-block;">
            <img src="{APP_LOGO_URL}" width="40" height="40" alt="OMNIRA AI" style="display: block; width: 40px; height: 40px; border-radius: 10px; border: 0; outline: none; background-color: #0f172a;" />
          </a>
        </td>
        <td style="vertical-align: middle;">
          <a href="{APP_URL}/" style="text-decoration: none; color: #0f172a; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.2; display: inline-block;">
            OMNIRA <span style="font-weight: 600; color: #059669;">AI</span>
          </a>
        </td>
      </tr>
    </table>

    <!-- Main Message Body -->
    <div style="font-size: 15px; color: #1f2937;">
      {content}
    </div>

    <!-- Human Sign-off -->
    <div style="margin-top: 36px; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #4b5563;">
      <p style="margin: 0 0 4px 0; font-weight: 600; color: #111827;">Bishal & The OMNIRA Team</p>
      <p style="margin: 0; color: #6b7280; font-size: 13px;">Created with passion by bishalcodes.com</p>
    </div>

    <!-- Minimal Footer -->
    <div style="margin-top: 24px; font-size: 12px; color: #9ca3af; line-height: 1.5;">
      <p style="margin: 0;">You are receiving this message because of your activity on your OMNIRA AI account.</p>
      <p style="margin: 4px 0 0 0;">OMNIRA AI • Kathmandu, Nepal • <a href="{APP_URL}/" style="color: #6b7280; text-decoration: underline;">{APP_URL}</a></p>
    </div>

  </div>
</body>
</html>"""

def get_welcome_template(name: str) -> tuple:
    display_name = name.strip() if name and name.strip() else "there"
    subject = "Welcome to OMNIRA AI"
    
    content = f"""
      <h1 style="font-size: 22px; font-weight: 600; color: #111827; margin: 0 0 16px 0; letter-spacing: -0.4px;">
        Welcome to OMNIRA, {display_name}!
      </h1>

      <p style="margin: 0 0 16px 0;">
        Hi {display_name},
      </p>

      <p style="margin: 0 0 16px 0;">
        I'm Bishal, the creator of OMNIRA AI. I'm excited to have you join us.
      </p>

      <p style="margin: 0 0 16px 0;">
        OMNIRA gives you instant access to fast neural intelligence, world-class image generation with FLUX, and creative studio tools. Everything is built to be clean, fast, and completely distraction-free.
      </p>

      <p style="margin: 0 0 8px 0; font-weight: 600; color: #111827;">
        Here are three things you can try right away:
      </p>

      <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #374151;">
        <li style="margin-bottom: 8px;"><strong>Create clean logos & photos:</strong> Ask OMNIRA to <em>"make a logo for my brand"</em> or <em>"generate a realistic photo of Mount Everest"</em>.</li>
        <li style="margin-bottom: 8px;"><strong>Deep reasoning & code:</strong> Ask complex coding problems, debug scripts, or design system components.</li>
        <li style="margin-bottom: 8px;"><strong>Dedicated studios:</strong> Switch modes anytime between Chat, Code, Docs, Math, and SVG.</li>
      </ul>

      <!-- Bulletproof CTA Button -->
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 28px 0 12px 0;">
        <tr>
          <td align="left" style="border-radius: 8px; background-color: #059669;">
            <a href="{APP_URL}/" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #ffffff !important; text-decoration: none; border-radius: 8px; background-color: #059669; line-height: 100%;">
              Start Using OMNIRA &rarr;
            </a>
          </td>
        </tr>
      </table>
      <p style="margin: 0 0 20px 0; font-size: 12px; color: #6b7280; line-height: 1.5;">
        Button not opening? Click here directly: <a href="{APP_URL}/" target="_blank" rel="noopener noreferrer" style="color: #059669; text-decoration: underline; word-break: break-all;">{APP_URL}</a>
      </p>

      <p style="margin: 20px 0 0 0; color: #4b5563;">
        If you ever have any questions, ideas, or need a hand, just hit reply to this email. I read every reply personally.
      </p>
    """
    
    text = f"""Welcome to OMNIRA, {display_name}!

Hi {display_name},

I'm Bishal, the creator of OMNIRA AI. I'm excited to have you join us.

Your account is now ready with FLUX image generation, deep reasoning, and creative studios.

Start using OMNIRA: {APP_URL}/

If you have any questions or feedback, just reply directly to this email.

Best,
Bishal & The OMNIRA Team
"""
    return subject, get_base_html(subject, content), text

def get_signin_template(name: str, email: str) -> tuple:
    display_name = name.strip() if name and name.strip() else "there"
    subject = "New sign-in to your OMNIRA AI account"
    now_str = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")

    content = f"""
      <h1 style="font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 16px 0;">
        New sign-in detected
      </h1>

      <p style="margin: 0 0 16px 0;">
        Hi {display_name},
      </p>

      <p style="margin: 0 0 16px 0;">
        We detected a successful sign-in to your OMNIRA AI account (<strong>{email}</strong>) on <strong>{now_str}</strong>.
      </p>

      <p style="margin: 0 0 16px 0; color: #4b5563;">
        If you signed in just now, you're all set and can safely ignore this notification.
      </p>

      <p style="margin: 0 0 20px 0; color: #4b5563;">
        If you did not perform this sign-in, please reset your password or reply to this email immediately so we can secure your account.
      </p>

      <!-- Bulletproof CTA Button -->
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 24px 0 12px 0;">
        <tr>
          <td align="left" style="border-radius: 6px; background-color: #111827;">
            <a href="{APP_URL}/" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #ffffff !important; text-decoration: none; border-radius: 6px; background-color: #111827; line-height: 100%;">
              Open OMNIRA Dashboard &rarr;
            </a>
          </td>
        </tr>
      </table>
      <p style="margin: 0 0 20px 0; font-size: 12px; color: #6b7280; line-height: 1.5;">
        Direct link: <a href="{APP_URL}/" target="_blank" rel="noopener noreferrer" style="color: #059669; text-decoration: underline; word-break: break-all;">{APP_URL}</a>
      </p>
    """
    
    text = f"""New sign-in detected for your OMNIRA AI account ({email}) on {now_str}.
If this was you, you can safely ignore this message.
If you did not sign in, please contact us immediately.

Open OMNIRA: {APP_URL}/

Best regards,
OMNIRA AI Security Team
"""
    return subject, get_base_html(subject, content), text

def get_subscribe_template(name: str, plan: str = "Pro") -> tuple:
    display_name = name.strip() if name and name.strip() else "there"
    subject = f"Your OMNIRA AI {plan} Plan is now active"

    content = f"""
      <h1 style="font-size: 22px; font-weight: 600; color: #111827; margin: 0 0 16px 0;">
        You're officially on OMNIRA {plan}!
      </h1>

      <p style="margin: 0 0 16px 0;">
        Hi {display_name},
      </p>

      <p style="margin: 0 0 16px 0;">
        Thank you for subscribing to <strong>OMNIRA {plan}</strong>. Your upgrade has been applied to your account.
      </p>

      <div style="margin: 20px 0; padding: 16px; background-color: #f9fafb; border-left: 3px solid #059669; font-size: 14px;">
        <p style="margin: 0 0 6px 0; font-weight: 600; color: #111827;">Active Subscription Summary</p>
        <p style="margin: 0 0 4px 0; color: #4b5563;">• Plan: <strong>OMNIRA {plan}</strong></p>
        <p style="margin: 0 0 4px 0; color: #4b5563;">• Image Generation: <strong>High-Resolution FLUX 1 Schnell (25 images / day)</strong></p>
        <p style="margin: 0 0 4px 0; color: #4b5563;">• Reasoning: <strong>Full Thinking & Deep Analysis Mode</strong></p>
        <p style="margin: 0; color: #4b5563;">• Studios: <strong>Full access to Chat, Code, Docs, Math & SVG</strong></p>
      </div>

      <p style="margin: 0 0 20px 0; color: #4b5563;">
        We're working hard to add new features every single week. As a {plan} member, your feedback directly shapes what we build next.
      </p>

      <!-- Bulletproof CTA Button -->
      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 28px 0 12px 0;">
        <tr>
          <td align="left" style="border-radius: 8px; background-color: #059669;">
            <a href="{APP_URL}/" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #ffffff !important; text-decoration: none; border-radius: 8px; background-color: #059669; line-height: 100%;">
              Open OMNIRA Pro Studio &rarr;
            </a>
          </td>
        </tr>
      </table>
      <p style="margin: 0 0 20px 0; font-size: 12px; color: #6b7280; line-height: 1.5;">
        Button not opening? Click here directly: <a href="{APP_URL}/" target="_blank" rel="noopener noreferrer" style="color: #059669; text-decoration: underline; word-break: break-all;">{APP_URL}</a>
      </p>

      <p style="margin: 20px 0 0 0; color: #4b5563;">
        Thank you for supporting independent software. If you have any feedback or requests, reply right here anytime.
      </p>
    """

    text = f"""Your OMNIRA AI {plan} Plan is now active!

Hi {display_name},

Thank you for subscribing to OMNIRA {plan}. Your upgrade has been successfully applied to your account.

Your benefits include:
- High-Resolution FLUX 1 Schnell (25 daily images)
- Full Thinking & Deep Reasoning Mode
- Full access to all studio tools

Open OMNIRA: {APP_URL}/

Warm regards,
Bishal & The OMNIRA Team
"""
    return subject, get_base_html(subject, content), text

def get_dislike_report_template(user_email: str, user_name: str, categories: list, details: str, user_query: str = "", ai_response: str = "", model: str = "OMNIRA (GPT-4o)"):
    cats_str = ", ".join(categories) if categories else "General Dislike"
    subject = f"[OMNIRA Feedback Report] Dislike: {cats_str} ({user_email or 'Guest'})"
    
    categories_badges = "".join([
        f'<span style="display: inline-block; background-color: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-right: 6px; margin-bottom: 6px;">{cat}</span>'
        for cat in (categories or ["Disliked Response"])
    ])
    
    clean_details = (details or "").strip()
    clean_query = (user_query or "").strip()
    clean_ai_response = (ai_response or "").strip()
    if len(clean_ai_response) > 2500:
        clean_ai_response = clean_ai_response[:2500] + "\n\n... [Truncated for email delivery]"

    content = f"""
      <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">
        User Dislike Feedback Report
      </h2>
      <p style="color: #4b5563; font-size: 14px; margin-bottom: 20px;">
        A user has flagged an AI response as unsatisfactory and submitted the following feedback report to the administrator.
      </p>

      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="color: #6b7280; width: 130px; padding-bottom: 8px;"><strong>User:</strong></td>
            <td style="color: #111827; padding-bottom: 8px;">{user_name or 'User'} &lt;{user_email or 'guest@omnira.ai'}&gt;</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding-bottom: 8px;"><strong>AI Model:</strong></td>
            <td style="color: #111827; padding-bottom: 8px;">{model}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding-bottom: 8px;"><strong>Categories:</strong></td>
            <td style="padding-bottom: 8px;">{categories_badges}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding-bottom: 8px;"><strong>Submitted At:</strong></td>
            <td style="color: #111827; padding-bottom: 8px;">{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #374151; font-size: 15px; font-weight: 600; margin-bottom: 8px;">User Notes &amp; Details</h3>
        <div style="background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 8px; padding: 14px; font-size: 14px; color: #1f2937;">
          {clean_details if clean_details else '<em style="color: #9ca3af;">No additional details entered by user.</em>'}
        </div>
      </div>

      {f'''<div style="margin-bottom: 20px;">
        <h3 style="color: #374151; font-size: 15px; font-weight: 600; margin-bottom: 8px;">User's Original Query</h3>
        <div style="background-color: #f3f4f6; border-left: 4px solid #6366f1; border-radius: 4px; padding: 12px; font-size: 13px; color: #374151; white-space: pre-wrap;">
          {clean_query}
        </div>
      </div>''' if clean_query else ''}

      {f'''<div style="margin-bottom: 20px;">
        <h3 style="color: #374151; font-size: 15px; font-weight: 600; margin-bottom: 8px;">Disliked AI Response</h3>
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px; padding: 12px; font-size: 13px; color: #374151; max-height: 400px; overflow-y: auto; white-space: pre-wrap;">
          {clean_ai_response}
        </div>
      </div>''' if clean_ai_response else ''}
    """
    
    text = f"""User Dislike Feedback Report:
User: {user_name} ({user_email})
Model: {model}
Categories: {cats_str}
Details: {clean_details or 'None'}

User Query:
{clean_query}

AI Response:
{clean_ai_response}
"""
    return subject, get_base_html(subject, content), text

def send_feedback_report(user_email: str, user_name: str, categories: list, details: str, user_query: str = "", ai_response: str = "", model: str = "OMNIRA (GPT-4o)") -> bool:
    """
    Sends the user dislike feedback report directly to the administrator email.
    """
    admin_email = os.getenv("ADMIN_EMAIL", SMTP_USER or "bishaldev949@gmail.com").strip()
    subject, html, text = get_dislike_report_template(user_email, user_name, categories, details, user_query, ai_response, model)
    send_email_async(admin_email, subject, html, text)
    return True

def send_auto_email(event_type: str, to_email: str, name: str = "", plan: str = "Pro", **kwargs) -> bool:
    """
    Main entrypoint for sending auto-emails.
    Supported event_type: 'welcome' | 'signup' | 'signin' | 'subscribe' | 'upgrade' | 'feedback' | 'dislike'
    """
    evt = (event_type or "").lower().strip()
    
    if evt in ["feedback", "dislike", "report", "feedback_report"]:
        categories = kwargs.get("categories", [])
        details = kwargs.get("details", "")
        user_query = kwargs.get("user_query", "")
        ai_response = kwargs.get("ai_response", "")
        model = kwargs.get("model", "OMNIRA (GPT-4o)")
        return send_feedback_report(to_email, name, categories, details, user_query, ai_response, model)

    if not to_email:
        return False

    if evt in ["welcome", "signup", "sign_up"]:
        subject, html, text = get_welcome_template(name)
    elif evt in ["signin", "sign_in", "login"]:
        subject, html, text = get_signin_template(name, to_email)
    elif evt in ["subscribe", "upgrade", "pro"]:
        subject, html, text = get_subscribe_template(name, plan)
    else:
        subject, html, text = get_welcome_template(name)

    send_email_async(to_email, subject, html, text)
    return True

