# Setup guide — analytics, uploads, and what's left

Work top to bottom. Each part says exactly where to go and what to click.

---

# PART 1 — Google Analytics

## 1.1 — Pick the right property

You currently have a property called **PL Supercomputer**.

- **If it already tracks your GitHub Pages forecast site**, leave it alone.
  Create a new one — go to **Admin** (bottom-left cog) → **Create** →
  **Property**.
- **If you created it by mistake and it has no data**, just rename it. In the
  **Property name** box, replace "PL Supercomputer" with `shanbhag003.com` and
  click **Save**.

Either way you want a property whose name is `shanbhag003.com`.

## 1.2 — Property settings

- Property name: `shanbhag003.com`
- Reporting time zone: **India (GMT+05:30)**
- Currency: **Indian Rupee**
- Industry: **Jobs & Education** is fine
- Business size: **Small – 1 to 10**
- Business objectives: **Understand web and/or app traffic**

Click **Next / Save**.

## 1.3 — Create the data stream

1. **Admin** → under *Data collection and modification* → **Data streams**
2. **Add stream** → **Web**
3. Website URL: `https://shanbhag003.com`
4. Stream name: `shanbhag003.com`
5. Leave **Enhanced measurement** ON
6. **Create stream**

## 1.4 — Copy your Measurement ID

The stream details panel opens. Top right you'll see **Measurement ID**,
formatted `G-` followed by ten characters.

**Copy it. You need it in Part 3.**

If you close the panel: **Admin** → **Data streams** → click your stream.

> Ignore the "Install manually / paste this code" instructions Google shows.
> Your site already has the code — you only need the ID.

---

# PART 2 — Microsoft Clarity

## 2.1 — Create the project

1. Go to **clarity.microsoft.com**
2. **Sign up** — use the same Google account, it's simplest
3. **New project**
   - Name: `shanbhag003`
   - Website URL: `https://shanbhag003.com`
   - Category: **Personal website** or **Portfolio**
4. **Add new project**

## 2.2 — Copy your Clarity ID

1. It shows a "Install tracking code" screen → choose **Install manually**
2. You'll see a snippet containing something like:

   ```
   "clarity", "script", "abcd1234ef"
   ```

3. The last value — roughly ten lowercase letters and digits — is your ID.

**Copy it.**

If you close the screen: **Settings** → **Setup** → **Install manually**.

## 2.3 — Optional but recommended

**Settings → Project setup → Masking → Balanced or Strict.** This blurs text in
session recordings. Nobody types anything sensitive on your site, but it costs
nothing.

---

# PART 3 — analytics.js

This is the only file you edit by hand. It holds both IDs so you never have to
touch the HTML.

## 3.1 — What to change

Open `analytics.js`. Lines 13 and 14 look like this:

```js
var GA4_ID     = "";   //  e.g. "G-ABC123XYZ"
var CLARITY_ID = "";   //  e.g. "abcd1234ef"
```

Paste your two IDs inside the quotes:

```js
var GA4_ID     = "G-XXXXXXXXXX";
var CLARITY_ID = "xxxxxxxxxx";
```

**Keep the quotes and the semicolons.** Change nothing else in the file.

If you only have one ID for now, fill that one and leave the other empty — the
missing tool simply won't load, and nothing breaks.

## 3.2 — Editing it without any software

1. Open your GitHub repo
2. Click `analytics.js`
3. Click the **pencil icon** (top right)
4. Edit lines 13 and 14
5. Scroll down → **Commit changes**

Cloudflare redeploys within about a minute.

## 3.3 — What the file already does

- Won't record you while testing on localhost
- Respects Do Not Track
- Anonymises IP addresses
- Tracks three things beyond pageviews: **résumé downloads**, **contact
  clicks**, and **outbound clicks** to your live projects and GitHub

---

# PART 4 — Upload everything

## 4.1 — Files that changed

Upload the full contents of the zip over your repo. GitHub overwrites matching
names and adds new ones. 48 files.

If you'd rather do it selectively, these are the ones that changed:

| File | Why |
|---|---|
| `analytics.js` | **new** — with your IDs in it |
| `index.html` | page-speed fix, plus the analytics tag |
| `projects.html` | analytics tag |
| `experience.html` | analytics tag |
| `articles.html` | analytics tag |
| `visualisations.html` | analytics tag |

## 4.2 — How to upload

1. GitHub repo → **Add file** → **Upload files**
2. Drag the files in
3. **Commit changes**
4. Wait about a minute for Cloudflare to redeploy

---

# PART 5 — Check it works

## 5.1 — Google Analytics

1. Open `https://shanbhag003.com` in a normal browser window
2. In GA: **Reports** → **Realtime**
3. You should appear within 30 seconds as 1 active user

Not showing? Check in order:
- Is the ID pasted correctly, with `G-` included?
- Did Cloudflare finish deploying? Hard-refresh the site.
- Ad blocker on? It will block GA. Try a private window or your phone.

## 5.2 — Clarity

1. Visit the site and click around for 30 seconds
2. In Clarity: **Dashboard** — first data appears within a couple of minutes
3. **Recordings** takes up to 30 minutes for the first session

---

# PART 6 — Still outstanding

Ordered by how much they matter.

## 6.1 — Add your site link to five profiles *(10 minutes, highest value)*

- LinkedIn → Edit intro → Contact info → Website
- GitHub → Settings → Profile → Website, and mention it in your bio
- Medium → Settings → Profile → website
- Tableau Public → Profile → website
- X → bio and URL field

Google already knows you claim these, from the structured data on your site.
They need to point back. That reciprocity is what ties the site to your name.

## 6.2 — Turn off GitHub Pages

Repo `shanbhag003.github.io` → **Settings** → **Pages** → Source: **None**.

Otherwise the same site is live at two addresses and they compete.

**Only that repo.** Leave `pl-supercomputer` and `fpl-auto-manager` on — your
site links to both.

## 6.3 — Check the live model table

Open the home page and confirm the gold bars appear under *"This is live, and I
didn't touch it."* It needs JavaScript, so it can't be verified remotely. If it
says "Couldn't reach the model just now", tell me and I'll serve the data from
your own domain instead.

## 6.4 — Fix the résumé PDF

It still contains the percentage figures the site deliberately leaves out. The
download currently contradicts the page.

## 6.5 — Move the articles onto your domain

Biggest remaining SEO win. Five Medium posts become five indexed pages on
`shanbhag003.com`, each carrying your name and able to rank for its own topic.
Send the text and it can be built.

## 6.6 — Get the full employment agreement

The confidentiality and IP clauses weren't in the offer letter PDF — only its
cover and signature pages. Worth reading before the site gets traffic, given
your three personal projects sit close to your employer's line of business.

---

# Reference

| Thing | Where |
|---|---|
| Site | https://shanbhag003.com |
| Redirect domain | https://kartikshanbhag.com |
| Host | Cloudflare → Workers & Pages → `shanbhag003` |
| Domains | Cloudflare → Domains |
| Code | GitHub → `shanbhag003.github.io` |
| Search Console | search.google.com/search-console |
| Analytics | analytics.google.com |
| Clarity | clarity.microsoft.com |

**To edit any file later:** open the repo and press `.` — a full VS Code opens
in the browser. Commit, and the site redeploys in under a minute.
