#!/usr/bin/env python3
"""Builds the website pages in site/ from the page bodies in tools/pages/.

Each page file starts with one line of JSON (title, description, nav key, path),
followed by the HTML for <main>. This script wraps it in the shared head, header,
footer and phone booking bar, so every page stays consistent.

Run:  python3 tools/build_site.py
"""
import hashlib, json, re, pathlib, urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = ROOT / "tools" / "pages"
OUT = ROOT / "site"
DOMAIN = "https://tanyahill.co.uk"

PHONE_DISPLAY = "07714 541600"
PHONE_TEL = "+447714541600"
EMAIL = "tanyahill@actioncoach.co.uk"
WA = "https://wa.me/447714541600?text=" + urllib.parse.quote("Hi Tanya, I'd like to book a free 30-minute call.")
LINKEDIN = "https://www.linkedin.com/in/tanya-hill-coach-to-the-trades-built-like-a-boss-05218015"
INSTAGRAM = "https://www.instagram.com/coach_to_the_trades"
TIKTOK = "https://www.tiktok.com/@coach_to_the_trades"
FACEBOOK = "https://www.facebook.com/share/1FT5yGbwXF/"

ICONS = {
    "whatsapp": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>',
    "phone": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></svg>',
    "mail": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    "linkedin": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.6c0-1.3 0-3-1.9-3s-2.2 1.5-2.2 2.9V21h-4V9Z"/></svg>',
    "instagram": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    "tiktok": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.5 3c.4 2.2 1.8 3.7 4 4v3.1a7.5 7.5 0 0 1-4-1.2v6.4A6.2 6.2 0 1 1 10.3 9v3.2a3 3 0 1 0 3 3V3h3.2Z"/></svg>',
    "facebook": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.7V11H7v4h2.5v7h4v-7H16l.5-4h-3V9c0-.6.4-1 1-1Z"/></svg>',
    "menu": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    "home": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/></svg>',
    "chev": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
    "arrow": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    "check": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke-width="1.6"/><path d="m7.5 12.5 3 3 6-6.5"/></svg>',
    "share": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="m16 6-4-4-4 4M12 2v14"/></svg>',
    "cash": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 5.5A4.5 4.5 0 0 0 8 8.5V12H6m2 0h6M8 12v3.5c0 1.5-.8 2.6-2 3.5h12"/></svg>',
    "team": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.6"/><path d="M16.5 14.2c2.6.3 4.5 2.6 4.5 5.3"/></svg>',
    "time": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    "clients": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.9-3.9a2 2 0 0 0-2.8 0l-.9.9a1 1 0 1 1-3-3l2.8-2.8a3.6 3.6 0 0 1 4.3-.6l.4.3a2 2 0 0 0 1.5.2L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/></svg>',
    "pin": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
}

DRAWINGS = {
    "a-to-b-session": dict(
        date="2025-06-01",  # when the drawing was made (newest shows first)
        title="What's stopping you going from A to B?", topic="planning", topic_label="Planning",
        lesson="Where you are now, where you want to be, what's in the way, and the actions for this week. This is what a first session looks like.",
        alt="Hand-drawn session map. Point A, now: £1.36m turnover, in and out of overdraft, inconsistent work, 3.4% profit, working too much. Point B, the goal: £2m turnover, a £30k buffer in the bank, 20% profit, a 3-day week, holidays. Challenges include wearing Superman pants, profit but no cash flow, and being owed money. Solutions include a cash flow forecast, understanding the numbers, marketing, an organisation chart, credit control and working on the business. Actions for this week: list direct debits, bring the aged debtors list, keep a time log.",
        w=1330, h=1246),
    "profit-72k": dict(
        date="2025-04-01",  # when the drawing was made (newest shows first)
        title="Cut cost of sales by 6%, add £72k profit", topic="finance", topic_label="Finance",
        lesson="Same amount of work, same fixed costs. Bringing cost of sales from 78% to 72% takes profit from 9% to 15%.",
        alt="Hand-drawn figures. On £1.2m of work won for 2025, cost of sales at 78% leaves £108k profit, 9%. Reducing cost of sales by 6% to 72% gives £336k gross profit and £180k profit, 15%. A cloud reads Increase profit by £72k, beside a drawn stack of banknotes. Underneath: same amount of work and same fixed costs, just focusing on cost of sales, labour and materials.",
        w=1332, h=956),
    "cherry-on-top-finance": dict(
        date="2024-06-01",  # when the drawing was made (newest shows first)
        title="The cherry on top: finance", topic="finance", topic_label="Finance",
        lesson="Big profit sits on solid layers: knowing your numbers, tight credit control, invoicing on time, tracking jobs, quoting correctly and attracting grade A clients.",
        alt="Hand-drawn trifle with a cherry on top. Left side, leading to low profits and living in the overdraft: judging your business on your bank balance, a long debtors list, no invoicing process, no business structure, competing on price, taking on every job. Right side, leading to huge profit and money in the bank: knowing your numbers, watertight credit control, invoicing correctly and on time, tracking and managing jobs, quoting correctly and tracking quote versus actual, attracting grade A clients.",
        w=1334, h=835),
    "verbal-vs-written": dict(
        date="2025-05-14",  # when the drawing was made (newest shows first)
        title="A verbal agreement vs a written agreement", topic="sales", topic_label="Sales and contracts",
        lesson="A handshake feels quicker, but only a written agreement gives you a paper trail, protects both sides and can be enforced.",
        alt="Hand-drawn lips labelled A verbal agreement versus a signed document labelled A written agreement. Verbal: ego or emotional decision, short-term gain, possible long-term pain if the invoice isn't paid, no leg to stand on, hard to prove in a dispute, not legally binding. Written: logical decision, paper trail, protects both parties, easier to enforce, no misunderstandings.",
        w=1323, h=1128),
    "talk-vs-action": dict(
        date="2024-03-01",  # when the drawing was made (newest shows first)
        title="Talk vs action", topic="people", topic_label="People",
        lesson="Don't just listen to what people say. Cover your ears and watch what they do.",
        alt="Two hand-drawn faces. The first has closed eyes and big ears, with the words Talk is ego and Don't just listen to what people say. The second wears red headphones with eyes wide open, with the words Cover your ears and watch what they do.",
        w=1331, h=736),
    "business-ducks": dict(
        date="2023-06-01",  # when the drawing was made (newest shows first)
        title="Have you got your business ducks in a row?", topic="planning", topic_label="Planning",
        lesson="Marketing, sales, operations and finance: the four areas every business needs lined up.",
        alt="Hand-drawn yellow rubber duck with the words Have you got your business ducks in a row? Marketing, sales, operations, finance.",
        w=1344, h=1110),
}


def drawing_card(key, heading="h3", lazy=True):
    d = DRAWINGS[key]
    loading = ' loading="lazy"' if lazy else ""
    return f"""<figure class="drawing" id="{key}" data-topic="{d['topic']}">
  <button class="zoom" type="button" data-full="img/art/{key}.webp" data-title="{d['title']}" aria-label="View full size: {d['title']}">
    <img src="img/art/{key}-sm.webp" srcset="img/art/{key}-sm.webp 720w, img/art/{key}.webp {d['w']}w" sizes="(min-width: 960px) 560px, 100vw" width="{d['w']}" height="{d['h']}" alt="{d['alt']}"{loading} decoding="async">
  </button>
  <figcaption>
    <{heading}>{d['title']}</{heading}>
    <p>{d['lesson']}</p>
    <div class="meta"><span class="topic">{d['topic_label']}</span><button class="share-btn" type="button" data-share="resources.html#{key}" data-share-title="{d['title']}">{ICONS['share']}Share</button></div>
  </figcaption>
</figure>"""


NAV = [
    ("home", "index.html", "Home"),
    ("about", "about.html", "About me"),
    ("how", "how-i-work.html", "How I work"),
    ("resources", "resources.html", "Drawings"),
    ("colour", "colour-profile.html", "Colour Profile"),
]


def mobile_links(active):
    items = NAV + [("book", "book.html", "Book a free call")]
    out = []
    for key, href, label in items:
        cur = ' aria-current="page"' if key == active else ""
        out.append(f'<li><a href="{href}"{cur}><span>{label}</span></a></li>')
    return "\n".join(out)


def nav_links(active, cls=""):
    out = []
    for key, href, label in NAV:
        cur = ' aria-current="page"' if key == active else ""
        out.append(f'<li><a href="{href}"{cur}>{label}</a></li>')
    return "\n".join(out)


def page(meta, body):
    title = meta["title"]
    full_title = title if meta.get("full_title") else f"{title} · Tanya Hill Coaching"
    desc = meta["description"]
    path = meta["path"]
    url = DOMAIN + "/" + ("" if path == "index.html" else path)
    active = meta.get("nav", "")
    noindex = '\n<meta name="robots" content="noindex">' if meta.get("noindex") else ""
    i = ICONS
    base = '\n<base href="/">' if meta.get("base") else ""
    return f"""<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">{base}
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{full_title}</title>
<meta name="description" content="{desc}">{noindex}
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#faf7f0">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Tanya Hill Coaching">
<meta property="og:title" content="{full_title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{DOMAIN}/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.ico" sizes="32x32">
<link rel="icon" href="img/icons/icon-192.png" type="image/png">
<link rel="apple-touch-icon" href="img/icons/apple-touch-icon.png">
<link rel="manifest" href="manifest.webmanifest">
<link rel="preload" href="fonts/poppins-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/dmsans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/site.css">{meta.get("head_extra", "")}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap bar">
    <a class="brand" href="index.html" aria-label="Tanya Hill Coaching, Built Like a Boss: home"><img src="img/logo-ink.png" alt="Tanya Hill Coaching, Built Like a Boss" width="640" height="269"></a>
    <nav class="nav" aria-label="Main">
      <ul>
        {nav_links(active)}
        <li><a class="btn btn-gold" href="{WA}">{i["whatsapp"]}Book a free call</a></li>
      </ul>
    </nav>
    <div class="header-actions">
      <a class="home-btn" href="index.html" aria-label="Home"{' aria-current="page"' if active == "home" else ""}>{i["home"]}</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-nav"><span class="burger" aria-hidden="true"><i></i><i></i><i></i></span><span class="label">Menu</span></button>
    </div>
  </div>
  <nav class="mobile-nav" id="mobile-nav" aria-label="Main">
    <div class="mobile-nav-inner">
      <div class="wrap">
        <ul class="m-links">
          {mobile_links(active)}
        </ul>
        <div class="m-contact">
          <p class="eyebrow">Get in touch</p>
          <div class="m-tiles">
            <a class="m-tile wa" href="{WA}">{i["whatsapp"]}WhatsApp</a>
            <a class="m-tile" href="tel:{PHONE_TEL}" aria-label="Call {PHONE_DISPLAY}">{i["phone"]}Call</a>
            <a class="m-tile" href="mailto:{EMAIL}" aria-label="Email {EMAIL}">{i["mail"]}Email</a>
            <a class="m-tile" href="{LINKEDIN}" rel="noopener">{i["linkedin"]}LinkedIn</a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</header>

<main id="main">
{body}
</main>

<footer class="site-footer">
  <div class="wrap">
    <div class="cols">
      <div>
        <img class="logo" src="img/logo-gold.png" alt="Tanya Hill Coaching, Built Like a Boss" width="640" height="269" loading="lazy">
        <p style="margin-top:16px;max-width:30ch">Coach to the Trades. Helping trade and construction business owners get their margins, time and headspace back.</p>
        <p style="margin-top:12px" class="small">Certified ActionCOACH business coach · <a href="https://business.actioncoach.co.uk/coaches/tanya-hill" style="min-height:0;display:inline">My ActionCOACH profile</a></p>
      </div>
      <div>
        <h3>Pages</h3>
        <ul>
          {nav_links("")}
          <li><a href="book.html">Book a free call</a></li>
        </ul>
      </div>
      <div>
        <h3>Contact</h3>
        <ul>
          <li><a href="{WA}">{i["whatsapp"]}WhatsApp</a></li>
          <li><a href="tel:{PHONE_TEL}">{i["phone"]}{PHONE_DISPLAY}</a></li>
          <li><a href="mailto:{EMAIL}">{i["mail"]}Email me</a></li>
          <li><span style="display:inline-flex;gap:8px;align-items:center;min-height:40px">{i["pin"]}Billericay, Essex</span></li>
        </ul>
      </div>
      <div>
        <h3>Follow</h3>
        <ul>
          <li><a href="{LINKEDIN}" rel="noopener">{i["linkedin"]}LinkedIn</a></li>
          <li><a href="{INSTAGRAM}" rel="noopener">{i["instagram"]}Instagram</a></li>
          <li><a href="{TIKTOK}" rel="noopener">{i["tiktok"]}TikTok</a></li>
          <li><a href="{FACEBOOK}" rel="noopener">{i["facebook"]}Facebook</a></li>
        </ul>
      </div>
    </div>
    <div class="fine">
      <span>© <span data-year>2026</span> Tanya Hill Coaching Ltd · Company no. 09757695</span>
      <span><a href="privacy.html">Privacy policy</a></span>
    </div>
  </div>
</footer>

<a class="book-fab" href="{WA}" aria-label="Book a free call on WhatsApp">{i["whatsapp"]}<span>Book a call</span></a>

<dialog class="lightbox" aria-label="Drawing, full size">
  <img src="" alt="">
  <div class="lb-bar"><span class="lb-title"></span><button type="button" class="lb-close">Close</button></div>
</dialog>
<script src="assets/site.js" defer></script>{meta.get("body_extra", "")}
</body>
</html>
"""


def version(rel):
    return hashlib.sha1((OUT / rel).read_bytes()).hexdigest()[:8]


def clean_links(html):
    # tanyahill.co.uk/ instead of /index.html, /about instead of /about.html (GitHub Pages serves both)
    html = re.sub(r'href="index\.html(#[^"]*)?"', lambda m: 'href="/' + (m.group(1) or '') + '"', html)
    html = re.sub(r'href="([a-z0-9-]+)\.html(#[^"]*)?"', lambda m: 'href="' + m.group(1) + (m.group(2) or '') + '"', html)
    html = re.sub(r'(<link rel="canonical" href="https://tanyahill\.co\.uk/[a-z0-9-]+)\.html', r'\1', html)
    html = re.sub(r'(<meta property="og:url" content="https://tanyahill\.co\.uk/[a-z0-9-]+)\.html', r'\1', html)
    return html


def bust(html):
    html = clean_links(html)
    for rel in ["assets/site.css", "assets/site.js", "quiz.js", "quiz-data.js", "result.js"]:
        html = html.replace(f'"{rel}"', f'"{rel}?v={version(rel)}"')
    return html


def render(text):
    # Simple placeholders available inside page bodies
    reps = {"{{WA}}": WA, "{{TEL}}": "tel:" + PHONE_TEL, "{{PHONE}}": PHONE_DISPLAY, "{{EMAIL}}": EMAIL,
            "{{LINKEDIN}}": LINKEDIN}
    for k, v in ICONS.items():
        reps["{{icon:" + k + "}}"] = v
    newest = sorted(DRAWINGS, key=lambda k: DRAWINGS[k]["date"], reverse=True)
    reps["{{library}}"] = "\n".join(drawing_card(k, lazy=i > 1) for i, k in enumerate(newest))
    for k in DRAWINGS:
        reps["{{drawing:" + k + "}}"] = drawing_card(k)
        reps["{{drawing-eager:" + k + "}}"] = drawing_card(k, lazy=False)
    for k, v in reps.items():
        text = text.replace(k, v)
    return text


def main():
    built = []
    for f in sorted(PAGES.glob("*.html")):
        first, body = f.read_text(encoding="utf-8").split("\n", 1)
        meta = json.loads(first)
        html = bust(page(meta, render(body).rstrip()))
        (OUT / meta["path"]).write_text(html, encoding="utf-8")
        built.append(meta)
    built += build_colour_pages()
    # sitemap
    urls = "\n".join(f"  <url><loc>{DOMAIN}/{'' if m['path'] == 'index.html' else m['path'][:-5]}</loc></url>" for m in built if not m.get("noindex"))
    (OUT / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}\n</urlset>\n', encoding="utf-8")
    print("built", ", ".join(m["path"] for m in built))



# ---------------- Colour result pages ----------------
import subprocess

COLOURS = ["red", "yellow", "green", "blue"]
CNAME = {"red": "Red", "yellow": "Yellow", "green": "Green", "blue": "Blue"}
TEXT_HEX = {"red": "#b03224", "yellow": "#7d6300", "green": "#1a7340", "blue": "#1a5276"}
LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'


def quiz_data():
    js = "const fs=require('fs');eval(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(JSON.stringify({PROFILES,HEX,BG}))"
    out = subprocess.run(["node", "-e", js, str(OUT / "quiz-data.js")], capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;"))


def colour_page(col, data):
    p = data["PROFILES"][col]
    hexc, bg = data["HEX"][col], data["BG"][col]
    others = "".join(
        f'<a class="chip" href="colour-{o}.html" style="--c:var(--{o});--ct:var(--{o}-t)"{" aria-current=\"page\"" if o == col else ""}><b>{CNAME[o]}</b><span>{esc(data["PROFILES"][o]["tag"])}</span></a>'
        for o in COLOURS)
    strengths = "".join(f"<li>{esc(s)}</li>" for s in p["strengths"][:3])
    wa_generic = "https://wa.me/447714541600?text=" + urllib.parse.quote(f"Hi Tanya, I've done the Colour Profile and I'm a {CNAME[col]} ({p['type']}). I'd like to book a free debrief.")
    body = f"""<div class="print-only print-head"><img src="img/logo-ink.png" alt="Tanya Hill Coaching, Built Like a Boss" width="640" height="269"><p data-print-for>Behaviour Colour Profile</p></div>

<section class="result-hero" style="--c:{hexc};--ct:{TEXT_HEX[col]};--tint:{bg}">
  <div class="wrap narrow">
    <p class="eyebrow" data-greet>Behaviour Colour Profile</p>
    <h1><span class="cname">{CNAME[col]}</span> {esc(p["type"])}</h1>
    <p class="tagline">{esc(p["tag"])}</p>
  </div>
</section>

<section class="section result-body" style="--c:{hexc};--ct:{TEXT_HEX[col]};--tint:{bg}">
  <div class="wrap narrow stack-lg">
    <div class="notice status-note no-print" data-status hidden></div>

    <div>
      <p class="lede" style="max-width:none">{esc(p["summary"])}</p>
    </div>

    <div class="personal" data-personal hidden>
      <h2 class="h3">Your colour mix</h2>
      <div class="bars" data-bars></div>
      <p class="muted" style="margin-top:12px" data-second></p>
    </div>

    <div>
      <h2 class="h3">At your best</h2>
      <ul class="tick-list good" style="margin-top:10px">{strengths}</ul>
    </div>

    <div class="unlock">
      <h2 class="h3">What we'll unpack together</h2>
      <p class="muted" style="margin-top:6px">Your colour is just the starting point. In a free debrief, I'll take you through:</p>
      <ul class="lock-list">
        <li>{LOCK}<span>How you show up under pressure, and what to watch out for</span></li>
        <li>{LOCK}<span>What really motivates you, and what quietly drains you</span></li>
        <li>{LOCK}<span>How to work with, lead and sell to the other three colours</span></li>
        <li>{LOCK}<span>What it means for your business and your plan from here</span></li>
      </ul>
    </div>

    <div class="debrief no-print">
      <p class="eyebrow">Free · 30 minutes</p>
      <h2 class="h3" style="color:var(--on-dark)">Book your colour debrief</h2>
      <p>Let's talk through your full profile and what it means for you and your business.</p>
      <div class="btn-row">
        <a class="btn btn-gold" href="{wa_generic}" data-debrief>{ICONS["whatsapp"]}Book on WhatsApp</a>
        <a class="btn btn-line" href="tel:{PHONE_TEL}">{ICONS["phone"]}Call {PHONE_DISPLAY}</a>
      </div>
    </div>

    <div class="save no-print" data-personal hidden>
      <h2 class="h3">Keep your results</h2>
      <p class="muted" style="margin-top:6px">This page is saved to your link, so you can come back any time.</p>
      <div class="save-tiles">
        <button type="button" class="m-tile" data-copy>{ICONS["share"]}<span>Copy my link</span></button>
        <button type="button" class="m-tile" data-self>{ICONS["whatsapp"]}<span>Send to myself</span></button>
        <button type="button" class="m-tile" data-pdf><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M12 12v6M9 15l3 3 3-3"/></svg><span>Save as PDF</span></button>
        <button type="button" class="m-tile" data-card><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-8 8"/></svg><span>Share my card</span></button>
      </div>
      <p class="small muted" data-copied aria-live="polite" style="margin-top:8px"></p>
    </div>

    <div class="no-print" data-generic>
      <h2 class="h3">What colour are you?</h2>
      <p class="muted" style="margin-top:6px">Take the free 12-question Colour Profile to find out.</p>
      <div class="btn-row" style="margin-top:14px"><a class="btn btn-ink" href="colour-profile.html">Take the Colour Profile</a></div>
    </div>

    <div class="no-print">
      <h2 class="h3">The four colours</h2>
      <div class="colour-chips" style="margin-top:12px">{others}</div>
      <p style="margin-top:16px" data-personal hidden><a class="text-link" href="colour-profile.html">Retake the quiz</a></p>
    </div>

    <p class="print-only small">Tanya Hill Coaching · Built Like a Boss · tanyahill.co.uk · {PHONE_DISPLAY} · {EMAIL}</p>
  </div>
</section>"""
    meta = {
        "path": f"colour-{col}.html", "nav": "colour",
        "title": f"{CNAME[col]}: {p['type']} · Behaviour Colour Profile",
        "description": f"{CNAME[col]}, {p['type']}: {p['tag']}. Part of Tanya Hill's free Behaviour Colour Profile.",
        "body_extra": '\n<script src="quiz-data.js" defer></script>\n<script src="result.js" defer></script>',
    }
    return meta, body


def build_colour_pages():
    data = quiz_data()
    metas = []
    for col in COLOURS:
        meta, body = colour_page(col, data)
        html = bust(page(meta, body))
        (OUT / meta["path"]).write_text(html, encoding="utf-8")
        metas.append(meta)
    return metas


if __name__ == "__main__":
    main()
