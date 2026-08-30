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
}

export interface PromoBanner {
  id: string;
  title: string;
  tag: string;
  tagColor: 'red' | 'yellow';
  gradient: string;
  href: string;
}

export interface Brand {
  id: string;
  name: string;
}
