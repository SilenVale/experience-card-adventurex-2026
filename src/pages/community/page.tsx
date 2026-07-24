import { useState } from 'react';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import {
  communityTabs,
  coCreatingItems,
  seekingTrialItems,
  seekingPartnerItems,
  needHelpItems,
} from '@/mocks/communityData';

type NewRequestType = 'trial' | 'partner' | 'help' | null;

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('cocreating');
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [requestType, setRequestType] = useState<NewRequestType>(null);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const handleNewRequest = (type: NewRequestType) => {
    setRequestType(type);
    setShowNewRequest(false);
    setRequestSubmitted(false);
  };

  const handleSubmitRequest = () => {
    setRequestSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-theme-bg transition-colors duration-300">
      <Navbar />

      <main className="pt-16 pb-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
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
            <div className="relative ml-auto">
              <button
                onClick={() => setShowNewRequest(!showNewRequest)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-heading font-medium border border-theme-gold-light text-theme-gold hover:bg-theme-gold-subtle transition-all cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line" />
                发起请求
              </button>

              {showNewRequest && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNewRequest(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-theme-bg-card border border-theme-accent-light rounded-xl w-56 p-1 z-50 shadow-lg">
                    <button
                      onClick={() => handleNewRequest('trial')}
                      className="w-full text-left px-3 py-2 text-xs text-theme-text hover:bg-theme-accent-subtle rounded-lg transition-colors cursor-pointer"
                    >
                      我想找人试用一段经验
                    </button>
                    <button
                      onClick={() => handleNewRequest('partner')}
                      className="w-full text-left px-3 py-2 text-xs text-theme-text hover:bg-theme-accent-subtle rounded-lg transition-colors cursor-pointer"
                    >
                      我想找人一起完成一件事
                    </button>
                    <button
                      onClick={() => handleNewRequest('help')}
                      className="w-full text-left px-3 py-2 text-xs text-theme-text hover:bg-theme-accent-subtle rounded-lg transition-colors cursor-pointer"
                    >
                      我卡在一个问题上，需要经验帮助
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Request Form Modal */}
          {requestType && !requestSubmitted && (
            <>
              <div className="fixed inset-0 bg-black/70 z-[100]" onClick={() => setRequestType(null)} />
              <div className="fixed inset-0 flex items-center justify-center z-[101] px-4">
                <div className="bg-theme-bg-card border border-theme-accent-light rounded-xl w-full max-w-md p-6 shadow-xl max-h-[80vh] overflow-y-auto">
                  <h3 className="font-heading font-bold text-theme-text text-base mb-4">
                    {requestType === 'trial' && '找人试用一段经验'}
                    {requestType === 'partner' && '找人一起完成一件事'}
                    {requestType === 'help' && '需要经验帮助'}
                  </h3>

                  {requestType === 'trial' && (
                    <div className="space-y-3 mb-5">
                      <textarea
                        className="w-full bg-theme-bg-card-alt border border-theme-accent-light rounded-lg px-3.5 py-2.5 text-sm text-theme-text placeholder:text-theme-text-muted focus:outline-none focus:border-theme-accent transition-colors resize-none h-24"
                        placeholder="描述你想找人试用的经验，以及你希望对方处于什么情境中..."
                      />
                      <input
                        className="w-full bg-theme-bg-card-alt border border-theme-accent-light rounded-lg px-3.5 py-2.5 text-sm text-theme-text placeholder:text-theme-text-muted focus:outline-none focus:border-theme-accent transition-colors"
                        placeholder="适合什么类型的人试用？（可选）"
                      />
                    </div>
                  )}

                  {requestType === 'partner' && (
                    <div className="space-y-3 mb-5">
                      <textarea
                        className="w-full bg-theme-bg-card-alt border border-theme-accent-light rounded-lg px-3.5 py-2.5 text-sm text-theme-text placeholder:text-theme-text-muted focus:outline-none focus:border-theme-accent transition-colors resize-none h-20"
                        placeholder="描述你正在推进什么..."
                      />
                      <input
                        className="w-full bg-theme-bg-card-alt border border-theme-accent-light rounded-lg px-3.5 py-2.5 text-sm text-theme-text placeholder:text-theme-text-muted focus:outline-none focus:border-theme-accent transition-colors"
                        placeholder="你已经做到哪里了？"
                      />
                      <input
                        className="w-full bg-theme-bg-card-alt border border-theme-accent-light rounded-lg px-3.5 py-2.5 text-sm text-theme-text placeholder:text-theme-text-muted focus:outline-none focus:border-theme-accent transition-colors"
                        placeholder="你希望一起完成什么？"
                      />
                    </div>
                  )}

                  {requestType === 'help' && (
                    <div className="space-y-3 mb-5">
                      <textarea
                        className="w-full bg-theme-bg-card-alt border border-theme-accent-light rounded-lg px-3.5 py-2.5 text-sm text-theme-text placeholder:text-theme-text-muted focus:outline-none focus:border-theme-accent transition-colors resize-none h-20"
                        placeholder="描述你卡在什么地方..."
                      />
                      <textarea
                        className="w-full bg-theme-bg-card-alt border border-theme-accent-light rounded-lg px-3.5 py-2.5 text-sm text-theme-text placeholder:text-theme-text-muted focus:outline-none focus:border-theme-accent transition-colors resize-none h-16"
                        placeholder="你的限制是什么？（时间、资源等）"
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setRequestType(null)}
                      className="flex-1 py-2.5 border border-theme-border text-theme-text-secondary hover:text-theme-text rounded-full text-sm cursor-pointer whitespace-nowrap transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSubmitRequest}
                      className="flex-1 py-2.5 bg-theme-accent text-white rounded-full text-sm font-heading font-semibold cursor-pointer whitespace-nowrap hover:bg-theme-accent-hover transition-colors"
                    >
                      发布请求
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Request Success */}
          {requestType && requestSubmitted && (
            <>
              <div className="fixed inset-0 bg-black/70 z-[100]" onClick={() => { setRequestType(null); setRequestSubmitted(false); }} />
              <div className="fixed inset-0 flex items-center justify-center z-[101] px-4">
                <div className="bg-theme-bg-card border border-theme-accent-light rounded-xl w-full max-w-sm p-6 shadow-xl text-center">
                  <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <i className="ri-check-line text-2xl text-theme-gold" />
                  </div>
                  <h3 className="font-heading font-bold text-theme-text text-base mb-2">请求已发布</h3>
                  <p className="text-sm text-theme-text-secondary mb-4">
                    你的请求已发送到社区。有人回应时会通知你。
                  </p>
                  <span className="text-[10px] tag-ivory px-2 py-0.5 rounded-full inline-block">
                    原型演示 · 示例状态
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'cocreating' && (
              <div className="space-y-6">
                {coCreatingItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-theme-bg-card border border-theme-accent-subtle rounded-xl p-5 hover:border-theme-gold-light transition-colors"
                  >
                    <h3 className="font-heading font-bold text-theme-text text-base mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-theme-accent/60" />
                      {item.title}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-theme-bg-card-alt rounded-lg p-3.5">
                        <span className="text-[10px] tag-ivory px-1.5 py-0.5 rounded-full mb-1.5 inline-block">v1</span>
                        <p className="text-xs text-theme-text-secondary leading-relaxed">{item.v1Summary}</p>
                      </div>
                      <div className="flex flex-col justify-center gap-1.5 py-2">
                        {item.feedback.map((fb, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <i className="ri-chat-1-line text-[10px] text-theme-gold/50" />
                            <span className="text-[11px] text-theme-text-secondary">{fb}</span>
                          </div>
                        ))}
                        <div className="h-px w-8 bg-theme-gold-light my-1" />
                        <span className="text-[10px] text-theme-gold-dark/60">匿名试用者反馈</span>
                      </div>
                      <div className="bg-theme-bg-card-alt rounded-lg p-3.5 border border-theme-gold-subtle">
                        <span className="text-[10px] tag-gold px-1.5 py-0.5 rounded-full mb-1.5 inline-block">v2</span>
                        <p className="text-xs text-theme-text-secondary leading-relaxed">{item.v2Changes}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'seeking-trial' && (
              <div className="space-y-4">
                {seekingTrialItems.map((item) => (
                  <div key={item.id} className="bg-theme-bg-card border border-theme-accent-subtle rounded-xl p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-theme-bg-card-alt border border-theme-accent-light flex items-center justify-center flex-shrink-0">
                        <i className="ri-user-search-line text-sm text-theme-accent/60" />
                      </div>
                      <div>
                        <h3 className="text-sm font-heading font-semibold text-theme-text mb-1">{item.cardTitle}</h3>
                        <p className="text-[11px] text-theme-text-secondary">{item.authorIdentity}</p>
                      </div>
                    </div>
                    <p className="text-xs text-theme-text-secondary leading-relaxed mb-3">{item.message}</p>
                    <p className="text-[10px] text-theme-gold-dark/60 mb-3">{item.seekingContext}</p>
                    <button className="px-4 py-1.5 bg-theme-accent text-white rounded-full text-xs font-heading font-medium cursor-pointer whitespace-nowrap hover:bg-theme-accent-hover transition-colors">
                      我正在遇到类似问题
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'seeking-partner' && (
              <div className="space-y-4">
                {seekingPartnerItems.map((item) => (
                  <div key={item.id} className="bg-theme-bg-card border border-theme-accent-subtle rounded-xl p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-theme-bg-card-alt border border-theme-accent-light flex items-center justify-center flex-shrink-0">
                        <i className="ri-team-line text-sm text-theme-accent/60" />
                      </div>
                      <div>
                        <h3 className="text-sm font-heading font-semibold text-theme-text mb-1">{item.what}</h3>
                        <p className="text-[11px] text-theme-text-secondary">{item.authorIdentity}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-theme-accent/50 w-16 flex-shrink-0">已做到</span>
                        <span className="text-xs text-theme-text-secondary">{item.progress}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-theme-gold-dark/50 w-16 flex-shrink-0">需要</span>
                        <span className="text-xs text-theme-text-secondary">{item.need}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-theme-accent/50 w-16 flex-shrink-0">经验卡</span>
                        <span className="text-xs text-theme-text-secondary">{item.experienceCard}</span>
                      </div>
                    </div>
                    <button className="px-4 py-1.5 border border-theme-gold-light text-theme-gold rounded-full text-xs font-heading font-medium cursor-pointer whitespace-nowrap hover:bg-theme-gold-subtle transition-colors">
                      我可以用一张经验卡回应
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'need-help' && (
              <div className="space-y-4">
                {needHelpItems.map((item) => (
                  <div key={item.id} className="bg-theme-bg-card border border-theme-accent-subtle rounded-xl p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-theme-bg-card-alt border border-theme-accent-light flex items-center justify-center flex-shrink-0">
                        <i className="ri-question-line text-sm text-theme-accent/60" />
                      </div>
                      <div>
                        <h3 className="text-sm font-heading font-semibold text-theme-text mb-1">{item.problem}</h3>
                        <p className="text-[11px] text-theme-text-secondary">{item.authorIdentity}</p>
                      </div>
                    </div>
                    <div className="bg-theme-bg-card-alt rounded-lg p-3 mb-3">
                      <span className="text-[10px] text-theme-accent/50">限制条件</span>
                      <p className="text-xs text-theme-text-secondary mt-1">{item.constraints}</p>
                    </div>
                    <p className="text-xs text-theme-gold mb-3">希望找到：{item.whatLookingFor}</p>
                    <button className="px-4 py-1.5 bg-theme-accent text-white rounded-full text-xs font-heading font-medium cursor-pointer whitespace-nowrap hover:bg-theme-accent-hover transition-colors">
                      用经验卡回应
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}