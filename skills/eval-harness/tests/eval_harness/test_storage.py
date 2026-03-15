"""Tests for runner.storage module."""
import pytest
import tempfile
import os
from runner.storage import Storage


@pytest.fixture
def db(tmp_path):
    storage = Storage(str(tmp_path / "test.db"))
    storage.init()
    return storage


def _make_run(db):
    return db.create_run(suite_id=None, mode="pass-at-k", model_id="claude-sonnet-4-6")


def _make_trial(db, run_id, task_id="t1", trial_num=1):
    return db.create_trial(
        run_id=run_id, task_id=task_id, trial_num=trial_num,
        passed=True, weighted_score=0.9,
        n_turns=3, n_tool_calls=5, n_tokens=1000,
        latency_ms=500, cost_usd=0.01,
        transcript_json='{"steps":[]}',
    )


class TestStorageInit:
    def test_init_creates_tables(self, db):
        conn = db._conn()
        cursor = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table'"
        )
        tables = {row[0] for row in cursor.fetchall()}
        conn.close()
        assert "runs" in tables
        assert "trials" in tables
        assert "grader_results" in tables
        assert "human_reviews" in tables


class TestRunLifecycle:
    def test_create_run_returns_id(self, db):
        run_id = _make_run(db)
        assert isinstance(run_id, int)
        assert run_id >= 1

    def test_finish_run(self, db):
        run_id = _make_run(db)
        db.finish_run(run_id)  # should not raise

    def test_run_summary_empty(self, db):
        run_id = _make_run(db)
        summary = db.get_run_summary(run_id)
        assert summary["total"] == 0
        assert summary["passed"] == 0

    def test_run_summary_with_trials(self, db):
        run_id = _make_run(db)
        db.create_trial(
            run_id=run_id, task_id="t1", trial_num=1,
            passed=True, weighted_score=1.0,
            n_turns=1, n_tool_calls=1, n_tokens=100,
            latency_ms=100, cost_usd=0.001,
            transcript_json="{}",
        )
        db.create_trial(
            run_id=run_id, task_id="t1", trial_num=2,
            passed=False, weighted_score=0.0,
            n_turns=1, n_tool_calls=1, n_tokens=100,
            latency_ms=100, cost_usd=0.001,
            transcript_json="{}",
        )
        summary = db.get_run_summary(run_id)
        assert summary["total"] == 2
        assert summary["passed"] == 1
        assert summary["pass_rate"] == pytest.approx(0.5)
        assert summary["avg_score"] == pytest.approx(0.5)


class TestTrialLifecycle:
    def test_create_and_get_trial(self, db):
        run_id = _make_run(db)
        trial_id = _make_trial(db, run_id, task_id="task-1", trial_num=1)
        assert isinstance(trial_id, int)

        trial = db.get_trial(trial_id)
        assert trial["task_id"] == "task-1"
        assert trial["trial_num"] == 1
        assert trial["passed"] == 1  # SQLite stores bool as int

    def test_get_trials_for_run(self, db):
        run_id = _make_run(db)
        _make_trial(db, run_id, task_id="task-1", trial_num=1)
        _make_trial(db, run_id, task_id="task-1", trial_num=2)
        _make_trial(db, run_id, task_id="task-2", trial_num=1)

        trials = db.get_trials_for_run(run_id)
        assert len(trials) == 3
        task_ids = {t["task_id"] for t in trials}
        assert task_ids == {"task-1", "task-2"}

    def test_trial_with_error(self, db):
        run_id = _make_run(db)
        trial_id = db.create_trial(
            run_id=run_id, task_id="t1", trial_num=1,
            passed=False, weighted_score=0.0,
            n_turns=0, n_tool_calls=0, n_tokens=0,
            latency_ms=0, cost_usd=0.0,
            transcript_json="{}", error="timeout",
        )
        trial = db.get_trial(trial_id)
        assert trial["error"] == "timeout"
        assert trial["passed"] == 0


class TestGraderResults:
    def test_save_and_retrieve_grader_result(self, db):
        run_id = _make_run(db)
        trial_id = _make_trial(db, run_id)
        db.save_grader_result(
            trial_id=trial_id,
            grader_type="unit_tests",
            score=0.8,
            weight=0.5,
            details={"passed": 8, "total": 10},
        )
        results = db.get_grader_results(trial_id)
        assert len(results) == 1
        assert results[0]["grader_type"] == "unit_tests"
        assert results[0]["score"] == pytest.approx(0.8)
        assert results[0]["weight"] == pytest.approx(0.5)

    def test_multiple_graders(self, db):
        run_id = _make_run(db)
        trial_id = _make_trial(db, run_id)
        db.save_grader_result(trial_id, "unit_tests", 0.9, 0.5, {})
        db.save_grader_result(trial_id, "llm_rubric", 0.7, 0.5, {})
        results = db.get_grader_results(trial_id)
        assert len(results) == 2


class TestHumanReviews:
    def test_save_human_review(self, db):
        run_id = _make_run(db)
        trial_id = _make_trial(db, run_id)
        db.save_human_review(
            trial_id=trial_id,
            reviewer="alice",
            verdict="pass",
            score=0.9,
            notes="Looks good",
        )
        reviews = db.get_human_reviews(trial_id)
        assert len(reviews) == 1
        assert reviews[0]["verdict"] == "pass"
        assert reviews[0]["reviewer"] == "alice"
        assert reviews[0]["score"] == pytest.approx(0.9)
