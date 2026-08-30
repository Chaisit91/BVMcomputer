import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { FiChevronRight, FiGrid } from 'react-icons/fi';
import { Container } from '../ui/Container';
import { categoryIcons } from '../home/categoryIcons';
import { useAppSelector } from '../../app/hooks';

interface NavLink {
  id: string;
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { id: 'home', label: 'หน้าแรก', href: '#top' },
  { id: 'build', label: 'จัดสเปกคอม', href: '#build' },
  { id: 'deals', label: 'ดีลพิเศษ', href: '#promo-build-week' },
  { id: 'track-order', label: 'ติดตามคำสั่งซื้อ', href: '#track-order' },
  { id: 'help', label: 'ช่วยเหลือ', href: '#help' },
];

export function CategoryNav() {
  const categories = useAppSelector((state) => state.home.categories);

  return (
    <div className="border-b border-slate-100 bg-white">
      <Container className="flex h-12 items-center justify-between gap-6">
        <DropdownMenu.Root>
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
              className="z-50 grid w-72 grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-card"
            >
              {categories.map((category) => {
                const Icon = categoryIcons[category.icon];
                return (
                  <DropdownMenu.Item key={category.id} asChild>
                    <a
                      href={`#category-${category.slug}`}
                      className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink outline-none hover:bg-slate-100 focus:bg-slate-100"
                    >
                      <Icon size={15} className="shrink-0 text-slate-400" aria-hidden="true" />
                      <span className="truncate">{category.name}</span>
                    </a>
                  </DropdownMenu.Item>
                );
              })}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <nav className="hidden items-center gap-6 text-sm font-medium text-ink md:flex">
          {navLinks.map((link) => (
            <a key={link.id} href={link.href} className="whitespace-nowrap hover:text-brand active:text-brand">
              {link.label}
            </a>
          ))}
        </nav>
      </Container>
    </div>
  );
}
