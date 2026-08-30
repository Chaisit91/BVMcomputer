import type { Brand, Category, Product, PromoBanner } from '../types';

// ---------------------------------------------------------------------------
// Mockup content only. The backend team owns the real endpoints — swap the
// functions in `homeApi.ts` for live calls once those are ready; the shapes
// below are already modelled after the expected API response.
// ---------------------------------------------------------------------------

export const mockCategories: Category[] = [
  { id: 'c1', name: 'ซีพียู', slug: 'cpu', icon: 'cpu' },
  { id: 'c2', name: 'เมนบอร์ด', slug: 'motherboard', icon: 'motherboard' },
  { id: 'c3', name: 'การ์ดจอ', slug: 'gpu', icon: 'gpu' },
  { id: 'c4', name: 'แรม', slug: 'ram', icon: 'ram' },
  { id: 'c5', name: 'หน่วยเก็บข้อมูล', slug: 'storage', icon: 'storage' },
  { id: 'c6', name: 'พาวเวอร์ซัพพลาย', slug: 'psu', icon: 'psu' },
  { id: 'c7', name: 'เคสคอมพิวเตอร์', slug: 'case', icon: 'case' },
  { id: 'c8', name: 'คีย์บอร์ด', slug: 'keyboard', icon: 'keyboard' },
  { id: 'c9', name: 'เมาส์', slug: 'mouse', icon: 'mouse' },
  { id: 'c10', name: 'หูฟัง', slug: 'headset', icon: 'headset' },
  { id: 'c11', name: 'จอมอนิเตอร์', slug: 'monitor', icon: 'monitor' },
  { id: 'c12', name: 'อุปกรณ์เสริม', slug: 'accessory', icon: 'accessory' },
];

export const mockProducts: Product[] = [
  { id: 'p1', name: 'RTX 4070 SUPER Gaming OC 12GB', slug: 'rtx-4070-super', price: 24900, originalPrice: 27900, category: 'gpu', badge: 'sale', rating: 4.8 },
  { id: 'p2', name: 'AMD Ryzen 7 7800X3D', slug: 'ryzen-7-7800x3d', price: 12900, category: 'cpu', badge: 'bestseller', rating: 4.9 },
  { id: 'p3', name: 'ROG STRIX B650-A GAMING WIFI', slug: 'strix-b650-a', price: 8900, category: 'motherboard', badge: 'new', rating: 4.6 },
  { id: 'p4', name: 'Corsair Vengeance DDR5 32GB 6000MHz', slug: 'vengeance-ddr5-32gb', price: 4590, category: 'ram', rating: 4.7 },
  { id: 'p5', name: 'Samsung 990 PRO 2TB NVMe SSD', slug: 'samsung-990-pro-2tb', price: 5990, originalPrice: 6990, category: 'storage', badge: 'sale', rating: 4.9 },
  { id: 'p6', name: 'NZXT H5 Flow RGB Case', slug: 'nzxt-h5-flow-rgb', price: 3290, category: 'case', badge: 'new', rating: 4.5 },
  { id: 'p7', name: 'Corsair RM850x 850W PSU', slug: 'corsair-rm850x', price: 4290, category: 'psu', rating: 4.8 },
  { id: 'p8', name: 'iCUE H150i RGB Elite Liquid Cooler', slug: 'icue-h150i-elite', price: 5490, category: 'accessory', badge: 'hot', rating: 4.7 },
];

export const mockPromoBanners: PromoBanner[] = [
  {
    id: 'b1',
    title: 'PC BUILD WEEK',
    tag: 'ลดสูงสุด 40%',
    tagColor: 'red',
    gradient: 'from-brand-dark via-ink to-ink-light',
    href: '#promo-build-week',
  },
  {
    id: 'b2',
    title: 'คู่มือเลือกซื้อการ์ดจอ 2026',
    tag: 'บทความใหม่',
    tagColor: 'yellow',
    gradient: 'from-sky-900 via-ink to-ink-light',
    href: '#promo-guide',
  },
  {
    id: 'b3',
    title: 'แพ็กเกจอัปเกรดคอมทั้งระบบ',
    tag: 'ผ่อน 0% 10 เดือน',
    tagColor: 'yellow',
    gradient: 'from-fuchsia-900 via-ink to-ink-light',
    href: '#promo-upgrade',
  },
];

export const mockBrands: Brand[] = [
  { id: 'br1', name: 'INTEL' },
  { id: 'br2', name: 'AMD' },
  { id: 'br3', name: 'NVIDIA' },
  { id: 'br4', name: 'ASUS' },
  { id: 'br5', name: 'MSI' },
  { id: 'br6', name: 'CORSAIR' },
  { id: 'br7', name: 'GIGABYTE' },
];
