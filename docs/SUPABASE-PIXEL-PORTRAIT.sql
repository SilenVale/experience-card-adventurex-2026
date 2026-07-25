-- Experience Card 像素头像与成片存储
-- 在 Supabase SQL Editor 中执行一次。只新增字段、存储桶和最小对象权限。

alter table public.profiles
  add column if not exists pixel_keywords text[] not null default '{}',
  add column if not exists pixel_card_url text,
  add column if not exists pixel_card_id text;

insert into storage.buckets (id, name, public)
values ('experience-card-assets', 'experience-card-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read pixel assets" on storage.objects;
drop policy if exists "Users upload own pixel assets" on storage.objects;
drop policy if exists "Users update own pixel assets" on storage.objects;
drop policy if exists "Users delete own pixel assets" on storage.objects;

create policy "Public read pixel assets"
on storage.objects for select
using (bucket_id = 'experience-card-assets');

create policy "Users upload own pixel assets"
on storage.objects for insert to authenticated
with check (bucket_id = 'experience-card-assets' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users update own pixel assets"
on storage.objects for update to authenticated
using (bucket_id = 'experience-card-assets' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'experience-card-assets' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users delete own pixel assets"
on storage.objects for delete to authenticated
using (bucket_id = 'experience-card-assets' and (storage.foldername(name))[1] = auth.uid()::text);
