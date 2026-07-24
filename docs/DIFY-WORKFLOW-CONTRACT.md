# Dify 接口契约（暂不部署）

P0 只启用两个 Dify Workflow；Dify 是 AI 编排层，不保存产品主数据。

## 1. `dify-generate-card`

输入：`raw_experience`、`answers`。输出必须是 JSON：

```json
{
  "title": "不夸大的经验卡标题",
  "one_liner": "一句结果或价值",
  "problem": "当时要解决的问题",
  "actions": "关键动作",
  "result": "结果",
  "boundary": "适用边界",
  "pitfall": "失败或注意项"
}
```

规则：仅整理用户输入；缺信息要明确写“待作者补充”，不得补造证据、结果或适用范围。

## 2. `dify-trial-match`

输入：已发布经验卡、`user_situation`、`user_constraints`。输出必须是 JSON：

```json
{
  "trial_result": "适合尝试 | 谨慎尝试 | 暂不适合",
  "reason": "2-3 句基于卡片边界的理由",
  "micro_action": "今天能做的一步",
  "boundary_note": "不适用或风险提示"
}
```

规则：不保证成功；情境信息不足时选“谨慎尝试”或“暂不适合”。

## 部署前的密钥规则

- Dify Key 仅设置为 Supabase Edge Function Secret：`DIFY_API_KEY`。
- 浏览器 `.env` 只允许 Supabase URL 和 anon key；绝不出现 Dify Key。
- 部署后先用一张脱敏演示卡、一个测试账户验证，不批量调用。
