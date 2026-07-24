-- Experience Card P0 字段语义修复
-- 目的：把「当时的问题」「最终结果」「适合谁」拆成独立字段。
-- 运行位置：Supabase Dashboard -> SQL Editor。
-- 不改 RLS Policy，不改 GRANT，不删除任何既有数据。

begin;

alter table public.experience_cards
  add column if not exists problem text,
  add column if not exists result text;

comment on column public.experience_cards.one_liner is '一句话摘要；P0 规则版暂可由最终结果回填，Dify 接入后生成独立摘要。';
comment on column public.experience_cards.problem is '作者当时真正面对的问题。';
comment on column public.experience_cards.result is '作者最终得到的结果。';
comment on column public.experience_cards.suitable_for is '这段经验适合尝试的人和场景。';

-- 旧版 P0 将 problem 误存于 suitable_for、将 result 存于 one_liner。
-- 对旧记录：把旧值迁往 problem / result，并清空无法可信推断的 suitable_for。
-- 这样页面宁可显示“作者尚未补充适合对象”，也不会把问题错误冒充成适用人群。
-- 已经按新语义写入的记录不受影响。
update public.experience_cards
set
  problem = coalesce(nullif(btrim(problem), ''), nullif(btrim(suitable_for), '')),
  result = coalesce(nullif(btrim(result), ''), nullif(btrim(one_liner), '')),
  suitable_for = case
    when nullif(btrim(problem), '') is null then null
    else suitable_for
  end
where nullif(btrim(problem), '') is null
   or nullif(btrim(result), '') is null;

commit;

-- 运行后核验：应能看到新增的 problem / result 两列，且当前卡片已有回填值。
select id, title, status, one_liner, problem, result, suitable_for, boundary
from public.experience_cards
order by updated_at desc;
