import { CategoryListingPage } from '../components/category/CategoryListingPage';
import { GpuHeroBanner } from '../components/category/GpuHeroBanner';
import { GpuFilterSidebar } from '../components/category/GpuFilterSidebar';
import { GpuProductCard } from '../components/category/GpuProductCard';
import { GpuProductListRow } from '../components/category/GpuProductListRow';
import { applyGpuFilters, GPU_PRICE_CEILING, defaultGpuFilters } from '../data/gpuProducts';

export function GpuCategoryPage() {
  return (
    <CategoryListingPage
      slug="gpu"
      title="การ์ดจอ"
      sectionId="gpu-products"
      hero={<GpuHeroBanner />}
      Sidebar={GpuFilterSidebar}
      Card={GpuProductCard}
      Row={GpuProductListRow}
      defaultFilters={defaultGpuFilters}
      applyFilters={applyGpuFilters}
      priceCeiling={GPU_PRICE_CEILING}
    />
  );
}
