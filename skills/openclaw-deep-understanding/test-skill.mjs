/**
 * OpenClaw Deep Understanding Skill — Implementation Test
 * Standalone script để test skill logic (không cần chạy qua agent runtime)
 *
 * Usage: node test-skill.mjs "query" [depth] [output]
 */

import { openclawDeepUnderstanding } from "./src/skill.js";

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: node test-skill.mjs <query> [depth] [outputPath]");
    process.exit(1);
  }

  const query = args[0];
  const depth = (args[1] as "overview" | "module" | "file") || "module";
  const outputPath = args[2];

  console.log(`🚀 Starting OpenClaw Deep Understanding...`);
  console.log(`   Query: ${query}`);
  console.log(`   Depth: ${depth}`);
  console.log(`   Output: ${outputPath || "none (chat only)"}`);

  try {
    const result = await openclawDeepUnderstanding({
      query,
      contextPath: "D:\\PROJECT\\CCN2\\openclaw",
      depth,
      outputPath,
      runTests: false,
      generateDiagrams: true,
    });

    console.log("\n✅ Success!");
    console.log("\n--- ANSWER ---\n");
    console.log(result.answer);
    if (result.reportPath) {
      console.log(`\n📄 Report written to: ${result.reportPath}`);
    }
    if (result.memoryUpdated) {
      console.log(`\n💾 Memory updated with new insights.`);
    }
  } catch (err) {
    console.error("\n❌ Error:", err);
    process.exit(1);
  }
}

main();
