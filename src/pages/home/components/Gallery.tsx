import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories, experienceCards, type ExperienceCard } from '@/mocks/homeData';
import { galleryToDetailMap } from '@/mocks/cardDetailData';
import { listPublishedExperienceCards, type ExperienceCardRecord } from '@/lib/experienceCards';

function toGalleryCard(card: ExperienceCardRecord): ExperienceCard {
  return {
    id: card.id,
    title: card.title,
    author: '作者确认的经验',
    category: '真实经验',
    categoryId: 'all',
    description: card.one_liner || card.suitable_for,
    tags: [card.suitable_for || '具体情境', card.actions_done || '可尝试行动'].filter(Boolean).slice(0, 2),
    boundaryTag: card.boundary ? `边界：${card.boundary}` : '请结合自己的情境判断',
    imageUrl: 'https://readdy.ai/api/search-image?query=warm%20editorial%20paper%20archive%20with%20subtle%20red%20and%20gold%20light%2C%20minimal%20experience%20card%20background&width=800&height=1024&seq=experience-card-public&orientation=portrait',
    status: 'v1',
    cardType: 'gold',
  };
}

function Card({ card, onClick }: { card: ExperienceCard; onClick: (id: string) => void }) {
  return (
    <article className="card-white group cursor-pointer" onClick={() => onClick(card.id)}>
      <div className="relative w-full overflow-hidden">
        <img
          alt={card.title}
          className="w-full h-auto object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
          src={card.imageUrl}
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
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
          作者确认
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
  const [activeCategory, setActiveCategory] = useState('all');
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [databaseCards, setDatabaseCards] = useState<ExperienceCardRecord[] | null>(null);

  useEffect(() => {
    listPublishedExperienceCards()
      .then((cards) => setDatabaseCards(cards))
      .catch(() => setDatabaseCards(null));
  }, []);

  const allCards = databaseCards && databaseCards.length > 0
    ? databaseCards.map(toGalleryCard)
    : experienceCards;

  const filteredCards =
    activeCategory === 'all'
      ? allCards
      : allCards.filter((c) => c.categoryId === activeCategory);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-card-id');
            if (id) {
              setVisibleCards((prev) => new Set([...prev, id]));
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '40px' }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [filteredCards]);

  const handleCardClick = (galleryCardId: string) => {
    if (databaseCards?.some((card) => card.id === galleryCardId)) {
      navigate(`/card/${galleryCardId}`);
      return;
    }

    const detailId = galleryToDetailMap[galleryCardId];
    if (detailId) {
      navigate(`/card/${detailId}`);
    } else {
      navigate(`/card/persona-01`);
    }
  };

  return (
    <section id="experience-gallery" className="relative py-14 md:py-20 px-4 md:px-12 lg:px-16 bg-theme-bg transition-colors duration-300">
      <div className="max-w-site mx-auto">
        <div className="mb-8 md:mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="chapter-label">经验广场</span>
            <div className="flex-1 h-px bg-theme-border" />
          </div>
          <h2 className="font-heading font-black text-theme-text leading-[0.94] mb-2 text-2xl md:text-3xl lg:text-4xl">
            不是每段经历都要伟大。
          </h2>
          <p className="text-sm text-theme-text-secondary max-w-md">
            做成过的一件小事，也可能正好是另一个人的下一步。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setVisibleCards(new Set());
              }}
              className={`px-3.5 py-1.5 text-xs font-heading font-medium transition-all duration-200 cursor-pointer whitespace-nowrap rounded-full ${
                activeCategory === cat.id
                  ? 'bg-theme-text text-theme-bg'
                  : 'text-theme-text-secondary hover:text-theme-text border border-theme-border hover:border-theme-accent/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-5 min-h-[200px]">
          {filteredCards.map((card, idx) => (
            <div
              key={card.id}
              ref={(el) => { cardRefs.current[idx] = el; }}
              data-card-id={card.id}
              className={`mb-4 md:mb-5 break-inside-avoid fade-up ${
                visibleCards.has(card.id) ? 'visible' : ''
              }`}
              style={{ transitionDelay: `${(idx % 4) * 0.1}s` }}
            >
              <Card card={card} onClick={handleCardClick} />
            </div>
          ))}
        </div>

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

        <div className="mt-10 text-center">
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
