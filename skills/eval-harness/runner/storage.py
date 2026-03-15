"""SQLite storage adapter for eval-harness."""
import sqlite3
from pathlib import Path
from typing import Optional
import json


class Storage:
    def __init__(self, db_path: str):
        self.db_path = db_path
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)

    def _conn(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    def init(self):
        with self._conn() as conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS suites (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    created_at TEXT DEFAULT (datetime('now')),
                    config_yaml TEXT
                );
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    suite_id INTEGER REFERENCES suites(id),
                    task_id TEXT NOT NULL,
                    agent_type TEXT,
                    difficulty TEXT,
                    yaml_path TEXT,
                    eval_mode TEXT,
                    k INTEGER DEFAULT 3,
                    metric TEXT DEFAULT 'pass-at-k'
                );
                CREATE TABLE IF NOT EXISTS runs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    suite_id INTEGER REFERENCES suites(id),
                    started_at TEXT DEFAULT (datetime('now')),
                    finished_at TEXT,
                    mode TEXT,
                    git_commit TEXT,
                    model_id TEXT
                );
                CREATE TABLE IF NOT EXISTS trials (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    run_id INTEGER REFERENCES runs(id),
                    task_id TEXT NOT NULL,
                    trial_num INTEGER,
                    passed INTEGER DEFAULT 0,
                    weighted_score REAL DEFAULT 0.0,
                    n_turns INTEGER DEFAULT 0,
                    n_tool_calls INTEGER DEFAULT 0,
                    n_tokens INTEGER DEFAULT 0,
                    latency_ms INTEGER DEFAULT 0,
                    cost_usd REAL DEFAULT 0.0,
                    transcript_json TEXT,
                    error TEXT,
                    created_at TEXT DEFAULT (datetime('now'))
                );
                CREATE TABLE IF NOT EXISTS grader_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    trial_id INTEGER REFERENCES trials(id),
                    grader_type TEXT,
                    score REAL,
                    weight REAL,
                    details_json TEXT
                );
                CREATE TABLE IF NOT EXISTS human_reviews (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    trial_id INTEGER REFERENCES trials(id),
                    reviewer TEXT,
                    score REAL,
                    verdict TEXT,
                    notes TEXT,
                    reviewed_at TEXT DEFAULT (datetime('now'))
                );
            """)

    def create_suite(self, name: str, config_yaml: str = "") -> int:
        with self._conn() as conn:
            cur = conn.execute(
                "INSERT INTO suites (name, config_yaml) VALUES (?, ?)",
                (name, config_yaml)
            )
            return cur.lastrowid

    def get_suite(self, suite_id: int) -> Optional[dict]:
        with self._conn() as conn:
            row = conn.execute("SELECT * FROM suites WHERE id=?", (suite_id,)).fetchone()
            return dict(row) if row else None

    def create_run(self, suite_id: int, mode: str, model_id: str,
                   git_commit: str = "") -> int:
        with self._conn() as conn:
            cur = conn.execute(
                "INSERT INTO runs (suite_id, mode, model_id, git_commit) VALUES (?,?,?,?)",
                (suite_id, mode, model_id, git_commit)
            )
            return cur.lastrowid

    def finish_run(self, run_id: int):
        with self._conn() as conn:
            conn.execute(
                "UPDATE runs SET finished_at=datetime('now') WHERE id=?",
                (run_id,)
            )

    def create_trial(self, run_id: int, task_id: str, trial_num: int,
                     passed: bool, weighted_score: float,
                     n_turns: int, n_tool_calls: int, n_tokens: int,
                     latency_ms: int, cost_usd: float,
                     transcript_json: str, error: str = None) -> int:
        with self._conn() as conn:
            cur = conn.execute(
                """INSERT INTO trials
                   (run_id, task_id, trial_num, passed, weighted_score,
                    n_turns, n_tool_calls, n_tokens, latency_ms, cost_usd,
                    transcript_json, error)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
                (run_id, task_id, trial_num, int(passed), weighted_score,
                 n_turns, n_tool_calls, n_tokens, latency_ms, cost_usd,
                 transcript_json, error)
            )
            return cur.lastrowid

    def get_trial(self, trial_id: int) -> Optional[dict]:
        with self._conn() as conn:
            row = conn.execute("SELECT * FROM trials WHERE id=?", (trial_id,)).fetchone()
            return dict(row) if row else None

    def get_trials_for_run(self, run_id: int) -> list:
        with self._conn() as conn:
            rows = conn.execute(
                "SELECT * FROM trials WHERE run_id=? ORDER BY task_id, trial_num",
                (run_id,)
            ).fetchall()
            return [dict(r) for r in rows]

    def save_grader_result(self, trial_id: int, grader_type: str,
                           score: float, weight: float, details: dict):
        with self._conn() as conn:
            conn.execute(
                """INSERT INTO grader_results (trial_id, grader_type, score, weight, details_json)
                   VALUES (?,?,?,?,?)""",
                (trial_id, grader_type, score, weight, json.dumps(details))
            )

    def save_human_review(self, trial_id: int, reviewer: str,
                          score: float, verdict: str, notes: str):
        with self._conn() as conn:
            conn.execute(
                """INSERT INTO human_reviews (trial_id, reviewer, score, verdict, notes)
                   VALUES (?,?,?,?,?)""",
                (trial_id, reviewer, score, verdict, notes)
            )

    def get_grader_results(self, trial_id: int) -> list:
        with self._conn() as conn:
            rows = conn.execute(
                "SELECT * FROM grader_results WHERE trial_id=?", (trial_id,)
            ).fetchall()
            return [dict(r) for r in rows]

    def get_human_reviews(self, trial_id: int) -> list:
        with self._conn() as conn:
            rows = conn.execute(
                "SELECT * FROM human_reviews WHERE trial_id=?", (trial_id,)
            ).fetchall()
            return [dict(r) for r in rows]

    def get_run_summary(self, run_id: int) -> dict:
        trials = self.get_trials_for_run(run_id)
        if not trials:
            return {"run_id": run_id, "total": 0, "passed": 0, "avg_score": 0.0}
        passed = sum(1 for t in trials if t["passed"])
        avg_score = sum(t["weighted_score"] for t in trials) / len(trials)
        return {
            "run_id": run_id,
            "total": len(trials),
            "passed": passed,
            "avg_score": avg_score,
            "pass_rate": passed / len(trials),
        }
