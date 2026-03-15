"""Code-based grader: deterministic, fast, runs synchronously."""
import subprocess
from pathlib import Path


class CodeGrader:
    """Runs code-based graders: unit_tests, static_analysis, state_check, dom_check, file_exists, efficiency."""

    def grade(self, grader_config: dict, trial_context: dict) -> dict:
        """Grade one grader config against a trial.

        Returns: {"score": 0.0-1.0, "passed": bool, "details": {}}
        """
        grader_type = grader_config["type"]

        if grader_type == "unit_tests":
            return self._run_unit_tests(grader_config, trial_context)
        elif grader_type == "static_analysis":
            return self._run_static_analysis(grader_config, trial_context)
        elif grader_type == "state_check":
            return self._run_state_check(grader_config, trial_context)
        elif grader_type == "file_exists":
            return self._run_file_exists(grader_config, trial_context)
        elif grader_type == "efficiency":
            return self._run_efficiency(grader_config, trial_context)
        elif grader_type == "dom_check":
            return self._run_dom_check(grader_config, trial_context)
        else:
            return {"score": 0.0, "passed": False, "details": {"error": f"Unknown grader type: {grader_type}"}}

    def _run_unit_tests(self, config: dict, ctx: dict) -> dict:
        files = config.get("files", [])
        cmd = ["python", "-m", "pytest"] + files + ["--tb=short", "-q"]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120, cwd=ctx.get("work_dir", "."))
            passed = result.returncode == 0
            return {
                "score": 1.0 if passed else 0.0,
                "passed": passed,
                "details": {"stdout": result.stdout[-2000:], "returncode": result.returncode}
            }
        except subprocess.TimeoutExpired:
            return {"score": 0.0, "passed": False, "details": {"error": "timeout"}}
        except Exception as e:
            return {"score": 0.0, "passed": False, "details": {"error": str(e)}}

    def _run_static_analysis(self, config: dict, ctx: dict) -> dict:
        tools = config.get("tools", [])
        errors = []
        for tool in tools:
            cmd = {"ruff": ["ruff", "check", "."], "mypy": ["mypy", "."],
                   "bandit": ["bandit", "-r", ".", "-q"], "eslint": ["npx", "eslint", "."]}.get(tool, [tool, "."])
            try:
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=60, cwd=ctx.get("work_dir", "."))
                if result.returncode != 0:
                    errors.append(f"{tool}: {result.stdout[-500:]}")
            except Exception as e:
                errors.append(f"{tool}: {e}")
        passed = len(errors) == 0
        return {"score": 1.0 if passed else 0.0, "passed": passed, "details": {"errors": errors}}

    def _run_state_check(self, config: dict, ctx: dict) -> dict:
        check_expr = config.get("check", "")
        snapshot = ctx.get("snapshot", {})
        eval_ctx = {"snapshot": snapshot, "db": ctx.get("db_proxy")}
        try:
            result = eval(check_expr, {"__builtins__": {}}, eval_ctx)  # noqa: S307
            passed = bool(result)
            return {"score": 1.0 if passed else 0.0, "passed": passed, "details": {"check": check_expr, "result": result}}
        except Exception as e:
            return {"score": 0.0, "passed": False, "details": {"error": str(e), "check": check_expr}}

    def _run_file_exists(self, config: dict, ctx: dict) -> dict:
        files = config.get("files", [])
        work_dir = Path(ctx.get("work_dir", "."))
        missing = [f["file"] if isinstance(f, dict) else f for f in files
                   if not (work_dir / (f["file"] if isinstance(f, dict) else f)).exists()]
        passed = len(missing) == 0
        return {"score": 1.0 if passed else 0.0, "passed": passed, "details": {"missing": missing}}

    def _run_efficiency(self, config: dict, ctx: dict) -> dict:
        max_turns = config.get("max_turns", 999)
        max_tokens = config.get("max_tokens", 999999)
        n_turns = ctx.get("n_turns", 0)
        n_tokens = ctx.get("n_tokens", 0)
        within_turns = n_turns <= max_turns
        within_tokens = n_tokens <= max_tokens
        passed = within_turns and within_tokens
        return {"score": 1.0 if passed else 0.0, "passed": passed,
                "details": {"n_turns": n_turns, "n_tokens": n_tokens}}

    def _run_dom_check(self, config: dict, ctx: dict) -> dict:
        selector = config.get("selector", "")
        dom_snapshot = ctx.get("dom_snapshot", "")
        found = selector in dom_snapshot
        return {"score": 1.0 if found else 0.0, "passed": found,
                "details": {"selector": selector, "found": found}}
