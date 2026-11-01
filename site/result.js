// Personal results page. A colour page (colour-<colour>.html) becomes a client's own results when its link
// carries #n=<full name>&s=<red>-<yellow>-<green>-<blue> scores. Without that, it's a general page about the colour.
(function () {
  if (typeof PROFILES === "undefined") return;
  var ORDER = ["red", "yellow", "green", "blue"];
  var NAME = { red: "Red", yellow: "Yellow", green: "Green", blue: "Blue" };
  var TEXT = { red: "#b03224", yellow: "#7d6300", green: "#1a7340", blue: "#1a5276" };
  var TOTAL = typeof QUESTIONS !== "undefined" ? QUESTIONS.length : 12;
  var col = (location.pathname.match(/colour-(red|yellow|green|blue)/) || [])[1];
  if (!col) return;

  var params = new URLSearchParams(location.hash.slice(1));
  var name = (params.get("n") || "").trim().slice(0, 60);
  var parts = (params.get("s") || "").split("-").map(Number);
  var valid = parts.length === 4 && parts.every(function (n) { return Number.isInteger(n) && n >= 0 && n <= TOTAL; }) &&
    parts.reduce(function (a, b) { return a + b; }, 0) === TOTAL;

  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function pct(v) { return Math.round(v / TOTAL * 100); }
  function first(n) { return n.split(" ")[0]; }

  var waBase = "https://wa.me/447714541600?text=";

  if (!valid) return; // general colour page: nothing more to do

  // ----- Personalise -----
  var scores = {}; ORDER.forEach(function (k, i) { scores[k] = parts[i]; });
  var sorted = ORDER.map(function (k) { return [k, scores[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
  var second = sorted.filter(function (x) { return x[0] !== col; })[0][0];
  var p = PROFILES[col];

  $all("[data-personal]").forEach(function (el) { el.hidden = false; });
  $all("[data-generic]").forEach(function (el) { el.hidden = true; });
  var greet = $("[data-greet]"); if (greet) greet.textContent = name ? first(name) + ", your colour is" : "Your colour is";
  document.title = (name ? first(name) + "'s" : "My") + " colour: " + NAME[col] + " · Tanya Hill Coaching";
  var pf = $("[data-print-for]");
  if (pf) pf.textContent = "Which Boss Are You?" + (name ? " · " + name : "") + " · " + new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  var bars = $("[data-bars]");
  if (bars) {
    bars.innerHTML = sorted.map(function (e) {
      return '<div class="bar-row" style="--c:var(--' + e[0] + ');--ct:var(--' + e[0] + '-t)"><b>' + NAME[e[0]] + '</b><div class="bar-track"><i data-w="' + pct(e[1]) + '"></i></div><span>' + pct(e[1]) + '%</span></div>';
    }).join("");
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      $all(".bar-track i").forEach(function (i) { i.style.width = i.getAttribute("data-w") + "%"; });
    }); });
  }
  var sec = $("[data-second]");
  if (sec) sec.innerHTML = 'Secondary colour: <strong style="color:' + TEXT[second] + '">' + NAME[second] + ", " + PROFILES[second].type + "</strong>";

  var debrief = $("[data-debrief]");
  if (debrief) debrief.href = waBase + encodeURIComponent("Hi Tanya, it's " + (name || "me") + ". I've done the Which Boss Are You? quiz and I'm a " + NAME[col] + " (" + p.type + "), with " + NAME[second] + " second. I'd like to book a debrief.\n\nMy results: " + location.href);

  // Remember on this device
  try {
    localStorage.setItem("cp_last", "colour-" + col + location.hash);
    if (name) localStorage.setItem("cp_last_name", name);
  } catch (e) {}

  // Just finished? Show whether Tanya received it
  var status = null;
  try { status = sessionStorage.getItem("cp_status"); sessionStorage.removeItem("cp_status"); } catch (e) {}
  var note = $("[data-status]");
  if (note && status) {
    note.hidden = false;
    var sendBtn = function (label) {
      var b = document.createElement("a");
      b.className = "btn btn-gold"; b.style.marginTop = "12px"; b.style.width = "100%";
      b.href = waBase + encodeURIComponent("Hi Tanya, it's " + (name || "me") + ". I've just done the Which Boss Are You? quiz: " + NAME[col] + " (" + p.type + "), " + NAME[second] + " second. Scores: " + sorted.map(function (x) { return NAME[x[0]] + " " + pct(x[1]) + "%"; }).join(", ") + ".\n\nMy results: " + location.href);
      b.textContent = label; note.appendChild(b);
    };
    if (status === "manual") {
      note.classList.add("ok");
      note.innerHTML = "<strong>Want to talk your results through" + (name ? ", " + first(name) : "") + "?</strong> Send them to me on WhatsApp and I'll be in touch. Save this page's link to come back any time.";
      sendBtn("Send my results to Tanya");
    } else if (status === "sent") {
      note.classList.add("ok");
      note.innerHTML = "<strong>Thanks" + (name ? ", " + first(name) : "") + ".</strong> I've received your results and I'll be in touch to talk them through. Save this page's link to come back any time.";
    } else {
      note.classList.add("warn");
      note.innerHTML = "<strong>Your results didn't reach me automatically.</strong> Tap below to send them to me on WhatsApp instead.";
      sendBtn("Send my results on WhatsApp");
    }
  }

  // ----- Keep your results -----
  var copied = $("[data-copied]");
  function say(t) { if (copied) { copied.textContent = t; setTimeout(function () { copied.textContent = ""; }, 4000); } }
  var copyBtn = $("[data-copy]");
  if (copyBtn) copyBtn.onclick = function () {
    var url = location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { say("Link copied. Paste it somewhere safe, like your notes or an email to yourself."); }, function () { prompt("Copy your results link:", url); });
    } else { prompt("Copy your results link:", url); }
  };
  var selfBtn = $("[data-self]");
  if (selfBtn) selfBtn.onclick = function () { shareCard("self"); };
  var pdfBtn = $("[data-pdf]");
  if (pdfBtn) pdfBtn.onclick = function () { savePdf(pdfBtn); };
  var cardBtn = $("[data-card]");
  if (cardBtn) cardBtn.onclick = function () { shareCard("others"); };

  // ----- Share card (image) -----
  function rr(ctx, x, y, w, h, rad) { ctx.beginPath(); ctx.moveTo(x + rad, y); ctx.arcTo(x + w, y, x + w, y + h, rad); ctx.arcTo(x + w, y + h, x, y + h, rad); ctx.arcTo(x, y + h, x, y, rad); ctx.arcTo(x, y, x + w, y, rad); ctx.closePath(); }
  function fit(ctx, text, size, weight, fam, maxW) { do { ctx.font = weight + " " + size + "px " + fam; size -= 2; } while (ctx.measureText(text).width > maxW && size > 14); }
  function spacing(ctx, px) { if ("letterSpacing" in ctx) ctx.letterSpacing = px + "px"; }

  function drawCard(logo) {
    var c = document.createElement("canvas"); c.width = 1080; c.height = 1350;
    var ctx = c.getContext("2d"), W = c.width, H = c.height;
    var HEAD = "Poppins, 'Avenir Next', sans-serif", BODY = "'DM Sans', system-ui, sans-serif";
    var who = name ? first(name) : "";
    ctx.fillStyle = "#faf7f0"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#1a1814"; ctx.fillRect(0, 0, W, 300);
    ctx.fillStyle = "#d3a13e"; ctx.fillRect(0, 300, W, 8);
    if (logo) { var lw = 470, lh = lw * logo.height / logo.width; ctx.drawImage(logo, (W - lw) / 2, (300 - lh) / 2, lw, lh); }
    ctx.textAlign = "center";
    spacing(ctx, 8); ctx.fillStyle = "#7a5a10"; ctx.font = "700 30px " + HEAD; ctx.fillText("WHICH BOSS ARE YOU?", W / 2, 392);
    var y = 392;
    if (who) { spacing(ctx, 0); ctx.fillStyle = "#1a1814"; fit(ctx, who, 44, "700", HEAD, W - 160); ctx.fillText(who, W / 2, 452); y = 452; }
    var by = y + 40, bh = 280;
    rr(ctx, 80, by, W - 160, bh, 28); ctx.fillStyle = BG[col]; ctx.fill();
    ctx.save(); rr(ctx, 80, by, W - 160, bh, 28); ctx.clip(); ctx.fillStyle = HEX[col]; ctx.fillRect(80, by, 16, bh); ctx.restore();
    spacing(ctx, 6); ctx.fillStyle = TEXT[col]; ctx.font = "700 30px " + HEAD; ctx.fillText("MY COLOUR: " + NAME[col].toUpperCase(), W / 2, by + 70);
    spacing(ctx, 0); ctx.fillStyle = "#1a1814"; fit(ctx, p.type, 104, "700", HEAD, W - 260); ctx.fillText(p.type, W / 2, by + 180);
    ctx.fillStyle = "#5f5a50"; fit(ctx, p.tag, 34, "500", BODY, W - 260); ctx.fillText(p.tag, W / 2, by + 238);
    var sy = by + bh + 70;
    ctx.font = "500 32px " + BODY; var s1 = "Secondary colour: ", s2 = NAME[second] + ", " + PROFILES[second].type;
    var w1 = ctx.measureText(s1).width; ctx.font = "700 32px " + BODY; var w2 = ctx.measureText(s2).width; var sx = (W - w1 - w2) / 2;
    ctx.textAlign = "left"; ctx.font = "500 32px " + BODY; ctx.fillStyle = "#5f5a50"; ctx.fillText(s1, sx, sy);
    ctx.font = "700 32px " + BODY; ctx.fillStyle = TEXT[second]; ctx.fillText(s2, sx + w1, sy);
    var y0 = sy + 70;
    sorted.forEach(function (e, i) {
      var yy = y0 + i * 66, v = pct(e[1]);
      ctx.textAlign = "left"; ctx.fillStyle = TEXT[e[0]]; ctx.font = "700 34px " + HEAD; ctx.fillText(NAME[e[0]], 110, yy + 12);
      rr(ctx, 290, yy - 10, 600, 24, 12); ctx.fillStyle = "#ebe4d6"; ctx.fill();
      if (v > 0) { rr(ctx, 290, yy - 10, Math.max(24, 600 * v / 100), 24, 12); ctx.fillStyle = HEX[e[0]]; ctx.fill(); }
      ctx.textAlign = "right"; ctx.fillStyle = "#5f5a50"; ctx.font = "600 30px " + BODY; ctx.fillText(v + "%", 975, yy + 12);
    });
    ctx.textAlign = "center"; ctx.fillStyle = "#1a1814"; ctx.fillRect(0, H - 150, W, 150);
    ctx.fillStyle = "#d3a13e"; ctx.font = "700 44px " + HEAD; ctx.fillText("Which boss are you?", W / 2, H - 82);
    ctx.fillStyle = "#c9c1b1"; ctx.font = "500 28px " + BODY; ctx.fillText("Find yours at tanyahill.co.uk", W / 2, H - 38);
    return c.toDataURL("image/png");
  }

  function showCard(url, waText) {
    var o = document.createElement("div"); o.className = "card-overlay"; o.setAttribute("role", "dialog"); o.setAttribute("aria-label", "Your results card");
    o.innerHTML = '<img alt="Your Which Boss Are You? results card" src="' + url + '"><p>Save the image, then send it on WhatsApp.</p>' +
      '<div class="btn-row" style="justify-content:center"><a class="btn btn-line" download="my-colour-card.png" href="' + url + '">Save image</a>' +
      '<a class="btn btn-gold" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(waText) + '">Open WhatsApp</a>' +
      '<button class="btn btn-line" type="button">Close</button></div>';
    o.querySelector("button").onclick = function () { o.remove(); };
    document.body.appendChild(o); o.querySelector("button").focus();
  }

  function fontsReady() {
    return document.fonts ? Promise.all([document.fonts.load("700 40px Poppins"), document.fonts.load("500 30px 'DM Sans'")]).catch(function () {}) : Promise.resolve();
  }
  function withLogo(src, cb) {
    var logo = new Image();
    logo.onload = function () { fontsReady().then(function () { cb(logo); }); };
    logo.onerror = function () { fontsReady().then(function () { cb(null); }); };
    logo.src = src;
  }

  // Every share sends the card image, with the results link in the message
  function shareCard(mode) {
    var text = mode === "self"
      ? "My Which Boss Are You? results: " + NAME[col] + ", " + p.type + " (" + p.tag + ").\n" + location.href
      : (name ? first(name) + " is" : "I'm") + " a " + NAME[col] + ": " + p.type + " (" + p.tag + ").\n\nWhich boss are you? Find out at https://tanyahill.co.uk/colour-profile";
    withLogo("img/logo-gold.png", function (logo) {
      var url = drawCard(logo);
      fetch(url).then(function (x) { return x.blob(); }).then(function (blob) {
        var f = new File([blob], "my-colour-card.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [f] })) {
          return navigator.share({ files: [f], text: text }).catch(function (e) { if (e && e.name !== "AbortError") showCard(url, text); });
        }
        showCard(url, text);
      }).catch(function () { showCard(url, text); });
    });
  }

  // ----- Save as PDF: draws an A4 results sheet and downloads it as a real PDF file -----
  function wrap(ctx, text, x, y, maxW, lh) {
    var words = String(text).split(" "), line = "";
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = words[i]; } else line = test;
    }
    if (line) { ctx.fillText(line, x, y); y += lh; }
    return y;
  }

  function drawSheet(logo) {
    var c = document.createElement("canvas"); c.width = 1240; c.height = 1754;
    var ctx = c.getContext("2d"), W = c.width, H = c.height, M = 100;
    var HEAD = "Poppins, 'Avenir Next', sans-serif", BODY = "'DM Sans', system-ui, sans-serif";
    ctx.fillStyle = "#faf7f0"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#1a1814"; ctx.fillRect(0, 0, W, 220);
    ctx.fillStyle = "#d3a13e"; ctx.fillRect(0, 220, W, 8);
    if (logo) { var lw = 420, lh = lw * logo.height / logo.width; ctx.drawImage(logo, (W - lw) / 2, (220 - lh) / 2, lw, lh); }
    ctx.textAlign = "left";
    spacing(ctx, 6); ctx.fillStyle = "#7a5a10"; ctx.font = "700 26px " + HEAD; ctx.fillText("WHICH BOSS ARE YOU?", M, 300);
    spacing(ctx, 0);
    ctx.fillStyle = "#1a1814"; ctx.font = "700 46px " + HEAD; ctx.fillText(name ? first(name) + "'s results" : "My results", M, 362);
    ctx.fillStyle = "#5f5a50"; ctx.font = "500 24px " + BODY;
    ctx.fillText(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), M, 402);
    var by = 440, bh = 190;
    rr(ctx, M, by, W - 2 * M, bh, 24); ctx.fillStyle = BG[col]; ctx.fill();
    ctx.save(); rr(ctx, M, by, W - 2 * M, bh, 24); ctx.clip(); ctx.fillStyle = HEX[col]; ctx.fillRect(M, by, 14, bh); ctx.restore();
    spacing(ctx, 5); ctx.fillStyle = TEXT[col]; ctx.font = "700 26px " + HEAD; ctx.fillText("MY COLOUR: " + NAME[col].toUpperCase(), M + 50, by + 56);
    spacing(ctx, 0); ctx.fillStyle = "#1a1814"; fit(ctx, p.type, 68, "700", HEAD, W - 2 * M - 100); ctx.fillText(p.type, M + 50, by + 128);
    ctx.fillStyle = "#5f5a50"; ctx.font = "500 26px " + BODY; ctx.fillText(p.tag, M + 50, by + 168);
    ctx.fillStyle = "#1a1814"; ctx.font = "400 28px " + BODY;
    var y = wrap(ctx, p.summary, M, by + bh + 70, W - 2 * M, 42);
    y += 30; ctx.font = "700 30px " + HEAD; ctx.fillText("My colour mix", M, y); y += 50;
    sorted.forEach(function (e) {
      var v = pct(e[1]);
      ctx.textAlign = "left"; ctx.fillStyle = TEXT[e[0]]; ctx.font = "700 26px " + HEAD; ctx.fillText(NAME[e[0]], M, y + 9);
      rr(ctx, M + 150, y - 10, 760, 20, 10); ctx.fillStyle = "#ebe4d6"; ctx.fill();
      if (v > 0) { rr(ctx, M + 150, y - 10, Math.max(20, 760 * v / 100), 20, 10); ctx.fillStyle = HEX[e[0]]; ctx.fill(); }
      ctx.textAlign = "right"; ctx.fillStyle = "#5f5a50"; ctx.font = "600 24px " + BODY; ctx.fillText(v + "%", W - M, y + 9);
      y += 48;
    });
    ctx.textAlign = "left"; ctx.fillStyle = "#5f5a50"; ctx.font = "500 24px " + BODY;
    ctx.fillText("Secondary colour: " + NAME[second] + ", " + PROFILES[second].type, M, y + 6); y += 70;
    var colW = (W - 2 * M - 40) / 2, x2 = M + colW + 40, yL = y, yR = y;
    ctx.fillStyle = "#1a7340"; ctx.fillRect(M, y - 34, colW, 5); ctx.fillStyle = "#7a5a10"; ctx.fillRect(x2, y - 34, colW, 5);
    ctx.fillStyle = "#1a1814"; ctx.font = "700 28px " + HEAD; ctx.fillText("At my best", M, y + 6); ctx.fillText("My challenges", x2, y + 6);
    yL += 50; yR += 50; ctx.font = "400 24px " + BODY;
    p.strengths.slice(0, 3).forEach(function (t) { ctx.fillStyle = "#1a7340"; ctx.fillText("✓", M, yL); ctx.fillStyle = "#1a1814"; yL = wrap(ctx, t, M + 32, yL, colW - 32, 34) + 10; });
    p.watchouts.slice(0, 3).forEach(function (t) { ctx.fillStyle = "#7a5a10"; ctx.fillText("!", x2 + 6, yR); ctx.fillStyle = "#1a1814"; yR = wrap(ctx, t, x2 + 32, yR, colW - 32, 34) + 10; });
    ctx.fillStyle = "#1a1814"; ctx.fillRect(0, H - 170, W, 170);
    ctx.textAlign = "center"; ctx.fillStyle = "#d3a13e"; ctx.font = "700 34px " + HEAD; ctx.fillText("Let's talk it through", W / 2, H - 104);
    ctx.fillStyle = "#e8e2d4"; ctx.font = "500 24px " + BODY;
    ctx.fillText("WhatsApp 07714 541600  ·  tanya@tanyahill.co.uk  ·  tanyahill.co.uk", W / 2, H - 56);
    return c;
  }

  function jpegPdf(canvas) {
    var bin = atob(canvas.toDataURL("image/jpeg", 0.9).split(",")[1]);
    var PW = 595.28, PH = 841.89, content = "q " + PW + " 0 0 " + PH + " 0 0 cm /Im0 Do Q";
    var objs = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + PW + " " + PH + "] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>",
      "<< /Type /XObject /Subtype /Image /Width " + canvas.width + " /Height " + canvas.height + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + bin.length + " >>\nstream\n" + bin + "\nendstream",
      "<< /Length " + content.length + " >>\nstream\n" + content + "\nendstream"
    ];
    var out = "%PDF-1.4\n%âãÏÓ\n", offs = [];
    objs.forEach(function (o, i) { offs.push(out.length); out += (i + 1) + " 0 obj\n" + o + "\nendobj\n"; });
    var xref = out.length;
    out += "xref\n0 " + (objs.length + 1) + "\n0000000000 65535 f \n";
    offs.forEach(function (n) { out += ("0000000000" + n).slice(-10) + " 00000 n \n"; });
    out += "trailer\n<< /Size " + (objs.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF";
    var bytes = new Uint8Array(out.length);
    for (var i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 255;
    return new Blob([bytes], { type: "application/pdf" });
  }

  function savePdf(btn) {
    var label = btn.querySelector("span"), old = label.textContent;
    label.textContent = "Making PDF…";
    withLogo("img/logo-gold.png", function (logo) {
      try {
        var blob = jpegPdf(drawSheet(logo));
        var url = URL.createObjectURL(blob), a = document.createElement("a");
        a.href = url; a.download = (name ? first(name).replace(/[^A-Za-z0-9-]/g, "") + "-" : "") + "colour-results.pdf";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
        say("PDF saved. Look in your Downloads or Files.");
      } catch (e) { say("Sorry, the PDF couldn't be made on this device. Try Copy my link instead."); }
      label.textContent = old;
    });
  }

  window.__cpSheet = function () { return new Promise(function (res) { withLogo("img/logo-gold.png", function (l) { res(drawSheet(l).toDataURL("image/png")); }); }); };
  window.__cpCard = function () { return new Promise(function (res) { var l = new Image(); l.onload = function () { res(drawCard(l)); }; l.src = "img/logo-gold.png"; }); };
})();
