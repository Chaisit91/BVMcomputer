import { FiChevronRight, FiGrid } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { Container } from '../ui/Container';
import { CategoryMenuDropdown } from './CategoryMenuDropdown';

interface TopNavLink {
  id: string;
  label: string;
  to: string;
  /** Only active on this exact path (home), not on everything under it. */
  end?: boolean;
}

const navLinks: TopNavLink[] = [
  { id: 'home', label: 'หน้าแรก', to: '/', end: true },
  { id: 'articles', label: 'บทความ', to: '/articles' },
  { id: 'services', label: 'บริการของเรา', to: '/services' },
  // Same page as the account sidebar's "คำสั่งซื้อ" (asks to sign in first when signed out).
  { id: 'track-order', label: 'ติดตามคำสั่งซื้อ', to: '/account/orders' },
  { id: 'help', label: 'ช่วยเหลือ', to: '/help' },
];

/**
 * Row under the header: category menu + the site's main pages. The current page is red with an
 * underline. On phones the links sit on their own row and scroll sideways if they don't fit.
 */
export function CategoryNav() {
  return (
    <div className="border-b border-slate-100 bg-white">
      <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2 md:h-12 md:flex-nowrap md:py-0">
        <CategoryMenuDropdown
          trigger={
            <button className="flex items-center gap-2 rounded-lg bg-[#f6f9fc] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              <FiGrid size={20} className="text-ink" aria-hidden="true" />
              หมวดหมู่สินค้า
              <FiChevronRight size={14} className="text-slate-400" aria-hidden="true" />
            </button>
          }
        />

        <nav
          aria-label="เมนูหลัก"
          className="no-scrollbar -mx-4 flex w-[calc(100%+2rem)] items-center gap-5 overflow-x-auto px-4 text-sm font-medium text-ink sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-6 md:mx-0 md:w-auto md:gap-6 md:overflow-visible md:px-0"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.id}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'relative flex h-9 shrink-0 items-center whitespace-nowrap transition-colors hover:text-brand',
                  'after:absolute after:inset-x-0 after:bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand after:transition-transform',
                  isActive ? 'font-semibold text-brand after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </Container>
    </div>
  );
}
