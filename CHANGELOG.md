# Changelog

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
