# Metrics Reference

## pass@k — Capability Metric

**Question:** "Can the agent do this at least once in k tries?"

```python
# p = c/n  (c = trials passed, n = total trials run)
pass_at_k = 1 - (1 - p) ** k
```

**When to use:** Tool building, capability benchmarks, development phase.

**Example:** k=3, agent passes 2/3 trials → p=0.667, pass@3 = 1-(0.333)^3 = 0.963

---

## pass^k — Reliability Metric

**Question:** "Does the agent ALWAYS succeed across k trials?"

```python
pass_pow_k = p ** k
```

**When to use:** Production agents, customer-facing systems, regression testing.

**Example:** k=3, agent passes 2/3 trials → p=0.667, pass^3 = 0.667^3 = 0.296

---

## Saturation Detection

```python
if avg_pass_rate > 0.80:
    # Eval saturating — add harder tasks
    warning("Tasks scoring >80% consistently. Add difficulty=hard tasks.")
```

SWE-Bench Verified is approaching saturation at ~80% for frontier models.

---

## Regression Detection

```python
if current_score < prev_score - 0.05:
    # 5% drop = regression
    alert(f"REGRESSION: {current_score:.0%} vs {prev_score:.0%} last run")
    suggest("Run /eval-harness transcript --failed-only to investigate")
```

---

## Per-Trial Tracked Metrics

| Metric | Meaning | Alert if |
|--------|---------|---------|
| n_turns | Agent conversation turns | > 2× expected |
| n_tool_calls | Tool invocations | > 3× expected |
| n_tokens | Total token usage | > budget |
| latency_ms | Wall clock time | > timeout × 0.8 |
| cost_usd | API cost estimate | > $0.10 per trial |

---

## Choosing Between pass@k and pass^k

| Scenario | Use |
|----------|-----|
| Testing if agent CAN do something | pass@k |
| CI/CD regression gate | pass^k (stricter) |
| Capability research / benchmarking | pass@k |
| Customer-facing bot quality | pass^k |
| Development / iteration | pass@k |
| Production release gate | pass^k |
