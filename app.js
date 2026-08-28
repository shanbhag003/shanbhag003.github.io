/* shanbhag003.com — motion + project tabs. No dependencies. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- scroll reveal ---------- */
  var targets = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
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
