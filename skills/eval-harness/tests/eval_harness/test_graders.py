"""Tests for runner.graders package."""
import pytest
from pathlib import Path

from runner.graders.code_grader import CodeGrader
from runner.graders.human_grader import HumanGrader


# ---------------------------------------------------------------------------
# CodeGrader tests
# ---------------------------------------------------------------------------

class TestCodeGraderFileExists:
    def test_file_present(self, tmp_path):
        target = tmp_path / "output.txt"
        target.write_text("hello")

        grader = CodeGrader()
        config = {"type": "file_exists", "files": [str(target.name)], "weight": 1.0}
        ctx = {"work_dir": str(tmp_path)}
        result = grader.grade(config, ctx)
        assert result["score"] == pytest.approx(1.0)
        assert result["passed"] is True

    def test_file_missing(self, tmp_path):
        grader = CodeGrader()
        config = {"type": "file_exists", "files": ["missing.txt"], "weight": 1.0}
        ctx = {"work_dir": str(tmp_path)}
        result = grader.grade(config, ctx)
        assert result["score"] == pytest.approx(0.0)
        assert result["passed"] is False

    def test_all_or_nothing_when_partial(self, tmp_path):
        """file_exists is all-or-nothing: any missing file → score 0.0."""
        present = tmp_path / "a.txt"
        present.write_text("x")
        grader = CodeGrader()
        config = {
            "type": "file_exists",
            "files": ["a.txt", "missing.txt"],
            "weight": 1.0,
        }
        ctx = {"work_dir": str(tmp_path)}
        result = grader.grade(config, ctx)
        assert result["score"] == pytest.approx(0.0)
        assert result["passed"] is False


class TestCodeGraderEfficiency:
    def test_within_bounds(self):
        grader = CodeGrader()
        config = {"type": "efficiency", "max_turns": 10, "max_tokens": 5000, "weight": 1.0}
        ctx = {"n_turns": 5, "n_tokens": 3000}
        result = grader.grade(config, ctx)
        assert result["score"] == pytest.approx(1.0)
        assert result["passed"] is True

    def test_exceeds_turns(self):
        grader = CodeGrader()
        config = {"type": "efficiency", "max_turns": 5, "max_tokens": 5000, "weight": 1.0}
        ctx = {"n_turns": 10, "n_tokens": 100}
        result = grader.grade(config, ctx)
        assert result["score"] == pytest.approx(0.0)
        assert result["passed"] is False

    def test_exceeds_tokens(self):
        grader = CodeGrader()
        config = {"type": "efficiency", "max_turns": 100, "max_tokens": 500, "weight": 1.0}
        ctx = {"n_turns": 1, "n_tokens": 1000}
        result = grader.grade(config, ctx)
        assert result["score"] == pytest.approx(0.0)
        assert result["passed"] is False

    def test_at_exact_limits(self):
        grader = CodeGrader()
        config = {"type": "efficiency", "max_turns": 5, "max_tokens": 1000, "weight": 1.0}
        ctx = {"n_turns": 5, "n_tokens": 1000}
        result = grader.grade(config, ctx)
        assert result["score"] == pytest.approx(1.0)
        assert result["passed"] is True


class TestCodeGraderDomCheck:
    def test_substring_found(self):
        """dom_check uses literal substring matching, not CSS selector parsing."""
        grader = CodeGrader()
        config = {"type": "dom_check", "selector": 'id="submit-btn"', "weight": 1.0}
        ctx = {"dom_snapshot": '<button id="submit-btn">Submit</button>'}
        result = grader.grade(config, ctx)
        assert result["score"] == pytest.approx(1.0)
        assert result["passed"] is True

    def test_selector_not_found(self):
        grader = CodeGrader()
        config = {"type": "dom_check", "selector": 'id="missing"', "weight": 1.0}
        ctx = {"dom_snapshot": "<div>hello</div>"}
        result = grader.grade(config, ctx)
        assert result["score"] == pytest.approx(0.0)
        assert result["passed"] is False

    def test_missing_dom_snapshot_returns_zero(self):
        grader = CodeGrader()
        config = {"type": "dom_check", "selector": "anything", "weight": 1.0}
        ctx = {}
        result = grader.grade(config, ctx)
        assert result["score"] == pytest.approx(0.0)


class TestCodeGraderUnknownType:
    def test_unknown_grader_type_returns_zero(self):
        grader = CodeGrader()
        config = {"type": "nonexistent_grader", "weight": 1.0}
        result = grader.grade(config, {})
        assert result["score"] == pytest.approx(0.0)
        assert result["passed"] is False
        assert "error" in result["details"]


# ---------------------------------------------------------------------------
# HumanGrader tests
# ---------------------------------------------------------------------------

class TestHumanGraderEnqueue:
    def test_creates_pending_file(self, tmp_path):
        grader = HumanGrader(review_dir=str(tmp_path))
        path = grader.enqueue(
            trial_id=42,
            task_id="task-fix-bug",
            transcript="Agent said: hello",
            reviewer="bob",
        )
        assert Path(path).exists()
        content = Path(path).read_text()
        assert "task-fix-bug" in content
        assert "bob" in content
        assert "FILL_IN" in content

    def test_review_id_format(self, tmp_path):
        grader = HumanGrader(review_dir=str(tmp_path))
        path = grader.enqueue(trial_id=7, task_id="t1", transcript="x")
        assert "review-0007" in path


class TestHumanGraderListPending:
    def test_empty_queue(self, tmp_path):
        grader = HumanGrader(review_dir=str(tmp_path))
        assert grader.list_pending() == []

    def test_lists_created_reviews(self, tmp_path):
        grader = HumanGrader(review_dir=str(tmp_path))
        grader.enqueue(trial_id=1, task_id="t1", transcript="a")
        grader.enqueue(trial_id=2, task_id="t2", transcript="b")
        pending = grader.list_pending()
        assert len(pending) == 2
        task_ids = {r["task_id"] for r in pending}
        assert task_ids == {"t1", "t2"}


class TestHumanGraderSubmit:
    def _make_review_file(self, tmp_path, verdict="pass", score=0.8, notes="ok"):
        grader = HumanGrader(review_dir=str(tmp_path))
        path = grader.enqueue(trial_id=10, task_id="t1", transcript="test")
        content = Path(path).read_text()
        content = content.replace("verdict: FILL_IN", f"verdict: {verdict}")
        content = content.replace("score: 0.0", f"score: {score}")
        content = content.replace("notes: FILL_IN", f"notes: '{notes}'")
        Path(path).write_text(content)
        return path, grader

    def test_valid_submit(self, tmp_path):
        path, grader = self._make_review_file(tmp_path)
        result = grader.submit(path)
        assert result["verdict"] == "pass"
        assert result["score"] == pytest.approx(0.8)
        assert result["trial_id"] == 10
        assert not Path(path).exists()  # moved to completed

    def test_invalid_verdict_raises(self, tmp_path):
        path, grader = self._make_review_file(tmp_path, verdict="maybe")
        with pytest.raises(ValueError, match="verdict"):
            grader.submit(path)

    def test_score_out_of_range_raises(self, tmp_path):
        path, grader = self._make_review_file(tmp_path, score=1.5)
        with pytest.raises(ValueError, match="score"):
            grader.submit(path)

    def test_unfilled_notes_raises(self, tmp_path):
        grader = HumanGrader(review_dir=str(tmp_path))
        path = grader.enqueue(trial_id=5, task_id="t1", transcript="x")
        content = Path(path).read_text()
        content = content.replace("verdict: FILL_IN", "verdict: pass")
        content = content.replace("score: 0.0", "score: 0.5")
        Path(path).write_text(content)
        with pytest.raises(ValueError, match="notes"):
            grader.submit(path)

    def test_file_not_found_raises(self, tmp_path):
        grader = HumanGrader(review_dir=str(tmp_path))
        with pytest.raises(FileNotFoundError):
            grader.submit(str(tmp_path / "nonexistent.md"))
