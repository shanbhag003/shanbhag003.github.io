/* shanbhag003.com — portfolio assistant (private-KB client).
   The knowledge base lives server-side in the Cloudflare Worker, not in any
   public file. The browser sends only the visitor's question and renders the
   single curated answer + follow-ups the Worker returns. No KB is downloaded. */
(function () {
  "use strict";

  var WORKER_URL = "https://portfolio-chat.kshanbhag231.workers.dev";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* non-sensitive UI strings only (safe to be public) */
  var STARTERS = ["Who is Kartik?", "What he's built", "Contact Kartik"];
  var GREETING = "Hi, I'm Cris — I can tell you about Kartik, his experience, and anything he's built, at work or on his own. What would you like to know?";
  var FALLBACK = "Sorry, I couldn't reach the assistant just now. You can email Kartik at kshanbhag231@gmail.com, or try again in a moment.";

  var panel = null, list = null, input = null, launcher = null, suggEl = null;
  var open = false, built = false, scrollY = 0, lastFocus = null;

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

  /* anonymous, per-visit id (sessionStorage, not a tracking cookie) — lets the
     private analytics group one person's questions without identifying anyone */
  function sessionId() {
    try {
      var k = "cb_sid", v = sessionStorage.getItem(k);
      if (!v) { v = Date.now().toString(36) + Math.random().toString(36).slice(2, 8); sessionStorage.setItem(k, v); }
      return v;
    } catch (e) { return "x" + Math.random().toString(36).slice(2, 10); }
  }
  var SID = sessionId();

  /* ask the Worker; it returns the curated answer + follow-ups, or a refusal.
     We also send light, non-identifying context so Kartik can refine the bot:
     how the question arrived, which page, and desktop vs mobile. */
  function rnd() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  function ask(text, source, mid) {
    return fetch(WORKER_URL, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text, sid: SID, mid: mid, source: source || "typed",
        page: location.pathname, device: isMobile() ? "mobile" : "desktop"
      })
    }).then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (d) { return { answer: d && d.answer, follow: d && d.follow }; })
      .catch(function () { return { answer: esc(FALLBACK), follow: STARTERS, _err: true }; });
  }

  /* thumbs up/down under each answer — records whether the reply was helpful */
  var THUMB_UP = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1z"/></svg>';
  var THUMB_DOWN = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05C1.05 11.5 1 11.74 1 12v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/></svg>';

  function sendFeedback(mid, rating, up, down, wrap) {
    try {
      fetch(WORKER_URL + "/feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sid: SID, mid: mid, rating: rating })
      }).catch(function () {});
    } catch (e) {}
    (rating === 1 ? up : down).classList.add("cb-fb-on");
    up.disabled = true; down.disabled = true;
    wrap.classList.add("cb-fb-done");
  }

  function addFeedback(row, mid) {
    if (!mid) return;
    var wrap = el("div", "cb-fb");
    var up = el("button", "cb-fb-btn", THUMB_UP);
    up.type = "button"; up.setAttribute("aria-label", "Helpful answer");
    var down = el("button", "cb-fb-btn", THUMB_DOWN);
    down.type = "button"; down.setAttribute("aria-label", "Not a helpful answer");
    up.addEventListener("click", function () { sendFeedback(mid, 1, up, down, wrap); });
    down.addEventListener("click", function () { sendFeedback(mid, -1, up, down, wrap); });
    wrap.appendChild(up); wrap.appendChild(down);
    row.appendChild(wrap);
  }

  var BOT_AVATAR =
    '<span class="cb-ava" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14">' +
    '<path fill="currentColor" d="M12 2l1.6 4.8L18 8l-4.4 1.2L12 14l-1.6-4.8L6 8l4.4-1.2z"/>' +
    '<circle fill="currentColor" cx="6" cy="17" r="1.6"/><circle fill="currentColor" cx="18" cy="17" r="1.6"/></svg></span>';

  function addMsg(who, html) {
    var row = el("div", "cb-msg cb-" + who);
    if (who === "bot") row.insertAdjacentHTML("beforeend", BOT_AVATAR);
    row.appendChild(el("div", "cb-bubble", html));
    list.appendChild(row);
    list.scrollTop = list.scrollHeight;
    return row;
  }
  function thinking() {
    var row = el("div", "cb-msg cb-bot cb-thinking");
    row.insertAdjacentHTML("beforeend", BOT_AVATAR);
    row.appendChild(el("div", "cb-bubble", '<span class="cb-dots"><i></i><i></i><i></i></span>'));
    list.appendChild(row);
    list.scrollTop = list.scrollHeight;
    return row;
  }

  function renderSuggestions(items, src) {
    if (!suggEl) return;
    suggEl.innerHTML = "";
    if (!items || !items.length) { suggEl.hidden = true; return; }
    items.forEach(function (s) {
      var b = el("button", "cb-chip", esc(s));
      b.type = "button";
      b.addEventListener("click", function () { send(s, src || "pill"); });
      suggEl.appendChild(b);
    });
    suggEl.hidden = false;
    list.scrollTop = list.scrollHeight;
  }

  function send(text, source) {
    text = (text || "").trim();
    if (!text) return;
    renderSuggestions(null);
    addMsg("user", esc(text));
    input.value = "";
    var wait = thinking();
    var started = Date.now();
    var mid = rnd();
    ask(text, source, mid).then(function (r) {
      var delay = Math.max(0, 440 - (Date.now() - started));
      setTimeout(function () {
        if (wait.parentNode) wait.parentNode.removeChild(wait);
        var botRow = addMsg("bot", (r && r.answer) || esc(FALLBACK));
        if (!(r && r._err)) addFeedback(botRow, mid);
        renderSuggestions(r && r.follow && r.follow.length ? r.follow : STARTERS);
      }, reduce ? 0 : delay);
    });
  }

  function resetChat() {
    if (!list) return;
    list.innerHTML = "";
    addMsg("bot", esc(GREETING));
    renderSuggestions(STARTERS, "starter");
    if (input) input.focus();
  }

  function buildPanel() {
    if (built) return;
    built = true;

    panel = el("div", "cb-panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "cb-title");
    panel.hidden = true;

    var head = el("div", "cb-head");
    head.innerHTML =
      '<span class="cb-brand"><span class="cb-brand-mark" aria-hidden="true">' + BOT_AVATAR + '</span>' +
      '<span class="cb-brand-text"><span id="cb-title">Cris</span>' +
      '<span class="cb-sub">Your companion</span></span></span>';
    var tools = el("div", "cb-tools");
    var refresh = el("button", "cb-icon");
    refresh.type = "button";
    refresh.setAttribute("aria-label", "Reset chat");
    refresh.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 6V3L8 7l4 4V8a4 4 0 1 1-4 4H6a6 6 0 1 0 6-6z"/></svg>';
    refresh.addEventListener("click", resetChat);
    var close = el("button", "cb-icon");
    close.type = "button";
    close.setAttribute("aria-label", "Close assistant");
    close.innerHTML = "&times;";
    close.style.fontSize = "1.5rem";
    close.addEventListener("click", closePanel);
    tools.appendChild(refresh); tools.appendChild(close);
    head.appendChild(tools);
    panel.appendChild(head);

    list = el("div", "cb-list");
    list.setAttribute("aria-live", "polite");
    panel.appendChild(list);

    suggEl = el("div", "cb-sugg");
    panel.appendChild(suggEl);

    var form = el("form", "cb-form");
    input = el("input", "cb-input");
    input.type = "text";
    input.setAttribute("aria-label", "Type your question");
    input.setAttribute("placeholder", "Ask Cris about Kartik…");
    input.setAttribute("autocomplete", "off");
    var sendBtn = el("button", "cb-send");
    sendBtn.type = "submit";
    sendBtn.setAttribute("aria-label", "Send");
    sendBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M3.4 20.4 21 12 3.4 3.6 3.39 10.2 15 12l-11.61 1.8z"/></svg>';
    form.appendChild(input);
    form.appendChild(sendBtn);
    form.addEventListener("submit", function (e) { e.preventDefault(); send(input.value, "typed"); });
    panel.appendChild(form);

    panel.addEventListener("keydown", trapKey);
    document.body.appendChild(panel);
  }

  function lockScroll() {
    scrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = "fixed";
    document.body.style.top = -scrollY + "px";
    document.body.style.left = "0"; document.body.style.right = "0"; document.body.style.width = "100%";
  }
  function unlockScroll() {
    document.body.style.position = ""; document.body.style.top = "";
    document.body.style.left = ""; document.body.style.right = ""; document.body.style.width = "";
    window.scrollTo(0, scrollY);
  }
  function isMobile() { return window.matchMedia("(max-width: 640px)").matches; }

  function openPanel() {
    buildPanel();
    lastFocus = document.activeElement;
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    open = true;
    if (isMobile()) { document.documentElement.classList.add("cb-open"); lockScroll(); }
    if (list.childNodes.length === 0) { addMsg("bot", esc(GREETING)); renderSuggestions(STARTERS, "starter"); }
    setTimeout(function () { input && input.focus(); }, reduce ? 0 : 160);
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
    var f = Array.prototype.filter.call(
      panel.querySelectorAll('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])'),
      function (n) { return !n.disabled && n.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function init() {
    launcher = el("button", "cb-launch");
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Chat with Cris");
    launcher.setAttribute("aria-expanded", "false");
    launcher.innerHTML =
      '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M12 2l1.7 5.1L19 9l-5.3 1.4L12 16l-1.7-5.1L5 9l5.3-1.4z"/>' +
      '<circle fill="currentColor" cx="6" cy="18" r="1.7"/><circle fill="currentColor" cx="18" cy="18" r="1.7"/></svg>';
    launcher.addEventListener("click", function () { open ? closePanel() : openPanel(); });
    document.body.appendChild(launcher);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
