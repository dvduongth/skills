# Tasks — <FEATURE_NAME>
- Feature ID: <NNN-slug>
- Owner: <coder/tester>
- Status: Draft | In Progress | Review | Done

## Task List
> Format:
> - TASK-ID: title
>   - Maps to AC: [AC-xx, AC-yy]
>   - Type: design | code | test | docs | ops
>   - Dependencies: [...]
>   - Files/Areas: [...]
>   - DoD: (verification steps)
>   - Notes/Risks:

### TASK-01: <title>
- Maps to AC: [AC-01]
- Type: code
- Dependencies: []
- Files/Areas:
  - src/...
- DoD:
  - [ ] Implementation complete
  - [ ] Unit tests added/updated
  - [ ] CI passes
- Notes:

### TASK-02: <title>
- Maps to AC: [AC-02]
- Type: test
- Dependencies: [TASK-01]
- Files/Areas:
  - tests/...
- DoD:
  - [ ] Test cases written (mapped to AC)
  - [ ] Automated tests passing
- Notes:

## Test Cases Index (optional)
- TC-01 maps AC-01: ...
- TC-02 maps AC-02: ...