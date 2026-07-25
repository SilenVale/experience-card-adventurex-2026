import { useNavigate } from 'react-router-dom';

export default function Community() {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 md:py-28 px-4 md:px-12 lg:px-16 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#E63B30]" />
      <div className="max-w-site mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div>
            <span className="chapter-label block mb-4">社区共创</span>
            <h2 className="font-heading font-black text-[#EAE2DD] leading-[0.94] mb-6 text-3xl md:text-4xl lg:text-5xl">
              经验不是发出去就结束
              <span className="block text-[#E63B30]">
                它在另一个人的行动里
              </span>
              才开始变得完整
            </h2>
            <p className="text-sm text-[#A89A95] leading-relaxed mb-8 max-w-md">
              每一张经验卡都可以收到真实试用反馈，然后被原作者更新为 v2。你不是在写一篇攻略，而是在培育一棵会呼吸的经验树。
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/create')}
                className="px-7 py-3 btn-red text-sm cursor-pointer whitespace-nowrap font-heading font-semibold rounded-full"
              >
                分享我的经历
              </button>
              <button
                onClick={() => navigate('/community')}
                className="px-7 py-3 btn-outline-ivory text-sm cursor-pointer whitespace-nowrap rounded-full"
              >
                进入社区共创
              </button>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative w-64 h-72 md:w-72 md:h-80">
              {/* Stacked cards background */}
              <div className="absolute inset-0 card-ink translate-x-2 translate-y-2" />
              <div className="absolute inset-0 card-ink translate-x-1 translate-y-1" />
              <div className="absolute inset-0 card-ink" />
              {/* Main card */}
              <div className="absolute inset-0 z-10 card-gold p-5 flex flex-col">
                <div className="h-24 bg-[#0C0908] mb-4 overflow-hidden rounded">
                  <img
                    alt="经验卡"
                    className="w-full h-full object-cover"
                    src="https://readdy.ai/api/search-image?query=Warm%20atmospheric%20editorial%20composition%20representing%20community%20and%20shared%20experience%2C%20dark%20warm%20tones%20with%20red%20accent%2C%20minimal%20abstract%20design&width=400&height=200&seq=community-card-v5&orientation=landscape"
                  />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="tag-gold text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                    v2 更新
                  </span>
                  <span className="tag-ivory text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                    已试用
                  </span>
                </div>
                <p className="text-xs font-heading font-semibold text-[#EAE2DD]/85 line-clamp-2">
                  活动冷启动：没有资源时如何找到第一批参与者
                </p>
                <div className="mt-auto pt-3 border-t border-[rgba(184,149,91,0.10)]">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#B8955B]/50" />
                    <span className="text-[10px] text-[#A89A95]/60">
                      v1 → 反馈 → v2
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
