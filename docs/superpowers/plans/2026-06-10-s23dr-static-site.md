# S23DR 2024 Static Leaderboard Site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a zero-cost static archive site for the S23DR 2024 competition, hosted on GitHub Pages, replacing the live HuggingFace space.

**Architecture:** A Python script (`build_data.py`) pre-processes the raw competition data into a single `data/leaderboard.json`. Four plain HTML pages share a CSS stylesheet and nav script; the leaderboard page fetches the JSON at runtime and renders it; the three content pages fetch Markdown files and render them via marked.js from CDN.

**Tech Stack:** HTML/CSS/JS (no framework), Python 3 (build script only), marked.js from CDN, GitHub Pages.

---

## File Map

| File | Responsibility |
|------|---------------|
| `build_data.py` | One-time script: reads source JSONs → writes `data/leaderboard.json` |
| `data/leaderboard.json` | Pre-built leaderboard data fetched by the browser |
| `css/style.css` | All styles: header, nav, table, baselines, tabs, markdown content |
| `js/nav.js` | Highlights active nav item based on current page filename |
| `js/leaderboard.js` | Fetches JSON, sorts, renders table, handles tab switching |
| `index.html` | Overview page — fetches `content/competition_desc.md`, renders via marked.js |
| `dataset.html` | Dataset page — same pattern for `content/dataset_desc.md` |
| `rules.html` | Rules page — same pattern for `content/rules.md` |
| `leaderboard.html` | Leaderboard page — shell that loads `js/leaderboard.js` |
| `content/competition_desc.md` | Copied from source dataset |
| `content/dataset_desc.md` | Copied from source dataset |
| `content/rules.md` | Copied from source dataset |
| `.gitignore` | Excludes `.superpowers/`, `__pycache__/`, etc. |

---

## Task 1: Scaffold directory structure and .gitignore

**Files:**
- Create: `.gitignore`
- Create: `css/` `js/` `data/` `content/` (directories)

- [ ] **Create directories and .gitignore**

```bash
mkdir -p css js data content
```

Create `.gitignore`:

```
.superpowers/
__pycache__/
*.pyc
.DS_Store
```

- [ ] **Commit**

```bash
git add .gitignore
git commit -m "chore: scaffold directory structure"
```

---

## Task 2: Write and run build_data.py

**Files:**
- Create: `build_data.py`
- Creates: `data/leaderboard.json`

**Source data paths (hardcoded in script):**
```
/Users/dmytromishkin/dev/old_hf_s23dr_prev_years/S23DR_2024_ds/teams.json
/Users/dmytromishkin/dev/old_hf_s23dr_prev_years/S23DR_2024_ds/submission_info/*.json
```

- [ ] **Create `build_data.py`**

```python
#!/usr/bin/env python3
import json
from datetime import datetime
from pathlib import Path

DS_BASE = Path("/Users/dmytromishkin/dev/old_hf_s23dr_prev_years/S23DR_2024_ds")
TEAMS_FILE = DS_BASE / "teams.json"
SUBMISSION_INFO_DIR = DS_BASE / "submission_info"
OUT_FILE = Path("data/leaderboard.json")

SCORE_KEYS = ["WED2", "WED_mu", "WED_p5", "WED_p25", "WED_p50", "WED_p75", "WED_p95"]


def best_selected(submissions, score_field):
    candidates = [
        s for s in submissions
        if s.get("selected") and s.get(score_field) and s[score_field].get("WED2") is not None
    ]
    if not candidates:
        return None
    best = min(candidates, key=lambda s: s[score_field]["WED2"])
    scores = best[score_field]
    return {
        **{k: scores.get(k) for k in SCORE_KEYS},
        "submission_comment": best.get("submission_comment", ""),
        "datetime": best.get("datetime", ""),
    }


def main():
    teams = json.loads(TEAMS_FILE.read_text())
    result = []

    for team_id, team_info in teams.items():
        name = team_info["name"]
        is_baseline = "[baseline]" in name.lower()

        info_path = SUBMISSION_INFO_DIR / f"{team_id}.json"
        public_entry = None
        private_entry = None

        if info_path.exists():
            data = json.loads(info_path.read_text())
            subs = data.get("submissions", [])
            public_entry = best_selected(subs, "public_score")
            private_entry = best_selected(subs, "private_score")

        result.append({
            "id": team_id,
            "name": name,
            "is_baseline": is_baseline,
            "public": public_entry,
            "private": private_entry,
        })

    # Pre-sort by private WED2 ascending (nulls last)
    result.sort(key=lambda t: (
        t["private"] is None,
        t["private"]["WED2"] if t["private"] else float("inf")
    ))

    OUT_FILE.parent.mkdir(exist_ok=True)
    output = {
        "generated": datetime.utcnow().isoformat() + "Z",
        "teams": result,
    }
    OUT_FILE.write_text(json.dumps(output, indent=2))
    print(f"Wrote {len(result)} teams to {OUT_FILE}")


if __name__ == "__main__":
    main()
```

- [ ] **Run the script**

```bash
python3 build_data.py
```

Expected output:
```
Wrote 31 teams to data/leaderboard.json
```

- [ ] **Verify the output looks correct**

```bash
python3 -c "
import json
d = json.load(open('data/leaderboard.json'))
print('Generated:', d['generated'])
print('Team count:', len(d['teams']))
print('First team:', d['teams'][0]['name'], 'private WED2:', d['teams'][0]['private']['WED2'])
print('Baselines:', [t['name'] for t in d['teams'] if t['is_baseline']])
"
```

Expected: first team has the lowest WED2 (~1.7), two baseline teams visible somewhere in list.

- [ ] **Commit**

```bash
git add build_data.py data/leaderboard.json
git commit -m "feat: add build_data.py and generated leaderboard.json"
```

---

## Task 3: Write css/style.css

**Files:**
- Create: `css/style.css`

- [ ] **Create `css/style.css`**

```css
/* ── Reset & Base ──────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  color: #1a1a1a;
  background: #f3f4f6;
  min-height: 100vh;
}

a { color: #4f46e5; text-decoration: none; }
a:hover { text-decoration: underline; }

/* ── Site wrapper ───────────────────────────────────────────────── */
.site-wrapper {
  max-width: 1100px;
  margin: 0 auto;
  background: #fff;
  min-height: 100vh;
  box-shadow: 0 0 0 1px #e5e7eb;
}

/* ── Header ─────────────────────────────────────────────────────── */
.site-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 28px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}

.site-logo {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #22c55e 0%, #6366f1 100%);
}

.site-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
}

.site-subtitle {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

/* ── Nav ────────────────────────────────────────────────────────── */
.site-nav {
  display: flex;
  padding: 0 28px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}

.nav-item {
  display: block;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  transition: color .15s, border-color .15s;
}

.nav-item:hover { color: #111; text-decoration: none; }

.nav-item.active {
  color: #111;
  font-weight: 600;
  border-bottom-color: #6366f1;
}

/* ── Page body ──────────────────────────────────────────────────── */
.site-body {
  padding: 28px;
}

/* ── Leaderboard tabs ───────────────────────────────────────────── */
.lb-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.lb-tab {
  padding: 5px 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  background: #fff;
  transition: background .15s, color .15s, border-color .15s;
}

.lb-tab:hover { border-color: #6366f1; color: #6366f1; }

.lb-tab.active {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
}

/* ── Leaderboard info line ──────────────────────────────────────── */
.lb-info {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 12px;
}

/* ── Table ──────────────────────────────────────────────────────── */
.lb-table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}

th {
  text-align: left;
  padding: 8px 10px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
  font-weight: 600;
  white-space: nowrap;
}

td {
  padding: 7px 10px;
  border-bottom: 1px solid #f3f4f6;
  white-space: nowrap;
}

tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: #fafafa; }

/* Top 3 highlights */
tr.rank-1 td { background: #fffbeb; }
tr.rank-2 td { background: #f9fafb; }
tr.rank-3 td { background: #f9fafb; }

/* Baseline rows */
tr.baseline td {
  color: #9ca3af;
  background: #fafafa;
}
tr.baseline:hover td { background: #f3f4f6; }

.baseline-tag {
  display: inline-block;
  font-size: 10px;
  background: #e5e7eb;
  color: #9ca3af;
  padding: 1px 5px;
  border-radius: 3px;
  margin-left: 4px;
  vertical-align: middle;
  font-weight: 500;
}

.score-val { font-family: 'SFMono-Regular', Consolas, monospace; }

.comment-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #6b7280;
}
tr.baseline .comment-cell { color: #9ca3af; }

.lb-note {
  margin-top: 14px;
  font-size: 12px;
  color: #6b7280;
}

/* ── Markdown content pages ─────────────────────────────────────── */
.markdown-body { line-height: 1.7; color: #1a1a1a; }
.markdown-body h1 { font-size: 1.6rem; margin: 0 0 .6rem; }
.markdown-body h2 { font-size: 1.2rem; margin: 1.6rem 0 .5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: .3rem; }
.markdown-body h3 { font-size: 1rem; margin: 1.2rem 0 .4rem; }
.markdown-body p  { margin: .7rem 0; }
.markdown-body ul, .markdown-body ol { margin: .7rem 0 .7rem 1.5rem; }
.markdown-body li { margin: .2rem 0; }
.markdown-body pre { background: #f6f8fa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px; overflow-x: auto; margin: 1rem 0; }
.markdown-body code { font-family: 'SFMono-Regular', Consolas, monospace; font-size: .88em; background: #f3f4f6; padding: .15em .35em; border-radius: 3px; }
.markdown-body pre code { background: none; padding: 0; font-size: .85em; }
.markdown-body blockquote { border-left: 3px solid #e5e7eb; color: #6b7280; padding: .4rem 1rem; margin: 1rem 0; }
.markdown-body table { font-size: 13px; }
.markdown-body img { max-width: 100%; border-radius: 4px; margin: .5rem 0; }
.markdown-body iframe { border: none; }
.markdown-body a { color: #4f46e5; }

.content-loading { color: #9ca3af; font-style: italic; padding: 20px 0; }
```

- [ ] **Commit**

```bash
git add css/style.css
git commit -m "feat: add shared stylesheet"
```

---

## Task 4: Write js/nav.js

**Files:**
- Create: `js/nav.js`

- [ ] **Create `js/nav.js`**

```javascript
// Highlights the nav link whose data-page matches the current filename.
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item[data-page]').forEach(function (el) {
    if (el.dataset.page === page) {
      el.classList.add('active');
    }
  });
}());
```

- [ ] **Commit**

```bash
git add js/nav.js
git commit -m "feat: add shared nav active-state script"
```

---

## Task 5: Write index.html (Overview page)

**Files:**
- Create: `index.html`

This page (and dataset.html / rules.html) fetches a Markdown file and renders it via marked.js from CDN. The fetch works under any HTTP server (GitHub Pages, `python3 -m http.server`), but not via `file://` URLs.

- [ ] **Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>S23DR 2024 — Overview</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
<div class="site-wrapper">
  <header class="site-header">
    <div class="site-logo"></div>
    <div>
      <div class="site-title">S23DR 2024 — Structured Semantic 3D Reconstruction</div>
      <div class="site-subtitle">CVPR 2024 Workshop Challenge &middot; Competition closed &middot; Results archived</div>
    </div>
  </header>
  <nav class="site-nav">
    <a class="nav-item" href="index.html" data-page="index.html">Overview</a>
    <a class="nav-item" href="dataset.html" data-page="dataset.html">Dataset</a>
    <a class="nav-item" href="rules.html" data-page="rules.html">Rules</a>
    <a class="nav-item" href="leaderboard.html" data-page="leaderboard.html">Leaderboard</a>
  </nav>
  <main class="site-body markdown-body" id="content">
    <span class="content-loading">Loading…</span>
  </main>
</div>
<script src="https://cdn.jsdelivr.net/npm/marked@9/marked.min.js"></script>
<script src="js/nav.js"></script>
<script>
  fetch('content/competition_desc.md')
    .then(function (r) { return r.text(); })
    .then(function (md) {
      document.getElementById('content').innerHTML = marked.parse(md);
    })
    .catch(function () {
      document.getElementById('content').textContent = 'Failed to load content.';
    });
</script>
</body>
</html>
```

- [ ] **Commit**

```bash
git add index.html
git commit -m "feat: add Overview page"
```

---

## Task 6: Write dataset.html and rules.html

**Files:**
- Create: `dataset.html`
- Create: `rules.html`

Both follow the identical pattern as `index.html` — only the `<title>`, active nav item, and fetched Markdown file differ.

- [ ] **Create `dataset.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>S23DR 2024 — Dataset</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
<div class="site-wrapper">
  <header class="site-header">
    <div class="site-logo"></div>
    <div>
      <div class="site-title">S23DR 2024 — Structured Semantic 3D Reconstruction</div>
      <div class="site-subtitle">CVPR 2024 Workshop Challenge &middot; Competition closed &middot; Results archived</div>
    </div>
  </header>
  <nav class="site-nav">
    <a class="nav-item" href="index.html" data-page="index.html">Overview</a>
    <a class="nav-item" href="dataset.html" data-page="dataset.html">Dataset</a>
    <a class="nav-item" href="rules.html" data-page="rules.html">Rules</a>
    <a class="nav-item" href="leaderboard.html" data-page="leaderboard.html">Leaderboard</a>
  </nav>
  <main class="site-body markdown-body" id="content">
    <span class="content-loading">Loading…</span>
  </main>
</div>
<script src="https://cdn.jsdelivr.net/npm/marked@9/marked.min.js"></script>
<script src="js/nav.js"></script>
<script>
  fetch('content/dataset_desc.md')
    .then(function (r) { return r.text(); })
    .then(function (md) {
      document.getElementById('content').innerHTML = marked.parse(md);
    })
    .catch(function () {
      document.getElementById('content').textContent = 'Failed to load content.';
    });
</script>
</body>
</html>
```

- [ ] **Create `rules.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>S23DR 2024 — Rules</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
<div class="site-wrapper">
  <header class="site-header">
    <div class="site-logo"></div>
    <div>
      <div class="site-title">S23DR 2024 — Structured Semantic 3D Reconstruction</div>
      <div class="site-subtitle">CVPR 2024 Workshop Challenge &middot; Competition closed &middot; Results archived</div>
    </div>
  </header>
  <nav class="site-nav">
    <a class="nav-item" href="index.html" data-page="index.html">Overview</a>
    <a class="nav-item" href="dataset.html" data-page="dataset.html">Dataset</a>
    <a class="nav-item" href="rules.html" data-page="rules.html">Rules</a>
    <a class="nav-item" href="leaderboard.html" data-page="leaderboard.html">Leaderboard</a>
  </nav>
  <main class="site-body markdown-body" id="content">
    <span class="content-loading">Loading…</span>
  </main>
</div>
<script src="https://cdn.jsdelivr.net/npm/marked@9/marked.min.js"></script>
<script src="js/nav.js"></script>
<script>
  fetch('content/rules.md')
    .then(function (r) { return r.text(); })
    .then(function (md) {
      document.getElementById('content').innerHTML = marked.parse(md);
    })
    .catch(function () {
      document.getElementById('content').textContent = 'Failed to load content.';
    });
</script>
</body>
</html>
```

- [ ] **Commit**

```bash
git add dataset.html rules.html
git commit -m "feat: add Dataset and Rules pages"
```

---

## Task 7: Write js/leaderboard.js

**Files:**
- Create: `js/leaderboard.js`

The script is loaded by `leaderboard.html`. It fetches `data/leaderboard.json`, renders the table, and handles Public/Private tab switching. The JSON is pre-sorted by private WED2; on tab switch the JS re-sorts by the active tab's WED2.

- [ ] **Create `js/leaderboard.js`**

```javascript
var SCORE_KEYS = ['WED2', 'WED_mu', 'WED_p5', 'WED_p25', 'WED_p50', 'WED_p75', 'WED_p95'];
var MEDALS = ['🥇', '🥈', '🥉'];
var activeTab = 'private';
var leaderboardData = null;

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmt(val) {
  return (val != null) ? Number(val).toFixed(4) : '&mdash;';
}

function renderTable() {
  var teams = leaderboardData.teams.slice();

  // Re-sort by active tab's WED2 ascending (null scores last)
  teams.sort(function (a, b) {
    var aScore = (a[activeTab] && a[activeTab].WED2 != null) ? a[activeTab].WED2 : Infinity;
    var bScore = (b[activeTab] && b[activeTab].WED2 != null) ? b[activeTab].WED2 : Infinity;
    return aScore - bScore;
  });

  var medalCount = 0;
  var rows = teams.map(function (team, i) {
    var rank = i + 1;
    var score = team[activeTab];
    var isBaseline = team.is_baseline;

    // Medal for top 3 non-baseline teams with a score
    var rankDisplay = String(rank);
    if (!isBaseline && score && medalCount < 3) {
      rankDisplay = MEDALS[medalCount] + ' ' + rank;
      medalCount++;
    }

    // Score cells
    var scoreCells = SCORE_KEYS.map(function (k) {
      return '<td class="score-val">' + (score ? fmt(score[k]) : '&mdash;') + '</td>';
    }).join('');

    // Comment cell
    var comment = (score && score.submission_comment) ? score.submission_comment : '';
    var commentCell = '<td class="comment-cell" title="' + escHtml(comment) + '">'
      + (comment ? escHtml(comment) : '&mdash;') + '</td>';

    // Row class
    var rowClass = isBaseline ? 'baseline' : (rank <= 3 ? 'rank-' + rank : '');

    // Team name: strip [baseline] tag and show as separate badge
    var displayName = escHtml(team.name.replace(/\s*\[baseline\]/i, '').trim());
    var nameCell = displayName + (isBaseline ? ' <span class="baseline-tag">baseline</span>' : '');

    return '<tr class="' + rowClass + '">'
      + '<td>' + rankDisplay + '</td>'
      + '<td>' + nameCell + '</td>'
      + scoreCells
      + commentCell
      + '</tr>';
  });

  document.getElementById('lb-tbody').innerHTML = rows.join('');
}

function switchTab(tab) {
  activeTab = tab;
  document.getElementById('tab-private').classList.toggle('active', tab === 'private');
  document.getElementById('tab-public').classList.toggle('active', tab === 'public');
  renderTable();
}

fetch('data/leaderboard.json')
  .then(function (r) { return r.json(); })
  .then(function (data) {
    leaderboardData = data;
    document.getElementById('lb-generated').textContent =
      'Data generated: ' + data.generated.replace('T', ' ').replace('Z', ' UTC');
    renderTable();
  })
  .catch(function (err) {
    document.getElementById('lb-tbody').innerHTML =
      '<tr><td colspan="10">Failed to load leaderboard data.</td></tr>';
    console.error(err);
  });
```

- [ ] **Commit**

```bash
git add js/leaderboard.js
git commit -m "feat: add leaderboard render script"
```

---

## Task 8: Write leaderboard.html

**Files:**
- Create: `leaderboard.html`

- [ ] **Create `leaderboard.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>S23DR 2024 — Leaderboard</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
<div class="site-wrapper">
  <header class="site-header">
    <div class="site-logo"></div>
    <div>
      <div class="site-title">S23DR 2024 — Structured Semantic 3D Reconstruction</div>
      <div class="site-subtitle">CVPR 2024 Workshop Challenge &middot; Competition closed &middot; Results archived</div>
    </div>
  </header>
  <nav class="site-nav">
    <a class="nav-item" href="index.html" data-page="index.html">Overview</a>
    <a class="nav-item" href="dataset.html" data-page="dataset.html">Dataset</a>
    <a class="nav-item" href="rules.html" data-page="rules.html">Rules</a>
    <a class="nav-item" href="leaderboard.html" data-page="leaderboard.html">Leaderboard</a>
  </nav>
  <div class="site-body">
    <div class="lb-tabs">
      <button class="lb-tab active" id="tab-private" onclick="switchTab('private')">Private</button>
      <button class="lb-tab" id="tab-public" onclick="switchTab('public')">Public</button>
    </div>
    <div class="lb-info">
      Best selected submission per team &middot; ranked by WED2 (lower is better) &middot;
      <span id="lb-generated"></span>
    </div>
    <div class="lb-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Team</th>
            <th>WED2</th>
            <th>WED_mu</th>
            <th>WED_p5</th>
            <th>WED_p25</th>
            <th>WED_p50</th>
            <th>WED_p75</th>
            <th>WED_p95</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody id="lb-tbody">
          <tr><td colspan="10" class="content-loading">Loading…</td></tr>
        </tbody>
      </table>
    </div>
    <p class="lb-note">Ranked by WED2 — lower is better. Baselines shown in-place, greyed out.</p>
  </div>
</div>
<script src="js/nav.js"></script>
<script src="js/leaderboard.js"></script>
</body>
</html>
```

- [ ] **Commit**

```bash
git add leaderboard.html
git commit -m "feat: add Leaderboard page"
```

---

## Task 9: Copy content Markdown files

**Files:**
- Create: `content/competition_desc.md`
- Create: `content/dataset_desc.md`
- Create: `content/rules.md`

- [ ] **Copy the three Markdown files**

```bash
cp /Users/dmytromishkin/dev/old_hf_s23dr_prev_years/S23DR_2024_ds/COMPETITION_DESC.md content/competition_desc.md
cp /Users/dmytromishkin/dev/old_hf_s23dr_prev_years/S23DR_2024_ds/DATASET_DESC.md content/dataset_desc.md
cp /Users/dmytromishkin/dev/old_hf_s23dr_prev_years/S23DR_2024_ds/RULES.md content/rules.md
```

- [ ] **Commit**

```bash
git add content/
git commit -m "feat: add competition content Markdown files"
```

---

## Task 10: Local smoke test

Verify all four pages work correctly before pushing.

- [ ] **Start local HTTP server**

```bash
python3 -m http.server 8080
```

Open http://localhost:8080 in your browser.

- [ ] **Check each page**

| Page | URL | Expected |
|------|-----|----------|
| Overview | http://localhost:8080/index.html | Competition description rendered, "Overview" nav tab active |
| Dataset | http://localhost:8080/dataset.html | Dataset description rendered, "Dataset" nav tab active |
| Rules | http://localhost:8080/rules.html | Rules text rendered, "Rules" nav tab active |
| Leaderboard | http://localhost:8080/leaderboard.html | Table loads with ~31 rows, "Leaderboard" nav tab active |

- [ ] **Check leaderboard specifics**

1. **Private tab active by default** — page loads showing private scores
2. **First row** — should be team "rozumden" (or whichever has lowest private WED2) with 🥇 medal
3. **Medal rows** — top 3 non-baseline rows have medal emoji + gold/silver/bronze highlight
4. **Baseline rows** — "handcrafted" and "zeros" appear at their rank position, greyed out, with `baseline` badge; "zeros" shows — for all score columns
5. **Tab switch** — click "Public" button, table re-sorts by public WED2; click "Private", table re-sorts back
6. **Nav highlight** — each page correctly highlights its nav item

- [ ] **Kill the server** once done (`Ctrl-C`)

---

## Task 11: GitHub Pages setup

- [ ] **Ensure GitHub Pages is configured to serve from the repo root on `main` branch**

In the GitHub repo settings → Pages → Source: Deploy from branch → Branch: `main` → Folder: `/ (root)`.

No `gh-pages` branch or workflow needed — GitHub Pages serves static files from the root of `main` directly.

- [ ] **Add a README.md** with a note on how to update the leaderboard data

```bash
cat > README.md << 'EOF'
# S23DR 2024 — Static Leaderboard Site

Static archive of the S23DR 2024 competition hosted on GitHub Pages.

## To regenerate leaderboard data

```bash
python3 build_data.py
git add data/leaderboard.json
git commit -m "chore: refresh leaderboard data"
git push
```

Source data must be present at the hardcoded path in `build_data.py`.
EOF
```

- [ ] **Commit and push**

```bash
git add README.md
git commit -m "docs: add README with update instructions"
git push -u origin main
```

- [ ] **Verify the live site** at `https://<your-github-username>.github.io/s23dr_comp_website/` (or the configured Pages URL) once GitHub Pages finishes deploying (usually < 1 minute).
