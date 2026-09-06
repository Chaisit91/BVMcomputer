import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchHomeData } from '../features/home/homeSlice';
import { HeroBanner } from '../components/home/HeroBanner';
import { FeatureLinks } from '../components/home/FeatureLinks';
import { CategorySection } from '../components/home/CategorySection';
import { PromoBanners } from '../components/home/PromoBanners';
import { ProductSection } from '../components/home/ProductSection';
import { SpecialDealsSection } from '../components/home/SpecialDealsSection';
import { CustomPcCta } from '../components/home/CustomPcCta';
import { ServiceBadges } from '../components/shared/ServiceBadges';

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
    <>
      <HeroBanner />
      <FeatureLinks />
      <CategorySection />
      <PromoBanners />
      <ProductSection />
      <SpecialDealsSection />
      <CustomPcCta />
      <ServiceBadges />
    </>
  );
}
