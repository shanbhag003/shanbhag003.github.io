# shanbhag003.com

My portfolio. Five pages of plain HTML, one stylesheet, one script, no build
step.

**Live:** [shanbhag003.com](https://shanbhag003.com)

---

## Why there's no framework

The site is five pages that change a few times a year. A build pipeline would
have added `node_modules`, a lockfile, a version treadmill and a class of
failure that only appears at deploy time — to render markup I can write by
hand.

Everything here runs as-is in a browser. Open `index.html` from disk and it
works. That's the whole development environment.

The trade-off is real: no templating, so the nav and footer are duplicated
across five files, and changing them means five edits. At five pages that's
cheaper than the alternative. At fifty it wouldn't be.

---

## Structure

```
index.html            home — hero, live model readout, work numbers, projects
projects.html         three case studies, each with a live link and public code
experience.html       capability rows, client wall, awards, event timeline
articles.html         football writing, accordion rows
visualisations.html   Tableau dashboards, accordion rows

style.css             the whole design system, one file
app.js                all behaviour, no dependencies
analytics.js          GA4 + Clarity loader, IDs at the top

assets/               project screenshots, architecture diagrams, résumé
og-*.jpg              per-page social cards, 1200×630
sitemap.xml           five URLs
```

---

## The live bit

The home page fetches
[`data.json`](https://shanbhag003.github.io/pl-supercomputer/data.json) from my
Premier League forecasting model and renders the current title probabilities as
bars, with a timestamp showing when the model last rewrote its own output.

Nothing about it is hand-updated. If the numbers on the site have changed, the
model changed them.

It fails visibly rather than silently: if the fetch doesn't return, the panel
says so instead of rendering an empty box.

---

## Design decisions worth naming

**Two accents, each meaning one thing.** Gold marks anything measured or
verified. Everything else is ink on paper. When a colour stops meaning
something specific it stops being useful.

**Sections alternate grounds** — warm white, near-black, gold — rather than
running as one continuous sheet. The dark bands carry a 56px grid and the light
ones carry fine grain, so no surface is flat.

**Motion carries information or it doesn't exist.** Numbers count up to their
real values. Bars grow to real proportions. Sections arrive in reading order.
There's no parallax and no scroll-jacking, because both delay reading in
exchange for nothing.

**Everything degrades.** Content is in the HTML, not injected by JavaScript, so
it survives a script failure and a crawler sees all of it. Accordion panels stay
in the DOM when closed. A 3-second failsafe reveals anything the scroll observer
missed.

---

## Accessibility

Not an afterthought, and not a claim I'm making without checking:

- Every text-on-background pair contrast-checked; the lowest is 4.6:1 against a
  4.5:1 floor
- `prefers-reduced-motion` removes every animation, including the hero crossfade
- Accordions are real `<button>` elements with `aria-expanded`, operable from
  the keyboard
- Skip link, visible focus rings, semantic headings, real alt text
- Tap targets clear 44px on touch devices
- Tested from 320px to 1600px

---

## Running it

```bash
git clone https://github.com/shanbhag003/shanbhag003.github.io
cd shanbhag003.github.io
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

A server rather than opening the file directly, because the site uses clean
URLs (`/projects`, not `/projects.html`) and a `file://` origin blocks the
cross-origin fetch behind the live model readout.

---

## Deployment

Pushed to GitHub, served by Cloudflare. Every commit redeploys automatically —
no build command, output directory is the repo root.

`analytics.js` holds the GA4 and Clarity IDs in two variables at the top, so
adding or removing analytics never means touching the HTML.

---

## Stack

Instrument Sans, Geist and Geist Mono via Google Fonts. Brand icons from
[Simple Icons](https://simpleicons.org) (CC0), inlined rather than loaded as a
font. Everything else is hand-written.

---

## The projects it links to

- [pl-supercomputer](https://github.com/shanbhag003/pl-supercomputer) — a
  Premier League forecast that refits itself weekly and grades its own past
  predictions against the closing market
- [cricket-ai-digest](https://github.com/shanbhag003/cricket-ai-digest) — one
  live cricket feed in, two persona-specific briefings out
- [fpl-auto-manager](https://github.com/shanbhag003/fpl-auto-manager) — an
  autonomous Fantasy Premier League manager that publishes its projection
  before kickoff and gets marked against a human

---

Kartik Shanbhag — Mumbai
[shanbhag003.com](https://shanbhag003.com) ·
[LinkedIn](https://www.linkedin.com/in/kartik-shanbhag-b29806129/) ·
[Medium](https://shanbhag003.medium.com/)
