// Supabase helpers — error handling, owned-doc toggle, etc.
import { supabase } from './supabase';

export { supabase };
export const db = supabase;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  READ = 'read',
  WRITE = 'write',
}

export function handleSupabaseError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  console.error('Supabase Error: ', JSON.stringify({ error: errMsg, operationType, path }, null, 2));
}

/** @deprecated Use handleSupabaseError instead — kept for compatibility. */
export const handleFirestoreError = handleSupabaseError;

/**
 * Toggle a per-user owned row keyed by (user_id, matchField=matchValue).
 * If the row exists, delete it. Otherwise insert one.
 */
export async function toggleOwnedDoc(
  tableName: string,
  matchField: string,
  matchValue: string,
  extraFields: Record<string, unknown> = {}
): Promise<{ created: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not_signed_in');

  const { data: existing } = await supabase
    .from(tableName)
    .select('id')
    .eq('user_id', user.id)
    .eq(matchField, matchValue)
    .limit(1);

  if (!existing || existing.length === 0) {
    await supabase.from(tableName).insert({
      user_id: user.id,
      [matchField]: matchValue,
      created_at: new Date().toISOString(),
      ...extraFields,
    });
    return { created: true };
  }

  await supabase.from(tableName).delete().eq('id', existing[0].id);
  return { created: false };
}
