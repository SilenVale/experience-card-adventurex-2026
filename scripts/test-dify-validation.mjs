import assert from 'node:assert/strict';
import { mapCompilerResponse, validateCompilerOutput } from '../supabase/functions/_shared/dify-validation.js';
import { isSafePixelCardUrl } from '../functions/_shared/pixel.js';

const version = 'experience-compiler-v2-2026-07-25';
const good = {
  ok: true,
  prompt_version: version,
  title: '一次真实的项目调整',
  one_liner: '作者先尝试了一个方案，失败后调整并记录了结果。',
  problem: '当时需要在有限时间内推进一件具体的事。',
  actions: '先列出问题，再做了一个小实验。',
  pitfall: '第一次方案没有达到预期，原因尚未完全验证。',
  result: '完成了小范围验证，未记录长期效果。',
  suitable_for: '需要先做低风险小实验的人。',
  boundary: '不适合直接复制到资源和限制完全不同的场景。',
  micro_action: '今天用 20 分钟列出一个小实验，并写下完成标准。',
  source_map: { actions: ['answer_2'], result: ['answer_4'] },
  uncertain_items: [],
  author_review_items: [],
};

const cases = [
  ['ok 缺失', { ...good, ok: undefined }],
  ['prompt_version 错误', { ...good, prompt_version: 'old' }],
  ['注释数组缺失', { ...good, uncertain_items: undefined }],
  ['注释超过 3 条', { ...good, uncertain_items: [1, 2, 3, 4] }],
  ['非法 field', { ...good, uncertain_items: [{ field: 'unknown', reason: '待确认' }] }],
  ['source_map 非法键', { ...good, source_map: { unknown: ['answer_1'] } }],
  ['source_map 非法来源', { ...good, source_map: { actions: ['answer_9'] } }],
  ['micro_action 空白', { ...good, micro_action: '   ' }],
  ['ok=false 缺 unable_reason', { ...good, ok: false, unable_reason: '' }],
];

for (const [label, value] of cases) assert.ok(validateCompilerOutput(value, version).length > 0, label);
assert.deepEqual(validateCompilerOutput(good, version), []);
const validFailure = { ok: false, prompt_version: version, unable_reason: '五问没有具体动作' };
assert.deepEqual(validateCompilerOutput(validFailure, version), []);
assert.equal(mapCompilerResponse(validFailure, version).status, 422);
assert.equal(mapCompilerResponse(good, version).status, 200);
assert.equal(mapCompilerResponse({ ...validFailure, prompt_version: 'wrong' }, version).status, 502);
assert.deepEqual(validateCompilerOutput({ ...validFailure, uncertain_items: [] }, version), []);
assert.ok(validateCompilerOutput({ ...good, ok: false, unable_reason: '' }, version).length > 0);
const config = { url: 'https://wzqfimirlqgstgqcdsyw.supabase.co' };
const userId = 'cb2fb8e5-3314-46a4-aaf9-b46754f20da7';
const validUrl = `${config.url}/storage/v1/object/public/experience-card-assets/${userId}/cards/card-123.png`;
assert.equal(isSafePixelCardUrl(config, userId, validUrl), true);
assert.equal(isSafePixelCardUrl(config, userId, validUrl.replace(config.url, 'https://evil.example')), false);
assert.equal(isSafePixelCardUrl(config, userId, validUrl.replace('https://', 'http://')), false);
assert.equal(isSafePixelCardUrl(config, userId, validUrl.replace(userId, '1f53ecf3-7261-43d1-9a7a-5b749e32c581')), false);
assert.equal(isSafePixelCardUrl(config, userId, `${config.url}/storage/v1/object/public/experience-card-assets/${userId}/avatars/avatar.png`), false);
assert.equal(isSafePixelCardUrl(config, userId, `${validUrl}" onerror="alert(1)`), false);
console.log(`Dify validation tests passed: ${cases.length + 5} cases; URL validation passed: 6 cases`);
