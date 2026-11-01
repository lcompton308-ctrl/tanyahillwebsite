#!/usr/bin/env python3
"""Makes the WhatsApp/social link-preview images for the four colour result pages (site/img/og-<colour>.jpg).

When someone sends their results link on WhatsApp, the preview shows a card in their colour.
Uses Poppins and DM Sans when available (the deploy workflow downloads them to /tmp/f),
otherwise falls back to Inter so it can be run locally.

Run:  python3 tools/make_og.py
"""
import json, pathlib, subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / "site"

def font(candidates, size):
    for c in candidates:
        try:
            return ImageFont.truetype(c, size)
        except OSError:
            continue
    return ImageFont.load_default()

HEAD = ["/tmp/f/p700.ttf", "/usr/share/fonts/opentype/inter/Inter-Bold.otf"]
BODY = ["/tmp/f/dm.ttf", "/usr/share/fonts/opentype/inter/Inter-Medium.otf"]

js = "const fs=require('fs');eval(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(JSON.stringify({PROFILES,HEX,BG}))"
data = json.loads(subprocess.run(["node", "-e", js, str(SITE / "quiz-data.js")], capture_output=True, text=True, check=True).stdout)
TEXT = {"red": "#b03224", "yellow": "#7d6300", "green": "#1a7340", "blue": "#1a5276"}
NAME = {"red": "Red", "yellow": "Yellow", "green": "Green", "blue": "Blue"}
INK, PAPER, GOLD, BRONZE, STONE = "#1a1814", "#faf7f0", "#d3a13e", "#7a5a10", "#5f5a50"

logo = Image.open(SITE / "img/logo-gold.png").convert("RGBA")
for col in ["red", "yellow", "green", "blue"]:
    p = data["PROFILES"][col]
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(im)
    # dark top band with the gold logo
    d.rectangle([0, 0, W, 150], fill=INK)
    d.rectangle([0, 150, W, 156], fill=GOLD)
    lw = 330; lh = int(lw * logo.height / logo.width)
    im.paste(logo.resize((lw, lh), Image.LANCZOS), ((W - lw) // 2, (150 - lh) // 2), logo.resize((lw, lh), Image.LANCZOS))
    # colour panel
    d.rounded_rectangle([70, 200, W - 70, 520], radius=28, fill=data["BG"][col])
    d.rounded_rectangle([70, 200, 92, 520], radius=11, fill=data["HEX"][col])
    d.rectangle([82, 200, 92, 520], fill=data["HEX"][col])
    d.text((130, 238), "WHICH BOSS ARE YOU?", font=font(HEAD, 26), fill=BRONZE)
    d.text((130, 282), NAME[col], font=font(HEAD, 54), fill=TEXT[col])
    t = p["type"]; size = 84
    while size > 40 and d.textlength(t, font=font(HEAD, size)) > W - 260:
        size -= 4
    d.text((130, 346), t, font=font(HEAD, size), fill=INK)
    d.text((130, 458), p["tag"], font=font(BODY, 32), fill=STONE)
    # four colour dots
    for i, c in enumerate(["red", "yellow", "green", "blue"]):
        x = W - 130 - (3 - i) * 46
        d.ellipse([x, 246, x + 30, 276], fill=data["HEX"][c], outline=INK if c == col else None, width=3 if c == col else 0)
    d.text((W // 2, 580), "Find yours at tanyahill.co.uk", font=font(HEAD, 30), fill=INK, anchor="mm")
    im.save(SITE / f"img/og-{col}.jpg", quality=86, optimize=True, progressive=True)
    print("made", f"img/og-{col}.jpg")
