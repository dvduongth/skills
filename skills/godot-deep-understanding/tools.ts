/**
 * Mock/stub for OpenClaw tools - used during unit testing
 * In production, this is provided by the OpenClaw runtime
 */

export async function readFile(path: string): Promise<string> {
  // Stub for testing - returns empty string
  // In production, this calls the OpenClaw read tool
  const { readFile: fsReadFile } = await import("fs/promises");
  return fsReadFile(path, "utf-8");
}

export async function writeFile(path: string, content: string): Promise<void> {
  // Stub for testing
}
