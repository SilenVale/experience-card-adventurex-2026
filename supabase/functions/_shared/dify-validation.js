export const COMPILER_CARD_FIELDS = [
  'title', 'one_liner', 'problem', 'actions', 'pitfall', 'result',
  'suitable_for', 'boundary', 'micro_action',
];

export const COMPILER_SOURCE_KEYS = new Set([
  'raw_experience', 'answer_1', 'answer_2', 'answer_3', 'answer_4', 'answer_5',
]);

export function validateCompilerOutput(value, expectedPromptVersion) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ['output must be an object'];
  if (typeof value.ok !== 'boolean') errors.push('ok must be a boolean');
  if (value.prompt_version !== expectedPromptVersion) errors.push('prompt_version mismatch');

  if (value.ok === false) {
    if (typeof value.unable_reason !== 'string' || !value.unable_reason.trim()) errors.push('unable_reason is required when ok=false');
    return errors;
  }
  if (value.ok !== true) return errors;
  const uncertain = value.uncertain_items;
  const review = value.author_review_items;
  if (!Array.isArray(uncertain)) errors.push('uncertain_items must be an array');
  if (!Array.isArray(review)) errors.push('author_review_items must be an array');
  if (Array.isArray(uncertain)) {
    if (uncertain.length > 3) errors.push('uncertain_items exceeds 3 items');
    uncertain.forEach((item) => {
      if (!item || typeof item !== 'object' || !COMPILER_CARD_FIELDS.includes(item.field) || typeof item.reason !== 'string' || !item.reason.trim()) errors.push('invalid uncertain_items item');
    });
  }
  if (Array.isArray(review)) {
    if (review.length > 3) errors.push('author_review_items exceeds 3 items');
    review.forEach((item) => {
      if (!item || typeof item !== 'object' || !COMPILER_CARD_FIELDS.includes(item.field) || typeof item.question !== 'string' || !item.question.trim()) errors.push('invalid author_review_items item');
    });
  }
  COMPILER_CARD_FIELDS.forEach((field) => {
    if (typeof value[field] !== 'string' || !value[field].trim()) errors.push(`${field} must be a non-empty string`);
  });
  if (!value.source_map || typeof value.source_map !== 'object' || Array.isArray(value.source_map)) {
    errors.push('source_map must be an object');
  } else {
    Object.entries(value.source_map).forEach(([field, sources]) => {
      if (!COMPILER_CARD_FIELDS.includes(field)) errors.push(`invalid source_map field: ${field}`);
      if (!Array.isArray(sources) || sources.length > 2 || sources.some((source) => typeof source !== 'string' || !COMPILER_SOURCE_KEYS.has(source))) {
        errors.push(`invalid source_map sources for: ${field}`);
      }
    });
  }
  return errors;
}

export function mapCompilerResponse(value, expectedPromptVersion) {
  const errors = validateCompilerOutput(value, expectedPromptVersion);
  if (errors.length) return { status: 502, body: { error: 'DIFY_INVALID_OUTPUT', details: errors } };
  if (value.ok === false) return { status: 422, body: { error: 'DIFY_CONTENT_INSUFFICIENT', prompt_version: value.prompt_version, unable_reason: value.unable_reason } };
  return { status: 200, body: { card: value, prompt_version: expectedPromptVersion } };
}
