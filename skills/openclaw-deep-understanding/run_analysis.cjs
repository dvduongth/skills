require('ts-node').register({
  transpileOnly: true,
  project: './tsconfig.json',
  compilerOptions: {
    module: 'commonjs',
    target: 'ES2022',
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true
  }
});

const { readFileSync, writeFileSync, existsSync, mkdirSync } = require('fs');
const { join, dirname } = require('path');

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
  // Simulate Test-Path check
  if (command.includes('Test-Path')) return { stdout: 'True', stderr: '' };

  // Simulate file counts per known OpenClaw module dirs
  if (command.includes('Measure-Object') && command.includes('gateway')) return { stdout: '15', stderr: '' };
  if (command.includes('Measure-Object') && command.includes('agents'))  return { stdout: '22', stderr: '' };
  if (command.includes('Measure-Object') && command.includes('channels')) return { stdout: '18', stderr: '' };
  if (command.includes('Measure-Object') && command.includes('providers')) return { stdout: '31', stderr: '' };
  if (command.includes('Measure-Object') && command.includes('plugins')) return { stdout: '8', stderr: '' };
  if (command.includes('Measure-Object') && command.includes('memory'))  return { stdout: '5', stderr: '' };
  if (command.includes('Measure-Object') && command.includes('browser')) return { stdout: '6', stderr: '' };
  if (command.includes('Measure-Object') && command.includes('cron'))    return { stdout: '4', stderr: '' };
  if (command.includes('Measure-Object') && command.includes('hooks'))   return { stdout: '3', stderr: '' };
  if (command.includes('Measure-Object') && command.includes('tts'))     return { stdout: '5', stderr: '' };
  if (command.includes('Measure-Object') && command.includes('acp'))     return { stdout: '7', stderr: '' };

  // Simulate listing module dir file names
  if (command.includes('Get-ChildItem') && command.includes('-Name')) {
    return { stdout: 'index.ts\nrouter.ts\nhandler.ts\n', stderr: '' };
  }

  // Simulate listing full paths (no actual files to read in mock)
  if (command.includes('Get-ChildItem') && command.includes('FullName')) {
    return { stdout: '', stderr: '' };
  }

  // LOC count per file
  if (command.includes('Get-Content') && command.includes('.Count')) {
    return { stdout: '250', stderr: '' };
  }

  // LOC total for src/
  if (command.includes('Measure-Object') && command.includes('-Line')) {
    return { stdout: '12500', stderr: '' };
  }

  return { stdout: '', stderr: '' };
};

// Import skill
const { skill } = require('./src/skill.ts');

// Execute
(async () => {
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
})();