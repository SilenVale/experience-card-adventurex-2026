import { communityActivities, communityStats } from '@/mocks/communityData';

interface CommunityOverviewProps {
  onOpenPublisher: (projectTitle: string) => void;
  onJoinTask: () => void;
}

export default function CommunityOverview({
  onOpenPublisher,
  onJoinTask,
}: CommunityOverviewProps) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-3">
        <span className="chapter-label">社区正在发生</span>
        <div className="h-px flex-1 bg-theme-border" />
        <span className="hidden text-[10px] text-theme-text-muted sm:block">DEMO LIVE · 公开构建中</span>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {communityStats.map((stat, index) => (
          <div
            key={stat.label}
            className="ui-motion relative overflow-hidden rounded-2xl border border-theme-border bg-theme-bg-card px-4 py-4 shadow-[0_12px_30px_rgba(89,52,43,0.04)]"
          >
            <span className="absolute right-3 top-2 text-[10px] font-semibold text-theme-accent/25">
              0{index + 1}
            </span>
            <strong className="font-heading text-2xl font-black tracking-[-0.05em] text-theme-text md:text-3xl">
              {stat.value}
            </strong>
            <p className="mt-1 text-xs font-semibold text-theme-text">{stat.label}</p>
            <p className="mt-2 text-[10px] text-theme-text-muted">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.55fr_0.75fr]">
        <article className="ui-motion relative overflow-hidden rounded-[24px] border border-theme-border bg-theme-bg-card p-3 shadow-[0_18px_60px_rgba(89,52,43,0.07)] md:p-4">
          <div className="absolute right-10 top-6 hidden h-6 w-20 rotate-[5deg] rounded-full border-[3px] border-theme-text-muted/35 md:block" />
          <div className="relative rotate-[-0.4deg] rounded-[18px] border border-theme-border bg-theme-bg-card-alt px-5 pb-5 pt-6 shadow-[0_12px_30px_rgba(78,44,37,0.08)] md:px-8 md:pb-7">
            <div className="absolute bottom-7 left-3 top-7 flex flex-col justify-between md:left-4">
              {[0, 1, 2, 3, 4].map((hole) => (
                <span key={hole} className="h-2.5 w-2.5 rounded-full bg-theme-border" />
              ))}
            </div>

            <div className="pl-5 md:pl-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-theme-accent/20 bg-theme-accent-subtle px-3 py-1 text-[10px] font-semibold text-theme-accent">
                  V1 · 收集反馈
                </span>
                <span className="rounded-full border border-theme-border px-3 py-1 text-[10px] text-theme-text-secondary">
                  6 人正在参与
                </span>
                <span className="ml-auto text-[10px] text-theme-text-muted">截止 7 月 27 日</span>
              </div>

              <p className="mt-5 text-[10px] font-semibold tracking-[0.14em] text-theme-accent">
                本周主共创任务
              </p>
              <h2 className="mt-2 max-w-2xl font-heading text-2xl font-black leading-[1.05] tracking-[-0.05em] text-theme-text md:text-4xl">
                零预算办校园活动：
                <br />
                从 0 报名到第一批参与者
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-theme-text-secondary">
                不是单纯增加报名人数，而是让对 AI 感兴趣却不敢开始的人，知道活动能给自己一个低门槛的实践入口。
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-[18px] border border-theme-border bg-theme-bg-card-alt/70 px-4 py-5 md:px-7">
            <div className="relative ml-3 border-l border-dashed border-theme-accent/25 pl-8 md:ml-5 md:pl-10">
              {[
                {
                  no: '01',
                  title: '真正的问题',
                  body: '泛泛地讲“AI 分享”无法让用户判断自己能否参加。',
                },
                {
                  no: '02',
                  title: '正在验证的动作',
                  body: '把主题改成现场完成第一个 AI 小工具，并找到 5 位种子参与者定向转发。',
                },
                {
                  no: '03',
                  title: '需要社区补上的经验',
                  body: '没有社群基础时，第一条私信应该发给谁？怎样不让对方感到被营销？',
                },
              ].map((step, index) => (
                <div
                  key={step.no}
                  className={`relative ${index === 2 ? '' : 'mb-5 border-b border-dashed border-theme-border pb-5'}`}
                >
                  <span className="absolute -left-[51px] top-0 flex h-7 w-8 items-center justify-center rounded-xl bg-theme-accent text-[10px] font-bold text-white md:-left-[58px]">
                    {step.no}
                  </span>
                  <p className="text-xs font-semibold text-theme-accent">{step.no} · {step.title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-theme-text-secondary md:text-sm">{step.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
            onClick={onJoinTask}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-theme-text/15 py-3 text-sm font-semibold text-theme-text transition-colors hover:bg-theme-bg-card-alt"
            >
              <i className="ri-user-add-line" />
              先试用一张公开经验卡
            </button>
            <button
              onClick={() => onOpenPublisher('零预算办校园活动')}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-theme-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-theme-accent-hover"
            >
              <i className="ri-red-packet-line" />
              生成小红书构建记录
            </button>
          </div>
        </article>

        <aside className="ui-motion rounded-[24px] border border-theme-border bg-theme-bg-card p-5 shadow-[0_18px_60px_rgba(89,52,43,0.05)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.12em] text-theme-accent">LIVE PULSE</p>
              <h3 className="mt-1 font-heading text-lg font-bold text-theme-text">刚刚发生</h3>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] text-theme-text-muted">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-theme-accent" />
              实时
            </span>
          </div>

          <div className="mt-5 space-y-1">
            {communityActivities.map((activity) => (
              <div
                key={activity.id}
                className="group flex gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-theme-bg-card-alt"
              >
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border ${
                    activity.accent
                      ? 'border-theme-accent/15 bg-theme-accent-subtle text-theme-accent'
                      : 'border-theme-border bg-theme-bg-card-alt text-theme-text-secondary'
                  }`}
                >
                  <i className={`${activity.icon} text-sm`} />
                </div>
                <div>
                  <p className="text-xs leading-relaxed text-theme-text-secondary">{activity.text}</p>
                  <span className="mt-1 block text-[10px] text-theme-text-muted">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-theme-accent/10 bg-theme-accent-subtle p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-theme-accent">
              <i className="ri-shield-keyhole-line" />
              公开构建，不等于公开全部
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-theme-text-secondary">
              公开问题与版本变化；具体方法只对共创者可见；核心实现继续保留在私人草稿。
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[9px]">
              <span className="rounded-full bg-theme-bg-card px-2 py-1 text-theme-accent">公开摘要</span>
              <span className="rounded-full bg-theme-bg-card px-2 py-1 text-theme-gold-dark">共创者可见</span>
              <span className="rounded-full bg-theme-bg-card px-2 py-1 text-theme-text-muted">私人草稿</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
