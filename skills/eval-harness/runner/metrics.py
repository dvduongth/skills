"""Eval metrics: pass@k, pass^k, saturation, regression detection."""
from typing import Optional


def compute_pass_rate(passed: int, total: int) -> float:
    """p = c/n — empirical pass rate."""
    if total == 0:
        return 0.0
    return passed / total


def pass_at_k(p: float, k: int) -> float:
    """pass@k approximation for reporting.

    Question: Can agent do this at least once in k tries?
    Formula: 1 - (1-p)^k
    Use for: tool building, capability benchmarks, development phase.
    """
    return 1.0 - (1.0 - p) ** k


def pass_pow_k(p: float, k: int) -> float:
    """pass^k — reliability metric.

    Question: Does agent ALWAYS succeed across k trials?
    Formula: p^k
    Use for: production agents, customer-facing systems.
    """
    return p ** k


def is_saturating(avg_score: float, threshold: float = 0.80) -> bool:
    """Return True if eval suite is approaching saturation.

    At >80% score, the eval loses signal for improvement.
    Recommendation: add harder tasks (difficulty=hard).
    """
    return avg_score > threshold


def is_regression(current: float, previous: float,
                  threshold: float = 0.05) -> bool:
    """Return True if score dropped more than threshold vs previous run.

    A 5%+ drop signals a regression — investigate transcripts.
    """
    return (previous - current) > threshold


def compute_suite_metrics(trials: list, k: int,
                          metric: str = "pass-at-k") -> dict:
    """Compute suite-level metrics from trial results.

    Args:
        trials: list of trial dicts with 'passed' and 'weighted_score' keys
        k: number of trials per task
        metric: 'pass-at-k' or 'pass-pow-k'

    Returns:
        dict with pass_rate, metric_score, avg_weighted_score
    """
    if not trials:
        return {"pass_rate": 0.0, "metric_score": 0.0, "avg_weighted_score": 0.0}

    n_passed = sum(1 for t in trials if t.get("passed"))
    p = compute_pass_rate(n_passed, len(trials))

    if metric == "pass-at-k":
        metric_score = pass_at_k(p, k)
    else:
        metric_score = pass_pow_k(p, k)

    avg_score = sum(t.get("weighted_score", 0) for t in trials) / len(trials)

    return {
        "pass_rate": p,
        "metric_score": metric_score,
        "avg_weighted_score": avg_score,
        "n_trials": len(trials),
        "n_passed": n_passed,
    }
