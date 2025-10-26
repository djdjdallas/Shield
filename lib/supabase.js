// Supabase client configuration for React Native
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const SUPABASE_URL = Constants.expoConfig?.extra?.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials not found. Cloud sync will be disabled.');
}

// Create Supabase client
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

// Check if Supabase is configured
export function isSupabaseConfigured() {
  return supabase !== null;
}

// Clear any stored auth sessions (useful for debugging RLS issues)
export async function clearSupabaseSession() {
  if (supabase) {
    await supabase.auth.signOut();
    console.log('Supabase session cleared');
  }
}
