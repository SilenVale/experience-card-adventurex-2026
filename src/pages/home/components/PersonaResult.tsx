import { personaResults } from '@/mocks/personaResults';

interface PersonaResultProps {
  personaId: string;
  onReset: () => void;
  onTrialOpen: (cardTitle: string, cardId: string) => void;
  onViewDetail: (cardId: string) => void;
}

export default function PersonaResult({ personaId, onReset, onTrialOpen, onViewDetail }: PersonaResultProps) {
  const result = personaResults[personaId];
  if (!result) return null;

  return (
    <div className="relative w-full bg-[#0C0908]">
      <div className="w-full h-px bg-[#E63B30]/15" />
      <div className="max-w-site mx-auto px-4 md:px-12 lg:px-16 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[10px] text-[#B8955B]/60 uppercase tracking-wider">
            与你类似的人曾做成过什么
          </span>
          <div className="flex-1 h-px bg-[rgba(184,149,91,0.08)]" />
          <span className="text-[10px] tag-ivory px-1.5 py-0.5 rounded-full whitespace-nowrap">示例体验</span>
        </div>

        <div className="bg-[#110D0C] border border-[rgba(184,149,91,0.12)] rounded-xl p-6 md:p-8 max-w-3xl mx-auto">
          {/* Status Tag */}
          <div className="flex items-center gap-2 mb-4">
            <span className="tag-gold text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
              {result.status}
            </span>
          </div>

          {/* Title */}
          <h2 className="font-heading font-black text-[#EAE2DD] text-xl md:text-2xl leading-tight mb-3">
            {result.title}
          </h2>

          {/* Author */}
          <p className="text-sm text-[#A89A95] mb-5">{result.author}</p>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <span className="text-[10px] text-[#E63B30]/60 uppercase tracking-wider block mb-1">做成了什么</span>
              <p className="text-sm text-[#EAE2DD]/85 leading-relaxed">{result.achievement}</p>
            </div>
            <div>
              <span className="text-[10px] text-[#B8955B]/60 uppercase tracking-wider block mb-1">适用条件</span>
              <p className="text-xs text-[#A89A95] leading-relaxed">{result.suitableFor}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 pb-5 border-b border-[rgba(230,59,48,0.06)]">
            <div>
              <span className="text-[10px] text-[#E63B30]/60 uppercase tracking-wider block mb-1">不适用边界</span>
              <p className="text-xs text-[#A89A95] leading-relaxed">{result.boundary}</p>
            </div>
            <div>
              <span className="text-[10px] text-[#B8955B]/60 uppercase tracking-wider block mb-1">10 分钟微行动</span>
              <p className="text-xs text-[#EAE2DD]/80 leading-relaxed">{result.microAction}</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onTrialOpen(result.title, result.cardId)}
              className="flex-1 py-2.5 bg-[#E63B30] text-white rounded-full text-sm font-heading font-semibold cursor-pointer whitespace-nowrap hover:bg-[#c92f25] transition-colors"
            >
              带着我的情境试试
            </button>
            <button
              onClick={() => onViewDetail(result.cardId)}
              className="flex-1 py-2.5 border border-[rgba(234,226,221,0.12)] text-[#A89A95] hover:text-[#EAE2DD] rounded-full text-sm cursor-pointer whitespace-nowrap transition-colors hover:bg-[rgba(234,226,221,0.03)]"
            >
              查看完整经验卡
            </button>
            <button
              onClick={onReset}
              className="py-2.5 px-4 border border-[rgba(230,59,48,0.06)] text-[#A89A95]/60 hover:text-[#A89A95] rounded-full text-sm cursor-pointer whitespace-nowrap transition-colors"
            >
              重新选择身份
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
