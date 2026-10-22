import { CategoryListingPage } from '../components/category/CategoryListingPage';
import { PcSetHeroBanner } from '../components/category/PcSetHeroBanner';
import { PcSetFilterSidebar } from '../components/category/PcSetFilterSidebar';
import { PcSetProductCard } from '../components/category/PcSetProductCard';
import { PcSetProductListRow } from '../components/category/PcSetProductListRow';
import { applyPcSetFilters, PC_SET_PRICE_CEILING, defaultPcSetFilters } from '../data/pcSetProducts';

export function PcSetCategoryPage() {
  return (
    <CategoryListingPage
      slug="pc-sets"
      title="คอมพิวเตอร์เซตโปรโมชั่น"
      sectionId="pc-set-products"
      hero={<PcSetHeroBanner />}
      Sidebar={PcSetFilterSidebar}
      Card={PcSetProductCard}
      Row={PcSetProductListRow}
      defaultFilters={defaultPcSetFilters}
      applyFilters={applyPcSetFilters}
      priceCeiling={PC_SET_PRICE_CEILING}
    />
  );
}
