# Pixel Portrait integration

## Purpose

`/pixel-portrait` is the camera-based pixel avatar and Experience Card export module supplied in `ExperienceCard-PixelModule-Delivery`. The original module was a standalone Node/HTML demo; this repository keeps its camera, MediaPipe selfie segmentation, pixel controls, keyword editing, canvas composition and QR generation while connecting the result to the authenticated Experience Card profile.

## Runtime boundaries

- Raw camera frames stay in the browser. The upload starts only after the user clicks “生成并保存到我的名片”.
- The current user’s profile and latest experience card provide the name, role, title and summary; the standalone module’s demo `PROFILE` is not used.
- Avatar PNG and 16:9 card PNG are stored in the public Supabase Storage bucket `experience-card-assets` under the authenticated user’s UUID directory.
- `profiles.pixel_keywords`, `profiles.pixel_card_url` and `profiles.pixel_card_id` hold the generated asset metadata.
- MediaPipe assets are copied from the npm package into `public/mediapipe/` by the `predev`/`prebuild` script. The generated directory is a build artifact and should not be committed by hand.

## Routes and compatibility

The React route is `/pixel-portrait`. The Cloudflare Pages Functions preserve the delivery module’s API shape:

- `POST /api/experience-cards` — authenticated upload and profile metadata update;
- `GET /download/:id` — download page;
- `GET /experience-cards/:id.png` — PNG response.

The React client first tries the Pages Function. On local Vite or Vercel, where those Functions are not present, it falls back to the authenticated Supabase Storage client. The download QR always points to the Cloudflare production domain because that is where the compatibility Functions live.

## Supabase setup

Run [`SUPABASE-PIXEL-PORTRAIT.sql`](SUPABASE-PIXEL-PORTRAIT.sql) once in the `experience-card-dev` SQL Editor. It adds the three profile fields, creates the public asset bucket, and limits authenticated writes to each user’s own UUID directory.

## Deferred items

- The avatar camera and pixel effects are implemented; the friend’s future “digital cartoon avatar” variant is still a separate feature.
- The production flow still needs a real camera capture, upload, reload of “我的名片”, and Cloudflare QR download test on a phone.
- The generated MediaPipe output adds a non-blocking bundle-size warning only; do not solve that by moving raw camera data to a server.
