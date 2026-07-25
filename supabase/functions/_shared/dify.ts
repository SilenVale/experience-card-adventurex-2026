const difyBaseUrl = (Deno.env.get('DIFY_BASE_URL') ?? 'https://api.dify.ai/v1').replace(/\/$/, '');

export type DifyWorkflowKey = 'DIFY_API_KEY' | 'DIFY_TRIAL_MATCH_API_KEY';

function tryParseObject(value: unknown) {
  if (typeof value === 'object' && value !== null) return value as Record<string, unknown>;
  if (typeof value !== 'string') return null;

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

export async function runDifyWorkflow({
  apiKeyName,
  inputs,
  user,
}: {
  apiKeyName: DifyWorkflowKey;
  inputs: Record<string, unknown>;
  user: string;
}) {
  const difyApiKey = Deno.env.get(apiKeyName);
  if (!difyApiKey) throw new Error('DIFY_NOT_CONFIGURED');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const response = await fetch(`${difyBaseUrl}/workflows/run`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${difyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs, response_mode: 'blocking', user }),
      signal: controller.signal,
    });

    const payload = await response.json();
    if (!response.ok || payload?.data?.status === 'failed') {
      throw new Error('DIFY_WORKFLOW_FAILED');
    }

    const outputs = payload?.data?.outputs;
    const result = tryParseObject(outputs?.card_json ?? outputs?.result ?? outputs?.text ?? outputs);
    if (!result) throw new Error('DIFY_INVALID_OUTPUT');
    return result;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('DIFY_TIMEOUT');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
