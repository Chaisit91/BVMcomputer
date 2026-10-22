import { CategoryListingPage } from '../components/category/CategoryListingPage';
import { StorageHeroBanner } from '../components/category/StorageHeroBanner';
import { StorageFilterSidebar } from '../components/category/StorageFilterSidebar';
import { StorageProductCard } from '../components/category/StorageProductCard';
import { StorageProductListRow } from '../components/category/StorageProductListRow';
import { applyStorageFilters, STORAGE_PRICE_CEILING, defaultStorageFilters } from '../data/storageProducts';

export function StorageCategoryPage() {
  return (
    <CategoryListingPage
      slug="storage"
      title="ฮาร์ดดิสก์ และ เอสเอสดี"
      sectionId="storage-products"
      hero={<StorageHeroBanner />}
      Sidebar={StorageFilterSidebar}
      Card={StorageProductCard}
      Row={StorageProductListRow}
      defaultFilters={defaultStorageFilters}
      applyFilters={applyStorageFilters}
      priceCeiling={STORAGE_PRICE_CEILING}
    />
  );
}
