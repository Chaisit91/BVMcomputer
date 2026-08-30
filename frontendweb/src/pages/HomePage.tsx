import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchHomeData } from '../features/home/homeSlice';
import { Header } from '../components/layout/Header';
import { CategoryNav } from '../components/layout/CategoryNav';
import { Footer } from '../components/layout/Footer';
import { HeroBanner } from '../components/home/HeroBanner';
import { BrandStrip } from '../components/home/BrandStrip';
import { CategorySection } from '../components/home/CategorySection';
import { PromoBanners } from '../components/home/PromoBanners';
import { ProductSection } from '../components/home/ProductSection';
import { CustomPcCta } from '../components/home/CustomPcCta';

export function HomePage() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.home.status);

  // Real side effect: load homepage content once on mount.
  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchHomeData());
    }
  }, [status, dispatch]);

  return (
    <div id="top" className="flex min-h-screen flex-col bg-white">
      <Header />
      <CategoryNav />

      <main className="flex-1">
        <HeroBanner />
        <BrandStrip />
        <CategorySection />
        <PromoBanners />
        <ProductSection />
        <CustomPcCta />
      </main>

      <Footer />
    </div>
  );
}
