# Jiang Lab @ SISU — Repository Audit Report

Scope: read-only audit of `xmjiang-lab/xmjiang-lab.github.io` at current `main`.
No files were modified, created, or deleted besides this report. No scripts
were executed; xlsx + JSON contents were read and compared via static
inspection.

Site: vanilla HTML + CSS + JS, no build step. `scripts/fetch_orcid.py`
syncs ORCID → `site_data.xlsx` → JSON files under `assets/data/`. Frontend
fetches JSON at runtime. Deploy via `.github/workflows/pages.yml` on push
to `main`.

---

## 1. Repo inventory

### Top-level

| Path | Purpose | Flags |
|---|---|---|
| `index.html` | Home page (hero + PI card + funders strip + sidebar) | — |
| `people.html` | People page shell (rendered by JS) | — |
| `projects.html` | Research themes page shell | — |
| `publications.html` | Publications list with filter bar | — |
| `facilities.html` | Facilities page shell | — |
| `news.html` | News page shell | — |
| `contact.html` | Static contact page; relies on `data-i18n` overrides | Hard-coded fallback text is the **old short Hongkou-only address**; the i18n payloads carry the full Songjiang+Hongkou+office text. JS replaces it on load — but if JS fails, the visible address is wrong. |
| `favicon.svg` | 32×32 SISU-blue tile with yellow "J" | — |
| `README.md` | Repo overview + workflow notes | Mentions `scripts/build_xlsx.py` (does not exist) and a deprecated `assets/data/projects-data.json` filename. |
| `LICENSE` | Copyright text | **Wrong lab.** Reads "Copyright © 2026 Neuropragmatics and Emotion Lab, McGill University" with contact `pelllab.scsd [at] mcgill.ca`. Leftover boilerplate; must be replaced with a Jiang-Lab / SISU license. |
| `.gitignore` | Standard ignores; `site_data.xlsx` line commented out (xlsx is tracked) | — |
| `preview.ps1` | Local-preview launcher (python http.server + Edge) | — |
| `update_and_preview.ps1` | One-shot sync+commit+preview | Hardcoded paths `E:\website\xmjiang-lab` and `C:\Program Files\PsychoPy\python.exe` will not match Wenjun's `C:\dev\code\save\xmjiang-lab.github.io`. Script also auto-commits/pushes with a date-stamped message ("Update site data (yyyy-MM-dd)") — this is a **time reference** that would land in the commit log; flagged for awareness. |
| `site_data.xlsx` | Manual-fields layer + source of truth for People/Projects/Collaborators/Funders | — |
| `.github/workflows/pages.yml` | GitHub Pages deploy on push to main, no build | — |
| `assets/css/style.css` | Single stylesheet (~1436 lines) | — |
| `assets/js/main.js` | Single JS bundle (~809 lines, IIFE) | — |
| `assets/data/*.json` | Runtime data (9 files) | See §2. |
| `assets/images/logos/*` | SISU/ILAS/funder logos | `sisu-brand.svg` referenced in JS `onerror` fallback but **does not exist**. `sisu-seal.png` is committed but never referenced. |
| `assets/images/people/xiaoming-jiang.jpg` | PI photo | Low effective resolution; see §6(a). |
| `scripts/fetch_orcid.py` | ORCID sync + JSON emitter | Emits `mentorship.json` from a `Mentorship` sheet that **does not exist** in the xlsx, and does **not** emit `collaborators.json` even though a `Collaborators` sheet **does** exist. See §2. |

### Orphaned / unused

- `assets/images/logos/sisu-seal.png` — committed in initial commit, no reference anywhere in HTML/CSS/JS.
- `assets/images/logos/sisu.svg`, `sisu-white.svg`, `stcsm.svg`, `ilas.svg` — placeholder SVGs from init; never referenced by name. (`sisu-brand.png` and `ilas-foot.svg` are the only logo images actually loaded.)
- `update_and_preview.ps1` — hardcoded to a path that doesn't exist on Wenjun's machine; effectively unused.

---

## 2. Data pipeline integrity

### `site_data.xlsx` — sheets and row counts

| Sheet | Total rows (incl. header + comment) | Data rows |
|---|---:|---:|
| `Publications` | 99 | **97** |
| `People` | 3 | **1** (PI only) |
| `Projects` | 7 | **5** |
| `Collaborators` | 8 | **6** |
| `Funders` | 5 | **3** |

Every sheet uses the documented `row1 = header, row2 = yellow instruction row, row3+ = data` convention.

### `assets/data/*.json` — record counts

| File | Records | Source |
|---|---:|---|
| `publications.json` | **97** | script (ORCID + xlsx Publications) |
| `people.json` | `current = 1`, `alumni = 0`, `author_patterns = 4` | script (xlsx People) |
| `projects.json` | **5** | script (xlsx Projects) |
| `funders.json` | **3** | script (xlsx Funders) |
| `collaborators.json` | **6** | **manual** — no emitter in `fetch_orcid.py` |
| `facilities.json` | **8** | **manual** — no Facilities sheet in xlsx, no emitter |
| `news.json` | 3 items | **manual** — no News sheet, no emitter |
| `i18n-zh.json`, `i18n-en.json` | 78 keys each (symmetric) | manual |

`mentorship.json` is **not present**; `fetch_orcid.py` would error attempting to emit it (`read_sheet_records(XLSX, "Mentorship")` would return `[]`, but `emit_mentorship` would still write an empty file). It was deleted in commit `be55141` along with `mentorship.html`.

### Cross-check: do the JSONs match what `fetch_orcid.py` would produce from the current xlsx?

**Publications:** consistent. xlsx has 97 data rows; JSON has 97 entries. The script's `emit_publications` keeps records where `show != "no/false/0"`; xlsx `show` column shows 58 `yes` and 39 `None` (blank) — blanks pass the filter, so 97 in → 97 out matches. xlsx category column has 39 explicit categories (27 journal + 7 chinese + 4 preprint + 1 conference); JSON has 97 resolved categories (77 journal + 7 chinese + 7 preprint + 6 conference) because `resolve_category()` auto-derives missing categories from `type` and `url`. That is correct behavior, not drift.

Of those 97 records, `source` is `0000-0002-5171-9774` for **66** and the literal string `"seed"` for **31**. The script never writes `"seed"`. Those 31 rows were pre-seeded into the xlsx by something prior to the first commit (initial commit added a 33834-byte xlsx; the deleted `scripts/build_xlsx.py` mentioned in `README.md` is the most likely origin). They survive because `merge_pubs()` preserves any xlsx-only records that don't appear in ORCID. Not a bug, but worth knowing.

**People:** consistent. 1 data row in xlsx (PI), 1 entry in `people.json.current`, 0 alumni. Education field is fully populated (not the placeholder); see §6(b).

**Projects:** **drift detected** in punctuation. The xlsx uses em-dashes `——` and ` — ` in body fields; `projects.json` has the same text with em-dashes replaced by `:` (colons). Examples:

- xlsx `vocal_emotion.body_zh`: `…如何用声音传递情绪——包括韵律特征…`
  JSON: `…如何用声音传递情绪：包括韵律特征…`
- xlsx `vocal_emotion.body_en`: `…through the voice — through prosody and nonverbal vocalizations — and how do listeners…`
  JSON: `…through the voice: through prosody and nonverbal vocalizations: and how do listeners…`
- Same em-dash→colon transform on `neuropragmatics` rows.

The script does not perform that substitution; `projects.json` was edited manually (or by an out-of-band tool) after the last sync. Running `python scripts/fetch_orcid.py` now would **revert** the colons back to em-dashes. The English version with colons doubled as sentence separators reads awkwardly ("through the voice: through prosody … : and how do listeners…").

**Funders:** consistent. 3 rows xlsx → 3 entries JSON. (`funders.json` does not carry a `show` field; the script filter strips it.)

**Collaborators:** **out-of-band**. The xlsx `Collaborators` sheet has 6 data rows with a `bio` column populated for every key collaborator (e.g. Prof. Pell's bio is 5 sentences). `collaborators.json` carries only `group`, `name`, `affiliation`, and `url` — **the bio field has been dropped**. CSS reserves `.collab-bio` for it (style.css:525-530) and `renderPeople` (main.js:389-399) does not render it. Since the script has no `emit_collaborators` function, every edit to the Collaborators sheet has to be hand-mirrored into `collaborators.json`.

### `LAB_ORCIDS`

`scripts/fetch_orcid.py:43-46`:
```python
LAB_ORCIDS = [
    ("0000-0002-5171-9774", "Xiaoming Jiang"),
    # ("0000-0003-3870-5041", "Wenjun Chen"),
]
```
Confirmed: only Prof. Jiang's ORCID `0000-0002-5171-9774` is active. Wenjun Chen's ORCID is commented out.

---

## 3. Frontend audit

### Per-page render map

| Page | `data-page` | What it renders | Data sources | Notes / issues |
|---|---|---|---|---|
| `index.html` | `home` | Hero, intro paragraph, PI card (photo + ORCID/Scholar/email badges), funders strip, sidebar with 3 newest news items | `i18n-{lang}.json`, `funders.json`, `news.json` | The PI card content (`pi_title`, `pi_subtitle`, `pi_affil`) is hard-coded in HTML and overridden by `data-i18n` on load. `home.pi_bio` exists in both i18n files but **has no `data-i18n` consumer** — dead key. `home.sidebar_title`, `home.sidebar_full`, `home.announce_title`, `home.announce_more`, `home.orcid_link` are also unused (sidebar text is hard-coded in `renderSidebar`). Tel field shows `Tel.: +86-21-3537-XXXX` placeholder in `buildFooter()` (main.js:146). |
| `people.html` | `people` | PI card + grouped current members + role-bucket placeholders (9 per empty role) + alumni + collaborators (key/emerging) | `people.json`, `collaborators.json` | With current data only the PI card and 27 placeholder cards (9 each × phd/master/undergrad) render, plus alumni placeholder text and 3 key + 3 emerging collaborators. PI photo currently low-res (§6a). |
| `projects.html` | `projects` | One block per project (title + body) | `projects.json` (fallback to `projects-data.json` which does not exist) | Em-dash drift (§2). |
| `publications.html` | `publications` | Category + year filter chip bar; year/category badges per item; author folding above 10 names; per-item View/PDF/Code/Video action buttons | `publications.json`, `people.json` (for `author_patterns`) | Author bolding via regex from `people.json`; works. Filter UI hardcodes 4 category labels in `PUB_CAT` (main.js:490-496) — the i18n keys `publications.filter_*` exist but are unused. The "in press" badge is rendered when `p.year` is empty (currently no such rows). |
| `facilities.html` | `facilities` | Grid of 8 cards with Phosphor icon + bilingual name/desc | `facilities.json` | — |
| `news.html` | `news` | Ordered list with date + tag + title + body + optional link | `news.json` | Note: `news.json:13` body texts contain literal " 9:00: 2026 年 12 月 31 日 16:30" and "9:00 28 Jan 2026: 16:30 31 Dec 2026" — colons separating start/end dates read as typos (likely an em-dash → `:` substitution similar to projects.json). |
| `contact.html` | `contact` | Two 2-column grids: address/email, location/positions | `i18n-{lang}.json` | Hard-coded fallback address (Hongkou only, no campus split, no PI office, no Tel.) does not match the i18n payload (Songjiang + Hongkou + office). If JS or the i18n fetch fails, the page shows the wrong content. |

### `assets/js/main.js`

**render* functions (8):** `renderSidebar`, `renderPeople`, `renderFunders`, `renderProjects`, `renderPublications`, `renderPubsList` (sub-render), `renderFacilities`, `renderNews`. Plus nested helper `renderAuthors` inside the publications block.

**`window.*` exposed for inline `onclick` (6):** `toggleLang`, `toggleDark`, `toggleAuthors`, `toggleCatFilter`, `toggleYearFilter`, `clearAllFilters`. All are referenced from HTML / dynamically-built strings.

**Helpers:** `$`, `$$`, `get`, `loadJSON`, `loadLang`, `applyLang`, `ensureAuthorPatterns`, `boldLabAuthors`, `buildHeader`, `buildFooter`, `filterPubsList`, `buildCategoryFilters`, `buildYearFilters`, `updateCountDisplay`, `resolveCat`, `applyDark`, `applySaved`, `init`.

**Nested closures** (all reachable): `roleLabel`, `personCard`, `placeholderCard`, `formatEducation`, `collabCard` inside `renderPeople`.

**No orphaned functions.** Every declared function has at least one caller.

**Minor smells:**
- `PREPRINT_HOSTS` is defined in both `fetch_orcid.py:60` and `main.js:500`. Drift risk if one list is updated.
- `resolveCat` exists in both `fetch_orcid.py:337` and `main.js:503` with the same intent. Duplicate logic.
- `buildHeader()` interpolates the active-page class into the nav `<li>` template; works, but if the `data-page` attribute is missing the home link is incorrectly marked active.
- The publications "in press" branch (`pub-year.inpress`) is never exercised by current data (every record has a year).

### `assets/css/style.css`

- ~358 declaration blocks, ~141 unique class names.
- Dead selectors (CSS-defined classes with **no** reference in any HTML/JS/JSON):
  - `.announce-card` (only used in dark-mode tweak, no HTML emits it)
  - `.collab-bio` (CSS reserved for the Collaborators bio field that `collaborators.json` does not carry)
  - `.hero-motto`
  - `.mentee-block`, `.mentee-meta`, `.mentee-name`, `.mentee-now`, `.mentee-work`, `.mentorship-group-title` (residue from the deleted Mentorship page)
  - `.project-pubs`
  - `.section-heading`
  - `.year-heading`
  - Total: **12 dead class selectors** (plus a few `body.dark .<class>` companions of the same names).
- The responsive block `@media (max-width: 860px)` still styles `.person-row .photo` — a class pair that also has no HTML usage.

### Unused i18n keys (no `data-i18n` consumer; excluding the `people.<role>` keys that `renderPeople` reads dynamically):

```
home.announce_more
home.announce_title
home.orcid_link
home.pi_bio
home.sidebar_full
home.sidebar_title
projects.applied.body
projects.applied.title
projects.crosslinguistic.body
projects.crosslinguistic.title
projects.neural_pragmatics.body
projects.neural_pragmatics.title
projects.rep_pubs
projects.vocal_emotion.body
projects.vocal_emotion.title
publications.filter_all
publications.filter_chinese
publications.filter_conference
publications.filter_journal
publications.filter_preprint
publications.intro
```

Most are vestiges of an earlier render path (projects.* nested keys are obsolete now that `projects.json` is the source; `publications.filter_*` are obsolete now that filter chips read labels from `PUB_CAT`). `home.pi_bio` is real bilingual copy that simply has no consumer — either remove from i18n or add a `<div data-i18n="home.pi_bio">` to `index.html`.

---

## 4. Phosphor Icons audit

### External CDN usage

Every HTML page loads Phosphor from jsDelivr (7 files total):

| File | Line(s) |
|---|---|
| `index.html` | 9, 10 |
| `people.html` | 8, 9 |
| `projects.html` | 8, 9 |
| `publications.html` | 8, 9 |
| `facilities.html` | 8, 9 |
| `news.html` | 8, 9 |
| `contact.html` | 8, 9 |

Two CDN stylesheets per page:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/regular/style.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/light/style.css">
```

### Icons actually used (all `ph-light` weight, 14 unique names)

| Icon | Where |
|---|---|
| `ph-house` | header nav (`main.js:111`) |
| `ph-list` | mobile hamburger (`main.js:119`) |
| `ph-moon` | dark-toggle off-state (`main.js:101`, `:788`) |
| `ph-sun` | dark-toggle on-state (`main.js:788`) |
| `ph-x` | filter chip close indicator (`main.js:622, :646`) |
| `ph-arrow-counter-clockwise` | filter-clear button (`publications.html:34`) |
| `ph-microphone-stage` | Facilities — Speech Lab |
| `ph-eye` | Facilities — Eye-tracking |
| `ph-brain` | Facilities — EEG/ERP |
| `ph-test-tube` | Facilities — Behavioral |
| `ph-baby` | Facilities — Child |
| `ph-database` | Facilities — Language Data Processing |
| `ph-lightbulb` | Facilities — Smart Learning |
| `ph-magnet` | Facilities — MRI |

The `regular` weight stylesheet is loaded but **never used** (no `ph-regular` or `ph ph-` class in any markup). The CDN regular-weight `<link>` should simply be deleted in addition to the self-hosting move.

### Recommended self-host file set

Copy from `@phosphor-icons/web@2.1.1/src/light/` to `assets/fonts/phosphor/`:

- `style.css` (defines `@font-face Phosphor-Light` + the `.ph-light` mapping; covers all 14 icons)
- `Phosphor-Light.woff2`
- `Phosphor-Light.woff`
- `Phosphor-Light.ttf` (optional fallback for older browsers)

After dropping in, replace each per-page CDN `<link>` pair with:
```html
<link rel="stylesheet" href="assets/fonts/phosphor/style.css">
```

The vendored `style.css` references the font files via relative URLs (`./Phosphor-Light.woff2` etc.), so keeping them in the same folder requires no path edits.

The `regular`-weight files are **not** needed.

---

## 5. CSS class prefix migration plan (`xmjl-`)

### Scope

- **CSS unique class names** to rename: 141 in `style.css` (and their companion `body.dark .<class>` rules — already counted because we count class tokens, not selectors).
- **HTML class= references**: 7 HTML files, mostly using two or three semantic classes each. Static `class="…"` occurrences across the 7 HTML files total ~50 attributes.
- **JS innerHTML / template-literal class strings** in `main.js`: ~120 class tokens across the 8 render functions and the two builders (`buildHeader`, `buildFooter`). Plus `setAttribute`/`classList.toggle`/`classList.contains` callsites (e.g. `classList.toggle('open')`, `classList.contains('dark')`).
- **JS class-token JS API uses**: `classList.toggle('expanded')` in inline onclick (`main.js:278`), `classList.toggle('open')` in inline onclick (`main.js:119`), `classList.toggle("dark", isDark)` (`main.js:786`), `body.classList.contains("dark")` (`main.js:792`). These are the highest-risk renames — silent runtime bugs if any one is missed.
- **CSS in JS strings** (e.g. dark-toggle icon swap `icon.className = "ph-light ph-sun"`): Phosphor classes stay as is; only project classes change.
- **JSON-side classnames**: `facilities.json` carries `"icon": "ph-…"` strings (Phosphor, untouched). No project classes live in JSON.

### High-risk renames (silent-break candidates)

1. `expanded` — toggled by inline onclick on every non-PI person card. Rename both `.person-card.expanded` rules and the `classList.toggle("expanded")` call together.
2. `open` — toggled on `#nav-links` for the mobile hamburger. CSS `ul.open` rule and the `classList.toggle('open')` call.
3. `dark` — toggled on `<body>`. ~50 `body.dark …` selectors and the `classList.toggle("dark", …)` / `classList.contains("dark")` calls.
4. `active` — used in nav (`buildHeader`) and in filter chips (`buildCategoryFilters`, `buildYearFilters`). Both string-templated.
5. `featured` — added to news mini cards in HTML built by `renderSidebar`; matched in CSS as `.news-mini-card.featured`.
6. `inpress` — added to `.pub-year` when year is missing; not currently rendered, but still wired.
7. `cat-journal / cat-preprint / cat-chinese / cat-conference / cat-other` — strings live in `PUB_CAT` dict in JS and as CSS classes.

### Out-of-scope (do NOT prefix)

- Phosphor classes (`ph-light`, `ph-*`).
- Browser/HTML conventions (none in use here).

### Milestone-count estimate

Six milestones, ordered:

1. `style.css` — rename every project class in selectors. (1 commit.)
2. `assets/js/main.js` — rename every project class string. Pay extra attention to template literals and the inline `onclick` handlers. (1 commit.)
3. HTML pages — rename `class="…"` attributes across `index/people/projects/publications/facilities/news/contact.html`. Mostly mechanical. (1 commit.)
4. Smoke test in `preview.ps1`: open each page in both languages, both themes, expand a non-PI card, toggle a filter chip, open mobile nav. Record findings. (1 commit if any fixes.)
5. Search-and-fix sweep: grep for any bare class token from the old list to make sure no `.classList.toggle` / `setAttribute("class", …)` survived. (1 commit if needed.)
6. Update any `// CSS class` comments in source so the docstrings still match. (Likely folded into the previous milestones; reserve 1 if not.)

Estimated total: **4 milestones in the typical case, 6 if smoke-test catches misses**. Recommended approach: do these on a feature branch, push after each milestone, ask Wenjun to spot-check before final merge.

---

## 6. Known issues — verification

### (a) PI photo low-resolution

**File:** `assets/images/people/xiaoming-jiang.jpg`
**JPEG SOF0 dimensions (from byte-level parse):** **400 × 400**
**File size:** 15,422 bytes (15.1 KB).

The file is stored at 400×400, **not** 122×150 as previously reported. However, 15 KB for a 400×400 photographic JPEG is unusually low — typical quality-80 portraits at that resolution land in the 25–50 KB range. The likely sequence: a low-resolution source (around 122×150 or similar) was upscaled and re-encoded, producing a 400×400 file whose effective sharpness is below its dimensions. The visible blur in the home + people PI card is therefore real, even though the dimension claim is technically wrong.

**Suggested next step:** request a higher-resolution original (≥ 600×600 at quality 85) from Prof. Jiang; replace in-place.

### (b) Prof. Jiang's `education` field

The People sheet PI row, column `education`, contains the **fully populated** value, not the placeholder:

```
PhD, Peking University (2005–2010) | Undergraduate, East China Normal University (2001–2005) | Postdoc, Peking University (2010–2012) | Postdoc / Research Associate / Visiting Professor, McGill University (2013–2018) | Associate Professor, Tongji University (2018–2020) | Professor, SISU – Institute of Linguistics (2020–2024) | Professor, SISU – Institute of Language Sciences (2024–present)
```

Same value flows through to `assets/data/people.json:21`. The earlier "placeholder text `[请填写教育背景 / Education to be filled]`" claim is **no longer accurate** at this commit — the placeholder was replaced before the current `main`.

### (c) Wenjun Chen alumni row

The People sheet has **only one data row** (the PI). `assets/data/people.json` shows `"alumni": []`. Wenjun Chen is **absent** from People, confirming the deletion. Note: Wenjun does still appear in `collaborators.json` (group `emerging`, "PhD candidate, McGill University") and in the Collaborators sheet row 8 — that's the only place his name surfaces on the site.

### (d) `assets/images/logos/ilas-foot.svg` — opaque white rectangle?

The only white rectangle in the SVG is at line 4:
```xml
<rect id="矩形_11131" data-name="矩形 11131" width="201.732" height="40.344" fill="#fff"/>
```
This rect lives **inside `<defs><clipPath id="clip-path">…</clipPath></defs>`**. Clip-path rects are never rendered as visible geometry; they define the clipping region for the SISU/ILAS emblem in the `<g clip-path="url(#clip-path)">` block on line 14. Every other `fill="#fff"` in the file is on text glyphs and small emblem paths, all of which are intended to render white on the dark blue footer background.

**Verdict:** no opaque white block hazard. The footer banner is safe.

---

## 7. Standing-instruction violations (git history audit)

### Author identity

Every historical commit in `git log --all` is authored by `Sherman <chenwenjunedu@outlook.com>`. The local `git config` is **already** `user.name = Wenjun Chen`, `user.email = 75600073+wenjunchen29@users.noreply.github.com`, so this audit's own commit and all future commits from this checkout will land correctly under `Wenjun Chen`. Past commits are not rewritten by this audit. **Status: resolved going forward; historical commits unchanged.**

### Co-Authored-By: Claude

`git log --all --pretty=format:"%h %s%n%b%n---"` shows **no `Co-Authored-By: Claude`** entries. **0 violations.**

### Time-referencing commit messages

All 7 existing commit messages are single-digit or two-digit subjects with empty bodies:

```
fdf6ca3 01
5c3ca89 02
be55141 3
b503525 4
c08bda5 1
1a04d40 1
f723410 2
```

No "today / tomorrow / now / later". **0 violations**. But the messages are uninformative — they don't say what the commit changed. The auto-commit message in `update_and_preview.ps1:21` is `"Update site data (yyyy-MM-dd)"` — a date string in the message. Strictly that is a date, not a relative time reference ("today/now"), so it likely passes the rule, but flagging for confirmation.

### Multi-purpose commits

| Commit | Areas touched (from file list) | Mixed? |
|---|---|---|
| `fdf6ca3` (01) | initial repo import — 31 files | N/A (init) |
| `5c3ca89` (02) | only `preview.ps1` added | clean |
| `be55141` (3) | data + logos + mentorship deletion + xlsx | **mixed**: deletes mentorship page, adds funder/people images, updates collaborators, regenerates xlsx |
| `b503525` (4) | CSS (+278 lines), people.json, main.js (+218 lines), index.html, xlsx | **mixed**: styling + data + JS + HTML |
| `c08bda5` (1) | CSS, i18n-en/zh, main.js — appears to be a coherent styling/i18n pass | borderline |
| `1a04d40` (1) | CSS, 5 data JSONs, main.js, index.html, publications.html, xlsx | **mixed**: bundles styling + content edits + xlsx regen |
| `f723410` (2) | 12 files: CSS, 2 i18n, facilities.json, main.js, all 7 HTML pages, publications.html | **mixed**: bundles styling + i18n + content + per-page changes |

**Flag for future awareness:** four of seven post-init commits bundle styling, content, and data changes into a single commit. Per the standing instruction ("each milestone = one commit + push, each area completed = one consolidated CHANGELOG entry"), upcoming feature-branch work should split these by area.

---

## 8. Proposed first feature-branch batch (10–15 milestones)

Ordered by dependency. **Do not execute** — Wenjun reviews and trims.

1. **Fix `LICENSE`.** Replace McGill / Pell-lab boilerplate with a SISU / Jiang-lab license. (1 file.)
2. **Self-host Phosphor Light icons.** Copy `style.css`, `Phosphor-Light.woff2`, `.woff`, `.ttf` to `assets/fonts/phosphor/`; replace the 14 jsDelivr `<link>` pairs (7 HTML files) with one local link each; drop the unused `regular`-weight link. Smoke-test that all 14 icons still render.
3. **Delete unreferenced logo files.** `sisu-seal.png` (unused), `sisu.svg` / `sisu-white.svg` / `stcsm.svg` / `ilas.svg` (placeholder SVGs, never loaded) — confirm with grep before removing.
4. **Fix the `update_and_preview.ps1` hardcoded path** (or delete the script if `preview.ps1` + manual `python scripts/fetch_orcid.py` is enough). Cross-check the `$REPO` path matches Wenjun's actual checkout.
5. **Add an `emit_collaborators` step in `scripts/fetch_orcid.py`** so the Collaborators sheet (with its `bio` column) becomes the source of truth for `collaborators.json`. Wire `bio` into `renderPeople` via the existing `.collab-bio` CSS so the McGill / CityU / HU-Berlin bios appear on People.
6. **Remove dead `emit_mentorship` from `fetch_orcid.py`** (no Mentorship sheet, no consumer); also remove the `mentorship.json` mention from `README.md`.
7. **Replace the contact-page HTML fallback** so the static markup matches the full Songjiang + Hongkou + PI office address i18n payload. Today the fallback shows only the Hongkou address with no PI office — wrong if JS fails.
8. **Fix `index.html` PI card content** so it matches the bilingual i18n payload (`home.pi_subtitle` and `home.pi_affil` are HTML-overridden, but `home.pi_bio` exists in i18n yet renders nowhere — either wire it in or remove the i18n key).
9. **Fix the em-dash → colon drift in `projects.json` and `news.json`.** Either re-run `fetch_orcid.py` to regenerate `projects.json` from xlsx (this reverts the colons), or paste the JSON edits back into `site_data.xlsx` and re-run. Pick one direction; document.
10. **Delete dead CSS selectors:** `.announce-card`, `.collab-bio` (or wire it up after milestone 5), `.hero-motto`, `.mentee-*`, `.mentorship-group-title`, `.project-pubs`, `.section-heading`, `.year-heading`, `.person-row .photo`.
11. **Delete dead i18n keys** (see §3 list): 21 keys per language file. Trim both `i18n-zh.json` and `i18n-en.json` symmetrically.
12. **Replace `xiaoming-jiang.jpg`** with a higher-resolution (≥ 600×600, quality 85) photo if one is available.
13. **Replace the `Tel.: +86-21-3537-XXXX` placeholder** in `main.js:146` `buildFooter()` with the real number, or fall back to omitting the line until confirmed.
14. **CSS-prefix migration (`xmjl-`)** — only after the above is settled. Branch by itself; expect 4–6 milestones internal to that branch as planned in §5.

(Author identity is already correct in the local `git config`; no rename step needed — see §7.)

---

## Open questions for Wenjun

1. **`LICENSE` content.** The current file is McGill / Pell-lab boilerplate. Should it be: (a) "All rights reserved" attributed to Jiang Lab / SISU ILAS; (b) a permissive license (MIT / CC-BY) — confirm with PI; or (c) something SISU specifies?
2. **`scripts/build_xlsx.py`.** README references it; the file is not in the repo. Is it intentionally external (Wenjun's local-only seed script), or should it be vendored in?
3. **Em-dash vs colon punctuation in projects / news.** Which version is canonical — the em-dashes in the xlsx, or the colons in the JSON? The English colon-as-separator reads as a typo; the Chinese em-dash is correct CJK style. If em-dash is canonical, re-running `fetch_orcid.py` reverts the JSON; if colon was an intentional manual fix, the xlsx should be updated to match so the next sync doesn't undo it.
4. **`home.pi_bio` i18n content.** The bilingual bio is sitting in i18n with no HTML consumer. Add a `data-i18n` slot to `index.html` to render it, or delete the keys? It's a substantial paragraph that mentions Elsevier Highly Cited, ISCA/EURASIP best paper, and Shanghai talent programs — content that would suit the home page.
5. **Wenjun Chen on People.** Confirmed absent from the People sheet (only PI present). He still appears under Collaborators as "PhD candidate, McGill University". Should there also be an Alumni row, given §6(c) says he was previously deleted? If so, what role / period?
6. **`update_and_preview.ps1` auto-commit.** It auto-commits with a date-stamped message and pushes to `main` on every successful sync. Standing instructions say "feature branches with manual merge". Keep the script's behavior (data-only commits get a free pass on main) or change to: produce the changes, leave staging unstaged, and let Wenjun commit manually?
7. **Collaborators sheet → `collaborators.json` pipeline.** OK to add an `emit_collaborators` step (§8 milestone 5) so the xlsx becomes the only place to edit collaborator entries, including bios? Or keep `collaborators.json` as a manual file (and drop the bio column from xlsx since it's currently unread)?
8. **PI photo.** Is a higher-resolution headshot available, or should we leave the current 400×400 / 15 KB file in place?
9. **Tel placeholder in footer** (`main.js:146`: `Tel.: +86-21-3537-XXXX`). What's the correct number to put there — or omit until known?
10. **Author identity going forward.** Local config is already `Wenjun Chen <75600073+wenjunchen29@users.noreply.github.com>`, so future commits will be correct. Historical commits remain under `Sherman <chenwenjunedu@outlook.com>` — leave as-is, or rewrite history (e.g. `git filter-repo --mailmap`)?
