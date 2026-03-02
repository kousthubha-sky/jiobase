import spawn from 'cross-spawn';

export interface ExecResult {
  code: number;
  stdout: string;
  stderr: string;
}

/**
 * Cross-platform command runner. Uses cross-spawn for Windows .cmd compatibility.
 * @param cmd - Command to run
 * @param args - Arguments
 * @param options - Spawn options (cwd, env, etc.)
 */
export function exec(
  cmd: string,
  args: string[],
  options?: { cwd?: string; env?: NodeJS.ProcessEnv },
): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      ...options,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (d: Buffer) => {
      stdout += d.toString();
    });

    child.stderr?.on('data', (d: Buffer) => {
      stderr += d.toString();
    });

    child.on('close', (code) => {
      resolve({ code: code ?? 1, stdout: stdout.trim(), stderr: stderr.trim() });
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Run a command with inherited stdio (user sees full output).
 * Used for interactive commands like `wrangler login`.
 */
export function execInteractive(
  cmd: string,
  args: string[],
  options?: { cwd?: string },
): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      ...options,
      stdio: 'inherit',
    });

    child.on('close', (code) => {
      resolve(code ?? 1);
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}
