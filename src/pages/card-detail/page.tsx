import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import TrialDrawer from '@/components/feature/TrialDrawer';
import SharePanel from '@/components/feature/SharePanel';
import { cardDetails, type CardDetailData } from '@/mocks/cardDetailData';
import { getExperienceCard, type ExperienceCardRecord } from '@/lib/experienceCards';

const isUuid = (value: string | undefined) => Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));

type Detail = {
  id: string;
  title: string;
  oneLiner: string;
  authorIdentity: string;
  status: string;
  version: string;
  problem: string;
  keyActions: { step: string; action: string; detail: string }[];
  result: string;
  suitableFor: string;
  boundary: string;
  pitfall: string;
  microAction: string;
  source: string;
  scope: string;
  feedback?: string[];
};

function splitActions(actionsDone: string) {
  return actionsDone
    .split(/\n|\d+[.、)]/)
    .map((action) => action.trim())
    .filter(Boolean)
    .map((action, index) => ({ step: String(index + 1).padStart(2, '0'), action, detail: '' }));
}

function fromRecord(card: ExperienceCardRecord): Detail {
  return {
    id: card.id,
    title: card.title,
    oneLiner: card.one_liner || card.result || '作者正在把这段经历整理得更清楚。',
    authorIdentity: '作者确认的真实经历',
    status: '已发布 · 可试用',
    version: 'v1',
    problem: card.problem || card.background || '作者尚未补充当时面对的问题。',
    keyActions: splitActions(card.actions_done).length ? splitActions(card.actions_done) : [{ step: '01', action: '作者尚未补充关键动作', detail: '' }],
    result: card.result || card.one_liner || '作者尚未补充结果。',
    suitableFor: card.suitable_for || '请带着自己的具体情境判断是否适用。',
    boundary: card.boundary || '作者尚未补充使用边界，请谨慎试用。',
    pitfall: card.pitfall || '作者尚未补充失败调整；这不代表这段经验在所有情境下都有效。',
    microAction: '带着你的具体限制，点击下方按钮先试一个最小行动。',
    source: '作者主动提交的真实经历',
    scope: '公开范围：可匿名试用',
  };
}

function fromMock(card: CardDetailData): Detail {
  return {
    id: card.id,
    title: card.title,
    oneLiner: card.result,
    authorIdentity: card.authorIdentity,
    status: card.status,
    version: card.version,
    problem: card.problem,
    keyActions: card.keyActions.map((action) => ({ ...action, step: String(action.step).padStart(2, '0') })),
    result: card.result,
    suitableFor: card.suitableFor,
    boundary: card.boundary,
    pitfall: card.boundaryNote,
    microAction: card.microAction,
    source: card.source,
    scope: card.scope,
    feedback: card.versionHistory.feedback,
  };
}

export default function CardDetailPage() {
  const navigate = useNavigate();
  const { cardId } = useParams<{ cardId: string }>();
  const [trialOpen, setTrialOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
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
    return <div className="min-h-screen bg-theme-bg"><Navbar /><main className="flex min-h-[60vh] items-center justify-center pt-16"><div className="text-center"><p className="mb-4 text-sm text-theme-text-secondary">{loadError ? `读取失败：${loadError}` : '未找到这张经验卡'}</p><button onClick={() => navigate('/')} className="text-sm text-theme-accent hover:underline">返回经验广场</button></div></main><Footer /></div>;
  }

  return (
    <div className="min-h-screen bg-theme-bg transition-colors duration-300">
      <Navbar />
      <main className="px-4 pb-24 pt-24 md:px-8">
        <div className="mx-auto max-w-6xl">
          <button onClick={() => navigate('/')} className="mb-5 inline-flex items-center gap-1.5 text-xs text-theme-text-secondary transition-colors hover:text-theme-text">
            <i className="ri-arrow-left-line text-sm" />返回经验广场
          </button>

          <article className="overflow-hidden rounded-2xl border border-theme-border bg-theme-bg-card shadow-[0_24px_70px_rgba(54,35,30,0.09)]">
            <header className="border-b border-theme-border px-5 py-6 md:px-9 md:py-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="tag-red rounded-full px-2 py-0.5 text-[10px]">{detail.version} · 已确认</span>
                <span className="tag-ivory rounded-full px-2 py-0.5 text-[10px]">{detail.status}</span>
                <span className="ml-auto text-[11px] text-theme-text-muted">{detail.authorIdentity}</span>
              </div>
              <h1 className="mt-5 max-w-4xl font-heading text-3xl font-black leading-[1.05] text-theme-text md:text-5xl">{detail.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-theme-text-secondary">{detail.oneLiner}</p>
            </header>

            <div className="grid lg:grid-cols-[0.8fr_1.45fr]">
              <aside className="border-b border-theme-border bg-theme-bg-card-alt p-5 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:border-b-0 lg:border-r lg:p-8">
                <p className="chapter-label">先判断是否适合你</p>
                <section className="mt-4 border-b border-theme-border pb-5">
                  <h2 className="text-sm font-semibold text-theme-text">适合带着这些情况来试</h2>
                  <p className="mt-2 text-sm leading-relaxed text-theme-text-secondary">{detail.suitableFor}</p>
                </section>
                <section className="border-b border-theme-border py-5">
                  <h2 className="text-sm font-semibold text-theme-text">使用边界</h2>
                  <p className="mt-2 text-sm leading-relaxed text-theme-text-secondary">{detail.boundary}</p>
                </section>
                <section className="py-5">
                  <span className="text-[10px] uppercase tracking-wider text-theme-text-muted">经验来源</span>
                  <p className="mt-1 text-xs leading-relaxed text-theme-text-secondary">{detail.source}<br />{detail.scope}</p>
                </section>
                <div className="hidden lg:block">
                  <button onClick={() => setTrialOpen(true)} className="w-full rounded-full bg-theme-accent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-theme-accent-hover">在我的情境中试试</button>
                  <button onClick={() => setShareOpen(true)} className="mt-3 w-full rounded-full border border-theme-border px-4 py-3 text-sm font-semibold text-theme-text transition-colors hover:bg-theme-accent-subtle">分享这段经验</button>
                </div>
              </aside>

              <div className="p-5 md:p-8 lg:p-10">
                <section>
                  <span className="chapter-label">01 · 当时真正的问题</span>
                  <p className="mt-3 text-base leading-8 text-theme-text">{detail.problem}</p>
                </section>
                <section className="mt-10">
                  <span className="chapter-label">02 · 关键动作</span>
                  <div className="mt-5 space-y-5">
                    {detail.keyActions.map((action, index) => (
                      <div key={`${action.step}-${action.action}`} className="grid grid-cols-[42px_1fr] gap-3">
                        <span className="pt-0.5 font-mono text-xs text-theme-accent">{action.step}</span>
                        <div className="border-l border-theme-border pl-4"><h3 className="text-base font-semibold text-theme-text">{action.action}</h3>{action.detail && <p className="mt-1 text-sm leading-relaxed text-theme-text-secondary">{action.detail}</p>}</div>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="mt-10 rounded-xl border border-theme-accent-light bg-theme-accent-subtle p-5 md:p-6">
                  <span className="chapter-label">03 · 最终发生了什么</span>
                  <p className="mt-3 text-base leading-8 text-theme-text">{detail.result}</p>
                </section>
                <details className="group mt-8 rounded-xl border border-theme-border p-5">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-theme-text"><span>踩坑与调整</span><i className="ri-add-line float-right text-lg text-theme-accent transition-transform group-open:rotate-45" /></summary>
                  <p className="mt-4 border-t border-theme-border pt-4 text-sm leading-7 text-theme-text-secondary">{detail.pitfall}</p>
                </details>
                <section className="mt-8 border-t border-theme-border pt-6">
                  <span className="chapter-label">v1 → 反馈 → v2</span>
                  <p className="mt-2 text-sm leading-relaxed text-theme-text-secondary">这张卡当前是 {detail.version}。试用反馈只对作者可见，作者确认后才会沉淀为下一版。</p>
                  {detail.feedback && <div className="mt-3 flex flex-wrap gap-2">{detail.feedback.slice(0, 2).map((feedback) => <span key={feedback} className="tag-ivory rounded-full px-2 py-1 text-[11px]">“{feedback}”</span>)}</div>}
                </section>
              </div>
            </div>

            <footer className="sticky bottom-0 flex gap-3 border-t border-theme-border bg-theme-bg-card/95 p-4 backdrop-blur md:hidden">
              <button onClick={() => setShareOpen(true)} className="flex-1 rounded-full border border-theme-border px-3 py-2.5 text-sm font-semibold text-theme-text">分享</button>
              <button onClick={() => setTrialOpen(true)} className="flex-[1.5] rounded-full bg-theme-accent px-3 py-2.5 text-sm font-semibold text-white">在我的情境中试试</button>
            </footer>
          </article>
        </div>
      </main>
      <Footer />
      <TrialDrawer isOpen={trialOpen} onClose={() => setTrialOpen(false)} cardTitle={detail.title} cardId={detail.id} />
      <SharePanel isOpen={shareOpen} onClose={() => setShareOpen(false)} card={{ id: detail.id, title: detail.title, oneLiner: detail.oneLiner, suitableFor: detail.suitableFor, result: detail.result, version: detail.version }} />
    </div>
  );
}
