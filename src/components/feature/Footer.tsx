import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-warm-900 text-white/80 transition-colors duration-300">
      <div className="max-w-site mx-auto px-4 md:px-12 lg:px-16 py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-xs font-heading font-semibold text-white/60 uppercase tracking-wider mb-4">
              探索
            </h4>
            <div className="space-y-2">
              <button onClick={() => navigate('/')} className="block text-sm text-white/50 hover:text-white/80 transition-colors cursor-pointer">
                经验广场
              </button>
              <button onClick={() => navigate('/community')} className="block text-sm text-white/50 hover:text-white/80 transition-colors cursor-pointer">
                社区共创
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-heading font-semibold text-white/60 uppercase tracking-wider mb-4">
              共创
            </h4>
            <div className="space-y-2">
              <button onClick={() => navigate('/create')} className="block text-sm text-white/50 hover:text-white/80 transition-colors cursor-pointer">
                创建经验卡
              </button>
              <button onClick={() => navigate('/my-cards')} className="block text-sm text-white/50 hover:text-white/80 transition-colors cursor-pointer">
                我的名片
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-heading font-semibold text-white/60 uppercase tracking-wider mb-4">
              关于
            </h4>
            <div className="space-y-2">
              <span className="block text-sm text-white/40">Experience Card v1</span>
              <span className="block text-sm text-white/40">让经验成为彼此的下一步</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-heading font-semibold text-white/60 uppercase tracking-wider mb-4">
              产品气质
            </h4>
            <div className="space-y-2">
              <span className="block text-sm text-white/40">非社交，非人才市场</span>
              <span className="block text-sm text-white/40">非 AI 算命，不贩卖确定性</span>
              <span className="block text-sm text-white/40">只帮助经验流动</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white/20 rounded-sm flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white rounded-sm" />
            </div>
            <span className="text-xs text-white/40">Experience Card</span>
          </div>
          <p className="text-[10px] text-white/30">
            &copy; 2026 Experience Card. 保留所有权利。
          </p>
        </div>
      </div>
    </footer>
  );
}