-- 只读审计：本文件本轮不执行 Cloud SQL。
-- 先统计已经 published 且公开、但不满足新门禁的旧卡。
select
  id,
  user_id,
  title,
  status,
  is_public,
  sharing_consent,
  micro_action,
  actions_done,
  suitable_for
from public.experience_cards
where status = 'published'
  and is_public = true
  and (
    sharing_consent is distinct from true
    or nullif(btrim(coalesce(micro_action, '')), '') is null
    or nullif(btrim(coalesce(title, '')), '') is null
    or nullif(btrim(coalesce(actions_done, '')), '') is null
    or nullif(btrim(coalesce(suitable_for, '')), '') is null
  )
order by updated_at desc;

-- 统计数量，便于决定旧卡修复量。
select count(*) as invalid_public_card_count
from public.experience_cards
where status = 'published'
  and is_public = true
  and (
    sharing_consent is distinct from true
    or nullif(btrim(coalesce(micro_action, '')), '') is null
    or nullif(btrim(coalesce(title, '')), '') is null
    or nullif(btrim(coalesce(actions_done, '')), '') is null
    or nullif(btrim(coalesce(suitable_for, '')), '') is null
  );

-- 设计方案（需单独确认后执行）：CHECK NOT VALID 不回写旧记录，
-- 但会约束之后的新插入和更新，适合先保证新发布不再产生违规公开卡。
-- alter table public.experience_cards
--   add constraint experience_cards_public_consent_check
--   check (not is_public or status <> 'published' or sharing_consent = true) not valid;
-- alter table public.experience_cards
--   add constraint experience_cards_public_micro_action_check
--   check (not is_public or status <> 'published' or nullif(btrim(coalesce(micro_action, '')), '') is not null) not valid;
-- alter table public.experience_cards
--   add constraint experience_cards_public_content_check
--   check (
--     not is_public or status <> 'published'
--     or (
--       nullif(btrim(coalesce(title, '')), '') is not null
--       and nullif(btrim(coalesce(actions_done, '')), '') is not null
--       and nullif(btrim(coalesce(suitable_for, '')), '') is not null
--     )
--   ) not valid;

-- 上线顺序：只读统计 → 人工修复/降级旧公开卡 → 添加 NOT VALID 约束 →
-- 验证新插入/更新 → 清理剩余旧卡 → 单独执行 VALIDATE CONSTRAINT。
-- 回滚：在确认影响后按约束名 drop constraint；不会删除卡片数据。
