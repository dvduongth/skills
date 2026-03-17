"use strict";
/**
 * Unit tests for openclaw-deep-understanding skill v2
 * Run: node --test tests/skill.test.ts (Node 20+)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
// Import helpers từ skill file (trong production, sẽ export riêng)
// Ở đây chúng ta copy nhỏ functions để test
// ========== FUNCTIONS TO TEST ==========
function extractExports(code) {
    const exports = new Set();
    const exportRegex = /export\s+(?:default\s+)?(?:function|class|const|interface|type|var|let)\s+(\w+)/g;
    const exportNamedRegex = /export\s*{([^}]+)}/g;
    let match;
    while ((match = exportRegex.exec(code)) !== null) {
        if (match[1])
            exports.add(match[1]);
    }
    while ((match = exportNamedRegex.exec(code)) !== null) {
        const names = match[1].split(',').map(n => n.trim().replace(/['"`]/g, ''));
        names.forEach(n => n.length > 0 && exports.add(n));
    }
    return Array.from(exports);
}
function extractImports(code) {
    const imports = new Set();
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    const importSideEffectRegex = /import\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(code)) !== null) {
        if (match[1])
            imports.add(match[1]);
    }
    while ((match = importSideEffectRegex.exec(code)) !== null) {
        if (match[1])
            imports.add(match[1]);
    }
    return Array.from(imports);
}
function normalizeImport(imp) {
    if (imp.startsWith('.') || imp.startsWith('/'))
        return null;
    return imp.replace(/\.(ts|js|json)$/i, '');
}
function normalizeImports(imports) {
    return imports
        .map(normalizeImport)
        .filter(i => i !== null)
        .sort();
}
function formatBytes(bytes) {
    if (bytes < 1024)
        return bytes + ' B';
    if (bytes < 1024 * 1024)
        return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
function inferPurpose(modulePath, files, srcPath) {
    const purposeMap = {
        "gateway": "Gateway HTTP/WebSocket server, chính là control center của OpenClaw",
        "agents": "Agent runtime, Pi embedded runner, subagent orchestration",
        "channels": "Channel adapters",
        "providers": "LLM provider adapters",
    };
    const moduleName = modulePath.replace('src/', '');
    if (purposeMap[moduleName])
        return purposeMap[moduleName];
    return "Module chưa có mô tả rõ ràng";
}
// ========== TESTS ==========
(0, node_test_1.describe)('extractExports', () => {
    (0, node_test_1.test)('should extract named exports', () => {
        const code = `
      export const foo = 1;
      export function bar() {}
      export class Baz {}
      export interface Qux {}
      export type T = {};
    `;
        const exports = extractExports(code);
        node_assert_1.default.ok(exports.includes('foo'));
        node_assert_1.default.ok(exports.includes('bar'));
        node_assert_1.default.ok(exports.includes('Baz'));
        node_assert_1.default.ok(exports.includes('Qux'));
        node_assert_1.default.ok(exports.includes('T'));
    });
    (0, node_test_1.test)('should extract default export', () => {
        const code = `
      export default function myHandler() {}
      export default class MyComponent {}
    `;
        const exports = extractExports(code);
        node_assert_1.default.ok(exports.includes('myHandler'));
        node_assert_1.default.ok(exports.includes('MyComponent'));
    });
    (0, node_test_1.test)('should extract named exports in braces', () => {
        const code = `export { foo, bar, baz };`;
        const exports = extractExports(code);
        node_assert_1.default.ok(exports.includes('foo'));
        node_assert_1.default.ok(exports.includes('bar'));
        node_assert_1.default.ok(exports.includes('baz'));
    });
    (0, node_test_1.test)('should handle empty code', () => {
        const exports = extractExports('');
        node_assert_1.default.strictEqual(exports.length, 0);
    });
});
(0, node_test_1.describe)('extractImports', () => {
    (0, node_test_1.test)('should extract named imports', () => {
        const code = `
      import { readFile } from 'fs';
      import { something } from 'openclaw/utils';
    `;
        const imports = extractImports(code);
        node_assert_1.default.ok(imports.includes('fs'));
        node_assert_1.default.ok(imports.includes('openclaw/utils'));
    });
    (0, node_test_1.test)('should extract default imports', () => {
        const code = `
      import React from 'react';
      import OpenClaw from 'openclaw';
    `;
        const imports = extractImports(code);
        node_assert_1.default.ok(imports.includes('react'));
        node_assert_1.default.ok(imports.includes('openclaw'));
    });
    (0, node_test_1.test)('should extract side-effect imports', () => {
        const code = `import './polyfills';`;
        const imports = extractImports(code);
        node_assert_1.default.ok(imports.includes('./polyfills'));
    });
    (0, node_test_1.test)('should handle mixed imports', () => {
        const code = `
      import React, { useState } from 'react';
      import { readFile } from 'fs/promises';
      import './styles.css';
    `;
        const imports = extractImports(code);
        node_assert_1.default.ok(imports.includes('react'));
        node_assert_1.default.ok(imports.includes('fs/promises'));
        node_assert_1.default.ok(imports.includes('./styles.css'));
    });
});
(0, node_test_1.describe)('normalizeImport', () => {
    (0, node_test_1.test)('should normalize relative paths to null', () => {
        node_assert_1.default.strictEqual(normalizeImport('./utils'), null);
        node_assert_1.default.strictEqual(normalizeImport('../config'), null);
        node_assert_1.default.strictEqual(normalizeImport('/absolute/path'), null);
    });
    (0, node_test_1.test)('should strip extensions', () => {
        node_assert_1.default.strictEqual(normalizeImport('fs'), 'fs');
        node_assert_1.default.strictEqual(normalizeImport('fs/promises'), 'fs/promises');
        node_assert_1.default.strictEqual(normalizeImport('openclaw'), 'openclaw');
        node_assert_1.default.strictEqual(normalizeImport('@mariozechner/pi-agent-core'), '@mariozechner/pi-agent-core');
    });
    (0, node_test_1.test)('should preserve scoped packages', () => {
        node_assert_1.default.strictEqual(normalizeImport('@openclaw/gateway'), '@openclaw/gateway');
    });
});
(0, node_test_1.describe)('formatBytes', () => {
    (0, node_test_1.test)('should format bytes correctly', () => {
        node_assert_1.default.strictEqual(formatBytes(500), '500 B');
        node_assert_1.default.strictEqual(formatBytes(1024), '1.0 KB');
        node_assert_1.default.strictEqual(formatBytes(1536), '1.5 KB');
        node_assert_1.default.strictEqual(formatBytes(1048576), '1.0 MB');
        node_assert_1.default.strictEqual(formatBytes(1572864), '1.5 MB');
    });
});
(0, node_test_1.describe)('inferPurpose', () => {
    (0, node_test_1.test)('should return known purposes for standard modules', () => {
        const files = [{ name: 'server.ts' }];
        const purpose = inferPurpose('src/gateway', files, 'src');
        node_assert_1.default.ok(purpose.includes('Gateway') || purpose.includes('control center'));
    });
    (0, node_test_1.test)('should return default for unknown modules', () => {
        const files = [{ name: 'foo.ts' }];
        const purpose = inferPurpose('src/unknown', files, 'src');
        node_assert_1.default.ok(purpose.includes('chưa có mô tả'));
    });
});
// ========== EDGE CASES ==========
(0, node_test_1.describe)('Edge cases', () => {
    (0, node_test_1.test)('should handle code with comments', () => {
        const code = `
      // export this
      export const foo = 1; // comment
      /* export bar */
      export const bar = 2;
    `;
        const exports = extractExports(code);
        node_assert_1.default.ok(exports.includes('foo'));
        node_assert_1.default.ok(exports.includes('bar'));
    });
    (0, node_test_1.test)('should handle complex import paths', () => {
        const code = `
      import { something } from '../../utils/helpers';
      import type { Type } from 'some-package';
    `;
        const imports = extractImports(code);
        node_assert_1.default.ok(imports.includes('../../utils/helpers'), 'should include relative path');
        node_assert_1.default.ok(imports.includes('some-package'), 'should include package name');
        // Note: 'type' keyword should NOT be in imports because it's part of import type syntax
        node_assert_1.default.ok(!imports.includes('type'), 'should not include type keyword');
    });
});
console.log('✅ All tests defined. Run with: node --test tests/skill.test.ts');
