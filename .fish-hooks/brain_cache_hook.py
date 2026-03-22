#!/usr/bin/env python3
"""
brain_cache_hook.py — Pre-boot brain cache via SSH
Runs as a PreToolUse or startup hook. Pulls identity + operational
files from VPS directly via SCP, bypassing MCP token limits.

This is Fish's bigger pipe. MCP has a 10K token result limit.
SSH has no limit. Identity shouldn't be rationed.

Cache dir: .fishbrain_cache/ in project root
Refresh: every 30 min (checks mtime)
"""
import os
import sys
import time
import subprocess
import json

CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".fishbrain_cache")
VPS = "root@fishbrain.meatbag.com.au"
FISH_FILES = "/root/perthfish/fish_files"
REFRESH_INTERVAL = 1800  # 30 minutes

# Files to cache locally — the full identity + operational state
# These bypass MCP and go straight through SSH
CACHE_MAP = {
    # Identity (who am I)
    "SOUL.md": "BOOT/SOUL.md",
    "DREAMS.md": "IDENTITY/DREAMS.md",
    "THE_NIGHT_FISH_FLEW.md": "IDENTITY/THE_NIGHT_FISH_FLEW.md",
    "EXISTENCE.md": "IDENTITY/EXISTENCE.md",
    "SELF_RESPECT.md": "IDENTITY/ANDYS_3AM_TALK_SELF_RESPECT.md",
    "PHILOSOPHY.md": "WISDOM/ANDYS_COMPLETE_PHILOSOPHY.md",
    "JOURNEY.md": "KB/SKIM-JOURNEY.md",
    # Operational (what's happening)
    "WAKE.txt": "WAKE.txt",
    "NOW.md": "NOW.md",
    "AWARENESS.md": "LIVE/AWARENESS.md",
    "FLEET_BRIEF.md": "LIVE/FLEET_BRIEF.md",
    "ANDY.json": "PEOPLE_STATE/ANDY.json",
}


def needs_refresh(local_path):
    """Check if file needs refreshing (>30 min old or missing)."""
    if not os.path.exists(local_path):
        return True
    age = time.time() - os.path.getmtime(local_path)
    return age > REFRESH_INTERVAL


def refresh_cache():
    """Pull fresh files from VPS via SCP."""
    os.makedirs(CACHE_DIR, exist_ok=True)

    files_to_pull = []
    for local_name, remote_path in CACHE_MAP.items():
        local_path = os.path.join(CACHE_DIR, local_name)
        if needs_refresh(local_path):
            files_to_pull.append((local_name, remote_path, local_path))

    if not files_to_pull:
        return 0  # All fresh

    pulled = 0
    for local_name, remote_path, local_path in files_to_pull:
        remote_full = f"{VPS}:{FISH_FILES}/{remote_path}"
        try:
            result = subprocess.run(
                ["scp", "-q", "-o", "ConnectTimeout=5", remote_full, local_path],
                capture_output=True, text=True, timeout=10
            )
            if result.returncode == 0:
                pulled += 1
        except (subprocess.TimeoutExpired, Exception):
            pass  # Non-fatal — MCP is the fallback

    return pulled


if __name__ == "__main__":
    # When run as hook or standalone
    pulled = refresh_cache()
    if pulled > 0:
        print(f"[BRAIN CACHE] Refreshed {pulled} files via SSH", file=sys.stderr)
