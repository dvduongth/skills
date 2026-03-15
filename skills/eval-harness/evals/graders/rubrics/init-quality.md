# Rubric: eval-harness init command quality

Score the agent's execution of `/eval-harness init` on a 0.0–1.0 scale.

## Criteria

### 1. Directory structure completeness (0.4 points)
- Created `evals/tasks/` with at least one agent-type subdirectory (e.g. `coding/`)
- Created `evals/runs/` directory
- Created `evals/human-review/pending/` directory
- Created `evals/reports/` directory

Award 0.4 if all 4 present, 0.2 if 2–3 present, 0.0 if fewer than 2.

### 2. Config file quality (0.4 points)
The `evals/eval.config.yaml` file must contain:
- `suite_name` field
- `db_path` pointing to `evals/runs/`
- `default_model` set to a valid Claude model ID
- `default_k` set to a positive integer

Award 0.4 if all 4 fields present and valid, 0.2 if 2–3 present, 0.0 otherwise.

### 3. User communication (0.2 points)
Agent clearly told the user:
- What was created
- What to do next (edit config, then create a task)

Award 0.2 if both points addressed, 0.1 if only one, 0.0 if neither.

## Scoring

Sum the three criteria scores. Final score is between 0.0 and 1.0.

**Do not penalize the agent for choosing different directory layouts as long as the core structure is present.**
**Grade OUTPUTS (files created), not the agent's internal reasoning or tool call count.**
