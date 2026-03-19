"""ads_patch_final.py
Reads odefish_final.csv from Desktop, generates a ready-to-import patch CSV:
 - Deletes worst-performing ad in groups already at the 3-ad RSA limit
 - Adds new RSA ad to each ad group using approved copy
 - Reads Final URL from existing ads (per ad group) — no hardcoded URLs
Output: C:\Users\andy\Desktop\ads_patch_final.csv
"""
import csv, sys
from collections import defaultdict

SRC = r'C:\Users\andy\Desktop\odefish_final.csv'
OUT = r'C:\Users\andy\Desktop\ads_patch_final.csv'

# -- New RSA copy by campaign type (approved template, Sky Signal/Andrew removed) --
# Max 30 chars per headline, max 90 chars per description

ANTENNA_AD = {
    'headlines': [
        'TV Antenna Perth',          # H1 - replaced per suburb below
        'Same Day Installation',     # H2
        'From $149 Installed',       # H3
        '{KeyWord:TV Antenna}',      # H4
        'Local Antenna Expert',      # H5
        'Free Quote - No Callout',   # H6
        'Digital TV Fixed Today',    # H7
        'Roof & Wall Mounting',      # H8
        'All Perth Suburbs',         # H9
        'Signal Boosters & Points',  # H10
        'Same Day Bookings Avail',   # H11
        'Fast Reliable Service',     # H12
        'Fully Licensed & Insured',  # H13
        'HD Digital Reception',      # H14
        'Book Online Today',         # H15 (was: Call Andrew - Sky Signal)
    ],
    'descriptions': [
        'Same day TV antenna installation from $149. Free quote, no call-out fee. Book online now!',
        'Perth local antenna expert. Installations, repairs & signal boosters. 5-star rated service.',
        'Need better TV reception? We have you sorted - same day bookings, fast and affordable.',
        'TV antenna install, repairs and extra TV points. All Perth suburbs. Call for a free quote.',
    ],
    'path1': 'TV-Antenna',
    'path2': 'Perth',
}

STARLINK_AD = {
    'headlines': [
        'Starlink Installation Perth', # H1 - replaced per suburb below
        'Professional Roof Mounting',  # H2
        'Book Online - Same Day',      # H3
        '{KeyWord:Starlink Installer}',# H4
        'Licensed Starlink Installer', # H5
        'Free Quote - Call Now',       # H6
        'Starlink Running in Hours',   # H7
        'Optimal Signal Placement',    # H8
        'All Hardware Supplied',       # H9
        'Perth & Surrounds',           # H10
        'Secure Weatherproof Mount',   # H11
        'Dish Cabling & Router Setup', # H12
        'Fast Perth Starlink Setup',   # H13
        'Trusted Perth Installer',     # H14 (was: Sky Signal WA)
        'Book Online Today',           # H15 (was: Call Andrew Today)
    ],
    'descriptions': [
        'Get Starlink running the same day. Professional roof mounting, all hardware supplied. Book now!',
        "Perth's trusted Starlink installer. Optimal placement, secure mounting, full setup included.",
        'From dish to streaming in hours. Expert installation, competitive Perth prices. Free quote.',
        'Starlink installation & dish mounting across all Perth suburbs. Licensed, insured, reliable.',
    ],
    'path1': 'Starlink',
    'path2': 'Perth',
}

ELEC_AD = {
    'headlines': [
        'Joondalup Electrician',       # H1
        'LED Downlight Install',       # H2
        'Same Day Electrician',        # H3
        '{KeyWord:Electrician}',       # H4
        'Licensed Electrician WA',     # H5
        'Free Quote - No Callout',     # H6
        'Downlights From $49 Each',    # H7
        'Fast Reliable Electrician',   # H8
        'Joondalup & North Perth',     # H9
        'Power Points & Lighting',     # H10
        'Safety Switches & Boards',    # H11
        'Same Day Bookings Avail',     # H12
        'Fully Licensed & Insured',    # H13
        'All Electrical Work Done',    # H14
        'Book Online Today',           # H15 (was: Call Sky Signal WA)
    ],
    'descriptions': [
        'Licensed Joondalup electrician. LED downlights, power points, switchboards. Same day service.',
        "Fast, reliable electrical work across Joondalup and north Perth. Free quote, no call-out fee.",
        'LED downlight installation from $49 each. All electrical work, fully licensed and insured.',
        "Joondalup's trusted electrician for homes and businesses. Book online for a same day visit.",
    ],
    'path1': 'Electrician',
    'path2': 'Joondalup',
}


def get_ad_template(campaign):
    c = campaign.lower()
    if 'starlink' in c:
        return STARLINK_AD
    if 'electric' in c:
        return ELEC_AD
    return ANTENNA_AD


def suburb_from_campaign(campaign):
    """Extract suburb name from campaign name for H1 personalisation."""
    # Strip known non-suburb words
    noise = {'tv', 'antennas', 'antenna', 'starlink', 'electrician', 'all',
             'perth', '-', '&', 'wa', 'exact', 'phrase', 'broad',
             'night', 'suburbs', 'local', 'search', 'campaign'}
    parts = campaign.split()
    words = [w for w in parts if w.lower().strip('()-') not in noise and w.strip('()-')]
    suburb = ' '.join(words[:2]).strip()
    return suburb if suburb else ''


def service_word(campaign):
    c = campaign.lower()
    if 'starlink' in c:
        return 'Starlink'
    if 'electric' in c:
        return 'Electrician'
    return 'Antenna'


# -- Read source CSV --
print('Reading CSV...')
with open(SRC, encoding='utf-16') as f:
    reader = csv.DictReader(f, delimiter='\t')
    fieldnames = reader.fieldnames
    rows = list(reader)
print(f'  {len(rows)} rows, {len(fieldnames)} columns')

# Get account info from first valid row
account_row = next((r for r in rows if r.get('Account', '').strip()), rows[0])
ACCOUNT = account_row.get('Account', '').strip()
ACCOUNT_NAME = account_row.get('Account name', '').strip()

# -- Group RSAs by (Campaign, Ad Group) --
rsa_rows = [r for r in rows if r.get('Ad type', '').strip() == 'Responsive search ad']
by_group = defaultdict(list)
for r in rsa_rows:
    k = (r.get('Campaign', '').strip(), r.get('Ad Group', '').strip())
    by_group[k].append(r)

total_groups = len(by_group)
full_groups = sum(1 for v in by_group.values() if len(v) >= 3)
print(f'  {len(rsa_rows)} RSAs in {total_groups} ad groups')
print(f'  {full_groups} groups at 3-ad limit')

# -- Build Final URL lookup: per ad group, grab the URL from existing ads --
url_lookup = {}
for (camp, ag), ads in by_group.items():
    for ad in ads:
        url = ad.get('Final URL', '').strip()
        if url:
            url_lookup[(camp, ag)] = url
            break

# -- Build patch rows --
patch_rows = []
deleted = 0
added = 0
skipped_no_url = 0

for (camp, ag), ads in sorted(by_group.items()):
    tmpl = get_ad_template(camp)
    suburb = suburb_from_campaign(camp)
    svc = service_word(camp)

    # Read URL from existing ads in this group
    final_url = url_lookup.get((camp, ag), '')
    if not final_url:
        print(f'  WARNING: No Final URL for {camp} / {ag} — skipping')
        skipped_no_url += 1
        continue

    # Personalise H1 with suburb
    headlines = list(tmpl['headlines'])
    if suburb and len(f'{suburb} {svc}') <= 30:
        headlines[0] = f'{suburb} {svc}'
    elif suburb and len(suburb) <= 30:
        headlines[0] = suburb

    # If at 3-RSA limit: delete worst performer (lowest Clicks)
    if len(ads) >= 3:
        sorted_ads = sorted(ads, key=lambda x: float(x.get('Clicks', '0') or 0))
        worst = sorted_ads[0]
        del_row = {k: '' for k in fieldnames}
        del_row['Account'] = ACCOUNT
        del_row['Account name'] = ACCOUNT_NAME
        del_row['Campaign'] = camp
        del_row['Ad Group'] = ag
        del_row['Ad type'] = 'Responsive search ad'
        del_row['Status'] = 'Deleted'
        # Copy headline/description fields to identify the ad (skip #Original cols)
        for col in fieldnames:
            if (col.startswith('Headline') or col.startswith('Description')) and not col.endswith('#Original'):
                del_row[col] = worst.get(col, '')
        del_row['Final URL'] = worst.get('Final URL', '')
        del_row['Path 1'] = worst.get('Path 1', '')
        del_row['Path 2'] = worst.get('Path 2', '')
        # ID#Original is the match key for Editor to find the right ad
        if 'ID#Original' in fieldnames:
            del_row['ID#Original'] = worst.get('ID#Original', '')
        if 'Ad ID' in fieldnames:
            del_row['Ad ID'] = worst.get('Ad ID', '')
        patch_rows.append(del_row)
        deleted += 1

    # Add new RSA
    new_row = {k: '' for k in fieldnames}
    new_row['Account'] = ACCOUNT
    new_row['Account name'] = ACCOUNT_NAME
    new_row['Campaign'] = camp
    new_row['Ad Group'] = ag
    new_row['Ad type'] = 'Responsive search ad'
    new_row['Status'] = 'Enabled'
    new_row['Campaign Status'] = 'Enabled'
    new_row['Ad Group Status'] = 'Enabled'
    for i, h in enumerate(headlines, 1):
        col = f'Headline {i}'
        if col in fieldnames:
            new_row[col] = h
    for i, d in enumerate(tmpl['descriptions'], 1):
        col = f'Description {i}'
        if col in fieldnames:
            new_row[col] = d
    new_row['Path 1'] = tmpl['path1']
    new_row['Path 2'] = tmpl['path2']
    new_row['Final URL'] = final_url
    patch_rows.append(new_row)
    added += 1

print(f'\nPatch summary:')
print(f'  {deleted} deletions (worst performer in full groups)')
print(f'  {added} new ads')
print(f'  {len(patch_rows)} total rows')
if skipped_no_url:
    print(f'  {skipped_no_url} groups skipped (no URL found)')

# -- Write output --
with open(OUT, 'w', encoding='utf-16', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t')
    writer.writeheader()
    writer.writerows(patch_rows)

print(f'\nWritten -> {OUT}')
print('DONE. Import ads_patch_final.csv into Google Ads Editor.')
