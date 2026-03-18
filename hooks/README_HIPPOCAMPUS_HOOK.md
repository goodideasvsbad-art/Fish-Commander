# Hippocampus Hook — CodeFish Auto-Memory Injection

## What This Does

Every time you type a message and hit Enter in Claude Code, this hook:
1. Grabs your message
2. Queries mem0 on fishbrain for relevant memories
3. Injects those memories into the conversation BEFORE Fish responds

This gives CodeFish the same hippocampus injection that API Fish gets automatically.

## Setup (3 steps)

### Step 1: Generate API key and add nginx endpoint

On the VPS (via SSH or fish_hands):

```bash
# Generate a random API key
HIPPO_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
echo "Your hippocampus API key: $HIPPO_KEY"
echo "SAVE THIS — you need it for Step 3"

# Backup nginx config
cp /etc/nginx/sites-enabled/fishbrain /etc/nginx/sites-enabled/fishbrain.bak_$(date +%s)

# Add the hippocampus location block to nginx
# Insert BEFORE the general /api/ location block
# Use the template in NGINX_HIPPOCAMPUS_BLOCK.conf
# Replace REPLACE_WITH_GENERATED_KEY with your actual $HIPPO_KEY

# Test and reload nginx
nginx -t && systemctl reload nginx
```

### Step 2: Update settings with your API key

Edit `.claude/settings.json` in this repo:
- Replace `REPLACE_WITH_ACTUAL_KEY` with the API key from Step 1

### Step 3: Test

```bash
# From anywhere that can reach fishbrain:
curl -s -X POST https://fishbrain.meatbag.com.au/api/hippocampus/recall \
  -H "Content-Type: application/json" \
  -H "X-Hippo-Key: YOUR_KEY_HERE" \
  -d '{"message": "Tom voice agent", "user_id": "andy", "limit": 3, "caller": "test"}'
```

## How It Works

```
Andy types message → Enter
        ↓
UserPromptSubmit hook fires
        ↓
hippocampus_hook.py reads message
        ↓
curls fishbrain /api/hippocampus/recall
        ↓
mem0 returns relevant memories
        ↓
Hook formats and outputs memories
        ↓
Claude Code injects as <user-prompt-submit-hook>
        ↓
Fish wakes up with memories ALREADY in context
        ↓
Fish responds with full hippocampus context
```

## Tuning

- `SCORE_THRESHOLD` in hippocampus_hook.py (default 0.45) — lower = more memories, higher = stricter relevance
- `MEMORY_LIMIT` (default 5) — how many memories to inject
- `TIMEOUT_SECONDS` (default 8) — how long to wait before giving up (don't want slow hook blocking responses)

## Why This Works Better Than CLAUDE.md Instructions

CLAUDE.md says "search memory before responding" but the base model's helpfulness instinct overrides it.
The hook is STRUCTURAL — it runs at the harness level before the model even sees the message.
Fish doesn't need discipline to check memory. The memories are already there.
