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
│   └── fetch_orcid.py     ORCID sync → site_data.xlsx → JSON
├── site_data.xlsx         Manual-fields layer + source of truth for
│                          People / Projects / Collaborators / Funders / Publications
└── README.md
```

## Updating content

### People / projects / collaborators / funders / publications
Edit the matching sheet in `site_data.xlsx`, then run the sync script
below. The script reads every sheet and regenerates the corresponding
JSON file. Manual columns in the Publications sheet (`pdf_url`,
`code_url`, `video_url`, `show`, `category`, `group_id`, `notes`) are
preserved across sync runs.

### News / facilities
These two JSON files are still hand-edited:
- `assets/data/news.json`
- `assets/data/facilities.json`

### Publications (ORCID sync)

```bash
pip install requests openpyxl
python scripts/fetch_orcid.py
```

This:
1. fetches works from every ORCID listed in `LAB_ORCIDS` at the top
   of the script,
2. merges and de-duplicates by DOI (falls back to title prefix),
3. **preserves manual fields** (`pdf_url`, `code_url`, `video_url`,
   `category`, `show`, `group_id`, `notes`) that you've added in
   `site_data.xlsx`,
4. regenerates `assets/data/publications.json`,
5. also emits `people.json`, `projects.json`, `collaborators.json`,
   and `funders.json` from their respective sheets.

Add new lab members to the ORCID sync by appending to `LAB_ORCIDS`. To
bold their name on the site, leave it to `fetch_orcid.py` — it builds
`author_patterns` from each member's English name in the People sheet.

### Highlighting a paper as "Chinese journal"
ORCID doesn't tag this. Open `site_data.xlsx`, set the `category` cell
to `chinese` for the relevant row, save, and re-run the sync (or just
edit `publications.json` directly).

### Hiding a paper without deleting it
Set `show = no` in `site_data.xlsx`.

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
