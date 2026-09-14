import { FiChevronRight, FiGrid } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';
import { CategoryMenuDropdown } from './CategoryMenuDropdown';

interface NavLink {
  id: string;
  label: string;
  href: string;
  /** Real route, when this link goes to an actual page instead of an in-page anchor. */
  to?: string;
  /** TODO(build-page): no destination yet — clicking does nothing until it's built. */
  disabled?: boolean;
}

const navLinks: NavLink[] = [
  { id: 'home', label: 'หน้าแรก', href: '#top', to: '/' },
  { id: 'build', label: 'จัดสเปกคอม', href: '#build', to: '/build' },
  { id: 'articles', label: 'บทความ', href: '#articles' },
  { id: 'track-order', label: 'ติดตามคำสั่งซื้อ', href: '#track-order' },
  { id: 'help', label: 'ช่วยเหลือ', href: '#help' },
];

export function CategoryNav() {
  return (
    <div className="border-b border-slate-100 bg-white">
      <Container className="flex h-12 items-center justify-between gap-6">
        <CategoryMenuDropdown
          trigger={
            <button className="flex items-center gap-2 rounded-lg bg-[#f6f9fc] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              <FiGrid size={20} className="text-ink" aria-hidden="true" />
              หมวดหมู่สินค้า
              <FiChevronRight size={14} className="text-slate-400" aria-hidden="true" />
            </button>
          }
        />

        <nav className="hidden items-center gap-6 text-sm font-medium text-ink md:flex">
          {navLinks.map((link) =>
            link.to ? (
              <Link key={link.id} to={link.to} className="whitespace-nowrap hover:text-brand active:text-brand">
                {link.label}
              </Link>
            ) : (
              <a
                key={link.id}
                href={link.href}
                onClick={link.disabled ? (e) => e.preventDefault() : undefined}
                className="whitespace-nowrap hover:text-brand active:text-brand"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>
      </Container>
    </div>
  );
}
