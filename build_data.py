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
