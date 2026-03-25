#!/usr/bin/env node
/**
 * OpenClaw Deep Understanding Skill - Merged Version
 *
 * Phân tích sâu codebase OpenClaw để trả lời câu hỏi architecture,
 * generate documentation, suggest best practices.
 *
 * Base: OpenClaw version (simple, 444 lines) + CCN2 features (progress, approval, types)
 * Version: 3.0 (Merged)
 *
 * @author Cốm Đào
 * @created 2026-03-16
 */

// OpenClaw injects tools as global functions — NO imports needed!
const DEFAULT_OPENCLAW_PATH = "D:\\PROJECT\\CCN2\\openclaw";

/**
 * Input schema cho skill
 */
export interface OpenClawDeepUnderstandingInput {
  /** Câu hỏi bằng tiếng Việt (required) */
  query: string;
  /** Đường dẫn đến codebase OpenClaw (optional) */
  contextPath?: string;
  /** Nơi lưu báo cáo markdown (optional) */
  outputPath?: string;
  /** Mức độ phân tích: "overview" | "module" | "file" */
  depth?: "overview" | "module" | "file";
  /** Tạo Mermaid diagrams? */
  generateDiagrams?: boolean;
}

/**
 * Main skill entry - merged version với progress tracking
 */
export async function skill(input: OpenClawDeepUnderstandingInput) {
  const {
    query,
    contextPath = DEFAULT_OPENCLAW_PATH,
    outputPath,
    depth = "module",
    generateDiagrams = true,
  } = input;

  // Progress tracking (từ CCN2 version)
  emitProgress(`Bắt đầu phân tích OpenClaw (depth: ${depth})...`);

  // Validate
  if (!query || typeof query !== 'string' || !query.trim()) {
    throw new Error("Query required (non-empty string)");
  }
  if (!['overview','module','file'].includes(depth)) {
    throw new Error(`Invalid depth. Must be: overview, module, or file`);
  }

  // 1. Memory insights (từ OpenClaw version - keep simple)
  emitProgress("Tìm kiếm insights từ memory...");
  let existingInsights = [];
  try {
    const mem = await memory_search({ query: "OpenClaw", maxResults: 20 });
    existingInsights = mem.results || [];
  } catch (e) {
    console.warn("Memory search failed (continuing):", e.message);
  }

  // 2. Resolve & verify path
  const codebasePath = contextPath || DEFAULT_OPENCLAW_PATH;
  emitProgress(`Kiểm tra path: ${codebasePath}...`);
  try {
    await exec({ command: `powershell -Command "Test-Path '${codebasePath}'"`, timeout: 5000 });
  } catch (e) {
    return `❌ Không tìm thấy codebase tại ${codebasePath}. Kiểm tra path và thử lại.`;
  }

  // 3. Analyze structure
  emitProgress("Thu thập cấu trúc codebase...");
  const structure = await analyzeStructure(codebasePath);
  if (structure.modules.size === 0) {
    return "❌ Không phát hiện modules OpenClaw nào. Path có vẻ không đúng.";
  }

  // 4. Deep analysis theo depth
  emitProgress("Phân tích chi tiết...");
  let analysis;
  try {
    if (depth === "overview") {
      analysis = await analyzeOverview(codebasePath, structure);
    } else if (depth === "file") {
      analysis = await analyzePerFile(codebasePath, structure);
    } else {
      analysis = await analyzeByModule(codebasePath, structure);
    }
  } catch (e) {
    console.error("Analysis error:", e);
    return `❌ Lỗi phân tích: ${e.message}`;
  }

  // 5. Build answer
  emitProgress("Xây dựng câu trả lời...");
  const answer = await buildAnswer(query, analysis, existingInsights, generateDiagrams);

  // 6. Generate report nếu cần (từ OpenClaw version - keep simple)
  let reportInfo = null;
  if (outputPath) {
    emitProgress("Tạo báo cáo markdown...");
    try {
      reportInfo = await generateReport(outputPath, analysis, generateDiagrams);
    } catch (e) {
      console.error("Report failed:", e);
    }
  }

  // 7. Prepare memory update (merged: có thêm insights extraction)
  emitProgress("Chuẩn bị memory update...");
  let memoryUpdate = null;
  try {
    memoryUpdate = await prepareMemoryUpdate(analysis, query);
  } catch (e) {
    console.warn("Memory update prep failed:", e);
  }

  // 8. Approval workflow (từ CCN2 version)
  if (memoryUpdate && memoryUpdate.insights && memoryUpdate.insights.length > 0) {
    emitProgress("Yêu cầu approval cho memory update...");
    const approved = await requestApproval({
      title: "Update MEMORY.md với OpenClaw insights",
      description: `Thêm ${memoryUpdate.insights.length} insights mới về OpenClaw?`,
      details: memoryUpdate.insights.map((i: any, idx: number) => `${idx + 1}. ${i.title}: ${i.summary}`).join("\n"),
      action: "memory_update",
    });

    if (approved) {
      await memory_update({ insights: memoryUpdate.insights, source: "openclaw-deep-understanding" });
      emitProgress("✅ Memory đã được update");
    } else {
      emitProgress("⏭️ Bỏ qua memory update (chưa approved)");
    }
  }

  // 9. Build response (merged format)
  emitProgress("Hoàn tất phân tích!");
  let response = `## 📊 Phân tích OpenClaw\n\n`;
  response += `**Depth**: \`${depth}\`\n`;
  response += `**Codebase**: \`${codebasePath}\`\n`;
  response += `**Modules**: ${analysis.data?.modules?.size ?? 'N/A'}\n`;
  response += `**Files**: ${analysis.data?.totalFiles || 'N/A'}\n\n`;

  response += `### Câu trả lời:\n\n${answer}\n\n`;

  if (reportInfo) {
    response += `📄 **Báo cáo**: \`${reportInfo.path}\` (${reportInfo.size} bytes)\n\n`;
  }

  if (memoryUpdate && !memoryUpdate.saved) {
    response += `---\n💾 **Memory insights** (${memoryUpdate.preview?.length || 0} chars) — cần approval để lưu\n`;
  }

  return response;
}

// ==================== ANALYSIS CORE ====================

async function analyzeStructure(basePath: string) {
  const structure = { modules: new Map() };
  const keyDirs = [
    "src/gateway", "src/agents", "src/channels", "src/providers",
    "src/plugins", "src/memory", "src/browser", "src/cron",
    "src/hooks", "src/media", "src/tts", "src/acp"
  ];

  emitProgress("Quét modules...");
  for (const dir of keyDirs) {
    try {
      const countResult = await exec({
        command: `powershell -Command "Get-ChildItem '${basePath}\\${dir}' -Recurse -Include *.ts,*.js,*.json,*.md | Measure-Object | % { $_.Count }"`,
        timeout: 3000
      });
      const count = parseInt(countResult.stdout.trim()) || 0;
      if (count > 0) {
        const listResult = await exec({
          command: `powershell -Command "Get-ChildItem '${basePath}\\${dir}' -Name | Select-Object -First 10"`,
          timeout: 3000
        });
        structure.modules.set(dir, listResult.stdout.split("\n").filter(Boolean));
      }
    } catch (e) {
      // skip missing
    }
  }
  return structure;
}

async function analyzeOverview(basePath: string, structure: any) {
  let loc = 0;
  try {
    const locResult = await exec({
      command: `powershell -Command "Get-ChildItem '${basePath}\\src' -Recurse -Include *.ts | Measure-Object -Line | % { $_.Lines }"`,
      timeout: 15000
    });
    loc = parseInt(locResult.stdout.trim()) || 0;
  } catch (e) {}

  let pkg = null;
  try {
    const pkgRaw = await read({ file_path: `${basePath}\\package.json`, limit: 50 });
    pkg = JSON.parse(pkgRaw);
  } catch (e) {}

  return { type: "overview", data: { modules: structure.modules, loc, packageJson: pkg } };
}

async function analyzeByModule(basePath: string, structure: any) {
  const analysis = { modules: new Map(), totalFiles: 0 };

  for (const [modulePath, topFiles] of structure.modules.entries()) {
    const fullModulePath = `${basePath}\\${modulePath}`;
    const moduleInfo = { path: modulePath, files: [], keyExports: [], imports: [], purpose: "", loc: 0 };

    try {
      const allFilesResult = await exec({
        command: `powershell -Command "Get-ChildItem '${fullModulePath}' -Recurse -Include *.ts,*.js | Select-Object -First 10 FullName"`,
        timeout: 5000
      });
      const allFiles = allFilesResult.stdout.split("\n").filter(Boolean);

      for (const file of allFiles) {
        try {
          const content = await read({ file_path: file, limit: 300 });

          // Accurate LOC
          try {
            const locResult = await exec({ command: `powershell -Command "(Get-Content '${file}').Count"`, timeout: 2000 });
            moduleInfo.loc += parseInt(locResult.stdout.trim()) || content.split("\n").length;
          } catch (e) {
            moduleInfo.loc += content.split("\n").length;
          }
          analysis.totalFiles++;

          // Exports
          const exportRegex = /export\s+(?:default\s+)?(?:function|class|const|interface|type)\s+(\w+)/g;
          let match;
          while ((match = exportRegex.exec(content)) !== null) {
            moduleInfo.keyExports.push(match[1]);
          }

          // Imports
          const importRegex = /from\s+['"]([^'"]+)['"]/g;
          let impMatch;
          while ((impMatch = importRegex.exec(content)) !== null) {
            moduleInfo.imports.push(impMatch[1]);
          }
        } catch (e) {
          // skip
        }
      }

      moduleInfo.keyExports = [...new Set(moduleInfo.keyExports)];
      moduleInfo.imports = [...new Set(moduleInfo.imports)];
      moduleInfo.purpose = inferPurpose(modulePath);

      analysis.modules.set(modulePath, moduleInfo);
    } catch (e) {
      console.warn(`Skipped module ${modulePath}: ${e.message}`);
    }
  }

  return { type: "module", data: analysis };
}

async function analyzePerFile(basePath: string, structure: any) {
  const analysis = { modules: new Map(), totalFiles: 0 };

  for (const [modulePath, topFiles] of structure.modules.entries()) {
    const fullModulePath = `${basePath}\\${modulePath}`;
    const moduleInfo = { files: [] };

    try {
      const allFilesResult = await exec({
        command: `powershell -Command "Get-ChildItem '${fullModulePath}' -Recurse -Include *.ts,*.js,*.json,*.md | Select-Object -First 50 FullName"`,
        timeout: 8000
      });
      const allFiles = allFilesResult.stdout.split("\n").filter(Boolean);

      for (const file of allFiles) {
        try {
          const content = await read({ file_path: file, limit: 100 });
          const stats = await exec({ command: `powershell -Command "(Get-Item '${file}').Length"`, timeout: 2000 });
          const size = parseInt(stats.stdout.trim()) || 0;

          moduleInfo.files.push({
            name: file.split('\\').pop(),
            lines: content.split("\n").length,
            size,
            hasExports: /export\s+/.test(content),
            hasTests: /\.test\.ts|\.spec\.ts/.test(file)
          });
          analysis.totalFiles++;
        } catch (e) {
          // skip
        }
      }

      analysis.modules.set(modulePath, moduleInfo);
    } catch (e) {
      console.warn(`Per-file skip ${modulePath}: ${e.message}`);
    }
  }

  return { type: "file", data: analysis };
}

// ==================== BUILD ANSWER & REPORT ====================

async function buildAnswer(query: string, analysis: any, existingInsights: any[], generateDiagrams: boolean) {
  // Check memory cache trước
  const kw = query.toLowerCase().split(' ').filter(w => w.length > 3)[0];
  if (kw) {
    const cached = existingInsights.find((i: any) => i.text?.toLowerCase().includes(kw));
    if (cached) {
      return `📚 Từ bộ nhớ:\n\n${cached.text}\n\n*(Đã lưu trước)*`;
    }
  }

  // Build fresh
  if (analysis.type === "overview") {
    return summarizeOverview(analysis.data, generateDiagrams);
  } else if (analysis.type === "module") {
    return await summarizeModuleAnalysis(analysis.data, query, generateDiagrams);
  } else {
    return summarizeFileAnalysis(analysis.data);
  }
}

async function generateReport(outputPath: string, analysis: any, generateDiagrams: boolean) {
  const timestamp = new Date().toLocaleString("vi-VN");
  let md = `# OpenClaw Deep Analysis\n\n`;
  md += `**Generated**: ${timestamp}\n`;
  md += `**Depth**: ${analysis.type}\n`;
  const reportData = analysis.data || analysis;
  md += `**Modules**: ${reportData.modules?.size ?? 'N/A'}\n`;
  if (reportData.totalFiles) md += `**Files**: ${reportData.totalFiles}\n\n`;

  if (generateDiagrams) {
    md += `## Architecture\n\n\`\`\`mermaid\n`;
    md += generateArchDiagram(reportData);
    md += `\n\`\`\`\n\n`;
  }

  md += `## Modules\n\n`;
  for (const [path, info] of (reportData.modules || new Map()).entries()) {
    md += `### \`${path}\`\n\n`;
    md += `${info.purpose || "*Chưa có mô tả*"}\n\n`;
    if (info.keyExports?.length > 0) {
      md += `**Exports**: \`${info.keyExports.slice(0, 8).join('`, `')}\`\n\n`;
    }
    if (info.imports?.length > 0) {
      md += `**Deps**: ${info.imports.slice(0, 8).map((i: string) => `\`${i}\``).join(', ')}\n\n`;
    }
    if (info.files && info.files.length > 0) {
      md += `**Files**: ${info.files.length} (total ${info.loc || 0} LOC)\n\n`;
    }
  }

  md += `---\n*End*\n`;

  await write({ file_path: outputPath, content: md });
  return { path: outputPath, size: md.length, preview: `✅ Report created (${md.length} chars)` };
}

// ==================== MEMORY MANAGEMENT ====================

export async function prepareMemoryUpdate(analysis: any, query: string) {
  const memData = analysis.data || analysis;
  const modulesMap = memData.modules || new Map();

  // Extract insights từ analysis
  const insights: any[] = [];
  for (const [path, info] of modulesMap.entries()) {
    if (info.purpose) {
      insights.push({
        title: `OpenClaw ${path}`,
        summary: info.purpose,
        query,
        modulePath: path,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Generate preview
  const lines = [];
  lines.push(`## OpenClaw Analysis — ${new Date().toISOString().split('T')[0]}`);
  lines.push(`Query: ${query}`);
  lines.push(`Depth: ${analysis.type || 'unknown'}`);
  lines.push(`Modules: ${modulesMap.size}`);
  lines.push(``);

  for (const [path, info] of modulesMap.entries()) {
    if (info.purpose) {
      lines.push(`- \`${path}\`: ${info.purpose}`);
    }
  }
  lines.push(``);
  lines.push(`---`);
  const preview = lines.join("\n");

  return { insights, preview, saved: false };
}

// ==================== HELPERS ====================

export function inferPurpose(modulePath: string): string {
  const purposes: Record<string, string> = {
    "gateway": "Gateway HTTP/WebSocket server, control center",
    "agents": "Agent runtime, Pi runner, subagent orchestration",
    "channels": "Channel adapters (Telegram, Discord, Zalo, etc.)",
    "providers": "LLM provider adapters (30+ providers)",
    "plugins": "Plugin system, registry, runtime",
    "memory": "LanceDB vector storage + semantic search",
    "browser": "Chrome DevTools Protocol browser control",
    "cron": "Scheduled task engine (cron jobs)",
    "hooks": "Lifecycle hooks (before/after tool calls)",
    "media": "Media processing (image/audio/video)",
    "tts": "Text-to-speech synthesis",
    "acp": "Agent Communication Protocol"
  };

  const pathLower = modulePath.toLowerCase();
  for (const [key, val] of Object.entries(purposes)) {
    if (pathLower.includes(key)) return val;
  }

  return "OpenClaw module (purpose not auto-detected)";
}

export function generateArchDiagram(analysis: any): string {
  return `graph TD
    Gateway[Gateway] --> Channels[Channels]
    Gateway --> Agents[Agents]
    Gateway --> Providers[Providers]
    Agents --> Skills[Skills]
    Agents --> Memory[Memory]
    Agents --> Tools[Tools]
    Gateway --> Cron[Cron]
    Agents --> Browser[Browser]
    Agents --> Media[Media]
    Agents --> TTS[TTS]`;
}

function summarizeOverview(data: any, diagrams: boolean): string {
  let txt = `**OpenClaw** là AI automation gateway self-hosted (MIT).\n\n`;
  txt += `- **Version**: ${data.packageJson?.version || "unknown"}\n`;
  txt += `- **LOC**: ~${data.loc?.toLocaleString() || 0}\n`;
  txt += `- **Modules**: ${data.modules.size}\n\n`;

  if (diagrams) {
    txt += `**Architecture**:\n\`\`\`mermaid\n${generateArchDiagram(data)}\n\`\`\`\n\n`;
  }

  txt += `**Modules phát hiện**:\n`;
  for (const [dir, files] of data.modules.entries()) {
    const count = files ? files.length : 0;
    txt += `- \`${dir}\`: ${count} files\n`;
  }

  return txt;
}

async function summarizeModuleAnalysis(analysis: any, query: string, diagrams: boolean): Promise<string> {
  const modules = Array.from(analysis.modules.entries());
  const keywords = query.toLowerCase().split(' ').filter(w => w.length > 3);

  let relevant = modules;
  if (keywords.length > 0) {
    relevant = modules.filter(([path, info]) => {
      const haystack = (path + ' ' + (info.keyExports || []).join(' ') + ' ' + info.purpose).toLowerCase();
      return keywords.some(k => haystack.includes(k));
    });
  }

  let txt = `Phân tích ${analysis.modules.size} modules (tìm thấy ${relevant.length} liên quan):\n\n`;

  if (diagrams && relevant.length > 0) {
    txt += `\`\`\`mermaid\n${generateDependencyDiagram(analysis, relevant.slice(0, 8))}\n\`\`\`\n\n`;
  }

  for (const [path, info] of relevant.slice(0, 10)) {
    txt += `### \`${path}\`\n`;
    txt += `${info.purpose || "*Không mô tả*"}\n`;
    if (info.keyExports?.length > 0) {
      txt += `- **Exports**: \`${info.keyExports.slice(0, 5).join('`, `')}\`\n`;
    }
    if (info.imports?.length > 0) {
      txt += `- **Deps**: ${info.imports.slice(0, 5).map((i: string) => `\`${i}\``).join(', ')}\n`;
    }
    txt += `\n`;
  }

  return txt;
}

function summarizeFileAnalysis(analysis: any): string {
  let txt = `Quét ${analysis.totalFiles} files trong ${analysis.modules.size} modules:\n\n`;

  for (const [modulePath, info] of analysis.modules.entries()) {
    txt += `### \`${modulePath}\`\n`;
    txt += `- Files: ${info.files.length}\n`;
    const tests = info.files.filter((f: any) => f.hasTests);
    if (tests.length) txt += `- Tests: ${tests.length}\n`;
    txt += `\n`;
  }

  return txt;
}

export function generateDependencyDiagram(_analysis: any, relevant: any[]): string {
  let mermaid = "graph LR\n";
  for (const [path, info] of relevant) {
    const id = path.replace(/[^a-zA-Z0-9]/g, "_");
    const label = path.split('/').pop();
    mermaid += `    ${id}["${label}"]\n`;
    // Draw edges based on real imports pointing to other relevant modules
    for (const imp of (info.imports || [])) {
      const matchedPath = relevant.find(([p]) => imp.includes(p.split('/').pop()));
      if (matchedPath) {
        const depId = matchedPath[0].replace(/[^a-zA-Z0-9]/g, "_");
        if (depId !== id) mermaid += `    ${id} --> ${depId}\n`;
      }
    }
  }
  return mermaid;
}