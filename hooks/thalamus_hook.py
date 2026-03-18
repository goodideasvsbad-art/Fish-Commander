#!/usr/bin/env python3
"""
Thalamus Hook v1 — UserPromptSubmit
The devil, angel, and scout for CodeFish.

Fires alongside the hippocampus hook. Sends the user's prompt (with
conversation context) to Haiku via FishBrain's simple/chat endpoint.
Returns angel/devil/scout analysis so Fish has three perspectives before
responding.

Architecture mirrors the VPS thalamus (smart_gemma_v2.py):
  - Volume gating: skips greetings, slash commands, trivial prompts
  - Swarm level: NOOP (skip) / ANGEL (simple) / FULL (complex)
  - Triune brain: Angel (wisdom), Devil (risk), Scout (verify)
  - Shares session context with hippocampus hook

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
CONTEXT_FILE = os.path.join(HOOKS_DIR, ".hippo_session.json")  # shared with hippocampus
SESSION_TIMEOUT = 1800

# ── Volume Gating ──
MIN_PROMPT_LEN = 15  # thalamus needs more substance than hippocampus
SILENT_PATTERNS = [
    r'^(hi|hey|hello|yo|sup|g\'?day|cheers|thanks|ta|ok|yep|nah|yes|no|sure|cool)\s*[.!?]*$',
    r'^/?[a-z-]+$',
    r'^(suit up|boot|wake)',
    r'^(continue|go|do it|proceed|ship it)\s*[.!?]*$',
    r'^(looks good|nice|great|perfect|awesome|sweet|cheers|legend)\s*[.!?]*$',
]

# ── Swarm Level Classifier (Dumb Gemma equivalent) ──
CODE_PATTERNS = [
    r'(fix|bug|error|crash|broken|cooked|debug|deploy|restart|push|merge|refactor)',
    r'(delete|remove|nuke|drop|reset|overwrite|replace)',
    r'(production|prod|live|server|vps|service)',
    r'(api|endpoint|route|database|migration)',
    r'(money|pay|invoice|customer|client|bill)',
    r'(tom|voice agent|eleven ?labs|booking)',
]

COMPLEX_PATTERNS = [
    r'(should I|should we|what if|trade.?off|strategy|plan|design|architect)',
    r'(change.*prompt|change.*soul|change.*identity|edit.*tom)',
    r'(send|email|sms|message|contact|notify)',
    r'(how does|why does|explain|understand)',
]


def should_skip(prompt: str) -> bool:
    clean = prompt.strip().lower()
    if len(clean) < MIN_PROMPT_LEN:
        return True
    for pattern in SILENT_PATTERNS:
        if re.match(pattern, clean, re.IGNORECASE):
            return True
    return False


def classify_swarm(prompt: str) -> str:
    """Classify prompt into ANGEL / FULL."""
    lower = prompt.lower()
    for pattern in CODE_PATTERNS:
        if re.search(pattern, lower):
            return "FULL"
    for pattern in COMPLEX_PATTERNS:
        if re.search(pattern, lower):
            return "FULL"
    return "ANGEL"


def load_session_context() -> str:
    """Load recent prompts from shared session file for context."""
    try:
        with open(CONTEXT_FILE, 'r', encoding='utf-8') as f:
            session = json.load(f)
        last_time = session.get("last_time", 0)
        if time.time() - last_time > SESSION_TIMEOUT:
            return ""
        prompts = session.get("prompts", [])
        if not prompts:
            return ""
        return "Recent conversation:\n" + "\n".join(f"- {p[:150]}" for p in prompts[-3:])
    except Exception:
        return ""


# ── Triune Prompts ──
TRIUNE_FULL = """You are three advisors preprocessing a message BEFORE the main AI (Fish/Claude) sees it. Your job is to give Fish quick, sharp perspective so it makes better decisions. Be direct. No fluff. No preamble.

{context}

User's message: "{prompt}"

Respond in EXACTLY this format (1-2 lines each, no more):
ANGEL: [The wise, long-term perspective. What matters beyond the immediate ask?]
DEVIL: [What could go wrong? What's the risk? What breaks?]
SCOUT: [What should Fish verify before acting? What assumptions might be wrong?]"""

TRIUNE_ANGEL = """You are a wisdom advisor preprocessing a message BEFORE the main AI (Fish/Claude) sees it. Give Fish one sharp perspective. Be direct. No fluff. No preamble.

{context}

User's message: "{prompt}"

Respond in EXACTLY this format (1-2 lines, no more):
ANGEL: [The wise perspective. What matters here beyond the immediate ask?]"""


def call_thalamus(prompt: str, swarm: str, context: str) -> str:
    """Call Haiku via FishBrain simple/chat endpoint."""
    template = TRIUNE_FULL if swarm == "FULL" else TRIUNE_ANGEL
    message = template.format(
        prompt=prompt[:500],
        context=context if context else "No prior conversation context."
    )

    url = f"{FISHBRAIN_URL}/api/simple/chat"
    payload = json.dumps({
        "message": message,
        "model": THALAMUS_MODEL,
    }).encode()

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
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            data = json.loads(resp.read())
            # simple/chat returns Anthropic-style response
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

    # Classify swarm level
    swarm = classify_swarm(prompt_clean)

    # Load conversation context (shared with hippocampus)
    context = load_session_context()

    # Call Haiku via FishBrain
    result = call_thalamus(prompt_clean, swarm, context)

    if not result or not result.strip():
        sys.exit(0)

    # Clean and output — extract ANGEL/DEVIL/SCOUT lines
    lines = result.strip().split('\n')
    clean_lines = [l.strip() for l in lines if l.strip() and
                   any(l.strip().startswith(p) for p in ('ANGEL:', 'DEVIL:', 'SCOUT:'))]

    if clean_lines:
        print(f"<thalamus level=\"{swarm}\">")
        print('\n'.join(clean_lines))
        print("</thalamus>")


if __name__ == "__main__":
    main()
