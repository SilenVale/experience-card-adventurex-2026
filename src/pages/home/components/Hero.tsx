import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleLine1Ref = useRef<HTMLSpanElement>(null);
  const titleLine2Ref = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  const scrollToGallery = () => {
    const el = document.getElementById('experience-gallery');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      tl.fromTo(
        titleLine1Ref.current,
        {
          y: 36,
          scale: 1.025,
          opacity: 0.15,
        },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.85,
          ease: 'expo.out',
        }
      );

      tl.fromTo(
        titleLine2Ref.current,
        {
          y: 42,
          scale: 1.04,
          opacity: 0.15,
        },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.95,
          ease: 'expo.out',
        },
        '-=0.6'
      );

      tl.fromTo(
        subtitleRef.current,
        { y: 20, opacity: 0.4 },
        { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' },
        '-=0.45'
      );

      tl.fromTo(
        ctaRef.current,
        { y: 16, opacity: 0.35 },
        { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' },
        '-=0.4'
      );

      // Divider: fades in as user scrolls down from hero
      gsap.fromTo(
        dividerRef.current,
        { scaleX: 0, opacity: 0, transformOrigin: 'center' },
        {
          scaleX: 1,
          opacity: 1,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 30%',
            end: 'top 20%',
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Soft radial glow top-right */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-theme-accent-light rounded-full blur-[120px] opacity-20 pointer-events-none z-[1]" />

      {/* Center content */}
      <div className="relative z-10 w-full px-4 md:px-8 flex flex-col items-center text-center pt-20 pb-24">
        <h1 className="font-heading font-black text-theme-text leading-[0.92] tracking-tighter2">
          <span
            ref={titleLine1Ref}
            className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
          >
            让经验成为彼此的
          </span>
          <span
            ref={titleLine2Ref}
            className="block text-theme-accent text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
          >
            下一步
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="mt-6 md:mt-8 text-theme-text-secondary max-w-lg text-sm md:text-base lg:text-lg leading-relaxed"
        >
          一件你真实做成过的事，被整理成另一个人可以判断的经验。
          <br />
          不是简历，不是教程，不是照搬答案。
        </p>

        {/* CTA — smooth-scroll to Gallery */}
        <div ref={ctaRef} className="mt-8 md:mt-10">
          <button
            onClick={scrollToGallery}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-theme-accent text-white text-sm md:text-base font-semibold rounded-full hover:brightness-110 transition-all whitespace-nowrap cursor-pointer"
          >
            去经验广场
            <i className="ri-arrow-right-line" />
          </button>
        </div>
      </div>

      {/* Subtle section divider — scroll-triggered fade-in */}
      <div
        ref={dividerRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[30%] h-px bg-gradient-to-r from-transparent via-theme-border/25 to-transparent pointer-events-none z-10"
      />
    </section>
  );
}
