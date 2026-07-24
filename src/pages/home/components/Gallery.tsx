import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories, experienceCards } from '@/mocks/homeData';
import { galleryToDetailMap } from '@/mocks/cardDetailData';
import { listPublishedExperienceCards, type ExperienceCardRecord } from '@/lib/experienceCards';

type GalleryCard = {
  id: string;
  title: string;
  summary: string;
  suitableFor: string;
  result: string;
  tags: string[];
  categoryId: string;
  category: string;
  status: string;
  boundary: string;
};

function fromDatabase(card: ExperienceCardRecord): GalleryCard {
  return {
    id: card.id,
    title: card.title,
    summary: card.one_liner || card.result || card.background,
    suitableFor: card.suitable_for || '请结合自己的具体情境判断',
    result: card.result || '作者已确认这段真实经历',
    tags: ['真实经历', card.suitable_for ? '可试用' : '待补充'].filter(Boolean),
    categoryId: 'all',
    category: '真实经验',
    status: 'v1 · 已发布',
    boundary: card.boundary || '请结合自己的限制判断',
  };
}

function fromMock(card: (typeof experienceCards)[number]): GalleryCard {
  return {
    id: card.id,
    title: card.title,
    summary: card.description,
    suitableFor: card.tags[0] || '正在经历相似问题的人',
    result: card.tags[1] || '作者确认的经验',
    tags: card.tags.slice(0, 2),
    categoryId: card.categoryId,
    category: card.category,
    status: card.status === 'v2' ? 'v2 · 已更新' : 'v1 · 可试用',
    boundary: card.boundaryTag,
  };
}

function ExperienceCardFace({ card, index, onOpen }: { card: GalleryCard; index: number; onOpen: () => void }) {
  const tones = ['bg-theme-bg-card', 'bg-theme-bg-card-alt', 'bg-theme-accent-subtle'];
  const spans = ['md:col-span-2', '', '', 'md:col-span-2'];

  return (
    <article className={`group relative flex min-h-[330px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-theme-border p-5 transition-all duration-300 hover:-translate-y-1 hover:border-theme-accent-light ${tones[index % tones.length]} ${spans[index % spans.length]}`} onClick={onOpen}>
      <div className="pointer-events-none absolute right-[-30px] top-[-35px] h-32 w-32 rounded-full border border-theme-accent/10" />
      <div className="pointer-events-none absolute right-10 top-10 h-px w-24 rotate-[-28deg] bg-theme-accent/25" />
      <div className="relative flex items-center justify-between gap-3">
        <span className="chapter-label">{card.category}</span>
        <span className="tag-red rounded-full px-2 py-0.5 text-[10px]">{card.status}</span>
      </div>
      <h3 className="relative mt-7 max-w-xl font-heading text-xl font-bold leading-snug text-theme-text transition-colors group-hover:text-theme-accent">{card.title}</h3>
      <p className="relative mt-3 line-clamp-3 text-sm leading-relaxed text-theme-text-secondary">{card.summary}</p>
      <div className="relative mt-auto pt-6">
        <div className="border-t border-theme-border pt-3">
          <span className="text-[10px] text-theme-text-muted">适合谁</span>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-theme-text-secondary">{card.suitableFor}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">{card.tags.map((tag) => <span key={tag} className="tag-ivory rounded-full px-2 py-0.5 text-[10px]">{tag}</span>)}</div>
        <div className="mt-4 flex items-center justify-between text-xs font-semibold text-theme-accent"><span>看看这对我是否适用</span><i className="ri-arrow-right-up-line text-base transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></div>
      </div>
    </article>
  );
}

interface GalleryProps { onCardClick: (detailId: string) => void; }

export default function Gallery({ onCardClick }: GalleryProps) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [databaseCards, setDatabaseCards] = useState<ExperienceCardRecord[] | null>(null);

  useEffect(() => {
    listPublishedExperienceCards().then(setDatabaseCards).catch(() => setDatabaseCards(null));
  }, []);

  const allCards = databaseCards && databaseCards.length > 0 ? databaseCards.map(fromDatabase) : experienceCards.map(fromMock);
  const filteredCards = activeCategory === 'all' ? allCards : allCards.filter((card) => card.categoryId === activeCategory);
  const openCard = (id: string) => {
    if (databaseCards?.some((card) => card.id === id)) {
      navigate(`/card/${id}`);
      return;
    }
    onCardClick(galleryToDetailMap[id] || 'persona-01');
  };

  return (
    <section id="experience-gallery" className="bg-theme-bg px-4 py-14 transition-colors duration-300 md:px-12 md:py-20 lg:px-16">
      <div className="mx-auto max-w-site">
        <div className="mb-8 md:mb-10">
          <div className="mb-3 flex items-center gap-3"><span className="chapter-label">经验广场</span><div className="h-px flex-1 bg-theme-border" /></div>
          <h2 className="font-heading text-3xl font-black leading-[0.94] text-theme-text md:text-4xl">不是每段经历都要伟大。</h2>
          <p className="mt-3 max-w-md text-sm text-theme-text-secondary">做成过的一件小事，也可能正好是另一个人的下一步。</p>
        </div>
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => <button key={category.id} onClick={() => setActiveCategory(category.id)} className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${activeCategory === category.id ? 'bg-theme-text text-theme-bg' : 'border border-theme-border text-theme-text-secondary hover:text-theme-text'}`}>{category.label}</button>)}
        </div>
        {filteredCards.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {filteredCards.map((card, index) => <ExperienceCardFace key={card.id} card={card} index={index} onOpen={() => openCard(card.id)} />)}
          </div>
        ) : <div className="py-16 text-center text-sm text-theme-text-muted">这个分类下还没有经验卡</div>}
        <div className="mt-10 text-center"><button onClick={() => navigate('/create')} className="btn-red inline-flex items-center gap-2 px-6 py-2.5 text-sm">创建我的经验卡<i className="ri-arrow-right-line" /></button></div>
      </div>
    </section>
  );
}
