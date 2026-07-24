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
      .select('title, one_liner, background, actions_done, suitable_for, boundary, pitfall')
      .eq('id', body.card_id)
      .eq('status', 'published')
      .eq('is_public', true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!card) return json({ error: 'Published card not found' }, 404);

    const result = await runDifyWorkflow({
      card,
      user_situation: body.situation,
      user_constraints: body.constraints ?? '',
      instruction: 'Return only a JSON object with trial_result (适合尝试/谨慎尝试/暂不适合), reason, micro_action, boundary_note. Never promise success.',
    });

    return new Response(JSON.stringify({ result }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unexpected error' }, 500);
  }
});
