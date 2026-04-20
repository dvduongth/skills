# PRD Template — Reference for Generation

> Read this file before writing the PRD in Phase 4.
> This template defines the structure, what goes in each section, and common pitfalls to avoid.
> Adapt section depth to product complexity — a simple CLI tool doesn't need 12 detailed sections.

---

## Document Header

```markdown
# [Product Name] — Product Requirement Document (PRD)

> **Version:** [1.0]
> **Date:** [YYYY-MM-DD]
> **Author:** [User name or team]
> **Status:** [Draft | In Review | Approved | In Development]
> **Audience:** Development agents, Engineering team, Stakeholders
```

---

## Section 1: Product Overview

### What to include:
- **Product name** — clear, descriptive name
- **One-line summary** — what it does in 1 sentence
- **Objective** — the primary goal, written as: "Enable [who] to [do what] so that [outcome]"
- **Vision statement** — 2-3 sentences describing the ideal end-state (italic, quoted)
- **Core values** — table of 3-5 values with descriptions

### Writing tips:
- The objective must be specific enough to evaluate ("reduce analysis time from 4 hours to 30 minutes") not vague ("improve efficiency")
- Vision statement should paint a picture of the user's life AFTER the tool exists

### Template:
```markdown
## 1. Product Overview

### 1.1 Product Name
**[Name]** — [Short descriptor]

### 1.2 Objective
[One paragraph: Enable WHO to DO WHAT so that OUTCOME]

### 1.3 Vision Statement
> *[2-3 sentences describing the ideal future state]*

### 1.4 Core Values
| Value | Description |
|-------|-------------|
| **[Value 1]** | [How this tool delivers this value] |
| **[Value 2]** | [How this tool delivers this value] |
```

---

## Section 2: Context & Problem

### What to include:
- **Business context** — company/team situation, industry, why now
- **Pain points table** — numbered list with: problem, impact, who is affected
- **Opportunity** — why this is solvable now (tech maturity, market timing, team readiness)

### Writing tips:
- Pain points should come directly from the user's interview answers
- Quantify impact where possible ("takes 4 hours" not "takes too long")
- Opportunity section should justify BUILD vs BUY

### Template:
```markdown
## 2. Context & Problem

### 2.1 Business Context
[1-2 paragraphs about the situation]

### 2.2 Pain Points
| # | Problem | Impact | Affected Users |
|---|---------|--------|----------------|
| P1 | [Problem] | [Measurable impact] | [Role/team] |

### 2.3 Opportunity
[Why this is solvable now — what's changed that makes this feasible]
```

---

## Section 3: Target Users

### What to include:
- **Persona table** for each user type with: role, skills, goals, pain points, usage frequency
- Mark primary vs secondary users clearly

### Writing tips:
- Skill level is crucial for dev agents — it determines UI complexity, onboarding needs, error handling verbosity
- Include usage frequency — it affects caching, session management, notification design
- 2-3 personas is typical; more than 4 suggests scope is too broad

### Template:
```markdown
## 3. Target Users

### 3.1 Persona: [Role Name] (Primary User)
| Attribute | Description |
|-----------|-------------|
| **Role** | [What they do] |
| **Skills** | [Technical proficiency relevant to this tool] |
| **Goal** | [What they want to achieve with this tool] |
| **Pain Point** | [Current frustration this tool solves] |
| **Usage Frequency** | [Daily/Weekly, N sessions per period] |
```

---

## Section 4: Product Scope

### What to include:
- **In Scope table** — numbered features with status (Planned/In Progress/Done)
- **Out of Scope table** — explicitly excluded features with reasoning

### Writing tips:
- Out of Scope is just as important as In Scope for development agents — it prevents them from gold-plating
- Status column helps agents prioritize implementation order
- Each In Scope item should map to at least one User Story in Section 5

### Template:
```markdown
## 4. Product Scope

### 4.1 In Scope
| # | Feature | Priority | Status |
|---|---------|----------|--------|
| S1 | [Feature description] | P0 | Planned |

### 4.2 Out of Scope
| # | Feature | Reason |
|---|---------|--------|
| O1 | [Feature] | [Why excluded — be specific] |
```

---

## Section 5: User Stories & Acceptance Criteria

### What to include:
- User stories in standard format: "As a [role], I want [action], so that [benefit]"
- Acceptance criteria in Given/When/Then (Gherkin) format
- Group by feature area (e.g., "Data Management", "Analysis", "Export")

### Writing tips — CRITICAL for development agents:
- Each acceptance criterion must be **testable** — a dev agent should be able to write a test case from it
- Include BOTH happy path and key edge cases
- Specify exact behaviors: "displays error toast with message 'File exceeds 50MB limit'" not "shows an error"
- For UI behaviors, specify: what triggers it, what changes visually, what state changes
- Cover error states: what happens when network fails, file is corrupt, API returns error

### Template:
```markdown
## 5. User Stories & Acceptance Criteria

### 5.1 [Feature Area Name]

#### US-01: [Short title]
> *As a **[role]**, I want **[action]**, so that **[benefit]**.*

**Acceptance Criteria:**
- **Given** [precondition],
  **When** [action],
  **Then** [expected outcome].

- **Given** [error/edge case condition],
  **When** [action],
  **Then** [error handling behavior].
```

### Common acceptance criteria to always consider:
- What happens on success?
- What happens on validation failure?
- What happens on network/API error?
- What happens with empty state (no data yet)?
- What happens with large data (performance edge)?
- What are the permission boundaries?

---

## Section 6: Functional Requirements

### What to include:
- **FR table** — each requirement with: ID, description, priority (P0/P1/P2/P3), status
- Group or note which User Story each FR maps to

### Writing tips:
- P0 = Must have for launch. P1 = Important, next sprint. P2 = Nice to have. P3 = Future consideration.
- Each FR should be one atomic capability — not a compound sentence with "and"
- Bad: "Upload CSV and Excel files with profiling" → Good: "FR-01: Upload CSV with auto profiling", "FR-02: Upload Excel (.xlsx) with multi-sheet support"

### Template:
```markdown
## 6. Functional Requirements

| ID | Description | Priority | Status | Maps to |
|----|-------------|----------|--------|---------|
| FR-01 | [Atomic requirement] | P0 | Planned | US-01 |
```

---

## Section 7: Non-Functional Requirements

### What to include:
- **Performance** — response times, throughput, file size limits
- **Security** — auth, authorization, data protection, API key management
- **Scalability** — concurrent users, data volume, deployment model
- **UX** — language, theme, responsive, accessibility
- **Reliability** — uptime, error recovery, data backup

### Writing tips:
- Every NFR needs a **measurable criterion** — "fast" is not a requirement; "< 2 seconds" is
- Security NFRs are often forgotten — always include auth, data isolation, secrets management
- For AI/LLM-based products: add NFRs for token limits, cost monitoring, hallucination handling

### Template:
```markdown
## 7. Non-Functional Requirements

### 7.1 Performance
| ID | Requirement | Measurable Criterion | Priority |
|----|-------------|---------------------|----------|
| NFR-01 | [Requirement] | [Specific metric] | P0 |

### 7.2 Security
| ID | Requirement | Details | Priority |
|----|-------------|---------|----------|
| NFR-XX | [Requirement] | [Implementation detail] | P0 |
```

**IMPORTANT**: Use unique sequential IDs across all NFR subsections. Do NOT restart numbering per subsection (avoid duplicate IDs like NFR-11 appearing twice).

---

## Section 8: Architecture Overview

### What to include:
- **High-level architecture diagram** (ASCII art or description — dev agents can read both)
- **Tech stack table** — layer, technology, version, role
- **Key architecture decisions (ADRs)** — decision, alternatives considered, rationale

### Writing tips:
- The diagram should show: client, server, database, external services, and how they connect
- ADRs are crucial — they tell dev agents WHY a choice was made so they don't second-guess it
- Include specific version numbers where known — prevents dev agents from picking incompatible versions
- For AI/LLM products: show the LLM provider integration, prompt flow, and token management clearly

### Template:
```markdown
## 8. Architecture Overview

### 8.1 High-Level Architecture
[ASCII diagram or structured description showing components and data flow]

### 8.2 Tech Stack
| Layer | Technology | Version | Role |
|-------|-----------|---------|------|
| Frontend | [Framework] | [Version] | [Purpose] |

### 8.3 Architecture Decisions (ADRs)
| # | Decision | Alternatives Considered | Rationale |
|---|----------|------------------------|-----------|
| ADR-01 | [Choice made] | [What else was considered] | [Why this choice] |
```

---

## Section 9: Data Model

### What to include:
- **Entity relationship** (ASCII or text description)
- **Table definitions** — table name, role, key fields, notes
- **Key schema details** — especially for flexible schemas (JSONB, etc.)

### Writing tips:
- This section directly drives database migration code — be precise
- Always include: primary keys, foreign keys, unique constraints, and indexes for performance
- For JSONB/flexible fields: provide the expected schema shape with field types
- Include soft-delete strategy if applicable

### Template:
```markdown
## 9. Data Model

### 9.1 Entity Relationships
[ASCII diagram showing tables and relationships with cardinality]

### 9.2 Table Definitions
| Table | Role | Key Fields | Notes |
|-------|------|------------|-------|
| **users** | [Purpose] | id, email, ... | [Constraints, indexing] |

### 9.3 Schema Details
[For any JSONB or flexible fields, show the expected structure]
```

---

## Section 10: Risks & Mitigation

### What to include:
- **Risk table** — risk description, severity (High/Medium/Low), probability, mitigation, status

### Writing tips:
- Include at least: technical risks, dependency risks, cost risks, security risks
- Mitigation should be actionable ("implement retry with exponential backoff") not vague ("handle errors")
- For AI/LLM products: always include hallucination risk, cost escalation risk, provider downtime risk, data privacy risk

### Template:
```markdown
## 10. Risks & Mitigation

| # | Risk | Severity | Probability | Mitigation | Status |
|---|------|----------|------------|------------|--------|
| R1 | [Risk description] | High | Medium | [Specific mitigation action] | Planned |
```

---

## Section 11: Development Guidelines

### What to include:
- **Coding standards** — naming conventions, file structure, patterns to follow
- **Testing requirements** — what to test, coverage expectations, test types
- **Code quality** — linting, formatting, commit conventions
- **Dependencies** — package management rules, version pinning strategy

### Writing tips:
- These guidelines help dev agents produce consistent, maintainable code from the start
- Adapt depth to team maturity — a solo developer needs less process than a team of 10
- Reference existing project conventions if building on an existing codebase
- For AI-generated code: specify review requirements, testing rigor, and documentation expectations

### Template:
```markdown
## 11. Development Guidelines

### 11.1 Coding Standards
| Area | Convention | Example |
|------|-----------|---------|
| File naming | [Convention] | `user-profile.tsx`, `auth.service.ts` |
| Component structure | [Pattern] | Functional components with hooks |
| State management | [Approach] | [Library/pattern and when to use] |
| Error handling | [Strategy] | [How to handle and report errors] |

### 11.2 Testing Requirements
| Test Type | Scope | Coverage Target |
|-----------|-------|----------------|
| Unit tests | Business logic, utilities | > 80% |
| Integration tests | API endpoints, DB queries | Key flows |
| E2E tests | Critical user journeys | Happy paths |

### 11.3 Code Quality
- Linter: [ESLint/Prettier config or equivalent]
- Commit convention: [Conventional Commits / other]
- PR requirements: [Review process, CI checks]

### 11.4 Dependency Management
- Package manager: [npm/yarn/pnpm/pip/etc.]
- Version pinning: [Exact versions / ranges]
- Security: [Audit frequency, vulnerability policy]
```

---

## Section 12: Development Roadmap

### What to include:
- **Phased milestones** — grouped by release/phase with estimated timeline
- **Effort estimation** per milestone — using T-shirt sizing or story points
- **Visual timeline** (text-based Gantt or simple timeline)
- Each milestone should reference FRs it includes
- **Dependencies between milestones** — what blocks what

### Writing tips:
- Phase 1 / MVP should be achievable in 1-3 weeks for most internal tools
- Each phase must deliver user-visible value — not just infrastructure
- Dev agents use this to understand implementation ORDER, not just feature list
- Effort estimates help users plan resources and set expectations — even rough estimates are better than none

### Effort Estimation Guide:
| Size | Meaning | Typical Duration (1 dev) |
|------|---------|-------------------------|
| **XS** | Config change, copy update | < 2 hours |
| **S** | Single component/endpoint, well-defined | 2-8 hours |
| **M** | Feature with multiple parts, some unknowns | 1-3 days |
| **L** | Complex feature, multiple integrations | 3-5 days |
| **XL** | Major system, architectural changes | 1-2 weeks |

### Template:
```markdown
## 12. Development Roadmap

### Phase 1: MVP — [Theme Name]
**Estimated timeline:** [Duration]
**Total effort:** [Sum of estimates]

| Milestone | Features (FR references) | Effort | Priority | Dependencies |
|-----------|------------------------|--------|----------|--------------|
| M1.1 | [Feature group] (FR-01, FR-02) | M | P0 | — |
| M1.2 | [Feature group] (FR-03) | S | P0 | M1.1 |
```

---

## Section 13: Success Criteria

### What to include:
- **Quantitative metrics** — metric, target, how to measure, baseline
- **Qualitative metrics** — what "good" looks like subjectively
- **Built-in measurement** — what the system can measure automatically

### Writing tips:
- Every quantitative metric needs a baseline (the "before" number)
- Metrics must be consistent with persona usage frequency (don't expect 20 sessions/week if persona says 5-15)
- Include at least: adoption, time-saved, quality, and cost metrics

### Template:
```markdown
## 12. Success Criteria

### 13.1 Quantitative Metrics
| Metric | Target | How to Measure | Baseline |
|--------|--------|---------------|----------|
| [Metric name] | [Specific target] | [Measurement method] | [Current state] |

### 13.2 Qualitative Metrics
| Metric | Success Criteria | Evaluation Method |
|--------|-----------------|-------------------|
| [Metric] | [What "good" looks like] | [How to assess] |
```

---

## Appendix Sections (Optional, Include if Relevant)

- **Glossary** — define domain-specific terms that dev agents might not know
- **Reference Documents** — links to design files, API docs, existing systems
- **API Endpoint Summary** — if architecture is clear enough, list planned endpoints

---

## Adapting Template Depth to Product Complexity

| Product Type | Recommended Sections | Skip/Simplify |
|-------------|---------------------|----------------|
| **Simple CLI tool** | 1, 2, 4, 5, 6, 8, 11 | Skip 3 (1 user), 9 (no DB), 12 (1 phase) |
| **Internal web tool** | All 13 sections | Full depth |
| **MVP / prototype** | 1, 2, 3, 4, 5, 6, 8, 12 | Simplify 7, 9, 10, 11 |
| **Production SaaS** | All 13 + Appendix | Maximum depth, add API spec |
| **AI/LLM-powered tool** | All 13 | Extra depth on 7 (token/cost NFRs), 8 (LLM integration), 10 (AI risks) |
| **Mobile Application** | All 13 | Extra depth on 7 (offline, battery), 8 (platform-specific), 11 (mobile testing) |
| **Browser Extension** | 1, 2, 3, 4, 5, 6, 7, 8, 10, 12 | Simplify 9 (usually lightweight), 11 (basic standards) |
