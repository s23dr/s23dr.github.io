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
