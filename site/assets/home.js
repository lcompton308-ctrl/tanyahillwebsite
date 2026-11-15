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
})();
