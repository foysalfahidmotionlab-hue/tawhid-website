import { lazy, Suspense, useCallback, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Hero from './sections/Hero';
import Shop, { CartBar } from './sections/Shop';
import Why from './sections/Why';
import Trademark from './sections/Trademark';
import Grains from './sections/Grains';
import CapacityBand from './sections/CapacityBand';
import Story from './sections/Story';
import Production from './sections/Production';
import Quality from './sections/Quality';
import Gallery from './sections/Gallery';
import Contact from './sections/Contact';
import Checkout from './pages/Checkout';
import Receipt from './pages/Receipt';
import { products } from './data/products';
import { ShopProvider } from './store/shop';
import { usePath, goToSection } from './lib/router';

const AdminApp = lazy(() => import('./admin/AdminApp'));

function Home() {
  // Variety shown in the hero showcase (shared with "See the difference").
  const [activeId, setActiveId] = useState(products[0].id);
  const [autoplay, setAutoplay] = useState(true);

  const choose = useCallback((id) => {
    setActiveId(id);
    setAutoplay(false);
  }, []);

  const toOrder = useCallback(() => {
    setAutoplay(false);
    goToSection('order');
  }, []);

  return (
    <>
      <Hero activeId={activeId} autoplay={autoplay} onAutoAdvance={setActiveId} onChoose={choose} onInquire={toOrder} />
      <Shop />
      <Trademark />
      <Why />
      <Grains activeId={activeId} onChoose={choose} />
      <CapacityBand />
      <Story />
      <Production />
      <Quality />
      <Gallery />
      <Contact />
      <CartBar />
    </>
  );
}

export default function App() {
  const path = usePath();

  if (path === '/admin' || path.startsWith('/admin/')) {
    return (
      <Suspense fallback={<div className="grid min-h-screen place-items-center text-ink/50">Loading…</div>}>
        <AdminApp />
      </Suspense>
    );
  }

  const receipt = path.match(/^\/receipt\/([A-Za-z0-9_-]+)\/?$/);
  let page = <Home />;
  if (path === '/checkout') page = <Checkout />;
  else if (receipt) page = <Receipt token={receipt[1]} />;

  return (
    <ShopProvider>
      <MotionConfig reducedMotion="user">
        <Header />
        <main>{page}</main>
        <Footer />
      </MotionConfig>
    </ShopProvider>
  );
}
