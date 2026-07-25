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

async function saveDirectlyToSupabase(input: SavePixelProfileInput): Promise<SavePixelProfileResult> {
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
  invalidateMyCardsCache(input.userId);
  return {
    id: input.cardId,
    avatarUrl,
    cardUrl,
    downloadUrl: `/download/${input.cardId}`,
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
    const result = (await response.json()) as SavePixelProfileResult;
    invalidateMyCardsCache(input.userId);
    return result;
  }
  if (response.status === 404 && contentType.includes('text/html')) {
    // The local app does not expose Pages Functions; production JSON errors never reach this path.
    return saveDirectlyToSupabase(input);
  }
  let message = `像素名片保存失败（${response.status}）`;
  if (contentType.includes('application/json')) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    if (payload?.error) message = payload.error;
  }
  throw new Error(message);
}
