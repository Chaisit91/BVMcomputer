/** Badge wording used by every category's products (CpuBadge, GpuBadge, ... are all this union). */
export type CategoryBadge = 'แนะนำ' | 'สินค้าขายดี' | 'ใหม่';

// The category pages' badge wording ("สินค้าขายดี" etc.) differs from the shared
// homepage Badge component's fixed labels, so they get their own small badge style.
export const categoryBadgeStyle: Record<CategoryBadge, string> = {
  แนะนำ: 'bg-ink text-white',
  สินค้าขายดี: 'bg-brand text-white',
  ใหม่: 'bg-amber-400 text-ink',
};
