# Agent Types Reference

## Coding Agent

**Benchmark:** SWE-Bench Verified, Terminal-Bench
**Recommended metric:** pass-at-k (capability)
**Primary graders:** unit_tests (50%) + static_analysis (30%) + llm_rubric (20%)

**Environment isolation:** `reset: git_clean` — runs `git clean -fdx` before each trial.

**Grader mix by task type:**
```
Bug fix:       tests(50%) + static(30%) + rubric(20%)
Feature add:   tests(40%) + rubric(35%) + static(25%)
Refactor:      tests(30%) + rubric(40%) + static(30%)
```

**Tracked metrics:** n_turns, n_tool_calls, n_tokens, latency_ms

**Saturation signal:** SWE-Bench Verified approaching 80% for frontier models — add harder tasks.

---

## Conversational Agent (Support/Sales)

**Benchmark:** τ-Bench (retail), τ2-Bench (airline)
**Recommended metric:** pass-pow-k (ALL trials must pass — production reliability)
**Primary graders:** state_check (50%) + llm_rubric (30%) + efficiency (20%)

**Key pattern:** Use `simulated_user` environment — LLM simulates a user persona.

**Grader mix:**
```
Customer support: state_check(50%) + politeness rubric(30%) + efficiency(20%)
Sales agent:      outcome(60%) + quality rubric(40%)
```

**Watch for:** Agent finding better policy paths than expected — grade OUTCOMES not PATHS.

---

## Research Agent

**Benchmark:** BrowseComp ("needles in haystacks")
**Recommended metric:** pass-at-k
**Primary graders:** coverage_check (40%) + groundedness (30%) + hallucination_check (20%) + human (10%)

**Challenge:** Ground truth changes over time. Use `expected_topics` not exact answers.

**Grader mix:**
```
Synthesis task:  coverage(40%) + groundedness(30%) + hallucination(20%) + human(10%)
Fact finding:    exact_match(60%) + groundedness(40%)
```

**Human grader always recommended** for research — minimum 10% weight.

---

## Computer Use Agent

**Benchmark:** WebArena (browser), OSWorld (full OS)
**Recommended metric:** pass-at-k
**Primary graders:** dom_check (50%) + state_check (40%) + screenshot_verify (10%)

**Environment isolation:**
```yaml
reset:
  - clear_cookies
  - run_sql: "DELETE FROM <table> WHERE test=true"  # reset app state
snapshot_before: true  # capture DB state before trial for state_check graders
```

**state_check uses `snapshot` object:**
```yaml
check: "db.users.count() == snapshot.users_count + 1"
```

**Grader choice:**
- `dom_check`: fast, accurate, high token cost
- `screenshot_verify`: lower token cost, works with any UI

---

## Sub-Agent (Orchestrator + Workers)

**No standard benchmark yet.**
**Recommended metric:** pass-at-k
**Primary graders:** file_exists (30%) + final_output (70%)

**Key rule:** Grade OBSERVABLE OUTPUTS (files created, final report), not internal spawn counts.
Claude SDK does not expose public hooks for counting sub-agent spawns — use file artifacts.

**Expected outputs pattern:**
```yaml
expected_outputs:
  - file: "report.md"
  - file: "results.json"
graders:
  - type: file_exists
    files: expected_outputs
    weight: 0.3
  - type: final_output
    rubric: rubrics/report-quality.md
    weight: 0.7
```
