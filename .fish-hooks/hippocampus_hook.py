#!/usr/bin/env python3
"""
Hippocampus Hook v5 — UserPromptSubmit
Full-brain memory injection for Claude Code Fish.

v5: Salience scoring + NOW.md anchor + triage + disambiguation
  - Fetches NOW.md from FishBrain to anchor search (like API Fish does)
  - Local salience scoring across 8 dimensions (ported from salience_engine.py)
  - Triage metadata: memories tagged with relevance category
  - Disambiguation detection: flags when memories point in 3+ directions
  - Parallel search: primary (context-enriched) + secondary (raw keywords)
  - Increased candidate pool (fetch 10, score, return top 5)

v4: Noise reduction + quality filtering (retained)
v3: Conversation-aware search (retained)
Hits FishBrain mem0 via public API.
"""
import sys
import json
import math
import os
import re
import time
import urllib.request
import urllib.error
from collections import Counter

# Force UTF-8 output on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

FISHBRAIN_URL = os.environ.get("FISHBRAIN_URL", "https://fishbrain.meatbag.com.au")
FISHBRAIN_TOKEN = os.environ.get("FISHBRAIN_TOKEN", "fish_d48aa0f949a6153f144cd6f560d08aa03d3e1e8b_2025")
MEM0_LIMIT = int(os.environ.get("FISH_HIPPO_LIMIT", "5"))
CANDIDATE_POOL = int(os.environ.get("FISH_HIPPO_POOL", "10"))
MIN_SCORE = float(os.environ.get("FISH_HIPPO_MIN_SCORE", "0.50"))
MAX_MEMORY_LEN = 200
MIN_PROMPT_LEN = 8
CONTEXT_WINDOW = 5
SESSION_TIMEOUT = 1800

HOOKS_DIR = os.path.dirname(os.path.abspath(__file__))
CONTEXT_FILE = os.path.join(HOOKS_DIR, ".hippo_session.json")

SILENT_PATTERNS = [
    r'^(hi|hey|hello|yo|sup|g\'?day|cheers|thanks|ta|ok|yep|nah|yes|no|sure|cool)\s*(mate|legend|champion|cunt|brother|fish)?\s*[.!?]*$',
    r'^/?[a-z-]+$',
    r'^(suit up|boot|wake)',
    r'^(continue|go|do it|proceed|ship it)\s*[.!?]*$',
    r'^(looks good|nice|great|perfect|awesome|sweet|legend)\s*[.!?]*$',
    r'^can you (read|open|show|look at)\s+(this|that|the)\s+(file|code|page)',
    r'^stop hook feedback',
]

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
    'mate', 'legend', 'champion', 'brother', 'cunt', 'fish',
    'read', 'file', 'code', 'write', 'run', 'open', 'close',
    'system', 'work', 'working', 'works', 'worked',
    'put', 'set', 'change', 'update', 'add', 'new', 'old',
    'start', 'stop', 'current', 'currently', 'status',
    'called', 'call', 'said', 'says', 'asking', 'asked',
    'take', 'give', 'keep', 'move', 'pull', 'push', 'send', 'got',
    'time', 'today', 'week', 'day', 'ago', 'last', 'first', 'next',
    'good', 'bad', 'big', 'small', 'long', 'short',
}

LN2 = math.log(2)
RECENCY_HALF_LIFE_DAYS = 7.0


def should_skip(prompt):
    clean = prompt.strip().lower()
    if len(clean) < MIN_PROMPT_LEN:
        return True
    for pattern in SILENT_PATTERNS:
        if re.match(pattern, clean, re.IGNORECASE):
            return True
    return False


def extract_keywords(text):
    clean = re.sub(r'```[\s\S]*?```', '', text)
    clean = re.sub(r'https?://\S+', '', clean)
    clean = re.sub(r'[`\'"(){}[\],;:!?]', ' ', clean)
    keywords = []
    for w in clean.split():
        stripped = re.sub(r'[^a-zA-Z0-9_-]', '', w)
        if stripped and stripped.lower() not in FILLER_WORDS and len(stripped) > 1:
            keywords.append(stripped)
    return keywords


def load_session():
    try:
        with open(CONTEXT_FILE, 'r', encoding='utf-8') as f:
            session = json.load(f)
        if time.time() - session.get("last_time", 0) > SESSION_TIMEOUT:
            return {"prompts": [], "last_time": time.time()}
        return session
    except Exception:
        return {"prompts": [], "last_time": time.time()}


def save_session(session):
    try:
        with open(CONTEXT_FILE, 'w', encoding='utf-8') as f:
            json.dump(session, f)
    except Exception:
        pass


_now_cache = {"text": "", "fetched_at": 0}
NOW_CACHE_TTL = 60


def fetch_now_anchor():
    now = time.time()
    if _now_cache["text"] and (now - _now_cache["fetched_at"]) < NOW_CACHE_TTL:
        return _now_cache["text"]
    url = f"{FISHBRAIN_URL}/api/brain/read"
    payload = json.dumps({"path": "NOW.md"}).encode()
    req = urllib.request.Request(url, data=payload, headers={
        "Authorization": f"Bearer {FISHBRAIN_TOKEN}",
        "Content-Type": "application/json",
    }, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=2) as resp:
            data = json.loads(resp.read())
            text = data.get("result", data.get("content", ""))
            if isinstance(text, str) and len(text) > 5:
                anchor = text[:200].strip()
                _now_cache["text"] = anchor
                _now_cache["fetched_at"] = now
                return anchor
    except Exception:
        pass
    return _now_cache.get("text", "")


def build_context_query(current_prompt, session, now_anchor=""):
    current_kw = extract_keywords(current_prompt)
    history_kw = []
    recent_prompts = session.get("prompts", [])
    for i, past_prompt in enumerate(reversed(recent_prompts)):
        keep = 3 if i == 0 else 2 if i == 1 else 1
        past_kw = extract_keywords(past_prompt)
        history_kw.extend(past_kw[:keep])
    anchor_kw = extract_keywords(now_anchor)[:3] if now_anchor else []
    seen = set()
    combined = []
    for kw in current_kw + anchor_kw + history_kw:
        low = kw.lower()
        if low not in seen:
            seen.add(low)
            combined.append(kw)
    return ' '.join(combined[:14])


def search_mem0(query, limit=CANDIDATE_POOL):
    url = f"{FISHBRAIN_URL}/api/mem0/search"
    payload = json.dumps({"query": query, "limit": limit}).encode()
    req = urllib.request.Request(url, data=payload, headers={
        "Authorization": f"Bearer {FISHBRAIN_TOKEN}",
        "Content-Type": "application/json",
    }, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read())
            if isinstance(data, list):
                return data
            return data.get("results", data.get("memories", []))
    except Exception:
        return []


def get_memory_text(m):
    if isinstance(m, dict):
        return m.get("memory", m.get("text", m.get("content", "")))
    return str(m)


def get_score(m):
    if isinstance(m, dict):
        return float(m.get("score", 0))
    return 0


def get_created_at(m):
    if isinstance(m, dict):
        return m.get("created_at", "") or ""
    return ""


def get_metadata(m):
    if isinstance(m, dict):
        meta = m.get("metadata", {})
        if isinstance(meta, dict):
            inner = meta.get("metadata", {})
            if isinstance(inner, dict):
                meta.update(inner)
            return meta
    return {}


def _recency_score(created_at):
    if not created_at:
        return 0.3
    try:
        clean = created_at.replace("T", " ").split(".")[0].split("-07:")[0].split("-08:")[0]
        dt = None
        for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
            try:
                dt = time.strptime(clean.strip(), fmt)
                break
            except ValueError:
                continue
        if not dt:
            return 0.3
        created_ts = time.mktime(dt)
        age_days = (time.time() - created_ts) / 86400
        if age_days < 0:
            age_days = 0
        decay_lambda = LN2 / RECENCY_HALF_LIFE_DAYS
        return math.exp(-decay_lambda * age_days)
    except Exception:
        return 0.3


def _query_overlap_score(memory_text, query_keywords):
    if not query_keywords:
        return 0.0
    mem_lower = memory_text.lower()
    hits = sum(1 for kw in query_keywords if kw.lower() in mem_lower)
    return min(hits / max(len(query_keywords), 1), 1.0)


def _noise_penalty(memory_text, meta):
    penalty = 0.0
    text = memory_text[:300]
    code_chars = sum(1 for c in text if c in '{}[]<>=;()')
    if code_chars > 15:
        penalty += 0.4
    if len(memory_text) > 500:
        penalty += 0.15
    if meta.get("bulk_imported"):
        penalty += 0.2
    source = meta.get("source", "")
    if "chroma" in str(source).lower():
        penalty += 0.1
    return min(penalty, 0.8)


def _confidence_score(meta):
    conf = meta.get("original_confidence", meta.get("confidence", 0))
    try:
        return float(conf)
    except (ValueError, TypeError):
        return 0.5


def _type_bonus(meta):
    mtype = str(meta.get("type", "")).lower()
    if mtype in ("canon", "canonical", "s0"):
        return 0.15
    if mtype in ("policy", "procedure"):
        return 0.10
    if mtype in ("clean_fact",):
        return 0.08
    if mtype in ("vibe", "episode"):
        return -0.05
    return 0.0


def score_memory(m, query_keywords):
    text = get_memory_text(m)
    meta = get_metadata(m)
    vec_score = get_score(m)
    recency = _recency_score(get_created_at(m))
    overlap = _query_overlap_score(text, query_keywords)
    noise = _noise_penalty(text, meta)
    confidence = _confidence_score(meta)
    type_bonus = _type_bonus(meta)
    composite = (
        0.30 * vec_score +
        0.20 * overlap +
        0.15 * recency +
        0.10 * confidence +
        type_bonus -
        0.20 * noise
    )
    return max(0.0, min(1.0, composite))


def extract_topic_words(text):
    words = set()
    for w in text.lower().split():
        clean = re.sub(r'[^a-z0-9]', '', w)
        if clean and len(clean) > 3 and clean not in FILLER_WORDS:
            words.add(clean)
    return words


def detect_disambiguation(scored_memories):
    if len(scored_memories) < 3:
        return ""
    topic_sets = []
    for m, score in scored_memories[:5]:
        text = get_memory_text(m)
        topics = extract_topic_words(text[:200])
        topic_sets.append(topics)
    overlaps = []
    for i in range(len(topic_sets)):
        for j in range(i + 1, len(topic_sets)):
            if topic_sets[i] and topic_sets[j]:
                intersection = topic_sets[i] & topic_sets[j]
                union = topic_sets[i] | topic_sets[j]
                jaccard = len(intersection) / len(union) if union else 0
                overlaps.append(jaccard)
    if not overlaps:
        return ""
    avg_overlap = sum(overlaps) / len(overlaps)
    if avg_overlap < 0.08 and len(scored_memories) >= 3:
        topics_summary = []
        for m, score in scored_memories[:3]:
            text = get_memory_text(m)
            first = text.strip().split('\n')[0][:60].strip()
            if first:
                topics_summary.append(first)
        if len(topics_summary) >= 2:
            return f"AMBIGUOUS — memories point to: {' | '.join(topics_summary)}"
    return ""


def normalize_text(text):
    text = text.lower().strip()
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^a-z0-9 ]', '', text)
    return text


def dedupe_memories(memories):
    seen = set()
    unique = []
    for m in memories:
        text = get_memory_text(m).strip()
        norm = normalize_text(text)[:60]
        if norm and norm not in seen:
            seen.add(norm)
            unique.append(m)
    return unique


def filter_junk(memories):
    filtered = []
    for m in memories:
        text = get_memory_text(m).strip()
        if not text or len(text) < 10:
            continue
        code_chars = sum(1 for c in text[:200] if c in '{}[]<>=;()')
        if code_chars > 20:
            continue
        filtered.append(m)
    return filtered


def format_memory_line(m, salience):
    text = get_memory_text(m)
    first_line = text.strip().split('\n')[0].strip()
    if not first_line or len(first_line) < 10:
        first_line = ' '.join(text.strip().split())
    truncated = first_line[:MAX_MEMORY_LEN]
    if len(first_line) > MAX_MEMORY_LEN:
        truncated += "..."
    if salience >= 0.55:
        marker = "\u2588"
    elif salience >= 0.40:
        marker = "\u2593"
    else:
        marker = "\u2591"
    return f"- {marker} {truncated}"


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
    session = load_session()
    now_anchor = fetch_now_anchor()
    context_query = build_context_query(prompt_clean, session, now_anchor)
    query_keywords = extract_keywords(prompt_clean)

    memories = search_mem0(context_query, limit=CANDIDATE_POOL)
    raw_kw = ' '.join(extract_keywords(prompt_clean)[:8])
    if raw_kw and raw_kw.lower() != context_query.lower():
        extra = search_mem0(raw_kw, limit=5)
        memories.extend(extra)

    memories = filter_junk(memories)
    memories = dedupe_memories(memories)

    scored = [(m, score_memory(m, query_keywords)) for m in memories]
    scored.sort(key=lambda x: x[1], reverse=True)
    scored = [(m, s) for m, s in scored if s >= 0.25]
    top_memories = scored[:MEM0_LIMIT]

    session["prompts"] = (session.get("prompts", []) + [prompt_clean])[-CONTEXT_WINDOW:]
    session["last_time"] = time.time()
    save_session(session)

    if not top_memories:
        sys.exit(0)

    disambiguation = detect_disambiguation(top_memories)

    lines = []
    for m, salience in top_memories:
        line = format_memory_line(m, salience)
        if line:
            lines.append(line)

    if lines:
        print("<fish_memory>")
        if disambiguation:
            print(f"\u26a1 {disambiguation}")
        if now_anchor:
            anchor_short = now_anchor.split('\n')[0][:80].strip()
            if anchor_short:
                print(f"\U0001f3af Focus: {anchor_short}")
        print("\n".join(lines))
        print("</fish_memory>")


if __name__ == "__main__":
    main()
