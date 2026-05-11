// Single source of truth for the back-office admin allow-list. Used by:
//   - src/App.tsx (whether to render the "Back Office" entry button)
//   - api/invite-venue (whether the bearer ID token belongs to an admin)
//
// Mirror this list in firestore.rules whenever it changes — Firestore can't
// import TS, so the rule file keeps its own copy in the isAdmin() helper.
//
// `ADMIN_EMAILS` env var (comma-separated) overrides this in any environment
// that needs to add an admin without a redeploy of the front-end.

const FALLBACK_ADMIN_EMAILS = [
  'hello@silviamogas.com',
  'hey@heylola.co',
];

function readEnv(name: string): string | undefined {
  // Browser bundles (Vite) expose env vars on import.meta.env.VITE_*; the
  // server (Vercel API routes) uses process.env directly. Try both so the
  // helper works on either side without a wrapper at every call site.
  if (typeof process !== 'undefined' && process.env && process.env[name]) return process.env[name];
  // @ts-ignore — import.meta only exists in module context
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[`VITE_${name}`]) return import.meta.env[`VITE_${name}`];
  return undefined;
}

export function getAdminEmails(): string[] {
  const raw = readEnv('ADMIN_EMAILS') || readEnv('ADMIN_EMAIL');
  const fromEnv = (raw || '').split(',').map(s => s.trim()).filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : FALLBACK_ADMIN_EMAILS;
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const target = email.toLowerCase();
  return getAdminEmails().some(a => a.toLowerCase() === target);
}
