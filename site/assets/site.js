// Tanya Hill Coaching: small shared behaviours. Everything works without this file; it only adds polish.
(function () {
  var WA_NUMBER = "447714541600";

  // Mobile menu: toggles a class so CSS can animate it open and closed
  var menuBtn = document.querySelector(".menu-btn");
  var mobileNav = document.getElementById("mobile-nav");
  if (menuBtn && mobileNav) {
    var label = menuBtn.querySelector(".label");
    var setOpen = function (open) {
      menuBtn.setAttribute("aria-expanded", String(open));
      mobileNav.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      label.textContent = open ? "Close" : "Menu";
    };
    menuBtn.addEventListener("click", function () { setOpen(menuBtn.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileNav.classList.contains("is-open")) { setOpen(false); menuBtn.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (mobileNav.classList.contains("is-open") && !e.target.closest(".site-header")) setOpen(false);
    });
    mobileNav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
  }

  // Homepage panels start open on laptops, closed on phones
  if (window.matchMedia && window.matchMedia("(min-width: 960px)").matches) {
    document.querySelectorAll("details.fold").forEach(function (d) { d.open = true; });
  }

  // Floating "Book a call": show once the page's first Book button (or the top of the page) has scrolled away
  var fab = document.querySelector(".book-fab");
  if (fab) {
    var anchor = document.querySelector("main .btn-gold") || document.querySelector("main > section");
    if (anchor && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        var e = entries[0];
        fab.classList.toggle("show", !e.isIntersecting && e.boundingClientRect.top < 0);
      }).observe(anchor);
    } else { fab.classList.add("show"); }
  }

  // Year in footer
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Drawing lightbox
  var dialog = document.querySelector("dialog.lightbox");
  if (dialog && dialog.showModal) {
    var lbImg = dialog.querySelector("img"), lbTitle = dialog.querySelector(".lb-title");
    document.querySelectorAll("[data-full]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        lbImg.src = btn.getAttribute("data-full");
        lbImg.alt = btn.querySelector("img") ? btn.querySelector("img").alt : "";
        lbTitle.textContent = btn.getAttribute("data-title") || "";
        dialog.showModal();
      });
    });
    dialog.querySelector(".lb-close").addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
  } else {
    // Old browsers: open the full image in the same tab
    document.querySelectorAll("[data-full]").forEach(function (btn) {
      btn.addEventListener("click", function () { window.location.href = btn.getAttribute("data-full"); });
    });
  }

  // Share a drawing: phone share sheet if available, otherwise WhatsApp
  document.querySelectorAll("[data-share]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var url = new URL(btn.getAttribute("data-share"), window.location.href).href;
      var title = btn.getAttribute("data-share-title") || document.title;
      if (navigator.share) {
        navigator.share({ title: title, text: title + " · Tanya Hill Coaching", url: url }).catch(function () {});
      } else {
        window.open("https://wa.me/?text=" + encodeURIComponent(title + " · Tanya Hill Coaching\n" + url), "_blank", "noopener");
      }
    });
  });

  // Library filters
  var filterBar = document.querySelector(".filters");
  if (filterBar) {
    var items = document.querySelectorAll(".library [data-topic]");
    var count = document.querySelector("[data-count]");
    filterBar.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-filter]");
      if (!b) return;
      filterBar.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      var f = b.getAttribute("data-filter"), shown = 0;
      items.forEach(function (it) {
        var match = f === "all" || it.getAttribute("data-topic").split(" ").indexOf(f) > -1;
        it.hidden = !match; if (match) shown++;
      });
      if (count) count.textContent = shown + (shown === 1 ? " drawing" : " drawings");
    });
    // Open a drawing straight from a shared link (#drawing-id)
    if (location.hash) {
      var target = document.getElementById(location.hash.slice(1));
      if (target) target.classList.add("is-target");
    }
  }

  // Booking helper: builds the WhatsApp message from the optional choices
  var form = document.getElementById("book-form");
  if (form) {
    var preview = document.getElementById("msg-preview");
    var go = document.getElementById("send-wa");
    var build = function () {
      var name = form.elements["name"].value.trim();
      var biz = form.elements["business"].value.trim();
      var topics = Array.prototype.slice.call(form.querySelectorAll('input[name="topic"]:checked')).map(function (i) { return i.value; });
      var times = Array.prototype.slice.call(form.querySelectorAll('input[name="time"]:checked')).map(function (i) { return i.value.toLowerCase(); });
      var msg = "Hi Tanya, I'd like to book a free 30-minute call.";
      if (name) msg += "\n\nI'm " + name + (biz ? " from " + biz : "") + ".";
      else if (biz) msg += "\n\nMy business is " + biz + ".";
      if (topics.length) msg += "\nWhat's on my mind: " + topics.join(", ").toLowerCase() + ".";
      if (times.length) msg += "\nBest time for me: " + times.join(" or ") + ".";
      preview.textContent = msg;
      go.href = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
    };
    form.addEventListener("input", build);
    form.addEventListener("change", build);
    form.addEventListener("submit", function (e) { e.preventDefault(); window.location.href = go.href; });
    build();
  }
})();
