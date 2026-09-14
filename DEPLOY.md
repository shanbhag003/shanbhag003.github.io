# shanbhag003.com — deploy and SEO

Total cost: **one domain, about ₹1,000–1,200 a year.** Hosting, SSL and
bandwidth are free at your traffic levels.

---

## Part 1 — Buy the domain

1. Sign up at **dash.cloudflare.com** (free account).
2. Left sidebar → **Domain Registration** → **Register Domain**.
3. Search `shanbhag003` and buy the `.com`.
4. Turn **auto-renew ON**. A lapsed portfolio domain is quickly taken.

Cloudflare sells at wholesale with no renewal markup — the price in year one is
the price in year five. Skip every add-on offered at checkout.

**Also buy `kartikshanbhag.com`** and point it at the same site. Recruiters
search your name, not your handle. Setup is in Part 4.

---

## Part 2 — Put the code on GitHub

If your repo already exists, upload this build over it and skip to Part 3.

1. github.com/new → name it `shanbhag003` → **Public** → Create.
2. **uploading an existing file** → drag in the *contents* of this folder, not
   the folder itself.
3. Commit.

**`.nojekyll` will not upload by drag-and-drop** — browsers hide dotfiles. Use
**Add file → Create new file**, name it `.nojekyll`, leave it empty, commit.

---

## Part 3 — Connect Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**.
2. Authorise GitHub, pick the repo.
3. Build settings — this matters:
   - Framework preset: **None**
   - Build command: **leave empty**
   - Build output directory: **/**
4. **Save and Deploy.** About 30 seconds. You get a `*.pages.dev` URL.
5. Check that URL works before touching the domain.

Every future commit redeploys automatically.

---

## Part 4 — Point the domain at it

1. Pages project → **Custom domains** → **Set up a custom domain**.
2. Enter `shanbhag003.com` → **Activate domain**.
3. Repeat for `www.shanbhag003.com`.

Because the domain is registered at Cloudflare, DNS is created for you. No A
records, no CNAME file — that's why there isn't one in this build. HTTPS is
issued automatically within minutes.

**For `kartikshanbhag.com`:** add it as a second custom domain on the same
project. Both serve the site; the canonical tags tell Google `shanbhag003.com`
is the original, so there's no duplicate-content problem.

---

## Part 5 — SEO, so "Kartik Shanbhag" finds you

### Already built in

- **Your name is now the H1** on the home page. It used to be the `shanbhag003`
  wordmark — the strongest on-page signal, spent on a handle instead of a name.
- **Person structured data**: your name, alternate name, role, employer, city,
  universities, subject areas, and every profile you own. This is what lets
  Google connect the site to *you* rather than treating it as an unrelated page.
- **Canonical URLs** on all five pages.
- **Per-page social cards** at 1200×630, so shared links show a designed card.
- **Real sitemap.xml and robots.txt.**
- Clean URLs — `/projects`, not `/projects.html`.

### What you must do, in order

1. **Google Search Console** — search.google.com/search-console. Add
   `shanbhag003.com`; verification is automatic when the domain is at
   Cloudflare. Submit `https://shanbhag003.com/sitemap.xml`. Then **URL
   Inspection → Request indexing** on each of the five pages. Skip this and you
   wait weeks.

2. **Bing Webmaster Tools** — bing.com/webmasters. Import from Search Console in
   one click. Bing feeds several AI search products.

3. **Link to the site from every profile you own.** This is the highest-value
   SEO work available to you, because those pages already rank for your name:
   - LinkedIn → Contact info → Website
   - GitHub → bio and website field
   - Medium → profile
   - Tableau Public → profile
   - X bio

   Your structured data points out to them; they need to point back. Both
   directions matter.

4. **Use one spelling everywhere.** "Kartik Shanbhag" — not "Kartik D Shanbhag"
   on one profile and "K. Shanbhag" on another.

### Realistic timeline

Your name is uncommon, which helps. The pages competing with you are your own
LinkedIn, GitHub and Medium, all of which will link here.

- **Week 1–2:** indexed
- **Month 1–2:** first page for "Kartik Shanbhag"
- **Month 3–6:** top result, once profile links are crawled

What won't happen quickly: ranking for "product manager sports data". That's a
competitive commercial term and isn't worth chasing.

### The best thing you can do afterwards

Publish on your own domain. Every article is another indexed page carrying your
name and able to rank for its own topic. Your five pieces currently live on
Medium, and Medium gets that credit.

---

## If you pick a different domain

Five things reference `shanbhag003.com`: the `canonical` and `og:url` tags in
each HTML file, `sitemap.xml`, `robots.txt`, and the `url` and `sameAs` values
in the JSON-LD block in `index.html`.

## Editing later, with no local setup

Press **`.`** on any file in the GitHub repo. A full VS Code opens in the
browser. Edit, commit, and Cloudflare redeploys in under a minute.

---

## Outstanding

- The `®` was replaced with `™`. Only use `®` if you actually register the
  mark — claiming registration falsely is an offence under s.107 of the Trade
  Marks Act 1999.
- Your résumé PDF still carries percentages the site deliberately omits.
- Articles link out to Medium rather than living on the domain.
