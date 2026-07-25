import { supabase } from '@/lib/supabase';

export interface ProfileRecord {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export async function getMyProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ProfileRecord | null;
}
