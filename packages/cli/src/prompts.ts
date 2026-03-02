import * as clack from '@clack/prompts';
import pc from 'picocolors';
import path from 'node:path';
import { normalizeSupabaseUrl, validateSupabaseUrl, validateWorkerName, validateOrigins } from './validation.js';

/** Block writing to system-critical directories */
const DANGEROUS_PREFIXES = ['/etc', '/usr', '/bin', '/sbin', '/var', '/boot', '/root', '/sys', '/proc', '/dev',
  'C:\\Windows', 'C:\\Program Files', 'C:\\Program Files (x86)', 'C:\\System32'];

type SupabaseService = 'rest' | 'auth' | 'storage' | 'realtime' | 'functions' | 'graphql';

export interface UserAnswers {
  supabaseUrl: string;
  allowedOrigins: string;
  enabledServices: SupabaseService[];
  workerName: string;
  projectDir: string;
}

/**
 * Handles Ctrl+C cancellation from any prompt.
 */
function handleCancel(value: unknown): void {
  if (clack.isCancel(value)) {
    clack.cancel('Setup cancelled.');
    process.exit(0);
  }
}

/**
 * Runs the full interactive prompt flow.
 * Returns validated user answers.
 */
export async function runPrompts(): Promise<UserAnswers> {
  // 1. Supabase project URL
  const supabaseUrlRaw = await clack.text({
    message: 'What is your Supabase project URL?',
    placeholder: 'https://your-project.supabase.co',
    validate(value) {
      return validateSupabaseUrl(value);
    },
  });
  handleCancel(supabaseUrlRaw);
  const supabaseUrl = normalizeSupabaseUrl(supabaseUrlRaw as string);

  // 2. CORS allowed origins
  const originsRaw = await clack.text({
    message: 'Allowed CORS origins (comma-separated, or * for all)',
    placeholder: '*',
    initialValue: '*',
    validate(value) {
      return validateOrigins(value);
    },
  });
  handleCancel(originsRaw);
  const allowedOrigins = (originsRaw as string).trim();

  // 3. Which services to enable
  const servicesRaw = await clack.multiselect({
    message: 'Which Supabase services should the proxy support?',
    options: [
      { value: 'rest', label: 'REST API', hint: 'PostgREST queries' },
      { value: 'auth', label: 'Auth', hint: 'GoTrue authentication' },
      { value: 'storage', label: 'Storage', hint: 'File uploads & downloads' },
      { value: 'realtime', label: 'Realtime', hint: 'WebSocket subscriptions' },
      { value: 'functions', label: 'Edge Functions', hint: 'Serverless functions' },
      { value: 'graphql', label: 'GraphQL', hint: 'pg_graphql endpoint' },
    ],
    initialValues: ['rest', 'auth', 'storage', 'realtime', 'functions', 'graphql'],
    required: true,
  });
  handleCancel(servicesRaw);
  const enabledServices = servicesRaw as SupabaseService[];

  // 4. Worker name
  const workerNameRaw = await clack.text({
    message: 'Worker name (used in Cloudflare dashboard & URL)',
    placeholder: 'supabase-proxy',
    initialValue: 'supabase-proxy',
    validate(value) {
      return validateWorkerName(value);
    },
  });
  handleCancel(workerNameRaw);
  const workerName = (workerNameRaw as string).trim();

  // 5. Project directory
  const projectDirRaw = await clack.text({
    message: 'Project directory',
    placeholder: `./${workerName}`,
    initialValue: `./${workerName}`,
    validate(value) {
      const resolved = path.resolve(value.trim());
      const lower = resolved.toLowerCase();
      for (const prefix of DANGEROUS_PREFIXES) {
        if (lower.startsWith(prefix.toLowerCase())) {
          return `Cannot write to system directory: ${prefix}`;
        }
      }
      return undefined;
    },
  });
  handleCancel(projectDirRaw);
  const projectDir = (projectDirRaw as string).trim();

  return {
    supabaseUrl,
    allowedOrigins,
    enabledServices,
    workerName,
    projectDir,
  };
}

/**
 * Shows the welcome banner.
 */
export function showBanner(): void {
  console.log();
  console.log(pc.bold(pc.cyan('  ╭──────────────────────────────────────╮')));
  console.log(pc.bold(pc.cyan('  │                                      │')));
  console.log(pc.bold(pc.cyan('  │') + '   🚀 ' + pc.white('create-jiobase') + '                  ' + pc.cyan('│')));
  console.log(pc.bold(pc.cyan('  │') + pc.gray('   Self-host your Supabase proxy') + '      ' + pc.cyan('│')));
  console.log(pc.bold(pc.cyan('  │                                      │')));
  console.log(pc.bold(pc.cyan('  ╰──────────────────────────────────────╯')));
  console.log();
}

/**
 * Confirms directory overwrite if non-empty.
 */
export async function confirmOverwrite(dir: string): Promise<boolean> {
  const result = await clack.confirm({
    message: `Directory ${pc.yellow(dir)} already exists and is not empty. Overwrite?`,
    initialValue: false,
  });
  handleCancel(result);
  return result as boolean;
}

/**
 * Asks user if they want to install wrangler.
 */
export async function confirmWranglerInstall(): Promise<boolean> {
  const result = await clack.confirm({
    message: 'Wrangler CLI not found. Install it now?',
    initialValue: true,
  });
  handleCancel(result);
  return result as boolean;
}

/**
 * Asks user if they want to deploy now.
 */
export async function confirmDeploy(): Promise<boolean> {
  const result = await clack.confirm({
    message: 'Deploy the worker to Cloudflare now?',
    initialValue: true,
  });
  handleCancel(result);
  return result as boolean;
}
