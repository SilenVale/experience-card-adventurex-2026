import { useNavigate } from 'react-router-dom';

interface FeaturedCardProps {
  onTrialOpen: (title: string, id: string) => void;
}

export default function FeaturedCard({ onTrialOpen }: FeaturedCardProps) {
  const navigate = useNavigate();

  return (
    <section className="relative py-14 md:py-20 px-4 md:px-12 lg:px-16 bg-theme-bg-secondary transition-colors duration-300">
      <div className="max-w-site mx-auto">
        <div className="mb-8 md:mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="chapter-label">一张真实的经验卡</span>
            <div className="flex-1 h-px bg-theme-border" />
          </div>
          <p className="text-sm text-theme-text-secondary max-w-md">
            不是照搬别人的答案，而是判断这段经验是否适合你的处境。
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="card-featured">
            <div className="relative w-full aspect-[16/7] overflow-hidden">
              <img
                alt="经验卡封面"
                className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-[1.02]"
                src="https://readdy.ai/api/search-image?query=Warm%20editorial%20composition%20of%20a%20single%20illuminated%20paper%20card%20floating%20in%20soft%20amber%20light%2C%20dark%20burgundy%20and%20copper%20tones%2C%20fine%20golden%20thread%20tracing%20a%20path%20across%20the%20composition%2C%20minimal%20elegant%20photography%20style%2C%20soft%20shadows%2C%20warm%20glow%20suggesting%20treasured%20experience%2C%20textured%20paper%20surface%2C%20subtle%20archival%20feeling&width=1200&height=525&seq=featured-card-cover-v2&orientation=landscape"
              />
              <div className="absolute top-3 left-3 flex gap-1.5">
                <span className="tag-gold text-[10px] px-2 py-0.5 rounded-full">v2 · 已更新</span>
                <span className="tag-red text-[10px] px-2 py-0.5 rounded-full">已验证</span>
              </div>
            </div>

            <div className="p-5 md:p-6">
              <h3 className="font-heading font-bold text-theme-text text-lg md:text-xl mb-2 leading-snug">
                第一次社团招新：从无人报名到 42 人到场
              </h3>
              <p className="text-xs text-theme-text-secondary mb-4">
                一位大三社群组织者
              </p>

              <div className="bg-theme-bg-card-alt rounded-lg px-4 py-3 mb-4">
                <span className="text-[10px] text-theme-accent/60 uppercase tracking-wider block mb-1">做成了什么</span>
                <p className="text-sm text-theme-text leading-relaxed">
                  在没有预算、没有社群基础的情况下，用三天时间把报名人数从 0 拉到 42，并且让参与者自发帮忙传播。
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="tag-red text-[10px] px-2 py-0.5 rounded-full">学生组织和社团</span>
                <span className="tag-red text-[10px] px-2 py-0.5 rounded-full">从零开始做活动</span>
                <span className="tag-boundary text-[10px] px-2 py-0.5 rounded-full">不适用：已有成熟渠道</span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-theme-text-muted mb-5">
                <span className="w-1 h-1 rounded-full bg-theme-gold/50" />
                作者确认 · 真实项目复盘
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => onTrialOpen('第一次社团招新：从无人报名到 42 人到场', 'persona-01')}
                  className="flex-1 py-2.5 btn-red text-sm cursor-pointer whitespace-nowrap font-heading font-semibold rounded-full"
                >
                  看看这对我是否适用
                </button>
                <button
                  onClick={() => navigate('/card/persona-01')}
                  className="flex-1 py-2.5 btn-outline text-sm cursor-pointer whitespace-nowrap rounded-full"
                >
                  查看完整经验卡
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}