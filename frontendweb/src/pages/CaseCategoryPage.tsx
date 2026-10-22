import { CategoryListingPage } from '../components/category/CategoryListingPage';
import { CaseHeroBanner } from '../components/category/CaseHeroBanner';
import { CaseFilterSidebar } from '../components/category/CaseFilterSidebar';
import { CaseProductCard } from '../components/category/CaseProductCard';
import { CaseProductListRow } from '../components/category/CaseProductListRow';
import { applyCaseFilters, CASE_PRICE_CEILING, defaultCaseFilters } from '../data/caseProducts';

export function CaseCategoryPage() {
  return (
    <CategoryListingPage
      slug="case"
      title="เคส"
      sectionId="case-products"
      hero={<CaseHeroBanner />}
      Sidebar={CaseFilterSidebar}
      Card={CaseProductCard}
      Row={CaseProductListRow}
      defaultFilters={defaultCaseFilters}
      applyFilters={applyCaseFilters}
      priceCeiling={CASE_PRICE_CEILING}
    />
  );
}
