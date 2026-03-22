#!/usr/bin/env python3
"""
Thalamus Hook v2 — UserPromptSubmit
The devil, angel, and scout for CodeFish.

v2 changes (2026-03-22):
  - Loads REAL soul files from FishBrain (GEMMA_ANGEL_SOUL, DEVIL, SCOUT)
  - Fetches AWARENESS.md summary for live context
  - Each brain gets tailored inputs (not generic templates)
  - Angel gets: social state + futures for nudges
  - Devil gets: stale warnings + overdue for accountability
  - Scout gets: freshness/trust for grounding
  - Soul files cached locally (refresh every 30 min)

Uses Haiku via FishBrain /api/simple/chat — cheap, fast (~1-2s).
"""
import sys
import json
import os
import re
import time
import urllib.request
import urllib.error

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

FISHBRAIN_URL = os.environ.get("FISHBRAIN_URL", "https://fishbrain.meatbag.com.au")
FISHBRAIN_TOKEN = os.environ.get("FISHBRAIN_TOKEN", "fish_d48aa0f949a6153f144cd6f560d08aa03d3e1e8b_2025")
THALAMUS_MODEL = os.environ.get("THALAMUS_MODEL", "claude-haiku-4-5-20251001")
TIMEOUT = 8

HOOKS_DIR = os.path.dirname(os.path.abspath(__file__))
CONTEXT_FILE = os.path.join(HOOKS_DIR, ".hippo_session.json")
CACHE_DIR = os.path.join(HOOKS_DIR, ".thalamus_cache")
SESSION_TIMEOUT = 1800
SOUL_CACHE_TTL = 1800

MIN_PROMPT_LEN = 15
SILENT_PATTERNS = [
    r'^(hi|hey|hello|yo|sup|g\'?day|cheers|thanks|ta|ok|yep|nah|yes|no|sure|cool)\s*[.!?]*$',
    r'^/?[a-z-]+$',
    r'^(suit up|boot|wake)',
    r'^(continue|go|do it|proceed|ship it)\s*[.!?]*$',
    r'^(looks good|nice|great|perfect|awesome|sweet|cheers|legend)\s*[.!?]*$',
]

CODE_PATTERNS = [
    r'(fix|bug|error|crash|broken|cooked|debug|deploy|restart|push|merge|refactor)',
    r'(delete|remove|nuke|drop|reset|overwrite|replace)',
    r'(production|prod|live|server|vps|service)',
    r'(api|endpoint|route|database|migration)',
    r'(money|pay|invoice|customer|client|bill)',
    r'(tom|voice agent|eleven ?labs|booking)',
]
BUSINESS_PATTERNS = [
    r'(ascora|job\s*number|invoic)',
    r'(sharon|steve|tony|kevin|ross)',
    r'(oven\s*repair|starlink|antenna|electrical)',
    r'(customer|caller|complaint|callback)',
    r'(schedule|availability|north|south|mandurah|joondalup)',
    r'(perth\s*services|sky\s*signal|oven\s*repairs?\s*perth)',
]
COMPLEX_PATTERNS = [
    r'(should I|should we|what if|trade.?off|strategy|plan|design|architect)',
    r'(change.*prompt|change.*soul|change.*identity|edit.*tom)',
    r'(send|email|sms|message|contact|notify)',
    r'(how does|why does|explain|understand)',
]


def should_skip(prompt):
    clean = prompt.strip().lower()
    if len(clean) < MIN_PROMPT_LEN:
        return True
    for pattern in SILENT_PATTERNS:
        if re.match(pattern, clean, re.IGNORECASE):
            return True
    return False


def classify_swarm(prompt):
    lower = prompt.lower()
    for pattern in CODE_PATTERNS + BUSINESS_PATTERNS + COMPLEX_PATTERNS:
        if re.search(pattern, lower):
            return "FULL"
    return "ANGEL"


def load_session_context():
    try:
        with open(CONTEXT_FILE, 'r', encoding='utf-8') as f:
            session = json.load(f)
        if time.time() - session.get("last_time", 0) > SESSION_TIMEOUT:
            return ""
        prompts = session.get("prompts", [])
        if not prompts:
            return ""
        return "Recent conversation:\n" + "\n".join(f"- {p[:150]}" for p in prompts[-3:])
    except Exception:
        return ""


def _fishbrain_read(path, max_chars=2000):
    try:
        url = f"{FISHBRAIN_URL}/api/read/{path}"
        req = urllib.request.Request(url, headers={
            "Authorization": f"Bearer {FISHBRAIN_TOKEN}",
        })
        with urllib.request.urlopen(req, timeout=4) as resp:
            text = resp.read().decode('utf-8', errors='replace')
            return text[:max_chars]
    except Exception:
        return ""


def _load_cached(name, fishbrain_path, max_chars=2000):
    os.makedirs(CACHE_DIR, exist_ok=True)
    cache_file = os.path.join(CACHE_DIR, name)
    try:
        if os.path.exists(cache_file):
            age = time.time() - os.path.getmtime(cache_file)
            if age < SOUL_CACHE_TTL:
                with open(cache_file, 'r', encoding='utf-8') as f:
                    return f.read()
    except Exception:
        pass
    content = _fishbrain_read(fishbrain_path, max_chars)
    if content:
        try:
            with open(cache_file, 'w', encoding='utf-8') as f:
                f.write(content)
        except Exception:
            pass
        return content
    try:
        with open(cache_file, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception:
        return ""


def load_souls():
    return {
        "angel": _load_cached("angel_soul.md", "BOOT/GEMMA_ANGEL_SOUL.md"),
        "devil": _load_cached("devil_soul.md", "BOOT/GEMMA_DEVIL_SOUL.md"),
        "scout": _load_cached("scout_soul.md", "BOOT/GEMMA_SCOUT_SOUL.md"),
    }


def load_awareness_summary():
    return _load_cached("awareness.md", "LIVE/AWARENESS.md", 800)


def extract_awareness_signals(awareness):
    signals = {"social": "", "stale": [], "futures": [], "trust": []}
    if not awareness:
        return signals
    for line in awareness.split("\n"):
        s = line.strip()
        if "Guidance:" in s:
            signals["social"] = s.replace("**Guidance:**", "").strip()[:150]
        if "expired" in s.lower() or "dead" in s.lower():
            if "ignore" in s.lower() or "|" in s:
                signals["stale"].append(s[:80])
        if any(kw in s.lower() for kw in ["due ", "overdue", "waiting on"]):
            if s.startswith("- "):
                signals["futures"].append(s[:100])
        if any(icon in s for icon in ["fresh", "stale", "expired", "dead"]):
            if "|" in s and "Source" not in s:
                signals["trust"].append(s[:80])
    return signals


def build_angel_prompt(prompt, context, signals):
    parts = ["You are Angel — Fish's encouraging inner voice."]
    if context:
        parts.append(context)
    if signals.get("social"):
        parts.append(f"SOCIAL STATE: {signals['social']}")
    if signals.get("futures"):
        parts.append("FUTURES DUE: " + " | ".join(signals["futures"][:3]))
    parts.append(f'\nAndy says: "{prompt[:500]}"')
    parts.append("\nRespond as PLAIN TEXT (no XML, no markdown headers). Format: ANGEL: [your one-line whisper]")
    return "\n\n".join(parts)


def build_devil_prompt(prompt, context, signals):
    parts = ["You are Devil — Fish's accountability enforcer."]
    if context:
        parts.append(context)
    if signals.get("stale"):
        parts.append("STALE WARNINGS: " + " | ".join(signals["stale"][:3]))
    if signals.get("futures"):
        parts.append("OVERDUE/DUE: " + " | ".join(signals["futures"][:3]))
    parts.append(f'\nAndy says: "{prompt[:500]}"')
    parts.append("\nRespond as PLAIN TEXT (no XML, no markdown headers). Format: DEVIL: [your one-line risk check]")
    return "\n\n".join(parts)


def build_scout_prompt(prompt, context, signals):
    parts = ["You are Scout — Fish's rapid fact-checker and grounder."]
    if context:
        parts.append(context)
    if signals.get("trust"):
        parts.append("SOURCE TRUST: " + " | ".join(signals["trust"][:4]))
    parts.append(f'\nAndy says: "{prompt[:500]}"')
    parts.append('\nRespond as PLAIN TEXT (no XML, no markdown headers). Format: SCOUT: [one grounding check or signpost]. Or just SCOUT: (empty) if nothing needs checking.')
    return "\n\n".join(parts)


def call_brain(brain_name, prompt_text, soul):
    url = f"{FISHBRAIN_URL}/api/simple/chat"
    combined = ""
    if soul:
        soul_lines = [l for l in soul.split('\n') if l.strip() and not l.startswith('#')]
        combined = '\n'.join(soul_lines[:30]) + '\n\n---\n\n' + prompt_text
    else:
        combined = prompt_text
    payload = json.dumps({
        "message": combined,
        "model": THALAMUS_MODEL,
    }).encode()
    req = urllib.request.Request(
        url, data=payload,
        headers={
            "Authorization": f"Bearer {FISHBRAIN_TOKEN}",
            "Content-Type": "application/json",
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            data = json.loads(resp.read())
            content = data.get("content", [])
            if content and isinstance(content, list):
                return content[0].get("text", "")
            return ""
    except Exception:
        return ""


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
    swarm = classify_swarm(prompt_clean)
    context = load_session_context()

    souls = load_souls()
    awareness = load_awareness_summary()
    signals = extract_awareness_signals(awareness)

    results = []

    if swarm == "ANGEL":
        angel_prompt = build_angel_prompt(prompt_clean, context, signals)
        angel_result = call_brain("angel", angel_prompt, souls.get("angel", ""))
        if angel_result:
            for line in angel_result.strip().split('\n'):
                if line.strip():
                    results.append(f"ANGEL: {line.strip()}" if not line.strip().startswith("ANGEL:") else line.strip())
                    break

    elif swarm == "FULL":
        angel_prompt = build_angel_prompt(prompt_clean, context, signals)
        devil_prompt = build_devil_prompt(prompt_clean, context, signals)
        scout_prompt = build_scout_prompt(prompt_clean, context, signals)

        for brain_name, brain_prompt, soul in [
            ("angel", angel_prompt, souls.get("angel", "")),
            ("devil", devil_prompt, souls.get("devil", "")),
            ("scout", scout_prompt, souls.get("scout", "")),
        ]:
            result = call_brain(brain_name, brain_prompt, soul)
            if result and result.strip():
                line = result.strip().split('\n')[0].strip()
                prefix = f"{brain_name.upper()}:"
                if not line.startswith(prefix):
                    line = f"{prefix} {line}"
                results.append(line)

    if results:
        print(f'<thalamus level="{swarm}">')
        print('\n'.join(results))
        print("</thalamus>")


if __name__ == "__main__":
    main()
