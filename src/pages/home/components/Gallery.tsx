import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { categories, experienceCards, type ExperienceCard } from '@/mocks/homeData';
import { listPublishedExperienceCards, type ExperienceCardRecord } from '@/lib/experienceCards';

gsap.registerPlugin(ScrollTrigger);

function toGalleryCard(card: ExperienceCardRecord): ExperienceCard {
  return {
    id: card.id,
    title: card.title,
    author: '作者确认 · 真实经历',
    category: '公开经验',
    categoryId: 'other',
    description: card.one_liner || card.problem || card.background,
    tags: ['真实发布', '可匿名试用'],
    boundaryTag: card.boundary || '请先判断使用边界',
    imageUrl: '/experience-cover-sprite-v1.webp',
    coverIndex: 0,
    status: 'v1',
    cardType: 'gold',
  };
}

function Card({ card, onClick }: { card: ExperienceCard; onClick: (id: string) => void }) {
  const coverPositions = ['0%', '50%', '100%'];
  const coverColumn = card.coverIndex % 3;
  const coverRow = Math.floor(card.coverIndex / 3);

  return (
    <article className="card-white group cursor-pointer" onClick={() => onClick(card.id)}>
      <div className="relative w-full overflow-hidden">
        <div
          className="relative w-full aspect-[3/2] bg-no-repeat transition-transform duration-500 group-hover:scale-[1.025]"
          style={{
            backgroundImage: `url(${card.imageUrl})`,
            backgroundSize: '300% 300%',
            backgroundPosition: `${coverPositions[coverColumn]} ${coverPositions[coverRow]}`,
          }}
          role="img"
          aria-label={`${card.category}经验卡封面`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#FBF7EC]/95 via-[#FBF7EC]/75 to-transparent" />
          <div className="absolute inset-0 p-4 flex flex-col">
            <span className="text-[9px] font-heading font-semibold tracking-[0.14em] text-[#E63B30] uppercase">
              EC / {card.category}
            </span>
            <h4 className="mt-5 max-w-[72%] font-heading font-black text-[#1A1514] text-lg md:text-xl leading-[0.98] tracking-[-0.04em] line-clamp-3">
              {card.title}
            </h4>
            <div className="mt-auto flex items-center gap-2 text-[9px] font-heading font-semibold text-[#1A1514]/60">
              <span className="px-2 py-1 bg-[#F2D447] border border-black/10 rotate-[-1deg]">
                {card.isDemo ? '演示样本' : '真实发布'}
              </span>
              <span>{card.id.toUpperCase()}</span>
            </div>
          </div>
        </div>
        <div className="absolute top-3 right-3 flex gap-1.5">
          <span className="tag-red text-[10px] px-2 py-0.5 rounded-full">
            {card.status === 'v2' ? 'v2' : 'v1'}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="chapter-label">{card.category}</span>
          <div className="flex-1 h-px bg-theme-border" />
        </div>
        <h3 className="font-heading font-semibold text-theme-text text-sm leading-snug mb-1.5 group-hover:text-theme-accent transition-colors line-clamp-2">
          {card.title}
        </h3>
        <p className="text-xs text-theme-text-secondary mb-2.5">{card.author}</p>
        <p className="text-xs text-theme-text-muted leading-relaxed mb-3 line-clamp-2">
          {card.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {card.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="tag-red text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
              {tag}
            </span>
          ))}
          <span className="tag-boundary text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
            {card.boundaryTag}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-theme-text-muted">
          <span className="w-1 h-1 rounded-full bg-theme-gold/40" />
          {card.isDemo ? '演示内容 · 非实时数据' : '作者确认 · 真实卡片'}
        </div>
      </div>
    </article>
  );
}

interface GalleryProps {
  onCardClick: (detailId: string) => void;
}

export default function Gallery({ onCardClick }: GalleryProps) {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [activeCategory, setActiveCategory] = useState('all');
  const [publishedCards, setPublishedCards] = useState<ExperienceCard[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listPublishedExperienceCards()
      .then((records) => {
        if (!active) return;
        const usableRecords = records.filter(
          (record) => record.title.trim() && !record.title.includes('草稿') && record.suitable_for.trim()
        );
        setPublishedCards(usableRecords.map(toGalleryCard));
      })
      .catch((error) => {
        if (active) setLoadError(error instanceof Error ? error.message : '公开经验加载失败');
      });
    return () => {
      active = false;
    };
  }, []);

  const demoCards = experienceCards
    .filter((demoCard) => !publishedCards.some((publishedCard) => publishedCard.title === demoCard.title))
    .map((card) => ({ ...card, isDemo: true }));
  const cards = [...publishedCards, ...demoCards];

  const filteredCards =
    activeCategory === 'all'
      ? cards
      : cards.filter((c) => c.categoryId === activeCategory);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const intro = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          once: true,
        },
      });

      intro.fromTo(
        headerRef.current,
        { x: -100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
        }
      );
      intro.fromTo(
        titleRef.current,
        { y: 60, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: 'expo.out',
        },
        '-=0.45'
      );
      intro.fromTo(
        subtitleRef.current,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
        },
        '-=0.55'
      );

      const filterButtons = filterRef.current?.children;
      if (filterButtons) {
        intro.fromTo(
          filterButtons,
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.45,
            stagger: 0.035,
            ease: 'power3.out',
          },
          '-=0.35'
        );
      }

      const firstCards = Array.from(gridRef.current?.children ?? []).slice(0, 16);
      if (firstCards.length) {
        gsap.fromTo(
          firstCards,
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            stagger: 0.035,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 90%',
              once: true,
            }
          }
        );
      }

      gsap.fromTo(
        bottomRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: bottomRef.current,
            start: 'top 90%',
            once: true,
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Animate cards when category changes
  useEffect(() => {
    if (!gridRef.current) return;
    const cardEls = Array.from(gridRef.current.children).slice(0, 16);
    gsap.fromTo(
      cardEls,
      { y: 24, opacity: 0, scale: 0.985 },
      { y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.025, ease: 'power3.out' }
    );
  }, [activeCategory]);

  const handleCardClick = (galleryCardId: string) => {
    onCardClick(galleryCardId);
  };

  return (
    <section
      id="experience-gallery"
      ref={sectionRef}
      className="relative py-14 md:py-20 px-4 md:px-12 lg:px-16 transition-colors duration-300"
    >
      <div className="max-w-site mx-auto">
        <div className="mb-8 md:mb-10">
          <div ref={headerRef} className="flex items-center gap-3 mb-3 opacity-0">
            <span className="chapter-label">经验广场</span>
            <div className="flex-1 h-px bg-theme-border" />
          </div>
          <h2
            ref={titleRef}
            className="font-heading font-black text-theme-text leading-[0.94] mb-2 text-2xl md:text-3xl lg:text-4xl opacity-0"
          >
            不是每段经历都要伟大。
          </h2>
          <p ref={subtitleRef} className="text-sm text-theme-text-secondary max-w-md opacity-0">
            做成过的一件小事，也可能正好是另一个人的下一步。
          </p>
        </div>

        <div ref={filterRef} className="flex flex-wrap items-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 text-xs font-heading font-medium transition-all duration-200 cursor-pointer whitespace-nowrap rounded-full opacity-0 ${
                activeCategory === cat.id
                  ? 'bg-theme-text text-theme-bg'
                  : 'text-theme-text-secondary hover:text-theme-text border border-theme-border hover:border-theme-accent/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div
          ref={gridRef}
          className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4 min-h-[200px] pb-8"
        >
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="min-w-0 mb-3 md:mb-4 break-inside-avoid"
            >
              <Card card={card} onClick={handleCardClick} />
            </div>
          ))}
        </div>
        {loadError && publishedCards.length === 0 && (
          <p className="mt-2 text-center text-[10px] text-theme-text-muted">
            暂时无法读取公开经验，当前显示已标注的演示样本。
          </p>
        )}

        {filteredCards.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-theme-text-muted mb-4">这个分类下还没有经验卡</p>
            <button
              onClick={() => navigate('/create')}
              className="px-5 py-2 btn-red text-sm cursor-pointer whitespace-nowrap font-heading font-semibold rounded-full"
            >
              创建第一张经验卡
            </button>
          </div>
        )}

        <div ref={bottomRef} className="mt-10 text-center opacity-0">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex-1 max-w-[80px] h-px bg-theme-border" />
            <span className="text-[11px] text-theme-text-muted">你也有做成过的事</span>
            <div className="flex-1 max-w-[80px] h-px bg-theme-border" />
          </div>
          <button
            onClick={() => navigate('/create')}
            className="px-6 py-2.5 btn-red text-sm cursor-pointer whitespace-nowrap font-heading font-semibold rounded-full inline-flex items-center gap-2"
          >
            创建我的经验卡
            <i className="ri-arrow-right-line text-sm" />
          </button>
        </div>
      </div>
    </section>
  );
}
