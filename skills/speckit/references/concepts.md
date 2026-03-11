# SDD Concepts & Philosophy

## What is Spec-Driven Development?

SDD is a methodology that treats specifications as **first-class artifacts** — not disposable documents, but living contracts that drive implementation. It's "unit tests for English" because:

1. **Testable** — Every specification can be validated
2. **Traceable** — Tasks link back to specs link back to constitution
3. **Enforceable** — Pipeline gates prevent progression without quality

## Core Principles

### 1. Constitution Governance
A project's constitution is immutable. It defines:
- Core values (e.g., "Performance > Features")
- Architectural constraints (e.g., "No external dependencies")
- Quality standards (e.g., "90% test coverage")

Every decision — from spec to code — must align with these principles.

### 2. Specification as Contract
Specifications are not sketches; they're contracts with:
- **Unambiguous language** — No metaphors, no "could"
- **Measurable outcomes** — "Fast" becomes "<100ms response"
- **Testable scenarios** — Each requirement has a test case

### 3. Pipeline Validation
The 9-step pipeline enforces quality through:
- **Prerequisites** — Can't skip steps
- **Artifacts as input** — Output of step N becomes input of step N+1
- **Gate checks** — Each step validates the previous

### 4. Progressive Refinement
Start fuzzy, get precise:
- **constitution**: Vision (broad principles)
- **specify**: Feature definition (what)
- **plan**: Technical roadmap (how)
- **tasks**: Actionable items (do)
- **implement**: Code (result)

## Anti-Patterns

❌ **Big Bang Spec** — Trying tospec everything upfront
✅ **Progressive** — Spec just enough to start, refine as you go

❌ **Spec for Spec's Sake** — No implementation plan
✅ **Implementation-Driven** — Specs exist to drive code

❌ **Unvalidated Assumptions** — Specs with undefined terms
✅ **Clarified Ambiguity** — All undefined terms marked and resolved

❌ **Parallel Pipelines** — Multiple specs without constitution
✅ **Constitution-First** — All specs derive from shared principles

## Unit Tests for English Analogy

| Unit Testing | SDD |
|--------------|-----|
| Test case | Specification section |
| Test suite | Feature spec |
| Integration test | Plan validation |
| Code coverage | Task coverage |
| Refactoring confidence | Spec confidence |
| Continuous integration | Continuous specification |

Just as unit tests prevent regressions in code, SDD prevents regressions in understanding.

## The 3 Key Innovations

1. **Constitution as Governance** — Principles that transcend features
2. **Specification Templates** — Structured artifacts, not free-form docs
3. **Pipeline as Quality Gate** — Each step validates the previous

These innovations transform specifications from disposable docs into implementation drivers.