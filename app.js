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

  /* ---------- stat count-up ----------
     The final value is already in the HTML, so it reads correctly with
     JavaScript off, for a crawler, or under reduced-motion. */
  var stats = document.querySelectorAll(".stat-n");
  if (stats.length && !reduce && "IntersectionObserver" in window) {
    var countUp = function (el) {
      var to = parseInt(el.getAttribute("data-to"), 10);
      var suffix = el.getAttribute("data-suffix") || "";
      if (isNaN(to)) return;
      var start = null, dur = 1400;
      var step = function (ts) {
        if (start === null) start = ts;
        var t = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(to * eased) + (t === 1 ? suffix : "");
        if (t < 1) requestAnimationFrame(step);
      };
      el.textContent = "0";
      requestAnimationFrame(step);
    };
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); sio.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    Array.prototype.forEach.call(stats, function (el) { sio.observe(el); });
  }

  /* ---------- custom cursor ring ----------
     Fine pointers only — never on touch. The CSS arrow does the real work;
     this is decoration that trails behind and swells over clickable things.
     Delete this block to remove it without touching anything else. */
  if (!reduce && window.matchMedia("(pointer: fine)").matches) {
    var ring = document.createElement("div");
    ring.className = "cursor-ring";
    ring.setAttribute("aria-hidden", "true");
    document.body.appendChild(ring);

    var mx = 0, my = 0, rx = 0, ry = 0, seen = false;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!seen) { rx = mx; ry = my; seen = true; ring.classList.add("on"); }
      var el = e.target;
      ring.classList.toggle("hot", !!(el.closest && el.closest("a, button, .tab, [role='tab'], label")));
      ring.classList.toggle("dark", !!(el.closest && el.closest(".band-dark, .foot, .nav")));
    }, { passive: true });

    document.addEventListener("mouseleave", function () { ring.classList.remove("on"); });
    document.addEventListener("mouseenter", function () { if (seen) ring.classList.add("on"); });

    (function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
      requestAnimationFrame(loop);
    })();
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
     Sections animate in as a unit: when a block crosses into view its
     children rise in sequence, so the page arrives section by section
     rather than element by element. A failsafe reveals everything
     regardless, so content can never be stranded at opacity 0. */
  var targets = document.querySelectorAll(".reveal");
  var showAll = function () {
    Array.prototype.forEach.call(targets, function (el) {
      el.style.transitionDelay = "";
      el.classList.add("in");
    });
  };

  if (reduce || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    var blocks = document.querySelectorAll("main > section, main > header, .case, footer");
    var revealBlock = function (block) {
      var kids = block.querySelectorAll(".reveal");
      Array.prototype.forEach.call(kids, function (el, i) {
        el.style.transitionDelay = Math.min(i * 90, 540) + "ms";
        el.classList.add("in");
      });
    };

    var bio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { revealBlock(e.target); bio.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -18% 0px", threshold: 0.06 });
    Array.prototype.forEach.call(blocks, function (blk) { bio.observe(blk); });

    /* anything not inside a tracked block still reveals on its own */
    var loose = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); loose.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -40px 0px", threshold: 0 });
    Array.prototype.forEach.call(targets, function (el) {
      if (!el.closest("main > section, main > header, .case, footer")) loose.observe(el);
    });

    setTimeout(showAll, 3000);
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

  /* ---------- accordion rows ----------
     One open at a time. The panel is a real button + aria-expanded so
     it works from the keyboard, and every row's content stays in the
     DOM so a crawler sees all of it. */
  var rowlist = document.getElementById("rowlist");
  if (rowlist) {
    var rows = rowlist.querySelectorAll(".row");
    Array.prototype.forEach.call(rows, function (row) {
      var head = row.querySelector(".row-head");
      if (!head) return;
      head.addEventListener("click", function () {
        var opening = !row.classList.contains("open");
        Array.prototype.forEach.call(rows, function (r) {
          r.classList.remove("open");
          var h = r.querySelector(".row-head");
          if (h) h.setAttribute("aria-expanded", "false");
        });
        if (opening) {
          row.classList.add("open");
          head.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  /* ---------- live model readout ----------
     Pulls the forecast's own output file. If the request fails —
     offline, CORS, repo renamed — the panel says so plainly rather
     than sitting empty. */
  var live = document.getElementById("live-pl");
  if (live) {
    var rowsEl = live.querySelector(".live-rows");
    var whenEl = live.querySelector(".live-when");
    var metaEl = live.querySelector(".live-meta");

    var ago = function (iso) {
      var then = new Date(iso), mins = Math.round((Date.now() - then) / 60000);
      if (isNaN(mins)) return "recently";
      if (mins < 90) return mins + " minutes ago";
      var hrs = Math.round(mins / 60);
      if (hrs < 36) return hrs + " hours ago";
      return Math.round(hrs / 24) + " days ago";
    };

    var fail = function () {
      live.classList.add("is-error");
      whenEl.textContent = "Couldn't reach the model just now";
      metaEl.textContent = "";
      rowsEl.innerHTML = "";
    };

    fetch(live.getAttribute("data-src"), { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        var teams = (d.teams || []).slice(0, 6);
        if (!teams.length) return fail();

        whenEl.textContent = "Refreshed " + ago(d.updated_utc);
        metaEl.textContent = [
          d.label || ("Gameweek " + d.gameweek),
          (d.n_sims ? d.n_sims.toLocaleString() + " simulations" : ""),
          "title probability"
        ].filter(Boolean).join(" · ");

        var max = Math.max.apply(null, teams.map(function (t) { return t.title || 0; })) || 1;
        rowsEl.innerHTML = teams.map(function (t) {
          var pct = ((t.title || 0) * 100);
          return '<li><span class="live-pos">' + t.pos + '</span>' +
                 '<span class="live-team"></span>' +
                 '<span class="live-bar"><i data-w="' + ((t.title || 0) / max * 100) + '"></i></span>' +
                 '<span class="live-val">' + pct.toFixed(1) + '%</span></li>';
        }).join("");
        /* team names set via textContent so nothing from the feed is ever parsed as HTML */
        Array.prototype.forEach.call(rowsEl.querySelectorAll(".live-team"), function (el, i) {
          el.textContent = teams[i].team;
        });
        requestAnimationFrame(function () {
          Array.prototype.forEach.call(rowsEl.querySelectorAll(".live-bar i"), function (el) {
            el.style.width = el.getAttribute("data-w") + "%";
          });
        });
      })
      .catch(fail);
  }

  /* ---------- project rail scroll-spy ----------
     Plain anchor links, so they work with JavaScript off. This only
     adds the active state as you scroll past each case. */
  var rail = document.querySelector(".prail");
  if (rail && "IntersectionObserver" in window) {
    var railLinks = rail.querySelectorAll("a");
    var cases = [];
    Array.prototype.forEach.call(railLinks, function (a) {
      var el = document.getElementById(a.getAttribute("href").slice(1));
      if (el) cases.push({ link: a, el: el });
    });
    if (cases.length) {
      var track = rail.querySelector(".prail-track");
      var ind = rail.querySelector(".prail-ind");
      if (track && ind) track.classList.add("js");

      var slide = function (link) {
        if (!ind || !track) return;
        ind.style.width = link.offsetWidth + "px";
        ind.style.transform = "translateX(" + (link.offsetLeft - 5) + "px)";
      };
      var mark = function (id) {
        cases.forEach(function (c) {
          if (c.el.id === id) { c.link.setAttribute("aria-current", "true"); slide(c.link); }
          else c.link.removeAttribute("aria-current");
        });
      };
      var rio = new IntersectionObserver(function (entries) {
        var best = null;
        entries.forEach(function (e) {
          if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) best = e;
        });
        if (best) mark(best.target.id);
      }, { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] });
      cases.forEach(function (c) { rio.observe(c.el); });
      mark(cases[0].el.id);
      window.addEventListener("resize", function () {
        var cur = rail.querySelector('a[aria-current="true"]');
        if (cur) slide(cur);
      });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          var cur = rail.querySelector('a[aria-current="true"]');
          if (cur) slide(cur);
        });
      }
    }
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
