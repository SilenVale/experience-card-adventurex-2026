import {
  compactId,
  decodePng,
  getUser,
  json,
  removePng,
  storagePathFromPublicUrl,
  supabaseConfig,
  uploadPng,
} from '../_shared/pixel.js';

export async function onRequestPost({ request, env }) {
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return json({ error: 'Authentication required' }, 401);
    const config = supabaseConfig(env);
    const user = await getUser(config, token);
    if (!user?.id) return json({ error: 'Authentication required' }, 401);
    const body = await request.json();
    const id = String(body.id || '').toLowerCase();
    if (id !== compactId(user.id)) return json({ error: 'Invalid card id' }, 400);
    const keywords = Array.isArray(body.keywords)
      ? body.keywords.filter((keyword) => typeof keyword === 'string').slice(0, 6)
      : [];
    const previousProfileResponse = await fetch(`${config.url}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=pixel_avatar_url,pixel_card_url`, {
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${token}`,
      },
    });
    const previousProfiles = previousProfileResponse.ok ? await previousProfileResponse.json() : [];
    const previousProfile = Array.isArray(previousProfiles) ? previousProfiles[0] : null;
    const version = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const avatarPath = `${user.id}/avatars/pixel-avatar-${version}.png`;
    const cardPath = `${user.id}/cards/${id}-${version}.png`;
    const avatarUrl = await uploadPng(config, token, avatarPath, decodePng(body.avatarData));
    const cardUrl = await uploadPng(config, token, cardPath, decodePng(body.imageData));
    const profileResponse = await fetch(`${config.url}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}`, {
      method: 'PATCH',
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ pixel_avatar_url: avatarUrl, pixel_keywords: keywords, pixel_card_url: cardUrl, pixel_card_id: id }),
    });
    if (!profileResponse.ok) throw new Error(`Profile update failed (${profileResponse.status})`);
    const stalePaths = [
      storagePathFromPublicUrl(config, user.id, previousProfile?.pixel_avatar_url, 'avatars'),
      storagePathFromPublicUrl(config, user.id, previousProfile?.pixel_card_url, 'cards'),
    ].filter(Boolean);
    const nextPaths = new Set([
      storagePathFromPublicUrl(config, user.id, avatarUrl, 'avatars'),
      storagePathFromPublicUrl(config, user.id, cardUrl, 'cards'),
    ]);
    const staleUniquePaths = [...new Set(stalePaths)].filter((path) => !nextPaths.has(path));
    let removedPrevious = true;
    try {
      removedPrevious = await removePng(config, token, staleUniquePaths);
    } catch {
      removedPrevious = false;
    }
    return json({ id, avatarUrl, cardUrl, downloadUrl: `/download/${id}`, removedPrevious }, 201);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unable to save pixel profile' }, 500);
  }
}
