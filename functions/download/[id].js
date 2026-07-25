import { supabaseConfig, uuidFromCompactId } from '../_shared/pixel.js';

export async function onRequestGet({ params, env }) {
  const id = String(params.id || '').toLowerCase();
  const userId = uuidFromCompactId(id);
  if (!userId) return new Response('Card not found', { status: 404 });
  const config = supabaseConfig(env);
  const imageUrl = `${config.url}/storage/v1/object/public/experience-card-assets/${userId}/cards/${id}.png`;
  const image = await fetch(imageUrl);
  if (!image.ok) return new Response('Card not found', { status: 404 });
  return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Experience Card</title><style>body{margin:0;padding:24px;background:#0b0b0d;color:#f0ede7;font-family:system-ui,"PingFang SC",sans-serif;text-align:center}main{max-width:900px;margin:auto}img{width:100%;display:block;margin:22px 0;border:1px solid #444}a{display:inline-block;padding:14px 22px;background:#ed4232;color:#0b0b0d;text-decoration:none;font-weight:700}</style><main><p>EXPERIENCE CARD / PIXEL PORTRAIT</p><h1>保存这张经验卡</h1><img src="/experience-cards/${id}.png" alt="Experience Card"><a href="/experience-cards/${id}.png" download="experience-card-pixel-profile.png">下载 PNG</a></main>`, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}
