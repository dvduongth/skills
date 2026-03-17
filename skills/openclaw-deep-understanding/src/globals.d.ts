/**
 * OpenClaw runtime globals — injected by the OpenClaw agent runtime.
 * Declared here so TypeScript/ts-node doesn't complain during tests.
 */

declare function memory_search(opts: { query: string; maxResults?: number }): Promise<{ results: { text: string; [key: string]: any }[] }>;
declare function memory_get(opts: { path?: string; from?: string; lines?: number }): Promise<any[]>;
declare function exec(opts: { command: string; timeout?: number; cwd?: string }): Promise<{ stdout: string; stderr: string }>;
declare function read(opts: { file_path: string; limit?: number }): Promise<string>;
declare function write(opts: { file_path: string; content: string }): Promise<string>;
declare function edit(opts: { file_path: string; old_string: string; new_string: string }): Promise<void>;
