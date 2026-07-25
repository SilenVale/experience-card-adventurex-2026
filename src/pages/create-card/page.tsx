import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '@/hooks/useAuth';
import {
  getExperienceCard,
  saveExperienceCard,
  updateExperienceCard,
  type CardStatus,
} from '@/lib/experienceCards';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/feature/Navbar';
import LoginModal from '@/components/feature/LoginModal';
import FadeContent from '@/components/effects/FadeContent';
import CreateCardPreview from './CreateCardPreview';
import XiaohongshuPublishModal from '@/pages/community/components/XiaohongshuPublishModal';

type CreateStep = 1 | 2 | 3 | 'success';
type InputMode = 'write' | 'xiaohongshu';
type Visibility = 'private' | 'trial' | 'public';

const questions = [
  { id: 1, question: '你当时真正想解决什么问题？', hint: '不是表面问题，而是那个让你觉得“不对劲”的根本原因。' },
  { id: 2, question: '你做过哪些关键动作？', hint: '列出 3–5 个真正改变结果的动作，每个动作单独换行。' },
  { id: 3, question: '哪一步没有成功，后来如何调整？', hint: '失败与调整是 Build in Public 里最有价值的部分。' },
  { id: 4, question: '最后发生了什么？', hint: '如实写结果，可以是数字、变化或一个没有达到的目标。' },
  { id: 5, question: '在什么情况下，这段经验不适合别人照搬？', hint: '写清预算、团队、时间、行业或人群差异。' },
];

const emptyDraft = {
  title: '',
  oneLiner: '',
  problem: '',
  actions: '',
  pitfall: '',
  result: '',
  boundary: '',
  suitableFor: '',
  microAction: '',
};

const AUTOSAVE_PREFIX = 'experience-card-create-autosave';
const LEGACY_AUTOSAVE_KEY = AUTOSAVE_PREFIX;
const AUTOSAVE_ANONYMOUS_KEY = `${AUTOSAVE_PREFIX}:anonymous`;
const AUTOSAVE_SCHEMA_VERSION = 1;
const AUTOSAVE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const visibilityIds = new Set<Visibility>(['private', 'trial', 'public']);
const inputModeIds = new Set<InputMode>(['write', 'xiaohongshu']);

type AutosavePayload = {
  schemaVersion: number;
  ownerUserId: string | null;
  updatedAt: string;
  data: {
    rawExperience: string;
    answers: Record<number, string>;
    draft: typeof emptyDraft;
    sourceMap: Record<string, string[]>;
    sharingConsent: boolean;
    visibility: Visibility;
    inputMode: InputMode;
    step: 1 | 2 | 3;
    currentQuestion: number;
  };
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isPlainObject(value) && Object.values(value).every((item) => typeof item === 'string');
}

function isSourceMap(value: unknown): value is Record<string, string[]> {
  return isPlainObject(value) && Object.values(value).every((item) => Array.isArray(item) && item.every((source) => typeof source === 'string'));
}

function autosaveKey(userId: string | null) {
  return userId ? `${AUTOSAVE_PREFIX}:${userId}` : AUTOSAVE_ANONYMOUS_KEY;
}

function readAutosave(storage: Storage, key: string, ownerUserId: string | null): AutosavePayload | null {
  let raw: string | null = null;
  try { raw = storage.getItem(key); } catch { return null; }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AutosavePayload>;
    const updatedAt = typeof parsed.updatedAt === 'string' ? Date.parse(parsed.updatedAt) : NaN;
    const data = parsed.data;
    const draft = data && isPlainObject(data.draft) ? data.draft : null;
    const validDraft = draft && Object.values(emptyDraft).every((_value, index) => {
      const field = Object.keys(emptyDraft)[index];
      return typeof draft[field] === 'string';
    });
    const validStep = data && (data.step === 1 || data.step === 2 || data.step === 3);
    const valid = parsed.schemaVersion === AUTOSAVE_SCHEMA_VERSION
      && parsed.ownerUserId === ownerUserId
      && Number.isFinite(updatedAt)
      && updatedAt <= Date.now()
      && Date.now() - updatedAt <= AUTOSAVE_MAX_AGE_MS
      && data && typeof data.rawExperience === 'string'
      && isStringRecord(data.answers)
      && validDraft
      && isSourceMap(data.sourceMap)
      && typeof data.sharingConsent === 'boolean'
      && visibilityIds.has(data.visibility as Visibility)
      && inputModeIds.has(data.inputMode as InputMode)
      && validStep
      && Number.isInteger(data.currentQuestion) && data.currentQuestion >= 0 && data.currentQuestion <= 4;
    if (!valid) {
      storage.removeItem(key);
      return null;
    }
    return parsed as AutosavePayload;
  } catch {
    try { storage.removeItem(key); } catch { /* ignore unavailable storage */ }
    return null;
  }
}

function writeAutosave(storage: Storage, key: string, ownerUserId: string | null, data: AutosavePayload['data']) {
  const payload: AutosavePayload = {
    schemaVersion: AUTOSAVE_SCHEMA_VERSION,
    ownerUserId,
    updatedAt: new Date().toISOString(),
    data,
  };
  try { storage.setItem(key, JSON.stringify(payload)); } catch { /* storage may be unavailable */ }
}

function clearAutosave(userId: string | null) {
  try {
    if (userId) localStorage.removeItem(autosaveKey(userId));
    sessionStorage.removeItem(AUTOSAVE_ANONYMOUS_KEY);
  } catch { /* storage may be unavailable */ }
}

const visibilityOptions: { id: Visibility; title: string; description: string; icon: string }[] = [
  { id: 'private', title: '私人草稿', description: '只保存在我的名片中，核心内容不公开。', icon: 'ri-lock-line' },
  { id: 'trial', title: '发布为可试用 V1', description: '公开摘要，邀请处境相近的人提交反馈。', icon: 'ri-flask-line' },
  { id: 'public', title: '加入公开构建', description: '展示版本变化，并生成小红书构建记录。', icon: 'ri-broadcast-line' },
];

function CreateFade({
  children,
  delay = 0,
  className = '',
  blur = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  blur?: boolean;
}) {
  return (
    <FadeContent
      blur={blur}
      duration={820}
      ease="power3.out"
      delay={delay}
      threshold={0.04}
      initialOpacity={0}
      className={className}
    >
      {children}
    </FadeContent>
  );
}

export default function CreateCardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const draftId = new URLSearchParams(location.search).get('draft');
  const versionOfId = new URLSearchParams(location.search).get('versionOf');
  const [step, setStep] = useState<CreateStep>(1);
  const [inputMode, setInputMode] = useState<InputMode>('write');
  const [rawExperience, setRawExperience] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [draft, setDraft] = useState(emptyDraft);
  const [sourceMap, setSourceMap] = useState<Record<string, string[]>>({});
  const [sharingConsent, setSharingConsent] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>('trial');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedCardId, setSavedCardId] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState<CardStatus | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginReason, setLoginReason] = useState('');
  const [publisherOpen, setPublisherOpen] = useState(false);
  const [questionTransitioning, setQuestionTransitioning] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(Boolean(draftId || versionOfId));
  const [autosaveReady, setAutosaveReady] = useState(false);
  const autosaveStorageKey = authLoading ? null : autosaveKey(user?.id ?? null);
  const authScopeRef = useRef<string | null | undefined>(undefined);
  const questionStageRef = useRef<HTMLDivElement>(null);
  const questionTweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (authLoading) return;
    const nextUserId = user?.id ?? null;
    if (authScopeRef.current !== undefined && authScopeRef.current !== nextUserId) {
      setRawExperience('');
      setAnswers({});
      setDraft(emptyDraft);
      setSourceMap({});
      setSharingConsent(false);
      setEditingCardId(null);
      setSavedCardId(null);
      setSavedStatus(null);
      setSaveError(null);
      setStep(1);
      setCurrentQuestion(0);
      setVisibility('trial');
      setInputMode('write');
      setLoadingDraft(Boolean(draftId || versionOfId));
    }
    authScopeRef.current = nextUserId;
  }, [authLoading, user?.id, draftId, versionOfId]);

  useEffect(() => {
    setAutosaveReady(false);
    if (authLoading) return;
    if (draftId || versionOfId || !autosaveStorageKey) {
      setAutosaveReady(true);
      return;
    }
    try { localStorage.removeItem(LEGACY_AUTOSAVE_KEY); } catch { /* ignore unavailable storage */ }
    // Never carry the previous auth identity's in-memory draft into a new storage scope.
    setRawExperience('');
    setAnswers({});
    setDraft(emptyDraft);
    setSourceMap({});
    setSharingConsent(false);
    setVisibility('trial');
    setInputMode('write');
    setStep(1);
    setCurrentQuestion(0);
    const ownerId = user?.id ?? null;
    const storage = ownerId ? localStorage : sessionStorage;
    let payload = readAutosave(storage, autosaveStorageKey, ownerId);
    if (!payload && ownerId) {
      const anonymousPayload = readAutosave(sessionStorage, AUTOSAVE_ANONYMOUS_KEY, null);
      if (anonymousPayload) {
        payload = { ...anonymousPayload, ownerUserId: ownerId };
        writeAutosave(localStorage, autosaveStorageKey, ownerId, anonymousPayload.data);
        try { sessionStorage.removeItem(AUTOSAVE_ANONYMOUS_KEY); } catch { /* ignore unavailable storage */ }
      }
    }
    if (payload) {
      const data = payload.data;
      setRawExperience(data.rawExperience);
      setAnswers(data.answers);
      setDraft(data.draft);
      setSourceMap(data.sourceMap);
      setSharingConsent(data.sharingConsent);
      setVisibility(data.visibility);
      setInputMode(data.inputMode);
      setStep(data.step);
      setCurrentQuestion(data.currentQuestion);
    }
    setAutosaveReady(true);
  }, [authLoading, draftId, versionOfId, user?.id, autosaveStorageKey]);

  useEffect(() => {
    if (draftId || versionOfId || !autosaveReady || !autosaveStorageKey || step === 'success') return;
    const ownerId = user?.id ?? null;
    writeAutosave(ownerId ? localStorage : sessionStorage, autosaveStorageKey, ownerId, {
      rawExperience,
      answers,
      draft,
      sourceMap,
      sharingConsent,
      visibility,
      inputMode,
      step: step as 1 | 2 | 3,
      currentQuestion,
    });
  }, [draftId, versionOfId, autosaveReady, autosaveStorageKey, user?.id, rawExperience, answers, draft, sourceMap, sharingConsent, visibility, inputMode, step, currentQuestion]);

  useEffect(() => {
    const sourceId = draftId || versionOfId;
    if (!sourceId) {
      setLoadingDraft(false);
      return;
    }
    if (authLoading) return;
    if (!user) {
      setLoadingDraft(false);
      setSaveError('登录后才能继续编辑或创建新版本。');
      return;
    }

    let active = true;
    const loadDraft = async () => {
      setLoadingDraft(true);
      setSaveError(null);
      try {
        const card = await getExperienceCard(sourceId);
        if (!card || card.user_id !== user.id || (draftId && card.status !== 'draft')) {
          throw new Error('这张经验卡不存在，或你没有编辑权限。');
        }
        if (!active) return;
        // Editing a draft updates it; “创建新版本” always saves a new row.
        setEditingCardId(draftId ? card.id : null);
        setRawExperience(card.background);
        setAnswers({ 1: card.problem, 2: card.actions_done, 3: card.pitfall, 4: card.result, 5: card.boundary });
        setDraft({
          title: card.title,
          oneLiner: card.one_liner,
          problem: card.problem,
          actions: card.actions_done,
          pitfall: card.pitfall,
          result: card.result,
          suitableFor: card.suitable_for,
          boundary: card.boundary,
          microAction: card.micro_action ?? '',
        });
        setSourceMap(card.source_map ?? {});
        setSharingConsent(Boolean(card.sharing_consent));
        setVisibility(versionOfId ? 'trial' : 'private');
        setStep(3);
      } catch (error) {
        if (active) setSaveError(error instanceof Error ? error.message : '读取草稿失败，请稍后重试。');
      } finally {
        if (active) setLoadingDraft(false);
      }
    };
    void loadDraft();
    return () => {
      active = false;
    };
  }, [draftId, versionOfId, user, authLoading]);

  useEffect(() => {
    return () => {
      questionTweenRef.current?.kill();
    };
  }, []);

  const handleStep1Next = () => {
    if (!rawExperience.trim()) return;
    setStep(2);
    setCurrentQuestion(0);
  };

  const transitionFromQuestion = (onComplete: () => void) => {
    if (questionTransitioning) return;

    const element = questionStageRef.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete();
      return;
    }

    setQuestionTransitioning(true);
    questionTweenRef.current?.kill();
    questionTweenRef.current = gsap.to(element, {
      autoAlpha: 0,
      y: -12,
      scale: 0.995,
      filter: 'blur(6px)',
      duration: 0.32,
      ease: 'power2.in',
      onComplete: () => {
        onComplete();
        setQuestionTransitioning(false);
      },
    });
  };

  const completeQuestions = async () => {
    if (!sharingConsent) {
      setSaveError('请先确认你有权分享这段经历，并会在发布前逐项确认。');
      return;
    }
    if (!user) {
      setLoginReason('调用 AI 生成经验卡需要先登录；你刚才填写的内容已经保存在当前浏览器。');
      setLoginOpen(true);
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
      title: String(card.title ?? ''),
      oneLiner: String(card.one_liner ?? ''),
      problem: String(card.problem ?? ''),
      actions: String(card.actions ?? ''),
      pitfall: String(card.pitfall ?? ''),
      result: String(card.result ?? ''),
      suitableFor: String(card.suitable_for ?? ''),
      boundary: String(card.boundary ?? ''),
      microAction: typeof card.micro_action === 'string' ? card.micro_action : '',
    });
    setSourceMap((card.source_map as Record<string, string[]>) ?? {});
    setStep(3);
  };

  const handleQuestionNext = () => {
    transitionFromQuestion(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((current) => current + 1);
        return;
      }
      void completeQuestions();
    });
  };

  const handleQuestionPrevious = () => {
    transitionFromQuestion(() => {
      if (currentQuestion === 0) {
        setStep(1);
        return;
      }
      setCurrentQuestion((current) => current - 1);
    });
  };

  const handlePublish = async () => {
    if (!draft.title.trim() || !draft.actions.trim() || !draft.suitableFor.trim()) {
      setSaveError('请至少补充标题、关键动作和适合对象。');
      return;
    }

    if (!user) {
      setLoginReason(visibility === 'private' ? '保存草稿需要登录' : '发布经验卡需要登录');
      setLoginOpen(true);
      return;
    }

    if (visibility !== 'private' && !sharingConsent) {
      setSaveError('公开或可试用经验卡前，必须确认你有权分享这段经历。');
      return;
    }
    if (visibility !== 'private' && !draft.microAction.trim()) {
      setSaveError('公开或可试用经验卡前，请补充“今天可以先试的一步”。');
      return;
    }

    setSaving(true);
    setSaveError(null);
    const status: CardStatus = visibility === 'private' ? 'draft' : 'published';
    const input = {
      userId: user.id,
      title: draft.title.trim(),
      oneLiner: draft.oneLiner.trim() || draft.result.trim() || draft.problem.trim(),
      problem: draft.problem.trim(),
      background: rawExperience.trim(),
      actionsDone: draft.actions.trim(),
      pitfall: draft.pitfall.trim() || answers[3]?.trim() || '',
      result: draft.result.trim(),
      suitableFor: draft.suitableFor.trim(),
      boundary: draft.boundary.trim(),
      microAction: draft.microAction.trim() || null,
      sourceMap,
      sharingConsent,
      status,
    };
    try {
      const data = editingCardId
        ? await updateExperienceCard(editingCardId, input)
        : await saveExperienceCard(input);
      setSavedCardId(data.id);
      setSavedStatus(data.status);
      clearAutosave(user?.id ?? null);
      setStep('success');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '保存失败，请稍后重试。');
    } finally {
      setSaving(false);
    }
  };

  const stageLabel =
    step === 1 ? '原始经历' : step === 2 ? `AI 追问 ${currentQuestion + 1}/5` : step === 3 ? '编辑确认' : '已保存';

  const previewProps = {
    title: draft.title,
    oneLiner: draft.oneLiner,
    problem: draft.problem || answers[1] || rawExperience,
    actions: draft.actions || answers[2] || '',
    pitfall: draft.pitfall || answers[3] || '',
    result: draft.result || answers[4] || '',
    boundary: draft.boundary || answers[5] || '',
    microAction: draft.microAction,
    stageLabel,
  };

  return (
    <div className="experience-motion min-h-screen bg-theme-bg transition-colors duration-300">
      <Navbar />
      <main className="pt-16 pb-20">
        <div className="mx-auto max-w-6xl px-4 py-7 md:px-8 md:py-10">
          {loadingDraft && (
            <div className="mb-5 rounded-xl border border-theme-border bg-theme-bg-card px-4 py-3 text-xs text-theme-text-muted">
              正在打开你的草稿…
            </div>
          )}
          {typeof step === 'number' && (
            <>
              <CreateFade className="mb-5" blur={false}>
                <div className="flex items-center gap-3">
                  <span className="chapter-label">创建经验卡</span>
                  <div className="h-px flex-1 bg-theme-border" />
                  <span className="hidden text-[10px] text-theme-text-muted sm:block">已在当前浏览器自动保存</span>
                </div>
              </CreateFade>
              <div className="mb-6 grid grid-cols-3 gap-2">
                {[
                  { no: 1, title: '倒出经历', note: '先写真实发生的事' },
                  { no: 2, title: 'AI 追问', note: '补齐判断与边界' },
                  { no: 3, title: '编辑发布', note: '确认公开范围' },
                ].map((item) => {
                  const active = step === item.no;
                  const complete = step > item.no;
                  return (
                    <CreateFade key={item.no} delay={item.no * 55}>
                      <div
                        className={`ui-motion rounded-2xl border px-3 py-3 md:px-4 ${
                          active
                            ? 'border-theme-accent/25 bg-theme-accent-subtle'
                            : 'border-theme-border bg-theme-bg-card'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-7 w-8 items-center justify-center rounded-xl text-[10px] font-bold ${
                              active || complete ? 'bg-theme-accent text-white' : 'bg-theme-bg-card-alt text-theme-text-muted'
                            }`}
                          >
                            {complete ? <i className="ri-check-line" /> : `0${item.no}`}
                          </span>
                          <span className={`text-xs font-semibold ${active ? 'text-theme-accent' : 'text-theme-text'}`}>
                            {item.title}
                          </span>
                        </div>
                        <p className="mt-2 hidden text-[10px] text-theme-text-muted sm:block">{item.note}</p>
                      </div>
                    </CreateFade>
                  );
                })}
              </div>
            </>
          )}

          {step !== 'success' ? (
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
              <section className="ui-motion relative overflow-hidden rounded-[26px] border border-theme-border bg-theme-bg-card p-3 shadow-[0_24px_70px_rgba(89,52,43,0.07)] md:p-4">
                <div className="relative overflow-hidden rounded-[20px] border border-theme-border bg-theme-bg-card-alt px-6 py-7 shadow-sm md:px-10 md:py-9">
                  <div className="absolute bottom-8 left-3 top-8 flex flex-col justify-between">
                    {[0, 1, 2, 3, 4].map((hole) => (
                      <span key={hole} className="h-2 w-2 rounded-full bg-theme-border" />
                    ))}
                  </div>

                  <div className="pl-2">
                    {step === 1 && (
                      <div key="create-step-1">
                        <CreateFade delay={190} blur={false}>
                          <span className="block text-[10px] font-semibold tracking-[0.13em] text-theme-accent">
                            01 · 原始经历
                          </span>
                        </CreateFade>
                        <CreateFade delay={230}>
                          <h1 className="mt-3 max-w-2xl font-heading text-2xl font-black leading-[1.05] tracking-[-0.045em] text-theme-text md:text-4xl">
                            把你做成过的一件事，
                            <br />
                            留给未来可能需要它的人。
                          </h1>
                        </CreateFade>
                        <CreateFade delay={270} blur={false}>
                          <p className="mt-3 text-sm leading-relaxed text-theme-text-secondary">
                            不需要完美，也不用展示全部。你决定分享什么，AI 只帮你说清楚。
                          </p>
                        </CreateFade>

                        <div className="mt-6 grid grid-cols-2 gap-2">
                          <CreateFade delay={310}>
                            <button
                              onClick={() => setInputMode('write')}
                              className={`ui-motion w-full cursor-pointer rounded-xl border px-3 py-3 text-left ${
                                inputMode === 'write'
                                  ? 'border-theme-accent/25 bg-theme-accent-subtle'
                                  : 'border-theme-border bg-theme-bg-card'
                              }`}
                            >
                              <i className="ri-pencil-line text-theme-accent" />
                              <span className="ml-2 text-xs font-semibold text-theme-text">自由写一段</span>
                              <p className="mt-1 text-[9px] text-theme-text-muted">可以很乱，先把发生过的事写下来</p>
                            </button>
                          </CreateFade>
                          <CreateFade delay={350}>
                            <button
                              onClick={() => setInputMode('xiaohongshu')}
                              className={`ui-motion w-full cursor-pointer rounded-xl border px-3 py-3 text-left ${
                                inputMode === 'xiaohongshu'
                                  ? 'border-theme-accent/25 bg-theme-accent-subtle'
                                  : 'border-theme-border bg-theme-bg-card'
                              }`}
                            >
                              <i className="ri-red-packet-line text-theme-accent" />
                              <span className="ml-2 text-xs font-semibold text-theme-text">整理构建记录</span>
                              <p className="mt-1 text-[9px] text-theme-text-muted">粘贴已有的小红书笔记或项目日志</p>
                            </button>
                          </CreateFade>
                        </div>

                        <CreateFade delay={390} blur={false}>
                          <label className="mt-6 block text-[10px] font-semibold tracking-wider text-theme-accent">
                            {inputMode === 'write' ? '写下你的原始经历' : '粘贴你的公开构建内容'}
                          </label>
                        </CreateFade>
                        <CreateFade delay={430}>
                          <textarea
                            className="mt-2 h-60 w-full resize-none rounded-2xl border border-theme-border bg-theme-bg-card-alt px-4 py-4 text-sm leading-relaxed text-theme-text outline-none transition-colors placeholder:text-theme-text-muted focus:border-theme-accent/35"
                            placeholder={
                              inputMode === 'write'
                                ? '当时发生了什么？你做过什么？结果怎样？先完整写下来，不用急着总结。'
                                : '粘贴小红书笔记正文、项目日志或评论反馈。核心实现细节可以先删除。'
                            }
                            value={rawExperience}
                            onChange={(event) => setRawExperience(event.target.value)}
                          />
                        </CreateFade>
                        <CreateFade delay={470} blur={false}>
                          <div className="mt-3 flex items-start gap-2 rounded-xl bg-theme-accent-subtle px-3 py-2.5">
                            <i className="ri-shield-keyhole-line mt-0.5 text-xs text-theme-accent" />
                            <p className="text-[10px] leading-relaxed text-theme-text-secondary">
                              当前内容先作为私人草稿保存。完成整理后，你可以分别选择公开摘要、共创者可见或继续保密。
                            </p>
                          </div>
                        </CreateFade>
                        <CreateFade delay={490} blur={false}>
                          <label className="mt-3 flex cursor-pointer items-start gap-2 rounded-xl border border-theme-border bg-theme-bg-card px-3 py-2.5 text-[10px] leading-relaxed text-theme-text-secondary">
                            <input
                              type="checkbox"
                              checked={sharingConsent}
                              onChange={(event) => setSharingConsent(event.target.checked)}
                              className="mt-0.5 h-4 w-4 accent-red-500"
                            />
                            <span>我确认有权分享这段经历，并会在发布前逐项确认 AI 生成内容。</span>
                          </label>
                        </CreateFade>
                        <CreateFade delay={510} blur={false}>
                          <button
                            onClick={handleStep1Next}
                            disabled={!rawExperience.trim() || !sharingConsent}
                            className="mt-5 w-full cursor-pointer rounded-full bg-theme-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-theme-accent-hover disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            继续，让 AI 帮我追问
                          </button>
                        </CreateFade>
                      </div>
                    )}

                    {step === 2 && (
                      <div ref={questionStageRef} key={`create-question-${currentQuestion}`}>
                        <CreateFade delay={40} blur={false}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold tracking-[0.13em] text-theme-accent">
                              02 · AI 追问
                            </span>
                            <span className="text-[10px] text-theme-text-muted">{currentQuestion + 1} / {questions.length}</span>
                          </div>
                        </CreateFade>
                        <CreateFade delay={80} blur={false}>
                          <div className="mt-4 flex gap-1.5">
                            {questions.map((_, index) => (
                              <span
                                key={index}
                                className={`h-1 flex-1 rounded-full ${
                                  index <= currentQuestion ? 'bg-theme-accent' : 'bg-theme-accent-subtle'
                                }`}
                              />
                            ))}
                          </div>
                        </CreateFade>

                        <CreateFade delay={120}>
                          <div className="mt-7 rounded-[18px] border border-theme-accent/10 bg-theme-accent-subtle px-5 py-5">
                            <div className="flex items-center gap-2 text-[10px] font-semibold text-theme-accent">
                              <i className="ri-sparkling-2-line" />
                              这不是审问，只是在帮经验变得可判断
                            </div>
                            <h2 className="mt-3 font-heading text-xl font-bold leading-tight text-theme-text md:text-2xl">
                              {questions[currentQuestion].question}
                            </h2>
                            <p className="mt-2 text-xs leading-relaxed text-theme-text-secondary">
                              {questions[currentQuestion].hint}
                            </p>
                          </div>
                        </CreateFade>

                        <CreateFade delay={160}>
                          <textarea
                            autoFocus
                            disabled={questionTransitioning}
                            className="mt-4 h-48 w-full resize-none rounded-2xl border border-theme-border bg-theme-bg-card-alt px-4 py-4 text-sm leading-relaxed text-theme-text outline-none transition-colors placeholder:text-theme-text-muted focus:border-theme-accent/35"
                            placeholder="写下真实答案，不需要把它写得像一篇文章。"
                            value={answers[questions[currentQuestion].id] || ''}
                            onChange={(event) =>
                              setAnswers((current) => ({
                                ...current,
                                [questions[currentQuestion].id]: event.target.value,
                              }))
                            }
                          />
                        </CreateFade>

                        <CreateFade delay={200} blur={false}>
                          <div className="mt-5 flex gap-2">
                            <button
                              onClick={handleQuestionPrevious}
                              disabled={questionTransitioning}
                              className="flex-1 cursor-pointer rounded-full border border-theme-text/15 py-3 text-sm text-theme-text transition-colors hover:bg-theme-bg-card-alt disabled:cursor-not-allowed disabled:opacity-45"
                            >
                              上一步
                            </button>
                            <button
                              onClick={handleQuestionNext}
                              disabled={questionTransitioning || !answers[questions[currentQuestion].id]?.trim()}
                              className="flex-1 cursor-pointer rounded-full bg-theme-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-theme-accent-hover disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              {generating
                                ? 'AI 正在整理…'
                                : questionTransitioning
                                ? '正在整理…'
                                : currentQuestion === questions.length - 1
                                  ? '生成经验卡草稿'
                                  : '下一问'}
                            </button>
                          </div>
                        </CreateFade>
                      </div>
                    )}

                    {step === 3 && (
                      <div key="create-step-3">
                        <CreateFade delay={40} blur={false}>
                          <span className="block text-[10px] font-semibold tracking-[0.13em] text-theme-accent">
                            03 · 编辑并确认
                          </span>
                        </CreateFade>
                        <CreateFade delay={80}>
                          <h1 className="mt-2 font-heading text-2xl font-black tracking-[-0.04em] text-theme-text">
                            这张经验卡由你确认，不由 AI 决定。
                          </h1>
                        </CreateFade>
                        <CreateFade delay={120} blur={false}>
                          <p className="mt-2 text-xs leading-relaxed text-theme-text-secondary">
                            修改、删除或隐藏任何内容。只有你确认后，它才会成为可试用的 V1。
                          </p>
                        </CreateFade>

                        <div className="mt-6 space-y-4">
                          {[
                            { key: 'title', label: '经验卡标题', rows: 1 },
                            { key: 'oneLiner', label: '一句话摘要 / 适用情境', rows: 2 },
                            { key: 'problem', label: '01 · 当时真正的问题', rows: 3 },
                            { key: 'actions', label: '02 · 关键动作（每个动作单独换行）', rows: 5 },
                            { key: 'pitfall', label: '03 · 踩坑与调整', rows: 3 },
                            { key: 'result', label: '04 · 最终发生了什么', rows: 3 },
                            { key: 'suitableFor', label: '05 · 这段经验适合谁', rows: 3 },
                            { key: 'boundary', label: '使用边界 / 不适合照搬的情况', rows: 3 },
                            { key: 'microAction', label: '今天可以先试的一步（草稿可留空，公开或可试用时必填）', rows: 2 },
                          ].map((field, index) => (
                            <CreateFade key={field.key} delay={160 + index * 36}>
                              <label className="block">
                                <span className="text-[10px] font-semibold text-theme-accent">{field.label}</span>
                                {field.rows === 1 ? (
                                  <input
                                    value={draft[field.key as keyof typeof draft]}
                                    onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                                    className="mt-1.5 w-full rounded-xl border border-theme-border bg-theme-bg-card-alt px-3.5 py-3 text-sm text-theme-text outline-none focus:border-theme-accent/35"
                                  />
                                ) : (
                                  <textarea
                                    rows={field.rows}
                                    value={draft[field.key as keyof typeof draft]}
                                    onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                                    className="mt-1.5 w-full resize-none rounded-xl border border-theme-border bg-theme-bg-card-alt px-3.5 py-3 text-sm leading-relaxed text-theme-text outline-none focus:border-theme-accent/35"
                                  />
                                )}
                                {field.key === 'microAction' && !draft.microAction.trim() && (
                                  <span className="mt-1 block text-[10px] leading-relaxed text-theme-text-muted">
                                    旧版 AI 未返回时这里会留空，请由你确认后手动补充；不会自动生成模板内容。
                                  </span>
                                )}
                              </label>
                            </CreateFade>
                          ))}
                        </div>

                        <CreateFade delay={390}>
                          <div className="mt-6 border-t border-dashed border-theme-border pt-5">
                            <p className="text-[10px] font-semibold text-theme-accent">选择公开方式</p>
                            <div className="mt-2 grid gap-2">
                              {visibilityOptions.map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => setVisibility(option.id)}
                                  className={`ui-motion flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 text-left ${
                                    visibility === option.id
                                      ? 'border-theme-accent/25 bg-theme-accent-subtle'
                                      : 'border-theme-border bg-theme-bg-card'
                                  }`}
                                >
                                  <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                                    visibility === option.id ? 'bg-theme-accent text-white' : 'bg-theme-bg-card-alt text-theme-text-muted'
                                  }`}>
                                    <i className={option.icon} />
                                  </span>
                                  <span>
                                    <strong className="block text-xs text-theme-text">{option.title}</strong>
                                    <span className="mt-1 block text-[10px] leading-relaxed text-theme-text-muted">{option.description}</span>
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </CreateFade>

                        {saveError && (
                          <CreateFade delay={420} blur={false}>
                            <div className="mt-4 rounded-xl border border-theme-accent/15 bg-theme-accent-subtle px-4 py-3 text-xs text-theme-accent">
                              {saveError}
                            </div>
                          </CreateFade>
                        )}

                        <CreateFade delay={440} blur={false}>
                          <div className="mt-5 grid grid-cols-[minmax(0,0.78fr)_minmax(148px,1.22fr)] gap-2">
                            <button
                              onClick={() => {
                                setStep(2);
                                setCurrentQuestion(questions.length - 1);
                              }}
                              className="min-h-12 min-w-0 cursor-pointer whitespace-nowrap rounded-full border border-theme-text/15 px-3 py-3 text-xs text-theme-text hover:bg-theme-bg-card-alt sm:text-sm"
                            >
                              返回修改
                            </button>
                            <button
                              onClick={handlePublish}
                              disabled={saving || !draft.title.trim() || !draft.actions.trim() || !draft.suitableFor.trim()}
                              className="min-h-12 min-w-0 cursor-pointer whitespace-nowrap rounded-full bg-theme-accent px-4 py-3 text-xs font-semibold text-white hover:bg-theme-accent-hover disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:text-sm"
                            >
                              {saving
                                ? '保存中…'
                                : visibility === 'private'
                                  ? '保存私人草稿'
                                  : visibility === 'trial'
                                    ? '发布可试用 V1'
                                    : '加入公开构建'}
                            </button>
                          </div>
                        </CreateFade>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <CreateFade className="hidden lg:block" delay={220}>
                <CreateCardPreview {...previewProps} />
              </CreateFade>

              <CreateFade className="lg:hidden" delay={220}>
                <details className="ui-motion rounded-2xl border border-theme-border bg-theme-bg-card">
                  <summary className="flex cursor-pointer list-none items-center px-4 py-3 text-xs font-semibold text-theme-text">
                    <i className="ri-eye-line mr-2 text-theme-accent" />
                    查看经验卡实时预览
                    <i className="ri-arrow-down-s-line ml-auto" />
                  </summary>
                  <div className="border-t border-theme-border p-3">
                    <CreateCardPreview {...previewProps} />
                  </div>
                </details>
              </CreateFade>
            </div>
          ) : (
            <CreateFade className="mx-auto max-w-3xl" delay={80}>
              <section className="ui-motion rounded-[26px] border border-theme-border bg-theme-bg-card p-3 shadow-[0_24px_80px_rgba(89,52,43,0.08)]">
                <div className="relative overflow-hidden rounded-[20px] border border-theme-border bg-theme-bg-card-alt px-7 py-10 text-center md:px-12">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-theme-accent/15 bg-theme-accent-subtle text-theme-accent">
                  <i className="ri-check-line text-2xl" />
                </div>
                <span className="mt-5 block text-[10px] font-semibold tracking-[0.14em] text-theme-accent">
                  EXPERIENCE CARD / V1
                </span>
                <h1 className="mt-2 font-heading text-2xl font-black tracking-[-0.04em] text-theme-text md:text-4xl">
                  你的经验卡已经被好好保存。
                </h1>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-theme-text-secondary">
                  {savedStatus === 'published'
                    ? '已经同步到云端，并出现在经验广场。'
                    : '已保存为仅作者可见的云端草稿。'}
                </p>
                {savedCardId && (
                  <p className="mt-2 font-mono text-[10px] text-theme-text-muted">ID: {savedCardId}</p>
                )}

                <div className="mx-auto mt-7 grid max-w-xl gap-2 sm:grid-cols-2">
                  <button
                    onClick={() => savedCardId && navigate(`/card/${savedCardId}`)}
                    className="cursor-pointer rounded-full border border-theme-text/15 py-3 text-sm font-semibold text-theme-text hover:bg-theme-bg-card-alt"
                  >
                    查看完整经验卡
                  </button>
                  <button
                    onClick={() => setPublisherOpen(true)}
                    className="cursor-pointer rounded-full bg-theme-accent py-3 text-sm font-semibold text-white hover:bg-theme-accent-hover"
                  >
                    <i className="ri-red-packet-line mr-1.5" />
                    生成小红书构建记录
                  </button>
                  <button
                    onClick={() => navigate('/community')}
                    className="cursor-pointer rounded-full border border-theme-accent/15 py-3 text-sm font-semibold text-theme-accent hover:bg-theme-accent-subtle sm:col-span-2"
                  >
                    去社区招募试用者
                  </button>
                </div>
                </div>
              </section>
            </CreateFade>
          )}
        </div>
      </main>

      <XiaohongshuPublishModal
        open={publisherOpen}
        projectTitle={draft.title || '我的经验名片'}
        onClose={() => setPublisherOpen(false)}
      />
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        reason={loginReason}
      />
    </div>
  );
}
