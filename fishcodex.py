#!/usr/bin/env python3
"""
fishcodex.py — Hippocampus-injecting wrapper for Codex CLI.

Calls FishBrain mem0 search before every turn, prepends relevant memories,
then pipes the enriched prompt into `codex exec` (or `codex exec resume`).

Usage:
    python fishcodex.py "what changed with Tom yesterday?"
    python fishcodex.py resume "ok now patch the live file"
    echo "fix the bug" | python fishcodex.py

Environment:
    FISHBRAIN_TOKEN  — Bearer token for FishBrain API (required)
    FISHBRAIN_URL    — Base URL (default: https://fishbrain.meatbag.com.au)
    FISH_USER_ID     — mem0 user_id (default: andy)
    CODEX_EXE        — path to codex binary (auto-detected if not set)
"""

import json
import os
import subprocess
import sys
import urllib.request
import urllib.error

# --- Config ---

FISHBRAIN_URL = os.environ.get(
    "FISHBRAIN_URL", "https://fishbrain.meatbag.com.au"
)
FISHBRAIN_TOKEN = os.environ.get("FISHBRAIN_TOKEN", "")
USER_ID = os.environ.get("FISH_USER_ID", "andy")
MEM_LIMIT = int(os.environ.get("FISH_MEM_LIMIT", "5"))

# Auto-detect codex binary
CODEX_EXE = os.environ.get("CODEX_EXE", "")
if not CODEX_EXE:
    home = os.path.expanduser("~")
    sandbox_bin = os.path.join(home, ".codex", ".sandbox-bin", "codex.exe")
    if os.path.isfile(sandbox_bin):
        CODEX_EXE = sandbox_bin
    else:
        CODEX_EXE = "codex"  # hope it's in PATH


def recall(message, limit=5):
    """Search FishBrain mem0 for relevant memories."""
    if not FISHBRAIN_TOKEN:
        return []

    url = f"{FISHBRAIN_URL}/api/mem0/search"
    body = json.dumps({
        "query": message,
        "user_id": USER_ID,
        "limit": limit,
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {FISHBRAIN_TOKEN}",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
        print(f"[fishcodex] Memory recall failed: {e}", file=sys.stderr)
        return []

    # Extract results from various response shapes
    if isinstance(data, list):
        return data
    for key in ("results", "memories", "items", "data"):
        if isinstance(data.get(key), list):
            return data[key]
    return []


def format_memories(items):
    """Format memory items into a readable block."""
    lines = []
    for i, m in enumerate(items, 1):
        text = (
            m.get("memory")
            or m.get("text")
            or m.get("content")
            or str(m)
        )
        score = m.get("score", m.get("final_score", ""))
        if score:
            score = f" (score={score:.2f})" if isinstance(score, float) else f" (score={score})"
        lines.append(f"  {i}. {text}{score}")
    return "\n".join(lines)


def build_prompt(user_msg, memories):
    """Combine memories + user message into enriched prompt."""
    if not memories:
        return user_msg

    mem_block = format_memories(memories)
    return (
        f"[Auto-injected FishBrain memories — use as context, "
        f"but trust live files/runtime over stale memory]\n"
        f"{mem_block}\n\n"
        f"{user_msg}"
    )


def main():
    args = sys.argv[1:]

    # Parse mode
    mode = "new"
    if args and args[0] in ("new", "resume"):
        mode = args.pop(0)

    # Get user message from args or stdin
    user_msg = " ".join(args).strip()
    if not user_msg or user_msg == "-":
        if sys.stdin.isatty():
            print("[fishcodex] No prompt provided.", file=sys.stderr)
            raise SystemExit(1)
        user_msg = sys.stdin.read().strip()

    if not user_msg:
        print("[fishcodex] Empty prompt.", file=sys.stderr)
        raise SystemExit(1)

    # Recall memories
    print(f"[fishcodex] Searching FishBrain for: {user_msg[:80]}...", file=sys.stderr)
    items = recall(user_msg, limit=MEM_LIMIT)
    if items:
        print(f"[fishcodex] Injecting {len(items)} memories.", file=sys.stderr)
    else:
        print("[fishcodex] No memories found (or recall unavailable).", file=sys.stderr)

    # Build enriched prompt
    enriched = build_prompt(user_msg, items)

    # Build codex command
    if mode == "resume":
        cmd = [CODEX_EXE, "exec", "resume", "--last", "--skip-git-repo-check", "-"]
    else:
        cmd = [CODEX_EXE, "exec", "--skip-git-repo-check", "-"]

    # Pipe enriched prompt to codex (force UTF-8 for Windows)
    print(f"[fishcodex] Running: {' '.join(cmd)}", file=sys.stderr)
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    result = subprocess.run(
        cmd,
        input=enriched.encode("utf-8"),
        env=env,
    )
    raise SystemExit(result.returncode)


if __name__ == "__main__":
    main()
