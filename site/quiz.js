// Which Boss Are You? quiz (based on the Behaviour Colour Profile).
// Flow: intro → 12 questions → first name → personal results page (colour-<colour>.html#n=..&s=..).
// Content lives in quiz-data.js (PROFILES, QUESTIONS, HEX, BG).
(function () {
  var root = document.getElementById("quiz");
  if (!root || typeof QUESTIONS === "undefined") return;

  // Empty = nothing leaves the device. Later: the web-app URL of the Google Apps Script in Tanya's account,
  // which logs first name + colour to her Google Sheet (no contact details) and deletes rows after 12 months.
  var RESULTS_ENDPOINT = "https://script.google.com/macros/s/AKfycbw2z2vguH29cBty3pp6jabEkX7O2fYCsi5TGoxCLF5XgqvzndGpxOHEVyIC58CmY_Y2/exec";
  var SITE = "https://tanyahill.co.uk";
  var ORDER = ["red", "yellow", "green", "blue"];
  var NAME = { red: "Red", yellow: "Yellow", green: "Green", blue: "Blue" };
  var state = { screen: "intro", q: 0, answers: [], picks: [], opts: [], locked: false };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pct(v) { return Math.round(v / QUESTIONS.length * 100); }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function focusTop() {
    root.setAttribute("tabindex", "-1"); root.focus({ preventScroll: true });
    window.scrollTo({ top: root.getBoundingClientRect().top + window.scrollY - 90, behavior: reduce ? "auto" : "smooth" });
  }

  function result() {
    var s = { red: 0, yellow: 0, green: 0, blue: 0 };
    state.answers.forEach(function (c) { s[c]++; });
    var sorted = ORDER.map(function (k) { return [k, s[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
    return { scores: s, dom: sorted[0][0], second: sorted[1][0], sorted: sorted };
  }

  function resultsPath(r, name) {
    var p = new URLSearchParams();
    if (name) p.set("n", name);
    p.set("s", ORDER.map(function (k) { return r.scores[k]; }).join("-"));
    return "colour-" + r.dom + "#" + p.toString();
  }

  // ---------- Screens ----------
  function intro() {
    var chips = document.querySelector("#quiz-chips");
    var last = load("cp_last"), who = load("cp_last_name");
    var back = "";
    if (last && /^colour-(red|yellow|green|blue)(\.html)?#/.test(last)) {
      back = '<div class="welcome-back"><p><strong>Welcome back' + (who ? ", " + esc(who.split(" ")[0]) : "") + '.</strong> Your last results are saved on this device.</p>' +
        '<a class="btn btn-line" href="' + esc(last) + '">See my results</a>' +
        '<p class="small" style="margin-top:12px"><button type="button" class="linklike" id="forget">Not you? Forget my details on this device</button></p></div>';
    }
    root.innerHTML = '<div class="quiz-card quiz-intro">' + back +
      '<button class="btn btn-ink" type="button" id="start">' + (back ? "Take it again" : "Start the quiz") + '</button>' +
      (chips ? chips.innerHTML : "") +
      '<p class="small muted" style="margin-top:16px">At the end, you can send your results to me on WhatsApp so we can talk through what they mean for you.</p></div>';
    var forget = document.getElementById("forget");
    if (forget) forget.onclick = function () {
      ["cp_last", "cp_last_name", "cp_contact"].forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
      render(); var s = document.getElementById("start"); if (s) s.focus();
    };
    document.getElementById("start").onclick = function () {
      state.screen = "quiz"; state.q = 0; state.answers = []; state.picks = []; state.opts = shuffle(QUESTIONS[0].o); render(); focusTop();
    };
  }

  function progress(n) {
    return '<div class="progress" role="progressbar" aria-label="Progress" aria-valuemin="0" aria-valuemax="' + QUESTIONS.length + '" aria-valuenow="' + n + '"><i style="width:' + pct(n) + '%"></i></div>';
  }

  function question() {
    var q = QUESTIONS[state.q];
    var html = '<div class="quiz-card">' + progress(state.q) +
      '<div class="q-meta"><span>Question ' + (state.q + 1) + ' of ' + QUESTIONS.length + '</span><button class="q-back" type="button" id="back"' + (state.q === 0 ? " hidden" : "") + '>← Back</button></div>' +
      '<h2 class="q-text" id="qt">' + esc(q.t) + '</h2><div class="options" role="group" aria-labelledby="qt">';
    state.opts.forEach(function (o, i) { html += '<button class="option" type="button" data-i="' + i + '">' + esc(o.x) + '</button>'; });
    root.innerHTML = html + '</div></div>';
    root.querySelectorAll(".option").forEach(function (b) {
      b.onclick = function () { var o = state.opts[+b.getAttribute("data-i")]; pick(b, o); };
    });
    document.getElementById("back").onclick = function () {
      state.q--; state.answers.length = state.q; state.picks.length = state.q; state.opts = shuffle(QUESTIONS[state.q].o); render();
      var first = root.querySelector(".option"); if (first) first.focus();
    };
  }

  function pick(btn, o) {
    if (state.locked) return;
    state.locked = true;
    btn.classList.add("picked");
    setTimeout(function () {
      state.answers[state.q] = o.c; state.picks[state.q] = o.x;
      state.answers.length = state.picks.length = state.q + 1;
      if (state.q + 1 < QUESTIONS.length) { state.q++; state.opts = shuffle(QUESTIONS[state.q].o); }
      else state.screen = "details";
      state.locked = false; render();
      if (state.screen === "details") focusTop();
      else { var first = root.querySelector(".option"); if (first) first.focus({ preventScroll: true }); }
    }, reduce ? 60 : 280);
  }

  // Last step: just a first name. No email or phone, ever: Tanya picks the conversation up on WhatsApp.
  function details() {
    var saved = {};
    try { saved = JSON.parse(load("cp_contact") || "{}") || {}; } catch (e) {}
    root.innerHTML = '<div class="quiz-card">' + progress(QUESTIONS.length) +
      '<div class="q-meta"><span>All 12 answered</span><button class="q-back" type="button" id="back">← Back</button></div>' +
      '<h2 class="q-text">Nearly there. What\'s your first name?</h2>' +
      '<p class="muted" style="margin:-6px 0 14px">It goes on your results so they feel like yours.</p>' +
      '<p class="reassure">Don\'t worry, I don\'t need your email or phone number. No sales calls, no spam. Just your results.</p>' +
      '<form id="cp-details" class="stack" novalidate>' +
      field("cp-fullname", "Your first name", "text", "given-name", saved.name) +
      '<p class="form-error" id="cp-error" role="alert"></p>' +
      '<button class="btn btn-gold" type="submit" id="cp-submit" style="width:100%;min-height:58px">See my results</button>' +
      '<p class="small muted">I\'ll see your first name and results, nothing else. <a href="privacy.html">Privacy policy</a></p>' +
      '</form></div>';
    document.getElementById("back").onclick = function () {
      state.screen = "quiz"; state.q = QUESTIONS.length - 1; state.answers.length = state.picks.length = state.q;
      state.opts = shuffle(QUESTIONS[state.q].o); render(); focusTop();
    };
    document.getElementById("cp-details").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = { name: val("cp-fullname") };
      var err = document.getElementById("cp-error"), el = document.getElementById("cp-fullname");
      el.removeAttribute("aria-invalid");
      if (f.name.length < 2) { err.textContent = "Please enter your first name."; el.setAttribute("aria-invalid", "true"); el.focus(); return; }
      err.textContent = ""; store("cp_contact", JSON.stringify(f));
      logCompletion(f.name);
      finish(f, "manual");
    });
  }

  function field(id, label, type, ac, val) {
    return '<div class="field"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="' + type + '" autocomplete="' + ac + '"' +
      ' required aria-required="true" value="' + esc(val || "") + '"></div>';
  }

  // Once the Google Apps Script exists, RESULTS_ENDPOINT is its web-app URL and this quietly logs
  // first name, colour and scores to Tanya's Google Sheet. Never contact details.
  function logCompletion(name) {
    if (!RESULTS_ENDPOINT) return;
    var r = result();
    var data = JSON.stringify({ name: name.split(" ")[0], colour: NAME[r.dom], second: NAME[r.second],
      scores: ORDER.map(function (k) { return NAME[k] + " " + r.scores[k]; }).join(", "), link: SITE + "/" + resultsPath(r, name) });
    try {
      if (navigator.sendBeacon) navigator.sendBeacon(RESULTS_ENDPOINT, new Blob([data], { type: "text/plain" }));
      else fetch(RESULTS_ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: data, keepalive: true });
    } catch (e) {}
  }
  function val(id) { return (document.getElementById(id).value || "").trim().replace(/\s+/g, " "); }

  function finish(f, sent) {
    var r = result(), path = resultsPath(r, f.name);
    store("cp_last", path); store("cp_last_name", f.name);
    try { sessionStorage.setItem("cp_status", sent === "manual" ? "manual" : sent ? "sent" : "failed"); } catch (e) {}
    window.location.href = path;
  }

  function render() {
    document.body.classList.toggle("quiz-active", state.screen === "quiz" || state.screen === "details");
    if (state.screen === "intro") intro();
    else if (state.screen === "quiz") question();
    else details();
  }
  render();
})();
