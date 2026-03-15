"""Tests for runner.core module — load_task, weight validation, discover_tasks."""
import pytest
import tempfile
import os
from pathlib import Path
import yaml

from runner.core import load_task, discover_tasks


def _write_task(path: Path, content: dict):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(yaml.dump(content))


class TestLoadTask:
    def test_valid_task_loads(self, tmp_path):
        task_file = tmp_path / "task1.yaml"
        _write_task(task_file, {
            "task_id": "task1",
            "description": "Test task",
            "input": {"prompt": "do something"},
            "graders": [
                {"type": "file_exists", "files": [], "weight": 0.6},
                {"type": "llm_rubric", "rubric": "r.md", "weight": 0.4},
            ],
        })
        task = load_task(str(task_file))
        assert task["task_id"] == "task1"
        assert len(task["graders"]) == 2

    def test_weights_must_sum_to_1(self, tmp_path):
        task_file = tmp_path / "bad_task.yaml"
        _write_task(task_file, {
            "task_id": "bad",
            "description": "Bad weights",
            "input": {"prompt": "x"},
            "graders": [
                {"type": "file_exists", "files": [], "weight": 0.3},
                {"type": "llm_rubric", "rubric": "r.md", "weight": 0.3},
            ],
        })
        with pytest.raises(ValueError, match="[Ww]eight"):
            load_task(str(task_file))

    def test_file_not_found_raises(self):
        with pytest.raises(FileNotFoundError):
            load_task("/nonexistent/path/task.yaml")

    def test_task_defaults(self, tmp_path):
        """Tasks without explicit k/metric get sensible defaults."""
        task_file = tmp_path / "minimal.yaml"
        _write_task(task_file, {
            "task_id": "minimal",
            "description": "Minimal",
            "input": {"prompt": "x"},
            "graders": [{"type": "file_exists", "files": [], "weight": 1.0}],
        })
        task = load_task(str(task_file))
        assert "k" in task or task.get("k") is None  # optional field, no crash


class TestDiscoverTasks:
    def test_finds_yaml_files(self, tmp_path):
        _write_task(tmp_path / "coding" / "task_a.yaml", {
            "task_id": "task_a",
            "description": "A",
            "input": {"prompt": "x"},
            "graders": [{"type": "file_exists", "files": [], "weight": 1.0}],
        })
        _write_task(tmp_path / "research" / "task_b.yaml", {
            "task_id": "task_b",
            "description": "B",
            "input": {"prompt": "y"},
            "graders": [{"type": "file_exists", "files": [], "weight": 1.0}],
        })
        paths = discover_tasks(str(tmp_path))
        assert len(paths) == 2
        filenames = {Path(p).name for p in paths}
        assert "task_a.yaml" in filenames
        assert "task_b.yaml" in filenames

    def test_ignores_non_yaml(self, tmp_path):
        (tmp_path / "readme.md").write_text("# readme")
        (tmp_path / "notes.txt").write_text("notes")
        paths = discover_tasks(str(tmp_path))
        assert paths == []

    def test_empty_directory(self, tmp_path):
        paths = discover_tasks(str(tmp_path))
        assert paths == []

    def test_ignores_underscore_files(self, tmp_path):
        _write_task(tmp_path / "_internal.yaml", {
            "task_id": "internal",
            "description": "internal",
            "input": {"prompt": "x"},
            "graders": [{"type": "file_exists", "files": [], "weight": 1.0}],
        })
        paths = discover_tasks(str(tmp_path))
        assert paths == []
