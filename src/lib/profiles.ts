import { supabase } from '@/lib/supabase';

export interface ProfileRecord {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  pixel_keywords: string[];
  pixel_card_url: string | null;
  pixel_card_id: string | null;
}

export async function getMyProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, pixel_keywords, pixel_card_url, pixel_card_id')
    .eq('id', userId)
    .maybeSingle();

  if (!error) return data as ProfileRecord | null;

  // Keep the existing profile page usable until the pixel-profile migration is applied.
  if (!/pixel_(keywords|card_url|card_id)/.test(error.message)) {
    throw new Error(error.message);
  }

  const fallback = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .eq('id', userId)
    .maybeSingle();

  if (fallback.error) throw new Error(fallback.error.message);
  if (!fallback.data) return null;
  return {
    ...fallback.data,
    pixel_keywords: [],
    pixel_card_url: null,
    pixel_card_id: null,
  } as ProfileRecord;
}
