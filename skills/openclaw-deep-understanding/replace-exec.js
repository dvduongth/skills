const fs = require('fs');
const path = 'D:\\PROJECT\\CCN2\\.claude\\skills\\openclaw-deep-understanding\\analysis.js';

try {
  let content = fs.readFileSync(path, 'utf8');
  const matches = content.match(/\bexec\(/g) || [];
  const count = matches.length;
  
  if (count > 0) {
    let newContent = content.replace(/\bexec\(/g, 'execCmd(');
    fs.writeFileSync(path, newContent, 'utf8');
    console.log(`✅ Replaced ${count} exec() calls with execCmd()`);
  } else {
    console.log("ℹ️  No exec() calls found - maybe already fixed?");
  }
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
