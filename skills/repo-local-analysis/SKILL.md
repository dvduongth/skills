---
name: repo-local-analysis
description: |
  Analyze local software repositories to understand architecture, technologies, and structure.

  Use this skill whenever you need to:
  - Analyze a repository that's already cloned on the local machine
  - Understand project architecture and module structure
  - Detect technologies, frameworks, and dependencies
  - Extract key information from README, package.json, Dockerfile, etc.
  - Generate comprehensive repository analysis reports
  - Map out codebase organization and design patterns

  Perfect for developers learning codebases, architects understanding project structure,
  teams onboarding new members, or researchers studying code organization patterns.
  Trigger whenever user mentions "analyze this repo", "understand the codebase structure",
  "generate architecture report", "what's in this project", or provides a local repository path.

compatible-tools:
  - Glob (scan files and folders)
  - Grep (search code patterns)
  - Read (examine source files)
  - Bash (filesystem operations)

tags:
  - code-analysis
  - architecture
  - repository
  - software-engineering
  - automation
  - documentation

---

# Local Repository Analysis Skill

## Overview

This skill enables systematic analysis of software repositories on the local filesystem, extracting architectural insights, technology stack information, and module structure without network access or web crawling.

The workflow consists of 6 steps:
1. **Receive Input** — Local repository path
2. **Scan Structure** — Map folders and files
3. **Detect Technologies** — Identify languages, frameworks, build tools
4. **Parse Key Files** — Extract info from README, package.json, Dockerfile, etc.
5. **Analyze Architecture** — Understand modules, services, API structure
6. **Generate Report** — Create structured Markdown analysis

---

## When to Use This Skill

- User provides a **local repository path** (not a URL)
- User wants to **understand project structure** and architecture
- User needs to **document a codebase** (for onboarding or reference)
- User wants **technology stack detection** for an existing project
- User needs **architectural overview** of a local project
- User is **refactoring** or **planning upgrades** to a project
- User wants to **audit code organization** (folder structure, naming conventions)

**Key contexts**:
- "Analyze the CCN2 codebase"
- "Generate architecture report for this project"
- "What's the structure of /repos/my-project?"
- "Understand how bienniensuviet is organized"
- "Map out the modules in this repository"
- "Create a technical overview of the server code"

---

## Analysis Workflow

### Phase 1: Input & Preparation
1. **Receive repository path**: User provides local filesystem path
   - Examples: `D:\PROJECT\CCN2\clientccn2\`, `./bienniensuviet/`, `/repos/game-server/`
2. **Validate path exists**: Check directory is accessible
3. **Ask for context** (if needed):
   - What aspects to focus on? (architecture / tech stack / modules / all)
   - Audience level? (overview / technical deep-dive)
   - Output format? (quick summary / comprehensive report)

### Phase 2: Structure Scanning
1. **List directory tree**: Use Glob to map all folders and files
   - Identify key directories: `src/`, `lib/`, `tests/`, `docs/`, `config/`, `scripts/`
   - Count files by extension to understand language distribution
2. **Detect ignored paths**: Skip `.git/`, `node_modules/`, `build/`, `.venv/`, etc.
3. **Map project layout**:
   ```
   project/
   ├── src/
   ├── test/
   ├── docs/
   ├── config/
   ├── scripts/
   └── package.json
   ```

### Phase 3: Technology Detection
1. **Detect languages** from file extensions:
   - JavaScript/TypeScript: `.js`, `.ts`, `.jsx`, `.tsx`
   - Python: `.py`
   - Java/Kotlin: `.java`, `.kt`
   - C#: `.cs`
   - Go: `.go`
   - Rust: `.rs`
   - HTML/CSS: `.html`, `.css`, `.scss`
2. **Detect frameworks** from key files:
   - `package.json` → Node.js, React, Vue, Next.js, Express, etc.
   - `requirements.txt` or `setup.py` → Python frameworks
   - `pom.xml` → Java/Maven
   - `build.gradle` → Gradle
   - `Dockerfile` → Containerization
   - `tsconfig.json` → TypeScript
3. **Detect build tools**:
   - npm, yarn, pnpm (Node.js)
   - gradle, maven (Java)
   - pip, poetry (Python)
   - cargo (Rust)
   - Make, CMake, Bazel
4. **Detect databases** from code/config:
   - PostgreSQL, MySQL, MongoDB, Redis, etc.
5. **Detect CI/CD**:
   - GitHub Actions (`.github/workflows/`)
   - GitLab CI (`.gitlab-ci.yml`)
   - Jenkins, CircleCI, Travis CI configs

### Phase 4: Parse Key Files
Read and extract information from critical files:

**Configuration files**:
- `package.json` — NPM scripts, dependencies, version
- `requirements.txt` or `setup.py` — Python dependencies
- `pom.xml` — Maven configuration
- `build.gradle` — Gradle configuration
- `Dockerfile` — Container setup, base image, ports
- `.env.example` — Environment variables (never read actual `.env`)

**Documentation files**:
- `README.md` — Project purpose, setup instructions, main features
- `CONTRIBUTING.md` — Development guidelines
- `Architecture.md` or `DESIGN.md` — Architecture decisions
- `API.md` or similar — API documentation

**Source files** (selective sampling):
- Entry points: `main.js`, `index.ts`, `App.tsx`, `main.py`, etc.
- Package/module lists: top-level imports to understand dependencies
- Test files: understand testing approach

### Phase 5: Analyze Architecture
1. **Identify modules/packages**:
   ```
   src/
   ├── api/          → API endpoints/controllers
   ├── services/     → Business logic
   ├── models/       → Data models
   ├── utils/        → Utilities
   ├── config/       → Configuration
   └── types/        → TypeScript types
   ```

2. **Infer layered architecture**:
   - Presentation layer (UI/views)
   - Application/Business layer (services, controllers)
   - Data layer (models, database)
   - Infrastructure layer (config, utilities)

3. **Identify design patterns**:
   - MVC / MVVM / MVP
   - Monolithic vs Microservices
   - Plugin architecture
   - Factory, Singleton, Observer patterns

4. **Map dependencies**:
   - Which modules depend on which?
   - External dependencies and their purposes
   - Core vs utility libraries

5. **Identify features/domains**:
   - Feature-based organization (features/auth, features/payment, etc.)
   - Domain-driven design (domains/user, domains/product, etc.)

### Phase 6: Generate Markdown Report
Create a comprehensive analysis report covering all aspects discovered.

---

## Report Content Structure

### Header Section
```markdown
# Repository Analysis Report

**Repository Path**: [local path]
**Analysis Date**: [YYYY-MM-DD]
**Project Type**: [type detected]
```

### 1. Overview
- **Purpose**: What is this project for?
- **Description**: 1-2 paragraph summary from README or code analysis
- **Status**: Active/Archived/Experimental
- **Key Contributors/Owner**: If evident from code/docs

### 2. Technologies Detected

| Category | Technologies |
|----------|---------------|
| **Languages** | JavaScript, TypeScript, Python |
| **Frameworks** | React, Express.js, FastAPI |
| **Databases** | PostgreSQL, Redis |
| **Build Tools** | npm, webpack, Docker |
| **Testing** | Jest, Pytest, Vitest |
| **CI/CD** | GitHub Actions, GitLab CI |
| **Other** | [Any notable technologies] |

### 3. Repository Structure

```
project-name/
├── src/
│   ├── api/                 # REST endpoints
│   ├── services/            # Business logic
│   ├── models/              # Data models
│   ├── components/          # React components
│   └── utils/               # Utility functions
├── tests/                   # Test files
├── docs/                    # Documentation
├── config/                  # Configuration files
├── scripts/                 # Build/deployment scripts
├── docker/                  # Docker configurations
├── package.json             # Dependencies
├── README.md                # Project guide
└── .github/workflows/       # CI/CD pipelines
```

**Key directories**:
- `src/` or `lib/`: Source code
- `tests/` or `__tests__/`: Test files
- `docs/`: Documentation
- `config/`: Configuration
- `.github/`: GitHub-specific files

### 4. Core Modules & Architecture

| Module | Description | Responsibility |
|--------|-------------|-----------------|
| **api** | REST endpoints | Handle HTTP requests |
| **services** | Business logic | Core application logic |
| **models** | Data structures | Database models, types |
| **auth** | Authentication | User login, tokens |
| **utils** | Helper functions | Shared utilities |

**Architecture Pattern**: [MVC / MVVM / Microservices / etc.]

**Layer Overview**:
```
┌─────────────────────────┐
│   Presentation (UI)     │  React, Vue, templates
├─────────────────────────┤
│  Application/Services   │  Business logic, controllers
├─────────────────────────┤
│    Data/Models          │  Databases, ORM, queries
├─────────────────────────┤
│   Infrastructure        │  Config, utilities, logging
└─────────────────────────┘
```

### 5. Key Files & Documentation

| File | Purpose | Key Info |
|------|---------|----------|
| `README.md` | Project overview | Setup, features |
| `package.json` | Dependencies | npm packages, scripts |
| `Dockerfile` | Containerization | Base image, ports |
| `src/main.ts` | Entry point | Application initialization |
| `.env.example` | Environment | Required env variables |

### 6. Dependencies & Integrations

**Direct Dependencies** (from package.json/requirements.txt):
- Framework: [version and purpose]
- Database: [type and version]
- Utilities: [key libraries]

**External Integrations** (from code analysis):
- APIs called: [list of external APIs]
- Services: [any microservices]
- Databases: [connection info from config]

### 7. Code Organization & Patterns

**Naming Conventions**:
- Folders: [kebab-case / snake_case / camelCase]
- Files: [PascalCase / camelCase / kebab-case]
- Functions: [camelCase / snake_case]

**Design Patterns Detected**:
- MVC components in [folder]
- Factory pattern in [folder]
- Observer pattern in [file]

**Testing Approach**:
- Framework: [Jest/Pytest/Mocha/etc.]
- Coverage: [estimated or from reports]
- Test location: [structure of test files]

### 8. Configuration Management

**Environment Variables** (.env):
```
REQUIRED:
- DATABASE_URL
- API_KEY
- PORT

OPTIONAL:
- DEBUG_MODE
- LOG_LEVEL
```

**Build Configuration**:
- Build tool: [webpack/vite/gradle/etc.]
- Output: [build/ or dist/]
- Scripts: `npm run build`, `npm run dev`

### 9. Deployment & DevOps

**Containerization**:
- Dockerfile: [location and base image]
- Docker Compose: [if exists]
- Container registry: [if evident]

**CI/CD Pipeline**:
- Tool: [GitHub Actions / GitLab CI / Jenkins]
- Triggers: [on push / on PR / scheduled]
- Steps: [build, test, deploy]

**Deployment Targets**:
- Development: [where deployed]
- Production: [where deployed]
- Infrastructure: [AWS / GCP / self-hosted]

### 10. Notable Observations

**Strengths**:
- Well-organized folder structure
- Comprehensive test coverage
- Good documentation

**Areas for Improvement**:
- [Missing tests for service layer]
- [Could use stricter TypeScript config]
- [Documentation could be more detailed]

**Code Quality**:
- Linting: [eslint / pylint configured?]
- Formatting: [prettier / black configured?]
- Type checking: [TypeScript / mypy?]

### 11. Getting Started

**Development Setup**:
```bash
git clone [repo]
cd [project]
npm install          # or: pip install -r requirements.txt
npm run dev          # or: python main.py
```

**Build & Deploy**:
```bash
npm run build        # Compile source
npm run test         # Run tests
docker build -t [app] .
docker run -p 3000:3000 [app]
```

### 12. Recommendations & Next Steps

- **For new developers**: Start by reading [README section], then explore [main file]
- **For contributors**: See [CONTRIBUTING.md] and follow [naming conventions]
- **For deployment**: Use [Dockerfile / deployment guide]
- **For scaling**: Consider [refactoring suggestions]

---

## Quality Checklist

Before finalizing the report:

- ✅ All major directories are documented
- ✅ Technology stack is accurate and complete
- ✅ Architecture is clearly explained
- ✅ Setup instructions are clear
- ✅ Key files are identified and described
- ✅ Dependency relationships are mapped
- ✅ Recommendations are specific and actionable
- ✅ Report is understandable for the target audience

---

## Analysis Tips & Best Practices

**Do's**:
- Read README.md first for context
- Use Glob to get complete directory listing
- Analyze package.json/requirements.txt for full dependency list
- Examine entry point files (main.js, index.ts, etc.)
- Look for `src/` as primary source location
- Check for tests to understand testing patterns

**Don'ts**:
- Don't read `.env` files (sensitive data)
- Don't execute any code
- Don't modify any files
- Don't make assumptions about undocumented code
- Don't ignore the README

**Output Quality**:
- Explain architecture clearly with diagrams if needed
- Provide specific file paths and examples
- Use tables for structured information
- Include code snippets for clarity
- Make recommendations actionable

---

## Examples

### Example 1: React TypeScript Web App
**Input**: `/repos/my-web-app/`
**Output**: Analyzes React components, TypeScript types, state management, API integration

### Example 2: Python Flask Backend
**Input**: `/workspace/api-server/`
**Output**: Identifies Flask routes, database models, authentication, API endpoints

### Example 3: Game Server (Kotlin/Ktor)
**Input**: `D:\PROJECT\CCN2\serverccn2\`
**Output**: Maps game rooms, database schema, multiplayer logic, configuration management

### Example 4: Full-Stack Monorepo
**Input**: `D:\PROJECT\CCN2\`
**Output**: Analyzes client, server, and demo projects with cross-project dependencies

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Path doesn't exist | Verify absolute path is correct |
| Missing README | Use code analysis to infer purpose |
| No package.json | Check for requirements.txt, pom.xml, or Cargo.toml |
| Massive codebase | Focus on src/ directory and key modules |
| Unclear structure | Analyze entry points and imports |
| Mixed languages | Analyze each language section separately |

---

## Safety & Best Practices

**ALWAYS**:
- Operate in read-only mode
- Respect file permissions
- Skip .git, node_modules, build artifacts
- Ignore .env and secret files
- Use Glob/Read for filesystem access

**NEVER**:
- Execute code from the repository
- Modify any files
- Access sensitive data or secrets
- Make destructive changes
- Assume security practices without evidence

---

