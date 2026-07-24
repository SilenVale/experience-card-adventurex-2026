import { useNavigate } from 'react-router-dom';
import { flowSteps } from '@/mocks/homeData';

export default function Flow() {
  const navigate = useNavigate();

  return (
    <section className="relative py-16 md:py-20 px-4 md:px-12 lg:px-16">
      <div className="max-w-site mx-auto">
        <div className="flex items-center gap-4 mb-8 md:mb-10">
          <span className="chapter-label">经验如何流动</span>
          <div className="flex-1 h-px bg-[rgba(230,59,48,0.12)]" />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-0 md:gap-0 relative mb-10 md:mb-12">
          {/* Desktop horizontal connecting line */}
          <div className="hidden md:block absolute top-6 left-6 right-6 h-px bg-[rgba(184,149,91,0.12)]" />

          {flowSteps.map((step, index) => (
            <div
              key={step.id}
              className="flow-item flex md:flex-col items-start md:items-start gap-4 md:gap-3 relative z-10 flex-1 pb-6 md:pb-0"
            >
              <div className="flex md:flex-row items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <i className={`${step.icon} text-[#E63B30]/75 text-lg`} />
                  </div>
                </div>
                {index < flowSteps.length - 1 && (
                  <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-[rgba(184,149,91,0.12)] to-transparent" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="mono-label text-[#A89A95]/50">{step.id}</span>
                </div>
                <span className="text-sm font-heading font-semibold text-[#EAE2DD]/80">
                  {step.label}
                </span>
              </div>
              {/* Mobile vertical connector */}
              {index < flowSteps.length - 1 && (
                <div className="md:hidden absolute bottom-0 left-6 w-px h-6 bg-[rgba(184,149,91,0.12)]" />
              )}
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="text-center">
          <p className="text-sm text-[#A89A95] mb-6 max-w-md mx-auto leading-relaxed">
            AI 不替你定义你是谁。它只帮你把做成过的事，说清楚。
          </p>
          <button
            onClick={() => navigate('/create')}
            className="px-7 py-3 btn-red text-sm cursor-pointer whitespace-nowrap font-heading font-semibold rounded-full inline-flex items-center gap-2"
          >
            创建我的第一张经验名片
            <i className="ri-arrow-right-line text-sm" />
          </button>
        </div>
      </div>
    </section>
  );
}