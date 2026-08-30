# Deploying shanbhag003.com

No local environment needed. No build step, no npm, no framework. This is plain
HTML and CSS — the browser is the only thing that runs it.

**Why I dropped the Astro plan:** you already run two GitHub Pages sites
successfully. Adding a build step would mean node_modules, build failures you
can't debug locally, and a framework upgrade treadmill — all to render five
pages. Static files give you identical SEO, faster loads, and nothing that can
break in eighteen months. If you later want fifty articles, we revisit it.

---

## Step 1 — Create the repository

1. Go to <https://github.com/new>
2. Repository name: **`shanbhag003.github.io`** — this exact name matters, it's
   what makes GitHub serve it as your root site
3. Set it to **Public**
4. Don't add a README or .gitignore
5. Click **Create repository**

## Step 2 — Upload the files

1. On the empty repo page, click **uploading an existing file**
2. Unzip `shanbhag003-site.zip` on your computer
3. Drag in **the contents** of the folder, not the folder itself. You should be
   dragging: `index.html`, `projects.html`, `experience.html`, `articles.html`,
   `visualisations.html`, `style.css`, `robots.txt`, `sitemap.xml`, `CNAME`,
   `.nojekyll`, and the `assets` folder
3. Commit message: `Initial site`
4. Click **Commit changes**

**If `.nojekyll` won't upload** (some browsers hide dotfiles): in the repo, click
**Add file → Create new file**, name it `.nojekyll`, leave it empty, commit. It
stops GitHub running Jekyll over your files, which can otherwise mangle
directories starting with an underscore.

## Step 3 — Turn on Pages

1. Repo → **Settings** → **Pages** (left sidebar)
2. Source: **Deploy from a branch**
3. Branch: **main**, folder: **/ (root)** → **Save**
4. Wait about a minute. Your site is live at `https://shanbhag003.github.io`

Check it works before touching the domain.

## Step 4 — Point shanbhag003.com at it

First buy the domain if you haven't. Cloudflare Registrar sells at cost with no
renewal markup; Namecheap and Porkbun are also fine. Avoid GoDaddy's upsells.

Then, at your registrar's DNS settings, create these records:

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `shanbhag003.github.io` |

All four A records. GitHub uses all four for redundancy.

Then back in **Settings → Pages → Custom domain**, enter `shanbhag003.com` and
save. The `CNAME` file in the repo already contains this, so it should
pre-populate.

Wait for the DNS check to pass — anywhere from ten minutes to a few hours — then
tick **Enforce HTTPS**. Don't skip that; without it the site serves over plain
HTTP and browsers will flag it.

## Step 5 — Editing later, still with no local setup

On any file in your repo, press the **`.`** key. GitHub opens a full VS Code in
your browser. Edit, then commit from the sidebar. The site redeploys itself in
about forty seconds.

Same trick works on `github.dev` if you prefer the URL.

---

## What's in the build

```
index.html            home — hero, three claims, client list
projects.html         three case studies as tabbed sub-sections; deep
                      links work: #pl-supercomputer, #cricket-digest, #fpl
experience.html       capability blocks, then the full month-by-month log
articles.html         five pieces, currently linking to Medium
visualisations.html   seven Tableau dashboards
style.css             the whole design system, one file
app.js                scroll reveal, progress bar, project tabs
sitemap.xml           for Google
robots.txt            points at the sitemap
CNAME                 your custom domain
.nojekyll             stops GitHub post-processing the files
assets/               portrait, cricket console screenshot, résumé PDF
```

## Design decisions, so you can argue with them

**Palette** is paper-white with two accents, each carrying a fixed meaning I
never break.
- **Blue `#2563EB`** — action and primary. Buttons, active tabs, the scroll
  progress line, and the border on the "rejected" ledgers.
- **Ochre `#B45309`** — measured, validated, numeric. Winning rows in tables,
  client attributions, verified claims.

Every text-on-background pair used anywhere on the site was contrast-checked;
the lowest is 4.77:1 against a WCAG AA floor of 4.5:1.

That mapping encodes something true rather than decorating. When you see mint,
a number has been checked.

**Type** is three faces doing three jobs:
- **Instrument Sans** for headings — a tight contemporary grotesque, not Inter,
  which every developer portfolio uses
- **Geist** for body text — Vercel's typeface, designed for screen reading and
  currently the default choice on modern product sites
- **Geist Mono** for labels, tables and buttons — the vernacular of the
  operations consoles you actually build

**The signature element** is the bordered **rejected ledger** on the projects
page — nobody else publishes their failed experiments, so it gets the loudest
treatment on the site.

**Mobile.** Tested by rendering every page at 430, 390, 360 and 320px. No
horizontal scroll anywhere. The sticky header becomes two rows on narrow
screens — brand, then the nav — and its height is measured at runtime into a
`--nav-h` variable that the project sub-nav and every anchor offset read from,
so the tab bar can never end up hidden behind the header. All five nav links
fit without scrolling down to 360px; below that the row scrolls with a fade on
the right edge. Wide data tables scroll horizontally inside their own container,
also with an edge fade, so it's obvious there's more to see. Every tap target
clears 44px, hover lifts are disabled on touch devices, and buttons go full width so they never orphan.

**Accessibility floor:** responsive to 320px, visible keyboard focus rings,
`prefers-reduced-motion` respected, skip link, semantic headings, real alt text,
tabs wired with `role="tab"`/`aria-selected` and arrow-key navigation.

---

## Things you need to fix or decide

1. **Your LinkedIn URL is a guess.** I used
   `linkedin.com/in/shanbhag003/` in all four footers. If that's wrong, find and
   replace it across the five HTML files.

2. **The five-hour / three-hour discrepancy.** Your PL Supercomputer live page
   says it republishes three hours after a gameweek; the README says five. The
   site copy currently avoids the number entirely ("a set delay has passed").
   Reconcile the two sources and I'll put the real figure in.

3. **The articles aren't actually moved yet.** I don't have the article bodies —
   they're only on Medium. The page links out for now. To genuinely move them,
   paste me the text of each and I'll build five article pages with canonical
   tags pointing here.

4. **Three dashboards have placeholder descriptions.** Manchester City 2021,
   Sergio Busquets and Premier League 2024/25 have generic one-liners because I
   don't know what question each answers. Send me one line each.

5. **The Tata Motors line is a placeholder.** I would not invent a job history.
   The description on the Experience page is written from your instruction, not
   from anything you've told me you did. Confirm it or replace it — there is an
   HTML comment marking the spot.

6. **No OG image yet.** Link previews will show text only. A single
   1200×630 image would fix it across every page; a per-page set would be
   better. Say the word and I'll generate them.

7. **The résumé PDF still has percentages in it.** The site has none, by your
   instruction, but the downloadable résumé contradicts that. Worth aligning.
