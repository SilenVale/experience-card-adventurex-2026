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

export { ID_PATTERN };
