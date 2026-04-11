---
name: design-consolidate
description: "(Designer) Consolidate Source GDD + server code extraction + optional refs into enriched consolidated-gdd.md under docs/runs/<feature_id>/..."
disable-model-invocation: true
argument-hint: "<feature_id> --gdd <source_gdd_path> [--refs <path1,path2,...>]"
---

# Design Consolidate Skill

## Intent Layer

| Field | Content |
|-------|---------|
| **Role** | Designer (Consolidation) |
| **Goal** | Merge Source GDD with auto-extracted server code (CMD IDs, data models, routing) and optional reference files into a single consolidated GDD ready for `design-ingest` |
| **Use when** | A Designer has written a Source GDD and you need to enrich it with server API data before running the design pipeline |
| **Constraints** | Read-only on Source GDD — never modify the original file. Only ADD sections (Data Models, API Reference), never modify Designer-written content. Server extraction limited to: CMD definitions, data models, handler routing — no business logic. |
| **Anti-patterns** | Resolving conflicts (that is `design-doc`'s job); adding Architecture sections (that is `dev-analyze`'s job); adding Showcase/Test sections (that is `dev-specs`'s job); modifying the source GDD file |
| **Quality standard** | `consolidated-gdd.md` must be self-contained — a reader should understand the feature without opening other files. All auto-extracted sections marked with `<!-- auto-extracted from server code -->`. |
| **Output format** | Vietnamese (keep technical terms/keywords in English) |

---

## Knowledge Layer

**Required reads (before execution):**
- The Source GDD file (path from `--gdd` argument)
- `tools/scaffold_run.py` — to create run folder

**Auto-discover reads (server code via GitNexus):**
- `serverccn2/src/main/kotlin/org/ccn2/modules/CmdDefine.kt` — CMD ID definitions
- `serverccn2/src/main/kotlin/org/ccn2/modules/<feature>/cmd/` — Request/Response classes
- `serverccn2/src/main/kotlin/org/ccn2/` — data model classes (`*Item.kt`, `Stored*.kt`)
- Handler routing files (`*RequestHandler.kt`)

**Optional reads (from `--refs` or auto-scan):**
- `shared/concepts/<feature>/` — UI specs, screenshots, reference docs
- `shared/godot-client/docs/design/<feature>/` — balance CSV, profiles, existing design docs

**Pattern reference (how character module did it):**
- `shared/concepts/character/gdd-character.md` — example output
- `docs/runs/002-character/20260407_1814_step1_ingest/source-manifest.md` — example source index

---

## Execution Layer

### Pre-flight

1. `python tools/scaffold_run.py <feature_id> consolidate`
   Creates run folder + `input.md`. Note the path.
2. Verify `--gdd <path>` file exists. If not → error and stop.

### Phase 1 — Parse Source GDD

1. Read the Source GDD file completely.
2. Extract metadata: title, author, version, date, related docs.
3. Identify existing sections (map to standard GDD structure: Overview, Tier/Stats, Skills, Economy, UX, etc.).
4. Note which sections are MISSING that server code could provide (typically: Data Models, API Reference).

### Phase 2 — Auto-discover server code

Use GitNexus to find relevant server code for this feature:

```
Step 2a: Extract feature keywords from GDD title + section headers.
         Example: "Character System" → keywords: ["character", "upgrade", "enlightenment"]

Step 2b: Query CmdDefine.kt for matching CMD entries:
         gitnexus_query({query: "<keyword> CMD", repo: "serverccn2"})
         OR grep CmdDefine.kt for keyword matches.
         Extract: CMD ID, name, request class, response class.

Step 2c: For each discovered CMD, find Request/Response classes:
         gitnexus_context({name: "ReqClassName"}) → read fields
         gitnexus_context({name: "ResClassName"}) → read fields

Step 2d: Find data model classes:
         Search for *Item.kt, Stored*.kt matching feature keywords.
         gitnexus_context({name: "FeatureItem"}) → read fields

Step 2e: Find handler routing:
         Search *RequestHandler.kt for CMD routing.
```

Write results to `server-extract.md`:
```markdown
# Server Code Extraction — <feature_id>

## CMD Definitions (from CmdDefine.kt)
| CMD ID | Name | Request Class | Response Class |
|--------|------|---------------|----------------|
| ... | ... | ... | ... |

## Data Models
### <ModelName> (from <file.kt>)
| Field | Type | Notes |
|-------|------|-------|
| ... | ... | ... |

## Handler Routing
| CMD | Handler | Notes |
|-----|---------|-------|
| ... | ... | ... |
```

### Phase 3 — Collect optional refs

1. If `--refs` provided → read each path, add to source index.
2. If no `--refs` → auto-scan:
   - `shared/concepts/<feature_slug>/` — list all files
   - `shared/godot-client/docs/design/*<feature_slug>*/` — list all files
3. For each found file: record path, type (doc/data/image), brief summary.

### Phase 4 — Merge & enrich

1. Copy Source GDD content as backbone of `consolidated-gdd.md`.
2. If GDD lacks `## Data Models` section → inject from `server-extract.md`:
   ```markdown
   <!-- auto-extracted from server code -->
   ## Data Models
   [content from server-extract.md Data Models section]
   ```
3. If GDD lacks `## API Reference` section → inject from `server-extract.md`:
   ```markdown
   <!-- auto-extracted from server code -->
   ## API Reference
   [content from server-extract.md CMD Definitions + routing]
   ```
4. If GDD already has these sections → append server data as subsection for cross-reference, do NOT overwrite.
5. Append a `## Sources` section listing all sources used (from source-index.md).

### Phase 5 — Conflict detection

Compare GDD content with server extraction:
- GDD mentions API/CMDs? Compare with actual CmdDefine entries.
- GDD mentions data fields? Compare with actual model fields.
- GDD mentions stats/values? Flag for later verification against balance data.

Write conflicts to `notes.md` — do NOT resolve them. Format:
```markdown
### Conflicts
| # | GDD says | Server code says | Severity |
|---|----------|-----------------|----------|
| C-01 | ... | ... | high/med/low |

### Open Questions (preliminary)
| # | Question | Needs answer from |
|---|---------|-------------------|
| OQ-01 | ... | Designer / Dev |
```

### Output files

Write to `docs/runs/<feature_id>/<ts>_consolidate/`:

1. **`consolidated-gdd.md`** (REQUIRED) — enriched GDD
2. **`source-index.md`** (REQUIRED) — all sources with paths and hashes
3. **`server-extract.md`** (optional) — raw server extraction
4. **`notes.md`** (optional) — conflicts, preliminary OQs, decisions

### Post-flight

Print summary:
```
✅ Consolidation complete for <feature_id>
   Sources: N files indexed
   Server CMDs: N found
   Data models: N extracted
   Conflicts: N detected
   Output: docs/runs/<feature_id>/<ts>_consolidate/
```
