# Dify 接口契约（P0）

P0 只启用两个 **已发布** 的 Dify Workflow；Dify 只负责 AI 编排，产品数据仍只保存在 Supabase。

> 安全边界：浏览器永远不直接调用 Dify，也不保存 Dify Key。网页 → Supabase Edge Function → Dify Workflow。

## 1. `dify-generate-card`

在 Dify 新建 Workflow 应用，发布后命名为“Experience Card · 生成经验卡”。

输入变量（均为文本、必填）：

- `raw_experience`
- `answers_json`
- `instruction`

输出节点必须暴露 `result`（文本），内容必须是下列 JSON：

```json
{
  "title": "不夸大的经验卡标题",
  "one_liner": "一句结果或价值",
  "problem": "当时要解决的问题",
  "actions": "关键动作",
  "pitfall": "失败、调整或注意项；没有则写待作者补充",
  "result": "结果",
  "suitable_for": "适合谁；不清楚则写待作者补充",
  "boundary": "适用边界",
  "source_map": {
    "title": ["raw_experience"],
    "problem": ["answer_1"],
    "actions": ["answer_3"],
    "result": ["answer_5"]
  }
}
```

系统提示词核心规则：仅整理 `raw_experience` 与 `answers_json` 中已经出现的内容；缺信息写“待作者补充”；不得补造证据、量化结果、适用人群或外部事实。`source_map` 的值只能是 `raw_experience`、`answer_1` 至 `answer_5` 的数组。

推荐的最小 Workflow 结构：`Start（3 个文本变量） → LLM → End`。在 LLM 的系统提示词粘贴：

```text
你是 Experience Card 的编辑助手。只根据用户提供的 raw_experience 与 answers_json 整理经验；绝不猜测、补写外部事实或承诺效果。信息缺失就写“待作者补充”。
只输出合法 JSON，不要 Markdown、解释或代码围栏。JSON 必须包含：title, one_liner, problem, actions, pitfall, result, suitable_for, boundary, source_map。
source_map 的每个 value 只能是 raw_experience、answer_1、answer_2、answer_3、answer_4、answer_5 组成的数组。
```

LLM 用户消息粘贴：`原始经历：{{#raw_experience#}}\n五问答案：{{#answers_json#}}\n补充要求：{{#instruction#}}`。End 节点新增文本输出：`result = LLM 的 text 输出`。

## 2. `dify-trial-match`

在 Dify 新建第二个 Workflow 应用，发布后命名为“Experience Card · 情境试用”。

输入变量（均为文本、必填）：

- `card_json`
- `user_situation`
- `user_constraints`

输出节点必须暴露 `result`（文本），内容必须是下列 JSON：

```json
{
  "trial_result": "适合尝试 | 谨慎尝试 | 暂不适合",
  "reason": "2-3 句基于卡片边界的理由",
  "micro_action": "今天能做的一步",
  "boundary_note": "不适用或风险提示"
}
```

系统提示词核心规则：只能依据 `card_json` 已确认的内容判断；不保证成功；情境信息不足时选“谨慎尝试”或“暂不适合”；`micro_action` 必须是当天可做的一步，不得给高风险专业建议。

推荐的最小 Workflow 结构：`Start（4 个文本变量） → LLM → End`。在 LLM 的系统提示词粘贴：

```text
你是 Experience Card 的情境试用助手。只能依据 card_json 中的已确认经验判断，不得补造卡片没有写过的事实或承诺成功。
只输出合法 JSON，不要 Markdown、解释或代码围栏。JSON 字段必须是：trial_result, reason, micro_action, boundary_note。
trial_result 只能是“适合尝试”“谨慎尝试”“暂不适合”之一。情境或约束信息不充分时，优先“谨慎尝试”或“暂不适合”。micro_action 必须是当天可执行且低风险的一步。
```

LLM 用户消息粘贴：`经验卡：{{#card_json#}}\n试用者情境：{{#user_situation#}}\n限制：{{#user_constraints#}}\n补充要求：{{#instruction#}}`。End 节点新增文本输出：`result = LLM 的 text 输出`。

## 发布与密钥配置

- 两个 Workflow 都必须点击 Dify 的“发布”后再复制 API Key；未发布的 Workflow 不能被 `/workflows/run` 调用。
- Dify Key 仅设置为 Supabase Edge Function Secrets：
- `DIFY_API_KEY`
- `DIFY_TRIAL_MATCH_API_KEY`
- 可选：若不是 Dify Cloud，再设置 `DIFY_BASE_URL`；Dify Cloud 默认值为 `https://api.dify.ai/v1`。
- 浏览器 `.env` 只允许 Supabase URL 和 anon key；绝不出现 Dify Key。
- Supabase 中部署两个函数：`dify-generate-card`、`dify-trial-match`。两者均启用 JWT 验证；生成函数还要求登录用户与 `sharing_consent=true`。
- 部署后先用一张脱敏演示卡、一个测试账户验证，不批量调用。

## 上线验收（必须全部通过）

1. 在 Supabase SQL Editor 执行 `SUPABASE-DIFY-READINESS.sql`，确认 `source_map` 与 `sharing_consent` 两列存在。
2. 生成一张新卡：结果中每个字段有来源映射，明显缺失的信息显示“待作者补充”。
3. 对该已发布卡提交“适合”和“不适合”两种情境：结果枚举只能是 `适合尝试 / 谨慎尝试 / 暂不适合`。
4. 暂时移除一个 Dify Secret 再试：前端必须报“AI 暂不可用”，不能伪造成功结果。
5. 匿名访问者只能读公开卡，不能读取具体 `trial_feedback` 内容；卡作者登录后才可读到自己卡片的反馈。
