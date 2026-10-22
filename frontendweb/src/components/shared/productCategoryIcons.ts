import type { IconType } from 'react-icons';
import { BsCpu, BsDeviceSsd, BsGpuCard, BsMemory, BsMotherboard, BsPcDisplay, BsPlug, BsSnow2 } from 'react-icons/bs';
import { PiComputerTower } from 'react-icons/pi';
import type { ProductCategorySlug } from '../../data/catalog';

/** Placeholder icon per category, shown wherever a product has no photo yet. */
export const productCategoryIcons: Record<ProductCategorySlug, IconType> = {
  cpu: BsCpu,
  gpu: BsGpuCard,
  motherboard: BsMotherboard,
  ram: BsMemory,
  storage: BsDeviceSsd,
  psu: BsPlug,
  case: PiComputerTower,
  cooling: BsSnow2,
  'desktop-pc': PiComputerTower,
  'pc-sets': BsPcDisplay,
};
