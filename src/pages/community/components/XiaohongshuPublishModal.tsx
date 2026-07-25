import { useEffect, useMemo, useState } from 'react';

interface XiaohongshuPublishModalProps {
  open: boolean;
  projectTitle: string;
  onClose: () => void;
}

const titleOptions = [
  '公开做项目的第 3 天，我们终于找到了真正的问题',
  '没有憋大招：一张经验卡是怎样被社区改好的',
  '把失败版本也发出来后，我们收到了第一条有用反馈',
];

export default function XiaohongshuPublishModal({
  open,
  projectTitle,
  onClose,
}: XiaohongshuPublishModalProps) {
  const [selectedTitle, setSelectedTitle] = useState(0);
  const [copied, setCopied] = useState(false);
  const [noteUrl, setNoteUrl] = useState('');
  const [bound, setBound] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [visiblePostBody, setVisiblePostBody] = useState('');

  const postBody = useMemo(
    () =>
      `我们正在公开构建「${projectTitle}」。\n\n这一版没有急着增加更多功能，而是先把一个问题说清楚：不是让经验看起来更厉害，而是让正在遇到相似处境的人，能判断自己下一步该做什么。\n\n今天收到的反馈：\n1. 第一批参与者从哪里来？\n2. 没有资源时，哪个动作可以今天就开始？\n3. 哪些方法不适合照搬？\n\n我们会把被采纳的建议写进 v2，也会保留没有采纳的理由。公开做，比一个人憋到“完美”更接近真实。\n\n#AdventureX #BuildInPublic #AI产品 #独立开发 #经验共创`,
    [projectTitle]
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      setBound(false);
      setNoteUrl('');
      setIsComposing(false);
      setVisiblePostBody('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    setIsComposing(true);
    setVisiblePostBody('');
    const chunks = postBody.match(/.{1,18}/gs) ?? [postBody];
    let index = 0;
    const timer = window.setInterval(() => {
      setVisiblePostBody((current) => current + (chunks[index] ?? ''));
      index += 1;
      if (index >= chunks.length) {
        window.clearInterval(timer);
        setIsComposing(false);
      }
    }, 42);

    return () => window.clearInterval(timer);
  }, [open, postBody]);

  if (!open) return null;

  const copyPost = async () => {
    await navigator.clipboard.writeText(`${titleOptions[selectedTitle]}\n\n${postBody}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const downloadPoster = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1440;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.fillStyle = '#FAF7F3';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = context.createLinearGradient(0, 0, 1080, 1440);
    gradient.addColorStop(0, 'rgba(230,59,48,0.18)');
    gradient.addColorStop(0.55, 'rgba(250,247,243,0)');
    gradient.addColorStop(1, 'rgba(242,212,71,0.14)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = 'rgba(26,21,20,0.12)';
    context.lineWidth = 2;
    context.strokeRect(54, 54, 972, 1332);

    for (let index = 0; index < 34; index += 1) {
      const size = 7 + ((index * 13) % 18);
      const x = 70 + ((index * 211) % 930);
      const y = 80 + ((index * 307) % 1240);
      context.fillStyle = index % 4 === 0 ? 'rgba(198,35,30,0.46)' : 'rgba(230,59,48,0.2)';
      context.fillRect(x, y, size, size);
    }

    context.fillStyle = '#E63B30';
    context.font = '600 28px "Noto Sans SC", sans-serif';
    context.fillText('EXPERIENCE CARD / BUILD IN PUBLIC', 96, 150);

    context.fillStyle = '#1A1514';
    context.font = '900 72px "Noto Sans SC", sans-serif';
    context.fillText('公开做项目的', 96, 335);
    context.fillText('第 3 天', 96, 425);

    context.fillStyle = '#E63B30';
    context.fillRect(96, 488, 132, 18);

    context.fillStyle = '#1A1514';
    context.font = '700 40px "Noto Sans SC", sans-serif';
    context.fillText('我们终于找到了真正的问题', 96, 600);

    const lines = [
      '不是让经验显得更厉害，',
      '而是让另一个人能够判断：',
      '这一步，是否适合现在的自己。',
    ];
    context.fillStyle = '#6B5B55';
    context.font = '400 32px "Noto Sans SC", sans-serif';
    lines.forEach((line, index) => context.fillText(line, 96, 730 + index * 58));

    context.strokeStyle = 'rgba(230,59,48,0.35)';
    context.setLineDash([10, 12]);
    context.beginPath();
    context.moveTo(96, 980);
    context.lineTo(984, 980);
    context.stroke();
    context.setLineDash([]);

    context.fillStyle = '#E63B30';
    context.font = '700 28px "Noto Sans SC", sans-serif';
    context.fillText('V1  →  反馈  →  V2', 96, 1060);

    context.fillStyle = '#1A1514';
    context.font = '600 30px "Noto Sans SC", sans-serif';
    context.fillText(projectTitle.slice(0, 22), 96, 1165);

    context.fillStyle = '#8C7A74';
    context.font = '400 24px "Noto Sans SC", sans-serif';
    context.fillText('#AdventureX  #BuildInPublic  #经验共创', 96, 1285);

    const link = document.createElement('a');
    link.download = 'experience-card-build-log.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const bindNote = () => {
    if (!noteUrl.trim()) return;
    try {
      localStorage.setItem(
        'experience-card-xhs-note',
        JSON.stringify({ projectTitle, noteUrl: noteUrl.trim(), boundAt: new Date().toISOString() })
      );
    } catch {
      // The prototype still provides visible success feedback if storage is unavailable.
    }
    setBound(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-[#1A1514]/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[101] overflow-y-auto px-4 py-6 md:py-10">
        <div className="mx-auto w-full max-w-5xl rounded-[28px] border border-black/5 bg-[#FAF7F3] shadow-2xl">
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-4 md:px-7">
            <div>
              <span className="text-[10px] font-semibold tracking-[0.16em] text-[#E63B30]">
                BUILD IN PUBLIC
              </span>
              <h2 className="mt-1 font-heading text-lg font-bold text-[#1A1514]">生成小红书构建记录</h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-black/10 text-[#6B5B55] transition-colors hover:bg-white"
              aria-label="关闭小红书发布助手"
            >
              <i className="ri-close-line text-lg" />
            </button>
          </div>

          <div className="grid gap-6 p-5 md:grid-cols-[0.78fr_1.22fr] md:p-7">
            <div className="mx-auto w-full max-w-[340px]">
              <div className="aspect-[3/4] overflow-hidden rounded-2xl border border-black/10 bg-[#F7F1EB] p-5 shadow-[0_18px_50px_rgba(78,44,37,0.12)]">
                <div className="flex items-center justify-between text-[9px] font-semibold tracking-[0.12em] text-[#E63B30]">
                  <span>EXPERIENCE CARD</span>
                  <span>DAY 03</span>
                </div>
                <div className="mt-12">
                  <p className="font-heading text-3xl font-black leading-[0.98] tracking-[-0.05em] text-[#1A1514]">
                    公开做项目的
                    <br />
                    <span className="text-[#E63B30]">第 3 天</span>
                  </p>
                  <div className="my-6 h-2 w-16 bg-[#E63B30]" />
                  <p className="font-heading text-lg font-bold leading-tight text-[#1A1514]">
                    我们终于找到了
                    <br />
                    真正的问题
                  </p>
                </div>
                <div className="mt-10 border-t border-dashed border-[#E63B30]/30 pt-5">
                  <p className="text-xs leading-relaxed text-[#6B5B55]">
                    不是让经验显得更厉害，而是让另一个人能够判断，这一步是否适合现在的自己。
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between text-[9px] text-[#8C7A74]">
                  <span>V1 → 反馈 → V2</span>
                  <span>#BuildInPublic</span>
                </div>
              </div>
              <button
                onClick={downloadPoster}
                className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-black/10 py-2.5 text-xs font-semibold text-[#1A1514] transition-colors hover:bg-white"
              >
                <i className="ri-download-2-line" />
                下载 3:4 构建海报
              </button>
            </div>

            <div>
              <div className="mb-5">
                <span className="text-[10px] font-semibold text-[#E63B30]">01 · 选择一个标题</span>
                <div className="mt-2 space-y-2">
                  {titleOptions.map((title, index) => (
                    <button
                      key={title}
                      onClick={() => setSelectedTitle(index)}
                      className={`w-full cursor-pointer rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                        selectedTitle === index
                          ? 'border-[#E63B30]/30 bg-[#E63B30]/5 text-[#1A1514]'
                          : 'border-black/5 bg-white/60 text-[#6B5B55] hover:border-black/10'
                      }`}
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#E63B30]">02 · 构建记录正文</span>
                  <span className="text-[10px] text-[#8C7A74]">已自动隐藏核心实现细节</span>
                </div>
                <div
                  className="max-h-52 overflow-y-auto rounded-xl border border-black/5 bg-white/70 p-4 text-xs leading-6 text-[#6B5B55] whitespace-pre-line"
                  aria-live="polite"
                >
                  {visiblePostBody}
                  {isComposing && <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-[#E63B30] align-[-1px]" />}
                </div>
                <button
                  onClick={copyPost}
                  disabled={isComposing}
                  className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#E63B30] py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#C72D24] disabled:cursor-wait disabled:opacity-55"
                >
                  <i className={copied ? 'ri-check-line' : 'ri-file-copy-line'} />
                  {isComposing ? '正在整理公开构建记录…' : copied ? '文案已复制' : '复制标题和正文'}
                </button>
              </div>

              <div className="rounded-2xl border border-[#E63B30]/10 bg-[#E63B30]/[0.035] p-4">
                <span className="text-[10px] font-semibold text-[#E63B30]">03 · 发布后绑定笔记</span>
                <p className="mt-1 text-xs leading-relaxed text-[#8C7A74]">
                  发布到小红书后粘贴笔记链接，它会成为这次项目的公开构建证据。
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={noteUrl}
                    onChange={(event) => setNoteUrl(event.target.value)}
                    placeholder="粘贴小红书笔记链接"
                    className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs text-[#1A1514] outline-none focus:border-[#E63B30]/40"
                  />
                  <button
                    onClick={bindNote}
                    disabled={!noteUrl.trim()}
                    className="cursor-pointer rounded-full border border-[#E63B30]/20 px-5 py-2.5 text-xs font-semibold text-[#E63B30] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {bound ? '已绑定' : '绑定记录'}
                  </button>
                </div>
                {bound && (
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-[#B8955B]">
                    <i className="ri-check-line" />
                    已加入 Build in Public 时间线
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
