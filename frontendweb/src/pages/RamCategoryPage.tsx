import { CategoryListingPage } from '../components/category/CategoryListingPage';
import { RamHeroBanner } from '../components/category/RamHeroBanner';
import { RamFilterSidebar } from '../components/category/RamFilterSidebar';
import { RamProductCard } from '../components/category/RamProductCard';
import { RamProductListRow } from '../components/category/RamProductListRow';
import { applyRamFilters, RAM_PRICE_CEILING, defaultRamFilters } from '../data/ramProducts';

export function RamCategoryPage() {
  return (
    <CategoryListingPage
      slug="ram"
      title="แรม"
      sectionId="ram-products"
      hero={<RamHeroBanner />}
      Sidebar={RamFilterSidebar}
      Card={RamProductCard}
      Row={RamProductListRow}
      defaultFilters={defaultRamFilters}
      applyFilters={applyRamFilters}
      priceCeiling={RAM_PRICE_CEILING}
    />
  );
}
