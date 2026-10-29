// Behaviour Colour Profile — plain JavaScript version of the original React quiz.
(function () {
  var app = document.getElementById('app');
  var prog = document.getElementById('prog');
  var progBar = document.getElementById('progBar');
  var progLabel = document.getElementById('progLabel');

  var state = { screen: 'intro', qIdx: 0, answers: [], opts: [], locked: false };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function tally() {
    var s = { red: 0, yellow: 0, green: 0, blue: 0 };
    state.answers.forEach(function (c) { s[c]++; });
    return s;
  }

  function setProgress() {
    if (state.screen === 'intro') { prog.hidden = true; return; }
    prog.hidden = false;
    var done = state.screen === 'results';
    var pct = Math.round((state.qIdx / QUESTIONS.length) * 100);
    progBar.style.width = (done ? 100 : pct) + '%';
    progLabel.textContent = done ? 'Complete' : pct + '% complete';
  }

  function renderIntro() {
    var cards = Object.keys(PROFILES).map(function (col) {
      var d = PROFILES[col];
      return '<div class="card" style="border-left-color:' + HEX[col] + ';background:' + BG[col] + '">' +
        '<div class="card-lbl" style="color:' + HEX[col] + '">' + esc(d.label) + '</div>' +
        '<p>' + esc(d.tag) + '</p></div>';
    }).join('');
    app.innerHTML = '<div class="scr"><div class="intro-grid">' + cards + '</div>' +
      '<button class="btn-start" id="start">BEGIN ASSESSMENT →</button></div>';
    document.getElementById('start').onclick = startQuiz;
  }

  function renderQuiz() {
    var q = QUESTIONS[state.qIdx];
    var html = '<div class="scr"><div class="q-count">Question ' + (state.qIdx + 1) + ' of ' + QUESTIONS.length + '</div>' +
      '<div class="q-text">' + esc(q.t) + '</div>';
    state.opts.forEach(function (o, i) {
      html += '<button class="opt" data-i="' + i + '">' + esc(o.x) + '</button>';
    });
    app.innerHTML = html + '</div>';
    Array.prototype.forEach.call(app.querySelectorAll('.opt'), function (b) {
      b.onclick = function () { pick(b, state.opts[+b.dataset.i].c); };
    });
  }

  function list(items, icon, iconColor, textColor) {
    return items.map(function (s) {
      return '<div class="item" style="color:' + textColor + '"><span class="item-icon"' +
        (iconColor ? ' style="color:' + iconColor + '"' : '') + '>' + icon + '</span>' + esc(s) + '</div>';
    }).join('');
  }

  function renderResults() {
    var scores = tally();
    var sorted = Object.keys(scores).map(function (k) { return [k, scores[k]]; })
      .sort(function (a, b) { return b[1] - a[1]; });
    var dom = sorted[0][0];
    var p = PROFILES[dom];
    var second = sorted[1] ? sorted[1][0] : null;

    var bars = sorted.map(function (e) {
      var pc = Math.round((e[1] / QUESTIONS.length) * 100);
      return '<div class="score-row"><span class="s-lbl" style="color:' + HEX[e[0]] + '">' + e[0].toUpperCase() + '</span>' +
        '<div class="s-track"><div class="s-fill" data-w="' + pc + '" style="background:' + HEX[e[0]] + '"></div></div>' +
        '<span class="s-pct">' + pc + '%</span></div>';
    }).join('');

    var tips = p.tips.map(function (t, i) {
      return '<div class="tip-row"><div class="tip-num">' + (i + 1) + '</div><div>' +
        '<div class="tip-title">' + esc(t.title) + '</div><div class="tip-text">' + esc(t.text) + '</div></div></div>';
    }).join('');

    app.innerHTML = '<div class="scr">' +
      '<div class="banner" style="background:' + BG[dom] + '">' +
        '<div class="ban-lbl" style="color:' + HEX[dom] + '">YOUR COLOUR PROFILE</div>' +
        '<div class="ban-type">' + esc(p.type) + '</div><div class="ban-tag">' + esc(p.tag) + '</div></div>' +
      '<div class="sec"><div class="sec-t">Who You Are</div><p class="summary">' + esc(p.summary) + '</p>' +
        (second ? '<p class="second">Secondary colour: <span style="color:' + HEX[second] + ';font-weight:600">' +
          second.toUpperCase() + ' — ' + esc(PROFILES[second].type) + '</span></p>' : '') + '</div>' +
      '<div class="sec"><div class="sec-t">Score Breakdown</div>' + bars + '</div>' +
      '<div class="sec"><div class="two-col">' +
        '<div><div class="sec-t">Strengths</div>' + list(p.strengths, '✓', HEX[dom], '#ccc') + '</div>' +
        '<div><div class="sec-t">Watch Outs</div>' + list(p.watchouts, '⚠', null, '#888') + '</div></div></div>' +
      '<div class="sec"><div class="two-col">' +
        '<div><div class="sec-t">What Motivates You</div>' + list(p.motivates, '▸', G.gold, '#ccc') + '</div>' +
        '<div><div class="sec-t">What Drains You</div>' + list(p.drains, '✕', null, '#888') + '</div></div></div>' +
      '<div class="sec"><div class="sec-t">How To Work With A ' + esc(p.type) + '</div>' +
        '<div class="working-box"><div class="working-label">If You Manage or Work With This Person</div>' + esc(p.workingWith) + '</div></div>' +
      '<div class="sec"><div class="sec-t">Development Tips</div>' + tips + '</div>' +
      '<div class="sec share"><div class="sec-t">Share Your Results</div>' +
        '<p class="share-intro">Send your profile to Tanya to talk it through, or share it with your team, friends or partner and compare colours.</p>' +
        '<label class="share-lbl" for="nm">Your name (optional)</label>' +
        '<input id="nm" class="share-in" type="text" autocomplete="name" placeholder="e.g. Sarah" maxlength="40">' +
        '<button class="btn-wa" id="wa"><span class="wa-ic">💬</span> Send to Tanya on WhatsApp</button>' +
        '<button class="btn-share" id="shr">Share results card</button>' +
        '<canvas id="card" width="1080" height="1350" hidden></canvas></div>' +
      '<div class="brand-block"><div class="brand-sm">Supported by</div><div class="brand-name">Tanya Hill Coaching</div>' +
        '<div class="brand-tel">Built Like a Boss · 07714541600</div></div>' +
      '<button class="btn-re" id="retake">↺ Retake Assessment</button></div>';

    document.getElementById('retake').onclick = restart;
    var nm = document.getElementById('nm');
    try { nm.value = localStorage.getItem('cp_name') || ''; } catch (e) {}
    nm.oninput = function () { try { localStorage.setItem('cp_name', nm.value); } catch (e) {} };
    var res = { dom: dom, second: second, sorted: sorted };
    document.getElementById('wa').onclick = function () { sendToTanya(res, nm.value.trim()); };
    document.getElementById('shr').onclick = function () { shareCard(res, nm.value.trim()); };
    // Animate the score bars filling in.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        Array.prototype.forEach.call(app.querySelectorAll('.s-fill'), function (f) { f.style.width = f.dataset.w + '%'; });
      });
    });
  }

  // ── Sharing ──────────────────────────────────────────────
  var TANYA_WA = '447714541600';

  function emoji(col) { return PROFILES[col].label.split(' ')[0]; }
  function colName(col) { return col.charAt(0).toUpperCase() + col.slice(1); }
  function pctOf(v) { return Math.round((v / QUESTIONS.length) * 100); }

  function resultLines(r) {
    var p = PROFILES[r.dom];
    var lines = ['Main colour: ' + emoji(r.dom) + ' ' + colName(r.dom) + ' — ' + p.type + ' (' + p.tag + ')'];
    if (r.second) lines.push('Secondary colour: ' + emoji(r.second) + ' ' + colName(r.second) + ' — ' + PROFILES[r.second].type);
    lines.push('Scores: ' + r.sorted.map(function (e) { return colName(e[0]) + ' ' + pctOf(e[1]) + '%'; }).join(' · '));
    return lines;
  }

  function sendToTanya(r, name) {
    var msg = 'Hi Tanya, I\'ve just done the Behaviour Colour Profile 👋\n\n' +
      (name ? 'Name: ' + name + '\n' : '') + resultLines(r).join('\n') +
      '\n\nI\'d love to talk through what it means for me.';
    window.location.href = 'https://wa.me/' + TANYA_WA + '?text=' + encodeURIComponent(msg);
  }

  function shareText(r, name) {
    var p = PROFILES[r.dom];
    return (name ? name + '\'s' : 'My') + ' Behaviour Colour Profile: ' + emoji(r.dom) + ' ' + colName(r.dom) +
      ' — ' + p.type + '\n' + p.tag + '\n\nWhat\'s your colour? Find out with Tanya Hill Coaching · Built Like a Boss · 07714541600';
  }

  function spaced(ctx, px) { if ('letterSpacing' in ctx) ctx.letterSpacing = px + 'px'; }

  // Shrinks a font until the text fits the given width.
  function fit(ctx, text, size, style, family, maxW) {
    do { ctx.font = style + size + 'px ' + family; size -= 2; } while (ctx.measureText(text).width > maxW && size > 12);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function drawCard(r, name) {
    var c = document.getElementById('card'), ctx = c.getContext('2d');
    var W = c.width, H = c.height, p = PROFILES[r.dom];
    var BB = "'Bebas Neue', sans-serif", DM = "'DM Sans', sans-serif";
    ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';

    // Header
    spaced(ctx, 8); ctx.fillStyle = G.gold; ctx.font = '76px ' + BB; ctx.fillText('TANYA HILL', W / 2, 130);
    spaced(ctx, 12); ctx.fillStyle = '#777'; ctx.font = '500 22px ' + DM; ctx.fillText('— COACHING —', W / 2, 172);
    spaced(ctx, 9); ctx.fillStyle = G.goldD; ctx.font = '38px ' + BB; ctx.fillText('BUILT LIKE A BOSS', W / 2, 222);
    ctx.fillStyle = G.gold; ctx.fillRect(0, 262, W, 5);

    // Title
    var a = 'BEHAVIOUR ', b = 'COLOUR', d = ' PROFILE';
    spaced(ctx, 6); fit(ctx, a + b + d, 60, '', BB, W - 140);
    var wa = ctx.measureText(a).width, wb = ctx.measureText(b).width, wd = ctx.measureText(d).width;
    var x0 = (W - (wa + wb + wd)) / 2; ctx.textAlign = 'left';
    ctx.fillStyle = G.white; ctx.fillText(a, x0, 352);
    ctx.fillStyle = G.gold; ctx.fillText(b, x0 + wa, 352);
    ctx.fillStyle = G.white; ctx.fillText(d, x0 + wa + wb, 352);
    ctx.textAlign = 'center';
    var top = 390;
    if (name) { spaced(ctx, 1); ctx.fillStyle = '#aaa'; fit(ctx, name, 36, '500 ', DM, W - 140); ctx.fillText(name, W / 2, 412); top = 440; }

    // Banner
    roundRect(ctx, 70, top, W - 140, 300, 28); ctx.fillStyle = BG[r.dom]; ctx.fill();
    spaced(ctx, 10); ctx.fillStyle = HEX[r.dom]; ctx.font = '34px ' + BB; ctx.fillText('MY COLOUR PROFILE', W / 2, top + 66);
    spaced(ctx, 6); ctx.fillStyle = '#111'; fit(ctx, p.type.toUpperCase(), 128, '', BB, W - 220); ctx.fillText(p.type.toUpperCase(), W / 2, top + 190);
    spaced(ctx, 1); ctx.fillStyle = '#444'; fit(ctx, p.tag, 34, '400 ', DM, W - 220); ctx.fillText(p.tag, W / 2, top + 252);

    // Secondary
    var y = top + 370;
    if (r.second) {
      spaced(ctx, 1); var fs = 32;
      var s1 = 'Secondary colour: ', s2 = colName(r.second).toUpperCase() + ' — ' + PROFILES[r.second].type;
      var w1, w2;
      do { ctx.font = '400 ' + fs + 'px ' + DM; w1 = ctx.measureText(s1).width;
           ctx.font = '600 ' + fs + 'px ' + DM; w2 = ctx.measureText(s2).width; fs -= 2; } while (w1 + w2 > W - 140 && fs > 12);
      fs += 2;
      var sx = (W - w1 - w2) / 2; ctx.textAlign = 'left';
      ctx.font = '400 ' + fs + 'px ' + DM; ctx.fillStyle = '#888'; ctx.fillText(s1, sx, y);
      ctx.font = '600 ' + fs + 'px ' + DM; ctx.fillStyle = HEX[r.second]; ctx.fillText(s2, sx + w1, y);
      ctx.textAlign = 'center';
    }

    // Score bars
    y += 80;
    spaced(ctx, 4); ctx.font = '44px ' + BB;
    var lw = Math.max.apply(null, r.sorted.map(function (e) { return ctx.measureText(e[0].toUpperCase()).width; }));
    var bx = 110 + lw + 30, bw = 860 - bx;
    r.sorted.forEach(function (e) {
      var pc = pctOf(e[1]);
      ctx.textAlign = 'left'; spaced(ctx, 4); ctx.fillStyle = HEX[e[0]]; ctx.font = '44px ' + BB;
      ctx.fillText(e[0].toUpperCase(), 110, y + 16);
      roundRect(ctx, bx, y - 6, bw, 22, 11); ctx.fillStyle = '#222'; ctx.fill();
      if (pc > 0) { roundRect(ctx, bx, y - 6, Math.max(22, bw * pc / 100), 22, 11); ctx.fillStyle = HEX[e[0]]; ctx.fill(); }
      ctx.textAlign = 'right'; spaced(ctx, 0); ctx.fillStyle = '#999'; ctx.font = '500 32px ' + DM;
      ctx.fillText(pc + '%', 975, y + 16);
      y += 72;
    });
    ctx.textAlign = 'center';

    // Footer
    ctx.fillStyle = '#1e1e1e'; ctx.fillRect(70, H - 190, W - 140, 2);
    spaced(ctx, 6); ctx.fillStyle = G.gold; ctx.font = '52px ' + BB; ctx.fillText("WHAT'S YOUR COLOUR?", W / 2, H - 110);
    spaced(ctx, 2); ctx.fillStyle = '#777'; ctx.font = '500 28px ' + DM;
    ctx.fillText('Tanya Hill Coaching · 07714541600', W / 2, H - 58);
    return c.toDataURL('image/png');
  }

  function shareCard(r, name) {
    var go = function () {
      var url = drawCard(r, name), text = shareText(r, name);
      if (window.AndroidShare) { window.AndroidShare.shareImage(url.split(',')[1], text); return; }
      // On the website: try the phone's share menu, otherwise show the image to save.
      fetch(url).then(function (x) { return x.blob(); }).then(function (blob) {
        var f = new File([blob], 'colour-profile.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [f] })) {
          return navigator.share({ files: [f], text: text }).catch(function (e) { if (e && e.name !== 'AbortError') showCard(url); });
        }
        showCard(url);
      }).catch(function () { showCard(url); });
    };
    var ready = document.fonts
      ? Promise.all([document.fonts.load("40px 'Bebas Neue'"), document.fonts.load("600 30px 'DM Sans'")]).catch(function () {})
      : Promise.resolve();
    ready.then(go);
  }
  function showCard(url) {
    var o = document.createElement('div');
    o.className = 'overlay';
    o.innerHTML = '<img alt="Your colour profile card" src="' + url + '"><p>Press and hold the image to save or share it.</p><button type="button">Close</button>';
    o.querySelector('button').onclick = function () { o.remove(); };
    document.body.appendChild(o);
  }
  window.__drawCard = drawCard; // used by tests

  function render() {
    setProgress();
    if (state.screen === 'intro') renderIntro();
    else if (state.screen === 'quiz') renderQuiz();
    else renderResults();
  }

  function startQuiz() {
    state.screen = 'quiz'; state.qIdx = 0; state.answers = []; state.locked = false;
    state.opts = shuffle(QUESTIONS[0].o);
    render();
  }

  function pick(btn, color) {
    if (state.locked) return;
    state.locked = true;
    btn.classList.add('sel');
    setTimeout(function () {
      state.answers[state.qIdx] = color;
      state.answers.length = state.qIdx + 1;
      if (state.qIdx + 1 < QUESTIONS.length) {
        state.qIdx++;
        state.opts = shuffle(QUESTIONS[state.qIdx].o);
      } else {
        state.screen = 'results';
      }
      state.locked = false;
      render();
      window.scrollTo(0, 0);
    }, 360);
  }

  function restart() {
    state.screen = 'intro'; state.qIdx = 0; state.answers = [];
    render();
    window.scrollTo(0, 0);
  }

  // Called by the Android back button. Returns true if the app handled it.
  window.appBack = function () {
    if (state.screen === 'quiz') {
      if (state.qIdx === 0) { restart(); return true; }
      state.qIdx--;
      state.answers.length = state.qIdx;
      state.opts = shuffle(QUESTIONS[state.qIdx].o);
      render();
      return true;
    }
    if (state.screen === 'results') { restart(); return true; }
    return false;
  };

  render();
})();
