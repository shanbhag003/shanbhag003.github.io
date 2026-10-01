/* shanbhag003.com — portfolio assistant. No dependencies.
   The LLM (Phase 2, via a Cloudflare Worker) only ever CLASSIFIES a question
   into one of the intent ids below; every answer shown comes from kb.json, so
   the visitor only ever sees hand-vetted copy. With no Worker set, or if it
   fails, the widget falls back to local keyword matching. */
(function () {
  "use strict";

  /* ---- Phase 2: paste your deployed Worker URL here to enable LLM routing.
     Leave empty to run on local keyword matching only. ---- */
  var WORKER_URL = "";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var kb = null;            // loaded from kb.json on first open
  var panel = null, list = null, input = null, launcher = null, startersEl = null;
  var open = false, built = false, loading = false, scrollY = 0;
  var lastFocus = null;

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  /* filler words that carry no topic signal — dropped before matching so a
     phrase like "tell me about the cricket project" routes on "cricket". */
  var STOP = ("about tell the a an me my your is are am was were to of for in on at and or " +
    "please want need know show give this that it i he she his her him has have had can could " +
    "would should will do does did what how why when where which be been get got some any " +
    "with as by from so just").split(" ").reduce(function (o, w) { o[w] = 1; return o; }, {});

  /* local intent match: count an intent's tags that appear as whole words in the
     question (filler removed). Earliest intent wins ties, so kb.json lists the
     specific projects before the generic overview. Returns an id or null. */
  function localMatch(text) {
    if (!kb) return null;
    var words = text.toLowerCase().replace(/[^a-z0-9\s'-]/g, " ").split(/\s+/)
      .filter(function (w) { return w && !STOP[w]; });
    if (!words.length) return null;
    var best = null, bestScore = 0;
    kb.intents.forEach(function (it) {
      var score = 0;
      (it.tags || []).forEach(function (tag) { if (words.indexOf(tag) !== -1) score += 1; });
      if (score > bestScore) { bestScore = score; best = it.id; }
    });
    return bestScore >= 1 ? best : null;
  }

  function answerFor(id) {
    if (!id || !kb) return null;
    for (var i = 0; i < kb.intents.length; i++) if (kb.intents[i].id === id) return kb.intents[i].a;
    return null;
  }

  /* ask the Worker to classify; resolve to an intent id or "none".
     Falls back to local matching on any error or if no Worker is configured. */
  function resolveIntent(text) {
    if (!WORKER_URL) return Promise.resolve(localMatch(text));
    var menu = kb.intents.map(function (it) { return { id: it.id, q: it.q }; });
    return fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, intents: menu })
    }).then(function (r) {
      if (!r.ok) throw new Error("bad status");
      return r.json();
    }).then(function (data) {
      var id = data && data.id;
      if (!id || id === "none") return null;
      return answerFor(id) ? id : localMatch(text);
    }).catch(function () {
      return localMatch(text);
    });
  }

  /* ---------- messages ---------- */
  function addMsg(who, html) {
    var row = el("div", "cb-msg cb-" + who);
    var bubble = el("div", "cb-bubble", html);
    row.appendChild(bubble);
    list.appendChild(row);
    list.scrollTop = list.scrollHeight;
    return bubble;
  }

  function thinking() {
    var row = el("div", "cb-msg cb-bot cb-thinking");
    row.appendChild(el("div", "cb-bubble", '<span class="cb-dots"><i></i><i></i><i></i></span>'));
    list.appendChild(row);
    list.scrollTop = list.scrollHeight;
    return row;
  }

  function send(text) {
    text = (text || "").trim();
    if (!text || !kb) return;
    if (startersEl) startersEl.hidden = true;
    addMsg("user", esc(text));
    input.value = "";
    var wait = thinking();
    var started = Date.now();
    resolveIntent(text).then(function (id) {
      var delay = Math.max(0, 420 - (Date.now() - started)); // minimum beat so it never flickers
      setTimeout(function () {
        if (wait.parentNode) wait.parentNode.removeChild(wait);
        addMsg("bot", (id && answerFor(id)) || kb.fallback);
      }, reduce ? 0 : delay);
    });
  }

  /* ---------- panel build ---------- */
  function buildPanel() {
    if (built) return;
    built = true;

    panel = el("div", "cb-panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "cb-title");
    panel.hidden = true;

    var head = el("div", "cb-head");
    head.appendChild(el("div", "cb-title", '<span class="cb-dot" aria-hidden="true"></span><span id="cb-title">Ask about this portfolio</span>'));
    var close = el("button", "cb-close");
    close.type = "button";
    close.setAttribute("aria-label", "Close assistant");
    close.innerHTML = "&times;";
    close.addEventListener("click", closePanel);
    head.appendChild(close);
    panel.appendChild(head);

    list = el("div", "cb-list");
    list.setAttribute("aria-live", "polite");
    list.setAttribute("aria-atomic", "false");
    panel.appendChild(list);

    startersEl = el("div", "cb-starters");
    panel.appendChild(startersEl);

    var form = el("form", "cb-form");
    input = el("input", "cb-input");
    input.type = "text";
    input.setAttribute("aria-label", "Type your question");
    input.setAttribute("placeholder", "Type your question…");
    input.setAttribute("autocomplete", "off");
    var sendBtn = el("button", "cb-send");
    sendBtn.type = "submit";
    sendBtn.setAttribute("aria-label", "Send");
    sendBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.4 20.4 21 12 3.4 3.6 3.39 10.2 15 12l-11.61 1.8z"/></svg>';
    form.appendChild(input);
    form.appendChild(sendBtn);
    form.addEventListener("submit", function (e) { e.preventDefault(); send(input.value); });
    panel.appendChild(form);

    panel.addEventListener("keydown", trapKey);
    document.body.appendChild(panel);
  }

  function renderStarters() {
    if (!startersEl || !kb) return;
    startersEl.innerHTML = "";
    (kb.starters || []).forEach(function (s) {
      var b = el("button", "cb-chip", esc(s));
      b.type = "button";
      b.addEventListener("click", function () { send(s); });
      startersEl.appendChild(b);
    });
    startersEl.hidden = false;
  }

  function greet() {
    if (list.childNodes.length === 0 && kb.greeting) addMsg("bot", esc(kb.greeting));
  }

  /* ---------- open / close ---------- */
  function lockScroll() {
    scrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = "fixed";
    document.body.style.top = -scrollY + "px";
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }
  function unlockScroll() {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, scrollY);
  }
  function isMobile() { return window.matchMedia("(max-width: 640px)").matches; }

  function loadKB() {
    if (kb || loading) return Promise.resolve(kb);
    loading = true;
    return fetch("/kb.json").then(function (r) { return r.json(); }).then(function (data) {
      kb = data; loading = false; return kb;
    }).catch(function () {
      loading = false;
      kb = { intents: [], starters: [], greeting: "", fallback: "Sorry, the assistant could not load. Please email kshanbhag231@gmail.com." };
      return kb;
    });
  }

  function openPanel() {
    buildPanel();
    lastFocus = document.activeElement;
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    open = true;
    if (isMobile()) { document.documentElement.classList.add("cb-open"); lockScroll(); }
    loadKB().then(function () {
      renderStarters();
      greet();
      setTimeout(function () { input && input.focus(); }, reduce ? 0 : 160);
    });
  }

  function closePanel() {
    if (!open) return;
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    open = false;
    if (document.documentElement.classList.contains("cb-open")) { document.documentElement.classList.remove("cb-open"); unlockScroll(); }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function trapKey(e) {
    if (e.key === "Escape") { e.preventDefault(); closePanel(); return; }
    if (e.key !== "Tab") return;
    var f = panel.querySelectorAll('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])');
    f = Array.prototype.filter.call(f, function (n) { return !n.disabled && n.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- launcher ---------- */
  function init() {
    launcher = el("button", "cb-launch");
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Ask about this portfolio");
    launcher.setAttribute("aria-expanded", "false");
    launcher.innerHTML =
      '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M12 3C6.98 3 3 6.58 3 11c0 2.4 1.2 4.54 3.1 6.0-.15 1.1-.6 2.2-1.3 3.1-.2.25-.03.62.29.6 1.9-.12 3.5-.75 4.6-1.5.73.17 1.5.26 2.3.26 5.02 0 9-3.58 9-8s-3.98-8-9-8z"/>' +
      '</svg>';
    launcher.addEventListener("click", function () { open ? closePanel() : openPanel(); });
    document.body.appendChild(launcher);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
