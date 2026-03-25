#!/bin/bash
# Quick Test Script for godot-deep-understanding skill
# Run from skill directory

set -e

echo "🔧 Testing godot-deep-understanding skill..."

# Check TypeScript syntax
echo "📝 Checking TypeScript syntax..."
npx tsc --noEmit src/types.ts 2>&1 || echo "⚠️  TypeScript check failed (types only)"
npx tsc --noEmit src/helpers.ts 2>&1 || echo "⚠️  TypeScript check failed (helpers)"
npx tsc --noEmit src/skill.ts 2>&1 || { echo "❌ TypeScript syntax errors in skill.ts"; exit 1; }

# Run unit tests
echo "🧪 Running unit tests..."
node --test tests/skill.test.ts

# Check file structure
echo "📁 Verifying file structure..."
required_files=(
  "SKILL.md"
  "src/types.ts"
  "src/helpers.ts"
  "src/skill.ts"
  "tests/skill.test.ts"
  "scripts/package_skill.py"
  "README.md"
)

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing required file: $file"
    exit 1
  fi
done

echo "✅ All required files present"

# Check SKILL.md frontmatter
echo "📋 Checking SKILL.md frontmatter..."
if ! head -1 SKILL.md | grep -q "---"; then
  echo "❌ SKILL.md must start with YAML frontmatter (---)"
  exit 1
fi

if ! grep -q "^name:" SKILL.md; then
  echo "❌ SKILL.md must have 'name:' in frontmatter"
  exit 1
fi

if ! grep -q "^description:" SKILL.md; then
  echo "❌ SKILL.md must have 'description:' in frontmatter"
  exit 1
fi

echo "✅ SKILL.md frontmatter valid"

# Count test cases
echo "📊 Test statistics:"
test_count=$(grep -c "it((" tests/skill.test.ts || echo 0)
echo "   Unit test cases: $test_count"

echo ""
echo "✅ Quick test completed successfully!"
echo ""
echo "Next steps:"
echo "1. Set GODOT_PATH environment variable to Godot source"
echo "2. Run a sample query through OpenClaw: 'Phân tích Godot architecture'"
echo "3. Check output and verify diagrams"
echo ""