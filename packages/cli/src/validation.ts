/**
 * Validates and normalizes a Supabase project URL.
 * Accepts with or without https://, with or without trailing slash.
 * Must end with .supabase.co
 */
export function normalizeSupabaseUrl(input: string): string {
  let url = input.trim();

  // Strip trailing slash
  if (url.endsWith('/')) url = url.slice(0, -1);

  // Add https:// if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // Upgrade http to https
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  }

  return url;
}

export function validateSupabaseUrl(input: string): string | undefined {
  const url = normalizeSupabaseUrl(input);
  const regex = /^https:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.supabase\.co$/;

  if (!regex.test(url)) {
    return 'Must be a valid Supabase URL (e.g. https://your-project.supabase.co)';
  }

  return undefined; // valid
}

/**
 * Validates a Cloudflare Worker name.
 * Lowercase alphanumeric + hyphens, 1-63 characters.
 */
export function validateWorkerName(input: string): string | undefined {
  const name = input.trim();

  if (name.length === 0) {
    return 'Worker name is required';
  }

  if (name.length > 63) {
    return 'Must be 63 characters or fewer';
  }

  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(name)) {
    return 'Must be lowercase letters, numbers, and hyphens only (e.g. my-proxy)';
  }

  return undefined;
}

/**
 * Validates CORS allowed origins.
 * Accepts * or comma-separated valid URLs.
 * Uses URL parsing to prevent injection attacks.
 */
export function validateOrigins(input: string): string | undefined {
  const origins = input.trim();

  if (origins === '*') return undefined;

  if (origins.length === 0) {
    return 'Enter allowed origins or * for all';
  }

  const parts = origins.split(',').map((o) => o.trim());
  for (const part of parts) {
    try {
      const url = new URL(part);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return `Invalid origin "${part}" — must use http or https`;
      }
      // Origins should be scheme + host only (no path/query/fragment)
      if (url.pathname !== '/' || url.search || url.hash) {
        return `Invalid origin "${part}" — use just the origin (e.g. https://example.com)`;
      }
    } catch {
      return `Invalid origin "${part}" — must be a valid URL (e.g. https://example.com)`;
    }
  }

  return undefined;
}
