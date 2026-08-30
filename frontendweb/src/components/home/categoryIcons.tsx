import {
  BsBoxSeam,
  BsCpu,
  BsDisplay,
  BsGpuCard,
  BsHdd,
  BsHeadphones,
  BsKeyboard,
  BsMemory,
  BsMotherboard,
  BsMouse2,
  BsPcDisplay,
  BsPlug,
} from 'react-icons/bs';
import type { IconType } from 'react-icons';
import type { CategoryIconKey } from '../../types';

export const categoryIcons: Record<CategoryIconKey, IconType> = {
  cpu: BsCpu,
  motherboard: BsMotherboard,
  gpu: BsGpuCard,
  ram: BsMemory,
  storage: BsHdd,
  psu: BsPlug,
  case: BsPcDisplay,
  keyboard: BsKeyboard,
  mouse: BsMouse2,
  headset: BsHeadphones,
  monitor: BsDisplay,
  accessory: BsBoxSeam,
};
