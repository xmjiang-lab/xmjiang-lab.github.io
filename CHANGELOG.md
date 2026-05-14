# Changelog

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
