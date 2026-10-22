import { CategoryListingPage } from '../components/category/CategoryListingPage';
import { CoolingHeroBanner } from '../components/category/CoolingHeroBanner';
import { CoolingFilterSidebar } from '../components/category/CoolingFilterSidebar';
import { CoolingProductCard } from '../components/category/CoolingProductCard';
import { CoolingProductListRow } from '../components/category/CoolingProductListRow';
import { applyCoolingFilters, COOLING_PRICE_CEILING, defaultCoolingFilters } from '../data/coolingProducts';

export function CoolingCategoryPage() {
  return (
    <CategoryListingPage
      slug="cooling"
      title="ชุดระบายความร้อน"
      sectionId="cooling-products"
      hero={<CoolingHeroBanner />}
      Sidebar={CoolingFilterSidebar}
      Card={CoolingProductCard}
      Row={CoolingProductListRow}
      defaultFilters={defaultCoolingFilters}
      applyFilters={applyCoolingFilters}
      priceCeiling={COOLING_PRICE_CEILING}
    />
  );
}
