"""Tests for runner.metrics module."""
import pytest
from runner.metrics import (
    compute_pass_rate,
    pass_at_k,
    pass_pow_k,
    is_saturating,
    is_regression,
    compute_suite_metrics,
)


class TestComputePassRate:
    def test_all_pass(self):
        assert compute_pass_rate(5, 5) == pytest.approx(1.0)

    def test_none_pass(self):
        assert compute_pass_rate(0, 5) == pytest.approx(0.0)

    def test_partial(self):
        assert compute_pass_rate(2, 4) == pytest.approx(0.5)

    def test_zero_total_returns_zero(self):
        assert compute_pass_rate(0, 0) == pytest.approx(0.0)


class TestPassAtK:
    def test_certainty_when_p_is_1(self):
        assert pass_at_k(1.0, 3) == pytest.approx(1.0)

    def test_zero_when_p_is_0(self):
        assert pass_at_k(0.0, 3) == pytest.approx(0.0)

    def test_known_value(self):
        # p=0.5, k=2: 1 - (1-0.5)^2 = 0.75
        assert pass_at_k(0.5, 2) == pytest.approx(0.75)

    def test_k1_equals_p(self):
        assert pass_at_k(0.6, 1) == pytest.approx(0.6)


class TestPassPowK:
    def test_certainty_when_p_is_1(self):
        assert pass_pow_k(1.0, 3) == pytest.approx(1.0)

    def test_zero_when_p_is_0(self):
        assert pass_pow_k(0.0, 3) == pytest.approx(0.0)

    def test_known_value(self):
        # p=0.5, k=2: 0.5^2 = 0.25
        assert pass_pow_k(0.5, 2) == pytest.approx(0.25)

    def test_k1_equals_p(self):
        assert pass_pow_k(0.7, 1) == pytest.approx(0.7)


class TestIsSaturating:
    def test_clearly_above_threshold(self):
        assert is_saturating(0.85) is True

    def test_at_threshold_not_saturating(self):
        # Uses strict '>': 0.80 is NOT saturating (must exceed threshold)
        assert is_saturating(0.80) is False

    def test_below_threshold(self):
        assert is_saturating(0.79) is False

    def test_custom_threshold(self):
        # 0.95 > 0.90 → saturating
        assert is_saturating(0.95, threshold=0.90) is True
        # 0.89 < 0.90 → not saturating
        assert is_saturating(0.89, threshold=0.90) is False


class TestIsRegression:
    def test_significant_drop(self):
        assert is_regression(0.70, 0.80) is True

    def test_small_drop_not_regression(self):
        assert is_regression(0.77, 0.80) is False

    def test_improvement_not_regression(self):
        assert is_regression(0.90, 0.80) is False

    def test_custom_threshold(self):
        # 0.80 - 0.78 = 0.02 > 0.01 threshold → regression
        assert is_regression(0.78, 0.80, threshold=0.01) is True
        # 0.80 - 0.796 = 0.004 < 0.01 → not a regression
        assert is_regression(0.796, 0.80, threshold=0.01) is False

    def test_no_change_not_regression(self):
        assert is_regression(0.80, 0.80) is False


class TestComputeSuiteMetrics:
    def _make_trials(self, results):
        """results: list of (passed, score)"""
        return [{"passed": p, "weighted_score": s, "trial_num": i}
                for i, (p, s) in enumerate(results, 1)]

    def test_pass_at_k_all_pass(self):
        trials = self._make_trials([(True, 1.0), (True, 1.0), (True, 1.0)])
        m = compute_suite_metrics(trials, k=3, metric="pass-at-k")
        assert m["pass_rate"] == pytest.approx(1.0)
        assert m["n_passed"] == 3
        assert m["n_trials"] == 3

    def test_pass_at_k_one_pass(self):
        trials = self._make_trials([(True, 1.0), (False, 0.0), (False, 0.0)])
        m = compute_suite_metrics(trials, k=3, metric="pass-at-k")
        # pass@k: 1 - (1-1/3)^3
        expected = 1 - (2/3) ** 3
        assert m["metric_score"] == pytest.approx(expected)

    def test_pass_pow_k(self):
        trials = self._make_trials([(True, 1.0), (True, 1.0), (False, 0.0)])
        m = compute_suite_metrics(trials, k=3, metric="pass-pow-k")
        # pass^k: (2/3)^3
        expected = (2/3) ** 3
        assert m["metric_score"] == pytest.approx(expected)

    def test_avg_score(self):
        trials = self._make_trials([(True, 0.8), (False, 0.4), (True, 0.9)])
        m = compute_suite_metrics(trials, k=3, metric="pass-at-k")
        assert m["avg_weighted_score"] == pytest.approx((0.8 + 0.4 + 0.9) / 3)

    def test_empty_trials(self):
        m = compute_suite_metrics([], k=3, metric="pass-at-k")
        assert m["pass_rate"] == pytest.approx(0.0)
        assert m["metric_score"] == pytest.approx(0.0)
