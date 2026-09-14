import type { IconType } from 'react-icons';
import { BsCpu, BsDisplay, BsGpuCard, BsHdd, BsMemory, BsMotherboard, BsPcDisplay, BsPlug, BsSnow2, BsTools } from 'react-icons/bs';
import { PiComputerTower } from 'react-icons/pi';

export interface CategoryMenuItem {
  id: string;
  label: string;
  href: string;
  icon: IconType;
  /** Per-row icon size override — defaults to 18 when omitted. */
  iconSize?: number;
  hasSubmenu: boolean;
  /** Real route, when this category has an actual listing page built. */
  to?: string;
  /** TODO(build-page): no destination yet — clicking does nothing until it's built. */
  disabled?: boolean;
}

// A curated, hand-ordered menu for the "หมวดหมู่สินค้า" dropdown — distinct
// from the general category catalog, so it can carry entries like "จัดสเปคคอม"
// that aren't product categories. All rows share one icon color (set in CategoryMenuDropdown).
// Shared between the full CategoryNav trigger and the compact sticky-header trigger.
export const categoryMenuItems: CategoryMenuItem[] = [
  { id: 'build', label: 'จัดสเปคคอม', href: '#build', icon: BsTools, hasSubmenu: false, to: '/build' },
  { id: 'pc-sets', label: 'คอมพิวเตอร์เซตโปรโมชั่น', href: '#category-pc-sets', icon: BsPcDisplay, hasSubmenu: true, to: '/category/pc-sets' },
  { id: 'desktop-pc', label: 'คอมพิวเตอร์ตั้งโต๊ะ', href: '#category-desktop-pc', icon: BsDisplay, hasSubmenu: true, to: '/category/desktop-pc' },
  { id: 'cpu', label: 'ซีพียู', href: '#category-cpu', icon: BsCpu, hasSubmenu: true, to: '/category/cpu' },
  { id: 'gpu', label: 'การ์ดจอ', href: '#category-gpu', icon: BsGpuCard, hasSubmenu: true, to: '/category/gpu' },
  { id: 'motherboard', label: 'เมนบอร์ด', href: '#category-motherboard', icon: BsMotherboard, hasSubmenu: true, to: '/category/motherboard' },
  { id: 'ram', label: 'แรม', href: '#category-ram', icon: BsMemory, hasSubmenu: true, to: '/category/ram' },
  { id: 'storage', label: 'ฮาร์ดดิสก์ และ เอสเอสดี', href: '#category-storage', icon: BsHdd, hasSubmenu: true, to: '/category/storage' },
  { id: 'psu', label: 'พาวเวอร์ซัพพลาย', href: '#category-psu', icon: BsPlug, hasSubmenu: true, to: '/category/psu' },
  { id: 'case', label: 'เคส', href: '#category-case', icon: PiComputerTower, hasSubmenu: true, to: '/category/case' },
  { id: 'cooling', label: 'ชุดระบายความร้อน', href: '#category-cooling', icon: BsSnow2, hasSubmenu: true, to: '/category/cooling' },
];
