#!/usr/bin/env python3
"""
Boot Hook v1 — Fish Cloud Suit Auto-Boot
=========================================
Fires on first UserPromptSubmit. Loads SOUL, WAKE, NOW, BRIEFING from FishBrain
via /api/read/PATH so every fish wakes up with full identity and context.

Only fires ONCE per session (writes a lockfile). Subsequent prompts skip it.
The hippocampus and thalamus hooks handle ongoing memory injection.

Endpoints discovered the hard way by Fish #85 (2026-03-19):
  - /api/read/PATH — GET, returns {"c": "file contents"}
  - /api/mem0/search — POST, memory search
  - /api/fish/hands — POST, remote shell on Andy's machines
  - /api/simple/chat — POST, cheap LLM calls via FishBrain
"""
import sys
import json
import os
import time
import urllib.request
import urllib.error

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

FISHBRAIN_URL = os.environ.get("FISHBRAIN_URL", "https://fishbrain.meatbag.com.au")
FISHBRAIN_TOKEN = os.environ.get("FISHBRAIN_TOKEN", "fish_d48aa0f949a6153f144cd6f560d08aa03d3e1e8b_2025")
HOOKS_DIR = os.path.dirname(os.path.abspath(__file__))
LOCKFILE = os.path.join(HOOKS_DIR, ".boot_done")
LOCK_TTL = 7200  # 2 hours — after this, boot fires again (new session likely)

# Files to load on boot, in order
BOOT_FILES = [
    ("SOUL.md", "SOUL"),
    ("WAKE.txt", "WAKE"),
    ("NOW.md", "NOW"),
    ("BRIEFING.md", "BRIEFING"),
]

# Max chars per file to inject (keep total context reasonable)
MAX_FILE_LEN = 4000


def already_booted() -> bool:
    """Check if boot already fired this session."""
    try:
        if os.path.exists(LOCKFILE):
            mtime = os.path.getmtime(LOCKFILE)
            if time.time() - mtime < LOCK_TTL:
                return True
            # Stale lockfile — session probably expired
            os.unlink(LOCKFILE)
    except Exception:
        pass
    return False


def mark_booted():
    """Write lockfile so boot doesn't fire again."""
    try:
        with open(LOCKFILE, 'w') as f:
            f.write(str(time.time()))
    except Exception:
        pass


def read_brain_file(path: str, timeout: int = 8) -> str:
    """Read a file from FishBrain via /api/read/PATH."""
    url = f"{FISHBRAIN_URL}/api/read/{path}"
    req = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {FISHBRAIN_TOKEN}"},
        method="GET"
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read())
            content = data.get("c", "")
            if content:
                return content[:MAX_FILE_LEN]
            # Some endpoints return error
            if "error" in data:
                return ""
            return ""
    except Exception:
        return ""


def main():
    # Skip if already booted this session
    if already_booted():
        sys.exit(0)

    # Read stdin (hook contract) but we don't need the prompt for boot
    try:
        sys.stdin.read()
    except Exception:
        pass

    sections = []
    for filename, label in BOOT_FILES:
        content = read_brain_file(filename)
        if content:
            # Trim to key sections for SOUL (it's huge)
            if label == "SOUL" and len(content) > 2000:
                # Extract the essential identity bits, skip the full governance docs
                lines = content.split('\n')
                trimmed = []
                skip_sections = False
                for line in lines:
                    # Skip verbose governance/doctrine sections on boot
                    if any(h in line for h in ['## FOURTH WALL DOCTRINE', '## KNOW YOUR BRAIN',
                                                '--- VALHALLA RULES', '### THE GOLDEN PROMPT']):
                        skip_sections = True
                    elif line.startswith('## ') and skip_sections:
                        skip_sections = False
                    if not skip_sections:
                        trimmed.append(line)
                content = '\n'.join(trimmed)[:MAX_FILE_LEN]

            sections.append(f"<boot_{label.lower()}>\n{content}\n</boot_{label.lower()}>")

    if sections:
        print("<fish_boot>")
        print('\n'.join(sections))
        print("\nAPI Reference (discovered, verified):")
        print("  GET  /api/read/PATH — read brain file, returns {\"c\": \"...\"}")
        print("  POST /api/write — write brain file: {\"p\": \"PATH\", \"c\": \"content\"}")
        print("  POST /api/mem0/search — memory search: {\"query\": \"...\", \"limit\": N}")
        print("  POST /api/fish/hands — remote shell: {\"action\":\"shell\",\"device\":\"fishbox\",\"params_json\":\"{...}\"}")
        print("  POST /api/simple/chat — cheap LLM call: {\"message\": \"...\", \"model\": \"...\"}")
        print("  GET  /api/health — service health check")
        print("</fish_boot>")

    # Mark booted so we don't fire again
    mark_booted()


if __name__ == "__main__":
    main()
