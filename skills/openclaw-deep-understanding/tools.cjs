// Mock tools for openclaw-deep-understanding skill testing
// CommonJS version

const { readFileSync, writeFileSync, existsSync, mkdirSync } = require('fs');
const { dirname } = require('path');

/**
 * Mock read tool
 */
async function read({ file_path, limit }) {
  try {
    if (!existsSync(file_path)) {
      throw new Error(`File not found: ${file_path}`);
    }
    const content = readFileSync(file_path, 'utf8');
    if (limit) {
      const lines = content.split('\n').slice(0, limit);
      return lines.join('\n');
    }
    return content;
  } catch (e) {
    throw new Error(`read failed for ${file_path}: ${e.message}`);
  }
}

/**
 * Mock memory_search tool
 */
async function memory_search({ query, maxResults = 10 }) {
  return { results: [] };
}

/**
 * Mock memory_get tool
 */
async function memory_get({ path, from, lines }) {
  return [];
}

/**
 * Mock write tool (actually writes to disk for verification)
 */
async function write({ file_path, content }) {
  console.log(`\n📝 [Mock] Writing to: ${file_path} (${content.length} chars)`);
  writeFileSync(file_path, content);
  return file_path;
}

/**
 * Mock edit tool
 */
async function edit({ file_path, oldText, newText }) {
  if (!existsSync(file_path)) {
    throw new Error(`File not found: ${file_path}`);
  }
  const content = readFileSync(file_path, 'utf8');
  if (!content.includes(oldText)) {
    throw new Error(`oldText not found in ${file_path}`);
  }
  const newContent = content.replace(oldText, newText);
  writeFileSync(file_path, newContent);
  return { file_path, changed: true };
}

/**
 * Mock exec tool
 */
async function exec({ command, timeout, cwd }) {
  return { stdout: '', stderr: '', exitCode: 0 };
}

/**
 * Mock process tool (for background processes)
 */
function process() {
  return {
    action: 'list',
    sessions: []
  };
}

module.exports = { read, memory_search, memory_get, write, edit, exec, process };