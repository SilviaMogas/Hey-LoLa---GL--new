import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bkzgxqzmkrfgclfxjvnt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

function initSupabase(): SupabaseClient {
  if (!supabaseAnonKey) {
    console.warn('[Supabase] VITE_SUPABASE_ANON_KEY is not set — database features will use seed data only.');
    return createClient(supabaseUrl, 'placeholder', { auth: { persistSession: false } });
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = initSupabase();
