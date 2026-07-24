import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, json, options } from '../_shared/http.ts';
import { runDifyWorkflow } from '../_shared/dify.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return options();
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const authorization = request.headers.get('Authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!authorization || !supabaseUrl || !supabaseAnonKey) return json({ error: 'Unauthorized' }, 401);

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const body = await request.json();
    if (!body?.raw_experience || !body?.answers || body?.sharing_consent !== true) {
      return json({ error: 'raw_experience, answers and sharing_consent are required' }, 400);
    }

    const card = await runDifyWorkflow({
      apiKeyName: 'DIFY_GENERATE_CARD_API_KEY',
      user: `experience-card:${user.id}`,
      inputs: {
        raw_experience: String(body.raw_experience),
        answers_json: JSON.stringify(body.answers),
        instruction: 'Return only a JSON object with title, one_liner, problem, actions, pitfall, result, suitable_for, boundary, source_map. Do not invent facts. source_map maps each field to one or more of raw_experience, answer_1, answer_2, answer_3, answer_4, answer_5. If a fact is missing, write 待作者补充 instead of guessing.',
      },
    });

    const requiredFields = ['title', 'one_liner', 'problem', 'actions', 'pitfall', 'result', 'suitable_for', 'boundary'];
    if (requiredFields.some((field) => typeof card[field] !== 'string' || !String(card[field]).trim())) {
      return json({ error: 'DIFY_INVALID_OUTPUT' }, 502);
    }

    return new Response(JSON.stringify({ card }), { status: 200, headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const status = message === 'DIFY_NOT_CONFIGURED' ? 503 : message === 'DIFY_TIMEOUT' ? 504 : 502;
    return json({ error: message }, status);
  }
});
