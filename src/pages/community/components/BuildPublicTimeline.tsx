import { buildLogItems } from '@/mocks/communityData';

interface BuildPublicTimelineProps {
  onOpenPublisher: (projectTitle: string) => void;
}

const visibilityStyles = {
  公开: 'border-theme-accent/15 bg-theme-accent-subtle text-theme-accent',
  共创者可见: 'border-theme-gold-light bg-theme-gold-subtle text-theme-gold-dark',
  私人草稿: 'border-theme-border bg-theme-bg-card-alt text-theme-text-muted',
};

export default function BuildPublicTimeline({ onOpenPublisher }: BuildPublicTimelineProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="ui-motion rounded-[24px] border border-theme-border bg-theme-bg-card p-4 shadow-[0_18px_50px_rgba(89,52,43,0.06)] md:p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold tracking-[0.14em] text-theme-accent">BUILD IN PUBLIC</span>
            <h2 className="mt-1 font-heading text-xl font-black tracking-[-0.04em] text-theme-text md:text-2xl">
              一张经验卡如何被社区接住
            </h2>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-theme-text-secondary">
              我们公开问题、失败和版本变化，但不公开核心实现。每一条记录都可以绑定真实的小红书笔记。
            </p>
          </div>
          <button
            onClick={() => onOpenPublisher('零预算办校园活动')}
            className="hidden cursor-pointer items-center gap-1.5 rounded-full bg-theme-accent px-4 py-2 text-xs font-semibold text-white hover:bg-theme-accent-hover sm:flex"
          >
            <i className="ri-add-line" />
            发布记录
          </button>
        </div>

        <div className="relative ml-3 border-l border-dashed border-theme-accent/25 pl-8 md:ml-5 md:pl-12">
          {buildLogItems.map((log, index) => (
            <article
              key={log.id}
              className={`relative ${index === buildLogItems.length - 1 ? '' : 'mb-5 border-b border-dashed border-theme-border pb-5'}`}
            >
              <div className="absolute -left-[49px] top-0 flex h-8 w-9 items-center justify-center rounded-xl bg-theme-accent font-heading text-xs font-bold text-white shadow-sm md:-left-[67px] md:h-10 md:w-11">
                {log.day}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-semibold text-theme-accent">{log.date}</span>
                <span className={`rounded-full border px-2 py-0.5 text-[9px] ${visibilityStyles[log.visibility]}`}>
                  {log.visibility}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[9px] ${
                    log.xiaohongshuStatus === '已发布'
                      ? 'border-theme-accent/15 text-theme-accent'
                      : 'border-theme-border text-theme-text-muted'
                  }`}
                >
                  <i className="ri-red-packet-line mr-1" />
                  小红书 · {log.xiaohongshuStatus}
                </span>
              </div>
              <h3 className="mt-2 font-heading text-base font-bold text-theme-text md:text-lg">{log.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-theme-text-secondary md:text-sm">{log.summary}</p>
              <div className="mt-3 rounded-xl border border-theme-border bg-theme-bg-card-alt px-3.5 py-3">
                <span className="text-[9px] font-semibold tracking-wider text-theme-accent">这次改了什么</span>
                <p className="mt-1 text-xs leading-relaxed text-theme-text-secondary">{log.change}</p>
              </div>
              {log.xiaohongshuUrl && (
                <a
                  href={log.xiaohongshuUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-theme-accent hover:underline"
                >
                  查看公开构建记录
                  <i className="ri-arrow-right-up-line" />
                </a>
              )}
            </article>
          ))}
        </div>

        <button
          onClick={() => onOpenPublisher('零预算办校园活动')}
          className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-theme-accent py-3 text-xs font-semibold text-white hover:bg-theme-accent-hover sm:hidden"
        >
          <i className="ri-add-line" />
          发布新的构建记录
        </button>
      </div>

      <aside className="space-y-3">
        <div className="ui-motion rounded-[20px] border border-theme-border bg-theme-bg-card p-5">
          <span className="text-[10px] font-semibold tracking-[0.12em] text-theme-accent">版本证据</span>
          <div className="mt-4 flex items-center gap-2">
            <span className="rounded-full border border-theme-accent/20 px-3 py-1 text-xs font-semibold text-theme-accent">V1</span>
            <i className="ri-arrow-right-line text-theme-text-muted" />
            <span className="rounded-full border border-theme-gold-light px-3 py-1 text-xs font-semibold text-theme-gold-dark">反馈</span>
            <i className="ri-arrow-right-line text-theme-text-muted" />
            <span className="rounded-full bg-theme-accent px-3 py-1 text-xs font-semibold text-white">V2</span>
          </div>
          <dl className="mt-5 space-y-3 text-xs">
            <div className="flex justify-between">
              <dt className="text-theme-text-muted">试用者</dt>
              <dd className="font-semibold text-theme-text">6 人</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-theme-text-muted">收到反馈</dt>
              <dd className="font-semibold text-theme-text">9 条</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-theme-text-muted">已采纳</dt>
              <dd className="font-semibold text-theme-accent">4 条</dd>
            </div>
          </dl>
        </div>

        <div className="ui-motion rounded-[20px] border border-theme-accent/10 bg-theme-accent-subtle p-5">
          <i className="ri-double-quotes-l text-xl text-theme-accent/35" />
          <p className="mt-2 text-xs leading-relaxed text-theme-text-secondary">
            “原来公开构建不是每天宣布进度，而是让别人看见：哪一个真实反馈改变了项目。”
          </p>
          <span className="mt-3 block text-[10px] text-theme-text-muted">一位匿名试用者</span>
        </div>
      </aside>
    </div>
  );
}
