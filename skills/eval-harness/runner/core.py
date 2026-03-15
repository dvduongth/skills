"""Core trial runner for eval-harness."""
import json
import os
import subprocess
import sys
import time
import yaml
from pathlib import Path
from typing import Optional

from .storage import Storage
from .metrics import compute_pass_rate, pass_at_k, pass_pow_k, is_saturating, is_regression, compute_suite_metrics
from .graders import CodeGrader, ModelGrader, HumanGrader


def load_config(config_path: str = "evals/eval.config.yaml") -> dict:
    with open(config_path) as f:
        return yaml.safe_load(f)


def load_task(task_yaml_path: str) -> dict:
    with open(task_yaml_path) as f:
        task = yaml.safe_load(f)
    graders = task.get("graders", [])
    if graders:
        total_weight = sum(g.get("weight", 0) for g in graders)
        if abs(total_weight - 1.0) > 0.01:
            raise ValueError(f"Task {task.get('task_id')}: grader weights sum to {total_weight}, must be 1.0")
    return task


def discover_tasks(tasks_dir: str = "evals/tasks") -> list:
    """Return all .yaml files under tasks_dir."""
    return [str(p) for p in Path(tasks_dir).rglob("*.yaml")
            if not p.name.startswith("_")]


def run_trial(task: dict, config: dict, run_id: int, trial_num: int,
              storage: Storage) -> dict:
    """Run one trial of a task. Returns trial result dict."""
    start = time.time()
    timeout = task.get("timeout_seconds", config.get("default_timeout_seconds", 300))
    transcript = ""
    error = None
    n_turns = 0
    n_tool_calls = 0
    n_tokens = 0
    snapshot = {}

    try:
        snapshot = _capture_snapshot(task, config)
        _reset_environment(task, config)
        result = _execute_agent(task, config, timeout)
        transcript = result.get("transcript", "")
        n_turns = result.get("n_turns", 0)
        n_tool_calls = result.get("n_tool_calls", 0)
        n_tokens = result.get("n_tokens", 0)

    except TimeoutError:
        error = "timeout"
        transcript = ""
    except Exception as e:
        error = str(e)
        transcript = ""

    latency_ms = int((time.time() - start) * 1000)

    grader_scores = []
    weighted_score = 0.0

    if not error:
        code_grader = CodeGrader()
        model_grader = ModelGrader(model=config.get("grader_model", "claude-sonnet-4-6"))
        human_grader = HumanGrader()
        trial_ctx = {
            "snapshot": snapshot,
            "transcript": transcript,
            "n_turns": n_turns,
            "n_tokens": n_tokens,
            "work_dir": ".",
        }

        for grader_config in task.get("graders", []):
            g_type = grader_config["type"]
            weight = grader_config.get("weight", 0)

            if g_type in ("unit_tests", "static_analysis", "state_check", "file_exists", "efficiency", "dom_check"):
                result_g = code_grader.grade(grader_config, trial_ctx)
            elif g_type == "human":
                human_grader.enqueue(
                    trial_id=0,
                    task_id=task["task_id"],
                    transcript=transcript,
                    reviewer=grader_config.get("reviewer", "unassigned"),
                    queue=grader_config.get("queue", "default"),
                )
                result_g = {"score": 0.0, "passed": False, "details": {"queued": True}}
            else:
                result_g = model_grader.grade(grader_config, trial_ctx)

            weighted_score += result_g["score"] * weight
            grader_scores.append({"type": g_type, "weight": weight, **result_g})

    passed = weighted_score >= 0.5 and error is None

    trial_id = storage.create_trial(
        run_id=run_id,
        task_id=task["task_id"],
        trial_num=trial_num,
        passed=passed,
        weighted_score=weighted_score,
        n_turns=n_turns,
        n_tool_calls=n_tool_calls,
        n_tokens=n_tokens,
        latency_ms=latency_ms,
        cost_usd=0.0,
        transcript_json=json.dumps({"transcript": transcript, "graders": grader_scores}),
        error=error,
    )

    return {
        "trial_id": trial_id,
        "passed": passed,
        "weighted_score": weighted_score,
        "error": error,
        "latency_ms": latency_ms,
    }


def run_suite(config_path: str = "evals/eval.config.yaml",
              task_id: Optional[str] = None,
              k_override: Optional[int] = None,
              mode: str = "capability",
              fail_threshold: float = 0.80) -> dict:
    """Run an eval suite. Returns summary dict."""
    config = load_config(config_path)
    storage = Storage(config.get("db_path", "evals/runs/eval.db"))
    storage.init()

    suite_id = storage.create_suite(config.get("suite_name", "Default Suite"), config_yaml=str(config))
    run_id = storage.create_run(suite_id, mode=mode, model_id=config.get("default_model", "claude-sonnet-4-6"))

    task_paths = discover_tasks()
    if task_id:
        task_paths = [p for p in task_paths if task_id in p]
    if mode == "regression":
        task_paths = [p for p in task_paths if _get_task_eval_mode(p) == "regression"]

    all_results = []
    for task_path in task_paths:
        try:
            task = load_task(task_path)
            k = k_override or task.get("k", config.get("default_k", 3))

            print(f"Running task: {task['task_id']} ({k} trials)...")
            task_results = []
            for i in range(1, k + 1):
                print(f"  Trial {i}/{k}...")
                result = run_trial(task, config, run_id, i, storage)
                task_results.append(result)

            metric = task.get("metric", config.get("default_metric", "pass-at-k"))
            metrics = compute_suite_metrics(task_results, k, metric)
            all_results.append({"task_id": task["task_id"], **metrics})

            if is_saturating(metrics["pass_rate"]):
                print(f"  WARNING: {task['task_id']} scoring >80% — add harder tasks")
        except Exception as e:
            print(f"  ERROR in task {task_path}: {e}", file=sys.stderr)

    storage.finish_run(run_id)
    return {"run_id": run_id, "tasks": all_results}


def _capture_snapshot(task: dict, config: dict) -> dict:
    if not task.get("environment", {}).get("snapshot_before"):
        return {}
    return {"captured_at": time.time()}


def _reset_environment(task: dict, config: dict):
    env = task.get("environment", {})
    reset = env.get("reset", "")
    if reset == "git_clean" or (isinstance(reset, list) and "git_clean" in reset):
        subprocess.run(["git", "clean", "-fdx"], capture_output=True)
    if isinstance(reset, list):
        for step in reset:
            if isinstance(step, dict) and "run_sql" in step:
                pass  # SQL reset — implement per-project


def _execute_agent(task: dict, config: dict, timeout: int) -> dict:
    """Execute the agent on the task. Returns transcript and metrics.

    In real usage: calls Claude API with agent scaffold.
    Stub implementation for testing.
    """
    return {
        "transcript": f"Agent executed task: {task.get('task_id')} [stub output]",
        "n_turns": 3,
        "n_tool_calls": 5,
        "n_tokens": 1500,
    }


def _get_task_eval_mode(task_path: str) -> str:
    try:
        with open(task_path) as f:
            return yaml.safe_load(f).get("eval_mode", "capability")
    except Exception:
        return "capability"


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd")

    run_p = sub.add_parser("run")
    run_p.add_argument("--config", default="evals/eval.config.yaml")
    run_p.add_argument("--task")
    run_p.add_argument("--k", type=int)
    run_p.add_argument("--mode", default="capability")

    ci_p = sub.add_parser("ci")
    ci_p.add_argument("run", nargs="?")
    ci_p.add_argument("--mode", default="regression")
    ci_p.add_argument("--fail-threshold", type=float, default=0.80)
    ci_p.add_argument("--config", default="evals/eval.config.yaml")

    val_p = sub.add_parser("validate")
    val_p.add_argument("--task")
    val_p.add_argument("--config", default="evals/eval.config.yaml")

    args = parser.parse_args()

    if args.cmd == "run":
        result = run_suite(args.config, task_id=args.task, k_override=args.k, mode=args.mode)
        print(json.dumps(result, indent=2))
    elif args.cmd == "ci":
        result = run_suite(args.config, mode=args.mode)
        avg = sum(t.get("pass_rate", 0) for t in result["tasks"]) / max(len(result["tasks"]), 1)
        if avg < args.fail_threshold / 100:
            print(f"EVAL FAILED: avg pass rate {avg:.0%} < threshold {args.fail_threshold}%")
            sys.exit(1)
        else:
            print(f"EVAL PASSED: avg pass rate {avg:.0%}")
