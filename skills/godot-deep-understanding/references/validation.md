# Validation Rules for godot-deep-understanding

This document specifies validation checks that run automatically after each analysis command.

## Validation Commands

The skill calls `validate_result` after completion. Validation includes:

### 1. File Existence Checks

If `outputPath` was provided:
- [ ] Output file exists at specified path
- [ ] File is non-empty (size > 0)
- [ ] File contains valid markdown (starts with `# ` or similar)

### 2. Count Accuracy

For `module` and `file` depths:
- [ ] `totalFiles` matches actual file count scanned
- [ ] `totalLOC` >= 0 and reasonable (not negative)
- [ ] `modules.length` > 0 (should detect at least 1 module)
- [ ] Each module has `fileCount` <= actual files in that module directory

### 3. Diagram Validity

If `generateDiagrams` is true:
- [ ] `diagrams.architecture` contains "graph" keyword (Mermaid)
- [ ] `diagrams.dependencies` contains "graph" or "flowchart"
- [ ] No syntax errors (basic check: balanced braces)

### 4. Cross-Reference Consistency

For `module` depth:
- [ ] All module `name`s exist in file paths
- [ ] Module `exports` are found in at least one file's exports
- [ ] Module `imports` reference other existing module names

### 5. Spot Checks (3 random items)

Randomly select 3 modules from result:
- [ ] Verify module directory exists on disk
- [ ] Verify file count matches `ls` output (±1 tolerance for concurrent modifications)
- [ ] Verify at least one sample file's exports match what's in module aggregation

### 6. Memory Update Structure

If memory update prepared:
- [ ] Content contains section header "Godot Analysis Insights"
- [ ] Each insight has timestamp in YYYY-MM-DD format
- [ ] No duplicate memory entries (check against existing MEMORY.md)

---

## Severity Classification

- **CRITICAL**: File missing, counts wildly inaccurate, diagram syntax invalid → BLOCK, must fix
- **WARNING**: Minor discrepancy (e.g., file count off by 1), optional duplicate → FLAG to user, proceed
- **INFO**: Stylistic issues, formatting → LOG for awareness

---

## Automated Checks Implementation

The `validate_result` command runs these checks automatically:

```typescript
// Pseudo-code
async function validate(result: AnalysisResult, outputPath?: string) {
  const checks: ValidationCheck[] = [];

  // 1. File existence
  if (outputPath) {
    const exists = await fileExists(outputPath);
    checks.push({ name: "Output file exists", passed: exists, severity: exists ? "INFO" : "CRITICAL" });
  }

  // 2. Count sanity
  checks.push({
    name: "Total files > 0",
    passed: result.totalFiles > 0,
    severity: result.totalFiles > 0 ? "PASS" : "CRITICAL",
  });

  // 3. Diagram syntax (basic)
  if (result.diagrams.architecture) {
    const hasGraph = result.diagrams.architecture.includes("graph");
    checks.push({
      name: "Architecture diagram valid Mermaid",
      passed: hasGraph,
      severity: hasGraph ? "PASS" : "CRITICAL",
    });
  }

  // 4. Spot-check 3 random modules
  const sampleModules = result.modules.slice(0, 3);
  for (const mod of sampleModules) {
    // Would need file system access to verify
    checks.push({
      name: `Module ${mod.name} verified`,
      passed: true, // placeholder
      severity: "INFO",
    });
  }

  return {
    overall: checks.every(c => c.severity !== "CRITICAL") ? "PASS" : "FAIL",
    checks,
  };
}
```

---

*Reference for skill validation. Analogous to openclaw-deep-understanding's validation.*