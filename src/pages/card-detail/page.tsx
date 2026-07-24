import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import TrialDrawer from '@/components/feature/TrialDrawer';
import { cardDetails } from '@/mocks/cardDetailData';
import { getExperienceCard, type ExperienceCardRecord } from '@/lib/experienceCards';

const isUuid = (value: string | undefined) => Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));

function toDetail(card: ExperienceCardRecord) {
  const actions = card.actions_done
    .split(/\n|\d+[.、)]/)
    .map((action) => action.trim())
    .filter(Boolean);

  return {
    id: card.id,
    version: 'v1',
    status: '已发布',
    title: card.title,
    authorIdentity: '作者确认的经验',
    problem: card.problem || card.background || '作者尚未补充当时面对的问题。',
    keyActions: (actions.length ? actions : [card.actions_done || '作者尚未补充关键动作']).map((action, index) => ({
      step: String(index + 1).padStart(2, '0'),
      action,
      detail: '',
    })),
    result: card.result || card.one_liner || card.background,
    suitableFor: card.suitable_for || '请结合自己的具体情境判断是否适用。',
    boundary: card.boundary || '作者尚未补充边界，请谨慎试用。',
    boundaryNote: card.pitfall || '这段经验来自作者自述，不承诺在不同资源和时间条件下得到同样结果。',
    microAction: '带着你的具体限制，点击下方按钮先试一个最小行动。',
    versionHistory: {
      v1: '当前为作者确认并发布的 v1。',
      feedback: ['试用反馈只对作者可见'],
      v2: '收到足够反馈后，作者可以发布下一版。',
    },
    source: '作者主动提交的真实经历',
    scope: '已发布 · 公开可试用',
  };
}

export default function CardDetailPage() {
  const navigate = useNavigate();
  const { cardId } = useParams<{ cardId: string }>();
  const [trialOpen, setTrialOpen] = useState(false);
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

  const mockDetail = cardId ? cardDetails[cardId] : undefined;
  const detail: any = realCard ? toDetail(realCard) : mockDetail;

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg transition-colors duration-300">
        <Navbar />
        <main className="pt-16 flex items-center justify-center min-h-[60vh] text-sm text-theme-text-secondary">正在加载经验卡...</main>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-theme-bg transition-colors duration-300">
        <Navbar />
        <main className="pt-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-theme-text-secondary mb-4">{loadError ? `读取失败：${loadError}` : '未找到这张经验卡'}</p>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-theme-accent hover:underline cursor-pointer"
            >
              返回经验广场
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg transition-colors duration-300">
      <Navbar />
      <main className="pt-16 pb-24">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {/* Back */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-theme-text-secondary hover:text-theme-text transition-colors cursor-pointer mb-6"
          >
            <i className="ri-arrow-left-line text-sm" />
            返回经验广场
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="tag-ivory text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">示例体验</span>
              {detail.version === 'v2' && (
                <span className="tag-gold text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">v2 · 已更新</span>
              )}
              {detail.version === 'v1' && (
                <span className="tag-ivory text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">v1 · 可试用</span>
              )}
              <span className="tag-red text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">{detail.status}</span>
            </div>
            <h1 className="font-heading font-black text-theme-text text-2xl md:text-3xl leading-tight mb-3">
              {detail.title}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-theme-text-secondary">{detail.authorIdentity}</span>
              <span className="w-1 h-1 rounded-full bg-theme-text-muted/30" />
              <button className="flex items-center gap-1 text-xs text-theme-text-muted hover:text-theme-text-secondary cursor-pointer transition-colors">
                <i className="ri-share-line text-sm" />
                分享
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Problem */}
            <section>
              <h2 className="text-xs font-heading font-semibold text-theme-accent/70 uppercase tracking-wider mb-3">
                我当时面对的问题
              </h2>
              <p className="text-sm text-theme-text leading-relaxed">
                {detail.problem}
              </p>
            </section>

            {/* Key Actions */}
            <section>
              <h2 className="text-xs font-heading font-semibold text-theme-accent/70 uppercase tracking-wider mb-4">
                我做过的关键动作
              </h2>
              <div className="space-y-0">
                {detail.keyActions.map((action, i) => (
                  <div key={i} className="flex gap-4 relative pb-5">
                    {i < detail.keyActions.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-0 w-px bg-theme-gold-light" />
                    )}
                    <div className="w-8 h-8 rounded-full bg-theme-bg-card border border-theme-gold-light flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-[11px] font-heading font-bold text-theme-gold">{action.step}</span>
                    </div>
                    <div className="pt-1">
                      <h3 className="text-sm font-heading font-semibold text-theme-text mb-1">
                        {action.action}
                      </h3>
                      <p className="text-xs text-theme-text-secondary leading-relaxed">
                        {action.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Result */}
            <section className="bg-theme-bg-card border border-theme-accent-subtle rounded-xl p-5">
              <h2 className="text-xs font-heading font-semibold text-theme-accent/70 uppercase tracking-wider mb-2">
                最终发生了什么
              </h2>
              <p className="text-sm text-theme-text leading-relaxed">
                {detail.result}
              </p>
            </section>

            {/* Suitable For */}
            <section>
              <h2 className="text-xs font-heading font-semibold text-theme-gold-dark/70 uppercase tracking-wider mb-2">
                这段经验适合谁
              </h2>
              <p className="text-sm text-theme-text leading-relaxed">
                {detail.suitableFor}
              </p>
            </section>

            {/* Boundary */}
            <section className="bg-theme-accent-subtle border border-theme-accent-light rounded-xl p-5">
              <h2 className="text-xs font-heading font-semibold text-theme-accent/80 uppercase tracking-wider mb-2">
                不适合谁 / 使用边界
              </h2>
              <p className="text-sm text-theme-text leading-relaxed mb-3">
                {detail.boundary}
              </p>
              <div className="border-t border-theme-accent-light pt-3">
                <p className="text-xs text-theme-text-secondary leading-relaxed">
                  {detail.boundaryNote}
                </p>
              </div>
            </section>

            {/* Micro Action */}
            <section className="bg-theme-bg-card border border-theme-gold-light rounded-xl p-5">
              <h2 className="text-xs font-heading font-semibold text-theme-gold-dark/70 uppercase tracking-wider mb-2">
                你今天可以先尝试的一个微行动
              </h2>
              <p className="text-sm text-theme-text leading-relaxed">
                {detail.microAction}
              </p>
            </section>

            {/* Version History */}
            <section>
              <h2 className="text-xs font-heading font-semibold text-theme-accent/70 uppercase tracking-wider mb-4">
                版本演变
              </h2>
              <div className="flex flex-col md:flex-row gap-4 md:gap-0 items-stretch md:items-center">
                <div className="flex-1 bg-theme-bg-card border border-theme-accent-subtle rounded-xl p-4">
                  <span className="text-[10px] tag-ivory px-1.5 py-0.5 rounded-full mb-2 inline-block">v1</span>
                  <p className="text-xs text-theme-text-secondary leading-relaxed">{detail.versionHistory.v1}</p>
                </div>
                <div className="flex md:flex-col items-center gap-2 px-0 md:px-4 py-2 md:py-0 justify-center">
                  {detail.versionHistory.feedback.map((fb, i) => (
                    <div key={i} className="flex md:flex-col items-center gap-1.5">
                      <div className="w-6 md:w-0.5 h-0.5 md:h-4 bg-theme-gold/25" />
                      <span className="text-[10px] text-theme-gold-dark/60 max-w-[100px] text-center leading-tight">{fb}</span>
                      <div className="w-6 md:w-0.5 h-0.5 md:h-4 bg-theme-gold/25" />
                    </div>
                  ))}
                </div>
                <div className="flex-1 bg-theme-bg-card border border-theme-gold-light rounded-xl p-4">
                  <span className="text-[10px] tag-gold px-1.5 py-0.5 rounded-full mb-2 inline-block">v2</span>
                  <p className="text-xs text-theme-text-secondary leading-relaxed">{detail.versionHistory.v2}</p>
                </div>
              </div>
            </section>

            {/* Source */}
            <section className="border-t border-theme-accent-subtle pt-6">
              <h2 className="text-xs font-heading font-semibold text-theme-accent/70 uppercase tracking-wider mb-2">
                经验来源与可信标记
              </h2>
              <div className="flex flex-wrap gap-2">
                <span className="text-[11px] text-theme-text-secondary bg-theme-bg-card border border-theme-text-muted/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <i className="ri-verified-badge-line text-theme-gold text-xs" />
                  {detail.source}
                </span>
                <span className="text-[11px] text-theme-text-secondary bg-theme-bg-card border border-theme-text-muted/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <i className="ri-eye-line text-theme-gold text-xs" />
                  {detail.scope}
                </span>
              </div>
            </section>
          </div>
        </div>

        {/* Bottom Fixed CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-theme-bg/95 backdrop-blur-xl border-t border-theme-accent-subtle z-40">
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
            <p className="text-xs text-theme-text-muted hidden sm:block">
              试试这段经验是否适合你的情境
            </p>
            <button
              onClick={() => setTrialOpen(true)}
              className="px-6 py-2.5 bg-theme-accent text-white rounded-full text-sm font-heading font-semibold cursor-pointer whitespace-nowrap hover:bg-theme-accent-hover transition-colors flex-1 sm:flex-none"
            >
              带着我的情境试试
            </button>
          </div>
        </div>
      </main>
      <Footer />

      <TrialDrawer
        isOpen={trialOpen}
        onClose={() => setTrialOpen(false)}
        cardTitle={detail.title}
        cardId={detail.id}
      />
    </div>
  );
}
