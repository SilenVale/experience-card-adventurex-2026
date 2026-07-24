-- Experience Card: Dify readiness fields
-- Safe to run once in Supabase SQL Editor before deploying the Dify-connected frontend.
-- It does not delete rows, tables, policies, or GRANTs.

begin;

alter table public.experience_cards
  add column if not exists source_map jsonb not null default '{}'::jsonb,
  add column if not exists sharing_consent boolean not null default false;

comment on column public.experience_cards.source_map is
  'Maps each AI-organized field to raw_experience / answer_1..answer_5. Never contains inferred external facts.';

comment on column public.experience_cards.sharing_consent is
  'Author confirmed they may share the submitted experience and reviewed the AI draft before publishing.';

commit;

-- Verification: this should return the two new columns.
select column_name, data_type, column_default, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'experience_cards'
  and column_name in ('source_map', 'sharing_consent')
order by column_name;
