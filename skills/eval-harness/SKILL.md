# eval-harness — AI Agent Evaluation Skill

Automate evaluation (evals) for AI agents. Covers coding, conversational, research, computer-use, and sub-agent types. Implements Swiss Cheese Model (6 layers).

**Based on:** Anthropic Engineering — Demystifying Evals for AI Agents (2026-01-09)

---

## When This Skill Applies

Use when the user wants to:
- Set up an eval suite for an AI agent or task
- Run evals with pass@k or pass^k metrics
- Add graders (code-based, model-based, human)
- Generate CI integration (GitHub Actions, GitLab, Jenkins)
- Schedule human review of transcripts
- Track metrics and detect saturation/regression
- Monitor production agent behavior

---

## Core Concepts (Read First)

Before taking action, understand these terms:

| Term | Meaning |
|------|---------|
| **Task** | One test scenario (YAML file) with input + graders |
| **Trial** | One run of a task (non-deterministic — run k times) |
| **Grader** | Logic that scores one aspect of a trial output |
| **Outcome** | REAL environment state — not what agent claims |
| **pass@k** | ≥1 of k trials passes — use for capability building |
| **pass^k** | ALL k trials pass — use for production reliability |
| **Saturation** | Score >80% consistently → need harder tasks |
| **Regression** | Score drops >5% vs previous run → alert |

**Key rules:**
- Grade OUTPUTS not PATHS — agent may find valid approaches you didn't expect
- Frontier model 0% = task is BROKEN, not agent is bad
- Isolate every trial — shared state = correlated failures

---

## Command Reference

### /eval-harness init

Scaffold eval suite for current project.

**Usage:** `/eval-harness init [--type coding|conv|research|cu|all]`

**What to do:**
1. Create `evals/` directory with full structure
2. Create `evals/eval.config.yaml` with defaults
3. Copy matching templates from `skills/eval-harness/templates/`
4. Create `evals/runs/` dir (SQLite DB lives here)
5. Create `evals/human-review/pending/` dir
6. Run: `python -m runner.storage init --config evals/eval.config.yaml`
7. Tell user: "Eval suite initialized. Edit `evals/eval.config.yaml` then run `/eval-harness task create`"

**evals/ structure to create:**
```
evals/
├── eval.config.yaml
├── tasks/
│   ├── coding/
│   ├── conversational/
│   ├── research/
│   └── computer-use/
├── graders/
│   └── rubrics/
├── runs/
├── reports/
└── human-review/
    └── pending/
```

**eval.config.yaml to generate:**
```yaml
suite_name: "<project-name> Evals"
db_path: evals/runs/eval.db
default_model: claude-sonnet-4-6
grader_model: claude-sonnet-4-6
default_k: 3
default_metric: pass-at-k
default_timeout_seconds: 300
human_review_notify: true
```

---

### /eval-harness task create

Create a new eval task from template.

**Usage:** `/eval-harness task create [--agent-type coding|conv|research|cu|sub-agent] [--name TASK_NAME]`

**What to do:**
1. Ask user: "What agent type?" (if not specified)
2. Ask user: "What is the task?" (one sentence description)
3. Copy matching template from `skills/eval-harness/templates/<type>.yaml`
4. Save to `evals/tasks/<type>/<task-name>.yaml`
5. Fill in: `task_id`, `description`, `difficulty` based on user input
6. Show user the file and say: "Edit the `input.prompt` and `graders` sections, then run `/eval-harness task validate`"

Read `references/agent-types.md` for agent-type-specific guidance.

---

### /eval-harness task validate

Check that a task is well-formed and not broken.

**Usage:** `/eval-harness task validate [TASK_ID|--all]`

**What to do:**
1. Run: `python -m runner.core validate --task <task-id> --config evals/eval.config.yaml`
2. This runs 1 trial with the frontier model (claude-opus-4-6)
3. If result is 0% → task is BROKEN: show error, tell user to fix task definition
4. If result >0% → task is valid: show score, tell user to proceed
5. For `--all`: validate all tasks in evals/tasks/

**Critical:** "Frontier model 0% = task is broken, NOT agent is bad" — always explain this.

---

### /eval-harness run

Run eval suite or specific task.

**Usage:** `/eval-harness run [--suite NAME] [--task TASK_ID] [--k 3] [--mode pass-at-k|pass-pow-k]`

**What to do:**
1. Run: `python -m runner.core run --config evals/eval.config.yaml [--task TASK_ID] [--k K]`
2. CLI `--k` overrides per-task `k:` value
3. Show progress: "Running trial 1/3 for task fix-auth-bypass..."
4. After completion: show summary table with scores
5. Automatically flag: saturation warning if score >80%, regression if drop >5%
6. Suggest: `python -m runner.report generate --run-id <id>` for full report

Read `references/metrics.md` for pass@k vs pass^k guidance.

---

### /eval-harness grade

Run graders on an existing run (or re-grade).

**Usage:** `/eval-harness grade [--run-id RUN_ID] [--grader code|model|human|all]`

**What to do:**
1. Run: `python -m runner.core grade --run-id <id> --grader <type>`
2. `code` grader: runs synchronously (fast)
3. `model` grader: calls LLM with rubric (async, show progress)
4. `human` grader: enqueues to `evals/human-review/pending/` — does NOT block

---

### /eval-harness grader add

Add a grader to an existing task.

**Usage:** `/eval-harness grader add --type code|model|human [--task TASK_ID]`

**What to do:**
1. Read current task YAML
2. Based on `--type`:
   - `code`: Ask "What to check?" → add `type: unit_tests` or `type: state_check` block
   - `model`: Ask "What rubric criteria?" → create `rubrics/<task>-rubric.md`, add `type: llm_rubric` block
   - `human`: Add `type: human` block with `queue: review`
3. Set `weight:` — ensure all grader weights in task sum to 1.0
4. Save updated YAML
5. Run: `/eval-harness grader test --task <id>` to verify

Read `references/graders.md` for grader configuration patterns.

---

### /eval-harness grader test

Test a grader with a sample transcript.

**Usage:** `/eval-harness grader test [--task TASK_ID] [--grader-id ID]`

**What to do:**
1. Run: `python -m runner.graders.code_grader test --task <id>`
2. Use the most recent trial transcript as sample input
3. Show: grader output, score, any errors
4. If grader errors: help user fix the grader config

---

### /eval-harness report

Generate evaluation report.

**Usage:** `/eval-harness report [--run-id RUN_ID] [--format md|json|html] [--compare RUN_ID]`

**What to do:**
1. Run: `python -m runner.report generate --run-id <id> --format <fmt>`
2. Output saved to `evals/reports/YYYY-MM-DD-run-<id>.<fmt>`
3. Report includes: pass@k/pass^k per task, trends, saturation warnings, regression diffs if `--compare`
4. Show user the report path

---

### /eval-harness metrics

View metrics over time.

**Usage:** `/eval-harness metrics [--suite NAME] [--trend] [--saturation-check]`

**What to do:**
1. Run: `python -m runner.metrics summary --config evals/eval.config.yaml`
2. Show: table of tasks × runs with scores
3. With `--trend`: show score progression over time
4. With `--saturation-check`: flag tasks with score >80% consistently

---

### /eval-harness transcript

View trial transcript/trace.

**Usage:** `/eval-harness transcript [--run-id RUN_ID] [--task-id ID] [--failed-only]`

**What to do:**
1. Query DB: `SELECT transcript_json FROM trials WHERE ...`
2. Pretty-print: tool calls, outputs, reasoning steps
3. With `--failed-only`: only show trials where `passed=false`
4. This is Swiss Cheese layer 5 (manual transcript review)

---

### /eval-harness human-review schedule

Create human review queue.

**Usage:** `/eval-harness human-review schedule [--sample N] [--reviewer NAME]`

**What to do:**
1. Run: `python -m runner.graders.human_grader schedule --sample <N> --reviewer <name>`
2. Randomly sample N trials from recent run
3. Create `evals/human-review/pending/review-<id>.md` for each (see review file format in spec)
4. If `human_review_notify: true` in config: create a scheduled task reminder
5. Tell user: "Created N review files in evals/human-review/pending/. Run `/eval-harness human-review list` to see them."

---

### /eval-harness human-review list

List pending review files.

**Usage:** `/eval-harness human-review list`

**What to do:**
1. List all `.md` files in `evals/human-review/pending/`
2. Show: review_id, task_id, trial_id, created_at, reviewer
3. Show full path for each file

---

### /eval-harness human-review submit

Import human review results into DB.

**Usage:** `/eval-harness human-review submit [--review-file PATH]`

**What to do:**
1. Parse YAML front-matter from review file
2. Validate fields: verdict, score (0.0-1.0), reviewer
3. Run: `python -m runner.graders.human_grader submit --file <path>`
4. Insert into `human_reviews` table in DB
5. Move file from `pending/` to `completed/`
6. Tell user: "Review submitted for trial <id>. Score: <score>"

---

### /eval-harness ci setup

Generate CI adapter configuration.

**Usage:** `/eval-harness ci setup --platform github|gitlab|jenkins|generic`

**What to do:**
1. Read `references/ci-adapters.md` for platform templates
2. Generate config file:
   - `github` → `.github/workflows/eval.yml`
   - `gitlab` → `.gitlab-ci.yml` (append eval job)
   - `jenkins` → `Jenkinsfile` (append eval stage)
   - `generic` → `scripts/run-evals.sh`
3. Show user the generated file
4. Remind: "Set ANTHROPIC_API_KEY as a CI secret"

Required env vars: `ANTHROPIC_API_KEY`, `EVAL_DB_PATH`, `EVAL_SUITE`, `EVAL_MODEL`

---

### /eval-harness ci run

Run evals in CI context.

**Usage:** `/eval-harness ci run [--mode regression|capability] [--fail-threshold 80]`

**What to do:**
1. Run: `python -m runner.core run --config evals/eval.config.yaml --mode <mode>`
2. `regression` mode: run only `eval_mode: regression` tasks
3. If avg score < fail-threshold: exit with code 1 (fails CI build)
4. Output machine-readable results to stdout (JSON)

---

### /eval-harness monitor

Production monitoring integration.

**Usage:** `/eval-harness monitor --source logs|api|feedback [--alert-on-drop]`

**What to do:**
1. Read `references/swiss-cheese.md` for monitoring layer guidance
2. `logs`: Show how to parse application logs for agent failure signals
3. `api`: Show how to hook into API response logging for monitoring
4. `feedback`: Show how to import user feedback ratings into DB
5. With `--alert-on-drop`: configure threshold alerts

This is Swiss Cheese layer 2 (production monitoring). Provide guidance, not automation — this is project-specific.

---

### /eval-harness status

Show eval suite overview.

**Usage:** `/eval-harness status`

**What to do:**
1. Run: `python -m runner.metrics status --config evals/eval.config.yaml`
2. Show:
   - Total tasks (by agent type)
   - Last run: date, pass rate, duration
   - Saturation warnings (tasks >80%)
   - Pending human reviews count
   - Regression alerts since last run

---

## Grader Weight Rule

**Always verify weights sum to 1.0** when adding/editing graders. If they don't, redistribute proportionally.

```python
# Validation in runner
total = sum(g['weight'] for g in task['graders'])
assert abs(total - 1.0) < 0.01, f"Grader weights sum to {total}, must be 1.0"
```

---

## Error Handling Rules

- **timeout**: Store `passed=false, error="timeout"` — do NOT retry automatically
- **crash**: Store `passed=false, error=traceback` — show traceback to user
- **grader error**: Store `grader_score=null, error=msg` — do NOT fail the whole run
- **0% pass rate on validate**: Always say "task is broken" not "agent is bad"

---

## References

- `references/agent-types.md` — per-agent-type YAML patterns and grader guidance
- `references/graders.md` — code/model/human grader configuration
- `references/metrics.md` — pass@k vs pass^k, saturation, regression formulas
- `references/ci-adapters.md` — CI platform templates
- `references/swiss-cheese.md` — 6-layer monitoring guide
