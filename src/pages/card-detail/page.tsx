import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import TrialDrawer from '@/components/feature/TrialDrawer';
import { cardDetails, type CardDetailData } from '@/mocks/cardDetailData';
import { getExperienceCard, type ExperienceCardRecord } from '@/lib/experienceCards';
import ExperienceCardDocument from './ExperienceCardDocument';

const isUuid = (value: string | undefined) => Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));

type Detail = {
  id: string;
  title: string;
  oneLiner: string;
  authorIdentity: string;
  status: string;
  version: string;
  problem: string;
  keyActions: { step: number; action: string; detail: string }[];
  result: string;
  suitableFor: string;
  boundary: string;
  pitfall: string;
  microAction: string;
  source: string;
  scope: string;
  author: string;
  boundaryNote: string;
  versionHistory: { v1: string; feedback: string[]; v2: string };
  personaId: string;
  feedback?: string[];
};

function splitActions(actionsDone: string) {
  return actionsDone
    .split(/\n|\d+[.、)]/)
    .map((action) => action.trim())
    .filter(Boolean)
    .map((action, index) => ({ step: index + 1, action, detail: '' }));
}

function fromRecord(card: ExperienceCardRecord): Detail {
  return {
    id: card.id,
    title: card.title,
    oneLiner: card.one_liner || card.result || '作者正在把这段经历整理得更清楚。',
    authorIdentity: '作者确认的真实经历',
    author: 'Experience Card 作者',
    status: '已发布 · 可试用',
    version: 'v1',
    problem: card.problem || card.background || '作者尚未补充当时面对的问题。',
    keyActions: splitActions(card.actions_done).length ? splitActions(card.actions_done) : [{ step: 1, action: '作者尚未补充关键动作', detail: '' }],
    result: card.result || card.one_liner || '作者尚未补充结果。',
    suitableFor: card.suitable_for || '请带着自己的具体情境判断是否适用。',
    boundary: card.boundary || '作者尚未补充使用边界，请谨慎试用。',
    pitfall: card.pitfall || '作者尚未补充失败调整；这不代表这段经验在所有情境下都有效。',
    microAction: card.micro_action ?? '',
    source: '作者主动提交的真实经历',
    scope: '公开范围：可匿名试用',
    boundaryNote: '请先从微行动开始验证，不要在条件不同的情况下直接照搬。',
    versionHistory: { v1: '作者确认的当前版本', feedback: [], v2: '收到真实反馈后再更新。' },
    personaId: 'real',
  };
}

function fromMock(card: CardDetailData): Detail {
  return {
    id: card.id,
    title: card.title,
    oneLiner: card.result,
    authorIdentity: card.authorIdentity,
    author: card.author,
    status: card.status,
    version: card.version,
    problem: card.problem,
    keyActions: card.keyActions,
    result: card.result,
    suitableFor: card.suitableFor,
    boundary: card.boundary,
    pitfall: card.boundaryNote,
    microAction: card.microAction,
    source: card.source,
    scope: card.scope,
    boundaryNote: card.boundaryNote,
    versionHistory: card.versionHistory,
    personaId: card.personaId,
    feedback: card.versionHistory.feedback,
  };
}

export default function CardDetailPage() {
  const navigate = useNavigate();
  const { cardId } = useParams<{ cardId: string }>();
  const [trialOpen, setTrialOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [realCard, setRealCard] = useState<ExperienceCardRecord | null>(null);
  const [loading, setLoading] = useState(isUuid(cardId));
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUuid(cardId)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getExperienceCard(cardId!)
      .then((card) => setRealCard(card))
      .catch((error) => setLoadError(error instanceof Error ? error.message : '读取经验卡失败'))
      .finally(() => setLoading(false));
  }, [cardId]);

  const detail = useMemo<Detail | undefined>(() => {
    if (realCard) return fromRecord(realCard);
    return cardId && cardDetails[cardId] ? fromMock(cardDetails[cardId]) : undefined;
  }, [cardId, realCard]);

  if (loading) {
    return <div className="min-h-screen bg-theme-bg"><Navbar /><main className="flex min-h-[60vh] items-center justify-center pt-16 text-sm text-theme-text-secondary">正在展开经验名片…</main></div>;
  }

  if (!detail) {
    return <div className="min-h-screen bg-theme-bg"><Navbar /><main className="flex min-h-[60vh] items-center justify-center pt-16"><div className="text-center"><p className="mb-4 text-sm text-theme-text-secondary">{loadError ? `读取失败：${loadError}` : '未找到这张经验卡'}</p><button onClick={() => navigate('/')} className="text-sm text-theme-accent hover:underline">返回经验广场</button></div></main></div>;
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareStatus('copied');
    } catch {
      setShareStatus('failed');
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg transition-colors duration-300">
      <Navbar />
      <ExperienceCardDocument
        detail={detail}
        shareStatus={shareStatus}
        onBack={() => navigate('/')}
        onShare={() => void handleShare()}
        onTrial={() => setTrialOpen(true)}
      />
      <TrialDrawer isOpen={trialOpen} onClose={() => setTrialOpen(false)} cardTitle={detail.title} cardId={detail.id} />
    </div>
  );
}
