export default function Hero() {
  return (
    <section className="relative w-full min-h-[60vh] md:min-h-[70vh] flex items-center bg-theme-bg overflow-hidden transition-colors duration-300">
      {/* Subtle radial glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-theme-accent-light rounded-full blur-[120px] opacity-40 pointer-events-none" />

      <div className="relative z-10 w-full px-4 md:px-12 lg:px-16 max-w-site mx-auto pt-24 md:pt-28 pb-12 md:pb-16">
        <div className="max-w-3xl">
          <h1 className="font-heading font-black text-theme-text leading-[0.92] tracking-tighter2 mb-5 md:mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="reveal-title block">让经验成为彼此的</span>
            <span className="text-theme-accent reveal-title block" style={{ animationDelay: '0.5s' }}>
              下一步
            </span>
          </h1>

          <p
            className="text-theme-text-secondary max-w-lg text-sm md:text-base leading-relaxed mb-8 fade-up visible"
            style={{ transitionDelay: '0.8s' }}
          >
            一件你真实做成过的事，被整理成另一个人可以判断的经验。
            <br />
            不是简历，不是教程，不是照搬答案。
          </p>

          {/* Scroll hint */}
          <div
            className="flex items-center gap-2 text-theme-text-muted fade-up visible"
            style={{ transitionDelay: '1.2s' }}
          >
            <div className="w-4 h-6 rounded-full border border-theme-text-muted/30 flex items-start justify-center p-0.5">
              <div className="w-1 h-1.5 rounded-full bg-theme-accent/40 animate-bounce" />
            </div>
            <span className="text-xs">向下探索</span>
          </div>
        </div>
      </div>
    </section>
  );
}