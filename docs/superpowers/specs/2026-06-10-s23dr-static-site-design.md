---
name: s23dr-static-site-design
description: Design spec for the S23DR 2024 static leaderboard website hosted on GitHub Pages
metadata:
  type: project
---

# S23DR 2024 Static Leaderboard Website — Design Spec

## Overview

Replace the live HuggingFace space (which costs money even with submissions closed) with a zero-cost static archive site on GitHub Pages. The site preserves all read-only functionality: competition description, dataset info, rules, and the public/private leaderboards. Submission, HuggingFace login, and any dynamic server-side functionality are removed entirely.

## Constraints

- **Hosting**: GitHub Pages (free, static files only)
- **Tech stack**: Plain HTML/CSS/JS — no build toolchain, no framework, no npm
- **Data pipeline**: A one-time Python script (`build_data.py`) reads the raw source data and writes a static `data/leaderboard.json`. The website JS fetches this file at runtime.
- **Source data** (read-only, not copied into repo):
  - `/Users/dmytromishkin/dev/old_hf_s23dr_prev_years/S23DR_2024_ds/submission_info/*.json` — per-team submission records with scores
  - `/Users/dmytromishkin/dev/old_hf_s23dr_prev_years/S23DR_2024_ds/teams.json` — team id → name mapping
  - `/Users/dmytromishkin/dev/old_hf_s23dr_prev_years/S23DR_2024_ds/COMPETITION_DESC.md`
  - `/Users/dmytromishkin/dev/old_hf_s23dr_prev_years/S23DR_2024_ds/DATASET_DESC.md`
  - `/Users/dmytromishkin/dev/old_hf_s23dr_prev_years/S23DR_2024_ds/RULES.md`

## Site Structure

Four separate HTML pages linked by a shared navigation bar:

| File | Content |
|---|---|
| `index.html` | Competition overview (renders `COMPETITION_DESC.md`) |
| `dataset.html` | Dataset description (renders `DATASET_DESC.md`) |
| `rules.html` | Competition rules (renders `RULES.md`) |
| `leaderboard.html` | Leaderboard with Public/Private tabs |

Shared assets:
- `css/style.css` — all site styles
- `js/nav.js` — shared nav bar active-state logic (included on all pages)
- `js/leaderboard.js` — leaderboard fetch + render logic
- `data/leaderboard.json` — pre-built leaderboard data (output of `build_data.py`)

## Navigation

Each page has the same top header and nav bar:
- **Header**: site logo area, title "S23DR 2024 — Structured Semantic 3D Reconstruction", subtitle "CVPR 2024 Workshop Challenge · Competition closed · Results archived"
- **Nav tabs**: Overview · Dataset · Rules · Leaderboard (active tab highlighted with indigo underline)

## Leaderboard Page

### Tabs
Two sub-tabs: **Private** (default active) and **Public**, switching which score set is displayed. Both tabs use only submissions with `selected: true`.

### Ranking logic
- One row per team: if a team has multiple `selected: true` submissions, the one with the lowest WED2 score for the active tab is used.
- Teams are ranked by WED2 ascending (lower = better).
- Teams whose name contains `[baseline]` are included inline at their actual rank position but rendered greyed out (muted text, light background). They are assigned a rank number but visually distinguished. The `zeros [baseline]` team has no scored submission and shows "—" for score columns.
- Top 3 non-baseline teams get medal emoji (🥇🥈🥉) prepended to their rank.

### Table columns
Rank · Team · WED2 · WED_mu · WED_p5 · WED_p25 · WED_p50 · WED_p75 · WED_p95 · Comment

All score values displayed to 4 decimal places. Comment is the `submission_comment` field, truncated with ellipsis if long. A note below the table reads: "Ranked by WED2 — lower is better."

## Data Pipeline (`build_data.py`)

Located at repo root. Reads source data from the hardcoded paths above (not bundled in repo). Outputs `data/leaderboard.json` with this shape:

```json
{
  "generated": "2026-06-10T...",
  "teams": [
    {
      "id": "e156ca81-...",
      "name": "rozumden",
      "is_baseline": false,
      "public": {
        "WED2": 1.7015, "WED_mu": 1.5821,
        "WED_p5": 1.1203, "WED_p25": 1.3944, "WED_p50": 1.5698,
        "WED_p75": 1.7612, "WED_p95": 2.1044,
        "submission_comment": "", "datetime": "2024-06-10 ..."
      },
      "private": { "...same shape..." }
    }
  ]
}
```

Teams with no `selected: true` submission for a tab have `null` for that tab's object. Teams are pre-sorted by private WED2 ascending in the JSON (JS re-sorts on tab switch).

## Content Pages (Overview, Dataset, Rules)

Each page fetches its corresponding Markdown file from the repo (`content/competition_desc.md`, etc.) and renders it client-side using [marked.js](https://marked.js.org/) (loaded from CDN). The raw Markdown files are copied from the source dataset into `content/` during setup. Interactive iframes in `COMPETITION_DESC.md` (3D visualisations) are preserved as-is.

## What Is Removed

- HuggingFace OAuth login
- Submission form and submission upload
- Score computation (all scores pre-computed and baked into `data/leaderboard.json`)
- Any server-side logic
- References to the HF space URL (replaced with GitHub Pages URL)

## Repository Layout

```
s23dr_comp_website/
├── index.html
├── dataset.html
├── rules.html
├── leaderboard.html
├── css/
│   └── style.css
├── js/
│   ├── nav.js            # shared nav active-state logic
│   └── leaderboard.js
├── data/
│   └── leaderboard.json  # generated by build_data.py
├── content/
│   ├── competition_desc.md
│   ├── dataset_desc.md
│   └── rules.md
├── build_data.py
└── .gitignore
```

## Out of Scope

- Dark mode toggle
- Sorting the leaderboard by columns other than WED2
- Search/filter
- Per-team submission history view
