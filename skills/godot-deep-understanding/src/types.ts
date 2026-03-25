/**
 * Type definitions for godot-deep-understanding skill
 */

/**
 * File information after analysis
 */
export interface FileInfo {
  /** Absolute path to file */
  path: string;
  /** Relative path from context root */
  relative: string;
  /** File size in bytes */
  size: number;
  /** Lines of code (approx) */
  loc: number;
  /** Classes/functions/structs defined in this file */
  exports: string[];
  /** #include dependencies (normalized, project-relative) */
  imports: string[];
  /** Inferred module name (e.g., "core/object", "scene/2d") */
  module: string;
  /** Optional detailed description */
  purpose?: string;
}

/**
 * Aggregated module information
 */
export interface ModuleInfo {
  /** Module identifier (folder path) */
  name: string;
  /** Absolute path to module directory */
  path: string;
  /** Number of files in module */
  fileCount: number;
  /** Total lines of code */
  totalLOC: number;
  /** All exports aggregated from files */
  exports: string[];
  /** All imports aggregated (external + internal) */
  imports: string[];
  /** Human-readable purpose description */
  purpose: string;
  /** Sub-modules (if nested) */
  subModules?: ModuleInfo[];
  /** Sample files (top N by size/LOC) */
  sampleFiles?: FileInfo[];
}

/**
 * Complete analysis result
 */
export interface AnalysisResult {
  /** Total files scanned */
  totalFiles: number;
  /** Total LOC across all files */
  totalLOC: number;
  /** All modules discovered */
  modules: ModuleInfo[];
  /** Insights to store in memory */
  insights: string[];
  /** Generated diagrams (Mermaid syntax) */
  diagrams: {
    architecture?: string;
    dependencies?: string;
    inheritance?: string;
  };
  /** Time taken for analysis (ms) */
  durationMs?: number;
}

/**
 * Skill input parameters
 */
export interface GodotDeepUnderstandingInput {
  /** Question/hypothesis in Vietnamese */
  query: string;
  /** Optional: path to Godot source code */
  contextPath?: string;
  /** Optional: where to save full report */
  outputPath?: string;
  /** Analysis depth: overview (fast) | module (balanced) | file (deep) */
  depth?: "overview" | "module" | "file";
  /** Generate Mermaid diagrams? */
  generateDiagrams?: boolean;
  /** Max files per module (module depth only) */
  maxFilesPerModule?: number;
}

/**
 * Memory insight entry
 */
export interface GodotMemoryInsight {
  /** Module or class name */
  subject: string;
  /** Type: "module" | "class" | "pattern" | "architecture" */
  type: string;
  /** Summary of insight */
  content: string;
  /** File paths supporting this insight */
  sources: string[];
  /** When analyzed */
  timestamp: string;
}

/**
 * Default values
 */
export const DEFAULT_DEPTH: GodotDeepUnderstandingInput["depth"] = "module";
export const DEFAULT_MAX_FILES_PER_MODULE = 10;
export const DEFAULT_GENERATE_DIAGRAMS = true;

/**
 * Common Godot module path patterns
 */
export const GODOT_MODULE_PATTERNS = {
  core: /^core\//,
  scene: /^scene\//,
  scene2d: /^scene\/2d\//,
  scene3d: /^scene\/3d\//,
  gui: /^scene\/gui\//,
  servers: /^servers\//,
  rendering: /^rendering\//,
  physics2d: /^physics\/2d\//,
  physics3d: /^physics\/3d\//,
  audio: /^audio\//,
  drivers: /^drivers\//,
  platforms: /^platforms\//,
  editors: /^editors\//,
  export: /^export\//,
  methods: /^methods\//,
} as const;

/**
 * File extension priorities (for scanning order)
 */
export const FILE_EXTENSIONS = [".cpp", ".h", ".hpp", ".c", ".cc"] as const;