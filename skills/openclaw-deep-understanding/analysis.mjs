#!/usr/bin/env node
/**
 * Minimal OpenClaw Analysis — Clean Version
 * Usage: node analysis.mjs "query" [depth] [output]
 */

import { readFile, appendFile } from 'node:fs/promises';
import { join } from 'node:path';
import { exec as execShell } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execShell);
const DEFAULT_PATH = "D:\\PROJECT\\CCN2\\openclaw";
const MEMORY_PATH = "C:\\Users\\CPU60164_LOCAL\\.openclaw\\workspace\\MEMORY.md";

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node analysis.mjs "query" [depth] [output]');
    process.exit(1);
  }

  const query = args[0];
  const depth = args[1] || 'overview';
  const output = args[2] || '';

  console.log(`🔍 Analyzing OpenClaw: "${query}" (depth: ${depth})`);

  // 1. Get top-level structure
  let entries = [];
  try {
    const { stdout } = await exec(`cmd /c dir /b "${DEFAULT_PATH}"`);
    entries = stdout.split(/\r?\n/).filter(Boolean);
  } catch (err) {
    console.error('Failed to list directory:', err.message);
    process.exit(1);
  }

  // 2. Read key files
  const readFiles = {};
  for (const f of ['README.md', 'VISION.md', 'package.json', 'SECURITY.md']) {
    if (entries.includes(f)) {
      try {
        const content = await readFile(join(DEFAULT_PATH, f), 'utf8');
        readFiles[f] = content;
      } catch (e) {
        readFiles[f] = null;
      }
    }
  }

  // 3. Build answer
  let answer = buildAnswer(query, entries, readFiles);

  // 4. Output answer
  console.log('\n' + '='.repeat(80));
  console.log('ANSWER:');
  console.log('='.repeat(80));
  console.log(answer);

  // 5. Generate report if output specified
  if (output) {
    const report = generateReport(query, answer, entries, readFiles);
    await appendFile(output, report);
    console.log(`\n✅ Report written: ${output} (${report.length} bytes)`);
  }

  // 6. Update memory with a simple insight
  const insight = `- **${new Date().toISOString().slice(0,10)}**: Analyzed "${query}" — modules found: ${entries.filter(e => e === 'src' || e === 'extensions' || e === 'apps').join(', ')}\n`;
  await appendFile(MEMORY_PATH, '\n## OpenClaw Analysis Insights\n' + insight);
  console.log('✅ Memory updated with insight.');
}

function buildAnswer(query, entries, files) {
  const q = query.toLowerCase();

  if (q.includes('gateway') || q.includes('routing')) {
    return `## 🏢 Gateway Architecture

OpenClaw Gateway là control plane trung tâm, xử lý:
- Authentication (4 modes: none, token, password, trusted-proxy)
- Routing: Channels → Agents (via lanes)
- Session management: main, group, subagent
- Plugin loading, Cron, Tailscale exposure, Control UI

Key files in repository:
- src/gateway/server.impl.ts
- src/gateway/server-ws-runtime.ts
- src/gateway/server-http.ts
- src/gateway/server-lanes.ts
- src/gateway/server-methods.ts

`;
  } else if (q.includes('agent') || q.includes('runtime')) {
    return `## 🤖 Agent Runtime

Sử dụng Pi Agent Framework (from pi-mono):
- Pi Embedded Runner (src/agents/pi-embedded-runner/)
- Subagent System với ACP protocol
- 52 built-in skills + workspace skills
- Context Engine: history + memory + semantic search
- Tool Policy, Sandbox isolation levels
- Bash Tools: PTY, approval, Docker

`;
  } else if (q.includes('channel') || q.includes('zalo')) {
    return `## 📱 Multi-Channel Support (22+)

| Kênh | Protocol | Ghi chú |
|------|----------|--------|
| WhatsApp | Baileys | |
| Telegram | grammY | |
| Discord | discord.js | |
| Slack | Bolt | |
| **Zalo Business** | Zalo OA API | VN-only |
| **Zalo Personal** | Custom | Unique globally |
| iMessage | BlueBubbles | |
| Signal | signal-cli | |
| LINE | LINE | |
| +13 more | | Matrix, Mattermost, Nextcloud Talk, Nostr, Twitch, IRC, Feishu, MS Teams, Google Chat, ...

Channel adapters implement ChannelAdapter interface, Gateway routes uniformly.`;
  } else if (q.includes('provider') || q.includes('llm')) {
    return `## 🧠 LLM Providers (30+)

Cloud: Anthropic (Claude), OpenAI (GPT), Google Gemini, xAI (Grok), Mistral
Local: Ollama, LM Studio
Aggregators: OpenRouter, Vercel AI Gateway, GitHub Copilot, Azure, AWS Bedrock, Groq, Cerebras
Asia: Kimi, DeepSeek, Qwen, Doubao (ByteDance), GLM (Zhipu)

Features:
- OAuth discovery, API key rotation
- Model metadata catalog
- Auth profiles + cooldown
- Failover chain
- Cost tracking`;
  } else if (q.includes('security') || q.includes('sandbox')) {
    return `## 🔒 Security Model

Trust: Host trusted, AI NOT trusted.

Mechanisms:
1. Approval gates for dangerous actions
2. Sandbox isolation (none, workspace, strict, container)
3. Encrypted credentials (OS keychain)
4. Pairing for unknown DMs
5. Rate limiting
6. Auth modes (none, token, password, trusted-proxy)

CVE fixes (v2026.3.11): 7 CVEs (origin validation, session hijacking, SSRF, cred leak, path traversal, webhook bypass, rate limit bypass)`;
  } else if (q.includes('mobile') || q.includes('ios') || q.includes('android')) {
    return `## 📲 Mobile Companion Apps

**macOS**: Menu bar, Voice Wake, WebChat, SSH gateway control, node mode.
**iOS** (TestFlight): Voice trigger forwarding, Canvas, camera, screen recording, Bonjour discovery.
**Android** (Kotlin): Talk Mode, camera, SMS intercept, notifications, location, device commands.

Protocol: ACP over WebSocket (local WiFi / Tailscale VPN).`;
  } else {
    return `## 🌐 OpenClaw Overview

Self-hosted AI assistant gateway (MIT license). Supports 22+ channels, 30+ LLM providers.

5-Tier Architecture:
1. Clients: CLI, Web UI, macOS/iOS/Android apps
2. Channels: WhatsApp, Telegram, Discord, Slack, Zalo, iMessage, ...
3. Gateway: WebSocket + HTTP (port 18789)
4. Agent Runtime: Pi agent core, context, tools, skills
5. LLM Providers: Anthropic, OpenAI, Ollama, ...

Top-level directories in this repo: ${entries.slice(0, 10).join(', ')}...`;
  }
}

function generateReport(query, answer, entries, files) {
  let report = `# OpenClaw Deep Analysis Report\n\n`;
  report += `**Generated**: ${new Date().toISOString()}\n`;
  report += `**Query**: ${query}\n`;
  report += `**Source**: ${DEFAULT_PATH}\n\n`;

  if (files['VISION.md']) {
    report += `> From VISION.md:\n> ${files['VISION.md'].split('\n').slice(0, 3).join('\n> ')}...\n\n`;
  }

  report += answer;

  report += `\n\n## Repository Structure\n\n`;
  report += `Top-level entries (${entries.length} total):\n`;
  for (const e of entries.slice(0, 20)) {
    report += `- ${e}\n`;
  }

  if (files['package.json']) {
    try {
      const pkg = JSON.parse(files['package.json']);
      report += `\n**Package**: ${pkg.name}@${pkg.version}\n`;
    } catch (e) {}
  }

  report += `\n---\n*Generated by openclaw-deep-understanding (minimal version)*\n`;
  return report;
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
