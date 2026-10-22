import { CategoryListingPage } from '../components/category/CategoryListingPage';
import { MotherboardHeroBanner } from '../components/category/MotherboardHeroBanner';
import { MotherboardFilterSidebar } from '../components/category/MotherboardFilterSidebar';
import { MotherboardProductCard } from '../components/category/MotherboardProductCard';
import { MotherboardProductListRow } from '../components/category/MotherboardProductListRow';
import { applyMotherboardFilters, MOTHERBOARD_PRICE_CEILING, defaultMotherboardFilters } from '../data/motherboardProducts';

export function MotherboardCategoryPage() {
  return (
    <CategoryListingPage
      slug="motherboard"
      title="เมนบอร์ด"
      sectionId="motherboard-products"
      hero={<MotherboardHeroBanner />}
      Sidebar={MotherboardFilterSidebar}
      Card={MotherboardProductCard}
      Row={MotherboardProductListRow}
      defaultFilters={defaultMotherboardFilters}
      applyFilters={applyMotherboardFilters}
      priceCeiling={MOTHERBOARD_PRICE_CEILING}
    />
  );
}
