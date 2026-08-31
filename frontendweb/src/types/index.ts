export type CategoryIconKey =
  | 'cpu'
  | 'motherboard'
  | 'gpu'
  | 'ram'
  | 'storage'
  | 'psu'
  | 'case'
  | 'keyboard'
  | 'mouse'
  | 'headset'
  | 'monitor'
  | 'accessory';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: CategoryIconKey;
}

export type ProductBadge = 'sale' | 'new' | 'bestseller' | 'hot';

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  category: CategoryIconKey;
  badge?: ProductBadge;
  rating?: number;
  reviewCount?: number;
}

export interface PromoBanner {
  id: string;
  title: string;
  tag: string;
  tagColor: 'red' | 'yellow';
  gradient: string;
  href: string;
}

export interface SpecialDeal {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  category: CategoryIconKey;
  stockLeft: number;
  /** 0–100, how much of the deal's stock has already sold — drives the progress bar. */
  soldPercent: number;
  /** Seconds left on the shared "Special deals" countdown at the moment this data was loaded. */
  endsInSeconds: number;
  /** Real product photo, once available — falls back to the category icon when absent. */
  image?: string;
}
