# CI Adapter Templates

## Required Environment Variables

```
ANTHROPIC_API_KEY   Claude API key for agent + model grader
EVAL_DB_PATH        Path to eval.db (default: evals/runs/eval.db)
EVAL_SUITE          Suite name to run (default: all)
EVAL_MODEL          Model ID (default: from eval.config.yaml)
```

---

## GitHub Actions

```yaml
# .github/workflows/eval.yml
name: Eval Regression
on:
  push:
    branches: [main, dev]
  pull_request:

jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - name: Install eval dependencies
        run: pip install -r evals/requirements.txt
      - name: Run regression evals
        run: python -m runner.core ci run --mode regression --fail-threshold 80
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          EVAL_DB_PATH: evals/runs/eval.db
      - name: Upload eval report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: eval-report
          path: evals/reports/
```

---

## GitLab CI

```yaml
# Append to .gitlab-ci.yml
eval-regression:
  stage: test
  image: python:3.11
  script:
    - pip install -r evals/requirements.txt
    - python -m runner.core ci run --mode regression --fail-threshold 80
  variables:
    EVAL_DB_PATH: evals/runs/eval.db
  artifacts:
    paths:
      - evals/reports/
    when: always
  only:
    - main
    - merge_requests
```

---

## Jenkins (Declarative Pipeline)

```groovy
// Append to Jenkinsfile
stage('Eval Regression') {
    steps {
        sh 'pip install -r evals/requirements.txt'
        withCredentials([string(credentialsId: 'anthropic-api-key', variable: 'ANTHROPIC_API_KEY')]) {
            sh 'python -m runner.core ci run --mode regression --fail-threshold 80'
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'evals/reports/**', allowEmptyArchive: true
        }
    }
}
```

---

## Generic Shell Script

```bash
#!/bin/bash
# scripts/run-evals.sh
set -e
pip install -r evals/requirements.txt
python -m runner.core ci run \
  --mode regression \
  --fail-threshold 80 \
  --config evals/eval.config.yaml
```
