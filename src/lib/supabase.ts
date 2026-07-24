import { createClient } from '@supabase/supabase-js';

function cleanPublicEnv(value: string | undefined) {
  return value?.trim().replace(/^['\"]|['\"]$/g, '') ?? '';
}

const supabaseUrl = cleanPublicEnv(import.meta.env.VITE_PUBLIC_SUPABASE_URL as string);
const supabaseAnonKey = cleanPublicEnv(import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase public configuration is missing. Check VITE_PUBLIC_SUPABASE_URL and VITE_PUBLIC_SUPABASE_ANON_KEY.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
