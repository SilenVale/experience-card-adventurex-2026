import { supabase } from '@/lib/supabase';

export interface ProfileRecord {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  pixel_avatar_url: string | null;
  pixel_keywords: string[];
  pixel_card_url: string | null;
  pixel_card_id: string | null;
}

export async function getMyProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, pixel_avatar_url, pixel_keywords, pixel_card_url, pixel_card_id')
    .eq('id', userId)
    .maybeSingle();

  if (!error) return data as ProfileRecord | null;

  // Keep the existing profile page usable until the pixel-profile migration is applied.
  if (!/pixel_(avatar_url|keywords|card_url|card_id)/.test(error.message)) {
    throw new Error(error.message);
  }

  const fallback = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, pixel_keywords, pixel_card_url, pixel_card_id')
    .eq('id', userId)
    .maybeSingle();

  if (fallback.error && !/pixel_(keywords|card_url|card_id)/.test(fallback.error.message)) throw new Error(fallback.error.message);
  if (fallback.error) {
    const base = await supabase.from('profiles').select('id, display_name, avatar_url').eq('id', userId).maybeSingle();
    if (base.error) throw new Error(base.error.message);
    if (!base.data) return null;
    return { ...base.data, pixel_avatar_url: null, pixel_keywords: [], pixel_card_url: null, pixel_card_id: null } as ProfileRecord;
  }
  if (!fallback.data) return null;
  return {
    ...fallback.data,
    pixel_avatar_url: null,
    pixel_keywords: [],
    pixel_card_url: null,
    pixel_card_id: null,
  } as ProfileRecord;
}

export async function updateMyProfileName(userId: string, displayName: string) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, display_name: displayName.trim() || null }, { onConflict: 'id' })
    .select('id, display_name, avatar_url, pixel_avatar_url, pixel_keywords, pixel_card_url, pixel_card_id')
    .single();
  if (error && /pixel_avatar_url/.test(error.message)) {
    const fallback = await supabase
      .from('profiles')
      .upsert({ id: userId, display_name: displayName.trim() || null }, { onConflict: 'id' })
      .select('id, display_name, avatar_url, pixel_keywords, pixel_card_url, pixel_card_id')
      .single();
    if (fallback.error) throw new Error(fallback.error.message);
    return { ...fallback.data, pixel_avatar_url: null } as ProfileRecord;
  }
  if (error) throw new Error(error.message);
  return data as ProfileRecord;
}

export async function uploadProfileAvatar(userId: string, file: File) {
  const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
  if (!allowed.has(file.type)) throw new Error('头像只支持 JPG、PNG 或 WebP。');
  if (file.size > 5 * 1024 * 1024) throw new Error('头像文件不能超过 5MB。');
  const extension = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/webp' ? 'webp' : 'png';
  const path = `${userId}/avatars/original-${crypto.randomUUID()}.${extension}`;
  const upload = await supabase.storage.from('experience-card-assets').upload(path, file, { contentType: file.type, upsert: false });
  if (upload.error) throw new Error(upload.error.message);
  const url = supabase.storage.from('experience-card-assets').getPublicUrl(path).data.publicUrl;
  const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId);
  if (error) throw new Error(error.message);
  return url;
}
