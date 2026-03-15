# Swiss Cheese Model — 6-Layer Evaluation

No single layer catches everything. Use all 6 in combination.

```
Layer 1: Automated Evals  ← /eval-harness run (every commit/PR)
Layer 2: Production Monitoring ← /eval-harness monitor
Layer 3: A/B Testing      ← external (Optimizely, LaunchDarkly, etc.)
Layer 4: User Feedback    ← collect ratings, triage weekly
Layer 5: Transcript Review ← /eval-harness transcript (weekly sampling)
Layer 6: Human Studies    ← expert review (monthly/quarterly)
```

## When to Use Each Layer

| Layer | When | Command/Tool |
|-------|------|-------------|
| Automated Evals | Every commit | `/eval-harness ci run` |
| Production Monitoring | Always-on post-launch | `/eval-harness monitor` |
| A/B Testing | Major behavior changes | External tool |
| User Feedback | Ongoing | Collect in app, import to DB |
| Transcript Review | Weekly | `/eval-harness transcript --failed-only` |
| Human Studies | Monthly | `/eval-harness human-review schedule` |

## Layer 1: Automated Evals

Catches: performance regression, known failure patterns
Misses: unknown unknowns, novel user behavior

Run on every PR. Fail build if regression >5%.

## Layer 2: Production Monitoring

Catches: real user behavior, edge cases at scale
Misses: low-frequency rare events (noisy signal)

Hook into: API response logs, error rates, user session analytics.
```bash
/eval-harness monitor --source api --alert-on-drop
```

## Layer 5: Transcript Review

Read actual agent conversation traces. Build intuition about failure modes.
```bash
/eval-harness transcript --failed-only --run-id <latest>
```

## Layer 6: Human Studies

Expert review of sampled trials. Calibrates model-based graders.
```bash
/eval-harness human-review schedule --sample 10 --reviewer expert@team.com
```
