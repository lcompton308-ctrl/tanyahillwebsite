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
      '<div class="brand-block"><div class="brand-sm">Supported by</div><div class="brand-name">Tanya Hill Coaching</div>' +
        '<div class="brand-tel">Built Like a Boss · <a href="tel:07714541600">07714541600</a></div></div>' +
      '<button class="btn-re" id="retake">↺ Retake Assessment</button></div>';

    document.getElementById('retake').onclick = restart;
    // Animate the score bars filling in.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        Array.prototype.forEach.call(app.querySelectorAll('.s-fill'), function (f) { f.style.width = f.dataset.w + '%'; });
      });
    });
  }

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
