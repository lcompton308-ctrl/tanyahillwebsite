# Tanya Hill Coaching website

**tanyahill.co.uk** · Coach to the Trades · Built Like a Boss

## How it's put together
- `tools/pages/` — the words and layout of each page (one file per page).
- `tools/build_site.py` — wraps each page in the shared header, footer and booking bar, and holds the drawing library (titles, lessons, descriptions). Run `python3 tools/build_site.py` after editing, then commit.
- `site/` — the finished website. Anything pushed here goes live automatically.
  - `assets/site.css` — colours, fonts and layout for every page.
  - `assets/site.js` — menu, drawing viewer, sharing, booking helper.
  - `quiz-data.js` — all the Colour Profile wording. `quiz.js` — how the quiz works.
  - `img/art/` — drawings (web versions), `img/photos/` — photos.
- `originals/` — full-size drawings and photos, kept out of the public site.
- `.github/workflows/website.yml` — publishes the site and adds the fonts.

## Adding a new drawing
1. Put the full-size image in `originals/drawings/`.
2. Make web versions in `site/img/art/` (`name.webp` and `name-sm.webp`).
3. Add an entry to `DRAWINGS` in `tools/build_site.py` and add `{{drawing:name}}` to `tools/pages/03-resources.html`.
4. Run the build and commit.
