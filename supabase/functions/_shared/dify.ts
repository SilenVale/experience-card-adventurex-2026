const difyBaseUrl = (Deno.env.get('DIFY_BASE_URL') ?? 'https://api.dify.ai/v1').replace(/\/$/, '');
const difyApiKey = Deno.env.get('DIFY_API_KEY');

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

export async function runDifyWorkflow(inputs: Record<string, unknown>) {
  if (!difyApiKey) throw new Error('DIFY_API_KEY is not configured');

  const response = await fetch(`${difyBaseUrl}/workflows/run`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${difyApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs, response_mode: 'blocking', user: 'experience-card-web' }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message ?? 'Dify workflow request failed');
  }

  const outputs = payload?.data?.outputs;
  const result = tryParseObject(outputs?.card_json ?? outputs?.result ?? outputs?.text ?? outputs);
  if (!result) throw new Error('Dify returned no valid JSON object');
  return result;
}
