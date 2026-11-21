import type { IconType } from 'react-icons';
import { BsCpu, BsDeviceSsd, BsGpuCard, BsHdd, BsMemory, BsMotherboard, BsPcDisplay, BsPlug, BsShieldCheck, BsSnow2, BsWindow } from 'react-icons/bs';
import { FiActivity, FiLayout, FiZap } from 'react-icons/fi';
import { PiComputerTower } from 'react-icons/pi';
import type { CategoryIconKey } from '../../types';
import type { CategoryProductMap, ProductCategorySlug } from '../../data/catalog';
import { applyCpuFilters, CPU_PRICE_CEILING, cpuSeriesOptions, cpuSocketOptions, defaultCpuFilters, type CpuFilterState } from '../../data/cpuProducts';
import {
  applyGpuFilters,
  defaultGpuFilters,
  GPU_PRICE_CEILING,
  gpuBrandOptions,
  gpuMemorySizeOptions,
  gpuModelOptions,
  gpuPowerOptions,
  gpuSeriesOptions,
  type GpuFilterState,
} from '../../data/gpuProducts';
import {
  applyMotherboardFilters,
  defaultMotherboardFilters,
  MOTHERBOARD_PRICE_CEILING,
  motherboardBrandOptions,
  motherboardChipsetOptions,
  motherboardCpuSupportOptions,
  motherboardFormFactorOptions,
  motherboardMaxMemoryOptions,
  motherboardMemorySlotOptions,
  motherboardMemoryTypeOptions,
  motherboardSocketOptions,
  type MotherboardFilterState,
} from '../../data/motherboardProducts';
import {
  applyRamFilters,
  defaultRamFilters,
  RAM_PRICE_CEILING,
  ramBrandOptions,
  ramCapacityOptions,
  ramMemoryTypeOptions,
  ramSeriesOptions,
  ramSpeedOptions,
  type RamFilterState,
} from '../../data/ramProducts';
import {
  applyStorageFilters,
  defaultStorageFilters,
  STORAGE_PRICE_CEILING,
  storageBrandOptions,
  storageCapacityOptions,
  storageTypeOptions,
  type StorageFilterState,
} from '../../data/storageProducts';
import { applyPsuFilters, defaultPsuFilters, PSU_PRICE_CEILING, psuBrandOptions, psuWattageOptions, type PsuFilterState } from '../../data/psuProducts';
import { applyCaseFilters, CASE_PRICE_CEILING, caseBrandOptions, caseFormFactorOptions, defaultCaseFilters, type CaseFilterState } from '../../data/caseProducts';
import { applyCoolingFilters, COOLING_PRICE_CEILING, coolingBrandOptions, defaultCoolingFilters, type CoolingFilterState } from '../../data/coolingProducts';
import {
  applyDesktopPcFilters,
  DESKTOP_PC_PRICE_CEILING,
  defaultDesktopPcFilters,
  desktopPcBrandOptions,
  desktopPcCpuPlatformOptions,
  desktopPcUsageTypeOptions,
  type DesktopPcFilterState,
} from '../../data/desktopPcProducts';
import {
  applyPcSetFilters,
  defaultPcSetFilters,
  PC_SET_PRICE_CEILING,
  pcSetBrandOptions,
  pcSetCpuPlatformOptions,
  pcSetUsageTypeOptions,
  type PcSetFilterState,
} from '../../data/pcSetProducts';

/** Filter state shape per category slug (each category's own `XxxFilterState`). */
export interface CategoryFilterMap {
  cpu: CpuFilterState;
  gpu: GpuFilterState;
  motherboard: MotherboardFilterState;
  ram: RamFilterState;
  storage: StorageFilterState;
  psu: PsuFilterState;
  case: CaseFilterState;
  cooling: CoolingFilterState;
  'desktop-pc': DesktopPcFilterState;
  'pc-sets': PcSetFilterState;
}

/** Keys of F whose value is a list of checkbox values (brands, sockets, ...). */
export type ListFilterKey<F> = { [P in keyof F]: F[P] extends readonly string[] ? P : never }[keyof F];

export type FilterOption = string | { value: string; label: string };

/** One collapsible checkbox group in the filter sidebar. */
export interface FilterSectionConfig<F> {
  field: ListFilterKey<F>;
  title: string;
  options: readonly FilterOption[];
  defaultOpen?: boolean;
}

export interface SpecChipConfig {
  icon: IconType;
  label: string;
}

/**
 * Everything that differs between category pages. The shared components
 * (CategoryHeroBanner, CategoryFilterSidebar, CategoryProductCard, CategoryProductListRow)
 * render from this, so adding a category = one entry here + data file + route.
 */
export interface CategoryConfig<K extends ProductCategorySlug> {
  /** Heading shown in the sidebar, e.g. "ซีพียู". */
  title: string;
  sectionId: string;
  /** Placeholder when a product has no photo, and the large glyph in the hero banner. */
  icon: IconType;
  /** Category key stored on cart items. */
  cartCategory: CategoryIconKey;
  hero: { tag: string; title: string; subtitle: string; description: string };
  /** Grid card: main spec line + small meta line. */
  cardSpec: (product: CategoryProductMap[K]) => string;
  cardMeta: (product: CategoryProductMap[K]) => string;
  /** List row: meta line under the name + spec chips. */
  rowMeta: (product: CategoryProductMap[K]) => string;
  rowChips: (product: CategoryProductMap[K]) => SpecChipConfig[];
  /** When set, the price shows the struck-through original price too (PriceTag). */
  originalPrice?: (product: CategoryProductMap[K]) => number | undefined;
  filters: {
    defaults: CategoryFilterMap[K];
    apply: (products: CategoryProductMap[K][], filters: CategoryFilterMap[K]) => CategoryProductMap[K][];
    priceCeiling: number;
    sections: FilterSectionConfig<CategoryFilterMap[K]>[];
  };
}

export const categoryConfigs: { [K in ProductCategorySlug]: CategoryConfig<K> } = {
  cpu: {
    title: 'ซีพียู',
    sectionId: 'cpu-products',
    icon: BsCpu,
    cartCategory: 'cpu',
    hero: {
      tag: 'CPU',
      title: 'CPU',
      subtitle: 'The Brain of Your PC',
      description:
        'พลังประมวลผลที่มากกว่า เพื่อทุกการใช้งาน เล่นเกม ทำงาน สตรีมมิ่ง ไม่มีสะดุด เลือกซีพียู Intel และ AMD ของแท้ ประกันศูนย์ไทย',
    },
    cardSpec: (p) => `${p.cores}C/${p.threads}T | ${p.clock}`,
    cardMeta: (p) => `${p.socket} · ${p.brand}`,
    rowMeta: (p) => `${p.brand} | ${p.series}`,
    rowChips: (p) => [
      { icon: BsCpu, label: `${p.cores}C/${p.threads}T` },
      { icon: FiZap, label: p.clock },
      { icon: BsMotherboard, label: p.socket },
    ],
    filters: {
      defaults: defaultCpuFilters,
      apply: applyCpuFilters,
      priceCeiling: CPU_PRICE_CEILING,
      sections: [
        {
          field: 'brands',
          title: 'Brand',
          defaultOpen: true,
          options: [
            { value: 'AMD', label: 'AMD' },
            { value: 'Intel', label: 'INTEL' },
          ],
        },
        { field: 'series', title: 'Processor Number', options: cpuSeriesOptions },
        { field: 'sockets', title: 'Socket Type', options: cpuSocketOptions },
      ],
    },
  },
  gpu: {
    title: 'การ์ดจอ',
    sectionId: 'gpu-products',
    icon: BsGpuCard,
    cartCategory: 'gpu',
    hero: {
      tag: 'GPU',
      title: 'การ์ดจอ',
      subtitle: 'Power Every Frame',
      description:
        'ภาพลื่นไหล คมชัด เฟรมเรตสูง เพื่อทุกการเล่นเกมและงานกราฟิก เลือกการ์ดจอ NVIDIA และ AMD ของแท้ ประกันศูนย์ไทย',
    },
    cardSpec: (p) => `${p.memorySize} | ${p.boostClock}`,
    cardMeta: (p) => `${p.model} · ${p.brand}`,
    rowMeta: (p) => `${p.brand} | ${p.model}`,
    rowChips: (p) => [
      { icon: BsMemory, label: p.memorySize },
      { icon: FiActivity, label: p.boostClock },
      { icon: FiZap, label: p.power },
    ],
    filters: {
      defaults: defaultGpuFilters,
      apply: applyGpuFilters,
      priceCeiling: GPU_PRICE_CEILING,
      sections: [
        { field: 'brands', title: 'Brand', defaultOpen: true, options: gpuBrandOptions },
        { field: 'series', title: 'GPU Series', options: gpuSeriesOptions },
        { field: 'models', title: 'GPU Model', options: gpuModelOptions },
        { field: 'memorySizes', title: 'Memory Size', options: gpuMemorySizeOptions },
        { field: 'powers', title: 'Power Requirement', options: gpuPowerOptions },
      ],
    },
  },
  motherboard: {
    title: 'เมนบอร์ด',
    sectionId: 'motherboard-products',
    icon: BsMotherboard,
    cartCategory: 'motherboard',
    hero: {
      tag: 'MOTHERBOARD',
      title: 'เมนบอร์ด',
      subtitle: 'The Foundation of Your Build',
      description:
        'รองรับซีพียูและอุปกรณ์รุ่นใหม่ล่าสุด เสถียร ทนทาน ขยายได้เต็มศักยภาพ เลือกเมนบอร์ดของแท้ ประกันศูนย์ไทย',
    },
    cardSpec: (p) => `${p.chipset} | ${p.memoryType}`,
    cardMeta: (p) => `${p.socket} · ${p.brand}`,
    rowMeta: (p) => `${p.brand} | ${p.socket}`,
    rowChips: (p) => [
      { icon: BsMotherboard, label: p.chipset },
      { icon: BsMemory, label: p.memoryType },
      { icon: FiLayout, label: p.formFactor },
    ],
    filters: {
      defaults: defaultMotherboardFilters,
      apply: applyMotherboardFilters,
      priceCeiling: MOTHERBOARD_PRICE_CEILING,
      sections: [
        { field: 'brands', title: 'Brand', defaultOpen: true, options: motherboardBrandOptions },
        { field: 'cpuSupports', title: 'CPU Support', options: motherboardCpuSupportOptions },
        { field: 'sockets', title: 'CPU Socket', options: motherboardSocketOptions },
        { field: 'chipsets', title: 'Chipset', options: motherboardChipsetOptions },
        { field: 'formFactors', title: 'Mainboard Support', options: motherboardFormFactorOptions },
        { field: 'memorySlots', title: 'Memory Slots', options: motherboardMemorySlotOptions },
        { field: 'memoryTypes', title: 'Memory Type', options: motherboardMemoryTypeOptions },
        { field: 'maxMemories', title: 'Max Memory', options: motherboardMaxMemoryOptions },
      ],
    },
  },
  ram: {
    title: 'แรม',
    sectionId: 'ram-products',
    icon: BsMemory,
    cartCategory: 'ram',
    hero: {
      tag: 'RAM',
      title: 'แรม',
      subtitle: 'Speed Up Every Task',
      description: 'เพิ่มความเร็วในการประมวลผล รองรับมัลติทาสก์ได้ลื่นไหล เลือกแรม DDR4 และ DDR5 ของแท้ ประกันศูนย์ไทย',
    },
    cardSpec: (p) => `${p.capacity} ${p.memoryType} | ${p.speed}`,
    cardMeta: (p) => p.brand,
    rowMeta: (p) => p.brand,
    rowChips: (p) => [
      { icon: BsMemory, label: p.capacity },
      { icon: FiActivity, label: p.memoryType },
      { icon: FiZap, label: p.speed },
    ],
    filters: {
      defaults: defaultRamFilters,
      apply: applyRamFilters,
      priceCeiling: RAM_PRICE_CEILING,
      sections: [
        { field: 'brands', title: 'Brand', defaultOpen: true, options: ramBrandOptions },
        { field: 'series', title: 'Memory Series', options: ramSeriesOptions },
        { field: 'capacities', title: 'Memory Capacity', options: ramCapacityOptions },
        { field: 'speeds', title: 'Speed', options: ramSpeedOptions },
        { field: 'memoryTypes', title: 'Memory Type', options: ramMemoryTypeOptions },
      ],
    },
  },
  storage: {
    title: 'ฮาร์ดดิสก์ และ เอสเอสดี',
    sectionId: 'storage-products',
    icon: BsDeviceSsd,
    cartCategory: 'storage',
    hero: {
      tag: 'STORAGE',
      title: 'ฮาร์ดดิสก์ และ เอสเอสดี',
      subtitle: 'Store More, Load Faster',
      description: 'บันทึกข้อมูลได้มากขึ้น เปิดไฟล์และเกมได้เร็วขึ้น เลือก SSD และ HDD ของแท้ ประกันศูนย์ไทย',
    },
    cardSpec: (p) => `${p.capacity} | ${p.readSpeed}`,
    cardMeta: (p) => `${p.type} · ${p.brand}`,
    rowMeta: (p) => `${p.brand} | ${p.type}`,
    rowChips: (p) => [
      { icon: BsHdd, label: p.capacity },
      { icon: FiZap, label: p.readSpeed },
      { icon: BsDeviceSsd, label: p.type },
    ],
    filters: {
      defaults: defaultStorageFilters,
      apply: applyStorageFilters,
      priceCeiling: STORAGE_PRICE_CEILING,
      sections: [
        { field: 'brands', title: 'Brand', defaultOpen: true, options: storageBrandOptions },
        { field: 'capacities', title: 'Capacity', options: storageCapacityOptions },
        { field: 'types', title: 'Type', options: storageTypeOptions },
      ],
    },
  },
  psu: {
    title: 'พาวเวอร์ซัพพลาย',
    sectionId: 'psu-products',
    icon: BsPlug,
    cartCategory: 'psu',
    hero: {
      tag: 'PSU',
      title: 'พาวเวอร์ซัพพลาย',
      subtitle: 'Reliable Power, Every Time',
      description: 'จ่ายไฟเสถียร ปลอดภัย รองรับการ์ดจอและซีพียูรุ่นใหม่ เลือกพาวเวอร์ซัพพลายของแท้ ประกันศูนย์ไทย',
    },
    cardSpec: (p) => `${p.wattage} | ${p.modular}`,
    cardMeta: (p) => `${p.certification} · ${p.brand}`,
    rowMeta: (p) => p.brand,
    rowChips: (p) => [
      { icon: BsPlug, label: p.wattage },
      { icon: BsShieldCheck, label: p.certification },
      { icon: FiLayout, label: p.modular },
    ],
    filters: {
      defaults: defaultPsuFilters,
      apply: applyPsuFilters,
      priceCeiling: PSU_PRICE_CEILING,
      sections: [
        { field: 'brands', title: 'Brand', defaultOpen: true, options: psuBrandOptions },
        { field: 'wattages', title: 'Continuous Power W', options: psuWattageOptions },
      ],
    },
  },
  case: {
    title: 'เคส',
    sectionId: 'case-products',
    icon: PiComputerTower,
    cartCategory: 'case',
    hero: {
      tag: 'CASE',
      title: 'เคส',
      subtitle: 'Build the Perfect Home',
      description: 'ระบายอากาศดี พื้นที่ติดตั้งครบ ดีไซน์สวยงาม เลือกเคสของแท้ ประกันศูนย์ไทย',
    },
    cardSpec: (p) => `${p.caseType} | ${p.sidePanel}`,
    cardMeta: (p) => `${p.formFactor} · ${p.brand}`,
    rowMeta: (p) => `${p.brand} | ${p.formFactor}`,
    rowChips: (p) => [
      { icon: PiComputerTower, label: p.caseType },
      { icon: FiLayout, label: p.formFactor },
      { icon: BsWindow, label: p.sidePanel },
    ],
    filters: {
      defaults: defaultCaseFilters,
      apply: applyCaseFilters,
      priceCeiling: CASE_PRICE_CEILING,
      sections: [
        { field: 'brands', title: 'Brand', defaultOpen: true, options: caseBrandOptions },
        { field: 'formFactors', title: 'Mainboard Support', options: caseFormFactorOptions },
      ],
    },
  },
  cooling: {
    title: 'ชุดระบายความร้อน',
    sectionId: 'cooling-products',
    icon: BsSnow2,
    cartCategory: 'cooling',
    hero: {
      tag: 'COOLING',
      title: 'ชุดระบายความร้อน',
      subtitle: 'Stay Cool Under Pressure',
      description:
        'ระบายความร้อนได้เย็นฉ่ำ เงียบ เสถียร รองรับการโอเวอร์คล็อกเต็มที่ เลือกฮีตซิงก์และ AIO ของแท้ ประกันศูนย์ไทย',
    },
    cardSpec: (p) => `${p.type} | ${p.fanSize}`,
    cardMeta: (p) => `${p.socket} · ${p.brand}`,
    rowMeta: (p) => `${p.brand} | ${p.type}`,
    rowChips: (p) => [
      { icon: BsSnow2, label: p.fanSize },
      { icon: BsMotherboard, label: p.socket },
    ],
    filters: {
      defaults: defaultCoolingFilters,
      apply: applyCoolingFilters,
      priceCeiling: COOLING_PRICE_CEILING,
      sections: [{ field: 'brands', title: 'Brands', defaultOpen: true, options: coolingBrandOptions }],
    },
  },
  'desktop-pc': {
    title: 'คอมพิวเตอร์ตั้งโต๊ะ',
    sectionId: 'desktop-pc-products',
    icon: PiComputerTower,
    cartCategory: 'desktop',
    hero: {
      tag: 'DESKTOP PC',
      title: 'คอมพิวเตอร์ตั้งโต๊ะ',
      subtitle: 'Ready to Play, Ready to Work',
      description:
        'คอมพิวเตอร์ตั้งโต๊ะประกอบพร้อมใช้งาน เลือกสเปคที่เหมาะกับคุณ ทั้งเล่นเกม ทำงาน และสร้างสรรค์ผลงาน ของแท้ ประกันศูนย์ไทย',
    },
    cardSpec: (p) => `${p.cpu} | ${p.gpu}`,
    cardMeta: (p) => `${p.ram} · ${p.brand}`,
    rowMeta: (p) => `${p.brand} | ${p.usageType}`,
    rowChips: (p) => [
      { icon: BsCpu, label: p.cpu },
      { icon: BsGpuCard, label: p.gpu },
      { icon: BsMemory, label: p.ram },
    ],
    filters: {
      defaults: defaultDesktopPcFilters,
      apply: applyDesktopPcFilters,
      priceCeiling: DESKTOP_PC_PRICE_CEILING,
      sections: [
        { field: 'brands', title: 'Brand', defaultOpen: true, options: desktopPcBrandOptions },
        { field: 'usageTypes', title: 'Usage Type', options: desktopPcUsageTypeOptions },
        { field: 'cpuPlatforms', title: 'CPU Platform', options: desktopPcCpuPlatformOptions },
      ],
    },
  },
  'pc-sets': {
    title: 'คอมพิวเตอร์เซตโปรโมชั่น',
    sectionId: 'pc-set-products',
    icon: BsPcDisplay,
    cartCategory: 'desktop',
    hero: {
      tag: 'PROMOTION',
      title: 'คอมพิวเตอร์เซตโปรโมชั่น',
      subtitle: 'Great Specs, Better Price',
      description:
        'คอมพิวเตอร์เซตจัดโปรราคาพิเศษ สเปคครบ พร้อมใช้งานทันที คุ้มค่าที่สุดในราคานี้ ของแท้ ประกันศูนย์ไทย',
    },
    cardSpec: (p) => `${p.cpu} | ${p.gpu}`,
    cardMeta: (p) => `${p.ram} · ${p.brand}`,
    rowMeta: (p) => `${p.brand} | ${p.usageType}`,
    rowChips: (p) => [
      { icon: BsCpu, label: p.cpu },
      { icon: BsGpuCard, label: p.gpu },
      { icon: BsMemory, label: p.ram },
    ],
    originalPrice: (p) => p.originalPrice,
    filters: {
      defaults: defaultPcSetFilters,
      apply: applyPcSetFilters,
      priceCeiling: PC_SET_PRICE_CEILING,
      sections: [
        { field: 'brands', title: 'Brand', defaultOpen: true, options: pcSetBrandOptions },
        { field: 'usageTypes', title: 'Usage Type', options: pcSetUsageTypeOptions },
        { field: 'cpuPlatforms', title: 'CPU Platform', options: pcSetCpuPlatformOptions },
      ],
    },
  },
};
