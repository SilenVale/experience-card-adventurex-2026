-- Experience Card P0: explicit API grants + RLS acceptance script
-- Run this only after Readdy/Supabase confirms the existing table columns match.
-- It intentionally does NOT grant trial_feedback SELECT to anon.
-- authenticated receives SELECT only because the author-only RLS policy below needs it;
-- it still cannot read feedback for anyone else's card.

grant usage on schema public to anon, authenticated;

-- P0 不在公开页面读取 profiles；用户只能读取和更新自己的资料。
grant select, insert, update on public.profiles to authenticated;

grant select on public.experience_cards to anon, authenticated;
grant insert, update, delete on public.experience_cards to authenticated;

grant insert on public.trial_feedback to anon, authenticated;
grant select on public.trial_feedback to authenticated;

alter table public.profiles enable row level security;
alter table public.experience_cards enable row level security;
alter table public.trial_feedback enable row level security;

-- 运行前先审计现有 policy；确认这三张 P0 表没有其他业务 policy 后，
-- 删除旧 policy，避免旧的“公开可读反馈”规则与本脚本叠加。
do $$
declare policy_record record;
begin
  for policy_record in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'experience_cards', 'trial_feedback')
  loop
    execute format('drop policy if exists %I on public.%I', policy_record.policyname, policy_record.tablename);
  end loop;
end $$;

create policy "Users read their own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "Users insert their own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "Users update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Public reads published cards"
on public.experience_cards for select
to anon, authenticated
using (status = 'published' and is_public = true);

create policy "Authors read their own cards"
on public.experience_cards for select
to authenticated
using (auth.uid() = user_id);

create policy "Authors create cards"
on public.experience_cards for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Authors update cards"
on public.experience_cards for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Authors delete cards"
on public.experience_cards for delete
to authenticated
using (auth.uid() = user_id);

create policy "Anyone submits trial feedback"
on public.trial_feedback for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.experience_cards cards
    where cards.id = trial_feedback.card_id
      and cards.status = 'published'
      and cards.is_public = true
  )
);

create policy "Card authors read received feedback"
on public.trial_feedback for select
to authenticated
using (
  exists (
    select 1
    from public.experience_cards cards
    where cards.id = trial_feedback.card_id
      and cards.user_id = auth.uid()
  )
);

-- Verification: run in SQL Editor after applying the policies.
select policyname, tablename, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'experience_cards', 'trial_feedback')
order by tablename, policyname;

select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('profiles', 'experience_cards', 'trial_feedback')
  and grantee in ('anon', 'authenticated', 'service_role')
order by table_name, grantee, privilege_type;
