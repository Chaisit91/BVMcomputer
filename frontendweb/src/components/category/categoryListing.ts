export type CategoryView = 'grid' | 'list';
export type CategorySort = 'popular' | 'price-asc' | 'price-desc';

/** The prop contract every category's filter sidebar implements (FilterSidebar, GpuFilterSidebar, ...). */
export interface CategoryFilterSidebarProps<F> {
  title: string;
  count: number;
  sort: CategorySort;
  onSortChange: (value: CategorySort) => void;
  view: CategoryView;
  onViewChange: (value: CategoryView) => void;
  priceCeiling: number;
  filters: F;
  onChange: (next: F) => void;
  onClear: () => void;
}

export function sortByPrice<T extends { price: number }>(products: T[], sort: CategorySort): T[] {
  if (sort === 'price-asc') return [...products].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') return [...products].sort((a, b) => b.price - a.price);
  return products;
}
