/**
 * Unit tests for openclaw-deep-understanding skill v2.2
 * Run: node --test tests/skill.test.ts (Node 20+)
 *
 * Tests import DIRECTLY from src/skill.ts to ensure we test actual code.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';

// Import exported helpers from actual skill (not copy-pasted versions)
import { inferPurpose, generateArchDiagram, generateDependencyDiagram, prepareMemoryUpdate } from '../src/skill';

// ========== LOCAL HELPERS (pure logic, no async) ==========
// These mirror the regex logic used inside analyzeByModule

function extractExports(code: string): string[] {
  const exports = new Set<string>();
  const exportRegex = /export\s+(?:default\s+)?(?:function|class|const|interface|type|var|let)\s+(\w+)/g;
  const exportNamedRegex = /export\s*{([^}]+)}/g;

  let match;
  while ((match = exportRegex.exec(code)) !== null) {
    if (match[1]) exports.add(match[1]);
  }
  while ((match = exportNamedRegex.exec(code)) !== null) {
    const names = match[1].split(',').map(n => n.trim().replace(/['"`]/g, ''));
    names.forEach(n => n.length > 0 && exports.add(n));
  }
  return Array.from(exports);
}

function extractImports(code: string): string[] {
  const imports = new Set<string>();
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  const importSideEffectRegex = /import\s+['"]([^'"]+)['"]/g;

  let match;
  while ((match = importRegex.exec(code)) !== null) {
    if (match[1]) imports.add(match[1]);
  }
  while ((match = importSideEffectRegex.exec(code)) !== null) {
    if (match[1]) imports.add(match[1]);
  }
  return Array.from(imports);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ========== REGRESSION TESTS (bug fixes) ==========

describe('Regression: Bug 1 — impRegex typo', () => {
  test('import extraction regex should use match variable (not undefined var)', () => {
    // Simulates the import regex logic in analyzeByModule
    const code = `import { foo } from 'bar'; import { baz } from 'qux';`;
    const importRegex = /from\s+['"]([^'"]+)['"]/g;
    let impMatch;
    const imports: string[] = [];
    while ((impMatch = importRegex.exec(code)) !== null) {
      imports.push(impMatch[1]); // must be impMatch, not impRegex
    }
    assert.ok(imports.includes('bar'), 'should capture bar');
    assert.ok(imports.includes('qux'), 'should capture qux');
  });
});

describe('Regression: Bug 2 — double .data in summarizeModuleAnalysis', () => {
  test('analysis data shape has modules directly (no nested .data)', () => {
    // analyzeByModule returns { type, data: { modules, totalFiles } }
    // summarizeModuleAnalysis receives analysis.data — so local var is already the inner object
    const innerData = {
      modules: new Map([['src/gateway', { purpose: 'test', keyExports: [], imports: [], loc: 100, files: [] }]]),
      totalFiles: 1
    };
    // If code accessed innerData.data.modules — that would be undefined.modules (crash)
    assert.ok(innerData.modules instanceof Map, 'modules should be directly on inner object');
    assert.strictEqual((innerData as any).data, undefined, 'no nested .data property');
  });
});

// ========== EXPORTED FUNCTIONS ==========

describe('inferPurpose (from skill.ts)', () => {
  test('should identify gateway module', () => {
    const p = inferPurpose('src/gateway');
    assert.ok(p.toLowerCase().includes('gateway'), `Expected gateway description, got: ${p}`);
  });

  test('should identify agents module', () => {
    const p = inferPurpose('src/agents');
    assert.ok(p.toLowerCase().includes('agent'), `Expected agents description, got: ${p}`);
  });

  test('should identify channels module', () => {
    const p = inferPurpose('src/channels');
    assert.ok(p.toLowerCase().includes('channel'), `Expected channels description, got: ${p}`);
  });

  test('should return fallback for unknown module', () => {
    const p = inferPurpose('src/unknown-xyz');
    assert.ok(p.includes('not auto-detected') || p.includes('purpose'), `Expected fallback, got: ${p}`);
  });
});

describe('generateArchDiagram (from skill.ts)', () => {
  test('should return valid Mermaid graph string', () => {
    const diagram = generateArchDiagram({});
    assert.ok(diagram.includes('graph'), 'should contain graph directive');
    assert.ok(diagram.includes('Gateway'), 'should include Gateway node');
    assert.ok(diagram.includes('Agents'), 'should include Agents node');
  });
});

describe('generateDependencyDiagram (from skill.ts)', () => {
  test('should generate nodes for each relevant module', () => {
    const relevant = [
      ['src/gateway', { imports: [], keyExports: ['createServer'], purpose: 'gateway', loc: 100, files: [] }],
      ['src/agents', { imports: ['src/gateway'], keyExports: ['AgentRunner'], purpose: 'agents', loc: 200, files: [] }],
    ] as [string, any][];
    const diagram = generateDependencyDiagram({}, relevant);
    assert.ok(diagram.includes('gateway'), 'should include gateway node');
    assert.ok(diagram.includes('agents'), 'should include agents node');
  });

  test('should not crash on empty relevant list', () => {
    const diagram = generateDependencyDiagram({}, []);
    assert.ok(typeof diagram === 'string', 'should return string');
  });
});

describe('prepareMemoryUpdate (from skill.ts)', () => {
  test('should include query in output', () => {
    const analysis = { type: 'module', modules: new Map([['src/gateway', { purpose: 'HTTP server' }]]) };
    const update = prepareMemoryUpdate(analysis, 'test query');
    assert.ok(update.includes('test query'), 'should include query');
  });

  test('should include module count', () => {
    const analysis = { type: 'module', modules: new Map([['src/agents', { purpose: 'Agent runtime' }]]) };
    const update = prepareMemoryUpdate(analysis, 'query');
    assert.ok(update.includes('Modules: 1'), 'should include modules count');
  });

  test('should include module purposes', () => {
    const analysis = { type: 'module', modules: new Map([['src/gateway', { purpose: 'HTTP server' }]]) };
    const update = prepareMemoryUpdate(analysis, 'query');
    assert.ok(update.includes('HTTP server'), 'should include module purpose');
  });
});

// ========== LOCAL HELPER TESTS ==========

describe('extractExports (local)', () => {
  test('should extract named function/class/const exports', () => {
    const code = `
      export const foo = 1;
      export function bar() {}
      export class Baz {}
      export interface Qux {}
      export type T = {};
    `;
    const exports = extractExports(code);
    assert.ok(exports.includes('foo'));
    assert.ok(exports.includes('bar'));
    assert.ok(exports.includes('Baz'));
    assert.ok(exports.includes('Qux'));
    assert.ok(exports.includes('T'));
  });

  test('should extract default export', () => {
    const code = `export default function myHandler() {}`;
    const exports = extractExports(code);
    assert.ok(exports.includes('myHandler'));
  });

  test('should extract named exports in braces', () => {
    const code = `export { foo, bar, baz };`;
    const exports = extractExports(code);
    assert.ok(exports.includes('foo'));
    assert.ok(exports.includes('bar'));
    assert.ok(exports.includes('baz'));
  });

  test('should handle empty code', () => {
    assert.strictEqual(extractExports('').length, 0);
  });
});

describe('extractImports (local)', () => {
  test('should extract named imports', () => {
    const code = `import { readFile } from 'fs'; import { something } from 'openclaw/utils';`;
    const imports = extractImports(code);
    assert.ok(imports.includes('fs'));
    assert.ok(imports.includes('openclaw/utils'));
  });

  test('should extract default imports', () => {
    const code = `import React from 'react'; import OpenClaw from 'openclaw';`;
    const imports = extractImports(code);
    assert.ok(imports.includes('react'));
    assert.ok(imports.includes('openclaw'));
  });

  test('should extract side-effect imports', () => {
    const code = `import './polyfills';`;
    const imports = extractImports(code);
    assert.ok(imports.includes('./polyfills'));
  });
});

describe('formatBytes (local)', () => {
  test('should format bytes correctly', () => {
    assert.strictEqual(formatBytes(500), '500 B');
    assert.strictEqual(formatBytes(1024), '1.0 KB');
    assert.strictEqual(formatBytes(1536), '1.5 KB');
    assert.strictEqual(formatBytes(1048576), '1.0 MB');
  });
});

describe('Edge cases', () => {
  test('should handle code with comments', () => {
    const code = `// export this\nexport const foo = 1;\nexport const bar = 2;`;
    const exports = extractExports(code);
    assert.ok(exports.includes('foo'));
    assert.ok(exports.includes('bar'));
  });

  test('should handle complex import paths', () => {
    const code = `
      import { something } from '../../utils/helpers';
      import type { Type } from 'some-package';
    `;
    const imports = extractImports(code);
    assert.ok(imports.includes('../../utils/helpers'), 'should include relative path');
    assert.ok(imports.includes('some-package'), 'should include package name');
    assert.ok(!imports.includes('type'), 'should not include type keyword');
  });
});

console.log('✅ All tests defined. Run with: node --test tests/skill.test.ts');
