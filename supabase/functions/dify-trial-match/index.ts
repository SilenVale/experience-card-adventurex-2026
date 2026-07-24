import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, json, options } from '../_shared/http.ts';
import { runDifyWorkflow } from '../_shared/dify.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return options();
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const body = await request.json();
    if (!body?.card_id || !body?.situation) {
      return json({ error: 'card_id and situation are required' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) return json({ error: 'Supabase function configuration is missing' }, 500);

    const database = createClient(supabaseUrl, supabaseAnonKey);
    const { data: card, error } = await database
      .from('experience_cards')
      .select('title, one_liner, problem, background, actions_done, pitfall, result, suitable_for, boundary, source_map')
      .eq('id', body.card_id)
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
        user_situation: String(body.situation),
        user_constraints: String(body.constraints ?? ''),
        instruction: 'Return only a JSON object with trial_result (适合尝试/谨慎尝试/暂不适合), reason, micro_action, boundary_note. Base every statement only on card_json and the user input. Never promise success. If the card lacks a necessary condition, choose 谨慎尝试 or 暂不适合 and explain the missing information.',
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
