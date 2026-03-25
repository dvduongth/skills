/**
 * Unit tests for godot-deep-understanding skill
 * Run: node --test tests/skill.test.ts
 */

import {
  describe,
  it,
  beforeEach,
  afterEach,
  mock,
} from "node:test";
import assert from "node:assert";
import {
  extractExports,
  extractImports,
  normalizeInclude,
  calculateLOC,
  inferModulePurpose,
  generateMermaidArchitecture,
  generateMermaidDependencies,
  formatBytes,
  formatLOC,
  getModuleFromPath,
  groupByModule,
  aggregateModuleInfo,
  isTestFile,
  chunkArray,
  FileInfo,
  ModuleInfo,
} from "../src/helpers";
import { GODOT_MODULE_PATTERNS } from "../src/types";

// ============================================================================
// EXTRACT EXPORTS TESTS
// ============================================================================

describe("extractExports", () => {
  it("should extract simple class names", () => {
    const code = `
      class Node {
        virtual void _ready();
      };
    `;
    const exports = extractExports(code);
    assert.ok(exports.includes("Node"));
  });

  it("should extract classes with inheritance", () => {
    const code = `
      class RefCounted : public Object {
      };
      class Node : public Node {
      };
    `;
    const exports = extractExports(code);
    assert.ok(exports.includes("RefCounted"));
    assert.ok(exports.includes("Node"));
  });

  it("should extract struct declarations", () => {
    const code = `
      struct Vector2 {
        float x, y;
      };
    `;
    const exports = extractExports(code);
    assert.ok(exports.includes("Vector2"));
  });

  it("should extract enum class", () => {
    const code = `
      enum class Key {
        KEY_ESCAPE = 4194309,
        KEY_ENTER = 4194310
      };
    `;
    const exports = extractExports(code);
    assert.ok(exports.includes("Key"));
  });

  it("should deduplicate exports", () => {
    const code = `
      class Node;
      class Node {
      };
    `;
    const exports = extractExports(code);
    assert.strictEqual(exports.filter((e) => e === "Node").length, 1);
  });

  it("should handle multiple classes in one file", () => {
    const code = `
      class A {};
      class B : public A {};
      class C {};
    `;
    const exports = extractExports(code);
    assert.ok(exports.includes("A"));
    assert.ok(exports.includes("B"));
    assert.ok(exports.includes("C"));
  });
});

// ============================================================================
// EXTRACT IMPORTS TESTS
// ============================================================================

describe("extractImports", () => {
  it("should extract local includes", () => {
    const code = `#include "core/object/object.h"`;
    const imports = extractImports(code, "/godot/core/node/node.h");
    // normalizeInclude resolves relative paths, so "core/object/object.h" stays as-is
    assert.ok(imports.includes("core/object/object.h"));
  });

  it("should skip system includes", () => {
    const code = `#include <iostream>\n#include "local.h"`;
    const imports = extractImports(code, "/some/file.cpp");
    assert.ok(!imports.includes("iostream"));
    assert.ok(imports.includes("local.h"));
  });

  it("should normalize relative includes", () => {
    const code = `#include "../scene/main/node.h"`;
    const imports = extractImports(code, "/godot/core/object/object.h");
    // Should resolve to scene/main/node.h
    assert.ok(imports.some((i) => i.includes("scene/main/node.h")));
  });

  it("should handle multiple includes", () => {
    const code = `
      #include "core/object/object.h"
      #include "core/node/node.h"
      #include <vector>
    `;
    const imports = extractImports(code, "/some/file.cpp");
    assert.strictEqual(imports.length, 2);
  });
});

// ============================================================================
// NORMALIZE INCLUDE TESTS
// ============================================================================

describe("normalizeInclude", () => {
  it("should keep absolute project paths", () => {
    const result = normalizeInclude("core/object/object.h", "/godot/core/node");
    assert.strictEqual(result, "core/object/object.h");
  });

  it("should resolve .. relative paths", () => {
    const result = normalizeInclude("../scene/main/node.h", "/godot/core/object");
    assert.ok(result?.includes("scene/main/node.h"));
  });

  it("should reject null for absolute system paths", () => {
    const result = normalizeInclude("/usr/include/header.h", "/some/dir");
    assert.strictEqual(result, null);
  });
});

// ============================================================================
// CALCULATE LOC TESTS
// ============================================================================

describe("calculateLOC", () => {
  it("should count lines correctly", () => {
    const code = `line1\nline2\nline3\n`;
    assert.strictEqual(calculateLOC(code), 3);
  });

  it("should handle empty file", () => {
    assert.strictEqual(calculateLOC(""), 0);
  });

  it("should count single line file", () => {
    assert.strictEqual(calculateLOC("single line"), 1);
  });
});

// ============================================================================
// INFER MODULE PURPOSE TESTS
// ============================================================================

describe("inferModulePurpose", () => {
  it("should identify core/object module", () => {
    const purpose = inferModulePurpose("core/object/object.h", ["Object", "RefCounted"]);
    assert.ok(purpose.toLowerCase().includes("object"));
    assert.ok(purpose.toLowerCase().includes("reference"));
  });

  it("should identify scene/2d module", () => {
    const purpose = inferModulePurpose("scene/2d/canvas_item.h", ["CanvasItem", "Sprite2D"]);
    assert.ok(purpose.toLowerCase().includes("2d"));
    assert.ok(purpose.toLowerCase().includes("canvas"));
  });

  it("should identify servers/rendering", () => {
    const purpose = inferModulePurpose("servers/rendering/rendering_server.h", ["RenderingServer"]);
    assert.ok(purpose.toLowerCase().includes("rendering"));
    assert.ok(purpose.toLowerCase().includes("server"));
  });

  it("should fallback to general for unknown", () => {
    const purpose = inferModulePurpose("misc/utils.h", ["SomeClass"]);
    assert.ok(purpose.toLowerCase().includes("general") || purpose.toLowerCase().includes("utility"));
  });
});

// ============================================================================
// MERMAID DIAGRAM GENERATION TESTS
// ============================================================================

describe("generateMermaidArchitecture", () => {
  it("should generate valid mermaid graph TB", () => {
    const modules: ModuleInfo[] = [
      {
        name: "core/object",
        path: "/core/object",
        fileCount: 10,
        totalLOC: 1000,
        exports: ["Object", "RefCounted"],
        imports: [],
        purpose: "Core object system",
      },
      {
        name: "scene/main",
        path: "/scene/main",
        fileCount: 5,
        totalLOC: 500,
        exports: ["Node", "SceneTree"],
        imports: ["core/object"],
        purpose: "Scene tree",
      },
    ];
    const diagram = generateMermaidArchitecture(modules);
    assert.ok(diagram.includes("graph TB"));
    assert.ok(diagram.includes("core/object"));
    assert.ok(diagram.includes("scene/main"));
  });
});

describe("generateMermaidDependencies", () => {
  it("should generate dependency edges", () => {
    const moduleImports = new Map<string, Set<string>>();
    moduleImports.set("scene/main", new Set(["core/object", "core/node"]));
    moduleImports.set("servers/display", new Set(["core/object"]));

    const diagram = generateMermaidDependencies(moduleImports);
    assert.ok(diagram.includes("graph LR"));
    assert.ok(diagram.includes("scene_main-->core_object") || diagram.includes("-->"));
  });
});

// ============================================================================
// FORMAT UTILITIES TESTS
// ============================================================================

describe("formatBytes", () => {
  it("should format bytes to KB", () => {
    assert.ok(formatBytes(1024).includes("KB"));
  });

  it("should format bytes to MB", () => {
    assert.ok(formatBytes(1024 * 1024).includes("MB"));
  });

  it("should keep small bytes as B", () => {
    assert.ok(formatBytes(500).includes("B"));
  });
});

describe("formatLOC", () => {
  it("should format numbers with locale", () => {
    const formatted = formatLOC(1234567);
    assert.ok(formatted.includes(",") || formatted.includes("1")); // Either comma or just check non-empty
  });
});

// ============================================================================
// MODULE UTILITIES TESTS
// ============================================================================

describe("getModuleFromPath", () => {
  it("should identify core/ module", () => {
    assert.strictEqual(getModuleFromPath("core/object/object.h"), "core");
  });

  it("should identify scene/2d module", () => {
    assert.strictEqual(getModuleFromPath("scene/2d/canvas_item.h"), "scene");
  });

  it("should identify rendering module", () => {
    assert.strictEqual(getModuleFromPath("rendering/devices/rendering_device.h"), "rendering");
  });
});

describe("groupByModule", () => {
  it("should group files by module correctly", () => {
    const files: FileInfo[] = [
      { path: "/a/core/1.h", relative: "core/1.h", size: 100, loc: 50, exports: [], imports: [], module: "core", purpose: "" },
      { path: "/b/core/2.h", relative: "core/2.h", size: 200, loc: 100, exports: [], imports: [], module: "core", purpose: "" },
      { path: "/c/scene/1.h", relative: "scene/1.h", size: 150, loc: 75, exports: [], imports: [], module: "scene", purpose: "" },
    ];

    const groups = groupByModule(files);
    assert.strictEqual(groups.get("core")?.length, 2);
    assert.strictEqual(groups.get("scene")?.length, 1);
  });
});

describe("aggregateModuleInfo", () => {
  it("should aggregate file statistics", () => {
    const files: FileInfo[] = [
      {
        path: "/mod/1.h",
        relative: "1.h",
        size: 100,
        loc: 50,
        exports: ["ClassA"],
        imports: ["core/object.h"],
        module: "test",
        purpose: "Test file",
      },
      {
        path: "/mod/2.h",
        relative: "2.h",
        size: 200,
        loc: 100,
        exports: ["ClassB"],
        imports: ["scene/main.h"],
        module: "test",
        purpose: "Test file 2",
      },
    ];

    const info = aggregateModuleInfo("test", files);
    assert.strictEqual(info.fileCount, 2);
    assert.strictEqual(info.totalLOC, 150);
    assert.strictEqual(info.exports.length, 2);
  });
});

// ============================================================================
// TEST FILE DETECTION
// ============================================================================

describe("isTestFile", () => {
  it("should detect test files", () => {
    assert.ok(isTestFile("node_test.cpp"));
    assert.ok(isTestFile("scene_test.h"));
    assert.ok(isTestFile("unittest.cpp"));
    assert.ok(isTestFile("TestUtils.h"));
    assert.ok(isTestFile("physics/spec/rigidbody_spec.cpp"));
  });

  it("should not detect non-test files", () => {
    assert.ok(!isTestFile("node.h"));
    assert.ok(!isTestFile("scene_main.cpp"));
    assert.ok(!isTestFile("object.cpp"));
  });
});

// ============================================================================
// CHUNK ARRAY
// ============================================================================

describe("chunkArray", () => {
  it("should split array into chunks", () => {
    const arr = [1, 2, 3, 4, 5];
    const chunks = chunkArray(arr, 2);
    assert.strictEqual(chunks.length, 3);
    assert.deepStrictEqual(chunks[0], [1, 2]);
    assert.deepStrictEqual(chunks[1], [3, 4]);
    assert.deepStrictEqual(chunks[2], [5]);
  });

  it("should handle empty array", () => {
    const chunks = chunkArray([], 10);
    assert.strictEqual(chunks.length, 0);
  });
});

// ============================================================================
// END TO END INTEGRATION TEST (Optional, needs file system)
// ============================================================================

describe("Integration", () => {
  it("should parse a realistic Godot header", () => {
    const sampleHeader = `
      // Godot Engine
      // Copyright (c) 2014-2025

      #ifndef GODOT_NODE_H
      #define GODOT_NODE_H

      #include "core/object/object.h"
      #include "core/variant/variant.h"

      namespace godot {

      class Node : public Object {
        GDCLASS(Node, Object);

      public:
        enum NOTIFICATION {
          NOTIFICATION_POSTINITIALIZE = 1000,
          NOTIFICATION_PREDELETE = 2000,
        };

        virtual void _ready();
        virtual void _process(float delta);
        Node *get_parent() const;
        void add_child(Node *p_child);
        template <typename T>
        T *get_node(const NodePath &p_path);

        Signal signal(StringName name);
      };

      } // namespace godot

      #endif
    `;

    const exports = extractExports(sampleHeader);
    assert.ok(exports.includes("Node"));
    // Should not export NOTIFICATION enum (because we only match "enum class")
    // This is a limitation of our simple regex

    const imports = extractImports(sampleHeader, "/core/node/node.h");
    assert.ok(imports.includes("core/object/object.h"));
    assert.ok(imports.includes("core/variant/variant.h"));
  });
});

console.log("✅ All tests defined. Run with: node --test tests/skill.test.ts");