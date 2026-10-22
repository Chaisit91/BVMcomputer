import { CategoryListingPage } from '../components/category/CategoryListingPage';
import { DesktopPcHeroBanner } from '../components/category/DesktopPcHeroBanner';
import { DesktopPcFilterSidebar } from '../components/category/DesktopPcFilterSidebar';
import { DesktopPcProductCard } from '../components/category/DesktopPcProductCard';
import { DesktopPcProductListRow } from '../components/category/DesktopPcProductListRow';
import { applyDesktopPcFilters, DESKTOP_PC_PRICE_CEILING, defaultDesktopPcFilters } from '../data/desktopPcProducts';

export function DesktopPcCategoryPage() {
  return (
    <CategoryListingPage
      slug="desktop-pc"
      title="คอมพิวเตอร์ตั้งโต๊ะ"
      sectionId="desktop-pc-products"
      hero={<DesktopPcHeroBanner />}
      Sidebar={DesktopPcFilterSidebar}
      Card={DesktopPcProductCard}
      Row={DesktopPcProductListRow}
      defaultFilters={defaultDesktopPcFilters}
      applyFilters={applyDesktopPcFilters}
      priceCeiling={DESKTOP_PC_PRICE_CEILING}
    />
  );
}
