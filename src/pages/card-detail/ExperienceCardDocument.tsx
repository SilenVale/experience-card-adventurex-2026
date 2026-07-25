import type { CardDetailData } from '@/mocks/cardDetailData';

interface ExperienceCardDocumentProps {
  detail: CardDetailData;
  shareStatus: 'idle' | 'copied' | 'failed';
  onBack: () => void;
  onShare: () => void;
  onTrial: () => void;
}

function PaperHoles() {
  return (
    <div className="absolute bottom-8 left-3 top-8 flex flex-col justify-between md:left-4">
      {[0, 1, 2, 3, 4].map((hole) => (
        <span key={hole} className="h-2.5 w-2.5 rounded-full bg-[#D9CDC1]/80" />
      ))}
    </div>
  );
}

function PixelCorner({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute grid grid-cols-3 gap-1 opacity-50 ${className}`} aria-hidden="true">
      <span className="h-1.5 w-1.5 bg-theme-accent/70" />
      <span className="h-1.5 w-1.5 bg-theme-accent/20" />
      <span className="h-1.5 w-1.5 bg-transparent" />
      <span className="h-1.5 w-1.5 bg-transparent" />
      <span className="h-1.5 w-1.5 bg-theme-accent/35" />
      <span className="h-1.5 w-1.5 bg-theme-accent/15" />
    </div>
  );
}

export default function ExperienceCardDocument({
  detail,
  shareStatus,
  onBack,
  onShare,
  onTrial,
}: ExperienceCardDocumentProps) {
  return (
    <main className="experience-motion pt-16 pb-16">
      <div className="mx-auto max-w-4xl px-3 py-6 sm:px-5 md:py-10">
        <button
          onClick={onBack}
          className="mb-4 flex cursor-pointer items-center gap-1.5 text-xs text-theme-text-secondary transition-colors hover:text-theme-text"
        >
          <i className="ri-arrow-left-line text-sm" />
          返回经验广场
        </button>

        <article className="relative overflow-hidden rounded-[26px] border border-theme-border bg-theme-bg-card p-3 shadow-[0_24px_80px_rgba(89,52,43,0.08)] md:p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2 px-1 md:px-2">
            <span className="rounded-full border border-theme-accent/20 bg-theme-accent-subtle px-3 py-1.5 text-[10px] font-semibold text-theme-accent">
              {detail.version.toUpperCase()} · 已确认
            </span>
            <span className="rounded-full border border-theme-border bg-theme-bg-card-alt px-3 py-1.5 text-[10px] text-theme-text-secondary">
              {detail.status}
            </span>
            <span className="ml-auto hidden items-center gap-1.5 text-[10px] text-theme-text-secondary sm:flex">
              <i className="ri-verified-badge-line text-theme-accent" />
              作者确认的真实经历
            </span>
          </div>

          <header className="relative mb-3 rotate-[-0.35deg] overflow-hidden rounded-[20px] border border-theme-border bg-[#FFFCF8] px-8 py-8 shadow-[0_12px_34px_rgba(78,44,37,0.09)] md:px-16 md:py-10">
            <PaperHoles />
            <PixelCorner className="right-8 top-7" />
            <div className="absolute right-8 top-7 hidden h-7 w-20 rotate-[8deg] rounded-full border-[3px] border-[#777]/55 md:block" />
            <span className="text-[10px] font-semibold tracking-[0.14em] text-theme-accent">
              EXPERIENCE CARD / {detail.personaId.toUpperCase()}
            </span>
            <h1 className="mt-4 max-w-3xl font-heading text-3xl font-black leading-[1.02] tracking-[-0.055em] text-[#1A1514] md:text-5xl">
              {detail.title}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#6B5B55] md:text-base">
              {detail.problem}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-dashed border-theme-accent/20 pt-4 text-[10px] text-[#8C7A74]">
              <span>{detail.authorIdentity}</span>
              <span className="h-1 w-1 rounded-full bg-theme-accent/30" />
              <span>{detail.scope}</span>
            </div>
          </header>

          <section className="mb-3 space-y-2.5">
            <div className="relative overflow-hidden rounded-[18px] border border-theme-border bg-theme-bg-card px-5 py-5 shadow-sm md:px-6">
              <PixelCorner className="bottom-3 right-3" />
              <p className="mb-4 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em] text-theme-accent">
                <i className="ri-sparkling-2-fill" />
                先判断是否适合你
              </p>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-theme-accent/15 bg-theme-accent-subtle text-theme-accent">
                  <i className="ri-group-line text-2xl" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-theme-text">适合带着这些情境来试</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-theme-text-secondary">{detail.suitableFor}</p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[18px] border border-theme-border bg-theme-bg-card px-5 py-5 shadow-sm md:px-6">
              <PixelCorner className="right-3 top-3" />
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-theme-gold-light bg-theme-gold-subtle text-theme-text">
                  <i className="ri-shield-line text-2xl" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-theme-text">使用边界</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-theme-text-secondary">{detail.boundary}</p>
                  <p className="mt-2 text-xs leading-relaxed text-theme-text-muted">{detail.boundaryNote}</p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[18px] border border-theme-border bg-theme-bg-card px-5 py-5 shadow-sm md:px-6">
              <PixelCorner className="bottom-3 right-3" />
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-theme-border bg-theme-bg-card-alt text-theme-text">
                  <i className="ri-file-list-3-line text-2xl" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-theme-text">经验来源</h2>
                  <ul className="mt-2 space-y-1.5 text-sm text-theme-text-secondary">
                    <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-theme-accent/60" />{detail.source}</li>
                    <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-theme-accent/60" />{detail.scope}</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="relative mb-3 overflow-hidden rounded-[20px] border border-theme-border bg-[#FFFCF8] px-5 py-6 shadow-[0_12px_34px_rgba(78,44,37,0.08)] md:px-9 md:py-8">
            <div className="absolute bottom-0 right-0 h-0 w-0 border-b-[48px] border-l-[48px] border-b-theme-bg-card-alt border-l-transparent" />
            <div className="relative ml-4 border-l border-dashed border-theme-accent/25 pl-10 md:ml-7 md:pl-14">
              <div className="relative border-b border-dashed border-theme-border pb-6">
                <span className="absolute -left-[57px] top-0 flex h-10 w-11 items-center justify-center rounded-xl bg-theme-accent text-xs font-bold text-white md:-left-[76px]">
                  01
                </span>
                <p className="text-xs font-semibold text-theme-accent">01 · 当时真正的问题</p>
                <p className="mt-2 text-sm leading-relaxed text-theme-text md:text-base">{detail.problem}</p>
              </div>

              <div className="relative border-b border-dashed border-theme-border py-6">
                <span className="absolute -left-[57px] top-6 flex h-10 w-11 items-center justify-center rounded-xl bg-theme-accent text-xs font-bold text-white md:-left-[76px]">
                  02
                </span>
                <p className="text-xs font-semibold text-theme-accent">02 · 关键动作</p>
                <div className="mt-3 space-y-3">
                  {detail.keyActions.map((action) => (
                    <div key={action.step} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border border-theme-accent/20 bg-theme-accent-subtle text-theme-accent">
                        <i className="ri-check-line text-xs" />
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-theme-text">{action.action}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-theme-text-secondary">{action.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative pt-6">
                <span className="absolute -left-[57px] top-6 flex h-10 w-11 items-center justify-center rounded-xl bg-theme-accent text-xs font-bold text-white md:-left-[76px]">
                  03
                </span>
                <p className="text-xs font-semibold text-theme-accent">03 · 最终发生了什么</p>
                <p className="mt-2 text-sm leading-relaxed text-theme-text md:text-base">{detail.result}</p>
              </div>
            </div>
          </section>

          <details className="group mb-3 rounded-[18px] border border-theme-border bg-theme-bg-card shadow-sm">
            <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-theme-accent/10 bg-theme-accent-subtle text-theme-accent">
                <i className="ri-list-check-3" />
              </span>
              <span className="font-heading text-base font-bold text-theme-text">踩坑与调整</span>
              <i className="ri-add-line ml-auto text-xl text-theme-accent transition-transform group-open:rotate-45" />
            </summary>
            <div className="border-t border-dashed border-theme-border px-5 pb-5 pt-4">
              <p className="text-xs leading-relaxed text-theme-text-secondary">{detail.pitfall || detail.boundaryNote}</p>
              <p className="mt-3 text-[11px] leading-relaxed text-theme-text-muted">{detail.boundaryNote}</p>
              <div className="mt-3 space-y-2">
                {detail.versionHistory.feedback.map((feedback) => (
                  <div key={feedback} className="flex items-start gap-2 text-xs text-theme-text-secondary">
                    <i className="ri-chat-1-line mt-0.5 text-theme-accent/60" />
                    {feedback}
                  </div>
                ))}
              </div>
            </div>
          </details>

          <section className="mb-3 rounded-[18px] border border-theme-accent/10 bg-theme-accent-subtle px-5 py-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-theme-accent/10 bg-theme-bg-card text-theme-accent">
                <i className="ri-loop-left-line" />
              </span>
              <div>
                <h2 className="font-heading text-sm font-semibold text-theme-accent">V1 → 反馈 → V2</h2>
                <p className="mt-1 text-xs leading-relaxed text-theme-text-secondary">
                  {detail.versionHistory.v1} 当前收到 {detail.versionHistory.feedback.length} 条反馈；
                  {detail.version === 'v2' ? detail.versionHistory.v2 : '作者确认后会沉淀为下一版。'}
                </p>
              </div>
            </div>
          </section>

          <section className="mb-3 rounded-[18px] border border-theme-gold-light bg-theme-gold-subtle px-5 py-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-theme-bg-card text-theme-gold-dark">
                <i className="ri-footprint-line" />
              </span>
              <div>
                <h2 className="font-heading text-sm font-semibold text-theme-text">今天可以先做的一步</h2>
                <p className="mt-1 text-xs leading-relaxed text-theme-text-secondary">{detail.microAction}</p>
              </div>
            </div>
          </section>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              onClick={onShare}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-theme-text/20 py-3 text-sm font-semibold text-theme-text transition-colors hover:bg-theme-bg-card-alt"
              aria-live="polite"
            >
              <i className={shareStatus === 'copied' ? 'ri-check-line' : 'ri-share-line'} />
              {shareStatus === 'copied' ? '链接已复制' : shareStatus === 'failed' ? '复制失败，请复制地址栏' : '分享经验卡'}
            </button>
            <button
              onClick={onTrial}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-theme-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-theme-accent-hover"
            >
              <i className="ri-sparkling-2-line" />
              在我的情境中试试
            </button>
          </div>
        </article>
      </div>
    </main>
  );
}
