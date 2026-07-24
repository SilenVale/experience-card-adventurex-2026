import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { listMyExperienceCards, type ExperienceCardRecord } from '@/lib/experienceCards';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import LoginModal from '@/components/feature/LoginModal';

export default function MyCardsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cards, setCards] = useState<ExperienceCardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const fetchCards = async () => {
    if (!user) {
      setCards([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await listMyExperienceCards(user.id);
      setCards(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : '读取失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [user]);

  const published = cards.filter((c) => c.status === 'published');
  const drafts = cards.filter((c) => c.status === 'draft');

  const themeBg = 'bg-theme-bg';
  const themeCard = 'bg-theme-bg-card';
  const themeBorder = 'border-theme-border';
  const themeBorderAccent = 'border-theme-border-accent';
  const themeText = 'text-theme-text';
  const themeTextSec = 'text-theme-text-secondary';
  const themeTextMuted = 'text-theme-text-muted';

  return (
    <div className={`min-h-screen ${themeBg} transition-colors duration-300`}>
      <Navbar />
      <main className="pt-16 pb-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {/* Profile Header */}
          <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10 pb-8 ${themeBorder} border-b`}>
            <div className={`w-16 h-16 rounded-full ${themeCard} ${themeBorderAccent} flex items-center justify-center flex-shrink-0`}>
              {user ? (
                <span className="text-xl font-heading font-bold text-theme-accent">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </span>
              ) : (
                <i className="ri-user-line text-xl text-theme-accent/70" />
              )}
            </div>
            <div>
              <h1 className={`font-heading font-bold ${themeText} text-xl mb-0.5`}>
                {user ? user.email?.split('@')[0] || '匿名体验者' : '匿名体验者'}
              </h1>
              <p className={`text-sm ${themeTextSec} max-w-md`}>
                我愿意分享的经验：如何从零开始做一件事，如何面对失败，以及如何帮助下一个正在经历同样阶段的人。
              </p>
            </div>
            <div className="sm:ml-auto flex-shrink-0">
              {user ? (
                <span className="text-[10px] tag-red px-2 py-0.5 rounded-full">
                  已登录
                </span>
              ) : (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="px-4 py-1.5 bg-theme-accent text-white rounded-full text-xs font-heading font-semibold cursor-pointer whitespace-nowrap hover:bg-theme-accent-hover transition-colors"
                >
                  登录查看
                </button>
              )}
            </div>
          </div>

          {/* Warning if not logged in */}
          {!user && (
            <div className={`${themeCard} ${themeBorderAccent} rounded-xl px-4 py-3 mb-8 flex items-start gap-3`}>
              <i className="ri-information-line text-sm text-theme-gold/70 flex-shrink-0 mt-0.5" />
              <p className={`text-xs ${themeTextSec} leading-relaxed`}>
                登录后才能查看和创建经验名片。
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-theme-accent-subtle border border-theme-accent-light rounded-lg px-4 py-3 mb-6 text-xs text-theme-accent flex items-center gap-2">
              <span>读取失败：{error}</span>
              <button onClick={fetchCards} className="underline cursor-pointer whitespace-nowrap">重试</button>
            </div>
          )}

          {/* Loading */}
          {loading && user && (
            <div className="flex flex-col items-center py-16 gap-3">
              <i className="ri-loader-4-line text-2xl text-theme-accent/60 animate-spin" />
              <span className={`text-xs ${themeTextMuted}`}>加载中...</span>
            </div>
          )}

          {!loading && user && (
            <>
              {/* Published Cards */}
              {published.length > 0 && (
                <section className="mb-10">
                  <h2 className="text-xs font-heading font-semibold text-theme-accent/70 uppercase tracking-wider mb-4">
                    已发布经验卡
                  </h2>
                  <div className="space-y-3">
                    {published.map((card) => (
                      <div
                        key={card.id}
                        className={`flex items-center justify-between ${themeCard} ${themeBorderAccent} rounded-xl px-4 py-3.5 hover:border-theme-accent cursor-pointer transition-colors`}
                        onClick={() => navigate(`/card/${card.id}`)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg ${themeBg} ${themeBorderAccent} flex items-center justify-center flex-shrink-0`}>
                            <i className="ri-file-text-line text-xs text-theme-accent/60" />
                          </div>
                          <div className="min-w-0">
                            <h3 className={`text-sm ${themeText} truncate`}>{card.title}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="tag-red text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                {card.status === 'published' ? '已发布' : card.status}
                              </span>
                              <span className={`text-[10px] ${themeTextMuted}`}>
                                {new Date(card.updated_at).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <i className={`ri-arrow-right-s-line ${themeTextMuted} flex-shrink-0`} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Drafts */}
              {drafts.length > 0 && (
                <section className="mb-10">
                  <h2 className="text-xs font-heading font-semibold text-theme-accent/70 uppercase tracking-wider mb-4">
                    草稿
                  </h2>
                  <div className="space-y-3">
                    {drafts.map((card) => (
                      <div
                        key={card.id}
                        className={`flex items-center justify-between ${themeCard} ${themeBorderAccent} rounded-xl px-4 py-3.5 hover:border-theme-accent cursor-pointer transition-colors`}
                        onClick={() => navigate(`/create?draft=${card.id}`)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg ${themeBg} border border-dashed border-theme-accent-light flex items-center justify-center flex-shrink-0`}>
                            <i className={`ri-draft-line text-xs ${themeTextMuted}`} />
                          </div>
                          <div className="min-w-0">
                            <h3 className={`text-sm ${themeText} truncate`}>{card.title}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[10px] ${themeTextMuted} hidden sm:block`}>
                            {new Date(card.updated_at).toLocaleDateString('zh-CN')}
                          </span>
                          <span className="text-[10px] tag-ivory px-1.5 py-0.5 rounded-full whitespace-nowrap">草稿</span>
                          <i className={`ri-arrow-right-s-line ${themeTextMuted}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Empty */}
              {cards.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <i className={`ri-file-add-line text-2xl ${themeTextMuted}`} />
                  </div>
                  <p className={`text-sm ${themeTextSec} mb-4`}>还没有经验卡</p>
                  <button
                    onClick={() => navigate('/create')}
                    className="px-5 py-2 bg-theme-accent text-white rounded-full text-sm font-heading font-semibold cursor-pointer whitespace-nowrap hover:bg-theme-accent-hover transition-colors"
                  >
                    创建第一张经验卡
                  </button>
                </div>
              )}

              {/* Share Records - static for now */}
              <section>
                <h2 className="text-xs font-heading font-semibold text-theme-accent/70 uppercase tracking-wider mb-4">
                  我的分享记录
                </h2>
                <div className={`${themeCard} ${themeBorder} rounded-xl px-4 py-6 text-center`}>
                  <p className={`text-xs ${themeTextMuted}`}>
                    分享记录将在未来版本中展示
                  </p>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        reason="查看个人页面需要登录"
      />
    </div>
  );
}
