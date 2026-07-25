import { ID_PATTERN, supabaseConfig, uuidFromCompactId } from '../_shared/pixel.js';

export async function onRequestGet({ params, env }) {
  const id = String(params.id || '').toLowerCase();
  const userId = uuidFromCompactId(id);
  if (!userId || !ID_PATTERN.test(id)) return new Response('Not found', { status: 404 });
  const config = supabaseConfig(env);
  const path = `${userId}/cards/${id}.png`;
  const response = await fetch(`${config.url}/storage/v1/object/public/experience-card-assets/${path}`);
  if (!response.ok) return new Response('Card not found', { status: 404 });
  const headers = new Headers(response.headers);
  headers.set('cache-control', 'public, max-age=3600');
  headers.set('content-type', 'image/png');
  return new Response(response.body, { status: 200, headers });
}
