#!/usr/bin/env python3
"""Tells Bing (and other IndexNow search engines) which pages changed, straight after each deploy.

Run by the deploy workflow:  python3 tools/indexnow.py <old commit> <new commit>
 - Only pages whose HTML changed are sent. If shared files (CSS, JS, images) changed, every page is sent.
 - Run by hand (no commits given) it sends every page in the sitemap.
The key file site/c87066b232542daf04b378135300d2f9.txt proves to Bing that this site sent the request.
"""
import json, pathlib, re, subprocess, sys, urllib.request

KEY = "c87066b232542daf04b378135300d2f9"
HOST = "tanyahill.co.uk"
DOMAIN = "https://" + HOST
ROOT = pathlib.Path(__file__).resolve().parent.parent

def all_pages():
    xml = (ROOT / "site/sitemap.xml").read_text()
    return re.findall(r"<loc>(.*?)</loc>", xml)

def changed_pages(old, new):
    try:
        out = subprocess.run(["git", "diff", "--name-only", old, new, "--", "site/"], cwd=ROOT,
                             capture_output=True, text=True, check=True).stdout.split()
    except subprocess.CalledProcessError:
        return all_pages()
    pages = set()
    for f in out:
        if f.endswith(".html"):
            name = f[len("site/"):-len(".html")]
            if "/" in name or name == "404":
                continue
            pages.add(DOMAIN + "/" if name == "index" else DOMAIN + "/" + name)
        elif f.endswith((".css", ".js", ".webp", ".png", ".jpg", ".woff2")):
            return all_pages()
    return sorted(pages)

urls = changed_pages(sys.argv[1], sys.argv[2]) if len(sys.argv) == 3 else all_pages()
if not urls:
    print("No page changes to report.")
    sys.exit(0)
body = json.dumps({"host": HOST, "key": KEY, "keyLocation": f"{DOMAIN}/{KEY}.txt", "urlList": urls}).encode()
req = urllib.request.Request("https://api.indexnow.org/indexnow", data=body,
                             headers={"Content-Type": "application/json; charset=utf-8"})
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        print("IndexNow", r.status, "for", len(urls), "page(s):", *urls, sep="\n  ")
except Exception as e:
    print("IndexNow didn't accept it (the site is still live):", e)
