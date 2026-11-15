/* Accordion works whether or not motion is reduced */
(function () {
  document.documentElement.classList.add("js-acc");
  document.querySelectorAll("[data-acc]").forEach(function (list) {
    var items = list.querySelectorAll(".acc-item");
    items.forEach(function (item) {
      var btn = item.querySelector(".acc-q");
      btn.addEventListener("click", function () {
        var willOpen = !item.classList.contains("open");
        items.forEach(function (o) { o.classList.remove("open"); o.querySelector(".acc-q").setAttribute("aria-expanded", "false"); });
        if (willOpen) { item.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
      });
    });
  });
  // "See a real example" opens that panel on phones
  document.querySelectorAll('a[href="#example"]').forEach(function (a) {
    a.addEventListener("click", function () { var d = document.getElementById("example"); d = d && d.closest("details"); if (d) d.open = true; });
  });
})();

/* Homepage motion: gentle reveals as sections scroll in, and numbers that count up once.
   Everything is visible without JavaScript, and nothing moves for people who ask for reduced motion. */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("motion");

  function countUp(el) {
    var end = parseInt(el.getAttribute("data-count"), 10), start = null, dur = 1200;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased).toLocaleString("en-GB");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      // stagger siblings that arrive together
      var sibs = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains("reveal"); }) : [];
      el.style.transitionDelay = Math.max(0, sibs.indexOf(el)) * 90 + "ms";
      el.classList.add("in");
      el.querySelectorAll("[data-count]").forEach(countUp);
      if (el.hasAttribute("data-count")) countUp(el);
      io.unobserve(el);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

  document.querySelectorAll(".reveal, .home .big-number").forEach(function (el) { io.observe(el); });

  // Testimonial cards: drift slowly side to side, but people can still swipe or scroll them.
  // Any touch, wheel or drag pauses the drift for a few seconds, then it carries on from there.
  document.querySelectorAll("[data-marquee]").forEach(function (box) {
    var dir = 1, speed = 0.35, paused = false, timer, last = null;
    function fits() { return box.scrollWidth - box.clientWidth < 8; }
    function pause() {
      paused = true; box.classList.add("held"); clearTimeout(timer);
      timer = setTimeout(function () { paused = false; box.classList.remove("held"); last = null; }, 4000);
    }
    ["touchstart", "wheel", "pointerdown", "keydown"].forEach(function (ev) { box.addEventListener(ev, pause, { passive: true }); });
    box.addEventListener("mouseenter", function () { paused = true; });
    box.addEventListener("mouseleave", function () { if (!box.classList.contains("held")) { paused = false; last = null; } });
    var pos = box.scrollLeft;
    function step(t) {
      if (fits()) { box.classList.add("fits"); } else { box.classList.remove("fits"); }
      if (!paused && !fits()) {
        var dt = last ? Math.min(t - last, 50) : 16; last = t;
        if (Math.abs(pos - box.scrollLeft) > 2) pos = box.scrollLeft;   // the visitor moved it
        var max = box.scrollWidth - box.clientWidth;
        pos += dir * speed * dt / 16;
        if (pos >= max) { pos = max; dir = -1; } else if (pos <= 0) { pos = 0; dir = 1; }
        box.scrollLeft = pos;
      } else { last = null; }
      requestAnimationFrame(step);
    }
    box.classList.add("drift");
    requestAnimationFrame(step);
  });
})();
