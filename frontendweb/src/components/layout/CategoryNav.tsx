import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { IconType } from 'react-icons';
import {
  BsCpu,
  BsDisplay,
  BsGpuCard,
  BsHdd,
  BsMemory,
  BsMotherboard,
  BsPcDisplay,
  BsPlug,
  BsSnow2,
  BsTools,
} from 'react-icons/bs';
import { FiChevronRight, FiGrid } from 'react-icons/fi';
import { PiComputerTower } from 'react-icons/pi';
import { Container } from '../ui/Container';

interface NavLink {
  id: string;
  label: string;
  href: string;
  /** TODO(build-page): no destination yet — clicking does nothing until it's built. */
  disabled?: boolean;
}

const navLinks: NavLink[] = [
  { id: 'home', label: 'หน้าแรก', href: '#top' },
  { id: 'build', label: 'จัดสเปกคอม', href: '#build', disabled: true },
  { id: 'articles', label: 'บทความ', href: '#articles' },
  { id: 'track-order', label: 'ติดตามคำสั่งซื้อ', href: '#track-order' },
  { id: 'help', label: 'ช่วยเหลือ', href: '#help' },
];

interface CategoryMenuItem {
  id: string;
  label: string;
  href: string;
  icon: IconType;
  /** Per-row icon size override — defaults to 18 when omitted. */
  iconSize?: number;
  hasSubmenu: boolean;
  /** TODO(build-page): no destination yet — clicking does nothing until it's built. */
  disabled?: boolean;
}

// A curated, hand-ordered menu for the "หมวดหมู่สินค้า" dropdown — distinct
// from the general category catalog, so it can carry entries like "จัดสเปคคอม"
// that aren't product categories. All rows share one icon color (set below).
const categoryMenuItems: CategoryMenuItem[] = [
  { id: 'build', label: 'จัดสเปคคอม', href: '#build', icon: BsTools, hasSubmenu: false, disabled: true },
  { id: 'pc-sets', label: 'คอมพิวเตอร์เซตโปรโมชั่น', href: '#category-pc-sets', icon: BsPcDisplay, hasSubmenu: true },
  { id: 'desktop-pc', label: 'คอมพิวเตอร์ตั้งโต๊ะ', href: '#category-desktop-pc', icon: BsDisplay, hasSubmenu: true },
  { id: 'cpu', label: 'ซีพียู', href: '#category-cpu', icon: BsCpu, hasSubmenu: true },
  { id: 'gpu', label: 'การ์ดจอ', href: '#category-gpu', icon: BsGpuCard, hasSubmenu: true },
  { id: 'motherboard', label: 'เมนบอร์ด', href: '#category-motherboard', icon: BsMotherboard, hasSubmenu: true },
  { id: 'ram', label: 'แรม', href: '#category-ram', icon: BsMemory, hasSubmenu: true },
  { id: 'storage', label: 'ฮาร์ดดิสก์ และ เอสเอสดี', href: '#category-storage', icon: BsHdd, hasSubmenu: true },
  { id: 'psu', label: 'พาวเวอร์ซัพพลาย', href: '#category-psu', icon: BsPlug, hasSubmenu: true },
  { id: 'case', label: 'เคส', href: '#category-case', icon: PiComputerTower, hasSubmenu: true },
  { id: 'cooling', label: 'ชุดระบายความร้อน', href: '#category-cooling', icon: BsSnow2, hasSubmenu: true },
];

export function CategoryNav() {
  return (
    <div className="border-b border-slate-100 bg-white">
      <Container className="flex h-12 items-center justify-between gap-6">
        <DropdownMenu.Root modal={false}>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 rounded-lg bg-[#f6f9fc] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              <FiGrid size={20} className="text-ink" aria-hidden="true" />
              หมวดหมู่สินค้า
              <FiChevronRight size={14} className="text-slate-400" aria-hidden="true" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="start"
              sideOffset={8}
              className="z-50 flex max-h-[420px] w-80 flex-col overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-card"
            >
              {categoryMenuItems.map((item) => (
                <DropdownMenu.Item key={item.id} asChild>
                  <a
                    href={item.href}
                    onClick={item.disabled ? (e) => e.preventDefault() : undefined}
                    className="flex cursor-pointer select-none items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm text-ink outline-none hover:bg-slate-50 focus:bg-slate-50"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <item.icon size={item.iconSize ?? 18} className="shrink-0 text-[#2B3445]" aria-hidden="true" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.hasSubmenu && (
                      <FiChevronRight size={14} className="shrink-0 text-slate-300" aria-hidden="true" />
                    )}
                  </a>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <nav className="hidden items-center gap-6 text-sm font-medium text-ink md:flex">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={link.disabled ? (e) => e.preventDefault() : undefined}
              className="whitespace-nowrap hover:text-brand active:text-brand"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </Container>
    </div>
  );
}
