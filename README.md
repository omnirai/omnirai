# OMNIRA AI Chat — Cloudflare Workers AI Image Generation

OMNIRA is an AI chat application built with React, Vite, Tailwind CSS, and Python backend microservices.

## 🎨 AI Image Generation Feature

OMNIRA supports natural language AI image generation powered by **Cloudflare Workers AI**.

### Highlights
- **Natural Language Intent Detection**: Type requests naturally like `"Create a realistic photo of Mount Everest at sunrise"` or `"Generate an image of a futuristic city"`.
- **Cloudflare Workers AI Integration**: Server-side image generation with zero frontend key exposure.
- **Server-Side Quota Enforcement**: Free tier limit of **2 successful generated images per calendar day (UTC)** with atomic SQLite locking to prevent race conditions.
- **Resilient Quota Counting**: Failed generations or invalid prompts do **NOT** consume user quota.
- **Inline ChatGPT Experience**: View images directly inside conversation threads with actions to **Download**, **Regenerate**, and **Copy Prompt**.
- **Daily Quota Counter**: Real-time UI quota indicator (`Images today: X/2`).

---

## ⚙️ Cloudflare Workers AI Configuration Guide

### 1. Obtain Cloudflare Account ID & API Token
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Select your account and locate your **Account ID** in the right-hand sidebar of the Overview page.
3. Go to **My Profile > API Tokens** (or [Cloudflare API Tokens Page](https://dash.cloudflare.com/profile/api-tokens)).
4. Click **Create Token** -> select **Custom Token**.
5. Set Permissions:
   - `Account` -> `Workers AI` -> `Read` (or `Edit`)
6. Click **Continue to summary** -> **Create Token** and copy the generated API Token.

### 2. Local Environment Setup (`.env`)
Add the credentials to your root `.env` file:

```env
# Cloudflare Workers AI Image Generation Configuration
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id_here
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here
CLOUDFLARE_IMAGE_MODEL=@cf/bytedance/stable-diffusion-xl-lightning
```

### 3. Vercel Deployment Setup
In Vercel:
1. Go to **Vercel Dashboard > Your OMNIRA Project > Settings > Environment Variables**.
2. Add:
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_IMAGE_MODEL` (optional)
3. Redeploy your project.

---

## 🚀 How to Run & Test Locally

### 1. Run Dev Server
```bash
npm run dev
```

### 2. Run Backend Python Server (Optional Standalone Server)
```bash
python app.py
```

### 3. Testing Scenarios

1. **Test 1 — First Image Request**:
   - Type: `"Create a realistic photo of Mount Everest at sunrise"`
   - Result: Image generated inline. Quota updates to `1/2`.
2. **Test 2 — Second Image Request**:
   - Type: `"Generate a futuristic city in dark mode"`
   - Result: Second image generated inline. Quota updates to `2/2`.
3. **Test 3 — Quota Limit Check**:
   - Type: `"Draw a cute cat"`
   - Result: Request rejected with message `"You've reached today's 2-image limit. Try again tomorrow."` No Cloudflare request consumed.
4. **Test 4 — Actions Verification**:
   - Click **Download** to save PNG.
   - Click **Copy Prompt** to copy text to clipboard.
   - Click **Regenerate** to attempt re-generating image.
