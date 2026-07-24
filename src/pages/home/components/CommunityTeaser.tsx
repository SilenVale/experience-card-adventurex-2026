import { useNavigate } from 'react-router-dom';

export default function CommunityTeaser() {
  const navigate = useNavigate();

  return (
    <section className="relative py-14 md:py-20 px-4 md:px-12 lg:px-16 bg-theme-bg-secondary transition-colors duration-300">
      <div className="max-w-site mx-auto">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="chapter-label">社区共创</span>
            <div className="flex-1 h-px bg-theme-border" />
          </div>
          <h2 className="font-heading font-black text-theme-text leading-[0.94] mb-2 text-2xl md:text-3xl lg:text-4xl">
            一张卡，也可以继续<span className="text-theme-accent">长大</span>。
          </h2>
          <p className="text-sm text-theme-text-secondary mb-8 leading-relaxed max-w-md">
            试用、反馈和补充，让经验从 v1 变成更可信的 v2。
            不是写一篇攻略，而是培育一个会呼吸的经验记录。
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
            <div className="flex-1 bg-theme-bg-card-alt rounded-xl px-4 py-3">
              <span className="text-[10px] tag-red px-1.5 py-0.5 rounded-full inline-block mb-1.5">v1</span>
              <p className="text-xs text-theme-text leading-relaxed">
                只写了宣传方法
              </p>
            </div>
            <div className="flex sm:flex-col items-center gap-1.5 justify-center py-1 sm:py-0">
              <div className="w-0.5 h-4 sm:w-8 sm:h-0.5 bg-theme-gold/20" />
              <span className="text-[10px] text-theme-gold-dark/60 whitespace-nowrap">试用反馈</span>
              <div className="w-0.5 h-4 sm:w-8 sm:h-0.5 bg-theme-gold/20" />
            </div>
            <div className="flex-1 bg-theme-bg-card-alt rounded-xl px-4 py-3 border border-theme-gold-light">
              <span className="text-[10px] tag-gold px-1.5 py-0.5 rounded-full inline-block mb-1.5">v2</span>
              <p className="text-xs text-theme-text leading-relaxed">
                补充「先找 5 位愿意转发的人」的具体动作
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/community')}
            className="px-6 py-2.5 btn-outline text-sm cursor-pointer whitespace-nowrap font-heading font-semibold rounded-full inline-flex items-center gap-2"
          >
            进入社区共创
            <i className="ri-arrow-right-line text-sm" />
          </button>
        </div>
      </div>
    </section>
  );
}