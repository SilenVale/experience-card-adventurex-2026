import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import CommunityOverview from './components/CommunityOverview';
import BuildPublicTimeline from './components/BuildPublicTimeline';
import XiaohongshuPublishModal from './components/XiaohongshuPublishModal';
import {
  communityTabs,
  coCreatingItems,
  seekingTrialItems,
  seekingPartnerItems,
  needHelpItems,
} from '@/mocks/communityData';

export default function CommunityPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cocreating');
  const [publisherOpen, setPublisherOpen] = useState(false);
  const [publisherProjectTitle, setPublisherProjectTitle] = useState('零预算办校园活动');

  const openPublisher = (projectTitle: string) => {
    setPublisherProjectTitle(projectTitle);
    setPublisherOpen(true);
  };

  return (
    <div className="min-h-screen bg-theme-bg transition-colors duration-300">
      <Navbar />

      <main className="pt-16 pb-20">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {/* Header */}
          <div className="mb-8 md:mb-10">
            <h1 className="font-heading font-black text-theme-text text-2xl md:text-4xl leading-tight mb-3">
              经验不是被收藏的答案，
              <br />
              而是在别人需要时，成为<span className="text-theme-accent">下一步</span>。
            </h1>
            <p className="text-sm text-theme-text-secondary max-w-lg">
              让经验帮助行动。不是社交，不是招聘，不是人才市场。
            </p>
          </div>

          <section className="mb-9 rounded-2xl border border-theme-border bg-theme-bg-card p-5 md:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="chapter-label">公开构建中的反馈</span>
                <h2 className="mt-2 text-lg font-bold text-theme-text">经验不是发完就结束。</h2>
                <p className="mt-1 text-sm text-theme-text-secondary">这三条是展示用的共创样本：外部反馈会先被作者判断，再进入下一版经验卡。</p>
              </div>
              <span className="tag-ivory rounded-full px-2 py-1 text-[10px]">示例反馈 · 不读取平台评论</span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                ['一位学生体验者', '“我最需要的不是更多方法，而是知道这套方法在资源很少时还能不能先试。”'],
                ['一位独立创作者', '“希望看到失败时具体改了什么，而不是只看到最后结果。”'],
                ['一位活动组织者', '“我会先带着自己的时间限制试一次，再回来告诉作者哪里不适用。”'],
              ].map(([author, quote]) => (
                <blockquote key={author} className="rounded-xl bg-theme-bg-card-alt p-4">
                  <p className="text-sm leading-relaxed text-theme-text">{quote}</p>
                  <footer className="mt-3 text-[11px] text-theme-text-muted">— {author}</footer>
                </blockquote>
              ))}
            </div>
          </section>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            <div className="flex items-center rounded-full px-1 py-1 gap-0.5 bg-theme-bg-card">
              {communityTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-heading font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-theme-accent text-white'
                      : 'text-theme-text-secondary hover:text-theme-text'
                  }`}
                >
                  <i className={`${tab.icon} text-xs`} />
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/create')}
              className="ml-auto flex items-center gap-1.5 rounded-full border border-theme-gold-light px-3.5 py-1.5 text-xs font-medium text-theme-gold transition-colors hover:bg-theme-gold-subtle"
              title="先创建并发布一张经验卡，再邀请别人试用"
            >
              <i className="ri-add-line" />
              发起请求
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'cocreating' && (
              <div className="space-y-6">
                <CommunityOverview
                  onOpenPublisher={openPublisher}
                  onJoinTask={() => navigate('/')}
                />
                {coCreatingItems.map((item) => (
                  <article
                    key={item.id}
                    className="ui-motion overflow-hidden rounded-[22px] border border-theme-accent-subtle bg-theme-bg-card p-4 shadow-[0_16px_45px_rgba(89,52,43,0.05)] transition-colors hover:border-theme-gold-light md:p-5"
                  >
                    <div className="mb-4 flex flex-wrap items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-theme-accent/15 bg-theme-accent-subtle px-2.5 py-1 text-[9px] font-semibold text-theme-accent">
                            {item.phase}
                          </span>
                          <span className="rounded-full border border-theme-border px-2.5 py-1 text-[9px] text-theme-text-muted">
                            {item.visibility}
                          </span>
                          <span className="rounded-full border border-theme-border px-2.5 py-1 text-[9px] text-theme-text-muted">
                            展示样本
                          </span>
                        </div>
                        <h3 className="flex items-center gap-2 font-heading text-base font-bold text-theme-text">
                          <span className="h-1.5 w-1.5 rounded-full bg-theme-accent/60" />
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-[10px] text-theme-text-muted">
                          需要：{item.neededRole} · 截止 {item.deadline}
                        </p>
                      </div>
                      <div className="w-full sm:w-40">
                        <div className="mb-1.5 flex justify-between text-[9px] text-theme-text-muted">
                          <span>{item.participantCount} 人参与</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-theme-bg-card-alt">
                          <div className="h-full rounded-full bg-theme-accent" style={{ width: `${item.progress}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-lg bg-theme-bg-card-alt p-3.5">
                        <span className="tag-ivory mb-1.5 inline-block rounded-full px-1.5 py-0.5 text-[10px]">v1</span>
                        <p className="text-xs leading-relaxed text-theme-text-secondary">{item.v1Summary}</p>
                      </div>
                      <div className="flex flex-col justify-center gap-1.5 py-2">
                        {item.feedback.map((feedback) => (
                          <div key={feedback} className="flex items-center gap-1.5">
                            <i className="ri-chat-1-line text-[10px] text-theme-gold/50" />
                            <span className="text-[11px] text-theme-text-secondary">{feedback}</span>
                          </div>
                        ))}
                        <div className="my-1 h-px w-8 bg-theme-gold-light" />
                        <span className="text-[10px] text-theme-gold-dark/60">匿名试用者反馈</span>
                      </div>
                      <div className="rounded-lg border border-theme-gold-subtle bg-theme-bg-card-alt p-3.5">
                        <span className="tag-gold mb-1.5 inline-block rounded-full px-1.5 py-0.5 text-[10px]">v2</span>
                        <p className="text-xs leading-relaxed text-theme-text-secondary">{item.v2Changes}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 border-t border-dashed border-theme-border pt-4 sm:flex-row sm:justify-end">
                      <button
                        onClick={() => navigate('/')}
                        className="rounded-full border border-theme-text/10 px-4 py-2 text-xs font-semibold text-theme-text transition-colors hover:bg-theme-bg-card-alt"
                      >
                        参与这次试用
                      </button>
                      <button
                        onClick={() => openPublisher(item.title)}
                        className="rounded-full bg-theme-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-theme-accent-hover"
                      >
                        <i className="ri-red-packet-line mr-1.5" />
                        生成公开构建记录
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {activeTab === 'build-public' && <BuildPublicTimeline onOpenPublisher={openPublisher} />}

            {activeTab === 'seeking-trial' && (
              <div className="space-y-4">
                {seekingTrialItems.map((item) => (
                  <article key={item.id} className="ui-motion rounded-xl border border-theme-accent-subtle bg-theme-bg-card p-5">
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-theme-accent-light bg-theme-bg-card-alt">
                        <i className="ri-user-search-line text-sm text-theme-accent/60" />
                      </div>
                      <div>
                        <h3 className="mb-1 text-sm font-semibold text-theme-text">{item.cardTitle}</h3>
                        <p className="text-[11px] text-theme-text-secondary">{item.authorIdentity} · 展示样本</p>
                      </div>
                    </div>
                    <p className="mb-3 text-xs leading-relaxed text-theme-text-secondary">{item.message}</p>
                    <p className="mb-3 text-[10px] text-theme-gold-dark/60">{item.seekingContext}</p>
                    <button onClick={() => navigate('/')} className="rounded-full bg-theme-accent px-4 py-1.5 text-xs font-medium text-white hover:bg-theme-accent-hover">
                      我正在遇到类似问题
                    </button>
                  </article>
                ))}
              </div>
            )}

            {activeTab === 'seeking-partner' && (
              <div className="space-y-4">
                {seekingPartnerItems.map((item) => (
                  <article key={item.id} className="ui-motion rounded-xl border border-theme-accent-subtle bg-theme-bg-card p-5">
                    <h3 className="mb-1 text-sm font-semibold text-theme-text">{item.what}</h3>
                    <p className="mb-4 text-[11px] text-theme-text-secondary">{item.authorIdentity} · 展示样本</p>
                    <dl className="mb-3 space-y-2 text-xs text-theme-text-secondary">
                      <div className="flex gap-2"><dt className="w-16 flex-shrink-0 text-theme-accent/60">已做到</dt><dd>{item.progress}</dd></div>
                      <div className="flex gap-2"><dt className="w-16 flex-shrink-0 text-theme-gold-dark/60">需要</dt><dd>{item.need}</dd></div>
                      <div className="flex gap-2"><dt className="w-16 flex-shrink-0 text-theme-accent/60">经验卡</dt><dd>{item.experienceCard}</dd></div>
                    </dl>
                    <button onClick={() => navigate('/')} className="rounded-full border border-theme-gold-light px-4 py-1.5 text-xs font-medium text-theme-gold hover:bg-theme-gold-subtle">
                      我可以用一张经验卡回应
                    </button>
                  </article>
                ))}
              </div>
            )}

            {activeTab === 'need-help' && (
              <div className="space-y-4">
                {needHelpItems.map((item) => (
                  <article key={item.id} className="ui-motion rounded-xl border border-theme-accent-subtle bg-theme-bg-card p-5">
                    <h3 className="mb-1 text-sm font-semibold text-theme-text">{item.problem}</h3>
                    <p className="mb-3 text-[11px] text-theme-text-secondary">{item.authorIdentity} · 展示样本</p>
                    <div className="mb-3 rounded-lg bg-theme-bg-card-alt p-3">
                      <span className="text-[10px] text-theme-accent/50">限制条件</span>
                      <p className="mt-1 text-xs text-theme-text-secondary">{item.constraints}</p>
                    </div>
                    <p className="mb-3 text-xs text-theme-gold">希望找到：{item.whatLookingFor}</p>
                    <button onClick={() => navigate('/')} className="rounded-full bg-theme-accent px-4 py-1.5 text-xs font-medium text-white hover:bg-theme-accent-hover">
                      用经验卡回应
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <XiaohongshuPublishModal
        open={publisherOpen}
        projectTitle={publisherProjectTitle}
        onClose={() => setPublisherOpen(false)}
      />
    </div>
  );
}
