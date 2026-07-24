import { useEffect, useMemo, useState } from 'react';

export interface ShareableExperienceCard {
  id: string;
  title: string;
  oneLiner: string;
  suitableFor: string;
  result: string;
  version?: string;
}

type ShareTab = 'image' | 'caption' | 'link';

interface SharePanelProps {
  card: ShareableExperienceCard;
  isOpen: boolean;
  onClose: () => void;
}

function wrapCanvasText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = '';

  for (const character of text) {
    const next = line + character;
    if (context.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = character;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function clipText(text: string, length: number) {
  return text.length > length ? `${text.slice(0, length)}…` : text;
}

export default function SharePanel({ card, isOpen, onClose }: SharePanelProps) {
  const [activeTab, setActiveTab] = useState<ShareTab>('image');
  const [copied, setCopied] = useState('');
  const publicUrl = useMemo(() => `${window.location.origin}/card/${card.id}`, [card.id]);
  const [caption, setCaption] = useState(
    `我把一次真实经历，整理成了一张 Experience Card。\n\n「${card.title}」\n适合：${card.suitableFor || '正在经历相似问题的人'}\n\n它不是标准答案，而是一次可以带着自己限制去试的经验。\n\n如果你也在经历类似的问题，可以打开这张卡，带着你的情境试一次：\n${publicUrl}\n\n#AdventureX #BuildInPublic #ExperienceCard`
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(''), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  if (!isOpen) return null;

  const copy = async (value: string, label: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      setCopied(label);
    } catch {
      setCopied('复制失败，请手动复制');
    }
  };

  const downloadShareImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 1200;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.fillStyle = '#fbf7f2';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#e63b30';
    context.fillRect(0, 0, canvas.width, 250);
    context.fillStyle = 'rgba(255,255,255,0.14)';
    context.beginPath();
    context.arc(760, 85, 230, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = '#ffffff';
    context.font = '600 28px Inter, sans-serif';
    context.fillText('EXPERIENCE CARD', 72, 92);
    context.font = '400 22px Inter, sans-serif';
    context.fillText('把一次真实经历，留给下一个需要它的人', 72, 135);

    context.fillStyle = '#1a1514';
    context.font = '700 58px "Noto Sans SC", sans-serif';
    let y = 360;
    wrapCanvasText(context, clipText(card.title, 38), 740).slice(0, 3).forEach((line) => {
      context.fillText(line, 72, y);
      y += 78;
    });

    context.fillStyle = '#e63b30';
    context.fillRect(72, y + 12, 64, 5);
    y += 80;
    context.fillStyle = '#645b58';
    context.font = '400 30px "Noto Sans SC", sans-serif';
    wrapCanvasText(context, clipText(card.oneLiner, 76), 740).slice(0, 3).forEach((line) => {
      context.fillText(line, 72, y);
      y += 46;
    });

    y += 55;
    context.fillStyle = '#f3e4df';
    context.fillRect(72, y, 756, 160);
    context.fillStyle = '#a6322a';
    context.font = '600 22px Inter, "Noto Sans SC", sans-serif';
    context.fillText('适合带着这些情况来试', 100, y + 50);
    context.fillStyle = '#3a302d';
    context.font = '400 28px "Noto Sans SC", sans-serif';
    wrapCanvasText(context, clipText(card.suitableFor || '正在经历相似问题的人', 48), 680).slice(0, 2).forEach((line, index) => {
      context.fillText(line, 100, y + 95 + index * 38);
    });

    context.strokeStyle = '#d8cfca';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(72, 1080);
    context.lineTo(828, 1080);
    context.stroke();
    context.fillStyle = '#736966';
    context.font = '400 21px Inter, "Noto Sans SC", sans-serif';
    context.fillText('打开链接，带着你的情境试一次', 72, 1132);
    context.fillStyle = '#e63b30';
    context.font = '600 21px Inter, sans-serif';
    context.fillText('Experience Card  ·  v1', 575, 1132);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `experience-card-${card.id.slice(0, 8)}.png`;
      anchor.click();
      URL.revokeObjectURL(url);
      setCopied('分享图已下载');
    }, 'image/png');
  };

  const tabs: { id: ShareTab; label: string }[] = [
    { id: 'image', label: '分享图' },
    { id: 'caption', label: '笔记文案' },
    { id: 'link', label: '回流链接' },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/45 px-0 sm:items-center sm:px-4" onMouseDown={onClose}>
      <section
        className="w-full max-w-3xl rounded-t-[28px] border border-theme-border bg-theme-bg-card p-5 shadow-2xl sm:rounded-2xl sm:p-7"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="分享经验名片"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <span className="chapter-label">分享经验</span>
            <h2 className="mt-2 font-heading text-xl font-bold text-theme-text">让这段经验继续帮助别人</h2>
            <p className="mt-1 text-sm text-theme-text-secondary">先生成内容资产，再由你决定在哪里分享。</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-theme-border text-theme-text-secondary hover:bg-theme-accent-subtle" aria-label="关闭分享面板">
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <div className="mb-5 flex gap-1 rounded-full bg-theme-bg-card-alt p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-full px-3 py-2 text-xs font-medium transition-colors ${activeTab === tab.id ? 'bg-theme-accent text-white' : 'text-theme-text-secondary hover:text-theme-text'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'image' && (
          <div className="grid gap-5 md:grid-cols-[210px_1fr] md:items-center">
            <div className="aspect-[3/4] rounded-xl bg-theme-accent p-5 text-white shadow-lg">
              <p className="text-[9px] font-semibold tracking-[0.16em]">EXPERIENCE CARD</p>
              <div className="mt-7 h-px bg-white/30" />
              <h3 className="mt-5 text-lg font-bold leading-snug">{card.title}</h3>
              <p className="mt-4 text-xs leading-relaxed text-white/85">{card.oneLiner}</p>
              <div className="mt-8 rounded-lg bg-white/15 p-3 text-[10px] leading-relaxed">
                <span className="mb-1 block text-white/65">适合带着这些情况来试</span>
                {card.suitableFor || '正在经历相似问题的人'}
              </div>
              <p className="mt-8 text-[9px] text-white/70">打开链接，带着你的情境试一次</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-theme-text">3:4 笔记分享图</h3>
              <p className="mt-2 text-sm leading-relaxed text-theme-text-secondary">这是一个可下载的 PNG，不会替你登录、发布或读取小红书账号。你可以自己决定是否把它用作公开构建记录。</p>
              <button onClick={downloadShareImage} className="mt-5 inline-flex items-center gap-2 rounded-full bg-theme-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-theme-accent-hover">
                <i className="ri-download-2-line" />下载分享图
              </button>
            </div>
          </div>
        )}

        {activeTab === 'caption' && (
          <div>
            <label className="mb-2 block text-xs font-semibold text-theme-text">可编辑的 Build in Public 文案</label>
            <textarea value={caption} onChange={(event) => setCaption(event.target.value)} className="h-56 w-full resize-none rounded-xl border border-theme-border bg-theme-bg-card-alt p-4 text-sm leading-relaxed text-theme-text outline-none focus:border-theme-accent" />
            <button onClick={() => copy(caption, '笔记文案已复制')} className="mt-4 inline-flex items-center gap-2 rounded-full border border-theme-border px-5 py-2.5 text-sm font-semibold text-theme-text hover:bg-theme-accent-subtle">
              <i className="ri-file-copy-line" />复制文案
            </button>
          </div>
        )}

        {activeTab === 'link' && (
          <div className="rounded-xl border border-theme-border bg-theme-bg-card-alt p-5">
            <span className="chapter-label">让试用者回到这里</span>
            <p className="mt-3 text-sm leading-relaxed text-theme-text-secondary">别人打开链接后，会先看到这张经验卡，再决定是否带着自己的限制进入「在我的情境中试试」。</p>
            <div className="mt-5 flex items-center gap-2 rounded-lg border border-theme-border bg-theme-bg-card px-3 py-2.5">
              <span className="min-w-0 flex-1 truncate text-xs text-theme-text-secondary">{publicUrl}</span>
              <button onClick={() => copy(publicUrl, '链接已复制')} className="shrink-0 text-xs font-semibold text-theme-accent">复制链接</button>
            </div>
          </div>
        )}

        {copied && <p className="mt-4 text-center text-xs text-theme-accent">{copied}</p>}
      </section>
    </div>
  );
}
