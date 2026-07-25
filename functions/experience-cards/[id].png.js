import { ID_PATTERN, getPublicPixelCardUrl, supabaseConfig } from '../_shared/pixel.js';

export async function onRequestGet({ params, env }) {
  const id = String(params.id || '').toLowerCase();
  if (!ID_PATTERN.test(id)) return new Response('Not found', { status: 404 });
  const config = supabaseConfig(env);
  const imageUrl = await getPublicPixelCardUrl(config, id);
  if (!imageUrl) return new Response('Card not found', { status: 404 });
  const response = await fetch(imageUrl);
  if (!response.ok) return new Response('Card not found', { status: 404 });
  const headers = new Headers(response.headers);
  headers.set('cache-control', 'public, max-age=3600');
  headers.set('content-type', 'image/png');
  return new Response(response.body, { status: 200, headers });
}
