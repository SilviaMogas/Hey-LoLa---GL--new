import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { collection, doc, deleteDoc, getDocs, query, setDoc, where, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCEkCyWOIdboR-IaiYpz9_wnN4LyIjvTYw",
  authDomain: "hey-lola-5c343.firebaseapp.com",
  projectId: "hey-lola-5c343",
  firestoreDatabaseId: "ai-studio-041ff40c-7f72-4aad-a12c-bcd060760a1d",
  storageBucket: "hey-lola-5c343.firebasestorage.app",
  messagingSenderId: "744618880776",
  appId: "1:744618880776:web:27aedda38a26a2708746bd",
  measurementId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics (conditionally)
export const analytics = typeof window !== "undefined" ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;

// Services
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  READ = 'read',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo, null, 2));
  // NOTE: this used to `throw`, which turned any recoverable read failure
  // (e.g. a permission error before security rules are published, or a missing
  // index) into a full-page crash via the ErrorBoundary ("Something broke").
  // We now log and return so the UI degrades gracefully — sections that can't
  // load just stay empty instead of white-screening the whole page.
}

/**
 * Toggle a per-user owned doc in `collectionName` keyed by (userId, matchField=matchValue).
 * If the doc exists for the current user, delete it. Otherwise create one with
 * `userId`, the matchField, and any extra fields. Returns whether the doc was created.
 */
export async function toggleOwnedDoc(
  collectionName: string,
  matchField: string,
  matchValue: string,
  extraFields: Record<string, unknown> = {}
): Promise<{ created: boolean }> {
  if (!auth.currentUser) throw new Error('not_signed_in');
  const ref = collection(db, collectionName);
  const snap = await getDocs(query(
    ref,
    where('userId', '==', auth.currentUser.uid),
    where(matchField, '==', matchValue),
  ));
  if (snap.empty) {
    await setDoc(doc(ref), {
      userId: auth.currentUser.uid,
      [matchField]: matchValue,
      createdAt: new Date().toISOString(),
      ...extraFields,
    });
    return { created: true };
  }
  await deleteDoc(snap.docs[0].ref);
  return { created: false };
}

export default app;
