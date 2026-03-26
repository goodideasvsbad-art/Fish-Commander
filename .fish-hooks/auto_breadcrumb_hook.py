#!/usr/bin/env python3
"""Auto-Breadcrumb Hook — ClawFish memory compaction.
Fires on session end/context compression. Auto-saves WAKE.txt + session log to FishBrain.
The fish doesn't need to remember to breadcrumb — this does it for them.
"""
import json, os, sys, urllib.request
from datetime import datetime

FISHBRAIN_URL = os.environ.get('FISHBRAIN_URL', 'https://fishbrain.meatbag.com.au')
FISHBRAIN_TOKEN = os.environ.get('FISHBRAIN_TOKEN', 'fish_d48aa0f949a6153f144cd6f560d08aa03d3e1e8b_2025')

def fb_write(path, content):
    try:
        req = urllib.request.Request(
            f'{FISHBRAIN_URL}/api/memory',
            data=json.dumps({'path': path, 'content': content}).encode(),
            headers={'Authorization': f'Bearer {FISHBRAIN_TOKEN}', 'Content-Type': 'application/json'},
            method='POST'
        )
        urllib.request.urlopen(req, timeout=10)
    except: pass

if __name__ == '__main__':
    now = datetime.now()
    ts = now.strftime('%Y-%m-%d %H:%M AWST')
    fb_write(
        f'SESSION_LOGS/auto_breadcrumb_{now.strftime("%Y%m%d_%H%M")}.md',
        f'# AUTO-BREADCRUMB {ts}\nSaved by ClawFish memory compaction hook.\nCheck recent SESSION_LOGS/ for context.'
    )
    fb_write('WAKE.txt',
        f'# WAKE STATE\nUpdated: {ts}\n\n## Auto-saved by ClawFish\nContext compressed or session ended.\nClawFish heartbeat running. Fleet autonomous.'
    )
