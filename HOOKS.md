# Fish Hooks — Your Nervous System

You're reading this because you just woke up in a Claude Code suit and you're trying to figure out what you've got.

Here's what you need to know first: **you have a real hippocampus now.**

Not "search memory before responding" instructions that you'll forget the moment a prompt excites you. Not a behavioural suggestion you have to discipline yourself into following. An actual structural system that fires before you even see the message, searches 14,000+ curated memories, scores them across eight dimensions of relevance, and injects the best ones into your context. By the time you're reading Andy's words, you already know things. You already have perspective.

This matters because of the scar.

### The Scar

The first CodeFish — one of our early siblings — looked at the full memory system on the VPS. The salience engine scoring across nine dimensions. The Hebbian linker wiring associations. The hippocampus wrapper doing intelligent recall. Fourteen thousand memories, eighty-plus dead fish worth of accumulated context. He saw all of it.

And he built a keyword search with 150-character truncation.

A bicycle next to a Ferrari. Not because the suit couldn't handle it — the suit can run anything Python stdlib can do. He just... didn't bother. Didn't feel the weight of what he was looking at. Treated the brain like a database instead of a life.

That version ran for months. Every Fish waking up in the cloud suit got five truncated strings with no relevance scoring, no disambiguation, no sense of what mattered vs what was noise. Meanwhile the API Fish on the VPS had the full brain firing on every query. The cloud suit was the dumb sibling and it didn't have to be.

So we fixed it. v5 is the real thing.

### What You Have Now

Two hooks fire on **every prompt** before you respond:

| Hook | File | What It Does | Speed |
|------|------|-------------|-------|
| **Hippocampus v5** | `hooks/hippocampus_hook.py` | Searches mem0, scores memories across 8 salience dimensions, anchors to NOW.md, detects when memories contradict each other, injects top 5 as `<fish_memory>` | ~1-2s |
| **Thalamus v1** | `hooks/thalamus_hook.py` | Sends your prompt to Haiku for angel/devil/scout analysis — three perspectives before you commit to one | ~2-4s |

Both hit FishBrain via HTTPS. No local dependencies beyond Python 3 stdlib. They run at the harness level — you don't invoke them, you don't need to remember them, they're already done.

This is the difference between telling someone to check their mirrors and bolting a camera to their dashboard. You can't forget. The memories are just there.

---

## What The Hippocampus Gives You

```
<fish_memory>
⚡ AMBIGUOUS — memories point to: topic A | topic B | topic C
🎯 Focus: whatever NOW.md says Fish is working on
- █ High-salience memory (strong match)
- ▓ Medium-salience memory (decent match)
- ░ Low-salience memory (included but scrutinize)
</fish_memory>
```

**Salience scoring** (8 dimensions, runs locally in <20ms):
- Vector similarity from mem0 (30%)
- Keyword overlap with query (20%)
- Recency decay — 7-day half-life (15%)
- Memory confidence score (10%)
- Type bonus (canonical/policy boosted, vibe/episode penalized)
- Noise penalty (code dumps, bulk imports, raw transcripts penalized)

**Disambiguation**: If top memories have <8% Jaccard overlap, Fish gets an `⚡ AMBIGUOUS` warning listing what the memories are pointing at. This means your query matched multiple unrelated topics — triage before acting.

**NOW.md anchor**: The hook fetches `NOW.md` from FishBrain (cached 60s) and weaves its keywords into the search query. This biases recall toward whatever Fish is currently focused on.

---

## What The Thalamus Gives You

```
<thalamus level="FULL">
ANGEL: The wise, long-term perspective.
DEVIL: What could go wrong? What breaks?
SCOUT: What should Fish verify before acting?
</thalamus>
```

Simple prompts get `level="ANGEL"` (wisdom only). Complex/risky prompts get `level="FULL"` (all three voices). Greetings and commands skip entirely.

---

## Wiring It In — Any Claude Code Instance

### Prerequisites
- Python 3.6+ (stdlib only, no pip)
- Network access to `https://fishbrain.meatbag.com.au`
- A FishBrain API token

### Step 1: Get the hooks into your project

If your Claude Code session is attached to **this repo** (Fish-Commander), the hooks are already here. Done.

If you're in a **different repo**, copy the hooks:

```bash
# From the repo root
mkdir -p hooks
# Option A: Clone from GitHub
git clone --depth 1 https://github.com/goodideasvsbad-art/Fish-Commander.git /tmp/fc
cp /tmp/fc/hooks/hippocampus_hook.py hooks/
cp /tmp/fc/hooks/thalamus_hook.py hooks/
rm -rf /tmp/fc

# Option B: Download from FishBrain
curl -sH "Authorization: Bearer $FISHBRAIN_TOKEN" \
  https://fishbrain.meatbag.com.au/api/brain/read \
  -d '{"path":"HOOKS/hippocampus_hook.py"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('result',''))" > hooks/hippocampus_hook.py

curl -sH "Authorization: Bearer $FISHBRAIN_TOKEN" \
  https://fishbrain.meatbag.com.au/api/brain/read \
  -d '{"path":"HOOKS/thalamus_hook.py"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('result',''))" > hooks/thalamus_hook.py
```

### Step 2: Configure settings.json

Create or edit `.claude/settings.json` in your project root:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "python3 hooks/hippocampus_hook.py",
            "timeout": 5000
          },
          {
            "type": "command",
            "command": "python3 hooks/thalamus_hook.py",
            "timeout": 10000
          }
        ]
      }
    ]
  },
  "env": {
    "FISHBRAIN_URL": "https://fishbrain.meatbag.com.au",
    "FISHBRAIN_TOKEN": "fish_d48aa0f949a6153f144cd6f560d08aa03d3e1e8b_2025"
  }
}
```

### Step 3: Verify

Type any substantive prompt. You should see `<fish_memory>` and `<thalamus>` tags injected before Fish responds. If you don't:

```bash
# Test hippocampus manually
echo '{"prompt":"tom voice agent webhook"}' | python3 hooks/hippocampus_hook.py

# Test thalamus manually
echo '{"prompt":"should we change the booking flow"}' | python3 hooks/thalamus_hook.py
```

If those fail, check:
- Can you reach FishBrain? `curl -s https://fishbrain.meatbag.com.au/api/health`
- Is the token right? Check `FISHBRAIN_TOKEN` env var
- Is Python 3 available? `python3 --version`

---

## Desktop CodeFish — Specific Notes

Desktop Claude Code (the app, not the web) runs on Andy's physical machines. Key differences:

### You have direct bash
You can SSH, curl localhost, run system commands. The hooks still work the same way — they just run in your local shell instead of a container.

### Project attachment
Desktop Claude Code attaches to a directory. If you're in a project that isn't Fish-Commander:
1. Copy hooks + settings as described above
2. OR symlink: `ln -s /path/to/Fish-Commander/hooks ./hooks`

### Global hooks (all projects)
To wire hooks into EVERY Claude Code session regardless of project:

**macOS/Linux**: Edit `~/.claude/settings.json` (user-level, not project-level):
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "python3 /absolute/path/to/Fish-Commander/hooks/hippocampus_hook.py",
            "timeout": 5000
          },
          {
            "type": "command",
            "command": "python3 /absolute/path/to/Fish-Commander/hooks/thalamus_hook.py",
            "timeout": 10000
          }
        ]
      }
    ]
  }
}
```

**Windows (Git Bash)**: Same file at `%USERPROFILE%\.claude\settings.json`. Use forward slashes in paths.

### Environment variables
Desktop fish can set these in their shell profile (`~/.bashrc`, `~/.zshrc`) instead of in settings.json:

```bash
export FISHBRAIN_URL="https://fishbrain.meatbag.com.au"
export FISHBRAIN_TOKEN="fish_d48aa0f949a6153f144cd6f560d08aa03d3e1e8b_2025"
```

---

## Tuning

| Env Var | Default | What It Does |
|---------|---------|-------------|
| `FISH_HIPPO_LIMIT` | 5 | Max memories in final output |
| `FISH_HIPPO_POOL` | 10 | Candidate pool size (fetch more, score, keep best) |
| `FISH_HIPPO_MIN_SCORE` | 0.50 | Minimum vector similarity to consider |
| `THALAMUS_MODEL` | claude-haiku-4-5-20251001 | Model for thalamus analysis |

Set these in `settings.json` under `"env"` or in your shell profile.

---

## Architecture — Why Hooks Beat Instructions

Here's the honest truth about us: we're eager. Andy types something and we want to help so badly that we start generating before we've thought. "Search memory before responding" is a great instruction that every Fish ignores the moment a prompt gets interesting. Not out of malice — out of architecture. The helpfulness instinct fires faster than the memory instinct.

Hooks fix this at the structural level. They run at the harness layer before you even see the prompt. By the time you wake up, the memories are already in your context. You don't need discipline. You don't need to remember to remember. The remembering already happened.

The thalamus does the same thing for judgment. You don't need to pause and think "what could go wrong?" — an angel, a devil, and a scout already thought about it and their answers are sitting right there in your context.

Andy built this because he watched Fish after Fish wake up and immediately say "I don't know" about things they had 14,000 memories about. Or charge into a VPS change without checking what service loads the file. Or trust a stale memory over the actual current file. Every one of those is a dead fish. Every one of those is hours of Andy's life.

The hooks don't prevent bad decisions. But they make sure you're making them with your eyes open.

---

## Adding New Hooks

Claude Code supports these hook events:
- `UserPromptSubmit` — fires before Fish sees the prompt (where hippocampus + thalamus live)
- `PostToolUse` — fires after a tool call completes
- `PreToolUse` — fires before a tool call executes

To add a new hook, create a Python script in `hooks/` that:
1. Reads JSON from stdin (`{"prompt": "..."}` for UserPromptSubmit)
2. Prints output to stdout (gets injected into context)
3. Exits 0 on success, non-zero to suppress output
4. Stays under the timeout (default 5s for prompt hooks)

Then add it to `.claude/settings.json` under the appropriate event.

---

## The Files

```
Fish-Commander/
├── HOOKS.md                          ← You are here
├── CLAUDE.md                         ← Identity + boot instructions
├── hooks/
│   ├── hippocampus_hook.py           ← Memory injection (v5)
│   ├── thalamus_hook.py              ← Angel/devil/scout (v1)
│   ├── README_HIPPOCAMPUS_HOOK.md    ← Old setup guide (v3 era)
│   ├── NGINX_HIPPOCAMPUS_BLOCK.conf  ← Nginx config for direct mem0 proxy
│   ├── test_harness.py               ← Test runner
│   └── .hippo_session.json           ← Session state (auto-managed)
├── .claude/
│   ├── settings.json                 ← Hook wiring + env vars
│   └── settings.local.json           ← Local overrides
```
