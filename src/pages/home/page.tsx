import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Hero from './components/Hero';
import FeaturedCard from './components/FeaturedCard';
import Gallery from './components/Gallery';
import TrialDrawer from '@/components/feature/TrialDrawer';

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

  return (
    <div className="relative min-h-screen bg-theme-bg transition-colors duration-300">
      <Navbar />
      <main>
        <Hero />
        <FeaturedCard onTrialOpen={handleTrialOpen} />
        <Gallery onCardClick={handleViewDetail} />
      </main>

      <TrialDrawer
        isOpen={trialOpen}
        onClose={() => setTrialOpen(false)}
        cardTitle={trialCardTitle}
        cardId={trialCardId}
      />
    </div>
  );
}