#!/usr/bin/env python3
"""
Hippocampus Hook v3 — UserPromptSubmit
Searches Fish memory before every Claude Code response.
Injects relevant memories as context so Fish isn't stateless.
v3: Conversation-aware search
  - Maintains a rolling window of recent prompts (last 5) in a local file
  - Builds a "conversation topic" from recent prompts for contextual search
  - If you're 10 messages deep talking about Tom, and you say "check the logs",
    the search query becomes "Tom voice agent check logs" not just "check logs"
  - Volume gating, keyword extraction, deduplication from v2 retained
Hits FishBrain mem0 via public API.
"""
import sys
import json
import os
import re
import time
import urllib.request
import urllib.error

# Force UTF-8 output on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

FISHBRAIN_URL = os.environ.get("FISHBRAIN_URL", "https://fishbrain.meatbag.com.au")
FISHBRAIN_TOKEN = os.environ.get("FISHBRAIN_TOKEN", "fish_d48aa0f949a6153f144cd6f560d08aa03d3e1e8b_2025")
MEM0_LIMIT = int(os.environ.get("FISH_HIPPO_LIMIT", "5"))
MIN_PROMPT_LEN = 8
CONTEXT_WINDOW = 5          # How many recent prompts to track
SESSION_TIMEOUT = 1800       # 30 min — after this gap, reset conversation context

HOOKS_DIR = os.path.dirname(os.path.abspath(__file__))
CONTEXT_FILE = os.path.join(HOOKS_DIR, ".hippo_session.json")

# ── Volume Gating ──
SILENT_PATTERNS = [
    r'^(hi|hey|hello|yo|sup|g\'?day|cheers|thanks|ta|ok|yep|nah|yes|no|sure|cool)\s*[.!?]*$',
    r'^/?[a-z-]+$',           # slash commands
    r'^(suit up|boot|wake)',   # boot sequences
    r'^(continue|go|do it|proceed|ship it)\s*[.!?]*$',
]

def should_skip(prompt: str) -> bool:
    clean = prompt.strip().lower()
    if len(clean) < MIN_PROMPT_LEN:
        return True
    for pattern in SILENT_PATTERNS:
        if re.match(pattern, clean, re.IGNORECASE):
            return True
    return False

# ── Keyword Extraction ──
FILLER_WORDS = {
    'please', 'can', 'you', 'could', 'would', 'should', 'the', 'a', 'an',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'shall', 'may', 'might', 'must',
    'i', 'me', 'my', 'we', 'our', 'it', 'its', 'this', 'that', 'these',
    'what', 'how', 'why', 'when', 'where', 'who', 'which',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'about',
    'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'and', 'but', 'or', 'nor', 'not', 'so', 'if', 'then', 'than',
    'just', 'also', 'very', 'really', 'quite', 'some', 'any', 'all',
    'let', 'make', 'get', 'go', 'know', 'think', 'want', 'need',
    'look', 'check', 'find', 'show', 'tell', 'help', 'try', 'use',
    'like', 'up', 'out', 'now', 'here', 'there', 'see', 'right',
    'thing', 'stuff', 'something', 'anything', 'everything', 'nothing',
    'way', 'lot', 'bit', 'much', 'many', 'more', 'less', 'most',
    'well', 'still', 'already', 'even', 'only', 'maybe', 'probably',
    'going', 'gonna', 'wanna', 'gotta', 'done', 'doing', 'being',
    'actually', 'basically', 'literally', 'obviously', 'supposed',
    'yeah', 'yep', 'nah', 'okay', 'alright', 'anyway', 'though',
}

def extract_keywords(text: str) -> list:
    """Extract meaningful keywords from text."""
    clean = re.sub(r'```[\s\S]*?```', '', text)
    clean = re.sub(r'https?://\S+', '', clean)
    clean = re.sub(r'[`\'"(){}\[\],;:!?]', ' ', clean)
    keywords = []
    for w in clean.split():
        stripped = re.sub(r'[^a-zA-Z0-9_-]', '', w)
        if stripped and stripped.lower() not in FILLER_WORDS and len(stripped) > 1:
            keywords.append(stripped)
    return keywords

# ── Conversation Context ──
def load_session() -> dict:
    """Load recent prompts from session file."""
    try:
        with open(CONTEXT_FILE, 'r', encoding='utf-8') as f:
            session = json.load(f)
        last_time = session.get("last_time", 0)
        if time.time() - last_time > SESSION_TIMEOUT:
            return {"prompts": [], "last_time": time.time()}
        return session
    except Exception:
        return {"prompts": [], "last_time": time.time()}

def save_session(session: dict):
    try:
        with open(CONTEXT_FILE, 'w', encoding='utf-8') as f:
            json.dump(session, f)
    except Exception:
        pass

def build_context_query(current_prompt: str, session: dict) -> str:
    """Build a context-enriched search query from conversation history."""
    current_kw = extract_keywords(current_prompt)
    history_kw = []
    recent_prompts = session.get("prompts", [])
    for i, past_prompt in enumerate(reversed(recent_prompts)):
        keep = 3 if i == 0 else 2 if i == 1 else 1
        past_kw = extract_keywords(past_prompt)
        history_kw.extend(past_kw[:keep])
    if not history_kw:
        return ' '.join(current_kw[:10])
    seen = set()
    combined = []
    for kw in current_kw + history_kw:
        low = kw.lower()
        if low not in seen:
            seen.add(low)
            combined.append(kw)
    return ' '.join(combined[:12])

# ── Memory Search ──
def search_mem0(query: str, limit: int = MEM0_LIMIT) -> list:
    """Search Fish memory via FishBrain API."""
    url = f"{FISHBRAIN_URL}/api/mem0/search"
    payload = json.dumps({"query": query, "limit": limit}).encode()
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Authorization": f"Bearer {FISHBRAIN_TOKEN}",
            "Content-Type": "application/json",
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read())
            if isinstance(data, list):
                return data
            return data.get("results", data.get("memories", []))
    except Exception:
        return []

def get_memory_text(m) -> str:
    if isinstance(m, dict):
        return m.get("memory", m.get("text", m.get("content", "")))
    return str(m)

def dedupe_memories(memories: list) -> list:
    seen = set()
    unique = []
    for m in memories:
        text = get_memory_text(m).strip()
        key = text[:80].lower()
        if key and key not in seen:
            seen.add(key)
            unique.append(m)
    return unique

# ── Main ──
def main():
    try:
        raw = sys.stdin.read()
        data = json.loads(raw) if raw.strip() else {}
        prompt = data.get("prompt", "")
    except Exception:
        prompt = ""

    if not prompt or should_skip(prompt):
        sys.exit(0)

    prompt_clean = prompt.strip()

    # Load conversation context
    session = load_session()

    # Build context-aware search query
    context_query = build_context_query(prompt_clean, session)

    # Primary search: context-enriched query
    memories = search_mem0(context_query)

    # Secondary search: raw prompt (catches things context query might miss)
    raw_kw = ' '.join(extract_keywords(prompt_clean)[:8])
    if raw_kw and raw_kw.lower() != context_query.lower():
        extra = search_mem0(raw_kw, limit=3)
        memories.extend(extra)

    # Deduplicate and cap
    memories = dedupe_memories(memories)[:MEM0_LIMIT]

    # Update session with this prompt AFTER search
    session["prompts"] = (session.get("prompts", []) + [prompt_clean])[-CONTEXT_WINDOW:]
    session["last_time"] = time.time()
    save_session(session)

    if not memories:
        sys.exit(0)

    lines = []
    for m in memories:
        text = get_memory_text(m)
        if text:
            truncated = text.strip()[:300]
            if len(text.strip()) > 300:
                truncated += "..."
            lines.append(f"- {truncated}")

    if lines:
        print("<fish_memory>")
        print("\n".join(lines))
        print("</fish_memory>")

if __name__ == "__main__":
    main()
