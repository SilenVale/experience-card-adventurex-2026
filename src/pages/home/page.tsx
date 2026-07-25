import { lazy, Suspense, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Hero from './components/Hero';
import FeaturedCard from './components/FeaturedCard';
import Gallery from './components/Gallery';
import TrialDrawer from '@/components/feature/TrialDrawer';

const PixelBlast = lazy(() => import('@/components/effects/PixelBlast'));

export default function Home() {
  const navigate = useNavigate();
  const [trialOpen, setTrialOpen] = useState(false);
  const [trialCardTitle, setTrialCardTitle] = useState('');
  const [trialCardId, setTrialCardId] = useState('');

  const handleTrialOpen = (cardTitle: string, cardId: string) => {
    setTrialCardTitle(cardTitle);
    setTrialCardId(cardId);
    setTrialOpen(true);
  };

  const handleViewDetail = (cardId: string) => {
    navigate(`/card/${cardId}`);
  };

  const handleTrialClose = useCallback(() => {
    setTrialOpen(false);
  }, []);

  return (
    <div className="relative min-h-screen bg-theme-bg transition-colors duration-300">
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <Suspense fallback={null}>
          <PixelBlast
            particleCount={360}
            color="#E63B30"
            secondaryColor="#C8231E"
          />
        </Suspense>
      </div>

      <Navbar />
      <main className="relative z-10">
        <Hero />
        <FeaturedCard onTrialOpen={handleTrialOpen} />
        <Gallery onCardClick={handleViewDetail} />
      </main>

      <TrialDrawer
        isOpen={trialOpen}
        onClose={handleTrialClose}
        cardTitle={trialCardTitle}
        cardId={trialCardId}
      />
    </div>
  );
}
