import { useEffect, useRef } from 'react';

interface Particle {
  nx: number;
  ny: number;
  baseSize: number;
  driftSpeed: number;
  pulseSpeed: number;
  pulsePhase: number;
  wanderOffset: number;
  baseAlpha: number;
  driftPhase: number;
}

interface PixelBlastProps {
  particleCount?: number;
  color?: string;
  secondaryColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function PixelBlast({
  particleCount = 650,
  color = '#E63B30',
  secondaryColor = '#C8231E',
  className,
  style,
}: PixelBlastProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const compactViewport = window.matchMedia('(max-width: 767px)').matches;
    const effectiveParticleCount = Math.min(particleCount, compactViewport ? 120 : 360);
    const dpr = Math.min(window.devicePixelRatio || 1, compactViewport ? 1.25 : 1.5);

    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Initialize particles with normalized coords
    const particles: Particle[] = [];
    for (let i = 0; i < effectiveParticleCount; i++) {
      particles.push({
        nx: Math.random(),
        ny: Math.random(),
        baseSize: 4 + Math.random() * 6,
        driftSpeed: 0.00012 + Math.random() * 0.00008,
        pulseSpeed: 0.4 + Math.random() * 2.2,
        pulsePhase: Math.random() * Math.PI * 2,
        wanderOffset: Math.random() * 1000,
        baseAlpha: 0.22 + Math.random() * 0.5,
        driftPhase: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = particles;

    // Pointer tracking is only useful on devices with a precise pointer.
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    const onMouseOut = (e: MouseEvent) => {
      if (e.relatedTarget === null) {
        mouseRef.current.active = false;
      }
    };
    const precisePointer = window.matchMedia('(pointer: fine)').matches;
    if (precisePointer) {
      window.addEventListener('mousemove', onMouseMove, { passive: true });
      document.addEventListener('mouseout', onMouseOut);
    }

    const startTime = performance.now();
    let lastDraw = 0;
    const frameInterval = 1000 / 30;

    const animate = (timestamp: number) => {
      if (document.hidden || timestamp - lastDraw < frameInterval) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }
      lastDraw = timestamp;

      const now = performance.now();
      const elapsed = now - startTime;
      const cw = container.clientWidth || 1;
      const ch = container.clientHeight || 1;

      ctx.clearRect(0, 0, cw, ch);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseActive = mouseRef.current.active;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Slow organic drift
        const driftAngle =
          p.driftPhase +
          Math.sin(elapsed * 0.00008 + p.wanderOffset) * 0.6;
        p.nx += Math.cos(driftAngle) * p.driftSpeed;
        p.ny += Math.sin(driftAngle) * p.driftSpeed;

        // Wrap around seamlessly
        if (p.nx < -0.04) p.nx += 1.08;
        if (p.nx > 1.04) p.nx -= 1.08;
        if (p.ny < -0.04) p.ny += 1.08;
        if (p.ny > 1.04) p.ny -= 1.08;

        // Per-particle wander oscillation (±2.5% of screen)
        const wanderNx =
          Math.sin(elapsed * 0.00022 + p.wanderOffset) * 0.025;
        const wanderNy =
          Math.cos(elapsed * 0.00032 + p.wanderOffset * 1.3) * 0.025;

        let px = (p.nx + wanderNx) * cw;
        let py = (p.ny + wanderNy) * ch;

        // Breathing pulse: size + alpha oscillate independently
        const beat = Math.sin(
          elapsed * 0.001 * p.pulseSpeed + p.pulsePhase
        );
        const size = p.baseSize * (0.72 + 0.28 * beat);
        const alpha = p.baseAlpha * (0.42 + 0.58 * beat);

        // Mouse interaction: gentle repel + brighten
        let finalX = px;
        let finalY = py;
        let finalAlpha = alpha;
        let finalSize = size;

        if (mouseActive) {
          const dx = px - mx;
          const dy = py - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            finalX += dx * force * 0.35;
            finalY += dy * force * 0.35;
            finalAlpha = Math.min(0.95, alpha + force * 0.4);
            finalSize = size * (1 + force * 0.25);
          }
        }

        // Draw square pixel
        ctx.fillStyle = i % 4 === 0 ? secondaryColor : color;
        ctx.globalAlpha = Math.max(0, Math.min(1, finalAlpha));
        const s = finalSize;
        ctx.fillRect(finalX - s / 2, finalY - s / 2, s, s);
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, [particleCount, color, secondaryColor]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...style }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
}
