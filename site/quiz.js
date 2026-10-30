// Behaviour Colour Profile quiz. Content lives in quiz-data.js (PROFILES, QUESTIONS, HEX, BG).
(function () {
  var root = document.getElementById("quiz");
  if (!root || typeof QUESTIONS === "undefined") return;

  var TANYA_WA = "447714541600";
  var TEXT = { red: "#b03224", yellow: "#7d6300", green: "#1a7340", blue: "#1a5276" };
  var NAME = { red: "Red", yellow: "Yellow", green: "Green", blue: "Blue" };
  var state = { screen: "intro", q: 0, answers: [], opts: [], locked: false };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pct(v) { return Math.round(v / QUESTIONS.length * 100); }
  function vars(col) { return "--c:" + HEX[col] + ";--ct:" + TEXT[col] + ";--tint:" + BG[col]; }
  function savedName() { try { return localStorage.getItem("cp_name") || ""; } catch (e) { return ""; } }
  function focusTop() { root.setAttribute("tabindex", "-1"); root.focus({ preventScroll: true }); window.scrollTo({ top: root.getBoundingClientRect().top + window.scrollY - 90, behavior: reduce ? "auto" : "smooth" }); }

  function result() {
    var s = { red: 0, yellow: 0, green: 0, blue: 0 };
    state.answers.forEach(function (c) { s[c]++; });
    var sorted = Object.keys(s).map(function (k) { return [k, s[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
    return { dom: sorted[0][0], second: sorted[1][0], sorted: sorted };
  }

  function intro() {
    var chips = root.querySelector(".colour-chips");
    var html = '<div class="quiz-card quiz-intro"><button class="btn btn-ink" type="button" id="start" style="margin:0 0 18px">Start the Colour Profile</button>' + (chips ? chips.outerHTML : "") + '</div>';
    root.innerHTML = html;
    document.getElementById("start").onclick = function () { state.screen = "quiz"; state.q = 0; state.answers = []; state.opts = shuffle(QUESTIONS[0].o); render(); focusTop(); };
  }

  function question() {
    var q = QUESTIONS[state.q];
    var html = '<div class="quiz-card">' +
      '<div class="progress" role="progressbar" aria-label="Progress" aria-valuemin="0" aria-valuemax="' + QUESTIONS.length + '" aria-valuenow="' + state.q + '"><i style="width:' + pct(state.q) + '%"></i></div>' +
      '<div class="q-meta"><span>Question ' + (state.q + 1) + ' of ' + QUESTIONS.length + '</span><button class="q-back" type="button" id="back"' + (state.q === 0 ? " hidden" : "") + '>← Back</button></div>' +
      '<h2 class="q-text" id="qt">' + esc(q.t) + '</h2><div class="options" role="group" aria-labelledby="qt">';
    state.opts.forEach(function (o, i) { html += '<button class="option" type="button" data-i="' + i + '">' + esc(o.x) + '</button>'; });
    root.innerHTML = html + '</div></div>';
    root.querySelectorAll(".option").forEach(function (b) {
      b.onclick = function () { pick(b, state.opts[+b.getAttribute("data-i")].c); };
    });
    var back = document.getElementById("back");
    back.onclick = function () {
      state.q--; state.answers.length = state.q; state.opts = shuffle(QUESTIONS[state.q].o); render();
      var first = root.querySelector(".option"); if (first) first.focus();
    };
  }

  function pick(btn, colour) {
    if (state.locked) return;
    state.locked = true;
    btn.classList.add("picked");
    setTimeout(function () {
      state.answers[state.q] = colour; state.answers.length = state.q + 1;
      if (state.q + 1 < QUESTIONS.length) { state.q++; state.opts = shuffle(QUESTIONS[state.q].o); }
      else state.screen = "results";
      state.locked = false; render();
      if (state.screen === "results") focusTop();
      else { var first = root.querySelector(".option"); if (first) first.focus({ preventScroll: true }); }
    }, reduce ? 60 : 280);
  }

  function list(items, cls) { return '<ul class="tick-list ' + cls + '">' + items.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; }

  function results() {
    var r = result(), p = PROFILES[r.dom], sp = PROFILES[r.second];
    var bars = r.sorted.map(function (e) {
      return '<div class="bar-row" style="' + vars(e[0]) + '"><b>' + NAME[e[0]] + '</b><div class="bar-track"><i data-w="' + pct(e[1]) + '"></i></div><span>' + pct(e[1]) + '%</span></div>';
    }).join("");
    var tips = p.tips.map(function (t) { return "<li><b>" + esc(t.title) + "</b><p>" + esc(t.text) + "</p></li>"; }).join("");
    root.innerHTML =
      '<div class="quiz-card">' +
      '<div class="result-banner" style="' + vars(r.dom) + '"><p class="eyebrow">Your colour: ' + NAME[r.dom] + '</p><h2>' + esc(p.type) + '</h2><p class="tag">' + esc(p.tag) + '</p></div>' +
      '<div class="res-sec"><h3>Who you are</h3><p>' + esc(p.summary) + '</p>' +
      '<p class="muted" style="margin-top:10px">Secondary colour: <strong style="color:' + TEXT[r.second] + '">' + NAME[r.second] + ', ' + esc(sp.type) + '</strong></p></div>' +
      '<div class="res-sec"><h3>Your scores</h3><div class="bars">' + bars + '</div></div>' +
      '<div class="res-sec two-lists"><div><h3>Strengths</h3>' + list(p.strengths, "good") + '</div><div><h3>Watch outs</h3>' + list(p.watchouts, "warn") + '</div></div>' +
      '<div class="res-sec two-lists"><div><h3>What motivates you</h3>' + list(p.motivates, "good") + '</div><div><h3>What drains you</h3>' + list(p.drains, "drain") + '</div></div>' +
      '<div class="res-sec"><h3>How to work with a ' + NAME[r.dom] + '</h3><p class="working">' + esc(p.workingWith) + '</p></div>' +
      '<div class="res-sec"><h3>Development tips</h3><ol class="tips">' + tips + '</ol></div>' +
      '<div class="res-sec share-box"><h3>Talk it through with me</h3><p style="margin-top:6px">Send your result to me on WhatsApp and we can talk about what it means for you and your team. Or share your results card with your team and compare colours.</p>' +
      '<div class="field" style="margin-top:14px"><label for="cp-name">Your name (optional)</label><input id="cp-name" type="text" autocomplete="name" maxlength="40" placeholder="e.g. Sarah"></div>' +
      '<button class="btn btn-gold" type="button" id="cp-wa"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>Send my result to Tanya</button>' +
      '<button class="btn btn-line" type="button" id="cp-card">Share my results card</button></div>' +
      '<div class="btn-row" style="margin-top:22px;justify-content:center"><button class="btn btn-line" type="button" id="retake">Retake the quiz</button></div>' +
      '<canvas id="cp-canvas" width="1080" height="1350" hidden></canvas></div>';

    var nm = document.getElementById("cp-name");
    nm.value = savedName();
    nm.oninput = function () { try { localStorage.setItem("cp_name", nm.value); } catch (e) {} };
    document.getElementById("cp-wa").onclick = function () { sendToTanya(r, nm.value.trim()); };
    document.getElementById("cp-card").onclick = function () { shareCard(r, nm.value.trim()); };
    document.getElementById("retake").onclick = function () { state.screen = "intro"; render(); focusTop(); };
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      root.querySelectorAll(".bar-track i").forEach(function (i) { i.style.width = i.getAttribute("data-w") + "%"; });
    }); });
  }

  // Sharing
  function lines(r) {
    var p = PROFILES[r.dom];
    return ["Main colour: " + NAME[r.dom] + ", " + p.type + " (" + p.tag + ")",
      "Secondary colour: " + NAME[r.second] + ", " + PROFILES[r.second].type,
      "Scores: " + r.sorted.map(function (e) { return NAME[e[0]] + " " + pct(e[1]) + "%"; }).join(" · ")];
  }
  function sendToTanya(r, name) {
    var msg = "Hi Tanya, I've just done the Behaviour Colour Profile.\n\n" + (name ? "Name: " + name + "\n" : "") + lines(r).join("\n") + "\n\nI'd love to talk through what it means for me.";
    window.location.href = "https://wa.me/" + TANYA_WA + "?text=" + encodeURIComponent(msg);
  }
  function shareText(r, name) {
    var p = PROFILES[r.dom];
    return (name ? name + "'s" : "My") + " Behaviour Colour Profile: " + NAME[r.dom] + ", " + p.type + " (" + p.tag + ").\n\nWhat's your colour? Take it free at " + location.origin.replace(/^file:.*/, "https://tanyahill.co.uk") + "/colour-profile.html";
  }

  function rr(ctx, x, y, w, h, rad) { ctx.beginPath(); ctx.moveTo(x + rad, y); ctx.arcTo(x + w, y, x + w, y + h, rad); ctx.arcTo(x + w, y + h, x, y + h, rad); ctx.arcTo(x, y + h, x, y, rad); ctx.arcTo(x, y, x + w, y, rad); ctx.closePath(); }
  function fit(ctx, text, size, weight, fam, maxW) { do { ctx.font = weight + " " + size + "px " + fam; size -= 2; } while (ctx.measureText(text).width > maxW && size > 14); }
  function spacing(ctx, px) { if ("letterSpacing" in ctx) ctx.letterSpacing = px + "px"; }

  function drawCard(r, name, logo) {
    var c = document.getElementById("cp-canvas"), ctx = c.getContext("2d"), W = c.width, H = c.height, p = PROFILES[r.dom];
    var HEAD = "Poppins, 'Avenir Next', sans-serif", BODY = "'DM Sans', system-ui, sans-serif";
    ctx.fillStyle = "#faf7f0"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#1a1814"; ctx.fillRect(0, 0, W, 300);
    ctx.fillStyle = "#d3a13e"; ctx.fillRect(0, 300, W, 8);
    if (logo) { var lw = 470, lh = lw * logo.height / logo.width; ctx.drawImage(logo, (W - lw) / 2, (300 - lh) / 2, lw, lh); }
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    spacing(ctx, 8); ctx.fillStyle = "#7a5a10"; ctx.font = "700 30px " + HEAD; ctx.fillText("BEHAVIOUR COLOUR PROFILE", W / 2, 392);
    var y = 392;
    if (name) { spacing(ctx, 0); ctx.fillStyle = "#1a1814"; fit(ctx, name, 44, "700", HEAD, W - 160); ctx.fillText(name, W / 2, 452); y = 452; }
    // Colour block
    var by = y + 40, bh = 280;
    rr(ctx, 80, by, W - 160, bh, 28); ctx.fillStyle = BG[r.dom]; ctx.fill();
    ctx.save(); rr(ctx, 80, by, W - 160, bh, 28); ctx.clip(); ctx.fillStyle = HEX[r.dom]; ctx.fillRect(80, by, 16, bh); ctx.restore();
    spacing(ctx, 6); ctx.fillStyle = TEXT[r.dom]; ctx.font = "700 30px " + HEAD; ctx.fillText("MY COLOUR: " + NAME[r.dom].toUpperCase(), W / 2, by + 70);
    spacing(ctx, 0); ctx.fillStyle = "#1a1814"; fit(ctx, p.type, 104, "700", HEAD, W - 260); ctx.fillText(p.type, W / 2, by + 180);
    ctx.fillStyle = "#5f5a50"; fit(ctx, p.tag, 34, "500", BODY, W - 260); ctx.fillText(p.tag, W / 2, by + 238);
    // Secondary
    var sy = by + bh + 70;
    ctx.font = "500 32px " + BODY; var s1 = "Secondary colour: ", s2 = NAME[r.second] + ", " + PROFILES[r.second].type;
    var w1 = ctx.measureText(s1).width; ctx.font = "700 32px " + BODY; var w2 = ctx.measureText(s2).width; var sx = (W - w1 - w2) / 2;
    ctx.textAlign = "left"; ctx.font = "500 32px " + BODY; ctx.fillStyle = "#5f5a50"; ctx.fillText(s1, sx, sy);
    ctx.font = "700 32px " + BODY; ctx.fillStyle = TEXT[r.second]; ctx.fillText(s2, sx + w1, sy);
    // Bars
    var y0 = sy + 70;
    r.sorted.forEach(function (e, i) {
      var yy = y0 + i * 66, v = pct(e[1]);
      ctx.textAlign = "left"; ctx.fillStyle = TEXT[e[0]]; ctx.font = "700 34px " + HEAD; ctx.fillText(NAME[e[0]], 110, yy + 12);
      rr(ctx, 290, yy - 10, 600, 24, 12); ctx.fillStyle = "#ebe4d6"; ctx.fill();
      if (v > 0) { rr(ctx, 290, yy - 10, Math.max(24, 600 * v / 100), 24, 12); ctx.fillStyle = HEX[e[0]]; ctx.fill(); }
      ctx.textAlign = "right"; ctx.fillStyle = "#5f5a50"; ctx.font = "600 30px " + BODY; ctx.fillText(v + "%", 975, yy + 12);
    });
    // Footer
    ctx.textAlign = "center"; ctx.fillStyle = "#1a1814"; ctx.fillRect(0, H - 150, W, 150);
    ctx.fillStyle = "#d3a13e"; ctx.font = "700 44px " + HEAD; ctx.fillText("What's your colour?", W / 2, H - 82);
    ctx.fillStyle = "#c9c1b1"; ctx.font = "500 28px " + BODY; ctx.fillText("Take it free at tanyahill.co.uk", W / 2, H - 38);
    return c.toDataURL("image/png");
  }

  function showCard(url) {
    var o = document.createElement("div"); o.className = "card-overlay"; o.setAttribute("role", "dialog"); o.setAttribute("aria-label", "Your results card");
    o.innerHTML = '<img alt="Your colour profile results card" src="' + url + '"><p>Press and hold the image to save or share it.</p><button class="btn btn-gold" type="button">Close</button>';
    o.querySelector("button").onclick = function () { o.remove(); };
    document.body.appendChild(o); o.querySelector("button").focus();
  }

  function shareCard(r, name) {
    var go = function (logo) {
      var url = drawCard(r, name, logo), text = shareText(r, name);
      fetch(url).then(function (x) { return x.blob(); }).then(function (blob) {
        var f = new File([blob], "colour-profile.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [f] })) {
          return navigator.share({ files: [f], text: text }).catch(function (e) { if (e && e.name !== "AbortError") showCard(url); });
        }
        showCard(url);
      }).catch(function () { showCard(url); });
    };
    var ready = document.fonts ? Promise.all([document.fonts.load("700 40px Poppins"), document.fonts.load("500 30px 'DM Sans'")]).catch(function () {}) : Promise.resolve();
    var logo = new Image();
    logo.onload = function () { ready.then(function () { go(logo); }); };
    logo.onerror = function () { ready.then(function () { go(null); }); };
    logo.src = "img/logo-gold.png";
  }
  window.__cpDraw = function (answers, name) { state.answers = answers; return new Promise(function (res) { var l = new Image(); l.onload = function () { res(drawCard(result(), name, l)); }; l.src = "img/logo-gold.png"; }); };

  function render() {
    document.body.classList.toggle("quiz-active", state.screen === "quiz");
    if (state.screen === "intro") intro();
    else if (state.screen === "quiz") question();
    else results();
  }
  render();
})();
