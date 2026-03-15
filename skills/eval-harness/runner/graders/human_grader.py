"""Human grader: creates review queue files, imports completed reviews."""
import yaml
from pathlib import Path
from datetime import datetime


class HumanGrader:
    """Manages human review queue — never blocks automated runs."""

    def __init__(self, review_dir: str = "evals/human-review"):
        self.pending_dir = Path(review_dir) / "pending"
        self.completed_dir = Path(review_dir) / "completed"
        self.pending_dir.mkdir(parents=True, exist_ok=True)
        self.completed_dir.mkdir(parents=True, exist_ok=True)

    def enqueue(self, trial_id: int, task_id: str, transcript: str,
                reviewer: str = "unassigned", queue: str = "default") -> str:
        """Create a review file for this trial. Does NOT block."""
        review_id = f"review-{trial_id:04d}"
        review_file = self.pending_dir / f"{review_id}.md"

        front_matter = {
            "review_id": review_id,
            "trial_id": trial_id,
            "task_id": task_id,
            "reviewer": reviewer,
            "queue": queue,
            "created_at": datetime.now().isoformat(timespec="minutes"),
            "verdict": "FILL_IN",      # pass|fail
            "score": 0.0,              # 0.0-1.0
            "notes": "FILL_IN",
        }

        content = f"---\n{yaml.dump(front_matter, default_flow_style=False)}---\n\n"
        content += "## Agent Transcript\n\n"
        content += f"```\n{transcript[:5000]}\n```\n\n"
        content += "## Instructions\n\n"
        content += "1. Review the transcript above\n"
        content += "2. Fill in `verdict` (pass|fail), `score` (0.0-1.0), and `notes`\n"
        content += "3. Run: `/eval-harness human-review submit --review-file <this-file>`\n"

        review_file.write_text(content, encoding="utf-8")
        return str(review_file)

    def list_pending(self) -> list:
        """List all pending review files with metadata."""
        results = []
        for f in sorted(self.pending_dir.glob("*.md")):
            try:
                content = f.read_text(encoding="utf-8")
                fm = self._parse_front_matter(content)
                fm["file_path"] = str(f)
                results.append(fm)
            except Exception:
                pass
        return results

    def submit(self, review_file_path: str) -> dict:
        """Parse and validate a completed review file."""
        path = Path(review_file_path)
        if not path.exists():
            raise FileNotFoundError(f"Review file not found: {review_file_path}")

        content = path.read_text(encoding="utf-8")
        fm = self._parse_front_matter(content)

        if fm.get("verdict") not in ("pass", "fail"):
            raise ValueError(f"verdict must be 'pass' or 'fail', got: {fm.get('verdict')}")
        score = float(fm.get("score", 0))
        if not 0.0 <= score <= 1.0:
            raise ValueError(f"score must be 0.0-1.0, got: {score}")
        if fm.get("notes") == "FILL_IN":
            raise ValueError("Please fill in the notes field")

        completed_path = self.completed_dir / path.name
        path.rename(completed_path)

        return {
            "trial_id": fm["trial_id"],
            "reviewer": fm["reviewer"],
            "score": score,
            "verdict": fm["verdict"],
            "notes": fm.get("notes", ""),
        }

    def _parse_front_matter(self, content: str) -> dict:
        """Parse YAML front matter from markdown file."""
        if not content.startswith("---"):
            raise ValueError("No YAML front matter found")
        parts = content.split("---", 2)
        return yaml.safe_load(parts[1]) or {}
