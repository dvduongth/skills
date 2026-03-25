import { readFile, writeFile } from "node:fs/promises";
const path = "D:\\PROJECT\\CCN2\\.claude\\skills\\openclaw-deep-understanding\\analysis.mjs";

(async () => {
  const content = await readFile(path, "utf8");
  const replaced = content.replace(/\bexec\(/g, "execCmd(");
  await writeFile(path, replaced, "utf8");
  console.log("Replaced all exec() with execCmd()");
})().catch(console.error);
