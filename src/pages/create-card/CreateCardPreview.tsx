interface CreateCardPreviewProps {
  title: string;
  oneLiner: string;
  problem: string;
  actions: string;
  result: string;
  boundary: string;
  pitfall: string;
  microAction: string;
  stageLabel: string;
}

export default function CreateCardPreview({
  title,
  oneLiner,
  problem,
  actions,
  result,
  boundary,
  pitfall,
  microAction,
  stageLabel,
}: CreateCardPreviewProps) {
  const actionItems = actions
    .split(/\n|；|;/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[10px] font-semibold tracking-[0.12em] text-theme-accent">实时预览</span>
        <span className="flex items-center gap-1 text-[9px] text-theme-text-muted">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-theme-accent" />
          自动保存
        </span>
      </div>

      <div className="ui-motion overflow-hidden rounded-[22px] border border-theme-border bg-theme-bg-card p-2.5 shadow-[0_20px_60px_rgba(89,52,43,0.08)]">
        <div className="mb-2 flex items-center gap-1.5 px-1">
          <span className="rounded-full border border-theme-accent/15 bg-theme-accent-subtle px-2 py-1 text-[8px] font-semibold text-theme-accent">
            V1 · 草稿
          </span>
          <span className="rounded-full border border-theme-border px-2 py-1 text-[8px] text-theme-text-muted">
            {stageLabel}
          </span>
        </div>

        <div className="relative rotate-[-0.4deg] rounded-[15px] border border-theme-border bg-theme-bg-card-alt px-7 py-6 shadow-sm">
          <div className="absolute bottom-5 left-2 top-5 flex flex-col justify-between">
            {[0, 1, 2, 3].map((hole) => (
              <span key={hole} className="h-1.5 w-1.5 rounded-full bg-theme-border" />
            ))}
          </div>
          <span className="text-[8px] font-semibold tracking-wider text-theme-accent">EXPERIENCE CARD</span>
          <h2 className="mt-3 font-heading text-xl font-black leading-[1.02] tracking-[-0.05em] text-theme-text">
            {title || '我的经验名片（草稿）'}
          </h2>
          <p className="mt-3 line-clamp-3 text-[10px] leading-relaxed text-theme-text-secondary">
            {oneLiner || problem || '完成追问后，这里会出现一句可以被别人理解的经验摘要。'}
          </p>
        </div>

        <div className="mt-2 space-y-2">
          <div className="rounded-[14px] border border-theme-border bg-theme-bg-card px-3 py-3">
            <p className="text-[8px] font-semibold text-theme-accent">先判断是否适合你</p>
            <p className="mt-1 text-[10px] font-semibold text-theme-text">
              {problem ? '适合正在面对类似问题的人' : '等待补充适用情境'}
            </p>
          </div>
          <div className="rounded-[14px] border border-theme-border bg-theme-bg-card px-3 py-3">
            <p className="text-[8px] font-semibold text-theme-accent">使用边界</p>
            <p className="mt-1 line-clamp-2 text-[9px] leading-relaxed text-theme-text-secondary">
              {boundary || '等待补充不适合照搬的情况'}
            </p>
          </div>
        </div>

        <div className="mt-2 rounded-[15px] border border-theme-border bg-theme-bg-card-alt px-3 py-4">
          <div className="space-y-3">
            <div>
              <p className="text-[8px] font-semibold text-theme-accent">01 · 真正的问题</p>
              <p className="mt-1 line-clamp-2 text-[9px] leading-relaxed text-theme-text-secondary">
                {problem || '等待回答第一个问题'}
              </p>
            </div>
            <div className="border-y border-dashed border-theme-border py-3">
              <p className="text-[8px] font-semibold text-theme-accent">02 · 关键动作</p>
              <div className="mt-1.5 space-y-1">
                {(actionItems.length ? actionItems : ['等待整理关键动作']).map((action) => (
                  <p key={action} className="flex items-start gap-1.5 text-[9px] text-theme-text-secondary">
                    <i className="ri-check-line text-theme-accent" />
                    <span className="line-clamp-1">{action}</span>
                  </p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[8px] font-semibold text-theme-accent">03 · 最终发生了什么</p>
              <p className="mt-1 line-clamp-2 text-[9px] leading-relaxed text-theme-text-secondary">
                {result || '等待补充真实结果'}
              </p>
            </div>
          </div>
        </div>

        {pitfall && (
          <div className="mt-2 rounded-[14px] border border-theme-accent/10 bg-theme-accent-subtle px-3 py-2.5">
            <p className="text-[8px] font-semibold text-theme-accent">踩坑与调整</p>
            <p className="mt-1 line-clamp-2 text-[9px] text-theme-text-secondary">{pitfall}</p>
          </div>
        )}

        {microAction && (
          <div className="mt-2 rounded-[14px] border border-theme-gold-light bg-theme-gold-subtle px-3 py-2.5">
            <p className="text-[8px] font-semibold text-theme-gold-dark">今天可以先试的一步</p>
            <p className="mt-1 line-clamp-2 text-[9px] text-theme-text-secondary">{microAction}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
