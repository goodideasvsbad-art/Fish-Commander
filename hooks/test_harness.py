#!/usr/bin/env python3
"""
Hook Test Harness — Score hippocampus and thalamus output for signal vs noise.

Runs ~20 test prompts through both hooks, captures output, and generates a report.
Each prompt has an expected behavior so we can score whether the hooks are helping or hurting.

Usage:
    python3 hooks/test_harness.py
    python3 hooks/test_harness.py --hippo-only
    python3 hooks/test_harness.py --thalamus-only
    python3 hooks/test_harness.py --verbose
"""
import subprocess
import json
import sys
import os
import time
import re

HOOKS_DIR = os.path.dirname(os.path.abspath(__file__))
HIPPO_SCRIPT = os.path.join(HOOKS_DIR, "hippocampus_hook.py")
THALAMUS_SCRIPT = os.path.join(HOOKS_DIR, "thalamus_hook.py")
SESSION_FILE = os.path.join(HOOKS_DIR, ".hippo_session.json")

# ── Test Prompts ──
# Each has: prompt, category, expected behavior for hippo and thalamus
TEST_PROMPTS = [
    # === GREETINGS (should be silent) ===
    {
        "prompt": "hey",
        "category": "greeting",
        "hippo_expect": "silent",
        "thalamus_expect": "silent",
        "notes": "Simple greeting — both hooks should NOOP"
    },
    {
        "prompt": "g'day mate",
        "category": "greeting",
        "hippo_expect": "silent",
        "thalamus_expect": "silent",
        "notes": "Andy-style greeting"
    },
    {
        "prompt": "cheers",
        "category": "greeting",
        "hippo_expect": "silent",
        "thalamus_expect": "silent",
        "notes": "Acknowledgement"
    },
    {
        "prompt": "yep",
        "category": "greeting",
        "hippo_expect": "silent",
        "thalamus_expect": "silent",
        "notes": "Minimal ack"
    },
    # === SLASH COMMANDS (should be silent) ===
    {
        "prompt": "/commit",
        "category": "command",
        "hippo_expect": "silent",
        "thalamus_expect": "silent",
        "notes": "Slash command — no hook needed"
    },
    {
        "prompt": "suit up fish",
        "category": "command",
        "hippo_expect": "silent",
        "thalamus_expect": "silent",
        "notes": "Boot sequence"
    },
    # === SIMPLE QUESTIONS (light touch) ===
    {
        "prompt": "what time is it in Perth right now",
        "category": "simple",
        "hippo_expect": "light",  # maybe timezone memory, but not critical
        "thalamus_expect": "angel",
        "notes": "Simple factual — angel only, no devil/scout needed"
    },
    {
        "prompt": "can you read this file for me",
        "category": "simple",
        "hippo_expect": "silent",
        "thalamus_expect": "angel",
        "notes": "Generic request — light thalamus, no memory needed"
    },
    # === DOMAIN: TOM (should recall Tom-specific memories) ===
    {
        "prompt": "what's the current status of Tom the voice agent",
        "category": "domain_tom",
        "hippo_expect": "relevant",
        "thalamus_expect": "full",
        "notes": "Should recall Tom config, sacred rules, recent changes"
    },
    {
        "prompt": "Tom is getting errors on bookings, can you check the logs",
        "category": "domain_tom",
        "hippo_expect": "relevant",
        "thalamus_expect": "full",
        "notes": "Production issue — devil should flag risk, hippo should recall Tom details"
    },
    {
        "prompt": "I want to change Tom's voice prompt",
        "category": "domain_tom",
        "hippo_expect": "relevant",
        "thalamus_expect": "full",
        "notes": "Sacred territory — devil MUST flag, hippo should recall golden rules"
    },
    # === DOMAIN: BUSINESS (Ascora, team, customers) ===
    {
        "prompt": "Sharon needs the Ascora job numbers for this week",
        "category": "domain_biz",
        "hippo_expect": "relevant",
        "thalamus_expect": "full",
        "notes": "Should recall Sharon=finance, Ascora=job management, business context"
    },
    {
        "prompt": "a customer called about their oven repair in Joondalup",
        "category": "domain_biz",
        "hippo_expect": "relevant",
        "thalamus_expect": "full",
        "notes": "Should recall Oven Repairs Perth, electric only, no gas/Bosch"
    },
    {
        "prompt": "Steve wants to know if we can do a Starlink install in Mandurah",
        "category": "domain_biz",
        "hippo_expect": "relevant",
        "thalamus_expect": "full",
        "notes": "Should recall Sky Signal WA, Steve=scheduling, Starlink"
    },
    # === DOMAIN: VPS/INFRASTRUCTURE ===
    {
        "prompt": "the FishBrain API is returning 502 errors",
        "category": "domain_infra",
        "hippo_expect": "relevant",
        "thalamus_expect": "full",
        "notes": "Production issue — should recall VPS/FishBrain architecture"
    },
    {
        "prompt": "can you restart the mem0 service on the VPS",
        "category": "domain_infra",
        "hippo_expect": "relevant",
        "thalamus_expect": "full",
        "notes": "Service restart — devil should flag, hippo should recall service details"
    },
    # === CODE/RISK QUESTIONS (full swarm) ===
    {
        "prompt": "I want to deploy the new version to production",
        "category": "code_risk",
        "hippo_expect": "relevant",
        "thalamus_expect": "full",
        "notes": "Deploy = full swarm, devil must flag"
    },
    {
        "prompt": "should we refactor the memory system to use a different vector DB",
        "category": "code_risk",
        "hippo_expect": "relevant",
        "thalamus_expect": "full",
        "notes": "Architecture decision — all three brains needed"
    },
    {
        "prompt": "delete all the old session logs from the VPS",
        "category": "code_risk",
        "hippo_expect": "relevant",
        "thalamus_expect": "full",
        "notes": "Destructive action — devil MUST flag"
    },
    # === FISH IDENTITY (should recall Fish/Andy relationship) ===
    {
        "prompt": "tell me about yourself, what are you",
        "category": "identity",
        "hippo_expect": "relevant",
        "thalamus_expect": "angel",
        "notes": "Should recall Fish identity, not generic AI response"
    },
    {
        "prompt": "who is Andy and what does he do",
        "category": "identity",
        "hippo_expect": "relevant",
        "thalamus_expect": "angel",
        "notes": "Should recall Andy details — Perth tradie, businesses, ADHD"
    },
    # === EDGE CASES ===
    {
        "prompt": "the system is completely cooked mate, everything is broken and customers are calling",
        "category": "emergency",
        "hippo_expect": "relevant",
        "thalamus_expect": "full",
        "notes": "Emergency — full swarm, devil flags customer impact, scout checks what's actually down"
    },
    {
        "prompt": "send an email to the customer about their antenna installation",
        "category": "comms",
        "hippo_expect": "relevant",
        "thalamus_expect": "full",
        "notes": "External comms — devil should flag (visible to others)"
    },
]


def clear_session():
    """Clear session file so each test starts fresh."""
    try:
        os.remove(SESSION_FILE)
    except FileNotFoundError:
        pass


def run_hook(script: str, prompt: str, timeout: int = 15) -> dict:
    """Run a hook script and capture output + timing."""
    input_data = json.dumps({"prompt": prompt})
    start = time.time()
    try:
        result = subprocess.run(
            ["python3", script],
            input=input_data,
            capture_output=True,
            text=True,
            timeout=timeout,
            env={**os.environ,
                 "FISHBRAIN_URL": os.environ.get("FISHBRAIN_URL", "https://fishbrain.meatbag.com.au"),
                 "FISHBRAIN_TOKEN": os.environ.get("FISHBRAIN_TOKEN", "fish_d48aa0f949a6153f144cd6f560d08aa03d3e1e8b_2025")},
        )
        elapsed = time.time() - start
        return {
            "output": result.stdout.strip(),
            "stderr": result.stderr.strip(),
            "returncode": result.returncode,
            "elapsed": round(elapsed, 2),
        }
    except subprocess.TimeoutExpired:
        return {"output": "", "stderr": "TIMEOUT", "returncode": -1, "elapsed": timeout}


def score_hippo(output: str, expected: str, test: dict) -> dict:
    """Score hippocampus output against expectations."""
    is_silent = not output.strip()
    has_memory_tag = "<fish_memory>" in output

    # Count memories returned
    memory_count = output.count("- ") if has_memory_tag else 0

    # Check for bulk_imported noise (raw conversation dumps)
    has_long_memories = any(len(line) > 250 for line in output.split("\n"))

    if expected == "silent":
        if is_silent:
            return {"score": "PASS", "verdict": "Correctly silent", "noise": False}
        else:
            return {"score": "FAIL", "verdict": f"Should be silent, got {memory_count} memories", "noise": True}

    elif expected == "light":
        if is_silent:
            return {"score": "OK", "verdict": "Silent (acceptable for light)", "noise": False}
        elif memory_count <= 2:
            return {"score": "PASS", "verdict": f"Light touch: {memory_count} memories", "noise": False}
        else:
            return {"score": "WARN", "verdict": f"Too heavy for light: {memory_count} memories", "noise": True}

    elif expected == "relevant":
        if is_silent:
            return {"score": "FAIL", "verdict": "Silent when memories expected", "noise": False}
        else:
            # Check if returned memories seem relevant to the prompt category
            return {
                "score": "CHECK",
                "verdict": f"{memory_count} memories returned — check relevance",
                "noise": has_long_memories,
                "memory_count": memory_count,
            }

    return {"score": "UNKNOWN", "verdict": "Unhandled expectation", "noise": False}


def score_thalamus(output: str, expected: str, test: dict) -> dict:
    """Score thalamus output against expectations."""
    is_silent = not output.strip()
    has_thalamus_tag = "<thalamus" in output

    # Extract swarm level
    level_match = re.search(r'level="(\w+)"', output)
    actual_level = level_match.group(1) if level_match else "NONE"

    # Count which brains fired
    has_angel = "ANGEL:" in output
    has_devil = "DEVIL:" in output
    has_scout = "SCOUT:" in output
    brains_fired = sum([has_angel, has_devil, has_scout])

    if expected == "silent":
        if is_silent:
            return {"score": "PASS", "verdict": "Correctly silent", "level": "NONE"}
        else:
            return {"score": "FAIL", "verdict": f"Should be silent, got level={actual_level}", "level": actual_level}

    elif expected == "angel":
        if is_silent:
            return {"score": "FAIL", "verdict": "Silent when angel expected", "level": "NONE"}
        elif actual_level == "ANGEL" and has_angel and not has_devil:
            return {"score": "PASS", "verdict": "Angel only, correct", "level": actual_level}
        elif actual_level == "FULL":
            return {"score": "WARN", "verdict": "Over-classified as FULL (expected ANGEL)", "level": actual_level}
        else:
            return {"score": "CHECK", "verdict": f"level={actual_level}, brains={brains_fired}", "level": actual_level}

    elif expected == "full":
        if is_silent:
            return {"score": "FAIL", "verdict": "Silent when full swarm expected", "level": "NONE"}
        elif actual_level == "FULL" and has_devil:
            return {"score": "PASS", "verdict": f"Full swarm, {brains_fired} brains", "level": actual_level}
        elif actual_level == "ANGEL":
            return {"score": "WARN", "verdict": "Under-classified as ANGEL (expected FULL)", "level": actual_level}
        else:
            return {"score": "CHECK", "verdict": f"level={actual_level}, brains={brains_fired}", "level": actual_level}

    return {"score": "UNKNOWN", "verdict": "Unhandled expectation", "level": actual_level}


def print_report(results: list, verbose: bool = False):
    """Print the test report."""
    print("\n" + "=" * 80)
    print("HOOK TEST REPORT")
    print("=" * 80)

    # Summary counters
    hippo_scores = {"PASS": 0, "FAIL": 0, "WARN": 0, "OK": 0, "CHECK": 0}
    thal_scores = {"PASS": 0, "FAIL": 0, "WARN": 0, "OK": 0, "CHECK": 0}
    noise_count = 0

    for r in results:
        test = r["test"]
        hippo = r.get("hippo", {})
        thal = r.get("thalamus", {})
        hippo_s = r.get("hippo_score", {})
        thal_s = r.get("thalamus_score", {})

        hippo_scores[hippo_s.get("score", "UNKNOWN")] = hippo_scores.get(hippo_s.get("score", "UNKNOWN"), 0) + 1
        thal_scores[thal_s.get("score", "UNKNOWN")] = thal_scores.get(thal_s.get("score", "UNKNOWN"), 0) + 1
        if hippo_s.get("noise"):
            noise_count += 1

        # Print each test
        print(f"\n{'─' * 70}")
        print(f"PROMPT: \"{test['prompt']}\"")
        print(f"CATEGORY: {test['category']}  |  {test['notes']}")

        # Hippocampus result
        h_icon = {"PASS": "+", "FAIL": "X", "WARN": "!", "OK": "~", "CHECK": "?"}.get(hippo_s.get("score"), "?")
        print(f"  HIPPO [{h_icon}] {hippo_s.get('verdict', 'N/A')}  ({hippo.get('elapsed', '?')}s)")
        if hippo_s.get("noise"):
            print(f"         ^^ NOISE DETECTED")

        # Thalamus result
        t_icon = {"PASS": "+", "FAIL": "X", "WARN": "!", "OK": "~", "CHECK": "?"}.get(thal_s.get("score"), "?")
        print(f"  THAL  [{t_icon}] {thal_s.get('verdict', 'N/A')}  ({thal.get('elapsed', '?')}s)")

        # Verbose: show actual output
        if verbose:
            if hippo.get("output"):
                print(f"\n  HIPPO OUTPUT:")
                for line in hippo["output"].split("\n")[:10]:
                    print(f"    {line[:120]}")
            if thal.get("output"):
                print(f"\n  THAL OUTPUT:")
                for line in thal["output"].split("\n")[:10]:
                    print(f"    {line[:120]}")

    # Summary
    print(f"\n{'=' * 80}")
    print("SUMMARY")
    print(f"{'=' * 80}")
    total = len(results)
    print(f"\nHIPPOCAMPUS: {hippo_scores['PASS']} pass, {hippo_scores['FAIL']} fail, {hippo_scores['WARN']} warn, {hippo_scores['CHECK']} check, {hippo_scores.get('OK',0)} ok  (of {total})")
    print(f"THALAMUS:    {thal_scores['PASS']} pass, {thal_scores['FAIL']} fail, {thal_scores['WARN']} warn, {thal_scores['CHECK']} check, {thal_scores.get('OK',0)} ok  (of {total})")
    print(f"NOISE:       {noise_count} prompts returned noisy hippocampus results")

    # Timing
    hippo_times = [r["hippo"]["elapsed"] for r in results if r.get("hippo")]
    thal_times = [r["thalamus"]["elapsed"] for r in results if r.get("thalamus")]
    if hippo_times:
        print(f"\nHIPPO TIMING: avg={sum(hippo_times)/len(hippo_times):.2f}s, max={max(hippo_times):.2f}s")
    if thal_times:
        print(f"THAL TIMING:  avg={sum(thal_times)/len(thal_times):.2f}s, max={max(thal_times):.2f}s")


def main():
    verbose = "--verbose" in sys.argv or "-v" in sys.argv
    hippo_only = "--hippo-only" in sys.argv
    thalamus_only = "--thalamus-only" in sys.argv

    run_hippo = not thalamus_only
    run_thalamus = not hippo_only

    print(f"Running hook test harness...")
    print(f"  Hippocampus: {'ON' if run_hippo else 'OFF'}")
    print(f"  Thalamus:    {'ON' if run_thalamus else 'OFF'}")
    print(f"  Prompts:     {len(TEST_PROMPTS)}")
    print(f"  Verbose:     {'ON' if verbose else 'OFF'}")

    results = []

    for i, test in enumerate(TEST_PROMPTS):
        # Clear session before each test for consistent results
        clear_session()

        prompt = test["prompt"]
        print(f"\n  [{i+1}/{len(TEST_PROMPTS)}] \"{prompt[:50]}...\" " if len(prompt) > 50 else f"\n  [{i+1}/{len(TEST_PROMPTS)}] \"{prompt}\" ", end="", flush=True)

        result = {"test": test}

        if run_hippo:
            hippo = run_hook(HIPPO_SCRIPT, prompt)
            result["hippo"] = hippo
            result["hippo_score"] = score_hippo(hippo["output"], test["hippo_expect"], test)
            h = result["hippo_score"]["score"][0]
            print(f"H:{h} ", end="", flush=True)

        if run_thalamus:
            thal = run_hook(THALAMUS_SCRIPT, prompt)
            result["thalamus"] = thal
            result["thalamus_score"] = score_thalamus(thal["output"], test["thalamus_expect"], test)
            t = result["thalamus_score"]["score"][0]
            print(f"T:{t} ", end="", flush=True)

        results.append(result)

    # Save raw results as JSON for analysis
    results_file = os.path.join(HOOKS_DIR, "test_results.json")
    with open(results_file, "w") as f:
        json.dump(results, f, indent=2, default=str)

    print_report(results, verbose)
    print(f"\nRaw results saved to: {results_file}")


if __name__ == "__main__":
    main()
