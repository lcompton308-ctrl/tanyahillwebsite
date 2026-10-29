# Colour Profile — Tanya Hill Coaching

Android app version of the **Behaviour Colour Profile** quiz (Built Like a Boss).
12 questions, then a full Red / Yellow / Green / Blue profile with strengths,
watch-outs, motivators, drains and development tips. Works offline.

## Getting the app
Every change to `main` builds automatically. To install:
1. Open the **Releases** section of this repo (right-hand side on desktop, or scroll down on mobile).
2. Download `ColourProfile.apk` from the newest build.
3. Open it on the phone and allow installing from your browser if asked.

New builds install over the old one, no need to uninstall.

## Where things live
- `app/src/main/assets/data.js` — all the quiz wording (questions, profiles, tips). Edit this to change text.
- `app/src/main/assets/index.html` — layout and styling.
- `app/src/main/assets/app.js` — how the quiz works.
- `app/src/main/java/.../MainActivity.kt` — the Android shell that shows the quiz.
- `.github/workflows/build.yml` — the automatic build.
