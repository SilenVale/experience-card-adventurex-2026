import { supabase } from '@/lib/supabase';

export interface SavePixelProfileInput {
  userId: string;
  accessToken: string;
  cardId: string;
  avatarDataUrl: string;
  cardDataUrl: string;
  keywords: string[];
}

export interface SavePixelProfileResult {
  id: string;
  avatarUrl: string;
  cardUrl: string;
  downloadUrl: string;
  removedPrevious: boolean;
}

function invalidateMyCardsCache(userId: string) {
  try { sessionStorage.removeItem(`experience-card:my-cards:${userId}`); } catch { /* storage may be unavailable */ }
  window.dispatchEvent(new CustomEvent('experience-card:profile-updated', { detail: { userId } }));
}

function dataUrlToBlob(dataUrl: string) {
  const [metadata, encoded] = dataUrl.split(',');
  if (!metadata?.startsWith('data:image/png;base64') || !encoded) {
    throw new Error('像素图片格式无效');
  }

  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
  return new Blob([bytes], { type: 'image/png' });
}

function publicAssetUrl(path: string) {
  return supabase.storage.from('experience-card-assets').getPublicUrl(path).data.publicUrl;
}

type PixelAssetFolder = 'avatars' | 'cards';

function storagePathFromPublicUrl(value: string | null | undefined, userId: string, folder: PixelAssetFolder) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    const expectedOrigin = new URL(publicAssetUrl(`${userId}/${folder}/placeholder.png`)).origin;
    const prefix = `/storage/v1/object/public/experience-card-assets/${userId}/${folder}/`;
    if (parsed.origin !== expectedOrigin || !parsed.pathname.startsWith(prefix)) return null;
    const filename = parsed.pathname.slice(prefix.length);
    if (!filename || filename.includes('/') || filename.includes('\\')) return null;
    const decodedFilename = decodeURIComponent(filename);
    if (!decodedFilename || decodedFilename.includes('/') || decodedFilename.includes('\\')) return null;
    return `${userId}/${folder}/${decodedFilename}`;
  } catch {
    return null;
  }
}

async function removePreviousPixelAssets(
  userId: string,
  previous: { pixel_avatar_url?: string | null; pixel_card_url?: string | null } | null,
  next: { avatarUrl: string; cardUrl: string },
) {
  const paths = [
    storagePathFromPublicUrl(previous?.pixel_avatar_url, userId, 'avatars'),
    storagePathFromPublicUrl(previous?.pixel_card_url, userId, 'cards'),
  ].filter((path): path is string => Boolean(path));
  const nextPaths = new Set([
    storagePathFromPublicUrl(next.avatarUrl, userId, 'avatars'),
    storagePathFromPublicUrl(next.cardUrl, userId, 'cards'),
  ]);
  const stalePaths = [...new Set(paths)].filter((path) => !nextPaths.has(path));
  if (!stalePaths.length) return true;
  try {
    const { error } = await supabase.storage.from('experience-card-assets').remove(stalePaths);
    return !error;
  } catch {
    return false;
  }
}

async function saveDirectlyToSupabase(input: SavePixelProfileInput): Promise<SavePixelProfileResult> {
  const { data: previousProfile } = await supabase
    .from('profiles')
    .select('pixel_avatar_url, pixel_card_url')
    .eq('id', input.userId)
    .maybeSingle();
  const version = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const avatarPath = `${input.userId}/avatars/pixel-avatar-${version}.png`;
  const cardPath = `${input.userId}/cards/${input.cardId}-${version}.png`;

  const [avatarUpload, cardUpload] = await Promise.all([
    supabase.storage
      .from('experience-card-assets')
      .upload(avatarPath, dataUrlToBlob(input.avatarDataUrl), { contentType: 'image/png', upsert: true }),
    supabase.storage
      .from('experience-card-assets')
      .upload(cardPath, dataUrlToBlob(input.cardDataUrl), { contentType: 'image/png', upsert: true }),
  ]);

  if (avatarUpload.error) throw new Error(avatarUpload.error.message);
  if (cardUpload.error) throw new Error(cardUpload.error.message);

  const avatarUrl = publicAssetUrl(avatarPath);
  const cardUrl = publicAssetUrl(cardPath);
  let { error } = await supabase
    .from('profiles')
    .update({
      pixel_avatar_url: avatarUrl,
      pixel_keywords: input.keywords,
      pixel_card_url: cardUrl,
      pixel_card_id: input.cardId,
    })
    .eq('id', input.userId);

  if (error && /pixel_avatar_url/.test(error.message)) {
    const fallback = await supabase
      .from('profiles')
      .update({ pixel_keywords: input.keywords, pixel_card_url: cardUrl, pixel_card_id: input.cardId })
      .eq('id', input.userId);
    error = fallback.error;
  }
  if (error) throw new Error(error.message);
  const removedPrevious = await removePreviousPixelAssets(input.userId, previousProfile, { avatarUrl, cardUrl });
  invalidateMyCardsCache(input.userId);
  return {
    id: input.cardId,
    avatarUrl,
    cardUrl,
    downloadUrl: `/download/${input.cardId}`,
    removedPrevious,
  };
}

export async function savePixelProfile(input: SavePixelProfileInput): Promise<SavePixelProfileResult> {
  let response: Response;
  try {
    response = await fetch('/api/experience-cards', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: input.cardId,
        imageData: input.cardDataUrl,
        avatarData: input.avatarDataUrl,
        keywords: input.keywords,
      }),
    });

  } catch {
    // Local Vite has no Pages Functions; a network failure is also safe to handle directly.
    return saveDirectlyToSupabase(input);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (response.ok && contentType.includes('application/json')) {
    const result = (await response.json()) as Partial<SavePixelProfileResult>;
    invalidateMyCardsCache(input.userId);
    return {
      id: result.id ?? input.cardId,
      avatarUrl: result.avatarUrl ?? '',
      cardUrl: result.cardUrl ?? '',
      downloadUrl: result.downloadUrl ?? `/download/${input.cardId}`,
      removedPrevious: result.removedPrevious !== false,
    };
  }
  if (contentType.includes('text/html')) {
    // Local Vite serves index.html with HTTP 200 for unknown /api routes;
    // Pages Functions return JSON in both success and error cases.
    return saveDirectlyToSupabase(input);
  }
  let message = `像素名片保存失败（${response.status}）`;
  if (contentType.includes('application/json')) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    if (payload?.error) message = payload.error;
  }
  throw new Error(message);
}
