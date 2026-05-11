// Bulk-import scripts/places_seed.json + scripts/place_secrets_seed.json
// into Firestore using the Firebase Admin SDK. Run once after a fresh import.
//
//   FIREBASE_ADMIN_PROJECT_ID=...        \
//   FIREBASE_ADMIN_CLIENT_EMAIL=...      \
//   FIREBASE_ADMIN_PRIVATE_KEY="..."     \
//   FIREBASE_DATABASE_ID=...             \
//   node scripts/seed_firestore.mjs
//
// FIREBASE_DATABASE_ID is optional — set it if your project uses a named
// Firestore database (the existing app does, see src/lib/firebase.ts).
//
// Idempotent: existing /places docs are merged (set with merge:true), so
// re-running won't clobber admin edits made via the back office. Existing
// /place_secrets docs preserve their `verificationStatus` and `verifiedAt`
// — only seed-side fields are refreshed.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLACES = path.join(__dirname, 'places_seed.json');
const SECRETS = path.join(__dirname, 'place_secrets_seed.json');

const env = (k) => process.env[k] || '';
const projectId = env('FIREBASE_ADMIN_PROJECT_ID');
const clientEmail = env('FIREBASE_ADMIN_CLIENT_EMAIL');
const pemFromEnv = env('FIREBASE_ADMIN_PRIVATE_KEY');
const databaseId = env('FIREBASE_DATABASE_ID');

if (!projectId || !clientEmail || !pemFromEnv) {
  console.error('Missing FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY');
  process.exit(1);
}

const app = initializeApp({
  credential: cert({ projectId, clientEmail, privateKey: pemFromEnv.replace(/\\n/g, '\n') }),
});
const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

async function loadJson(p) {
  const raw = await fs.readFile(p, 'utf8');
  return JSON.parse(raw);
}

async function seedCollection(name, docs, mergeOpts) {
  const ids = Object.keys(docs);
  console.log(`→ ${name}: ${ids.length} docs`);
  let written = 0;
  // Firestore batches max out at 500 writes.
  const chunkSize = 400;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const batch = db.batch();
    for (const id of chunk) {
      const ref = db.collection(name).doc(id);
      batch.set(ref, { ...docs[id], updatedAt: FieldValue.serverTimestamp() }, mergeOpts);
    }
    await batch.commit();
    written += chunk.length;
    console.log(`  · ${written}/${ids.length}`);
  }
}

async function main() {
  const places = await loadJson(PLACES);
  const secrets = await loadJson(SECRETS);
  await seedCollection('places', places, { merge: true });
  await seedCollection('place_secrets', secrets, { merge: true });
  console.log('Done.');
}

main().catch(err => {
  console.error('seed_firestore failed:', err);
  process.exit(1);
});
