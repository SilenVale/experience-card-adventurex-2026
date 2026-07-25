import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  listMyExperienceCards,
  listTrialFeedbackForCards,
  type ExperienceCardRecord,
  type TrialFeedbackRecord,
} from '@/lib/experienceCards';
import { getMyProfile, type ProfileRecord } from '@/lib/profiles';
import FadeContent from '@/components/effects/FadeContent';
import Navbar from '@/components/feature/Navbar';
import LoginModal from '@/components/feature/LoginModal';

const PROFILE_BIO = '把做成过、踩过坑的真实经历，整理成别人今天就能试一步的经验。';

export default function MyCardsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const transitionTimer = useRef<number | null>(null);
  const [cards, setCards] = useState<ExperienceCardRecord[]>([]);
  const [feedback, setFeedback] = useState<TrialFeedbackRecord[]>([]);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileTransitioning, setProfileTransitioning] = useState(false);
  const [leavingPage, setLeavingPage] = useState(false);

  const fetchCards = useCallback(async () => {
    if (!user) {
      setCards([]);
      setFeedback([]);
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [cardData, profileData] = await Promise.all([
        listMyExperienceCards(user.id),
        getMyProfile(user.id),
      ]);
      setCards(cardData);
      setProfile(profileData);
      setFeedback(await listTrialFeedbackForCards(cardData.map((card) => card.id)));
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : '读取失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  useEffect(() => {
    return () => {
      if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    };
  }, []);

  const published = cards.filter((card) => card.status === 'published');
  const drafts = cards.filter((card) => card.status === 'draft');
  const displayName =
    profile?.display_name?.trim() ||
    user?.email?.split('@')[0] ||
    '经验分享者';
  const avatarFallback = displayName[0]?.toUpperCase() || 'E';

  const profileTags = useMemo(() => {
    const tags = ['真实经历'];
    if (published.length > 0) tags.push('可试用');
    if (feedback.length > 0) tags.push('有反馈');
    if (drafts.length > 0) tags.push('持续构建');
    return tags.slice(0, 4);
  }, [drafts.length, feedback.length, published.length]);

  const openProfile = () => {
    if (profileTransitioning) return;
    setProfileTransitioning(true);
    transitionTimer.current = window.setTimeout(() => {
      setProfileOpen(true);
      setProfileTransitioning(false);
    }, 360);
  };

  const leaveFor = (path: string) => {
    if (leavingPage) return;
    setLeavingPage(true);
    transitionTimer.current = window.setTimeout(() => navigate(path), 280);
  };

  const themeCard = 'bg-theme-bg-card';
  const themeBorder = 'border-theme-border';
  const themeBorderAccent = 'border-theme-border-accent';
  const themeText = 'text-theme-text';
  const themeTextSec = 'text-theme-text-secondary';
  const themeTextMuted = 'text-theme-text-muted';

  return (
    <div className="min-h-screen bg-theme-bg transition-colors duration-300">
      <Navbar />
      <main className="pt-16 pb-20 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {!user && (
            <FadeContent duration={500} className="max-w-xl mx-auto">
              <section className={`${themeCard} ${themeBorderAccent} border rounded-[28px] px-6 py-10 text-center`}>
                <div className="w-16 h-16 rounded-full bg-theme-bg-card-alt mx-auto mb-4 flex items-center justify-center">
                  <i className="ri-user-line text-2xl text-theme-accent/70" />
                </div>
                <h1 className={`font-heading font-bold ${themeText} text-2xl mb-2`}>打开你的个人经验名片</h1>
                <p className={`text-sm ${themeTextSec} leading-relaxed mb-6`}>
                  登录后查看自己的公开经验、草稿和收到的试用反馈。
                </p>
                <button
                  onClick={() => setLoginOpen(true)}
                  className="px-6 py-2.5 bg-theme-accent text-white rounded-full text-sm font-heading font-semibold cursor-pointer hover:bg-theme-accent-hover transition-colors"
                >
                  登录 / 注册
                </button>
              </section>
            </FadeContent>
          )}

          {error && user && (
            <div className="bg-theme-accent-subtle border border-theme-accent-light rounded-xl px-4 py-3 mb-6 text-xs text-theme-accent flex items-center gap-2">
              <span>读取失败：{error}</span>
              <button onClick={fetchCards} className="underline cursor-pointer whitespace-nowrap">重试</button>
            </div>
          )}

          {loading && user && (
            <div className="flex flex-col items-center py-24 gap-3">
              <i className="ri-loader-4-line text-2xl text-theme-accent/60 animate-spin" />
              <span className={`text-xs ${themeTextMuted}`}>正在打开你的经验名片...</span>
            </div>
          )}

          {!loading && user && !profileOpen && (
            <section
              className={`transition-all duration-300 ${
                profileTransitioning
                  ? 'opacity-0 scale-[0.985] translate-y-1'
                  : 'opacity-100 scale-100 translate-y-0'
              }`}
            >
              <p className="chapter-label text-center mb-5">MY EXPERIENCE PROFILE</p>
              <button
                onClick={openProfile}
                disabled={profileTransitioning}
                className="group relative block w-full max-w-[760px] aspect-[1.48/1] md:aspect-[1.72/1] mx-auto text-left cursor-pointer disabled:cursor-wait"
                aria-label="打开个人经验名片"
              >
                <span className="absolute inset-x-8 top-0 bottom-7 rounded-[30px] bg-[#e9ded1] border border-black/5 rotate-[-2.4deg] transition-transform duration-500 group-hover:rotate-[-3.2deg]" />
                <span className="absolute inset-x-5 top-4 bottom-3 rounded-[30px] bg-[#f1e9df] border border-black/5 rotate-[1.6deg] transition-transform duration-500 group-hover:rotate-[2.3deg]" />
                <span className={`absolute inset-0 rounded-[32px] ${themeCard} border ${themeBorderAccent} overflow-hidden shadow-[0_24px_70px_rgba(81,54,40,0.10)] transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-[0_32px_90px_rgba(81,54,40,0.15)]`}>
                  <span className="absolute -left-[10%] bottom-[-32%] w-[58%] aspect-square rounded-full bg-[#efe6dc]" />
                  <span className="absolute right-[-7%] top-[-12%] w-[42%] aspect-square rounded-full border border-theme-accent/10" />
                  <span className="absolute right-[7%] bottom-[18%] w-[37%] h-[3px] bg-theme-accent rotate-[-15deg] origin-right">
                    <span className="absolute right-[-2px] top-1/2 w-4 h-4 border-t-[3px] border-r-[3px] border-theme-accent rotate-45 -translate-y-1/2" />
                  </span>
                  <span className="absolute right-[33%] bottom-[29%] w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#264a7c]" />

                  <span className="relative z-10 flex flex-col h-full p-6 md:p-10">
                    <span className="flex items-start justify-between gap-4">
                      <span>
                        <span className="mono-label text-theme-accent">PERSONAL EXPERIENCE CARD</span>
                        <span className={`block mt-3 font-heading font-black ${themeText} text-2xl md:text-4xl tracking-tight`}>
                          {displayName}
                        </span>
                      </span>
                      <span className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-theme-bg-card-alt border border-theme-border-accent overflow-hidden flex items-center justify-center">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt={`${displayName} 的头像`} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-heading font-black text-xl md:text-2xl text-theme-accent">{avatarFallback}</span>
                        )}
                      </span>
                    </span>

                    <span className={`mt-auto max-w-[62%] text-xs md:text-base leading-relaxed ${themeTextSec}`}>
                      {PROFILE_BIO}
                    </span>
                    <span className="flex items-center justify-between mt-4">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-theme-accent" />
                        <span className="w-2.5 h-2.5 rounded-full border border-theme-text-muted/50" />
                        <span className="w-2.5 h-2.5 rounded-full border border-theme-text-muted/50" />
                      </span>
                      <span className="flex items-center gap-2 text-xs md:text-sm font-heading font-semibold text-theme-accent">
                        点击打开
                        <i className="ri-arrow-right-line transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </span>
                  </span>
                </span>
              </button>
              <p className={`text-center text-xs ${themeTextMuted} mt-6`}>
                打开名片，查看这个人的经验卡集合
              </p>
            </section>
          )}

          {!loading && user && profileOpen && (
            <div
              className={`transition-all duration-300 ${
                leavingPage ? 'opacity-0 scale-[0.99] translate-y-1' : 'opacity-100 scale-100'
              }`}
              aria-busy={leavingPage}
            >
              <FadeContent duration={560} blur>
                <section className={`relative ${themeCard} border ${themeBorderAccent} rounded-[28px] overflow-hidden p-5 md:p-7 shadow-[0_16px_50px_rgba(81,54,40,0.08)]`}>
                  <div className="absolute -right-20 -top-20 w-56 h-56 rounded-full border border-theme-accent/10" />
                  <div className="relative flex flex-col md:flex-row md:items-center gap-5">
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-24 rounded-[24px] bg-theme-bg-card-alt border border-theme-border-accent overflow-hidden flex items-center justify-center">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt={`${displayName} 的头像`} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-heading font-black text-3xl text-theme-accent">{avatarFallback}</span>
                        )}
                      </div>
                      <span className="absolute -right-2 -bottom-2 w-8 h-8 rounded-full bg-[#264a7c] border-4 border-theme-bg-card" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="mono-label text-theme-accent mb-1.5">PERSONAL CARD / OPEN</p>
                      <h1 className={`font-heading font-black ${themeText} text-2xl md:text-3xl tracking-tight`}>{displayName}</h1>
                      <p className={`text-sm ${themeTextSec} leading-relaxed mt-2 max-w-2xl`}>{PROFILE_BIO}</p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {profileTags.map((tag) => (
                          <span key={tag} className="tag-red text-[10px] px-2.5 py-1 rounded-full">{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-1 gap-2 md:w-36 flex-shrink-0">
                      <ProfileStat label="已发布" value={published.length} />
                      <ProfileStat label="试用反馈" value={feedback.length} />
                      <ProfileStat label="草稿" value={drafts.length} />
                    </div>
                  </div>

                  <div className={`relative grid sm:grid-cols-2 gap-2 mt-6 pt-5 border-t ${themeBorder}`}>
                    <button
                      disabled
                      className="flex items-center justify-between rounded-2xl border border-theme-border bg-theme-bg-card-alt px-4 py-3 text-left opacity-70 cursor-not-allowed"
                      title="当前项目尚未配置头像存储桶"
                    >
                      <span className="flex items-center gap-3">
                        <i className="ri-image-add-line text-theme-accent" />
                        <span>
                          <span className={`block text-xs font-semibold ${themeText}`}>从相册导入</span>
                          <span className={`block text-[10px] ${themeTextMuted} mt-0.5`}>待头像存储接入</span>
                        </span>
                      </span>
                      <span className="tag-ivory text-[9px] px-2 py-0.5 rounded-full">预留</span>
                    </button>
                    <button
                      onClick={() => leaveFor('/pixel-portrait')}
                      className="flex items-center justify-between rounded-2xl border border-theme-border-accent bg-theme-bg-card-alt px-4 py-3 text-left cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-theme-accent"
                    >
                      <span className="flex items-center gap-3">
                        <i className="ri-camera-lens-line text-[#264a7c]" />
                        <span>
                          <span className={`block text-xs font-semibold ${themeText}`}>
                            {profile?.avatar_url ? '重新生成像素头像' : '生成像素头像'}
                          </span>
                          <span className={`block text-[10px] ${themeTextMuted} mt-0.5`}>摄像头本地抠图 · 白底像素化</span>
                        </span>
                      </span>
                      <i className="ri-arrow-right-line text-theme-accent" />
                    </button>
                  </div>

                  {profile?.pixel_card_url && (
                    <div className={`relative mt-5 pt-5 border-t ${themeBorder}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <img
                          src={profile.pixel_card_url}
                          alt="我的像素经验名片"
                          className="w-full sm:w-52 aspect-video object-cover rounded-xl border border-theme-border-accent"
                        />
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold ${themeText}`}>像素经验名片成片</p>
                          <p className={`text-[10px] ${themeTextMuted} mt-1`}>
                            {(profile.pixel_keywords ?? []).map((keyword) => `#${keyword}`).join(' ') || '尚未填写关键词'}
                          </p>
                          <a
                            href={profile.pixel_card_url}
                            download="experience-card-pixel-profile.png"
                            className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-theme-accent hover:underline"
                          >
                            <i className="ri-download-2-line" />
                            下载 PNG
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              </FadeContent>

              <FadeContent duration={560} delay={100} blur className="mt-10">
                <div className="flex items-end justify-between gap-4 mb-5">
                  <div>
                    <p className="chapter-label mb-1.5">EXPERIENCE LIBRARY</p>
                    <h2 className={`font-heading font-black ${themeText} text-xl md:text-2xl`}>我的个人经验卡</h2>
                    <p className={`text-xs ${themeTextMuted} mt-1`}>名片是入口，经验卡是可以被别人真正试用的内容。</p>
                  </div>
                  <button
                    onClick={() => leaveFor('/create')}
                    className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-theme-accent text-white text-xs font-semibold cursor-pointer hover:bg-theme-accent-hover transition-colors"
                  >
                    <i className="ri-add-line" />
                    新建经验卡
                  </button>
                </div>

                {published.length > 0 && (
                  <section className="mb-10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`text-xs font-heading font-semibold ${themeTextSec}`}>已发布经验卡</h3>
                      <span className={`text-[10px] ${themeTextMuted}`}>{published.length} 张</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {published.map((card, index) => {
                        const cardFeedback = feedback.filter((item) => item.card_id === card.id);
                        return (
                          <article key={card.id} className="space-y-2">
                            <button
                              onClick={() => leaveFor(`/card/${card.id}`)}
                              className={`group relative w-full min-h-56 ${themeCard} border ${themeBorderAccent} rounded-[24px] overflow-hidden p-5 text-left cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(81,54,40,0.10)]`}
                            >
                              <span className="absolute -left-10 -bottom-16 w-40 h-40 rounded-full bg-theme-bg-card-alt" />
                              <span className="absolute right-5 top-5 mono-label text-theme-text-muted">0{index + 1}</span>
                              <span className="relative flex flex-col min-h-44">
                                <span className="flex items-center gap-2">
                                  <span className="tag-red text-[9px] px-2 py-0.5 rounded-full">V1 · 可试用</span>
                                  <span className={`text-[9px] ${themeTextMuted}`}>
                                    {new Date(card.updated_at).toLocaleDateString('zh-CN')}
                                  </span>
                                </span>
                                <span className={`block font-heading font-bold ${themeText} text-lg leading-snug mt-5 pr-8`}>
                                  {card.title}
                                </span>
                                <span className={`block text-xs ${themeTextSec} leading-relaxed mt-2 line-clamp-3`}>
                                  {card.one_liner || card.problem}
                                </span>
                                <span className="mt-auto flex items-center justify-between pt-5">
                                  <span className={`text-[10px] ${themeTextMuted}`}>{cardFeedback.length} 条试用反馈</span>
                                  <span className="flex items-center gap-1 text-xs font-semibold text-theme-accent">
                                    打开经验卡
                                    <i className="ri-arrow-right-line transition-transform duration-300 group-hover:translate-x-1" />
                                  </span>
                                </span>
                              </span>
                            </button>
                            <FeedbackPanel items={cardFeedback} />
                          </article>
                        );
                      })}
                    </div>
                  </section>
                )}

                {drafts.length > 0 && (
                  <section className="mb-10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`text-xs font-heading font-semibold ${themeTextSec}`}>仅自己可见的草稿</h3>
                      <span className={`text-[10px] ${themeTextMuted}`}>{drafts.length} 张</span>
                    </div>
                    <div className="space-y-3">
                      {drafts.map((card) => (
                        <button
                          key={card.id}
                          onClick={() => leaveFor(`/create?draft=${card.id}`)}
                          className={`group w-full flex items-center justify-between ${themeCard} border border-dashed ${themeBorderAccent} rounded-2xl px-4 py-4 text-left cursor-pointer transition-all duration-300 hover:border-theme-accent`}
                        >
                          <span className="flex items-center gap-3 min-w-0">
                            <span className="w-10 h-10 rounded-xl bg-theme-bg-card-alt flex items-center justify-center flex-shrink-0">
                              <i className="ri-draft-line text-theme-text-muted" />
                            </span>
                            <span className="min-w-0">
                              <span className={`block text-sm ${themeText} truncate`}>{card.title}</span>
                              <span className={`block text-[10px] ${themeTextMuted} mt-0.5`}>
                                更新于 {new Date(card.updated_at).toLocaleDateString('zh-CN')}
                              </span>
                            </span>
                          </span>
                          <span className="flex items-center gap-2 flex-shrink-0">
                            <span className="tag-ivory text-[9px] px-2 py-0.5 rounded-full">草稿</span>
                            <i className="ri-arrow-right-s-line text-theme-text-muted transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {cards.length === 0 && (
                  <div className={`${themeCard} border ${themeBorder} rounded-[24px] px-5 py-14 text-center`}>
                    <i className={`ri-file-add-line text-3xl ${themeTextMuted}`} />
                    <p className={`text-sm ${themeTextSec} mt-3 mb-4`}>你的名片里还没有经验卡</p>
                    <button
                      onClick={() => leaveFor('/create')}
                      className="px-5 py-2 bg-theme-accent text-white rounded-full text-sm font-heading font-semibold cursor-pointer hover:bg-theme-accent-hover transition-colors"
                    >
                      创建第一张经验卡
                    </button>
                  </div>
                )}
              </FadeContent>
            </div>
          )}
        </div>
      </main>

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        reason="查看个人页面需要登录"
      />
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-theme-bg-card-alt border border-theme-border px-3 py-2.5 text-center md:text-left">
      <strong className="block font-heading text-lg text-theme-text leading-none">{value}</strong>
      <span className="block text-[9px] text-theme-text-muted mt-1">{label}</span>
    </div>
  );
}

function FeedbackPanel({ items }: { items: TrialFeedbackRecord[] }) {
  return (
    <div className="bg-theme-bg-card border border-theme-border rounded-2xl px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-theme-text-secondary">作者收到的情境试用反馈</span>
        <span className="text-[10px] text-theme-text-muted">{items.length} 条</span>
      </div>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <details key={item.id} className="rounded-xl bg-theme-bg-card-alt px-3 py-2">
            <summary className="cursor-pointer text-xs text-theme-text">
              {item.trial_result} · {new Date(item.created_at).toLocaleDateString('zh-CN')}
            </summary>
            <div className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-theme-text-secondary">
              <p><strong>试用情境：</strong>{item.situation}</p>
              <p><strong>限制：</strong>{item.constraints}</p>
              <p><strong>原因：</strong>{item.reason}</p>
              <p><strong>微行动：</strong>{item.micro_action}</p>
              <p><strong>边界：</strong>{item.boundary_note}</p>
            </div>
          </details>
        ))}
        {items.length === 0 && (
          <p className="text-[11px] text-theme-text-muted">还没有收到反馈。</p>
        )}
      </div>
    </div>
  );
}
