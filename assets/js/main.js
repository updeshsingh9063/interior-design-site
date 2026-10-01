/* ============================================================================
   ANAYA INTERIORS - SITE SCRIPT
   Vanilla, no dependencies. Every module is self-contained and exits quietly
   when its markup is absent, so one file serves all pages.
   ============================================================================ */
(function () {
  "use strict";

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE    = window.matchMedia("(hover:hover) and (pointer:fine)").matches;

  /* ---------------------------------------------------------------------
     1. Preloader
     --------------------------------------------------------------------- */
  function preloader() {
    var el = $(".preloader");
    if (!el) { document.body.classList.add("is-ready"); return; }
    var bar = $(".preloader__bar i", el);
    var pct = $(".preloader__pct", el);
    var p = 0;

    function finish() {
      el.classList.add("is-done");
      document.body.classList.add("is-ready");
      heroIntro();
      window.setTimeout(function () { el.remove(); }, 1200);
    }
    if (REDUCED) { if (pct) pct.textContent = "100"; finish(); return; }

    var timer = window.setInterval(function () {
      p = Math.min(100, p + Math.random() * 18 + 6);
      if (bar) bar.style.transform = "scaleX(" + (p / 100) + ")";
      if (pct) pct.textContent = String(Math.round(p));
      if (p >= 100) { window.clearInterval(timer); window.setTimeout(finish, 320); }
    }, 130);
  }

  /* ---------------------------------------------------------------------
     2. Hero entrance
     --------------------------------------------------------------------- */
  function heroIntro() {
    var hero = $(".hero");
    if (!hero) return;
    var lines  = $$(".hero__title .ln > span", hero);
    var media  = $(".hero__media img", hero);
    var fades  = [$(".hero__sub", hero), $(".hero__tag", hero), $(".hero__cta", hero), $(".hero__scroll", hero)];

    if (REDUCED) {
      lines.forEach(function (l) { l.style.transform = "none"; });
      fades.forEach(function (f) { if (f) f.style.opacity = "1"; });
      if (media) media.style.transform = "scale(1)";
      return;
    }
    if (media) {
      media.style.transition = "transform 2.4s cubic-bezier(.22,1,.36,1)";
      media.style.transform = "scale(1)";
    }
    lines.forEach(function (l, i) {
      l.style.transition = "transform 1.15s cubic-bezier(.22,1,.36,1) " + (i * 110 + 120) + "ms";
      l.style.transform = "translateY(0)";
    });
    fades.forEach(function (f, i) {
      if (!f) return;
      f.style.transition = "opacity .9s cubic-bezier(.22,1,.36,1) " + (600 + i * 130) + "ms";
      f.style.opacity = "1";
    });
  }

  /* ---------------------------------------------------------------------
     3. Header - stick, hide on scroll down, swap over-hero styling
     --------------------------------------------------------------------- */
  function header() {
    var hdr = $(".hdr");
    if (!hdr) return;
    // Any dark banner at the top of the page - the home hero, or an inner
    // page's media header - needs the header drawn in white over it.
    var banner = $(".hero") || $(".phead--media");
    var last = window.scrollY;
    var overBannerUntil = banner ? banner.offsetHeight - 90 : 0;

    function update() {
      var y = window.scrollY;
      hdr.classList.toggle("is-stuck", y > 40);
      if (banner) hdr.classList.toggle("on-hero", y < overBannerUntil);
      // hide only well past the fold, and never while the menu is open
      var menuOpen = document.body.classList.contains("is-locked");
      hdr.classList.toggle("is-hidden", !menuOpen && y > 420 && y > last);
      last = y;
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", function () {
      if (banner) overBannerUntil = banner.offsetHeight - 90;
    });
  }

  /* ---------------------------------------------------------------------
     4. Mobile overlay menu
     --------------------------------------------------------------------- */
  function menu() {
    var btn = $(".burger");
    var panel = $(".menu");
    if (!btn || !panel) return;

    function set(open) {
      btn.classList.toggle("is-open", open);
      panel.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("is-locked", open);
      // stagger the links in
      $$(".menu a", panel).forEach(function (a, i) {
        a.style.transitionDelay = open ? (90 + i * 60) + "ms" : "0ms";
      });
    }
    btn.addEventListener("click", function () { set(!panel.classList.contains("is-open")); });
    $$(".menu a", panel).forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("is-open")) { set(false); btn.focus(); }
    });
  }

  /* ---------------------------------------------------------------------
     5. Scroll reveal
     --------------------------------------------------------------------- */
  /* Deterministic position check rather than IntersectionObserver.
     Reveal animations gate clip-path and opacity, so a missed callback does
     not just skip an animation - it leaves content permanently invisible.
     A direct rect test on scroll cannot strand content that way, and 50-odd
     elements is far too few for the cost to matter. */
  function reveal() {
    var items = $$("[data-rv], .rv-lines");
    if (!items.length) return;

    // stagger groups declared on a parent
    $$("[data-rv-stagger]").forEach(function (group) {
      $$("[data-rv]", group).forEach(function (k, i) { k.style.setProperty("--d", i * 85 + "ms"); });
    });

    function revealAll() { items.forEach(function (el) { el.classList.add("is-in"); }); items = []; }

    if (REDUCED) { revealAll(); return; }

    var ticking = false;
    function check() {
      ticking = false;
      if (!items.length) return;
      var h = window.innerHeight || document.documentElement.clientHeight;
      var still = [];
      for (var i = 0; i < items.length; i++) {
        var el = items[i];
        var r = el.getBoundingClientRect();
        // in view, or already scrolled past (never leave it hidden behind us)
        if (r.top < h * 0.92 && r.bottom > -h) el.classList.add("is-in");
        else still.push(el);
      }
      items = still;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(check);
    }

    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("load", check);
    // last-resort safety: nothing stays hidden forever
    window.setTimeout(check, 1200);
    window.setTimeout(function () {
      items.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < (window.innerHeight || 0)) el.classList.add("is-in");
      });
    }, 4000);
  }

  /* ---------------------------------------------------------------------
     6. Animated counters
     --------------------------------------------------------------------- */
  function counters() {
    var nums = $$("[data-count]");
    if (!nums.length) return;
    if (REDUCED || !("IntersectionObserver" in window)) {
      nums.forEach(function (n) { n.textContent = n.dataset.count; });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, target = parseFloat(el.dataset.count), t0 = null;
        function tick(ts) {
          if (!t0) t0 = ts;
          var k = Math.min(1, (ts - t0) / 1500);
          var eased = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(target * eased).toLocaleString("en-IN");
          if (k < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ---------------------------------------------------------------------
     7. Service rows - cursor-tracking image preview
     --------------------------------------------------------------------- */
  function servicePreview() {
    var rows = $$(".srow[data-preview]");
    if (!rows.length || !FINE || window.innerWidth < 900 || REDUCED) return;

    var pv = document.createElement("div");
    pv.className = "srow-preview";
    pv.setAttribute("aria-hidden", "true");
    pv.innerHTML = rows.map(function (r) {
      return '<img src="' + r.dataset.preview + '" alt="" loading="lazy">';
    }).join("");
    document.body.appendChild(pv);

    var imgs = $$("img", pv);
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null, active = false;

    function loop() {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      pv.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%) scale(" + (active ? 1 : 0.9) + ")";
      raf = requestAnimationFrame(loop);
      if (!active && Math.abs(tx - cx) < 0.5 && Math.abs(ty - cy) < 0.5) {
        cancelAnimationFrame(raf); raf = null;
      }
    }
    rows.forEach(function (r, i) {
      r.addEventListener("mouseenter", function () {
        imgs.forEach(function (im, k) { im.classList.toggle("is-active", k === i); });
        active = true; pv.classList.add("is-on");
        if (!raf) raf = requestAnimationFrame(loop);
      });
      r.addEventListener("mouseleave", function () {
        active = false; pv.classList.remove("is-on");
      });
    });
    document.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
  }

  /* ---------------------------------------------------------------------
     8. Testimonial slider
     --------------------------------------------------------------------- */
  function slider() {
    $$("[data-slider]").forEach(function (root) {
      var track = $(".slider__track", root);
      var slides = $$(".slider__slide", track || root);
      var prev = $("[data-slider-prev]", root);
      var next = $("[data-slider-next]", root);
      if (!track || slides.length < 2) return;

      var i = 0;
      function perView() { return window.innerWidth >= 900 ? 2 : 1; }
      function maxIndex() { return Math.max(0, slides.length - perView()); }

      function go(n) {
        i = Math.max(0, Math.min(n, maxIndex()));
        track.style.transform = "translateX(-" + (i * (100 / perView())) + "%)";
        if (prev) prev.disabled = i === 0;
        if (next) next.disabled = i === maxIndex();
      }
      if (prev) prev.addEventListener("click", function () { go(i - 1); });
      if (next) next.addEventListener("click", function () { go(i + 1); });
      window.addEventListener("resize", function () { go(Math.min(i, maxIndex())); });

      // touch swipe
      var x0 = null;
      root.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      root.addEventListener("touchend", function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 50) go(dx < 0 ? i + 1 : i - 1);
        x0 = null;
      }, { passive: true });

      go(0);
    });
  }

  /* ---------------------------------------------------------------------
     9. Gallery filter + lightbox
     --------------------------------------------------------------------- */
  function gallery() {
    var grid = $("[data-gallery]");
    if (!grid) return;
    var items = $$(".gitem", grid);
    var chips = $$("[data-filter]");
    var empty = $(".gempty");

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var want = chip.dataset.filter;
        chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
        var shown = 0;
        items.forEach(function (it) {
          var match = want === "all" || it.dataset.cat === want;
          it.classList.toggle("is-hidden", !match);
          if (match) shown++;
        });
        if (empty) empty.hidden = shown > 0;
      });
    });

    // Lightbox
    var box = $(".lbox");
    if (!box) return;
    var img = $(".lbox__img", box);
    var cap = $(".lbox__cap", box);
    var idx = 0;

    function visible() { return items.filter(function (it) { return !it.classList.contains("is-hidden"); }); }
    function show(n) {
      var list = visible();
      if (!list.length) return;
      idx = (n + list.length) % list.length;
      var it = list[idx];
      var full = it.dataset.full || $("img", it).src;
      img.src = full;
      img.alt = $("img", it).alt;
      cap.textContent = it.dataset.caption || "";
    }
    function open(it) {
      idx = visible().indexOf(it);
      show(idx);
      box.classList.add("is-open");
      document.body.classList.add("is-locked");
      $(".lbox__close", box).focus();
    }
    function close() {
      box.classList.remove("is-open");
      document.body.classList.remove("is-locked");
    }
    items.forEach(function (it) {
      it.addEventListener("click", function (e) { e.preventDefault(); open(it); });
      it.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(it); }
      });
    });
    $(".lbox__close", box).addEventListener("click", close);
    $(".lbox__nav--prev", box).addEventListener("click", function () { show(idx - 1); });
    $(".lbox__nav--next", box).addEventListener("click", function () { show(idx + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* ---------------------------------------------------------------------
     10. Before / after comparison
     --------------------------------------------------------------------- */
  function beforeAfter() {
    $$(".ba").forEach(function (el) {
      var dragging = false;
      var val = 50;

      function apply(p) {
        val = Math.max(0, Math.min(100, p));
        el.style.setProperty("--pos", val + "%");
        el.setAttribute("aria-valuenow", Math.round(val));
      }
      function fromX(clientX) {
        var r = el.getBoundingClientRect();
        if (!r.width) return;
        apply(((clientX - r.left) / r.width) * 100);
      }

      // Move and release are bound to the window so the drag survives the
      // pointer leaving the element, and does not depend on pointer capture.
      function onMove(e) { if (dragging) { fromX(e.clientX); e.preventDefault(); } }
      function onUp() {
        if (!dragging) return;
        dragging = false;
        el.classList.remove("is-dragging");
      }

      el.addEventListener("pointerdown", function (e) {
        dragging = true;
        el.classList.add("is-dragging");
        try { el.setPointerCapture(e.pointerId); } catch (err) { /* not fatal */ }
        fromX(e.clientX);
        e.preventDefault();
      });
      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      // belt and braces: never let a native drag steal the gesture
      el.addEventListener("dragstart", function (e) { e.preventDefault(); });

      // keyboard
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "slider");
      el.setAttribute("aria-valuemin", "0");
      el.setAttribute("aria-valuemax", "100");
      el.setAttribute("aria-valuenow", "50");
      el.addEventListener("keydown", function (e) {
        var step = e.shiftKey ? 10 : 4;
        if (e.key === "ArrowLeft")  { apply(val - step); e.preventDefault(); }
        if (e.key === "ArrowRight") { apply(val + step); e.preventDefault(); }
        if (e.key === "Home")       { apply(0);  e.preventDefault(); }
        if (e.key === "End")        { apply(100); e.preventDefault(); }
      });

      apply(50);
    });
  }

  /* ---------------------------------------------------------------------
     11. FAQ accordion
     --------------------------------------------------------------------- */
  function faq() {
    $$(".faq__q").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".faq__item");
        var open = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }

  /* ---------------------------------------------------------------------
     12. Enquiry form validation
     --------------------------------------------------------------------- */
  function forms() {
    $$("[data-form]").forEach(function (form) {
      var alertBox = $(".form__alert", form);

      function fail(field, msg) {
        field.classList.add("is-invalid");
        var err = $(".field__err", field);
        if (err) err.textContent = msg;
        var input = $(".input,.select,.textarea", field);
        if (input) input.setAttribute("aria-invalid", "true");
      }
      function clear(field) {
        field.classList.remove("is-invalid");
        var err = $(".field__err", field);
        if (err) err.textContent = "";
        var input = $(".input,.select,.textarea", field);
        if (input) input.removeAttribute("aria-invalid");
      }

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var ok = true, firstBad = null;

        $$(".field", form).forEach(function (field) {
          var input = $(".input,.select,.textarea", field);
          if (!input) return;
          clear(field);
          var v = (input.value || "").trim();

          if (input.hasAttribute("required") && !v) {
            fail(field, "This field is required."); ok = false; firstBad = firstBad || input; return;
          }
          if (v && input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
            fail(field, "Enter a valid email address."); ok = false; firstBad = firstBad || input; return;
          }
          if (v && input.type === "tel" && !/^[0-9+\-\s()]{8,16}$/.test(v)) {
            fail(field, "Enter a valid phone number."); ok = false; firstBad = firstBad || input;
          }
        });

        if (!ok) { if (firstBad) firstBad.focus(); return; }

        // No backend is wired up: confirm in place and reset.
        if (alertBox) {
          alertBox.textContent = "Thank you. Your enquiry has been received. We will call you back within one working day.";
          alertBox.classList.add("is-on");
          alertBox.setAttribute("role", "status");
          alertBox.scrollIntoView({ block: "center", behavior: REDUCED ? "auto" : "smooth" });
        }
        form.reset();
      });

      // clear errors as the user types
      $$(".input,.select,.textarea", form).forEach(function (input) {
        input.addEventListener("input", function () {
          var field = input.closest(".field");
          if (field && field.classList.contains("is-invalid")) clear(field);
        });
      });
    });
  }

  /* ---------------------------------------------------------------------
     13. Floating WhatsApp
     --------------------------------------------------------------------- */
  function floatCta() {
    var wa = $(".wa");
    if (!wa) return;
    function update() { wa.classList.toggle("is-on", window.scrollY > window.innerHeight * 0.55); }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---------------------------------------------------------------------
     14. Custom cursor
     --------------------------------------------------------------------- */
  function cursor() {
    if (!FINE || REDUCED) return;
    var dot = document.createElement("div");
    dot.className = "cursor";
    dot.setAttribute("aria-hidden", "true");
    document.body.appendChild(dot);

    var x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    document.addEventListener("mousemove", function (e) { x = e.clientX; y = e.clientY; }, { passive: true });
    (function loop() {
      cx += (x - cx) * 0.22; cy += (y - cy) * 0.22;
      dot.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();

    document.addEventListener("mouseover", function (e) {
      var t = e.target.closest("a, button, .gitem, .mcard, .srow, input, textarea, select, .ba");
      dot.classList.toggle("is-big", !!t);
    });
  }

  /* ---------------------------------------------------------------------
     15. Footer year
     --------------------------------------------------------------------- */
  function year() {
    $$("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  }

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */
  function init() {
    header(); menu(); reveal(); counters(); servicePreview(); slider();
    gallery(); beforeAfter(); faq(); forms(); floatCta(); cursor(); year();
    preloader();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
