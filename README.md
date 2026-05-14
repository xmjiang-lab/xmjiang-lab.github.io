# Jiang Lab @ SISU — Lab website

Website for the **Jiang Lab** at the **Institute of Language Sciences (ILAS)**,
Shanghai International Studies University (SISU).

**PI:** Prof. Xiaoming Jiang (蒋晓鸣)
**Affiliation:** Research Center of Psycholinguistics & Neurolinguistics, ILAS, SISU

This site replaces / complements the existing
[xiaomingjiang.wordpress.com](https://xiaomingjiang.wordpress.com/) with:

- A SISU-branded landing page (in line with the SISU Visual Identity)
- Bilingual content (中文 / English), zero-reload language switch
- Auto-updating publications list (synced from ORCID)
- A dedicated **Facilities** page that surfaces the lab's hardware — the
  single biggest selling point for international collaborators
- A **News & Recruitment** page (CSP fellowship, Shanghai Sci-tech
  Co-research Program, etc.)

---

## Repository structure

```
.
├── index.html             Home (hero + intro + sidebar)
├── people.html
├── projects.html
├── publications.html
├── facilities.html
├── news.html
├── contact.html
├── assets/
│   ├── css/style.css      SISU Blue + yellow accent
│   ├── js/main.js         i18n + data-driven renderers
│   ├── fonts/phosphor/    Self-hosted Phosphor Light icon font
│   ├── data/
│   │   ├── i18n-zh.json
│   │   ├── i18n-en.json
│   │   ├── people.json          ← emitted by fetch_orcid.py (People sheet)
│   │   ├── projects.json        ← emitted by fetch_orcid.py (Projects sheet)
│   │   ├── collaborators.json   ← emitted by fetch_orcid.py (Collaborators sheet)
│   │   ├── funders.json         ← emitted by fetch_orcid.py (Funders sheet)
│   │   ├── publications.json    ← emitted by fetch_orcid.py (ORCID + Publications sheet)
│   │   ├── facilities.json      (manual)
│   │   └── news.json            (manual)
│   └── images/
│       ├── logos/         SISU + ILAS + funder logos
│       └── people/        member photos
├── scripts/
│   ├── fetch_orcid.py     ORCID sync → site_data.xlsx → JSON.
│   │                      `--offline` skips ORCID, just emits JSON from xlsx.
│   └── build_content.ipynb  Convenience helpers for adding news,
│                            promoting members to alumni, and rebuilding
│                            the JSON without hitting ORCID.
├── site_data.xlsx         Manual-fields layer + source of truth for
│                          People / Projects / Collaborators / Funders /
│                          Publications / News
└── README.md
```

## Updating content

`site_data.xlsx` is the source of truth for **People, Projects,
Collaborators, Funders, Publications, and News**. Only
`assets/data/facilities.json` is still hand-edited.

Two ways in:

1. **Edit `site_data.xlsx` directly in Excel** (any sheet), then run the
   build script to regenerate the JSON files.
2. **Use `scripts/build_content.ipynb`** — a notebook with helpers for
   common tasks (adding news, promoting members to alumni), so you
   don't have to remember which column is which.

### Quick cheatsheet

**Publish a news item**
1. Open `scripts/build_content.ipynb`.
2. Run the imports + function-definition cells.
3. Call `add_news(date=..., title_zh=..., tag_zh=..., body_zh=..., ...)`.
4. Call `build_all()` to refresh `assets/data/news.json`.
5. Commit `site_data.xlsx` + the regenerated JSON files.

**Register a graduation / departure**
1. Open `build_content.ipynb`.
2. Call `add_graduation(name_zh=..., end_date="YYYY-MM-DD",
   period="2023–2026", next_position_zh=..., next_position_en=...)`.
   The `name_zh` must exactly match the existing People-sheet row.
3. Call `build_all()`.
4. Commit.

**Add a new lab member**
1. Open `site_data.xlsx`, go to the **People** sheet. Append a row with
   at minimum `id`, `status=current`, `role` (`phd` / `master` /
   `undergrad` / etc.), `name_zh`, `name_en`, `cohort_year`, `bio_zh`,
   `education`, `research_areas`, `show=yes`. Drop a JPG into
   `assets/images/people/<id>.jpg` and set the `photo` column to that
   filename.
2. (Optional) If the member has an ORCID, append `(orcid_id, name)` to
   `LAB_ORCIDS` at the top of `scripts/fetch_orcid.py` so their papers
   get pulled in too.
3. Run `python scripts/fetch_orcid.py` (online — picks up the new
   ORCID) or `--offline` if you're only adding the member without
   syncing ORCID.
4. Commit `site_data.xlsx`, `assets/data/*.json`, and the new photo.

### Build script

```bash
pip install requests openpyxl

# Online: fetch ORCID, merge into xlsx, emit all JSON.
python scripts/fetch_orcid.py

# Offline: skip ORCID, emit JSON from current xlsx only.
python scripts/fetch_orcid.py --offline
```

Online mode:
1. fetches works from every ORCID listed in `LAB_ORCIDS`,
2. merges and de-duplicates by DOI (falls back to title prefix),
3. **preserves manual fields** (`pdf_url`, `code_url`, `video_url`,
   `category`, `show`, `group_id`, `notes`) that you've added in
   `site_data.xlsx`,
4. writes the merged set back to the xlsx,
5. emits `publications.json` plus `people.json`, `projects.json`,
   `collaborators.json`, `funders.json`, `news.json`.

Offline mode skips steps 1–4 and just emits every JSON from the current
state of the xlsx. The `build_all()` helper in the notebook uses this
mode.

The weekly GitHub Actions sync (`.github/workflows/weekly-sync.yml`)
runs the **online** version every Monday 01:00 UTC.

### Highlighting a paper as "Chinese journal"
ORCID doesn't tag this. Open `site_data.xlsx`, set the `category` cell
to `chinese` for the relevant row, save, and re-run the sync (online or
offline both work).

### Hiding a paper / news item / member without deleting it
Set `show = no` in the corresponding `site_data.xlsx` row.

## Local preview

```bash
python -m http.server 4000
# then open http://localhost:4000
```

Or `./preview.ps1` on Windows.

## Visual identity

The stylesheet uses the **SISU Visual Identity System**:
- Primary: **SISU Blue** `#003f88` (sea & sky — the official school standard)
- Accent: **bright yellow** `#fcb813` (one of SISU's auxiliary colors)
- Type: serif (Source Han Serif SC / Songti SC / Georgia) for titles,
  sans-serif (PingFang SC / Microsoft YaHei / Helvetica) for body.

Icons: **Phosphor Icons (Light weight)**, vendored under
`assets/fonts/phosphor/`. No external CDN.

## License

See `LICENSE`. © 2026 Jiang Lab, Institute of Language Sciences, SISU.
All rights reserved.
