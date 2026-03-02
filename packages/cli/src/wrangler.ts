import which from 'which';
import { exec, execInteractive } from './utils.js';

/**
 * Checks if wrangler CLI is installed globally.
 */
export async function isWranglerInstalled(): Promise<boolean> {
  try {
    await which('wrangler');
    return true;
  } catch {
    return false;
  }
}

/**
 * Installs wrangler globally via npm.
 * Returns true on success, false on failure.
 */
export async function installWrangler(): Promise<{ success: boolean; error?: string }> {
  try {
    await exec('npm', ['install', '-g', 'wrangler']);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // Check for permission errors (common on Unix without sudo)
    if (message.includes('EACCES') || message.includes('permission denied')) {
      return {
        success: false,
        error: 'Permission denied. Try:\n  sudo npm install -g wrangler\n\nOr use npx wrangler instead (no install needed).',
      };
    }

    return { success: false, error: message };
  }
}

/**
 * Checks if the user is authenticated with Cloudflare.
 * Returns true if `wrangler whoami` succeeds.
 */
export async function isWranglerAuthenticated(): Promise<boolean> {
  try {
    const result = await exec('wrangler', ['whoami']);
    // wrangler whoami returns 0 even when not logged in, but shows "not authenticated"
    return !result.stdout.toLowerCase().includes('not authenticated');
  } catch {
    return false;
  }
}

/**
 * Runs `wrangler login` interactively (opens browser for OAuth).
 * Returns true on success.
 */
export async function loginWrangler(): Promise<boolean> {
  try {
    await execInteractive('wrangler', ['login']);
    // Verify auth worked
    return await isWranglerAuthenticated();
  } catch {
    return false;
  }
}

/**
 * Deploys the worker project using `wrangler deploy`.
 * Runs inside the project directory.
 * Returns the deployed URL on success.
 */
export async function deployWorker(
  projectDir: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const result = await exec('wrangler', ['deploy'], { cwd: projectDir });
    const output = result.stdout + result.stderr;

    // Extract deployed URL from wrangler output
    // wrangler prints something like: "Published supabase-proxy (1.23 sec)"
    // or "https://supabase-proxy.username.workers.dev"
    const urlMatch = output.match(/https:\/\/[^\s]+\.workers\.dev/);
    const url = urlMatch ? urlMatch[0] : undefined;

    return { success: true, url };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

/**
 * Installs npm dependencies in the project directory.
 */
export async function installDependencies(projectDir: string): Promise<{ success: boolean; error?: string }> {
  try {
    await exec('npm', ['install'], { cwd: projectDir });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
