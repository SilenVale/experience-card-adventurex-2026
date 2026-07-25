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
  const avatarPath = `${input.userId}/avatars/pixel-avatar.png`;
  const cardPath = `${input.userId}/cards/${input.cardId}.png`;

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
  const { error } = await supabase
    .from('profiles')
    .update({
      avatar_url: avatarUrl,
      pixel_keywords: input.keywords,
      pixel_card_url: cardUrl,
      pixel_card_id: input.cardId,
    })
    .eq('id', input.userId);

  if (error) throw new Error(error.message);
  return {
    id: input.cardId,
    avatarUrl,
    cardUrl,
    downloadUrl: `/download/${input.cardId}`,
  };
}

export async function savePixelProfile(input: SavePixelProfileInput): Promise<SavePixelProfileResult> {
  try {
    const response = await fetch('/api/experience-cards', {
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

    const contentType = response.headers.get('content-type') ?? '';
    if (response.ok && contentType.includes('application/json')) {
      return (await response.json()) as SavePixelProfileResult;
    }
  } catch {
    // Local Vite and Vercel do not expose Cloudflare Pages Functions.
  }

  return saveDirectlyToSupabase(input);
}
