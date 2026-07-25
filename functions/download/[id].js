import { getPublicPixelCardUrl, supabaseConfig, uuidFromCompactId } from '../_shared/pixel.js';

export async function onRequestGet({ params, env, request }) {
  const id = String(params.id || '').toLowerCase();
  const userId = uuidFromCompactId(id);
  if (!userId) return new Response('Card not found', { status: 404 });
  const config = supabaseConfig(env);
  const imageUrl = await getPublicPixelCardUrl(config, id);
  if (!imageUrl) return new Response('Card not found', { status: 404 });
  const image = await fetch(imageUrl);
  if (!image.ok) return new Response('Card not found', { status: 404 });
  if (new URL(request.url).searchParams.get('download') === '1') {
    const headers = new Headers(image.headers);
    headers.set('content-type', 'image/png');
    headers.set('content-disposition', 'attachment; filename="experience-card-pixel-profile.png"');
    headers.set('cache-control', 'no-store');
    return new Response(image.body, { status: 200, headers });
  }
  const escapedImageUrl = imageUrl.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Experience Card</title><style>body{margin:0;padding:24px;background:#0b0b0d;color:#f0ede7;font-family:system-ui,"PingFang SC",sans-serif;text-align:center}main{max-width:900px;margin:auto}img{width:100%;display:block;margin:22px 0;border:1px solid #444}a{display:inline-block;padding:14px 22px;background:#ed4232;color:#0b0b0d;text-decoration:none;font-weight:700}</style><main><p>EXPERIENCE CARD / PIXEL PORTRAIT</p><h1>保存这张经验卡</h1><img src="${escapedImageUrl}" alt="Experience Card"><a href="${escapedImageUrl}" download="experience-card-pixel-profile.png">下载 PNG</a></main>`, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}
