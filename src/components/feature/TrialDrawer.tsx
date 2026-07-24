import { useState } from 'react';
import {
  generateDemoTrialResult,
  saveTrialFeedback,
  type TrialResult,
} from '@/lib/experienceCards';

interface TrialDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cardTitle: string;
  cardId: string;
}

type TrialPhase = 'input' | 'analyzing' | 'result';
const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export default function TrialDrawer({ isOpen, onClose, cardTitle, cardId }: TrialDrawerProps) {
  const [phase, setPhase] = useState<TrialPhase>('input');
  const [context, setContext] = useState('');
  const [constraints, setConstraints] = useState('');
  const [result, setResult] = useState<TrialResult | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // ============================================================
  // 🔮 FUTURE DIFY INTEGRATION POINT B:
  // 已发布经验卡 + 试用者情境/限制 → 试用结果 JSON
  // 当前为规则版演示，未来替换为:
  // supabase.functions.invoke('dify-trial-match', { body: { cardId, context, constraints } })
  // Dify Workflow 返回结构化 JSON: { match, reasons[], microAction, notSuitable[] }
  // ============================================================
  const handleSubmit = () => {
    if (!context.trim()) return;
    setPhase('analyzing');
    setTimeout(() => {
      setResult(generateDemoTrialResult(constraints));
      setPhase('result');
    }, 1500);
  };

  const handleReset = () => {
    setPhase('input');
    setContext('');
    setConstraints('');
    setResult(null);
    setSaveState('idle');
  };

  const handleSaveFeedback = async () => {
    if (!result || !isUuid(cardId)) return;

    setSaveState('saving');
    try {
      await saveTrialFeedback({
        cardId,
        situation: context,
        constraints,
        trialResult: result.trialResult,
        reason: result.reason,
        microAction: result.microAction,
        boundaryNote: result.boundaryNote,
      });
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-50 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-theme-bg border-l border-theme-accent-light z-50 overflow-y-auto shadow-lg transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-theme-accent-subtle">
          <h3 className="font-heading font-semibold text-theme-text text-sm">
            这段经验适合现在的你吗？
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center cursor-pointer text-theme-text-secondary hover:text-theme-text transition-colors"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <div className="mb-5 pb-4 border-b border-theme-accent-subtle">
            <span className="text-[10px] text-theme-text-muted">试用经验卡</span>
            <p className="text-sm text-theme-text mt-1 font-heading font-medium">
              {cardTitle}
            </p>
          </div>

          {phase === 'input' && (
            <div>
              <span className="block text-[10px] text-theme-accent/65 uppercase tracking-wider mb-3">
                请描述你的情境
              </span>

              <div className="mb-4">
                <label className="block text-xs text-theme-text-secondary mb-1.5">
                  我现在正在面对什么？
                </label>
                <textarea
                  className="w-full bg-theme-bg-card-alt border border-theme-accent-light rounded-lg px-3.5 py-2.5 text-sm text-theme-text placeholder:text-theme-text-muted focus:outline-none focus:border-theme-accent transition-colors resize-none h-24"
                  placeholder="比如：我在准备第一次社团招新，目前报名人数为 0，只有 4 天时间..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
              </div>

              <div className="mb-5">
                <label className="block text-xs text-theme-text-secondary mb-1.5">
                  我的限制是什么？
                </label>
                <textarea
                  className="w-full bg-theme-bg-card-alt border border-theme-accent-light rounded-lg px-3.5 py-2.5 text-sm text-theme-text placeholder:text-theme-text-muted focus:outline-none focus:border-theme-accent transition-colors resize-none h-20"
                  placeholder="时间、资源、经验、情绪状态..."
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!context.trim()}
                className={`w-full py-2.5 rounded-full text-sm font-heading font-semibold cursor-pointer whitespace-nowrap transition-all duration-200 ${
                  context.trim()
                    ? 'bg-theme-accent text-white hover:bg-theme-accent-hover'
                    : 'bg-theme-accent-subtle text-theme-text-muted cursor-not-allowed'
                }`}
              >
                分析我的情境
              </button>
            </div>
          )}

          {phase === 'analyzing' && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 flex items-center justify-center mb-4">
                <i className="ri-loader-4-line text-2xl text-theme-accent/70 animate-spin" />
              </div>
              <p className="text-sm text-theme-text-secondary">正在分析你的情境...</p>
            </div>
          )}

          {phase === 'result' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] text-theme-accent/65 uppercase tracking-wider">
                  规则版演示分析
                </span>
              </div>

              <div className="bg-theme-bg-card border border-theme-gold-subtle rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-theme-text-secondary">匹配度</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-heading font-semibold whitespace-nowrap bg-theme-accent-subtle text-theme-accent border border-theme-accent-light">
                    {result?.trialResult}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-xs font-heading font-semibold text-theme-text mb-2">为什么？</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-xs text-theme-text-secondary leading-relaxed">
                    <span className="w-1 h-1 rounded-full bg-theme-accent/50 flex-shrink-0 mt-1.5" />
                    {result?.reason}
                  </li>
                </ul>
              </div>

              <div className="bg-theme-bg-card border border-theme-accent-subtle rounded-lg p-4 mb-4">
                <h4 className="text-xs font-heading font-semibold text-theme-text mb-2">
                  你今天可以尝试的微行动
                </h4>
                <p className="text-xs text-theme-text-secondary leading-relaxed">
                  {result?.microAction}
                </p>
              </div>

              <div className="mb-5">
                <h4 className="text-xs font-heading font-semibold text-theme-accent/80 mb-2">
                  这段经验不适合你的地方
                </h4>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2 text-xs text-theme-text-secondary leading-relaxed">
                    <span className="w-1 h-1 rounded-full bg-theme-accent/40 flex-shrink-0 mt-1.5" />
                    {result?.boundaryNote}
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                {isUuid(cardId) ? (
                  <button
                    onClick={handleSaveFeedback}
                    disabled={saveState === 'saving' || saveState === 'saved'}
                    className="w-full py-2.5 bg-theme-accent text-white rounded-full text-sm font-heading font-semibold cursor-pointer whitespace-nowrap hover:bg-theme-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saveState === 'saving' ? '保存反馈中...' : saveState === 'saved' ? '已保存这次试用' : '我愿意试试并保存反馈'}
                  </button>
                ) : (
                  <p className="text-xs text-theme-text-muted text-center">这是示例卡，试用结果不会写入数据库。</p>
                )}
                {saveState === 'error' && (
                  <p className="text-xs text-theme-accent text-center">反馈未保存，请稍后重试。</p>
                )}
                <button
                  onClick={handleReset}
                  className="w-full py-2.5 border border-theme-border text-theme-text-secondary hover:text-theme-text rounded-full text-sm cursor-pointer whitespace-nowrap transition-colors"
                >
                  返回经验卡
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
