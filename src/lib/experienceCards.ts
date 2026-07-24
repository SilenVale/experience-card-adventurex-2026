import { supabase } from '@/lib/supabase';

export type CardStatus = 'draft' | 'published';

export interface ExperienceCardRecord {
  id: string;
  user_id: string;
  title: string;
  one_liner: string;
  problem: string;
  background: string;
  actions_done: string;
  pitfall: string;
  result: string;
  suitable_for: string;
  boundary: string;
  is_public: boolean;
  status: CardStatus;
  created_at: string;
  updated_at: string;
}

export interface SaveExperienceCardInput {
  userId: string;
  title: string;
  oneLiner: string;
  problem: string;
  background: string;
  actionsDone: string;
  pitfall: string;
  result: string;
  suitableFor: string;
  boundary: string;
  status: CardStatus;
}

export interface TrialFeedbackInput {
  cardId: string;
  situation: string;
  constraints: string;
  trialResult: '适合尝试' | '谨慎尝试' | '暂不适合';
  reason: string;
  microAction: string;
  boundaryNote: string;
}

export interface TrialResult {
  trialResult: TrialFeedbackInput['trialResult'];
  reason: string;
  microAction: string;
  boundaryNote: string;
}

const cardFields = [
  'id',
  'user_id',
  'title',
  'one_liner',
  'problem',
  'background',
  'actions_done',
  'pitfall',
  'result',
  'suitable_for',
  'boundary',
  'is_public',
  'status',
  'created_at',
  'updated_at',
].join(', ');

export async function listPublishedExperienceCards() {
  const { data, error } = await supabase
    .from('experience_cards')
    .select(cardFields)
    .eq('status', 'published')
    .eq('is_public', true)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ExperienceCardRecord[];
}

export async function getExperienceCard(cardId: string) {
  const { data, error } = await supabase
    .from('experience_cards')
    .select(cardFields)
    .eq('id', cardId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as ExperienceCardRecord | null;
}

export async function listMyExperienceCards(userId: string) {
  const { data, error } = await supabase
    .from('experience_cards')
    .select(cardFields)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ExperienceCardRecord[];
}

export async function saveExperienceCard(input: SaveExperienceCardInput) {
  const { data, error } = await supabase
    .from('experience_cards')
    .insert({
      user_id: input.userId,
      title: input.title,
      one_liner: input.oneLiner,
      problem: input.problem,
      background: input.background,
      actions_done: input.actionsDone,
      pitfall: input.pitfall,
      result: input.result,
      suitable_for: input.suitableFor,
      boundary: input.boundary,
      is_public: input.status === 'published',
      status: input.status,
    })
    .select('id, status, is_public')
    .single();

  if (error) throw new Error(error.message);
  return data as Pick<ExperienceCardRecord, 'id' | 'status' | 'is_public'>;
}

export async function updateExperienceCard(cardId: string, input: SaveExperienceCardInput) {
  const { data, error } = await supabase
    .from('experience_cards')
    .update({
      title: input.title,
      one_liner: input.oneLiner,
      problem: input.problem,
      background: input.background,
      actions_done: input.actionsDone,
      pitfall: input.pitfall,
      result: input.result,
      suitable_for: input.suitableFor,
      boundary: input.boundary,
      is_public: input.status === 'published',
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', cardId)
    .eq('user_id', input.userId)
    .select('id, status, is_public')
    .single();

  if (error) throw new Error(error.message);
  return data as Pick<ExperienceCardRecord, 'id' | 'status' | 'is_public'>;
}

export async function saveTrialFeedback(input: TrialFeedbackInput) {
  const { error } = await supabase.from('trial_feedback').insert({
    card_id: input.cardId,
    situation: input.situation,
    constraints: input.constraints,
    trial_result: input.trialResult,
    reason: input.reason,
    micro_action: input.microAction,
    boundary_note: input.boundaryNote,
  });

  if (error) throw new Error(error.message);
}

export function generateDemoTrialResult(constraints: string): TrialResult {
  const hasTightDeadline = /今天|明天|[0-9]+\s*天|紧急|来不及/.test(constraints);

  if (hasTightDeadline) {
    return {
      trialResult: '谨慎尝试',
      reason: '你的目标与这段经验有交集，但时间限制更紧。先验证最小一步，不要照搬原作者的完整节奏。',
      microAction: '今天只列出一项最可控的资源，并用它完成一个 10 分钟的小实验。',
      boundaryNote: '这是规则版演示判断，不代表 AI 已验证你的真实情境。',
    };
  }

  return {
    trialResult: '适合尝试',
    reason: '你描述的情境与卡片提供的经验方向相近，可以先从一项低风险行动开始。',
    microAction: '从卡片中的关键动作里选一项，今天只完成第一步并记录结果。',
    boundaryNote: '这是规则版演示判断，不承诺结果；遇到明显差异时请停止照搬。',
  };
}
