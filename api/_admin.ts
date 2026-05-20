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
//   FIREBASE_ADMIN_PRIVATE_KEY  (with literal \n; we unescape before cert())
//   FIREBASE_DATABASE_ID        (optional named database)

let cachedApp: App | null = null;

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
    throw new Error('Firebase Admin env vars are not configured.');
  }
  cachedApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey: pemFromEnv.replace(/\\n/g, '\n') }),
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

