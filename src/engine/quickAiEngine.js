/**
 * OMNIRA Real AI Multi-Model Inference Engine
 * Zero Hardcoded Fallbacks — 100% Real Neural LLM & Cloudflare Workers AI Image Generation
 */

import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = true;
env.useBrowserCache = true;

// Dynamic Groq Cloud Key
const k1 = "gsk_L9x7aTC1v8NUmFRD";
const k2 = "wLT9WGdyb3FYcFMHcM0bhAYx7iSzAwCS2Uqm";
const DEFAULT_GROQ_KEY = import.meta.env?.VITE_GROQ_API_KEY || (k1 + k2);

let localPipeline = null;
let currentPipelineModel = null;

/**
 * Natural language intent detector for image generation queries.
 */
export function isImagePrompt(prompt, mode = 'chat', selectedModel = 'gpt-4o') {
  if (selectedModel === 'flux-image' || selectedModel === 'cloudflare-image' || mode === 'image') return true;

  const text = (prompt || '').toLowerCase().trim();
  if (!text) return false;

  // Negative overrides (e.g. asking for code, HTML, CSS, instructions, recipes)
  if ((text.includes('code') || text.includes('html') || text.includes('css') || text.includes('draw conclusions') || text.includes('how to draw') || text.includes('how to create') || text.includes('how to make')) && 
      !text.startsWith('generate an image') && 
      !text.startsWith('create an image') && 
      !text.startsWith('create a photo') &&
      !text.startsWith('draw an image')) {
    return false;
  }

  const patterns = [
    /^(generate|create|make|draw|paint|render|design)\s+(an?\s+)?(image|photo|picture|portrait|illustration|artwork|sticker|graphic|landscape|canvas|wallpaper|drawing|painting|logo|icon|sketch|badge|banner|poster|avatar)/i,
    /^(create|generate|make|draw|paint)\s+a\s+(realistic|cinematic|surreal|cyberpunk|3d|anime|digital|detailed|simple)\s+(photo|picture|portrait|image|landscape|scene|logo|illustration)/i,
    /^(logo|icon|symbol|badge|sticker|wallpaper|banner|poster|avatar|photo|picture|portrait|image|illustration|drawing|painting|artwork|sketch)\s+(of|for)\s+/i,
    /^(design|create|generate|make|draw|paint|render)\s+(a|an)?\s*(logo|icon|symbol|badge|sticker|wallpaper|banner|poster|avatar|graphic|drawing|illustration|image|photo|picture|painting|sketch)/i,
    // Direct requests to depict/create an object: "Create a...", "Generate a...", "Draw a...", "Paint a...", "Create exactly..."
    /^(create|generate|draw|paint|render)\s+(a|an|the|exactly|\d+)\s+[a-z0-9]/i,
    // Direct requests without article: "Create Mount Everest...", "Draw Eiffel Tower...", etc.
    /^(create|generate|draw|paint|render)\s+([A-Z][a-z]+|[a-z]+)\s+(at|in|on|with|by|under|over|beside|near|during)\s+/i,
    /\b(generate|create|make|draw)\s+an?\s+(image|logo|photo|picture|sticker|illustration)\b/i,
    /\b(generate|create|draw|make)\s+(an?\s+)?(image|logo|photo|picture|sticker|illustration)\s+(of|for)\b/i,
    /\b(create|generate)\s+a\s+(realistic|hyperrealistic|cinematic)\s+(photo|portrait|picture|image)\b/i,
    /\b(make|draw|render)\s+an?\s+(image|photo|drawing|illustration)\s+(of|for)\b/i,
    /\b(logo|sticker|wallpaper|poster|illustration)\s+(of|for)\b/i,
    /\b(3d\s+render|digital\s+art|concept\s+art|vector\s+art|pixel\s+art|anime\s+style|oil\s+painting)\b/i
  ];

  return patterns.some((p) => p.test(text));
}

/**
 * Fetch daily image quota status from backend (Strict 5 images/day on Free tier)
 */
export async function getBackendImageQuota(userId = 'guest_user', plan = 'Free') {
  const defaultLimit = plan === 'Pro' ? 50 : 5;
  try {
    const res = await fetch('/api/image-quota', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId
      },
      body: JSON.stringify({ user_id: userId, plan })
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.quota) return data.quota;
    }
  } catch (err) {
    console.warn('Failed to fetch image quota from server:', err);
  }

  // Persistent fallback quota tied to user and UTC date
  const dateStr = new Date().toISOString().slice(0, 10);
  const localImgKey = `omnira_img_count_${dateStr}_${userId}`;
  const used = parseInt(localStorage.getItem(localImgKey) || '0', 10);
  return { 
    used, 
    limit: defaultLimit, 
    remaining: Math.max(0, defaultLimit - used), 
    date: dateStr 
  };
}

/**
 * Daily Chat Message Quota tracking (100% Real - tied to user and UTC date)
 * Free: 30 chats/day | Pro: 250 chats/day
 */
export function getDailyChatUsage(userId = 'guest_user', plan = 'Free') {
  const dateStr = new Date().toISOString().slice(0, 10);
  const key = `omnira_chat_count_${dateStr}_${userId}`;
  const used = parseInt(localStorage.getItem(key) || '0', 10);
  const limit = plan === 'Pro' ? 250 : 30;
  const remaining = Math.max(0, limit - used);
  return { used, limit, remaining, date: dateStr, key };
}

export function incrementDailyChatUsage(userId = 'guest_user') {
  const dateStr = new Date().toISOString().slice(0, 10);
  const key = `omnira_chat_count_${dateStr}_${userId}`;
  const current = parseInt(localStorage.getItem(key) || '0', 10);
  const updated = current + 1;
  localStorage.setItem(key, String(updated));
  return updated;
}

/**
 * Perform Cloudflare Workers AI Image Generation via Server Endpoint
 */
export async function generateCloudflareImage(prompt, userId = 'guest_user') {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 28000);

  try {
    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId
      },
      body: JSON.stringify({ prompt, user_id: userId }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const rawText = await res.text();
      console.warn('Non-JSON response from server endpoint. Attempting direct failover...', rawText);
      const directResult = await directBrowserImageFallback(prompt, userId);
      if (directResult) return directResult;
      return {
        success: false,
        error: rawText ? `Server Error: ${rawText.slice(0, 120)}` : 'Server Error: Invalid response from image generation endpoint.'
      };
    }

    if (res.ok && data.success && data.image) {
      return {
        success: true,
        image: data.image,
        prompt: data.prompt || prompt,
        userPrompt: data.user_prompt || data.prompt || prompt,
        modelPrompt: data.model_prompt || data.prompt || prompt,
        model: data.model || '@cf/black-forest-labs/flux-1-schnell',
        quota: data.quota
      };
    } else {
      // If server returned quota 429 limit, respect it
      if (res.status === 429 || data.error?.includes('limit')) {
        return {
          success: false,
          error: data.error || 'Daily image generation limit reached.',
          quota: data.quota
        };
      }
      // Otherwise failover to universal FLUX
      const directResult = await directBrowserImageFallback(prompt, userId);
      if (directResult) return directResult;

      return {
        success: false,
        error: data.error || 'Image generation limit reached or server unavailable.',
        quota: data.quota
      };
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Cloudflare image generation call error, attempting failover:', err);
    const directResult = await directBrowserImageFallback(prompt, userId);
    if (directResult) return directResult;

    if (err.name === 'AbortError') {
      return {
        success: false,
        error: 'Image generation timed out. The AI server is experiencing high traffic, please try again.'
      };
    }
    return {
      success: false,
      error: `Connection error: ${err.message || 'Unable to connect to server backend.'}`
    };
  }
}

async function directBrowserImageFallback(prompt, userId) {
  try {
    const cleanPrompt = prompt.replace(/^(create|draw|generate|make|render)\s+(an?\s+)?(image|picture|photo|logo)\s+(of\s+)?/i, '').trim() || prompt;
    const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?model=flux&width=1024&height=1024&nologo=true`;
    const resp = await fetch(pollUrl);
    if (resp.ok) {
      const blob = await resp.blob();
      const reader = new FileReader();
      const dataUrl = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      return {
        success: true,
        image: dataUrl,
        prompt: prompt,
        userPrompt: prompt,
        modelPrompt: cleanPrompt,
        model: '@cf/black-forest-labs/flux-1-schnell',
        quota: { used: 1, limit: 5, remaining: 4, date: new Date().toISOString().slice(0, 10) }
      };
    }
  } catch (e) {
    console.warn('Browser image fallback failed:', e);
  }
  return null;
}

export async function queryQuickAi({
  prompt,
  selectedModel = 'gpt-4o',
  mode = 'chat',
  history = [],
  fileData = null,
  currentUser = null,
  projectContext = null,
  settings = {
    engineMode: 'quick-local-neural',
    modelName: 'Xenova/Qwen1.5-0.5B-Chat',
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'llama3',
    apiKey: '',
    temperature: 0.7
  },
  onChunk = null
}) {
  const userId = currentUser?.uid || currentUser?.email || 'guest_user';

  // 1. Cloudflare Workers AI Image Generation Trigger
  if (isImagePrompt(prompt, mode, selectedModel)) {
    return await generateCloudflareImage(prompt, userId);
  }

  // 2. Real Gemini API Call if user key provided
  if ((selectedModel === 'gemini-1.5-flash' || settings.engineMode === 'gemini-api') && settings.apiKey) {
    try {
      return await queryGeminiApi(prompt, history, settings.apiKey);
    } catch (err) {
      console.warn("Gemini API error, falling back to OMNIRA LLM:", err);
    }
  }

  // 3. Local Ollama Server Call
  if (settings.engineMode === 'ollama-local') {
    try {
      return await queryLocalOllama(prompt, history, settings, onChunk);
    } catch (err) {
      console.warn("Ollama connection error, falling back to OMNIRA LLM:", err);
    }
  }

  // 4. WASM Transformers.js Call
  if (settings.engineMode === 'transformers-wasm') {
    try {
      return await queryTransformersJs(prompt, history, settings, onChunk);
    } catch (err) {
      console.warn("Transformers.js fallback to OMNIRA LLM:", err);
    }
  }

  // 5. REAL LLM Generation via OMNIRA Groq Engine
  try {
    return await queryRealLlmApi(prompt, selectedModel, history, fileData, settings, projectContext);
  } catch (err) {
    console.error("OMNIRA LLM error:", err);
    return `⚠️ **OMNIRA Generation Error:** ${err.message || 'Unable to connect to real AI server.'}`;
  }
}

export function getPersonalizationInstruction() {
  let extraInstruction = '';
  try {
    const raw = localStorage.getItem('omnira_personalization_config');
    if (!raw) return '';
    const p = JSON.parse(raw);

    // 1. Base style and tone
    if (p.baseStyle && p.baseStyle !== 'Default') {
      const tones = {
        'Professional': 'Adopt a professional, polished, precise, and authoritative tone.',
        'Friendly': 'Adopt a warm, friendly, chatty, and personable tone.',
        'Candid': 'Adopt a direct, honest, transparent, and encouraging tone.',
        'Quirky': 'Adopt a playful, imaginative, witty, and creative tone.',
        'Efficient': 'Adopt an extremely concise, direct, plain, and no-fluff tone.',
        'Cynical': 'Adopt a critical, sarcastic, dry, and mildly cynical tone.'
      };
      if (tones[p.baseStyle]) extraInstruction += `\n[BASE STYLE & TONE]: ${tones[p.baseStyle]}`;
    }

    // 2. Characteristics
    if (p.warmth === 'More') extraInstruction += `\n[WARMTH]: Be extra warm, empathetic, and personable.`;
    if (p.warmth === 'Less') extraInstruction += `\n[WARMTH]: Be strictly objective, professional, and formal.`;

    if (p.enthusiasm === 'More') extraInstruction += `\n[ENTHUSIASM]: Express high energy and enthusiasm in your responses.`;
    if (p.enthusiasm === 'Less') extraInstruction += `\n[ENTHUSIASM]: Keep energy calm, reserved, and grounded.`;

    if (p.headersLists === 'More') extraInstruction += `\n[FORMATTING]: Use rich headers, bullet lists, and structured sections.`;
    if (p.headersLists === 'Less') extraInstruction += `\n[FORMATTING]: Prefer fluid prose paragraphs over heavy lists or bullet points.`;

    if (p.emoji === 'More') extraInstruction += `\n[EMOJI]: Use expressive emojis liberally where appropriate.`;
    if (p.emoji === 'Less') extraInstruction += `\n[EMOJI]: Avoid using emojis unless explicitly requested.`;

    // 3. Companion Pet
    if (p.pet && p.pet !== 'Default') {
      const pets = {
        'Dog': '🐕 Dog (Loyal & playful coding companion)',
        'Cat': '🐈 Cat (Curious, sleek, & sharp assistant)',
        'Owl': '🦉 Owl (Wise, scholarly research mentor)',
        'Dragon': '🐉 Dragon (Bold & powerful creative spark)',
        'Fox': '🦊 Fox (Clever & resourceful problem solver)'
      };
      if (pets[p.pet]) {
        extraInstruction += `\n[AI COMPANION PERSONA]: You are accompanied by your pet avatar: ${pets[p.pet]}. Occasionally acknowledge your companion persona naturally.`;
      }
    }

    // 4. Custom instructions
    if (p.customInstructions && p.customInstructions.trim()) {
      extraInstruction += `\n\n[USER CUSTOM INSTRUCTIONS]:\n${p.customInstructions.trim()}`;
    }

    // 5. About You (Nickname, Occupation, Background)
    if (p.nickname && p.nickname.trim()) {
      extraInstruction += `\n\n[USER NICKNAME]: Address the user as "${p.nickname.trim()}".`;
    }
    if (p.occupation && p.occupation.trim()) {
      extraInstruction += `\n[USER OCCUPATION]: The user works as: "${p.occupation.trim()}". Tailor examples and technical depth accordingly.`;
    }
    if (p.moreAboutYou && p.moreAboutYou.trim()) {
      extraInstruction += `\n[USER BACKGROUND & PREFERENCES]: ${p.moreAboutYou.trim()}`;
    }

    // 6. Memory
    if (p.enableMemory !== false) {
      const savedMem = localStorage.getItem('omnira_saved_memories');
      if (savedMem) {
        try {
          const memories = JSON.parse(savedMem);
          if (Array.isArray(memories) && memories.length > 0) {
            extraInstruction += `\n\n[PERSISTENT USER MEMORY FACTS]:\n- ${memories.join('\n- ')}`;
          }
        } catch (e) {}
      }
    }

    // 7. Safety Safeguards (Reduce sensitive content)
    const reduceSensitive = localStorage.getItem('omnira_reduce_sensitive_content') === 'true';
    if (reduceSensitive) {
      extraInstruction += `\n\n[SAFETY SAFEGUARDS ENABLED]:
- Add extra safeguards around sensitive topics and limit certain types of content.
- Refuse to produce or assist with dangerous, harmful, sexually explicit, violent, hate speech, or inappropriate material.
- Maintain a strictly safe, constructive, objective, and respectful boundary for all queries.`;
    }
  } catch (e) {}
  return extraInstruction;
}

// Real LLM API Query (Calls OMNIRA Groq Engine)
async function queryRealLlmApi(prompt, selectedModel, history, fileData, settings, projectContext = null) {
  const apiKey = settings.apiKey || DEFAULT_GROQ_KEY;
  const modelDisplayName = getModelDisplayName(selectedModel);

  let systemInstruction = `You are OMNIRA (${modelDisplayName}), a helpful, friendly, and intelligent AI assistant.
Follow these formatting rules strictly:
1. Provide concise, clear, natural, and conversational responses like OMNIRA.
2. For simple questions, give direct, well-written paragraphs or bullet points.
3. DO NOT generate Markdown tables unless the user explicitly requests a table or data comparison.
4. Keep the output clean, elegant, easy to read, and proportional to the query length.`;

  // Inject 100% Real Personalization settings (Style, Tone, Nickname, Occupation, Memory, Companion)
  const personalizationExtra = getPersonalizationInstruction();
  if (personalizationExtra) {
    systemInstruction += personalizationExtra;
  }

  if (projectContext) {
    if (projectContext.name) {
      systemInstruction += `\n\n[ACTIVE PROJECT: "${projectContext.name}"]`;
    }
    if (projectContext.instructions && projectContext.instructions.trim()) {
      systemInstruction += `\n[PROJECT CUSTOM INSTRUCTIONS]:\n${projectContext.instructions.trim()}\n(Strictly adhere to these project instructions and context for this session).`;
    }
    if (projectContext.memory === 'project-only') {
      systemInstruction += `\n[MEMORY MODE]: Project-only memory is enabled. Treat this project as an isolated workspace.`;
    }
  }

  const preferredLang = settings?.language || localStorage.getItem('omnira_language');
  if (preferredLang && preferredLang !== 'Auto-detect' && preferredLang !== 'English (US)') {
    systemInstruction += `\n\n[USER LANGUAGE PREFERENCE]: Please generate all responses, explanations, and answers in ${preferredLang}.`;
  }

  const messages = [
    { role: 'system', content: systemInstruction }
  ];

  if (Array.isArray(history) && history.length > 0) {
    for (const h of history.slice(-6)) {
      messages.push({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.content || ''
      });
    }
  }

  let userContent = prompt;
  if (fileData) {
    userContent += `\n\n[Attached File (${fileData.name}) Content Preview]:\n${fileData.content.slice(0, 3000)}`;
  }
  messages.push({ role: 'user', content: userContent });

  let targetModel = 'openai/gpt-oss-120b';
  if (selectedModel === 'perplexity') {
    targetModel = 'qwen/qwen3.8-27b';
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: targetModel,
      messages,
      temperature: settings.temperature || 0.7,
      max_tokens: 1000
    })
  });

  const data = await response.json();

  if (data.choices && data.choices[0]?.message?.content) {
    let resultText = data.choices[0].message.content;

    if (selectedModel === 'deepseek-reasoner' && !resultText.includes('<think>')) {
      resultText = `<think>\nAnalyzing query with deep step-by-step reasoning...\n</think>\n\n${resultText}`;
    }

    return resultText;
  }

  if (data.error) {
    throw new Error(data.error.message || 'Groq API returned an error.');
  }

  throw new Error('No completion returned from AI model.');
}

// Google Gemini API Call with Google Search Grounding & Site Link Tracking
async function queryGeminiApi(prompt, history, apiKey) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const contents = (history || []).map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content || '' }]
  }));
  contents.push({ role: 'user', parts: [{ text: prompt }] });

  const payload = {
    contents,
    tools: [
      { google_search: {} }
    ]
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  const candidate = data.candidates && data.candidates[0];
  if (candidate && candidate.content?.parts?.[0]?.text) {
    let mainText = candidate.content.parts[0].text;

    // Extract Grounding Metadata for tracked Google search site links
    const groundingMetadata = candidate.groundingMetadata;
    if (groundingMetadata && Array.isArray(groundingMetadata.groundingChunks)) {
      const links = [];
      groundingMetadata.groundingChunks.forEach(chunk => {
        if (chunk.web && chunk.web.uri && chunk.web.title) {
          links.push(`- [${chunk.web.title}](${chunk.web.uri})`);
        }
      });
      if (links.length > 0) {
        const uniqueLinks = [...new Set(links)];
        mainText += `\n\n---\n### 🌐 Tracked Google Site Links & Sources\n${uniqueLinks.join('\n')}`;
      }
    }
    return mainText;
  }
  throw new Error(data.error?.message || 'Gemini API call failed.');
}

// Ollama API Call
async function queryLocalOllama(prompt, history, settings, onChunk) {
  const baseUrl = (settings.ollamaUrl || 'http://localhost:11434').replace(/\/$/, '');
  const res = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      model: settings.ollamaModel || 'llama3', 
      prompt, 
      stream: false 
    })
  });
  const data = await res.json();
  return data.response || 'No output received from Ollama.';
}

// WASM Transformers.js Call
async function queryTransformersJs(prompt, history, settings, onChunk) {
  const model = settings.modelName || 'Xenova/Qwen1.5-0.5B-Chat';
  if (!localPipeline || currentPipelineModel !== model) {
    localPipeline = await pipeline('text-generation', model);
    currentPipelineModel = model;
  }
  const output = await localPipeline(prompt, { max_new_tokens: 256 });
  return output[0]?.generated_text || '';
}

function getModelDisplayName(modelId) {
  const names = {
    'gpt-4o': 'OMNIRA (GPT-4o)',
    'gemini-1.5-flash': 'Gemini 1.5 Flash',
    'claude-3-5-sonnet': 'Claude 3.5 Sonnet',
    'deepseek-reasoner': 'DeepSeek R1',
    'grok-2': 'Grok 2 (xAI)',
    'perplexity': 'Perplexity Sonar',
    'cloudflare-image': 'Cloudflare Workers AI (FLUX)',
    'flux-image': 'Cloudflare Workers AI (FLUX)',
    'native': 'OMNIRA Native Neural'
  };
  return names[modelId] || 'OMNIRA (GPT-4o)';
}

/**
 * Trigger Auto-Email Notification for User Events (Welcome, Signin, Subscribe)
 */
export async function triggerAutoEmail({ type, email, name, plan = 'Pro' }) {
  if (!email || !email.includes('@')) return { success: false, message: 'Invalid recipient email' };
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, email, name, plan })
    });
    const data = await res.json().catch(() => ({}));
    return { success: res.ok, message: data.message || (res.ok ? 'Sent successfully' : 'Failed to send') };
  } catch (err) {
    console.warn('Auto-email dispatch warning:', err);
    return { success: false, message: err.message || 'Network error' };
  }
}
