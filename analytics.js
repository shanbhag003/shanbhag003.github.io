/* ============================================================
   ANALYTICS
   Put your two IDs below and nothing else needs changing.
   Leave an ID empty and that tool simply won't load.

   Where to find them:
     GA4      analytics.google.com → Admin → Data Streams → your
              web stream → "Measurement ID", looks like G-ABC123XYZ
     Clarity  clarity.microsoft.com → your project → Settings →
              Setup → the id in the snippet, looks like abcd1234ef
   ============================================================ */

var GA4_ID     = "G-BSXKZS65WF";   //  e.g. "G-ABC123XYZ"
var CLARITY_ID = "ydxxpsmjfa";   //  e.g. "abcd1234ef"

(function () {
  "use strict";

  /* Don't record yourself while testing locally, and don't record
     anyone who has asked not to be tracked. */
  var local = /^(localhost|127\.|192\.168\.|\[::1\])/.test(location.hostname) ||
              location.protocol === "file:";
  var optedOut = navigator.doNotTrack === "1" || window.doNotTrack === "1";
  if (local || optedOut) return;

  /* ---------- Google Analytics 4 ---------- */
  if (GA4_ID) {
    var g = document.createElement("script");
    g.async = true;
    g.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4_ID;
    document.head.appendChild(g);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", GA4_ID, {
      /* don't store the full IP; keeps this lighter on privacy law */
      anonymize_ip: true
    });

    /* Track the things worth knowing about on a portfolio: who opens a
       case study, who downloads the CV, who clicks contact. */
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a");
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (href.indexOf("mailto:") === 0) {
        gtag("event", "contact_click", { method: "email" });
      } else if (/\.pdf($|\?)/i.test(href)) {
        gtag("event", "resume_download", { file: href.split("/").pop() });
      } else if (/^https?:/.test(href) && href.indexOf(location.hostname) === -1) {
        gtag("event", "outbound_click", { link_url: href });
      }
    }, true);
  }

  /* ---------- Microsoft Clarity ---------- */
  if (CLARITY_ID) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1;
      t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", CLARITY_ID);
  }
})();
