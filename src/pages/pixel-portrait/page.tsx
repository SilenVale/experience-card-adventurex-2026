import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import qrcode from 'qrcode-generator';
import Navbar from '@/components/feature/Navbar';
import LoginModal from '@/components/feature/LoginModal';
import { useAuth } from '@/hooks/useAuth';
import { listMyExperienceCards, type ExperienceCardRecord } from '@/lib/experienceCards';
import { getMyProfile, type ProfileRecord } from '@/lib/profiles';
import { savePixelProfile } from '@/lib/pixelProfile';
import './pixel-portrait.css';

const OFFICIAL_WEBSITE_URL = 'https://experience-card-adventurex-2026.pages.dev/';
const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const PALETTE = ['#090909', '#5c5a58', '#b5b2ad', '#ffffff'];

type Phase = 'capture' | 'keywords' | 'result';
type CanvasSource = HTMLCanvasElement | HTMLVideoElement | HTMLImageElement | ImageBitmap;

type SegmentationResults = {
  image: CanvasSource;
  segmentationMask: CanvasSource;
};

type SegmenterInstance = {
  setOptions: (options: { modelSelection: number; selfieMode: boolean }) => void;
  onResults: (listener: (results: SegmentationResults) => void) => void;
  initialize: () => Promise<void>;
  send: (input: { image: HTMLVideoElement }) => Promise<void>;
  close: () => Promise<void>;
};

type SegmenterConstructor = new (config: { locateFile: (file: string) => string }) => SegmenterInstance;

declare global {
  interface Window {
    SelfieSegmentation?: SegmenterConstructor;
  }
}

interface PixelSettings {
  pixelSize: number;
  contrast: number;
  dither: number;
  accentDensity: number;
  toneCount: number;
  flip: boolean;
}

function parseKeywords(value: string) {
  return value
    .split(/[，,、\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function drawCover(
  source: CanvasSource,
  target: CanvasRenderingContext2D,
  width: number,
  height: number,
  flipped = false,
) {
  const dimensions = source as CanvasSource & {
    videoWidth?: number;
    videoHeight?: number;
    width?: number;
    height?: number;
  };
  const sourceWidth = dimensions.videoWidth || dimensions.width || 0;
  const sourceHeight = dimensions.videoHeight || dimensions.height || 0;
  if (!sourceWidth || !sourceHeight) return;

  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;

  target.save();
  target.fillStyle = '#fff';
  target.fillRect(0, 0, width, height);
  if (flipped) {
    target.translate(width, 0);
    target.scale(-1, 1);
    target.drawImage(source, width - x - drawWidth, y, drawWidth, drawHeight);
  } else {
    target.drawImage(source, x, y, drawWidth, drawHeight);
  }
  target.restore();
}

function drawPixelPortrait(
  source: HTMLCanvasElement,
  output: HTMLCanvasElement,
  settings: PixelSettings,
  now: number,
) {
  const outputSize = 720;
  const smallSize = Math.max(44, Math.min(280, Math.floor(outputSize / settings.pixelSize)));
  const sample = document.createElement('canvas');
  const pixel = document.createElement('canvas');
  sample.width = sample.height = smallSize;
  pixel.width = pixel.height = smallSize;
  const sampleContext = sample.getContext('2d', { willReadFrequently: true });
  const pixelContext = pixel.getContext('2d');
  const outputContext = output.getContext('2d');
  if (!sampleContext || !pixelContext || !outputContext) return;

  drawCover(source, sampleContext, smallSize, smallSize, settings.flip);
  const image = sampleContext.getImageData(0, 0, smallSize, smallSize);
  const contrast = settings.contrast / 100;
  const dither = settings.dither / 100;
  const step = 3 / (settings.toneCount - 1);

  pixelContext.fillStyle = '#fff';
  pixelContext.fillRect(0, 0, smallSize, smallSize);
  for (let y = 0; y < smallSize; y += 1) {
    for (let x = 0; x < smallSize; x += 1) {
      const index = (y * smallSize + x) * 4;
      const luma = (
        image.data[index] * 0.2126
        + image.data[index + 1] * 0.7152
        + image.data[index + 2] * 0.0722
      ) / 255;
      const normalized = Math.max(0, Math.min(1, (luma - 0.5) * contrast + 0.5));
      const noise = (BAYER_4[y % 4][x % 4] / 15 - 0.5) * 0.34 * dither;
      const level = Math.max(0, Math.min(settings.toneCount - 1, Math.floor((normalized + noise) * settings.toneCount)));
      const paletteIndex = Math.round(level * step);
      pixelContext.fillStyle = PALETTE[paletteIndex];
      pixelContext.fillRect(x, y, 1, 1);

      const particleNoise = ((x * 71 + y * 193 + x * y * 17) % 997) / 997;
      if (settings.accentDensity && paletteIndex > 0 && paletteIndex < 3 && particleNoise < settings.accentDensity / 1800) {
        const driftX = Math.round(Math.sin(now * 0.0012 + y * 0.31) * 1.4);
        const driftY = Math.round(Math.cos(now * 0.001 + x * 0.27) * 1.4);
        pixelContext.fillStyle = '#ed4232';
        pixelContext.fillRect(
          Math.max(0, Math.min(smallSize - 1, x + driftX)),
          Math.max(0, Math.min(smallSize - 1, y + driftY)),
          1,
          1,
        );
      }
    }
  }

  output.width = output.height = outputSize;
  outputContext.imageSmoothingEnabled = false;
  outputContext.fillStyle = '#fff';
  outputContext.fillRect(0, 0, outputSize, outputSize);
  outputContext.drawImage(pixel, 0, 0, outputSize, outputSize);
}

function drawQr(canvas: HTMLCanvasElement, value: string, size: number) {
  const qr = qrcode(0, 'M');
  qr.addData(value);
  qr.make();
  const count = qr.getModuleCount();
  const cell = size / (count + 8);
  const context = canvas.getContext('2d');
  if (!context) return;
  canvas.width = canvas.height = size;
  context.fillStyle = '#fff';
  context.fillRect(0, 0, size, size);
  context.fillStyle = '#080808';
  for (let row = 0; row < count; row += 1) {
    for (let column = 0; column < count; column += 1) {
      if (qr.isDark(row, column)) {
        context.fillRect(
          (column + 4) * cell,
          (row + 4) * cell,
          Math.ceil(cell),
          Math.ceil(cell),
        );
      }
    }
  }
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
) {
  const lines: string[] = [];
  let current = '';
  Array.from(text).forEach((character) => {
    if (context.measureText(current + character).width > maxWidth && current) {
      lines.push(current);
      current = character;
    } else {
      current += character;
    }
  });
  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

function downloadCanvas(canvas: HTMLCanvasElement, fileName: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 500);
  }, 'image/png');
}

async function loadSelfieSegmentation() {
  if (window.SelfieSegmentation) return window.SelfieSegmentation;
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-pixel-mediapipe]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('MediaPipe script failed')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = '/mediapipe/selfie_segmentation/selfie_segmentation.js';
    script.async = true;
    script.dataset.pixelMediapipe = 'true';
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('MediaPipe script failed')), { once: true });
    document.head.appendChild(script);
  });
  if (!window.SelfieSegmentation) throw new Error('MediaPipe model unavailable');
  return window.SelfieSegmentation;
}

export default function PixelPortraitPage() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const portraitCanvasRef = useRef<HTMLCanvasElement>(null);
  const cardCanvasRef = useRef<HTMLCanvasElement>(null);
  const officialQrRef = useRef<HTMLCanvasElement>(null);
  const downloadQrRef = useRef<HTMLCanvasElement>(null);
  const compositeRef = useRef(document.createElement('canvas'));
  const cutoutRef = useRef(document.createElement('canvas'));
  const segmenterRef = useRef<SegmenterInstance | null>(null);
  const autoStartCameraRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef(0);
  const segmentingRef = useRef(false);
  const lastSegmentRef = useRef(0);
  const segmentIntervalRef = useRef(100);
  const settingsRef = useRef<PixelSettings>({
    pixelSize: 7,
    contrast: 122,
    dither: 72,
    accentDensity: 8,
    toneCount: 4,
    flip: true,
  });
  const avatarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [cards, setCards] = useState<ExperienceCardRecord[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsLoadError, setCardsLoadError] = useState(false);
  const [phase, setPhase] = useState<Phase>('capture');
  const [running, setRunning] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState('');
  const [status, setStatus] = useState('等待开启摄像头');
  const [error, setError] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [keywordsText, setKeywordsText] = useState('公开构建, 真实经验, AdventureX');
  const [cardTitle, setCardTitle] = useState('');
  const [cardSummary, setCardSummary] = useState('');
  const [avatarDataUrl, setAvatarDataUrl] = useState('');
  const [cardDataUrl, setCardDataUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedToProfile, setSavedToProfile] = useState(false);
  const [settings, setSettings] = useState<PixelSettings>(settingsRef.current);
  const [frameColor, setFrameColor] = useState('#f6f3ed');

  const latestCard = useMemo(() => {
    const usableCards = cards.filter((card) => card.title?.trim());
    // listMyExperienceCards is ordered by updated_at descending; use the newest
    // usable card so a newly saved draft is not silently replaced by an older
    // published card.
    return usableCards[0] ?? null;
  }, [cards]);
  const displayName = profile?.display_name?.trim() || user?.email?.split('@')[0] || '经验分享者';
  const keywords = useMemo(() => parseKeywords(keywordsText), [keywordsText]);

  const profileContent = useMemo(() => ({
    name: displayName,
    role: latestCard ? 'Experience Card 经验贡献者' : 'Experience Card 共创者',
    title: latestCard?.title.trim() || '',
    summary: latestCard?.one_liner?.trim() || latestCard?.result?.trim() || '',
    slogan: '让经验成为彼此的下一步',
  }), [displayName, latestCard]);

  const refreshCameras = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const cameraDevices = (await navigator.mediaDevices.enumerateDevices())
        .filter((device) => device.kind === 'videoinput');
      setDevices(cameraDevices);
      setDeviceId((current) => current || cameraDevices[0]?.deviceId || '');
    } catch {
      setStatus('无法读取摄像头列表');
      setError(true);
    }
  }, []);

  const stopCamera = useCallback(async (preserveStatus = false) => {
    window.cancelAnimationFrame(animationRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setRunning(false);
    if (!preserveStatus) setStatus('镜头已关闭');
  }, []);

  const renderLoop = useCallback((now: number) => {
    const video = videoRef.current;
    const segmenter = segmenterRef.current;
    if (!video || !segmenter || !streamRef.current) return;

    if (!segmentingRef.current && video.videoWidth && now - lastSegmentRef.current > segmentIntervalRef.current) {
      lastSegmentRef.current = now;
      segmentingRef.current = true;
      const startedAt = performance.now();
      segmenter.send({ image: video })
        .catch(() => undefined)
        .finally(() => {
          const elapsed = performance.now() - startedAt;
          // Avoid queueing another expensive MediaPipe pass while a phone is busy.
          segmentIntervalRef.current = Math.max(100, Math.min(180, elapsed * 1.25));
          segmentingRef.current = false;
        });
    }
    animationRef.current = window.requestAnimationFrame(renderLoop);
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('当前浏览器不支持摄像头');
      setError(true);
      return;
    }

    setError(false);
    setStatus('正在开启镜头与本地抠图…');
    try {
      await stopCamera();
      let segmenter = segmenterRef.current;
      if (!segmenter) {
        const Segmenter = await loadSelfieSegmentation();
        segmenter = new Segmenter({
          locateFile: (file) => `/mediapipe/selfie_segmentation/${file}`,
        });
        segmenter.setOptions({ modelSelection: 1, selfieMode: false });
        segmenter.onResults((results: SegmentationResults) => {
          const size = 256;
          const composite = compositeRef.current;
          const cutout = cutoutRef.current;
          composite.width = composite.height = size;
          cutout.width = cutout.height = size;
          const compositeContext = composite.getContext('2d');
          const cutoutContext = cutout.getContext('2d');
          const portrait = portraitCanvasRef.current;
          if (!compositeContext || !cutoutContext || !portrait) return;

          cutoutContext.clearRect(0, 0, size, size);
          drawCover(results.image, cutoutContext, size, size);
          cutoutContext.globalCompositeOperation = 'destination-in';
          drawCover(results.segmentationMask, cutoutContext, size, size);
          cutoutContext.globalCompositeOperation = 'source-over';
          compositeContext.fillStyle = '#fff';
          compositeContext.fillRect(0, 0, size, size);
          compositeContext.drawImage(cutout, 0, 0, size, size);
          drawPixelPortrait(composite, portrait, settingsRef.current, Date.now());
        });
        await segmenter.initialize();
        segmenterRef.current = segmenter;
      }

      const constraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 1280 } }
          : { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setRunning(true);
      setStatus('人物已抠出，背景保持白色；画面仅在本地处理');
      await refreshCameras();
      animationRef.current = window.requestAnimationFrame(renderLoop);
    } catch (cameraError) {
      const name = cameraError instanceof DOMException ? cameraError.name : '';
      const message = name === 'NotAllowedError'
        ? '请允许浏览器使用摄像头'
        : name === 'NotReadableError'
          ? '摄像头正被其他标签或应用占用'
          : name === 'NotFoundError'
            ? '系统没有可用摄像头'
            : '摄像头或抠图模型启动失败，请刷新后重试';
      setStatus(message);
      setError(true);
    }
  }, [deviceId, refreshCameras, renderLoop, stopCamera]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    refreshCameras();
    return () => {
      window.cancelAnimationFrame(animationRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      segmenterRef.current?.close().catch(() => undefined);
      segmenterRef.current = null;
    };
  }, [refreshCameras]);

  useEffect(() => {
    if (phase !== 'capture' || !autoStartCameraRef.current) return;
    autoStartCameraRef.current = false;
    void startCamera();
  }, [phase, startCamera]);

  useEffect(() => {
    let cancelled = false;
    setCardsLoading(true);
    setCardsLoadError(false);
    setCards([]);
    if (!user) {
      setProfile(null);
      setCardsLoading(false);
      return () => { cancelled = true; };
    }

    Promise.all([getMyProfile(user.id), listMyExperienceCards(user.id)])
      .then(([profileData, cardData]) => {
        if (cancelled) return;
        setProfile(profileData);
        setCards(cardData);
        if (profileData?.pixel_keywords?.length) {
          setKeywordsText(profileData.pixel_keywords.join(', '));
        }
      })
      .catch(() => {
        if (cancelled) return;
        setCardsLoadError(true);
        setStatus('无法读取你的最新经验卡，请刷新后重试');
        setError(true);
      })
      .finally(() => {
        if (!cancelled) setCardsLoading(false);
      });

    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (phase !== 'keywords' || !latestCard) return;
    setCardTitle((current) => current || profileContent.title);
    setCardSummary((current) => current || profileContent.summary);
  }, [latestCard, phase, profileContent.title, profileContent.summary]);

  const capture = () => {
    const portrait = portraitCanvasRef.current;
    if (!running || !portrait) {
      setStatus('请先开启摄像头再截图');
      setError(true);
      return;
    }
    const avatar = document.createElement('canvas');
    avatar.width = avatar.height = portrait.width;
    avatar.getContext('2d')?.drawImage(portrait, 0, 0);
    avatarCanvasRef.current = avatar;
    setAvatarDataUrl(avatar.toDataURL('image/png'));
    setCardTitle(profileContent.title);
    setCardSummary(profileContent.summary);
    setPhase('keywords');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const drawExperienceCard = useCallback((targetDownloadUrl: string) => {
    const canvas = cardCanvasRef.current;
    const avatar = avatarCanvasRef.current;
    if (!canvas || !avatar) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const width = 1600;
    const height = 900;
    canvas.width = width;
    canvas.height = height;
    context.fillStyle = frameColor;
    context.fillRect(0, 0, width, height);
    context.fillStyle = '#0a0a0c';
    context.fillRect(0, 0, width, 167);
    context.strokeStyle = '#ee3029';
    context.lineWidth = 13;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(102, 96);
    context.quadraticCurveTo(114, 111, 129, 101);
    context.lineTo(135, 77);
    context.stroke();
    context.fillStyle = '#f1eee8';
    context.font = '700 28px sans-serif';
    context.fillText('EXPERIENCE CARD / PIXEL PORTRAIT', 177, 99);
    context.fillStyle = frameColor;
    context.fillRect(64, 212, 620, 620);
    context.strokeStyle = frameColor === '#0b0b0d' ? '#f6f3ed' : '#242426';
    context.lineWidth = 8;
    context.strokeRect(64, 212, 620, 620);
    context.imageSmoothingEnabled = false;
    context.drawImage(avatar, 64, 212, 620, 620);
    context.fillStyle = '#ee3029';
    context.font = '700 25px sans-serif';
    context.fillText('一张真实经验的现场头像', 740, 248);
    context.fillStyle = '#0a0a0c';
    context.font = '800 64px sans-serif';
    wrapCanvasText(context, cardTitle, 700, 3)
      .forEach((line, index) => context.fillText(line, 740, 340 + index * 78));
    context.fillStyle = '#765755';
    context.font = '400 28px sans-serif';
    context.fillText(profileContent.name, 740, 566);
    context.fillText(profileContent.role, 740, 604);
    context.fillStyle = '#0a0a0c';
    context.font = '600 27px sans-serif';
    context.fillText(profileContent.slogan, 740, 710);
    context.fillStyle = '#ee3029';
    context.fillRect(734, 744, 715, 4);
    context.fillStyle = '#8a8580';
    context.font = '500 21px sans-serif';
    context.fillText(keywords.map((keyword) => `#${keyword}`).join('  '), 740, 792);

    const qrCanvas = document.createElement('canvas');
    drawQr(qrCanvas, OFFICIAL_WEBSITE_URL, 116);
    context.drawImage(qrCanvas, 1470, 720, 92, 92);
    context.fillStyle = '#0a0a0c';
    context.font = '500 23px sans-serif';
    context.textAlign = 'right';
    context.fillText('扫码打开 Experience Card', 1438, 792);
    context.textAlign = 'start';

    if (officialQrRef.current) drawQr(officialQrRef.current, OFFICIAL_WEBSITE_URL, 132);
    if (downloadQrRef.current) drawQr(downloadQrRef.current, targetDownloadUrl, 132);
  }, [cardTitle, frameColor, keywords, profileContent]);

  const generateCard = async () => {
    if (!user || !session?.access_token) {
      setLoginOpen(true);
      return;
    }
    if (!keywords.length || !avatarCanvasRef.current) {
      setStatus('请至少填写一个关键词');
      setError(true);
      return;
    }
    if (cardsLoading) {
      setStatus('正在读取你的最新经验卡，请稍候');
      setError(false);
      return;
    }
    if (cardsLoadError || !latestCard || !cardTitle.trim() || !cardSummary.trim()) {
      setStatus(cardsLoadError ? '最新经验卡读取失败，请刷新后重试' : '请先创建并保存一张经验卡');
      setError(true);
      return;
    }

    setSaving(true);
    setError(false);
    setSavedToProfile(false);
    setStatus('正在生成并保存你的像素经验名片…');
    const cardId = user.id.replaceAll('-', '');
    // The QR points to a download response so a phone can save the PNG directly.
    const nextDownloadUrl = `${OFFICIAL_WEBSITE_URL.replace(/\/$/, '')}/download/${cardId}?download=1`;
    setDownloadUrl(nextDownloadUrl);
    drawExperienceCard(nextDownloadUrl);

    try {
      const cardCanvas = cardCanvasRef.current;
      if (!cardCanvas) throw new Error('经验卡画布不可用');
      const nextCardDataUrl = cardCanvas.toDataURL('image/png');
      setCardDataUrl(nextCardDataUrl);
      const saveResult = await savePixelProfile({
        userId: user.id,
        accessToken: session.access_token,
        cardId,
        avatarDataUrl,
        cardDataUrl: nextCardDataUrl,
        keywords,
      });
      setStatus(saveResult.removedPrevious
        ? '已替换“我的名片”中的旧头像和旧成片，可以下载或重新生成'
        : '新头像和成片已保存，但旧文件清理失败；当前名片已使用新版本');
      setSavedToProfile(true);
      setPhase('result');
    } catch (saveError) {
      setStatus(saveError instanceof Error ? `成片已生成，但云端保存失败：${saveError.message}` : '云端保存失败');
      setError(true);
      setPhase('result');
    } finally {
      setSaving(false);
      await stopCamera(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const retake = () => {
    setAvatarDataUrl('');
    setCardDataUrl('');
    setDownloadUrl('');
    setSavedToProfile(false);
    setCardTitle('');
    setCardSummary('');
    autoStartCameraRef.current = true;
    setPhase('capture');
    setStatus('正在重新开启镜头…');
    setError(false);
  };

  const copyXiaohongshuText = async () => {
    const text = `把今天做成了一张像素经验名片。\n\n${cardTitle}\n\n${cardSummary}\n\n${keywords.map((keyword) => `#${keyword}`).join(' ')} #ExperienceCard #BuildInPublic\n\n${downloadUrl || OFFICIAL_WEBSITE_URL}`;
    try {
      await navigator.clipboard.writeText(text);
      setStatus('小红书发布文案已复制');
      setError(false);
    } catch {
      setStatus('复制失败，请手动复制文案');
      setError(true);
    }
  };

  useEffect(() => {
    if (phase !== 'result') return;
    if (officialQrRef.current) drawQr(officialQrRef.current, OFFICIAL_WEBSITE_URL, 132);
    if (downloadQrRef.current && downloadUrl) drawQr(downloadQrRef.current, downloadUrl, 132);
  }, [downloadUrl, phase]);

  return (
    <div className="pixel-portrait-page">
      <Navbar />
      <main className="pixel-shell">
        <canvas ref={cardCanvasRef} className="pixel-hidden-card-canvas" aria-hidden="true" />
        {phase === 'capture' && (
          <div className="pixel-workspace">
            <section className="pixel-stage" aria-labelledby="pixel-title">
              <div className="pixel-topline">
                <span>EXPERIENCE CARD</span>
                <span>PIXEL PORTRAIT / 01</span>
              </div>
              <div className="pixel-canvas-wrap" style={{ '--pixel-frame-color': frameColor } as React.CSSProperties}>
                <canvas ref={portraitCanvasRef} aria-label="实时像素人像预览" />
                <video ref={videoRef} autoPlay muted playsInline aria-hidden="true" />
              </div>
              <p className="pixel-footnote">LOCAL CAMERA · NO RAW PHOTO UPLOAD · 本地处理原始画面</p>
            </section>

            <aside className="pixel-controls" aria-label="像素人像工具箱">
              <header className="pixel-studio-header">
                <div className="pixel-brand-mark" aria-hidden="true"><span /><span /><span /></div>
                <div>
                  <p className="pixel-eyebrow">EXPERIENCE CARD</p>
                  <h1 id="pixel-title">像素档案室</h1>
                </div>
                <button
                  type="button"
                  className="pixel-button pixel-capture pixel-header-capture"
                  onClick={capture}
                  disabled={!running}
                >
                  截图，制作经验名片 →
                </button>
              </header>

              <section className="pixel-tool-section">
                <div className="pixel-section-label"><span>01</span><h2>摄像头</h2></div>
                <label htmlFor="pixel-camera-select">选择设备</label>
                <div className="pixel-camera-row">
                  <select id="pixel-camera-select" value={deviceId} onChange={(event) => setDeviceId(event.target.value)}>
                    {!devices.length && <option value="">默认前置摄像头</option>}
                    {devices.map((device, index) => (
                      <option key={device.deviceId || index} value={device.deviceId}>
                        {device.label || `摄像头 ${index + 1}`}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={refreshCameras} aria-label="刷新摄像头列表">↻</button>
                </div>
                <div className="pixel-button-row">
                  <button type="button" className="pixel-button pixel-primary" onClick={startCamera} disabled={running}>开启镜头</button>
                  <button type="button" className="pixel-button pixel-secondary" onClick={() => void stopCamera()} disabled={!running}>关闭</button>
                </div>
              </section>

              <section className="pixel-tool-section">
                <div className="pixel-section-label"><span>02</span><h2>效果工具篮</h2></div>
                <PixelRange label="像素颗粒" value={settings.pixelSize} min={3} max={18} suffix=" px" onChange={(value) => setSettings((current) => ({ ...current, pixelSize: value }))} />
                <PixelRange label="画面对比" value={settings.contrast} min={70} max={180} suffix="%" onChange={(value) => setSettings((current) => ({ ...current, contrast: value }))} />
                <PixelRange label="像素抖动" value={settings.dither} min={0} max={100} suffix="%" onChange={(value) => setSettings((current) => ({ ...current, dither: value }))} />
                <PixelRange label="红色记忆颗粒" value={settings.accentDensity} min={0} max={30} onChange={(value) => setSettings((current) => ({ ...current, accentDensity: value }))} />
                <label htmlFor="pixel-tone-count">灰阶层次</label>
                <select id="pixel-tone-count" value={settings.toneCount} onChange={(event) => setSettings((current) => ({ ...current, toneCount: Number(event.target.value) }))}>
                  <option value={2}>2 阶 / 极简黑白</option>
                  <option value={3}>3 阶 / 标准</option>
                  <option value={4}>4 阶 / 丰富细节</option>
                </select>
                <label className="pixel-switch" htmlFor="pixel-flip">
                  <span>镜像预览</span>
                  <input id="pixel-flip" type="checkbox" checked={settings.flip} onChange={(event) => setSettings((current) => ({ ...current, flip: event.target.checked }))} />
                </label>
                <label htmlFor="pixel-frame-color">头像边框颜色</label>
                <div className="pixel-frame-picker"><input id="pixel-frame-color" type="color" value={frameColor} onChange={(event) => setFrameColor(event.target.value)} /><span>{frameColor === '#f6f3ed' ? '浅色（默认）' : '自定义边框'}</span></div>
              </section>

              <section className="pixel-tool-section pixel-capture-section">
                <div className="pixel-section-label"><span>03</span><h2>生成档案</h2></div>
                <p>截图会以像素效果保存为头像，并带入当前登录用户的真实经验名片。</p>
                <p className={`pixel-status ${error ? 'is-error' : ''}`} role="status">{status}</p>
              </section>
            </aside>
          </div>
        )}

        {phase === 'keywords' && (
          <section className="pixel-edit-screen">
            <header className="pixel-result-header">
              <div><p className="pixel-eyebrow">EXPERIENCE CARD / STEP 02</p><h1>补齐你的经验关键词</h1></div>
              <button type="button" className="pixel-button pixel-secondary" onClick={retake}>← 回去重新拍照</button>
            </header>
            <div className="pixel-edit-layout">
              <div className="pixel-edit-portrait" style={{ '--pixel-frame-color': frameColor } as React.CSSProperties}><img src={avatarDataUrl} alt="刚才截取的像素头像" /></div>
              <div className="pixel-keyword-form">
                <p className="pixel-eyebrow">使用当前登录用户与最新经验卡内容</p>
                {cardsLoading ? (
                  <p className="pixel-card-source-status">正在读取你的最新经验卡…</p>
                ) : latestCard ? (
                  <>
                    <label htmlFor="pixel-card-title">经验卡标题（可修改）</label>
                    <input
                      id="pixel-card-title"
                      type="text"
                      maxLength={120}
                      value={cardTitle}
                      onChange={(event) => setCardTitle(event.target.value)}
                      placeholder="输入这张像素名片要展示的标题"
                    />
                    <label htmlFor="pixel-card-summary">一句话摘要 / 适用情境（可修改）</label>
                    <textarea
                      id="pixel-card-summary"
                      rows={3}
                      maxLength={240}
                      value={cardSummary}
                      onChange={(event) => setCardSummary(event.target.value)}
                      placeholder="输入这张像素名片要展示的摘要"
                    />
                  </>
                ) : (
                  <p className="pixel-card-source-status">
                    {cardsLoadError ? '最新经验卡读取失败，请刷新后重试。' : '还没有可带入的经验卡，请先创建并保存一张经验卡。'}
                  </p>
                )}
                <label htmlFor="pixel-keywords">经验关键词</label>
                <input id="pixel-keywords" type="text" maxLength={90} value={keywordsText} onChange={(event) => setKeywordsText(event.target.value)} placeholder="例如：第一次做项目、社群招新、AI 工具" />
                <div className="pixel-keyword-preview">
                  {keywords.map((keyword) => <span key={keyword}>#{keyword}</span>)}
                </div>
                <button type="button" className="pixel-button pixel-primary" onClick={generateCard} disabled={saving || cardsLoading || !latestCard || cardsLoadError}>
                  {saving ? '正在保存…' : '生成并保存到我的名片 →'}
                </button>
                <p className={`pixel-status ${error ? 'is-error' : ''}`} role="status">{status}</p>
              </div>
            </div>
          </section>
        )}

        {phase === 'result' && (
          <section className="pixel-result-screen">
            <header className="pixel-result-header">
              <div><p className="pixel-eyebrow">EXPERIENCE CARD / CAPTURED</p><h1>你的像素经验名片已生成</h1></div>
              <button type="button" className="pixel-button pixel-secondary" onClick={retake}>← 重新生成</button>
            </header>
            <div className="pixel-result-card"><img src={cardDataUrl} alt="横向 Experience Card 成片" /></div>
            <div className="pixel-result-meta">
              <p>{savedToProfile ? '头像与成片已写入“我的名片”。原始摄像头画面没有上传。' : '成片已在本地生成，但还没有写入“我的名片”。原始摄像头画面没有上传。'}</p>
              <div className="pixel-result-codes">
                <figure><canvas ref={officialQrRef} /><figcaption>扫码打开 Experience Card 官网</figcaption></figure>
                <figure><canvas ref={downloadQrRef} /><figcaption>扫码直接下载这张经验现场头像</figcaption></figure>
              </div>
            </div>
            <div className="pixel-result-actions">
              <button type="button" className="pixel-button pixel-primary" onClick={() => cardCanvasRef.current && downloadCanvas(cardCanvasRef.current, 'experience-card-pixel-profile.png')}>下载经验卡 PNG</button>
              <button type="button" className="pixel-button pixel-copy" onClick={copyXiaohongshuText}>复制小红书文案</button>
              <button type="button" className="pixel-button pixel-secondary" onClick={() => navigate('/my-cards')}>查看我的名片</button>
            </div>
            <p className={`pixel-status ${error ? 'is-error' : ''}`} role="status">{status}</p>
          </section>
        )}
      </main>

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        reason="登录后才能把像素头像和成片保存到我的名片"
      />
    </div>
  );
}

function PixelRange({
  label,
  value,
  min,
  max,
  suffix = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="pixel-range-field">
      <label>
        <span>{label}</span>
        <output>{value}{suffix}</output>
      </label>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </div>
  );
}
