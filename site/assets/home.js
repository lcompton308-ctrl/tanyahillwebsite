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

  // Testimonial cards: drift slowly from side to side; pause while someone is touching or hovering
  document.querySelectorAll("[data-marquee]").forEach(function (box) {
    var track = box.querySelector(".marquee-track");
    function setup() {
      var extra = track.scrollWidth - box.clientWidth;
      var dist = extra > 8 ? extra : 28;                      // cards that fit still sway a little
      track.style.setProperty("--sway", -dist + "px");
      track.style.setProperty("--sway-time", Math.max(8, dist / 18) + "s");
      box.classList.add("drift");
    }
    setup();
    window.addEventListener("resize", setup);
    var t;
    box.addEventListener("touchstart", function () { box.classList.add("paused"); clearTimeout(t); }, { passive: true });
    box.addEventListener("touchend", function () { t = setTimeout(function () { box.classList.remove("paused"); }, 3000); });
  });
})();
