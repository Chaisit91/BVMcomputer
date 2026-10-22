import { CategoryListingPage } from '../components/category/CategoryListingPage';
import { PsuHeroBanner } from '../components/category/PsuHeroBanner';
import { PsuFilterSidebar } from '../components/category/PsuFilterSidebar';
import { PsuProductCard } from '../components/category/PsuProductCard';
import { PsuProductListRow } from '../components/category/PsuProductListRow';
import { applyPsuFilters, PSU_PRICE_CEILING, defaultPsuFilters } from '../data/psuProducts';

export function PsuCategoryPage() {
  return (
    <CategoryListingPage
      slug="psu"
      title="พาวเวอร์ซัพพลาย"
      sectionId="psu-products"
      hero={<PsuHeroBanner />}
      Sidebar={PsuFilterSidebar}
      Card={PsuProductCard}
      Row={PsuProductListRow}
      defaultFilters={defaultPsuFilters}
      applyFilters={applyPsuFilters}
      priceCeiling={PSU_PRICE_CEILING}
    />
  );
}
