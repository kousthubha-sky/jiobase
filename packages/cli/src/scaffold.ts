import fs from 'node:fs';
import path from 'node:path';
import type { WorkerConfig } from './templates/worker.js';
import { generateWorkerCode } from './templates/worker.js';
import { generateWranglerToml } from './templates/wrangler-toml.js';
import { generatePackageJson } from './templates/package-json.js';
import { generateTsconfigJson } from './templates/tsconfig-json.js';
import { generateGitignore } from './templates/gitignore.js';

export interface ScaffoldOptions {
  /** Absolute path to the project directory */
  projectDir: string;
  /** Cloudflare Worker name */
  workerName: string;
  /** Worker config (supabase URL, origins, services) */
  config: WorkerConfig;
}

/**
 * Scaffolds a complete Cloudflare Worker project directory.
 * Creates all files needed to deploy a Supabase reverse proxy.
 */
export function scaffoldProject(options: ScaffoldOptions): void {
  const { projectDir, workerName, config } = options;

  // Create directories
  fs.mkdirSync(path.join(projectDir, 'src'), { recursive: true });

  // Write all project files
  const files: Record<string, string> = {
    'src/index.ts': generateWorkerCode(config),
    'wrangler.toml': generateWranglerToml(workerName),
    'package.json': generatePackageJson(workerName),
    'tsconfig.json': generateTsconfigJson(),
    '.gitignore': generateGitignore(),
  };

  for (const [relativePath, content] of Object.entries(files)) {
    const filePath = path.join(projectDir, relativePath);
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}

/**
 * Checks if a directory exists and is non-empty.
 */
export function isDirectoryNonEmpty(dir: string): boolean {
  if (!fs.existsSync(dir)) return false;
  const entries = fs.readdirSync(dir);
  return entries.length > 0;
}
