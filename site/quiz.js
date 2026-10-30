// Behaviour Colour Profile quiz.
// Flow: intro → 12 questions → contact details → results emailed to Tanya → personal results page (colour-<colour>.html#n=..&s=..).
// Content lives in quiz-data.js (PROFILES, QUESTIONS, HEX, BG).
(function () {
  var root = document.getElementById("quiz");
  if (!root || typeof QUESTIONS === "undefined") return;

  // Where results are emailed. FormSubmit sends an "Activate" email to this address on the first result;
  // after activation it can be swapped for the private alias FormSubmit provides.
  var RESULTS_ENDPOINT = "https://formsubmit.co/ajax/tanyahill@actioncoach.co.uk";
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
        '<a class="btn btn-line" href="' + esc(last) + '">See my results</a></div>';
    }
    root.innerHTML = '<div class="quiz-card quiz-intro">' + back +
      '<button class="btn btn-ink" type="button" id="start">' + (back ? "Take it again" : "Start the Colour Profile") + '</button>' +
      (chips ? chips.innerHTML : "") +
      '<p class="small muted" style="margin-top:16px">At the end, add your details to see your results. I\'ll get a copy too, so we can talk through what it means for you.</p></div>';
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

  function details() {
    var saved = {};
    try { saved = JSON.parse(load("cp_contact") || "{}") || {}; } catch (e) {}
    root.innerHTML = '<div class="quiz-card">' + progress(QUESTIONS.length) +
      '<div class="q-meta"><span>All 12 answered</span><button class="q-back" type="button" id="back">← Back</button></div>' +
      '<h2 class="q-text">Nearly there. Where should I send your results?</h2>' +
      '<p class="muted" style="margin:-6px 0 18px">Add your details to see your colour. I\'ll get a copy too, so we can talk through what it means for you and your business.</p>' +
      '<form id="cp-details" class="stack" novalidate>' +
      field("cp-fullname", "Full name", "text", "name", saved.name) +
      field("cp-email", "Email", "email", "email", saved.email) +
      field("cp-phone", "Mobile number", "tel", "tel", saved.phone) +
      field("cp-business", "Business name (optional)", "text", "organization", saved.business) +
      '<div class="hp" aria-hidden="true"><label for="cp-hp">Leave this empty</label><input id="cp-hp" type="text" tabindex="-1" autocomplete="off"></div>' +
      '<p class="form-error" id="cp-error" role="alert"></p>' +
      '<button class="btn btn-gold" type="submit" id="cp-submit" style="width:100%;min-height:58px">See my results</button>' +
      '<p class="small muted">Your details and results go only to me, Tanya Hill, so I can talk you through your profile. <a href="privacy.html">Privacy policy</a></p>' +
      '</form></div>';
    document.getElementById("back").onclick = function () {
      state.screen = "quiz"; state.q = QUESTIONS.length - 1; state.answers.length = state.picks.length = state.q;
      state.opts = shuffle(QUESTIONS[state.q].o); render(); focusTop();
    };
    document.getElementById("cp-details").addEventListener("submit", submit);
  }

  function field(id, label, type, ac, val) {
    var required = id !== "cp-business";
    return '<div class="field"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="' + type + '" autocomplete="' + ac + '"' +
      (type === "tel" ? ' inputmode="tel"' : "") + (required ? ' required aria-required="true"' : "") + ' value="' + esc(val || "") + '"></div>';
  }

  // ---------- Submit: email Tanya, then show the results page ----------
  function submit(e) {
    e.preventDefault();
    var f = { name: val("cp-fullname"), email: val("cp-email"), phone: val("cp-phone"), business: val("cp-business") };
    var err = document.getElementById("cp-error"), btn = document.getElementById("cp-submit");
    var problem = null, bad = null;
    if (f.name.split(/\s+/).filter(Boolean).length < 2) { problem = "Please enter your full name (first and last)."; bad = "cp-fullname"; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)) { problem = "Please enter a valid email address."; bad = "cp-email"; }
    else if (f.phone.replace(/\D/g, "").length < 10) { problem = "Please enter your mobile number, including the area code."; bad = "cp-phone"; }
    root.querySelectorAll("input").forEach(function (i) { i.removeAttribute("aria-invalid"); });
    if (problem) { err.textContent = problem; var el = document.getElementById(bad); el.setAttribute("aria-invalid", "true"); el.focus(); return; }
    err.textContent = "";
    store("cp_contact", JSON.stringify(f));
    if (document.getElementById("cp-hp").value) { finish(f, true); return; } // bot: skip sending

    btn.disabled = true; btn.textContent = "Sending your results…";
    var r = result(), link = SITE + "/" + resultsPath(r, f.name);
    var p = PROFILES[r.dom], sp = PROFILES[r.second];
    var payload = {
      _subject: "Colour Profile: " + f.name + " is " + NAME[r.dom] + " (" + p.type + ")",
      _template: "table",
      _captcha: "false",
      "Full name": f.name,
      email: f.email,
      "Mobile": f.phone,
      "Business": f.business || "Not given",
      "Main colour": NAME[r.dom] + ", " + p.type + " (" + p.tag + ")",
      "Secondary colour": NAME[r.second] + ", " + sp.type,
      "Scores": r.sorted.map(function (x) { return NAME[x[0]] + " " + pct(x[1]) + "% (" + x[1] + "/12)"; }).join(" · "),
      "Results page": link,
      "Completed": new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })
    };
    QUESTIONS.forEach(function (q, i) { payload["Q" + (i + 1) + ". " + q.t] = state.picks[i] + " [" + NAME[state.answers[i]] + "]"; });

    var done = false;
    var timer = setTimeout(function () { if (!done) { done = true; finish(f, false); } }, 10000);
    fetch(RESULTS_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(payload) })
      .then(function (res) { return res.json().catch(function () { return {}; }).then(function (j) { return res.ok && String(j.success) !== "false"; }); })
      .catch(function () { return false; })
      .then(function (ok) { if (done) return; done = true; clearTimeout(timer); finish(f, ok); });
  }
  function val(id) { return (document.getElementById(id).value || "").trim().replace(/\s+/g, " "); }

  function finish(f, sent) {
    var r = result(), path = resultsPath(r, f.name);
    store("cp_last", path); store("cp_last_name", f.name);
    try { sessionStorage.setItem("cp_status", sent ? "sent" : "failed"); } catch (e) {}
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
