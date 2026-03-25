/**
 * Helper functions for Godot code analysis
 */

import { FileInfo, ModuleInfo, GODOT_MODULE_PATTERNS } from "./types";
import { readFile } from "../tools"; // OpenClaw read tool
import * as path from "path";

// ============================================================================
// C++ PARSING HEURISTICS (Regex-based)
// ============================================================================

/**
 * Extract class/struct/enum/namespace declarations from C++ code
 * Returns array of declared type names
 */
export function extractExports(content: string): string[] {
  const exports: string[] = [];

  // Class: class ClassName : public Parent
  const classRegex = /class\s+(\w+)\s*(?::\s*(?:public|protected|private)\s+(\w+))?\s*\{/g;
  let match;
  while ((match = classRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }

  // Struct: struct StructName
  const structRegex = /struct\s+(\w+)\s*\{?/g;
  while ((match = structRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }

  // Enum class: enum class EnumName
  const enumRegex = /enum\s+class\s+(\w+)/g;
  while ((match = enumRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }

  // Namespace: namespace NSName { (skip, too broad)
  // const nsRegex = /namespace\s+(\w+)\s*\{/g;
  // while ((match = nsRegex.exec(content)) !== null) {
  //   exports.push(match[1]); // Maybe include?
  // }

  // Function declarations at global/namespace scope (optional)
  // ReturnType functionName(Type param, ...)
  // const funcRegex = /(?:[\w:\*&<>]+)\s+(\w+)\s*\([^)]*\)\s*(?:const)?\s*\{?/g;
  // while ((match = funcRegex.exec(content)) !== null) {
  //   if (!exports.includes(match[1])) exports.push(match[1]);
  // }

  return [...new Set(exports)]; // deduplicate
}

/**
 * Extract #include statements from C++ code
 * Returns normalized project-relative paths (skip system headers)
 */
export function extractImports(content: string, filePath: string): string[] {
  const imports: string[] = [];

  // Match: #include "local.h" or #include <system>
  const includeRegex = /#include\s+[<"]([^>"]+)[>"]/g;
  let match;
  const contextDir = path.dirname(filePath);

  while ((match = includeRegex.exec(content)) !== null) {
    const raw = match[1];

    // Skip system headers (angle brackets)
    if (match[0].includes("<")) continue;

    // Normalize to project-relative path
    const normalized = normalizeInclude(raw, contextDir);
    if (normalized) {
      imports.push(normalized);
    }
  }

  return [...new Set(imports)];
}

/**
 * Normalize include path to be relative to project root
 * Example: "core/object/object.h" stays as-is
 * Example: "../scene/main/node.h" → "scene/main/node.h"
 */
export function normalizeInclude(include: string, fromDir: string): string | null {
  try {
    // If already absolute (starts with / or drive letter), skip
    if (path.isAbsolute(include)) return null;

    // If no ".." prefix, it's already a project-relative path — keep as-is
    if (!include.startsWith("..") && !include.startsWith("./")) {
      return include;
    }

    // Resolve relative path from file's directory
    const resolved = path.resolve(fromDir, include);
    const clean = resolved.replace(/\\/g, "/");

    // Strip any absolute path prefix — extract the Godot project-relative part
    // e.g. "D:/godot/scene/main/node.h" → "scene/main/node.h"
    // Heuristic: find known Godot top-level dirs and strip everything before
    const godotRoots = ["core/", "scene/", "servers/", "editor/", "platform/", "modules/", "drivers/", "thirdparty/", "tests/"];
    for (const root of godotRoots) {
      const idx = clean.indexOf(root);
      if (idx !== -1) {
        return clean.substring(idx);
      }
    }

    // Fallback: strip leading path separator
    return clean.replace(/^[A-Z]:\//, "").replace(/^\//, "");
  } catch {
    return null; // unparsable
  }
}

// ============================================================================
// FILE ANALYSIS
// ============================================================================

/**
 * Calculate approximate Lines of Code
 * Simple: count newlines in content
 */
export function calculateLOC(content: string): number {
  if (!content) return 0;
  // Count non-empty lines (trim trailing newline)
  const trimmed = content.endsWith("\n") ? content.slice(0, -1) : content;
  return trimmed.split("\n").length;
}

/**
 * Infer module purpose from file path and class names
 * Godot-specific heuristics
 */
export function inferModulePurpose(filePath: string, exports: string[]): string {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();

  // Check known module patterns
  if (normalized.includes("core/object")) {
    return "Core object system: Object base class, reference counting (RefCounted)";
  }
  if (normalized.includes("core/node")) {
    return "Node hierarchy, scene tree integration, notifications";
  }
  if (normalized.includes("core/resource")) {
    return "Resource management, serialization, reference system";
  }
  if (normalized.includes("scene/main")) {
    return "Main scene classes: SceneTree, Viewport, Node paths";
  }
  if (normalized.includes("scene/2d")) {
    return "2D rendering: CanvasItem, sprites, collisions";
  }
  if (normalized.includes("scene/3d")) {
    return "3D rendering: Spatial, MeshInstance, cameras, lights";
  }
  if (normalized.includes("scene/gui")) {
    return "User interface: Control nodes, containers, themes";
  }
  if (normalized.includes("servers/display")) {
    return "DisplayServer: window management, monitor info";
  }
  if (normalized.includes("servers/rendering")) {
    return "RenderingServer: low-level rendering commands";
  }
  if (normalized.includes("servers/physics_2d")) {
    return "PhysicsServer2D: 2D physics simulation";
  }
  if (normalized.includes("servers/physics_3d")) {
    return "PhysicsServer3D: 3D physics (Bullet integration)";
  }
  if (normalized.includes("servers/audio")) {
    return "AudioServer: audio buses, effects, playback";
  }
  if (normalized.includes("servers/input")) {
    return "InputServer: input map, device handling";
  }
  if (normalized.includes("rendering")) {
    return "Rendering pipeline: devices, renderers, shaders";
  }
  if (normalized.includes("drivers/graphics")) {
    return "Graphics drivers: Vulkan, OpenGL, Metal, D3D backends";
  }
  if (normalized.includes("platforms")) {
    return "Platform-specific code: Windows, Linux, macOS, Android, iOS, Web";
  }

  // Fallback: look at exports for class name patterns
  const hasServer = exports.some((c) => c.includes("Server"));
  const hasPhysics = exports.some((c) => c.includes("Physics"));
  const hasRendering = exports.some((c) => c.includes("Rendering") || c.includes("Mesh") || c.includes("Texture"));

  if (hasServer) return "Server-related classes";
  if (hasPhysics) return "Physics-related classes";
  if (hasRendering) return "Rendering-related classes";

  return "General utility classes";
}

// ============================================================================
// AGGREGATION & DIAGRAMMING
// ============================================================================

/**
 * Build Mermaid architecture diagram from modules
 */
export function generateMermaidArchitecture(modules: ModuleInfo[]): string {
  const lines: string[] = ["graph TB"];

  // Group by top-level category
  const groups: Map<string, ModuleInfo[]> = new Map();
  for (const mod of modules) {
    const topLevel = mod.name.split("/")[0] || "root";
    if (!groups.has(topLevel)) groups.set(topLevel, []);
    groups.get(topLevel)!.push(mod);
  }

  // Create subgraphs
  for (const [groupName, groupModules] of groups.entries()) {
    const label = groupName.charAt(0).toUpperCase() + groupName.slice(1);
    lines.push(`  subgraph "${label}"`);

    for (const mod of groupModules) {
      const nodeId = mod.name.replace(/[^a-zA-Z0-9]/g, "_");
      lines.push(`    ${nodeId}[${mod.name}]`);
    }

    lines.push("  end");
  }

  // Add dependencies (simplified: just show modules within same top-level group)
  // For detailed dependencies, use separate diagram
  lines.push("");
  lines.push("  %% Add relationships based on imports (see dependency diagram)");

  return lines.join("\n");
}

/**
 * Build Mermaid dependency graph from import relationships
 */
export function generateMermaidDependencies(
  moduleImports: Map<string, Set<string>>
): string {
  const lines: string[] = ["graph LR"];
  const seenEdges = new Set<string>();

  for (const [from, imports] of moduleImports.entries()) {
    for (const imp of imports) {
      // Only show cross-module dependencies
      if (from === imp) continue;

      const fromId = from.replace(/[^a-zA-Z0-9]/g, "_");
      const toId = imp.replace(/[^a-zA-Z0-9]/g, "_");

      const edge = `${fromId}-->${toId}`;
      if (!seenEdges.has(edge)) {
        lines.push(`  ${fromId}-->${toId}`);
        seenEdges.add(edge);
      }
    }
  }

  return lines.join("\n");
}

/**
 * Generate module-level inheritance diagram (optional, expensive)
 * Requires scanning class definitions for parent classes
 */
export function generateMermaidInheritance(classes: Map<string, string>): string {
  // classes: Map<childClassName, parentClassName>
  const lines: string[] = ["graph TD"];
  for (const [child, parent] of classes.entries()) {
    const childId = child.replace(/[^a-zA-Z0-9]/g, "_");
    const parentId = parent.replace(/[^a-zA-Z0-9]/g, "_");
    lines.push(`  ${childId}-->${parentId}`);
  }
  return lines.join("\n");
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Format LOC to human-readable string
 */
export function formatLOC(loc: number): string {
  return loc.toLocaleString();
}

/**
 * Determine module from file path
 * Uses pattern matching against GODOT_MODULE_PATTERNS
 */
export function getModuleFromPath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();

  // Check each pattern
  for (const [moduleName, pattern] of Object.entries(GODOT_MODULE_PATTERNS)) {
    if (pattern.test(normalized)) {
      // Return first matched module
      return moduleName.replace(/[0-9]/g, ""); // e.g., "scene2d" → "scene"
    }
  }

  // Fallback: use top-level directory
  const parts = normalized.split("/");
  if (parts.length >= 2) {
    // Check if second-level gives more detail
    const second = parts[1];
    if (["2d", "3d", "gui", "main", "resources"].includes(second)) {
      return `${parts[0]}/${second}`;
    }
    return parts[0];
  }

  return "misc";
}

/**
 * Group files by module
 */
export function groupByModule(
  files: FileInfo[]
): Map<string, FileInfo[]> {
  const groups = new Map<string, FileInfo[]>();
  for (const file of files) {
    if (!groups.has(file.module)) groups.set(file.module, []);
    groups.get(file.module)!.push(file);
  }
  return groups;
}

/**
 * Aggregate module info from file list
 */
export function aggregateModuleInfo(
  moduleName: string,
  files: FileInfo[]
): ModuleInfo {
  const firstFile = files[0];
  const modulePath = firstFile ? path.dirname(firstFile.path) : moduleName;

  const exports = [...new Set(files.flatMap((f) => f.exports))];
  const imports = [...new Set(files.flatMap((f) => f.imports))];

  // Simple purpose inference by looking at top classes
  const topExports = exports.slice(0, 10);
  const purpose = inferModulePurpose(files[0]?.path || "", topExports);

  // Sort files by size descending, take top 5 for sample
  const sorted = [...files].sort((a, b) => b.size - a.size);
  const sampleFiles = sorted.slice(0, 5);

  return {
    name: moduleName,
    path: modulePath,
    fileCount: files.length,
    totalLOC: files.reduce((sum, f) => sum + f.loc, 0),
    exports,
    imports,
    purpose,
    sampleFiles,
  };
}

/**
 * Check if a file is likely a test file
 */
export function isTestFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return (
    lower.includes("test") ||
    lower.includes("spec") ||
    lower.endsWith("_test.cpp") ||
    lower.endsWith("_test.h") ||
    lower.includes("unittest")
  );
}

/**
 * Sleep for milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Slice an array into chunks
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}