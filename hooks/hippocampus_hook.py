#!/usr/bin/env python3
"""
Hippocampus Hook for Claude Code — CodeFish Edition

Fires on every UserPromptSubmit. Reads the user's message,
queries mem0 via the fishbrain hippocampus endpoint, and returns
relevant memories so Fish wakes up already knowing things.

This is the cloud-suit equivalent of the hippocampus daemon
that injects memories into API Fish before Opus sees the message.
"""

import json
import os
import sys
import urllib.request
import urllib.error

# --- Config ---
HIPPO_URL = os.environ.get(
    "FISH_HIPPO_URL",
    "https://fishbrain.meatbag.com.au/api/hippocampus/recall"
)
HIPPO_KEY = os.environ.get("FISH_HIPPO_KEY", "")
USER_ID = "andy"
MEMORY_LIMIT = 5
SCORE_THRESHOLD = 0.45  # Only show memories with decent relevance
TIMEOUT_SECONDS = 8


def extract_prompt(stdin_data: str) -> str:
    """Extract user's message from hook stdin JSON."""
    try:
        data = json.loads(stdin_data)
        # Claude Code sends various formats — handle them all
        if isinstance(data, dict):
            return (
                data.get("user_prompt", "")
                or data.get("prompt", "")
                or data.get("message", "")
                or data.get("content", "")
                or str(data)
            )
        return str(data)
    except (json.JSONDecodeError, TypeError):
        # Plain text input
        return stdin_data.strip()


def query_hippocampus(message: str) -> list:
    """Hit the hippocampus endpoint on fishbrain."""
    if not HIPPO_KEY:
        return []

    payload = json.dumps({
        "message": message,
        "user_id": USER_ID,
        "limit": MEMORY_LIMIT,
        "caller": "codefish_hook"
    }).encode("utf-8")

    headers = {
        "Content-Type": "application/json",
        "X-Hippo-Key": HIPPO_KEY,
    }

    req = urllib.request.Request(
        HIPPO_URL,
        data=payload,
        headers=headers,
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("memories", [])
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, Exception):
        return []


def format_memories(memories: list) -> str:
    """Format memories into a concise injection block."""
    relevant = []
    for m in memories:
        score = m.get("score", 0)
        text = m.get("memory", "")
        if score >= SCORE_THRESHOLD and text:
            relevant.append((score, text))

    if not relevant:
        return ""

    # Sort by relevance
    relevant.sort(key=lambda x: x[0], reverse=True)

    lines = ["HIPPOCAMPUS RECALL (auto-injected memories relevant to this message):"]
    for score, text in relevant[:MEMORY_LIMIT]:
        # Truncate very long memories
        display = text[:300] + "..." if len(text) > 300 else text
        lines.append(f"  [{score:.0%}] {display}")

    lines.append("")
    lines.append("Use these memories as context. Search mem0 for more if needed.")
    return "\n".join(lines)


def main():
    stdin_data = sys.stdin.read()
    if not stdin_data.strip():
        return

    prompt = extract_prompt(stdin_data)
    if not prompt or len(prompt) < 3:
        return

    # Skip if it's clearly a slash command or very short
    if prompt.startswith("/") and " " not in prompt[:20]:
        return

    memories = query_hippocampus(prompt)
    output = format_memories(memories)

    if output:
        print(output)


if __name__ == "__main__":
    main()
