import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getExperienceCard, saveExperienceCard, updateExperienceCard, type CardStatus } from '@/lib/experienceCards';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import LoginModal from '@/components/feature/LoginModal';
import SharePanel from '@/components/feature/SharePanel';

type CreateStep = 1 | 2 | 3 | 'success';

const questions = [
  { id: 1, question: '你当时真正想解决什么问题？', hint: '不是表面问题，而是那个让你觉得"不对劲"的根本原因' },
  { id: 2, question: '你做过哪些关键动作？', hint: '不需要详细描述每一步，只需要列出那 3-5 个真正起到作用的关键动作' },
  { id: 3, question: '哪一步没有成功，后来如何调整？', hint: '诚实地写下来，失败的部分往往是最有价值的经验' },
  { id: 4, question: '最后发生了什么？', hint: '不管是好是坏，如实描述结果。不需要夸大或美化' },
  { id: 5, question: '在什么情况下，这段经验不适合别人照搬？', hint: '比如：预算不同、团队规模不同、时间限制不同、行业不同等' },
];

export default function CreateCardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const draftId = new URLSearchParams(location.search).get('draft');
  const [step, setStep] = useState<CreateStep>(1);
  const [rawExperience, setRawExperience] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [draft, setDraft] = useState({
    title: '',
    oneLiner: '',
    problem: '',
    actions: '',
    result: '',
    suitableFor: '',
    boundary: '',
  });
  const [sourceMap, setSourceMap] = useState<Record<string, string[]>>({});
  const [sharingConsent, setSharingConsent] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginReason, setLoginReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedCardId, setSavedCardId] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState<CardStatus | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(Boolean(draftId));

  useEffect(() => {
    if (!draftId) {
      setLoadingDraft(false);
      return;
    }

    if (!user) {
      setLoadingDraft(false);
      setSaveError('登录后才能继续编辑草稿。');
      return;
    }

    let active = true;

    const loadDraft = async () => {
      setLoadingDraft(true);
      setSaveError(null);

      try {
        const card = await getExperienceCard(draftId);
        if (!card || card.user_id !== user.id || card.status !== 'draft') {
          throw new Error('这张草稿不存在，或你没有编辑权限。');
        }

        if (!active) return;
        setEditingCardId(card.id);
        setRawExperience(card.background);
        setAnswers({
          1: card.problem,
          2: card.actions_done,
          3: card.pitfall,
          4: card.result,
          5: card.boundary,
        });
        setDraft({
          title: card.title,
          oneLiner: card.one_liner,
          problem: card.problem,
          actions: card.actions_done,
          result: card.result,
          suitableFor: card.suitable_for,
          boundary: card.boundary,
        });
        setSourceMap(card.source_map ?? {});
        setSharingConsent(Boolean(card.sharing_consent));
        setStep(3);
      } catch (error) {
        if (active) {
          setSaveError(error instanceof Error ? error.message : '读取草稿失败，请稍后重试。');
        }
      } finally {
        if (active) setLoadingDraft(false);
      }
    };

    loadDraft();
    return () => {
      active = false;
    };
  }, [draftId, user]);

  const handleStep1Next = () => {
    if (!rawExperience.trim()) return;
    setStep(2);
    setCurrentQuestion(0);
  };

  const handleAnswerChange = (qId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleQuestionNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      handleGenerateDraft();
    }
  };

  const handleGenerateDraft = async () => {
    if (!sharingConsent) {
      setSaveError('请先确认：你有权分享这段经历，并同意由 AI 仅基于你提供的内容生成候选卡。');
      return;
    }

    setGenerating(true);
    setSaveError(null);
    const { data, error } = await supabase.functions.invoke('dify-generate-card', {
      body: { raw_experience: rawExperience, answers, sharing_consent: true },
    });
    setGenerating(false);

    if (error || !data?.card) {
      setSaveError('AI 暂时无法生成候选卡。请稍后重试；不会用规则模板伪装成 AI 结果。');
      return;
    }

    const card = data.card as Record<string, unknown>;
    setDraft({
      title: String(card.title),
      oneLiner: String(card.one_liner),
      problem: String(card.problem),
      actions: String(card.actions),
      result: String(card.result),
      suitableFor: String(card.suitable_for),
      boundary: String(card.boundary),
    });
    setSourceMap((card.source_map as Record<string, string[]>) ?? {});
    setStep(3);
  };

  const handleSave = async (status: CardStatus) => {
    if (!user) {
      setLoginReason(status === 'published' ? '发布经验卡需要登录' : '保存草稿需要登录');
      setLoginOpen(true);
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const input = {
        userId: user.id,
        title: draft.title.trim(),
        oneLiner: draft.result.trim() || draft.oneLiner.trim() || draft.problem.trim(),
        problem: draft.problem.trim(),
        background: rawExperience.trim(),
        actionsDone: draft.actions.trim(),
        pitfall: answers[3]?.trim() || '',
        result: draft.result.trim(),
        suitableFor: draft.suitableFor.trim(),
        boundary: draft.boundary.trim(),
        sourceMap,
        sharingConsent,
        status,
      };
      const data = editingCardId
        ? await updateExperienceCard(editingCardId, input)
        : await saveExperienceCard(input);
      setSavedCardId(data.id);
      setSavedStatus(data.status);
      setStep('success');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const themeBg = 'bg-theme-bg';
  const themeCard = 'bg-theme-bg-card';
  const themeInput = 'bg-theme-bg-card-alt';
  const themeBorder = 'border-theme-border-accent';
  const themeText = 'text-theme-text';
  const themeTextSec = 'text-theme-text-secondary';
  const themeTextMuted = 'text-theme-text-muted';
  const themeAccent = 'bg-theme-accent';

  return (
    <div className={`min-h-screen ${themeBg} transition-colors duration-300`}>
      <Navbar />

      <main className="pt-16 pb-20">
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {/* Progress Bar */}
          {typeof step === 'number' && (
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-heading font-semibold transition-all ${
                      step > s
                        ? `${themeAccent} text-white`
                        : step === s
                          ? `${themeAccent} text-white`
                          : `${themeCard} border ${themeBorder} ${themeTextSec}`
                    }`}
                  >
                    {step > s ? <i className="ri-check-line" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`flex-1 h-px ${step > s ? 'bg-theme-accent/40' : 'bg-theme-border'}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {loadingDraft && (
            <div className="flex flex-col items-center py-20 gap-3">
              <i className="ri-loader-4-line text-2xl text-theme-accent/60 animate-spin" />
              <p className={`text-sm ${themeTextSec}`}>正在打开你的草稿…</p>
            </div>
          )}

          {/* Step 1: Raw Experience */}
          {!loadingDraft && step === 1 && (
            <div>
              <h1 className={`font-heading font-black ${themeText} text-2xl md:text-3xl leading-tight mb-3`}>
                把你做成过的一件事，留给未来可能需要它的人。
              </h1>
              <p className={`text-sm ${themeTextSec} mb-8`}>
                不需要完美，也不用展示全部。你决定分享什么，AI 只帮你说清楚。
              </p>

              <div className="mb-6">
                <label className="block text-xs font-heading font-semibold text-theme-accent/70 uppercase tracking-wider mb-3">
                  写下你的原始经历
                </label>
                <textarea
                  className={`w-full ${themeInput} border ${themeBorder} rounded-xl px-4 py-4 text-sm ${themeText} placeholder:${themeTextMuted} focus:outline-none focus:border-theme-accent transition-colors resize-none h-48`}
                  placeholder="可以很乱。写下当时发生了什么、你做了什么、结果怎样就够了。..."
                  value={rawExperience}
                  onChange={(e) => setRawExperience(e.target.value)}
                />
                <p className={`text-[10px] ${themeTextMuted} mt-2`}>
                  示例："我第一次负责社团招新，前两天几乎没人报名。后来我改了招募内容和活动形式，最后来了 42 个人……"
                </p>
              </div>

              <label className={`mb-5 flex cursor-pointer items-start gap-3 rounded-xl border ${themeBorder} ${themeCard} px-4 py-3 text-xs ${themeTextSec}`}>
                <input
                  type="checkbox"
                  checked={sharingConsent}
                  onChange={(event) => setSharingConsent(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-red-500"
                />
                <span>我确认我有权分享这段经历；我理解 AI 只能基于我的原话整理候选卡，我会在发布前逐项确认。</span>
              </label>

              <button
                onClick={handleStep1Next}
                disabled={!rawExperience.trim() || !sharingConsent}
                className={`w-full py-3 rounded-full text-sm font-heading font-semibold cursor-pointer whitespace-nowrap transition-all duration-200 ${
                  rawExperience.trim()
                    ? `${themeAccent} text-white hover:bg-theme-accent-hover`
                    : 'bg-theme-accent-subtle text-theme-text-muted cursor-not-allowed'
                }`}
              >
                继续整理
              </button>
            </div>
          )}

          {/* Step 2: Five Questions */}
          {!loadingDraft && step === 2 && (
            <div>
              <h2 className={`font-heading font-bold ${themeText} text-xl mb-1`}>
                完善经历细节
              </h2>
              <p className={`text-sm ${themeTextSec} mb-6`}>
                问题 {currentQuestion + 1} / {questions.length}
              </p>

              <div className="mb-6">
                <div className="flex gap-1 mb-4">
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-0.5 rounded-full transition-colors ${
                        i < currentQuestion
                          ? 'bg-theme-accent/50'
                          : i === currentQuestion
                            ? 'bg-theme-accent'
                            : 'bg-theme-accent-subtle'
                      }`}
                    />
                  ))}
                </div>

                <div className={`${themeCard} border ${themeBorder} rounded-xl p-5 mb-4`}>
                  <span className="text-[10px] text-theme-accent/60 mb-2 block">关键追问</span>
                  <h3 className={`text-sm font-heading font-semibold ${themeText} mb-1`}>
                    {questions[currentQuestion].question}
                  </h3>
                  <p className={`text-xs ${themeTextMuted}`}>
                    {questions[currentQuestion].hint}
                  </p>
                </div>

                <textarea
                  className={`w-full ${themeInput} border ${themeBorder} rounded-xl px-4 py-3.5 text-sm ${themeText} placeholder:${themeTextMuted} focus:outline-none focus:border-theme-accent transition-colors resize-none h-36`}
                  placeholder="写下你的想法..."
                  value={answers[questions[currentQuestion].id] || ''}
                  onChange={(e) => handleAnswerChange(questions[currentQuestion].id, e.target.value)}
                />
              </div>

              <div className={`flex items-center gap-2 mb-4 text-[10px] ${themeTextMuted}`}>
                <i className="ri-robot-line text-xs text-theme-gold/50" />
                完成后，AI 将只基于这些内容生成候选卡
              </div>

              <div className="flex gap-3">
                {currentQuestion > 0 && (
                  <button
                    onClick={() => setCurrentQuestion((prev) => prev - 1)}
                    className={`flex-1 py-2.5 border ${themeBorder} ${themeTextSec} hover:${themeText} rounded-full text-sm cursor-pointer whitespace-nowrap transition-colors`}
                  >
                    上一题
                  </button>
                )}
                <button
                  onClick={handleQuestionNext}
                  disabled={!answers[questions[currentQuestion].id]?.trim()}
                  className={`flex-1 py-2.5 rounded-full text-sm font-heading font-semibold cursor-pointer whitespace-nowrap transition-all duration-200 ${
                    answers[questions[currentQuestion].id]?.trim()
                      ? `${themeAccent} text-white hover:bg-theme-accent-hover`
                      : 'bg-theme-accent-subtle text-theme-text-muted cursor-not-allowed'
                  }`}
                >
                  {currentQuestion === questions.length - 1 ? (generating ? 'AI 正在整理…' : '生成经验名片草稿') : '下一题'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Edit & Confirm */}
          {!loadingDraft && step === 3 && (
            <div>
              <h2 className={`font-heading font-bold ${themeText} text-xl mb-1`}>
                {editingCardId ? '继续编辑你的草稿' : '编辑并确认你的经验名片'}
              </h2>
              <p className={`text-sm ${themeTextSec} mb-6`}>
                {editingCardId
                  ? '已为你恢复上次保存的内容。修改后可继续保存，或直接发布。'
                  : '这是 AI 帮你整理的草稿。你可以修改任何内容，删除不想展示的部分。'}
              </p>

              <div className={`${themeCard} border border-theme-gold-subtle rounded-xl p-5 mb-6 space-y-4`}>
                <div>
                  <label className="block text-[10px] text-theme-accent/60 uppercase mb-1">标题</label>
                  <input
                    className={`w-full ${themeInput} border ${themeBorder} rounded-lg px-3.5 py-2.5 text-sm ${themeText} placeholder:${themeTextMuted} focus:outline-none focus:border-theme-accent transition-colors`}
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-theme-accent/60 uppercase mb-1">当时面对的问题</label>
                  <textarea
                    className={`w-full ${themeInput} border ${themeBorder} rounded-lg px-3.5 py-2.5 text-sm ${themeText} placeholder:${themeTextMuted} focus:outline-none focus:border-theme-accent transition-colors resize-none h-20`}
                    value={draft.problem}
                    onChange={(e) => setDraft({ ...draft, problem: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-theme-accent/60 uppercase mb-1">关键动作</label>
                  <textarea
                    className={`w-full ${themeInput} border ${themeBorder} rounded-lg px-3.5 py-2.5 text-sm ${themeText} placeholder:${themeTextMuted} focus:outline-none focus:border-theme-accent transition-colors resize-none h-20`}
                    value={draft.actions}
                    onChange={(e) => setDraft({ ...draft, actions: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-theme-accent/60 uppercase mb-1">最终结果</label>
                  <textarea
                    className={`w-full ${themeInput} border ${themeBorder} rounded-lg px-3.5 py-2.5 text-sm ${themeText} placeholder:${themeTextMuted} focus:outline-none focus:border-theme-accent transition-colors resize-none h-20`}
                    value={draft.result}
                    onChange={(e) => setDraft({ ...draft, result: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-theme-accent/60 uppercase mb-1">这段经验适合谁</label>
                  <textarea
                    className={`w-full ${themeInput} border ${themeBorder} rounded-lg px-3.5 py-2.5 text-sm ${themeText} placeholder:${themeTextMuted} focus:outline-none focus:border-theme-accent transition-colors resize-none h-20`}
                    placeholder="例如：第一次组织校园活动、资源有限的学生社团负责人"
                    value={draft.suitableFor}
                    onChange={(e) => setDraft({ ...draft, suitableFor: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-theme-accent/60 uppercase mb-1">使用边界</label>
                  <textarea
                    className={`w-full ${themeInput} border ${themeBorder} rounded-lg px-3.5 py-2.5 text-sm ${themeText} placeholder:${themeTextMuted} focus:outline-none focus:border-theme-accent transition-colors resize-none h-20`}
                    value={draft.boundary}
                    onChange={(e) => setDraft({ ...draft, boundary: e.target.value })}
                  />
                </div>
              </div>

              {Object.keys(sourceMap).length > 0 && (
                <p className={`mb-5 text-[11px] leading-relaxed ${themeTextMuted}`}>
                  来源：AI 仅引用了你的原始经历与五个回答进行整理。发布前请逐项确认是否准确。
                </p>
              )}

              {saveError && (
                <div className="bg-theme-accent-subtle border border-theme-accent-light rounded-lg px-4 py-3 mb-4 text-xs text-theme-accent">
                  保存失败：{saveError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                  className={`flex-1 py-3 border ${themeBorder} ${themeText} rounded-full text-sm font-heading font-semibold cursor-pointer whitespace-nowrap hover:bg-theme-accent-subtle transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {saving ? '保存中...' : editingCardId ? '更新草稿' : '保存草稿'}
                </button>
                <button
                  onClick={() => handleSave('published')}
                  disabled={saving}
                  className={`flex-1 py-3 ${themeAccent} text-white rounded-full text-sm font-heading font-semibold cursor-pointer whitespace-nowrap hover:bg-theme-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {saving ? '发布中...' : '确认并发布'}
                </button>
              </div>
            </div>
          )}

          {/* Success State: a collected experience, not a UUID receipt */}
          {step === 'success' && (
            <div className="py-8 text-center md:py-12">
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-theme-accent-light text-theme-accent">
                <i className="ri-bookmark-line text-xl" />
              </div>
              <span className="chapter-label">收录完成</span>
              <h2 className={`mt-3 font-heading text-2xl font-black ${themeText} md:text-3xl`}>
                {savedStatus === 'published' ? '这张经验名片已经公开。' : '这段走过的路，已收进你的名片册。'}
              </h2>
              <p className={`mx-auto mt-3 max-w-md text-sm leading-relaxed ${themeTextSec}`}>
                {savedStatus === 'published'
                  ? '它现在会出现在经验广场，别人可以带着自己的限制决定是否试用。'
                  : '草稿只有你可见。等你准备好，再把它发布给真正需要的人。'}
              </p>

              <div className="collection-card-enter mx-auto mt-8 max-w-sm rounded-2xl border border-theme-border bg-theme-bg-card p-5 text-left shadow-[0_18px_48px_rgba(54,35,30,0.10)]">
                <div className="flex items-center justify-between gap-3">
                  <span className="tag-red rounded-full px-2 py-0.5 text-[10px]">{savedStatus === 'published' ? 'v1 · 已发布' : '私密草稿'}</span>
                  <span className="text-[10px] text-theme-text-muted">Experience Card</span>
                </div>
                <h3 className={`mt-5 text-xl font-bold leading-snug ${themeText}`}>{draft.title || '我的经验名片'}</h3>
                <p className={`mt-3 text-sm leading-relaxed ${themeTextSec}`}>{draft.result || draft.oneLiner || draft.problem}</p>
                {draft.suitableFor && <p className="mt-5 border-t border-theme-border pt-3 text-xs leading-relaxed text-theme-text-secondary"><span className="mr-2 text-theme-accent">适合</span>{draft.suitableFor}</p>}
              </div>

              <div className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
                <button onClick={() => navigate('/my-cards')} className={`px-5 py-2.5 border ${themeBorder} ${themeText} rounded-full text-sm font-semibold hover:bg-theme-accent-subtle`}>
                  收进我的名片册
                </button>
                {savedStatus === 'published' ? (
                  <button onClick={() => navigate('/')} className={`px-5 py-2.5 ${themeAccent} text-white rounded-full text-sm font-semibold hover:bg-theme-accent-hover`}>
                    去经验广场查看
                  </button>
                ) : (
                  <button onClick={() => savedCardId && navigate(`/create?draft=${savedCardId}`)} className={`px-5 py-2.5 ${themeAccent} text-white rounded-full text-sm font-semibold hover:bg-theme-accent-hover`}>
                    继续编辑并发布
                  </button>
                )}
                {savedStatus === 'published' && <button onClick={() => setShareOpen(true)} className="px-5 py-2.5 text-sm font-semibold text-theme-accent hover:underline">分享这段经验</button>}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        reason={loginReason}
      />
      {savedCardId && (
        <SharePanel
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          card={{ id: savedCardId, title: draft.title || '我的经验名片', oneLiner: draft.oneLiner || draft.result || draft.problem, suitableFor: draft.suitableFor, result: draft.result }}
        />
      )}
    </div>
  );
}
