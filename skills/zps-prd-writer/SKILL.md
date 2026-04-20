---
name: zps-prd-writer
description: "Interview users to gather product requirements, then generate a complete PRD (Product Requirement Document) that development agents can use to build the product. Use this skill whenever the user wants to: plan a new tool/app/product, write a PRD, define product requirements, scope a project before development, create specs for a development agent, or says things like 'I want to build...', 'help me plan...', 'I need a tool that...', 'write requirements for...', 'create a PRD', 'spec out this product'. Also trigger when the user has a vague idea and needs structured thinking to turn it into actionable requirements. Do NOT use for existing PRD review/editing (unless the user wants to rewrite from scratch), pure technical documentation, or post-development documentation."
---

# PRD Writer — Interview → Requirements → Document

## Purpose

This skill turns a user's product idea into a development-ready PRD through structured interviewing. The output PRD must be complete enough that a separate coding agent (Claude Code, Cursor, Copilot, etc.) can build the product without needing to ask the user clarifying questions.

## Core Workflow

```
[1] UNDERSTAND  →  [2] INTERVIEW  →  [3] SYNTHESIZE  →  [4] DRAFT PRD  →  [5] REVIEW & REFINE
     (30s)          (multi-turn)       (internal)         (generate)        (with user)
```

---

## Phase 1: UNDERSTAND — Quick Assessment (Before Interviewing)

When the user first describes their idea, silently assess:

| Dimension | Question to yourself |
|-----------|---------------------|
| **Clarity** | Is this a vague idea ("I want a dashboard") or specific ("I need a FastAPI + React app that...")? |
| **Scope** | Internal tool, MVP, production SaaS, or prototype? |
| **Size** | Small (1-5 features, 1-2 weeks), Medium (5-15 features, 2-6 weeks), or Large (15+ features, multi-month)? Medium and Large projects require phased delivery. |
| **User's role** | Are they the end-user, a PM, a founder, or a developer? |
| **Existing context** | Have they already provided files, wireframes, or partial specs in this conversation? |

Based on this assessment, calibrate your interview depth:
- **Vague idea** → Full interview (cover all topics in the question bank)
- **Clear idea with gaps** → Targeted interview (skip what's already known)
- **Detailed spec, just needs formatting** → Confirm key points → Run Phase 3 checklist → Phase 4

**Phased delivery detection**: If the project is Medium or Large (5+ features, multiple user types, integrations, or timeline > 2 weeks), the PRD must use **phased delivery** — see "Large Project Phasing Strategy" section below. Flag this early so the interview covers phase boundaries and priorities.

**CRITICAL**: Extract everything you can from the conversation history FIRST. Never re-ask what the user already told you.

### Handling Existing Files & Documents

If the user provides files (specs, wireframes, Figma links, existing docs, spreadsheets, etc.):

1. **Read every provided file immediately** using the Read tool — don't just skim or assume content from filenames
2. **Extract structured information**: features mentioned, user roles, tech stack hints, data models, business rules
3. **Map extracted info to the Phase 3 completeness checklist** — mark what's already answered
4. **Only interview for the gaps** — tell the user: "Em đã đọc file anh gửi và hiểu được [summary]. Em chỉ cần hỏi thêm vài điểm chưa rõ thôi ạ."
5. **Reference the source** when synthesizing: "Theo file [X] anh gửi, feature Y hoạt động như Z — đúng không ạ?"

This applies to: `.md`, `.docx`, `.pdf`, `.xlsx`, `.txt`, `.json`, images (wireframes/mockups), and any other readable format.

---

## Phase 2: INTERVIEW — Adaptive Discovery

**CRITICAL RULES:**
1. **ONE question per message. No exceptions.** Never ask 2+ questions in a single message. User needs time to think about each question individually.
2. **Adaptive, not linear.** The question bank below is organized by topic, but you do NOT follow it top-to-bottom. Each answer determines what to ask next. Branch dynamically based on what the user says.
3. **Probe "all of the above" answers.** When user selects every option or says "all", follow up: "If you could only pick ONE as the highest priority, which would it be?" This separates true P0 from wishful thinking.
4. **Ask user's name first if not already known from conversation history.** Before any product questions, ask the user's name to populate the PRD Author field.

### Progress Indicator

Show the user where they are in the interview process. After each answer, include a brief progress line so they know how much is left. Format:

```
📋 [Topic đã xong] → **[Topic hiện tại]** → [Topics còn lại]
```

**Topic order (adapt based on what's relevant):**
1. Problem & Context
2. Core Functionality
3. Data & Integration
4. Users & Access
5. Technical Preferences (skip if non-technical user)
6. Success & Phasing

Example: `📋 Problem ✓ → **Core Functionality** → Data → Users → Success`

Skip topics that aren't relevant and adjust the indicator accordingly. The indicator helps the user feel the interview is progressing, not endless.

**Interview style guidelines:**
- Ask in the user's language (Vietnamese if they write Vietnamese, English if English)
- Keep questions conversational, not interrogation-style
- Offer concrete examples or options when the user seems unsure
- If the user says "I don't know" or "up to you", propose a sensible default and ask them to confirm

**IMPORTANT — Use `AskUserQuestion` tool for ALL questions with options:**
- **Any question where you can provide 2-4 concrete options MUST use the `AskUserQuestion` tool.** This renders as an interactive selector in the terminal (numbered options with arrow navigation), which is much easier for users to answer than reading plain text.
- Only use free-form text questions (without AskUserQuestion) when the question is truly open-ended and cannot be answered with predefined options (e.g., "Describe your ideal workflow", "What problem does this solve?").
- When using `AskUserQuestion`: write the `question` field in the user's language, keep `label` short (1-5 words), use `description` for context. The user can always select "Other" to provide custom input, so don't worry about covering every possible answer.
- For probing vague answers (e.g., "How many users?"), prefer `AskUserQuestion` with concrete ranges as options instead of asking an open-ended follow-up.

### Adaptive Branching Rules

After each answer, decide the next question based on what was revealed:

| User says... | Branch to... |
|-------------|-------------|
| "Internal tool" or "nội bộ" | Ask about team size, then Auth/SSO needs |
| "Sensitive data" or "nhạy cảm" | Branch into: compliance requirements, encryption needs, data retention policy |
| "Budget limited" or "tiết kiệm" | Ask: what trade-offs are acceptable? (quality vs cost, speed vs cost) |
| Mentions "API", "integration" | Ask about specific systems, protocols, auth methods |
| Mentions "AI", "LLM", "agent" | Read `interview-guide.md` Agent/AI sections, weave in relevant questions |
| Describes multiple user types | Ask about each persona's specific needs, one at a time |

### Topic: Product Type Classification (Do This Early)

After understanding the basic idea, classify the product into one of these types, then read `interview-guide.md` for deep-dive questions specific to that type:

- **Data/Analytics Tool** — dashboards, reports, data processing
- **CRUD/Management Tool** — entity management, workflows, approvals
- **Automation/Agent Tool** — AI agents, bots, automated workflows
- **API/Backend Service** — APIs, microservices, integrations
- **AI-Powered Application** — LLM-based features, chat interfaces
- **Mobile Application** — iOS, Android, cross-platform apps
- **CLI Tool** — command-line utilities, developer tools, scripts
- **Browser Extension** — Chrome/Firefox extensions, content scripts

### Question Bank by Topic

These are the topics you need to cover. Pick questions adaptively based on what you've learned. You do NOT need to ask every question — skip what's already been answered or is irrelevant.

**Problem & Context** — WHY this tool needs to exist:
- What problem does this solve? Who has this problem today?
- Who will use this tool? (roles, skill level, frequency)
- How are they solving this problem today? What's painful about it?
- Is this internal (your team) or external (customers/public)?

**After covering Problem & Context**: Summarize the problem statement and personas back to the user. Confirm before proceeding.

**Core Functionality** — WHAT the tool does (features, not implementation):
- Walk me through the ideal workflow — what does the user do step by step?
- What are the 3-5 most important things this tool MUST do?
- What would be nice to have but not essential for v1?
- What should this tool explicitly NOT do?

**After covering Core Functionality**: List back the feature set organized by priority. Confirm.

**Data & Integration** — inputs, outputs, and external dependencies:
- What data goes IN? (file upload, API, database, user input, etc.)
- What comes OUT? (reports, exports, dashboards, notifications, etc.)
- Does it need to connect to any existing systems?
- Any sensitive data involved? (PII, financial, health)

**Users & Access** — who can do what:
- How many users? Single user, small team, or large org?
- Do different users need different permissions?
- How do users log in? (or is auth even needed?)
- Any specific UX requirements? (language, mobile, accessibility, dark mode)

**Technical Preferences** — SKIP for non-technical users:
- Only ask if user has demonstrated technical knowledge (mentions frameworks, APIs, deployment, etc.)
- If user is non-technical: **automatically use the Default Tech Stack below** without asking. Mention it briefly in the summary: "Em sẽ dùng bộ tech stack mặc định phù hợp cho dự án này nhé anh." — no need to explain each technology.
- If user IS technical: ask about tech stack preferences, deployment model, performance requirements, budget constraints. Still present the Default Tech Stack as the recommended starting point if they have no strong preference.

### Default Tech Stack (for non-technical users or when no preference stated)

When the user is non-technical, unfamiliar with tech choices, or says things like "tuỳ em", "em chọn giúp anh", "anh không rành technical" — use this stack automatically without asking for confirmation. All versions are latest stable, chosen for compatibility with each other:

| Layer | Technology | Details |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | Latest version, using App Router (not Pages Router) |
| **Routing** | React Router (hash history) | `createHashRouter` — hash-based routing for easy deployment, no server config needed |
| **UI Components** | shadcn/ui (built on Radix UI) | Latest version, copy-paste component library with full customization |
| **Styling** | Tailwind CSS | Latest version |
| **Database** | SQLite | Only include if the product needs persistent data storage |
| **ORM** | TypeORM | Auto-run migrations on app start (`migrationsRun: true`). Never use `synchronize: true` — it's unsafe for production data. Always generate and run migration files. |

**Important notes for the PRD:**
- In the Architecture section, specify `migrationsRun: true` and `synchronize: false` in TypeORM config
- For SQLite, specify the database file location (e.g., `./data/app.db`)
- React Router hash history means URLs look like `/#/dashboard` — this is intentional for simpler deployment (no need to configure server-side routing / rewrites)
- When both Next.js and React Router are in the stack, Next.js handles the app shell and SSR, while React Router (hash) manages client-side navigation within the SPA portions

**Success & Phasing** — what "done" looks like:
- How will you know this tool is successful? What metrics matter?
- What's the timeline expectation?
- What's the biggest risk? What could go wrong?
- Would you like to phase this into multiple releases?

### Summarize Between Topics

After covering each major topic, briefly summarize what you understood and ask the user to confirm before moving on. This catches misunderstandings early.

---

## Phase 3: SYNTHESIZE — Internal Processing (MANDATORY)

**You MUST run this checklist before generating the PRD. Do NOT skip it.**

After completing the interview, synthesize everything into the PRD structure. Before writing, verify internally:

**Completeness checklist (do NOT show to user, this is your internal check):**

- [ ] Can I write a 1-sentence problem statement?
- [ ] Can I name at least 1 user persona with role, skill, and goal?
- [ ] Do I have at least 3 P0 features clearly defined?
- [ ] Do I know what's IN scope and OUT of scope?
- [ ] Can I write at least 3 user stories with testable acceptance criteria (Given/When/Then)?
- [ ] Do I have enough info to decide a tech stack? (For non-technical users: auto-apply the Default Tech Stack from the Question Bank section — Next.js App Router, React Router hash, shadcn/ui, Tailwind, SQLite + TypeORM if DB needed)
- [ ] Do I know the deployment model? (or can I infer it from context — e.g., internal tool → on-premise or private cloud)
- [ ] Are there identified risks with actionable mitigations (not vague "handle errors")?
- [ ] Is there a phasing/milestone plan? (For Large projects: see "Large Project Phasing Strategy" — phases MUST be defined with clear priority ordering)
- [ ] Do I have user stories covering EVERY P0 feature?
- [ ] Do I have data model entities for every data-related feature mentioned?
- [ ] Did I read `interview-guide.md` for the relevant product type and check if I missed important questions?

**If any item fails:** Go back and ask the user specifically about that gap. Do NOT invent or assume critical requirements. Do NOT proceed to Phase 4 with gaps.

---

## Phase 4: DRAFT PRD — Generate the Document

Generate the PRD as a Markdown file following the template in `prd-template.md`. Read that file before writing.

**Key principles for the PRD output:**

1. **Agent-executable**: Every requirement must be specific enough that a coding agent can implement it without asking questions. Bad: "The UI should be nice." Good: "Dashboard uses a sidebar navigation with collapsible sections, dark/light mode toggle, built with Tailwind CSS."

2. **Testable acceptance criteria**: Every user story must have Given/When/Then criteria that a QA agent (or the user) can verify.

3. **No ambiguity in tech stack**: State exact frameworks, versions (if known), and architectural decisions with rationale.

4. **Explicit scope boundaries**: Clearly state what is OUT of scope to prevent scope creep by development agents.

5. **Consistent IDs**: Use sequential IDs (FR-01, NFR-01, US-01, R-01) so development agents can reference them.

6. **Data model must be concrete**: Include table names, key fields, relationships. Development agents need this to write migrations.

**Language rule**: Write the PRD in the same language the user has been using throughout the interview. Preserve technical terms (API, JWT, SSE, etc.) in English regardless of document language.

**Author field**: Use the name collected at the start of the interview. Never use generic placeholders like "Team nội bộ".

**Output format**: Save as `.md` file in the project root with naming convention `PRD_[Author Name]_[Project Name].md`. Rules: spaces → underscores, strip special characters, truncate each part to max 20 characters, total filename max 60 characters. Example: `PRD_Minh_Inventory_Dashboard.md`. If file already exists, append `_v2`, `_v3`, etc. Present to user after saving.

---

## Phase 5: DELIVER & OFFER REVIEW

After generating the PRD, present it to the user and offer to have an independent AI agent review it. Do NOT guide them through a section-by-section review yourself — the PRD is written for coding agents, not for users to audit.

1. Present the PRD file path and a brief summary of what's covered
2. Use `AskUserQuestion` to ask:
   - Question: "Anh muốn em gọi một agent độc lập lên review PRD này không?"
   - Options:
     - **"Review PRD"** — "Gọi agent khác đánh giá chất lượng PRD: completeness, clarity, testability, tính khả thi"
     - **"Bỏ qua, tiến tới plan"** — "PRD OK rồi, viết implementation plan luôn"
     - **"Chỉnh sửa trước"** — "Anh muốn sửa vài chỗ trước khi tiếp"
3. If user chooses **Review PRD**: Spawn an independent agent (using the `Agent` tool) with this prompt:
   ```
   You are a PRD reviewer. Read the PRD at [file path] and evaluate it on these criteria:

   1. **Completeness**: Are all essential sections present? Any gaps a developer would notice?
   2. **Clarity**: Are requirements specific enough for a coding agent to implement without asking questions?
   3. **Testability**: Do all user stories have concrete Given/When/Then acceptance criteria?
   4. **Consistency**: Do features, user stories, FRs, and data model all align? Any contradictions?
   5. **Feasibility**: Is the tech stack appropriate? Any unrealistic requirements?
   6. **Scope**: Is scope well-bounded? Are Out of Scope items reasonable?

   Output a structured review with:
   - Overall score (1-10)
   - Strengths (bullet points)
   - Issues found (categorized by severity: Critical / Warning / Suggestion)
   - Specific recommendations to fix each issue

   Write the review in the same language as the PRD.
   ```
   After the agent returns, present the review results to the user. If there are Critical or Warning issues, offer to fix them. Then ask again if they want to proceed to implementation plan.
4. If user chooses **Chỉnh sửa trước**: Apply changes, then re-offer the same 3 options.
5. If user chooses **Bỏ qua**: Proceed to next step planning.

### Transition to Implementation Plan

After the PRD is finalized (user is satisfied, review issues resolved), offer to create an implementation plan:

1. Use `AskUserQuestion` to ask:
   - Question: "PRD đã hoàn tất! Anh muốn làm gì tiếp theo?"
   - Options:
     - **"Viết Implementation Plan"** — "Em sẽ dựa trên PRD để tạo plan chi tiết cho dev agent thực thi từng bước"
     - **"Bắt đầu code luôn"** — "Dùng PRD này làm spec và bắt đầu implement ngay"
     - **"Xong rồi, cảm ơn"** — "Lưu PRD và kết thúc"
2. If user chooses **Viết Implementation Plan**: Use the `superpowers:writing-plans` skill (if available) with the PRD file as input context. The plan should reference PRD IDs (FR-01, US-01, etc.) so there's clear traceability.
3. If user chooses **Bắt đầu code luôn**: Confirm which phase/milestone to start with (reference the Development Roadmap section), then begin implementation following the PRD as the source of truth.

---

## Large Project Phasing Strategy

When a project is assessed as **Medium or Large** (5+ features, multiple concerns, or timeline > 2 weeks), the PRD must break the work into sequential phases. This ensures the team delivers value incrementally and avoids the risk of building everything at once.

### When to activate

Activate phased delivery when ANY of these are true:
- 5+ functional requirements identified
- 2+ distinct user personas with different needs
- External integrations or multiple data sources
- User mentions timeline > 2 weeks
- Scope feels more like a "product" than a "simple tool"

### How to phase

During the interview (Phase 2), once you detect a large project, ask the user to help prioritize:
- "Trong tất cả features anh vừa mô tả, nếu chỉ được chọn 3-5 features quan trọng nhất để ship trước, anh sẽ chọn gì?"
- "Feature nào cần có trước thì các features khác mới hoạt động được?" (to identify dependencies)

### Phase ordering principles

1. **Core value first**: Phase 1 must deliver the product's primary value proposition — the single most important thing the user described. If a user says "I need a dashboard that tracks X, manages Y, and exports Z", the tracking/dashboard is likely Phase 1.
2. **Dependencies drive order**: Features that other features depend on come first. Auth before permissions. Data model before analytics. Input before output.
3. **Risk reduction**: High-risk or uncertain features (AI integration, external APIs, novel UX) should be tackled early so problems surface before too much is built on top.
4. **User impact over technical elegance**: Prioritize features users interact with daily over admin/config features that are used once.

### PRD structure for phased projects

In the Development Roadmap (Section 12), structure phases like this:

```markdown
## 12. Development Roadmap

> **Phased delivery**: This project is delivered in [N] sequential phases.
> Each phase is a deployable increment that delivers user-visible value.
> Later phases build on earlier ones — do NOT start Phase N+1 before Phase N is complete and validated.

### Phase 1: [Theme] — Core Value (P0)
**Goal:** [What users can do after this phase]
**Timeline:** [Duration]
**Features:** FR-01, FR-02, FR-03, ...
**Exit criteria:** [How to know this phase is done and working]

### Phase 2: [Theme] — Enhanced Capabilities (P1)
**Depends on:** Phase 1 complete
**Goal:** [What new capabilities this adds]
...

### Phase 3: [Theme] — Scale & Polish (P2)
**Depends on:** Phase 2 complete
**Goal:** [What this rounds out]
...
```

### Key rules for phased PRDs

- Each phase must be **independently deployable** — users get value from Phase 1 alone, without waiting for Phase 2+
- User stories and FRs must be **tagged with their phase** (e.g., `[Phase 1]` prefix or a Phase column)
- The PRD still covers ALL phases in full detail, but phase boundaries make clear what to build first
- Phase 1 should be achievable in **2-4 weeks** for most projects — if it's longer, break it down further
- Include **exit criteria** per phase so the team knows when to move on

---

## Handling Edge Cases

| Situation | How to handle |
|-----------|---------------|
| User says "just build it, don't interview me" | Explain briefly that 10 minutes of questions now saves hours of rework. Offer a compressed 3-question version: (1) What problem? (2) Core features? (3) Tech preferences? |
| User provides an existing doc/spec | Read it, extract what you can, then interview only the gaps |
| User is non-technical | Skip technical questions entirely. **Auto-apply the Default Tech Stack** (Next.js App Router, React Router hash, shadcn/ui, Tailwind, SQLite + TypeORM if DB needed). Just inform them briefly: "Em sẽ chọn bộ công nghệ phù hợp nhé anh." Use simple language. Focus on workflow and outcomes. |
| User is a developer who knows exactly what they want | Minimize interview, confirm key decisions, jump to PRD generation quickly |
| User wants to update an existing PRD | Read the existing PRD, identify what's changed, update relevant sections only |
| Scope is massive (enterprise SaaS) | Apply "Large Project Phasing Strategy" — write one PRD covering all phases, with clear phase boundaries. For extremely large scope (50+ features), consider splitting into separate PRDs per module. |
| User gives conflicting requirements | Surface the conflict explicitly, help them decide, document the decision with rationale |

---

## Reference Files

| File | When to read | Content |
|------|-------------|---------|
| `prd-template.md` | **Always read before Phase 4** — contains the full PRD structure with section-by-section guidance | PRD document template with writing instructions per section |
| `interview-guide.md` | **Always read after classifying product type in Phase 2** — contains deep-dive questions per product archetype (Agent, CRUD, Analytics, API, AI-Powered) | Extended question bank organized by product type |

---

## Quality Bar for the Output PRD

The PRD is GOOD if a senior developer can read it and:
- Start coding within 30 minutes without asking clarifying questions
- Know exactly which endpoints to build, which tables to create
- Understand what "done" looks like for each feature
- Know what NOT to build

The PRD is BAD if:
- A developer reads it and asks "but what should happen when...?"
- Features are described in marketing language instead of functional specs
- Tech stack is mentioned but architecture decisions are not explained
- User stories exist but have no acceptance criteria
- Risks are listed but mitigations are vague or missing
