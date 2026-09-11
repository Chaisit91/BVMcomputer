import { cpuProducts, type CpuProduct } from './cpuProducts';
import { gpuProducts, type GpuProduct } from './gpuProducts';
import { motherboardProducts, type MotherboardProduct } from './motherboardProducts';
import { ramProducts, type RamProduct } from './ramProducts';
import { storageProducts, type StorageProduct } from './storageProducts';
import { psuProducts, type PsuProduct } from './psuProducts';
import { caseProducts, type CaseProduct } from './caseProducts';
import { coolingProducts, type CoolingProduct } from './coolingProducts';
import { desktopPcProducts, type DesktopPcProduct } from './desktopPcProducts';
import { pcSetProducts, type PcSetProduct } from './pcSetProducts';
import type { CategoryIconKey } from '../types';

export type ProductCategorySlug =
  | 'cpu'
  | 'gpu'
  | 'motherboard'
  | 'ram'
  | 'storage'
  | 'psu'
  | 'case'
  | 'cooling'
  | 'desktop-pc'
  | 'pc-sets';

export interface SpecRow {
  label: string;
  value: string;
}

export interface RelatedProductSummary {
  id: string;
  categorySlug: ProductCategorySlug;
  name: string;
  price: number;
  shortDetail: string;
}

export interface ProductDetailData {
  id: string;
  categorySlug: ProductCategorySlug;
  categoryLabel: string;
  categoryPath: string;
  name: string;
  brand: string;
  skuCode: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  inStock: boolean;
  imageUrl?: string;
  tags: string[];
  specRows: SpecRow[];
  related: RelatedProductSummary[];
  /** Deterministic mock rating so the same product always shows the same numbers. */
  rating: number;
  reviewCount: number;
  soldCount: number;
}

const categoryMeta: Record<ProductCategorySlug, { label: string; path: string }> = {
  cpu: { label: 'ซีพียู', path: '/category/cpu' },
  gpu: { label: 'การ์ดจอ', path: '/category/gpu' },
  motherboard: { label: 'เมนบอร์ด', path: '/category/motherboard' },
  ram: { label: 'แรม', path: '/category/ram' },
  storage: { label: 'ฮาร์ดดิสก์ และ เอสเอสดี', path: '/category/storage' },
  psu: { label: 'พาวเวอร์ซัพพลาย', path: '/category/psu' },
  case: { label: 'เคส', path: '/category/case' },
  cooling: { label: 'ชุดระบายความร้อน', path: '/category/cooling' },
  'desktop-pc': { label: 'คอมพิวเตอร์ตั้งโต๊ะ', path: '/category/desktop-pc' },
  'pc-sets': { label: 'คอมพิวเตอร์เซตโปรโมชั่น', path: '/category/pc-sets' },
};

// Short English tag that opens every product's tag list, e.g. "#CPU", "#GPU".
const categoryTagLabel: Record<ProductCategorySlug, string> = {
  cpu: 'CPU',
  gpu: 'GPU',
  motherboard: 'MAINBOARD',
  ram: 'RAM',
  storage: 'STORAGE',
  psu: 'PSU',
  case: 'CASE',
  cooling: 'COOLING',
  'desktop-pc': 'PC',
  'pc-sets': 'PC SET',
};

/** "3.4 - 5.6 GHz" -> "3.4GHz" — just the leading number, for a compact tag. */
function firstClockTag(clock: string): string {
  const match = clock.match(/[\d.]+/);
  return match ? `${match[0]}GHz` : clock;
}

/** "3.4 - 5.6 GHz" -> { base: "3.4 GHz", turbo: "5.6 GHz" } for the spec table's separate rows. */
function splitClock(clock: string): { base: string; turbo: string } {
  const numbers = clock.match(/[\d.]+/g);
  if (!numbers || numbers.length < 2) return { base: clock, turbo: clock };
  return { base: `${numbers[0]} GHz`, turbo: `${numbers[numbers.length - 1]} GHz` };
}

/** Small stable hash so mock rating/review/sold numbers stay put for a given id across renders. */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function mockEngagement(id: string) {
  const hash = hashString(id);
  return {
    rating: Math.round((4.3 + (hash % 7) / 10) * 10) / 10,
    reviewCount: 40 + (hash % 260),
    soldCount: 400 + (hash % 4600),
  };
}

function skuFromId(id: string): string {
  return `SKU-${id.toUpperCase()}`;
}

function baseFields<T extends { id: string; name: string; brand: string; price: number; badge?: string; inStock: boolean; imageUrl?: string }>(
  categorySlug: ProductCategorySlug,
  product: T,
) {
  const meta = categoryMeta[categorySlug];
  const engagement = mockEngagement(product.id);
  return {
    id: product.id,
    categorySlug,
    categoryLabel: meta.label,
    categoryPath: meta.path,
    name: product.name,
    brand: product.brand,
    skuCode: skuFromId(product.id),
    price: product.price,
    badge: product.badge,
    inStock: product.inStock,
    imageUrl: product.imageUrl,
    ...engagement,
  };
}

function buildCpuDetail(p: CpuProduct): ProductDetailData {
  return {
    ...baseFields('cpu', p),
    tags: [
      categoryTagLabel.cpu,
      categoryMeta.cpu.label,
      p.brand,
      p.socket,
      p.series,
      firstClockTag(p.clock),
      `${p.cores}C ${p.threads}T`,
    ],
    specRows: (() => {
      const { base, turbo } = splitClock(p.clock);
      return [
        { label: 'Brand', value: p.brand },
        { label: 'Series', value: p.series },
        { label: 'Processor Number', value: p.name },
        { label: 'Socket Type', value: p.socket },
        { label: 'Cores/Threads', value: `${p.cores} Cores / ${p.threads} Threads` },
        { label: 'Base Frequency', value: base },
        { label: 'Max Turbo Frequency', value: turbo },
        { label: 'L2 Cache', value: p.l2Cache },
        { label: 'L3 Cache', value: p.l3Cache },
        { label: '64Bit Support', value: 'Yes' },
        { label: 'Default TDP', value: p.tdp },
        { label: 'Maximum Turbo Power', value: p.maxTurboPower },
        { label: 'Warranty', value: p.warranty },
      ];
    })(),
    related: cpuProducts
      .filter((item) => item.id !== p.id)
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        categorySlug: 'cpu',
        name: item.name,
        price: item.price,
        shortDetail: `${item.cores}C/${item.threads}T · ${item.clock}`,
      })),
  };
}

function buildGpuDetail(p: GpuProduct): ProductDetailData {
  return {
    ...baseFields('gpu', p),
    tags: [categoryTagLabel.gpu, categoryMeta.gpu.label, p.brand, p.model, p.memorySize, p.boostClock],
    specRows: [
      { label: 'Brand', value: p.brand },
      { label: 'Series', value: p.series },
      { label: 'Model', value: p.model },
      { label: 'Memory Size', value: p.memorySize },
      { label: 'Boost Clock', value: p.boostClock },
      { label: 'Power Requirement', value: p.power },
    ],
    related: gpuProducts
      .filter((item) => item.id !== p.id)
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        categorySlug: 'gpu',
        name: item.name,
        price: item.price,
        shortDetail: `${item.memorySize} · ${item.boostClock}`,
      })),
  };
}

function buildMotherboardDetail(p: MotherboardProduct): ProductDetailData {
  return {
    ...baseFields('motherboard', p),
    tags: [
      categoryTagLabel.motherboard,
      categoryMeta.motherboard.label,
      p.brand,
      p.chipset,
      p.socket,
      p.formFactor,
      p.memoryType,
    ],
    specRows: [
      { label: 'Brand', value: p.brand },
      { label: 'Chipset', value: p.chipset },
      { label: 'CPU Support', value: p.cpuSupport },
      { label: 'Socket Type', value: p.socket },
      { label: 'Mainboard Support', value: p.formFactor },
      { label: 'Memory Slots', value: p.memorySlots },
      { label: 'Memory Type', value: p.memoryType },
      { label: 'Max Memory', value: p.maxMemory },
    ],
    related: motherboardProducts
      .filter((item) => item.id !== p.id)
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        categorySlug: 'motherboard',
        name: item.name,
        price: item.price,
        shortDetail: `${item.chipset} · ${item.socket}`,
      })),
  };
}

function buildRamDetail(p: RamProduct): ProductDetailData {
  return {
    ...baseFields('ram', p),
    tags: [categoryTagLabel.ram, categoryMeta.ram.label, p.brand, p.series, p.capacity, p.speed, p.memoryType],
    specRows: [
      { label: 'Brand', value: p.brand },
      { label: 'Series', value: p.series },
      { label: 'Capacity', value: p.capacity },
      { label: 'Speed', value: p.speed },
      { label: 'Memory Type', value: p.memoryType },
    ],
    related: ramProducts
      .filter((item) => item.id !== p.id)
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        categorySlug: 'ram',
        name: item.name,
        price: item.price,
        shortDetail: `${item.capacity} · ${item.speed}`,
      })),
  };
}

function buildStorageDetail(p: StorageProduct): ProductDetailData {
  return {
    ...baseFields('storage', p),
    tags: [categoryTagLabel.storage, categoryMeta.storage.label, p.brand, p.type, p.capacity, p.readSpeed],
    specRows: [
      { label: 'Brand', value: p.brand },
      { label: 'Type', value: p.type },
      { label: 'Capacity', value: p.capacity },
      { label: 'Read Speed', value: p.readSpeed },
    ],
    related: storageProducts
      .filter((item) => item.id !== p.id)
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        categorySlug: 'storage',
        name: item.name,
        price: item.price,
        shortDetail: `${item.capacity} · ${item.type}`,
      })),
  };
}

function buildPsuDetail(p: PsuProduct): ProductDetailData {
  return {
    ...baseFields('psu', p),
    tags: [categoryTagLabel.psu, categoryMeta.psu.label, p.brand, p.wattage, p.certification, p.modular],
    specRows: [
      { label: 'Brand', value: p.brand },
      { label: 'Continuous Power', value: p.wattage },
      { label: 'Certification', value: p.certification },
      { label: 'Modular', value: p.modular },
    ],
    related: psuProducts
      .filter((item) => item.id !== p.id)
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        categorySlug: 'psu',
        name: item.name,
        price: item.price,
        shortDetail: `${item.wattage} · ${item.certification}`,
      })),
  };
}

function buildCaseDetail(p: CaseProduct): ProductDetailData {
  return {
    ...baseFields('case', p),
    tags: [categoryTagLabel.case, categoryMeta.case.label, p.brand, p.formFactor, p.caseType, p.sidePanel],
    specRows: [
      { label: 'Brand', value: p.brand },
      { label: 'Case Type', value: p.caseType },
      { label: 'Mainboard Support', value: p.formFactor },
      { label: 'Side Panel', value: p.sidePanel },
    ],
    related: caseProducts
      .filter((item) => item.id !== p.id)
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        categorySlug: 'case',
        name: item.name,
        price: item.price,
        shortDetail: `${item.caseType} · ${item.formFactor}`,
      })),
  };
}

function buildCoolingDetail(p: CoolingProduct): ProductDetailData {
  return {
    ...baseFields('cooling', p),
    tags: [categoryTagLabel.cooling, categoryMeta.cooling.label, p.brand, p.type, p.fanSize, p.socket],
    specRows: [
      { label: 'Brand', value: p.brand },
      { label: 'Type', value: p.type },
      { label: 'Fan Size', value: p.fanSize },
      { label: 'Socket Support', value: p.socket },
    ],
    related: coolingProducts
      .filter((item) => item.id !== p.id)
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        categorySlug: 'cooling',
        name: item.name,
        price: item.price,
        shortDetail: `${item.type} · ${item.fanSize}`,
      })),
  };
}

function buildDesktopPcDetail(p: DesktopPcProduct): ProductDetailData {
  return {
    ...baseFields('desktop-pc', p),
    tags: [categoryTagLabel['desktop-pc'], categoryMeta['desktop-pc'].label, p.brand, p.usageType, p.cpuPlatform],
    specRows: [
      { label: 'Brand', value: p.brand },
      { label: 'Usage Type', value: p.usageType },
      { label: 'CPU', value: p.cpu },
      { label: 'GPU', value: p.gpu },
      { label: 'RAM', value: p.ram },
    ],
    related: desktopPcProducts
      .filter((item) => item.id !== p.id)
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        categorySlug: 'desktop-pc',
        name: item.name,
        price: item.price,
        shortDetail: `${item.cpu} · ${item.gpu}`,
      })),
  };
}

function buildPcSetDetail(p: PcSetProduct): ProductDetailData {
  return {
    ...baseFields('pc-sets', p),
    originalPrice: p.originalPrice > p.price ? p.originalPrice : undefined,
    tags: [categoryTagLabel['pc-sets'], categoryMeta['pc-sets'].label, p.brand, p.usageType, p.cpuPlatform],
    specRows: [
      { label: 'Brand', value: p.brand },
      { label: 'Usage Type', value: p.usageType },
      { label: 'CPU', value: p.cpu },
      { label: 'GPU', value: p.gpu },
      { label: 'RAM', value: p.ram },
    ],
    related: pcSetProducts
      .filter((item) => item.id !== p.id)
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        categorySlug: 'pc-sets',
        name: item.name,
        price: item.price,
        shortDetail: `${item.cpu} · ${item.gpu}`,
      })),
  };
}

/** Cart items key off the app-wide CategoryIconKey, which folds "desktop-pc" and
 * "pc-sets" into one generic "desktop" bucket — everything else maps 1:1. */
export function toCartCategoryKey(categorySlug: ProductCategorySlug): CategoryIconKey {
  if (categorySlug === 'desktop-pc' || categorySlug === 'pc-sets') return 'desktop';
  return categorySlug;
}

export function getProductDetail(categorySlug: string, id: string): ProductDetailData | null {
  switch (categorySlug as ProductCategorySlug) {
    case 'cpu': {
      const product = cpuProducts.find((p) => p.id === id);
      return product ? buildCpuDetail(product) : null;
    }
    case 'gpu': {
      const product = gpuProducts.find((p) => p.id === id);
      return product ? buildGpuDetail(product) : null;
    }
    case 'motherboard': {
      const product = motherboardProducts.find((p) => p.id === id);
      return product ? buildMotherboardDetail(product) : null;
    }
    case 'ram': {
      const product = ramProducts.find((p) => p.id === id);
      return product ? buildRamDetail(product) : null;
    }
    case 'storage': {
      const product = storageProducts.find((p) => p.id === id);
      return product ? buildStorageDetail(product) : null;
    }
    case 'psu': {
      const product = psuProducts.find((p) => p.id === id);
      return product ? buildPsuDetail(product) : null;
    }
    case 'case': {
      const product = caseProducts.find((p) => p.id === id);
      return product ? buildCaseDetail(product) : null;
    }
    case 'cooling': {
      const product = coolingProducts.find((p) => p.id === id);
      return product ? buildCoolingDetail(product) : null;
    }
    case 'desktop-pc': {
      const product = desktopPcProducts.find((p) => p.id === id);
      return product ? buildDesktopPcDetail(product) : null;
    }
    case 'pc-sets': {
      const product = pcSetProducts.find((p) => p.id === id);
      return product ? buildPcSetDetail(product) : null;
    }
    default:
      return null;
  }
}
