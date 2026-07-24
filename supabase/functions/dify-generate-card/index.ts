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
    if (!body?.raw_experience || !body?.answers) {
      return json({ error: 'raw_experience and answers are required' }, 400);
    }

    const card = await runDifyWorkflow({
      raw_experience: body.raw_experience,
      answers: body.answers,
      instruction: 'Return only a JSON object with title, one_liner, problem, actions, result, boundary, pitfall. Do not invent facts.',
    });

    return new Response(JSON.stringify({ card }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unexpected error' }, 500);
  }
});
