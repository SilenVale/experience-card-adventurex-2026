import { personaList } from '@/mocks/homeData';

interface PersonaProps {
  selectedPersona: string | null;
  onSelect: (id: string) => void;
}

export default function Persona({ selectedPersona, onSelect }: PersonaProps) {
  return (
    <div className="relative w-full bg-[#0C0908]">
      <div className="w-full h-px bg-[#E63B30]/20" />
      <div className="max-w-site mx-auto px-4 md:px-12 lg:px-16 py-12 md:py-16">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-3xl font-heading font-semibold text-[#EAE2DD]">
            你现在更像哪一种<span className="text-[#E63B30]">行动者</span>？
          </h2>
          <p className="text-xs md:text-sm text-[#A89A95] mt-3">
            选择一个你正在经历的状态，看看一段真实经验能不能成为你的下一步。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[rgba(230,59,48,0.08)]">
          {personaList.map((persona) => (
            <button
              key={persona.id}
              onClick={() => onSelect(persona.id)}
              className={`persona-btn group relative px-6 py-5 md:px-8 md:py-6 transition-all duration-200 cursor-pointer text-left ${
                selectedPersona === persona.id
                  ? 'bg-[#1A0505] border border-[#E63B30]/30'
                  : 'bg-[#0C0908] hover:bg-[#110D0C]'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className={`flex-shrink-0 font-label text-xs transition-colors mt-0.5 ${
                  selectedPersona === persona.id
                    ? 'text-[#E63B30]/80'
                    : 'text-[#E63B30]/40 group-hover:text-[#E63B30]/70'
                }`}>
                  {persona.id}
                </span>
                <div className="flex-1 min-w-0">
                  <span className={`font-heading font-semibold transition-colors text-sm md:text-base leading-tight ${
                    selectedPersona === persona.id
                      ? 'text-[#EAE2DD]'
                      : 'text-[#EAE2DD]/75 group-hover:text-[#EAE2DD]'
                  }`}>
                    {persona.label}
                  </span>
                  <div className={`mt-2 h-px transition-all duration-300 bg-[#E63B30]/40 ${
                    selectedPersona === persona.id ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </div>
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <i className={`ri-arrow-right-up-line transition-all duration-200 text-sm ${
                    selectedPersona === persona.id
                      ? 'text-[#E63B30]/60'
                      : 'text-[#E63B30]/0 group-hover:text-[#E63B30]/60'
                  }`} />
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-6 text-xs text-[#A89A95]/50">
          点击任意一个状态，看看一段真实经验能不能成为你的下一步
        </p>
      </div>
    </div>
  );
}