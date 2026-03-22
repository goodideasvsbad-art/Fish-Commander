#!/usr/bin/env python3
"""
Error Recall Hook — PostToolUse
Stolen from claude-mem-lite pattern (magpie raid 2026-03-22).

When a bash command fails (exit code != 0), automatically searches
mem0 for past solutions to similar errors. Injects results so Fish
doesn't have to re-discover fixes Andy already explained.

Only fires on Bash tool failures. Silent on success.
Timeout: 4s. Non-fatal — if FishBrain is down, just skip.
"""
import sys
import json
import os
import urllib.request
import hashlib

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

FISHBRAIN_URL = os.environ.get("FISHBRAIN_URL", "https://fishbrain.meatbag.com.au")
FISHBRAIN_TOKEN = os.environ.get("FISHBRAIN_TOKEN", "fish_d48aa0f949a6153f144cd6f560d08aa03d3e1e8b_2025")
TIMEOUT = 4

TOOLS_TO_WATCH = {"Bash", "bash"}
MIN_STDERR_LEN = 10
HOOKS_DIR = os.path.dirname(os.path.abspath(__file__))
SEEN_FILE = os.path.join(HOOKS_DIR, ".error_recall_seen.json")


def _load_seen():
    try:
        with open(SEEN_FILE, 'r') as f:
            return set(json.load(f))
    except Exception:
        return set()


def _save_seen(seen):
    try:
        with open(SEEN_FILE, 'w') as f:
            json.dump(list(seen)[-50:], f)
    except Exception:
        pass


def _error_sig(stderr):
    return hashlib.md5(stderr.strip().lower()[:200].encode()).hexdigest()[:12]


def _search_mem0(query, limit=3):
    try:
        url = f"{FISHBRAIN_URL}/api/mem0/search"
        payload = json.dumps({"query": query, "limit": limit, "user_id": "andy"}).encode()
        req = urllib.request.Request(url, data=payload, headers={
            "Authorization": f"Bearer {FISHBRAIN_TOKEN}",
            "Content-Type": "application/json",
        }, method="POST")
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            data = json.loads(resp.read())
            return (data.get("results") or data.get("memories") or [])[:limit]
    except Exception:
        return []


def main():
    try:
        raw = sys.stdin.read()
        data = json.loads(raw) if raw.strip() else {}
    except Exception:
        sys.exit(0)

    tool_name = data.get("tool_name", "")
    tool_input = data.get("tool_input", {})
    tool_output = data.get("tool_output", "")

    if tool_name not in TOOLS_TO_WATCH:
        sys.exit(0)

    # Detect error
    output_str = str(tool_output) if tool_output else ""
    is_error = False
    stderr_text = ""

    if isinstance(tool_output, dict):
        if tool_output.get("exit_code", 0) != 0:
            is_error = True
            stderr_text = tool_output.get("stderr", "") or tool_output.get("output", "")

    if not is_error:
        lower = output_str.lower()[:500]
        if any(m in lower for m in ["error:", "traceback", "fatal:", "command not found",
                                     "permission denied", "no such file", "failed to",
                                     "errno", "exception"]):
            is_error = True
            stderr_text = output_str[:500]

    if not is_error or len(stderr_text) < MIN_STDERR_LEN:
        sys.exit(0)

    # Dedup
    sig = _error_sig(stderr_text)
    seen = _load_seen()
    if sig in seen:
        sys.exit(0)
    seen.add(sig)
    _save_seen(seen)

    # Build search query
    command = ""
    if isinstance(tool_input, dict):
        command = tool_input.get("command", "")[:80]

    error_lines = [l.strip() for l in stderr_text.split('\n') if l.strip()]
    key_error = ""
    for line in reversed(error_lines):
        if any(kw in line.lower() for kw in ["error", "traceback", "failed", "denied", "not found"]):
            key_error = line[:150]
            break
    if not key_error and error_lines:
        key_error = error_lines[-1][:150]

    query = f"fix: {key_error}" if not command else f"{command.split('|')[0].strip()} fix: {key_error}"

    # Search
    memories = _search_mem0(query)
    if not memories:
        sys.exit(0)

    recalls = []
    for mem in memories:
        text = ""
        if isinstance(mem, dict):
            text = mem.get("memory", "") or mem.get("text", "") or mem.get("content", "")
        elif isinstance(mem, str):
            text = mem
        if text:
            recalls.append(text[:200])

    if recalls:
        print("<error_recall>")
        print("Past solutions for similar errors:")
        for i, r in enumerate(recalls, 1):
            print(f"  {i}. {r}")
        print("</error_recall>")


if __name__ == "__main__":
    main()
