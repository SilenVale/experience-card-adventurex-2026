import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface FeaturedCardProps {
  onTrialOpen: (title: string, id: string) => void;
}

export default function FeaturedCard({ onTrialOpen }: FeaturedCardProps) {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'top 30%',
          once: true,
        }
      });

      // Label bar slides in from left
      tl.fromTo(
        labelRef.current,
        { x: -80, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }
      );

      // Description fades up
      tl.fromTo(
        descRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
        '-=0.6'
      );

      // Image reveal: clip-path from bottom
      tl.fromTo(
        imageRef.current,
        { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.1 },
        { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.4, ease: 'expo.out' },
        '-=0.4'
      );

      // Card body elements stagger
      const cardItems = contentRef.current?.children;
      if (cardItems) {
        tl.fromTo(
          cardItems,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
          '-=0.8'
        );
      }

      // Divider: fades in + stretches from center at the end
      tl.fromTo(
        dividerRef.current,
        { scaleX: 0, opacity: 0, transformOrigin: 'center' },
        { scaleX: 1, opacity: 1, duration: 0.8, ease: 'power3.out' },
        '-=0.3'
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-14 md:py-20 px-4 md:px-12 lg:px-16 transition-colors duration-300">
      <div className="max-w-site mx-auto">
        <div className="mb-8 md:mb-10">
          <div ref={labelRef} className="flex items-center gap-3 mb-3 opacity-0">
            <span className="chapter-label">一张真实的经验卡</span>
            <div className="flex-1 h-px bg-theme-border" />
          </div>
          <p ref={descRef} className="text-sm text-theme-text-secondary max-w-md opacity-0">
            不是照搬别人的答案，而是判断这段经验是否适合你的处境。
          </p>
        </div>

        <div ref={cardRef} className="max-w-2xl mx-auto">
          <div className="card-featured">
            <div
              ref={imageRef}
              className="relative w-full aspect-[16/7] overflow-hidden bg-no-repeat"
              style={{
                clipPath: 'inset(100% 0% 0% 0%)',
                backgroundImage: 'url(/experience-cover-sprite-v1.webp)',
                backgroundSize: '300% 300%',
                backgroundPosition: '50% 50%',
              }}
              role="img"
              aria-label="第一次社团招新的编辑拼贴封面"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FBF7EC]/95 via-[#FBF7EC]/72 to-transparent" />
              <div className="absolute inset-0 p-5 md:p-7 flex flex-col">
                <span className="text-[10px] font-heading font-semibold tracking-[0.14em] text-[#E63B30] uppercase">
                  EC / 社群活动
                </span>
                <h4 className="mt-5 max-w-[58%] font-heading font-black text-[#1A1514] text-3xl md:text-5xl leading-[0.9] tracking-[-0.05em]">
                  从 0 报名
                  <br />
                  到 42 人到场
                </h4>
                <div className="mt-auto flex items-center gap-2 text-[10px] font-heading font-semibold text-[#1A1514]/60">
                  <span className="px-2.5 py-1.5 bg-[#F2D447] border border-black/10 rotate-[-1deg]">真实经历</span>
                  <span>COMMUNITY / 01</span>
                </div>
              </div>
              <div className="absolute top-3 right-3 flex gap-1.5">
                <span className="tag-gold text-[10px] px-2 py-0.5 rounded-full">v2 · 已更新</span>
                <span className="tag-red text-[10px] px-2 py-0.5 rounded-full">已验证</span>
              </div>
            </div>

            <div ref={contentRef} className="p-5 md:p-6">
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

      {/* Subtle section divider — fades in with scroll trigger */}
      <div
        ref={dividerRef}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[40%] h-px bg-gradient-to-r from-transparent via-theme-border/25 to-transparent pointer-events-none"
      />
    </section>
  );
}
