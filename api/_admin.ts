import { cert, getApps, initializeApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Shared bootstrap for every Vercel API route that needs server-side
// Firestore access via the Admin SDK. Centralised so the three endpoints
// (invite-venue, submit-claim, verify-venue) stop carrying near-identical
// 15-line copies of the same init dance.
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
