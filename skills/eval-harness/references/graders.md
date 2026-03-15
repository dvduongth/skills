# Graders Reference

## Code-Based Graders (Fast, Deterministic)

### unit_tests
Runs pytest/unittest against the agent's output.
```yaml
- type: unit_tests
  files: [tests/test_auth.py, tests/test_login.py]
  weight: 0.5
```

### static_analysis
Runs linters/security scanners.
```yaml
- type: static_analysis
  tools: [ruff, mypy, bandit]  # or: eslint, tsc
  weight: 0.3
```

### state_check
Checks actual environment state (DB, filesystem) — NOT agent's claims.
```yaml
- type: state_check
  check: "db.orders['123'].status == 'refunded'"
  weight: 0.4
# Use snapshot object for "before/after" checks:
  check: "db.users.count() == snapshot.users_count + 1"
```

### dom_check
Check HTML DOM state after browser interaction.
```yaml
- type: dom_check
  selector: ".success-message"
  weight: 0.5
```

### file_exists
Check that expected output files were created.
```yaml
- type: file_exists
  files: [report.md, results.json]
  weight: 0.3
```

### efficiency
Check turn count / token usage stays within bounds.
```yaml
- type: efficiency
  max_turns: 8
  max_tokens: 10000
  weight: 0.2
```

---

## Model-Based Graders (Flexible, Async)

### llm_rubric
LLM scores output against a rubric file.
```yaml
- type: llm_rubric
  rubric: rubrics/code-quality.md
  weight: 0.2
```

**Rubric file format** (`evals/graders/rubrics/code-quality.md`):
```markdown
# Code Quality Rubric

Score from 0.0 to 1.0 based on these criteria:

- **Readability** (0.3): Code has clear variable names, comments where needed
- **Error handling** (0.3): Edge cases handled, no silent failures
- **Security** (0.4): No hardcoded secrets, input validated

Return ONLY a JSON object: {"score": 0.85, "reasoning": "..."}
```

### coverage_check
LLM verifies output covers required topics.
```yaml
- type: coverage_check
  required_topics:
    - "authentication mechanism"
    - "token expiry"
  weight: 0.4
```

### groundedness
LLM checks every claim has a cited source.
```yaml
- type: groundedness
  check: "every claim has source URL"
  weight: 0.3
```

### hallucination_check
LLM detects invented/false information.
```yaml
- type: hallucination_check
  weight: 0.2
```

### screenshot_verify
LLM verifies browser screenshot matches description.
```yaml
- type: screenshot_verify
  description: "Registration form successfully submitted, showing confirmation page"
  weight: 0.1
```

---

## Human Graders (Gold Standard, Async)

Human graders DO NOT block automated eval runs — they enqueue to the review queue.

### human
```yaml
- type: human
  queue: expert_review  # label for human-review schedule --queue
  weight: 0.1
```

**Review file format:** See spec Section 2, Nhóm 5.

---

## Weight Rules

- All grader weights in a task MUST sum to 1.0
- Check: `sum(g['weight'] for g in graders) == 1.0`
- When adding a grader: reduce other weights proportionally

## Grader Execution Order

1. **code_grader** (sync) — runs first, fast
2. **model_grader** (async) — runs in parallel after code graders
3. **human_grader** (enqueue) — never blocks, always last
