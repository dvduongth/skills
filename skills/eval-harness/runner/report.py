"""Report generator for eval-harness."""
import json
from datetime import datetime
from pathlib import Path

from .storage import Storage
from .metrics import is_saturating, is_regression


def generate_report(run_id: int, storage: Storage,
                    format: str = "md",
                    compare_run_id: int = None,
                    output_dir: str = "evals/reports") -> str:
    """Generate a report for a run. Returns the output file path."""
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    trials = storage.get_trials_for_run(run_id)
    summary = storage.get_run_summary(run_id)

    tasks = {}
    for t in trials:
        tid = t["task_id"]
        if tid not in tasks:
            tasks[tid] = []
        tasks[tid].append(t)

    prev_summary = None
    if compare_run_id:
        prev_summary = storage.get_run_summary(compare_run_id)

    timestamp = datetime.now().strftime("%Y-%m-%d")
    filename = f"{timestamp}-run-{run_id:03d}.{format}"
    output_path = Path(output_dir) / filename

    if format == "md":
        content = _generate_markdown(run_id, summary, tasks, prev_summary)
    elif format == "json":
        content = _generate_json(run_id, summary, tasks, prev_summary)
    else:
        content = _generate_markdown(run_id, summary, tasks, prev_summary)

    output_path.write_text(content, encoding="utf-8")
    return str(output_path)


def _generate_markdown(run_id: int, summary: dict, tasks: dict, prev_summary: dict = None) -> str:
    lines = [
        f"# Eval Report — Run {run_id}",
        f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        f"**Pass rate:** {summary.get('pass_rate', 0):.0%} ({summary.get('passed', 0)}/{summary.get('total', 0)} trials)",
        "",
    ]

    if prev_summary:
        curr = summary.get("pass_rate", 0)
        prev = prev_summary.get("pass_rate", 0)
        if is_regression(curr, prev):
            lines.append(f"REGRESSION DETECTED: {curr:.0%} vs {prev:.0%} last run (drop >5%)")
            lines.append("")

    avg_score = summary.get("avg_score", 0)
    if is_saturating(avg_score):
        lines.append(f"SATURATION WARNING: Average score {avg_score:.0%} > 80%. Add harder tasks.")
        lines.append("")

    lines.append("## Task Results")
    lines.append("")
    lines.append("| Task | Trials | Pass Rate | Avg Score | Status |")
    lines.append("|------|--------|-----------|-----------|--------|")

    for task_id, task_trials in tasks.items():
        n = len(task_trials)
        passed = sum(1 for t in task_trials if t["passed"])
        avg = sum(t["weighted_score"] for t in task_trials) / n if n else 0
        status = "PASS" if passed == n else ("PARTIAL" if passed > 0 else "FAIL")
        lines.append(f"| {task_id} | {n} | {passed/n:.0%} | {avg:.2f} | {status} |")

    lines.append("")
    lines.append("## Failed Trials")
    for task_id, task_trials in tasks.items():
        failed = [t for t in task_trials if not t["passed"]]
        for t in failed:
            lines.append(f"- **{task_id}** trial {t['trial_num']}: score={t['weighted_score']:.2f}"
                         + (f", error={t['error']}" if t.get("error") else ""))

    return "\n".join(lines)


def _generate_json(run_id: int, summary: dict, tasks: dict, prev_summary: dict = None) -> str:
    data = {
        "run_id": run_id,
        "summary": summary,
        "tasks": {
            tid: [{"trial_num": t["trial_num"], "passed": bool(t["passed"]),
                   "score": t["weighted_score"], "error": t.get("error")}
                  for t in trials]
            for tid, trials in tasks.items()
        }
    }
    if prev_summary:
        data["comparison"] = prev_summary
    return json.dumps(data, indent=2)
