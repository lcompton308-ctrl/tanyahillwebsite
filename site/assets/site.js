// Tanya Hill Coaching: small shared behaviours. Everything works without this file; it only adds polish.
(function () {
  var WA_NUMBER = "447714541600";

  // Mobile menu
  var menuBtn = document.querySelector(".menu-btn");
  var mobileNav = document.getElementById("mobile-nav");
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", function () {
      var open = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!open));
      mobileNav.hidden = open;
      menuBtn.querySelector(".label").textContent = open ? "Menu" : "Close";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") { menuBtn.click(); menuBtn.focus(); }
    });
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
