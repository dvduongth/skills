import skillModule from './src/skill.ts';
const { skill } = skillModule;
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// Provide OpenClaw-like tools
global.read = async ({ file_path, limit }) => {
  try {
    if (!existsSync(file_path)) {
      throw new Error(`File not found: ${file_path}`);
    }
    const content = readFileSync(file_path, 'utf8');
    if (limit) {
      return content.split('\n').slice(0, limit).join('\n');
    }
    return content;
  } catch (e) {
    throw new Error(`read failed for ${file_path}: ${e.message}`);
  }
};

global.memory_search = async ({ query, maxResults = 10 }) => {
  return { results: [] };
};

global.memory_get = async ({ path, from, lines }) => {
  return [];
};

global.write = async ({ file_path, content }) => {
  const dir = dirname(file_path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  console.log(`\n📝 Writing report to: ${file_path} (${content.length} chars)\n`);
  writeFileSync(file_path, content, 'utf8');
  return file_path;
};

global.exec = async ({ command, timeout, cwd }) => {
  return { stdout: '', stderr: '' };
};

// Execute
console.log('🚀 Starting OpenClaw deep analysis...\n');

try {
  const result = await skill({
    query: "Phân tích OpenClaw agents và gateway",
    contextPath: "D:\\PROJECT\\CCN2\\openclaw",
    outputPath: "D:\\PROJECT\\CCN2\\research_doc\\open_claw\\analysis\\analysis.md",
    depth: "module",
    generateDiagrams: true
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ ANALYSIS COMPLETE');
  console.log('='.repeat(60));
  console.log(result);
  console.log('='.repeat(60));
  
} catch (error) {
  console.error('\n❌ FAILED:', error);
  process.exit(1);
}