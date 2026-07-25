import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, json, options } from '../_shared/http.ts';
import { runDifyWorkflow } from '../_shared/dify.ts';

const MAX_REQUEST_CHARS = 12000;
const MAX_SITUATION_CHARS = 4000;
const MAX_CONSTRAINTS_CHARS = 4000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return options();
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_REQUEST_CHARS) return json({ error: 'REQUEST_TOO_LARGE' }, 413);

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return json({ error: 'INVALID_JSON' }, 400);
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return json({ error: 'INVALID_REQUEST' }, 400);
    }
    const input = body as Record<string, unknown>;
    const situation = input.situation;
    const constraints = input.constraints === undefined ? '' : input.constraints;
    if (typeof input.card_id !== 'string' || !UUID_PATTERN.test(input.card_id)) {
      return json({ error: 'card_id must be a UUID' }, 400);
    }
    if (typeof situation !== 'string' || !situation.trim()) {
      return json({ error: 'card_id and situation are required' }, 400);
    }
    if (typeof constraints !== 'string') {
      return json({ error: 'constraints must be a string' }, 400);
    }
    if (situation.length > MAX_SITUATION_CHARS || constraints.length > MAX_CONSTRAINTS_CHARS) {
      return json({ error: 'TRIAL_INPUT_TOO_LONG' }, 413);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) return json({ error: 'Supabase function configuration is missing' }, 500);

    const database = createClient(supabaseUrl, supabaseAnonKey);
    const { data: card, error } = await database
      .from('experience_cards')
      .select('title, one_liner, problem, background, actions_done, pitfall, result, suitable_for, boundary, micro_action, source_map')
      .eq('id', input.card_id)
      .eq('status', 'published')
      .eq('is_public', true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!card) return json({ error: 'Published card not found' }, 404);

    const result = await runDifyWorkflow({
      apiKeyName: 'DIFY_TRIAL_MATCH_API_KEY',
      user: `experience-card:trial:${crypto.randomUUID()}`,
      inputs: {
        card_json: JSON.stringify(card),
        user_situation: situation,
        user_constraints: constraints,
      },
    });

    const trialResults = ['适合尝试', '谨慎尝试', '暂不适合'];
    const requiredFields = ['reason', 'micro_action', 'boundary_note'];
    if (!trialResults.includes(String(result.trial_result)) || requiredFields.some((field) => typeof result[field] !== 'string' || !String(result[field]).trim())) {
      return json({ error: 'DIFY_INVALID_OUTPUT' }, 502);
    }

    return new Response(JSON.stringify({ result }), { status: 200, headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const status = message === 'DIFY_NOT_CONFIGURED' ? 503 : message === 'DIFY_TIMEOUT' ? 504 : 502;
    return json({ error: message }, status);
  }
});
