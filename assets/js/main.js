/* Trivex Industrial Solutions — interactions (vanilla, no deps) */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Splash (home only) ---------- */
  (function () {
    var splash = $("#splash");
    if (!splash) return;
    if (reduce || sessionStorage.getItem("trivexSeen")) { splash.remove(); return; }
    var hide = function () { splash.classList.add("is-hidden"); sessionStorage.setItem("trivexSeen", "1"); setTimeout(function () { splash.remove(); }, 700); };
    window.addEventListener("load", function () { setTimeout(hide, 1000); });
    setTimeout(hide, 2600);
    splash.addEventListener("click", hide);
  })();

  /* ---------- Sticky header (home hero) ---------- */
  var header = $("#siteHeader");
  if (header && !header.classList.contains("site-header--solid")) {
    var onScroll = function () { header.classList.toggle("is-stuck", window.scrollY > 40); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Desktop dropdowns (aria sync) ---------- */
  $$("[data-dropdown]").forEach(function (dd) {
    var toggle = $(".dropdown__toggle", dd);
    var set = function (v) { if (toggle) toggle.setAttribute("aria-expanded", v ? "true" : "false"); };
    dd.addEventListener("mouseenter", function () { set(true); });
    dd.addEventListener("mouseleave", function () { set(false); });
    dd.addEventListener("focusin", function () { set(true); });
    dd.addEventListener("focusout", function () { if (!dd.contains(document.activeElement)) set(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") $$("[data-dropdown] .dropdown__toggle").forEach(function (t) { t.setAttribute("aria-expanded", "false"); t.blur(); });
  });

  /* ---------- Mobile menu + submenus ---------- */
  (function () {
    var toggle = $("#navToggle"), menu = $("#mobileMenu"), close = $("#menuClose");
    if (!toggle || !menu) return;
    var open = function (v) {
      menu.classList.toggle("is-open", v);
      document.body.classList.toggle("menu-open", v);
      toggle.setAttribute("aria-expanded", v ? "true" : "false");
      if (v) { var f = menu.querySelector("a, button"); if (f) f.focus(); } else { toggle.focus(); }
    };
    toggle.addEventListener("click", function () { open(!menu.classList.contains("is-open")); });
    close.addEventListener("click", function () { open(false); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { open(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.classList.contains("is-open")) open(false); });
    $$("[data-mm-group]").forEach(function (g) {
      var btn = $(".mm-toggle", g);
      btn.addEventListener("click", function () {
        var openNow = g.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", openNow ? "true" : "false");
      });
    });
  })();

  /* ---------- Reveal on scroll ---------- */
  (function () {
    var els = $$(".reveal");
    if (reduce || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ---------- Category filters (products + projects) ---------- */
  $$(".filter-bar").forEach(function (bar) {
    var grid = bar.parentElement.querySelector(".product-grid, .proj-grid");
    if (!grid) return;
    var items = $$("[data-cat]", grid);
    var empty = bar.parentElement.querySelector(".product-empty");
    bar.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-filter]"); if (!btn) return;
      $$("button", bar).forEach(function (b) { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
      btn.classList.add("is-active"); btn.setAttribute("aria-selected", "true");
      var f = btn.getAttribute("data-filter"), shown = 0;
      items.forEach(function (c) {
        var show = f === "all" || c.getAttribute("data-cat") === f;
        c.classList.toggle("is-hidden", !show); if (show) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
    });
    // deep-link via hash (e.g. /products/#water)
    var applyHash = function () {
      var h = location.hash.replace("#", "");
      if (!h) return;
      var b = bar.querySelector('button[data-filter="' + h + '"]');
      if (b) b.click();
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
  });

  /* ---------- Tabs (product detail) ---------- */
  $$("[data-tabs]").forEach(function (t) {
    var btns = $$("[data-tab]", t), panels = $$("[data-panel]", t);
    t.addEventListener("click", function (e) {
      var b = e.target.closest("[data-tab]"); if (!b) return;
      var id = b.getAttribute("data-tab");
      btns.forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
      panels.forEach(function (p) { p.classList.toggle("is-active", p.getAttribute("data-panel") === id); });
    });
  });

  /* ---------- Accordion (FAQ) ---------- */
  $$(".acc__q").forEach(function (q) {
    q.addEventListener("click", function () {
      q.setAttribute("aria-expanded", q.getAttribute("aria-expanded") === "true" ? "false" : "true");
    });
  });

  /* ---------- Count-up stats ---------- */
  (function () {
    var nums = $$("[data-count]");
    if (!nums.length) return;
    if (reduce || !("IntersectionObserver" in window)) {
      nums.forEach(function (n) { n.textContent = n.getAttribute("data-count") + (n.getAttribute("data-suffix") || ""); });
      return;
    }
    var run = function (n) {
      var target = parseInt(n.getAttribute("data-count"), 10), suf = n.getAttribute("data-suffix") || "", t0 = null, dur = 1400;
      function step(ts) { if (!t0) t0 = ts; var p = Math.min((ts - t0) / dur, 1); var e = 1 - Math.pow(1 - p, 3);
        n.textContent = Math.round(target * e) + suf; if (p < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    };
    nums.forEach(function (n) { n.textContent = "0" + (n.getAttribute("data-suffix") || ""); });
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } }); }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  })();

  /* ---------- Lightbox (project tiles) ---------- */
  (function () {
    var lb = $("#lightbox"); if (!lb) return;
    var img = $("#lightboxImg"), title = $("#lightboxTitle"), spec = $("#lightboxSpec"), close = $("#lightboxClose");
    var last = null;
    var open = function (el) {
      last = el;
      img.src = el.getAttribute("data-img"); img.alt = el.getAttribute("data-name") || "";
      title.textContent = el.getAttribute("data-name") || ""; spec.textContent = el.getAttribute("data-spec") || "";
      lb.classList.add("is-open"); document.body.classList.add("menu-open"); close.focus();
    };
    var hide = function () { lb.classList.remove("is-open"); document.body.classList.remove("menu-open"); if (last) last.focus(); };
    $$(".proj-tile, [data-lightbox]").forEach(function (c) { c.addEventListener("click", function () { open(c); }); });
    close.addEventListener("click", hide);
    lb.addEventListener("click", function (e) { if (e.target === lb) hide(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lb.classList.contains("is-open")) hide(); });
  })();

  /* ---------- Hero background slideshow (home) ---------- */
  (function () {
    var wrap = $("#heroSlides"); if (!wrap) return;
    var slides = $$(".hero-slide", wrap), dots = $$("#heroDots button");
    if (slides.length < 2) return;
    var i = 0, timer = null, DUR = 5500;
    function go(n) {
      n = (n + slides.length) % slides.length; if (n === i) return;
      slides[i].classList.remove("is-active"); slides[i].setAttribute("aria-hidden", "true");
      if (dots[i]) dots[i].setAttribute("aria-selected", "false");
      i = n; slides[i].classList.add("is-active"); slides[i].removeAttribute("aria-hidden");
      if (dots[i]) dots[i].setAttribute("aria-selected", "true");
    }
    function start() { if (reduce) return; stop(); timer = setInterval(function () { go(i + 1); }, DUR); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    dots.forEach(function (d, n) { d.addEventListener("click", function () { go(n); start(); }); });
    wrap.addEventListener("mouseenter", stop); wrap.addEventListener("mouseleave", start);
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    start();
  })();

  /* ---------- Contact form: prefill + mailto handoff ---------- */
  (function () {
    var form = $("#contactForm"); if (!form) return;
    var status = $("#formStatus");
    // prefill from ?product= / ?service= / ?industry=
    try {
      var q = new URLSearchParams(location.search);
      var readable = function (s) { return (s || "").replace(/-/g, " ").replace(/\b\w/g, function (m) { return m.toUpperCase(); }); };
      var pre = "";
      if (q.get("product")) pre = "I would like a quote for the " + readable(q.get("product")) + ".";
      else if (q.get("service")) pre = "I would like to discuss your " + readable(q.get("service")) + " service.";
      else if (q.get("industry")) pre = "I would like to discuss a solution for " + readable(q.get("industry")) + ".";
      if (pre && form.message && !form.message.value) form.message.value = pre;
    } catch (e) {}
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim(), email = form.email.value.trim(), msg = form.message.value.trim();
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !emailOk || !msg) { status.textContent = "Please add your name, a valid email and a message."; status.className = "form-status err"; return; }
      var body = "Name: " + name + "\nCompany: " + form.company.value.trim() + "\nEmail: " + email +
        "\nPhone: " + form.phone.value.trim() + "\nArea of interest: " + form.interest.value + "\n\n" + msg;
      window.location.href = "mailto:sales@trivexindustrialsolutions.com?subject=" +
        encodeURIComponent("Enquiry from " + name + " — Trivex website") + "&body=" + encodeURIComponent(body);
      status.textContent = "Opening your email app… if nothing happens, email sales@trivexindustrialsolutions.com directly.";
      status.className = "form-status ok"; form.reset();
    });
  })();
})();
