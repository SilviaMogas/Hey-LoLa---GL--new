import { cert, getApps, initializeApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

// Shared bootstrap for every Vercel API route that needs server-side
// Firestore / Auth access via the Admin SDK. Centralised so endpoints
// stop carrying near-identical 15-line copies of the same init dance.
//
// Required env (any host):
//   FIREBASE_ADMIN_PROJECT_ID
//   FIREBASE_ADMIN_CLIENT_EMAIL
//   FIREBASE_ADMIN_PRIVATE_KEY  (PEM; we accept literal \n, real newlines,
//                                surrounding quotes, or base64-encoded PEM)
//   FIREBASE_DATABASE_ID        (optional named database)

let cachedApp: App | null = null;

/**
 * Defensive parser for the private key env var. Different hosts store
 * multi-line PEMs in slightly different ways and we've been burned by
 * silent corruption (Vercel strips backslashes, dotenv keeps quotes,
 * etc.). Handles every common variant we've seen.
 */
function parsePrivateKey(raw: string): string {
  let key = raw.trim();

  // Strip surrounding double/single quotes if the user pasted the JSON
  // value with its quotes attached.
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }

  // Base64-encoded PEM fallback. If the value doesn't start with -----BEGIN
  // and looks base64-ish, try to decode it. This is the safest way to ship
  // a multi-line key through a single-line env var.
  if (!key.startsWith('-----BEGIN') && /^[A-Za-z0-9+/=]+$/.test(key.slice(0, 64).replace(/\s/g, ''))) {
    try {
      const decoded = Buffer.from(key, 'base64').toString('utf8');
      if (decoded.startsWith('-----BEGIN')) key = decoded;
    } catch { /* fall through */ }
  }

  // Convert literal `\n` escape sequences to real newlines. (No-op if the
  // value already contains real newlines.)
  if (key.includes('\\n')) key = key.replace(/\\n/g, '\n');

  // Normalise Windows-style line endings.
  key = key.replace(/\r\n/g, '\n');

  return key;
}

export function getAdminApp(): App {
  if (cachedApp) return cachedApp;
  const existing = getApps()[0];
  if (existing) {
    cachedApp = existing;
    return existing;
  }
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const pemFromEnv = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!projectId || !clientEmail || !pemFromEnv) {
    throw new Error(
      `Firebase Admin env vars are not configured. Got: ` +
      `projectId=${projectId ? 'set' : 'MISSING'}, ` +
      `clientEmail=${clientEmail ? 'set' : 'MISSING'}, ` +
      `privateKey=${pemFromEnv ? `set (${pemFromEnv.length} chars)` : 'MISSING'}.`
    );
  }

  const privateKey = parsePrivateKey(pemFromEnv);

  // Diagnostic logging — visible in Vercel Function Logs. Helps debug
  // "Invalid PEM" without leaking the actual key. Logs only structural
  // info: length, line count, first/last marker presence.
  const firstMarker = privateKey.startsWith('-----BEGIN');
  const lastMarker = privateKey.trim().endsWith('-----END PRIVATE KEY-----');
  const lineCount = privateKey.split('\n').length;
  console.log('[admin] privateKey parsed:', {
    rawLength: pemFromEnv.length,
    parsedLength: privateKey.length,
    lineCount,
    hasBeginMarker: firstMarker,
    hasEndMarker: lastMarker,
    hasRealNewlines: privateKey.includes('\n'),
    hasLiteralBackslashN: privateKey.includes('\\n'),
  });

  if (!firstMarker || !lastMarker) {
    throw new Error(
      `FIREBASE_ADMIN_PRIVATE_KEY does not look like a valid PEM. ` +
      `hasBeginMarker=${firstMarker}, hasEndMarker=${lastMarker}, ` +
      `lineCount=${lineCount}. ` +
      `Make sure you copied the full key from the service account JSON ` +
      `(starting with "-----BEGIN PRIVATE KEY-----").`
    );
  }

  cachedApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
  return cachedApp;
}

export function getAdminDb(): Firestore {
  const app = getAdminApp();
  const dbId = process.env.FIREBASE_DATABASE_ID;
  return dbId ? getFirestore(app, dbId) : getFirestore(app);
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

/**
 * Resolve the public URL the request is being served from. Prefers the
 * APP_URL env var (set on Vercel for the production domain) and falls
 * back to the forwarded headers so preview deploys / local dev still
 * generate working absolute links.
 */
export function appUrl(req: { headers?: Record<string, string | string[] | undefined> }): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  const proto = (req.headers?.['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers?.['x-forwarded-host'] as string) || (req.headers?.host as string) || 'heylola.co';
  return `${proto}://${host}`;
}

