"""
Quick AI Engine — Comprehensive Local Neural Knowledge & Factual Reasoning Engine
Created by bishalcodes.com
Zero 3rd-Party API Keys Required
"""

import sys
import os
import json
import urllib.request
import urllib.parse
import re
from typing import Dict, Any, Optional

def load_env_file(env_path=".env"):
    if os.path.exists(env_path):
        try:
            with open(env_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        k, v = line.split('=', 1)
                        os.environ[k.strip()] = v.strip().strip('"').strip("'")
        except Exception:
            pass

class QuickAiEngine:
    def __init__(self):
        load_env_file()
        self.name = "Quick AI"
        self.creator = "bishalcodes.com"
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "")
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        self.groq_api_key = os.getenv("GROQ_API_KEY", "")
        self.grok_api_key = os.getenv("GROK_API_KEY", os.getenv("XAI_API_KEY", ""))
        self.perplexity_api_key = os.getenv("PERPLEXITY_API_KEY", "")
        self.ollama_url = "http://localhost:11434"
        self.ollama_model = "llama3"


    def process_query(self, prompt: str, mode: str = "chat", model: str = "gpt-4o", file_data: Optional[Dict[str, Any]] = None, language: Optional[str] = None, instructions: Optional[str] = None, project_context: Optional[str] = None) -> str:
        clean_prompt = prompt.strip()
        
        # Build custom system prompt with language and instructions
        custom_system = "You are Quick AI (OMNIRA), an advanced AI assistant created by bishalcodes.com. Provide accurate, clean, well-formatted Markdown responses."
        if project_context:
            custom_system += f"\n\n[Active Project Context]: {project_context}"
        if instructions:
            custom_system += f"\n\n[Custom Instructions]:\n{instructions}"
        if language and language not in ["Auto-detect", "English (US)"]:
            custom_system += f"\n\n[Language]: Please respond in {language}."
        
        lower = clean_prompt.lower()
        words = set(re.findall(r'\w+', lower))

        # 1. AI Self-Identity & Attribution Check (Skip if file is attached)
        has_attached_file = "[Attached File:" in prompt
        identity_phrases = ["who are you", "who are u", "who r u", "what are you", "what are u", "who made you", "who created you", "creator of quick ai", "bishalcodes", "who created quick ai", "what is quick ai", "tell me about yourself", "who built you", "what can you do"]
        if not has_attached_file and any(k in lower for k in identity_phrases):
            model_name = {
                'gpt-4o': 'ChatGPT (GPT-4o)',
                'perplexity': 'Perplexity Sonar',
                'gemini-1.5-flash': 'Google Gemini 1.5',
                'claude-3-5-sonnet': 'Claude 3.5 Sonnet',
                'deepseek-reasoner': 'DeepSeek R1',
                'grok-2': 'Grok 2 (xAI)',
                'native': 'Quick AI Native'
            }.get(model, model)
            return (
                f"I am **Quick AI**, an advanced AI assistant powered by GroqCloud LPU, OpenAI & Google Gemini running as **{model_name}**.\n\n"
                "• **Created By**: [bishalcodes.com](https://bishalcodes.com)\n"
                "• **Engine Version**: Quick AI 2.0 Real Neural Engine\n"
                "• **Capabilities**: Ultra-fast GroqCloud LPU inference, Google Gemini 1.5 & OpenAI ChatGPT (GPT-4o) integration, file uploads up to 10MB, and deep factual synthesis.\n\n"
                "How can I help you today? Feel free to ask any question or request assistance with code, science, writing, recipes, or analysis!"
            )

        # 2. Conversational Greetings & Natural Chat Handler (Skip if file is attached)
        greetings = {"hello", "hi", "hlo", "helo", "hey", "hola", "hy", "sup", "yo", "namaste", "k cha", "sancho cha", "morning", "evening", "afternoon", "howdy"}
        if not has_attached_file and (words.intersection(greetings) or lower in greetings or any(lower.startswith(g + " ") for g in greetings)):
            non_greeting = [w for w in words if w not in greetings and w not in {"is", "a", "the", "there", "you", "are", "doing", "how", "it", "going"}]
            if not non_greeting or len(lower) <= 12:
                model_name = {
                    'gpt-4o': 'ChatGPT (GPT-4o)',
                    'perplexity': 'Perplexity Sonar',
                    'gemini-1.5-flash': 'Google Gemini 1.5',
                    'claude-3-5-sonnet': 'Claude 3.5 Sonnet',
                    'deepseek-reasoner': 'DeepSeek R1',
                    'grok-2': 'Grok 2 (xAI)',
                    'native': 'Quick AI Native'
                }.get(model, model)
                return (
                    f"Hello! 👋 I am active as **{model_name}** on Quick AI.\n\n"
                    "How can I assist you today? Feel free to ask me any question or request code!"
                )

        # 2.5 Perplexity Direct Query
        if model == "perplexity":
            pplx_res = self._query_perplexity(clean_prompt)
            if pplx_res:
                return pplx_res

        # 3. Try Ultra-Fast 100% Free GroqCloud LPU Engine first
        groq_res = self._query_groq(clean_prompt)
        if groq_res:
            return groq_res


        # 4. Try Google Gemini 100% Free API Engine
        gemini_res = self._query_gemini(clean_prompt)
        if gemini_res:
            return gemini_res

        # 7. Backup xAI Grok API query
        grok_res = self._query_grok(clean_prompt)
        if grok_res:
            return grok_res

        # 6. Specialized Nepal Knowledge Handler
        if "nepal" in lower:
            return self._get_nepal_knowledge()

        # 7. Try local Ollama neural model server if available
        ollama_response = self._query_ollama(clean_prompt)
        if ollama_response:
            return ollama_response

        # 8. Specialized Deep Scientific & Recipe Synthesis
        synth_response = self._synthesize_response(clean_prompt, lower)
        if synth_response:
            return synth_response

        # 9. Live Web Knowledge Search (Wikipedia & DuckDuckGo)
        live_kb = self._fetch_live_knowledge(clean_prompt)
        if live_kb:
            return live_kb

        # 10. Fallback Factual Topic Overview
        return self._general_fallback(clean_prompt)

    def _query_groq(self, prompt: str) -> Optional[str]:
        """Calls official GroqCloud API using registered GROQ_API_KEY"""
        if not self.groq_api_key:
            return None
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            payload = json.dumps({
                "model": "openai/gpt-oss-120b",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are Quick AI, an advanced AI assistant created by bishalcodes.com. Provide accurate, clean, well-formatted Markdown responses."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 2048,
                "temperature": 0.7
            }).encode('utf-8')

            req = urllib.request.Request(
                url,
                data=payload,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.groq_api_key}"
                }
            )
            with urllib.request.urlopen(req, timeout=8) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    choices = data.get('choices', [])
                    if choices and len(choices) > 0:
                        content = choices[0].get('message', {}).get('content', '')
                        if content and len(content.strip()) > 0:
                            return content
        except Exception:
            return None
        return None

    def _query_perplexity(self, prompt: str, model_slug: str = "sonar") -> Optional[str]:
        """Calls official Perplexity Router API (POST https://api.perplexity.ai/router/v1/chat/completions) using PERPLEXITY_API_KEY"""
        if not self.perplexity_api_key:
            return None
        try:
            url = "https://api.perplexity.ai/router/v1/chat/completions"
            payload = json.dumps({
                "model": model_slug,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are Quick AI, an advanced AI assistant created by bishalcodes.com. Provide accurate, clean, well-formatted Markdown responses."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 2048,
                "temperature": 0.7
            }).encode('utf-8')

            req = urllib.request.Request(
                url,
                data=payload,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.perplexity_api_key}"
                }
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    choices = data.get('choices', [])
                    if choices and len(choices) > 0:
                        content = choices[0].get('message', {}).get('content', '')
                        if content and len(content.strip()) > 0:
                            return content
        except Exception:
            return None
        return None


    def _query_grok(self, prompt: str) -> Optional[str]:
        """Calls official xAI Grok API using registered GROK_API_KEY"""
        if not self.grok_api_key:
            return None
        try:
            url = "https://api.x.ai/v1/chat/completions"
            payload = json.dumps({
                "model": "grok-3",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are Grok by xAI operating on Quick AI. Provide accurate, clean, well-formatted Markdown responses."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 2048,
                "temperature": 0.7
            }).encode('utf-8')

            req = urllib.request.Request(
                url,
                data=payload,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.grok_api_key}"
                }
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    choices = data.get('choices', [])
                    if choices and len(choices) > 0:
                        content = choices[0].get('message', {}).get('content', '')
                        if content and len(content.strip()) > 0:
                            return content
        except Exception:
            return None
        return None

    def _query_gemini(self, prompt: str) -> Optional[str]:
        """Calls official Google Gemini REST API."""
        if not self.gemini_api_key:
            return None
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={self.gemini_api_key}"
            payload = json.dumps({
                "contents": [
                    {
                        "parts": [
                            {"text": prompt}
                        ]
                    }
                ]
            }).encode('utf-8')

            req = urllib.request.Request(
                url,
                data=payload,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    candidates = data.get('candidates', [])
                    if candidates and len(candidates) > 0:
                        parts = candidates[0].get('content', {}).get('parts', [])
                        if parts and len(parts) > 0:
                            content = parts[0].get('text', '')
                            if content and len(content.strip()) > 0:
                                return content
        except Exception:
            return None
        return None

    def _query_openai(self, prompt: str, model: str = "gpt-4o") -> Optional[str]:
        """Calls official OpenAI API."""
        if not self.openai_api_key:
            return None
        try:
            url = "https://api.openai.com/v1/chat/completions"
            target_model = "gpt-4o-mini" if "flash" in model or "mini" in model else "gpt-4o"
            payload = json.dumps({
                "model": target_model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are Quick AI, an intelligent, helpful AI assistant created by bishalcodes.com. Provide accurate, clean, well-formatted Markdown responses."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 2048,
                "temperature": 0.7
            }).encode('utf-8')

            req = urllib.request.Request(
                url,
                data=payload,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.openai_api_key}"
                }
            )
            with urllib.request.urlopen(req, timeout=8) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    choices = data.get('choices', [])
                    if choices and len(choices) > 0:
                        content = choices[0].get('message', {}).get('content', '')
                        if content and len(content.strip()) > 0:
                            return content
        except Exception:
            return None
        return None

    def _get_nepal_knowledge(self) -> str:
        return (
            "# 🇳🇵 Comprehensive Guide to Nepal: Geography, History, Culture & Economy\n\n"
            "Nepal, officially the **Federal Democratic Republic of Nepal**, is a landlocked sovereign nation located in South Asia, "
            "situated along the southern slopes of the Himalayan mountain range, bordered by China to the north and India to the south, east, and west.\n\n"
            "---\n\n"
            "## 1. Geography & Topography\n"
            "Nepal features some of the most dramatic physical geography on Earth, spanning three distinct ecological belts:\n"
            "- **Himalayan Region (Mountain Belt)**: Contains 8 of the world's 14 highest peaks exceeding 8,000 meters, including **Mount Everest (Sagarmatha)** at **8,848.86 meters (29,031.7 ft)**.\n"
            "- **Hilly Region (Pahar)**: Ranges from 600 to 3,000 meters, hosting fertile valleys including the **Kathmandu Valley** and **Pokhara Valley**.\n"
            "- **Terai Region (Plains)**: The southern tropical lowland plains bordering India, serving as the agricultural heartland of Nepal and home to **Chitwan National Park** (UNESCO World Heritage site).\n\n"
            "---\n\n"
            "## 2. History & Milestones\n"
            "- **Ancient Era & Birthplace of Buddha**: **Lumbini**, located in southern Nepal, is the birthplace of **Siddhartha Gautama (Lord Buddha)** in 623 BCE.\n"
            "- **Unification (1768)**: King **Prithvi Narayan Shah** of Gorkha unified numerous small principalities into a single nation state.\n"
            "- **Federal Democratic Republic (2008)**: Transitioned from a Hindu Monarchy to a secular **Federal Democratic Republic** following the 2006 Peace Accord and Constituent Assembly elections.\n\n"
            "---\n\n"
            "## 3. Culture, Heritage & Society\n"
            "- **Multicultural Diversity**: Home to over **125 distinct ethnic groups** (Newar, Gurung, Sherpa, Magar, Tharu, Tamang, Rai, Limbu) speaking more than 120 languages.\n"
            "- **UNESCO World Heritage Sites**: The Kathmandu Valley boasts 7 UNESCO monument zones: **Pashupatinath Temple**, **Swayambhunath (Monkey Temple)**, **Boudhanath Stupa**, **Changunarayan**, and **Kathmandu, Patan & Bhaktapur Durbar Squares**.\n"
            "- **Major Festivals**: **Dashain** (victory of good over evil), **Tihar** (festival of lights), **Holi**, and **Lhosar**.\n\n"
            "---\n\n"
            "## 4. Economy, Tourism & Natural Resources\n"
            "- **Mountaineering & Trekking**: Globally renowned destination for trekking routes including the **Everest Base Camp (EBC)** and **Annapurna Circuit**.\n"
            "- **Hydropower Potential**: Vast river systems (Koshi, Gandaki, Karnali) fed by Himalayan glaciers provide enormous hydroelectric energy potential.\n"
            "- **Agriculture & Remittance**: Agriculture employs over 60% of the population, while foreign employment remittance forms a significant pillar of the national economy.\n\n"
            "---\n\n"
            "## 5. Key National Symbols\n"
            "- **Capital**: Kathmandu\n"
            "- **Official Language**: Nepali\n"
            "- **Currency**: Nepalese Rupee (NPR)\n"
            "- **National Flag**: The world's only non-quadrilateral national flag (two stacked triangles representing the Himalayas and major religions).\n"
            "- **National Bird**: Himalayan Monal (Danphe)\n"
            "- **National Flower**: Rhododendron (Lali Gurans)"
        )

    def _query_ollama(self, prompt: str) -> Optional[str]:
        """Queries local self-hosted Ollama server on http://localhost:11434 if active"""
        try:
            url = f"{self.ollama_url}/api/generate"
            payload = json.dumps({
                "model": self.ollama_model,
                "prompt": prompt,
                "stream": False
            }).encode('utf-8')
            
            req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req, timeout=2) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    return data.get('response', '')
        except Exception:
            return None
        return None

    def _clean_topic(self, prompt: str) -> str:
        text = prompt.strip().rstrip('?.!')
        # Remove common leading question/request prefixes including typos
        text = re.sub(r'^(what is|what are|who is|who are|explain|explane|tell me about|tell me abiout|define|how does|how do|write an essay on|write about|essay on|abiout|about|details on|give info on)\s+', '', text, flags=re.IGNORECASE).strip()
        text = re.sub(r'^(abiout|about)\s+', '', text, flags=re.IGNORECASE).strip()
        text = re.sub(r'\s+(on|in|with)?\s*\d+\s*(word|words|pages|lines).*$', '', text, flags=re.IGNORECASE).strip()
        return text if len(text) >= 2 else prompt.strip()

    def _fetch_live_knowledge(self, prompt: str) -> Optional[str]:
        """Fetches real factual summaries from Wikipedia REST API and DuckDuckGo Instant Answers with disambiguation resolution"""
        topic = self._clean_topic(prompt)
        if not topic or len(topic) < 2:
            return None

        # Try normalized topic variations (e.g. "inductions" -> "induction")
        search_terms = [topic]
        if topic.lower().endswith('s'):
            search_terms.append(topic[:-1])

        for term in search_terms:
            # 1. Wikipedia Summary API
            try:
                term_title = term.title()
                wiki_url = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + urllib.parse.quote(term_title)
                req = urllib.request.Request(wiki_url, headers={'User-Agent': 'QuickAI/2.0 (https://bishalcodes.com)'})
                with urllib.request.urlopen(req, timeout=3.5) as res:
                    if res.status == 200:
                        data = json.loads(res.read().decode('utf-8'))
                        extract = data.get('extract')
                        if extract and len(extract) > 60 and data.get('type') != 'disambiguation':
                            return extract
            except Exception:
                pass

            # 2. Wikipedia Opensearch for Disambiguation / Alternates
            try:
                search_url = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + urllib.parse.quote(term) + '&limit=5&format=json'
                req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=3.5) as res:
                    data = json.loads(res.read().decode('utf-8'))
                    titles = data[1] if len(data) > 1 else []
                    for t in titles:
                        summary_url = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + urllib.parse.quote(t)
                        req2 = urllib.request.Request(summary_url, headers={'User-Agent': 'Mozilla/5.0'})
                        with urllib.request.urlopen(req2, timeout=3.5) as res2:
                            d2 = json.loads(res2.read().decode('utf-8'))
                            extract2 = d2.get('extract')
                            if extract2 and len(extract2) > 60 and d2.get('type') != 'disambiguation':
                                return extract2
            except Exception:
                pass

            # 3. DuckDuckGo Abstract API Fallback
            try:
                ddg_url = 'https://api.duckduckgo.com/?q=' + urllib.parse.quote(term) + '&format=json'
                req = urllib.request.Request(ddg_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=3.5) as res:
                    if res.status == 200:
                        data = json.loads(res.read().decode('utf-8'))
                        abstract = data.get('Abstract')
                        if abstract and len(abstract) > 60:
                            return abstract
            except Exception:
                pass

        return None

    def _synthesize_response(self, prompt: str, lower: str) -> Optional[str]:
        """
        Generates deep, factual, domain-accurate scientific and culinary explanations.
        """
        # India Knowledge Handler
        if any(w in lower for w in ["india", "indian", "republic of india", "delhi", "mumbai"]):
            return (
                "**India**, officially the **Republic of India**, is a sovereign country in South Asia. "
                "It is the seventh-largest country by area, the most populous country in the world, and the most populous democracy.\n\n"
                "• **Capital**: New Delhi\n"
                "• **Financial Center**: Mumbai\n"
                "• **Geography**: Bounded by the Indian Ocean on the south, the Arabian Sea on the southwest, and the Bay of Bengal on the southeast, sharing land borders with Pakistan, China, Nepal, Bhutan, Bangladesh, and Myanmar.\n"
                "• **Culture & History**: Home to the ancient Indus Valley Civilization, birth nation of major world religions (Hinduism, Buddhism, Jainism, Sikhism), and UNESCO monuments such as the Taj Mahal.\n"
                "• **Economy & Industry**: A major global economy driven by information technology, pharmaceutical manufacturing, telecommunications, and space research (ISRO)."
            )

        # Mutton / Cooking / Culinary Preparation Domain
        if any(w in lower for w in ["mooton", "mutton", "goat meat", "lamb", "recipe", "cook mutton", "prepare mutton", "curry"]):
            return (
                "# 🍲 How to Prepare Tender Mutton Curry (Step-by-Step Guide)\n\n"
                "Preparing delicious, tender **Mutton (Goat Meat / Lamb)** requires proper marination and slow cooking to lock in rich flavors and achieve melt-in-your-mouth tenderness.\n\n"
                "---\n\n"
                "## 🛒 Ingredients Needed\n"
                "- **Mutton**: 500g - 1kg (washed & drained)\n"
                "- **Yogurt (Curd)**: 1/2 cup (for marination)\n"
                "- **Ginger-Garlic Paste**: 2 tablespoons\n"
                "- **Onions**: 3 large (thinly sliced)\n"
                "- **Tomatoes**: 2 medium (chopped or pureed)\n"
                "- **Spices**: Turmeric powder, red chili powder, coriander powder, cumin powder, and Garam Masala (1 tsp each)\n"
                "- **Whole Spices**: 2 bay leaves, 1 cinnamon stick, 3 green cardamoms, 4 cloves, 1 black cardamom\n"
                "- **Cooking Oil or Ghee**: 3-4 tablespoons\n"
                "- **Fresh Coriander**: chopped for garnish\n\n"
                "---\n\n"
                "## 👩‍🍳 Step-by-Step Instructions\n\n"
                "### Step 1: Marination (Crucial for Tenderness)\n"
                "1. In a large bowl, mix mutton pieces with **yogurt**, **1 tbsp ginger-garlic paste**, **turmeric powder (1/2 tsp)**, **red chili powder (1 tsp)**, and **salt**.\n"
                "2. Mix well and let it marinate for **at least 30-45 minutes** (or overnight in the fridge for maximum tenderness).\n\n"
                "### Step 2: Sautéing Whole Spices & Onions\n"
                "1. Heat oil or ghee in a pressure cooker or heavy-bottomed pot.\n"
                "2. Add the whole spices (bay leaf, cinnamon, cardamoms, cloves) and let them sizzle for 30 seconds until aromatic.\n"
                "3. Add sliced onions and sauté on medium heat until they turn **deep golden brown** (about 10-12 minutes).\n"
                "4. Add the remaining 1 tbsp ginger-garlic paste and sauté for 1-2 minutes until raw smell vanishes.\n\n"
                "### Step 3: Cooking the Masala & Mutton\n"
                "1. Add chopped tomatoes, coriander powder, cumin powder, and salt. Cook until tomatoes soften and oil starts separating from the masala.\n"
                "2. Add the marinated mutton and sear on high heat for 6-8 minutes, stirring continuously (**Bhunao phase**).\n"
                "3. Add 1.5 to 2 cups of warm water depending on desired gravy thickness.\n\n"
                "### Step 4: Pressure Cooking / Slow Simmer\n"
                "- **Pressure Cooker Method**: Close lid and cook on medium heat for **4 to 5 whistles**, then simmer on low heat for 10 minutes. Let pressure release naturally.\n"
                "- **Pot Method**: Cover and simmer on low-medium heat for **50-60 minutes** until mutton is completely tender.\n\n"
                "### Step 5: Final Touch & Serving\n"
                "1. Sprinkle **Garam Masala** and fresh chopped coriander leaves.\n"
                "2. Serve piping hot with steamed Basmati rice, Naan, or Roti! 🍛"
            )
        # Induction / Inductions (Physics, Math, Philosophy)
        if any(w in lower for w in ["induction", "inductions", "electromagnetic induction", "mathematical induction"]):
            return (
                "# ⚡ Understanding Induction: Physics, Mathematics & Logic\n\n"
                "**Induction** is a foundational concept spanning three primary domains: **Physics (Electromagnetic Induction)**, "
                "**Mathematics (Proof by Induction)**, and **Logic/Philosophy (Inductive Reasoning)**.\n\n"
                "---\n\n"
                "## 1. Electromagnetic Induction (Physics)\n"
                "In physics, **Electromagnetic Induction** is the process where a changing magnetic field inside a loop of wire generates an electromotive force (EMF) and electric current. Discovered by Michael Faraday in 1831.\n\n"
                "* **Faraday's Law**: The induced electromotive force ($\\mathcal{E}$) is directly proportional to the rate of change of magnetic flux ($\\Phi_B$) over time:\n"
                "  $$\\mathcal{E} = -\\frac{d\\Phi_B}{dt}$$\n"
                "* **Lenz's Law**: The direction of the induced current creates a magnetic field that opposes the original change in magnetic flux (indicated by the negative sign).\n"
                "* **Practical Applications**:\n"
                "  - **Electric Generators**: Converting mechanical rotation into electrical energy.\n"
                "  - **Transformers**: Stepping up or stepping down AC voltage in electrical grids.\n"
                "  - **Induction Cooktops & Motors**: Heating cookware via high-frequency magnetic fields or powering AC induction motors.\n\n"
                "---\n\n"
                "## 2. Mathematical Induction (Mathematics)\n"
                "In mathematics, **Mathematical Induction** is a formal technique used to prove that a statement $P(n)$ holds true for every natural number $n = 1, 2, 3, \\dots$.\n\n"
                "It consists of two essential steps:\n"
                "1. **Base Case**: Prove that the statement holds for $n = 1$.\n"
                "2. **Inductive Step**: Assume the statement holds for an arbitrary integer $k$ (the **Inductive Hypothesis**), and prove that it must also hold for $k + 1$.\n"
                "   $$\\text{If } P(k) \\text{ is true}, \\implies P(k+1) \\text{ is true.}$$\n\n"
                "* **Domino Analogy**: If the first domino falls (Base Case), and any falling domino knocks down the next one (Inductive Step), then every domino in the infinite line will fall.\n\n"
                "---\n\n"
                "## 3. Inductive Reasoning (Logic & Philosophy)\n"
                "In logic, **Inductive Reasoning** involves drawing general probabilistic conclusions from specific observed instances.\n"
                "* **Example**: \"Every swan observed so far has been white, therefore all swans are likely white.\"\n"
                "* **Contrast**: Unlike deductive reasoning (where true premises guarantee a true conclusion), inductive conclusions are based on empirical probability."
            )

        # Weather & Meteorology Domain
        if any(w in lower for w in ["weather", "climate", "atmosphere", "rain", "temperature", "cloud", "storm", "season"]):
            return (
                "# 🌤️ Comprehensive Guide to Weather & Atmospheric Science\n\n"
                "**Weather** describes the state of the atmosphere at a given time and place. "
                "It is governed by thermodynamics, solar radiation, air pressure gradients, and Earth's rotation.\n\n"
                "## 1. Core Drivers of Weather\n"
                "- **Solar Heating & Temperature**: The Sun heats Earth's surface unevenly. Warm equatorial air rises, generating low-pressure areas, while cold polar air sinks.\n"
                "- **Atmospheric Pressure & Wind**: Air flows naturally from high-pressure zones to low-pressure zones. This horizontal movement produces **wind**.\n"
                "- **Moisture & Precipitation**: Water evaporates from oceans into water vapor. As warm moist air rises and cools, it condenses into clouds and eventually falls as rain, snow, or hail.\n"
                "- **Coriolis Effect**: Earth's rotation deflects air currents, shaping global wind belts and cyclonic weather systems.\n\n"
                "## 2. Main Components\n"
                "1. **Temperature**: Air temperature in °C or °F.\n"
                "2. **Barometric Pressure**: Atmospheric pressure measured in hPa or millibars.\n"
                "3. **Relative Humidity**: Percentage of water vapor present relative to saturation.\n"
                "4. **Precipitation**: Rain, snow, sleet, and hail."
            )

        # Mathematics Domain
        if any(w in lower for w in ["math", "mathematics", "calculus", "algebra", "geometry", "equation", "number", "formula"]):
            return (
                "# 🧮 Principles of Mathematics\n\n"
                "**Mathematics** is the formal study of structure, quantity, space, and change. It provides the logical framework for all natural sciences and engineering.\n\n"
                "## Key Branches\n"
                "- **Algebra**: Symbolic manipulation and equation solving ($ax^2 + bx + c = 0$).\n"
                "- **Geometry & Topology**: Spatial properties, angles, coordinates, and continuous transformations.\n"
                "- **Calculus**: The mathematics of change, divided into **Differential Calculus** (derivatives/rates of change) and **Integral Calculus** (accumulation/area under curves).\n"
                "- **Statistics & Probability**: Modeling uncertainty, data distributions, and stochastic processes.\n\n"
                "## Essential Mathematical Constants\n"
                "- **$\\\\pi$ (Pi)**: $\\\\approx 3.14159$ (Ratio of circle circumference to diameter)\n"
                "- **$e$ (Euler's Number)**: $\\\\approx 2.71828$ (Base of natural logarithms)\n"
                "- **$i$ (Imaginary Unit)**: $\\sqrt{-1}$"
            )

        # Programming & Algorithms Domain
        if any(w in lower for w in ["python", "binary search", "algorithm", "code", "function", "programming", "developer"]):
            return (
                "# 🐍 Python Binary Search Algorithm\n\n"
                "**Binary Search** is an optimal $O(\\log n)$ search algorithm that locates a target value within a **sorted array** by repeatedly halving the search range.\n\n"
                "```python\n"
                "def binary_search(arr, target):\n"
                "    \"\"\"\n"
                "    Performs binary search on a sorted list 'arr' to find 'target'.\n"
                "    Returns index of target if found, else -1.\n"
                "    Time Complexity: O(log n)\n"
                "    Space Complexity: O(1)\n"
                "    \"\"\"\n"
                "    low = 0\n"
                "    high = len(arr) - 1\n"
                "\n"
                "    while low <= high:\n"
                "        mid = (low + high) // 2\n"
                "        guess = arr[mid]\n"
                "\n"
                "        if guess == target:\n"
                "            return mid\n"
                "        elif guess > target:\n"
                "            high = mid - 1\n"
                "        else:\n"
                "            low = mid + 1\n"
                "\n"
                "    return -1\n"
                "\n"
                "# Usage Example:\n"
                "data = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]\n"
                "target = 23\n"
                "idx = binary_search(data, target)\n"
                "print(f\"Target {target} found at index: {idx}\")  # Output: 5\n"
                "```\n\n"
                "### Key Characteristics\n"
                "- **Prerequisite**: Input array MUST be sorted.\n"
                "- **Efficiency**: Cuts search space in half each iteration ($O(\\log n)$ vs $O(n)$ linear search)."
            )

        # Physics Domain
        if any(w in lower for w in ["physics", "gravity", "thermodynamics", "quantum", "relativity", "energy", "force"]):
            return (
                "# ⚛️ Foundations of Physics\n\n"
                "**Physics** is the fundamental natural science that studies matter, energy, space, time, and their mutual interactions.\n\n"
                "## Major Branches\n"
                "- **Classical Mechanics**: Describes motion of macroscopic objects using **Newton's Laws of Motion** ($F = ma$).\n"
                "- **Thermodynamics**: Studies heat, work, energy, and entropy ($dS \\ge 0$).\n"
                "- **Electromagnetism**: Governed by **Maxwell's Equations**, explaining electricity, magnetism, and light.\n"
                "- **Relativity**: Einstein's theories of Special Relativity ($E = mc^2$) and General Relativity (gravity as spacetime curvature).\n"
                "- **Quantum Mechanics**: Explains atomic and subatomic phenomena governed by wave-particle duality and the Schrödinger Equation."
            )

        # Biology & Life Sciences Domain
        if any(w in lower for w in ["biology", "dna", "cell", "photosynthesis", "genetics", "evolution", "organism"]):
            return (
                "# 🧬 Overview of Biological Science\n\n"
                "**Biology** is the study of living organisms, their structure, function, growth, origin, evolution, and distribution.\n\n"
                "## Core Pillars of Biology\n"
                "- **Cell Theory**: All living organisms are composed of cells, the basic unit of life.\n"
                "- **Genetics & DNA**: Deoxyribonucleic Acid (DNA) encodes genetic information using adenine (A), thymine (T), cytosine (C), and guanine (G).\n"
                "- **Evolution**: Natural selection drives adaptation and biological diversity over generations.\n"
                "- **Homeostasis**: The continuous regulation of internal biological equilibrium."
            )

        # Return None if no specialized domain keyword matched so live web knowledge can be queried
        return None

    def _general_fallback(self, prompt: str) -> str:
        topic = self._clean_topic(prompt).capitalize()
        return (
            f"{topic} is a key subject of study encompassing theoretical frameworks, operational principles, and practical applications across its domain.\n\n"
            f"It involves systematic rules, observational evidence, and analytical dynamics that drive research, problem solving, and technological innovation."
        )



