const ID_PATTERN = /^[a-f0-9]{32}$/;

export function supabaseConfig(env) {
  const url = env.VITE_PUBLIC_SUPABASE_URL;
  const anonKey = env.VITE_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error('Supabase public environment variables are missing');
  return { url: url.replace(/\/$/, ''), anonKey };
}

export function uuidFromCompactId(id) {
  if (!ID_PATTERN.test(id)) return null;
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}

export function compactId(uuid) {
  return uuid.replaceAll('-', '').toLowerCase();
}

export function isSafePixelCardUrl(config, userId, value) {
  if (typeof value !== 'string' || /[\u0000-\u001f"'<>]/.test(value)) return false;
  let parsed;
  try { parsed = new URL(value); } catch { return false; }
  if (parsed.protocol !== 'https:' || parsed.origin !== config.url) return false;
  const prefix = `/storage/v1/object/public/experience-card-assets/${userId}/cards/`;
  if (!parsed.pathname.startsWith(prefix)) return false;
  const filename = parsed.pathname.slice(prefix.length);
  if (!filename || filename.includes('/') || filename.includes('\\')) return false;
  try { if (decodeURIComponent(filename) !== filename) return false; } catch { return false; }
  return true;
}

export async function getPublicPixelCardUrl(config, compactCardId) {
  const userId = uuidFromCompactId(compactCardId);
  if (!userId) return null;
  const response = await fetch(`${config.url}/rest/v1/rpc/get_public_pixel_card_url`, {
    method: 'POST',
    headers: { apikey: config.anonKey, 'content-type': 'application/json' },
    body: JSON.stringify({ p_compact_card_id: compactCardId }),
  });
  if (!response.ok) return null;
  const value = await response.json();
  const url = typeof value === 'string' ? value : Array.isArray(value) ? value[0]?.pixel_card_url : value?.pixel_card_url;
  return isSafePixelCardUrl(config, userId, url) ? url : null;
}

export function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export function decodePng(dataUrl) {
  const match = typeof dataUrl === 'string' && dataUrl.match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error('Invalid PNG data');
  const binary = atob(match[1]);
  if (binary.length > 8 * 1024 * 1024) throw new Error('Image too large');
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export async function getUser(config, token) {
  const response = await fetch(`${config.url}/auth/v1/user`, {
    headers: { apikey: config.anonKey, Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;
  return response.json();
}

export async function uploadPng(config, token, path, bytes) {
  const response = await fetch(`${config.url}/storage/v1/object/experience-card-assets/${path}`, {
    method: 'POST',
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${token}`,
      'content-type': 'image/png',
      'x-upsert': 'true',
    },
    body: bytes,
  });
  if (!response.ok) throw new Error(`Storage upload failed (${response.status})`);
  return `${config.url}/storage/v1/object/public/experience-card-assets/${path}`;
}

export function storagePathFromPublicUrl(config, userId, value, folder) {
  if (typeof value !== 'string' || (folder !== 'avatars' && folder !== 'cards')) return null;
  let parsed;
  try { parsed = new URL(value); } catch { return null; }
  const prefix = `/storage/v1/object/public/experience-card-assets/${userId}/${folder}/`;
  if (parsed.origin !== config.url || !parsed.pathname.startsWith(prefix)) return null;
  const filename = parsed.pathname.slice(prefix.length);
  if (!filename || filename.includes('/') || filename.includes('\\')) return null;
  try {
    const decoded = decodeURIComponent(filename);
    if (!decoded || decoded.includes('/') || decoded.includes('\\')) return null;
    return `${userId}/${folder}/${decoded}`;
  } catch {
    return null;
  }
}

export async function removePng(config, token, paths) {
  if (!paths.length) return true;
  const response = await fetch(`${config.url}/storage/v1/object/experience-card-assets`, {
    method: 'DELETE',
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ prefixes: paths }),
  });
  return response.ok || response.status === 404;
}

export { ID_PATTERN };
