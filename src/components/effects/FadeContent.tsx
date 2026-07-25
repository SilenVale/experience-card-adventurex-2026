import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface FadeContentProps {
  children: ReactNode;
  container?: Element | string | null;
  blur?: boolean;
  duration?: number;
  ease?: string;
  delay?: number;
  threshold?: number;
  initialOpacity?: number;
  disappearAfter?: number;
  disappearDuration?: number;
  disappearEase?: string;
  onComplete?: () => void;
  onDisappearanceComplete?: () => void;
  className?: string;
  style?: CSSProperties;
}

function getSeconds(value: number) {
  return value > 10 ? value / 1000 : value;
}

export default function FadeContent({
  children,
  container,
  blur = false,
  duration = 1000,
  ease = 'power2.out',
  delay = 0,
  threshold = 0.1,
  initialOpacity = 0,
  disappearAfter = 0,
  disappearDuration = 0.5,
  disappearEase = 'power2.in',
  onComplete,
  onDisappearanceComplete,
  className = '',
  style,
}: FadeContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(element, { autoAlpha: 1, filter: 'blur(0px)', clearProps: 'willChange' });
      return;
    }

    let scrollerTarget: Element | null =
      typeof container === 'string'
        ? document.querySelector(container)
        : container || document.getElementById('snap-main-container');

    const startPercent = (1 - threshold) * 100;
    const timeline = gsap.timeline({
      paused: true,
      delay: getSeconds(delay),
      onComplete: () => {
        gsap.set(element, { clearProps: 'willChange' });
        onComplete?.();

        if (disappearAfter > 0) {
          gsap.to(element, {
            autoAlpha: initialOpacity,
            filter: blur ? 'blur(8px)' : 'blur(0px)',
            delay: getSeconds(disappearAfter),
            duration: getSeconds(disappearDuration),
            ease: disappearEase,
            onComplete: onDisappearanceComplete,
          });
        }
      },
    });

    gsap.set(element, {
      autoAlpha: initialOpacity,
      filter: blur ? 'blur(8px)' : 'blur(0px)',
      willChange: 'opacity, filter',
    });

    timeline.to(element, {
      autoAlpha: 1,
      filter: 'blur(0px)',
      duration: getSeconds(duration),
      ease,
    });

    const scrollTrigger = ScrollTrigger.create({
      trigger: element,
      scroller: scrollerTarget || window,
      start: `top ${startPercent}%`,
      once: true,
      onEnter: () => timeline.play(),
    });

    const frame = window.requestAnimationFrame(() => {
      const rect = element.getBoundingClientRect();
      const viewportHeight =
        scrollerTarget instanceof HTMLElement
          ? scrollerTarget.clientHeight
          : window.innerHeight;
      const triggerLine = viewportHeight * (startPercent / 100);

      // A route transition can place the first block a few pixels below the
      // trigger line. It is already visible to the user, so do not leave it
      // permanently hidden waiting for a scroll event.
      if (rect.top <= viewportHeight && rect.bottom >= 0) {
        timeline.play();
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
      scrollTrigger.kill();
      timeline.kill();
      gsap.killTweensOf(element);
    };
  }, [
    blur,
    container,
    delay,
    disappearAfter,
    disappearDuration,
    disappearEase,
    duration,
    ease,
    initialOpacity,
    onComplete,
    onDisappearanceComplete,
    threshold,
  ]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
