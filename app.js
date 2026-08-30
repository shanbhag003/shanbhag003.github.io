/* shanbhag003.com — motion + project tabs. No dependencies. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- measure the sticky header ----------
     The nav becomes two rows on narrow screens, so its height can't
     be a constant. The sub-nav's sticky offset and every anchor's
     scroll-margin read this variable. */
  var nav = document.querySelector(".nav");
  if (nav) {
    var setNavH = function () {
      document.documentElement.style.setProperty("--nav-h", nav.offsetHeight + "px");
    };
    setNavH();
    window.addEventListener("resize", setNavH);
    window.addEventListener("orientationchange", setNavH);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setNavH);
  }

  /* ---------- mobile menu ----------
     The panel lives inside the header in normal flow, so opening it pushes
     the page down instead of covering it. The header is sticky, though, so
     if you're scrolled down it would cover content — we return to the top
     first, which makes the push visible and means nothing is obscured. */
  var toggle = document.getElementById("nav-toggle");
  if (nav && toggle) {
    var setOpen = function (open) {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      setNavH();
    };

    toggle.addEventListener("click", function () {
      var opening = !nav.classList.contains("open");
      if (opening && window.scrollY > 0) {
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }
      setOpen(opening);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setOpen(false); toggle.focus();
      }
    });

    /* leaving the mobile breakpoint must not strand the panel open */
    var mq = window.matchMedia("(min-width: 681px)");
    var onMQ = function (e) { if (e.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener("change", onMQ);
    else if (mq.addListener) mq.addListener(onMQ);
  }

  /* ---------- scroll reveal ----------
     A tall block (three stacked claim cards on a phone) must not sit
     invisible while occupying space, so this fires the moment any part
     of an element edges into view — and a failsafe reveals everything
     regardless, so content can never be stranded at opacity 0. */
  var targets = document.querySelectorAll(".reveal");
  var showAll = function () {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add("in"); });
  };

  if (reduce || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -40px 0px", threshold: 0 });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
    setTimeout(showAll, 2500);
    window.addEventListener("pageshow", function (e) { if (e.persisted) showAll(); });
  }

  /* ---------- scroll progress ---------- */
  var bar = document.querySelector(".progress");
  if (bar && !reduce) {
    var ticking = false;
    var draw = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(draw); }
    }, { passive: true });
    draw();
  }

  /* ---------- project tabs ----------
     Every panel stays in the DOM, so the HTML a crawler sees is
     complete. Only visibility changes. */
  var tabs = document.querySelectorAll("[role='tab']");
  if (!tabs.length) return;

  function select(id, push) {
    Array.prototype.forEach.call(tabs, function (t) {
      var on = t.getAttribute("aria-controls") === id;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
    });
    Array.prototype.forEach.call(document.querySelectorAll("[role='tabpanel']"), function (p) {
      if (p.id === id) { p.removeAttribute("hidden"); } else { p.setAttribute("hidden", ""); }
    });
    if (push && history.replaceState) history.replaceState(null, "", "#" + id);
  }

  Array.prototype.forEach.call(tabs, function (t, i) {
    t.addEventListener("click", function () {
      select(t.getAttribute("aria-controls"), true);
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
    t.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var next = tabs[(i + d + tabs.length) % tabs.length];
      next.focus();
      select(next.getAttribute("aria-controls"), true);
    });
  });

  /* deep links: /projects.html#fpl opens that panel */
  var hash = (location.hash || "").slice(1);
  var valid = hash && document.getElementById(hash) &&
              document.getElementById(hash).getAttribute("role") === "tabpanel";
  select(valid ? hash : tabs[0].getAttribute("aria-controls"), false);

  window.addEventListener("hashchange", function () {
    var h = (location.hash || "").slice(1);
    var el = h && document.getElementById(h);
    if (el && el.getAttribute("role") === "tabpanel") select(h, false);
  });
})();
