#!/usr/bin/env python3
"""Copies each Boss Talk video's YouTube thumbnail onto the website (site/img/talk/<id>.jpg),
so visitors' phones never contact YouTube unless they press play. Runs when the site is published."""
import pathlib, re, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
out = ROOT / "site" / "img" / "talk"
out.mkdir(parents=True, exist_ok=True)
for f in (ROOT / "tools" / "boss-talk").glob("*.txt"):
    m = re.search(r"^youtube:\s*([A-Za-z0-9_-]{11})\s*$", f.read_text(encoding="utf-8"), re.M)
    if not m:
        continue
    vid = m.group(1)
    dest = out / f"{vid}.jpg"
    if dest.exists():
        continue
    for size in ("maxresdefault", "hqdefault"):
        try:
            data = urllib.request.urlopen(f"https://i.ytimg.com/vi/{vid}/{size}.jpg", timeout=20).read()
            if len(data) > 2000:
                dest.write_bytes(data)
                print("thumbnail", vid, size)
                break
        except Exception as e:
            print("could not fetch", vid, size, e)
