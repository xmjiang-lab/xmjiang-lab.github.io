# Changelog

## [unreleased] — Phase 3: Mobile responsive overhaul

### Audit findings (before)
- Only one breakpoint: `@media (max-width: 860px)` — hard cutoff with no small-phone tier and no >860px tablet tuning.
- Touch targets: dark-mode toggle 32×32 px, filter chips ~28 px tall (below the 44×44 minimum recommended on touch devices).
- Brand strip (SISU logo + lab name + dark toggle + lang switch) used a 24 px gap that wrapped awkwardly under 400 px.
- Publications filter bar: chip-label `min-width: 40 px` plus uppercase tracking ate horizontal space on narrow screens; year chips lived in an 80 px vertical scroll that read oddly on phones.
- PI card on home: `120px 1fr` photo grid stayed two-column even at 375 px.
- People grid floor of 240 px forced 1-card rows on every phablet.
- Funder cards `min-width: 200px` produced one-per-row + huge whitespace on small screens.

### Changed
- `assets/css/style.css`: replaced the single `@media (max-width: 860px)` rule with a tiered system — `≤ 1024px` (small laptops, padding trim), `≤ 768px` (tablet portrait / large phones, main mobile breakpoint), `≤ 480px` (small phones, iPhone SE / 14 Pro).
- Touch targets lifted to ≥ 40 px tap area: `.dark-toggle`, `#nav-hamburger`, `.filter-chip`, `.filter-clear`, `.authors-toggle`.
- Brand strip on phones now allows wrap; sub-line English label hides ≤ 768 px; logo shrinks 56 → 44 px ≤ 480 px.
- Hero title scale: 2.5rem → 1.875rem ≤ 768 px → 1.5rem ≤ 480 px.
- PI card on home stacks photo above text ≤ 480 px; tightens to 90px-photo grid ≤ 768 px.
- People grid floor: 240 → 200 px ≤ 768 px → 150 px ≤ 480 px (keeps 2 cards per row on iPhone SE).
- Publications filter bar: label/chips stack vertically ≤ 480 px; year chips switch to horizontal scroll with momentum on small phones.
- Funder cards shrink min-width 200 → 160 → 140 px and logo max-height 72 → 56 px on small screens.

### Removed
- Dead CSS rules `.people-cta`, `.people-cta-alumni`, `.news-cta` (and link variants) — the HTML they styled was removed in Phase 2.

### Expected mobile behavior
- **iPhone SE (375 px)**: brand strip on one line with logo at 44 px and sub-title hidden; hero title 24 px; people grid shows two cards per row; publications filter chips stack with year row horizontally scrollable; PI card photo centered above text.
- **iPhone 14 Pro (393 px)**: same as SE with a bit more breathing room; people grid still two cards per row; year chips fit ~3 chips before scroll kicks in.
- **iPad portrait (768 px)**: hits the tablet breakpoint exactly; page sidebar collapses below main content; hamburger appears; people grid 3-4 cards per row; filter chips wrap but stay in horizontal rows; touch targets enlarged.

### Local preview steps
```bash
python -m http.server 4000
# open http://localhost:4000
```
Then in Chrome: open DevTools (F12) → toggle device toolbar (Ctrl+Shift+M) → pick *iPhone SE*, *iPhone 14 Pro*, or *iPad Mini* from the device dropdown, or set a custom width.

---

## [unreleased] — Phase 2: Form system removal

### Removed
- Three public form pages: `student-form.html`, `graduation-form.html`, `news-form.html`.
- `assets/css/form.css` and `assets/js/form-submit.js` (the latter contained a hardcoded GitHub PAT split across three string segments — the token is being revoked manually on GitHub).
- The three GitHub-issue fallback templates: `.github/ISSUE_TEMPLATE/student-application.yml`, `graduation.yml`, `news.yml`.
- `.github/workflows/process-approved-issue.yml` — the workflow that ran when an Issue received the `approved` label.
- `scripts/process_issue.py` — the Python processor that merged approved Issue payloads into `site_data.xlsx`.
- `docs/student-form-guide.md` and `docs/jiang-admin-guide.md` — submitter and admin guides for the form flow.
- Three CTA blocks in `assets/js/main.js`: "apply to join the lab" and "graduation registration" in `renderPeople()`, "submit a news item" in `renderNews()`.

### Rationale
- The client-side `form-submit.js` baked a GitHub PAT into a publicly-served static asset; splitting it across three string segments did not obscure it from anyone viewing source. Removing the entire form pipeline eliminates that attack surface.
- Content management now flows exclusively through `site_data.xlsx` + the build pipeline (see upcoming Phase 2 content tooling). The Issue-based approval flow added more moving parts than the lab's submission volume justified.

---

## [unreleased] — Phase 1 Block C: Weekly auto-sync

### Added
- `.github/workflows/weekly-sync.yml` — scheduled workflow firing every Monday at 01:00 UTC (09:00 Beijing time), plus manual `workflow_dispatch`. Runs `fetch_orcid.py`, commits as `Wenjun Chen` if anything changed, pushes to `main`, and triggers a Pages deploy. The commit is authored by Wenjun Chen with no Co-Authored-By marker.

---

## [unreleased] — Phase 1 Block B: Form submission system

### Added
- Three public form pages:
  - `student-form.html` — application for prospective students (Ph.D. / M.A. / Undergrad).
  - `graduation-form.html` — register graduation / departure (move from current to alumni).
  - `news-form.html` — submit a news / recruitment / announcement item.
- `assets/css/form.css` — SISU-Blue pill-input styling with mobile-responsive layout and loading state.
- `assets/js/form-submit.js` — shared submit helper. Token split into 3 placeholder segments (`PUT_PART_1_HERE` ...) joined at runtime; replace before deploying. POSTs a structured YAML-block Issue body to GitHub Issues API; embeds photos as base64 fenced blocks.
- `scripts/process_issue.py` — parses the YAML block from an approved Issue and merges into `site_data.xlsx` (People sheet for student / graduation, News sheet for news), saves uploaded photo to `assets/images/people/<slug>.jpg`, and re-emits the affected JSON.
- `.github/workflows/process-approved-issue.yml` — runs `process_issue.py` when an Issue gets the `approved` label, commits + pushes back to `main`, triggers Pages deploy, and comments + closes the Issue. Falls back to a failure comment with log tail if processing errors.
- `.github/ISSUE_TEMPLATE/*.yml` — three Issue forms (`student-application`, `graduation`, `news`) as a fallback path for GitHub-savvy users who skip the web form.
- `News` sheet in `site_data.xlsx` (12 columns including `featured`, `summary_zh/en`, `body_zh/en`, `link`, `show`); 3 existing news items migrated in from `news.json`.
- `end_date` and `next_position` columns in the People sheet (placed before `show`), to support the graduation flow.
- `emit_news` in `fetch_orcid.py` — News sheet is now the source of truth for `news.json`.
- CTA blocks on People page (apply to join + graduation register) and News page (submit news), styled with SISU-yellow accent.
- `docs/jiang-admin-guide.md` — Chinese step-by-step on reviewing/approving submissions for Prof. Jiang.
- `docs/student-form-guide.md` — Chinese usage guide for prospective students, alumni, and news submitters.

### Changed
- `emit_people` now serializes the new `end_date` and `next_position` fields when present.

### Security
- The GitHub token is split into 3 source-level placeholders. The placeholders MUST be replaced before deploy. Do NOT commit a working token. If you accidentally commit one, revoke it in GitHub settings and issue a new one.

---

## [unreleased] — Phase 1 Block A: Cleanup

### Added
- `emit_collaborators` in `fetch_orcid.py` — Collaborators sheet now drives `collaborators.json` including `bio`.
- `assets/fonts/phosphor/` — self-hosted Phosphor Light (drop CDN).
- `home.pi_bio` wired into `index.html`.

### Changed
- `LICENSE` rewritten for Jiang Lab / SISU.
- `README.md` updated to reflect the actual current pipeline.
- `update_and_preview.ps1` portable (`$PSScriptRoot`, Python auto-detect); no auto-commit.
- Collaborator bios now render in the People-page key-collaborators section.
- `_order_key` helper in `fetch_orcid.py` fixes a pre-existing bug where `order=0` was treated as falsy and sorted last (affected `emit_projects`; now also covers `emit_collaborators`).

### Removed
- `emit_mentorship` and the dead `Mentorship` code path (no sheet, no consumer).
- Unreferenced logo files: `sisu-seal.png`, `sisu.svg`, `sisu-white.svg`, `stcsm.svg`, `ilas.svg`.
- 12 dead CSS selectors: `.announce-card`, `.hero-motto`, `.mentee-*`, `.mentorship-group-title`, `.project-pubs`, `.section-heading`, `.year-heading`, `.person-row .photo`.
- 20 unused i18n keys (symmetric across `i18n-zh.json` and `i18n-en.json`).
- Footer `Tel.:` placeholder line.
- Ghost `onerror` fallback referencing nonexistent `sisu-brand.svg`.

### Fixed
- Em-dash drift in `projects.json`, `news.json`, `funders.json`, `collaborators.json` — xlsx is canonical; JSONs regenerated from xlsx; `news.json` patched directly (no News sheet yet).
