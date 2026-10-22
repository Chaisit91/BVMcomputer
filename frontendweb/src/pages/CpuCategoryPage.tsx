import { CategoryListingPage } from '../components/category/CategoryListingPage';
import { CpuHeroBanner } from '../components/category/CpuHeroBanner';
import { FilterSidebar } from '../components/category/FilterSidebar';
import { CategoryProductCard } from '../components/category/CategoryProductCard';
import { CategoryProductListRow } from '../components/category/CategoryProductListRow';
import { applyCpuFilters, CPU_PRICE_CEILING, defaultCpuFilters } from '../data/cpuProducts';

export function CpuCategoryPage() {
  return (
    <CategoryListingPage
      slug="cpu"
      title="ซีพียู"
      sectionId="cpu-products"
      hero={<CpuHeroBanner />}
      Sidebar={FilterSidebar}
      Card={CategoryProductCard}
      Row={CategoryProductListRow}
      defaultFilters={defaultCpuFilters}
      applyFilters={applyCpuFilters}
      priceCeiling={CPU_PRICE_CEILING}
    />
  );
}
