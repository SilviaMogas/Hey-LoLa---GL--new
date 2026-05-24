import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

/**
 * Server-side Supabase client using the service_role key.
 * Bypasses RLS — use only in API routes, never expose to the browser.
 */
export function getAdminClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      `Supabase env vars are not configured. Got: ` +
      `url=${url ? 'set' : 'MISSING'}, ` +
      `serviceRoleKey=${key ? 'set' : 'MISSING'}.`
    );
  }

  cachedClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cachedClient;
}

/**
 * Resolve the public URL the request is being served from.
 */
export function appUrl(req: { headers?: Record<string, string | string[] | undefined> }): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  const proto = (req.headers?.['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers?.['x-forwarded-host'] as string) || (req.headers?.host as string) || 'heylola.co';
  return `${proto}://${host}`;
}
