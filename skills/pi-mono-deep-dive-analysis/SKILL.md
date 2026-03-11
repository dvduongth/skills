---
name: pi-mono-deep-dive-analysis
description: |
  Comprehensive analysis of Pi-Mono (open-source AI agent toolkit) - architecture, packages, patterns.

  Use this skill whenever you need to:
  - Analyze the Pi-Mono codebase and generate detailed reports
  - Understand monorepo architecture, LLM provider abstraction, agent runtime patterns
  - Learn design patterns from Pi-Mono (Provider Registry, Message Polymorphism, Dual-Loop, etc.)
  - Compare Pi with Claude Code, Cursor, Aider
  - Create structured documentation about AI agent toolkits
  - Analyze similar open-source AI projects

  Perfect for developers learning AI agent architecture, researchers comparing AI tools,
  architects designing extensible systems, or teams building agent-based systems.
  Trigger whenever user mentions "analyze pi-mono", "understand pi", "deep dive into agent patterns",
  or asks about AI agent architecture, monorepo design, LLM abstraction layers, or agent runtime patterns.

compatible-tools:
  - web-data-analysis (for fetching and analyzing source repos)
  - Glob (find files in codebase)
  - Grep (search code patterns)
  - Read (examine source files)

tags:
  - ai-agents
  - architecture-analysis
  - open-source
  - design-patterns
  - monorepo
  - research

---

# Pi-Mono Deep Dive Analysis Skill

## Overview

This skill guides systematic analysis of **Pi-Mono**, a modular open-source AI agent toolkit (22.1k stars, MIT license).

The workflow generates **8-10 structured reports** covering:
1. Project Overview
2. Monorepo Architecture
3. LLM Abstraction (pi-ai)
4. Agent Runtime (pi-agent-core)
5. Coding Agent (pi-coding-agent)
6. Supporting Packages (tui, web-ui, mom, pods)
7. Benchmark Comparison (vs Claude Code, Cursor, Aider)
8. Design Patterns & Lessons Learned
9. Executive Summary / Full Report

---

## When to Use This Skill

- User wants to **understand Pi-Mono architecture** deeply
- User is **learning AI agent design patterns** and needs a case study
- User wants **architectural comparison** of coding agents
- User is **building a similar system** and wants to learn from Pi-Mono
- User needs **design pattern analysis** for extensible systems
- User wants **research documentation** on open-source AI tools

**Key contexts**:
- "Analyze Pi-Mono for me"
- "Deep dive into pi-mono architecture"
- "Compare Pi vs Claude Code"
- "Learn agent patterns from Pi-Mono"
- "What can I learn from Pi-Mono's design?"

---

## Analysis Workflow

### Phase 1: Preparation
1. **Locate source**: Pi-Mono GitHub repo or local clone
2. **Scope definition**: What aspects to analyze? (architecture / patterns / comparison / full deep-dive)
3. **Output format**: Individual reports or unified document?
4. **Audience**: Technical depth for architects vs. conceptual overview for managers?

### Phase 2: Source Exploration
1. **Root level**: README, package.json, AGENTS.md, LICENSE
2. **Architecture**: tsconfig, monorepo structure, build order, dependency graph
3. **Packages** (7 total):
   - `ai` — LLM provider abstraction
   - `agent` — Agent runtime & execution model
   - `coding-agent` — Coding CLI with extension system
   - `tui` — Terminal UI framework
   - `web-ui` — Web components library
   - `mom` — Slack bot implementation
   - `pods` — GPU deployment CLI
4. **Key code files**: 15-20 source files for deep patterns

### Phase 3: Analysis (per package)
For each package, extract:
- **Purpose & scope**: What does it do?
- **Architecture**: How is it structured?
- **Key patterns**: What design patterns does it use?
- **Dependencies**: What does it depend on?
- **Unique features**: What makes it special?

### Phase 4: Pattern Extraction
Identify **5 core design patterns**:
1. **Provider Registry** — Dynamic plugin registration
2. **Message Polymorphism** — Type-safe message protocol with extensibility
3. **Dual-Loop Execution** — Interruption-capable agent loop
4. **First-Class Tools** — Tools with validation and error recovery
5. **Event-Driven Updates** — Real-time granular events for UI

For each: explain via ví dụ đời thực (real-world analogy)

### Phase 5: Benchmarking (if comparison mode)
Compare Pi against:
- **Claude Code** (Anthropic's agent CLI)
- **Cursor** (VS Code fork with AI)
- **Aider** (Git-native open-source CLI)

**15 comparison criteria**:
- Type (CLI/IDE/SDK)
- License & cost
- LLM providers
- Tools/capabilities
- Safety model
- Extensibility
- Team features
- GPU support

### Phase 6: Documentation Generation
Create **8 structured Markdown reports**:
1. `01_tong_quan_du_an.md` — Project overview
2. `02_kien_truc_monorepo.md` — Monorepo design
3. `03_he_thong_llm_pi_ai.md` — LLM abstraction
4. `04_agent_runtime.md` — Agent execution
5. `05_coding_agent.md` — Coding CLI
6. `06_cac_package_ho_tro.md` — Supporting packages
7. `07_so_sanh_benchmark.md` — Tool comparison
8. `08_bai_hoc_patterns.md` — Design lessons
9. `PROGRESS.md` — Implementation tracking
10. `pi_mono_deep_dive_full.md` — Executive summary/full report

---

## Report Content Structure

### 01. Project Overview
```
- What is Pi-Mono?
- Creator and motivation
- 7 packages at a glance
- Tech stack
- Basic stats (stars, releases, license)
- Comparison with alternatives (1 paragraph)
```

### 02. Monorepo Architecture
```
- Monorepo concept explained
- NPM Workspaces setup
- Build order & dependency graph
- Lockstep versioning strategy
- AGENTS.md rules (development guidelines)
- Dev tooling (Biome, tsgo, Vitest, Husky)
- TypeScript configuration
```

### 03. LLM Abstraction (pi-ai)
```
- What is LLM provider?
- Provider Registry Pattern with ví dụ
- 20+ supported providers (table)
- Message Protocol (3 types + 4 content types)
- Streaming Events (13 types)
- Token/Cost tracking
- Model Definition structure
- Stream Options
- How to add new provider (7 steps)
```

### 04. Agent Runtime
```
- What is Agent? Tool Calling?
- Dual-Loop Execution (ví dụ: đầu bếp)
- AgentState definition
- AgentTool structure with example
- AgentMessage extensibility
- Steering & Follow-up (can thiệp giữa)
- Self-Correcting error handling
- Pipeline: AgentMessage → Message → LLM
- 13 AgentEvent types with timeline
```

### 05. Coding Agent
```
- Coding agent concept
- Design philosophy: "Tối giản, tùy biến"
- 4 modes: Interactive / Print / RPC / SDK
- 8 built-in tools (table + description)
- Extension system 5 tiers (ví dụ sơ đồ)
- Session management & context compaction
- Comparison with Claude Code (table)
```

### 06. Supporting Packages
```
- tui: Terminal UI framework (differential rendering, CJK)
- web-ui: Web components (Lit + Tailwind, file attachment, artifacts)
- mom: Slack bot (per-channel context, Docker sandbox, delegated OAuth)
- pods: GPU CLI (vLLM deployment, multi-model, OpenAI-compatible API)
- Comparison table: when to use each
```

### 07. Benchmark Comparison
```
- 4 tools: Pi vs Claude Code vs Cursor vs Aider
- 15-criteria comparison table
- Design philosophy for each
- LLM provider support (table)
- Tools/capabilities (table)
- Strengths/weaknesses for each
- "Who should use what?" recommendations
- One-sentence summary per tool
```

### 08. Design Patterns & Lessons
```
- 5 Design Patterns (each with real-world ví dụ)
- Trade-offs: Extensibility vs Security, Simplicity vs Features
- 10 Key Lessons Learned
- Applicable patterns to other projects (CCN2, web apps, etc.)
- Blind spots & limitations
- When NOT to use Pi-Mono patterns
```

### PROGRESS.md
```
- Date started/completed
- 10-step checklist with status (⬜/🔄/✅)
- Logging of activities
- Stats: files created, sources analyzed, web fetches
```

### Full Report
```
- Executive Summary (1 page)
- Table of Contents
- Sections 1-8 above (condensed or linked)
- Appendix: file structure, links, glossary
- ~2,500 lines total
```

---

## Key Insights to Highlight

**Architecture**:
- NPM Workspaces (simple, effective)
- Lockstep versioning (all packages same version)
- AGENTS.md rules (governance for multi-agent collaboration)

**LLM Design**:
- Provider Registry > inheritance (loose coupling)
- Message Protocol with extension (CustomAgentMessages)
- Streaming-first (not batch)

**Agent Patterns**:
- Dual-Loop (interruption capability)
- Self-healing (tool errors = context, not crash)
- Steering messages (mid-run control)

**Philosophy**:
- Minimal core (8 tools) + 5-tier extension
- "Tối giản nhưng tùy biến" (minimal but customizable)
- No forced patterns (no MCP, no sub-agents, no permissions)

---

## Comparison Context

### Claude Code (Anthropic)
- **Strength**: Many tools + MCP + Plan mode + Permissions (safe by default)
- **Weakness**: Closed-source, not extensible

### Cursor (VS Code fork)
- **Strength**: IDE experience, fast autocomplete, good UX
- **Weakness**: Proprietary, $20-40/month, no CLI mode

### Aider (open-source CLI)
- **Strength**: Git-native, auto-commit, multi-model, free
- **Weakness**: Limited extensibility, terminal-only

### Pi (this project)
- **Strength**: Highly extensible, multi-provider, MIT, team features (Mom)
- **Weakness**: Minimal core, requires DIY extension

---

## Analysis Tips & Best Practices

**Do's**:
- Read source code deeply, don't just scan
- Extract actual design patterns (not just features)
- Provide ví dụ đời thực for every pattern
- Explain the "why" behind decisions
- Organize by layers: Core → Patterns → Applications

**Don'ts**:
- Just list features without explaining architecture
- Copy-paste code without context
- Ignore trade-offs and limitations
- Skip the synthesis (what can others learn?)

**Output quality**:
- All content in tiếng Việt (100%)
- No jargon without explanation
- Each concept has ví dụ
- Reports are cross-linked and consistent
- Tables for comparisons, prose for analysis

---

## Example Output Files Location

```
D:\PROJECT\CCN2\research_doc\open_claw\
├── PROGRESS.md
├── 01_tong_quan_du_an.md
├── 02_kien_truc_monorepo.md
├── 03_he_thong_llm_pi_ai.md
├── 04_agent_runtime.md
├── 05_coding_agent.md
├── 06_cac_package_ho_tro.md
├── 07_so_sanh_benchmark.md
├── 08_bai_hoc_patterns.md
└── pi_mono_deep_dive_full.md (gộp tất cả)
```

---

## Success Criteria

✅ **Comprehensive**: Covers all 7 packages + patterns + comparison
✅ **Accessible**: Explains concepts for non-AI experts
✅ **Well-structured**: Clear hierarchy, tables, visual aids
✅ **Actionable**: Readers can apply patterns to their own projects
✅ **Unique perspective**: Not just feature list, but architectural analysis
✅ **Tiếng Việt**: All Vietnamese, with ví dụ đời thực

---

