import { useCallback, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Hero from './sections/Hero';
import Why from './sections/Why';
import Grains from './sections/Grains';
import CapacityBand from './sections/CapacityBand';
import Story from './sections/Story';
import Production from './sections/Production';
import Quality from './sections/Quality';
import Gallery from './sections/Gallery';
import Contact from './sections/Contact';
import { products } from './data/products';

export default function App() {
  // Variety shown in the hero showcase (shared with "See the difference").
  const [activeId, setActiveId] = useState(products[0].id);
  const [autoplay, setAutoplay] = useState(true);
  // Product pre-selected in the quotation form.
  const [inquiry, setInquiry] = useState('');

  const choose = useCallback((id) => {
    setActiveId(id);
    setAutoplay(false);
  }, []);

  const handleInquire = useCallback((productId) => {
    setInquiry(productId);
    setAutoplay(false);
    requestAnimationFrame(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }));
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <Header />
      <main>
        <Hero activeId={activeId} autoplay={autoplay} onAutoAdvance={setActiveId} onChoose={choose} onInquire={handleInquire} />
        <Why />
        <Grains activeId={activeId} onChoose={choose} />
        <CapacityBand />
        <Story />
        <Production />
        <Quality />
        <Gallery />
        <Contact inquiry={inquiry} />
      </main>
      <Footer />
    </MotionConfig>
  );
}
